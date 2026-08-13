import React, { useState, useEffect } from 'react';
import { useStore, DEFAULT_JOB_LISTINGS, GUEST_OWNER_ID } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Job } from '../../types';
import { Briefcase, Clock, Award, GraduationCap, DollarSign, CheckCircle, Zap, ShieldAlert, Sparkles, PlusCircle, X, Building, Check, AlertTriangle, TrendingUp, UserCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CareerPanel: React.FC = () => {
  const { user, setUser, jobs, setJobs, wallet, setWallet, addToast, setActiveTab, t } = useStore();
  const [workingJobId, setWorkingJobId] = useState<string | null>(null);
  
  // Daily Shift Limit State (Max 5 shifts per day)
  const [dailyShiftsCount, setDailyShiftsCount] = useState<number>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('vl_daily_shifts_date');
    if (savedDate !== todayStr) {
      localStorage.setItem('vl_daily_shifts_date', todayStr);
      localStorage.setItem('vl_daily_shifts_count', '0');
      return 0;
    }
    return parseInt(localStorage.getItem('vl_daily_shifts_count') || '0');
  });

  // Job Creation Modal State
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newSalary, setNewSalary] = useState('45000');
  const [newExp, setNewExp] = useState('40');
  const [newReqEducation, setNewReqEducation] = useState<'HIGH_SCHOOL' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'>('BACHELOR');
  const [newReqRep, setNewReqRep] = useState('100');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const myId = user?.id || GUEST_OWNER_ID;

  // Auto-populate jobs database if empty
  useEffect(() => {
    if (jobs.length === 0) {
      setJobs(DEFAULT_JOB_LISTINGS);
    }
  }, [jobs, setJobs]);

  const energy = user?.energy ?? 100;
  const happiness = user?.happiness ?? 100;
  const isVitalBlocked = energy <= 15 || happiness <= 30;
  const isShiftLimitReached = dailyShiftsCount >= 5;

  const handleStartShift = (job: Job) => {
    if (isShiftLimitReached) {
      addToast({
        type: 'error',
        title: 'Günlük Mesai Sınırı (5/5) Doldu! ⚠️',
        message: 'Günde en fazla 5 vardiya çalışabilirsiniz. Yeni mesai hakları için yarını bekleyin.'
      });
      return;
    }

    if (job.creator_id && job.creator_id === myId) {
      addToast({
        type: 'error',
        title: 'Kendi İlanında Çalışamazsın! ⚠️',
        message: 'Patronu olduğunuz şirketin iş ilanına işçi olarak başvuramazsınız.'
      });
      return;
    }

    if (isVitalBlocked) {
      addToast({
        type: 'error',
        title: 'Aşırı Yorgunluk & Tükenmişlik ⚠️',
        message: 'Enerjiniz (%15 altı) veya Mutluluğunuz tükendi. İyileşmeden veya iksir satın almadan mesaiye başlayamazsınız!'
      });
      return;
    }

    setWorkingJobId(job.id);
    addToast({
      type: 'info',
      title: `${job.title} Mesaisi Başladı 💼`,
      message: 'Vardiya çalışmanız başladı. Mesai tamamlandığında maaşınız hesabınıza aktarılacak.'
    });

    setTimeout(() => {
      setWorkingJobId(null);

      // Increment daily shift count
      const newCount = dailyShiftsCount + 1;
      setDailyShiftsCount(newCount);
      localStorage.setItem('vl_daily_shifts_count', newCount.toString());

      // Salary Payment to Employee
      if (wallet) {
        const newBank = wallet.bank_balance + job.salary_per_tick;
        setWallet({
          ...wallet,
          bank_balance: newBank,
          total_liquid: wallet.cash_balance + newBank
        });
      }

      // If job has a creator owner (Patron dividend payout: 20% of salary to creator!)
      if (job.creator_id && job.creator_id !== myId) {
        const dividendAmount = Math.round(job.salary_per_tick * 0.20);
        addToast({
          type: 'success',
          title: 'Patron Kar Payı Ödendi 🏢',
          message: `Çalıştığınız şirketin kurucusuna %20 (${formatCurrency(dividendAmount)}) Patron Kar Payı aktarıldı.`
        });
      }

      if (user) {
        setUser({
          ...user,
          energy: Math.max(0, user.energy - 12),
          happiness: Math.max(0, user.happiness - 2),
          reputation: user.reputation + Math.round(job.exp_per_tick / 5)
        });
      }

      addToast({
        type: 'success',
        title: 'Mesai Tamamlandı! 💰',
        message: `Tebrikler! ${job.title} pozisyonundan ${formatCurrency(job.salary_per_tick)} kazandınız. (Kalan Hak: ${5 - newCount}/5)`
      });
    }, 2500);
  };

  const handleDeleteJob = (job: Job) => {
    const updatedJobs = jobs.filter(j => j.id !== job.id);
    setJobs(updatedJobs);

    addToast({
      type: 'info',
      title: 'İş İlanı Silindi 🗑️',
      message: `"${job.title}" pozisyonu kariyer kataloğundan kaldırıldı.`
    });
  };

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salaryVal = parseFloat(newSalary) || 45000;
    const expVal = parseInt(newExp) || 40;
    const reqRepVal = parseInt(newReqRep) || 100;

    const newJob: Job = {
      id: 'job-custom-' + Date.now(),
      title: newJobTitle || 'Özel Pozisyon',
      company_name: newCompanyName || 'Girişim Ltd.',
      salary_per_tick: salaryVal,
      exp_per_tick: expVal,
      required_education: newReqEducation,
      required_reputation: reqRepVal,
      min_health_req: 20,
      min_happiness_req: 20,
      is_eligible: true,
      creator_id: myId
    };

    setJobs([newJob, ...jobs]);
    setIsAddJobModalOpen(false);
    setNewJobTitle('');
    setNewCompanyName('');

    // Reward owner with Reputation boost
    if (user) {
      setUser({
        ...user,
        reputation: user.reputation + 50
      });
    }

    addToast({
      type: 'success',
      title: 'İş İlanı Yayınlandı & Şirket Kuruldu! 🏢',
      message: `"${newJob.title}" ilanınız aktif edildi. +50 Şirket İtibarı kazandınız. Diğer çalışanlar vardiya yaptıkça %20 Patron Kar Payı alacaksınız!`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card variant="gold" className="border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 rounded-2xl shadow-lg">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{t('career_title')}</h2>
                <Badge variant="gold">OFFICIAL CAREERS & SHIFTS</Badge>
              </div>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                Vardiyada çalışın, maaş kazanın veya kendi şirketinizi kurup %20 Patron Kar Payı alın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="gold" size="sm" onClick={() => setIsAddJobModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1" /> Şirket Kur / İlan Aç
            </Button>

            <Badge variant={isShiftLimitReached ? 'rose' : 'emerald'} className="py-1.5 px-3.5 text-xs font-black">
              📊 Günlük Vardiya: {dailyShiftsCount}/5 {isShiftLimitReached ? '(DOLDU)' : ''}
            </Badge>
          </div>
        </div>
      </Card>

      {/* SHIFT LIMIT WARNING */}
      {isShiftLimitReached && (
        <Card className="border-2 border-rose-500 bg-slate-950 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />
            <div>
              <p className="text-xs font-black text-rose-400">⚠️ GÜNLÜK MESAİ SINIRINA ULAŞILDI (5/5)</p>
              <p className="text-[11px] font-semibold text-slate-300">Günde en fazla 5 vardiya çalışabilirsiniz. Yeni mesai haklarınız yarın yenilenecektir.</p>
            </div>
          </div>
        </Card>
      )}

      {/* VITAL BLOCKED BANNER */}
      {isVitalBlocked && !isShiftLimitReached && (
        <Card className="border-2 border-rose-500 bg-slate-950 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />
            <div>
              <p className="text-xs font-black text-rose-400">⚠️ YORGUNLUK ENGELİ AKTİF</p>
              <p className="text-[11px] font-semibold text-slate-300">Enerji veya Mutluluğunuz kritik seviyede. İyileşmeden mesai yapamazsınız.</p>
            </div>
          </div>
          <Button variant="gold" size="sm" onClick={() => setActiveTab('store')}>
            ⚡ {t('buy_elixir')}
          </Button>
        </Card>
      )}

      {/* JOBS CATALOG GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => {
          const isWorkingThis = workingJobId === job.id;
          const userRep = user?.reputation ?? 0;
          const meetsRep = userRep >= job.required_reputation;
          const isMyJobListing = job.creator_id === myId;

          return (
            <Card key={job.id} className={`border p-5 flex flex-col justify-between ${isMyJobListing ? 'border-amber-400/60 bg-slate-900 shadow-lg shadow-amber-500/10' : 'border-slate-800 bg-slate-950'}`}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={isMyJobListing ? 'gold' : 'purple'}>
                    {isMyJobListing ? '🏢 KENDİ ŞİRKETİNİZ' : job.company_name || 'Şirket'}
                  </Badge>
                  <span className="text-sm font-black text-emerald-400">{formatCurrency(job.salary_per_tick)} / shift</span>
                </div>
                <h3 className="text-base font-black text-white mt-1">{job.title}</h3>
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-sky-400" /> {job.company_name}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-bold text-slate-300">
                  <p className="flex items-center justify-between">
                    <span>Exp Yield:</span>
                    <span className="text-amber-400">+{job.exp_per_tick} XP</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Gerekli İtibar:</span>
                    <span className={meetsRep ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
                      {job.required_reputation} Puan {meetsRep ? '✓' : '⚠️'}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Gerekli Diploma:</span>
                    <span className="text-purple-300 uppercase">{job.required_education || 'LİSE'}</span>
                  </p>
                  {isMyJobListing && (
                    <p className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-amber-300 font-black">
                      <span>Patron Kar Payı:</span>
                      <span>+%20 Komisyon</span>
                    </p>
                  )}
                </div>
              </div>

              {isMyJobListing ? (
                <div className="mt-5 space-y-2">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" /> Kendi ilanınızda işçi olarak çalışamazsınız
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full py-2 text-xs font-black border-rose-500/50 text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                    onClick={() => handleDeleteJob(job)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> İlanı Sil / Kataloğumdan Kaldır
                  </Button>
                </div>
              ) : (
                <Button
                  variant={isWorkingThis ? 'secondary' : 'gold'}
                  className="w-full mt-5 py-2.5 text-xs font-black shadow-md"
                  disabled={isWorkingThis || isVitalBlocked || isShiftLimitReached}
                  onClick={() => handleStartShift(job)}
                >
                  {isWorkingThis ? '💼 Mesai Yapılıyor...' : isShiftLimitReached ? '⚠️ Vardiya Hakkı Doldu (5/5)' : '💼 Mesaiye Başla & Çalış'}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* MODAL: CREATE NEW JOB POSITION */}
      <AnimatePresence>
        {isAddJobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border-2 border-amber-400/50 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-amber-400" /> Şirket Kur & İş İlanı Aç
                </h3>
                <button
                  onClick={() => setIsAddJobModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Patron İlan Avantajları:</p>
                <p>• İlanı açtığınızda <strong>+50 Şirket İtibarı</strong> kazanırsınız.</p>
                <p>• Diğer oyuncular/botlar sizin ilanınızda çalıştığında <strong>%20 Patron Kar Payı</strong> doğrudan banka hesabınıza yatar!</p>
              </div>

              <form onSubmit={handleCreateJobSubmit} className="space-y-3.5 text-left">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Pozisyon Unvanı</label>
                  <input
                    type="text"
                    required
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="Örn: Kıdemli Veri Mimarı"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Şirket / Kurum Adı</label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="Örn: Enes Tech Holding A.Ş."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Vardiya Maaşı (₺/shift)</label>
                    <input
                      type="number"
                      required
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">XP Yield</label>
                    <input
                      type="number"
                      required
                      value={newExp}
                      onChange={(e) => setNewExp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Gerekli Diploma</label>
                    <select
                      value={newReqEducation}
                      onChange={(e) => setNewReqEducation(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="HIGH_SCHOOL">Lise</option>
                      <option value="BACHELOR">Lisans</option>
                      <option value="MASTER">Yüksek Lisans</option>
                      <option value="DOCTORATE">Doktora</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Gerekli İtibar Puanı</label>
                    <input
                      type="number"
                      required
                      value={newReqRep}
                      onChange={(e) => setNewReqRep(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-sky-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <Button variant="gold" type="submit" className="w-full py-3 font-black text-xs shadow-lg shadow-amber-500/20 mt-2">
                  🏢 Şirketi Kur & %20 Kar Payı Kazan
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
