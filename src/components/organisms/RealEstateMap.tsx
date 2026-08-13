import React, { useState } from 'react';
import { useStore, GUEST_OWNER_ID } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Property } from '../../types';
import { PropertyPurchaseModal } from './PropertyPurchaseModal';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Home, CheckCircle, Sparkles, Navigation as NavIcon, Layers, Compass, PlusCircle, AlertCircle, X, Key, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const createCustomMarker = (property: Property, isSelected: boolean) => {
  const isForSale = property.is_for_sale;
  const color = isSelected ? '#f59e0b' : isForSale ? '#f59e0b' : '#10b981';
  const iconEmoji = isForSale ? '🏷️' : '🔑';

  const svgHtml = `
    <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-center;">
      <div style="position: absolute; inset: 0; border-radius: 50%; background: ${color}; opacity: 0.35; filter: blur(6px); animation: pulse 2s infinite;"></div>
      <div style="position: relative; width: 34px; height: 34px; background: #ffffff; border: 2px solid ${color}; border-radius: 12px; display: flex; align-items: center; justify-center; box-shadow: 0 4px 14px rgba(0,0,0,0.35); transform: rotate(45deg);">
        <div style="transform: rotate(-45deg); font-weight: 900; font-size: 15px;">
          ${iconEmoji}
        </div>
      </div>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-game-marker',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
};

const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

const MapClickHandler: React.FC<{ isAddingMode: boolean; onMapClick: (lat: number, lng: number) => void }> = ({ isAddingMode, onMapClick }) => {
  useMapEvents({
    click(e) {
      if (isAddingMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
};

export const RealEstateMap: React.FC = () => {
  const { user, properties, wallet, setWallet, setProperties, addToast, t } = useStore();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [purchaseProperty, setPurchaseProperty] = useState<Property | null>(null);
  const [listingFilter, setListingFilter] = useState<'ALL' | 'FOR_SALE' | 'FOR_RENT'>('ALL');
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.03, 29.02]);
  const [mapZoom, setMapZoom] = useState(11);

  // Add Property Mode States
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newPropCoords, setNewPropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newPropTitle, setNewPropTitle] = useState('');
  const [newPropType, setNewPropType] = useState<'RESIDENTIAL' | 'COMMERCIAL'>('RESIDENTIAL');
  const [newPropListingMode, setNewPropListingMode] = useState<'SALE' | 'RENT'>('SALE');
  const [newPropPrice, setNewPropPrice] = useState('3500000');
  const [newPropRentalPrice, setNewPropRentalPrice] = useState('25000');
  const [newPropAddress, setNewPropAddress] = useState('İstanbul, Türkiye');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const filteredProperties = properties.filter((p) => {
    if (listingFilter === 'FOR_SALE') return p.is_for_sale;
    if (listingFilter === 'FOR_RENT') return p.is_for_rent && !p.is_for_sale;
    return true;
  });

  const handleMapClick = (lat: number, lng: number) => {
    setNewPropCoords({ lat, lng });
    setIsAddingMode(false);
  };

  const handleCreatePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropCoords) return;

    const isSale = newPropListingMode === 'SALE';
    const newProperty: Property = {
      id: 'prop-custom-' + Date.now(),
      title: newPropTitle || 'Haritada Yeni Ev',
      property_type: newPropType,
      latitude: newPropCoords.lat,
      longitude: newPropCoords.lng,
      address_name: newPropAddress,
      price: parseFloat(newPropPrice) || 3500000,
      rental_yield_per_tick: Math.round((parseFloat(newPropPrice) || 3500000) * 0.0003),
      maintenance_condition: 100,
      owner_id: user?.id || GUEST_OWNER_ID,
      is_for_sale: isSale,
      is_for_rent: !isSale,
      rental_price: parseFloat(newPropRentalPrice) || 25000,
    };

    setProperties([newProperty, ...properties]);
    setNewPropCoords(null);
    setNewPropTitle('');

    addToast({
      type: 'success',
      title: 'Mülk Haritaya İğnelendi 📍',
      message: `"${newProperty.title}" haritada ${isSale ? 'Satılık' : 'Kiralık'} ilanı olarak yerini aldı.`
    });
  };

  const handleJumpToLocation = (lat: number, lng: number, zoom = 14) => {
    setMapCenter([lat, lng]);
    setMapZoom(zoom);
  };

  return (
    <div className="space-y-6">
      {/* Top Control Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/95 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">{t('map_radar_title')}</h2>
            <p className="text-xs font-semibold text-slate-400">{t('map_pin_desc')}</p>
          </div>
        </div>
      </div>

      {/* PAIRED 2-COLUMN LIGHT MAP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT 1/2: MAP CANVAS */}
        <Card className="border-l-4 border-l-sky-500 border-slate-800 bg-slate-950 shadow-2xl p-4 flex flex-col h-[640px]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <NavIcon className="w-4 h-4 text-sky-400 animate-pulse" />
              <h3 className="text-sm font-black text-white tracking-wide">{t('map_light_view')}</h3>
            </div>
            
            <Button
              variant={isAddingMode ? 'gold' : 'secondary'}
              size="sm"
              onClick={() => setIsAddingMode(!isAddingMode)}
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              {isAddingMode ? 'Haritaya Tıklayın...' : t('add_property_btn')}
            </Button>
          </div>

          {isAddingMode && (
            <div className="mb-2 p-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold rounded-xl flex items-center gap-2 animate-bounce">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Haritadaki bir noktaya tıklayarak yeni ev konumunu belirleyin!</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none text-[11px] font-extrabold text-slate-300">
            <span className="text-slate-500 flex items-center gap-1 mr-1"><Layers className="w-3 h-3" /> {t('fast_region')}</span>
            <button
              onClick={() => handleJumpToLocation(40.9856, 29.0264, 14)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-sky-600/30 border border-slate-800 rounded-lg text-sky-400 hover:text-white transition-all"
            >
              📍 Kadıköy Moda
            </button>
            <button
              onClick={() => handleJumpToLocation(41.0782, 29.0118, 14)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-purple-600/30 border border-slate-800 rounded-lg text-purple-400 hover:text-white transition-all"
            >
              🏢 Levent Plaza
            </button>
            <button
              onClick={() => handleJumpToLocation(41.0422, 29.0083, 14)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-amber-600/30 border border-slate-800 rounded-lg text-amber-400 hover:text-white transition-all"
            >
              🏪 Beşiktaş Çarşı
            </button>
            <button
              onClick={() => handleJumpToLocation(41.1340, 29.1020, 13)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-600/30 border border-slate-800 rounded-lg text-emerald-400 hover:text-white transition-all"
            >
              🏰 Beykoz Villa
            </button>
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <MapViewController center={mapCenter} zoom={mapZoom} />
              <MapClickHandler isAddingMode={isAddingMode} onMapClick={handleMapClick} />

              <TileLayer
                attribution='&copy; CARTO &copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={19}
              />

              {filteredProperties.map((prop) => {
                const isSelected = selectedProperty?.id === prop.id;
                return (
                  <Marker
                    key={prop.id}
                    position={[prop.latitude, prop.longitude]}
                    icon={createCustomMarker(prop, isSelected)}
                    eventHandlers={{
                      click: () => setSelectedProperty(prop)
                    }}
                  >
                    <Popup className="custom-leaflet-popup" minWidth={140}>
                      <div className="p-1 space-y-1 text-white">
                        <strong className="text-xs font-black block">{prop.title}</strong>
                        <span className="text-[10px] font-bold text-emerald-400 block">{formatCurrency(prop.price)}</span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </Card>

        {/* RIGHT 1/2: PROPERTY DETAILS / PURCHASE PANEL */}
        <Card className="border-slate-800 bg-slate-950 p-5 flex flex-col justify-between h-[640px] overflow-y-auto">
          {selectedProperty ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant={selectedProperty.is_for_sale ? 'gold' : 'emerald'}>
                    {selectedProperty.is_for_sale ? 'SATILIK TAPU' : 'KİRALIK DAİRE'}
                  </Badge>
                  <h3 className="text-xl font-black text-white mt-1.5">{selectedProperty.title}</h3>
                  <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" /> {selectedProperty.address_name}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedProperty(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Satış Bedeli:</span>
                  <span className="text-lg font-black text-amber-400">{formatCurrency(selectedProperty.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Günlük Kira Getirisi:</span>
                  <span className="text-sm font-black text-emerald-400">+{formatCurrency(selectedProperty.rental_yield_per_tick)}/tick</span>
                </div>
              </div>

              <Button
                variant="gold"
                className="w-full py-3 text-xs font-black shadow-lg shadow-amber-500/20"
                onClick={() => setPurchaseProperty(selectedProperty)}
              >
                {selectedProperty.is_for_sale ? 'Tapuyu Satın Al' : 'Kontratı İmzala & Kirala'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <Home className="w-12 h-12 text-slate-600 animate-pulse" />
              <p className="text-xs font-bold text-slate-400">Detaylarını görmek için haritadaki bir mülk iğnesine (Pin) tıklayın.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Property Purchase Modal */}
      {purchaseProperty && (
        <PropertyPurchaseModal
          property={purchaseProperty}
          onClose={() => setPurchaseProperty(null)}
        />
      )}

      {/* New Property Details Form (shown after picking a point on the map) */}
      <AnimatePresence>
        {newPropCoords && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border-2 border-amber-400/50 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-amber-400" /> Yeni Mülk Ekle
                </h3>
                <button
                  onClick={() => setNewPropCoords(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[11px] font-semibold text-slate-500">
                Konum: {newPropCoords.lat.toFixed(4)}, {newPropCoords.lng.toFixed(4)}
              </p>

              <form onSubmit={handleCreatePropertySubmit} className="space-y-3 text-left">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Mülk Adı</label>
                  <input
                    type="text"
                    value={newPropTitle}
                    onChange={(e) => setNewPropTitle(e.target.value)}
                    placeholder="Örn: Boğaz Manzaralı Daire"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Adres</label>
                  <input
                    type="text"
                    value={newPropAddress}
                    onChange={(e) => setNewPropAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tür</label>
                    <select
                      value={newPropType}
                      onChange={(e) => setNewPropType(e.target.value as 'RESIDENTIAL' | 'COMMERCIAL')}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="RESIDENTIAL">Konut</option>
                      <option value="COMMERCIAL">Ticari</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">İlan Türü</label>
                    <select
                      value={newPropListingMode}
                      onChange={(e) => setNewPropListingMode(e.target.value as 'SALE' | 'RENT')}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="SALE">Satılık</option>
                      <option value="RENT">Kiralık</option>
                    </select>
                  </div>
                </div>

                {newPropListingMode === 'SALE' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Satış Fiyatı (₺)</label>
                    <input
                      type="number"
                      min="0"
                      value={newPropPrice}
                      onChange={(e) => setNewPropPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Aylık Kira (₺)</label>
                    <input
                      type="number"
                      min="0"
                      value={newPropRentalPrice}
                      onChange={(e) => setNewPropRentalPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                <Button
                  variant="gold"
                  type="submit"
                  className="w-full py-3 text-xs font-black shadow-lg shadow-amber-500/20 mt-1"
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" /> Haritaya Ekle
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
