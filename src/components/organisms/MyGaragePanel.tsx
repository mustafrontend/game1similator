import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Vehicle, Property } from '../../types';
import { VehicleInspectionModal } from './VehicleInspectionModal';
import { Car, Home, Wrench, Key, Warehouse, DollarSign, Shield, Gauge, ShieldCheck, Inbox, Check, X, MapPin, Tag, PlusCircle } from 'lucide-react';

export const MyGaragePanel: React.FC = () => {
  const { vehicles, properties, setVehicles, setProperties, offers, acceptOffer, declineOffer, addToast, t } = useStore();
  const [inspectVehicle, setInspectVehicle] = useState<Vehicle | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const myVehicles = vehicles.filter(v => v.owner_id === 'apple-revcat-user-1001');
  const myProperties = properties.filter(p => p.owner_id === 'apple-revcat-user-1001');

  const handleServiceVehicle = (veh: Vehicle) => {
    const updated = vehicles.map(v => v.id === veh.id ? { ...v, condition_percentage: 100 } : v);
    setVehicles(updated);
    addToast({
      type: 'success',
      title: 'Araç Bakımı Yapıldı 🛠️',
      message: `${veh.brand_model} periyodik bakımdan geçti (%100 Yenilendi).`
    });
  };

  const handleToggleRentVehicle = (veh: Vehicle) => {
    const updated = vehicles.map(v => v.id === veh.id ? { ...v, is_for_rent: !v.is_for_rent } : v);
    setVehicles(updated);
    addToast({
      type: 'info',
      title: veh.is_for_rent ? 'Kira İlanı Kaldırıldı' : 'Araç Kiraya Verildi 🔑',
      message: `${veh.brand_model} ${veh.is_for_rent ? 'garaja çekildi.' : 'günlük kiralık ilanına açıldı.'}`
    });
  };

  const handleToggleRentProperty = (prop: Property) => {
    const isCurrentlyRented = prop.is_for_rent || !!prop.tenant_id;
    const updatedProps = properties.map(p => {
      if (p.id === prop.id) {
        return {
          ...p,
          is_for_rent: !isCurrentlyRented,
          tenant_id: !isCurrentlyRented ? 'tenant-ai-bot' : null
        };
      }
      return p;
    });
    setProperties(updatedProps);

    addToast({
      type: 'success',
      title: isCurrentlyRented ? 'Kira Kontratı Feshedildi' : 'Mülk Kiraya Verildi 🔑',
      message: `${prop.title} mülkü ${isCurrentlyRented ? 'kiracıdan tahliye edildi.' : 'yeni kiracıya kiralandı (+₺' + prop.rental_yield_per_tick.toLocaleString() + '/tick gelir bağlandı).'}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card variant="gold" className="border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 rounded-2xl shadow-lg">
              <Warehouse className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{t('tab_garage')}</h2>
                <Badge variant="gold">PRIVATE GARAGE</Badge>
              </div>
            </div>
          </div>

          <Badge variant="emerald" className="py-1.5 px-3.5 text-xs font-black">
            🏎️ {myVehicles.length} VEHS • 🏠 {myProperties.length} HOMES
          </Badge>
        </div>
      </Card>

      {/* OFFERS INBOX */}
      {offers.length > 0 && (
        <Card className="border-l-4 border-l-amber-400 border-slate-800 bg-slate-950 p-5">
          <h3 className="text-base font-black text-white mb-3 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-amber-400" /> Gelen Satın Alma Teklifleri Inbox ({offers.length})
          </h3>
          <div className="space-y-2">
            {offers.map(off => (
              <div key={off.id} className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-xs font-black text-white">{off.asset_title}</p>
                  <p className="text-[10px] font-bold text-slate-400">Teklif Veren: {off.buyer_name} • {formatCurrency(off.offer_amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="gold" size="sm" onClick={() => acceptOffer(off.id)}>
                    <Check className="w-3.5 h-3.5 mr-1" /> Kabul Et
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => declineOffer(off.id)}>
                    <X className="w-3.5 h-3.5 mr-1 text-rose-400" /> Reddet
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* OWNED VEHICLES CATALOG */}
      <Card className="border-slate-800 bg-slate-950 p-5">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <Car className="w-5 h-5 text-amber-400" /> Garajımdaki Otomobiller ({myVehicles.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myVehicles.map(veh => (
            <div key={veh.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-black text-white">{veh.brand_model}</h4>
                  <p className="text-xs font-bold text-emerald-400">Değer: {formatCurrency(veh.price)}</p>
                </div>
                <Badge variant={veh.is_for_rent ? 'emerald' : 'gold'}>
                  {veh.is_for_rent ? 'KİRADA' : 'GARAJTAN'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <Button variant="gold" size="sm" className="flex-1 text-[11px]" onClick={() => handleServiceVehicle(veh)}>
                  <Wrench className="w-3.5 h-3.5 mr-1" /> Bakım Yap (%100)
                </Button>
                <Button variant="secondary" size="sm" className="flex-1 text-[11px]" onClick={() => handleToggleRentVehicle(veh)}>
                  <Key className="w-3.5 h-3.5 mr-1" /> {veh.is_for_rent ? 'Garaja Çek' : 'Kiraya Ver'}
                </Button>
                <Button variant="outline" size="sm" className="text-[11px]" onClick={() => setInspectVehicle(veh)}>
                  <Gauge className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* OWNED REAL ESTATE HOMES */}
      <Card className="border-slate-800 bg-slate-950 p-5">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-400" /> Tapulu Gayrimenkullerim ({myProperties.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myProperties.map(prop => {
            const isRented = prop.is_for_rent || !!prop.tenant_id;
            return (
              <div key={prop.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-black text-white">{prop.title}</h4>
                    <p className="text-xs font-bold text-emerald-400">Değer: {formatCurrency(prop.price)}</p>
                    <p className="text-[11px] font-semibold text-slate-400">{prop.address_name}</p>
                  </div>
                  <Badge variant={isRented ? 'emerald' : 'sky'}>
                    {isRented ? 'KİRACI VAR' : 'BOŞ'}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300">Kira Geliri: +{formatCurrency(prop.rental_yield_per_tick)}/tick</span>
                  <Button variant="gold" size="sm" className="text-[11px]" onClick={() => handleToggleRentProperty(prop)}>
                    <Key className="w-3.5 h-3.5 mr-1" /> {isRented ? 'Tahliye Et' : 'Kiraya Ver'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Inspection Modal */}
      {inspectVehicle && (
        <VehicleInspectionModal vehicle={inspectVehicle} onClose={() => setInspectVehicle(null)} />
      )}
    </div>
  );
};
