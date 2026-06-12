import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GameState, Stock, Business, LuxuryAsset, NewsItem } from '../types';
import { Capacitor } from '@capacitor/core';

interface GameContextType extends GameState {
  buyStock: (symbol: string, quantity: number) => void;
  sellStock: (symbol: string, quantity: number) => void;
  buyBusiness: (id: string) => void;
  buyLuxuryAsset: (id: string) => void;
  addCash: (amount: number) => void;
  resetGame: () => void;
  setLanguage: (lang: 'ru' | 'en') => void;
  user: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  serverUrl: string;
  setServerUrl: (url: string) => void;
}


const INITIAL_STOCKS: Stock[] = [
  { id: '1', name: 'Fruit Corp / Фрукт Корп', symbol: 'FRT', price: 150, history: [150], volatility: 0.02 },
  { id: '2', name: 'Macrosoft / Макрософт', symbol: 'MCS', price: 300, history: [300], volatility: 0.015 },
  { id: '3', name: 'Tesler / Теслер', symbol: 'TSL', price: 700, history: [700], volatility: 0.05 },
  { id: '4', name: 'Nebula / Небула', symbol: 'NBL', price: 50, history: [50], volatility: 0.08 },
  { id: '5', name: 'Amaze-on / Амазейзон', symbol: 'AMZ', price: 3200, history: [3200], volatility: 0.025 },
  { id: '6', name: 'Gugle / Гугл', symbol: 'GGL', price: 2800, history: [2800], volatility: 0.012 },
  { id: '7', name: 'BioGen / БиоГен', symbol: 'BIO', price: 180, history: [180], volatility: 0.07 },
  { id: '8', name: 'SolarWave / СоларВейв', symbol: 'SLR', price: 120, history: [120], volatility: 0.045 },
  { id: '9', name: 'SkyLinks / СкайЛинкс', symbol: 'SKY', price: 95, history: [95], volatility: 0.06 },
  { id: '10', name: 'Global Bank / Глобал Банк', symbol: 'BNK', price: 420, history: [420], volatility: 0.018 },
  { id: '11', name: 'Oil King / Нефтяной Король', symbol: 'OIL', price: 80, history: [80], volatility: 0.04 },
  { id: '12', name: 'Gold Reserve / Золотой Резерв', symbol: 'GOLD', price: 1800, history: [1800], volatility: 0.01 },
  { id: '13', name: 'SpaceXtra / СпейсЭкстра', symbol: 'SPX', price: 450, history: [450], volatility: 0.12 },
  { id: '14', name: 'CyberShield / КиберЩит', symbol: 'CYB', price: 210, history: [210], volatility: 0.055 },
  { id: '15', name: 'EcoFood / ЭкоФуд', symbol: 'ECO', price: 65, history: [65], volatility: 0.035 },
];

const INITIAL_BUSINESSES: Business[] = [
  { id: 'b1', name: 'Lemonade Stand / Лимонадный киоск', baseCost: 100, incomePerTick: 1, level: 1, type: 'creation' },
  { id: 'b2', name: 'Local Coffee Shop / Местная кофейня', baseCost: 1000, incomePerTick: 15, level: 1, type: 'acquisition' },
  { id: 'b3', name: 'Tech Startup / Тех-стартап', baseCost: 10000, incomePerTick: 200, level: 1, type: 'creation' },
  { id: 'b4', name: 'Small Factory / Небольшой завод', baseCost: 50000, incomePerTick: 1200, level: 1, type: 'acquisition' },
  { id: 'b5', name: 'Supermarket / Супермаркет', baseCost: 150000, incomePerTick: 4500, level: 1, type: 'acquisition' },
  { id: 'b6', name: 'Retail Chain / Сеть магазинов', baseCost: 500000, incomePerTick: 18000, level: 1, type: 'acquisition' },
  { id: 'b7', name: 'Software House / Софтверная компания', baseCost: 2000000, incomePerTick: 85000, level: 1, type: 'creation' },
  { id: 'b8', name: 'Luxury Hotel / Роскошный отель', baseCost: 10000000, incomePerTick: 450000, level: 1, type: 'acquisition' },
  { id: 'b9', name: 'Cargo Port / Грузовой порт', baseCost: 50000000, incomePerTick: 2500000, level: 1, type: 'acquisition' },
  { id: 'b10', name: 'Global Bank / Глобальный банк', baseCost: 250000000, incomePerTick: 15000000, level: 1, type: 'acquisition' },
];

