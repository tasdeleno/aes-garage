import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SEOHead from '../components/SEOHead';

const API = process.env.REACT_APP_API_URL || '';

// Mock Veriler - (Daha sonra backend'e bağlanacak, bağlanamazsa fallback olarak kullanılacak)
const mockPricing = {
    basePrice: 1500, // TL
    vehicleMultipliers: { sedan: 1, hatchback: 1, suv: 1.2, pickup: 1.3, luks: 1.5 },
    damageMultipliers: { '1-5': 1, '5-10': 1.5, '10-20': 2.5, '20+': 4 }
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
    const [vehicleType, setVehicleType] = useState('sedan');
    const [damageSize, setDamageSize] = useState('1-5');
    const [calculatedPrice, setCalculatedPrice] = useState(null);

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

                // Eğer pricingRes data object dönmüşse al, yoksa mock
                if (pricingRes.data && pricingRes.data.basePrice) {
                    setPricingParams(pricingRes.data);
                } else {
                    setPricingParams(mockPricing);
                }
            } catch (error) {
                console.error("Veri çekme hatası (Mock kullanılıyor):", error);
                setGallery(mockGallery);
                setPricingParams(mockPricing);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Hesaplama Mantığı
        if (pricingParams) {
            const base = pricingParams.basePrice || 1500;
            const vMult = pricingParams.vehicleMultipliers?.[vehicleType] || 1;
            const dMult = pricingParams.damageMultipliers?.[damageSize] || 1;

            const result = base * vMult * dMult;
            setCalculatedPrice(Math.round(result));
        }
    }, [vehicleType, damageSize, pricingParams]);


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
                                                {['sedan', 'hatchback', 'suv', 'pickup', 'luks'].map(type => (
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
                                        </div>

                                        <div>
                                            <label className="block text-[10px] sm:text-xs tracking-[0.2em] font-light text-gray-400 mb-3">HASAR BOYUTU (Çap)</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {['1-5', '5-10', '10-20', '20+'].map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setDamageSize(size)}
                                                        className={`py-3 border text-xs sm:text-sm font-light transition-all duration-300 ${damageSize === size
                                                            ? 'border-red-500 bg-red-600/10 text-white'
                                                            : 'border-dark-700 hover:border-dark-500 text-gray-400'
                                                            }`}
                                                    >
                                                        {size} cm
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sağ Taraf Sonuç */}
                                    <div className="flex flex-col justify-center items-center p-8 bg-dark-950 border border-dark-800 rounded-xl relative">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/5 rounded-xl pointer-events-none"></div>
                                        <span className="text-[10px] sm:text-xs tracking-[0.3em] font-light text-gray-500 mb-4">TAHMİNİ TUTAR</span>

                                        <div className="flex items-baseline mb-6 space-x-2">
                                            {loading ? (
                                                <div className="h-16 w-32 bg-dark-800 animate-pulse rounded"></div>
                                            ) : (
                                                <>
                                                    <span className="text-sm font-light text-gray-400">~</span>
                                                    <span className="text-5xl sm:text-7xl font-light text-white tracking-tighter">{calculatedPrice}</span>
                                                    <span className="text-xl sm:text-2xl font-light text-red-500">₺</span>
                                                </>
                                            )}
                                        </div>

                                        <p className="text-[10px] sm:text-xs text-center text-gray-500 font-light mb-8 max-w-xs">
                                            *Bu fiyat tahmini olup, hasarın tam konumu ve derinliğine göre net fiyat servisimizde uzman kontrolü sonrası verilecektir.
                                        </p>

                                        <Link
                                            to="/randevu"
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
