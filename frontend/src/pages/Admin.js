import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

// ─── Auth helper: header'a token ekle ───
function authHeader() {
  const token = localStorage.getItem('aes_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function saveSetting(key, value, category) {
  await axios.post(`${API}/api/settings`, { key, value, category }, { headers: authHeader() });
}

function Hint({ children }) {
  return (
    <p className="text-[11px] text-gray-600 font-light mt-1 leading-relaxed">{children}</p>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div className="mb-6 pb-4 border-b border-dark-800">
      <h3 className="text-lg font-light tracking-wider text-white">{title}</h3>
      {description && <p className="text-xs text-gray-500 font-light mt-1">{description}</p>}
    </div>
  );
}

const defaultServices = [
  {
    title: 'Periyodik Bakım', description: 'Aracınızın düzenli bakım ihtiyaçlarını karşılayan kapsamlı servis programı',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
    features: 'Motor yağı ve filtre değişimi\nFren sistemleri kontrolü\nSüspansiyon kontrolü\nLastik kontrolü ve balans\nElektriksel sistem kontrolü',
    duration: '2-3 saat', priceMin: '800', priceMax: '2.000', priceNote: 'Araç segmentine göre değişir',
  },
  {
    title: 'Motor Bakımı', description: 'Motorun maksimum performans ve verimlilikte çalışması için uzman bakım',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    features: 'Motor revizyonu\nTurbo bakımı\nEnjeksiyon sistemi temizliği\nTriger kayışı değişimi\nMotor performans testi',
    duration: '4-6 saat', priceMin: '1.500', priceMax: '8.000', priceNote: 'İşlem kapsamına göre değişir',
  },
  {
    title: 'Fren Bakımı', description: 'Güvenliğiniz için kritik öneme sahip fren sisteminin profesyonel bakımı',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
    features: 'Fren balatası değişimi\nFren diski kontrolü ve değişimi\nFren hidroliği yenileme\nABS sistemi kontrolü\nEl freni ayarı',
    duration: '2-3 saat', priceMin: '500', priceMax: '2.500', priceNote: 'Parça durumuna göre değişir',
  },
  {
    title: 'Lastik Değişimi', description: 'Sürüş güvenliği ve konforu için profesyonel lastik bakımı',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    features: 'Lastik montaj/demontaj\nBalans ayarı\nRot ayarı\nLastik tamir\nMevsimlik değişim',
    duration: '1-2 saat', priceMin: '200', priceMax: '400', priceNote: 'Lastik bedeli hariç',
  },
  {
    title: 'Klima Bakımı', description: 'Konforlu sürüş için klima sisteminin bakımı ve onarımı',
    image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80',
    features: 'Klima gazı dolumu\nKlima filtresi değişimi\nKompresör kontrolü\nKalorifer radyatörü bakımı',
    duration: '1-2 saat', priceMin: '400', priceMax: '1.200', priceNote: 'Gaz dolumu dahil',
  },
  {
    title: 'Elektrik Sistemleri', description: 'Modern araçların karmaşık elektrik sistemlerinin profesyonel bakımı',
    image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80',
    features: 'Akü değişimi\nAlternatör bakımı\nMarş motoru değişimi\nFar ampul değişimi\nECU yazılım güncellemesi',
    duration: '1-4 saat', priceMin: '500', priceMax: '3.500', priceNote: 'Arıza türüne göre değişir',
  },
  {
    title: 'Kaporta & Boya', description: 'Aracınızın dış görünümünü yenileyen profesyonel kaporta hizmetleri',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80',
    features: 'Lokal boya\nTam boya\nGöçük düzeltme\nCam değişimi\nFar parlatma',
    duration: '1-5 gün', priceMin: '1.000', priceMax: '20.000', priceNote: 'Hasar durumuna göre değişir',
  },
  {
    title: 'Mekanik Onarım', description: 'Tüm mekanik arızalar için kapsamlı teşhis ve onarım hizmetleri',
    image: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&q=80',
    features: 'Şanzıman bakımı\nSüspansiyon onarımı\nDiferansiyel bakımı\nEgzoz sistemi\nGenel mekanik arıza',
    duration: '2-6 saat', priceMin: '800', priceMax: '5.000', priceNote: 'Arıza türüne göre değişir',
  },
];

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Randevular (pagination) ───
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('all');

  // ─── İletişim Mesajları ───
  const [contactMessages, setContactMessages] = useState([]);

  // ─── Site görselleri ───
  const [siteImages, setSiteImages] = useState({ heroImage: '', logo: '' });
  const [uploadingImage, setUploadingImage] = useState(null);

  // ─── Dinamik Servis Listesi ───
  const [servicesList, setServicesList] = useState(defaultServices);

  // ─── İletişim Bilgileri (madde 11, 12) ───
  const [contactInfo, setContactInfo] = useState({
    phone: '+90 555 123 45 67',
    email: 'info@aesgarage.com',
    address: 'Alver Apt, İçerenköy, Küçükbakkalköy Yolu Cd. No:44/B, 34752 Ataşehir/İstanbul',
    whatsapp: '905551234567',
    workingHours: 'Pzt-Cmt: 09:00 - 18:00',
    instagramUrl: '',
  });

  // ─── Ana Sayfa İçerik state'leri ───
  const [heroContent, setHeroContent] = useState({
    badge: 'PREMIUM SERVICE', titleLine1: 'MÜKEMMELLIK', titleLine2: 'İÇİN TASARLANDI',
    subtitle: 'Aracınız için en üst düzey bakım ve servis deneyimi',
  });
  const [sectionServices, setSectionServices] = useState({ title: 'HİZMETLERİMİZ', subtitle: 'Aracınız için kapsamlı çözümler' });
  const [reviewsMeta, setReviewsMeta] = useState({ score: '4.9', count: '120' });
  const [reviews, setReviews] = useState([
    { name: 'Mehmet K.', rating: '5', text: 'Aracımın periyodik bakımını yaptırdım. Hem fiyat hem de hizmet kalitesi mükemmeldi.', date: '2 hafta önce' },
    { name: 'Ayşe T.', rating: '5', text: 'Fren sorunu yaşıyordum, aynı gün çözdüler. Çok ilgili ve güler yüzlü bir ekip.', date: '1 ay önce' },
    { name: 'Hasan D.', rating: '5', text: 'Motor bakımı için geldim, detaylı bir şekilde bilgilendirildim. Güvenilir bir yer.', date: '1 ay önce' },
    { name: 'Fatma S.', rating: '4', text: 'Klima bakımı yaptırdım, gayet memnun kaldım. Fiyatlar piyasaya göre uygun.', date: '2 ay önce' },
    { name: 'Ali R.', rating: '5', text: 'Kaporta boyada harika iş çıkardılar. Aracım sıfır gibi oldu.', date: '3 ay önce' },
    { name: 'Zeynep M.', rating: '5', text: 'Lastik değişimi ve rot balans yaptırdım. Hızlı ve kaliteli hizmet.', date: '3 ay önce' },
  ]);
  const [references, setReferences] = useState([
    { title: 'BMW 5 Serisi - Motor Revizyonu', desc: 'Komple motor revizyonu ve turbo değişimi' },
    { title: 'Mercedes C180 - Periyodik Bakım', desc: 'Yıllık periyodik bakım ve fren sistemi yenileme' },
    { title: 'Audi A4 - Kaporta & Boya', desc: 'Tam boya ve göçük düzeltme işlemi' },
    { title: 'VW Passat - Şanzıman Bakımı', desc: 'Otomatik şanzıman yağ değişimi ve bakımı' },
    { title: 'Toyota Corolla - Klima Sistemi', desc: 'Klima kompresör değişimi ve gaz dolumu' },
    { title: 'Ford Focus - Elektrik Sistemi', desc: 'ECU yazılım güncellemesi ve akü değişimi' },
  ]);
  const [partners, setPartners] = useState([
    'Bosch Car Service', 'Castrol', 'Michelin', 'Brembo', 'Mann Filter', 'NGK', 'Continental', 'Denso'
  ]);
  const [faqItems, setFaqItems] = useState([
    { question: 'Randevu almadan gelebilir miyim?', answer: 'Evet, randevusuz da gelebilirsiniz. Ancak randevulu müşterilerimize öncelik verilmektedir.' },
    { question: 'Garanti kapsamındaki araçlara hizmet veriyor musunuz?', answer: 'Evet, garanti kapsamındaki araçlara da hizmet vermekteyiz.' },
    { question: 'Yedek parça orijinal mi kullanıyorsunuz?', answer: 'Evet, tüm işlemlerimizde orijinal veya OEM onaylı yedek parçalar kullanmaktayız.' },
    { question: 'Servis süresi ne kadar?', answer: 'Servis süresi yapılacak işleme göre değişmektedir. Periyodik bakım 2-3 saat, motor bakımı 4-6 saat sürebilir.' },
    { question: 'Ödeme seçenekleriniz neler?', answer: 'Nakit, kredi kartı ve banka kartı ile ödeme kabul etmekteyiz.' },
    { question: 'Aracım servisteyken beni bilgilendirir misiniz?', answer: 'Evet, işlem süresince sizi bilgilendiriyoruz.' },
  ]);
  const [ctaContent, setCtaContent] = useState({ title: 'HAZIR MISINIZ?', subtitle: 'Aracınız için en iyi bakımı almanın zamanı geldi' });

  // ════════════════════════════════════
  //  LOGIN (JWT)
  // ════════════════════════════════════
  // Sayfa yüklendiğinde token kontrolü
  useEffect(() => {
    const token = localStorage.getItem('aes_token');
    if (token) {
      axios.get(`${API}/api/auth/verify`, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => setIsAuthenticated(true))
        .catch(() => { localStorage.removeItem('aes_token'); });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/auth/login`, { password });
      localStorage.setItem('aes_token', res.data.token);
      setIsAuthenticated(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aes_token');
    setIsAuthenticated(false);
  };

  // ════════════════════════════════════
  //  FETCH
  // ════════════════════════════════════
  const fetchAppointments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/appointments`, {
        headers: authHeader(),
        params: { page, limit: 20, status: statusFilter }
      });
      const data = response.data;
      if (data.appointments) {
        setAppointments(data.appointments);
        setPagination(data.pagination);
      } else {
        // Eski format desteği
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.status === 401) handleLogout();
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const response = await axios.get(`${API}/api/contact`, { headers: authHeader() });
      setContactMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/api/settings`);
      const img = {}, home = {}, general = {}, contact = {};

      response.data.forEach(s => {
        if (s.category === 'images') img[s.key] = s.value;
        else if (s.category === 'homeContent') home[s.key] = s.value;
        else if (s.category === 'general') general[s.key] = s.value;
        else if (s.category === 'contact') contact[s.key] = s.value;
      });

      if (img.heroImage) setSiteImages(prev => ({ ...prev, heroImage: img.heroImage }));
      if (img.logo) setSiteImages(prev => ({ ...prev, logo: img.logo }));

      try { if (general.servicesList) setServicesList(JSON.parse(general.servicesList)); } catch(e) {}

      // İletişim bilgileri
      if (contact.phone) setContactInfo(prev => ({ ...prev, phone: contact.phone }));
      if (contact.email) setContactInfo(prev => ({ ...prev, email: contact.email }));
      if (contact.address) setContactInfo(prev => ({ ...prev, address: contact.address }));
      if (contact.whatsapp) setContactInfo(prev => ({ ...prev, whatsapp: contact.whatsapp }));
      if (contact.workingHours) setContactInfo(prev => ({ ...prev, workingHours: contact.workingHours }));
      if (contact.instagramUrl) setContactInfo(prev => ({ ...prev, instagramUrl: contact.instagramUrl }));

      try { if (home.heroContent) setHeroContent(JSON.parse(home.heroContent)); } catch(e) {}
      try { if (home.sectionServices) setSectionServices(JSON.parse(home.sectionServices)); } catch(e) {}
      try { if (home.reviewsMeta) setReviewsMeta(JSON.parse(home.reviewsMeta)); } catch(e) {}
      try { if (home.reviews) setReviews(JSON.parse(home.reviews)); } catch(e) {}
      try { if (home.references) setReferences(JSON.parse(home.references)); } catch(e) {}
      try { if (home.partners) setPartners(JSON.parse(home.partners)); } catch(e) {}
      try { if (home.faqItems) setFaqItems(JSON.parse(home.faqItems)); } catch(e) {}
      try { if (home.ctaContent) setCtaContent(JSON.parse(home.ctaContent)); } catch(e) {}
    } catch (err) {
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      fetchSettings();
      fetchContactMessages();
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments(1);
    }
    // eslint-disable-next-line
  }, [statusFilter]);

  // ════════════════════════════════════
  //  APPOINTMENT ACTIONS
  // ════════════════════════════════════
  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/appointments/${id}`, { status }, { headers: authHeader() });
      fetchAppointments(pagination.page);
    } catch (err) { console.error(err); }
  };
  const deleteAppointment = async (id) => {
    if (window.confirm('Silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`${API}/api/appointments/${id}`, { headers: authHeader() });
        fetchAppointments(pagination.page);
      } catch (err) { console.error(err); }
    }
  };

  // ════════════════════════════════════
  //  CONTACT MESSAGE ACTIONS
  // ════════════════════════════════════
  const markMessageRead = async (id) => {
    try {
      await axios.put(`${API}/api/contact/${id}/read`, {}, { headers: authHeader() });
      fetchContactMessages();
    } catch (err) { console.error(err); }
  };
  const deleteMessage = async (id) => {
    if (window.confirm('Mesajı silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`${API}/api/contact/${id}`, { headers: authHeader() });
        fetchContactMessages();
      } catch (err) { console.error(err); }
    }
  };

  // ════════════════════════════════════
  //  IMAGE UPLOAD
  // ════════════════════════════════════
  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await axios.post(`${API}/api/upload`, fd, {
      headers: { 'Content-Type': 'multipart/form-data', ...authHeader() }
    });
    return res.data.url;
  };

  const handleSiteImageUpload = async (key, file) => {
    if (!file) return;
    setUploadingImage(key);
    try {
      const url = await uploadImage(file);
      await saveSetting(key, url, 'images');
      setSiteImages(prev => ({ ...prev, [key]: url }));
      alert('Fotoğraf yüklendi!');
    } catch (err) { alert('Hata oluştu!'); }
    finally { setUploadingImage(null); }
  };

  const handleServiceImageUpload = async (idx, file) => {
    if (!file) return;
    setUploadingImage(`service-${idx}`);
    try {
      const url = await uploadImage(file);
      const copy = [...servicesList];
      copy[idx] = { ...copy[idx], image: url };
      setServicesList(copy);
      await saveSetting('servicesList', JSON.stringify(copy), 'general');
      alert('Servis fotoğrafı yüklendi!');
    } catch (err) { alert('Hata oluştu!'); }
    finally { setUploadingImage(null); }
  };

  // ════════════════════════════════════
  //  SAVE FUNCTIONS
  // ════════════════════════════════════
  const saveServicesList = async () => {
    setSaving(true);
    try {
      await saveSetting('servicesList', JSON.stringify(servicesList), 'general');
      alert('Tüm servis bilgileri kaydedildi!');
    } catch (err) { alert('Kaydetme hatası: ' + err.message); }
    finally { setSaving(false); }
  };

  const saveContactInfo = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('phone', contactInfo.phone, 'contact'),
        saveSetting('email', contactInfo.email, 'contact'),
        saveSetting('address', contactInfo.address, 'contact'),
        saveSetting('whatsapp', contactInfo.whatsapp, 'contact'),
        saveSetting('workingHours', contactInfo.workingHours, 'contact'),
        saveSetting('instagramUrl', contactInfo.instagramUrl || '', 'contact'),
      ]);
      alert('İletişim bilgileri kaydedildi!');
    } catch (err) { alert('Kaydetme hatası: ' + err.message); }
    finally { setSaving(false); }
  };

  const saveAllHomeContent = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('heroContent', JSON.stringify(heroContent), 'homeContent'),
        saveSetting('sectionServices', JSON.stringify(sectionServices), 'homeContent'),
        saveSetting('reviewsMeta', JSON.stringify(reviewsMeta), 'homeContent'),
        saveSetting('reviews', JSON.stringify(reviews), 'homeContent'),
        saveSetting('references', JSON.stringify(references), 'homeContent'),
        saveSetting('partners', JSON.stringify(partners), 'homeContent'),
        saveSetting('faqItems', JSON.stringify(faqItems), 'homeContent'),
        saveSetting('ctaContent', JSON.stringify(ctaContent), 'homeContent'),
      ]);
      alert('Tüm ana sayfa içeriği kaydedildi!');
    } catch (err) { alert('Kaydetme hatası: ' + err.message); }
    finally { setSaving(false); }
  };

  // ════════════════════════════════════
  //  HELPER: düzenleme fonksiyonları
  // ════════════════════════════════════
  const updateService = (idx, field, val) => { const c = [...servicesList]; c[idx] = { ...c[idx], [field]: val }; setServicesList(c); };
  const addService = () => setServicesList([...servicesList, { title: '', description: '', image: '', features: '', duration: '', priceMin: '', priceMax: '', priceNote: '' }]);
  const removeService = (idx) => { if (window.confirm('Bu servisi silmek istediğinize emin misiniz?')) setServicesList(servicesList.filter((_, i) => i !== idx)); };
  const moveService = (idx, dir) => { const c = [...servicesList]; const t = idx + dir; if (t < 0 || t >= c.length) return; [c[idx], c[t]] = [c[t], c[idx]]; setServicesList(c); };

  const updateReview = (idx, field, val) => { const c = [...reviews]; c[idx] = { ...c[idx], [field]: val }; setReviews(c); };
  const addReview = () => setReviews([...reviews, { name: '', rating: '5', text: '', date: '' }]);
  const removeReview = (idx) => setReviews(reviews.filter((_, i) => i !== idx));

  const updateRef = (idx, field, val) => { const c = [...references]; c[idx] = { ...c[idx], [field]: val }; setReferences(c); };
  const addRef = () => setReferences([...references, { title: '', desc: '' }]);
  const removeRef = (idx) => setReferences(references.filter((_, i) => i !== idx));

  const updateFaq = (idx, field, val) => { const c = [...faqItems]; c[idx] = { ...c[idx], [field]: val }; setFaqItems(c); };
  const addFaq = () => setFaqItems([...faqItems, { question: '', answer: '' }]);
  const removeFaq = (idx) => setFaqItems(faqItems.filter((_, i) => i !== idx));

  const updatePartner = (idx, val) => { const c = [...partners]; c[idx] = val; setPartners(c); };
  const addPartner = () => setPartners([...partners, '']);
  const removePartner = (idx) => setPartners(partners.filter((_, i) => i !== idx));

  // ════════════════════════════════════
  //  STYLING HELPERS
  // ════════════════════════════════════
  const inputClass = 'w-full bg-transparent border border-dark-800 px-4 py-3 text-sm font-light text-white focus:border-red-600 focus:outline-none transition-colors';
  const textareaClass = inputClass + ' resize-none';
  const btnOutline = 'px-4 py-2 border border-dark-800 hover:border-red-600 text-xs font-light tracking-wider text-gray-400 hover:text-white transition-colors';
  const btnDanger = 'px-3 py-1 border border-red-600/30 text-red-400 hover:bg-red-600/10 text-xs font-light transition-colors';
  const fileInputClass = 'w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:border file:border-dark-800 file:bg-dark-900 file:text-white file:font-light hover:file:border-red-600 file:transition-colors';

  // ════════════════════════════════════
  //  LOGIN SCREEN
  // ════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light tracking-tight mb-2">ADMİN PANELİ</h1>
            <p className="text-gray-400 font-light">Giriş yapın</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs tracking-widest font-light text-gray-400 mb-3">ŞİFRE</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-dark-800 px-6 py-4 focus:border-red-600 focus:outline-none transition-colors font-light"
                placeholder="Şifrenizi girin" />
            </div>
            {error && <div className="p-4 border border-red-600/30 bg-red-600/10"><p className="text-red-400 font-light text-sm">{error}</p></div>}
            <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-light tracking-widest text-sm transition-all">GİRİŞ YAP</button>
          </form>
        </div>
      </div>
    );
  }

  const unreadCount = contactMessages.filter(m => !m.read).length;

  // ════════════════════════════════════
  //  MAIN PANEL
  // ════════════════════════════════════
  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-light tracking-tight">ADMİN PANELİ</h1>
          <button onClick={handleLogout} className={btnOutline}>ÇIKIŞ</button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-dark-800 pb-1">
          {[
            { key: 'appointments', label: 'RANDEVULAR' },
            { key: 'messages', label: `MESAJLAR${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
            { key: 'services', label: 'HİZMETLER & FİYATLAR' },
            { key: 'contact', label: 'İLETİŞİM BİLGİLERİ' },
            { key: 'homeContent', label: 'ANA SAYFA İÇERİK' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-4 font-light tracking-wider text-sm transition-all ${activeTab === tab.key ? 'border-b-2 border-red-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════ TAB: RANDEVULAR (pagination) ═══════════ */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-light">Randevular ({pagination.total || appointments.length})</h2>
              <div className="flex items-center gap-3">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-dark-800 border border-dark-700 px-4 py-2 text-sm focus:border-red-600 focus:outline-none">
                  <option value="all">Tümü</option>
                  <option value="pending">Bekliyor</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="cancelled">İptal</option>
                </select>
                <button onClick={() => fetchAppointments(pagination.page)} className={btnOutline}>YENİLE</button>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Yükleniyor...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Henüz randevu yok</div>
            ) : (
              <>
                {appointments.map((a) => (
                  <div key={a._id} className="bg-dark-900 border border-dark-800 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div><div className="text-xs text-gray-500 mb-1">MÜŞTERİ</div><div className="font-light">{a.name}</div></div>
                      <div><div className="text-xs text-gray-500 mb-1">TELEFON</div><div className="font-light">{a.phone}</div></div>
                      <div><div className="text-xs text-gray-500 mb-1">HİZMET</div><div className="font-light">{a.service}</div></div>
                      <div><div className="text-xs text-gray-500 mb-1">TARİH & SAAT</div><div className="font-light">{new Date(a.date).toLocaleDateString('tr-TR')} - {a.time}</div></div>
                      {a.email && <div><div className="text-xs text-gray-500 mb-1">E-POSTA</div><div className="font-light">{a.email}</div></div>}
                      {a.trackingCode && <div><div className="text-xs text-gray-500 mb-1">TAKİP KODU</div><div className="font-light text-red-400">{a.trackingCode}</div></div>}
                    </div>
                    {a.message && <div className="mb-4 text-sm text-gray-400 font-light">{a.message}</div>}
                    <div className="flex items-center justify-between pt-4 border-t border-dark-800">
                      <select value={a.status} onChange={(e) => updateAppointmentStatus(a._id, e.target.value)}
                        className="bg-dark-800 border border-dark-700 px-4 py-2 text-sm focus:border-red-600 focus:outline-none">
                        <option value="pending">Bekliyor</option>
                        <option value="confirmed">Onaylandı</option>
                        <option value="cancelled">İptal</option>
                      </select>
                      <button onClick={() => deleteAppointment(a._id)} className={btnDanger}>SİL</button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-6">
                    <button onClick={() => fetchAppointments(pagination.page - 1)} disabled={pagination.page <= 1}
                      className={`${btnOutline} disabled:opacity-30`}>← Önceki</button>
                    <span className="text-sm text-gray-400 font-light px-4">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button onClick={() => fetchAppointments(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                      className={`${btnOutline} disabled:opacity-30`}>Sonraki →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════════ TAB: MESAJLAR ═══════════ */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light">İletişim Mesajları ({contactMessages.length})</h2>
              <button onClick={fetchContactMessages} className={btnOutline}>YENİLE</button>
            </div>
            {contactMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Henüz mesaj yok</div>
            ) : (
              contactMessages.map((m) => (
                <div key={m._id} className={`border p-6 ${m.read ? 'border-dark-800 bg-dark-900' : 'border-red-600/30 bg-red-600/5'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div><div className="text-xs text-gray-500 mb-1">GÖNDERİCİ</div><div className="font-light">{m.name}</div></div>
                    <div><div className="text-xs text-gray-500 mb-1">E-POSTA</div><div className="font-light">{m.email}</div></div>
                    <div><div className="text-xs text-gray-500 mb-1">TELEFON</div><div className="font-light">{m.phone}</div></div>
                  </div>
                  <div className="mb-2"><div className="text-xs text-gray-500 mb-1">KONU</div><div className="font-light">{m.subject}</div></div>
                  <div className="mb-4"><div className="text-xs text-gray-500 mb-1">MESAJ</div><div className="font-light text-gray-300 text-sm">{m.message}</div></div>
                  <div className="flex items-center justify-between pt-4 border-t border-dark-800">
                    <span className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString('tr-TR')}</span>
                    <div className="flex gap-2">
                      {!m.read && <button onClick={() => markMessageRead(m._id)} className={btnOutline}>OKUNDU</button>}
                      <button onClick={() => deleteMessage(m._id)} className={btnDanger}>SİL</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══════════ TAB: HİZMETLER & FİYATLAR ═══════════ */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="p-6 border border-red-600/20 bg-red-600/5 rounded">
              <h2 className="text-xl font-light tracking-wider mb-2">Hizmet & Fiyat Yönetimi</h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Tüm servisleri tek bir yerden yönetin. Bu bilgiler <strong className="text-white">Ana Sayfa</strong>, <strong className="text-white">Hizmetler</strong> ve <strong className="text-white">Randevu</strong> sayfalarında kullanılır.
              </p>
            </div>

            <div className="border border-dark-800 p-6">
              <SectionTitle title="Site Görselleri" description="Ana sayfa hero fotoğrafı ve logo" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-widest text-gray-500 mb-2">ANA SAYFA HERO FOTOĞRAFI</label>
                  {siteImages.heroImage && <img src={siteImages.heroImage} alt="Hero" className="w-full h-40 object-cover mb-3 border border-dark-700" />}
                  <input type="file" accept="image/*" onChange={(e) => handleSiteImageUpload('heroImage', e.target.files[0])} disabled={uploadingImage === 'heroImage'} className={fileInputClass} />
                  {uploadingImage === 'heroImage' && <div className="mt-2 text-sm text-gray-400">Yükleniyor...</div>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-500 mb-2">LOGO</label>
                  {siteImages.logo && <img src={siteImages.logo} alt="Logo" className="w-full h-40 object-contain mb-3 border border-dark-700" />}
                  <input type="file" accept="image/*" onChange={(e) => handleSiteImageUpload('logo', e.target.files[0])} disabled={uploadingImage === 'logo'} className={fileInputClass} />
                  {uploadingImage === 'logo' && <div className="mt-2 text-sm text-gray-400">Yükleniyor...</div>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {servicesList.map((s, i) => (
                <div key={i} className="border border-dark-800 p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-light tracking-wider">SERVİS {i + 1}</span>
                      <span className="text-sm text-white font-light">{s.title || '(İsimsiz)'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => moveService(i, -1)} disabled={i === 0} className="px-2 py-1 border border-dark-700 text-gray-500 hover:text-white text-xs disabled:opacity-30">↑</button>
                      <button onClick={() => moveService(i, 1)} disabled={i === servicesList.length - 1} className="px-2 py-1 border border-dark-700 text-gray-500 hover:text-white text-xs disabled:opacity-30">↓</button>
                      <button onClick={() => removeService(i)} className={btnDanger}>Sil</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs text-gray-600 mb-1">Servis Başlığı</label><input className={inputClass} value={s.title} onChange={e => updateService(i, 'title', e.target.value)} placeholder="Periyodik Bakım" /><Hint>Tüm sayfalarda görünen servis adı.</Hint></div>
                    <div><label className="block text-xs text-gray-600 mb-1">Süre</label><input className={inputClass} value={s.duration} onChange={e => updateService(i, 'duration', e.target.value)} placeholder="2-3 saat" /></div>
                  </div>
                  <div><label className="block text-xs text-gray-600 mb-1">Açıklama</label><textarea className={textareaClass} rows="2" value={s.description} onChange={e => updateService(i, 'description', e.target.value)} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-xs text-gray-600 mb-1">Min. Fiyat (₺)</label><input className={inputClass} value={s.priceMin} onChange={e => updateService(i, 'priceMin', e.target.value)} /></div>
                    <div><label className="block text-xs text-gray-600 mb-1">Max. Fiyat (₺)</label><input className={inputClass} value={s.priceMax} onChange={e => updateService(i, 'priceMax', e.target.value)} /></div>
                    <div><label className="block text-xs text-gray-600 mb-1">Fiyat Notu</label><input className={inputClass} value={s.priceNote} onChange={e => updateService(i, 'priceNote', e.target.value)} /></div>
                  </div>
                  <div><label className="block text-xs text-gray-600 mb-1">Özellikler (her satıra bir tane)</label><textarea className={textareaClass} rows="4" value={s.features} onChange={e => updateService(i, 'features', e.target.value)} /></div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Servis Fotoğrafı</label>
                    {s.image && <img src={s.image} alt={s.title} className="w-full h-48 object-cover mb-3 border border-dark-700" />}
                    <input type="file" accept="image/*" onChange={(e) => handleServiceImageUpload(i, e.target.files[0])} disabled={uploadingImage === `service-${i}`} className={fileInputClass} />
                    {uploadingImage === `service-${i}` && <div className="mt-2 text-sm text-gray-400">Yükleniyor...</div>}
                  </div>
                </div>
              ))}
              <button onClick={addService} className={btnOutline + ' w-full py-3 text-center'}>+ YENİ SERVİS EKLE</button>
            </div>

            <div className="sticky bottom-6 z-10">
              <button onClick={saveServicesList} disabled={saving}
                className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-light tracking-[0.2em] text-sm transition-all shadow-2xl shadow-red-900/30">
                {saving ? 'KAYDEDİLİYOR...' : 'TÜM SERVİSLERİ KAYDET'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ TAB: İLETİŞİM BİLGİLERİ (madde 11) ═══════════ */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            <div className="p-6 border border-red-600/20 bg-red-600/5 rounded">
              <h2 className="text-xl font-light tracking-wider mb-2">İletişim Bilgileri Yönetimi</h2>
              <p className="text-sm text-gray-400 font-light">
                Bu bilgiler sitenin footer'ında, iletişim sayfasında ve WhatsApp butonunda kullanılır.
              </p>
            </div>

            <div className="border border-dark-800 p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-widest text-gray-500 mb-2">TELEFON</label>
                  <input className={inputClass} value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                  <Hint>Footer ve iletişim sayfasında görünen telefon numarası</Hint>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-500 mb-2">WHATSAPP NUMARASI</label>
                  <input className={inputClass} value={contactInfo.whatsapp} onChange={e => setContactInfo({ ...contactInfo, whatsapp: e.target.value })} placeholder="905551234567" />
                  <Hint>Ülke koduyla birlikte, boşluksuz. Örn: 905551234567</Hint>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-500 mb-2">E-POSTA</label>
                  <input className={inputClass} value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-500 mb-2">ÇALIŞMA SAATLERİ</label>
                  <input className={inputClass} value={contactInfo.workingHours} onChange={e => setContactInfo({ ...contactInfo, workingHours: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-500 mb-2">INSTAGRAM SAYFASI</label>
                  <input className={inputClass} value={contactInfo.instagramUrl} onChange={e => setContactInfo({ ...contactInfo, instagramUrl: e.target.value })} placeholder="https://instagram.com/aesgarage" />
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-2">ADRES</label>
                <textarea className={textareaClass} rows="2" value={contactInfo.address} onChange={e => setContactInfo({ ...contactInfo, address: e.target.value })} />
              </div>
            </div>

            <div className="sticky bottom-6 z-10">
              <button onClick={saveContactInfo} disabled={saving}
                className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-light tracking-[0.2em] text-sm transition-all shadow-2xl shadow-red-900/30">
                {saving ? 'KAYDEDİLİYOR...' : 'İLETİŞİM BİLGİLERİNİ KAYDET'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ TAB: ANA SAYFA İÇERİK ═══════════ */}
        {activeTab === 'homeContent' && (
          <div className="space-y-12">
            <div className="p-6 border border-red-600/20 bg-red-600/5 rounded">
              <h2 className="text-xl font-light tracking-wider mb-2">Ana Sayfa İçerik Yönetimi</h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Bu bölümden ana sayfadaki tüm yazıları düzenleyebilirsiniz. Değişiklik yaptıktan sonra <strong className="text-red-400">"TÜM İÇERİĞİ KAYDET"</strong> butonuna basmayı unutmayın.
              </p>
            </div>

            {/* 1. HERO */}
            <div className="border border-dark-800 p-6">
              <SectionTitle title="1. Hero Bölümü" description="Siteye girince ilk görülen büyük alan." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs tracking-widest text-gray-500 mb-2">ROZET YAZI</label><input className={inputClass} value={heroContent.badge} onChange={e => setHeroContent({ ...heroContent, badge: e.target.value })} /></div>
                <div><label className="block text-xs tracking-widest text-gray-500 mb-2">BAŞLIK - 1. SATIR</label><input className={inputClass} value={heroContent.titleLine1} onChange={e => setHeroContent({ ...heroContent, titleLine1: e.target.value })} /></div>
                <div><label className="block text-xs tracking-widest text-gray-500 mb-2">BAŞLIK - 2. SATIR</label><input className={inputClass} value={heroContent.titleLine2} onChange={e => setHeroContent({ ...heroContent, titleLine2: e.target.value })} /></div>
                <div><label className="block text-xs tracking-widest text-gray-500 mb-2">ALT AÇIKLAMA</label><input className={inputClass} value={heroContent.subtitle} onChange={e => setHeroContent({ ...heroContent, subtitle: e.target.value })} /></div>
              </div>
            </div>

            {/* 2. HİZMETLER BAŞLIĞI */}
            <div className="border border-dark-800 p-6">
              <SectionTitle title="2. Hizmetler Bölüm Başlığı" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs tracking-widest text-gray-500 mb-2">BAŞLIK</label><input className={inputClass} value={sectionServices.title} onChange={e => setSectionServices({ ...sectionServices, title: e.target.value })} /></div>
                <div><label className="block text-xs tracking-widest text-gray-500 mb-2">ALT YAZI</label><input className={inputClass} value={sectionServices.subtitle} onChange={e => setSectionServices({ ...sectionServices, subtitle: e.target.value })} /></div>
              </div>
            </div>

            {/* 3. YORUMLAR */}
            <div className="border border-dark-800 p-6">
              <SectionTitle title="3. Müşteri Yorumları" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-xs tracking-widest text-gray-500 mb-2">GENEL PUAN</label><input className={inputClass} value={reviewsMeta.score} onChange={e => setReviewsMeta({ ...reviewsMeta, score: e.target.value })} /></div>
                <div><label className="block text-xs tracking-widest text-gray-500 mb-2">TOPLAM YORUM SAYISI</label><input className={inputClass} value={reviewsMeta.count} onChange={e => setReviewsMeta({ ...reviewsMeta, count: e.target.value })} /></div>
              </div>
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="p-4 border border-dark-700 bg-dark-900/50 space-y-3">
                    <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Yorum {i + 1}</span><button onClick={() => removeReview(i)} className={btnDanger}>Kaldır</button></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div><label className="block text-xs text-gray-600 mb-1">İsim</label><input className={inputClass} value={r.name} onChange={e => updateReview(i, 'name', e.target.value)} /></div>
                      <div><label className="block text-xs text-gray-600 mb-1">Puan</label><input className={inputClass} type="number" min="1" max="5" value={r.rating} onChange={e => updateReview(i, 'rating', e.target.value)} /></div>
                      <div><label className="block text-xs text-gray-600 mb-1">Tarih</label><input className={inputClass} value={r.date} onChange={e => updateReview(i, 'date', e.target.value)} /></div>
                    </div>
                    <div><label className="block text-xs text-gray-600 mb-1">Yorum</label><textarea className={textareaClass} rows="2" value={r.text} onChange={e => updateReview(i, 'text', e.target.value)} /></div>
                  </div>
                ))}
                <button onClick={addReview} className={btnOutline}>+ Yeni Yorum Ekle</button>
              </div>
            </div>

            {/* 4. REFERANSLAR */}
            <div className="border border-dark-800 p-6">
              <SectionTitle title="4. Referanslar" />
              <div className="space-y-4">
                {references.map((r, i) => (
                  <div key={i} className="p-4 border border-dark-700 bg-dark-900/50 space-y-3">
                    <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Referans {i + 1}</span><button onClick={() => removeRef(i)} className={btnDanger}>Kaldır</button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="block text-xs text-gray-600 mb-1">Başlık</label><input className={inputClass} value={r.title} onChange={e => updateRef(i, 'title', e.target.value)} /></div>
                      <div><label className="block text-xs text-gray-600 mb-1">Açıklama</label><input className={inputClass} value={r.desc} onChange={e => updateRef(i, 'desc', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
                <button onClick={addRef} className={btnOutline}>+ Yeni Referans Ekle</button>
              </div>
            </div>

            {/* 5. ORTAKLAR */}
            <div className="border border-dark-800 p-6">
              <SectionTitle title="5. İş Birlikleri" />
              <div className="space-y-3">
                {partners.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input className={inputClass} value={p} onChange={e => updatePartner(i, e.target.value)} />
                    <button onClick={() => removePartner(i)} className={btnDanger}>Sil</button>
                  </div>
                ))}
                <button onClick={addPartner} className={btnOutline}>+ Yeni Ortak Ekle</button>
              </div>
            </div>

            {/* 6. FAQ */}
            <div className="border border-dark-800 p-6">
              <SectionTitle title="6. Sıkça Sorulan Sorular" />
              <div className="space-y-4">
                {faqItems.map((f, i) => (
                  <div key={i} className="p-4 border border-dark-700 bg-dark-900/50 space-y-3">
                    <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Soru {i + 1}</span><button onClick={() => removeFaq(i)} className={btnDanger}>Kaldır</button></div>
                    <div><label className="block text-xs text-gray-600 mb-1">Soru</label><input className={inputClass} value={f.question} onChange={e => updateFaq(i, 'question', e.target.value)} /></div>
                    <div><label className="block text-xs text-gray-600 mb-1">Cevap</label><textarea className={textareaClass} rows="2" value={f.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} /></div>
                  </div>
                ))}
                <button onClick={addFaq} className={btnOutline}>+ Yeni Soru Ekle</button>
              </div>
            </div>

            {/* 7. CTA */}
            <div className="border border-dark-800 p-6">
              <SectionTitle title="7. CTA Bölümü" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs tracking-widest text-gray-500 mb-2">BAŞLIK</label><input className={inputClass} value={ctaContent.title} onChange={e => setCtaContent({ ...ctaContent, title: e.target.value })} /></div>
                <div><label className="block text-xs tracking-widest text-gray-500 mb-2">ALT YAZI</label><input className={inputClass} value={ctaContent.subtitle} onChange={e => setCtaContent({ ...ctaContent, subtitle: e.target.value })} /></div>
              </div>
            </div>

            <div className="sticky bottom-6 z-10">
              <button onClick={saveAllHomeContent} disabled={saving}
                className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-light tracking-[0.2em] text-sm transition-all shadow-2xl shadow-red-900/30">
                {saving ? 'KAYDEDİLİYOR...' : 'TÜM İÇERİĞİ KAYDET'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;
