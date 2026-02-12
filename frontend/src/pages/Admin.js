import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const [loading, setLoading] = useState(false);
  
  const [appointments, setAppointments] = useState([]);
  
  const [images, setImages] = useState({
    heroImage: '',
    logo: '',
    service1: '',
    service2: '',
    service3: '',
    service4: '',
    service5: '',
    service6: '',
    service7: '',
    service8: ''
  });

  const [serviceTitles, setServiceTitles] = useState({
    service1: 'Periyodik Bakım',
    service2: 'Motor Bakımı',
    service3: 'Fren Bakımı',
    service4: 'Lastik Değişimi',
    service5: 'Klima Bakımı',
    service6: 'Elektrik Sistemleri',
    service7: 'Kaporta & Boya',
    service8: 'Mekanik Onarım'
  });

  const [serviceDescriptions, setServiceDescriptions] = useState({
    service1: 'Aracınızın düzenli bakım ihtiyaçlarını karşılayan kapsamlı servis programı',
    service2: 'Motorun maksimum performans ve verimlilikte çalışması için uzman bakım',
    service3: 'Güvenliğiniz için kritik öneme sahip fren sisteminin profesyonel bakımı',
    service4: 'Sürüş güvenliği ve konforu için profesyonel lastik bakımı',
    service5: 'Konforlu sürüş için klima sisteminin bakımı ve onarımı',
    service6: 'Modern araçların karmaşık elektrik sistemlerinin profesyonel bakımı',
    service7: 'Aracınızın dış görünümünü yenileyen profesyonel kaporta hizmetleri',
    service8: 'Tüm mekanik arızalar için kapsamlı teşhis ve onarım hizmetleri'
  });

  const [uploadingImage, setUploadingImage] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Yanlış şifre!');
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings');
      const imageSettings = {};
      const titleSettings = {};
      const descSettings = {};
      
      response.data.forEach(setting => {
        if (setting.category === 'images') {
          imageSettings[setting.key] = setting.value;
        } else if (setting.category === 'serviceTitles') {
          titleSettings[setting.key] = setting.value;
        } else if (setting.category === 'serviceDescriptions') {
          descSettings[setting.key] = setting.value;
        }
      });
      
      if (Object.keys(imageSettings).length > 0) {
        setImages(prev => ({ ...prev, ...imageSettings }));
      }
      if (Object.keys(titleSettings).length > 0) {
        setServiceTitles(prev => ({ ...prev, ...titleSettings }));
      }
      if (Object.keys(descSettings).length > 0) {
        setServiceDescriptions(prev => ({ ...prev, ...descSettings }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      fetchSettings();
    }
  }, [isAuthenticated]);

  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm('Silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/appointments/${id}`);
        fetchAppointments();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleImageUpload = async (key, file) => {
    if (!file) return;

    setUploadingImage(key);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const uploadResponse = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await axios.post('http://localhost:5000/api/settings', {
        key: key,
        value: uploadResponse.data.url,
        category: 'images'
      });

      setImages({ ...images, [key]: uploadResponse.data.url });
      alert('Fotoğraf başarıyla yüklendi!');
    } catch (error) {
      console.error('Error:', error);
      alert('Hata oluştu!');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleTitleChange = async (key, value) => {
  try {
    console.log('💾 Saving title:', key, value);
    const response = await axios.post('http://localhost:5000/api/settings', {
      key: key,
      value: value,
      category: 'serviceTitles'
    });
    console.log('✅ Title saved:', response.data);
  } catch (error) {
    console.error('❌ Error saving title:', error.response?.data || error.message);
    alert('Başlık kaydedilemedi: ' + (error.response?.data?.message || error.message));
  }
};

  const handleDescriptionChange = async (key, value) => {
  try {
    console.log('💾 Saving description:', key, value);
    const response = await axios.post('http://localhost:5000/api/settings', {
      key: key,
      value: value,
      category: 'serviceDescriptions'
    });
    console.log('✅ Description saved:', response.data);
  } catch (error) {
    console.error('❌ Error saving description:', error.response?.data || error.message);
    alert('Açıklama kaydedilemedi: ' + (error.response?.data?.message || error.message));
  }
};

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light tracking-tight mb-2">ADMİN PANELİ</h1>
            <p className="text-gray-400 font-light">Giriş yapın</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs tracking-widest font-light text-gray-400 mb-3">ŞİFRE</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-dark-800 px-6 py-4 focus:border-red-600 focus:outline-none transition-colors font-light"
                placeholder="Şifrenizi girin"
              />
            </div>

            {error && (
              <div className="p-4 border border-red-600/30 bg-red-600/10">
                <p className="text-red-400 font-light text-sm">{error}</p>
              </div>
            )}

            <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-light tracking-widest text-sm transition-all">
              GİRİŞ YAP
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-light tracking-tight">ADMİN PANELİ</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-6 py-2 border border-dark-800 hover:border-red-600 text-sm font-light tracking-wider transition-colors"
          >
            ÇIKIŞ
          </button>
        </div>

        <div className="flex space-x-4 mb-8 border-b border-dark-800">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-4 px-6 font-light tracking-wider text-sm transition-all ${
              activeTab === 'appointments' ? 'border-b-2 border-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            RANDEVULAR
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`pb-4 px-6 font-light tracking-wider text-sm transition-all ${
              activeTab === 'images' ? 'border-b-2 border-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            FOTOĞRAFLAR & SERVİSLER
          </button>
        </div>

        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light">Randevular ({appointments.length})</h2>
              <button
                onClick={fetchAppointments}
                className="px-6 py-2 border border-dark-800 hover:border-red-600 text-sm font-light tracking-wider transition-colors"
              >
                YENİLE
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400">Yükleniyor...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Henüz randevu yok</div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment._id} className="bg-dark-900 border border-dark-800 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">MÜŞTERİ</div>
                      <div className="font-light">{appointment.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">TELEFON</div>
                      <div className="font-light">{appointment.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">HİZMET</div>
                      <div className="font-light">{appointment.service}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">TARİH & SAAT</div>
                      <div className="font-light">
                        {new Date(appointment.date).toLocaleDateString('tr-TR')} - {appointment.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dark-800">
                    <select
                      value={appointment.status}
                      onChange={(e) => updateAppointmentStatus(appointment._id, e.target.value)}
                      className="bg-dark-800 border border-dark-700 px-4 py-2 text-sm focus:border-red-600 focus:outline-none"
                    >
                      <option value="pending">Bekliyor</option>
                      <option value="confirmed">Onaylandı</option>
                      <option value="cancelled">İptal</option>
                    </select>

                    <button
                      onClick={() => deleteAppointment(appointment._id)}
                      className="px-4 py-2 border border-red-600/30 text-red-400 hover:bg-red-600/10 text-sm font-light transition-colors"
                    >
                      SİL
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-light mb-6">Site Fotoğrafları & Servis Bilgileri</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-dark-800 p-6">
                <div className="mb-4">
                  <h3 className="text-sm tracking-widest font-light text-gray-400 mb-2">ANA SAYFA HERO</h3>
                  {images.heroImage && (
                    <img src={images.heroImage} alt="Hero" className="w-full h-48 object-cover mb-4 border border-dark-700" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('heroImage', e.target.files[0])}
                  disabled={uploadingImage === 'heroImage'}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:border file:border-dark-800 file:bg-dark-900 file:text-white file:font-light hover:file:border-red-600 file:transition-colors"
                />
                {uploadingImage === 'heroImage' && <div className="mt-2 text-sm text-gray-400">Yükleniyor...</div>}
              </div>

              <div className="border border-dark-800 p-6">
                <div className="mb-4">
                  <h3 className="text-sm tracking-widest font-light text-gray-400 mb-2">LOGO</h3>
                  {images.logo && (
                    <img src={images.logo} alt="Logo" className="w-full h-48 object-cover mb-4 border border-dark-700" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('logo', e.target.files[0])}
                  disabled={uploadingImage === 'logo'}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:border file:border-dark-800 file:bg-dark-900 file:text-white file:font-light hover:file:border-red-600 file:transition-colors"
                />
                {uploadingImage === 'logo' && <div className="mt-2 text-sm text-gray-400">Yükleniyor...</div>}
              </div>

              {Object.keys(serviceTitles).map((key) => (
  <div key={key} className="border border-dark-800 p-6">
    <div className="mb-4">
      <input
        type="text"
        value={serviceTitles[key]}
        onChange={(e) => setServiceTitles({ ...serviceTitles, [key]: e.target.value })}
        className="w-full bg-transparent border-b border-dark-700 pb-2 mb-3 text-sm tracking-widest font-light text-gray-400 focus:border-red-600 focus:outline-none"
        placeholder="Servis Başlığı"
      />
      <textarea
        value={serviceDescriptions[key]}
        onChange={(e) => setServiceDescriptions({ ...serviceDescriptions, [key]: e.target.value })}
        rows="2"
        className="w-full bg-transparent border-b border-dark-700 pb-2 mb-4 text-xs font-light text-gray-500 focus:border-red-600 focus:outline-none resize-none"
        placeholder="Servis Açıklaması"
      />
      
     <button
  onClick={async () => {
    try {
      await handleTitleChange(key, serviceTitles[key]);
      await handleDescriptionChange(key, serviceDescriptions[key]);
      alert('✅ Servis bilgileri kaydedildi!');
    } catch (error) {
      alert('❌ Hata: ' + error.message);
    }
  }}
  className="w-full py-2 mb-4 bg-red-600 hover:bg-red-700 text-white text-xs font-light tracking-widest transition-all"
>
  METİN BİLGİLERİNİ KAYDET
</button>
```

`Ctrl + S` kaydet.

---

## Test Et

1. Admin → FOTOĞRAFLAR & SERVİSLER
2. **service1** başlığını değiştir: "YENI BAŞLIK TEST"
3. **METİN BİLGİLERİNİ KAYDET**
4. **F12** → Console'a bak

Şunları görmeli:
```
💾 Saving title: service1 YENI BAŞLIK TEST
✅ Title saved: ...
💾 Saving description: service1 ...
✅ Description saved: ...
                    {images[key] && (
                      <img src={images[key]} alt={serviceTitles[key]} className="w-full h-48 object-cover mb-4 border border-dark-700" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(key, e.target.files[0])}
                    disabled={uploadingImage === key}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:border file:border-dark-800 file:bg-dark-900 file:text-white file:font-light hover:file:border-red-600 file:transition-colors"
                  />
                  {uploadingImage === key && <div className="mt-2 text-sm text-gray-400">Yükleniyor...</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;