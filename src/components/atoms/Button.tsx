import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 border border-sky-400/40',
    secondary: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 border border-emerald-400/40',
    gold: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 hover:from-amber-300 hover:to-yellow-400 border border-amber-300',
    outline: 'border border-slate-700 bg-slate-800/90 text-slate-100 hover:bg-slate-700 hover:border-slate-500 shadow-sm',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/30 hover:from-rose-500 hover:to-red-500 border border-rose-400/40',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/60',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-4.5 py-2.5 text-sm font-bold',
    lg: 'px-6 py-3 text-base font-extrabold',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};
