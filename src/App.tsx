import React, { useEffect } from 'react';
import { useStore, GUEST_OWNER_ID } from './store/useStore';
import { ApiService } from './services/api';
import { initPurchases } from './services/purchases';
import { Header } from './components/molecules/Header';
import { Navigation } from './components/molecules/Navigation';
import { BottomNav } from './components/molecules/BottomNav';
import { FinancialDashboard } from './components/organisms/FinancialDashboard';
import { RealEstateMap } from './components/organisms/RealEstateMap';
import { VehicleMarketPanel } from './components/organisms/VehicleMarketPanel';
import { MyGaragePanel } from './components/organisms/MyGaragePanel';
import { LeaderboardPanel } from './components/organisms/LeaderboardPanel';
import { UndergroundMarketPanel } from './components/organisms/UndergroundMarketPanel';
import { CareerPanel } from './components/organisms/CareerPanel';
import { LifeSocialPanel } from './components/organisms/LifeSocialPanel';
import { InvestmentPanel } from './components/organisms/InvestmentPanel';
import { GlobalChatPanel } from './components/organisms/GlobalChatPanel';
import { UserProfilePanel } from './components/organisms/UserProfilePanel';
import { StorePanel } from './components/organisms/StorePanel';
import { VitalLowOfferModal } from './components/organisms/VitalLowOfferModal';
import { LanguageSelectModal } from './components/organisms/LanguageSelectModal';
import { NotificationPermissionModal } from './components/organisms/NotificationPermissionModal';
import { AuthModal } from './components/organisms/AuthModal';
import { ToastContainer } from './components/atoms/ToastContainer';
import { Loader2, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeTab,
    token,
    user,
    setUser,
    setWallet,
    setToken,
    setProperties,
    setVehicles,
    setJobs,
    setAssets,
    setPortfolio,
    isLoading,
    setIsLoading,
    addToast,
    t,
    formatCurrency,
  } = useStore();

  useEffect(() => {
    const initAppBackendData = async () => {
      setIsLoading(true);

      try {
        // Fetch ALL Live Database Records & Portfolio from Python Backend Server
        const [meRes, propsRes, vehsRes, jobsRes, assetsRes, portfolioRes] = await Promise.all([
          ApiService.getMe().catch(() => null),
          ApiService.getMapProperties().catch(() => []),
          ApiService.getVehicles().catch(() => []),
          ApiService.getCareerOpportunities().catch(() => []),
          ApiService.getInvestmentMarket().catch(() => []),
          ApiService.getUserPortfolio().catch(() => [])
        ]);

        if (meRes) {
          setUser(meRes.user);
          setWallet(meRes.wallet);
        }

        if (propsRes.length > 0) setProperties(propsRes);
        if (vehsRes.length > 0) setVehicles(vehsRes);
        if (jobsRes.length > 0) setJobs(jobsRes);
        if (assetsRes.length > 0) setAssets(assetsRes);
        if (portfolioRes.length > 0) setPortfolio(portfolioRes);

      } catch (err: any) {
        console.warn('Backend synchronization notice:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAppBackendData();
  }, [setUser, setWallet, setToken, setProperties, setVehicles, setJobs, setAssets, setPortfolio, setIsLoading]);

  useEffect(() => {
    if (user?.id) {
      initPurchases(user.id).catch((err) => console.warn('Purchases init skipped:', err.message));
    }
  }, [user?.id]);

  // LIVE EVENT REAL-TIME PUSH NOTIFICATIONS SYSTEM (DYNAMIC I18N)
  useEffect(() => {
    if (isLoading) return;

    // 1. PASSIVE RENTAL INCOME (owned+rented assets) & TENANT RENT (rented-as-tenant properties) TIMER (Every 25 seconds)
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
        if (totalRentOwed > 0) {
          state.addToast({
            type: 'warning',
            title: 'Kira Ödemesi 🏠',
            message: `-${state.formatCurrency(totalRentOwed)}`
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

    // 2b. LIVE MARKET PRICE FLUCTUATIONS (Every 15 seconds — runs globally, not just while Investment tab is open)
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

    // 3. STABLE VITAL LIFECYCLE SIMULATION TIMER (Every 60 seconds, realistic decay)
    const vitalInterval = setInterval(() => {
      const state = useStore.getState();
      if (!state.user) return;

      // Check if user has immunity active (e.g. after refill / elixir / vacation / surgery)
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
      const happinessDecay = isBroke ? 2.5 : 0.5; // being broke stings a lot more

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

      if (newHealth <= 25 && state.user.health > 25) {
        state.addToast({
          type: 'error',
          title: state.t('notification_health_title'),
          message: `%${newHealth.toFixed(0)}`
        });
      } else if (newHappiness <= 20 && state.user.happiness > 20) {
        state.addToast({
          type: 'warning',
          title: state.t('notification_happiness_title'),
          message: `%${newHappiness.toFixed(0)}`
        });
      } else if (newEnergy <= 15 && state.user.energy > 15) {
        state.addToast({
          type: 'warning',
          title: state.t('notification_energy_title'),
          message: `%${newEnergy.toFixed(0)}`
        });
      }

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

      // Auto-process 1 monthly installment cycle for active bank loans every 60s (1 In-Game Month)
      const activeLoans = state.activeBankLoans;
      if (activeLoans.length > 0) {
        const loanToPay = activeLoans[0];
        if (state.wallet && state.wallet.total_liquid >= loanToPay.monthly_payment) {
          state.payBankLoanInstallment(loanToPay.id);
        }
      }
    }, 60000);

    // 4. LENT MONEY MATURITY CHECK (Every 5 seconds — collects loans that reached their due date)
    const loanInterval = setInterval(() => {
      useStore.getState().collectMaturedLoans();
      useStore.getState().resolveUndergroundAuctionIfDue();
    }, 5000);

    // 5. INCOMING PURCHASE OFFERS ON OWNED ASSETS (Every 35 seconds, chance-based)
    const offerInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        useStore.getState().generateRandomOffer();
      }
    }, 35000);

    return () => {
      clearInterval(rentInterval);
      clearInterval(marketInterval);
      clearInterval(priceInterval);
      clearInterval(vitalInterval);
      clearInterval(loanInterval);
      clearInterval(offerInterval);
    };
  }, [isLoading]);

  // Premium Glassmorphic Loading Screen with Official Logo
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col items-center justify-center space-y-5 p-4 select-none">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-amber-500/20 blur-xl animate-pulse"></div>
          <img
            src="/logo.jpg"
            alt="Virtual Life Logo"
            className="w-20 h-20 rounded-3xl object-cover border-2 border-amber-400 shadow-2xl shadow-amber-500/30 relative z-10"
          />
        </div>

        <div className="text-center space-y-2 max-w-sm">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            <h2 className="text-lg font-black tracking-tight text-white">VIRTUAL LIFE</h2>
          </div>
          <p className="text-sm font-bold text-slate-300 animate-pulse">
            {t('loading_title')}
          </p>
          <p className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" /> {t('loading_sub')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans antialiased pb-44 md:pb-16 selection:bg-sky-500 selection:text-white">
      <ToastContainer />
      <AuthModal />
      <LanguageSelectModal />
      <NotificationPermissionModal />
      <VitalLowOfferModal />
      <Header />

      <div className="hidden md:block">
        <Navigation />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <FinancialDashboard />}
        {activeTab === 'store' && <StorePanel />}
        {activeTab === 'map' && <RealEstateMap />}
        {activeTab === 'vehicles' && <VehicleMarketPanel />}
        {activeTab === 'garage' && <MyGaragePanel />}
        {activeTab === 'underground' && <UndergroundMarketPanel />}
        {activeTab === 'leaderboard' && <LeaderboardPanel />}
        {activeTab === 'career' && <CareerPanel />}
        {activeTab === 'social' && <LifeSocialPanel />}
        {activeTab === 'investment' && <InvestmentPanel />}
        {activeTab === 'chat' && <GlobalChatPanel />}
        {activeTab === 'profile' && <UserProfilePanel />}
      </main>

      {/* Footer with Official Branding Logo */}
      <footer className="bg-slate-950/80 border-t border-slate-800/80 py-6 text-center text-xs font-semibold text-slate-500 mb-20 md:mb-0">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.jpg" alt="Virtual Life Footer Logo" className="w-7 h-7 rounded-xl object-cover border border-amber-400/60" />
          <span className="font-black text-white text-sm">VIRTUAL LIFE</span>
        </div>
        <p>Virtual Life & Economy Simulation &copy; 2026 • Live Backend</p>
      </footer>

      <BottomNav />
    </div>
  );
};

export default App;
