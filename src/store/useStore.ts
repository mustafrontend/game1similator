import { create } from 'zustand';
import { User, Wallet, Property, Vehicle, Job, Asset, SocialLoan, Transaction, UserPortfolio, MarketOffer, ExpenseItem } from '../types';
import { LanguageCode, getTranslation } from '../i18n/translations';
import { formatCurrencyByLanguage } from '../i18n/currency';
import { AIService } from '../services/aiService';

export type ActiveTab = 'dashboard' | 'map' | 'vehicles' | 'garage' | 'leaderboard' | 'underground' | 'career' | 'social' | 'investment' | 'chat' | 'profile' | 'store';

// 1 in-game "day" = 15 real seconds, so lent-money maturities resolve within a play session
export const GAME_DAY_MS = 15000;

export const UNDERGROUND_AUCTION_ITEM_TITLE = '1962 Ferrari 250 GTO Classic';
export const UNDERGROUND_AUCTION_STARTING_BID = 1250000;
const UNDERGROUND_AUCTION_DURATION_MS = 90000; // 90s live bidding window

export interface UndergroundAuctionState {
  currentBid: number;
  leader: 'PLAYER' | 'AI' | null;
  endsAt: number;
  resolved: boolean;
}

export const freshUndergroundAuction = (): UndergroundAuctionState => ({
  currentBid: UNDERGROUND_AUCTION_STARTING_BID,
  leader: null,
  endsAt: Date.now() + UNDERGROUND_AUCTION_DURATION_MS,
  resolved: false
});

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

const safeParseStorage = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
};

interface AppState {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  activeTab: ActiveTab;
  isAuthModalOpen: boolean;
  toasts: ToastNotification[];
  isLoading: boolean;
  
  // Language i18n & Currency State
  language: LanguageCode;
  isLanguageModalOpen: boolean;
  setLanguage: (lang: LanguageCode) => void;
  setIsLanguageModalOpen: (open: boolean) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;

  properties: Property[];
  vehicles: Vehicle[];
  jobs: Job[];
  assets: Asset[];
  portfolio: UserPortfolio[];
  socialLoans: { lent: SocialLoan[]; borrowed: SocialLoan[] };
  transactions: Transaction[];
  expenses: ExpenseItem[];
  offers: MarketOffer[];
  offshoreBalance: number;
  undergroundAuction: UndergroundAuctionState;
  
