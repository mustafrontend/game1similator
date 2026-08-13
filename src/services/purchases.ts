import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_IOS_API_KEY as string | undefined;

let configured = false;

export const isPurchasesAvailable = () => Capacitor.isNativePlatform() && !!REVENUECAT_API_KEY;

const unavailableError = () =>
  new Error('Satın alma bu ortamda kullanılamıyor. App Store Connect ürünleri ve RevenueCat API anahtarı yapılandırılmış gerçek bir iOS cihazda deneyin.');

export async function initPurchases(appUserID?: string): Promise<void> {
  if (!isPurchasesAvailable() || configured) return;
  await Purchases.configure({ apiKey: REVENUECAT_API_KEY!, appUserID: appUserID ?? null });
  configured = true;
}

export async function purchaseProductById(productId: string) {
  if (!isPurchasesAvailable()) throw unavailableError();

  const { products } = await Purchases.getProducts({ productIdentifiers: [productId] });
  const product = products[0];
  if (!product) {
    throw new Error(`Ürün RevenueCat/App Store Connect üzerinde bulunamadı: ${productId}`);
  }

  const result = await Purchases.purchaseStoreProduct({ product });
  return result.customerInfo;
}

export async function restoreRealPurchases() {
  if (!isPurchasesAvailable()) throw unavailableError();

  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
}
