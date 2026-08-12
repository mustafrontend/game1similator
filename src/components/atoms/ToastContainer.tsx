import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, ToastNotification } from '../../store/useStore';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  const getToastStyle = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-slate-900/95 border-emerald-500/60 shadow-emerald-500/20 text-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        };
      case 'error':
        return {
          bg: 'bg-slate-900/95 border-rose-500/60 shadow-rose-500/20 text-rose-300',
          icon: <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-slate-900/95 border-amber-500/60 shadow-amber-500/20 text-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900/95 border-sky-500/60 shadow-sky-500/20 text-sky-300',
          icon: <Info className="w-4 h-4 text-sky-400 shrink-0" />
        };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      <AnimatePresence>
        {toasts.slice(-3).map((toast) => {
          const style = getToastStyle(toast.type);

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto border rounded-2xl p-3.5 shadow-xl backdrop-blur-xl flex items-start gap-3 relative overflow-hidden ${style.bg}`}
            >
              <div className="mt-0.5">{style.icon}</div>
              <div className="flex-1 pr-4">
                {toast.title && (
                  <h4 className={`text-xs font-black uppercase tracking-wider ${style.bg.split(' ').pop()}`}>
                    {toast.title}
                  </h4>
                )}
                <p className="text-[11px] font-semibold text-slate-200 leading-snug mt-0.5">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
