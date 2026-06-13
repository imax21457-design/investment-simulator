export interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  history: number[];
  volatility: number;
}

export interface Business {
  id: string;
  name: string;
  baseCost: number;
  incomePerTick: number;
  level: number;
  type: 'creation' | 'acquisition';
}

export interface BusinessUpgrade {
  id: string;
  nameRu: string;
  nameEn: string;
  cost: number;
  incomeMultiplier: number;
  descriptionRu: string;
  descriptionEn: string;
}

export interface LuxuryAsset {
  id: string;
  name: string;
  cost: number;
  category: 'Real Estate' | 'Transport' | 'Art';
  image?: string;
}

export interface NewsItem {
  ru: string;
  en: string;
}

export interface GameState {
  cash: number;
  netWorth: number;
  stocks: Stock[];
  ownedStocks: { [symbol: string]: number }; // symbol -> quantity
  businesses: Business[];
  ownedBusinesses: string[]; // ids
  businessStates?: { [id: string]: { level: number; upgrades: string[] } };
  clickLevel?: number;
  activeForecasts?: { [symbol: string]: { direction: 'up' | 'down'; ticksLeft: number } };
  luxuryAssets: LuxuryAsset[];
  ownedLuxuryAssets: string[]; // ids
  tick: number;
  news: (string | NewsItem)[];
  language: 'ru' | 'en';
  activeEvent: string | null; // id or null
  eventTicksLeft: number;
}
