// Türkiye'deki popüler araçlar - marka/model/motor veritabanı
// Bu dosya Appointment.js ve Chiptuning.js tarafından ortak kullanılır

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

export default carDatabase;
