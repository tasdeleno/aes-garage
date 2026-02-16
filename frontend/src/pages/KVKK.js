import React from 'react';
import SEOHead from '../components/SEOHead';

function KVKK() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6 pb-20">
      <SEOHead
        title="KVKK Aydınlatma Metni"
        description="AES Garage KVKK Aydınlatma Metni. 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında haklarınız ve veri işleme politikamız."
        path="/kvkk"
        keywords="KVKK, kişisel verilerin korunması, aydınlatma metni, AES Garage gizlilik"
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light tracking-tight mb-6">KVKK AYDINLATMA METNİ</h1>
          <p className="text-gray-500 font-light">Kişisel Verilerin Korunması Kanunu</p>
        </div>

        <div className="space-y-12 text-gray-400 font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-light text-white mb-4 tracking-wider">1. VERİ SORUMLUSU</h2>
            <p>
              AES Garage olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında,
              kişisel verilerinizin korunmasına büyük önem vermekteyiz. Bu aydınlatma metni, kişisel
              verilerinizin işlenme amaçları, hukuki nedenleri, toplanma yöntemleri ve haklarınız
              konusunda sizi bilgilendirmek amacıyla hazırlanmıştır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4 tracking-wider">2. İŞLENEN KİŞİSEL VERİLER</h2>
            <p className="mb-4">Tarafımızca aşağıdaki kişisel verileriniz işlenmektedir:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>Kimlik bilgileri (ad, soyad)</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>İletişim bilgileri (telefon numarası, e-posta adresi)</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>Araç bilgileri (marka, model, yıl, motor tipi)</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>Randevu bilgileri (tarih, saat, talep edilen hizmet)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4 tracking-wider">3. VERİ İŞLEME AMAÇLARI</h2>
            <p className="mb-4">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>Randevu oluşturma ve yönetimi</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>Servis hizmetlerinin sunulması</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>Müşteri memnuniyeti ve iletişim</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>Yasal yükümlülüklerin yerine getirilmesi</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4 tracking-wider">4. VERİ AKTARIMI</h2>
            <p>
              Kişisel verileriniz, yukarıda belirtilen amaçlar doğrultusunda, gerekli güvenlik
              önlemleri alınarak, iş ortaklarımıza, tedarikçilerimize ve yasal zorunluluk halinde
              yetkili kamu kurum ve kuruluşlarına aktarılabilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4 tracking-wider">5. VERİ SAKLAMA SÜRESİ</h2>
            <p>
              Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca ve ilgili mevzuatta
              öngörülen zamanaşımı süreleri boyunca saklanacaktır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4 tracking-wider">6. HAKLARINIZ</h2>
            <p className="mb-4">KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>İşlenmişse buna ilişkin bilgi talep etme</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>Eksik veya yanlış işlenmişse düzeltilmesini isteme</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1 h-1 bg-red-600 mt-2 flex-shrink-0"></div>
                <span>İşlenen verilerin münhasıran otomatik sistemler aracılığıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4 tracking-wider">7. İLETİŞİM</h2>
            <p>
              KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki iletişim bilgilerinden
              bize ulaşabilirsiniz:
            </p>
            <div className="mt-4 p-6 border border-dark-800">
              <p className="mb-2"><span className="text-white">E-posta:</span> info@aesgarage.com</p>
              <p className="mb-2"><span className="text-white">Telefon:</span> +90 555 123 45 67</p>
              <p><span className="text-white">Adres:</span> İstanbul, Türkiye</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default KVKK;
