import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import Appointment from './pages/Appointment';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import About from './pages/About';
import KVKK from './pages/KVKK';
import TrackAppointment from './pages/TrackAppointment';
import NotFound from './pages/NotFound';

const API = process.env.REACT_APP_API_URL || '';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.pageYOffset > 400);
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  return visible ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 z-50 group"
      aria-label="Yukarı çık"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-dark-900 border border-dark-700 hover:border-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </button>
  ) : null;
}

function Navigation({ logo }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.pageYOffset > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Ana Sayfa' },
    { path: '/about', label: 'Hakkımızda' },
    { path: '/services', label: 'Hizmetler' },
    { path: '/pricing', label: 'Fiyatlar' },
    { path: '/appointment', label: 'Randevu' },
    { path: '/contact', label: 'İletişim' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-dark-950/98 backdrop-blur-xl shadow-2xl shadow-red-900/20 py-4' : 'bg-transparent py-4 sm:py-6'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="group flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <img src={logo} alt="AES Garage" className="relative w-10 h-10 sm:w-12 sm:h-12 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-light tracking-[0.2em] text-white">AES</span>
                <span className="text-xs font-light tracking-[0.3em] text-gray-400">GARAGE</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link key={item.path} to={item.path} className="group relative">
                  <span className={`text-sm font-light tracking-wider transition-all duration-300 ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                  <div className={`absolute bottom-0 left-0 h-[1px] bg-red-600 transition-all duration-300 ${isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/appointment" className="hidden md:block group relative overflow-hidden">
                <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                <div className="relative px-8 py-3 border border-red-600 text-white group-hover:text-white transition-colors duration-500 font-light tracking-wider text-sm">
                  RANDEVU AL
                </div>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex flex-col items-center justify-center space-y-1.5"
                aria-label="Menü"
              >
                <span className={`block w-6 h-[1px] bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
                <span className={`block w-6 h-[1px] bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-[1px] bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-xl lg:hidden">
          {/* Kapatma butonu */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-5 right-6 w-10 h-10 flex items-center justify-center z-10"
            aria-label="Menüyü kapat"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}
                className={`text-xl sm:text-2xl font-light tracking-wider transition-colors ${isActive(item.path) ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                {item.label}
              </Link>
            ))}
            <Link to="/appointment" className="mt-4 px-12 py-4 border border-red-600 text-white font-light tracking-wider text-sm hover:bg-red-600 transition-colors">
              RANDEVU AL
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  const [logo, setLogo] = useState('/images/logo.png');
  const [contactInfo, setContactInfo] = useState({
    phone: '+90 555 123 45 67',
    email: 'info@aesgarage.com',
    address: 'Küçükbakkalköy Yolu Cd. No:44/B, Ataşehir/İstanbul',
    whatsapp: '905551234567',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/api/settings`);
        const contact = {};
        response.data.forEach(setting => {
          if (setting.key === 'logo' && setting.category === 'images') {
            setLogo(setting.value);
          }
          if (setting.category === 'contact') {
            contact[setting.key] = setting.value;
          }
        });
        if (Object.keys(contact).length > 0) {
          setContactInfo(prev => ({ ...prev, ...contact }));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-black text-white">
        <ScrollToTop />
        <Navigation logo={logo} />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/track" element={<TrackAppointment />} />
            <Route path="/kvkk" element={<KVKK />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <ScrollToTopButton />

        <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 group whatsapp-btn">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" style={{background: '#25D366'}}></div>
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(135deg, #25D366, #128C7E)'}}>
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
          </div>
        </a>

        <footer className="bg-dark-950/50 mt-16 sm:mt-24 md:mt-32 relative">
          <div className="section-divider absolute top-0 left-0 right-0"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-6 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    <img src={logo} alt="AES Garage" className="relative w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <div className="text-xl font-light tracking-[0.2em]">AES</div>
                    <div className="text-[10px] font-light tracking-[0.3em] text-gray-600">GARAGE</div>
                  </div>
                </div>
                <p className="text-gray-500 font-light leading-relaxed max-w-md text-sm">
                  Premium araç bakım ve servis merkezi. Mükemmelliğin peşinde koşuyoruz.
                </p>
              </div>

              <div>
                <h3 className="text-[10px] font-light tracking-[0.3em] mb-6 text-gray-600 uppercase">Keşfedin</h3>
                <ul className="space-y-3">
                  <li><Link to="/about" className="text-sm font-light text-gray-500 hover:text-white transition-colors duration-300 hover:pl-2">Hakkımızda</Link></li>
                  <li><Link to="/services" className="text-sm font-light text-gray-500 hover:text-white transition-colors duration-300 hover:pl-2">Hizmetler</Link></li>
                  <li><Link to="/pricing" className="text-sm font-light text-gray-500 hover:text-white transition-colors duration-300 hover:pl-2">Fiyatlar</Link></li>
                  <li><Link to="/appointment" className="text-sm font-light text-gray-500 hover:text-white transition-colors duration-300 hover:pl-2">Randevu</Link></li>
                  <li><Link to="/track" className="text-sm font-light text-gray-500 hover:text-white transition-colors duration-300 hover:pl-2">Randevu Takip</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-[10px] font-light tracking-[0.3em] mb-6 text-gray-600 uppercase">İletişim</h3>
                <ul className="space-y-3 text-sm font-light text-gray-500">
                  <li className="hover:text-gray-300 transition-colors">{contactInfo.phone}</li>
                  <li className="hover:text-gray-300 transition-colors">{contactInfo.email}</li>
                  <li className="hover:text-gray-300 transition-colors">{contactInfo.address}</li>
                </ul>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-dark-800/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-[10px] font-light text-gray-600 tracking-[0.2em]">&copy; 2026 AES GARAGE. TÜM HAKLARI SAKLIDIR.</p>
              <div className="flex space-x-6">
                <Link to="/kvkk" className="text-[10px] font-light text-gray-600 hover:text-white transition-colors tracking-[0.2em]">KVKK</Link>
                <Link to="/contact" className="text-[10px] font-light text-gray-600 hover:text-white transition-colors tracking-[0.2em]">İLETİŞİM</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
