import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { LANGUAGES, LanguageCode } from '../../i18n/translations';
import { Globe, Check, X } from 'lucide-react';
import { Button } from '../atoms/Button';

export const LanguageSelectModal: React.FC = () => {
  const { language, setLanguage, isLanguageModalOpen, setIsLanguageModalOpen, addToast } = useStore();

  if (!isLanguageModalOpen) return null;

  const handleSelectLanguage = (code: LanguageCode, nativeName: string) => {
    setLanguage(code);
    setIsLanguageModalOpen(false);
    
    addToast({
      type: 'success',
      title: 'Language Updated / Dil Güncellendi 🌐',
      message: `Selected Language: ${nativeName}`
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-400/50 relative text-white my-auto text-center max-h-[90vh] overflow-y-auto scrollbar-none"
        >
          {/* CLOSE BUTTON (If user manually reopens modal) */}
          <button
            onClick={() => setIsLanguageModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* HEADER BRAND & GLOBE ICON */}
          <div className="flex flex-col items-center justify-center pt-2 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30 animate-pulse">
              <Globe className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              🌐 Select Language / Dilinizi Seçin
            </h2>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              Please select your preferred language to enjoy Virtual Life.
            </p>
          </div>

          {/* 12-LANGUAGES GRID WITH COUNTRY FLAGS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code, lang.nativeName)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50'
                      : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <p className="text-xs font-black text-white leading-none">{lang.nativeName}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{lang.code}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <Button
            variant="gold"
            className="w-full py-3 text-xs font-black shadow-lg shadow-amber-500/30"
            onClick={() => setIsLanguageModalOpen(false)}
          >
            Confirm & Start Playing / Devam Et
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
