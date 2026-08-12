# 📱 VIRTUAL LIFE - APPLE APP STORE & CODEMAGIC RELEASES GUIDE

Bu rehber, **Virtual Life & Economy Simulation** uygulamasını Apple App Store'a yüklemek için gerekli **Bundle ID, Sürüm, Gizlilik Sözleşmesi, In-App Purchase (IAP) ve Codemagic CI/CD yapılandırma** detaylarını içerir.

---

## 🆔 1. Uygulama Kimlik Bilgileri (App Specifications)

| Parametre | Değer | Açıklama |
|---|---|---|
| **App Name** | `Virtual Life` | App Store'da görünecek resmi isim |
| **Subtitle** | `Sanal Yaşam & Ekonomi Simülasyonu` | Max 30 karakter slogan |
| **Bundle Identifier (App ID)** | `com.virtuallife.simulator` | Apple Developer portalında açılacak Identifier |
| **SKU** | `virtuallife_ios_v1` | Özel stok kod tanımı |
| **Primary Category** | `Games` -> `Simulation` | Ana Kategori |
| **Secondary Category** | `Games` -> `Strategy` / `Role Playing` | Yan Kategori |
| **Version Number** | `1.0.0` | İlk yayın sürümü |
| **Build Number** | `100` (Codemagic otomatik artırır) | Dahili derleme numarası |

---

## 🔒 2. App Store Gizlilik & Uyumluluk Beyanları (Privacy Guidelines 5.1.1)

1. **User Account Deletion (Guideline 5.1.1)**:
   - **Konum**: Profilim -> *Kritik Hesap İşlemi (App Store Uyumluluğu)* -> *Hesabımı Kalıcı Olarak Sil*.
   - Kullanıcı tüm verilerini uygulama içinden tek tıkla silebilir.
2. **Push Notification Permissions (Guideline 5.1.1)**:
   - Uygulama ilk açılışta kullanıcının rızasını alan `NotificationPermissionModal` açar.
3. **In-App Purchase (IAP / RevenueCat Sync)**:
   - Profilim -> * Apple Hesabımı Yükle* ve *Satın Alımları Geri Yükle (Restore Purchases)* mevcuttur.

---

## ⚡ 3. Codemagic CI/CD Otomatik Derleme Yapılandırması (`codemagic.yaml`)

Codemagic panelinde projeyi bağladıktan sonra aşağıdaki adımlar otomatik çalışır:

1. **Workflow Name**: `Virtual Life iOS App Store Release`
2. **Instance Type**: `Mac Mini M2` (Xcode 16+)
3. **Environment Variables**:
   - `APP_BUNDLE_ID`: `com.virtuallife.simulator`
   - `CERTIFICATE_PRIVATE_KEY`: Apple Distribution sertifikanız.
   - `APP_STORE_CONNECT_API_KEY`: App Store Connect API anahtarınız.
4. **Build Output**: Otomatik olarak TestFlight'a yüklenir ve `.ipa` çıktısı verilir.

---

## 🚀 4. Git Reposuna Yükleme Komutları

```bash
git init
git add .
git commit -m "feat: Complete App Store release build setup with Codemagic & Capacitor iOS wrapper"
git branch -M main
git remote add origin https://github.com/mustafrontend/game1similator.git
git push -u origin main --force
```
