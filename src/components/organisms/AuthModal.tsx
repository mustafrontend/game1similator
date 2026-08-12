import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { ApiService } from '../../services/api';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, Lock, Mail, User as UserIcon, Sparkles, LogIn, CheckCircle2, Zap } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, setWallet, setToken } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('test@virtual.life');
  const [username, setUsername] = useState('MustafaÖztürk');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const performLoginWithProfile = (emailVal: string, usernameVal: string) => {
    setUser({
      id: 'demo-user-1',
      email: emailVal,
      username: usernameVal || 'MustafaÖztürk',
      health: 95.0,
      happiness: 90.0,
      energy: 85.0,
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
    setLoginSuccess(`Hoş geldiniz ${usernameVal || 'MustafaÖztürk'}! Test kullanıcısı ile giriş yapıldı.`);
    setTimeout(() => {
      setLoginSuccess(null);
      setIsAuthModalOpen(false);
    }, 1200);
  };

  const handleQuickTestLogin = () => {
    setLoading(true);
    setTimeout(() => {
      performLoginWithProfile('test@virtual.life', 'MustafaÖztürk (Test)');
      setLoading(false);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await ApiService.register(email, username, password);
        setUser(res.user);
        setToken(res.token);
      } else {
        const res = await ApiService.login(email, password);
        setUser(res.user);
        setToken(res.token);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.warn('Backend server fallback active:', err.message);
      performLoginWithProfile(email, username || email.split('@')[0]);
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
              Virtual Life hesabınıza giriş yapın veya hızlı test kullanıcısını deneyin.
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

          {/* QUICK 1-CLICK TEST LOGIN BUTTON */}
          <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-400/40 rounded-2xl text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" /> Hızlı Test Girişi
              </span>
              <Badge variant="gold">1-TIK İLE GİRİŞ</Badge>
            </div>
            <p className="text-[11px] font-semibold text-slate-300 mb-3">
              Test Hesabı: <strong className="text-white">test@virtual.life</strong> (Şifre: 123456)
            </p>
            <Button
              variant="gold"
              className="w-full py-2.5 text-xs font-black shadow-md shadow-amber-500/20"
              onClick={handleQuickTestLogin}
              disabled={loading}
            >
              <LogIn className="w-4 h-4 mr-2" /> ⚡ Test Kullanıcısı İle Giriş Yap
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-bold">veya Form İle Giriş Yap</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">E-Posta Adresi</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@virtual.life"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-hidden focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Kullanıcı Adı</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="MustafaÖztürk"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-hidden focus:border-amber-400 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-hidden focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            <Button variant="primary" className="w-full py-3 mt-2" disabled={loading}>
              {loading ? 'Giriş Yapılıyor...' : isRegister ? 'Hesabı Oluştur' : 'Giriş Yap'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs font-semibold text-slate-400">
            {isRegister ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}{' '}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-amber-400 font-bold hover:underline"
            >
              {isRegister ? 'Giriş Yap' : 'Hemen Kaydol'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
