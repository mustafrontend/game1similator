import React, { useEffect, useState } from 'react';
import { useStore, GUEST_OWNER_ID, generateAiRealEstateProperty } from './store/useStore';
import { ApiService } from './services/api';
import { NotificationService } from './services/notificationService';
import { Header } from './components/molecules/Header';
import { FinancialDashboard } from './components/organisms/FinancialDashboard';
import { RealEstateMap } from './components/organisms/RealEstateMap';
import { VehicleMarketPanel } from './components/organisms/VehicleMarketPanel';
import { MyGaragePanel } from './components/organisms/MyGaragePanel';
import { UndergroundMarketPanel } from './components/organisms/UndergroundMarketPanel';
import { LeaderboardPanel } from './components/organisms/LeaderboardPanel';
import { CareerPanel } from './components/organisms/CareerPanel';
import { LifeSocialPanel } from './components/organisms/LifeSocialPanel';
import { InvestmentPanel } from './components/organisms/InvestmentPanel';
import { GlobalChatPanel } from './components/organisms/GlobalChatPanel';
import { UserProfilePanel } from './components/organisms/UserProfilePanel';
import { StorePanel } from './components/organisms/StorePanel';
import { AuthModal } from './components/organisms/AuthModal';
import { ToastContainer } from './components/atoms/ToastContainer';
import { VitalLowOfferModal } from './components/organisms/VitalLowOfferModal';
import { NotificationPermissionModal } from './components/organisms/NotificationPermissionModal';
import { LanguageSelectModal } from './components/organisms/LanguageSelectModal';
import { LayoutDashboard, Compass, Car, Warehouse, Skull, Trophy, Briefcase, Users, LineChart, MessageSquare, User, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ONE_GAME_MONTH_MS = 60 * 60 * 1000; // 60 Real Minutes = 1 In-Game Month

export const App: React.FC = () => {
  const {
    user,
    setUser,
    wallet,
    setWallet,
    setToken,
    activeTab,
    setActiveTab,
    isAuthModalOpen,
    isLoading,
    setIsLoading,
    addToast,
    t
  } = useStore();

  const [activeTabState, setActiveTabState] = useState(activeTab);

  useEffect(() => {
    setActiveTabState(activeTab);
  }, [activeTab]);

  // Initial App Load & Offline Progress Simulation Engine
  useEffect(() => {
    const initializeAppData = async () => {
      try {
        const storedToken = localStorage.getItem('virtual_life_token');
        if (storedToken) {
          const portfolioRes = await ApiService.getUserPortfolio();
          if (Array.isArray(portfolioRes) && portfolioRes.length > 0) {
            useStore.setState({ portfolio: portfolioRes });
          }
        }
      } catch (err) {
        console.warn('Initial data load notice:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAppData();
  }, [setToken, setUser, setWallet, setIsLoading]);

  // OFFLINE / BACKGROUND SIMULATION ENGINE (1 In-Game Month = 60 Real Minutes)
  useEffect(() => {
    if (isLoading) return;

    const lastActive = parseInt(localStorage.getItem('vl_last_active_timestamp') || Date.now().toString(), 10);
    const now = Date.now();
    localStorage.setItem('vl_last_active_timestamp', now.toString());

    const elapsedMs = now - lastActive;
    const elapsedMonths = Math.floor(elapsedMs / ONE_GAME_MONTH_MS);

    if (elapsedMonths > 0) {
      const state = useStore.getState();
      const myId = state.user?.id || GUEST_OWNER_ID;

      // 1. Collect offline rental income for elapsed months
      const userProps = state.properties.filter(p => p.owner_id === myId && (p.is_for_rent || p.tenant_id));
      const totalRentYield = userProps.reduce((sum, p) => sum + (p.rental_yield_per_tick || 15000), 0);
      const offlineRentCollected = totalRentYield * elapsedMonths;

      if (state.wallet && offlineRentCollected > 0) {
        const newBank = state.wallet.bank_balance + offlineRentCollected;
        state.setWallet({
          ...state.wallet,
          bank_balance: newBank,
          total_liquid: state.wallet.cash_balance + newBank
        });
      }

      // 2. Process offline bank loan installments
      if (state.activeBankLoans.length > 0) {
        for (let i = 0; i < Math.min(elapsedMonths, state.activeBankLoans.length); i++) {
          const loan = state.activeBankLoans[i];
          state.payBankLoanInstallment(loan.id);
        }
      }

      // UI Toast Notification
      state.addToast({
        type: 'success',
        title: `Siz Oyunda Yokken ${elapsedMonths} Oyun Ayı Geçti! ⏳`,
        message: `Arka planda +${state.formatCurrency(offlineRentCollected)} kira toplandı ve banka taksitleriniz işlendi.`
      });

      NotificationService.sendPush(
        "Virtual Life: Arka Plan Güncellemesi 📱",
        `Siz oyunda yokken ${elapsedMonths} Oyun Ayı geçti. +${state.formatCurrency(offlineRentCollected)} kira toplandı ve taksitleriniz işlendi.`
      );

      // 3. Process AI Real Estate Property Generator (Every 4 Hours)
      const lastAiSpawn = parseInt(localStorage.getItem('vl_last_ai_prop_spawn') || Date.now().toString(), 10);
      const elapsedAiMs = now - lastAiSpawn;
      const elapsed4HourCycles = Math.floor(elapsedAiMs / (4 * 60 * 60 * 1000));

      if (elapsed4HourCycles > 0) {
        localStorage.setItem('vl_last_ai_prop_spawn', now.toString());
        const newAiProps = Array.from({ length: Math.min(elapsed4HourCycles, 6) }).map(() => generateAiRealEstateProperty());

        state.setProperties([...newAiProps, ...state.properties]);

        state.addToast({
          type: 'info',
          title: 'AI Müteahhit Projeleri 🏗️',
          message: `Siz yokken AI Emlak Geliştirici haritaya ${newAiProps.length} yeni lüks mülk (Boğaz yalısı/rezidans) inşa etti!`
        });

        NotificationService.sendPush(
          "AI Emlak Geliştirici 🏠",
          `İstanbul haritasına ${newAiProps.length} yeni lüks konut projesi eklendi! Satılık ve kiralık ilanları inceleyin.`
        );
      }
    }

    // Save timestamp heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      localStorage.setItem('vl_last_active_timestamp', Date.now().toString());
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.setItem('vl_last_active_timestamp', Date.now().toString());
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleVisibilityChange);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleVisibilityChange);
    };
  }, [isLoading]);

  // Global Timers (Rental Income, Price Fluctuation, 60-Minute Loan Installment Cycle)
  useEffect(() => {
    if (isLoading) return;

    // 1. PASSIVE RENTAL INCOME TIMER (Every 25 seconds)
    const rentInterval = setInterval(() => {
      const state = useStore.getState();
      const myId = state.user?.id || GUEST_OWNER_ID;
      const userProps = state.properties.filter(p => p.owner_id === myId && (p.is_for_rent || p.tenant_id));
      const userVehs = state.vehicles.filter(v => v.owner_id === myId && v.is_for_rent);
      const tenantProps = state.properties.filter(p => p.tenant_id === myId && p.owner_id !== myId);

      const totalRentYield = userProps.reduce((sum, p) => sum + (p.rental_yield_per_tick || 15000), 0) +
                             userVehs.reduce((sum, v) => sum + (v.daily_rental_price || 2500), 0);
      const totalRentOwed = tenantProps.reduce((sum, p) => sum + (p.rental_price || 0), 0);

      if (state.wallet && (totalRentYield > 0 || totalRentOwed > 0)) {
        const netChange = totalRentYield - totalRentOwed;
        const updatedBank = state.wallet.bank_balance + netChange;
        state.setWallet({
          ...state.wallet,
          bank_balance: updatedBank,
          total_liquid: state.wallet.cash_balance + updatedBank
        });

        if (totalRentYield > 0) {
          state.addToast({
            type: 'success',
            title: state.t('notification_rent_title'),
            message: `+${state.formatCurrency(totalRentYield)}`
          });
        }
      }
    }, 25000);

    // 2. STOCK / CRYPTO MARKET MOVEMENT PUSH NOTIFICATION TIMER (Every 20 seconds)
    const marketInterval = setInterval(() => {
      const state = useStore.getState();
      if (state.assets.length === 0) return;

      const randomAsset = state.assets[Math.floor(Math.random() * state.assets.length)];
      const isUp = randomAsset.change_24h >= 0;

      state.addToast({
        type: isUp ? 'info' : 'warning',
        title: `${state.t('notification_market_title')}: ${randomAsset.symbol}`,
        message: `${randomAsset.name} ${isUp ? '▲ +' : '▼ '}${Math.abs(randomAsset.change_24h).toFixed(2)}% | ${state.formatCurrency(randomAsset.current_price)}`
      });
    }, 20000);

    // 2b. LIVE MARKET PRICE FLUCTUATIONS (Every 15 seconds)
    const priceInterval = setInterval(() => {
      const state = useStore.getState();
      if (state.assets.length === 0) return;

      const updated = state.assets.map((a) => {
        const deltaPercent = (Math.random() * 4 - 2); // -2% to +2%
        const newPrice = Math.max(1, a.current_price * (1 + deltaPercent / 100));
        return {
          ...a,
          prev_price: a.current_price,
          current_price: Math.round(newPrice * 100) / 100,
          change_24h: Math.round((a.change_24h + deltaPercent) * 100) / 100
        };
      });
      state.setAssets(updated);
    }, 15000);

    // 3. STABLE VITAL LIFECYCLE SIMULATION TIMER (Every 60 seconds)
    const vitalInterval = setInterval(() => {
      const state = useStore.getState();
      if (!state.user) return;

      const immunityUntil = parseInt(localStorage.getItem('vl_vital_immunity') || '0', 10);
      if (Date.now() < immunityUntil) {
        if (state.user.health < 100 || state.user.happiness < 100 || state.user.energy < 100) {
          state.setUser({
            ...state.user,
            health: 100,
            happiness: 100,
            energy: 100
          });
        }
        return;
      }

      const isBroke = !!state.wallet && state.wallet.total_liquid <= 0;
      const happinessDecay = isBroke ? 2.5 : 0.5;

      const newEnergy = Math.max(0, state.user.energy - 1);
      const newHappiness = Math.max(0, state.user.happiness - happinessDecay);
      const isExtremeBurnout = newEnergy === 0 || newHappiness === 0;
      const newHealth = isExtremeBurnout ? Math.max(0, state.user.health - 1) : Math.max(80, state.user.health);

      state.setUser({
        ...state.user,
        health: newHealth,
        happiness: newHappiness,
        energy: newEnergy
      });

      if (isBroke) {
        const wasAlreadyBroke = localStorage.getItem('vl_broke_flag') === '1';
        if (!wasAlreadyBroke) {
          localStorage.setItem('vl_broke_flag', '1');
          state.addToast({
            type: 'error',
            title: 'Parasız Kaldın 💸',
            message: 'Bakiyen tükendi, mutluluğun artık daha hızlı düşüyor.'
          });
        }
      } else {
        localStorage.removeItem('vl_broke_flag');
      }
    }, 60000);

    // 4. BANK LOAN MONTHLY INSTALLMENT CYCLE (Every 60 Real Minutes = 1 In-Game Month)
    const loanInstallmentInterval = setInterval(() => {
      const state = useStore.getState();
      const activeLoans = state.activeBankLoans;
      if (activeLoans.length > 0) {
        const loanToPay = activeLoans[0];
        if (state.wallet && state.wallet.total_liquid >= loanToPay.monthly_payment) {
          state.payBankLoanInstallment(loanToPay.id);
          
          // Send Phone / Mobile Push Notification
          NotificationService.sendPush(
            "Virtual Life: Banka Taksit Ödemesi 🏦",
            `1 Oyun Ayı tamamlandı! "${loanToPay.loan_title}" taksidi (${state.formatCurrency(loanToPay.monthly_payment)}) hesabınızdan ödendi.`
          );
        } else {
          state.addToast({
            type: 'error',
            title: '⚠️ Kredi Taksit Vadesi Geldi!',
            message: `"${loanToPay.loan_title}" taksit ödemesi (${state.formatCurrency(loanToPay.monthly_payment)}) için bakiye yetersizdir. Findeks skorunuz etkilenebilir.`
          });

          NotificationService.sendPush(
            "Virtual Life: GECİKMİŞ KREDİ TAKSİDİ ⚠️",
            `1 Oyun Ayı tamamlandı! "${loanToPay.loan_title}" taksidini ödemek için bakiyeniz yetersizdir.`
          );
        }
      }
    }, ONE_GAME_MONTH_MS);

    // 5. LENT MONEY & AUCTION MATURITY CHECK (Every 5 seconds)
    const loanInterval = setInterval(() => {
      useStore.getState().collectMaturedLoans();
      useStore.getState().resolveUndergroundAuctionIfDue();
    }, 5000);

    // 6. INCOMING PURCHASE OFFERS ON OWNED ASSETS (Every 35 seconds)
    const offerInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        useStore.getState().generateRandomOffer();
      }
    }, 35000);

    // 7. 4-HOUR AI REAL ESTATE PROPERTY SPAWNER (Generates 1 new AI property every 4 hours)
    const aiPropInterval = setInterval(() => {
      const state = useStore.getState();
      const newAiProp = generateAiRealEstateProperty();
      state.setProperties([newAiProp, ...state.properties]);
      localStorage.setItem('vl_last_ai_prop_spawn', Date.now().toString());

      state.addToast({
        type: 'info',
        title: 'AI Müteahhit Projesi İnşa Edildi 🏗️',
        message: `"${newAiProp.title}" haritada yeni ${newAiProp.is_for_sale ? 'Satılık' : 'Kiralık'} ilanı olarak yerini aldı!`
      });

      NotificationService.sendPush(
        "AI Müteahhit Yeni Proje 🏠",
        `"${newAiProp.title}" (${state.formatCurrency(newAiProp.price)}) haritada satışa/kiraya çıkarıldı!`
      );
    }, 4 * 60 * 60 * 1000);

    return () => {
      clearInterval(rentInterval);
      clearInterval(marketInterval);
      clearInterval(priceInterval);
      clearInterval(vitalInterval);
      clearInterval(loanInstallmentInterval);
      clearInterval(loanInterval);
      clearInterval(offerInterval);
      clearInterval(aiPropInterval);
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400 animate-pulse">Virtual Life & Economy Yükleniyor...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTabState) {
      case 'dashboard': return <FinancialDashboard />;
      case 'map': return <RealEstateMap />;
      case 'vehicles': return <VehicleMarketPanel />;
      case 'garage': return <MyGaragePanel />;
      case 'underground': return <UndergroundMarketPanel />;
      case 'leaderboard': return <LeaderboardPanel />;
      case 'career': return <CareerPanel />;
      case 'social': return <LifeSocialPanel />;
      case 'investment': return <InvestmentPanel />;
      case 'chat': return <GlobalChatPanel />;
      case 'profile': return <UserProfilePanel />;
      case 'store': return <StorePanel />;
      default: return <FinancialDashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: t('tab_dashboard') || 'Finans', icon: LayoutDashboard },
    { id: 'map', label: t('tab_map') || 'Harita', icon: Compass },
    { id: 'vehicles', label: t('tab_vehicles') || 'Araba', icon: Car },
    { id: 'garage', label: t('tab_garage') || 'Garajım', icon: Warehouse },
    { id: 'career', label: t('tab_career') || 'Kariyer', icon: Briefcase },
    { id: 'investment', label: t('tab_investment') || 'Borsa', icon: LineChart },
    { id: 'social', label: t('tab_social') || 'Sosyal', icon: Users },
    { id: 'chat', label: t('tab_chat') || 'Sohbet', icon: MessageSquare },
    { id: 'underground', label: t('tab_underground') || 'Yeraltı', icon: Skull },
    { id: 'leaderboard', label: t('tab_leaderboard') || 'Liderlik', icon: Trophy },
    { id: 'store', label: 'Mağaza', icon: ShoppingBag },
    { id: 'profile', label: t('tab_profile') || 'Profil', icon: User }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 pb-36 sm:pb-32">
      <Header />
      <ToastContainer />
      <VitalLowOfferModal />
      <NotificationPermissionModal />
      <LanguageSelectModal />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1">
        {renderContent()}
      </main>

      {/* Floating 2-Row Mobile & Desktop Navigation Bar elevated above mobile notch */}
      <nav className="fixed bottom-3 left-2 right-2 md:left-6 md:right-6 z-40 bg-slate-950/95 border border-slate-800 rounded-2xl backdrop-blur-xl p-1.5 sm:p-2 shadow-2xl shadow-black/90">
        <div className="max-w-7xl mx-auto grid grid-cols-6 gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTabState === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                <span className="text-[9px] sm:text-[10px] font-bold tracking-tight whitespace-nowrap truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Persistent AuthModal */}
      {isAuthModalOpen && <AuthModal />}
    </div>
  );
};

export default App;
