import React from 'react';
import { useStore } from '../../store/useStore';

interface StatusBarProps {
  label: string;
  value: number; // 0 to 100
  colorClass: string;
  glowClass?: string;
  icon?: React.ReactNode;
}

export const StatusBar: React.FC<StatusBarProps> = ({ label, value, colorClass, icon }) => {
  const { setActiveTab } = useStore();
  const percentage = Math.max(0, Math.min(100, value));
  const isLow = percentage <= 15;

  return (
    <div
      onClick={() => setActiveTab('store')}
      className="flex flex-col gap-1 w-full min-w-[110px] cursor-pointer group"
      title={`${label} %${percentage.toFixed(0)} - Tıkla ve İksir İle Yükselt ($1.99)`}
    >
      <div className="flex justify-between items-center text-xs font-bold text-slate-200">
        <div className="flex items-center gap-1.5 group-hover:text-amber-300 transition-all">
          {icon}
          <span className="tracking-tight">{label}</span>
        </div>
        <span className={`font-mono text-xs font-black ${isLow ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className={`h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border p-0.5 relative transition-all ${
        isLow ? 'border-rose-500/80 shadow-md shadow-rose-500/20' : 'border-slate-800 group-hover:border-amber-400/50'
      }`}>
        <div
          className={`h-full transition-all duration-500 rounded-full ${colorClass} relative overflow-hidden ${isLow ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
