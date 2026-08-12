import { User, Wallet, Property, Vehicle, Job, Asset, SocialLoan, Transaction, UserPortfolio } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api/v1';

export class ApiService {
  private static getHeaders(token?: string) {
    const activeToken = token || localStorage.getItem('virtual_life_token');
    return {
      'Content-Type': 'application/json',
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
    };
  }

  public static async register(email: string, username: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, username, password })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Kayıt olunamadı.' }));
      throw new Error(err.message || 'Kayıt işlemi başarısız.');
    }
    return response.json();
  }

  public static async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Giriş yapılamadı.' }));
      throw new Error(err.message || 'Giriş işlemi başarısız.');
    }
    return response.json();
  }

  public static async getMe(): Promise<{ user: User; wallet: Wallet }> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Oturum bilgisi alınamadı.');
    }
    return response.json();
  }

  public static async getMapProperties(): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/real-estate/map-properties`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Harita mülkleri yüklenemedi.');
    }
    const data = await response.json();
    return data.properties || [];
  }

  public static async getVehicles(): Promise<Vehicle[]> {
    const response = await fetch(`${API_BASE_URL}/real-estate/vehicles`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Araç pazarı verileri yüklenemedi.');
    }
    const data = await response.json();
    return data.vehicles || [];
  }

  public static async getCareerOpportunities(): Promise<Job[]> {
    const response = await fetch(`${API_BASE_URL}/career/opportunities`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Kariyer fırsatları yüklenemedi.');
    }
    const data = await response.json();
    return data.jobs || [];
  }

  public static async getInvestmentMarket(): Promise<Asset[]> {
    const response = await fetch(`${API_BASE_URL}/investment/market`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Piyasa varlıkları yüklenemedi.');
    }
    const data = await response.json();
    return data.assets || [];
  }

  public static async getUserPortfolio(): Promise<UserPortfolio[]> {
    const response = await fetch(`${API_BASE_URL}/investment/portfolio`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Kullanıcı portföyü yüklenemedi.');
    }
    const data = await response.json();
    return data.portfolio || [];
  }

  public static async buyAsset(symbol: string, amountTotal: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/investment/buy`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ symbol, amount_total: amountTotal })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Varlık satın alınamadı.' }));
      throw new Error(err.message);
    }
    return response.json();
  }

  public static async sellAsset(symbol: string, quantity: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/investment/sell`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ symbol, quantity })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Varlık satılamadı.' }));
      throw new Error(err.message);
    }
    return response.json();
  }

  public static async getLeaderboard(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/social/leaderboard`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Liderlik tablosu yüklenemedi.');
    }
    const data = await response.json();
    return data.leaderboard || [];
  }

  public static async getUndergroundMarketData(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/underground/market-data`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Yeraltı pazarı verileri yüklenemedi.');
    }
    return response.json();
  }

  public static async buyProperty(propertyId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/real-estate/buy-property`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ property_id: propertyId })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Mülk satın alınamadı.' }));
      throw new Error(err.message);
    }
    return response.json();
  }

  public static async startShift(jobId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/career/start-shift`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ job_id: jobId })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Mesaiye başlanamadı.' }));
      throw new Error(err.message);
    }
    return response.json();
  }
}
