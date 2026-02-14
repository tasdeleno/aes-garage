import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

const statusLabels = {
  pending: { text: 'Onay Bekliyor', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  confirmed: { text: 'Onaylandı', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  completed: { text: 'Tamamlandı', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  cancelled: { text: 'İptal Edildi', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
};

function TrackAppointment() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const searchByCode = useCallback(async (trackCode) => {
    if (!trackCode.trim()) return;
    setCode(trackCode);
    setLoading(true);
    setError('');
    setAppointment(null);
    setSuccessMsg('');
    setShowCancel(false);
    setShowReschedule(false);

    try {
      const res = await axios.get(`${API}/api/appointments/track/${trackCode.trim()}`);
      setAppointment(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Randevu bulunamadı. Lütfen takip kodunuzu kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, []);

  // URL'den ?code= parametresi varsa otomatik sorgula
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      searchByCode(urlCode);
    }
  }, [searchParams, searchByCode]);

  const handleSearch = async (e) => {
    e.preventDefault();
    searchByCode(code);
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await axios.put(`${API}/api/appointments/cancel/${appointment.trackingCode}`);
      setSuccessMsg('Randevunuz başarıyla iptal edildi.');
      setShowCancel(false);
      // Refresh appointment data
      const res = await axios.get(`${API}/api/appointments/track/${appointment.trackingCode}`);
      setAppointment(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'İptal işlemi başarısız oldu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      setError('Lütfen yeni tarih ve saat seçin.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await axios.put(`${API}/api/appointments/reschedule/${appointment.trackingCode}`, {
        date: rescheduleDate,
        time: rescheduleTime,
      });
      setSuccessMsg('Randevunuz başarıyla güncellendi.');
      setShowReschedule(false);
      setRescheduleDate('');
      setRescheduleTime('');
      // Refresh appointment data
      const res = await axios.get(`${API}/api/appointments/track/${appointment.trackingCode}`);
      setAppointment(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erteleme işlemi başarısız oldu.');
    } finally {
      setActionLoading(false);
    }
  };

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const status = appointment ? statusLabels[appointment.status] || statusLabels.pending : null;
  const isCancelled = appointment?.status === 'cancelled';
  const isCompleted = appointment?.status === 'completed';
  const canModify = !isCancelled && !isCompleted;

  return (
    <div className="min-h-screen bg-black text-white pt-24 sm:pt-32 px-4 sm:px-6 pb-12 sm:pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight mb-4 sm:mb-6">
            RANDEVU TAKİP
          </h1>
          <p className="text-gray-500 font-light text-sm sm:text-base">
            Takip kodunuzu girerek randevunuzun durumunu öğrenebilirsiniz
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Örn: AES-A1B2C3D4"
                className="w-full bg-transparent border border-dark-900 px-4 py-3 sm:px-6 sm:py-4 text-white placeholder-gray-700 focus:border-white focus:outline-none font-light tracking-wider text-center sm:text-left"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-8 py-3 sm:py-4 border border-white hover:bg-white hover:text-black transition-all duration-300 font-light tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
            >
              {loading ? 'ARANIYOR...' : 'SORGULA'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 border border-red-600/30 bg-red-600/10 animate-fade-in">
            <p className="font-light text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 border border-green-600/30 bg-green-600/10 animate-fade-in">
            <p className="font-light text-green-400 text-sm text-center">{successMsg}</p>
          </div>
        )}

        {/* Appointment Details */}
        {appointment && (
          <div className="animate-fade-in">
            {/* Status Badge */}
            <div className="text-center mb-6 sm:mb-8">
              <div className={`inline-block px-6 py-2 border ${status.bg} rounded-none`}>
                <span className={`text-xs tracking-widest font-light ${status.color}`}>
                  {status.text.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Details Card */}
            <div className="border border-dark-900 p-5 sm:p-8 mb-6 sm:mb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-dark-900 pb-4">
                  <span className="text-xs tracking-widest text-gray-500">TAKİP KODU</span>
                  <span className="font-light text-red-400 tracking-wider">{appointment.trackingCode}</span>
                </div>
                <div className="flex justify-between items-center border-b border-dark-900 pb-4">
                  <span className="text-xs tracking-widest text-gray-500">AD SOYAD</span>
                  <span className="font-light">{appointment.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-dark-900 pb-4">
                  <span className="text-xs tracking-widest text-gray-500">HİZMET</span>
                  <span className="font-light text-right max-w-[60%]">{appointment.service}</span>
                </div>
                <div className="flex justify-between items-center border-b border-dark-900 pb-4">
                  <span className="text-xs tracking-widest text-gray-500">TARİH</span>
                  <span className="font-light">
                    {new Date(appointment.date).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs tracking-widest text-gray-500">SAAT</span>
                  <span className="font-light">{appointment.time}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {canModify && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={() => { setShowReschedule(!showReschedule); setShowCancel(false); setError(''); }}
                  className="flex-1 py-3 sm:py-4 border border-white hover:bg-white hover:text-black transition-all duration-300 font-light tracking-widest text-xs sm:text-sm touch-manipulation"
                >
                  TARİH DEĞİŞTİR
                </button>
                <button
                  onClick={() => { setShowCancel(!showCancel); setShowReschedule(false); setError(''); }}
                  className="flex-1 py-3 sm:py-4 border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 font-light tracking-widest text-xs sm:text-sm touch-manipulation"
                >
                  RANDEVU İPTAL
                </button>
              </div>
            )}

            {/* Reschedule Form */}
            {showReschedule && (
              <div className="border border-dark-900 p-5 sm:p-8 mb-6 sm:mb-8 animate-fade-in">
                <h3 className="text-lg sm:text-xl font-light mb-6 tracking-wider">YENİ TARİH SEÇİN</h3>
                <form onSubmit={handleReschedule} className="space-y-6">
                  <div>
                    <label className="block text-xs tracking-widest text-gray-500 mb-3">TARİH</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      min={getMinDate()}
                      required
                      className="w-full bg-transparent border border-dark-900 px-4 py-3 sm:px-6 sm:py-4 text-white focus:border-white focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-gray-500 mb-3">SAAT</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setRescheduleTime(slot)}
                          className={`py-3 border text-sm font-light tracking-wider transition-all duration-300 touch-manipulation ${
                            rescheduleTime === slot
                              ? 'border-white bg-white text-black'
                              : 'border-dark-900 text-gray-400 hover:border-gray-600 hover:text-white'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowReschedule(false); setError(''); }}
                      className="flex-1 py-3 sm:py-4 border border-dark-900 text-gray-500 hover:text-white hover:border-gray-600 transition-all duration-300 font-light tracking-widest text-xs sm:text-sm touch-manipulation"
                    >
                      VAZGEÇ
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || !rescheduleDate || !rescheduleTime}
                      className="flex-1 py-3 sm:py-4 border border-white hover:bg-white hover:text-black transition-all duration-300 font-light tracking-widest text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                    >
                      {actionLoading ? 'GÜNCELLENİYOR...' : 'ONAYLA'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Cancel Confirmation */}
            {showCancel && (
              <div className="border border-red-600/20 bg-red-600/5 p-5 sm:p-8 mb-6 sm:mb-8 animate-fade-in">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border border-red-600/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-light mb-2">Randevuyu İptal Et</h3>
                  <p className="text-sm text-gray-500 font-light mb-6">
                    Bu işlem geri alınamaz. Randevu saatinden en az 24 saat önce iptal edilebilir.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowCancel(false); setError(''); }}
                      className="flex-1 py-3 sm:py-4 border border-dark-900 text-gray-500 hover:text-white hover:border-gray-600 transition-all duration-300 font-light tracking-widest text-xs sm:text-sm touch-manipulation"
                    >
                      VAZGEÇ
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="flex-1 py-3 sm:py-4 border border-red-600 bg-red-600 hover:bg-red-700 text-white transition-all duration-300 font-light tracking-widest text-xs sm:text-sm disabled:opacity-50 touch-manipulation"
                    >
                      {actionLoading ? 'İPTAL EDİLİYOR...' : 'EVET, İPTAL ET'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info note for cancelled/completed */}
            {isCancelled && (
              <div className="text-center p-4 border border-dark-900">
                <p className="text-sm text-gray-500 font-light">
                  Bu randevu iptal edilmiştir. Yeni randevu almak için{' '}
                  <Link to="/appointment" className="text-red-400 hover:text-red-300 transition-colors underline">
                    buraya tıklayın
                  </Link>.
                </p>
              </div>
            )}

            {isCompleted && (
              <div className="text-center p-4 border border-dark-900">
                <p className="text-sm text-gray-500 font-light">
                  Bu randevu tamamlanmıştır. Teşekkür ederiz!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state - before search */}
        {!appointment && !error && !loading && (
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 border border-dark-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-light text-sm mb-2">Randevu oluştururken size verilen takip kodunu girin</p>
            <p className="text-gray-700 font-light text-xs">Örnek format: AES-XXXXXXXX</p>
          </div>
        )}

        {/* Bottom link */}
        <div className="text-center mt-12 sm:mt-16">
          <Link
            to="/appointment"
            className="text-xs tracking-widest text-gray-600 hover:text-white transition-colors font-light"
          >
            YENİ RANDEVU OLUŞTUR →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TrackAppointment;
