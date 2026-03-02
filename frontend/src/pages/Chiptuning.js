import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SEOHead from '../components/SEOHead';
import carDatabase from '../data/carDatabase';

const API = process.env.REACT_APP_API_URL || '';

// Motor string'inden HP değerini çıkar: "1.5 TFSI 150 HP" → 150
function extractHP(engineStr) {
  if (!engineStr) return null;
  const match = engineStr.match(/(\d+)\s*HP/i);
  return match ? parseInt(match[1], 10) : null;
}

// Motor string'inden yakıt tipini tahmin et
function detectFuelType(engineStr) {
  if (!engineStr) return 'Benzin';
  const s = engineStr.toUpperCase();
  if (s.includes('HYBRID') || s.includes('E:HEV') || s.includes('PHEV')) return 'Hybrid';
  if (
    s.includes('TDI') || s.includes('HDI') || s.includes('CRDI') ||
    s.includes('DCI') || s.includes('MULTIJET') || s.includes('CDTI') ||
    s.includes('BLUEHDI') || s.includes('ECOBLUE') || s.includes('DI-D') ||
    s.includes('DIESEL') || s.match(/\b(D3|D4|D5)\b/)
  ) return 'Dizel';
  return 'Benzin';
}

// SVG Hız Göstergesi Bileşeni
function SpeedometerGauge({ currentHP, newHP, animate }) {
  const cx = 150, cy = 155, r = 110;
  const minHP = Math.max(0, Math.floor(currentHP * 0.75));
  const maxHP = Math.ceil(newHP * 1.2);

  // HP değerini açıya çevir: minHP → 180° (sol), maxHP → 0° (sağ), üstten geçerek
  function hpToAngle(hp) {
    const ratio = Math.max(0, Math.min(1, (hp - minHP) / (maxHP - minHP)));
    return 180 - ratio * 180;
  }

  // Açıdan SVG koordinat noktası
  function degToPoint(deg, radius) {
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  }

  // İbrenin SVG dönüş açısı: yukarı (12 saat) = 0°, sola = -90°, sağa = +90°
  const calcRotation = (hp) => {
    const ratio = Math.max(0, Math.min(1, (hp - minHP) / (maxHP - minHP)));
    return -90 + ratio * 180;
  };

  const [rotation, setRotation] = useState(calcRotation(currentHP));

  useEffect(() => {
    const ratio = Math.max(0, Math.min(1, (currentHP - minHP) / (maxHP - minHP)));
    setRotation(-90 + ratio * 180);
  }, [currentHP, minHP, maxHP]);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => {
      const ratio = Math.max(0, Math.min(1, (newHP - minHP) / (maxHP - minHP)));
      setRotation(-90 + ratio * 180);
    }, 400);
    return () => clearTimeout(timer);
  }, [animate, newHP, minHP, maxHP]);

  // Arka plan yayı (gri yarı çember)
  const bgStart = degToPoint(180, r);
  const bgEnd = degToPoint(0, r);
  const bgArc = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 1 0 ${bgEnd.x} ${bgEnd.y}`;

  // Mevcut HP yayı (kırmızı)
  const curAngle = hpToAngle(currentHP);
  const curEnd = degToPoint(curAngle, r);
  const curArcLarge = (180 - curAngle) > 180 ? 1 : 0;
  // Burada 0 0 yerine sweep flag'ine dikkat ederek çiziyoruz
  const curArc = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${curEnd.x} ${curEnd.y}`;

  // Chiptuning kazanç yayı (turuncu)
  const gainStart = degToPoint(curAngle, r);
  const gainAngle = hpToAngle(newHP);
  const gainEnd = degToPoint(gainAngle, r);
  // Turuncu yayı mevcut HP'nin bittiği yerden başlayıp yeni HP'ye çizecek.
  const gainArc = `M ${gainStart.x} ${gainStart.y} A ${r} ${r} 0 0 1 ${gainEnd.x} ${gainEnd.y}`;

  const gain = newHP - currentHP;

  // Kıyı çizgileri (tick marks)
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const tickAngle = 180 - (i / 10) * 180;
    const outer = degToPoint(tickAngle, r + 8);
    const inner = degToPoint(tickAngle, r - 8);
    const isMajor = i % 5 === 0;
    const labelPt = degToPoint(tickAngle, r - 22);
    const hpVal = Math.round(minHP + (i / 10) * (maxHP - minHP));
    ticks.push({ outer, inner, isMajor, labelPt, hpVal });
  }

  return (
    <svg viewBox="0 0 300 185" className="w-full max-w-xs sm:max-w-sm mx-auto">
      {/* Dış halka */}
      <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke="#1a1a1a" strokeWidth="2" />

      {/* Arka plan yayı */}
      <path d={bgArc} fill="none" stroke="#1f1f1f" strokeWidth="22" strokeLinecap="round" />

      {/* Kıyı çizgileri */}
      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={tick.inner.x} y1={tick.inner.y}
            x2={tick.outer.x} y2={tick.outer.y}
            stroke={tick.isMajor ? '#444' : '#2a2a2a'}
            strokeWidth={tick.isMajor ? 2 : 1}
          />
          {tick.isMajor && (
            <text
              x={tick.labelPt.x} y={tick.labelPt.y}
              textAnchor="middle" dominantBaseline="middle"
              fill="#555" fontSize="9" fontWeight="300"
            >
              {tick.hpVal}
            </text>
          )}
        </g>
      ))}

      {/* Chiptuning kazanç yayı (turuncu) - animate */}
      <path
        d={gainArc}
        fill="none"
        stroke="#f97316"
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.9"
        style={{ transition: 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      />

      {/* Mevcut HP yayı (kırmızı) - Üstte kalması ve ucunun yuvarlak olması için turuncunun altına ekledik */}
      <path d={curArc} fill="none" stroke="#dc2626" strokeWidth="22" strokeLinecap="round" opacity="0.95" />

      {/* İbre */}
      <g
        transform={`rotate(${rotation}, ${cx}, ${cy})`}
        style={{ transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* İbre gövdesi - yukarı doğru */}
        <polygon
          points={`${cx},${cy - 95} ${cx + 6},${cy + 14} ${cx - 6},${cy + 14}`}
          fill="white"
          opacity="0.95"
        />
        {/* İbre kök çemberi */}
        <circle cx={cx} cy={cy} r="12" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="6" fill="#dc2626" />
      </g>

      {/* HP değerleri */}
      <text x={cx} y={cy + 30} textAnchor="middle" fill="white" fontSize="24" fontWeight="300" letterSpacing="1">
        {newHP} HP
      </text>
      <text x={cx} y={cy + 52} textAnchor="middle" fill="#f97316" fontSize="14" fontWeight="300">
        +{gain} HP
      </text>
    </svg>
  );
}

const defaultChipPackages = [
  { name: 'Stage 1', gainPercent: 15, description: 'ECU yazılım optimizasyonu', priceMin: 2500, priceMax: 4000 },
  { name: 'Stage 2', gainPercent: 25, description: 'Yazılım + Donanım modifikasyonu', priceMin: 4000, priceMax: 7000 },
  { name: 'Stage 3', gainPercent: 35, description: 'Tam performans paketi', priceMin: 7000, priceMax: 12000 },
];

function Chiptuning() {
  const [chipPackages, setChipPackages] = useState(defaultChipPackages);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuel, setFuel] = useState('');
  const [engine, setEngine] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Custom veriler (Admin'den)
  const [customCars, setCustomCars] = useState([]);
  const [customStages, setCustomStages] = useState([]);
  const [combinedDb, setCombinedDb] = useState(carDatabase);

  // Chiptuning paketlerini ve özel verileri admin settings'ten çek
  useEffect(() => {
    const fetchChipData = async () => {
      try {
        const res = await axios.get(`${API}/api/settings`);
        const general = {};
        res.data.forEach(s => {
          if (s.category === 'general') general[s.key] = s.value;
        });
        if (general.chiptuningData) {
          const parsed = JSON.parse(general.chiptuningData);
          if (Array.isArray(parsed.packages) && parsed.packages.length > 0) {
            setChipPackages(parsed.packages);
          }
          if (Array.isArray(parsed.customCars)) setCustomCars(parsed.customCars);
          if (Array.isArray(parsed.customStages)) setCustomStages(parsed.customStages);
        }
      } catch (e) {
        console.error('Chiptuning verisi yüklenemedi:', e);
      }
    };
    fetchChipData();
  }, []);

  // carDatabase + customCars birleştirme
  useEffect(() => {
    const newDb = JSON.parse(JSON.stringify(carDatabase)); // Deep copy
    customCars.forEach(cc => {
      if (!newDb[cc.brand]) {
        newDb[cc.brand] = { models: [], engines: {}, packages: ['Standart'] };
      }
      if (!newDb[cc.brand].models.includes(cc.model)) {
        newDb[cc.brand].models.push(cc.model);
      }
      if (!newDb[cc.brand].engines[cc.model]) {
        newDb[cc.brand].engines[cc.model] = [];
      }
      const engineStr = `${cc.engine} ${cc.hp} HP`;
      if (!newDb[cc.brand].engines[cc.model].includes(engineStr)) {
        newDb[cc.brand].engines[cc.model].push(engineStr);
      }
      newDb[cc.brand].models.sort();
      newDb[cc.brand].engines[cc.model].sort();
    });
    setCombinedDb(newDb);
  }, [customCars]);

  // Marka değişince model, motor ve yakıt sıfırla
  const handleBrandChange = (val) => {
    setBrand(val);
    setModel('');
    setFuel('');
    setEngine('');
    setShowResult(false);
    setAnimating(false);
  };

  // Model değişince motor ve yakıt sıfırla
  const handleModelChange = (val) => {
    setModel(val);
    setFuel('');
    setEngine('');
    setShowResult(false);
    setAnimating(false);
  };

  const handleFuelChange = (val) => {
    setFuel(val);
    setEngine('');
    setShowResult(false);
    setAnimating(false);
  };

  const handleEngineChange = (val) => {
    setEngine(val);
    setShowResult(false);
    setAnimating(false);
  };

  const brandData = brand ? combinedDb[brand] : null;
  const availableModels = brandData ? brandData.models : [];

  // Motor listesi: modele göre, yakıt tipine göre filtreli
  const allEngines = brandData && model && brandData.engines && brandData.engines[model]
    ? brandData.engines[model]
    : [];
  const filteredEngines = fuel
    ? allEngines.filter(e => detectFuelType(e) === fuel)
    : allEngines;

  const currentHP = engine ? extractHP(engine) : null;

  // Custom Stage olup olmadığını kontrol et
  let customHP = null;
  if (currentHP && selectedPackage) {
    const engineNameMatch = engine.match(/^(.*?)\s+\d+\s*HP/i);
    const rawEngineName = engineNameMatch ? engineNameMatch[1].trim() : engine.replace(/\s*\d+\s*HP/i, '').trim();

    const customMatch = customStages.find(cs =>
      cs.brand === brand &&
      cs.model === model &&
      (cs.engine === engine || cs.engine === rawEngineName)
    );

    if (customMatch) {
      const stageNameLower = selectedPackage.name.toLowerCase();
      if (stageNameLower.includes('stage 1') && customMatch.stage1HP) {
        customHP = Number(customMatch.stage1HP);
      } else if (stageNameLower.includes('stage 2') && customMatch.stage2HP) {
        customHP = Number(customMatch.stage2HP);
      } else if (stageNameLower.includes('stage 3') && customMatch.stage3HP) {
        customHP = Number(customMatch.stage3HP);
      }
    }
  }

  const newHP = currentHP && selectedPackage
    ? (customHP !== null ? customHP : Math.round(currentHP * (1 + (selectedPackage.gainPercent || 0) / 100)))
    : null;

  const gainPercentToDisplay = currentHP && newHP && customHP !== null
    ? Math.round(((newHP - currentHP) / currentHP) * 100)
    : (selectedPackage?.gainPercent || 0);

  const handleHesapla = () => {
    if (!currentHP || !selectedPackage) return;
    setShowResult(true);
    setAnimating(false);
    setTimeout(() => setAnimating(true), 100);
  };

  const fuelTypes = ['Benzin', 'Dizel', 'Hybrid', 'Elektrik', 'LPG'];

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Chiptuning',
    description: 'AES Garage profesyonel chiptuning hizmeti. Stage 1, Stage 2, Stage 3 paketler ile motor performansınızı artırın.',
    provider: { '@type': 'AutoRepair', name: 'AES Garage' }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Chiptuning"
        description="AES Garage profesyonel chiptuning hizmeti. ECU yazılım güncellemesi ile araç performansını artırın. Stage 1, Stage 2, Stage 3 paketleri. Beygir gücü hesaplama."
        path="/chiptuning"
        keywords="chiptuning, ECU yazılım, motor performans, beygir güç artışı, stage 1 stage 2, araç chip, İstanbul chiptuning"
        schema={schemaData}
      />

      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1920&q=80"
            alt="Chiptuning"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 border border-white/30">
              <span className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] font-light">PERFORMANS OPTİMİZASYONU</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-tight mb-4 sm:mb-6">
            CHİPTUNİNG
            <br />
            <span className="text-red-600">PERFORMANS</span>
          </h1>
          <p className="text-sm sm:text-lg font-light text-gray-300 max-w-2xl mx-auto">
            Araç ECU yazılımını optimize ederek motor performansınızı artırın
          </p>
        </div>
      </section>

      {/* Bilgi Başlıkları */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 border-b border-dark-900">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 sm:gap-8 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-light text-red-500 mb-1">+%35</div>
            <div className="text-xs sm:text-sm font-light text-gray-500 tracking-wider">GÜCE KADAR ARTIŞ</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-light text-red-500 mb-1">3</div>
            <div className="text-xs sm:text-sm font-light text-gray-500 tracking-wider">FARKLI PAKET</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-light text-red-500 mb-1">100%</div>
            <div className="text-xs sm:text-sm font-light text-gray-500 tracking-wider">GÜVENLI UYGULAMA</div>
          </div>
        </div>
      </section>

      {/* Ana Form + Sonuç */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20 mb-4">
              <span className="text-[10px] sm:text-xs tracking-[0.3em] font-light">ARAÇ SEÇİMİ</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-light tracking-tight">
              ARACINIZI SEÇİN
            </h2>
            <p className="text-sm font-light text-gray-500 mt-3">
              Aracınızın bilgilerini girerek kazanacağınız beygir gücünü hesaplayın
            </p>
          </div>

          <div className="space-y-6">
            {/* Marka Seçimi */}
            <div>
              <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MARKA</label>
              <select
                value={brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full bg-black border border-dark-900 hover:border-dark-700 px-4 py-4 text-sm focus:border-white focus:outline-none transition-colors font-light"
              >
                <option value="">Marka seçin</option>
                {Object.keys(combinedDb).sort().map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Model Seçimi */}
            {brand && (
              <div className="animate-fade-in">
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MODEL</label>
                <select
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full bg-black border border-dark-900 hover:border-dark-700 px-4 py-4 text-sm focus:border-white focus:outline-none transition-colors font-light"
                >
                  <option value="">Model seçin</option>
                  {availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Yıl Girişi */}
            {model && (
              <div className="animate-fade-in">
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">YIL (OPSİYONEL)</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Örn: 2020"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className="w-full bg-black border border-dark-900 hover:border-dark-700 px-4 py-4 text-sm focus:border-white focus:outline-none transition-colors font-light placeholder:text-gray-700"
                />
              </div>
            )}

            {/* Yakıt Tipi */}
            {model && allEngines.length > 0 && (
              <div className="animate-fade-in">
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">YAKIT TİPİ (OPSİYONEL)</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {fuelTypes.map(f => {
                    const hasEngines = f === fuel
                      ? true
                      : allEngines.some(e => detectFuelType(e) === f);
                    if (!hasEngines && f !== 'LPG') return null;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => handleFuelChange(fuel === f ? '' : f)}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3 border font-light tracking-wider text-xs sm:text-sm transition-all ${fuel === f
                          ? 'border-red-600 bg-red-600/10 text-white'
                          : 'border-dark-800 text-gray-500 hover:border-gray-600 hover:text-white'
                          }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Motor Seçimi */}
            {model && (
              <div className="animate-fade-in">
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">MOTOR</label>
                {filteredEngines.length > 0 ? (
                  <select
                    value={engine}
                    onChange={(e) => handleEngineChange(e.target.value)}
                    className="w-full bg-black border border-dark-900 hover:border-dark-700 px-4 py-4 text-sm focus:border-white focus:outline-none transition-colors font-light"
                  >
                    <option value="">Motor seçin</option>
                    {filteredEngines.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                ) : (
                  <div className="border border-dark-900 px-4 py-4 text-sm text-gray-600 font-light">
                    {fuel
                      ? `${fuel} tipinde motor bulunamadı. Yakıt filtresini kaldırmayı deneyin.`
                      : 'Bu model için motor bilgisi bulunamadı.'}
                  </div>
                )}
              </div>
            )}

            {/* Chiptuning Paket Seçimi */}
            {engine && currentHP && (
              <div className="animate-fade-in space-y-4">
                <label className="block text-xs tracking-widest font-light text-gray-500 mb-3">CHİPTUNİNG PAKETİ</label>

                {/* Mevcut HP göstergesi */}
                <div className="border border-dark-800 p-4 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></div>
                  <div>
                    <div className="text-xs text-gray-500 font-light tracking-wider mb-1">MEVCUT GÜÇÜNÜZ</div>
                    <div className="text-xl font-light text-white">{currentHP} HP</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {chipPackages.map((pkg) => {
                    const isSelected = selectedPackage && selectedPackage.name === pkg.name;
                    return (
                      <button
                        key={pkg.name}
                        type="button"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setShowResult(false);
                          setAnimating(false);
                        }}
                        className={`p-4 sm:p-5 border text-left transition-all duration-300 ${isSelected
                          ? 'border-red-600 bg-red-600/10'
                          : 'border-dark-800 hover:border-red-900'
                          }`}
                      >
                        <div className="text-base sm:text-lg font-light tracking-wider mb-1">{pkg.name}</div>
                        <div className="text-red-500 text-sm font-light mb-2">
                          Seç & İncele
                        </div>
                        {pkg.description && (
                          <div className="text-gray-500 text-xs font-light mb-3">{pkg.description}</div>
                        )}
                        {(pkg.priceMin || pkg.priceMax) && (
                          <div className="text-[10px] tracking-widest text-gray-600 font-light border-t border-dark-800 pt-2 mt-2">
                            {Number(pkg.priceMin).toLocaleString('tr-TR')} - {Number(pkg.priceMax).toLocaleString('tr-TR')} ₺
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hesapla Butonu */}
            {engine && currentHP && selectedPackage && !showResult && (
              <div className="animate-fade-in">
                <button
                  type="button"
                  onClick={handleHesapla}
                  className="w-full py-4 sm:py-5 border border-red-600 hover:bg-red-600 text-white font-light tracking-[0.2em] text-sm transition-all duration-300"
                >
                  PERFORMANSI HESAPLA
                </button>
              </div>
            )}
          </div>

          {/* Sonuç: SVG Hız Göstergesi */}
          {showResult && currentHP && newHP && (
            <div className="mt-12 sm:mt-16 animate-fade-in">
              <div className="border border-dark-800 p-6 sm:p-10">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="text-xs tracking-[0.3em] font-light text-gray-500 mb-2">PERFORMANS ANALİZİ</div>
                  <h3 className="text-xl sm:text-2xl font-light tracking-wider">
                    {brand} {model} {year && `(${year})`}
                  </h3>
                  <p className="text-sm font-light text-gray-500 mt-1">{engine} — {selectedPackage.name}</p>
                </div>

                {/* Speedometer */}
                <div className="max-w-sm mx-auto mb-6 sm:mb-8">
                  <SpeedometerGauge
                    currentHP={currentHP}
                    newHP={newHP}
                    animate={animating}
                  />
                </div>

                {/* HP Karşılaştırma */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center mb-6 sm:mb-8">
                  <div className="border border-dark-800 p-4 sm:p-6">
                    <div className="text-[10px] tracking-widest text-gray-600 font-light mb-2">MEVCUT GÜÇ</div>
                    <div className="text-2xl sm:text-3xl font-light text-gray-400">{currentHP}</div>
                    <div className="text-xs text-gray-600 font-light">HP</div>
                  </div>
                  <div className="border border-red-600/30 bg-red-600/5 p-4 sm:p-6 flex flex-col items-center justify-center">
                    <div className="text-red-500 text-2xl sm:text-3xl font-light">+{newHP - currentHP}</div>
                    <div className="text-xs text-red-500/60 font-light">HP ARTIŞ</div>
                  </div>
                  <div className="border border-orange-500/30 bg-orange-500/5 p-4 sm:p-6">
                    <div className="text-[10px] tracking-widest text-gray-600 font-light mb-2">YENİ GÜÇ</div>
                    <div className="text-2xl sm:text-3xl font-light text-orange-400">{newHP}</div>
                    <div className="text-xs text-orange-500/60 font-light">HP</div>
                  </div>
                </div>

                {/* Paket Özeti */}
                <div className="border border-dark-800 p-4 sm:p-6 mb-6 sm:mb-8 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-light">Paket</span>
                    <span className="font-light">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-light">Güç Artışı</span>
                    <span className="font-light text-red-400">+{gainPercentToDisplay}% (+{newHP - currentHP} HP)</span>
                  </div>
                  {selectedPackage.description && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-light">Kapsam</span>
                      <span className="font-light text-right ml-4">{selectedPackage.description}</span>
                    </div>
                  )}
                  {(selectedPackage.priceMin || selectedPackage.priceMax) && (
                    <div className="flex justify-between items-center text-sm border-t border-dark-800 pt-3">
                      <span className="text-gray-500 font-light">Fiyat Aralığı</span>
                      <span className="font-light">
                        {Number(selectedPackage.priceMin).toLocaleString('tr-TR')} - {Number(selectedPackage.priceMax).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Butonları */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link
                    to={`/randevu?service=Chiptuning&brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&engine=${encodeURIComponent(engine)}&chipPackage=${encodeURIComponent(selectedPackage.name)}`}
                    className="flex-1 group relative overflow-hidden py-4 border border-red-600 text-center transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    <span className="relative text-xs sm:text-sm tracking-[0.2em] font-light">RANDEVU AL</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResult(false);
                      setAnimating(false);
                      setSelectedPackage(null);
                    }}
                    className="flex-1 py-4 border border-dark-800 hover:border-white text-xs sm:text-sm tracking-[0.2em] font-light transition-all duration-300"
                  >
                    YENİDEN HESAPLA
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Alt Bilgi Bölümü */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-black via-dark-900/50 to-black border-t border-dark-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-light tracking-tight mb-6 sm:mb-8">
            NEDEN
            <span className="text-gray-400"> AES GARAGE CHIPTUNING?</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
            {[
              { title: 'Uzman Kadro', desc: 'Alanında uzman teknisyenler ve ECU uzmanlarıyla profesyonel uygulama' },
              { title: 'Güvenli İşlem', desc: 'Araç garantisine uygun, geri alınabilir yazılım uygulaması' },
              { title: 'Performans Testi', desc: 'Uygulama öncesi ve sonrası dinamometre testi ile sonuç garantisi' },
            ].map((item) => (
              <div key={item.title} className="border border-dark-800 p-6 text-left">
                <div className="w-8 h-[1px] bg-red-600 mb-4"></div>
                <h3 className="text-sm font-light tracking-wider mb-3">{item.title}</h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link
            to="/randevu?service=Chiptuning"
            className="inline-block group relative overflow-hidden px-10 sm:px-16 py-4 sm:py-5 border border-red-600"
          >
            <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] font-light">
              HEMEN RANDEVU AL
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Chiptuning;
