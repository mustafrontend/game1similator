import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, GUEST_OWNER_ID } from '../../store/useStore';
import { ApiService } from '../../services/api';
import { Property } from '../../types';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, Home, Key, Tag, DollarSign, Handshake, Send, CheckCircle2, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';

interface Props {
  property: Property | null;
  onClose: () => void;
}

export const PropertyPurchaseModal: React.FC<Props> = ({ property, onClose }) => {
  const { user, wallet, setWallet, properties, setProperties, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<'ACTION' | 'OFFER'>('ACTION');
  const [offerPrice, setOfferPrice] = useState(property ? (property.price * 0.92).toString() : '');

  if (!property) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const isSale = property.is_for_sale;
  const cost = isSale ? property.price : property.rental_price;

  // 1. BUY TAPU OR SIGN RENTAL CONTRACT WITH NEGATIVE OVERDRAFT SUPPORT & API DB PERSISTENCE
  const handleConfirmTransaction = async () => {
    if (!wallet) return;
    const myId = user?.id || GUEST_OWNER_ID;

    const currentTotal = wallet.cash_balance + wallet.bank_balance;
    const isGoingNegative = currentTotal < cost;

    // Deduct cost from wallet balance (allowing overdraft into negative bank balance)
    const updatedBank = wallet.bank_balance - cost;
    const updatedWallet = {
      ...wallet,
      bank_balance: updatedBank,
      total_liquid: wallet.cash_balance + updatedBank
    };
    setWallet(updatedWallet);

    // Update Property state locally & in localStorage
    const updatedProps = properties.map(p => {
      if (p.id === property.id) {
        return {
          ...p,
          is_for_sale: false,
          is_for_rent: false,
          owner_id: isSale ? myId : p.owner_id,
          tenant_id: !isSale ? myId : p.tenant_id
        };
      }
      return p;
    });
    setProperties(updatedProps);

    // Sync with Python Backend SQLite DB async
    try {
      await ApiService.buyProperty(property.id);
    } catch (err) {
      console.warn('Backend DB sync notice:', err);
    }

    addToast({
      type: isGoingNegative ? 'warning' : 'success',
      title: isSale ? 'Tapu Devredildi & DB İşlendi! 🏠' : 'Kira Kontratı İmzalandı 🔑',
      message: `${property.title} mülkü ${isSale ? 'tapusu üzerinize geçti.' : 'kiralandı.'} ${
        isGoingNegative ? `(⚠️ Bakiyeniz ${formatCurrency(wallet.cash_balance + updatedBank)} eksi KMH hesabına düştü)` : ''
      }`
    });
    onClose();
  };

  // 2. SEND OFFER FOR PROPERTY
  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(offerPrice);
    if (!amount || amount <= 0) return;

    addToast({
      type: 'success',
      title: 'Emlak Pazarlık Teklifi Gönderildi 🤝',
      message: `"${property.title}" mülkü için ${formatCurrency(amount)} tutarındaki teklifiniz mülk sahibine iletildi.`
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

          {/* Property Info Header */}
          <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={isSale ? 'gold' : 'emerald'}>
                  {isSale ? '🏷️ SATILIK TAPULU MÜLK' : '🔑 KİRALIK DAİRE / PLAZA'}
                </Badge>
                <Badge variant="purple">{property.property_type === 'COMMERCIAL' ? 'Ticari Kat' : 'Konut'}</Badge>
              </div>
              <h3 className="text-xl font-black text-white mt-1">{property.title}</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">{property.address_name}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 block">
                {isSale ? 'Satış Tapu Bedeli' : 'Aylık Kontrat Kirası'}
              </span>
              <span className={`text-lg font-black ${isSale ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formatCurrency(cost)}
              </span>
              {isSale && (
                <p className="text-[10px] font-bold text-emerald-400 mt-1">
                  Kiraya Verirsen: +{formatCurrency(property.rental_yield_per_tick)}/tick
                </p>
              )}
            </div>
          </div>

          {/* MODE NAVIGATION TABS */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => setActiveTab('ACTION')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ACTION' ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" /> {isSale ? 'Tapuyu Satın Al' : 'Kontratı İmzala & Kirala'}
            </button>
            <button
              onClick={() => setActiveTab('OFFER')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'OFFER' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Handshake className="w-4 h-4" /> Pazarlık Teklifi Ver
            </button>
          </div>

          {/* TAB 1: BUY OR RENT CONFIRMATION */}
          {activeTab === 'ACTION' && (
            <div className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-amber-400/40">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSale ? 'Emlak Tapu Devir Onayı' : 'Kira Kontratı & Depozito Ödeme Onayı'}</span>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-300 border-y border-slate-800 py-3">
                <p className="flex justify-between"><span>Mülk Konumu:</span> <strong className="text-white">{property.address_name}</strong></p>
                <p className="flex justify-between"><span>Ödenecek Tutar:</span> <strong className="text-amber-400 font-bold">{formatCurrency(cost)}</strong></p>
                <p className="flex justify-between"><span>Mevcut Paranım:</span> <strong className="text-emerald-400 font-bold">{formatCurrency(wallet?.total_liquid || 0)}</strong></p>
              </div>

              {(wallet?.total_liquid || 0) < cost && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-extrabold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Bakiyeniz bu tutardan azdır. İşlem sonrası hesabınız eksi KMH bakiyesine düşecektir.</span>
                </div>
              )}

              <Button
                variant={isSale ? 'gold' : 'secondary'}
                className="w-full py-3 font-black text-sm"
                onClick={handleConfirmTransaction}
              >
                {isSale ? `🏠 ${formatCurrency(cost)} Öde ve Tapuyu Satın Al` : `🔑 ${formatCurrency(cost)} Depozito Öde ve Kirala`}
              </Button>
            </div>
          )}

          {/* TAB 2: SEND OFFER FOR PROPERTY */}
          {activeTab === 'OFFER' && (
            <form onSubmit={handleSendOffer} className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-emerald-500/40">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Emlak Pazarlık Teklif Formu</span>
              </div>

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

              <Button variant="primary" className="w-full py-3" type="submit">
                <Send className="w-4 h-4 mr-2" /> Teklifi Mülk Sahibine Gönder
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
