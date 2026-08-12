import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Asset, UserPortfolio } from '../../types';
import { TrendingUp, TrendingDown, DollarSign, PieChart, ShoppingCart, Sparkles, RefreshCw, ArrowUpRight, ArrowDownLeft, Percent } from 'lucide-react';

export const InvestmentPanel: React.FC = () => {
  const { assets, setAssets, portfolio, wallet, setWallet, setPortfolio, addToast, t } = useStore();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(assets[0] || null);
  const [buyAmount, setBuyAmount] = useState('5000');
  const [sellQuantityInput, setSellQuantityInput] = useState<{ [assetId: string]: string }>({});

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  // Filter out any zero or sold portfolio entries
  const activePortfolio = portfolio.filter(p => p.quantity > 0.00001);

  // Hourly / Periodic Live Market Price Fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = assets.map((a) => {
        const deltaPercent = (Math.random() * 4 - 2); // -2% to +2%
        const newPrice = Math.max(1, a.current_price * (1 + deltaPercent / 100));
        return {
          ...a,
          prev_price: a.current_price,
          current_price: Math.round(newPrice * 100) / 100,
          change_24h: Math.round((a.change_24h + deltaPercent) * 100) / 100
        };
      });
      setAssets(updated);

      if (selectedAsset) {
        const refreshed = updated.find(a => a.id === selectedAsset.id);
        if (refreshed) setSelectedAsset(refreshed);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [assets, selectedAsset, setAssets]);

  // 1. BUY ASSET (SATIN AL)
  const handleBuyAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !buyAmount || parseFloat(buyAmount) <= 0) return;
    const cost = parseFloat(buyAmount);

    if (!wallet) return;

    // Deduct cost directly from bank balance
    const updatedBank = wallet.bank_balance - cost;
    const updatedWallet = {
      ...wallet,
      bank_balance: updatedBank,
      total_liquid: wallet.cash_balance + updatedBank
    };

    setWallet(updatedWallet);

    const qtyPurchased = cost / selectedAsset.current_price;
    const existingIndex = portfolio.findIndex(p => p.asset_id === selectedAsset.id);
    let updatedPortfolio: UserPortfolio[];

    if (existingIndex >= 0) {
      const existing = portfolio[existingIndex];
      const newQty = existing.quantity + qtyPurchased;
      const newAvgCost = ((existing.quantity * existing.avg_buy_price) + cost) / newQty;
      
      updatedPortfolio = [...portfolio];
      updatedPortfolio[existingIndex] = {
        ...existing,
        quantity: newQty,
        avg_buy_price: newAvgCost
      };
    } else {
      const newEntry: UserPortfolio = {
        id: 'port-' + Date.now(),
        user_id: wallet.user_id,
        asset_id: selectedAsset.id,
        quantity: qtyPurchased,
        avg_buy_price: selectedAsset.current_price,
        asset: selectedAsset
      };
      updatedPortfolio = [...portfolio, newEntry];
    }

    setPortfolio(updatedPortfolio);

    addToast({
      type: 'success',
      title: 'Yatırım Satın Alındı! 📈',
      message: `${selectedAsset.symbol} - ${formatCurrency(cost)} tutarında yatırım portföyünüze eklendi.`
    });
  };

  // 2. SELL ASSET (GERİ SAT)
  const handleSellAsset = (item: UserPortfolio, sellQuantity: number) => {
    if (sellQuantity <= 0 || sellQuantity > item.quantity) {
      addToast({
        type: 'error',
        title: 'Geçersiz Satış Miktarı ⚠️',
        message: 'Satmak istediğiniz miktar elinizdeki adetten fazla olamaz.'
      });
      return;
    }

    const liveAsset = assets.find(a => a.id === item.asset_id) || item.asset;
    const currentPrice = liveAsset ? liveAsset.current_price : item.avg_buy_price;
    const totalIncome = sellQuantity * currentPrice;

    if (wallet) {
      const updatedBank = wallet.bank_balance + totalIncome;
      setWallet({
        ...wallet,
        bank_balance: updatedBank,
        total_liquid: wallet.cash_balance + updatedBank
      });
    }

    // Update portfolio quantity
    const updatedPortfolio = portfolio
      .map(p => {
        if (p.asset_id === item.asset_id) {
          const remQty = p.quantity - sellQuantity;
          return remQty > 0.00001 ? { ...p, quantity: remQty } : null;
        }
        return p;
      })
      .filter((p): p is UserPortfolio => p !== null);

    setPortfolio(updatedPortfolio);

    addToast({
      type: 'success',
      title: 'Satış İşlemi Başarılı! 💰',
      message: `${liveAsset?.symbol || item.asset_id} varlığınızdan ${sellQuantity.toFixed(4)} adet satıldı. Hesabınıza ${formatCurrency(totalIncome)} yatırıldı.`
    });

    setSellQuantityInput(prev => ({ ...prev, [item.asset_id]: '' }));
  };

  // Calculate Overall Portfolio Value and Total Profit/Loss
  const portfolioSummary = activePortfolio.reduce(
    (acc, item) => {
      const liveAsset = assets.find(a => a.id === item.asset_id) || item.asset;
      const currentPrice = liveAsset ? liveAsset.current_price : item.avg_buy_price;
      const currentValue = item.quantity * currentPrice;
      const totalCost = item.quantity * item.avg_buy_price;
      const profitLoss = currentValue - totalCost;

      return {
        totalValue: acc.totalValue + currentValue,
        totalCost: acc.totalCost + totalCost,
        totalProfitLoss: acc.totalProfitLoss + profitLoss
      };
    },
    { totalValue: 0, totalCost: 0, totalProfitLoss: 0 }
  );

  const overallProfitPercent = portfolioSummary.totalCost > 0
    ? (portfolioSummary.totalProfitLoss / portfolioSummary.totalCost) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card variant="gold" className="border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 rounded-2xl shadow-lg">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{t('tab_investment')}</h2>
                <Badge variant="gold">LIVE BIST & CRYPTO</Badge>
              </div>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                {t('investment_sub')}
              </p>
            </div>
          </div>

          <Badge variant="emerald" className="py-1.5 px-3.5 text-xs font-black">
            {t('market_open_badge')}
          </Badge>
        </div>
      </Card>

      {/* PORTFOLIO OVERVIEW & PROFIT/LOSS SUMMARY HUD CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-950 border-slate-800 p-5">
          <p className="text-xs font-bold text-slate-400">{t('total_portfolio_value')}</p>
          <h3 className="text-2xl font-black text-white mt-1">{formatCurrency(portfolioSummary.totalValue)}</h3>
        </Card>

        <Card className="bg-slate-950 border-slate-800 p-5">
          <p className="text-xs font-bold text-slate-400">{t('total_cost')}</p>
          <h3 className="text-2xl font-black text-slate-300 mt-1">{formatCurrency(portfolioSummary.totalCost)}</h3>
        </Card>

        <Card className={`p-5 border ${portfolioSummary.totalProfitLoss >= 0 ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-rose-950/30 border-rose-500/50'}`}>
          <p className="text-xs font-bold text-slate-300">{t('total_profit_loss_status')}</p>
          <div className="flex items-center gap-2 mt-1">
            <h3 className={`text-2xl font-black ${portfolioSummary.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {portfolioSummary.totalProfitLoss >= 0 ? '▲ +' : '▼ '}{formatCurrency(portfolioSummary.totalProfitLoss)}
            </h3>
            <Badge variant={portfolioSummary.totalProfitLoss >= 0 ? 'emerald' : 'rose'}>
              %{overallProfitPercent.toFixed(2)}
            </Badge>
          </div>
        </Card>
      </div>

      {/* 2-COLUMN MARKET CATALOG & BUY FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ASSET CATALOG TABLE */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-950 p-5">
          <h3 className="text-lg font-black text-white mb-4">Canlı Piyasa Varlıkları</h3>

          <div className="space-y-2">
            {assets.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;
              const isUp = asset.change_24h >= 0;

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-amber-400 font-black text-xs">
                      {asset.symbol}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{asset.name}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{asset.asset_type}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-white">{formatCurrency(asset.current_price)}</p>
                    <span className={`text-xs font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? '▲ +' : '▼ '}{asset.change_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* BUY ASSET FORM */}
        <Card className="border-slate-800 bg-slate-950 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-white mb-3">Varlık Satın Al</h3>
            {selectedAsset ? (
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-amber-400">{selectedAsset.name}</span>
                  <Badge variant="gold">{selectedAsset.symbol}</Badge>
                </div>
                <p className="text-xl font-black text-white mt-2">{formatCurrency(selectedAsset.current_price)}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-4">Lütfen listeden bir varlık seçin.</p>
            )}

            <form onSubmit={handleBuyAsset} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">Yatırım Tutarı (₺)</label>
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-black text-white focus:outline-none focus:border-amber-400"
                  placeholder="5000"
                />
              </div>

              <Button variant="gold" className="w-full py-3 text-xs font-black">
                {t('buy_button')}
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* PORTFOLIO & SELL CASHOUT TABLE */}
      <Card className="border-slate-800 bg-slate-950 p-5">
        <h3 className="text-lg font-black text-white mb-4">Sahip Olduğum Portföy & Geri Satış (Cashout)</h3>

        {activePortfolio.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
            <PieChart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Henüz aktif bir yatırımınız bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activePortfolio.map((item) => {
              const liveAsset = assets.find(a => a.id === item.asset_id) || item.asset;
              const currentPrice = liveAsset ? liveAsset.current_price : item.avg_buy_price;
              const currentValue = item.quantity * currentPrice;
              const totalCost = item.quantity * item.avg_buy_price;
              const itemProfit = currentValue - totalCost;
              const itemProfitPercent = totalCost > 0 ? (itemProfit / totalCost) * 100 : 0;
              const isProfit = itemProfit >= 0;

              return (
                <div key={item.id} className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white">{liveAsset?.name || item.asset_id}</span>
                      <Badge variant="gold">{liveAsset?.symbol || item.asset_id}</Badge>
                    </div>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                      Adet: <strong className="text-white">{item.quantity.toFixed(4)}</strong> • Ort. Maliyet: <strong className="text-slate-300">{formatCurrency(item.avg_buy_price)}</strong>
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm font-black text-white">Anlık Değer: {formatCurrency(currentValue)}</p>
                    <span className={`text-xs font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '▲ +' : '▼ '}{formatCurrency(itemProfit)} (%{itemProfitPercent.toFixed(2)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <input
                      type="number"
                      placeholder="Satılacak Adet"
                      value={sellQuantityInput[item.asset_id] || ''}
                      onChange={(e) => setSellQuantityInput({ ...sellQuantityInput, [item.asset_id]: e.target.value })}
                      className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white"
                    />
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleSellAsset(item, parseFloat(sellQuantityInput[item.asset_id] || item.quantity.toString()))}
                    >
                      Sat / Bozdur
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
