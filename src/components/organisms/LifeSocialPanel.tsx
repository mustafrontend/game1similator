import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { PlayerProfileModal } from './PlayerProfileModal';
import { Heart, Smile, Zap, Coffee, Utensils, Plane, Stethoscope, Bed, HeartHandshake, MessageCircle, Send, ShieldAlert, Sparkles, UserCheck, Crown, ExternalLink, Handshake } from 'lucide-react';

export const LifeSocialPanel: React.FC = () => {
  const { user, setUser, wallet, setWallet, addToast, t } = useStore();
  const [selectedOnlinePlayer, setSelectedOnlinePlayer] = useState<any | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Zeynep_Emlak', text: 'Moda sahilindeki daireyi kiralayana %10 indirim var!', time: '14:22' },
    { id: '2', sender: 'Burak_CEO', text: 'NecoAI Labs bünyesine Senior Yazılımcı arıyoruz.', time: '14:25' },
    { id: '3', sender: 'Ahmet_Kaya99', text: 'BTC uçuşa geçti, portföyleri hazırlayın 🚀', time: '14:28' },
  ]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const health = user?.health || 100;
  const happiness = user?.happiness || 100;
  const energy = user?.energy || 100;

  // Real-time Online Players list with their inspectable assets
  const onlinePlayers = [
    {
      id: 'p-online-1',
      username: 'Burak_CEO',
      title: 'Global Finans İmparatoru',
      reputation: 2450,
      credit_score: 1890,
      education: 'MASTER (Yüksek Lisans)',
      status: 'ONLINE' as const,
      assets: [
        { id: 'pa-1', title: 'Levent Plaza Ofis Katı', type: 'PROPERTY' as const, estimatedValue: 18000000, details: 'Ticari Plaza • ₺120,000/ay Kira' },
        { id: 'pa-2', title: 'Porsche 911 GT3 RS', type: 'VEHICLE' as const, estimatedValue: 14500000, details: '4.0 L Flat-6 • Hatasız Boyasız' },
      ]
    },
    {
      id: 'p-online-2',
      username: 'Zeynep_Emlak',
      title: 'Gayrimenkul Krallığı Başkanı',
      reputation: 1980,
      credit_score: 1820,
      education: 'BACHELOR (Lisans)',
      status: 'ONLINE' as const,
      assets: [
        { id: 'pa-3', title: 'Beykoz Konakları Lüks Villa', type: 'PROPERTY' as const, estimatedValue: 35000000, details: 'Özel Havuzlu Villa' },
        { id: 'pa-4', title: 'Mercedes-AMG G63 V8', type: 'VEHICLE' as const, estimatedValue: 18200000, details: 'Siyah Mat Kasa • Garajda Park Edildi' },
      ]
    },
    {
      id: 'p-online-3',
      username: 'Elif_Yazilim',
      title: 'Yazılım & Yapay Zeka Uzmanı',
      reputation: 520,
      credit_score: 1350,
      education: 'BACHELOR (Lisans)',
      status: 'ONLINE' as const,
      assets: [
        { id: 'pa-5', title: 'Kadıköy Moda Deniz Manzaralı Daire', type: 'PROPERTY' as const, estimatedValue: 4500000, details: '3+1 Daire' },
        { id: 'pa-6', title: 'Tesla Model 3 Long Range', type: 'VEHICLE' as const, estimatedValue: 2100000, details: '%100 Otonom Sürüş Paket' },
      ]
    }
  ];

  const handleCareAction = (cost: number, healthGain: number, happinessGain: number, energyGain: number, actionName: string) => {
    if (wallet && (wallet.cash_balance + wallet.bank_balance) < cost) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye',
        message: `${actionName} için gerekli ödeme tutarı: ${formatCurrency(cost)}`
      });
      return;
    }

    if (wallet && cost > 0) {
      setWallet({
        ...wallet,
        cash_balance: wallet.cash_balance >= cost ? wallet.cash_balance - cost : wallet.cash_balance,
        bank_balance: wallet.cash_balance < cost ? wallet.bank_balance - (cost - wallet.cash_balance) : wallet.bank_balance,
        total_liquid: wallet.total_liquid - cost
      });
    }

    if (user) {
      setUser({
        ...user,
        health: Math.min(100, user.health + healthGain),
        happiness: Math.min(100, user.happiness + happinessGain),
        energy: Math.min(100, user.energy + energyGain)
      });
    }

    addToast({
      type: 'success',
      title: `${actionName} İle Yenilendiniz`,
      message: `(+${healthGain} Sağlık, +${happinessGain} Mutluluk, +${energyGain} Enerji kazandınız.)`
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages([
      ...chatMessages,
      {
        id: Date.now().toString(),
        sender: user?.username || 'Apple Oyuncusu',
        text: chatInput,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card variant="gold" className="border-2 border-amber-400/50 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-amber-300 animate-pulse" />
              <h2 className="text-2xl font-black text-white">{t('social_market_title')}</h2>
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              {t('social_market_sub')}
            </p>
          </div>
        </div>
      </Card>

      {/* VIP SOCIAL ACTIVITIES & ENTERTAINMENT SECTION */}
      <Card className="border-l-4 border-l-purple-500 border-slate-800 bg-slate-950">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" /> VIP Sosyal Etkinlikler & Lüks Eğlenceler
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Paranızı sosyal aktivitelere ve eğlenceye harcayarak Mutluluk, Enerji ve İtibar kazanın!
            </p>
          </div>
          <Badge variant="purple" className="py-1 px-3">
            GÖSTERGE YENİLEME & SOSYALLEŞME
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'act-1',
              title: '☕ Lüks Kahve & Sosyal Buluşma',
              cost: 2500,
              health: 5,
              happiness: 15,
              energy: 25,
              desc: 'Boğaz manzarasında üçüncü nesil gurme kahve ve sosyalleşme.',
              icon: Coffee,
              badge: 'HIZLI YENİLENME'
            },
            {
              id: 'act-2',
              title: '🥂 VIP Gece Kulübü & Konser',
              cost: 35000,
              health: 0,
              happiness: 45,
              energy: 30,
              desc: 'Nişantaşı VIP şampanya masası, canlı DJ performansı ve konser.',
              icon: Utensils,
              badge: 'YÜKSEK MUTLULUK'
            },
            {
              id: 'act-3',
              title: '🛥️ Boğazda Özel Yat Partisi',
              cost: 150000,
              health: 10,
              happiness: 70,
              energy: 40,
              desc: 'Ultra lüks 30m motoryat, özel şef ikramları ve ünlü misafirler.',
              icon: Sparkles,
              badge: 'PRESTİJLİ ETKİNLİK'
            },
            {
              id: 'act-4',
              title: '🏎️ Süper Araba Pist Günü & Yarış',
              cost: 280000,
              health: 15,
              happiness: 85,
              energy: 50,
              desc: 'İstanbul Park F1 pistinde V12 yarış deneyimi ve adrenalin patlaması.',
              icon: Zap,
              badge: 'ADRENALİN & EĞLENCE'
            },
            {
              id: 'act-5',
              title: '✈️ Özel Jetle Maldivler VIP Tatili',
              cost: 950000,
              health: 100,
              happiness: 100,
              energy: 100,
              desc: 'Gulfstream G650 jet ile 7 günlük tropikal ada konaklaması.',
              icon: Plane,
              badge: 'MAKSİMUM DEĞERLER (%100)'
            },
            {
              id: 'act-6',
              title: '🏥 VIP Medikal Detoks & Terapi',
              cost: 120000,
              health: 75,
              happiness: 30,
              energy: 60,
              desc: 'Özel klinikte ozon tedavisi, vitamin serumu ve spa masajı.',
              icon: Stethoscope,
              badge: 'MEDİKAL SAĞLIK'
            }
          ].map((act) => {
            const ActIcon = act.icon;
            return (
              <div key={act.id} className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      <ActIcon className="w-4 h-4 text-amber-400" /> {act.title}
                    </h4>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-3">{act.desc}</p>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black">
                    {act.health > 0 && <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">+{act.health} Sağlık</span>}
                    {act.happiness > 0 && <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">+{act.happiness} Mutluluk</span>}
                    {act.energy > 0 && <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">+{act.energy} Enerji</span>}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400">{formatCurrency(act.cost)}</span>
                  <Button
                    variant="gold"
                    size="sm"
                    className="text-[11px] font-black"
                    onClick={() => handleCareAction(act.cost, act.health, act.happiness, act.energy, act.title)}
                  >
                    Eğlenceye Katıl
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ONLINE PLAYERS RADAR & P2P ASSET TRADE (NEW PROMINENT CARD) */}
      <Card className="border-l-4 border-l-emerald-500 border-slate-800 bg-slate-950">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400 animate-pulse" /> {t('online_radar_title')}
          </h3>
          <Badge variant="emerald">3 {t('players_active')} 🟢</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {onlinePlayers.map((player) => (
            <div key={player.id} className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-white">
                      {player.username.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{player.username}</h4>
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> {player.title}
                      </span>
                    </div>
                  </div>
                  <Badge variant="emerald">🟢 ONLINE</Badge>
                </div>

                <div className="my-3 py-2 border-y border-slate-800/80 space-y-1 text-xs font-semibold text-slate-300">
                  <p className="flex justify-between"><span>{t('registered_assets')}</span> <strong className="text-white font-bold">{player.assets.length} Ev & Araç</strong></p>
                  <p className="flex justify-between"><span>{t('reputation_score')}</span> <strong className="text-amber-400 font-bold">{player.reputation} Puan</strong></p>
                </div>
              </div>

              <Button
                variant="gold"
                size="sm"
                className="w-full mt-2"
                onClick={() => setSelectedOnlinePlayer(player)}
              >
                <Handshake className="w-3.5 h-3.5 mr-1 text-slate-950" /> {t('inspect_trade_btn')}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Player Profile Modal for P2P Asset Bidding */}
      {selectedOnlinePlayer && (
        <PlayerProfileModal
          player={selectedOnlinePlayer}
          onClose={() => setSelectedOnlinePlayer(null)}
        />
      )}
    </div>
  );
};
