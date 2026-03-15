import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getSettings } from '../utils/settingsCache';
import slugify from '../utils/slugify';
import SEOHead from '../components/SEOHead';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [detailContent, setDetailContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSettings(API);
        const general = {};
        data.forEach(setting => {
          if (setting.category === 'general') {
            general[setting.key] = setting.value;
          }
        });

        let services = [];
        try {
          if (general.servicesList) {
            const parsed = JSON.parse(general.servicesList);
            if (Array.isArray(parsed)) {
              services = parsed.filter(s => s && s.title && s.title.trim());
            }
          }
        } catch (e) {
          console.error('servicesList parse error:', e);
        }

        const found = services.find(s => slugify(s.title) === slug);
        if (!found) {
          navigate('/hizmetler', { replace: true });
          return;
        }
        setService(found);

        try {
          const res = await axios.get(`${API}/api/service-details/${slug}`);
          setDetailContent(res.data.content || '');
        } catch (e) {
          console.error('Detail content fetch error:', e);
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/hizmetler', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="h-[50vh] bg-dark-900 animate-pulse" />
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
          <div className="h-12 bg-dark-800 rounded w-64 mx-auto animate-pulse" />
          <div className="h-6 bg-dark-800 rounded w-full animate-pulse" />
          <div className="h-6 bg-dark-800 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!service) return null;

  const appointmentUrl = `/randevu?service=${encodeURIComponent(service.title)}`;

  const AppointmentButton = () => (
    <div className="flex justify-center py-8">
      <Link
        to={appointmentUrl}
        className="group relative overflow-hidden px-10 sm:px-14 py-4 sm:py-5 border border-red-600"
      >
        <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        <span className="relative text-sm sm:text-base tracking-[0.2em] font-light text-white">
          BU HİZMET İÇİN RANDEVU AL
        </span>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title={service.title}
        description={service.description || `${service.title} hizmeti hakkında detaylı bilgi`}
        path={`/hizmetler/${slug}`}
      />

      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black z-10"></div>
          <img
            src={service.image || 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1920&q=80'}
            alt={service.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Link to="/hizmetler" className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 border border-white/30 hover:border-white/60 transition-colors">
              <span className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] font-light">HİZMETLER</span>
            </Link>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-tight">
            {service.title.toUpperCase()}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Top Appointment Button */}
          <AppointmentButton />

          {/* Detail Content */}
          {detailContent ? (
            <div
              className="service-detail-content prose prose-invert max-w-none my-8 sm:my-12
                prose-headings:font-light prose-headings:tracking-wider
                prose-p:font-light prose-p:text-gray-300 prose-p:leading-relaxed
                prose-li:font-light prose-li:text-gray-300
                prose-a:text-red-500 prose-a:no-underline hover:prose-a:text-red-400
                prose-strong:text-white prose-strong:font-medium
                prose-img:rounded prose-img:border prose-img:border-dark-800"
              dangerouslySetInnerHTML={{ __html: detailContent }}
            />
          ) : (
            <div className="text-center py-16 sm:py-24">
              <div className="w-16 h-16 mx-auto mb-6 border border-dark-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-light text-lg">Bu hizmet için detay içeriği henüz eklenmemiştir.</p>
              <p className="text-gray-600 font-light text-sm mt-2">Daha fazla bilgi için bizimle iletişime geçebilirsiniz.</p>
            </div>
          )}

          {/* Bottom Appointment Button */}
          <AppointmentButton />
        </div>
      </section>
    </div>
  );
}

export default ServiceDetail;
