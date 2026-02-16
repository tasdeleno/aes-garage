import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SEOHead from '../components/SEOHead';

const API = process.env.REACT_APP_API_URL || '';

// ─── Scroll Reveal Hook ───
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Mobile cihazlarda prefersReducedMotion kontrolü
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('revealed');
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); observer.unobserve(el); } },
      { threshold, rootMargin: '50px 0px' }
    );
    observer.observe(el);
    // Fallback: 3 saniye sonra hâlâ görünür olmadıysa zorla göster
    const fallback = setTimeout(() => {
      if (el && !el.classList.contains('revealed')) {
        el.classList.add('revealed');
      }
    }, 3000);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [threshold]);
  return ref;
}

// ─── Sayaç Animasyonu Hook ───
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); observer.unobserve(el); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const num = parseInt(target.replace(/[^0-9]/g, '')) || 0;
    // requestAnimationFrame ile daha verimli animasyon
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * num));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration]);

  const suffix = target.replace(/[0-9]/g, '');
  return { ref, display: started ? `${count.toLocaleString('tr-TR')}${suffix}` : '0' };
}

// ─── Parallax Hero Hook (disabled on mobile for performance) ───
function useParallax() {
  const [offset, setOffset] = useState(0);
  const isMobile = useRef(false);
  useEffect(() => {
    isMobile.current = window.innerWidth < 768;
    if (isMobile.current) return; // Mobilde parallax kapalı
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setOffset(window.pageYOffset * 0.3);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return offset;
}

// ─── Stagger Reveal Hook (birden çok element) ───
function useStaggerReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      container.querySelectorAll('.stagger-item').forEach(c => c.classList.add('revealed'));
      return;
    }
    let revealed = false;
    const revealAll = () => {
      if (revealed) return;
      revealed = true;
      const children = container.querySelectorAll('.stagger-item');
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('revealed'), i * 100);
      });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealAll();
          observer.unobserve(container);
        }
      },
      { threshold: 0.01, rootMargin: '100px 0px' }
    );
    observer.observe(container);
    // Fallback: 3 saniye sonra hâlâ görünür olmadıysa zorla göster
    const fallback = setTimeout(() => {
      revealAll();
      // Observer'ı da temizle
      if (container) observer.unobserve(container);
    }, 3000);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);
  return ref;
}

// ─── Lazy Image Component ───
const LazyImage = memo(function LazyImage({ src, alt, className, ...props }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.unobserve(el); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative w-full h-full">
      {!loaded && <div className="absolute inset-0 bg-dark-900 animate-pulse" />}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
});

// ─── Star Rating Component ───
const StarRating = memo(function StarRating({ rating }) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= rating ? 'text-yellow-500' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
});

