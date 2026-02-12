import React, { useState } from 'react';
import axios from 'axios';

function Appointment() {
  const [step, setStep] = useState(1);
  const [manualCar, setManualCar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
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

  const services = [
    'Periyodik Bakım',
    'Motor Bakımı',
    'Fren Bakımı',
    'Lastik Değişimi',
    'Klima Bakımı',
    'Elektrik Sistemleri',
    'Kaporta & Boya',
    'Mekanik Onarım'
  ];

  const years = [];
  for (let year = new Date().getFullYear() + 1; year >= 1990; year--) {
    years.push(year);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/appointments', {
        ...formData,
        message: `${formData.carBrand} ${formData.carModel} (${formData.carYear}) - ${formData.engineType} - ${formData.packageType} ${formData.message ? '- ' + formData.message : ''}`
      });
      setSuccess(true);
    } catch (err) {
      setError('Randevu oluşturulamadı. Lütfen tekrar deneyin.');
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
    if (step === 1 && formData.service) setStep(2);
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
      <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-2xl w-full text-center animate-fade-in">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
            RANDEVUNUZ OLUŞTURULDU
          </h1>
          
          <p className="text-xl font-light text-gray-500 mb-12">
            En kısa zamanda sizinle iletişime geçeceğiz
          </p>

          <div className="border border-dark-900 p-8 mb-8">
            <div className="space-y-4 text-left">
              <div className="flex justify-between border-b border-dark-900 pb-4">
                <span className="text-gray-500 font-light">Hizmet</span>
                <span className="font-light">{formData.service}</span>
              </div>
              <div className="flex justify-between border-b border-dark-900 pb-4">
                <span className="text-gray-500 font-light">Araç</span>
                <span className="font-light">{formData.carBrand} {formData.carModel} ({formData.carYear})</span>
              </div>
              <div className="flex justify-between border-b border-dark-900 pb-4">
                <span className="text-gray-500 font-light">Tarih & Saat</span>
                <span className="font-light">{new Date(formData.date).toLocaleDateString('tr-TR')} - {formData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-light">İletişim</span>
                <span className="font-light">{formData.phone}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                name: '',
                phone: '',
                email: '',
                service: '',
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
            }}
            className="px-12 py-4 border border-white hover:bg-white hover:text-black transition-all duration-300 font-light tracking-widest text-sm"
          >
            YENİ RANDEVU OLUŞTUR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 border border-white/30 mb-6">
            <span className="text-xs tracking-[0.3em] font-light">RANDEVU SİSTEMİ</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-6">
            RANDEVU OLUŞTUR
          </h1>
          <p className="text-gray-500 font-light">
            Size en uygun zamanı seçin, biz gerisini halledelim
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-12 p-6 border border-red-500/30 bg-red-500/5">
            <p className="font-light text-red-400">{error}</p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  step >= num ? 'border-white bg-white text-black' : 'border-dark-800 text-gray-700'
                }`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`flex-1 h-[1px] mx-4 transition-all duration-500 ${
                    step > num ? 'bg-white' : 'bg-gray-800'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-xs tracking-wider font-light text-gray-500">HİZMET</span>
            <span className="text-xs tracking-wider font-light text-gray-500">ARAÇ</span>
            <span className="text-xs tracking-wider font-light text-gray-500">TARİH</span>
            <span className="text-xs tracking-wider font-light text-gray-500">ÖZET</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Service */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-light tracking-wider mb-8">Hizmet Seçimi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <label
                    key={service}
                    className={`group relative p-6 border cursor-pointer transition-all duration-300 ${
                      formData.service === service
                        ? 'border-white bg-white/5'
                        : 'border-dark-900 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={service}
                      checked={formData.service === service}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-light">{service}</span>
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                        formData.service === service ? 'border-white bg-white' : 'border-dark-800'
                      }`}>
                        {formData.service === service && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.service}
                className={`w-full py-4 border font-light tracking-widest text-sm transition-all duration-300 ${
                  formData.service
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
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-light tracking-wider mb-8">Tarih & Saat Seçimi</h2>
              
              <div>
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">TARİH</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-transparent border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                  required
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">SAAT</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-black border border-dark-900 px-6 py-4 focus:border-white focus:outline-none transition-colors font-light"
                  required
                >
                  <option value="">Seçiniz</option>
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
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
                  disabled={!formData.date || !formData.time}
                  className={`flex-1 py-4 border font-light tracking-widest text-sm transition-all ${
                    formData.date && formData.time
                      ? 'border-white hover:bg-white hover:text-black'
                      : 'border-dark-900 text-gray-700 cursor-not-allowed'
                  }`}
                >
                  DEVAM ET
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-light tracking-wider mb-8">Randevu Özeti</h2>
              
              {/* Summary Box */}
              <div className="border border-dark-900 p-8 space-y-6 mb-8">
                <div className="flex justify-between border-b border-dark-900 pb-4">
                  <span className="text-gray-500 font-light">Hizmet</span>
                  <span className="font-light">{formData.service}</span>
                </div>
                <div className="flex justify-between border-b border-dark-900 pb-4">
                  <span className="text-gray-500 font-light">Araç</span>
                  <span className="font-light">{formData.carBrand} {formData.carModel} ({formData.carYear})</span>
                </div>
                {formData.engineType && (
                  <div className="flex justify-between border-b border-dark-900 pb-4">
                    <span className="text-gray-500 font-light">Motor</span>
                    <span className="font-light">{formData.engineType}</span>
                  </div>
                )}
                {formData.packageType && (
                  <div className="flex justify-between border-b border-dark-900 pb-4">
                    <span className="text-gray-500 font-light">Paket</span>
                    <span className="font-light">{formData.packageType}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-dark-900 pb-4">
                  <span className="text-gray-500 font-light">Tarih</span>
                  <span className="font-light">{new Date(formData.date).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-light">Saat</span>
                  <span className="font-light">{formData.time}</span>
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
                  disabled={loading}
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