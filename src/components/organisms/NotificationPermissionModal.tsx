import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Bell, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationPermissionModal: React.FC = () => {
  const { t, addToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if notification permission prompt has been skipped or already decided
    const hasPrompted = localStorage.getItem('vl_notification_prompted');
    
    if (!hasPrompted && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAllowNotifications = async () => {
    localStorage.setItem('vl_notification_prompted', 'true');
    setIsOpen(false);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          addToast({
            type: 'success',
            title: '🔔 Bildirimler Aktif Edildi',
            message: 'Kira gelirleriniz, borsa sinyalleri ve göstergeleriniz cihazınıza anlık bildirilecek.'
          });
        }
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
  };

  const handleSkip = () => {
    localStorage.setItem('vl_notification_prompted', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-3xl max-w-md w-full p-6 border-2 border-amber-400/50 shadow-2xl text-center relative space-y-4 text-white overflow-hidden"
          >
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
              <Bell className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <Badge variant="gold" className="mb-2">APP STORE COMPLIANCE (GUIDELINE 5.1.1)</Badge>
              <h3 className="text-lg font-black text-white">{t('notification_perm_title')}</h3>
              <p className="text-xs font-semibold text-slate-300 mt-2 leading-relaxed px-2">
                {t('notification_perm_sub')}
              </p>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-left space-y-1.5 text-xs text-slate-300">
              <p className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Pasif kira gelirleriniz yattığında anında haberiniz olsun.
              </p>
              <p className="flex items-center gap-2 text-sky-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Borsa ve kripto yükseliş/düşüş sinyallerini kaçırmayın.
              </p>
              <p className="flex items-center gap-2 text-amber-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Sağlık, mutluluk ve enerji düşüş cezalarından korunun.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="gold"
                className="w-full py-3.5 text-xs font-black shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                onClick={handleAllowNotifications}
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" /> {t('notification_perm_btn')}
              </Button>

              <button
                onClick={handleSkip}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 py-1 transition-all"
              >
                {t('notification_perm_skip')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
