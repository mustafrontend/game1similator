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
}
