import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, UserCheck, Crown, ShieldCheck, Home, Car, DollarSign, Send, Sparkles, MessageSquare, Handshake, CheckCircle2 } from 'lucide-react';

interface PlayerAsset {
  id: string;
  title: string;
  type: 'PROPERTY' | 'VEHICLE';
  estimatedValue: number;
  details: string;
}

interface OnlinePlayer {
  id: string;
  username: string;
  title: string;
  reputation: number;
  credit_score: number;
  education: string;
  status: 'ONLINE' | 'OFFLINE';
  assets: PlayerAsset[];
}

interface Props {
  player: OnlinePlayer | null;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<Props> = ({ player, onClose }) => {
  const { wallet, vehicles, properties, addToast } = useStore();
  const [selectedAssetForOffer, setSelectedAssetForOffer] = useState<PlayerAsset | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');

  const [mySelectedAssetToSell, setMySelectedAssetToSell] = useState<string>('');
  const [sellPrice, setSellPrice] = useState('');

  if (!player) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const handleSendBuyOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForOffer) return;
    const amount = parseFloat(offerPrice);
    if (!amount || amount <= 0) return;

    if (!wallet || wallet.total_liquid < amount) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye',
        message: `Teklif için gerekli bakiye: ${formatCurrency(amount)}`
      });
      return;
    }

    addToast({
      type: 'success',
      title: 'Satın Alma Teklifi Gönderildi 🌐',
      message: `${player.username} oyuncusuna "${selectedAssetForOffer.title}" için ${formatCurrency(amount)} teklifi iletildi.`
    });

    setSelectedAssetForOffer(null);
    setOfferPrice('');
  };

  const handleSendSellOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mySelectedAssetToSell) return;
    const amount = parseFloat(sellPrice);
    if (!amount || amount <= 0) return;

    const myVeh = vehicles.find(v => v.id === mySelectedAssetToSell);
    const myProp = properties.find(p => p.id === mySelectedAssetToSell);
    const assetTitle = myVeh ? myVeh.brand_model : myProp ? myProp.title : 'Varlık';

    addToast({
      type: 'success',
      title: 'Satış Teklifi İletildi 🤝',
      message: `${player.username} oyuncusuna "${assetTitle}" varlığınızı ${formatCurrency(amount)} bedelle satma teklifi gönderildi.`
    });

    setMySelectedAssetToSell('');
    setSellPrice('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden text-white my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Player Header Banner */}
          <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 border border-sky-400/40 flex items-center justify-center font-black text-xl text-white shadow-lg">
              {player.username.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{player.username}</h3>
                <Badge variant={player.status === 'ONLINE' ? 'emerald' : 'slate'}>
                  {player.status === 'ONLINE' ? '🟢 ONLINE' : '⚪ OFFLINE'}
                </Badge>
              </div>
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                <Crown className="w-3.5 h-3.5" /> {player.title}
              </p>
            </div>
          </div>

          {/* Player Vitals Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 block">Saygınlık Puanı</span>
              <strong className="text-sm font-black text-amber-400">{player.reputation} Puan</strong>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 block">Findeks Skoru</span>
              <strong className="text-sm font-black text-purple-400">{player.credit_score} Puan</strong>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 block">Eğitim Diploması</span>
              <strong className="text-xs font-bold text-sky-300">{player.education}</strong>
            </div>
          </div>

          {/* TRADE MODE SELECTOR */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTradeMode('BUY')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                tradeMode === 'BUY' ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" /> Oyuncudan Varlık Satın Al
            </button>
            <button
              onClick={() => setTradeMode('SELL')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                tradeMode === 'SELL' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Handshake className="w-4 h-4" /> Oyuncuya Varlığını Sat
            </button>
          </div>

          {/* MODE 1: BUY FROM PLAYER */}
          {tradeMode === 'BUY' ? (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-sky-400" /> {player.username} Oyuncusunun Mülk & Garaj Filosu
              </h4>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {player.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`p-3.5 rounded-2xl border transition-all flex justify-between items-center ${
                      selectedAssetForOffer?.id === asset.id ? 'bg-slate-950 border-amber-400 ring-2 ring-amber-400/20' : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={asset.type === 'PROPERTY' ? 'gold' : 'sky'}>
                          {asset.type === 'PROPERTY' ? '🏠 GAYRİMENKUL' : '🏎️ ARAÇ'}
                        </Badge>
                        <h5 className="text-xs font-black text-white">{asset.title}</h5>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400 mt-1">{asset.details}</p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500">Piyasa Değeri</span>
                        <p className="text-xs font-black text-amber-400">{formatCurrency(asset.estimatedValue)}</p>
                      </div>
                      <Button
                        variant={selectedAssetForOffer?.id === asset.id ? 'gold' : 'secondary'}
                        size="sm"
                        onClick={() => {
                          setSelectedAssetForOffer(asset);
                          setOfferPrice(asset.estimatedValue.toString());
                        }}
                      >
                        Teklif Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedAssetForOffer && (
                <form onSubmit={handleSendBuyOffer} className="p-4 bg-slate-950 rounded-2xl border border-amber-400/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-amber-300">Seçilen Varlık: {selectedAssetForOffer.title}</span>
                    <button type="button" onClick={() => setSelectedAssetForOffer(null)} className="text-slate-400 hover:text-white">İptal</button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="Teklif bedeli (₺)..."
                      className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-amber-400 focus:outline-hidden"
                    />
                    <Button variant="gold" size="sm" type="submit">
                      <Send className="w-4 h-4 mr-1 text-slate-950" /> Teklifi İlet
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* MODE 2: DIRECT SELL TO PLAYER */
            <form onSubmit={handleSendSellOffer} className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-emerald-500/40">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> {player.username} Oyuncusuna Varlık Satış Teklifi Gönder
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Satılacak Varlığınızı Seçin</label>
                <select
                  value={mySelectedAssetToSell}
                  onChange={(e) => setMySelectedAssetToSell(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-hidden"
                >
                  <option value="">-- Varlık Seçiniz --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>🏎️ Araç: {v.brand_model} ({formatCurrency(v.price)})</option>
                  ))}
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>🏠 Ev: {p.title} ({formatCurrency(p.price)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">İstediğiniz Satış Bedeli (₺)</label>
                <input
                  type="number"
                  required
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="Örn: 2500000"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 focus:outline-hidden"
                />
              </div>

              <Button variant="primary" className="w-full py-3" type="submit">
                <Send className="w-4 h-4 mr-2" /> Satış Teklifini Oyuncunun Kutusuna Gönder
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
