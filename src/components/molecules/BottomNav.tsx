import React from 'react';
import { useStore, ActiveTab } from '../../store/useStore';
import { LayoutDashboard, MapPin, Car, Warehouse, Trophy, Eye, Briefcase, HeartHandshake, TrendingUp, MessageSquare, User, ShoppingBag } from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  translationKey: string;
  icon: React.ReactNode;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useStore();

  const row1Items: NavItem[] = [
    { id: 'dashboard', translationKey: 'tab_dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'store', translationKey: 'tab_store', icon: <ShoppingBag className="w-4 h-4 text-amber-400" /> },
    { id: 'map', translationKey: 'tab_map', icon: <MapPin className="w-4 h-4" /> },
    { id: 'vehicles', translationKey: 'tab_vehicles', icon: <Car className="w-4 h-4" /> },
    { id: 'garage', translationKey: 'tab_garage', icon: <Warehouse className="w-4 h-4" /> },
    { id: 'underground', translationKey: 'tab_underground', icon: <Eye className="w-4 h-4 text-purple-400" /> },
  ];

  const row2Items: NavItem[] = [
    { id: 'leaderboard', translationKey: 'tab_leaderboard', icon: <Trophy className="w-4 h-4 text-amber-400" /> },
    { id: 'career', translationKey: 'tab_career', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'social', translationKey: 'tab_social', icon: <HeartHandshake className="w-4 h-4 text-rose-400" /> },
    { id: 'investment', translationKey: 'tab_investment', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
    { id: 'chat', translationKey: 'tab_chat', icon: <MessageSquare className="w-4 h-4 text-sky-400" /> },
    { id: 'profile', translationKey: 'tab_profile', icon: <User className="w-4 h-4 text-amber-300" /> },
  ];

  const renderNavBtn = (item: NavItem) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
          isActive
            ? 'text-amber-300 font-extrabold bg-amber-500/20 border border-amber-400/50 shadow-md'
            : item.id === 'store'
            ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-400/30'
            : 'text-slate-400 font-bold hover:text-white bg-slate-900/80 border border-slate-800/80'
        }`}
      >
        {item.icon}
        <span className="text-[9px] mt-0.5 whitespace-nowrap">{t(item.translationKey)}</span>
      </button>
    );
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl z-50 p-2.5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] shadow-2xl space-y-2">
      {/* ROW 1: 6 COLUMNS INCL STORE */}
      <div className="grid grid-cols-6 gap-1.5">
        {row1Items.map(renderNavBtn)}
      </div>

      {/* ROW 2: 6 COLUMNS */}
      <div className="grid grid-cols-6 gap-1.5">
        {row2Items.map(renderNavBtn)}
      </div>
    </div>
  );
};