const INITIAL_LUXURY_ASSETS: LuxuryAsset[] = [
  { id: 'l1', name: 'Mountain Bike / Горный велосипед', cost: 500, category: 'Transport', image: '/images/bike.png' },
  { id: 'l2', name: 'Designer Watch / Дизайнерские часы', cost: 2000, category: 'Transport', image: '/images/watch.jpg' },
  { id: 'l3', name: 'Used Sedan / Подержанный седан', cost: 5000, category: 'Transport', image: '/images/sedan.jpg' },
  { id: 'l4', name: 'Diamond Ring / Кольцо с бриллиантом', cost: 15000, category: 'Transport', image: '/images/ring.jpg' },
  { id: 'l5', name: 'Sports Car / Спорткар', cost: 100000, category: 'Transport', image: '/images/sportscar.png' },
  { id: 'l6', name: 'City Apartment / Квартира в городе', cost: 150000, category: 'Real Estate', image: '/images/apartment.jpg' },
  { id: 'l7', name: 'Luxury Yacht / Роскошная яхта', cost: 500000, category: 'Transport', image: '/images/yacht.png' },
  { id: 'l8', name: 'Ocean Penthouse / Пентхаус у океана', cost: 1000000, category: 'Real Estate', image: '/images/penthouse.jpg' },
  { id: 'l9', name: 'Luxury Villa / Роскошная вилла', cost: 5000000, category: 'Real Estate', image: '/images/villa.png' },
  { id: 'l10', name: 'Private Jet / Личный самолет', cost: 25000000, category: 'Transport', image: '/images/jet.png' },
  { id: 'l11', name: 'Superyacht / Суперяхта', cost: 100000000, category: 'Transport', image: '/images/superyacht.png' },
  { id: 'l12', name: 'Private Island / Частный остров', cost: 500000000, category: 'Real Estate', image: '/images/island.png' },
];

interface NewsEvent {
  id: string;
  messageEn: string;
  messageRu: string;
  impactSymbol?: string;
  impactType: 'positive' | 'negative' | 'neutral';
  impactMultiplier: number;
}

const NEWS_EVENTS: NewsEvent[] = [
  { id: 'e1', messageEn: "BREAKING: AI breakthrough expected to boost tech sector tomorrow!", messageRu: "СРОЧНО: Прорыв в ИИ завтра поднимет тех-сектор!", impactType: 'positive', impactMultiplier: 1.3 },
  { id: 'e2', messageEn: "Oil supply disruption feared in the coming hours.", messageRu: "Ожидаются перебои с поставками нефти в ближайшие часы.", impactSymbol: 'OIL', impactType: 'positive', impactMultiplier: 1.6 },
  { id: 'e3', messageEn: "Analysts predict upcoming struggle for Fruit Corp.", messageRu: "Аналитики предсказывают трудности для Фрукт Корп.", impactSymbol: 'FRT', impactType: 'negative', impactMultiplier: 0.75 },
  { id: 'e4', messageEn: "Rumors: New tax on small businesses coming soon.", messageRu: "Слухи: Скоро введут новый налог на малый бизнес.", impactType: 'negative', impactMultiplier: 0.85 },
  { id: 'e5', messageEn: "Tesler to announce a secret project shortly.", messageRu: "Теслер скоро анонсирует секретный проект.", impactSymbol: 'TSL', impactType: 'positive', impactMultiplier: 1.45 },
  { id: 'e6', messageEn: "Global Mars landing mission preparing for launch.", messageRu: "Готовится запуск глобальной миссии по высадке на Марс.", impactSymbol: 'SPX', impactType: 'positive', impactMultiplier: 2.5 },
  { id: 'e7', messageEn: "Signs of economic cooling appearing.", messageRu: "Появляются признаки охлаждения экономики.", impactType: 'negative', impactMultiplier: 0.8 },
  { id: 'e8', messageEn: "Inflation report due soon, investors nervous.", messageRu: "Скоро отчет по инфляции, инвесторы нервничают.", impactType: 'negative', impactMultiplier: 0.9 },
  { id: 'e9', messageEn: "Geopolitical tensions rising, gold expected to jump.", messageRu: "Геополитическая напряженность растет, ожидается скачок золота.", impactSymbol: 'GOLD', impactType: 'positive', impactMultiplier: 1.15 },
];

