import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'gold' | 'cyan' | 'purple';
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, variant = 'default' }) => {
  const variantStyles = {
    default: 'game-card',
    gold: 'game-card game-card-gold',
    cyan: 'game-card border-sky-500/40 bg-slate-900 shadow-sky-950/40',
    purple: 'game-card border-purple-500/40 bg-slate-900 shadow-purple-950/40',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={onClick ? { scale: 1.015, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`${variantStyles[variant]} p-5 relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};
