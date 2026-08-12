import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vehicle, VehicleInspection } from '../../types';
import { useStore } from '../../store/useStore';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, ShieldCheck, Wrench, FileText, Sparkles, AlertOctagon, Car, CheckCircle } from 'lucide-react';

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const VehicleInspectionModal: React.FC<Props> = ({ vehicle, onClose }) => {
  const { vehicles, setVehicles, wallet, setWallet } = useStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<VehicleInspection | undefined>(vehicle?.inspection);

  if (!vehicle) return null;

  const INSPECTION_COST = 2500;

  const handleRunInspection = () => {
    if (!wallet || (wallet.cash_balance + wallet.bank_balance) < INSPECTION_COST) {
      alert('Yetersiz bakiye! Ekspertiz ücreti: ₺2,500');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      if (wallet) {
        setWallet({
          ...wallet,
          cash_balance: wallet.cash_balance - INSPECTION_COST,
          total_liquid: wallet.cash_balance - INSPECTION_COST + wallet.bank_balance
        });
      }

      const generatedReport: VehicleInspection = {
        engine_hp_percentage: Math.floor(92 + Math.random() * 8),
        transmission_score: Math.floor(93 + Math.random() * 7),
        brake_suspension_score: Math.floor(94 + Math.random() * 6),
        verified_km: Math.floor(15000 + Math.random() * 35000),
        tramer_damage_cost: Math.random() > 0.6 ? Math.floor(5000 + Math.random() * 18000) : 0,
        has_heavy_damage: false,
        paint_body_details: {
          hood: 'Orijinal (Hatasız)',
          roof: 'Orijinal (Hatasız)',
          left_front_fender: Math.random() > 0.5 ? 'Lokal Boyalı' : 'Orijinal (Hatasız)',
          right_front_fender: 'Orijinal (Hatasız)',
          front_bumper: 'Boyalı (Çizik Onarımı)',
          rear_bumper: 'Orijinal (Hatasız)'
        },
        has_passed: true,
        report_date: new Date().toISOString().split('T')[0]
      };

      const updatedVehicles = vehicles.map(v =>
        v.id === vehicle.id ? { ...v, inspection: generatedReport } : v
      );

      setVehicles(updatedVehicles);
      setReport(generatedReport);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getPaintBadge = (status: string) => {
    if (status.includes('Orijinal') || status.includes('Hatasız')) return <Badge variant="emerald">{status}</Badge>;
    if (status.includes('Lokal') || status.includes('Boyalı')) return <Badge variant="amber">{status}</Badge>;
    return <Badge variant="rose">{status}</Badge>;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 relative text-white my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{vehicle.brand_model}</h3>
                <Badge variant="sky">TRAMER & EKSPERTİZ</Badge>
              </div>
              <p className="text-xs font-semibold text-slate-400">Resmi Yetkili Hasar Kaydı & Kaporta/Boya Ekspertiz Raporu</p>
            </div>
          </div>

          {isAnalyzing ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-sky-400 animate-pulse">
                SBM Tramer Hasar Sorgulaması & Kaporta/Boya Taraması Yapılıyor...
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Motor Dyno testi, şanzıman, şasi ve kilometre orijinalliği kontrol ediliyor.
              </p>
            </div>
          ) : report ? (
            <div className="space-y-4 text-xs font-semibold">
              {/* Tramer Damage & Heavy Damage Status Box */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block text-[11px]">SBM Tramer Hasar Kaydı:</span>
                  <strong className={`text-sm font-black ${report.tramer_damage_cost === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {report.tramer_damage_cost === 0 ? '₺0 (Hasar Kaydı Yok - Temiz)' : `₺${report.tramer_damage_cost.toLocaleString('tr-TR')} Hasar Kaydı`}
                  </strong>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Pert / Ağır Hasar:</span>
                  <Badge variant={report.has_heavy_damage ? 'rose' : 'emerald'}>
                    {report.has_heavy_damage ? '🚨 Pert Kayıtlı' : '✅ Temiz (Ağır Hasar Yok)'}
                  </Badge>
                </div>
              </div>

              {/* Dyno & Mechanical Performance Scores */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">Dyno Motor Gücü</span>
                  <strong className="text-emerald-400 font-black text-sm">%{report.engine_hp_percentage} HP</strong>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">Şanzıman / Vites</span>
                  <strong className="text-sky-400 font-black text-sm">%{report.transmission_score} Pekiyi</strong>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">Orijinal KM</span>
                  <strong className="text-amber-400 font-black text-sm">{report.verified_km.toLocaleString()} KM</strong>
                </div>
              </div>

              {/* DETAILED BODY & PAINT CHECKLIST */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5 mb-2 border-b border-slate-800 pb-2">
                  <Car className="w-4 h-4 text-sky-400" /> Kaporta & Boya Ekspertiz Detay Şeması
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl">
                    <span className="text-slate-300 font-bold">Motor Kaputu:</span>
                    {getPaintBadge(report.paint_body_details.hood)}
                  </div>

                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl">
                    <span className="text-slate-300 font-bold">Tavan:</span>
                    {getPaintBadge(report.paint_body_details.roof)}
                  </div>

                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl">
                    <span className="text-slate-300 font-bold">Sol Ön Çamurluk:</span>
                    {getPaintBadge(report.paint_body_details.left_front_fender)}
                  </div>

                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl">
                    <span className="text-slate-300 font-bold">Sağ Ön Çamurluk:</span>
                    {getPaintBadge(report.paint_body_details.right_front_fender)}
                  </div>

                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl">
                    <span className="text-slate-300 font-bold">Ön Tampon:</span>
                    {getPaintBadge(report.paint_body_details.front_bumper)}
                  </div>

                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl">
                    <span className="text-slate-300 font-bold">Arka Tampon:</span>
                    {getPaintBadge(report.paint_body_details.rear_bumper)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Ekspertiz Tarihi: <strong className="text-white">{report.report_date}</strong></span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Garanti Onaylı Ruhsat Kaydı
                </span>
              </div>

              <Button variant="outline" className="w-full mt-2" onClick={onClose}>
                Raporu Kapat
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs font-semibold text-slate-300 space-y-2">
                <p className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Neden Detaylı Ekspertiz Yaptırmalısınız?
                </p>
                <p>• SBM Tramer Hasar kaydı, kaporta boya durumu ve ağır hasar pert geçmişi sorgulanır.</p>
                <p>• Araç ilanlarında <strong>"Ekspertiz Onaylı 🛡️"</strong> rozeti açılır ve satış değeri artar.</p>
                <p>• Ekspertiz Hizmet Bedeli: <strong className="text-amber-400 font-black">₺2,500</strong></p>
              </div>

              <Button variant="secondary" className="w-full py-3" onClick={handleRunInspection}>
                <Wrench className="w-4 h-4 mr-2" /> Ekspertize Sok (₺2,500)
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
