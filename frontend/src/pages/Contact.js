import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SEOHead from '../components/SEOHead';

const API = process.env.REACT_APP_API_URL || '';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '+90 555 123 45 67',
    email: 'info@aesgarage.com',
    address: 'Alver Apt, İçerenköy, Küçükbakkalköy Yolu Cd. No:44/B, 34752 Ataşehir/İstanbul',
    workingHours: 'Pzt-Cmt: 09:00 - 18:00',
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get(`${API}/api/settings`);
        const contact = {};
        response.data.forEach(s => {
          if (s.category === 'contact') contact[s.key] = s.value;
        });
        if (Object.keys(contact).length > 0) {
          setContactInfo(prev => ({ ...prev, ...contact }));
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };
    fetchContactInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      await axios.post(`${API}/api/contact`, formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setStatus(''), 5000);
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 sm:pt-32 px-4 sm:px-6 pb-12 sm:pb-20">
      <SEOHead
        title="İletişim"
        description="AES Garage iletişim bilgileri. Adres: Küçükbakkalköy Yolu Cd. No:44/B, Ataşehir/İstanbul. Randevu ve bilgi için bizi arayın. Pazartesi-Cumartesi 09:00-18:00."
        path="/iletisim"
        keywords="AES Garage iletişim, oto servis Ataşehir, araç servis İstanbul, AES Garage adres, AES Garage telefon"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'AutoRepair',
          name: 'AES Garage',
          telephone: '+90-555-123-4567',
          email: 'bilgi@aesgarage.com',
          address: { '@type': 'PostalAddress', streetAddress: 'Küçükbakkalköy Yolu Cd. No:44/B', addressLocality: 'Ataşehir', addressRegion: 'İstanbul', postalCode: '34750', addressCountry: 'TR' },
          openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '09:00', closes: '18:00' }],
          geo: { '@type': 'GeoCoordinates', latitude: 40.9923, longitude: 29.1244 },
          url: 'https://aesgarage.com/iletisim'
        }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight mb-6">İLETİŞİM</h1>
          <p className="text-gray-500 font-light">Bizimle iletişime geçin</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-16 md:mb-20">
          <div className="text-center p-4 sm:p-6 md:p-8 border border-dark-900">
            <div className="text-xs tracking-widest text-gray-500 mb-3">TELEFON</div>
            <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="font-light">{contactInfo.phone}</a>
          </div>
          <div className="text-center p-4 sm:p-6 md:p-8 border border-dark-900">
            <div className="text-xs tracking-widest text-gray-500 mb-3">E-POSTA</div>
            <a href={`mailto:${contactInfo.email}`} className="font-light">{contactInfo.email}</a>
          </div>
          <div className="text-center p-4 sm:p-6 md:p-8 border border-dark-900">
            <div className="text-xs tracking-widest text-gray-500 mb-3">ADRES</div>
            <div className="font-light text-sm">{contactInfo.address}</div>
          </div>
          <div className="text-center p-4 sm:p-6 md:p-8 border border-dark-900">
            <div className="text-xs tracking-widest text-gray-500 mb-3">SAAT</div>
            <div className="font-light">{contactInfo.workingHours}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-light mb-8">MESAJ GÖNDERİN</h2>

            {status === 'success' && (
              <div className="mb-6 p-4 border border-green-600/30 bg-green-600/10">
                <p className="font-light text-green-400">Mesajınız başarıyla gönderildi!</p>
              </div>
            )}
            {status === 'error' && (
              <div className="mb-6 p-4 border border-red-600/30 bg-red-600/10">
                <p className="font-light text-red-400">Mesaj gönderilemedi. Lütfen tekrar deneyin.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-3">AD SOYAD</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full bg-transparent border border-dark-900 px-4 py-3 sm:px-6 sm:py-4 text-white focus:border-white focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-3">E-POSTA</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full bg-transparent border border-dark-900 px-4 py-3 sm:px-6 sm:py-4 text-white focus:border-white focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-3">TELEFON</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                  className="w-full bg-transparent border border-dark-900 px-4 py-3 sm:px-6 sm:py-4 text-white focus:border-white focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-3">KONU</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required
                  className="w-full bg-transparent border border-dark-900 px-4 py-3 sm:px-6 sm:py-4 text-white focus:border-white focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-3">MESAJ</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows="6"
                  className="w-full bg-transparent border border-dark-900 px-4 py-3 sm:px-6 sm:py-4 text-white focus:border-white focus:outline-none resize-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 border border-white hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50">
                <span className="font-light tracking-widest text-sm">{loading ? 'GÖNDERİLİYOR...' : 'GÖNDER'}</span>
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-light mb-8">KONUM</h2>
            <div className="h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-900 border border-dark-900">
              <iframe
                src="https://maps.google.com/maps?q=K%C3%BC%C3%A7%C3%BCkbakkalk%C3%B6y+Yolu+Cd.+No%3A44%2FB%2C+34752+Ata%C5%9Fehir%2F%C4%B0stanbul&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AES Garage Konum"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
