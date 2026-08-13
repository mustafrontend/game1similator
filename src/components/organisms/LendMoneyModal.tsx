import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, GAME_DAY_MS, GUEST_OWNER_ID } from '../../store/useStore';
import { SocialLoan } from '../../types';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, Handshake, DollarSign, UserCheck, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LendMoneyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, wallet, setWallet, socialLoans, setSocialLoans, addToast } = useStore();

  const [borrowerName, setBorrowerName] = useState('Burak_CEO');
  const [loanAmount, setLoanAmount] = useState('10000');
  const [durationDays, setDurationDays] = useState('30');

  if (!isOpen) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const amountNum = parseFloat(loanAmount) || 0;
  const interestReturn = amountNum * 1.05;

  const handleLendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum <= 0) return;

    if (!wallet) return;

    // Deduct lent amount from bank balance
    const updatedBank = wallet.bank_balance - amountNum;
    const updatedWallet = {
      ...wallet,
      bank_balance: updatedBank,
      total_liquid: wallet.cash_balance + updatedBank
    };
    setWallet(updatedWallet);

    // Create new SocialLoan object
    const newLoan: SocialLoan = {
      id: 'loan-' + Date.now(),
      lender_id: user?.id || GUEST_OWNER_ID,
      borrower_id: borrowerName || 'Burak_CEO',
      principal_amount: amountNum,
      remaining_amount: interestReturn,
      interest_rate: 0.05,
      due_date: `${durationDays} Gün Sonra`,
      matures_at: Date.now() + (parseInt(durationDays, 10) || 30) * GAME_DAY_MS,
      status: 'ACTIVE'
    };

    setSocialLoans({
      lent: [newLoan, ...socialLoans.lent],
      borrowed: socialLoans.borrowed
    });

    addToast({
      type: 'success',
      title: 'Borç Verildi & Faiz Sözleşmesi İmzalandı 🤝',
      message: `${borrowerName} kullanıcısına ${formatCurrency(amountNum)} borç verildi. Vade sonunda ${formatCurrency(interestReturn)} tahsil edilecektir.`
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
          className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-500/40 relative overflow-hidden text-white my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">Sosyal Borç Ver</h3>
                <Badge variant="emerald">%5 FAİZ KAZANÇ</Badge>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Diğer oyunculara borç vererek faiz getirisi elde edin.
              </p>
            </div>
          </div>

          <form onSubmit={handleLendSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Borç Verilecek Oyuncu</label>
              <select
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-sky-400 focus:outline-hidden"
              >
                <option value="Burak_CEO">🌐 Burak_CEO (Global Finans)</option>
                <option value="Zeynep_Emlak">🌐 Zeynep_Emlak (Gayrimenkul Bşk)</option>
                <option value="Ahmet_Kaya99">🌐 Ahmet_Kaya99 (Kripto Balinası)</option>
                <option value="Elif_Yazilim">🤖 Elif_Yazilim (Senior Dev)</option>
                <option value="Caner_Oto">🤖 Caner_Oto (Galeri Sahibi)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Verilecek Borç Tutarı (₺)</label>
              <input
                type="number"
                required
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="Tutar girin..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-base font-black text-emerald-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Vade Süresi</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-hidden"
              >
                <option value="15">15 Gün Vade</option>
                <option value="30">30 Gün Vade</option>
                <option value="60">60 Gün Vade</option>
              </select>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Verilen Anapara:</span>
                <strong className="text-white font-bold">{formatCurrency(amountNum)}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vade Sonu Tahsilat (%5 Faizli):</span>
                <strong className="text-emerald-400 font-black text-sm">{formatCurrency(interestReturn)}</strong>
              </div>
            </div>

            <Button variant="gold" className="w-full py-3.5 text-sm font-black" type="submit">
              <CheckCircle2 className="w-5 h-5 mr-2 text-slate-950" /> {formatCurrency(amountNum)} Borç Ver & Sözleşmeyi Onayla
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
