import { LanguageCode } from './translations';

interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  rateFromTRY: number; // Conversion rate relative to TRY (₺1.0)
}

export const CURRENCY_MAP: Record<LanguageCode, CurrencyConfig> = {
  tr: { code: 'TRY', symbol: '₺', locale: 'tr-TR', rateFromTRY: 1.0 },
  en: { code: 'USD', symbol: '$', locale: 'en-US', rateFromTRY: 1 / 35.0 }, // $1 = 35 TL
  de: { code: 'EUR', symbol: '€', locale: 'de-DE', rateFromTRY: 1 / 38.0 }, // €1 = 38 TL
  fr: { code: 'EUR', symbol: '€', locale: 'fr-FR', rateFromTRY: 1 / 38.0 },
  es: { code: 'EUR', symbol: '€', locale: 'es-ES', rateFromTRY: 1 / 38.0 },
  it: { code: 'EUR', symbol: '€', locale: 'it-IT', rateFromTRY: 1 / 38.0 },
  pt: { code: 'EUR', symbol: '€', locale: 'pt-PT', rateFromTRY: 1 / 38.0 },
  ru: { code: 'RUB', symbol: '₽', locale: 'ru-RU', rateFromTRY: 2.6 },   // 1 TL = 2.6 Ruble
  ar: { code: 'USD', symbol: '$', locale: 'ar-SA', rateFromTRY: 1 / 35.0 },
  zh: { code: 'CNY', symbol: '¥', locale: 'zh-CN', rateFromTRY: 1 / 4.8 },  // 1 CNY = 4.8 TL
  ja: { code: 'JPY', symbol: '¥', locale: 'ja-JP', rateFromTRY: 4.3 },    // 1 TL = 4.3 Yen
  ko: { code: 'KRW', symbol: '₩', locale: 'ko-KR', rateFromTRY: 38.0 },   // 1 TL = 38 Won
};

export const formatCurrencyByLanguage = (amountInTRY: number, lang: LanguageCode): string => {
  const config = CURRENCY_MAP[lang] || CURRENCY_MAP['tr'];
  const convertedAmount = amountInTRY * config.rateFromTRY;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: config.code === 'JPY' || config.code === 'KRW' ? 0 : 2,
    }).format(convertedAmount);
  } catch (e) {
    return `${config.symbol}${convertedAmount.toFixed(2)}`;
  }
};
