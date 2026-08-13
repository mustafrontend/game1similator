import { create } from 'zustand';
import { User, Wallet, Property, Vehicle, Job, Asset, SocialLoan, Transaction, UserPortfolio, MarketOffer, ExpenseItem } from '../types';
import { LanguageCode, getTranslation } from '../i18n/translations';
import { formatCurrencyByLanguage } from '../i18n/currency';

export type ActiveTab = 'dashboard' | 'map' | 'vehicles' | 'garage' | 'leaderboard' | 'underground' | 'career' | 'social' | 'investment' | 'chat' | 'profile' | 'store';

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
  
  acceptOffer: (offerId: string) => void;
  declineOffer: (offerId: string) => void;

  logout: () => void;
  deleteAccountData: () => void;
}

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
  assets: [],
  portfolio: safeParseStorage<UserPortfolio[]>('vl_portfolio', []),
  socialLoans: safeParseStorage<{ lent: SocialLoan[]; borrowed: SocialLoan[] }>('vl_loans', { lent: [], borrowed: [] }),
  transactions: safeParseStorage<Transaction[]>('vl_transactions', []),
  expenses: safeParseStorage<ExpenseItem[]>('vl_expenses', []),
  offers: [],

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
  setAssets: (assets) => set({ assets }),
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

  acceptOffer: (offerId) => {
    set((state) => ({
      offers: state.offers.filter(o => o.id !== offerId)
    }));
  },

  declineOffer: (offerId) => {
    set((state) => ({
      offers: state.offers.filter(o => o.id !== offerId)
    }));
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
