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
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = { httpOnly: true, secure: isProduction, sameSite: 'strict' };

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
    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
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
    if (!resend) return;
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'AES Garage <onboarding@resend.dev>',
      to, subject, html,
    });
    if (error) console.error('❌ Email error:', error.message);
    else console.log('📧 Email sent to', to, '- id:', data.id);
  } catch (err) {
    console.error('❌ Email error:', err.message);
  }
}

// ============ EMAIL TEMPLATE HELPER ============
function emailTemplate(content, borderColor = '#333') {
  return `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#111;color:#fff;border:1px solid #333;">
    <h2 style="font-weight:300;letter-spacing:2px;border-bottom:1px solid #333;padding-bottom:15px;">AES GARAGE</h2>
    ${content}
  </div>`;
}

function emailBlock(text, borderColor = '#dc2626') {
  return `<div style="background:#1a1a1a;padding:15px;margin:15px 0;border-left:3px solid ${borderColor};">${text}</div>`;
}

function emailLine(icon, text, bold = false) {
  return `<p style="margin:5px 0;color:#ccc;">${icon} ${bold ? `<strong>${text}</strong>` : text}</p>`;
}

// ============ HELPERS ============

// Tarih aralığı helper (DRY - 3 yerde kullanılıyor)
function getDateRange(dateStr) {
  const dayStart = new Date(dateStr);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateStr);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
}

// Slot müsaitlik kontrolü (DRY - create ve reschedule'da kullanılıyor)
async function checkSlotAvailability(date, time, excludeId = null) {
  const { dayStart, dayEnd } = getDateRange(date);
  const query = {
    date: { $gte: dayStart, $lte: dayEnd },
    time,
    status: { $ne: 'cancelled' }
  };
  if (excludeId) query._id = { $ne: excludeId };
  const count = await Appointment.countDocuments(query);
  return { available: count < 2, count };
}

// DNS fix: Lokal DNS SRV çözemezse Google/Cloudflare DNS kullan
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 5000;

// Render.com gibi reverse proxy arkasında çalışırken gerekli
app.set('trust proxy', 1);

// ============ MIDDLEWARE ============

// CORS - production'da aynı origin, development'ta localhost izinli
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'https://aesgarage.com',
  'https://www.aesgarage.com',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());
app.use(helmet());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', generalLimiter);

const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Çok fazla form gönderildi. Lütfen 1 saat sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Çok fazla sorgu gönderildi. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============ MongoDB Connection ============
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI, {
  serverApi: { version: '1', strict: true, deprecationErrors: true }
})
  .then(() => console.log('✅ MongoDB Atlas bağlantısı başarılı!'))
  .catch(err => console.log('❌ MongoDB bağlantı hatası:', err));

// ============ SCHEMAS ============

const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  message: String,
  oilType: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  trackingCode: { type: String, unique: true },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// DB Indexes - sorgu performansı için kritik
AppointmentSchema.index({ date: 1, time: 1, status: 1 });
AppointmentSchema.index({ status: 1, createdAt: -1 });
AppointmentSchema.index({ reminderSent: 1, date: 1, status: 1 });

const Appointment = mongoose.model('Appointment', AppointmentSchema);

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
  category: { type: String, enum: ['images', 'prices', 'contact', 'general', 'serviceTitles', 'serviceDescriptions', 'homeContent'], default: 'general' },
  updatedAt: { type: Date, default: Date.now }
});

SettingsSchema.index({ key: 1, category: 1 }, { unique: true });

const Settings = mongoose.model('Settings', SettingsSchema);

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
const uploadDir = path.join(__dirname, 'uploads');
if (!process.env.CLOUDINARY_CLOUD_NAME && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = process.env.CLOUDINARY_CLOUD_NAME
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname));
      }
    });

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'));
    }
  }
});

// ============ AUTH MIDDLEWARE ============
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.aes_token;
  if (!token) {
    return res.status(401).json({ message: 'Yetkilendirme gerekli' });
  }
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }
};

