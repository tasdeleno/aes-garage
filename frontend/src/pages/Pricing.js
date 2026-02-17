import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

function Pricing() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const pricingData = [
    {
      category: 'Periyodik Bakım',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      items: [
        { service: 'Küçük Araç (A-B Segment)', price: '800 - 1.000 ₺', duration: '2 saat' },
        { service: 'Orta Araç (C Segment)', price: '1.000 - 1.300 ₺', duration: '2.5 saat' },
        { service: 'Büyük Araç (D-E Segment)', price: '1.300 - 1.800 ₺', duration: '3 saat' },
        { service: 'SUV / Crossover', price: '1.500 - 2.000 ₺', duration: '3 saat' },
      ]
    },
    {
      category: 'Motor Bakımı',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      items: [
        { service: 'Motor Yağ Değişimi', price: '400 - 800 ₺', duration: '30 dk' },
        { service: 'Triger Kayışı Değişimi', price: '1.500 - 3.500 ₺', duration: '4 saat' },
        { service: 'Motor Revizyonu', price: '3.000 - 8.000 ₺', duration: '2 gün' },
        { service: 'Turbo Bakımı', price: '2.500 - 5.000 ₺', duration: '6 saat' },
        { service: 'Enjeksiyon Temizliği', price: '800 - 1.500 ₺', duration: '2 saat' },
      ]
    },
    {
      category: 'Fren Sistemi',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      items: [
        { service: 'Ön Fren Balatası', price: '600 - 1.200 ₺', duration: '1 saat' },
        { service: 'Arka Fren Balatası', price: '500 - 1.000 ₺', duration: '1 saat' },
        { service: 'Fren Diski Değişimi (Çift)', price: '800 - 1.800 ₺', duration: '1.5 saat' },
        { service: 'Fren Hidroliği Yenileme', price: '300 - 600 ₺', duration: '45 dk' },
        { service: 'ABS Sistemi Bakımı', price: '1.000 - 2.500 ₺', duration: '3 saat' },
      ]
    },
    {
      category: 'Lastik İşlemleri',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
      items: [
        { service: 'Lastik Montaj/Demontaj', price: '40 - 80 ₺/adet', duration: '10 dk' },
        { service: 'Balans', price: '30 - 60 ₺/adet', duration: '10 dk' },
        { service: 'Rot Ayarı (4 Tekerlek)', price: '200 - 400 ₺', duration: '30 dk' },
        { service: 'Lastik Tamir', price: '50 - 150 ₺', duration: '20 dk' },
        { service: 'Azot Dolumu', price: '150 - 300 ₺', duration: '15 dk' },
      ]
    },
    {
      category: 'Elektrik Sistemleri',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      items: [
        { service: 'Akü Değişimi', price: '800 - 2.500 ₺', duration: '20 dk' },
        { service: 'Alternatör Değişimi', price: '1.500 - 3.500 ₺', duration: '2 saat' },
        { service: 'Marş Motoru Değişimi', price: '1.000 - 2.500 ₺', duration: '1.5 saat' },
        { service: 'Far Ampul Değişimi', price: '50 - 200 ₺', duration: '15 dk' },
        { service: 'ECU Yazılım Güncellemesi', price: '500 - 1.500 ₺', duration: '1 saat' },
      ]
    },
    {
      category: 'Klima Sistemi',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      items: [
        { service: 'Klima Gazı Dolumu', price: '400 - 800 ₺', duration: '45 dk' },
        { service: 'Klima Bakımı (Komple)', price: '600 - 1.200 ₺', duration: '1.5 saat' },
        { service: 'Klima Filtresi Değişimi', price: '150 - 400 ₺', duration: '20 dk' },
        { service: 'Kompresör Değişimi', price: '2.500 - 5.000 ₺', duration: '4 saat' },
        { service: 'Kalorifer Radyatörü', price: '1.000 - 2.500 ₺', duration: '3 saat' },
      ]
    },
    {
      category: 'Kaporta & Boya',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      items: [
        { service: 'Lokal Boya (Parça Başı)', price: '1.000 - 2.500 ₺', duration: '1 gün' },
        { service: 'Tam Boya', price: '8.000 - 20.000 ₺', duration: '5 gün' },
        { service: 'Göçük Düzeltme', price: '500 - 2.000 ₺', duration: '3 saat' },
        { service: 'Cam Değişimi', price: '800 - 3.000 ₺', duration: '2 saat' },
        { service: 'Far Parlatma', price: '300 - 600 ₺', duration: '1 saat' },
      ]
    },
    {
      category: 'Diğer Hizmetler',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      items: [
        { service: 'Egzoz Sistemi Değişimi', price: '500 - 2.000 ₺', duration: '2 saat' },
        { service: 'Suspensiyon Onarımı', price: '800 - 2.500 ₺', duration: '3 saat' },
        { service: 'Şanzıman Bakımı', price: '1.500 - 4.000 ₺', duration: '4 saat' },
        { service: 'Diferansiyel Bakımı', price: '1.000 - 3.000 ₺', duration: '3 saat' },
        { service: 'Detaylı İç Temizlik', price: '400 - 800 ₺', duration: '3 saat' },
      ]
    },
  ];

  const categories = ['all', ...pricingData.map(item => item.category)];
  const filteredData = selectedCategory === 'all' 
    ? pricingData 
    : pricingData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Fiyatlar"
        description="AES Garage şeffaf fiyatlandırma. Periyodik bakım, motor bakımı, fren sistemi, lastik servisi, kaporta boya fiyatları. Uygun fiyat, kaliteli hizmet. Tüm fiyatlar KDV dahildir."
        path="/fiyatlar"
        keywords="oto servis fiyatları, periyodik bakım fiyat, motor bakımı fiyat, fren bakımı fiyat, lastik değişimi fiyat, kaporta boya fiyat, Ataşehir oto servis fiyat"
      />
      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80"
            alt="Pricing"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-20 text-center px-6">
          <div className="mb-6">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 border border-white/30">
              <span className="text-xs tracking-[0.3em] font-light">FİYAT LİSTESİ</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-tight mb-6">
            ŞEFFAF
            <br />
            <span className="text-gray-500">FİYATLANDIRMA</span>
          </h1>
          <p className="text-sm sm:text-lg font-light text-gray-400">
            Tüm hizmetlerimiz için detaylı fiyat bilgileri
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-16 sm:top-20 z-20 bg-black/95 backdrop-blur-xl border-b border-dark-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 sm:gap-3 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-3 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-light tracking-wider transition-all duration-300 touch-manipulation ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'border border-dark-900 hover:border-white'
                }`}
              >
                {category === 'all' ? 'TÜMÜ' : category.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {filteredData.map((category, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-dark-950 to-black border border-dark-900 p-4 sm:p-6 md:p-8 group hover:border-gray-600 transition-all duration-500"
              >
                {/* Category Header */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className="text-white group-hover:scale-110 transition-transform duration-500">
                    {category.icon}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-light tracking-wider">
                    {category.category}
                  </h2>
                </div>

                {/* Services List */}
                <div className="space-y-1">
                  {category.items.map((item, i) => (
                    <div
                      key={i}
                      className="group/item py-4 border-b border-dark-900 last:border-b-0 hover:bg-white/5 transition-colors duration-300 px-4 -mx-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-light text-gray-200 group-hover/item:text-white transition-colors">
                          {item.service}
                        </span>
                        <span className="font-light text-white ml-4 whitespace-nowrap">
                          {item.price}
                        </span>
                      </div>
                      <div className="text-xs font-light text-gray-500">
                        Ortalama Süre: {item.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-black via-dark-900 to-black">
        <div className="max-w-4xl mx-auto">
          <div className="border border-dark-900 p-4 sm:p-6 md:p-8">
            <h3 className="text-2xl font-light tracking-wider mb-6">ÖNEMLİ BİLGİLER</h3>
            <div className="space-y-4 text-gray-500 font-light">
              <div className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-white mt-2 flex-shrink-0"></div>
                <p>Tüm fiyatlar KDV dahildir</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-white mt-2 flex-shrink-0"></div>
                <p>Yedek parça bedelleri fiyatlara dahil değildir</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-white mt-2 flex-shrink-0"></div>
                <p>Randevulu müşterilerimize özel indirimler uygulanmaktadır</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-white mt-2 flex-shrink-0"></div>
                <p>Fiyatlar araç modeline ve yılına göre değişiklik gösterebilir</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-white mt-2 flex-shrink-0"></div>
                <p>Detaylı fiyat teklifi için bizimle iletişime geçebilirsiniz</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight mb-8">
            DETAYLI TEKLİF
            <br />
            <span className="text-gray-500">ALIN</span>
          </h2>
          <p className="text-xl font-light text-gray-500 mb-12">
            Aracınıza özel fiyat teklifi için hemen randevu oluşturun
          </p>
          <Link
            to="/randevu"
            className="inline-block group relative overflow-hidden px-8 sm:px-16 py-5 border border-white"
          >
            <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative text-sm tracking-[0.3em] font-light text-white group-hover:text-black transition-colors duration-500">
              RANDEVU OLUŞTUR
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Pricing;