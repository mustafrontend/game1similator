import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, GUEST_OWNER_ID } from '../../store/useStore';
import { Vehicle, ExpenseItem } from '../../types';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, DollarSign, CreditCard, Handshake, ShieldCheck, Sparkles, Send, Percent, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const VehiclePurchaseModal: React.FC<Props> = ({ vehicle, onClose }) => {
  const { wallet, setWallet, vehicles, setVehicles, expenses, setExpenses, user, addToast } = useStore();
  const [activeMode, setActiveMode] = useState<'OFFER' | 'CASH' | 'CREDIT_CARD'>('OFFER');
  
  // Offer Tab State
  const [offerPrice, setOfferPrice] = useState(vehicle ? (vehicle.price * 0.95).toString() : '');
  
  // Credit Card Tab State
  const [installments, setInstallments] = useState<number>(6); // 1, 3, 6, 12 months

  if (!vehicle) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const isAiListing = vehicle.brand_model.includes('(AI İlan)') || !vehicle.owner_id || vehicle.owner_id === 'system';

  // Interest Rates for Credit Card
  const getInterestRate = (months: number) => {
    if (months === 1) return 0;
    if (months === 3) return 0.045; // %4.5
    if (months === 6) return 0.089; // %8.9
    if (months === 12) return 0.155; // %15.5
    return 0;
  };

  const interestRate = getInterestRate(installments);
  const totalCreditPrice = vehicle.price * (1 + interestRate);
  const monthlyPayment = totalCreditPrice / installments;

  const tramerCost = vehicle.tramer_damage_cost || 0;

  // 1. MAKE AN OFFER ACTION (AI vs Online Player)
  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(offerPrice);
    if (!amount || amount <= 0) return;

    if (isAiListing) {
      // AI Negotiation Bot logic
      const minAcceptablePrice = vehicle.price * 0.88; // 88% minimum acceptable threshold
      if (amount >= minAcceptablePrice) {
        // AI ACCEPT OFFER!
        if (wallet && wallet.total_liquid >= amount) {
          setWallet({
            ...wallet,
            bank_balance: wallet.bank_balance >= amount ? wallet.bank_balance - amount : wallet.bank_balance,
            cash_balance: wallet.bank_balance < amount ? wallet.cash_balance - (amount - wallet.bank_balance) : wallet.cash_balance,
            total_liquid: wallet.total_liquid - amount
          });
          const updatedVehicles = vehicles.map(v => v.id === vehicle.id ? { ...v, owner_id: user?.id || GUEST_OWNER_ID, is_for_sale: false } : v);
          setVehicles(updatedVehicles);

          addToast({
            type: 'success',
            title: '🤖 AI Teklifi Kabul Etti!',
            message: `${vehicle.brand_model} için verdiğiniz ${formatCurrency(amount)} teklifi kabul edildi! Araç garajınıza eklendi.`
          });
          onClose();
        } else {
          addToast({
            type: 'error',
            title: 'Yetersiz Bakiye',
            message: `Kabul edilen teklif tutarı (${formatCurrency(amount)}) bakiye yetersizliği nedeniyle işlenemedi.`
          });
        }
      } else {
        // AI COUNTER OFFER / REJECT
        const counterOffer = vehicle.price * 0.93;
        addToast({
          type: 'warning',
          title: '🤖 AI Satıcı Karşı Teklif Verdi',
          message: `${formatCurrency(amount)} teklifiniz düşük bulundu. AI satıcının son pazarlık fiyatı: ${formatCurrency(counterOffer)}`
        });
      }
    } else {
      // ONLINE PLAYER OFFER LOGIC
      addToast({
        type: 'success',
        title: '🌐 Online Oyuncuya Teklif İletildi!',
        message: `${vehicle.brand_model} için ${formatCurrency(amount)} teklifiniz araç sahibinin kutusuna bildirim olarak gönderildi.`
      });
      onClose();
    }
  };

  // 2. DIRECT CASH PURCHASE
  const handleCashPurchase = () => {
    if (!wallet || wallet.total_liquid < vehicle.price) {
      addToast({
        type: 'error',
        title: 'Yetersiz Nakit Bakiye',
        message: `Araç nakit bedeli: ${formatCurrency(vehicle.price)}`
      });
      return;
    }

    setWallet({
      ...wallet,
      bank_balance: wallet.bank_balance >= vehicle.price ? wallet.bank_balance - vehicle.price : wallet.bank_balance,
      cash_balance: wallet.bank_balance < vehicle.price ? wallet.cash_balance - (vehicle.price - wallet.bank_balance) : wallet.cash_balance,
      total_liquid: wallet.total_liquid - vehicle.price
    });

    const updatedVehicles = vehicles.map(v => v.id === vehicle.id ? { ...v, owner_id: user?.id || GUEST_OWNER_ID, is_for_sale: false } : v);
    setVehicles(updatedVehicles);

    addToast({
      type: 'success',
      title: 'Araç Satın Alındı! 🏎️',
      message: `${vehicle.brand_model} tam nakit ödemeyle satın alındı ve garajınıza eklendi.`
    });
    onClose();
  };

  // 3. CREDIT CARD INSTALLMENT PURCHASE
  const handleCreditCardPurchase = () => {
    const userCreditLimit = (user?.credit_score || 1000) * 1500;
    if (totalCreditPrice > userCreditLimit) {
      addToast({
        type: 'error',
        title: 'Kredi Kartı Limiti Yetersiz',
        message: `Findeks Kredi Skoru limitiniz (${formatCurrency(userCreditLimit)}) bu araç taksitine yetmiyor.`
      });
      return;
    }

    const updatedVehicles = vehicles.map(v => v.id === vehicle.id ? { ...v, owner_id: user?.id || GUEST_OWNER_ID, is_for_sale: false } : v);
    setVehicles(updatedVehicles);

    const newExpense: ExpenseItem = {
      id: 'exp-vehicle-' + Date.now(),
      user_id: user?.id || GUEST_OWNER_ID,
      title: `${vehicle.brand_model} Taşıt Kredi Kartı Taksiti`,
      category: 'Kredi',
      amount: Math.round(monthlyPayment),
      due_date: '28 Ağustos',
      auto_pay: true,
      status: 'PENDING'
    };
    setExpenses([newExpense, ...expenses]);

    addToast({
      type: 'success',
      title: 'Kredi Kartı Taksitli Satın Alım 💳',
      message: `${vehicle.brand_model} ${installments} taksit planı ile garajınıza eklendi. Aylık ${formatCurrency(monthlyPayment)} taksit Gelecek Ödemeler Takvimi'ne eklendi.`
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden text-white my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Vehicle Info Header */}
          <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{vehicle.brand_model}</h3>
                <Badge variant={isAiListing ? 'gold' : 'emerald'}>
                  {isAiListing ? '🤖 AI İLAN' : '🌐 OYUNCU İLANI'}
                </Badge>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Kondisyon: %{vehicle.condition_percentage} • Tramer: {tramerCost > 0 ? `₺${tramerCost.toLocaleString()}` : 'Hatasız 🛡️'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 block">Peşin Fiyatı</span>
              <span className="text-lg font-black text-amber-400">{formatCurrency(vehicle.price)}</span>
            </div>
          </div>

          {/* MODE NAVIGATION TABS */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              onClick={() => setActiveMode('OFFER')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'OFFER' ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Handshake className="w-4 h-4" /> 1. Teklif Ver
            </button>
            <button
              onClick={() => setActiveMode('CASH')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'CASH' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" /> 2. Nakit Al
            </button>
            <button
              onClick={() => setActiveMode('CREDIT_CARD')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'CREDIT_CARD' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" /> 3. Kredi Kartı
            </button>
          </div>

          {/* MODE 1: OFFER / PAZARLIK */}
          {activeMode === 'OFFER' && (
            <form onSubmit={handleSendOffer} className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-amber-400/40">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>{isAiListing ? 'Yapay Zeka Otonom Pazarlık Motoru' : 'Online Oyuncuya Teklif Bildirimi'}</span>
              </div>
              <p className="text-xs font-semibold text-slate-400">
                {isAiListing
                  ? 'AI Satıcı verdiğiniz teklifi piyasa rayici ve kondisyona göre anında değerlendirir ve yanıt verir.'
                  : 'Araç sahibi online oyuncunun bildirim kutusuna canlı teklifiniz iletilir.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Pazarlık Teklifiniz (₺)</label>
                <input
                  type="number"
                  required
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Teklif bedelini girin..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-black text-amber-400 focus:outline-hidden"
                />
              </div>

              <Button variant="gold" className="w-full py-3" type="submit">
                <Send className="w-4 h-4 mr-2 text-slate-950" /> Teklifi {isAiListing ? 'AI Satıcıya Gönder' : 'Oyuncunun Kutusuna At'}
              </Button>
            </form>
          )}

          {/* MODE 2: DIRECT CASH PURCHASE */}
          {activeMode === 'CASH' && (
            <div className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-emerald-500/40">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Anında Peşin Nakit Satın Alma</span>
              </div>
              <div className="space-y-2 text-xs font-semibold text-slate-300">
                <p className="flex justify-between"><span>Araç Fiyatı:</span> <strong className="text-white">{formatCurrency(vehicle.price)}</strong></p>
                <p className="flex justify-between"><span>Mevcut Toplam Likit Paranım:</span> <strong className="text-emerald-400 font-bold">{formatCurrency(wallet?.total_liquid || 0)}</strong></p>
              </div>

              <Button variant="primary" className="w-full py-3" onClick={handleCashPurchase}>
                <DollarSign className="w-4 h-4 mr-2" /> {formatCurrency(vehicle.price)} Peşin Öde ve Satın Al
              </Button>
            </div>
          )}

          {/* MODE 3: CREDIT CARD & INSTALLMENTS WITH INTEREST */}
          {activeMode === 'CREDIT_CARD' && (
            <div className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-sky-500/40">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <CreditCard className="w-4 h-4" />
                <span>Kredi Kartı Taksitli Satın Alım (Faiz Oranlı)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Taksit Planı Seçin</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 6, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setInstallments(m)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        installments === m
                          ? 'bg-sky-500 border-sky-400 text-white ring-2 ring-sky-400/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{m === 1 ? 'Tek Çekim' : `${m} Taksit`}</span>
                      <span className="block text-[10px] text-slate-300 font-normal">
                        {m === 1 ? '%0 Faiz' : `%${(getInterestRate(m) * 100).toFixed(1)} Faiz`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl space-y-1.5 text-xs border border-slate-800">
                <p className="flex justify-between text-slate-400"><span>Vade Faiz Oranı:</span> <strong className="text-amber-400">%{ (interestRate * 100).toFixed(1) }</strong></p>
                <p className="flex justify-between text-slate-400"><span>Aylık Taksit Tutarınız:</span> <strong className="text-sky-300 font-bold">{formatCurrency(monthlyPayment)} / ay</strong></p>
                <p className="flex justify-between text-slate-200 pt-1 border-t border-slate-800 font-bold">
                  <span>Toplam Geri Ödeme:</span>
                  <strong className="text-white text-sm">{formatCurrency(totalCreditPrice)}</strong>
                </p>
              </div>

              <Button variant="gold" className="w-full py-3" onClick={handleCreditCardPurchase}>
                <CreditCard className="w-4 h-4 mr-2" /> Kredi Kartı İle Satın Al ({installments} Taksit)
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
