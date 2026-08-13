import React, { useState } from 'react';
import { useStore, GUEST_OWNER_ID, getOwnedVehicles, getOwnedProperties } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Vehicle, Property } from '../../types';
import { VehicleInspectionModal } from './VehicleInspectionModal';
import { Car, Home, Wrench, Key, Warehouse, DollarSign, Shield, Gauge, ShieldCheck, Inbox, Check, X, MapPin, Tag, PlusCircle, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MyGaragePanel: React.FC = () => {
  const { user, vehicles, properties, setVehicles, setProperties, offers, acceptOffer, declineOffer, addToast, t } = useStore();
  const [inspectVehicle, setInspectVehicle] = useState<Vehicle | null>(null);
  
  // Property Sale Modal State
  const [sellingProperty, setSellingProperty] = useState<Property | null>(null);
  const [salePriceInput, setSalePriceInput] = useState<string>('');

  // Add Property State
  const [isAddingPropertyModalOpen, setIsAddingPropertyModalOpen] = useState(false);
  const [newPropTitle, setNewPropTitle] = useState('');
  const [newPropType, setNewPropType] = useState<'RESIDENTIAL' | 'COMMERCIAL'>('RESIDENTIAL');
  const [newPropListingMode, setNewPropListingMode] = useState<'SALE' | 'RENT'>('SALE');
  const [newPropPrice, setNewPropPrice] = useState('4500000');
  const [newPropRentalPrice, setNewPropRentalPrice] = useState('30000');
  const [newPropAddress, setNewPropAddress] = useState('İstanbul, Beşiktaş');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const myId = user?.id || GUEST_OWNER_ID;
  const myVehicles = getOwnedVehicles(vehicles, myId);
  const myProperties = getOwnedProperties(properties, myId);
  const rentedProperties = properties.filter(p => p.tenant_id === myId && p.owner_id !== myId);

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

  // Open Sale Modal for Property
  const handleOpenSellModal = (prop: Property) => {
    setSellingProperty(prop);
    setSalePriceInput(prop.price.toString());
  };

  // Submit Sale Listing for Property
  const handleConfirmSellListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingProperty) return;
    const newPrice = parseFloat(salePriceInput);
    if (!newPrice || newPrice <= 0) return;

    const updatedProps = properties.map(p => {
      if (p.id === sellingProperty.id) {
        return {
          ...p,
          is_for_sale: true,
          price: newPrice
        };
      }
      return p;
    });

    setProperties(updatedProps);
    setSellingProperty(null);

    addToast({
      type: 'success',
      title: 'Mülk Satılığa Çıkarıldı! 🏷️',
      message: `"${sellingProperty.title}" mülkünüz ${formatCurrency(newPrice)} bedelle haritada ve piyasada satılığa çıkarıldı.`
    });
  };

  // Remove Property from Sale Listing
  const handleRemoveSaleListing = (prop: Property) => {
    const updatedProps = properties.map(p => {
      if (p.id === prop.id) {
        return {
          ...p,
          is_for_sale: false
        };
      }
      return p;
    });
    setProperties(updatedProps);

    addToast({
      type: 'info',
      title: 'Satış İlanı Kaldırıldı ℹ️',
      message: `"${prop.title}" mülkünüz satış ilanından çekildi.`
    });
  };

  // Add New Custom Property
  const handleCreateNewProperty = (e: React.FormEvent) => {
    e.preventDefault();

    const isSale = newPropListingMode === 'SALE';
    const priceVal = parseFloat(newPropPrice) || 4500000;
    const rentalVal = parseFloat(newPropRentalPrice) || 30000;

    // Generate random coordinates around Istanbul
    const randomLat = 41.01 + (Math.random() * 0.08);
    const randomLng = 29.00 + (Math.random() * 0.08);

    const newProp: Property = {
      id: 'prop-user-' + Date.now(),
      title: newPropTitle || 'Yeni Eklenen Ev',
      property_type: newPropType,
      latitude: randomLat,
      longitude: randomLng,
      address_name: newPropAddress,
      price: priceVal,
      rental_yield_per_tick: Math.round(priceVal * 0.0003),
      maintenance_condition: 100,
      owner_id: myId,
      is_for_sale: isSale,
      is_for_rent: !isSale,
      rental_price: rentalVal
    };

    setProperties([newProp, ...properties]);
    setIsAddingPropertyModalOpen(false);
    setNewPropTitle('');

    addToast({
      type: 'success',
      title: 'Yeni Mülk Oluşturuldu & Üstünüze Geçti 🏠',
      message: `"${newProp.title}" mülkünüz oluşturuldu ${isSale ? 've Harita Piyasasında Satılığa Çıkarıldı.' : 've Portföyünüze Eklendi.'}`
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
                <Badge variant="gold">PRIVATE GARAGE & REAL ESTATE</Badge>
              </div>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                Araçlarınızı yönetin, mülklerinizi ilana koyun veya satılığa çıkarın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="gold" size="sm" onClick={() => setIsAddingPropertyModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1" /> Mülk Ekle / İlan Ver
            </Button>
            <Badge variant="emerald" className="py-1.5 px-3 text-xs font-black">
              🏎️ {myVehicles.length} VEHS • 🏠 {myProperties.length} HOMES
            </Badge>
          </div>
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

      {/* OWNED REAL ESTATE HOMES */}
      <Card className="border-slate-800 bg-slate-950 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-400" /> Tapulu Gayrimenkullerim & İlanlarım ({myProperties.length})
          </h3>
          <Button variant="outline" size="sm" onClick={() => setIsAddingPropertyModalOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-1 text-amber-400" /> Yeni Mülk Ekle
          </Button>
        </div>

        {myProperties.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
            <Home className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Henüz üzerinize kayıtlı tapulu gayrimenkul bulunmamaktadır.</p>
            <Button variant="gold" size="sm" className="mt-3" onClick={() => setIsAddingPropertyModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1" /> Mülk Oluştur / İlan Ver
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProperties.map(prop => {
              const isRented = prop.is_for_rent || !!prop.tenant_id;
              const isForSale = prop.is_for_sale;

              return (
                <div key={prop.id} className={`p-4 bg-slate-900 border rounded-2xl space-y-3 ${isForSale ? 'border-amber-400/60 shadow-lg shadow-amber-500/10' : 'border-slate-800'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-black text-white">{prop.title}</h4>
                        {isForSale && <Badge variant="gold">🏷️ SATILIK İLANDA</Badge>}
                      </div>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">Değer / Satış Bedeli: {formatCurrency(prop.price)}</p>
                      <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-sky-400" /> {prop.address_name}
                      </p>
                    </div>
                    <Badge variant={isForSale ? 'gold' : isRented ? 'emerald' : 'sky'}>
                      {isForSale ? 'SATILIK' : isRented ? 'KİRADA' : 'KULLANIMDA'}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-amber-300">Kira Getirisi: +{formatCurrency(prop.rental_yield_per_tick)}/tick</span>
                    
                    <div className="flex items-center gap-1.5">
                      {isForSale ? (
                        <Button variant="outline" size="sm" className="text-[11px] border-rose-500/60 text-rose-300" onClick={() => handleRemoveSaleListing(prop)}>
                          <X className="w-3.5 h-3.5 mr-1" /> Satıştan Çek
                        </Button>
                      ) : (
                        <Button variant="gold" size="sm" className="text-[11px]" onClick={() => handleOpenSellModal(prop)}>
                          <Tag className="w-3.5 h-3.5 mr-1" /> Satılığa Çıkar
                        </Button>
                      )}

                      <Button variant="secondary" size="sm" className="text-[11px]" onClick={() => handleToggleRentProperty(prop)}>
                        <Key className="w-3.5 h-3.5 mr-1" /> {isRented ? 'Tahliye Et' : 'Kiraya Ver'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

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

      {/* PROPERTIES I RENT AS A TENANT (deposit paid, not owner) */}
      {rentedProperties.length > 0 && (
        <Card className="border-slate-800 bg-slate-950 p-5">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-sky-400" /> Kiracısı Olduğum Mülkler ({rentedProperties.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rentedProperties.map(prop => (
              <div key={prop.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-black text-white">{prop.title}</h4>
                    <p className="text-[11px] font-semibold text-slate-400">{prop.address_name}</p>
                  </div>
                  <Badge variant="sky">KİRACIYIM</Badge>
                </div>
                <p className="text-xs font-black text-rose-300 pt-2 border-t border-slate-800">
                  Ödediğim Kira: -{formatCurrency(prop.rental_price)}/tick
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODAL 1: SELL PROPERTY PRICE SETTING MODAL */}
      <AnimatePresence>
        {sellingProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border-2 border-amber-400/50 shadow-2xl space-y-4 text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-400" /> Mülkü Satılığa Çıkar
                </h3>
                <button
                  onClick={() => setSellingProperty(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-sm font-black text-white">{sellingProperty.title}</p>
                <p className="text-xs font-semibold text-slate-400">{sellingProperty.address_name}</p>
              </div>

              <form onSubmit={handleConfirmSellListing} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Satış İlan Fiyatı (₺)</label>
                  <input
                    type="number"
                    required
                    value={salePriceInput}
                    onChange={(e) => setSalePriceInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-black text-amber-400 focus:outline-none focus:border-amber-400"
                    placeholder="Örn: 5000000"
                  />
                  <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                    Belirlediğiniz fiyat üzerinden haritada ve piyasada satılığa çıkarılacaktır.
                  </span>
                </div>

                <Button variant="gold" type="submit" className="w-full py-3 font-black text-xs shadow-lg shadow-amber-500/20">
                  🏷️ {formatCurrency(parseFloat(salePriceInput) || sellingProperty.price)} İle Haritada Satılığa Çıkar
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: NEW PROPERTY CREATION MODAL */}
      <AnimatePresence>
        {isAddingPropertyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border-2 border-amber-400/50 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-amber-400" /> Yeni Mülk Ekle / İlan Oluştur
                </h3>
                <button
                  onClick={() => setIsAddingPropertyModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewProperty} className="space-y-3.5 text-left">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Mülk Adı / İlan Başlığı</label>
                  <input
                    type="text"
                    required
                    value={newPropTitle}
                    onChange={(e) => setNewPropTitle(e.target.value)}
                    placeholder="Örn: Levent Lüks Plaza Dairesi"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Adres / Konum</label>
                  <input
                    type="text"
                    required
                    value={newPropAddress}
                    onChange={(e) => setNewPropAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Mülk Türü</label>
                    <select
                      value={newPropType}
                      onChange={(e) => setNewPropType(e.target.value as 'RESIDENTIAL' | 'COMMERCIAL')}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="RESIDENTIAL">Konut</option>
                      <option value="COMMERCIAL">Ticari Kat</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">İlan Durumu</label>
                    <select
                      value={newPropListingMode}
                      onChange={(e) => setNewPropListingMode(e.target.value as 'SALE' | 'RENT')}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="SALE">Satılık İlan</option>
                      <option value="RENT">Kiralık İlan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Satış Fiyatı (₺)</label>
                    <input
                      type="number"
                      required
                      value={newPropPrice}
                      onChange={(e) => setNewPropPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Kira Getirisi (₺/tick)</label>
                    <input
                      type="number"
                      required
                      value={newPropRentalPrice}
                      onChange={(e) => setNewPropRentalPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <Button variant="gold" type="submit" className="w-full py-3 font-black text-xs shadow-lg shadow-amber-500/20 mt-2">
                  🏠 Mülkü Oluştur & Üstüme Geçir
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspection Modal */}
      {inspectVehicle && (
        <VehicleInspectionModal vehicle={inspectVehicle} onClose={() => setInspectVehicle(null)} />
      )}
    </div>
  );
};