const INITIAL_STATE: GameState = {
  cash: 1000,
  netWorth: 1000,
  stocks: INITIAL_STOCKS,
  ownedStocks: {},
  businesses: INITIAL_BUSINESSES,
  ownedBusinesses: [],
  luxuryAssets: INITIAL_LUXURY_ASSETS,
  ownedLuxuryAssets: [],
  tick: 0,
  news: [{ ru: "Добро пожаловать!", en: "Welcome!" }],
  language: 'ru',
  activeEvent: null,
  eventTicksLeft: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('username'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [serverUrl, setServerUrlState] = useState<string>(() => {
    const override = localStorage.getItem('server_url_override');
    if (override) return override;
    const stored = localStorage.getItem('server_url');
    if (stored) return stored;
    return Capacitor.isNativePlatform() ? 'https://investment-simulator-l4dr.onrender.com' : '';
  });

  const setServerUrl = (url: string) => {
    localStorage.setItem('server_url_override', url);
    setServerUrlState(url);
  };

  useEffect(() => {
    const GITHUB_CONFIG_URL = 'https://raw.githubusercontent.com/imax21457-design/investment-simulator/main/server_url.json';
    
    fetch(GITHUB_CONFIG_URL)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch remote server config');
        return res.json();
      })
      .then(data => {
        if (data && data.url) {
          console.log('Dynamic server URL loaded from GitHub:', data.url);
          localStorage.setItem('server_url', data.url);
          const override = localStorage.getItem('server_url_override');
          if (!override) {
            setServerUrlState(data.url);
          }
        }
      })
      .catch(err => {
        console.warn('Could not fetch remote server config, using fallback:', err);
      });
  }, []);

  const apiUrl = serverUrl ? `${serverUrl}/api` : '/api';

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    setState(INITIAL_STATE);
  }, []);

  useEffect(() => {
    if (token) {
      fetch(`${apiUrl}/game-state`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid token or session expired');
        }
        return res.json();
      })
      .then(data => {
        if (data === null || data === undefined) {
          // New user with no saved progress yet. Keep default INITIAL_STATE.
          return;
        }
        if (typeof data === 'object' && 'cash' in data) {
          const mergedLuxuryAssets = (data.luxuryAssets || INITIAL_LUXURY_ASSETS).map((asset: any) => {
            const staticAsset = INITIAL_LUXURY_ASSETS.find(a => a.id === asset.id);
            return { ...asset, image: staticAsset?.image };
          });
          setState({
            ...data,
            luxuryAssets: mergedLuxuryAssets
          });
        } else {
          throw new Error('Invalid game state format received');
        }
      })
      .catch(err => {
        console.error("Failed to load state, logging out:", err);
        logout();
      });
    }
  }, [token, logout, apiUrl]);

  useEffect(() => {
    if (token && state.tick > 0 && state.tick % 10 === 0) {
      fetch(`${apiUrl}/game-state`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
    }
  }, [state.tick, token, state, apiUrl]);


  const updatePrices = useCallback(() => {
    setState((prev) => {
      let activeEventId = prev.activeEvent;
      let ticksLeft = prev.eventTicksLeft;
      let newNews = [...prev.news];

      // Randomly trigger market-impacting news event
      if (!activeEventId && Math.random() < 0.05) {
        const event = NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)];
        activeEventId = event.id;
        ticksLeft = 15; 
        const msg: NewsItem = {
          ru: `[РЫНОК]: ${event.messageRu}`,
          en: `[MARKET]: ${event.messageEn}`
        };
        newNews = [msg, ...newNews].slice(0, 5);
      } else if (Math.random() < 0.1) {
        const fluffRu = ["Аналитики обсуждают новые тренды года.", "Инвесторы следят за открытием торгов в Азии.", "Эксперты советуют диверсифицировать портфель.", "Центральный банк сохраняет ставку без изменений.", "Популярность пассивного дохода продолжает расти."];
        const fluffEn = ["Analysts are discussing new trends of the year.", "Investors are watching Asian markets opening.", "Experts advise on portfolio diversification.", "Central bank keeps interest rate unchanged.", "Popularity of passive income continues to grow."];
        const randomIndex = Math.floor(Math.random() * fluffRu.length);
        const msg: NewsItem = {
          ru: fluffRu[randomIndex],
          en: fluffEn[randomIndex]
        };
        const latest = newNews[0];
        const isDuplicate = latest && (typeof latest === 'string' ? latest === msg.ru || latest === msg.en : latest.ru === msg.ru);
        if (!isDuplicate) {
          newNews = [msg, ...newNews].slice(0, 5);
        }
      }

      const currentEvent = NEWS_EVENTS.find(e => e.id === activeEventId);
      
      const newStocks = prev.stocks.map((stock) => {
        let volatility = stock.volatility;
        let trend = 0;
        if (currentEvent && ticksLeft <= 12 && ticksLeft > 0) {
          if (!currentEvent.impactSymbol || currentEvent.impactSymbol === stock.symbol) {
            trend = currentEvent.impactType === 'positive' ? 0.03 : -0.03;
            volatility *= currentEvent.impactMultiplier;
          }
        }
        const changePercent = (Math.random() - 0.5) * 2 * volatility + trend;
        const newPrice = Math.max(1, stock.price * (1 + changePercent));
        const newHistory = [...stock.history, newPrice].slice(-20);
        return { ...stock, price: newPrice, history: newHistory };
      });

      const passiveIncome = prev.ownedBusinesses.reduce((acc, bId) => {
        const business = prev.businesses.find((b) => b.id === bId);
        return acc + (business?.incomePerTick || 0);
      }, 0);

      const newCash = prev.cash + passiveIncome;

      const stocksValue = Object.entries(prev.ownedStocks).reduce((acc, [symbol, qty]) => {
        const stock = newStocks.find((s) => s.symbol === symbol);
        return acc + (stock?.price || 0) * qty;
      }, 0);

      return {
        ...prev,
        cash: newCash,
        stocks: newStocks,
        netWorth: newCash + stocksValue,
        tick: prev.tick + 1,
        news: newNews,
        activeEvent: ticksLeft > 1 ? activeEventId : null,
        eventTicksLeft: Math.max(0, ticksLeft - 1),
      };
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(updatePrices, 1000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  const login = (newToken: string, username: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
    setToken(newToken);
    setUser(username);
  };


  const buyStock = (symbol: string, quantity: number) => {
    setState((prev) => {
      const stock = prev.stocks.find((s) => s.symbol === symbol);
      if (!stock || prev.cash < stock.price * quantity) return prev;
      return { ...prev, cash: prev.cash - stock.price * quantity, ownedStocks: { ...prev.ownedStocks, [symbol]: (prev.ownedStocks[symbol] || 0) + quantity } };
    });
  };

  const sellStock = (symbol: string, quantity: number) => {
    setState((prev) => {
      const stock = prev.stocks.find((s) => s.symbol === symbol);
      const owned = prev.ownedStocks[symbol] || 0;
      if (!stock || owned < quantity) return prev;
      return { ...prev, cash: prev.cash + stock.price * quantity, ownedStocks: { ...prev.ownedStocks, [symbol]: owned - quantity } };
    });
  };

  const buyBusiness = (id: string) => {
    setState((prev) => {
      const business = prev.businesses.find((b) => b.id === id);
      if (!business || prev.cash < business.baseCost || prev.ownedBusinesses.includes(id)) return prev;
      return { ...prev, cash: prev.cash - business.baseCost, ownedBusinesses: [...prev.ownedBusinesses, id] };
    });
  };

  const buyLuxuryAsset = (id: string) => {
    setState((prev) => {
      const asset = prev.luxuryAssets.find((a) => a.id === id);
      if (!asset || prev.cash < asset.cost || prev.ownedLuxuryAssets.includes(id)) return prev;
      return { ...prev, cash: prev.cash - asset.cost, ownedLuxuryAssets: [...prev.ownedLuxuryAssets, id] };
    });
  };

  const addCash = (amount: number) => setState(prev => ({ ...prev, cash: prev.cash + amount }));
  const resetGame = () => setState(INITIAL_STATE);
  const setLanguage = (lang: 'ru' | 'en') => setState(prev => ({ ...prev, language: lang }));

  return (
    <GameContext.Provider value={{ ...state, buyStock, sellStock, buyBusiness, buyLuxuryAsset, addCash, resetGame, setLanguage, user, login, logout, serverUrl, setServerUrl }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame must be used within a GameProvider');
  return context;
};
