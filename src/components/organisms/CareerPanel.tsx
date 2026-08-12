import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Briefcase, Clock, Award, GraduationCap, DollarSign, CheckCircle, Zap, ShieldAlert, Sparkles } from 'lucide-react';

export const CareerPanel: React.FC = () => {
  const { user, setUser, jobs, wallet, setWallet, addToast, setActiveTab, t } = useStore();
  const [workingJobId, setWorkingJobId] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const energy = user?.energy ?? 100;
  const happiness = user?.happiness ?? 100;
  const isVitalBlocked = energy <= 15 || happiness <= 30;

  const handleStartShift = (jobId: string, salary: number, title: string) => {
    if (isVitalBlocked) {
      addToast({
        type: 'error',
        title: 'Aşırı Yorgunluk & Tükenmişlik ⚠️',
        message: 'Enerjiniz (%15 altı) tükendi. İyileşmeden veya iksir satın almadan mesaiye başlayamazsınız!'
      });
      return;
    }

    setWorkingJobId(jobId);
    addToast({
      type: 'info',
      title: `${title} Mesaisi Başladı 💼`,
      message: 'Vardiya çalışmanız başladı. Mesai tamamlandığında maaşınız hesabınıza aktarılacak.'
    });

    setTimeout(() => {
      setWorkingJobId(null);
      if (wallet) {
        const newBank = wallet.bank_balance + salary;
        setWallet({
          ...wallet,
          bank_balance: newBank,
          total_liquid: wallet.cash_balance + newBank
        });
      }

      if (user) {
        setUser({
          ...user,
          energy: Math.max(0, user.energy - 15),
          reputation: user.reputation + 5
        });
      }

      addToast({
        type: 'success',
        title: 'Mesai Tamamlandı! 💰',
        message: `Tebrikler! ${title} işinizden ${formatCurrency(salary)} kazandınız.`
      });
    }, 3000);
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
                <Badge variant="gold">OFFICIAL CAREERS</Badge>
              </div>
            </div>
          </div>

          <Badge variant={workingJobId ? 'gold' : 'sky'} className="py-1.5 px-3.5 text-xs font-black">
            {workingJobId ? t('on_shift') : t('resting')}
          </Badge>
        </div>
      </Card>

      {/* VITAL BLOCKED BANNER */}
      {isVitalBlocked && (
        <Card className="border-2 border-rose-500 bg-slate-950 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />
            <div>
              <p className="text-xs font-black text-rose-400">⚠️ YORĞUNLUK ENGELİ AKTİF</p>
              <p className="text-[11px] font-semibold text-slate-300">Enerji veya Mutluluğunuz kritik seviyede. İyileşmeden mesai yapamazsınız.</p>
            </div>
          </div>
          <Button variant="gold" size="sm" onClick={() => setActiveTab('store')}>
            ⚡ {t('buy_elixir')}
          </Button>
        </Card>
      )}

      {/* JOBS CATALOG */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => {
          const isWorkingThis = workingJobId === job.id;
          return (
            <Card key={job.id} className="border-slate-800 bg-slate-950 p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="purple">{job.company_name || 'Şirket'}</Badge>
                  <span className="text-sm font-black text-emerald-400">{formatCurrency(job.salary_per_tick)} / shift</span>
                </div>
                <h3 className="text-base font-black text-white">{job.title}</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">{job.company_name}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-bold text-slate-300">
                  <p className="flex items-center justify-between">
                    <span>Exp Yield:</span>
                    <span className="text-amber-400">+{job.exp_per_tick} XP</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Required Rep:</span>
                    <span className="text-sky-300">{job.required_reputation} Puan</span>
                  </p>
                </div>
              </div>

              <Button
                variant="gold"
                className="w-full mt-5 py-2.5 text-xs font-black"
                disabled={isWorkingThis || isVitalBlocked}
                onClick={() => handleStartShift(job.id, job.salary_per_tick, job.title)}
              >
                {isWorkingThis ? t('on_shift') : t('start_shift')}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
