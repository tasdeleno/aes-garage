import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

// ─── Hooks ───
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

function useStaggerReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const children = container.querySelectorAll('.stagger-item');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            setTimeout(() => child.classList.add('revealed'), i * 120);
          });
          observer.unobserve(container);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); observer.unobserve(el); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const num = parseInt(target.replace(/[^0-9]/g, '')) || 0;
    const increment = num / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  const suffix = target.replace(/[0-9]/g, '');
  return { ref, display: started ? `${count.toLocaleString('tr-TR')}${suffix}` : '0' };
}

function About() {
  const stats = [
    { target: '10+', label: 'Yıllık Deneyim' },
    { target: '5000+', label: 'Mutlu Müşteri' },
    { target: '8', label: 'Uzman Teknisyen' },
    { target: '15000+', label: 'Tamamlanan İşlem' },
  ];

  const team = [
    { name: 'Ahmet Yılmaz', role: 'Kurucu / Usta Teknisyen', exp: '15 yıl deneyim' },
    { name: 'Emre Kaya', role: 'Motor Uzmanı', exp: '12 yıl deneyim' },
    { name: 'Serkan Demir', role: 'Elektrik Sistemleri', exp: '10 yıl deneyim' },
    { name: 'Murat Özkan', role: 'Kaporta & Boya', exp: '8 yıl deneyim' },
  ];

  const values = [
    { title: 'GÜVEN', description: 'Müşterilerimize her zaman dürüst ve şeffaf yaklaşım sergileriz. Yapılacak işlemleri önceden anlatır, onay alırız.' },
    { title: 'KALİTE', description: 'Orijinal ve yüksek kaliteli yedek parçalar kullanır, her işlemde en yüksek standartları hedefleriz.' },
    { title: 'UZMANLIK', description: 'Sürekli eğitim alan ekibimiz, en son teknolojiler ve tekniklerle aracınıza en iyi hizmeti sunar.' },
    { title: 'MÜŞTERİ MEMNUNİYETİ', description: 'İşimizin merkezinde müşteri memnuniyeti vardır. Her müşterimiz bizim için özeldir.' },
  ];

  // Sayaç hook'ları
  const stat1 = useCountUp('10+');
  const stat2 = useCountUp('5000+');
  const stat3 = useCountUp('8');
  const stat4 = useCountUp('15000+');
  const statDisplays = [stat1, stat2, stat3, stat4];

  // Reveal refs
  const storyRef = useReveal();
  const valuesRef = useStaggerReveal();
  const teamRef = useStaggerReveal();
  const ctaRef = useReveal();

  // Parallax
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;
    const onScroll = () => setOffset(window.pageYOffset * 0.3);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Hakkımızda"
        description="AES Garage - 15+ yıllık tecrübe ile İstanbul Ataşehir'de profesyonel araç bakım ve servis. Uzman kadro, orijinal yedek parça, müşteriye özel çözümler. Güvenilir oto servis."
        path="/about"
        keywords="AES Garage hakkında, oto servis Ataşehir, güvenilir araç servisi, uzman oto tamirci, İstanbul araç bakım"
      />
      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ transform: `translateY(${offset}px)` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black z-10"></div>
          <img src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=80" alt="About" className="w-full h-full object-cover scale-110" loading="lazy" decoding="async" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-3xl animate-pulse-slow z-10"></div>
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto animate-fade-in">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 border border-white/20 backdrop-blur-sm">
              <span className="text-xs tracking-[0.3em] font-light">HAKKIMIZDA</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-tight mb-6">
            <span className="text-gradient">TUTKU İLE</span>
            <br />
            <span className="text-gray-500">ÇALIŞIYORUZ</span>
          </h1>
          <p className="text-base sm:text-lg font-light text-gray-400 max-w-2xl mx-auto">
            Yılların deneyimiyle, aracınıza en iyi bakımı sunmak için buradayız
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, index) => (
              <div key={index} ref={statDisplays[index].ref} className="text-center p-4 sm:p-6 md:p-8 border border-dark-800/50 group hover:border-red-900/40 transition-all duration-500 card-lift">
                <div className="text-2xl sm:text-3xl md:text-5xl font-light text-white mb-2 counter-value">{statDisplays[index].display}</div>
                <div className="text-[8px] sm:text-[10px] tracking-[0.2em] font-light text-gray-600 uppercase">{stat.label}</div>
                <div className="w-8 h-[1px] bg-red-600/40 mx-auto mt-4 group-hover:w-16 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-black via-dark-950 to-black relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div ref={storyRef} className="reveal max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <span className="text-[10px] tracking-[0.4em] text-red-600/60 font-light block mb-4">BİZ KİMİZ</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight">HİKAYEMİZ</h2>
          </div>
          <div className="space-y-6 text-gray-500 font-light leading-relaxed text-center text-sm sm:text-base">
            <p>
              AES Garage, araçlara olan tutkumuzla yola çıktığımız bir hayalin somut halidir.
              Yıllar içinde edindiğimiz deneyim ve bilgiyi, en son teknolojiyle birleştirerek
              müşterilerimize kusursuz bir servis deneyimi sunuyoruz.
            </p>
            <p>
              Her aracın kendine özel ihtiyaçları olduğuna inanıyoruz. Bu nedenle, standart
              bir yaklaşım yerine, her müşterimize özel çözümler üretiyoruz. Amacımız sadece
              aracınızı tamir etmek değil, güveninizi kazanmak ve uzun vadeli bir ilişki kurmaktır.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <span className="text-[10px] tracking-[0.4em] text-red-600/60 font-light block mb-4">DEĞERLERİMİZ</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight">İLKELERİMİZ</h2>
          </div>
          <div ref={valuesRef} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {values.map((value, index) => (
              <div key={index} className="stagger-item reveal relative p-4 sm:p-6 md:p-8 border border-dark-800/50 group hover:border-red-900/30 transition-all duration-500 card-lift corner-accent">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-[10px] text-red-600/50 font-light">0{index + 1}</span>
                  <h3 className="text-lg font-light tracking-wider text-white">{value.title}</h3>
                </div>
                <p className="text-gray-500 font-light leading-relaxed text-sm pl-8">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-black via-dark-950 to-black relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <span className="text-[10px] tracking-[0.4em] text-red-600/60 font-light block mb-4">KADRO</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight">EKİBİMİZ</h2>
          </div>
          <div ref={teamRef} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {team.map((member, index) => (
              <div key={index} className="stagger-item reveal text-center p-4 sm:p-6 md:p-8 border border-dark-800/50 group hover:border-red-900/30 transition-all duration-500 card-lift">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-dark-900 border border-dark-800 group-hover:border-red-600/30 flex items-center justify-center transition-colors duration-500">
                  <span className="text-2xl font-light text-gray-600 group-hover:text-red-600/60 transition-colors">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-lg font-light text-white mb-1">{member.name}</h3>
                <p className="text-sm text-red-600/60 font-light mb-2">{member.role}</p>
                <p className="text-xs text-gray-600 font-light">{member.exp}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-red-600/5 rounded-full blur-3xl"></div>
        <div ref={ctaRef} className="reveal max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-8 text-gradient">
            BİZİ TANIYIN
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-light text-gray-500 mb-12">
            Aracınız için en iyi bakımı sunmak üzere hazırız
          </p>
          <Link to="/appointment" className="touch-manipulation inline-block group relative overflow-hidden px-8 sm:px-16 py-5 border border-red-600 btn-glow">
            <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative text-xs sm:text-sm tracking-[0.3em] font-light text-white">RANDEVU ALIN</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;
