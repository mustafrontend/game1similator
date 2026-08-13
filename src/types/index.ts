export type EducationLevel = 'HIGH_SCHOOL' | 'BACHELOR' | 'MASTER';
export type UserStatus = 'OFFLINE' | 'ONLINE' | 'ON_SHIFT';

export interface User {
  id: string;
  email: string;
  username: string;
  health: number;
  happiness: number;
  energy: number;
  credit_score: number;
  reputation: number;
  level?: number;
  education_level: EducationLevel;
  title: string;
  status: UserStatus;
  created_at?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  cash_balance: number;
  bank_balance: number;
  total_liquid: number;
  is_joint: boolean;
  partner_user_id?: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  transaction_type: 'INCOME' | 'EXPENSE';
  description?: string;
  created_at: string;
}

export interface SocialLoan {
  id: string;
  lender_id: string;
  borrower_id: string;
  principal_amount: number;
  remaining_amount: number;
  interest_rate: number;
  due_date: string;
  matures_at: number;
  status: 'PENDING' | 'ACTIVE' | 'REPAID' | 'DEFAULTED';
  last_reminder_sent_at?: string;
}

export interface ExpenseItem {
  id: string;
  user_id: string;
  title: string;
  category: string;
  amount: number;
  due_date: string;
  auto_pay: boolean;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export interface Property {
  id: string;
  title: string;
  property_type: 'LAND' | 'RESIDENTIAL' | 'COMMERCIAL';
  latitude: number;
  longitude: number;
  address_name?: string;
  price: number;
  rental_yield_per_tick: number;
  maintenance_condition: number;
  owner_id?: string | null;
  tenant_id?: string | null;
  is_for_sale: boolean;
  is_for_rent: boolean;
  rental_price: number;
}

export interface PaintBodyDetails {
  hood: string; // Motor Kaputu
  roof: string; // Tavan
  left_front_fender: string; // Sol Ön Çamurluk
  right_front_fender: string; // Sağ Ön Çamurluk
  front_bumper: string; // Ön Tampon
  rear_bumper: string; // Arka Tampon
}

export interface VehicleInspection {
  engine_hp_percentage: number;
  transmission_score: number;
  brake_suspension_score: number;
  verified_km: number;
  tramer_damage_cost: number; // Tramer Hasar Kaydı Tutar (₺)
  has_heavy_damage: boolean; // Pert / Ağır Hasar Kaydı
  paint_body_details: PaintBodyDetails;
  has_passed: boolean;
  report_date: string;
}

export interface Vehicle {
  id: string;
  brand_model: string;
  vehicle_type: 'CAR' | 'MOTORCYCLE';
  price: number;
  daily_rental_price: number;
  condition_percentage: number;
  has_insurance: boolean;
  tramer_damage_cost?: number;
  has_heavy_damage?: boolean;
  owner_id?: string | null;
  renter_id?: string | null;
  is_for_sale: boolean;
  is_for_rent: boolean;
  inspection?: VehicleInspection;
}

export interface AIFinancialRecommendation {
  category: 'CASH_FLOW' | 'INVESTMENT' | 'HEALTH' | 'CAREER';
  title: string;
  advice: string;
}

export interface MarketOffer {
  id: string;
  asset_type: 'VEHICLE' | 'PROPERTY';
  asset_id: string;
  asset_title: string;
  offer_amount: number;
  buyer_name: string;
  is_online_player: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  company_name: string;
  salary_per_tick: number;
  exp_per_tick: number;
  required_education: EducationLevel;
  required_reputation: number;
  min_health_req: number;
  min_happiness_req: number;
  is_eligible?: boolean;
}

export interface UserJob {
  id: string;
  user_id: string;
  job_id: string;
  shift_started_at?: string;
  accumulated_exp: number;
  shift_state: 'IDLE' | 'ON_SHIFT';
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  asset_type: 'STOCK' | 'CRYPTO';
  current_price: number;
  prev_price: number;
  change_24h: number;
}

export interface UserPortfolio {
  id: string;
  user_id: string;
  asset_id: string;
  quantity: number;
  avg_buy_price: number;
  asset?: Asset;
  current_val?: number;
  profit_loss?: number;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_username: string;
  receiver_id?: string;
  region_code?: string;
  chat_type: 'DM' | 'REGION' | 'GLOBAL';
  content: string;
  created_at: string;
}
