import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { AIService } from '../../services/aiService';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, Bot, Sparkles, TrendingUp, Lightbulb, ShieldCheck, Zap, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AIConsultationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, wallet, properties, vehicles, socialLoans } = useStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [adviceGenerated, setAdviceGenerated] = useState(false);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const handleRunAIConsultation = () => {
    setIsAnalyzing(true);
    setAdviceGenerated(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAdviceGenerated(true);
    }, 1800);
  };

  const myVehicles = vehicles.filter(v => v.owner_id === 'demo-user-1');
  const myProperties = properties.filter(p => p.owner_id === 'demo-user-1');
  const unrentedVehicles = myVehicles.filter(v => !v.is_for_rent);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden text-white my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-tr from-sky-500 to-indigo-600 border border-sky-400/40 text-white rounded-2xl shadow-lg shadow-sky-500/30">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">Yapay Zeka (AI) Yaşam & Finans Danışmanı</h3>
                <Badge variant="gold">AI TOKEN AKTİF 🤖</Badge>
              </div>
              <p className="text-xs font-semibold text-slate-400">
                "Şu anki durumumu kurtarmak ve servetimi artırmak için ne yapabilirim?"
              </p>
            </div>
          </div>

          {!adviceGenerated && !isAnalyzing ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 text-xs font-semibold text-slate-300">
                <p className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" /> AI Simülasyon Analizi Neleri İnceler?
                </p>
                <p>• <strong>Mevcut Nakit & Banka Bakiyeniz:</strong> {wallet ? formatCurrency(wallet.total_liquid) : '₺0'}</p>
                <p>• <strong>Findeks Kredi Skorunuz:</strong> {user?.credit_score || 1420} Puan (Kredi Çekme Limiti)</p>
                <p>• <strong>Sahip Olduğunuz Mülk & Garaj Filosu:</strong> {myProperties.length} Ev • {myVehicles.length} Araç</p>
                <p>• <strong>Sağlık, Mutluluk & Enerji Değerleri:</strong> %{user?.health.toFixed(0)} Sağlık • %{user?.energy.toFixed(0)} Enerji</p>
              </div>

              <Button
                variant="gold"
                className="w-full py-3 text-sm font-black shadow-lg shadow-amber-500/20"
                onClick={handleRunAIConsultation}
              >
                <Bot className="w-4 h-4 mr-2 animate-bounce" /> AI'ya Sor: Durumumu Nasıl Kurtarabilirim?
              </Button>
            </div>
          ) : isAnalyzing ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-sky-400 animate-pulse">
                Yapay Zeka Simülasyon Verilerinizi Analiz Ediyor...
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Bakiye, Findeks skoru, pasif kira gelirleri ve kariyer adımları optimize ediliyor.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>AI Kurtarma & Gelişim Analizi Başarıyla Tamamlandı!</span>
              </div>

              {/* ACTION PLAN RECOMMENDATIONS */}
              <div className="space-y-3">
                {/* Recommendation 1: Garage Rental Income */}
                {unrentedVehicles.length > 0 && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-sky-500/40 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">1. Garaj Pasif Gelir Fırsatı</h4>
                    </div>
                    <p className="text-xs font-semibold text-slate-300">
                      Garajınızdaki <strong>{unrentedVehicles[0].brand_model}</strong> aracınız şu an boşta park edilmiş durumda. Aracınızı başkasına kiraya vererek günlük <strong className="text-emerald-400">+{formatCurrency(unrentedVehicles[0].daily_rental_price)}</strong> ek pasif nakit elde edebilirsiniz.
                    </p>
                  </div>
                )}

                {/* Recommendation 2: Real Estate Loan Investment */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-purple-500/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-black text-purple-300 uppercase tracking-wide">2. Kredi & Gayrimenkul Yatırımı</h4>
                  </div>
                  <p className="text-xs font-semibold text-slate-300">
                    Findeks skorunuz <strong className="text-purple-400">{user?.credit_score || 1420} Puan</strong> seviyesinde. Bankadan ₺750,000 kredi çekip Levent Plaza'da ticari ofis satın alarak periyodik <strong className="text-amber-400">₺5,000 / tick</strong> kira akışı başlatabilirsiniz.
                  </p>
                </div>

                {/* Recommendation 3: Health & Energy Balance */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wide">3. Sağlık & Enerji Dengesi</h4>
                  </div>
                  <p className="text-xs font-semibold text-slate-300">
                    Mevcut enerjiniz <strong className="text-sky-300">%{user?.energy.toFixed(0)}</strong>. Mesai çalışması yapmadan önce evinizde 1 saat ücretsiz uyuyarak enerjinizi %100'e çıkarın ve maaş kesintisini önleyin.
                  </p>
                </div>

                {/* Recommendation 4: Career Upgrade */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">4. Kariyer & Saygınlık Artışı</h4>
                  </div>
                  <p className="text-xs font-semibold text-slate-300">
                    Diplomanız <strong className="text-sky-300">{user?.education_level}</strong>. NecoAI Labs şirketindeki <strong>Teknoloji Direktörü (CTO)</strong> kadrosuna geçmek için saygınlık puanınızı 1000'e çıkararak maaşınızı periyodik <strong className="text-emerald-400">₺3,500'ye</strong> yükseltebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button variant="outline" className="w-full" onClick={() => setAdviceGenerated(false)}>
                  Yeniden Analiz Et
                </Button>
                <Button variant="gold" className="w-full" onClick={onClose}>
                  Tavsiyeleri Uygula
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