function Home() {
  const [heroImage, setHeroImage] = useState('');
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState('');

  const defaultServices = [
    { title: 'Periyodik Bakım', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80' },
    { title: 'Motor Bakımı', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80' },
    { title: 'Fren Sistemi', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80' },
    { title: 'Lastik Servisi', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  ];
  const [servicesList, setServicesList] = useState(defaultServices);

  const [openFaq, setOpenFaq] = useState(null);

  const [heroContent, setHeroContent] = useState({
    badge: 'AES GARAGE',
    titleLine1: 'MÜKEMMELLİK',
    titleLine2: 'İÇİN TASARLANDI',
    subtitle: 'Aracınız için en üst düzey bakım ve servis deneyimi',
  });

  const [sectionServices, setSectionServices] = useState({
    title: 'HİZMETLERİMİZ',
    subtitle: 'Aracınız için kapsamlı çözümler',
  });

  const [reviewsMeta, setReviewsMeta] = useState({ score: '4.9', count: '120' });

  const [reviews, setReviews] = useState([
    { name: 'Mehmet K.', rating: '5', text: 'Aracımın periyodik bakımını yaptırdım. Hem fiyat hem de hizmet kalitesi mükemmeldi. Kesinlikle tavsiye ederim.', date: '2 hafta önce' },
    { name: 'Ayşe T.', rating: '5', text: 'Fren sorunu yaşıyordum, aynı gün çözdüler. Çok ilgili ve güler yüzlü bir ekip. Teşekkürler AES Garage!', date: '1 ay önce' },
    { name: 'Hasan D.', rating: '5', text: 'Motor bakımı için geldim, detaylı bir şekilde bilgilendirildim. Yapılan işlemlerin hepsini anlattılar. Güvenilir bir yer.', date: '1 ay önce' },
    { name: 'Fatma S.', rating: '4', text: 'Klima bakımı yaptırdım, gayet memnun kaldım. Fiyatlar piyasaya göre uygun. Tekrar geleceğim.', date: '2 ay önce' },
    { name: 'Ali R.', rating: '5', text: 'Kaporta boyada harika iş çıkardılar. Aracım sıfır gibi oldu. Emeği geçen herkese teşekkürler.', date: '3 ay önce' },
    { name: 'Zeynep M.', rating: '5', text: 'Lastik değişimi ve rot balans yaptırdım. Hızlı ve kaliteli hizmet. Fiyat konusunda da çok dürüstler.', date: '3 ay önce' },
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
    'Bosch Car Service', 'Castrol', 'Michelin', 'Brembo',
    'Mann Filter', 'NGK', 'Continental', 'Denso',
  ]);

  const [faqItems, setFaqItems] = useState([
    { question: 'Randevu almadan gelebilir miyim?', answer: 'Evet, randevusuz da gelebilirsiniz. Ancak randevulu müşterilerimize öncelik verilmektedir. Bekleme süresini minimuma indirmek için randevu almanızı öneririz.' },
    { question: 'Garanti kapsamındaki araçlara hizmet veriyor musunuz?', answer: 'Evet, garanti kapsamındaki araçlara da hizmet vermekteyiz. Orijinal yedek parça kullanarak garantinizi koruyoruz.' },
    { question: 'Yedek parça orijinal mi kullanıyorsunuz?', answer: 'Evet, tüm işlemlerimizde orijinal veya OEM onaylı yedek parçalar kullanmaktayız. Müşteri talebi doğrultusunda muadil parça da kullanılabilir.' },
    { question: 'Servis süresi ne kadar?', answer: 'Servis süresi yapılacak işleme göre değişmektedir. Periyodik bakım 2-3 saat, motor bakımı 4-6 saat, kaporta işlemleri 1-5 gün sürebilir. Detaylı bilgi için bizi arayabilirsiniz.' },
    { question: 'Ödeme seçenekleriniz neler?', answer: 'Nakit, kredi kartı ve banka kartı ile ödeme kabul etmekteyiz. Ayrıca taksit seçenekleri de mevcuttur.' },
    { question: 'Aracım servisteyken beni bilgilendirir misiniz?', answer: 'Evet, işlem süresince sizi bilgilendiriyoruz. Ek bir arıza tespit edildiğinde onayınız alınmadan hiçbir işlem yapılmaz.' },
  ]);

  const [ctaContent, setCtaContent] = useState({
    title: 'HAZIR MISINIZ?',
    subtitle: 'Aracınız için en iyi bakımı almanın zamanı geldi',
  });

  // Parallax
  const parallaxOffset = useParallax();

  // Reveal refs
  const featuresRef = useStaggerReveal();
  const servicesHeaderRef = useReveal();
  const servicesGridRef = useStaggerReveal();
  const reviewsHeaderRef = useReveal();
  const reviewsGridRef = useStaggerReveal();
  const refsHeaderRef = useReveal();
  const refsGridRef = useStaggerReveal();
  const partnersHeaderRef = useReveal();
  const partnersGridRef = useStaggerReveal();
  const faqHeaderRef = useReveal();
  const ctaRef = useReveal();

  // Sayaç animasyonları
  const stat1 = useCountUp('10+');
  const stat2 = useCountUp('5000+');
  const stat3 = useCountUp('8');
  const stat4 = useCountUp('15000+');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/api/settings`);
        const imageSettings = {};
        const homeContent = {};
        const general = {};

        response.data.forEach(setting => {
          if (setting.category === 'images') {
            imageSettings[setting.key] = setting.value;
          } else if (setting.category === 'homeContent') {
            homeContent[setting.key] = setting.value;
          } else if (setting.category === 'general') {
            general[setting.key] = setting.value;
          }
          if (setting.key === 'instagramUrl' && setting.category === 'contact') {
            setInstagramUrl(setting.value);
          }
        });

        if (imageSettings.heroImage) {
          setHeroImage(imageSettings.heroImage);
        } else {
          setHeroImage('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80');
        }
        setHeroLoaded(true);

        let servicesLoaded = false;
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
              if (valid.length > 0) {
                setServicesList(valid);
                servicesLoaded = true;
              }
            }
          }
        } catch(e) {
          console.error('servicesList parse error:', e);
        }
        if (!servicesLoaded) setServicesList(defaultServices);

        try { if (homeContent.heroContent) setHeroContent(JSON.parse(homeContent.heroContent)); } catch(e) {}
        try { if (homeContent.sectionServices) setSectionServices(JSON.parse(homeContent.sectionServices)); } catch(e) {}
        try { if (homeContent.reviewsMeta) setReviewsMeta(JSON.parse(homeContent.reviewsMeta)); } catch(e) {}
        try { if (homeContent.reviews) setReviews(JSON.parse(homeContent.reviews)); } catch(e) {}
        try { if (homeContent.references) setReferences(JSON.parse(homeContent.references)); } catch(e) {}
        try { if (homeContent.partners) setPartners(JSON.parse(homeContent.partners)); } catch(e) {}
        try { if (homeContent.faqItems) setFaqItems(JSON.parse(homeContent.faqItems)); } catch(e) {}
        try { if (homeContent.ctaContent) setCtaContent(JSON.parse(homeContent.ctaContent)); } catch(e) {}
      } catch (error) {
        console.error('Error fetching settings:', error);
        setServicesList(defaultServices);
        if (!heroImage) setHeroImage('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80');
        setHeroLoaded(true);
      }
    };

    fetchSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // FAQ toggle - useCallback ile optimize
  const toggleFaq = useCallback((index) => {
    setOpenFaq(prev => prev === index ? null : index);
  }, []);

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'AES Garage',
    description: 'İstanbul Ataşehir\'de premium araç bakım ve servis merkezi. Periyodik bakım, motor bakımı, fren sistemi, lastik değişimi.',
    url: 'https://aesgarage.com',
    telephone: '+90-555-123-4567',
    email: 'bilgi@aesgarage.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Küçükbakkalköy Yolu Cd. No:44/B',
      addressLocality: 'Ataşehir',
      addressRegion: 'İstanbul',
      postalCode: '34752',
      addressCountry: 'TR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.9923,
      longitude: 29.1244
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '09:00', closes: '18:00' }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: reviewsMeta.score,
      reviewCount: reviewsMeta.count,
      bestRating: '5'
    },
    priceRange: '$$',
    image: 'https://aesgarage.com/logo192.png',
    sameAs: []
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };

  return (
    <div className="min-h-screen bg-black text-white grain-overlay">
      <SEOHead
        title="Premium Araç Bakım & Servis"
        description="AES Garage - İstanbul Ataşehir'de premium araç bakım ve servis merkezi. Periyodik bakım, motor bakımı, fren sistemi, lastik değişimi, kaporta boya ve daha fazlası. Uzman kadro, orijinal yedek parça garantisi."
        path="/"
        keywords="oto servis, araç bakım, İstanbul, Ataşehir, periyodik bakım, motor bakımı, fren bakımı, lastik değişimi, kaporta boya, AES Garage, oto tamir, araç servis, oto elektrik, klima bakımı"
        schema={[localBusinessSchema, faqSchema]}
      />

      {/* ═══ HERO ═══ */}
      <section className="relative h-[100svh] flex items-center justify-center overflow-hidden">
        {/* Parallax Background - mobilde parallax kapalı */}
        <div className="absolute inset-0 will-change-transform" style={{ transform: `translateY(${parallaxOffset}px)` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black z-10"></div>
          {heroImage && (
            <img
              src={heroImage}
              alt="Luxury Car"
              className={`w-full h-full object-cover scale-110 transition-opacity duration-700 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="eager"
              fetchPriority="high"
            />
          )}
        </div>

        {/* Ambient glow - mobile'da küçültülmüş */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-red-600/5 rounded-full blur-3xl animate-pulse-slow z-10"></div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-5xl mx-auto animate-fade-in">
          <div className="mb-6 md:mb-8">
            <div className="inline-block px-4 py-2 md:px-6 md:py-3 border border-white/20 backdrop-blur-sm">
              <span className="text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] font-light">{heroContent.badge}</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6 md:mb-8 leading-tight">
            <span className="text-gradient">{heroContent.titleLine1}</span>
            <br />
            <span className="text-gray-500">{heroContent.titleLine2}</span>
          </h1>

          <p className="text-base sm:text-lg md:text-2xl font-light text-gray-400 mb-8 md:mb-14 max-w-3xl mx-auto leading-relaxed px-2">
            {heroContent.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link to="/appointment" className="group relative overflow-hidden px-8 sm:px-12 py-3.5 sm:py-4 border border-red-600 btn-glow w-full sm:w-auto text-center">
              <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <span className="relative text-sm tracking-[0.2em] font-light text-white">RANDEVU AL</span>
            </Link>

            <Link to="/services" className="group px-8 sm:px-12 py-3.5 sm:py-4 border border-white/20 hover:border-white/50 transition-all duration-500 w-full sm:w-auto text-center">
              <span className="text-sm tracking-[0.2em] font-light text-gray-300 group-hover:text-white transition-colors">HİZMETLER</span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator - mobile'da gizli */}
        <div className="absolute bottom-8 left-0 right-0 z-20 hidden sm:block">
          <div className="flex flex-col items-center gap-3 animate-scroll-down">
            <span className="text-[10px] tracking-[0.3em] font-light text-gray-600">AŞAĞI KAYDIR</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-red-600/60 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* ═══ İSTATİSTİKLER ═══ */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[
              { ...stat1, label: 'Yıllık Deneyim' },
              { ...stat2, label: 'Mutlu Müşteri' },
              { ...stat3, label: 'Uzman Teknisyen' },
              { ...stat4, label: 'Tamamlanan İşlem' },
            ].map((stat, i) => (
              <div key={i} ref={stat.ref} className="text-center p-4 sm:p-6 md:p-8 border border-dark-800/50 hover:border-red-900/40 transition-all duration-500 card-lift group">
                <div className="text-2xl sm:text-3xl md:text-5xl font-light text-white mb-2 md:mb-3 counter-value">
                  {stat.display}
                </div>
                <div className="text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] font-light text-gray-600 uppercase">{stat.label}</div>
                <div className="w-6 sm:w-8 h-[1px] bg-red-600/40 mx-auto mt-3 md:mt-4 group-hover:w-12 md:group-hover:w-16 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ÖZELLİKLER ═══ */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto" ref={featuresRef}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 md:gap-16">
            {[
              { title: 'UZMANLIK', desc: 'Yılların deneyimiyle aracınıza en doğru teşhis ve çözüm' },
              { title: 'KALİTE', desc: 'Orijinal yedek parça ve son teknoloji ekipmanlar' },
              { title: 'GÜVENİLİRLİK', desc: 'Şeffaf fiyatlandırma ve garanti sertifikası' },
            ].map((feature, index) => (
              <div key={index} className="stagger-item reveal group text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 border border-dark-800 rounded-full flex items-center justify-center group-hover:border-red-600/50 transition-colors duration-500">
                  <span className="text-base md:text-lg font-light text-red-600/80">0{index + 1}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-light tracking-wider mb-3 md:mb-4">{feature.title}</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed max-w-xs mx-auto">{feature.desc}</p>
                <div className="w-12 h-[1px] bg-red-600 mx-auto mt-4 md:mt-6 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HİZMETLER ═══ */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-black via-dark-950 to-black relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div className="max-w-7xl mx-auto">
          <div ref={servicesHeaderRef} className="reveal text-center mb-8 sm:mb-10 md:mb-14">
            <span className="text-[10px] tracking-[0.4em] text-red-600/60 font-light block mb-3 md:mb-4">SERVİS</span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight mb-4 md:mb-6">{sectionServices.title}</h2>
            <p className="text-gray-500 font-light text-base md:text-lg">{sectionServices.subtitle}</p>
          </div>

          <div ref={servicesGridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {servicesList.map((service, index) => (
              <div key={index} className="stagger-item reveal group relative h-64 sm:h-80 md:h-96 overflow-hidden img-zoom corner-accent glow-hover">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
                {(service.instagramLink || instagramUrl) && (
                  <a
                    href={service.instagramLink || instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/20 hover:border-pink-500 hover:bg-pink-600/20 transition-all duration-300"
                  >
                    <svg className="w-3.5 h-3.5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    <span className="text-[10px] font-light tracking-wider text-white">İnstagramda Gör</span>
                  </a>
                )}
                <Link to="/services" className="absolute inset-0 z-10">
                  <LazyImage
                    src={service.image || 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80'}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8 z-20 pointer-events-none">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-light tracking-wider mb-2 md:mb-3">{service.title}</h3>
                  {service.priceMin && service.priceMax && (
                    <p className="text-xs sm:text-sm font-light text-gray-500 mb-2 md:mb-3">{service.priceMin} - {service.priceMax} ₺</p>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-[1px] bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    <span className="text-[10px] tracking-[0.2em] text-gray-500 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500">DETAY</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MÜŞTERİ YORUMLARI ═══ */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div className="max-w-7xl mx-auto">
          <div ref={reviewsHeaderRef} className="reveal text-center mb-10 md:mb-16">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4 md:mb-6">
              <svg className="w-5 h-5 sm:w-7 sm:h-7" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight">MÜŞTERİ YORUMLARI</h2>
            </div>
            <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-3 md:mb-4">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
              <span className="text-gray-400 font-light text-sm ml-2">{reviewsMeta.score} / 5.0</span>
            </div>
            <p className="text-gray-600 font-light text-xs sm:text-sm">Google'da {reviewsMeta.count}+ yorum</p>
          </div>

          <div ref={reviewsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reviews.map((review, index) => {
              const rating = parseInt(review.rating) || 5;
              return (
                <div key={index} className="stagger-item reveal p-4 sm:p-6 border border-dark-800/50 hover:border-red-900/30 transition-all duration-500 shimmer-border card-lift">
                  <StarRating rating={rating} />
                  <p className="text-gray-400 font-light text-sm leading-relaxed my-4 sm:mb-5">"{review.text}"</p>
                  <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-dark-800/50">
                    <span className="text-white font-light text-sm">{review.name}</span>
                    <span className="text-gray-700 font-light text-xs">{review.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ YAPILAN İŞLEMLER ═══ */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-black via-dark-950 to-black relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div className="max-w-7xl mx-auto">
          <div ref={refsHeaderRef} className="reveal text-center mb-10 md:mb-16">
            <span className="text-[10px] tracking-[0.4em] text-red-600/60 font-light block mb-3 md:mb-4">REFERANSLAR</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight mb-4 md:mb-6">YAPILAN İŞLEMLER</h2>
            <p className="text-gray-600 font-light text-sm">Başarıyla tamamladığımız bazı işlemler</p>
          </div>

          <div ref={refsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {references.map((ref, index) => (
              <div key={index} className="stagger-item reveal relative p-4 sm:p-6 border border-dark-800/50 hover:border-red-900/30 transition-all duration-500 shimmer-border card-lift group">
                <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 group-hover:animate-pulse"></div>
                  <h3 className="text-white font-light tracking-wider text-xs sm:text-sm">{ref.title}</h3>
                </div>
                <p className="text-gray-600 font-light text-xs sm:text-sm pl-5">{ref.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ İŞ BİRLİKLERİ ═══ */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div className="max-w-7xl mx-auto">
          <div ref={partnersHeaderRef} className="reveal text-center mb-10 md:mb-16">
            <span className="text-[10px] tracking-[0.4em] text-red-600/60 font-light block mb-3 md:mb-4">MARKALAR</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight mb-4 md:mb-6">İŞ BİRLİKLERİMİZ</h2>
            <p className="text-gray-600 font-light text-sm">Çalıştığımız markalar ve parça tedarikçileri</p>
          </div>

          <div ref={partnersGridRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {partners.map((partner, index) => (
              <div key={index} className="stagger-item reveal p-4 sm:p-6 md:p-8 border border-dark-800/30 hover:border-red-900/20 transition-all duration-500 flex items-center justify-center card-lift group">
                <span className="text-xs sm:text-sm md:text-base font-light tracking-wider text-gray-500 group-hover:text-white transition-colors duration-500 text-center">{typeof partner === 'string' ? partner : partner.name || partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SSS ═══ */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-black via-dark-950 to-black relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        <div className="max-w-4xl mx-auto">
          <div ref={faqHeaderRef} className="reveal text-center mb-10 md:mb-16">
            <span className="text-[10px] tracking-[0.4em] text-red-600/60 font-light block mb-3 md:mb-4">SSS</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight mb-4 md:mb-6">SIKÇA SORULAN SORULAR</h2>
            <p className="text-gray-600 font-light text-sm">Merak ettiğiniz her şey</p>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="border border-dark-800/50 hover:border-red-900/20 transition-all duration-500 group">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left touch-manipulation"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <span className="text-[10px] text-red-600/40 font-light flex-shrink-0">0{index + 1}</span>
                    <span className="font-light text-white text-sm sm:text-base pr-3 sm:pr-4">{item.question}</span>
                  </div>
                  <div className={`w-6 h-6 border border-dark-700 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${openFaq === index ? 'border-red-600/50 rotate-180' : ''}`}>
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pl-10 sm:pl-16">
                    <p className="text-gray-500 font-light leading-relaxed text-xs sm:text-sm">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative">
        <div className="section-divider absolute top-0 left-0 right-0"></div>
        {/* CTA ambient glow - mobile'da küçük */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[150px] md:w-[500px] md:h-[300px] bg-red-600/5 rounded-full blur-3xl"></div>
        <div ref={ctaRef} className="reveal max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-7xl font-light tracking-tight mb-6 md:mb-8 text-gradient">
            {ctaContent.title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-light text-gray-500 mb-8 md:mb-14">
            {ctaContent.subtitle}
          </p>
          <Link to="/appointment" className="inline-block group relative overflow-hidden px-10 sm:px-16 py-4 sm:py-5 border border-red-600 btn-glow">
            <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] font-light text-white">RANDEVU ALIN</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
