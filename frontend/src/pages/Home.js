import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [settings, setSettings] = useState({
    heroImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80',
    service1: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
    service2: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    service3: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
    service4: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
  });

  const [serviceTitles, setServiceTitles] = useState({
    service1: 'Periyodik Bakım',
    service2: 'Motor Bakımı',
    service3: 'Fren Sistemi',
    service4: 'Lastik Servisi'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/settings');
        const imageSettings = {};
        const titleSettings = {};
        
        response.data.forEach(setting => {
          if (setting.category === 'images') {
            imageSettings[setting.key] = setting.value;
          } else if (setting.category === 'serviceTitles') {
            titleSettings[setting.key] = setting.value;
          }
        });
        
        if (Object.keys(imageSettings).length > 0) {
          setSettings(prev => ({ ...prev, ...imageSettings }));
        }
        if (Object.keys(titleSettings).length > 0) {
          setServiceTitles(prev => ({ ...prev, ...titleSettings }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const services = [
    {
      title: serviceTitles.service1,
      image: settings.service1
    },
    {
      title: serviceTitles.service2,
      image: settings.service2
    },
    {
      title: serviceTitles.service3,
      image: settings.service3
    },
    {
      title: serviceTitles.service4,
      image: settings.service4
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black z-10"></div>
          <img 
            src={settings.heroImage}
            alt="Luxury Car"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto animate-fade-in">
          <div className="mb-8">
            <div className="inline-block px-6 py-3 border border-white/30 backdrop-blur-sm">
              <span className="text-xs tracking-[0.3em] font-light">PREMIUM SERVICE</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-8 leading-tight">
            MÜKEMMELLIK
            <br />
            <span className="text-gray-400">İÇİN TASARLANDI</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-light text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Aracınız için en üst düzey bakım ve servis deneyimi
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/appointment"
              className="group relative overflow-hidden px-12 py-4"
            >
              <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <span className="relative text-sm tracking-[0.2em] font-light text-white transition-colors duration-500">
                RANDEVU AL
              </span>
            </Link>

            <Link
              to="/services"
              className="group px-12 py-4 border border-red-600/50 hover:border-red-600 transition-all duration-500"
            >
              <span className="text-sm tracking-[0.2em] font-light">
                HİZMETLER
              </span>
            </Link>
          </div>

          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4">
            <span className="text-xs tracking-widest font-light text-gray-400">SCROLL</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-red-600 to-transparent"></div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {['UZMANLIK', 'KALİTE', 'GÜVENİLİRLİK'].map((feature, index) => (
              <div key={index} className="group text-center">
                <h3 className="text-2xl font-light tracking-wider mb-4">{feature}</h3>
                <div className="w-16 h-[1px] bg-red-600 mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-gradient-to-b from-black via-dark-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-light tracking-tight mb-6">
              HİZMETLERİMİZ
            </h2>
            <p className="text-gray-400 font-light text-lg">
              Aracınız için kapsamlı çözümler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Link
                key={index}
                to="/services"
                className="group relative h-96 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <h3 className="text-3xl font-light tracking-wider mb-4">
                    {service.title}
                  </h3>
                  <div className="w-12 h-[1px] bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-light tracking-tight mb-8">
            HAZIR MISINIZ?
          </h2>
          <p className="text-xl font-light text-gray-400 mb-12">
            Aracınız için en iyi bakımı almanın zamanı geldi
          </p>
          <Link
            to="/appointment"
            className="inline-block group relative overflow-hidden px-16 py-5 border border-red-600"
          >
            <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative text-sm tracking-[0.3em] font-light text-white transition-colors duration-500">
              RANDEVU ALIN
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;