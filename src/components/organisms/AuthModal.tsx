import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, Lock, Mail, User as UserIcon, LogIn, CheckCircle2, Globe, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, setWallet, setToken, addToast } = useStore();
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('oyuncu@gmail.com');
  const [username, setUsername] = useState('Oyuncu Unvanı');
  const [password, setPassword] = useState('123456');

  if (!isAuthModalOpen) return null;

  const executeAuth = (emailVal: string, nameToUse: string, provider: 'APPLE' | 'GOOGLE' | 'GMAIL') => {
    const finalName = nameToUse.trim() || (provider === 'APPLE' ? 'Apple Oyuncusu' : provider === 'GOOGLE' ? 'Google Oyuncusu' : 'Gmail Oyuncusu');
    const finalEmail = emailVal.trim() || `${finalName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

    setUser({
      id: `user-${provider.toLowerCase()}-1001`,
      email: finalEmail,
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
      id: `wallet-${provider.toLowerCase()}-1001`,
      user_id: `user-${provider.toLowerCase()}-1001`,
      cash_balance: 14500.0,
      bank_balance: 185000.0,
      total_liquid: 199500.0,
      is_joint: false,
    });

    setToken(`demo-jwt-token-${provider.toLowerCase()}-123456`);
    setIsAuthModalOpen(false);

    const providerTitles = {
      APPLE: ' Apple ID Girişi',
      GOOGLE: '🌐 Google Account Girişi',
      GMAIL: '✉️ Gmail Hesabı'
    };

    addToast({
      type: 'success',
      title: `${providerTitles[provider]} Başarılı 🟢`,
      message: `Hoş geldiniz ${finalName}! Oturumunuz anında açıldı.`
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeAuth(email, username, 'GMAIL');
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
              {isRegister ? 'Yeni Oyuncu Kaydı' : 'Simülasyon Girişi'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Google, Apple ID veya Gmail hesabınızla tek tıkla başlayın.
            </p>
          </div>

          {/* 1-CLICK SOCIAL SIGN IN BUTTONS (APPLE & GOOGLE) */}
          <div className="space-y-2.5 mb-5 text-left">
            {/* APPLE SIGN IN BUTTON */}
            <Button
              variant="secondary"
              className="w-full py-3 text-xs font-black bg-white text-slate-950 hover:bg-slate-100 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              onClick={() => executeAuth('apple.user@icloud.com', 'Apple Oyuncusu', 'APPLE')}
            >
              <span className="text-base leading-none"></span> Apple ID ile Tek Tıkla Giriş Yap
            </Button>

            {/* GOOGLE SIGN IN BUTTON */}
            <Button
              variant="outline"
              className="w-full py-3 text-xs font-black bg-slate-950 border border-slate-700 text-white hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              onClick={() => executeAuth('google.user@gmail.com', 'Google Oyuncusu', 'GOOGLE')}
            >
              <span className="text-base font-black text-rose-400">G</span> Google / Gmail ile Tek Tıkla Giriş Yap
            </Button>
          </div>

          {/* DIVIDER */}
          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              VEYA GMAİL İLE KAYDOL & GİRİŞ YAP
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* GMAIL & PASSWORD FORM */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5 text-left">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Gmail Adresiniz</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  placeholder="oyuncu@gmail.com"
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
                    placeholder="Oyuncu Unvanı"
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
              className="w-full py-3 text-xs font-black shadow-lg shadow-amber-500/20 cursor-pointer mt-1"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-slate-950" />
                {isRegister ? 'Gmail & Şifre ile Kaydol' : 'Gmail & Şifre ile Giriş Yap'}
              </span>
            </Button>
          </form>

          {/* TOGGLE FORM MODE */}
          <div className="mt-4 text-xs text-slate-400">
            {isRegister ? (
              <p>
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
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
                  onClick={() => setIsRegister(true)}
                  className="text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Gmail ile Kaydol
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
