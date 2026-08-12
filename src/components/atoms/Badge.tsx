import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'rose' | 'amber' | 'sky' | 'slate' | 'purple' | 'gold';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', className = '' }) => {
  const variants = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-bold',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-bold',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/40 font-bold',
    sky: 'bg-sky-500/15 text-sky-400 border-sky-500/40 font-bold',
    slate: 'bg-slate-800 text-slate-300 border-slate-700 font-bold',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/40 font-bold',
    gold: 'bg-amber-400/20 text-amber-300 border-amber-400/60 font-black',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border backdrop-blur-xs ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