// ============ INPUT VALIDATION ============
const sanitize = (str) => typeof str !== 'string' ? str : str.trim().replace(/<[^>]*>/g, '');
const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;');
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^(\+?90|0)?[5][0-9]{9}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
const isValidName = (name) => name && name.trim().length >= 2 && name.trim().length <= 100;

const VALID_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function isValidAppointmentDateTime(dateStr, timeStr) {
  const date = new Date(dateStr);
  if (date.getUTCDay() === 0) return { valid: false, message: 'Pazar günü randevu alınamaz' };
  if (!VALID_TIMES.includes(timeStr)) return { valid: false, message: 'Geçersiz saat. Çalışma saatleri: 09:00 - 18:00' };
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const aptDate = new Date(dateStr);
  aptDate.setHours(0, 0, 0, 0);
  if (aptDate < now) return { valid: false, message: 'Geçmiş bir tarihe randevu alınamaz' };
  return { valid: true };
}

function validateContact(name, email, phone) {
  if (!isValidName(name)) return 'Geçerli bir isim giriniz (en az 2 karakter)';
  if (!isValidEmail(email)) return 'Geçerli bir e-posta adresi giriniz';
  if (!isValidPhone(phone)) return 'Geçerli bir telefon numarası giriniz';
  return null;
}

// ============ ROUTES ============

app.get('/api', (req, res) => {
  res.json({ message: 'AES Garage API çalışıyor!' });
});

// ============ AUTH ============
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('aes_token', token, { ...COOKIE_OPTIONS, maxAge: 86400000 });
    res.json({ success: true, expiresIn: 86400 });
  } else {
    res.status(401).json({ message: 'Yanlış şifre!' });
  }
});

app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, role: req.admin.role });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('aes_token', COOKIE_OPTIONS);
  res.json({ success: true });
});

// ============ APPOINTMENTS ============

