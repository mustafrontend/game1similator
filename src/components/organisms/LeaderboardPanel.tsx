import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Trophy, Crown, Award, Medal, ShieldCheck, MessageSquare, Handshake, ExternalLink, Zap, Star, UserCheck } from 'lucide-react';

interface PlayerRank {
  rank: number;
  id: string;
  username: string;
  title: string;
  level: number;
  net_worth: number;
  credit_score: number;
  reputation: number;
  education: string;
  current_job: string;
  properties_count: number;
  vehicles_count: number;
  status: 'ONLINE' | 'OFFLINE';
  is_you?: boolean;
}

export const LeaderboardPanel: React.FC = () => {
  const { user, wallet, addToast, t } = useStore();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRank | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const leaderboardPlayers: PlayerRank[] = [
    {
      rank: 1,
      id: 'p-1',
      username: 'Burak_CEO',
      title: 'Global Finans İmparatoru',
      level: 32,
      net_worth: 48500000,
      credit_score: 1890,
      reputation: 2450,
      education: 'MASTER (Yüksek Lisans)',
      current_job: 'NecoAI Labs CTO',
      properties_count: 8,
      vehicles_count: 5,
      status: 'ONLINE'
    },
    {
      rank: 2,
      id: 'p-2',
      username: 'Zeynep_Emlak',
      title: 'Gayrimenkul Krallığı Başkanı',
      level: 28,
      net_worth: 32100000,
      credit_score: 1820,
      reputation: 1980,
      education: 'BACHELOR (Lisans)',
      current_job: 'Century Real Estate Kurucusu',
      properties_count: 12,
      vehicles_count: 3,
      status: 'ONLINE'
    },
    {
      rank: 3,
      id: 'p-3',
      username: 'Ahmet_Kaya99',
      title: 'Borsa & Kripto Balinası',
      level: 21,
      net_worth: 19800000,
      credit_score: 1650,
      reputation: 1240,
      education: 'BACHELOR (Lisans)',
      current_job: 'Kripto Portföy Yöneticisi',
      properties_count: 4,
      vehicles_count: 4,
      status: 'OFFLINE'
    },
    {
      rank: 4,
      id: 'p-you',
      username: user?.username || 'MustafaÖztürk',
      title: user?.title || 'Finans Krallığı Şampiyonu',
      level: 14,
      net_worth: (wallet?.total_liquid || 199500) + 8900000,
      credit_score: user?.credit_score || 1420,
      reputation: user?.reputation || 680,
      education: user?.education_level || 'BACHELOR (Lisans)',
      current_job: 'Finans Analisti',
      properties_count: 1,
      vehicles_count: 2,
      status: 'ONLINE',
      is_you: true
    },
    {
      rank: 5,
      id: 'p-5',
      username: 'Elif_Yazilim',
      title: 'Yazılım & Yapay Zeka Uzmanı',
      level: 12,
      net_worth: 4200000,
      credit_score: 1350,
      reputation: 520,
      education: 'BACHELOR (Lisans)',
      current_job: 'TechCorp Senior Mühendis',
      properties_count: 1,
      vehicles_count: 1,
      status: 'ONLINE'
    },
    {
      rank: 6,
      id: 'p-6',
      username: 'Caner_Oto',
      title: '2. El Otomobil Kralı',
      level: 9,
      net_worth: 2900000,
      credit_score: 1280,
      reputation: 390,
      education: 'HIGH_SCHOOL (Lise)',
      current_job: 'Oto Galeri Sahibi',
      properties_count: 0,
      vehicles_count: 6,
      status: 'OFFLINE'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card variant="gold" className="border-2 border-amber-400/50 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-300 animate-bounce" />
              <h2 className="text-2xl font-black text-white">{t('leaderboard_title')}</h2>
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              {t('leaderboard_sub')}
            </p>
          </div>
          <Badge variant="gold" className="py-1.5 px-3.5 text-xs">
            🏆 {t('your_rank')}
          </Badge>
        </div>
      </Card>

      {/* TOP 3 PODIUM CHAMPIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboardPlayers.slice(0, 3).map((p) => (
          <Card
            key={p.id}
            className={`border-2 p-5 text-center relative overflow-hidden ${
              p.rank === 1
                ? 'border-amber-400 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 shadow-2xl shadow-amber-500/20'
                : p.rank === 2
                ? 'border-slate-300 bg-slate-900 shadow-xl'
                : 'border-amber-700 bg-slate-900 shadow-xl'
            }`}
          >
            <div className="absolute top-3 right-3">
              {p.rank === 1 ? (
                <Crown className="w-7 h-7 text-amber-400 animate-pulse" />
              ) : p.rank === 2 ? (
                <Medal className="w-6 h-6 text-slate-300" />
              ) : (
                <Award className="w-6 h-6 text-amber-600" />
              )}
            </div>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center font-black text-xl text-amber-400 mb-2">
              #{p.rank}
            </div>

            <h3 className="text-lg font-black text-white">{p.username}</h3>
            <Badge variant={p.rank === 1 ? 'gold' : 'sky'} className="mt-1">{p.title}</Badge>

            <div className="my-3 py-2 border-y border-slate-800 space-y-1 text-xs font-semibold text-slate-300">
              <p className="flex justify-between"><span>{t('net_worth')}:</span> <strong className="text-amber-400 font-black">{formatCurrency(p.net_worth)}</strong></p>
              <p className="flex justify-between"><span>{t('findeks_score')}:</span> <strong className="text-purple-400 font-bold">{p.credit_score} Puan</strong></p>
              <p className="flex justify-between"><span>{t('profession_career')}</span> <strong className="text-white font-bold">{p.current_job}</strong></p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addToast({ type: 'info', title: 'DM Başlatıldı 💬', message: `${p.username} kullanıcısına özel mesaj penceresi açıldı.` })}
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1" /> {t('send_dm')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addToast({ type: 'success', title: 'Borç Teklifi İletildi 🤝', message: `${p.username} adlı oyuncuya borç teklifi gönderildi.` })}
              >
                <Handshake className="w-3.5 h-3.5 mr-1" /> {t('offer_loan')}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
