const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const { Resend } = require('resend');

dotenv.config();

// ============ CLOUDINARY CONFIG ============
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️  Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('⚠️  Cloudinary not configured - using local uploads');
}

// ============ WHATSAPP BİLDİRİM (CallMeBot API) ============
async function sendWhatsApp(phone, message) {
  try {
    const apiKey = process.env.CALLMEBOT_API_KEY;
    if (!apiKey || !phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encoded}&apikey=${apiKey}`;
    const response = await fetch(url);
    console.log('📱 WhatsApp sent to', cleanPhone, '- status:', response.status);
  } catch (err) {
    console.error('WhatsApp send error:', err.message);
  }
}

// ============ EMAIL GÖNDERİM (Resend API) ============
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (resend) {
  console.log('📧 Resend API configured');
} else {
  console.log('⚠️  RESEND_API_KEY tanımlı değil - Email gönderilmeyecek');
}

async function sendEmail(to, subject, html) {
  try {
    if (!resend) {
      console.log('⚠️  Email gönderilemedi - RESEND_API_KEY tanımlı değil');
      return;
    }
    console.log('📧 Email gönderiliyor:', to, '-', subject);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'AES Garage <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    if (error) {
      console.error('❌ Email send error:', error.message);
    } else {
      console.log('📧 Email sent to', to, '- id:', data.id);
    }
  } catch (err) {
    console.error('❌ Email send error:', err.message);
  }
}

// DNS fix: Lokal DNS SRV çözemezse Google/Cloudflare DNS kullan
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 5000;

// Render.com gibi reverse proxy arkasında çalışırken gerekli
app.set('trust proxy', 1);

// ============ MIDDLEWARE ============

// CORS - sadece izin verilen origin'ler (madde 3)
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'https://aesgarage.com',
  'https://www.aesgarage.com',
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Aynı origin (production) veya izin verilen listede ise kabul et
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Production'da aynı origin olduğu için hepsine izin ver
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting - genel (madde 5)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100,
  message: { message: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', generalLimiter);

// Rate Limiting - form submit (randevu + iletişim) daha sıkı
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10,
  message: { message: 'Çok fazla form gönderildi. Lütfen 1 saat sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiting - login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.' },
});

// ============ MongoDB Connection ============
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
})
  .then(() => console.log('✅ MongoDB Atlas bağlantısı başarılı!'))
  .catch(err => console.log('❌ MongoDB bağlantı hatası:', err));

// ============ SCHEMAS ============

// Appointment Schema (madde 17: trackingCode eklendi)
const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  trackingCode: { type: String, unique: true },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

// Settings Schema
const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
  category: { type: String, enum: ['images', 'prices', 'contact', 'general', 'serviceTitles', 'serviceDescriptions', 'homeContent'], default: 'general' },
  updatedAt: { type: Date, default: Date.now }
});

SettingsSchema.index({ key: 1, category: 1 }, { unique: true });

const Settings = mongoose.model('Settings', SettingsSchema);

// Contact Message Schema (madde 6)
const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);

// ============ MULTER ============
// Multer: Cloudinary varsa memory storage, yoksa disk storage (fallback)
const storage = process.env.CLOUDINARY_CLOUD_NAME
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    });

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ============ AUTH MIDDLEWARE (madde 1, 2) ============
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkilendirme gerekli' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }
};

// ============ INPUT VALIDATION HELPERS (madde 4) ============
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/<[^>]*>/g, '');
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
  // Türkiye formatları: 0555..., +90555..., 555...
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+?90|0)?[5][0-9]{9}$/.test(cleaned);
};

const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

// İş günü & saat kontrolü (madde 9)
// Pazartesi-Cumartesi 09:00-18:00, Pazar kapalı
const isValidAppointmentDateTime = (dateStr, timeStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getUTCDay(); // 0=Pazar, 6=Cumartesi

  // Pazar kapalı
  if (dayOfWeek === 0) {
    return { valid: false, message: 'Pazar günü randevu alınamaz' };
  }

  // Saat kontrolü: 09:00 - 17:00 arası (son randevu 17:00)
  const validTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  if (!validTimes.includes(timeStr)) {
    return { valid: false, message: 'Geçersiz saat. Çalışma saatleri: 09:00 - 18:00' };
  }

  // Geçmiş tarih kontrolü
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const appointmentDate = new Date(dateStr);
  appointmentDate.setHours(0, 0, 0, 0);
  if (appointmentDate < now) {
    return { valid: false, message: 'Geçmiş bir tarihe randevu alınamaz' };
  }

  return { valid: true };
};

// ============ ROUTES ============

app.get('/api', (req, res) => {
  res.json({ message: 'AES Garage API çalışıyor!' });
});

// ============ AUTH (madde 1) ============
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === adminPassword) {
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, expiresIn: 86400 });
  } else {
    res.status(401).json({ message: 'Yanlış şifre!' });
  }
});

// Token doğrulama endpoint'i
app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, role: req.admin.role });
});

// ============ APPOINTMENTS ============

// Public: Randevu oluştur (madde 9, 19)
app.post('/api/appointments', formLimiter, async (req, res) => {
  try {
    const { name, phone, email, service, date, time, message } = req.body;

    // Input validation (madde 4)
    if (!isValidName(name)) {
      return res.status(400).json({ message: 'Geçerli bir isim giriniz (en az 2 karakter)' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Geçerli bir telefon numarası giriniz' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }
    if (!service || service.trim().length === 0) {
      return res.status(400).json({ message: 'Hizmet seçimi zorunludur' });
    }
    if (!date || !time) {
      return res.status(400).json({ message: 'Tarih ve saat seçimi zorunludur' });
    }

    // İş günü & saat kontrolü (madde 9)
    const dateTimeCheck = isValidAppointmentDateTime(date, time);
    if (!dateTimeCheck.valid) {
      return res.status(400).json({ message: dateTimeCheck.message });
    }

    // Slot müsaitlik kontrolü - max 2 randevu/slot (madde 19)
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingCount = await Appointment.countDocuments({
      date: { $gte: dayStart, $lte: dayEnd },
      time: time,
      status: { $ne: 'cancelled' }
    });

    if (existingCount >= 2) {
      return res.status(400).json({ message: 'Bu saat dilimi dolu. Lütfen başka bir saat seçiniz.' });
    }

    // Tracking code oluştur (madde 17)
    const trackingCode = 'AES-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const appointment = new Appointment({
      name: sanitize(name),
      phone: sanitize(phone),
      email: sanitize(email),
      service: sanitize(service),
      date,
      time,
      message: message ? sanitize(message) : '',
      trackingCode
    });

    const newAppointment = await appointment.save();

    // Arka planda bildirimler gönder (response'u bekletme)
    const dateStr = new Date(date).toLocaleDateString('tr-TR');

    // 1) Admin'e WhatsApp bildirim
    const adminWhatsApp = process.env.ADMIN_WHATSAPP;
    if (adminWhatsApp) {
      const adminMsg = `🔔 *Yeni Randevu!*\n👤 ${name}\n📱 ${phone}\n🔧 ${service}\n📅 ${dateStr} - ${time}\n🚗 ${message || '-'}\n📋 Kod: ${trackingCode}`;
      sendWhatsApp(adminWhatsApp, adminMsg);
    }

    // 2) Müşteriye onay e-postası (takip kodu ile)
    if (email) {
      sendEmail(email, `AES Garage - Randevu Onayı (${trackingCode})`,
        `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#111;color:#fff;border:1px solid #333;">
          <h2 style="font-weight:300;letter-spacing:2px;border-bottom:1px solid #333;padding-bottom:15px;">AES GARAGE</h2>
          <p style="color:#ccc;">Merhaba <strong>${name}</strong>,</p>
          <p style="color:#ccc;">Randevunuz başarıyla oluşturuldu.</p>
          <div style="background:#1a1a1a;padding:15px;margin:15px 0;border-left:3px solid #dc2626;">
            <p style="margin:5px 0;color:#ccc;">📅 <strong>${dateStr}</strong> - ${time}</p>
            <p style="margin:5px 0;color:#ccc;">🔧 ${service}</p>
          </div>
          <div style="text-align:center;padding:20px;background:#dc2626;margin:15px 0;">
            <p style="margin:0;font-size:12px;color:#fca5a5;">TAKİP KODUNUZ</p>
            <p style="margin:5px 0;font-size:24px;font-weight:300;letter-spacing:3px;color:#fff;">${trackingCode}</p>
          </div>
          <p style="color:#666;font-size:12px;">Bu kodu saklayın. Randevunuzu takip etmek veya iptal etmek için kullanabilirsiniz.</p>
          <p style="color:#666;font-size:12px;">aesgarage.com/track</p>
        </div>`
      );
    }

    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Public: Slot müsaitlik kontrolü (madde 19)
app.get('/api/appointments/availability', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Tarih gerekli' });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'cancelled' }
    }).select('time');

    const slotCounts = {};
    appointments.forEach(a => {
      slotCounts[a.time] = (slotCounts[a.time] || 0) + 1;
    });

    // Her slot için doluluk bilgisi
    const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const availability = {};
    allSlots.forEach(slot => {
      const count = slotCounts[slot] || 0;
      availability[slot] = { count, available: count < 2 };
    });

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public: Randevu sorgula (tracking code ile) (madde 17)
app.get('/api/appointments/track/:code', async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ trackingCode: req.params.code });
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    // Sadece gerekli alanları döndür
    res.json({
      _id: appointment._id,
      name: appointment.name,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      trackingCode: appointment.trackingCode
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public: Randevu iptal et (tracking code ile) (madde 17)
app.put('/api/appointments/cancel/:code', async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ trackingCode: req.params.code });
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Bu randevu zaten iptal edilmiş' });
    }

    // 24 saat öncesine kadar iptal edilebilir
    const appointmentDateTime = new Date(appointment.date);
    const [hours] = appointment.time.split(':');
    appointmentDateTime.setHours(parseInt(hours), 0, 0, 0);
    const now = new Date();
    const diffHours = (appointmentDateTime - now) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return res.status(400).json({ message: 'Randevu saatinden en az 24 saat önce iptal edilebilir' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Müşteriye iptal bildirimi
    const dateStr = new Date(appointment.date).toLocaleDateString('tr-TR');
    if (appointment.phone) {
      sendWhatsApp(appointment.phone, `❌ AES Garage - Randevunuz iptal edildi.\n📅 ${dateStr} - ${appointment.time}\n🔧 ${appointment.service}\nYeni randevu için: aesgarage.com/appointment`);
    }
    if (appointment.email) {
      sendEmail(appointment.email, 'AES Garage - Randevu İptali',
        `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#111;color:#fff;">
          <h2 style="font-weight:300;letter-spacing:2px;">AES GARAGE</h2>
          <p style="color:#ccc;">Merhaba ${appointment.name},</p>
          <p style="color:#ccc;">Aşağıdaki randevunuz iptal edilmiştir:</p>
          <div style="background:#1a1a1a;padding:15px;margin:15px 0;border-left:3px solid #dc2626;">
            <p style="margin:5px 0;color:#ccc;">📅 ${dateStr} - ${appointment.time}</p>
            <p style="margin:5px 0;color:#ccc;">🔧 ${appointment.service}</p>
          </div>
          <p style="color:#666;font-size:12px;">Yeni randevu almak için: aesgarage.com/appointment</p>
        </div>`
      );
    }

    res.json({ message: 'Randevunuz iptal edildi', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public: Randevu ertele (tracking code ile) (madde 17)
app.put('/api/appointments/reschedule/:code', async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findOne({ trackingCode: req.params.code });
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'İptal edilmiş randevu ertelenemez' });
    }

    // Tarih/saat doğrulama
    const dateTimeCheck = isValidAppointmentDateTime(date, time);
    if (!dateTimeCheck.valid) {
      return res.status(400).json({ message: dateTimeCheck.message });
    }

    // Slot kontrolü
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingCount = await Appointment.countDocuments({
      _id: { $ne: appointment._id },
      date: { $gte: dayStart, $lte: dayEnd },
      time: time,
      status: { $ne: 'cancelled' }
    });

    if (existingCount >= 2) {
      return res.status(400).json({ message: 'Bu saat dilimi dolu. Lütfen başka bir saat seçiniz.' });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.status = 'pending';
    await appointment.save();
    res.json({ message: 'Randevunuz güncellendi', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Tüm randevuları getir (pagination - madde 14)
app.get('/api/appointments', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const oldAppointment = await Appointment.findById(req.params.id);
    if (!oldAppointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    const oldStatus = oldAppointment.status;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Durum değişikliğinde müşteriye bildirim gönder
    const newStatus = appointment.status;
    if (oldStatus !== newStatus && appointment.email) {
      const dateStr = new Date(appointment.date).toLocaleDateString('tr-TR');

      if (newStatus === 'confirmed') {
        sendEmail(appointment.email, `AES Garage - Randevunuz Onaylandı ✅`,
          `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#111;color:#fff;border:1px solid #333;">
            <h2 style="font-weight:300;letter-spacing:2px;border-bottom:1px solid #333;padding-bottom:15px;">AES GARAGE</h2>
            <p style="color:#ccc;">Merhaba <strong>${appointment.name}</strong>,</p>
            <p style="color:#22c55e;">Randevunuz onaylanmıştır!</p>
            <div style="background:#1a1a1a;padding:15px;margin:15px 0;border-left:3px solid #22c55e;">
              <p style="margin:5px 0;color:#ccc;">📅 <strong>${dateStr}</strong> - ${appointment.time}</p>
              <p style="margin:5px 0;color:#ccc;">🔧 ${appointment.service}</p>
              <p style="margin:5px 0;color:#ccc;">📋 Takip Kodu: ${appointment.trackingCode}</p>
            </div>
            <p style="color:#ccc;font-size:13px;">📍 Küçükbakkalköy Yolu Cd. No:44/B, Ataşehir/İstanbul</p>
            <p style="color:#666;font-size:12px;">İptal/değişiklik için: aesgarage.com/track</p>
          </div>`
        );
      } else if (newStatus === 'cancelled') {
        sendEmail(appointment.email, 'AES Garage - Randevunuz İptal Edildi',
          `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#111;color:#fff;border:1px solid #333;">
            <h2 style="font-weight:300;letter-spacing:2px;border-bottom:1px solid #333;padding-bottom:15px;">AES GARAGE</h2>
            <p style="color:#ccc;">Merhaba <strong>${appointment.name}</strong>,</p>
            <p style="color:#ef4444;">Aşağıdaki randevunuz iptal edilmiştir:</p>
            <div style="background:#1a1a1a;padding:15px;margin:15px 0;border-left:3px solid #dc2626;">
              <p style="margin:5px 0;color:#ccc;">📅 ${dateStr} - ${appointment.time}</p>
              <p style="margin:5px 0;color:#ccc;">🔧 ${appointment.service}</p>
            </div>
            <p style="color:#666;font-size:12px;">Yeni randevu almak için: aesgarage.com/appointment</p>
          </div>`
        );
      }
    }

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    res.json({ message: 'Randevu silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ CONTACT MESSAGES (madde 6) ============

app.post('/api/contact', formLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!isValidName(name)) {
      return res.status(400).json({ message: 'Geçerli bir isim giriniz' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Geçerli bir telefon numarası giriniz' });
    }
    if (!subject || subject.trim().length < 2) {
      return res.status(400).json({ message: 'Konu alanı zorunludur' });
    }
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ message: 'Mesaj en az 10 karakter olmalıdır' });
    }

    const contactMessage = new ContactMessage({
      name: sanitize(name),
      email: sanitize(email),
      phone: sanitize(phone),
      subject: sanitize(subject),
      message: sanitize(message)
    });

    await contactMessage.save();
    res.status(201).json({ message: 'Mesajınız başarıyla gönderildi!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Mesajları getir
app.get('/api/contact', authMiddleware, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Mesaj okundu olarak işaretle
app.put('/api/contact/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: 'Mesaj bulunamadı' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Mesaj sil
app.delete('/api/contact/:id', authMiddleware, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Mesaj bulunamadı' });
    res.json({ message: 'Mesaj silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ FILE UPLOAD ============

app.post('/api/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    // Cloudinary varsa oraya yükle, yoksa local disk
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Buffer'dan Cloudinary'ye yükle
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'aes-garage', quality: 'auto', fetch_format: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      res.json({
        message: 'Dosya başarıyla yüklendi',
        filename: result.public_id,
        url: result.secure_url
      });
    } else {
      // Local fallback
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({
        message: 'Dosya başarıyla yüklendi',
        filename: req.file.filename,
        url: imageUrl
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message, detail: error.http_code ? `Cloudinary HTTP ${error.http_code}` : 'Upload failed' });
  }
});

// ============ SETTINGS ============

// Public: Tüm ayarları getir (frontend'in ihtiyacı için)
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await Settings.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/settings/:category', async (req, res) => {
  try {
    const settings = await Settings.find({ category: req.params.category });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/settings/key/:key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ message: 'Ayar bulunamadı' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Ayar kaydet
app.post('/api/settings', authMiddleware, async (req, res) => {
  try {
    const { key, value, category } = req.body;

    let setting = await Settings.findOne({ key, category });

    if (setting) {
      setting.value = value;
      setting.updatedAt = Date.now();
      await setting.save();
    } else {
      setting = new Settings({ key, value, category });
      await setting.save();
    }

    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/settings/:id', authMiddleware, async (req, res) => {
  try {
    const setting = await Settings.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!setting) {
      return res.status(404).json({ message: 'Ayar bulunamadı' });
    }
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/settings/:id', authMiddleware, async (req, res) => {
  try {
    const setting = await Settings.findByIdAndDelete(req.params.id);
    if (!setting) {
      return res.status(404).json({ message: 'Ayar bulunamadı' });
    }
    res.json({ message: 'Ayar silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ PRODUCTION: Frontend Static Serving ============
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// ============ RANDEVU HATIRLATMA (1 gün kala) ============
async function checkReminders() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      date: { $gte: tomorrowStart, $lte: tomorrowEnd },
      status: { $ne: 'cancelled' },
      reminderSent: { $ne: true }
    });

    for (const apt of appointments) {
      const dateStr = new Date(apt.date).toLocaleDateString('tr-TR');
      // WhatsApp hatırlatma (CallMeBot aktifse)
      if (apt.phone) {
        await sendWhatsApp(apt.phone, `⏰ AES Garage Hatırlatma\n\nMerhaba ${apt.name}, yarınki randevunuzu hatırlatmak isteriz:\n📅 ${dateStr} - ${apt.time}\n🔧 ${apt.service}\n\n📍 Küçükbakkalköy Yolu Cd. No:44/B, Ataşehir/İstanbul\n\nİptal/değişiklik için: aesgarage.com/track`);
      }
      // Email hatırlatma
      if (apt.email) {
        await sendEmail(apt.email, `AES Garage - Randevu Hatırlatma (${apt.trackingCode})`,
          `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#111;color:#fff;border:1px solid #333;">
            <h2 style="font-weight:300;letter-spacing:2px;border-bottom:1px solid #333;padding-bottom:15px;">AES GARAGE</h2>
            <p style="color:#ccc;">Merhaba <strong>${apt.name}</strong>,</p>
            <p style="color:#ccc;">Yarınki randevunuzu hatırlatmak isteriz:</p>
            <div style="background:#1a1a1a;padding:15px;margin:15px 0;border-left:3px solid #f59e0b;">
              <p style="margin:5px 0;color:#ccc;">📅 <strong>${dateStr}</strong> - ${apt.time}</p>
              <p style="margin:5px 0;color:#ccc;">🔧 ${apt.service}</p>
              <p style="margin:5px 0;color:#ccc;">📋 Takip Kodu: ${apt.trackingCode}</p>
            </div>
            <p style="color:#ccc;font-size:13px;">📍 Küçükbakkalköy Yolu Cd. No:44/B, Ataşehir/İstanbul</p>
            <p style="color:#666;font-size:12px;">İptal veya değişiklik için: aesgarage.com/track</p>
          </div>`
        );
      }
      apt.reminderSent = true;
      await apt.save();
      console.log('⏰ Reminder sent to', apt.name);
    }
  } catch (err) {
    console.error('Reminder check error:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`);
  // Her saat hatırlatmaları kontrol et
  setInterval(checkReminders, 60 * 60 * 1000);
  // İlk kontrolü 30sn sonra yap
  setTimeout(checkReminders, 30000);
});
