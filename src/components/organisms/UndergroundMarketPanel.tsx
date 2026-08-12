import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { ShieldAlert, Landmark, Sparkles, Gem, ArrowUpRight, ArrowDownLeft, Eye, Lock, Zap, Clock, ShieldCheck, CheckCircle2, DollarSign } from 'lucide-react';

export const UndergroundMarketPanel: React.FC = () => {
  const { wallet, setWallet, offshoreBalance, setOffshoreBalance, vehicles, setVehicles, addToast, t } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<'OFFSHORE' | 'AUCTION' | 'TIPS'>('OFFSHORE');
  const [depositAmount, setDepositAmount] = useState('5000000');
  const [auctionBid, setAuctionBid] = useState(1250000);
  const [unlockedTips, setUnlockedTips] = useState<string[]>([]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  // 1. OFFSHORE BANK DEPOSIT
  const handleOffshoreDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;

    if (!wallet || wallet.total_liquid < amount) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye',
        message: `Offshore hesaba aktarılacak bakiye yetersiz: ${formatCurrency(amount)}`
      });
      return;
    }

    const updatedBank = wallet.bank_balance >= amount ? wallet.bank_balance - amount : 0;
    const remainingToDeduct = wallet.bank_balance >= amount ? 0 : amount - wallet.bank_balance;
    const updatedCash = wallet.cash_balance - remainingToDeduct;

    setWallet({
      ...wallet,
      bank_balance: updatedBank,
      cash_balance: updatedCash,
      total_liquid: updatedBank + updatedCash
    });
    setOffshoreBalance(offshoreBalance + amount);
    setDepositAmount('');

    addToast({
      type: 'success',
      title: 'Offshore Hesaba Aktarıldı 🏦',
      message: `${formatCurrency(amount)} tutarındaki fon Panama Kıyı Bankası hesabınıza aktarıldı (Vergiden Muaf).`
    });
  };

  // 2. OFFSHORE BANK WITHDRAW
  const handleOffshoreWithdraw = () => {
    if (offshoreBalance <= 0) {
      addToast({
        type: 'error',
        title: 'Boş Offshore Bakiye',
        message: 'Çekilecek offshore bakiye bulunmamaktadır.'
      });
      return;
    }
    if (!wallet) return;

    const amount = offshoreBalance;
    setWallet({
      ...wallet,
      cash_balance: wallet.cash_balance + amount,
      total_liquid: wallet.cash_balance + amount + wallet.bank_balance
    });
    setOffshoreBalance(0);

    addToast({
      type: 'info',
      title: 'Cüzdana Çekildi 💵',
      message: `${formatCurrency(amount)} tutarındaki Offshore bakiye fiziki cüzdanınıza aktarıldı.`
    });
  };

  // 3. MIDNIGHT VIP AUCTION BID
  const handlePlaceBid = () => {
    const nextBid = auctionBid + 250000;
    if (!wallet || wallet.total_liquid < nextBid) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye',
        message: `Açık artırma teklifi için gerekli bakiye: ${formatCurrency(nextBid)}`
      });
      return;
    }

    setAuctionBid(nextBid);

    addToast({
      type: 'warning',
      title: 'Müzayede Teklifi Verildi 🔥',
      message: `1962 Ferrari 250 GTO Classic için en yüksek teklif sizde: ${formatCurrency(nextBid)}`
    });
  };

  // 4. BUY INSIDER TIP
  const handleBuyInsiderTip = (cost: number, tipId: string, tipTitle: string) => {
    if (unlockedTips.includes(tipId)) {
      addToast({
        type: 'info',
        title: 'Zaten Satın Alındı',
        message: 'Bu gölgeli ihbar tüyosuna zaten sahipsiniz.'
      });
      return;
    }

    if (!wallet || wallet.total_liquid < cost) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye',
        message: `İhbar tüyosu bedeli: ${formatCurrency(cost)}`
      });
      return;
    }

    setWallet({
      ...wallet,
      bank_balance: wallet.bank_balance >= cost ? wallet.bank_balance - cost : wallet.bank_balance,
      cash_balance: wallet.bank_balance < cost ? wallet.cash_balance - (cost - wallet.bank_balance) : wallet.cash_balance,
      total_liquid: wallet.total_liquid - cost
    });

    setUnlockedTips([...unlockedTips, tipId]);

    addToast({
      type: 'success',
      title: '🕵️ İhbar Tüyosu Satın Alındı',
      message: `"${tipTitle}" duyurusu alındı. Borsa sekmesinde doğrudan işlem yapabilirsiniz!`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card variant="gold" className="border-2 border-purple-500/50 shadow-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-400 animate-pulse" />
              <h2 className="text-2xl font-black text-white">{t('underground_title')}</h2>
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              {t('underground_sub')}
            </p>
          </div>
          <Badge variant="purple" className="py-1.5 px-3.5 text-xs">
            🕶️ {t('secret_vip_eco')}
          </Badge>
        </div>
      </Card>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSubTab('OFFSHORE')}
          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'OFFSHORE' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/30' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Landmark className="w-4 h-4" /> {t('offshore_bank_tab')}
        </button>
        <button
          onClick={() => setActiveSubTab('AUCTION')}
          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'AUCTION' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Gem className="w-4 h-4" /> {t('midnight_auction_tab')}
        </button>
        <button
          onClick={() => setActiveSubTab('TIPS')}
          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'TIPS' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 ring-2 ring-sky-400/30' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" /> {t('tips_agreements_tab')}
        </button>
      </div>

      {/* SUB-TAB 1: OFFSHORE BANKING */}
      {activeSubTab === 'OFFSHORE' && (
        <Card className="border-l-4 border-l-purple-500 border-slate-800 bg-slate-950 shadow-2xl p-6">
          <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
            <div>
              <p className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                <Landmark className="w-4 h-4" /> {t('offshore_account_title')}
              </p>
              <h3 className="text-4xl font-black text-purple-300 mt-1">
                {formatCurrency(offshoreBalance)}
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {t('offshore_account_sub')}
              </p>
            </div>
            <div className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
              <Lock className="w-8 h-8" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleOffshoreDeposit} className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300">{t('transfer_to_offshore')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Aktarılacak tutar..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-purple-300 focus:outline-hidden"
                />
                <Button variant="gold" size="sm" type="submit">
                  <ArrowUpRight className="w-4 h-4 mr-1 text-slate-950" /> {t('transfer_btn')}
                </Button>
              </div>
            </form>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-300 mb-1">Cüzdana Geri Çek</p>
                <p className="text-[11px] font-semibold text-slate-400">Offshore fonlarınızı fiziki cüzdanınıza aktarın.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleOffshoreWithdraw} className="mt-3">
                <ArrowDownLeft className="w-4 h-4 mr-1 text-emerald-400" /> Tüm Offshore Bakiyeyi Çek
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* SUB-TAB 2 & 3 PLACEHOLDERS */}
      {activeSubTab === 'AUCTION' && (
        <Card className="border-slate-800 bg-slate-950 p-6 space-y-4 text-center">
          <Gem className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-black text-white">VIP Gece Müzayedesi</h3>
          <p className="text-xs text-slate-400">1962 Ferrari 250 GTO Classic Açık Artırması Aktif</p>
          <Button variant="gold" className="mx-auto" onClick={handlePlaceBid}>
            Teklifi Artır: {formatCurrency(auctionBid + 250000)}
          </Button>
        </Card>
      )}

      {activeSubTab === 'TIPS' && (
        <Card className="border-slate-800 bg-slate-950 p-6 space-y-4">
          <h3 className="text-lg font-black text-white">İhbar Tüyoları & Anlaşmalar</h3>
          <p className="text-xs text-slate-400">Borsa ve Emlak sinyallerini önceden satın alın.</p>
          <Button variant="gold" onClick={() => handleBuyInsiderTip(150000, 'tip-1', 'Holding Birleşme İhbarı')}>
            🕵️ İhbar Tüyosu Satın Al (₺150.000)
          </Button>
        </Card>
      )}
    </div>
  );
};
