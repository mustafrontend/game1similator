import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { ShoppingBag, Coins, Crown, Zap, ShieldCheck, RefreshCw, Star, Car, Home, ArrowUpRight } from 'lucide-react';
import { purchaseProductById } from '../../services/purchases';

interface StoreProduct {
  id: string;
  name: string;
  category: 'CASH' | 'VIP' | 'BOOST' | 'UNLOCK';
  priceUsd: string;
  description: string;
  badge?: string;
  rewardValue?: number;
  rewardType: 'CASH_DEPOSIT' | 'VIP_STATUS' | 'FINDEKS_BOOST' | 'VITAL_ELIXIR' | 'CAR_UNLOCK' | 'MANSION_UNLOCK';
  icon: React.ReactNode;
}

export const StorePanel: React.FC = () => {
  const { wallet, setWallet, user, setUser, vehicles, setVehicles, properties, setProperties, addToast, t, formatCurrency } = useStore();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'CASH' | 'VIP' | 'BOOST' | 'UNLOCK'>('ALL');

  const products: StoreProduct[] = [
    // 1. CASH PACKAGES
    {
      id: 'vl_cash_starter',
      name: '💵 Başlangıç Sermaye Paketi',
      category: 'CASH',
      priceUsd: '$0.99',
      description: '₺100.000,00 anında banka hesabınıza aktarılır.',
      rewardValue: 100000,
      rewardType: 'CASH_DEPOSIT',
      badge: 'POPULAR',
      icon: <Coins className="w-6 h-6 text-amber-400" />
    },
    {
      id: 'vl_cash_business',
      name: '💼 İş İnsanı Servet Sandığı',
      category: 'CASH',
      priceUsd: '$4.99',
      description: '₺1.000.000,00 oyun içi nakit ve Findeks kredi puanı bonusu.',
      rewardValue: 1000000,
      rewardType: 'CASH_DEPOSIT',
      badge: 'BEST VALUE',
      icon: <Coins className="w-6 h-6 text-emerald-400" />
    },
    {
      id: 'vl_cash_tycoon',
      name: '🏦 Holding Patronu Kasası',
      category: 'CASH',
      priceUsd: '$19.99',
      description: '₺10.000.000,00 dev nakit enjeksiyonu.',
      rewardValue: 10000000,
      rewardType: 'CASH_DEPOSIT',
      badge: 'VIP BOSS',
      icon: <Coins className="w-6 h-6 text-purple-400" />
    },
    {
      id: 'vl_cash_billionaire',
      name: '👑 Milyarder Servet Paketi',
      category: 'CASH',
      priceUsd: '$49.99',
      description: '₺100.000.000,00 ile şehirdeki tüm emlakları satın alın!',
      rewardValue: 100000000,
      rewardType: 'CASH_DEPOSIT',
      badge: 'LEGENDARY',
      icon: <Crown className="w-6 h-6 text-amber-300" />
    },

    // 2. VIP MEMBERSHIPS
    {
      id: 'vl_sub_gold',
      name: '🌟 VIP Gold Vatandaş Aboneliği',
      category: 'VIP',
      priceUsd: '$9.99 / ay',
      description: '2x Borsa Temettü Geliri + Sıfır Emlak Alım Vergisi + Özel Altın Rozet.',
      rewardType: 'VIP_STATUS',
      badge: 'VIP SUBSCRIPTION',
      icon: <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
    },
    {
      id: 'vl_sub_underground',
      name: '👁️ Yeraltı VIP Sezon Geçişi',
      category: 'VIP',
      priceUsd: '$49.99 / yıl',
      description: 'Gece Müzayedelerine Sınırsız Erişim + Otomatik İhbar Tüyoları.',
      rewardType: 'VIP_STATUS',
      badge: 'ANNUAL PASS',
      icon: <Star className="w-6 h-6 text-purple-400" />
    },

    // 3. BOOSTERS & ELIXIRS
    {
      id: 'vl_boost_credit',
      name: '📈 Findeks Kredi Skoru Booster (+200)',
      category: 'BOOST',
      priceUsd: '$2.99',
      description: 'Findeks skorunuzu anında +200 puan artırır ve kredi limitinizi yükseltir.',
      rewardValue: 200,
      rewardType: 'FINDEKS_BOOST',
      icon: <ShieldCheck className="w-6 h-6 text-sky-400" />
    },
    {
      id: 'vl_boost_elixir',
      name: '⚡ Sonsuz Enerji & Ölümsüzlük İksiri',
      category: 'BOOST',
      priceUsd: '$1.99',
      description: 'Sağlık, Mutluluk ve Enerjinizi anında %100 fulleme garantisi.',
      rewardType: 'VITAL_ELIXIR',
      badge: 'INSTANT REFILL',
      icon: <Zap className="w-6 h-6 text-rose-400" />
    },

    // 4. UNLOCKS
    {
      id: 'vl_car_bugatti',
      name: '🏎️ Bugatti Chiron Super Sport Garaj Kilidi',
      category: 'UNLOCK',
      priceUsd: '$9.99',
      description: 'Dünyanın en hızlı hiper otomobilini direkt garajınıza ekler.',
      rewardType: 'CAR_UNLOCK',
      badge: 'GARAGE UNLOCK',
      icon: <Car className="w-6 h-6 text-amber-400" />
    },
    {
      id: 'vl_house_mansion',
      name: '🏰 Boğaz Manzaralı Villa Tapu Kilidi',
      category: 'UNLOCK',
      priceUsd: '$14.99',
      description: 'İstanbul Boğazı sıfır yalı tapusunu doğrudan adınıza tesciller.',
      rewardType: 'MANSION_UNLOCK',
      badge: 'MANSION UNLOCK',
      icon: <Home className="w-6 h-6 text-emerald-400" />
    }
  ];

  // IN-APP PURCHASE HANDLER
  const handlePurchase = async (product: StoreProduct) => {
    setPurchasingId(product.id);

    try {
      await purchaseProductById(product.id);

      // Execute Reward logic based on product type
      if (product.rewardType === 'CASH_DEPOSIT' && wallet && product.rewardValue) {
        const updatedBank = wallet.bank_balance + product.rewardValue;
        setWallet({
          ...wallet,
          bank_balance: updatedBank,
          total_liquid: wallet.cash_balance + updatedBank
        });
      } else if (product.rewardType === 'FINDEKS_BOOST' && user) {
        setUser({
          ...user,
          credit_score: Math.min(1900, (user.credit_score || 1000) + (product.rewardValue || 200))
        });
      } else if (product.rewardType === 'VITAL_ELIXIR' && user) {
        setUser({
          ...user,
          health: 100,
          happiness: 100,
          energy: 100
        });
      } else if (product.rewardType === 'CAR_UNLOCK') {
        const newCar = {
          id: 'veh-rc-' + Date.now(),
          brand_model: 'Bugatti Chiron Super Sport',
          vehicle_type: 'CAR' as const,
          price: 185000000,
          daily_rental_income: 150000,
          daily_rental_price: 150000,
          condition_percentage: 100,
          has_insurance: true,
          owner_id: 'apple-revcat-user-1001',
          is_for_sale: false,
          is_for_rent: false,
          image_url: '/logo.jpg'
        };
        setVehicles([newCar, ...vehicles]);
      } else if (product.rewardType === 'MANSION_UNLOCK') {
        const newHouse = {
          id: 'prop-rc-' + Date.now(),
          title: 'Yeniköy Boğaz Sıfır Tarihi Yalı',
          property_type: 'RESIDENTIAL' as const,
          latitude: 41.118,
          longitude: 29.071,
          address_name: 'Sarıyer Yeniköy Sahil Cad. No:14',
          price: 450000000,
          rental_yield_per_tick: 350000,
          maintenance_condition: 100,
          owner_id: 'apple-revcat-user-1001',
          is_for_sale: false,
          is_for_rent: false,
          rental_price: 350000
        };
        setProperties([newHouse, ...properties]);
      } else if (product.rewardType === 'VIP_STATUS' && user) {
        setUser({
          ...user,
          title: '👑 VIP Gold Vatandaş'
        });
      }

      addToast({
        type: 'success',
        title: 'Ödeme Başarılı! 🛍️',
        message: `${product.name} satın alma işlemi tamamlandı.`
      });
    } catch (err: any) {
      if (!err?.userCancelled) {
        addToast({
          type: 'error',
          title: 'Satın Alma Başarısız',
          message: err?.message || 'Satın alma işlemi tamamlanamadı.'
        });
      }
    } finally {
      setPurchasingId(null);
    }
  };

  const filteredProducts = products.filter(p => activeCategory === 'ALL' || p.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Top Store Banner */}
      <Card variant="gold" className="border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 rounded-2xl shadow-lg">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{t('store_official_title')}</h2>
                <Badge variant="gold">OFFICIAL STORE</Badge>
              </div>
            </div>
          </div>

          <Badge variant="emerald" className="py-1.5 px-3.5 text-xs">
            🛡️ SECURE PURCHASE
          </Badge>
        </div>
      </Card>

      {/* CATEGORY FILTER TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeCategory === 'ALL' ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/30' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          {t('store_all')}
        </button>
        <button
          onClick={() => setActiveCategory('CASH')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeCategory === 'CASH' ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/30' : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Coins className="w-3.5 h-3.5 shrink-0" /> {t('store_cash')}
        </button>
        <button
          onClick={() => setActiveCategory('VIP')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeCategory === 'VIP' ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/30' : 'bg-slate-900 text-purple-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5 shrink-0" /> {t('store_vip')}
        </button>
        <button
          onClick={() => setActiveCategory('BOOST')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeCategory === 'BOOST' ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-400/30' : 'bg-slate-900 text-sky-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" /> {t('store_boost')}
        </button>
        <button
          onClick={() => setActiveCategory('UNLOCK')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeCategory === 'UNLOCK' ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-400/30' : 'bg-slate-900 text-emerald-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Car className="w-3.5 h-3.5 shrink-0" /> {t('store_garage')}
        </button>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredProducts.map((prod) => {
          const isLoadingThis = purchasingId === prod.id;
          return (
            <Card
              key={prod.id}
              className="border-l-4 border-l-amber-400 border-slate-800 bg-slate-950 p-5 flex flex-col justify-between shadow-2xl hover:border-amber-400/70 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
                    {prod.icon}
                  </div>
                  {prod.badge && <Badge variant="gold">{prod.badge}</Badge>}
                </div>

                <h3 className="text-lg font-black text-white">{prod.name}</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1.5 leading-relaxed">{prod.description}</p>
              </div>

              <div className="mt-5 border-t border-slate-800/80 pt-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Price</span>
                  <span className="text-xl font-black text-amber-400">{prod.priceUsd}</span>
                </div>

                <Button
                  variant="gold"
                  className="px-6 py-2.5 text-xs font-black shadow-lg shadow-amber-500/20"
                  disabled={isLoadingThis}
                  onClick={() => handlePurchase(prod)}
                >
                  {isLoadingThis ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 mr-1 text-slate-950" />
                  )}
                  {isLoadingThis ? t('processing') : t('buy_button')}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
