import { useEffect } from 'react';

const SITE_NAME = 'AES Garage';
const BASE_URL = 'https://aesgarage.com';

/**
 * Vanilla SEO bileşeni - React 19 uyumlu, harici bağımlılık yok.
 * Her sayfa için title, meta, canonical, Open Graph, Twitter Card ve JSON-LD ayarlar.
 */
export default function SEOHead({ title, description, path = '/', schema, keywords }) {
  const fullTitle = path === '/'
    ? `${SITE_NAME} - Premium Araç Bakım & Servis | İstanbul Ataşehir`
    : `${title} | ${SITE_NAME}`;
  const url = `${BASE_URL}${path}`;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Meta helper: varsa güncelle, yoksa oluştur
    const setMeta = (attr, attrValue, content) => {
      let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Description
    setMeta('name', 'description', description);

    // Keywords
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // Robots
    setMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:locale', 'tr_TR');

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);

    // JSON-LD Structured Data
    // Eski script'leri temizle
    document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());

    if (schema) {
      const schemas = Array.isArray(schema) ? schema : [schema];
      schemas.forEach((s, i) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', `seo-${i}`);
        script.textContent = JSON.stringify(s);
        document.head.appendChild(script);
      });
    }

    // Cleanup: Sayfa değiştiğinde JSON-LD'leri temizle
    return () => {
      document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());
    };
  }, [fullTitle, description, url, schema, keywords]);

  return null; // Render edecek bir şey yok, sadece side-effect
}
