import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SEOHead from '../components/SEOHead';

const API = process.env.REACT_APP_API_URL || '';

function Services() {
  const [instagramUrl, setInstagramUrl] = useState('');

  const defaultServices = [
    {
      title: 'Periyodik Bakım',
      description: 'Aracınızın düzenli bakım ihtiyaçlarını karşılayan kapsamlı servis programı',
      image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
      features: 'Motor yağı ve filtre değişimi\nFren sistemleri kontrolü\nSüspansiyon kontrolü\nLastik kontrolü ve balans\nElektriksel sistem kontrolü',
      duration: '2-3 saat',
      priceMin: '800', priceMax: '2.000', priceNote: 'Araç segmentine göre değişir',
    },
    {
      title: 'Motor Bakımı',
      description: 'Motorun maksimum performans ve verimlilikte çalışması için uzman bakım',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
      features: 'Motor revizyonu\nTurbo bakımı\nEnjeksiyon sistemi temizliği\nTriger kayışı değişimi\nMotor performans testi',
      duration: '4-6 saat',
      priceMin: '1.500', priceMax: '8.000', priceNote: 'İşlem kapsamına göre değişir',
    },
    {
      title: 'Fren Bakımı',
      description: 'Güvenliğiniz için kritik öneme sahip fren sisteminin profesyonel bakımı',
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
      features: 'Fren balatası değişimi\nFren diski kontrolü ve değişimi\nFren hidroliği yenileme\nABS sistemi kontrolü\nEl freni ayarı',
      duration: '2-3 saat',
      priceMin: '500', priceMax: '2.500', priceNote: 'Parça durumuna göre değişir',
    },
    {
      title: 'Lastik Değişimi',
      description: 'Sürüş güvenliği ve konforu için profesyonel lastik bakımı',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      features: 'Lastik montaj/demontaj\nBalans ayarı\nRot ayarı\nLastik tamir\nMevsimlik değişim',
      duration: '1-2 saat',
      priceMin: '200', priceMax: '400', priceNote: 'Lastik bedeli hariç',
    },
  ];

  const [services, setServices] = useState(defaultServices);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/api/settings`);
        const general = {};

        response.data.forEach(setting => {
          if (setting.category === 'general') {
            general[setting.key] = setting.value;
          }
          if (setting.key === 'instagramUrl' && setting.category === 'contact') {
            setInstagramUrl(setting.value);
          }
        });

        // servicesList JSON'dan parse et
        try {
          if (general.servicesList) {
            const parsed = JSON.parse(general.servicesList);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Boş title olanları filtrele, image yoksa varsayılan ekle
              const valid = parsed
                .filter(s => s && s.title && s.title.trim())
                .map(s => ({
                  ...s,
                  image: s.image || 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80'
                }));
              if (valid.length > 0) setServices(valid);
            }
          }
        } catch(e) {
          console.error('servicesList parse error:', e);
        }
      } catch (error) {
        console.error('Servisler yüklenemedi:', error);
      }
    };

    fetchServices();
  }, []);

  // features string'ini array'e çevir
  const getFeatures = (service) => {
    if (Array.isArray(service.features)) return service.features;
    if (typeof service.features === 'string' && service.features.trim()) {
      return service.features.split('\n').filter(f => f.trim());
    }
    return ['Uzman kadro', 'Orijinal yedek parça', 'Garanti sertifikası'];
  };

  // Fiyat gösterimi
  const getPriceDisplay = (service) => {
    if (service.priceMin && service.priceMax) {
      return `${service.priceMin} - ${service.priceMax} ₺`;
    }
    if (service.price) return service.price;
    return 'Fiyat için iletişime geçin';
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'AES Garage',
    url: 'https://aesgarage.com/services',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Araç Bakım Hizmetleri',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Periyodik Bakım', description: 'Motor yağı, filtre değişimi ve genel kontrol' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Motor Bakımı', description: 'Motor revizyonu, kayış değişimi, soğutma sistemi' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Fren Sistemi', description: 'Fren balatası, disk, hidrolik ve ABS bakımı' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Lastik Servisi', description: 'Lastik değişimi, balans, rot ayarı' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Elektrik & Elektronik', description: 'Akü, alternatör, starter ve araç elektriği' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Klima Bakımı', description: 'Klima gazı dolumu ve sistem bakımı' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Kaporta & Boya', description: 'Lokal boya, tam boya, göçük düzeltme ve far parlatma' } },
      ]
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Hizmetlerimiz"
        description="AES Garage hizmetleri - Periyodik bakım, motor bakımı, fren sistemi, lastik servisi, elektrik-elektronik, klima bakımı ve kaporta boya. Orijinal yedek parça garantisi ile profesyonel araç bakım."
        path="/services"
        keywords="araç bakım hizmetleri, periyodik bakım, motor bakımı, fren bakımı, lastik değişimi, klima bakımı, kaporta boya, oto elektrik, Ataşehir oto servis"
        schema={serviceSchema}
      />
      <section className="relative h-[50vh] sm:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80"
            alt="Services"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 border border-white/30">
              <span className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] font-light">SERVİS HİZMETLERİ</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-tight mb-4 sm:mb-6">
            PREMIUM
            <br />
            <span className="text-gray-400">HİZMET ANLAYIŞI</span>
          </h1>
          <p className="text-sm sm:text-lg font-light text-gray-300 max-w-2xl mx-auto px-2">
            Aracınız için en üst düzey bakım ve onarım hizmetleri
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative overflow-hidden bg-gradient-to-b from-dark-900 to-black border border-dark-800 hover:border-red-900 transition-all duration-500"
              >
                <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
                  {(service.instagramLink || instagramUrl) && (
                    <a
                      href={service.instagramLink || instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/20 hover:border-pink-500 hover:bg-pink-600/20 transition-all duration-300 group/ig"
                    >
                      <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                      <span className="text-[10px] sm:text-xs font-light tracking-wider text-white">İnstagramda Gör</span>
                    </a>
                  )}
                  <img
                    src={service.image || 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80'}
                    alt={service.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-light tracking-wider mb-3 sm:mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 font-light mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    {service.description}
                  </p>

                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {getFeatures(service).map((feature, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <div className="w-1 h-1 bg-white mt-2 flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm font-light text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-dark-800">
                    <div>
                      <div className="text-[10px] sm:text-xs tracking-widest font-light text-gray-500 mb-1">SÜRE</div>
                      <div className="text-xs sm:text-sm font-light">{service.duration || '2-4 saat'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] sm:text-xs tracking-widest font-light text-gray-500 mb-1">FİYAT</div>
                      <div className="text-xs sm:text-sm font-light">{getPriceDisplay(service)}</div>
                    </div>
                  </div>
                  {service.priceNote && (
                    <p className="text-[10px] sm:text-xs text-gray-600 font-light mt-2">{service.priceNote}</p>
                  )}

                  <Link
                    to="/appointment"
                    className="group/btn mt-4 sm:mt-6 w-full py-3 sm:py-4 border border-dark-800 hover:border-red-600 hover:bg-red-600/10 flex items-center justify-center space-x-3 transition-all duration-300 active:scale-[0.98] touch-manipulation"
                  >
                    <span className="text-xs sm:text-sm font-light tracking-widest">RANDEVU AL</span>
                    <svg className="w-4 h-4 transform group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-black via-dark-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight mb-6 sm:mb-8">
            ÖZELLEŞTİRİLMİŞ
            <br />
            <span className="text-gray-400">BAKIM PAKETİ</span>
          </h2>
          <p className="text-sm sm:text-lg md:text-xl font-light text-gray-400 mb-8 sm:mb-12 leading-relaxed px-2">
            Aracınızın ihtiyaçlarına özel hazırlanmış bakım paketi için
            <br className="hidden sm:block" />
            uzman ekibimizle görüşün
          </p>
          <Link
            to="/appointment"
            className="inline-block group relative overflow-hidden px-8 sm:px-16 py-4 sm:py-5 border border-red-600"
          >
            <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] font-light text-white">
              HEMEN İLETİŞİME GEÇİN
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Services;