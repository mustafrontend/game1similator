import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { AIConsultationModal } from './AIConsultationModal';
import { BankLoanModal } from './BankLoanModal';
import { LendMoneyModal } from './LendMoneyModal';
import { Wallet, TrendingUp, Calendar, ShieldCheck, ArrowUpRight, ArrowDownLeft, AlertCircle, PlusCircle, Sparkles, Coins, Crown, Zap, Award, Bot, Landmark, Check, ShieldAlert, ShoppingBag, Percent, HeartPulse, Heart, Smile, Stethoscope, Palmtree, Coffee, Info, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const FinancialDashboard: React.FC = () => {
  const { wallet, setWallet, socialLoans, transactions, expenses, setExpenses, user, setUser, setActiveTab, addToast, t, formatCurrency } = useStore();
  const [borrowerName, setBorrowerName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isBankLoanModalOpen, setIsBankLoanModalOpen] = useState(false);
  const [payingCash, setPayingCash] = useState(false);

  const creditScore = user?.credit_score || 1000;
  const reputation = user?.reputation || 0;
  const userLevel = user?.level || Math.max(1, Math.floor(reputation / 100) + 1);
  const maxLoanLimit = Math.min(10000000, creditScore * 2500);

  const health = user?.health ?? 100;
  const happiness = user?.happiness ?? 100;
  const energy = user?.energy ?? 100;
  const isVitalCritical = health <= 20 || happiness <= 20 || energy <= 20;

  // Dynamic 1/3 (33%) cash fee calculation based on liquid wealth
  const userLiquid = wallet?.total_liquid || 10000;
  const dynamicCashFee = Math.max(1000, Math.round(userLiquid * (1 / 3)));

  const educationLabel =
    user?.education_level === 'HIGH_SCHOOL'
      ? 'Lise Diploması'
      : user?.education_level === 'BACHELOR'
      ? 'Lisans Diploması'
      : 'Yüksek Lisans';

  const handlePayExpense = (expenseId: string, amount: number, title: string) => {
    if (!wallet || wallet.total_liquid < amount) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye',
        message: `${title} ödemesi için bakiye yetersiz: ${formatCurrency(amount)}`
      });
      return;
    }

    const updatedWallet = {
      ...wallet,
      bank_balance: wallet.bank_balance >= amount ? wallet.bank_balance - amount : wallet.bank_balance,
      cash_balance: wallet.bank_balance < amount ? wallet.cash_balance - (amount - wallet.bank_balance) : wallet.cash_balance,
      total_liquid: wallet.total_liquid - amount
    };
    useStore.setState({ wallet: updatedWallet });

    const updatedExpenses = expenses.filter(e => e.id !== expenseId);
    setExpenses(updatedExpenses);

    addToast({
      type: 'success',
      title: 'Fatura / Taksit Ödendi 💳',
      message: `"${title}" için ${formatCurrency(amount)} ödemesi gerçekleştirildi.`
    });
  };

  // Direct 1/3 Cash payment handler for specific vitals
  const handlePayVitalCashInGuide = (vitalType: 'HEALTH' | 'HAPPINESS' | 'ENERGY') => {
    if (!wallet || wallet.total_liquid < dynamicCashFee) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye 💳',
        message: `1/3 Pay Ödeme tutarı: ${formatCurrency(dynamicCashFee)}. Cüzdan bakiyeniz yetersiz!`
      });
      return;
    }

    setPayingCash(true);
    setTimeout(() => {
      setPayingCash(false);

      const updatedBank = wallet.bank_balance >= dynamicCashFee ? wallet.bank_balance - dynamicCashFee : wallet.bank_balance;
      const updatedCash = wallet.bank_balance < dynamicCashFee ? wallet.cash_balance - (dynamicCashFee - wallet.bank_balance) : wallet.cash_balance;
      
      setWallet({
        ...wallet,
        bank_balance: updatedBank,
        cash_balance: updatedCash,
        total_liquid: wallet.total_liquid - dynamicCashFee
      });

      useStore.getState().refillVitalsWithImmunity(10);

      const labelMap = {
        HEALTH: '🏥 VIP Hastane Ameliyatı',
        HAPPINESS: '🌴 Maldivler VIP Tatili',
        ENERGY: '☕ VIP Enerji Serumu'
      };

      addToast({
        type: 'success',
        title: `${labelMap[vitalType]} Başarılı 🟢`,
        message: `${formatCurrency(dynamicCashFee)} (Servetinizin 1/3'ü) ödendi ve ilgili göstergeniz %100 yapıldı.`
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* RPG VITAL DEBUFF & RECOVERY GUIDE CARD */}
      <Card variant="gold" className="border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20 bg-slate-900/95 p-6 relative overflow-hidden">
        {/* HEADER BRAND & PLAYER SUMMARY ROW */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/40">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-400 mb-0.5" />
                  <span className="text-[10px] font-black text-amber-300 tracking-wider">LVL {userLevel}</span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{user?.username || 'MustafaÖztürk'}</h2>
                <Badge variant="gold">{user?.title || t('citizen')}</Badge>
                {isVitalCritical && <Badge variant="rose" className="animate-pulse">{t('debuff_active_badge')}</Badge>}
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 flex items-center gap-2">
                <span>İtibar: <strong className="text-amber-300">{reputation} Puan</strong></span>
                <span>•</span>
                <span>Diploma: <strong className="text-sky-300">{educationLabel}</strong></span>
              </p>
            </div>
          </div>

          <Button
            variant="gold"
            className="py-2.5 px-4 text-xs font-black shadow-lg shadow-amber-500/30"
            onClick={() => setIsAIModalOpen(true)}
          >
            <Bot className="w-4 h-4 mr-1.5 text-slate-950" /> {t('ai_ask')}
          </Button>
        </div>

        {/* EXPLICIT PENALTIES & WHAT TO DO GUIDE FOR HEALTH, HAPPINESS & ENERGY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> {t('debuff_guide_title')}
            </h3>
            <span className="text-[11px] font-bold text-slate-400">{t('one_third_wealth')} <strong className="text-sky-300">{formatCurrency(dynamicCashFee)}</strong></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. SAĞLIK REHBERİ */}
            <div className={`p-4 rounded-2xl border transition-all ${
              health <= 20 ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-500/10' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" /> {t('health_drop_title')}
                </span>
                <Badge variant={health <= 20 ? 'rose' : 'slate'}>%{health.toFixed(0)}</Badge>
              </div>
              <div className="text-[11px] space-y-1.5 text-slate-300 mb-3">
                <p className="text-rose-300 font-bold">{t('penalty_applied')}</p>
                <p className="text-slate-400 font-medium">{t('health_penalty_desc')}</p>
                <p className="text-emerald-300 font-bold mt-1">{t('what_to_do')}</p>
                <p className="text-slate-300 font-medium">{t('health_action_desc')}</p>
              </div>
              <Button
                variant="outline"
                className="w-full py-2 text-[11px] font-black border-rose-500 text-rose-300 hover:bg-rose-600 hover:text-white"
                onClick={() => handlePayVitalCashInGuide('HEALTH')}
                disabled={payingCash}
              >
                🏥 {formatCurrency(dynamicCashFee)} {t('pay_one_third_btn')}
              </Button>
            </div>

            {/* 2. MUTLULUK REHBERİ */}
            <div className={`p-4 rounded-2xl border transition-all ${
              happiness <= 20 ? 'bg-amber-950/40 border-amber-400/70 shadow-lg shadow-amber-500/10' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-amber-400" /> {t('happiness_drop_title')}
                </span>
                <Badge variant={happiness <= 20 ? 'gold' : 'slate'}>%{happiness.toFixed(0)}</Badge>
              </div>
              <div className="text-[11px] space-y-1.5 text-slate-300 mb-3">
                <p className="text-amber-300 font-bold">{t('penalty_applied')}</p>
                <p className="text-slate-400 font-medium">{t('happiness_penalty_desc')}</p>
                <p className="text-emerald-300 font-bold mt-1">{t('what_to_do')}</p>
                <p className="text-slate-300 font-medium">{t('happiness_action_desc')}</p>
              </div>
              <Button
                variant="outline"
                className="w-full py-2 text-[11px] font-black border-amber-400 text-amber-300 hover:bg-amber-500 hover:text-slate-950"
                onClick={() => handlePayVitalCashInGuide('HAPPINESS')}
                disabled={payingCash}
              >
                🌴 {formatCurrency(dynamicCashFee)} {t('pay_one_third_btn')}
              </Button>
            </div>

            {/* 3. ENERJİ REHBERİ */}
            <div className={`p-4 rounded-2xl border transition-all ${
              energy <= 20 ? 'bg-sky-950/40 border-sky-400/70 shadow-lg shadow-sky-500/10' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-400" /> {t('energy_drop_title')}
                </span>
                <Badge variant={energy <= 20 ? 'sky' : 'slate'}>%{energy.toFixed(0)}</Badge>
              </div>
              <div className="text-[11px] space-y-1.5 text-slate-300 mb-3">
                <p className="text-sky-300 font-bold">{t('penalty_applied')}</p>
                <p className="text-slate-400 font-medium">{t('energy_penalty_desc')}</p>
                <p className="text-emerald-300 font-bold mt-1">{t('what_to_do')}</p>
                <p className="text-slate-300 font-medium">{t('energy_action_desc')}</p>
              </div>
              <Button
                variant="outline"
                className="w-full py-2 text-[11px] font-black border-sky-400 text-sky-300 hover:bg-sky-500 hover:text-white"
                onClick={() => handlePayVitalCashInGuide('ENERGY')}
                disabled={payingCash}
              >
                ☕ {formatCurrency(dynamicCashFee)} {t('pay_one_third_btn')}
              </Button>
            </div>
          </div>

          {/* UNIVERSAL STORE SHORTCUT BANNER */}
          <div className="p-3 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 rounded-2xl border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-amber-400 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-300">⭐ {t('buy_elixir')}</p>
                <p className="text-[11px] font-semibold text-slate-300">Nakit harcamadan Sağlık, Mutluluk ve Enerji göstergelerinin tümünü anında %100 fulleyin.</p>
              </div>
            </div>
            <Button
              variant="gold"
              className="py-2.5 px-4 text-xs font-black shrink-0 whitespace-nowrap shadow-lg shadow-amber-500/20"
              onClick={() => setActiveTab('store')}
            >
              {t('buy_elixir')}
            </Button>
          </div>
        </div>
      </Card>

      {/* 2-COLUMN PROMINENT GAME HUD CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1 (LEFT 1/2): NET SERVET & CÜZDAN DETAYI */}
        <Card className="border-l-4 border-l-amber-400 border-slate-800 bg-slate-900/90 shadow-2xl">
          <div className="flex justify-between items-start mb-4 border-b border-slate-800/80 pb-3">
            <div>
              <p className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Coins className="w-4 h-4" /> {t('net_worth')}
              </p>
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 mt-1">
                {wallet ? formatCurrency(wallet.total_liquid) : '₺0'}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl shadow-inner">
              <TrendingUp className="w-7 h-7 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-sky-400 flex items-center gap-1 mb-1">
                <Wallet className="w-3.5 h-3.5" /> {t('cash_wallet')}
              </p>
              <p className="text-lg font-black text-white">{wallet ? formatCurrency(wallet.cash_balance) : '₺0'}</p>
              <span className="text-[10px] font-semibold text-slate-400">Fiziksel Cüzdan</span>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-purple-400 flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {t('bank_balance')}
              </p>
              <p className="text-lg font-black text-white">{wallet ? formatCurrency(wallet.bank_balance) : '₺0'}</p>
              <span className="text-[10px] font-semibold text-slate-400">EFT & Kredi Hesabı</span>
            </div>
          </div>
        </Card>

        {/* CARD 2 (RIGHT 1/2): FİNDEKS KREDİ SKORU & BANKA KREDİSİ ÇEK BUTTON */}
        <Card className="border-l-4 border-l-purple-500 border-slate-800 bg-slate-900/90 shadow-2xl">
          <div className="flex justify-between items-start mb-4 border-b border-slate-800/80 pb-3">
            <div>
              <p className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-4 h-4" /> {t('findeks_score')}
              </p>
              <h3 className="text-3xl font-black text-purple-300 mt-1">
                {creditScore} <span className="text-sm font-normal text-slate-500">/ 1900 Puan</span>
              </h3>
            </div>
            <Badge variant="purple" className="py-1 px-3">
              {creditScore >= 1700 ? 'A+ Çok İyi Risk Grubu' : creditScore >= 1400 ? 'B+ Orta Risk Grubu' : 'Risk Grubu'}
            </Badge>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Banka Kredi Limiti</span>
              <span className="text-amber-400">{formatCurrency(maxLoanLimit)} Aktif</span>
            </div>
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-sky-400 rounded-full shadow-lg shadow-purple-500/50"
                style={{ width: `${Math.min(100, Math.max(10, (creditScore / 1900) * 100))}%` }}
              />
            </div>
            <Button
              variant="gold"
              className="w-full mt-3 py-3 text-xs font-black shadow-lg shadow-amber-500/20"
              onClick={() => setIsBankLoanModalOpen(true)}
            >
              <Landmark className="w-4 h-4 mr-2 text-slate-950" /> {t('take_bank_loan')}
            </Button>
          </div>
        </Card>

        {/* CARD 3 (LEFT 1/2): SOSYAL BORÇ & ALACAK SİSTEMİ WITH WORKING LEND BUTTON */}
        <Card className="border-l-4 border-l-emerald-500 border-slate-800 bg-slate-900/90 shadow-2xl">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" /> Sosyal Borç / Alacak Sistemi
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Oyunculara borç verin, %5 faiz kazanın.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsLendModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1.5" /> {t('lend_money_btn')}
            </Button>
          </div>

          <div className="space-y-3">
            {socialLoans.lent.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">Aktif verdiğiniz borç bulunmamaktadır.</p>
              </div>
            ) : (
              socialLoans.lent.map((loan) => (
                <div key={loan.id} className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-black text-white">Borçlu: {loan.borrower_id}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Vade: {loan.due_date} • Faiz: %{(loan.interest_rate * 100).toFixed(0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-emerald-400">{formatCurrency(loan.remaining_amount)}</p>
                    <Badge variant="emerald">Alacaklı</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* CARD 4 (RIGHT 1/2): DYNAMIC UPCOMING EXPENSES CALENDAR FROM SQLITE DB */}
        <Card className="border-l-4 border-l-rose-500 border-slate-800 bg-slate-900/90 shadow-2xl">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-800/80 pb-3">
            <Calendar className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-black tracking-tight text-white">{t('upcoming_expenses')}</h3>
          </div>
          <p className="text-xs font-semibold text-slate-400 mb-4">
            Vadesi geçen borçlarda otomatik faiz biner ve Findeks skoru düşer.
          </p>

          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Ödenmemiş borç veya faturanız bulunmamaktadır 🎉</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Kredi çektiğinizde taksitleriniz burada listelenir.</p>
              </div>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-white">{exp.title}</p>
                    <p className="text-xs font-semibold text-slate-400">Son Gün: {exp.due_date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-black text-rose-400">{formatCurrency(exp.amount)}</p>
                      <Badge variant={exp.category === 'Kredi' ? 'purple' : 'sky'}>{exp.category}</Badge>
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handlePayExpense(exp.id, exp.amount, exp.title)}
                    >
                      {t('pay_now')}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Full-width Transaction Ledger Card */}
      <Card className="border-t-4 border-t-sky-500">
        <h3 className="text-lg font-black tracking-tight text-white mb-4">{t('recent_transactions')}</h3>
        <div className="divide-y divide-slate-800/80">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${tx.transaction_type === 'INCOME' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border-rose-500/30 text-rose-400'}`}>
                  {tx.transaction_type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">{tx.description || tx.category}</p>
                  <p className="text-xs font-semibold text-slate-400">{tx.created_at}</p>
                </div>
              </div>
              <span className={`text-sm font-black ${tx.transaction_type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'}`}>
                {tx.transaction_type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Consultation Recovery Advisor Modal */}
      <AIConsultationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      {/* Bank Loan Modal */}
      {isBankLoanModalOpen && (
        <BankLoanModal
          onClose={() => setIsBankLoanModalOpen(false)}
        />
      )}

      {/* Lend Money Modal */}
      <LendMoneyModal
        isOpen={isLendModalOpen}
        onClose={() => setIsLendModalOpen(false)}
      />
    </div>
  );
};
