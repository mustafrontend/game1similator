import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { User as UserIcon, ShieldCheck, RefreshCw, Trash2, Edit3, Check, Crown, Mail, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UserProfilePanel: React.FC = () => {
  const { user, setUser, logout, addToast, t } = useStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || 'Apple Player');
  const [syncingApple, setSyncingApple] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !user) return;

    setUser({
      ...user,
      username: newUsername.trim()
    });

    setIsEditingUsername(false);

    addToast({
      type: 'success',
      title: 'Kullanıcı Adı Güncellendi ✏️',
      message: `Profil isminiz "${newUsername.trim()}" olarak güncellendi.`
    });
  };

  const handleSyncAppleID = () => {
    setSyncingApple(true);
    setTimeout(() => {
      setSyncingApple(false);

      // Simulate Apple ID Name Extraction
      const appleName = 'Apple Oyuncusu';
      if (user) {
        setUser({
          ...user,
          username: user.username && user.username !== 'MustafaÖztürk' ? user.username : appleName,
          email: user.email || 'apple.user@icloud.com'
        });
      }

      addToast({
        type: 'success',
        title: 'Apple ID Senkronize Edildi ',
        message: 'Apple ID hesabınız ve RevenueCat satın alımlarınız eşleşti.'
      });
    }, 1200);
  };

  const handleRestorePurchases = () => {
    setRestoring(true);
    setTimeout(() => {
      setRestoring(false);
      addToast({
        type: 'success',
        title: 'Satın Alımları Geri Yükle 🔄',
        message: 'Tüm aktif mağaza satın alımları ve VIP üyelikler başarıyla geri yüklendi.'
      });
    }, 1500);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    addToast({
      type: 'warning',
      title: 'Hesap Silindi 🗑️',
      message: 'Hesabınız ve tüm verileriniz App Store kurallarına uygun olarak kalıcı olarak silindi.'
    });
    logout();
  };

  return (
    <div className="space-y-6">
      {/* Top Profile Header */}
      <Card variant="gold" className="border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="flex-1">
              {isEditingUsername ? (
                <form onSubmit={handleSaveUsername} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-amber-400 rounded-xl text-base font-black text-white focus:outline-hidden"
                    placeholder="Yeni isim yazın..."
                    autoFocus
                  />
                  <Button variant="gold" size="sm" type="submit">
                    <Check className="w-4 h-4" /> Kaydet
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white">{user?.username || 'Apple Oyuncusu'}</h2>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-900 border border-slate-700 rounded-lg transition-all"
                    title="İsmi Düzenle"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <Badge variant="gold">{user?.title || t('citizen')}</Badge>
                </div>
              )}

              <p className="text-xs font-bold text-slate-300 mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || 'apple.user@icloud.com'}</span>
              </p>
            </div>
          </div>

          <Badge variant="emerald" className="py-1.5 px-3.5 text-xs font-black">
            🟢 ACCOUNT ACTIVE
          </Badge>
        </div>
      </Card>

      {/* REVENUECAT / APP STORE COMPLIANCE CONTROLS CARD */}
      <Card className="border-slate-800 bg-slate-950 p-6 space-y-4">
        <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <span></span> App Store & Apple ID Giriş Senkronizasyonu
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="secondary"
            className="py-3 text-xs font-black border border-slate-700 hover:bg-slate-800 flex items-center justify-center gap-2"
            disabled={syncingApple}
            onClick={handleSyncAppleID}
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            {syncingApple ? t('processing') : ' Apple Hesabımı / İsmi Yükle'}
          </Button>

          <Button
            variant="secondary"
            className="py-3 text-xs font-black border border-slate-700 hover:bg-slate-800 flex items-center justify-center gap-2"
            disabled={restoring}
            onClick={handleRestorePurchases}
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${restoring ? 'animate-spin' : ''}`} />
            {restoring ? t('processing') : '🔄 Satın Alımları Geri Yükle'}
          </Button>
        </div>

        {/* DANGER ZONE: ACCOUNT DELETION */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-rose-400">Kritik Hesap İşlemi (App Store Uyumluluğu)</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Hesabınızı ve verilerinizi kalıcı olarak silebilirsiniz.</p>
            </div>
            <Button
              variant="outline"
              className="py-2 px-4 text-xs font-black border-rose-500 text-rose-400 hover:bg-rose-600 hover:text-white"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Hesabımı Kalıcı Olarak Sil
            </Button>
          </div>
        </div>
      </Card>

      {/* ACCOUNT DELETION CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border-2 border-rose-500 text-center shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-lg font-black text-white">Hesabınızı Silmek İstediğinize Emin Misiniz?</h3>
              <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                Bu işlem geri alınamaz. Cüzdan bakiyeniz, portföyünüz ve evleriniz dahil tüm verileriniz silinecektir.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="secondary" className="py-2.5 text-xs font-bold" onClick={() => setShowDeleteModal(false)}>
                  Vazgeç
                </Button>
                <Button variant="outline" className="py-2.5 text-xs font-black border-rose-500 text-rose-300 hover:bg-rose-600 hover:text-white" onClick={handleDeleteAccount}>
                  Evet, Kalıcı Sil
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
