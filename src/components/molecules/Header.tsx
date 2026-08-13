import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { StatusBar } from '../atoms/StatusBar';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { MarketApiService, LiveExchangeRates, LiveCryptoRate } from '../../services/marketApi';
import { LANGUAGES } from '../../i18n/translations';
import { Heart, Smile, Zap, User as UserIcon, LogIn, DollarSign, RefreshCw, LogOut, Wallet as WalletIcon, AlertTriangle } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, wallet, offshoreBalance, setActiveTab, setIsAuthModalOpen, logout, language, setIsLanguageModalOpen, t, formatCurrency } = useStore();
  const [exchangeRates, setExchangeRates] = useState<LiveExchangeRates>({ usd_try: 34.25, eur_try: 37.10, usd_change_24h: 0.45, eur_change_24h: -0.18, last_updated: 'Canlı' });
  const [cryptoRates, setCryptoRates] = useState<LiveCryptoRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);

  const currentLanguageObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const totalLiquidMoney = (wallet?.cash_balance ?? 5000) + (wallet?.bank_balance ?? 15000) + (offshoreBalance ?? 0);
  const isNegative = totalLiquidMoney < 0;
  
  // Detect if any critical error or warning is active
  const isVitalCritical = user ? (user.health <= 25 || user.happiness <= 20 || user.energy <= 15) : false;
  const hasError = isNegative || isVitalCritical;

  const fetchLiveMarketData = async () => {
    setLoadingRates(true);
    const rates = await MarketApiService.fetchExchangeRates();
    setExchangeRates(rates);
    const cryptos = await MarketApiService.fetchLiveCryptoRates(rates.usd_try);
    setCryptoRates(cryptos);
    setLoadingRates(false);
  };

  useEffect(() => {
    fetchLiveMarketData();
    const interval = setInterval(fetchLiveMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderTickerContent = () => (
    <div className="flex items-center gap-6 whitespace-nowrap px-4">
      <span className="inline-flex items-center gap-1.5 font-bold text-amber-400 whitespace-nowrap">
        <DollarSign className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>{t('dolar')}:</span>
        <strong className="text-white">₺{exchangeRates.usd_try}</strong>
        <span className={`text-[10px] font-black whitespace-nowrap ${ (exchangeRates.usd_change_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400' }`}>
          ({(exchangeRates.usd_change_24h ?? 0) >= 0 ? '▲ +' : '▼ '}{exchangeRates.usd_change_24h ?? 0}%)
        </span>
      </span>
      <span className="text-slate-700 font-bold">•</span>

      <span className="inline-flex items-center gap-1.5 font-bold text-sky-400 whitespace-nowrap">
        <span>{t('euro')}:</span>
        <strong className="text-white">₺{exchangeRates.eur_try}</strong>
        <span className={`text-[10px] font-black whitespace-nowrap ${ (exchangeRates.eur_change_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400' }`}>
          ({(exchangeRates.eur_change_24h ?? 0) >= 0 ? '▲ +' : '▼ '}{exchangeRates.eur_change_24h ?? 0}%)
        </span>
      </span>
      <span className="text-slate-700 font-bold">•</span>

      {cryptoRates.map((c) => (
        <React.Fragment key={c.symbol}>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-bold text-slate-200">{c.symbol}:</span>
            <strong className="text-amber-400">${c.priceUsd.toLocaleString()}</strong>
            <span className={`text-[10px] font-black whitespace-nowrap ${c.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ({c.change24h >= 0 ? '▲ +' : '▼ '}{c.change24h}%)
            </span>
          </span>
          <span className="text-slate-700 font-bold">•</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-50 shadow-2xl pt-[max(12px,env(safe-area-inset-top))] sm:pt-0">
      {/* CONTINUOUS INFINITE SCROLLING WALL STREET STOCK MARQUEE HEADER */}
      <div className="bg-black/95 border-b border-slate-900 py-1 flex justify-between items-center text-[10px] font-mono text-slate-300 overflow-hidden relative">
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-ticker">
            {renderTickerContent()}
            {renderTickerContent()}
            {renderTickerContent()}
          </div>
        </div>

        <button
          onClick={fetchLiveMarketData}
          className="text-slate-400 hover:text-sky-400 transition-all px-2.5 py-0.5 bg-slate-950/90 border-l border-slate-800 shrink-0 flex items-center gap-1 text-[9px] font-bold z-10 shadow-lg cursor-pointer"
          title="Piyasaları Anlık Güncelle"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${loadingRates ? 'animate-spin' : ''}`} /> {exchangeRates.last_updated}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE COMPACT HEADER (ULTRA SLEEK SINGLE ROW WITH ALL VITALS) */}
      {/* ------------------------------------------------------------- */}
      <div className="block md:hidden max-w-7xl mx-auto px-2.5 py-2">
        {/* ROW 1: Logo on Left, Vitals in Middle, Info & Balance on Right */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none">
          {/* Logo + Title */}
          <div className="flex items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
            <img src="/logo.jpg" alt="Logo" className="w-7 h-7 rounded-xl object-cover border border-amber-400 shadow-md" />
            <span className="font-black text-xs text-white tracking-tight hidden xs:inline">VIRTUAL LIFE</span>
          </div>

          {/* MOBILE COMPACT VITALS BADGES (SINGLE HORIZONTAL ROW) */}
          {user && (
            <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800 shrink-0">
              <span className="flex items-center gap-0.5 text-[10px] font-black text-rose-400" title="Sağlık">
                <Heart className="w-3 h-3 text-rose-400 shrink-0" />
                <span>{(user.health ?? 100).toFixed(0)}%</span>
              </span>
              <span className="text-slate-700 text-[10px] font-bold">•</span>
              <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-400" title="Mutluluk">
                <Smile className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{(user.happiness ?? 100).toFixed(0)}%</span>
              </span>
              <span className="text-slate-700 text-[10px] font-bold">•</span>
              <span className="flex items-center gap-0.5 text-[10px] font-black text-sky-400" title="Enerji">
                <Zap className="w-3 h-3 text-sky-400 shrink-0" />
                <span>{(user.energy ?? 100).toFixed(0)}%</span>
              </span>
            </div>
          )}

          {/* Right Controls (Language, Money, Profile) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Language Flag Button */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-black text-amber-400 cursor-pointer flex items-center gap-1"
            >
              <span className="uppercase text-[10px] tracking-wide font-black">{currentLanguageObj.code}</span>
            </button>

            {/* Money & Profile Button */}
            {user ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-black transition-all cursor-pointer ${
                    isNegative ? 'bg-rose-500/20 border-rose-500/60 text-rose-400' : 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                  }`}
                >
                  <WalletIcon className="w-3 h-3" />
                  <span>{formatCurrency(totalLiquidMoney)}</span>
                </button>
                <button
                  onClick={logout}
                  className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Button
                variant="gold"
                size="sm"
                className="py-1 px-2 text-[11px] font-black"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <LogIn className="w-3 h-3 mr-1" /> {t('login_signup')}
              </Button>
            )}
          </div>
        </div>

        {/* ROW 2: CONDITIONAL WARNING / ERROR BAR (APPEARS ONLY IF ERROR IS ACTIVE) */}
        {hasError && (
          <div className="mt-1.5 p-2 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center justify-between text-xs text-rose-300 font-bold animate-pulse">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <span>
                {isNegative ? `Eksi Bakiyedesiniz: ${formatCurrency(totalLiquidMoney)}` : 'Kritik Gösterge Uyarısı!'}
              </span>
            </div>
            <button
              onClick={() => setActiveTab(isNegative ? 'underground' : 'store')}
              className="px-2 py-0.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider"
            >
              Çözüm Al
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP FULL HEADER (EXPANDED LAYOUT FOR MD & LG SCREENS) */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex-row justify-between items-center gap-4">
        {/* Logo and App Brand Title */}
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <img
              src="/logo.jpg"
              alt="Virtual Life Logo"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-lg shadow-amber-500/20"
            />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white cursor-pointer" onClick={() => setActiveTab('dashboard')}>{t('app_title')}</h1>
              <Badge variant="gold">V2.4 ONLINE</Badge>
            </div>
            <p className="text-[11px] font-bold text-slate-400">{t('app_subtitle')}</p>
          </div>
        </div>

        {/* Player Vitals Progress Bars */}
        <div className="flex items-center gap-4">
          <StatusBar
            label={t('health')}
            value={user?.health ?? 100.0}
            colorClass="bg-gradient-to-r from-rose-600 to-rose-400"
            icon={<Heart className="w-3.5 h-3.5 text-rose-400" />}
          />
          <StatusBar
            label={t('happiness')}
            value={user?.happiness ?? 100.0}
            colorClass="bg-gradient-to-r from-amber-500 to-yellow-300"
            icon={<Smile className="w-3.5 h-3.5 text-amber-400" />}
          />
          <StatusBar
            label={t('energy')}
            value={user?.energy ?? 100.0}
            colorClass="bg-gradient-to-r from-sky-500 to-blue-400"
            icon={<Zap className="w-3.5 h-3.5 text-sky-400" />}
          />
        </div>

        {/* User Account & Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLanguageModalOpen(true)}
            title="Change Language / Dil Değiştir"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-extrabold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
          >
            <span className="text-base leading-none">{currentLanguageObj.flag}</span>
            <span className="uppercase text-[11px] font-black">{currentLanguageObj.code}</span>
          </button>

          {user ? (
            <div className={`flex items-center gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-2 pl-4 rounded-2xl border shadow-xl transition-all ${
              isNegative ? 'border-rose-500/60 shadow-rose-500/20' : 'border-amber-400/40 shadow-amber-500/10'
            }`}>
              <div
                className="text-right cursor-pointer group"
                onClick={() => setActiveTab('profile')}
                title="Profil Sayfasına Git"
              >
                <div className="flex items-center justify-end gap-1.5">
                  {isNegative ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                  ) : (
                    <WalletIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
                  )}
                  <span className={`text-base font-black tracking-tight ${isNegative ? 'text-rose-400' : 'text-amber-400 group-hover:text-amber-300'}`}>
                    {formatCurrency(totalLiquidMoney)}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-300 mt-0.5 group-hover:text-sky-300">
                  <span>{user.username}</span>
                  <span className={isNegative ? 'text-rose-400' : 'text-amber-400'}>
                    • {isNegative ? t('negative_kmh') : (user.title || t('citizen'))}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('profile')}
                title="Profil Sayfasına Git"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-300 font-extrabold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              >
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span>{t('my_profile')}</span>
              </button>

              <button
                onClick={logout}
                title="Çıkış Yap"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600/30 hover:border-rose-500 border border-slate-700 flex items-center justify-center font-black text-slate-300 hover:text-rose-400 text-sm shadow-md transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <LogIn className="w-4 h-4 mr-1.5" /> {t('login_signup')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
