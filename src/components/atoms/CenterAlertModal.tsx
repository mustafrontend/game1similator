import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { AlertTriangle, CheckCircle2, Info, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  type?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose: () => void;
}

export const CenterAlertModal: React.FC<Props> = ({
  isOpen,
  type = 'error',
  title = 'Bildirim',
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-8 h-8 text-rose-400" />;
      case 'success':
        return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
      case 'warning':
        return <ShieldAlert className="w-8 h-8 text-amber-400" />;
      case 'info':
      default:
        return <Info className="w-8 h-8 text-sky-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return 'border-rose-500/60 shadow-rose-500/20';
      case 'success':
        return 'border-emerald-500/60 shadow-emerald-500/20';
      case 'warning':
        return 'border-amber-500/60 shadow-amber-500/20';
      case 'info':
      default:
        return 'border-sky-500/60 shadow-sky-500/20';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border ${getBorderColor()} relative text-white text-center space-y-4`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
            {getIcon()}
          </div>

          <div>
            <h3 className="text-lg font-black text-white">{title}</h3>
            <p className="text-xs font-semibold text-slate-300 mt-2 leading-relaxed">{message}</p>
          </div>

          <Button
            variant={type === 'error' ? 'primary' : 'gold'}
            className="w-full py-3 text-xs font-black"
            onClick={onClose}
          >
            Tamam
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
