import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('success');
    setTimeout(() => setStatus(''), 3000);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-light tracking-tight mb-6">İLETİŞİM</h1>
          <p className="text-gray-500 font-light">Bizimle iletişime geçin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center p-8 border border-dark-900">
            <div className="text-xs tracking-widest text-gray-500 mb-3">TELEFON</div>
            <a href="tel:+905551234567" className="font-light">+90 555 123 45 67</a>
          </div>
          <div className="text-center p-8 border border-dark-900">
            <div className="text-xs tracking-widest text-gray-500 mb-3">E-POSTA</div>
            <a href="mailto:info@aesgarage.com" className="font-light">info@aesgarage.com</a>
          </div>
          <div className="text-center p-8 border border-dark-900">
            <div className="text-xs tracking-widest text-gray-500 mb-3">ADRES</div>
            <div className="font-light">İstanbul, Türkiye</div>
          </div>
          <div className="text-center p-8 border border-dark-900">
            <div className="text-xs tracking-widest text-gray-500 mb-3">SAAT</div>
            <div className="font-light">Pzt-Cmt: 09:00 - 18:00</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-light mb-8">MESAJ GÖNDERİN</h2>
            
            {status === 'success' && (
              <div className="mb-6 p-4 border border-white/30 bg-white/5">
                <p className="font-light">Mesajınız gönderildi!</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-3">AD SOYAD</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border border-dark-900 px-6 py-4 text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-3">E-POSTA</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border border-dark-900 px-6 py-4 text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-3">TELEFON</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border border-dark-900 px-6 py-4 text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-3">KONU</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border border-dark-900 px-6 py-4 text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-3">MESAJ</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full bg-transparent border border-dark-900 px-6 py-4 text-white focus:border-white focus:outline-none resize-none"
                />
              </div>

              <button type="submit" className="w-full py-4 border border-white hover:bg-white hover:text-black transition-all duration-300">
                <span className="font-light tracking-widest text-sm">GÖNDER</span>
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-light mb-8">KONUM</h2>
            <div className="h-[500px] bg-gray-900 border border-dark-900">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.0748412365837!2d28.97952931542919!3d41.01553397929844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab9bd6570f4e1%3A0xe8e6f0d3c2c6c7a8!2sIstanbul%2C%20Turkey!5e0!3m2!1sen!2str!4v1234567890123"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;