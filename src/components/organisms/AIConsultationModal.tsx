import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { ApiService } from '../../services/api';
import { AIFinancialRecommendation } from '../../types';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, Bot, Sparkles, TrendingUp, Lightbulb, Zap, Heart, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_STYLES: Record<AIFinancialRecommendation['category'], { icon: React.ReactNode; border: string; label: string }> = {
  CASH_FLOW: { icon: <Lightbulb className="w-4 h-4 text-amber-400" />, border: 'border-sky-500/40', label: 'Nakit Akışı' },
  INVESTMENT: { icon: <TrendingUp className="w-4 h-4 text-purple-400" />, border: 'border-purple-500/40', label: 'Yatırım' },
  HEALTH: { icon: <Heart className="w-4 h-4 text-rose-400" />, border: 'border-emerald-500/40', label: 'Sağlık & Yaşam' },
  CAREER: { icon: <Zap className="w-4 h-4 text-amber-400" />, border: 'border-amber-500/40', label: 'Kariyer' }
};

export const AIConsultationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, wallet, properties, vehicles, socialLoans } = useStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<AIFinancialRecommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const myVehicles = vehicles.filter(v => v.owner_id === 'apple-revcat-user-1001');
  const myProperties = properties.filter(p => p.owner_id === 'apple-revcat-user-1001');
  const unrentedVehicles = myVehicles.filter(v => !v.is_for_rent);
  const vacantProperties = myProperties.filter(p => !p.is_for_rent && !p.tenant_id);
  const activeDebtsOwed = socialLoans.borrowed.reduce((sum, l) => sum + l.remaining_amount, 0);

  const handleRunAIConsultation = async () => {
    setIsAnalyzing(true);
    setError(null);
    setRecommendations(null);

    try {
      const result = await ApiService.getAIFinancialAdvice({
        cash_balance: wallet?.cash_balance || 0,
        bank_balance: wallet?.bank_balance || 0,
        total_liquid: wallet?.total_liquid || 0,
        credit_score: user?.credit_score || 1000,
        reputation: user?.reputation || 0,
        education_level: user?.education_level || 'BACHELOR',
        health: user?.health ?? 100,
        happiness: user?.happiness ?? 100,
        energy: user?.energy ?? 100,
        vehicle_count: myVehicles.length,
        unrented_vehicle_count: unrentedVehicles.length,
        property_count: myProperties.length,
        vacant_property_count: vacantProperties.length,
        active_debts_owed: activeDebtsOwed
      });
      setRecommendations(result);
    } catch (err: any) {
      setError(err.message || 'AI danışmanlık tavsiyesi alınamadı.');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
                <Badge variant="gold">Claude ile Çalışır</Badge>
              </div>
              <p className="text-xs font-semibold text-slate-400">
                "Şu anki durumumu kurtarmak ve servetimi artırmak için ne yapabilirim?"
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold rounded-xl text-left">
              ⚠️ {error}
            </div>
          )}

          {!recommendations && !isAnalyzing ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 text-xs font-semibold text-slate-300">
                <p className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" /> AI Analizi Neleri İnceler?
                </p>
                <p>• <strong>Mevcut Nakit & Banka Bakiyeniz:</strong> {wallet ? formatCurrency(wallet.total_liquid) : '₺0'}</p>
                <p>• <strong>Findeks Kredi Skorunuz:</strong> {user?.credit_score || 1000} Puan (Kredi Çekme Limiti)</p>
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
                <span>AI Analizi Başarıyla Tamamlandı!</span>
              </div>

              {/* AI-GENERATED RECOMMENDATIONS */}
              <div className="space-y-3">
                {recommendations && recommendations.length > 0 ? (
                  recommendations.map((rec, idx) => {
                    const style = CATEGORY_STYLES[rec.category] || CATEGORY_STYLES.CASH_FLOW;
                    return (
                      <div key={idx} className={`p-4 bg-slate-950 rounded-2xl border space-y-1.5 ${style.border}`}>
                        <div className="flex items-center gap-2">
                          {style.icon}
                          <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">{style.label}: {rec.title}</h4>
                        </div>
                        <p className="text-xs font-semibold text-slate-300">{rec.advice}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs font-semibold text-slate-400 text-center py-4">Şu an için özel bir tavsiye bulunamadı — finansal durumunuz gayet dengeli görünüyor.</p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <Button variant="outline" className="w-full" onClick={handleRunAIConsultation}>
                  Yeniden Analiz Et
                </Button>
                <Button variant="gold" className="w-full" onClick={onClose}>
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
