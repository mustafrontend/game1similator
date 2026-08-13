import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Zap, Heart, Smile, X, ShoppingBag, AlertTriangle, Stethoscope, ShieldAlert, Palmtree, Coffee } from 'lucide-react';
import { purchaseProductById } from '../../services/purchases';

const ELIXIR_PRODUCT_ID = 'vl_boost_elixir';

export const VitalLowOfferModal: React.FC = () => {
  const { user, setUser, wallet, setWallet, setActiveTab, addToast, t } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [payingCash, setPayingCash] = useState(false);

  const health = user?.health ?? 100;
  const happiness = user?.happiness ?? 100;
  const energy = user?.energy ?? 100;

  const isCriticalHealth = health <= 20;
  const isCriticalHappiness = happiness <= 20;
  const isCriticalEnergy = energy <= 20;
  const isCriticalAny = isCriticalHealth || isCriticalHappiness || isCriticalEnergy;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  // Dynamic 1/3 (33%) calculation of user's liquid wealth
  const userLiquid = wallet?.total_liquid || 10000;
  const dynamicOneThirdFee = Math.max(1000, Math.round(userLiquid * (1 / 3)));

  useEffect(() => {
    if (isCriticalAny) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [health, happiness, energy, isCriticalAny]);

  const handleDismiss = () => {
    setIsOpen(false);
  };

  // DYNAMIC 1/3 CASH PAYMENT PER VITAL (HEALTH, HAPPINESS, ENERGY)
  const handlePayVitalCash = (vitalType: 'HEALTH' | 'HAPPINESS' | 'ENERGY') => {
    if (!wallet || wallet.total_liquid < dynamicOneThirdFee) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye 💳',
        message: `1/3 Pay Ödeme tutarı: ${formatCurrency(dynamicOneThirdFee)}. Cüzdan bakiyeniz yetersiz!`
      });
      return;
    }

    setPayingCash(true);
    setTimeout(() => {
      setPayingCash(false);

      const updatedBank = wallet.bank_balance >= dynamicOneThirdFee ? wallet.bank_balance - dynamicOneThirdFee : wallet.bank_balance;
      const updatedCash = wallet.bank_balance < dynamicOneThirdFee ? wallet.cash_balance - (dynamicOneThirdFee - wallet.bank_balance) : wallet.cash_balance;
      
      setWallet({
        ...wallet,
        bank_balance: updatedBank,
        cash_balance: updatedCash,
        total_liquid: wallet.total_liquid - dynamicOneThirdFee
      });

      useStore.getState().refillVitalsWithImmunity(10);

      addToast({
        type: 'success',
        title: `1/3 ${t('pay_now')} 🟢`,
        message: `${formatCurrency(dynamicOneThirdFee)} (1/3) ${t('pay_now')}`
      });

      handleDismiss();
    }, 800);
  };

  // UNIVERSAL IN-APP PURCHASE SOLUTION ($1.99 Elixir Refills ALL 3 Vitals to 100%)
  const handleInstantBuyElixir = async () => {
    setPurchasing(true);
    try {
      await purchaseProductById(ELIXIR_PRODUCT_ID);

      useStore.getState().refillVitalsWithImmunity(10);

      addToast({
        type: 'success',
        title: `${t('buy_elixir')} ⚡`,
        message: '100% Full Refill'
      });

      handleDismiss();
    } catch (err: any) {
      if (!err?.userCancelled) {
        addToast({
          type: 'error',
          title: 'Satın Alma Başarısız',
          message: err?.message || 'Satın alma işlemi tamamlanamadı.'
        });
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500/80 relative text-white my-auto text-center max-h-[90vh] overflow-y-auto scrollbar-none"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* CRITICAL WARNING HEADER */}
          <div className="flex flex-col items-center justify-center pt-2 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mb-3 shadow-lg shadow-rose-500/30 animate-pulse">
              <AlertTriangle className="w-7 h-7 text-rose-400" />
            </div>
            <Badge variant="rose" className="mb-2 text-[10px] font-black tracking-wider">
              {t('critical_warning')}
            </Badge>
            <h3 className="text-xl font-black text-white">
              {t('vital_depleted')}
            </h3>
            <p className="text-xs font-semibold text-slate-300 mt-1 leading-relaxed">
              {t('health_action_desc')}
            </p>
          </div>

          {/* VITALS STATUS METRICS */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 mb-5">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 block flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" /> {t('health')}
              </span>
              <strong className={`text-sm font-black ${health <= 20 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                %{health.toFixed(0)}
              </strong>
            </div>

            <div className="text-center border-x border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block flex items-center justify-center gap-1">
                <Smile className="w-3.5 h-3.5 text-amber-400" /> {t('happiness')}
              </span>
              <strong className={`text-sm font-black ${happiness <= 20 ? 'text-amber-400 animate-pulse' : 'text-slate-200'}`}>
                %{happiness.toFixed(0)}
              </strong>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 block flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-sky-400" /> {t('energy')}
              </span>
              <strong className={`text-sm font-black ${energy <= 20 ? 'text-sky-400 animate-pulse' : 'text-slate-200'}`}>
                %{energy.toFixed(0)}
              </strong>
            </div>
          </div>

          {/* DYNAMIC 1/3 CASH OPTIONS FOR HEALTH, HAPPINESS & ENERGY */}
          <div className="space-y-3 mb-5 text-left">
            {/* 1. SAĞLIK DÜŞÜKSE */}
            {isCriticalHealth && (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-rose-500/50 shadow-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black text-rose-300 flex items-center gap-1">
                    <Stethoscope className="w-4 h-4 text-rose-400" /> {t('hospital_surgery')}
                  </span>
                  <Badge variant="rose">{formatCurrency(dynamicOneThirdFee)}</Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full py-2.5 text-xs font-black border-rose-500 text-rose-300 hover:bg-rose-600 hover:text-white"
                  onClick={() => handlePayVitalCash('HEALTH')}
                  disabled={payingCash}
                >
                  🏥 {formatCurrency(dynamicOneThirdFee)} {t('pay_one_third_btn')}
                </Button>
              </div>
            )}

            {/* 2. MUTLULUK DÜŞÜKSE */}
            {isCriticalHappiness && (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-amber-400/50 shadow-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                    <Palmtree className="w-4 h-4 text-amber-400" /> {t('maldivian_vacation')}
                  </span>
                  <Badge variant="gold">{formatCurrency(dynamicOneThirdFee)}</Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full py-2.5 text-xs font-black border-amber-400 text-amber-300 hover:bg-amber-500 hover:text-slate-950"
                  onClick={() => handlePayVitalCash('HAPPINESS')}
                  disabled={payingCash}
                >
                  🌴 {formatCurrency(dynamicOneThirdFee)} {t('pay_one_third_btn')}
                </Button>
              </div>
            )}

            {/* 3. ENERJİ DÜŞÜKSE */}
            {isCriticalEnergy && (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-sky-400/50 shadow-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black text-sky-300 flex items-center gap-1">
                    <Coffee className="w-4 h-4 text-sky-400" /> {t('energy_serum')}
                  </span>
                  <Badge variant="sky">{formatCurrency(dynamicOneThirdFee)}</Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full py-2.5 text-xs font-black border-sky-400 text-sky-300 hover:bg-sky-500 hover:text-white"
                  onClick={() => handlePayVitalCash('ENERGY')}
                  disabled={payingCash}
                >
                  ☕ {formatCurrency(dynamicOneThirdFee)} {t('pay_one_third_btn')}
                </Button>
              </div>
            )}

            {/* UNIVERSAL $1.99 IN-APP PURCHASE ELIXIR */}
            <div className="p-3.5 bg-gradient-to-b from-amber-500/15 to-yellow-500/5 rounded-2xl border border-amber-400/60 shadow-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-400" /> ⭐ {t('buy_elixir')}
                </span>
                <Badge variant="gold">$1.99</Badge>
              </div>
              <Button
                variant="gold"
                className="w-full py-2.5 text-xs font-black shadow-lg shadow-amber-500/20"
                onClick={handleInstantBuyElixir}
                disabled={purchasing}
              >
                {purchasing ? (
                  <span>{t('processing')}</span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Zap className="w-4 h-4 text-slate-950" /> ⚡ {t('buy_elixir')}
                  </span>
                )}
              </Button>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full py-2 text-xs font-bold"
            onClick={() => {
              handleDismiss();
              setActiveTab('store');
            }}
          >
            <ShoppingBag className="w-4 h-4 mr-1" /> {t('store_official_title')}
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
