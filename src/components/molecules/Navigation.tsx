import React from 'react';
import { useStore, ActiveTab } from '../../store/useStore';
import { LayoutDashboard, MapPin, Car, Warehouse, Trophy, Eye, Briefcase, HeartHandshake, TrendingUp, MessageSquare, User, ShoppingBag } from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  translationKey: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, t } = useStore();

  const row1Items: NavItem[] = [
    { id: 'dashboard', translationKey: 'tab_dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'store', translationKey: 'tab_store', icon: <ShoppingBag className="w-4 h-4 text-amber-400" />, badge: 'VIP' },
    { id: 'map', translationKey: 'tab_map', icon: <MapPin className="w-4 h-4" /> },
    { id: 'vehicles', translationKey: 'tab_vehicles', icon: <Car className="w-4 h-4" /> },
    { id: 'garage', translationKey: 'tab_garage', icon: <Warehouse className="w-4 h-4" /> },
    { id: 'underground', translationKey: 'tab_underground', icon: <Eye className="w-4 h-4 text-purple-400" />, badge: 'VIP' },
  ];

  const row2Items: NavItem[] = [
    { id: 'leaderboard', translationKey: 'tab_leaderboard', icon: <Trophy className="w-4 h-4 text-amber-400" /> },
    { id: 'career', translationKey: 'tab_career', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'social', translationKey: 'tab_social', icon: <HeartHandshake className="w-4 h-4 text-rose-400" /> },
    { id: 'investment', translationKey: 'tab_investment', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
    { id: 'chat', translationKey: 'tab_chat', icon: <MessageSquare className="w-4 h-4 text-sky-400" />, badge: 'LIVE' },
    { id: 'profile', translationKey: 'tab_profile', icon: <User className="w-4 h-4 text-amber-300" /> },
  ];

  const renderNavButton = (item: NavItem) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-black transition-all relative ${
          isActive
            ? 'bg-amber-500/25 text-amber-300 border border-amber-400/60 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/20'
            : item.id === 'store'
            ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30 animate-pulse'
            : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
        }`}
      >
        {item.icon}
        <span className="whitespace-nowrap">{t(item.translationKey)}</span>
        {item.badge && (
          <span className={`ml-1 px-1.5 py-0.2 rounded-md text-[10px] font-black ${
            item.id === 'store' ? 'bg-amber-400 text-slate-950' : item.id === 'underground' ? 'bg-purple-600 text-white' : 'bg-emerald-500 text-slate-950'
          }`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <nav className="bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl sticky top-[73px] z-40 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
        {/* ROW 1: 6 ITEMS INCL. STORE */}
        <div className="grid grid-cols-6 gap-2">
          {row1Items.map(renderNavButton)}
        </div>

        {/* ROW 2: 6 ITEMS */}
        <div className="grid grid-cols-6 gap-2">
          {row2Items.map(renderNavButton)}
        </div>
      </div>
    </nav>
  );
};
