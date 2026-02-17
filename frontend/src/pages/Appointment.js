import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SEOHead from '../components/SEOHead';

const API = process.env.REACT_APP_API_URL || '';

function TrackingBox() {
  const [trackCode, setTrackCode] = useState('');
  const [trackError, setTrackError] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const navigate = useNavigate();

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackCode.trim()) return;
    setTrackError('');
    setTrackLoading(true);

    try {
      await axios.get(`${API}/api/appointments/track/${trackCode.trim()}`);
      navigate(`/randevu-takip?code=${encodeURIComponent(trackCode.trim())}`);
    } catch (err) {
      setTrackError(err.response?.data?.message || 'Randevu bulunamadı. Takip kodunuzu kontrol edin.');
      setTrackLoading(false);
    }
  };

  return (
    <div className="mb-8 sm:mb-12 border border-dark-900 hover:border-dark-800 transition-colors p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-shrink-0 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs tracking-widest font-light text-gray-400">RANDEVU TAKİP</span>
        </div>
        <form onSubmit={handleTrack} className="flex flex-1 gap-3">
          <input
            type="text"
            value={trackCode}
            onChange={(e) => { setTrackCode(e.target.value.toUpperCase()); setTrackError(''); }}
            placeholder="Takip kodunuzu girin (AES-XXXXXXXX)"
            className="flex-1 bg-transparent border border-dark-900 px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors font-light placeholder:text-gray-700"
          />
          <button
            type="submit"
            disabled={!trackCode.trim() || trackLoading}
            className={`px-5 sm:px-6 py-3 text-xs tracking-widest font-light transition-all whitespace-nowrap ${
              trackCode.trim() && !trackLoading
                ? 'border border-red-600 text-red-400 hover:bg-red-600 hover:text-white'
                : 'border border-dark-900 text-gray-700 cursor-not-allowed'
            }`}
          >
            {trackLoading ? '...' : 'SORGULA'}
          </button>
        </form>
      </div>
      {trackError && (
        <p className="text-red-400 text-xs font-light mt-3 pl-0 sm:pl-8">{trackError}</p>
      )}
    </div>
  );
}

