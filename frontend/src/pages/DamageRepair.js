import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SEOHead from '../components/SEOHead';

const API = process.env.REACT_APP_API_URL || '';

// Mock Veriler - (Daha sonra backend'e bağlanacak, bağlanamazsa fallback olarak kullanılacak)
const mockPricing = {
    basePrice: 500, // TL
    vehicleMultipliers: { Sedan: 1, SUV: 1.2, Hatchback: 0.9, Pickup: 1.3, Minivan: 1.25 },
    damageCategories: [
        { label: 'Küçük', multiplier: 1, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=300', priceMin: 500, priceMax: 800, description: 'Bozuk para büyüklüğünde ufak göçükler' },
        { label: 'Orta', multiplier: 1.5, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=300', priceMin: 800, priceMax: 1500, description: 'Yumruk büyüklüğünde orta çaplı hasarlar' },
        { label: 'Büyük', multiplier: 2, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=300', priceMin: 1500, priceMax: 3000, description: 'Futbol topu boyutunda veya daha geniş göçükler' }
    ]
};

const mockGallery = [
    {
        _id: '1',
        title: 'Mercedes B180',
        description: 'Sağ kapılardan oluşan hasar boyasız şekilde onarıldı.',
        beforeImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600',
        afterImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600'
    },
    {
        _id: '2',
        title: 'Volkswagen Taigo',
        description: 'Sol ön çamurluktaki hasar boyasız düzeltildi.',
        beforeImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600',
        afterImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600'
    }
];

function DamageRepair() {
    const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'gallery'
    const [gallery, setGallery] = useState([]);
    const [pricingParams, setPricingParams] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fiyat Hesaplama State
    const [vehicleType, setVehicleType] = useState('');
    const [damageSize, setDamageSize] = useState('');
    const [calculatedPrice, setCalculatedPrice] = useState(null);
    const [priceRange, setPriceRange] = useState(null);

    useEffect(() => {
        // API entegrasyonu denenecek, olmazsa mock veri kullanılacak.
        const fetchData = async () => {
            try {
                setLoading(true);
                // Paralel olarak çekimi başlat
                const [galleryRes, pricingRes] = await Promise.all([
                    axios.get(`${API}/api/gallery`).catch(() => ({ data: mockGallery })),
                    axios.get(`${API}/api/damage-pricing`).catch(() => ({ data: mockPricing }))
                ]);

                setGallery(galleryRes.data?.length > 0 ? galleryRes.data : mockGallery);

                const finalPricing = (pricingRes.data && pricingRes.data.basePrice) ? pricingRes.data : mockPricing;
                setPricingParams(finalPricing);

                if (finalPricing.vehicleMultipliers) {
                    setVehicleType(Object.keys(finalPricing.vehicleMultipliers)[0]);
                }
                if (finalPricing.damageCategories && finalPricing.damageCategories.length > 0) {
                    setDamageSize(finalPricing.damageCategories[0].label);
                } else if (finalPricing.damageMultipliers) {
                    // Fallback to old format if necessary
                    setDamageSize(Object.keys(finalPricing.damageMultipliers)[0]);
                }
            } catch (error) {
                console.error("Veri çekme hatası (Mock kullanılıyor):", error);
                setGallery(mockGallery);
                setPricingParams(mockPricing);
                setVehicleType('Sedan');
                setDamageSize('Küçük');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!vehicleType || !damageSize) return;

        const checkPriceFromBackend = async () => {
            try {
                const res = await axios.post(`${API}/api/damage-pricing/calculate`, { vehicleType, damageSize });
                if (res.data && res.data.estimatedPrice) {
                    setCalculatedPrice(res.data.estimatedPrice);
                    if (res.data.priceRange) {
                        setPriceRange(res.data.priceRange);
                    }
                    return;
                }
            } catch (err) {
                console.error("Fiyat hesaplama htası (lokal hesaplama kullanılacak):", err);
            }

            // Eğer backend'den alınamazsa (veya hata verirse) lokal devam et
            if (pricingParams) {
                const base = pricingParams.basePrice || 500;
                const vMult = pricingParams.vehicleMultipliers?.[vehicleType] || 1;
                let dMult = 1;

                if (pricingParams.damageCategories && pricingParams.damageCategories.length > 0) {
                    const cat = pricingParams.damageCategories.find(c => c.label === damageSize);
                    if (cat) {
                        dMult = cat.multiplier;
                        setPriceRange({ min: Math.round(cat.priceMin * vMult), max: Math.round(cat.priceMax * vMult) });
                    }
                } else if (pricingParams.damageMultipliers) {
                    dMult = pricingParams.damageMultipliers[damageSize] || 1;
                    setPriceRange(null);
                }

                const result = base * vMult * dMult;
                setCalculatedPrice(Math.round(result));
            }
        };

        checkPriceFromBackend();
    }, [vehicleType, damageSize, pricingParams]);

    const availableVehicleTypes = pricingParams && pricingParams.vehicleMultipliers ? Object.keys(pricingParams.vehicleMultipliers) : Object.keys(mockPricing.vehicleMultipliers);
    const availableDamageCategories = pricingParams && pricingParams.damageCategories && pricingParams.damageCategories.length > 0
        ? pricingParams.damageCategories
        : mockPricing.damageCategories;


    const repairSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Boyasız Göçük Düzeltme',
        provider: {
            '@type': 'AutoRepair',
            name: 'AES Garage'
        },
        description: 'Aracınızın değerini düşürmeden boyasız göçük düzeltme hizmeti.'
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 sm:pt-32">
            <SEOHead
                title="Boyasız Hasar Onarım | Göçük Düzeltme"
                description="Fiyat belirsizliğinden kurtulun! Aracınızdaki göçükleri değer kaybı yaşamadan boyasız onarıyoruz."
                path="/hasar-onarimi"
                keywords="boyasız göçük düzeltme, hasar onarımı, park hasarı, değer kaybı, ataşehir göçük düzeltme"
                schema={repairSchema}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Başlık Alanı */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 border border-red-600/30 mb-6 bg-red-900/10">
                        <span className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] font-light text-red-500">DEĞER KAYBI YAŞAMAYIN</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight mb-4">
                        BOYASIZ
                        <br />
                        <span className="text-gray-400">HASAR ONARIMI</span>
                    </h1>
                    <p className="text-sm sm:text-base font-light text-gray-400 max-w-2xl mx-auto px-2">
                        Orijinalliği bozulmadan, sihirli dokunuşlarla aracınızı ilk günkü haline döndürüyoruz.
                    </p>
                </div>

                {/* Sekmeler Tab Menü */}
                <div className="flex justify-center mb-10 sm:mb-16">
                    <div className="flex space-x-2 sm:space-x-4 p-1 bg-dark-900/50 border border-dark-800 rounded-lg">
                        <button
                            onClick={() => setActiveTab('calculator')}
                            className={`px-4 sm:px-8 py-3 text-xs sm:text-sm font-light tracking-widest rounded-md transition-all duration-300 ${activeTab === 'calculator'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : 'text-gray-400 hover:text-white hover:bg-dark-800'
                                }`}
                        >
                            HESAPLAMA ARACI
                        </button>
                        <button
                            onClick={() => setActiveTab('gallery')}
                            className={`px-4 sm:px-8 py-3 text-xs sm:text-sm font-light tracking-widest rounded-md transition-all duration-300 ${activeTab === 'gallery'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : 'text-gray-400 hover:text-white hover:bg-dark-800'
                                }`}
                        >
                            ÖNCE & SONRA
                        </button>
                    </div>
                </div>

                {/* Tab İçerikleri */}
                <div className="mb-20">

                    {/* HESAPLAYICI TAB TAB */}
                    {activeTab === 'calculator' && (
                        <div className="max-w-4xl mx-auto animate-fade-in-up">
                            <div className="bg-gradient-to-br from-dark-900 to-black border border-dark-800 p-6 sm:p-10 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <div className="text-center mb-10">
                                    <h2 className="text-xl sm:text-2xl font-light tracking-widest mb-2">FİYAT HESAPLAMA</h2>
                                    <p className="text-xs sm:text-sm text-gray-500 font-light">Sizi fiyat belirsizliğinden kurtarıyoruz.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 relative z-10">

                                    {/* Sol Taraf Form */}
                                    <div className="space-y-6 sm:space-y-8">
                                        <div>
                                            <label className="block text-[10px] sm:text-xs tracking-[0.2em] font-light text-gray-400 mb-3">ARAÇ TİPİ</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {availableVehicleTypes.map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setVehicleType(type)}
                                                        className={`py-3 border text-xs sm:text-sm font-light uppercase tracking-wider transition-all duration-300 ${vehicleType === type
                                                            ? 'border-red-500 bg-red-600/10 text-white'
                                                            : 'border-dark-700 hover:border-dark-500 text-gray-400'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="pt-2 border-t border-dark-800 mt-6">
                                                <label className="block text-[10px] sm:text-xs tracking-[0.2em] font-light text-gray-400 mb-3">HASAR KATEGORİSİ</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    {availableDamageCategories.map(cat => (
                                                        <button
                                                            key={cat.label}
                                                            onClick={() => setDamageSize(cat.label)}
                                                            className={`text-left group overflow-hidden border transition-all duration-300 ${damageSize === cat.label
                                                                ? 'border-red-500 bg-red-600/10'
                                                                : 'border-dark-700 bg-dark-900/50 hover:border-dark-500'
                                                                }`}
                                                        >
                                                            {cat.image && (
                                                                <div className="h-24 w-full overflow-hidden border-b border-dark-700/50 relative">
                                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                                                    <img src={cat.image} alt={cat.label} className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700" />
                                                                </div>
                                                            )}
                                                            <div className="p-3">
                                                                <span className={`block text-xs font-light uppercase tracking-wider mb-1 ${damageSize === cat.label ? 'text-white' : 'text-gray-300'}`}>
                                                                    {cat.label}
                                                                </span>
                                                                <span className="block text-[10px] text-gray-500 font-light line-clamp-2">
                                                                    {cat.description || 'Bu hasar tipi için açıklama bulunmuyor.'}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sağ Taraf Sonuç */}
                                    <div className="flex flex-col justify-center items-center p-8 bg-dark-950 border border-dark-800 rounded-xl relative">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/5 rounded-xl pointer-events-none"></div>
                                        <span className="text-[10px] sm:text-xs tracking-[0.3em] font-light text-gray-500 mb-4">TAHMİNİ TUTAR</span>

                                        <div className="flex flex-col items-center mb-6">
                                            {loading ? (
                                                <div className="h-16 w-32 bg-dark-800 animate-pulse rounded my-2"></div>
                                            ) : (
                                                <>
                                                    <div className="flex items-baseline space-x-2">
                                                        <span className="text-sm font-light text-gray-400">~</span>
                                                        <span className="text-5xl sm:text-7xl font-light text-white tracking-tighter">{calculatedPrice}</span>
                                                        <span className="text-xl sm:text-2xl font-light text-red-500">₺</span>
                                                    </div>

                                                    {priceRange && priceRange.min > 0 && (
                                                        <div className="mt-2 px-3 py-1 bg-dark-900 border border-dark-700 rounded-full">
                                                            <span className="text-[10px] text-gray-400 font-light tracking-wider uppercase">
                                                                Tahmini Aralık: {priceRange.min}₺ - {priceRange.max}₺
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <p className="text-[10px] sm:text-xs text-center text-gray-500 font-light mb-8 max-w-xs">
                                            *Bu fiyat tahmini olup, hasarın tam konumu ve derinliğine göre net fiyat servisimizde uzman kontrolü sonrası verilecektir.
                                        </p>

                                        <Link
                                            to={`/randevu?service=Boyasız Hasar Onarım&vehicleType=${encodeURIComponent(vehicleType)}&damageSize=${encodeURIComponent(damageSize)}&estimatedPrice=${calculatedPrice}`}
                                            className="w-full py-4 border border-red-600 bg-red-600/10 hover:bg-red-600 text-white transition-all duration-500 text-xs sm:text-sm font-light tracking-[0.2em] flex items-center justify-center space-x-3 group"
                                        >
                                            <span>HEMEN RANDEVU AL</span>
                                            <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GALERİ TAB */}
                    {activeTab === 'gallery' && (
                        <div className="animate-fade-in-up">
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-80 bg-dark-900 animate-pulse rounded-lg"></div>
                                    ))}
                                </div>
                            ) : gallery.length === 0 ? (
                                <div className="text-center text-gray-500 py-20 font-light">
                                    Henüz öncesi/sonrası gönderisi eklenmemiş.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {gallery.map((item) => (
                                        <div key={item._id} className="group relative overflow-hidden bg-gradient-to-b from-dark-900 to-black border border-dark-800 rounded-xl hover:border-red-900/50 transition-all duration-500">
                                            {/* Resim Kıyaslama Alanı (Şimdilik yan yana veya alt alta basit gösterim. İstenirse Slider eklenebilir) */}
                                            <div className="relative h-48 sm:h-56 overflow-hidden flex">
                                                <div className="w-1/2 h-full relative border-r border-dark-800/50">
                                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] tracking-widest text-gray-300 z-10">ÖNCESİ</div>
                                                    <img src={item.beforeImage} alt="Öncesi" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                                <div className="w-1/2 h-full relative">
                                                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-600/80 backdrop-blur-md rounded text-[9px] tracking-widest text-white z-10">SONRASI</div>
                                                    <img src={item.afterImage} alt="Sonrası" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 origin-left" />
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <h3 className="text-lg sm:text-xl font-light tracking-wide mb-2">{item.title}</h3>
                                                <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

export default DamageRepair;
