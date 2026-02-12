import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import Appointment from './pages/Appointment';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

function Navigation({ logo }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Ana Sayfa' },
    { path: '/services', label: 'Hizmetler' },
    { path: '/pricing', label: 'Fiyatlar' },
    { path: '/appointment', label: 'Randevu' },
    { path: '/contact', label: 'İletişim' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-dark-950/98 backdrop-blur-xl shadow-2xl shadow-red-900/20 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="group flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img 
                src={logo} 
                alt="AES Garage" 
                className="relative w-12 h-12 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-light tracking-[0.2em] text-white">AES</span>
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

          <Link to="/appointment" className="hidden md:block group relative overflow-hidden">
            <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <div className="relative px-8 py-3 border border-red-600 text-white group-hover:text-white transition-colors duration-500 font-light tracking-wider text-sm">
              RANDEVU AL
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [logo, setLogo] = useState('/images/logo.png');

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/settings/key/logo');
        if (response.data && response.data.value) {
          setLogo(response.data.value);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchLogo();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Navigation logo={logo} />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <a href="https://wa.me/905551234567" target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 z-50 group">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
          </div>
        </a>

        <footer className="bg-black border-t border-red-900/30 mt-32">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <img 
                    src={logo} 
                    alt="AES Garage" 
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                    <div className="text-xl font-light tracking-[0.2em]">AES</div>
                    <div className="text-[10px] font-light tracking-[0.3em] text-gray-500">GARAGE</div>
                  </div>
                </div>
                <p className="text-gray-400 font-light leading-relaxed max-w-md text-sm">
                  Premium araç bakım ve servis merkezi. Mükemmelliğin peşinde koşuyoruz.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-light tracking-widest mb-6 text-gray-500 uppercase">Keşfedin</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-300">Hizmetler</a></li>
                  <li><a href="#" className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-300">Fiyatlar</a></li>
                  <li><a href="#" className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-300">Randevu</a></li>
                  <li><a href="#" className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-300">Hakkımızda</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-light tracking-widest mb-6 text-gray-500 uppercase">İletişim</h3>
                <ul className="space-y-3 text-sm font-light text-gray-400">
                  <li>+90 555 123 45 67</li>
                  <li>info@aesgarage.com</li>
                  <li>İstanbul, Türkiye</li>
                </ul>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-dark-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-xs font-light text-gray-500 tracking-wider">© 2026 AES GARAGE. TÜM HAKLARI SAKLIDIR.</p>
              <div className="flex space-x-6">
                <a href="#" className="text-xs font-light text-gray-500 hover:text-white transition-colors tracking-wider">Gizlilik</a>
                <a href="#" className="text-xs font-light text-gray-500 hover:text-white transition-colors tracking-wider">Şartlar</a>
                <a href="#" className="text-xs font-light text-gray-500 hover:text-white transition-colors tracking-wider">Çerezler</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;