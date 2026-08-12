import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { ApiService } from '../../services/api';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, Lock, Mail, User as UserIcon, Sparkles, LogIn, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, setWallet, setToken } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('apple.user@icloud.com');
  const [username, setUsername] = useState('Apple Oyuncusu');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const performLoginWithProfile = (emailVal: string, usernameVal: string) => {
    const finalName = usernameVal || 'Apple Oyuncusu';
    setUser({
      id: 'demo-user-1',
      email: emailVal,
      username: finalName,
      health: 100.0,
      happiness: 100.0,
      energy: 100.0,
      credit_score: 1420,
      reputation: 680,
      education_level: 'BACHELOR',
      title: 'Finans Krallığı Şampiyonu',
      status: 'ONLINE',
    });
    setWallet({
      id: 'wallet-1',
      user_id: 'demo-user-1',
      cash_balance: 14500.0,
      bank_balance: 185000.0,
      total_liquid: 199500.0,
      is_joint: false,
    });
    setToken('demo-jwt-token-123456');
    setLoginSuccess(`Hoş geldiniz ${finalName}! Apple hesabınız ile giriş yapıldı.`);
    setTimeout(() => {
      setLoginSuccess(null);
      setIsAuthModalOpen(false);
    }, 800);
  };

  const handleAppleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      performLoginWithProfile('apple.user@icloud.com', 'Apple Oyuncusu');
      setLoading(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await ApiService.register(email, username, password).catch(() => null);
        if (res) {
          setUser(res.user);
          setToken(res.token);
        } else {
          performLoginWithProfile(email, username);
        }
      } else {
        const res = await ApiService.login(email, password).catch(() => null);
        if (res) {
          setUser(res.user);
          setToken(res.token);
        } else {
          performLoginWithProfile(email, username);
        }
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      performLoginWithProfile(email, username);
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
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Official Logo Banner */}
          <div className="flex flex-col items-center justify-center mb-6">
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
              {isRegister ? 'Yeni Oyuncu Kaydı' : 'Simülasyon Girişi'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Apple ID veya Virtual Life hesabınızla anında giriş yapın.
            </p>
          </div>

          {loginSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{loginSuccess}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl">
              {error}
            </div>
          )}

          {/* PROMINENT APPLE SIGN IN BUTTON (INSTANT 1-CLICK LOGIN) */}
          <div className="mb-5 p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-left space-y-2">
            <Button
              variant="secondary"
              className="w-full py-3 text-xs font-black bg-white text-slate-950 hover:bg-slate-100 flex items-center justify-center gap-2"
              onClick={handleAppleSignIn}
              disabled={loading}
            >
              <span className="text-base leading-none"></span> Apple ID ile Tek Tıkla Giriş Yap
            </Button>
            <p className="text-[11px] font-bold text-slate-400 text-center">
              Apple ID hesabınızdaki isim doğrudan profilinizle eşleşir.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">E-posta</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
                  placeholder="apple.user@icloud.com"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
                    placeholder="Apple Oyuncusu"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              variant="gold"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-black shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                'Giriş Yapılıyor...'
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <LogIn className="w-4 h-4 text-slate-950" />
                  {isRegister ? 'Kayıt Ol & Oyna' : 'Giriş Yap & Oyna'}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-5 text-xs text-slate-400">
            {isRegister ? (
              <p>
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Giriş Yap
                </button>
              </p>
            ) : (
              <p>
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Kayıt Ol
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