// Public: Randevu oluştur
app.post('/api/appointments', formLimiter, async (req, res) => {
  try {
    const { name, phone, email, service, date, time, message, oilType } = req.body;

    const contactError = validateContact(name, email, phone);
    if (contactError) return res.status(400).json({ message: contactError });
    if (!service || service.trim().length === 0) return res.status(400).json({ message: 'Hizmet seçimi zorunludur' });
    if (service.trim().length > 200) return res.status(400).json({ message: 'Geçersiz hizmet seçimi' });
    if (!date || !time) return res.status(400).json({ message: 'Tarih ve saat seçimi zorunludur' });

    const dateTimeCheck = isValidAppointmentDateTime(date, time);
    if (!dateTimeCheck.valid) return res.status(400).json({ message: dateTimeCheck.message });

    const slot = await checkSlotAvailability(date, time);
    if (!slot.available) return res.status(400).json({ message: 'Bu saat dilimi dolu. Lütfen başka bir saat seçiniz.' });

    const trackingCode = 'AES-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const newAppointment = await new Appointment({
      name: sanitize(name),
      phone: sanitize(phone),
      email: sanitize(email),
      service: sanitize(service),
      date, time,
      message: message ? sanitize(message) : '',
      oilType: oilType ? sanitize(oilType) : '',
      trackingCode
    }).save();

    // Arka planda bildirimler gönder (response'u bekletme)
    const dateStr = new Date(date).toLocaleDateString('tr-TR');

    const adminWhatsApp = process.env.ADMIN_WHATSAPP;
    if (adminWhatsApp) {
      sendWhatsApp(adminWhatsApp, `🔔 *Yeni Randevu!*\n👤 ${name}\n📱 ${phone}\n🔧 ${service}\n📅 ${dateStr} - ${time}${oilType ? '\n🛢️ Yağ: ' + oilType : ''}\n🚗 ${message || '-'}\n📋 Kod: ${trackingCode}`);
    }

    if (email) {
      sendEmail(email, `AES Garage - Randevu Onayı (${trackingCode})`,
        emailTemplate(
          `<p style="color:#ccc;">Merhaba <strong>${escapeHtml(name)}</strong>,</p>
          <p style="color:#ccc;">Randevunuz başarıyla oluşturuldu.</p>
          ${emailBlock(emailLine('📅', `${dateStr} - ${time}`, true) + emailLine('🔧', escapeHtml(service)))}
          <div style="text-align:center;padding:20px;background:#dc2626;margin:15px 0;">
            <p style="margin:0;font-size:12px;color:#fca5a5;">TAKİP KODUNUZ</p>
            <p style="margin:5px 0;font-size:24px;font-weight:300;letter-spacing:3px;color:#fff;">${trackingCode}</p>
          </div>
          <p style="color:#666;font-size:12px;">Bu kodu saklayın. Randevunuzu takip etmek veya iptal etmek için kullanabilirsiniz.</p>
          <p style="color:#666;font-size:12px;">aesgarage.com/randevu-takip</p>`
        )
      );
    }

    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Public: Slot müsaitlik kontrolü
app.get('/api/appointments/availability', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Tarih gerekli' });

    const { dayStart, dayEnd } = getDateRange(date);
    const appointments = await Appointment.find({
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'cancelled' }
    }).select('time').lean();

    const slotCounts = {};
    for (const a of appointments) {
      slotCounts[a.time] = (slotCounts[a.time] || 0) + 1;
    }

    const availability = {};
    for (const slot of VALID_TIMES) {
      const count = slotCounts[slot] || 0;
      availability[slot] = { count, available: count < 2 };
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// Public: Randevu sorgula (tracking code ile)
app.get('/api/appointments/track/:code', trackLimiter, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ trackingCode: req.params.code })
      .select('name service date time status trackingCode').lean();
    if (!appointment) return res.status(404).json({ message: 'Randevu bulunamadı' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// Public: Randevu iptal et (tracking code ile)
app.put('/api/appointments/cancel/:code', trackLimiter, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ trackingCode: req.params.code });
    if (!appointment) return res.status(404).json({ message: 'Randevu bulunamadı' });
    if (appointment.status === 'cancelled') return res.status(400).json({ message: 'Bu randevu zaten iptal edilmiş' });

    // 24 saat öncesine kadar iptal edilebilir
    const appointmentDateTime = new Date(appointment.date);
    const [hours] = appointment.time.split(':');
    appointmentDateTime.setHours(parseInt(hours), 0, 0, 0);
    if ((appointmentDateTime - new Date()) / (1000 * 60 * 60) < 24) {
      return res.status(400).json({ message: 'Randevu saatinden en az 24 saat önce iptal edilebilir' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    const dateStr = new Date(oldAppointment.date).toLocaleDateString('tr-TR');
    if (appointment.phone) {
      sendWhatsApp(appointment.phone, `❌ AES Garage - Randevunuz iptal edildi.\n📅 ${dateStr} - ${appointment.time}\n🔧 ${appointment.service}\nYeni randevu için: aesgarage.com/randevu`);
    }
    if (appointment.email) {
      sendEmail(appointment.email, 'AES Garage - Randevu İptali',
        emailTemplate(
          `<p style="color:#ccc;">Merhaba ${escapeHtml(appointment.name)},</p>
          <p style="color:#ccc;">Aşağıdaki randevunuz iptal edilmiştir:</p>
          ${emailBlock(emailLine('📅', `${dateStr} - ${appointment.time}`) + emailLine('🔧', escapeHtml(appointment.service)))}
          <p style="color:#666;font-size:12px;">Yeni randevu almak için: aesgarage.com/randevu</p>`
        )
      );
    }

    res.json({ message: 'Randevunuz iptal edildi', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// Public: Randevu ertele (tracking code ile)
app.put('/api/appointments/reschedule/:code', trackLimiter, async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findOne({ trackingCode: req.params.code });
    if (!appointment) return res.status(404).json({ message: 'Randevu bulunamadı' });
    if (appointment.status === 'cancelled') return res.status(400).json({ message: 'İptal edilmiş randevu ertelenemez' });

    const dateTimeCheck = isValidAppointmentDateTime(date, time);
    if (!dateTimeCheck.valid) return res.status(400).json({ message: dateTimeCheck.message });

    const slot = await checkSlotAvailability(date, time, appointment._id);
    if (!slot.available) return res.status(400).json({ message: 'Bu saat dilimi dolu. Lütfen başka bir saat seçiniz.' });

    appointment.date = date;
    appointment.time = time;
    appointment.status = 'pending';
    await appointment.save();
    res.json({ message: 'Randevunuz güncellendi', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// Admin: Tüm randevuları getir (pagination)
app.get('/api/appointments', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;

    const [total, appointments] = await Promise.all([
      Appointment.countDocuments(filter),
      Appointment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
    ]);

    res.json({
      appointments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

app.get('/api/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).lean();
    if (!appointment) return res.status(404).json({ message: 'Randevu bulunamadı' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

app.put('/api/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum' });
    }
    // { new: false } returns pre-update doc — single DB round trip
    const oldAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: false }
    );
    if (!oldAppointment) return res.status(404).json({ message: 'Randevu bulunamadı' });
    const oldStatus = oldAppointment.status;
    const newStatus = status;

    // Durum değişikliğinde müşteriye bildirim gönder
    if (oldStatus !== newStatus && oldAppointment.email) {
      const dateStr = new Date(oldAppointment.date).toLocaleDateString('tr-TR');
      const details = emailLine('📅', `${dateStr} - ${oldAppointment.time}`, true) + emailLine('🔧', escapeHtml(oldAppointment.service));

      if (newStatus === 'confirmed') {
        sendEmail(oldAppointment.email, `AES Garage - Randevunuz Onaylandı ✅`,
          emailTemplate(
            `<p style="color:#ccc;">Merhaba <strong>${escapeHtml(oldAppointment.name)}</strong>,</p>
            <p style="color:#22c55e;">Randevunuz onaylanmıştır!</p>
            ${emailBlock(details + emailLine('📋', `Takip Kodu: ${oldAppointment.trackingCode}`), '#22c55e')}
            <p style="color:#ccc;font-size:13px;">📍 Küçükbakkalköy Yolu Cd. No:44/B, Ataşehir/İstanbul</p>
            <p style="color:#666;font-size:12px;">İptal/değişiklik için: aesgarage.com/randevu-takip</p>`
          )
        );
      } else if (newStatus === 'cancelled') {
        sendEmail(oldAppointment.email, 'AES Garage - Randevunuz İptal Edildi',
          emailTemplate(
            `<p style="color:#ccc;">Merhaba <strong>${escapeHtml(oldAppointment.name)}</strong>,</p>
            <p style="color:#ef4444;">Aşağıdaki randevunuz iptal edilmiştir:</p>
            ${emailBlock(details)}
            <p style="color:#666;font-size:12px;">Yeni randevu almak için: aesgarage.com/randevu</p>`
          )
        );
      }
    }

    res.json({ ...oldAppointment.toObject(), status });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Randevu bulunamadı' });
    res.json({ message: 'Randevu silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// ============ CONTACT MESSAGES ============

app.post('/api/contact', formLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contactError = validateContact(name, email, phone);
    if (contactError) return res.status(400).json({ message: contactError });
    if (!subject || subject.trim().length < 2) return res.status(400).json({ message: 'Konu alanı zorunludur' });
    if (!message || message.trim().length < 10) return res.status(400).json({ message: 'Mesaj en az 10 karakter olmalıdır' });

    await new ContactMessage({
      name: sanitize(name),
      email: sanitize(email),
      phone: sanitize(phone),
      subject: sanitize(subject),
      message: sanitize(message)
    }).save();

    res.status(201).json({ message: 'Mesajınız başarıyla gönderildi!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Mesajları getir (pagination eklendi)
app.get('/api/contact', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const [total, messages] = await Promise.all([
      ContactMessage.countDocuments(),
      ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
    ]);

    res.json({ messages, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

app.put('/api/contact/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!message) return res.status(404).json({ message: 'Mesaj bulunamadı' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

app.delete('/api/contact/:id', authMiddleware, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Mesaj bulunamadı' });
    res.json({ message: 'Mesaj silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// ============ FILE UPLOAD ============

app.post('/api/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Dosya yüklenmedi' });

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'aes-garage', quality: 'auto', fetch_format: 'auto' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      res.json({ message: 'Dosya başarıyla yüklendi', filename: result.public_id, url: result.secure_url });
    } else {
      res.json({ message: 'Dosya başarıyla yüklendi', filename: req.file.filename, url: `/uploads/${req.file.filename}` });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// ============ SETTINGS ============

app.get('/api/settings', async (req, res) => {
  try {
    res.json(await Settings.find().lean());
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

app.get('/api/settings/:category', async (req, res) => {
  try {
    res.json(await Settings.find({ category: req.params.category }).lean());
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

app.get('/api/settings/key/:key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key }).lean();
    if (!setting) return res.status(404).json({ message: 'Ayar bulunamadı' });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

app.post('/api/settings', authMiddleware, async (req, res) => {
  try {
    const { key, value, category } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key, category },
      { value, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/settings/:id', authMiddleware, async (req, res) => {
  try {
    const setting = await Settings.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true });
    if (!setting) return res.status(404).json({ message: 'Ayar bulunamadı' });
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/settings/:id', authMiddleware, async (req, res) => {
  try {
    const setting = await Settings.findByIdAndDelete(req.params.id);
    if (!setting) return res.status(404).json({ message: 'Ayar bulunamadı' });
    res.json({ message: 'Ayar silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// ============ SEO: Eski URL'lerden Yeni Türkçe URL'lere 301 Redirect ============
const urlRedirects = {
  '/about': '/hakkimizda', '/services': '/hizmetler', '/pricing': '/fiyatlar',
  '/appointment': '/randevu', '/contact': '/iletisim', '/track': '/randevu-takip',
};

for (const [oldPath, newPath] of Object.entries(urlRedirects)) {
  app.get(oldPath, (req, res) => res.redirect(301, newPath));
}

// ============ PRODUCTION: Frontend Static Serving ============
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// ============ RANDEVU HATIRLATMA (1 gün kala) ============
let isCheckingReminders = false;

async function checkReminders() {
  if (isCheckingReminders) return;
  isCheckingReminders = true;
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { dayStart, dayEnd } = getDateRange(tomorrow);

    const appointments = await Appointment.find({
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'cancelled' },
      reminderSent: { $ne: true }
    });

    for (const apt of appointments) {
      const dateStr = new Date(apt.date).toLocaleDateString('tr-TR');
      if (apt.phone) {
        await sendWhatsApp(apt.phone, `⏰ AES Garage Hatırlatma\n\nMerhaba ${apt.name}, yarınki randevunuzu hatırlatmak isteriz:\n📅 ${dateStr} - ${apt.time}\n🔧 ${apt.service}\n\n📍 Küçükbakkalköy Yolu Cd. No:44/B, Ataşehir/İstanbul\n\nİptal/değişiklik için: aesgarage.com/randevu-takip`);
      }
      if (apt.email) {
        await sendEmail(apt.email, `AES Garage - Randevu Hatırlatma (${apt.trackingCode})`,
          emailTemplate(
            `<p style="color:#ccc;">Merhaba <strong>${escapeHtml(apt.name)}</strong>,</p>
            <p style="color:#ccc;">Yarınki randevunuzu hatırlatmak isteriz:</p>
            ${emailBlock(
              emailLine('📅', `${dateStr} - ${apt.time}`, true) +
              emailLine('🔧', escapeHtml(apt.service)) +
              emailLine('📋', `Takip Kodu: ${apt.trackingCode}`),
              '#f59e0b'
            )}
            <p style="color:#ccc;font-size:13px;">📍 Küçükbakkalköy Yolu Cd. No:44/B, Ataşehir/İstanbul</p>
            <p style="color:#666;font-size:12px;">İptal veya değişiklik için: aesgarage.com/randevu-takip</p>`
          )
        );
      }
      apt.reminderSent = true;
      await apt.save();
      console.log('⏰ Reminder sent to', apt.name);
    }
  } catch (err) {
    console.error('Reminder check error:', err.message);
  } finally {
    isCheckingReminders = false;
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`);
  setInterval(checkReminders, 60 * 60 * 1000);
  setTimeout(checkReminders, 30000);
});
