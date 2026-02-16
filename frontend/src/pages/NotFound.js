import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <SEOHead
        title="Sayfa Bulunamadi - 404"
        description="Aradiginiz sayfa bulunamadi. AES Garage ana sayfasina donerek devam edebilirsiniz."
        path="/404"
      />
      <div className="text-center max-w-2xl">
        <div className="text-[150px] md:text-[200px] font-light leading-none text-dark-800 select-none">404</div>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4 -mt-8">SAYFA BULUNAMADI</h1>
        <p className="text-gray-500 font-light mb-12">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="group relative overflow-hidden px-10 py-4 border border-red-600">
            <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative text-sm tracking-[0.2em] font-light">ANA SAYFA</span>
          </Link>
          <Link to="/contact" className="px-10 py-4 border border-dark-800 hover:border-white transition-colors text-sm tracking-[0.2em] font-light">
            İLETİŞİM
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
