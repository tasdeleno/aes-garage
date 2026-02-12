import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('🔄 Fetching settings...');
        const response = await axios.get('http://localhost:5000/api/settings');
        console.log('📦 All settings:', response.data);

        const serviceMap = {};

        response.data.forEach(setting => {
          console.log('⚙️ Processing:', setting.key, setting.category, setting.value);
          
          if (setting.category === 'images' && setting.key.match(/^service\d+$/)) {
            const serviceNum = setting.key;
            if (!serviceMap[serviceNum]) serviceMap[serviceNum] = {};
            serviceMap[serviceNum].image = setting.value;
          }
          else if (setting.category === 'serviceTitles') {
            const serviceNum = setting.key;
            if (!serviceMap[serviceNum]) serviceMap[serviceNum] = {};
            serviceMap[serviceNum].title = setting.value;
          }
          else if (setting.category === 'serviceDescriptions') {
            const serviceNum = setting.key;
            if (!serviceMap[serviceNum]) serviceMap[serviceNum] = {};
            serviceMap[serviceNum].description = setting.value;
          }
        });

        console.log('🗺️ Service Map:', serviceMap);

        const serviceData = [];
        Object.keys(serviceMap).sort().forEach(key => {
          if (serviceMap[key].title || serviceMap[key].image) {
            serviceData.push({
              key: key,
              title: serviceMap[key].title || 'Servis',
              description: serviceMap[key].description || 'Profesyonel araç bakım hizmeti',
              image: serviceMap[key].image || 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
              features: [
                'Uzman kadro',
                'Orijinal yedek parça',
                'Garanti sertifikası',
                'Hızlı servis',
                'Uygun fiyat'
              ],
              duration: '2-4 saat',
              price: 'Fiyat için iletişime geçin'
            });
          }
        });

        console.log('✅ Final services:', serviceData);

        if (serviceData.length > 0) {
          setServices(serviceData);
        } else {
          console.log('⚠️ No services found, using defaults');
          setServices([
            {
              key: 'service1',
              title: 'Periyodik Bakım',
              description: 'Aracınızın düzenli bakım ihtiyaçlarını karşılayan kapsamlı servis programı',
              image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
              features: ['Motor yağı ve filtre değişimi', 'Fren sistemleri kontrolü', 'Süspansiyon kontrolü', 'Lastik kontrolü ve balans', 'Elektriksel sistem kontrolü'],
              duration: '2-3 saat',
              price: '800₺\'den başlayan fiyatlar'
            },
            {
              key: 'service2',
              title: 'Motor Bakımı',
              description: 'Motorun maksimum performans ve verimlilikte çalışması için uzman bakım',
              image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
              features: ['Motor revizyonu', 'Turbo bakımı', 'Enjeksiyon sistemi temizliği', 'Triger kayışı değişimi', 'Motor performans testi'],
              duration: '4-6 saat',
              price: '1.500₺\'den başlayan fiyatlar'
            },
            {
              key: 'service3',
              title: 'Fren Sistemi',
              description: 'Güvenliğiniz için kritik öneme sahip fren sisteminin profesyonel bakımı',
              image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
              features: ['Fren balatası değişimi', 'Fren diski kontrolü ve değişimi', 'Fren hidroliği yenileme', 'ABS sistemi kontrolü', 'El freni ayarı'],
              duration: '2-3 saat',
              price: '600₺\'den başlayan fiyatlar'
            },
            {
              key: 'service4',
              title: 'Lastik Hizmetleri',
              description: 'Sürüş güvenliği ve konforu için profesyonel lastik bakımı',
              image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
              features: ['Lastik montaj/demontaj', 'Balans ayarı', 'Rot ayarı', 'Lastik tamir', 'Mevsimlik değişim'],
              duration: '1-2 saat',
              price: '200₺\'den başlayan fiyatlar'
            }
          ]);
        }
      } catch (error) {
        console.error('❌ Error:', error);
        setServices([
          {
            key: 'service1',
            title: 'Periyodik Bakım',
            description: 'Aracınızın düzenli bakım ihtiyaçlarını karşılayan kapsamlı servis programı',
            image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
            features: ['Motor yağı ve filtre değişimi', 'Fren sistemleri kontrolü', 'Süspansiyon kontrolü', 'Lastik kontrolü ve balans', 'Elektriksel sistem kontrolü'],
            duration: '2-3 saat',
            price: '800₺\'den başlayan fiyatlar'
          }
        ]);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
            alt="Services"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 border border-white/30">
              <span className="text-xs tracking-[0.3em] font-light">SERVİS HİZMETLERİ</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
            PREMIUM
            <br />
            <span className="text-gray-400">HİZMET ANLAYIŞI</span>
          </h1>
          <p className="text-lg font-light text-gray-300 max-w-2xl mx-auto">
            Aracınız için en üst düzey bakım ve onarım hizmetleri
          </p>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative overflow-hidden bg-gradient-to-b from-dark-900 to-black border border-dark-800 hover:border-red-900 transition-all duration-500"
              >
                <div className="relative h-80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <div className="p-8">
                  <h3 className="text-3xl font-light tracking-wider mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 font-light mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <div className="w-1 h-1 bg-white mt-2 flex-shrink-0"></div>
                        <span className="text-sm font-light text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-6 border-t border-dark-800">
                    <div>
                      <div className="text-xs tracking-widest font-light text-gray-500 mb-1">SÜRE</div>
                      <div className="text-sm font-light">{service.duration}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs tracking-widest font-light text-gray-500 mb-1">FİYAT</div>
                      <div className="text-sm font-light">{service.price}</div>
                    </div>
                  </div>

                  <Link
                    to="/appointment"
                    className="group/btn mt-6 w-full py-4 border border-dark-800 hover:border-red-600 hover:bg-red-600/10 flex items-center justify-center space-x-3 transition-all duration-300"
                  >
                    <span className="text-sm font-light tracking-widest">RANDEVU AL</span>
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

      <section className="py-32 px-6 bg-gradient-to-b from-black via-dark-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-light tracking-tight mb-8">
            ÖZELLEŞTİRİLMİŞ
            <br />
            <span className="text-gray-400">BAKIM PAKETİ</span>
          </h2>
          <p className="text-xl font-light text-gray-400 mb-12 leading-relaxed">
            Aracınızın ihtiyaçlarına özel hazırlanmış bakım paketi için
            <br />
            uzman ekibimizle görüşün
          </p>
          <Link
            to="/appointment"
            className="inline-block group relative overflow-hidden px-16 py-5 border border-red-600"
          >
            <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative text-sm tracking-[0.3em] font-light text-white group-hover:text-white transition-colors duration-500">
              HEMEN İLETİŞİME GEÇİN
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Services;