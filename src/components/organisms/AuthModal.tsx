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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border-2 border-amber-400/40 relative text-white max-h-[85vh] sm:max-h-[90vh] overflow-y-auto my-auto text-center shadow-amber-500/10"
        >
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Official Logo Banner */}
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="relative mb-2">
              <img
                src="/logo.jpg"
                alt="Virtual Life Official Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl shadow-amber-500/30"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isRegister ? 'Gerçek Oyuncu Kaydı' : 'Gerçek Hesap Girişi'}
            </h2>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5">
              E-posta adresinizle gerçek hesabınızı oluşturun veya giriş yapın.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold rounded-xl text-left animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* REAL EMAIL & PASSWORD FORM */}
          <form onSubmit={handleFormSubmit} className="space-y-3 text-left">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">E-posta Adresiniz</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  placeholder="ornek@gmail.com"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Oyuncu İsim / Unvanınız</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    placeholder="Örn: Mustafa Yılmaz"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Şifreniz</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
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