  setUser: (user: User | null) => void;
  setWallet: (wallet: Wallet | null) => void;
  setToken: (token: string | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  refillVitalsWithImmunity: (immunityMinutes?: number) => void;
  
  setProperties: (props: Property[]) => void;
  setVehicles: (vehs: Vehicle[]) => void;
  setJobs: (jobs: Job[]) => void;
  setAssets: (assets: Asset[]) => void;
  setPortfolio: (ports: UserPortfolio[]) => void;
  setSocialLoans: (loans: { lent: SocialLoan[]; borrowed: SocialLoan[] }) => void;
  setTransactions: (txs: Transaction[]) => void;
  setExpenses: (exp: ExpenseItem[]) => void;
  setOffers: (offers: MarketOffer[]) => void;
  setOffshoreBalance: (amount: number) => void;
  setUndergroundAuction: (auction: UndergroundAuctionState) => void;
  resolveUndergroundAuctionIfDue: () => void;
  
  acceptOffer: (offerId: string) => void;
  declineOffer: (offerId: string) => void;
  generateRandomOffer: () => void;
  collectMaturedLoans: () => void;

  logout: () => void;
  deleteAccountData: () => void;
}

export const DEFAULT_INVESTMENT_ASSETS: Asset[] = [
  { id: 'ast-1', symbol: 'THYAO', name: 'Türk Hava Yolları', asset_type: 'STOCK', current_price: 312.50, prev_price: 308.20, change_24h: 1.39 },
  { id: 'ast-2', symbol: 'ASELS', name: 'Aselsan Elektronik', asset_type: 'STOCK', current_price: 74.80, prev_price: 72.50, change_24h: 3.17 },
  { id: 'ast-3', symbol: 'GARAN', name: 'Garanti BBVA', asset_type: 'STOCK', current_price: 118.40, prev_price: 119.50, change_24h: -0.92 },
  { id: 'ast-4', symbol: 'EREGL', name: 'Ereğli Demir Çelik', asset_type: 'STOCK', current_price: 52.30, prev_price: 51.80, change_24h: 0.96 },
  { id: 'ast-5', symbol: 'BTC', name: 'Bitcoin (BTC/USD)', asset_type: 'CRYPTO', current_price: 94800.00, prev_price: 92400.00, change_24h: 2.59 },
  { id: 'ast-6', symbol: 'ETH', name: 'Ethereum (ETH/USD)', asset_type: 'CRYPTO', current_price: 3450.00, prev_price: 3380.00, change_24h: 2.07 },
  { id: 'ast-7', symbol: 'SOL', name: 'Solana (SOL/USD)', asset_type: 'CRYPTO', current_price: 215.40, prev_price: 202.10, change_24h: 6.58 },
  { id: 'ast-8', symbol: 'GOLD', name: 'Gram Altın (24 Ayar)', asset_type: 'STOCK', current_price: 3150.00, prev_price: 3120.00, change_24h: 0.96 },
  { id: 'ast-9', symbol: 'NVDA', name: 'NVIDIA Corp.', asset_type: 'STOCK', current_price: 4850.00, prev_price: 4720.00, change_24h: 2.75 },
  { id: 'ast-10', symbol: 'AAPL', name: 'Apple Inc.', asset_type: 'STOCK', current_price: 7800.00, prev_price: 7750.00, change_24h: 0.64 }
];

const savedLang = (localStorage.getItem('virtual_life_language') as LanguageCode) || 'tr';
const initialLanguageModalState = !localStorage.getItem('virtual_life_language');

// User is null by default if not logged in yet, so AuthModal presents on launch
const savedUser = safeParseStorage<User | null>('vl_user', null);
if (savedUser) {
  savedUser.health = Math.max(0, Math.min(100, savedUser.health ?? 100));
  savedUser.happiness = Math.max(0, Math.min(100, savedUser.happiness ?? 100));
  savedUser.energy = Math.max(0, Math.min(100, savedUser.energy ?? 100));
}

const savedWallet = safeParseStorage<Wallet | null>('vl_wallet', null);

const initialAssets = safeParseStorage<Asset[]>('vl_assets', DEFAULT_INVESTMENT_ASSETS);
const finalAssets = initialAssets.length > 0 ? initialAssets : DEFAULT_INVESTMENT_ASSETS;

export const useStore = create<AppState>((set, get) => ({
  user: savedUser,
  wallet: savedWallet,
  token: localStorage.getItem('virtual_life_token'),
  activeTab: 'dashboard',
  isAuthModalOpen: !savedUser, // Show AuthModal automatically on first launch if not logged in
  toasts: [],
  isLoading: true,
  offshoreBalance: safeParseStorage<number>('vl_offshore', 0.0),

  language: savedLang,
  isLanguageModalOpen: initialLanguageModalState,
  setLanguage: (lang) => {
    localStorage.setItem('virtual_life_language', lang);
    set({ language: lang });
  },
  setIsLanguageModalOpen: (open) => set({ isLanguageModalOpen: open }),
  t: (key) => getTranslation(get().language, key),
  formatCurrency: (amount) => formatCurrencyByLanguage(amount, get().language),

  properties: safeParseStorage<Property[]>('vl_properties', []),
  vehicles: safeParseStorage<Vehicle[]>('vl_vehicles', []),
  jobs: [],
  assets: finalAssets,
  portfolio: safeParseStorage<UserPortfolio[]>('vl_portfolio', []),
  socialLoans: safeParseStorage<{ lent: SocialLoan[]; borrowed: SocialLoan[] }>('vl_loans', { lent: [], borrowed: [] }),
  transactions: safeParseStorage<Transaction[]>('vl_transactions', []),
  expenses: safeParseStorage<ExpenseItem[]>('vl_expenses', []),
  offers: [],
  undergroundAuction: (() => {
    const saved = safeParseStorage<UndergroundAuctionState | null>('vl_underground_auction', null);
    if (saved && !saved.resolved && saved.endsAt > Date.now()) return saved;
    return freshUndergroundAuction();
  })(),

  setUser: (user) => {
    if (user) {
      const sanitized = {
        ...user,
        health: Math.max(0, Math.min(100, user.health ?? 100)),
        happiness: Math.max(0, Math.min(100, user.happiness ?? 100)),
        energy: Math.max(0, Math.min(100, user.energy ?? 100)),
      };
      localStorage.setItem('vl_user', JSON.stringify(sanitized));
      set({ user: sanitized });
    } else {
      localStorage.removeItem('vl_user');
      set({ user: null });
    }
  },
  setWallet: (wallet) => {
    if (wallet) localStorage.setItem('vl_wallet', JSON.stringify(wallet));
    else localStorage.removeItem('vl_wallet');
    set({ wallet });
  },
  setToken: (token) => {
    if (token) localStorage.setItem('virtual_life_token', token);
    else localStorage.removeItem('virtual_life_token');
    set({ token });
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  refillVitalsWithImmunity: (immunityMinutes = 5) => {
    const state = get();
    if (state.user) {
      const updatedUser = {
        ...state.user,
        health: 100,
        happiness: 100,
        energy: 100
      };
      state.setUser(updatedUser);
      localStorage.setItem('vl_vital_immunity', (Date.now() + immunityMinutes * 60 * 1000).toString());
    }
  },

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    // NATIVE PHONE DEVICE SYSTEM PUSH NOTIFICATION TRIGGER
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(toast.title || 'VIRTUAL LIFE BİLDİRİMİ', {
            body: toast.message,
            icon: '/logo.jpg',
            badge: '/logo.jpg',
            silent: false
          });
        } catch (e) {
          console.warn('Native notification error:', e);
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(toast.title || 'VIRTUAL LIFE BİLDİRİMİ', {
              body: toast.message,
              icon: '/logo.jpg',
              badge: '/logo.jpg'
            });
          }
        });
      }
    }

    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  setProperties: (properties) => {
    localStorage.setItem('vl_properties', JSON.stringify(properties));
    set({ properties });
  },
  setVehicles: (vehicles) => {
    localStorage.setItem('vl_vehicles', JSON.stringify(vehicles));
    set({ vehicles });
  },
  setJobs: (jobs) => set({ jobs }),
  setAssets: (assets) => {
    localStorage.setItem('vl_assets', JSON.stringify(assets));
    set({ assets });
  },
  setPortfolio: (portfolio) => {
    localStorage.setItem('vl_portfolio', JSON.stringify(portfolio));
    set({ portfolio });
  },
  setSocialLoans: (socialLoans) => {
    localStorage.setItem('vl_loans', JSON.stringify(socialLoans));
    set({ socialLoans });
  },
  setTransactions: (transactions) => {
    localStorage.setItem('vl_transactions', JSON.stringify(transactions));
    set({ transactions });
  },
  setExpenses: (expenses) => {
    localStorage.setItem('vl_expenses', JSON.stringify(expenses));
    set({ expenses });
  },
  setOffers: (offers) => set({ offers }),
  setOffshoreBalance: (offshoreBalance) => {
    localStorage.setItem('vl_offshore', JSON.stringify(offshoreBalance));
    set({ offshoreBalance });
  },

  setUndergroundAuction: (undergroundAuction) => {
    localStorage.setItem('vl_underground_auction', JSON.stringify(undergroundAuction));
    set({ undergroundAuction });
  },

  resolveUndergroundAuctionIfDue: () => {
    const state = get();
    const auction = state.undergroundAuction;
    if (auction.resolved || auction.endsAt > Date.now()) return;

    if (auction.leader === 'PLAYER' && state.wallet && state.wallet.total_liquid >= auction.currentBid) {
      const winningBid = auction.currentBid;
      const wallet = state.wallet;
      const updatedBank = wallet.bank_balance >= winningBid ? wallet.bank_balance - winningBid : 0;
      const remainingFromCash = wallet.bank_balance >= winningBid ? 0 : winningBid - wallet.bank_balance;
      state.setWallet({
        ...wallet,
        bank_balance: updatedBank,
        cash_balance: wallet.cash_balance - remainingFromCash,
        total_liquid: wallet.total_liquid - winningBid
      });

      state.setVehicles([{
        id: 'veh-auction-' + Date.now(),
        brand_model: UNDERGROUND_AUCTION_ITEM_TITLE,
        vehicle_type: 'CAR',
        price: winningBid,
        daily_rental_price: Math.round(winningBid * 0.0008),
        condition_percentage: 100,
        has_insurance: true,
        owner_id: 'apple-revcat-user-1001',
        is_for_sale: false,
        is_for_rent: false
      }, ...state.vehicles]);

      state.addToast({
        type: 'success',
        title: '🏆 Müzayedeyi Kazandınız!',
        message: `${UNDERGROUND_AUCTION_ITEM_TITLE} için ${state.formatCurrency(winningBid)} ödendi ve garajınıza eklendi.`
      });
    } else if (auction.leader === 'PLAYER') {
      state.addToast({
        type: 'error',
        title: 'Müzayede Kaybedildi',
        message: 'Kazanan teklif anındaki bakiyeniz yetersiz olduğu için araç elinizden kaçtı.'
      });
    } else if (auction.leader === 'AI') {
      state.addToast({
        type: 'info',
        title: 'Müzayede Sona Erdi',
        message: `${UNDERGROUND_AUCTION_ITEM_TITLE} rakip bir teklif sahibine gitti. Yeni müzayede başlatabilirsiniz.`
      });
    }

    state.setUndergroundAuction({ ...auction, resolved: true });
  },

  acceptOffer: (offerId) => {
    const state = get();
    const offer = state.offers.find(o => o.id === offerId);
    if (!offer) return;

    if (offer.asset_type === 'VEHICLE') {
      state.setVehicles(state.vehicles.filter(v => v.id !== offer.asset_id));
    } else {
      state.setProperties(state.properties.filter(p => p.id !== offer.asset_id));
    }

    if (state.wallet) {
      const updatedBank = state.wallet.bank_balance + offer.offer_amount;
      state.setWallet({
        ...state.wallet,
        bank_balance: updatedBank,
        total_liquid: state.wallet.cash_balance + updatedBank
      });
    }

    set((s) => ({ offers: s.offers.filter(o => o.id !== offerId) }));

    state.addToast({
      type: 'success',
      title: 'Teklif Kabul Edildi 🤝',
      message: `${offer.asset_title} için ${offer.buyer_name} kullanıcısının ${state.formatCurrency(offer.offer_amount)} teklifi kabul edildi ve tutar hesabınıza yatırıldı.`
    });
  },

  declineOffer: (offerId) => {
    set((state) => ({
      offers: state.offers.filter(o => o.id !== offerId)
    }));
  },

  generateRandomOffer: () => {
    const state = get();
    if (!state.user) return;

    const myVehicles = state.vehicles.filter(v => v.owner_id === state.user!.id || v.owner_id === 'apple-revcat-user-1001');
    const myProperties = state.properties.filter(p => p.owner_id === state.user!.id || p.owner_id === 'apple-revcat-user-1001');
    const candidates: (Vehicle | Property)[] = [...myVehicles, ...myProperties];
    if (candidates.length === 0) return;

    const alreadyOffered = new Set(state.offers.map(o => o.asset_id));
    const eligible = candidates.filter(a => !alreadyOffered.has(a.id));
    if (eligible.length === 0) return;

    const asset = eligible[Math.floor(Math.random() * eligible.length)];
    const newOffer = AIService.generateOfflineOffer(asset);

    set((s) => ({ offers: [newOffer, ...s.offers] }));

    state.addToast({
      type: 'info',
      title: '📥 Yeni Satın Alma Teklifi',
      message: `${newOffer.buyer_name}, "${newOffer.asset_title}" için ${state.formatCurrency(newOffer.offer_amount)} teklif etti. Garaj/Emlak sekmesinden inceleyin.`
    });
  },

  collectMaturedLoans: () => {
    const state = get();
    const now = Date.now();
    const matured = state.socialLoans.lent.filter(l => l.status === 'ACTIVE' && l.matures_at <= now);
    if (matured.length === 0) return;

    const totalCollected = matured.reduce((sum, l) => sum + l.remaining_amount, 0);
    const remainingLent = state.socialLoans.lent.filter(l => !(l.status === 'ACTIVE' && l.matures_at <= now));
    state.setSocialLoans({ lent: remainingLent, borrowed: state.socialLoans.borrowed });

    if (state.wallet && totalCollected > 0) {
      const updatedBank = state.wallet.bank_balance + totalCollected;
      state.setWallet({
        ...state.wallet,
        bank_balance: updatedBank,
        total_liquid: state.wallet.cash_balance + updatedBank
      });
    }

    matured.forEach((loan) => {
      state.addToast({
        type: 'success',
        title: 'Borç Tahsil Edildi 💰',
        message: `${loan.borrower_id} kullanıcısına verdiğiniz borç, faiziyle birlikte (${state.formatCurrency(loan.remaining_amount)}) hesabınıza yatırıldı.`
      });
    });
  },

  logout: () => {
    localStorage.removeItem('virtual_life_token');
    localStorage.removeItem('vl_user');
    localStorage.removeItem('vl_wallet');
    set({ user: null, wallet: null, token: null, isAuthModalOpen: true });
  },

  // Permanently purges every locally stored game record for the account (App Store Guideline 5.1.1)
  deleteAccountData: () => {
    [
      'virtual_life_token',
      'vl_user',
      'vl_wallet',
      'vl_properties',
      'vl_vehicles',
      'vl_portfolio',
      'vl_loans',
      'vl_transactions',
      'vl_expenses',
      'vl_offshore',
      'vl_notification_prompted',
      'vl_vital_immunity',
    ].forEach((key) => localStorage.removeItem(key));

    set({
      user: null,
      wallet: null,
      token: null,
      properties: [],
      vehicles: [],
      jobs: [],
      assets: [],
      portfolio: [],
      socialLoans: { lent: [], borrowed: [] },
      transactions: [],
      expenses: [],
      offers: [],
      offshoreBalance: 0,
      isAuthModalOpen: true,
    });
  }
}));
