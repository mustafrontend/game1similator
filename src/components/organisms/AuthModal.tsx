import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { ApiService } from '../../services/api';
import { Button } from '../atoms/Button';
import { X, Lock, Mail, User as UserIcon, Sparkles, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, setWallet, setToken, addToast } = useStore();
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSocialSignIn = async (provider: 'APPLE' | 'GOOGLE') => {
    setError(null);
    setLoading(true);
    try {
      const res = await ApiService.socialAuth(provider);
      setUser(res.user);
      setWallet(res.wallet);
      setToken(res.token);
      setIsAuthModalOpen(false);

      const titleMap = { APPLE: ' Apple ID Girişi', GOOGLE: '🌐 Google Account Girişi' };
      addToast({
        type: 'success',
        title: `${titleMap[provider]} Başarılı 🟢`,
        message: `Hoş geldiniz ${res.user.username}! Oturumunuz açıldı.`
      });
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }

    if (isRegister && !username) {
      setError('Lütfen oyuncu unvanınızı girin.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await ApiService.register(email, username, password);
        setUser(res.user);
        setWallet(res.wallet);
        setToken(res.token);
        setIsAuthModalOpen(false);

        addToast({
          type: 'success',
          title: 'Hesap Başarıyla Oluşturuldu 🟢',
          message: `Hoş geldiniz ${res.user.username}! Gerçek hesabınız açıldı.`
        });
      } else {
        const res = await ApiService.login(email, password);
        setUser(res.user);
        setWallet(res.wallet);
        setToken(res.token);
        setIsAuthModalOpen(false);

        addToast({
          type: 'success',
          title: 'Giriş Başarılı 🟢',
          message: `Hoş geldiniz ${res.user.username}! Hesabınıza giriş yapıldı.`
        });
      }
    } catch (err: any) {
      setError(err.message || 'İşlem başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden text-white my-8 text-center"
        >
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Official Logo Banner */}
          <div className="flex flex-col items-center justify-center mb-5">
            <div className="relative mb-3">
              <img
                src="/logo.jpg"
                alt="Virtual Life Official Logo"
                className="w-20 h-20 rounded-3xl object-cover border-2 border-amber-400 shadow-2xl shadow-amber-500/30"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {isRegister ? 'Gerçek Oyuncu Kaydı' : 'Gerçek Hesap Girişi'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Google, Apple ID veya e-posta hesabınızla gerçek oturum açın.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold rounded-xl text-left animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* 1-CLICK SOCIAL SIGN IN BUTTONS (APPLE & GOOGLE) */}
          <div className="space-y-2.5 mb-5 text-left">
            <Button
              variant="secondary"
              disabled={loading}
              className="w-full py-3 text-xs font-black bg-white text-slate-950 hover:bg-slate-100 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              onClick={() => handleSocialSignIn('APPLE')}
            >
              <span className="text-base leading-none"></span> Apple ID ile Giriş Yap
            </Button>

            <Button
              variant="outline"
              disabled={loading}
              className="w-full py-3 text-xs font-black bg-slate-950 border border-slate-700 text-white hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              onClick={() => handleSocialSignIn('GOOGLE')}
            >
              <span className="text-base font-black text-rose-400">G</span> Google / Gmail ile Giriş Yap
            </Button>
          </div>

          {/* DIVIDER */}
          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              VEYA E-POSTA İLE HESAP OLUŞTUR / GİRİŞ YAP
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* REAL GMAIL & PASSWORD FORM */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5 text-left">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">E-posta Adresiniz</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  placeholder="ornek@gmail.com"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Oyuncu İsim / Unvan</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    placeholder="Örn: Mustafa Yılmaz"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              variant="gold"
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-black shadow-lg shadow-amber-500/20 cursor-pointer mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> İşlem Yapılıyor...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  {isRegister ? 'Gerçek Hesap Oluştur & Kaydol' : 'Hesabıma Giriş Yap'}
                </span>
              )}
            </Button>
          </form>

          {/* TOGGLE FORM MODE */}
          <div className="mt-4 text-xs text-slate-400">
            {isRegister ? (
              <p>
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Giriş Yap
                </button>
              </p>
            ) : (
              <p>
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Hesap Oluştur / Kaydol
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
