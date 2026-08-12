import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Vehicle } from '../../types';
import { VehicleInspectionModal } from './VehicleInspectionModal';
import { VehiclePurchaseModal } from './VehiclePurchaseModal';
import { Car, Wrench, Key, ShoppingBag, ShieldCheck, Sparkles, Handshake, CreditCard, DollarSign } from 'lucide-react';

export const VehicleMarketPanel: React.FC = () => {
  const { vehicles, t } = useStore();
  const [inspectVehicle, setInspectVehicle] = useState<Vehicle | null>(null);
  const [purchaseVehicle, setPurchaseVehicle] = useState<Vehicle | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <Card variant="gold" className="border-2 border-amber-400/50 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Badge variant="gold" className="mb-2">2. EL SAHİBİNDEN GALERİ & AI OTONOM PAZARLIK</Badge>
            <h2 className="text-2xl font-black text-white">{t('vehicle_market_title')}</h2>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              {t('vehicle_market_sub')}
            </p>
          </div>
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl">
            <Car className="w-8 h-8 animate-bounce" />
          </div>
        </div>
      </Card>

      {/* 2-Column Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map((veh) => (
          <Card key={veh.id} className="border-l-4 border-l-emerald-500 border-slate-800 bg-slate-950 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-1.5">
                  <Badge variant={veh.vehicle_type === 'CAR' ? 'sky' : 'emerald'}>
                    {veh.vehicle_type === 'CAR' ? t('car_tag') : 'Motosiklet'}
                  </Badge>
                  {veh.brand_model.includes('(AI İlan)') ? (
                    <Badge variant="gold">🤖 AI İlanı</Badge>
                  ) : (
                    <Badge variant="emerald">🌐 {t('player_listing')}</Badge>
                  )}
                </div>
                {veh.has_insurance && <Badge variant="purple">{t('insured')}</Badge>}
              </div>

              <h4 className="text-lg font-black text-white">{veh.brand_model}</h4>
              
              <div className="my-3 space-y-1.5 text-xs font-semibold text-slate-300 border-y border-slate-800 py-2.5">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5 text-slate-500" /> {t('car_condition')}</span>
                  <span className="text-emerald-400 font-bold">%{veh.condition_percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Key className="w-3.5 h-3.5 text-slate-500" /> {t('daily_rent_yield')}</span>
                  <span className="text-amber-400 font-extrabold">{formatCurrency(veh.daily_rental_price)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 pt-3 border-t border-slate-900">
              <div>
                <p className="text-[10px] font-bold text-slate-500">{t('sale_price')}</p>
                <p className="text-xl font-black text-amber-400">{formatCurrency(veh.price)}</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => setInspectVehicle(veh)}>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Ekspertiz
                </Button>
                <Button variant="gold" size="sm" onClick={() => setPurchaseVehicle(veh)}>
                  <Handshake className="w-4 h-4 mr-1.5" /> {t('buy_button')}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {inspectVehicle && (
        <VehicleInspectionModal
          vehicle={inspectVehicle}
          onClose={() => setInspectVehicle(null)}
        />
      )}

      {purchaseVehicle && (
        <VehiclePurchaseModal
          vehicle={purchaseVehicle}
          onClose={() => setPurchaseVehicle(null)}
        />
      )}
    </div>
  );
};
