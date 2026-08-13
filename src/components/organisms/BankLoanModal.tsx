import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, GUEST_OWNER_ID } from '../../store/useStore';
import { ExpenseItem, BankLoanRecord } from '../../types';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, Landmark, DollarSign, Calculator, Calendar, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Percent } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const BankLoanModal: React.FC<Props> = ({ onClose }) => {
  const { user, wallet, setWallet, expenses, setExpenses, addToast } = useStore();
  
  const [loanType, setLoanType] = useState<'CONSUMER' | 'MORTGAGE' | 'AUTO'>('CONSUMER');
  const [requestedAmount, setRequestedAmount] = useState('250000');
  const [months, setMonths] = useState<number>(24);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const creditScore = user?.credit_score || 1000;
  const maxAllowedLimit = Math.min(10000000, creditScore * 2500);

  const getMonthlyInterestRate = () => {
    if (loanType === 'CONSUMER') return 0.029;
    if (loanType === 'MORTGAGE') return 0.019;
    if (loanType === 'AUTO') return 0.024;
    return 0.029;
  };

  const monthlyRate = getMonthlyInterestRate();
  const amountNum = parseFloat(requestedAmount) || 0;

  const calculateMonthlyPayment = () => {
    if (amountNum <= 0 || months <= 0) return 0;
    const compoundRate = Math.pow(1 + monthlyRate, months);
    return (amountNum * monthlyRate * compoundRate) / (compoundRate - 1);
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalRepayment = monthlyPayment * months;

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum <= 0) return;

    if (amountNum > maxAllowedLimit) {
      addToast({
        type: 'error',
        title: 'Findeks Limiti Aşıldı',
        message: `Findeks Kredi Skoru limitiniz (${formatCurrency(maxAllowedLimit)}) bu tutarı çekmeye yetmiyor.`
      });
      return;
    }

    if (!wallet) return;

    const myId = user?.id || GUEST_OWNER_ID;
    const loanTitle = loanType === 'CONSUMER' ? 'Banka İhtiyaç Kredisi' : loanType === 'MORTGAGE' ? 'Konut Kredisi' : 'Taşıt Kredisi';

    // 1. Deposit loan principal into bank balance
    setWallet({
      ...wallet,
      bank_balance: wallet.bank_balance + amountNum,
      total_liquid: wallet.total_liquid + amountNum
    });

    // 2. Add BankLoanRecord with full multi-installment schedule
    const newLoanRecord: BankLoanRecord = {
      id: 'loan-rec-' + Date.now(),
      user_id: myId,
      loan_title: loanTitle,
      principal_amount: amountNum,
      monthly_payment: Math.round(monthlyPayment),
      total_repayment: Math.round(totalRepayment),
      total_months: months,
      remaining_months: months,
      paid_months: 0,
      interest_rate: monthlyRate,
      created_at: new Date().toLocaleDateString('tr-TR')
    };

    const currentLoans = useStore.getState().activeBankLoans;
    useStore.getState().setActiveBankLoans([newLoanRecord, ...currentLoans]);

    // 3. Add dynamic expense item for the first installment (Taksit 1/N)
    const newExpense: ExpenseItem = {
      id: 'exp-loan-' + Date.now(),
      user_id: myId,
      title: `${loanTitle} (Taksit 1/${months})`,
      category: 'Kredi',
      amount: Math.round(monthlyPayment),
      due_date: '28 Ağustos',
      auto_pay: true,
      status: 'PENDING'
    };

    setExpenses([newExpense, ...expenses]);

    // 4. Reduce Findeks Credit Score due to new debt leverage!
    if (user) {
      const oldScore = user.credit_score;
      const newScore = Math.max(300, oldScore - 75);
      useStore.getState().setUser({
        ...user,
        credit_score: newScore
      });
      addToast({
        type: 'warning',
        title: 'Findeks Skor Bildirimi 📉',
        message: `Yeni kredi kullanımı nedeniyle Findeks skorunuz ${oldScore} → ${newScore} puana düştü. (Taksitleri düzenli ödedikçe skorunuz yükselecektir).`
      });
    }

    addToast({
      type: 'success',
      title: `Banka Kredisi (${months} Ay Vade) Onaylandı! 🏦`,
      message: `${formatCurrency(amountNum)} hesabınıza yatırıldı. ${months} aylık taksit planı Finans Paneli'ne eklendi.`
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

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">Anında Banka Kredisi Çek</h3>
                <Badge variant="gold">FINDEKS A+ ONAYLI</Badge>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Kredi skorunuza göre anında hesabınıza para yatırın.
              </p>
            </div>
          </div>

          {/* Findeks Limit Info Card */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-purple-500/30 mb-6 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Findeks Kredi Skorunuz</span>
              <strong className="text-lg font-black text-purple-400">{creditScore} Puan</strong>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 block">Maksimum Çekilebilir Limit</span>
              <strong className="text-lg font-black text-amber-400">{formatCurrency(maxAllowedLimit)}</strong>
            </div>
          </div>

          {/* LOAN TYPE SELECTOR */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setLoanType('CONSUMER')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all text-center border ${
                loanType === 'CONSUMER' ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>⚡ İhtiyaç Kredisi</span>
              <span className="block text-[10px] text-purple-300 font-normal">%2.9 Faiz</span>
            </button>

            <button
              type="button"
              onClick={() => setLoanType('AUTO')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all text-center border ${
                loanType === 'AUTO' ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>🏎️ Taşıt Kredisi</span>
              <span className="block text-[10px] text-sky-200 font-normal">%2.4 Faiz</span>
            </button>

            <button
              type="button"
              onClick={() => setLoanType('MORTGAGE')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all text-center border ${
                loanType === 'MORTGAGE' ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>🏡 Konut Kredisi</span>
              <span className="block text-[10px] text-emerald-200 font-normal">%1.9 Faiz</span>
            </button>
          </div>

          {/* LOAN CALCULATION FORM */}
          <form onSubmit={handleApplyLoan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Çekilmek İstenen Kredi Tutarı (₺)</label>
              <input
                type="number"
                required
                max={maxAllowedLimit}
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                placeholder="Tutar girin..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-base font-black text-amber-400 focus:outline-hidden focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Vade Süresi Seçin</label>
              <div className="grid grid-cols-4 gap-2">
                {[12, 24, 36, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      months === m
                        ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m} Ay Vade
                  </button>
                ))}
              </div>
            </div>

            {/* PAYMENT SUMMARY CARD */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Aylık Akdi Faiz Oranı:</span>
                <strong className="text-purple-400">%{(monthlyRate * 100).toFixed(1)}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Aylık Taksit Tutarınız:</span>
                <strong className="text-sky-300 font-bold text-sm">{formatCurrency(monthlyPayment)} / ay</strong>
              </div>
              <div className="flex justify-between text-slate-200 pt-2 border-t border-slate-800 font-bold">
                <span>Toplam Geri Ödeme Tutarınız:</span>
                <strong className="text-amber-400 text-base">{formatCurrency(totalRepayment)}</strong>
              </div>
            </div>

            <Button variant="gold" className="w-full py-3.5 text-sm font-black" type="submit">
              <CheckCircle2 className="w-5 h-5 mr-2 text-slate-950" /> {formatCurrency(amountNum)} Krediyi Onayla & Hesabıma Yatır
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