function CalendarPicker({ selectedDate, onDateSelect }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Pazartesi = 0
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const isDisabled = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    if (date < today) return true; // Geçmiş tarih
    if (date.getDay() === 0) return true; // Pazar
    return false;
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const handleDayClick = (day) => {
    if (isDisabled(day)) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
  };

  const canGoPrev = !(currentMonth === today.getMonth() && currentYear === today.getFullYear());

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="border border-dark-900 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} disabled={!canGoPrev}
          className={`w-9 h-9 flex items-center justify-center border transition-all ${canGoPrev ? 'border-dark-800 hover:border-white text-gray-400 hover:text-white' : 'border-dark-900 text-gray-800 cursor-not-allowed'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-sm font-light tracking-wider">{months[currentMonth]} {currentYear}</span>
        <button type="button" onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center border border-dark-800 hover:border-white text-gray-400 hover:text-white transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(d => (
          <div key={d} className={`text-center text-[10px] tracking-wider font-light py-1 ${d === 'Paz' ? 'text-red-500/50' : 'text-gray-600'}`}>{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const disabled = isDisabled(day);
          const selected = isSelected(day);
          const todayMark = isToday(day);
          const isSunday = new Date(currentYear, currentMonth, day).getDay() === 0;

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => handleDayClick(day)}
              className={`relative aspect-square flex items-center justify-center text-sm font-light transition-all touch-manipulation
                ${disabled ? 'text-gray-800 cursor-not-allowed' : ''}
                ${disabled && isSunday ? 'text-red-900/40' : ''}
                ${!disabled && !selected ? 'text-gray-300 hover:bg-white/10 hover:text-white' : ''}
                ${selected ? 'bg-white text-black font-normal' : ''}
              `}
            >
              {day}
              {todayMark && !selected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dark-900">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          <span className="text-[10px] text-gray-600 font-light">Bugün</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-red-900/50 font-light">Paz</span>
          <span className="text-[10px] text-gray-600 font-light">Kapalı</span>
        </div>
      </div>
    </div>
  );
}

function DateTimeStep({ formData, setFormData, handleChange, nextStep, prevStep }) {
  const [availability, setAvailability] = useState({});
  const [dateError, setDateError] = useState('');

  const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const handleDateSelect = async (dateStr) => {
    setFormData(prev => ({ ...prev, date: dateStr, time: '' }));
    setDateError('');

    // Slot müsaitlik kontrolü
    try {
      const res = await axios.get(`${API}/api/appointments/availability?date=${dateStr}`);
      setAvailability(res.data);
    } catch (err) {
      console.error('Availability check failed:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-light tracking-wider mb-8">Tarih & Saat Seçimi</h2>
      <p className="text-sm text-gray-500 font-light">Pazartesi - Cumartesi, 09:00 - 18:00 arası hizmet vermekteyiz.</p>

      <div>
        <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">TARİH SEÇİN</label>
        <CalendarPicker selectedDate={formData.date} onDateSelect={handleDateSelect} />
        {dateError && <p className="text-red-400 text-sm font-light mt-2">{dateError}</p>}
      </div>

      {formData.date && !dateError && (
        <div>
          <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">SAAT</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {allSlots.map(time => {
              const slotInfo = availability[time];
              const isFull = slotInfo && !slotInfo.available;
              const isSelected = formData.time === time;

              return (
                <button
                  key={time}
                  type="button"
                  disabled={isFull}
                  onClick={() => setFormData(prev => ({ ...prev, time }))}
                  className={`py-3 sm:py-4 border font-light text-xs sm:text-sm transition-all touch-manipulation ${
                    isFull
                      ? 'border-dark-900 text-gray-700 cursor-not-allowed line-through'
                      : isSelected
                        ? 'border-red-600 bg-red-600/10 text-white'
                        : 'border-dark-900 hover:border-white text-gray-300'
                  }`}
                >
                  {time}
                  {isFull && <span className="block text-[10px] text-gray-600 mt-1">Dolu</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button type="button" onClick={prevStep}
          className="flex-1 py-4 border border-dark-900 hover:border-white font-light tracking-widest text-sm transition-all">
          GERİ
        </button>
        <button type="button" onClick={nextStep}
          disabled={!formData.date || !formData.time || !!dateError}
          className={`flex-1 py-4 border font-light tracking-widest text-sm transition-all ${
            formData.date && formData.time && !dateError
              ? 'border-white hover:bg-white hover:text-black'
              : 'border-dark-900 text-gray-700 cursor-not-allowed'
          }`}>
          DEVAM ET
        </button>
      </div>
    </div>
  );
}

function Appointment() {
  const [step, setStep] = useState(1);
  const [manualCar, setManualCar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: [],
    carBrand: '',
    carModel: '',
    carYear: '',
    engineType: '',
    packageType: '',
    date: '',
    time: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  // Dinamik servis listesi (backend'den çekilir, Admin panelinden yönetilir)
  const [servicesList, setServicesList] = useState([]);

  // servicePrices: servis adı → { min, max, note } map'i (servicesList'ten türetilir)
  const [servicePrices, setServicePrices] = useState({});

  // Backend'den servis listesini çek
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/api/settings`);
        const general = {};
        response.data.forEach(s => {
          if (s.category === 'general') general[s.key] = s.value;
        });

        try {
          if (general.servicesList) {
            const parsed = JSON.parse(general.servicesList);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Boş title olanları filtrele
              const valid = parsed.filter(s => s && s.title && s.title.trim());
              if (valid.length > 0) {
                setServicesList(valid);
                // Fiyat map'ini oluştur (binlik ayraç olan noktayı temizle)
                const cleanPrice = (val) => {
                  if (!val) return '';
                  // '2.000' → '2000', '1.300' → '1300', '800' → '800'
                  return val.toString().replace(/\./g, '').replace(/,/g, '');
                };
                const pricesObj = {};
                valid.forEach(svc => {
                  pricesObj[svc.title] = {
                    min: cleanPrice(svc.priceMin),
                    max: cleanPrice(svc.priceMax),
                    note: svc.priceNote || ''
                  };
                });
                setServicePrices(pricesObj);
              }
            }
          }
        } catch(e) {
          console.error('servicesList parse error:', e);
        }
      } catch (err) {
        console.error('Servisler yüklenemedi:', err);
      }
    };
    fetchServices();
  }, []);

  // Türkiye'deki popüler araçlar
  const carDatabase = {
    'Audi': {
      models: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT'],
      engines: {
        'A3': ['1.0 TFSI 110 HP', '1.5 TFSI 150 HP', '2.0 TFSI 190 HP', '2.0 TDI 150 HP'],
        'A4': ['1.5 TFSI 150 HP', '2.0 TFSI 190 HP', '2.0 TDI 150 HP', '2.0 TDI 190 HP'],
        'A5': ['2.0 TFSI 190 HP', '2.0 TFSI 245 HP', '2.0 TDI 190 HP'],
        'A6': ['2.0 TFSI 204 HP', '3.0 TDI 286 HP', '3.0 TFSI 340 HP'],
        'Q3': ['1.5 TFSI 150 HP', '2.0 TFSI 190 HP', '2.0 TDI 150 HP'],
        'Q5': ['2.0 TFSI 249 HP', '2.0 TDI 204 HP', '3.0 TDI 286 HP'],
      },
      packages: ['Standart', 'Attraction', 'Ambition', 'Design', 'Sport', 'S-Line', 'Black Edition']
    },
    'BMW': {
      models: ['1 Serisi', '2 Serisi', '3 Serisi', '4 Serisi', '5 Serisi', '7 Serisi', '8 Serisi', 'X1', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX', 'i4'],
      engines: {
        '1 Serisi': ['116i 109 HP', '118i 136 HP', '120i 178 HP', '118d 150 HP'],
        '3 Serisi': ['318i 156 HP', '320i 184 HP', '330i 258 HP', '318d 150 HP', '320d 190 HP'],
        '5 Serisi': ['520i 184 HP', '530i 252 HP', '540i 333 HP', '520d 190 HP', '530d 286 HP'],
        'X1': ['sDrive18i 140 HP', 'xDrive20i 192 HP', 'sDrive18d 150 HP'],
        'X3': ['xDrive20i 184 HP', 'xDrive30i 245 HP', 'xDrive20d 190 HP', 'xDrive30d 286 HP'],
        'X5': ['xDrive40i 340 HP', 'xDrive30d 265 HP', 'M50i 530 HP'],
      },
      packages: ['Standart', 'Advantage', 'Luxury Line', 'Sport Line', 'M Sport', 'M Performance']
    },
    'Mercedes-Benz': {
      models: ['A Serisi', 'C Serisi', 'E Serisi', 'S Serisi', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'EQC', 'EQE'],
      engines: {
        'A Serisi': ['A 180 136 HP', 'A 200 163 HP', 'A 250 224 HP', 'A 180d 116 HP'],
        'C Serisi': ['C 180 170 HP', 'C 200 204 HP', 'C 300 258 HP', 'C 220d 194 HP'],
        'E Serisi': ['E 200 197 HP', 'E 300 258 HP', 'E 220d 194 HP', 'E 300d 265 HP'],
        'GLA': ['GLA 180 136 HP', 'GLA 200 163 HP', 'GLA 220d 190 HP'],
        'GLC': ['GLC 200 197 HP', 'GLC 300 258 HP', 'GLC 220d 194 HP'],
        'GLE': ['GLE 300d 245 HP', 'GLE 400d 330 HP', 'GLE 450 367 HP'],
      },
      packages: ['Standart', 'Style', 'Avantgarde', 'AMG Line', 'Night Package', 'Premium Plus']
    },
    'Volkswagen': {
      models: ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc', 'Touareg', 'Arteon', 'ID.3', 'ID.4'],
      engines: {
        'Polo': ['1.0 TSI 95 HP', '1.0 TSI 110 HP', '1.5 TSI 150 HP'],
        'Golf': ['1.0 TSI 110 HP', '1.5 TSI 130 HP', '1.5 TSI 150 HP', '2.0 TDI 115 HP', '2.0 TDI 150 HP'],
        'Passat': ['1.5 TSI 150 HP', '2.0 TSI 190 HP', '2.0 TDI 150 HP', '2.0 TDI 190 HP'],
        'Tiguan': ['1.5 TSI 150 HP', '2.0 TSI 190 HP', '2.0 TDI 150 HP', '2.0 TDI 200 HP'],
      },
      packages: ['Trendline', 'Comfortline', 'Highline', 'R-Line', 'Black Style']
    },
    'Renault': {
      models: ['Clio', 'Megane', 'Taliant', 'Captur', 'Kadjar', 'Koleos', 'Austral'],
      engines: {
        'Clio': ['0.9 TCe 90 HP', '1.0 TCe 100 HP', '1.3 TCe 130 HP'],
        'Megane': ['1.3 TCe 140 HP', '1.5 dCi 115 HP'],
        'Captur': ['0.9 TCe 90 HP', '1.3 TCe 130 HP', '1.5 dCi 95 HP'],
      },
      packages: ['Touch', 'Icon', 'Iconic']
    },
    'Peugeot': {
      models: ['208', '2008', '308', '3008', '5008', '408', 'e-208', 'e-2008'],
      engines: {
        '208': ['1.2 PureTech 100 HP', '1.2 PureTech 130 HP', '1.5 BlueHDi 100 HP'],
        '2008': ['1.2 PureTech 130 HP', '1.5 BlueHDi 130 HP'],
        '3008': ['1.2 PureTech 130 HP', '1.6 PureTech 180 HP', '1.5 BlueHDi 130 HP'],
      },
      packages: ['Active', 'Allure', 'GT Line', 'GT']
    },
    'Fiat': {
      models: ['500', 'Egea', 'Tipo', '500X', 'Doblo'],
      engines: {
        'Egea': ['1.3 MultiJet 95 HP', '1.4 Fire 95 HP', '1.6 MultiJet 120 HP'],
        'Tipo': ['1.4 Fire 95 HP', '1.6 MultiJet 120 HP'],
        '500X': ['1.3 MultiJet 95 HP', '1.6 MultiJet 120 HP'],
      },
      packages: ['Pop', 'Lounge', 'Cross', 'Urban']
    },
    'Toyota': {
      models: ['Corolla', 'Corolla Cross', 'C-HR', 'RAV4', 'Camry', 'Yaris'],
      engines: {
        'Corolla': ['1.6 Valvematic 132 HP', '1.8 Hybrid 122 HP', '2.0 Hybrid 184 HP'],
        'C-HR': ['1.8 Hybrid 122 HP', '2.0 Hybrid 184 HP'],
        'RAV4': ['2.0 Hybrid 197 HP', '2.5 Hybrid 218 HP'],
      },
      packages: ['Touch', 'Vision', 'Dream', 'Sky']
    },
    'Honda': {
      models: ['Civic', 'HR-V', 'CR-V', 'Jazz'],
      engines: {
        'Civic': ['1.5 VTEC Turbo 182 HP', '2.0 e:HEV 184 HP'],
        'CR-V': ['1.5 VTEC Turbo 193 HP', '2.0 Hybrid 184 HP'],
      },
      packages: ['Elegance', 'Executive', 'Sport']
    },
    'Ford': {
      models: ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Mondeo'],
      engines: {
        'Focus': ['1.0 EcoBoost 125 HP', '1.5 EcoBoost 150 HP', '1.5 EcoBlue 120 HP'],
        'Puma': ['1.0 EcoBoost 125 HP', '1.0 EcoBoost 155 HP'],
        'Kuga': ['1.5 EcoBoost 150 HP', '2.0 EcoBlue 150 HP', '2.5 Hybrid 225 HP'],
      },
      packages: ['Trend', 'Titanium', 'ST-Line', 'Vignale']
    },
    'Opel': {
      models: ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland', 'Mokka'],
      engines: {
        'Corsa': ['1.2 75 HP', '1.2 Turbo 100 HP', '1.5 Diesel 100 HP'],
        'Astra': ['1.2 Turbo 130 HP', '1.5 Diesel 130 HP'],
        'Grandland': ['1.2 Turbo 130 HP', '1.5 Diesel 130 HP'],
      },
      packages: ['Edition', 'Elegance', 'GS Line', 'Ultimate']
    },
    'Hyundai': {
      models: ['i20', 'i10', 'Bayon', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq 5'],
      engines: {
        'i20': ['1.0 T-GDI 100 HP', '1.0 T-GDI 120 HP'],
        'Tucson': ['1.6 T-GDI 150 HP', '1.6 T-GDI 180 HP', '1.6 CRDi 136 HP'],
        'Kona': ['1.0 T-GDI 120 HP', '1.6 T-GDI 198 HP'],
      },
      packages: ['Style', 'Elite', 'Smart', 'Elite Plus']
    },
    'Kia': {
      models: ['Picanto', 'Rio', 'Stonic', 'Ceed', 'XCeed', 'Sportage', 'Sorento', 'EV6'],
      engines: {
        'Sportage': ['1.6 T-GDI 150 HP', '1.6 T-GDI 180 HP', '1.6 CRDi 136 HP'],
        'Ceed': ['1.0 T-GDI 120 HP', '1.5 T-GDI 160 HP', '1.6 CRDi 136 HP'],
      },
      packages: ['Concept', 'Prestige', 'Platinum']
    },
    'Skoda': {
      models: ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq'],
      engines: {
        'Octavia': ['1.0 TSI 110 HP', '1.5 TSI 150 HP', '2.0 TDI 150 HP'],
        'Karoq': ['1.5 TSI 150 HP', '2.0 TDI 150 HP'],
        'Kodiaq': ['2.0 TSI 190 HP', '2.0 TDI 150 HP', '2.0 TDI 200 HP'],
      },
      packages: ['Active', 'Ambition', 'Style', 'SportLine', 'L&K']
    },
    'Seat': {
      models: ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
      engines: {
        'Leon': ['1.0 TSI 110 HP', '1.5 TSI 150 HP', '2.0 TDI 150 HP'],
        'Ateca': ['1.5 TSI 150 HP', '2.0 TSI 190 HP', '2.0 TDI 150 HP'],
      },
      packages: ['Reference', 'Style', 'FR', 'Xcellence']
    },
    'Dacia': {
      models: ['Sandero', 'Duster', 'Jogger', 'Spring'],
      engines: {
        'Sandero': ['0.9 TCe 90 HP', '1.0 SCe 65 HP'],
        'Duster': ['1.0 TCe 100 HP', '1.3 TCe 130 HP', '1.5 dCi 115 HP'],
      },
      packages: ['Essential', 'Expression', 'Prestige']
    },
    'Nissan': {
      models: ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf'],
      engines: {
        'Qashqai': ['1.3 DIG-T 140 HP', '1.3 DIG-T 158 HP', '1.5 dCi 115 HP'],
        'X-Trail': ['1.3 DIG-T 158 HP', '1.7 dCi 150 HP'],
      },
      packages: ['Visia', 'Acenta', 'N-Connecta', 'Tekna']
    },
    'Mazda': {
      models: ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'MX-5'],
      engines: {
        '3': ['2.0 Skyactiv-G 122 HP', '2.0 Skyactiv-X 186 HP'],
        'CX-5': ['2.0 Skyactiv-G 165 HP', '2.5 Skyactiv-G 194 HP'],
      },
      packages: ['Pure', 'Centre-Line', 'Prime-Line', 'Signature']
    },
    'Mitsubishi': {
      models: ['Space Star', 'ASX', 'Eclipse Cross', 'Outlander'],
      engines: {
        'ASX': ['1.6 MIVEC 117 HP', '2.0 MIVEC 150 HP'],
        'Eclipse Cross': ['1.5 Turbo 163 HP', '2.2 DI-D 150 HP'],
      },
      packages: ['Inform', 'Intense', 'Instyle']
    },
    'Suzuki': {
      models: ['Swift', 'Vitara', 'S-Cross', 'Jimny'],
      engines: {
        'Swift': ['1.2 Dualjet 90 HP', '1.4 Boosterjet 129 HP'],
        'Vitara': ['1.4 Boosterjet 140 HP', '1.6 VVT 117 HP'],
      },
      packages: ['GL', 'GLX', 'GLX+']
    },
    'Volvo': {
      models: ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40'],
      engines: {
        'XC40': ['T3 163 HP', 'T4 211 HP', 'T5 247 HP', 'D3 150 HP'],
        'XC60': ['T5 250 HP', 'T6 310 HP', 'D4 190 HP'],
      },
      packages: ['Momentum', 'Inscription', 'R-Design']
    },
    'Jeep': {
      models: ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler'],
      engines: {
        'Renegade': ['1.0 T3 120 HP', '1.3 T4 150 HP', '1.6 MultiJet 120 HP'],
        'Compass': ['1.3 T4 150 HP', '1.6 MultiJet 130 HP', '2.0 MultiJet 170 HP'],
      },
      packages: ['Longitude', 'Limited', 'S', 'Trailhawk']
    },
  };

  // Servis isimleri: backend'den geldiyse dinamik, gelmediyse varsayılan
  const services = servicesList.length > 0
    ? servicesList.map(s => s.title).filter(Boolean)
    : ['Periyodik Bakım', 'Motor Bakımı', 'Fren Bakımı', 'Lastik Değişimi', 'Klima Bakımı', 'Elektrik Sistemleri', 'Kaporta & Boya', 'Mekanik Onarım'];

  const years = [];
  for (let year = new Date().getFullYear() + 1; year >= 1990; year--) {
    years.push(year);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const serviceText = Array.isArray(formData.service) ? formData.service.join(', ') : formData.service;
      const result = await axios.post(`${API}/api/appointments`, {
        ...formData,
        service: serviceText,
        message: `${formData.carBrand} ${formData.carModel} (${formData.carYear}) - ${formData.engineType} - ${formData.packageType} ${formData.message ? '- ' + formData.message : ''}`
      });
      setSuccess(true);
      // Takip kodu varsa göster
      if (result.data && result.data.trackingCode) {
        setFormData(prev => ({ ...prev, trackingCode: result.data.trackingCode }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Randevu oluşturulamadı. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Reset dependent fields
    if (name === 'carBrand') {
      setFormData(prev => ({
        ...prev,
        carBrand: value,
        carModel: '',
        engineType: '',
        packageType: ''
      }));
    } else if (name === 'carModel') {
      setFormData(prev => ({
        ...prev,
        carModel: value,
        engineType: '',
      }));
    }
  };

  const nextStep = () => {
    if (step === 1 && formData.service.length > 0) setStep(2);
    else if (step === 2 && formData.carBrand && formData.carModel && formData.carYear) setStep(3);
    else if (step === 3 && formData.date && formData.time) setStep(4);
  };

  const prevStep = () => setStep(step - 1);

  const selectedBrand = formData.carBrand && !manualCar ? carDatabase[formData.carBrand] : null;
  const availableModels = selectedBrand ? selectedBrand.models : [];
  const availableEngines = selectedBrand && formData.carModel && selectedBrand.engines[formData.carModel] 
    ? selectedBrand.engines[formData.carModel] 
    : [];
  const availablePackages = selectedBrand ? selectedBrand.packages : [];

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-2xl w-full text-center animate-fade-in">
          <div className="mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight mb-4 sm:mb-6">
            RANDEVUNUZ OLUŞTURULDU
          </h1>
          
          <p className="text-xl font-light text-gray-500 mb-6">
            En kısa zamanda sizinle iletişime geçeceğiz
          </p>

          {formData.trackingCode && (
            <div className="border border-red-600/30 bg-red-600/5 p-6 mb-8">
              <p className="text-xs tracking-widest text-gray-500 mb-2">TAKİP KODUNUZ</p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <p className="text-2xl font-light text-red-400 tracking-wider">{formData.trackingCode}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(formData.trackingCode);
                    const btn = document.getElementById('copy-btn');
                    if (btn) { btn.textContent = '✓'; setTimeout(() => { btn.textContent = 'Kopyala'; }, 2000); }
                  }}
                  id="copy-btn"
                  className="px-3 py-1.5 border border-red-600/30 text-red-400 text-xs tracking-wider hover:bg-red-600/10 transition-all"
                >
                  Kopyala
                </button>
              </div>
              <p className="text-xs text-gray-500 font-light">
                Takip kodunuz e-posta adresinize de gönderildi.
              </p>
              <p className="text-xs text-gray-600 font-light mt-1">
                <Link to="/randevu-takip" className="text-red-400 hover:text-red-300 underline transition-colors">
                  Randevu Takip
                </Link>{' '}
                sayfasından randevunuzu sorgulayabilir veya iptal edebilirsiniz.
              </p>
            </div>
          )}

          <div className="border border-dark-900 p-4 sm:p-6 md:p-8 mb-8">
            <div className="space-y-4 text-left">
              <div className="border-b border-dark-900 pb-4">
                <span className="text-gray-500 font-light text-sm block mb-2">Hizmetler</span>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(formData.service) ? formData.service : [formData.service]).map((s, i) => (
                    <span key={i} className="px-3 py-1 border border-dark-800 text-sm font-light">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-start border-b border-dark-900 pb-4">
                <span className="text-gray-500 font-light text-sm flex-shrink-0">Araç</span>
                <span className="font-light text-sm text-right ml-4">{formData.carBrand} {formData.carModel} ({formData.carYear})</span>
              </div>
              <div className="flex justify-between items-start border-b border-dark-900 pb-4">
                <span className="text-gray-500 font-light text-sm flex-shrink-0">Tarih & Saat</span>
                <span className="font-light text-sm">{new Date(formData.date).toLocaleDateString('tr-TR')} - {formData.time}</span>
              </div>
              <div className="flex justify-between items-start border-b border-dark-900 pb-4">
                <span className="text-gray-500 font-light text-sm flex-shrink-0">İletişim</span>
                <span className="font-light text-sm">{formData.phone}</span>
              </div>
              {formData.service.length > 0 && (() => {
                const selected = Array.isArray(formData.service) ? formData.service : [formData.service];
                const priced = selected.filter(s => servicePrices[s]);
                if (priced.length === 0) return null;
                const totalMin = priced.reduce((sum, s) => sum + (Number(servicePrices[s].min) || 0), 0);
                const totalMax = priced.reduce((sum, s) => sum + (Number(servicePrices[s].max) || 0), 0);
                return (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500 font-light text-sm flex-shrink-0">Tahmini Fiyat</span>
                    <span className="font-light text-sm">{totalMin.toLocaleString('tr-TR')} - {totalMax.toLocaleString('tr-TR')} ₺</span>
                  </div>
                );
              })()}
            </div>
            <p className="text-[10px] sm:text-xs font-light text-gray-600 mt-2 text-center">* Fiyat tahmini olup kesin fiyat değildir</p>
          </div>

          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                name: '',
                phone: '',
                email: '',
                service: [],
                carBrand: '',
                carModel: '',
                carYear: '',
                engineType: '',
                packageType: '',
                date: '',
                time: '',
                message: ''
              });
              setStep(1);
              setManualCar(false);
              setKvkkAccepted(false);
            }}
            className="px-12 py-4 border border-white hover:bg-white hover:text-black transition-all duration-300 font-light tracking-widest text-sm"
          >
            YENİ RANDEVU OLUŞTUR
          </button>
          <Link
            to="/randevu-takip"
            className="inline-block px-12 py-4 border border-dark-900 text-gray-400 hover:border-white hover:text-white transition-all duration-300 font-light tracking-widest text-sm"
          >
            RANDEVU TAKİP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
      <SEOHead
        title="Online Randevu"
        description="AES Garage online randevu sistemi. Araç bakım ve servis randevunuzu hızlıca alın. Pazartesi-Cumartesi 09:00-18:00. Ücretsiz muayene, kolay randevu."
        path="/randevu"
        keywords="oto servis randevu, online randevu, araç bakım randevu, İstanbul oto servis randevu, AES Garage randevu"
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 border border-white/30 mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] font-light">RANDEVU SİSTEMİ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight mb-4 sm:mb-6">
            RANDEVU OLUŞTUR
          </h1>
          <p className="text-gray-500 font-light text-sm sm:text-base">
            Size en uygun zamanı seçin, biz gerisini halledelim
          </p>
        </div>

        {/* Randevu Takip Kutusu */}
        <TrackingBox />

        {/* Error Message */}
        {error && (
          <div className="mb-12 p-6 border border-red-500/30 bg-red-500/5">
            <p className="font-light text-red-400">{error}</p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center">
            {[
              { num: 1, label: 'HİZMET' },
              { num: 2, label: 'ARAÇ' },
              { num: 3, label: 'TARİH' },
              { num: 4, label: 'ÖZET' },
            ].map((item, idx) => (
              <div key={item.num} className={`flex flex-col items-center ${idx < 3 ? 'flex-1' : ''}`}>
                <div className="flex items-center w-full">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 text-sm sm:text-base flex-shrink-0 ${
                    step >= item.num ? 'border-white bg-white text-black' : 'border-dark-800 text-gray-700'
                  }`}>
                    {item.num}
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-[1px] mx-2 sm:mx-4 transition-all duration-500 ${
                      step > item.num ? 'bg-white' : 'bg-gray-800'
                    }`}></div>
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs tracking-wider font-light mt-2 sm:mt-3 ${step >= item.num ? 'text-white' : 'text-gray-500'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Service (Çoklu Seçim) */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-light tracking-wider mb-2">Hizmet Seçimi</h2>
                <p className="text-sm text-gray-500 font-light">Birden fazla hizmet seçebilirsiniz</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const isSelected = formData.service.includes(service);
                  return (
                    <label
                      key={service}
                      className={`group relative p-6 border cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'border-white bg-white/5'
                          : 'border-dark-900 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={service}
                        checked={isSelected}
                        onChange={(e) => {
                          const { value, checked } = e.target;
                          setFormData(prev => ({
                            ...prev,
                            service: checked
                              ? [...prev.service, value]
                              : prev.service.filter(s => s !== value)
                          }));
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-light">{service}</span>
                        <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                          isSelected ? 'border-white bg-white' : 'border-dark-800'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {formData.service.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-400 font-light">
                  <span className="text-white">{formData.service.length}</span> hizmet seçildi
                  {formData.service.length > 1 && (
                    <span className="text-gray-600">—</span>
                  )}
                  <span className="text-gray-600 truncate">{formData.service.join(', ')}</span>
                </div>
              )}

              <button
                type="button"
                onClick={nextStep}
                disabled={formData.service.length === 0}
                className={`w-full py-4 border font-light tracking-widest text-sm transition-all duration-300 ${
                  formData.service.length > 0
                    ? 'border-white hover:bg-white hover:text-black cursor-pointer'
                    : 'border-dark-900 text-gray-700 cursor-not-allowed'
                }`}
              >
                DEVAM ET
              </button>
            </div>
          )}

          {/* Step 2: Car Info */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-light tracking-wider mb-8">Araç Bilgileri</h2>
              
              {/* Manual Entry Checkbox */}
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={manualCar}
                  onChange={(e) => {
                    setManualCar(e.target.checked);
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        carBrand: '',
                        carModel: '',
                        carYear: '',
                        engineType: '',
                        packageType: ''
                      }));
                    }
                  }}
                  className="w-5 h-5"
                />
                <span className="text-sm font-light text-gray-500 group-hover:text-white transition-colors">
                  Aracım listede yok, manuel girmek istiyorum
                </span>
              </label>

              {!manualCar ? (
                <>
                  {/* Brand Dropdown */}
                  <div>
                    <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MARKA</label>
                    <select
                      name="carBrand"
                      value={formData.carBrand}
                      onChange={handleChange}
                      className="w-full bg-black border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                      required
                    >
                      <option value="">Seçiniz</option>
                      {Object.keys(carDatabase).sort().map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  {/* Model Dropdown */}
                  {formData.carBrand && (
                    <div>
                      <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MODEL</label>
                      <select
                        name="carModel"
                        value={formData.carModel}
                        onChange={handleChange}
                        className="w-full bg-black border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {availableModels.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Year Dropdown */}
                  {formData.carModel && (
                    <div>
                      <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MODEL YILI</label>
                      <select
                        name="carYear"
                        value={formData.carYear}
                        onChange={handleChange}
                        className="w-full bg-black border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Engine Dropdown */}
                  {formData.carYear && availableEngines.length > 0 && (
                    <div>
                      <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MOTOR</label>
                      <select
                        name="engineType"
                        value={formData.engineType}
                        onChange={handleChange}
                        className="w-full bg-black border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                      >
                        <option value="">Seçiniz (Opsiyonel)</option>
                        {availableEngines.map(engine => (
                          <option key={engine} value={engine}>{engine}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Package Dropdown */}
                  {formData.carYear && availablePackages.length > 0 && (
                    <div>
                      <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">PAKET</label>
                      <select
                        name="packageType"
                        value={formData.packageType}
                        onChange={handleChange}
                        className="w-full bg-black border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                      >
                        <option value="">Seçiniz (Opsiyonel)</option>
                        {availablePackages.map(pkg => (
                          <option key={pkg} value={pkg}>{pkg}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Manual Brand Input */}
                  <div>
                    <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MARKA</label>
                    <input
                      type="text"
                      name="carBrand"
                      value={formData.carBrand}
                      onChange={handleChange}
                      placeholder="Örn: Tesla"
                      className="w-full bg-transparent border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                      required
                    />
                  </div>

                  {/* Manual Model Input */}
                  <div>
                    <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MODEL</label>
                    <input
                      type="text"
                      name="carModel"
                      value={formData.carModel}
                      onChange={handleChange}
                      placeholder="Örn: Model 3"
                      className="w-full bg-transparent border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                      required
                    />
                  </div>

                  {/* Manual Year Input */}
                  <div>
                    <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MODEL YILI</label>
                    <input
                      type="number"
                      name="carYear"
                      value={formData.carYear}
                      onChange={handleChange}
                      placeholder="Örn: 2023"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      className="w-full bg-transparent border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                      required
                    />
                  </div>

                  {/* Manual Engine Input */}
                  <div>
                    <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MOTOR (Opsiyonel)</label>
                    <input
                      type="text"
                      name="engineType"
                      value={formData.engineType}
                      onChange={handleChange}
                      placeholder="Örn: Long Range AWD"
                      className="w-full bg-transparent border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                    />
                  </div>

                  {/* Manual Package Input */}
                  <div>
                    <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">PAKET (Opsiyonel)</label>
                    <input
                      type="text"
                      name="packageType"
                      value={formData.packageType}
                      onChange={handleChange}
                      placeholder="Örn: Full Self-Driving"
                      className="w-full bg-transparent border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-4 border border-dark-900 hover:border-white font-light tracking-widest text-sm transition-all"
                >
                  GERİ
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.carBrand || !formData.carModel || !formData.carYear}
                  className={`flex-1 py-4 border font-light tracking-widest text-sm transition-all ${
                    formData.carBrand && formData.carModel && formData.carYear
                      ? 'border-white hover:bg-white hover:text-black'
                      : 'border-dark-900 text-gray-700 cursor-not-allowed'
                  }`}
                >
                  DEVAM ET
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <DateTimeStep
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-light tracking-wider">Randevu Özeti</h2>

              {/* Summary Box */}
              <div className="border border-dark-900 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                <div className="border-b border-dark-900 pb-4">
                  <span className="text-gray-500 font-light text-sm block mb-2">Hizmetler ({formData.service.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {formData.service.map((s, i) => (
                      <span key={i} className="px-2 sm:px-3 py-1 border border-dark-800 text-xs sm:text-sm font-light">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-start border-b border-dark-900 pb-4">
                  <span className="text-gray-500 font-light text-sm flex-shrink-0">Araç</span>
                  <span className="font-light text-sm text-right ml-4">{formData.carBrand} {formData.carModel} ({formData.carYear})</span>
                </div>
                {formData.engineType && (
                  <div className="flex justify-between items-start border-b border-dark-900 pb-4">
                    <span className="text-gray-500 font-light text-sm flex-shrink-0">Motor</span>
                    <span className="font-light text-sm text-right ml-4">{formData.engineType}</span>
                  </div>
                )}
                {formData.packageType && (
                  <div className="flex justify-between items-start border-b border-dark-900 pb-4">
                    <span className="text-gray-500 font-light text-sm flex-shrink-0">Paket</span>
                    <span className="font-light text-sm text-right ml-4">{formData.packageType}</span>
                  </div>
                )}
                <div className="flex justify-between items-start border-b border-dark-900 pb-4">
                  <span className="text-gray-500 font-light text-sm flex-shrink-0">Tarih</span>
                  <span className="font-light text-sm">{new Date(formData.date).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 font-light text-sm flex-shrink-0">Saat</span>
                  <span className="font-light text-sm">{formData.time}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">AD SOYAD</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                  required
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">TELEFON</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0555 123 45 67"
                  className="w-full bg-transparent border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                  required
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">E-POSTA</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  className="w-full bg-transparent border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                  required
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">EK NOTLAR (OPSİYONEL)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-transparent border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light resize-none"
                  placeholder="Aracınız hakkında bilmemiz gereken özel bir durum var mı?"
                />
              </div>

              {/* Ortalama Fiyat Bilgisi */}
              {formData.service.length > 0 && (() => {
                const priced = formData.service.filter(s => servicePrices[s]);
                if (priced.length === 0) return null;
                const totalMin = priced.reduce((sum, s) => sum + (Number(servicePrices[s].min) || 0), 0);
                const totalMax = priced.reduce((sum, s) => sum + (Number(servicePrices[s].max) || 0), 0);
                return (
                  <div className="border border-dark-800 bg-dark-900/50 p-6">
                    <div className="text-xs tracking-widest font-light text-gray-500 mb-3">TAHMİNİ TOPLAM FİYAT ARALIĞI</div>
                    <div className="text-2xl font-light text-white mb-2">
                      {totalMin.toLocaleString('tr-TR')} - {totalMax.toLocaleString('tr-TR')} ₺
                    </div>
                    {priced.length > 1 && (
                      <div className="space-y-1 mb-2">
                        {priced.map(s => (
                          <p key={s} className="text-xs font-light text-gray-500">
                            {s}: {Number(servicePrices[s].min).toLocaleString('tr-TR')} - {Number(servicePrices[s].max).toLocaleString('tr-TR')} ₺
                          </p>
                        ))}
                      </div>
                    )}
                    {priced.length === 1 && servicePrices[priced[0]].note && (
                      <p className="text-xs font-light text-gray-500">{servicePrices[priced[0]].note}</p>
                    )}
                    <p className="text-xs font-light text-red-400 mt-2">* Bu fiyatlar tahmini olup kesin fiyat değildir. Kesin fiyat muayene sonrası belirlenecektir.</p>
                  </div>
                );
              })()}

              {/* KVKK Onayı */}
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={kvkkAccepted}
                  onChange={(e) => setKvkkAccepted(e.target.checked)}
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  required
                />
                <span className="text-sm font-light text-gray-400 group-hover:text-gray-300 transition-colors">
                  <Link to="/kvkk" target="_blank" className="text-red-500 hover:text-red-400 underline">KVKK Aydınlatma Metni</Link>'ni
                  okudum ve kişisel verilerimin işlenmesini kabul ediyorum.
                </span>
              </label>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-4 border border-dark-900 hover:border-white font-light tracking-widest text-sm transition-all"
                >
                  GERİ
                </button>
                <button
                  type="submit"
                  disabled={loading || !kvkkAccepted}
                  className="flex-1 py-4 bg-white text-black hover:bg-gray-200 font-light tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'GÖNDERİLİYOR...' : 'RANDEVU OLUŞTUR'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Appointment;