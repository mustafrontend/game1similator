import { MarketOffer, Vehicle, Property } from '../types';

const AI_TOKEN = import.meta.env.VITE_AI_TOKEN || 'virtual_life_ai_token_placeholder';

export class AIService {
  private static token: string = AI_TOKEN;

  public static getToken(): string {
    return this.token;
  }

  /**
   * Generates intelligent offline AI Bot market offers for vehicles & properties
   */
  public static generateOfflineOffer(asset: Vehicle | Property): MarketOffer {
    const isVehicle = 'brand_model' in asset;
    const basePrice = asset.price;
    // Calculate intelligent offer (+- 10% of market value)
    const variation = (Math.random() * 0.2) - 0.05; // -5% to +15%
    const offerAmount = Math.round(basePrice * (1 + variation));

    const botNames = ['CyberBot_AI', 'NecoAI_Trader', 'AutoDeal_Bot', 'VipInvestor_AI', 'ShadowTrader_99'];
    const randomBot = botNames[Math.floor(Math.random() * botNames.length)];

    return {
      id: 'offer-bot-' + Date.now(),
      asset_type: isVehicle ? 'VEHICLE' : 'PROPERTY',
      asset_id: asset.id,
      asset_title: isVehicle ? (asset as Vehicle).brand_model : (asset as Property).title,
      offer_amount: offerAmount,
      buyer_name: `🤖 ${randomBot}`,
      is_online_player: false,
      status: 'PENDING',
      created_at: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
  }

  /**
   * Financial Emergency Consultation Assistant
   */
  public static getFinancialAdvice(health: number, happiness: number, energy: number, liquidMoney: number): string {
    if (health < 25) {
      return '❤️ Sağlığınız Kritik! Hemen Mağaza veya Finans ekranından %33 (1/3) Servet ödemesi yaparak VIP Hastane Ameliyatı olun veya $1.99 İksir paketi satın alın.';
    }
    if (happiness < 25) {
      return '😃 Mutluluğunuz Düşük! Maldivler VIP Tatili satın alarak pasif emlak/borsa karlarınızdaki %50 ceza kesintisini kaldırın.';
    }
    if (energy < 25) {
      return '⚡ Enerjiniz Düşük! VIP Enerji Serumu alarak iş başvuruları ve vardiya çalışmasını tekrar aktif edin.';
    }
    if (liquidMoney < 0) {
      return '⚠️ KMH Eksi Bakiyedesiniz! Yeraltı Piyasasındaki Panama Offshore hesabınızdan bakiyeyi cüzdana çekin veya garajınızdaki araçları kiraya verin.';
    }
    return '✅ Finansal ve Yaşamsal Durumunuz Mükemmel! Borsa ve Gayrimenkul yatırımlarına devam edebilirsiniz.';
  }
}
