import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GameState, Stock, Business, LuxuryAsset, NewsItem, BusinessUpgrade } from '../types';
import { Capacitor } from '@capacitor/core';

interface GameContextType extends GameState {
  buyStock: (symbol: string, quantity: number) => void;
  sellStock: (symbol: string, quantity: number) => void;
  buyBusiness: (id: string) => void;
  upgradeBusinessLevel: (id: string) => void;
  buyBusinessUpgrade: (businessId: string, upgradeId: string) => void;
  upgradeClick: () => void;
  buyStockForecast: (symbol: string) => void;
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


const generateMockHistory = (initialPrice: number, volatility: number, length = 50): number[] => {
  const history: number[] = [];
  let currentPrice = initialPrice;
  for (let i = 0; i < length; i++) {
    history.push(currentPrice);
    const changePercent = (Math.random() - 0.5) * 2 * volatility;
    currentPrice = Math.max(1, currentPrice * (1 - changePercent));
  }
  return history.reverse();
};

const INITIAL_STOCKS: Stock[] = [
  { id: '1', name: 'Fruit Corp / Фрукт Корп', symbol: 'FRT', price: 150, history: generateMockHistory(150, 0.02), volatility: 0.02 },
  { id: '2', name: 'Macrosoft / Макрософт', symbol: 'MCS', price: 300, history: generateMockHistory(300, 0.015), volatility: 0.015 },
  { id: '3', name: 'Tesler / Теслер', symbol: 'TSL', price: 700, history: generateMockHistory(700, 0.05), volatility: 0.05 },
  { id: '4', name: 'Nebula / Небула', symbol: 'NBL', price: 50, history: generateMockHistory(50, 0.08), volatility: 0.08 },
  { id: '5', name: 'Amaze-on / Амазейзон', symbol: 'AMZ', price: 3200, history: generateMockHistory(3200, 0.025), volatility: 0.025 },
  { id: '6', name: 'Gugle / Гугл', symbol: 'GGL', price: 2800, history: generateMockHistory(2800, 0.012), volatility: 0.012 },
  { id: '7', name: 'BioGen / БиоГен', symbol: 'BIO', price: 180, history: generateMockHistory(180, 0.07), volatility: 0.07 },
  { id: '8', name: 'SolarWave / СоларВейв', symbol: 'SLR', price: 120, history: generateMockHistory(120, 0.045), volatility: 0.045 },
  { id: '9', name: 'SkyLinks / СкайЛинкс', symbol: 'SKY', price: 95, history: generateMockHistory(95, 0.06), volatility: 0.06 },
  { id: '10', name: 'Global Bank / Глобал Банк', symbol: 'BNK', price: 420, history: generateMockHistory(420, 0.018), volatility: 0.018 },
  { id: '11', name: 'Oil King / Нефтяной Король', symbol: 'OIL', price: 80, history: generateMockHistory(80, 0.04), volatility: 0.04 },
  { id: '12', name: 'Gold Reserve / Золотой Резерв', symbol: 'GOLD', price: 1800, history: generateMockHistory(1800, 0.01), volatility: 0.01 },
  { id: '13', name: 'SpaceXtra / СпейсЭкстра', symbol: 'SPX', price: 450, history: generateMockHistory(450, 0.12), volatility: 0.12 },
  { id: '14', name: 'CyberShield / КиберЩит', symbol: 'CYB', price: 210, history: generateMockHistory(210, 0.055), volatility: 0.055 },
  { id: '15', name: 'EcoFood / ЭкоФуд', symbol: 'ECO', price: 65, history: generateMockHistory(65, 0.035), volatility: 0.035 },
];

const INITIAL_BUSINESSES: Business[] = [
  { id: 'b1', name: 'Lemonade Stand / Лимонадный киоск', baseCost: 100, incomePerTick: 1, level: 1, type: 'creation' },
  { id: 'b2', name: 'Local Coffee Shop / Местная кофейня', baseCost: 1000, incomePerTick: 15, level: 1, type: 'acquisition' },
  { id: 'b3', name: 'Tech Startup / Тех-стартап', baseCost: 10000, incomePerTick: 200, level: 1, type: 'creation' },
  { id: 'b4', name: 'Small Factory / Небольшой завод', baseCost: 50000, incomePerTick: 1200, level: 1, type: 'acquisition' },
  { id: 'b5', name: 'Supermarket / Супермаркет', baseCost: 150000, incomePerTick: 4500, level: 1, type: 'acquisition' },
  { id: 'b6', name: 'Construction Company / Строительная компания', baseCost: 500000, incomePerTick: 18000, level: 1, type: 'acquisition' },
  { id: 'b7', name: 'Software House / Софтверная компания', baseCost: 2000000, incomePerTick: 85000, level: 1, type: 'creation' },
  { id: 'b8', name: 'Luxury Hotel / Роскошный отель', baseCost: 10000000, incomePerTick: 450000, level: 1, type: 'acquisition' },
  { id: 'b9', name: 'Cargo Port / Грузовой порт', baseCost: 50000000, incomePerTick: 2500000, level: 1, type: 'acquisition' },
  { id: 'b10', name: 'Global Bank / Глобальный банк', baseCost: 250000000, incomePerTick: 15000000, level: 1, type: 'acquisition' },
];

const INITIAL_LUXURY_ASSETS: LuxuryAsset[] = [
  { id: 'l1', name: 'Mountain Bike / Горный велосипед', cost: 500, category: 'Transport', image: '/images/bike.jpg' },
  { id: 'l2', name: 'Designer Watch / Дизайнерские часы', cost: 2000, category: 'Transport', image: '/images/watch.jpg' },
  { id: 'l3', name: 'Used Sedan / Подержанный седан', cost: 5000, category: 'Transport', image: '/images/sedan.jpg' },
  { id: 'l4', name: 'Diamond Ring / Кольцо с бриллиантом', cost: 15000, category: 'Transport', image: '/images/ring.jpg' },
  { id: 'l13', name: 'Sunflowers Replica / Реплика «Подсолнухов»', cost: 50000, category: 'Art', image: '/images/sunflowers.png' },
  { id: 'l5', name: 'Sports Car / Спорткар', cost: 100000, category: 'Transport', image: '/images/sportscar.jpg' },
  { id: 'l6', name: 'City Apartment / Квартира в городе', cost: 150000, category: 'Real Estate', image: '/images/apartment.jpg' },
  { id: 'l14', name: 'Abstract Art / Абстрактное искусство', cost: 300000, category: 'Art', image: '/images/abstract.png' },
  { id: 'l7', name: 'Luxury Yacht / Роскошная яхта', cost: 500000, category: 'Transport', image: '/images/yacht.jpg' },
  { id: 'l8', name: 'Ocean Penthouse / Пентхаус у океана', cost: 1000000, category: 'Real Estate', image: '/images/penthouse.jpg' },
  { id: 'l15', name: 'Electric Hypercar / Электрический гиперкар', cost: 2500000, category: 'Transport', image: '/images/hypercar.png' },
  { id: 'l16', name: 'Suburban Mansion / Загородное поместье', cost: 3500000, category: 'Real Estate', image: '/images/mansion.png' },
  { id: 'l9', name: 'Luxury Villa / Роскошная вилла', cost: 5000000, category: 'Real Estate', image: '/images/villa.jpg' },
  { id: 'l17', name: 'Luxury Helicopter / Роскошный вертолет', cost: 8000000, category: 'Transport', image: '/images/helicopter.png' },
  { id: 'l10', name: 'Private Jet / Личный самолет', cost: 25000000, category: 'Transport', image: '/images/jet.jpg' },
  { id: 'l18', name: 'Medieval Castle / Средневековый замок', cost: 45000000, category: 'Real Estate', image: '/images/castle.png' },
  { id: 'l11', name: 'Superyacht / Суперяхта', cost: 100000000, category: 'Transport', image: '/images/superyacht.jpg' },
  { id: 'l12', name: 'Private Island / Частный остров', cost: 500000000, category: 'Real Estate', image: '/images/island.jpg' },
];

export const BUSINESS_UPGRADES: { [businessId: string]: BusinessUpgrade[] } = {
  b1: [
    { id: 'b1_u1', nameRu: 'Фирменный рецепт', nameEn: 'Secret Recipe', cost: 150, incomeMultiplier: 0.5, descriptionRu: 'Секретная смесь лимонов увеличивает доход на 50%', descriptionEn: 'Secret lemon mix increases income by 50%' },
    { id: 'b1_u2', nameRu: 'Лед и мята', nameEn: 'Ice & Mint', cost: 500, incomeMultiplier: 1.0, descriptionRu: 'Освежающие добавки удваивают продажи в жару (+100%)', descriptionEn: 'Refreshing add-ons double sales in hot weather (+100%)' },
    { id: 'b1_u3', nameRu: 'Уличный зазывала', nameEn: 'Street Promoter', cost: 1500, incomeMultiplier: 1.5, descriptionRu: 'Привлекает толпы новых клиентов (+150%)', descriptionEn: 'Attracts crowds of new customers (+150%)' }
  ],
  b2: [
    { id: 'b2_u1', nameRu: 'Премиальная арабика', nameEn: 'Premium Arabica', cost: 1500, incomeMultiplier: 0.5, descriptionRu: 'Кофе высшего сорта привлекает гурманов (+50%)', descriptionEn: 'Top-grade coffee beans attract connoisseurs (+50%)' },
    { id: 'b2_u2', nameRu: 'Пекарский уголок', nameEn: 'Pastry Corner', cost: 4000, incomeMultiplier: 1.0, descriptionRu: 'Круассаны и донаты увеличивают средний чек (+100%)', descriptionEn: 'Croissants and donuts increase average bill (+100%)' },
    { id: 'b2_u3', nameRu: 'Кофе-машина La Marzocco', nameEn: 'La Marzocco Espresso Machine', cost: 12000, incomeMultiplier: 2.0, descriptionRu: 'Ускоряет обслуживание клиентов и улучшает вкус (+200%)', descriptionEn: 'Speeds up customer service and improves taste (+200%)' }
  ],
  b3: [
    { id: 'b3_u1', nameRu: 'Мобильное приложение', nameEn: 'Mobile App', cost: 15000, incomeMultiplier: 0.6, descriptionRu: 'Выход на мобильные платформы увеличивает аудиторию (+60%)', descriptionEn: 'Launching on mobile platforms increases audience by 60%' },
    { id: 'b3_u2', nameRu: 'Интеграция ИИ-помощника', nameEn: 'AI Assistant Integration', cost: 45000, incomeMultiplier: 1.2, descriptionRu: 'Автоматизация поддержки и персонализация сервиса (+120%)', descriptionEn: 'Automated support and personalized services (+120%)' },
    { id: 'b3_u3', nameRu: 'Выход на международный рынок', nameEn: 'Global Scaling', cost: 120000, incomeMultiplier: 2.5, descriptionRu: 'Локализация и запуск рекламы в США и ЕС (+250%)', descriptionEn: 'Localization and marketing campaign in US and EU (+250%)' }
  ],
  b4: [
    { id: 'b4_u1', nameRu: 'Автоматизация конвейера', nameEn: 'Conveyor Automation', cost: 75000, incomeMultiplier: 0.5, descriptionRu: 'Снижает издержки производства и ускоряет выпуск (+50%)', descriptionEn: 'Reduces production costs and speeds up output (+50%)' },
    { id: 'b4_u2', nameRu: 'Роботизированные манипуляторы', nameEn: 'Robotic Arms', cost: 200000, incomeMultiplier: 1.0, descriptionRu: 'Круглосуточная работа с идеальной точностью (+100%)', descriptionEn: '24/7 manufacturing with perfect precision (+100%)' },
    { id: 'b4_u3', nameRu: 'Собственная логистическая сеть', nameEn: 'In-House Logistics', cost: 600000, incomeMultiplier: 1.8, descriptionRu: 'Снижает расходы на доставку сырья и готовых товаров (+180%)', descriptionEn: 'Cuts expenses on raw materials and delivery (+180%)' }
  ],
  b5: [
    { id: 'b5_u1', nameRu: 'Кассы самообслуживания', nameEn: 'Self-Checkout Terminals', cost: 200000, incomeMultiplier: 0.4, descriptionRu: 'Сокращают очереди и увеличивают пропускную способность (+40%)', descriptionEn: 'Reduce queues and increase shop throughput (+40%)' },
    { id: 'b5_u2', nameRu: 'Собственная пекарня в зале', nameEn: 'In-Store Bakery', cost: 500000, incomeMultiplier: 0.8, descriptionRu: 'Запах свежего хлеба заставляет покупать больше (+80%)', descriptionEn: 'Smell of fresh bread drives impulsive purchases (+80%)' },
    { id: 'b5_u3', nameRu: 'Экспресс-доставка за 15 минут', nameEn: '15-Min Delivery App', cost: 1500000, incomeMultiplier: 2.0, descriptionRu: 'Захват рынка онлайн-заказов продуктов (+200%)', descriptionEn: 'Capture the online grocery delivery market (+200%)' }
  ],
  b6: [
    { id: 'b6_u1', nameRu: 'Строительство жилых комплексов', nameEn: 'Residential Buildings', cost: 800000, incomeMultiplier: 0.6, descriptionRu: 'Возведение многоэтажных домов комфорт-класса (+60%)', descriptionEn: 'Construction of comfort-class multi-family apartments (+60%)' },
    { id: 'b6_u2', nameRu: 'Строительство бизнес-центров', nameEn: 'Business Centers', cost: 2500000, incomeMultiplier: 1.2, descriptionRu: 'Проектирование и постройка современных офисов класса А (+120%)', descriptionEn: 'Design and construction of modern Class-A offices (+120%)' },
    { id: 'b6_u3', nameRu: 'Государственные контракты', nameEn: 'Government Infrastructure Contracts', cost: 7500000, incomeMultiplier: 2.5, descriptionRu: 'Строительство мостов, стадионов и дорог (+250%)', descriptionEn: 'Building stadiums, bridges, and highways (+250%)' }
  ],
  b7: [
    { id: 'b7_u1', nameRu: 'SaaS-платформа по подписке', nameEn: 'SaaS Subscription Model', cost: 3000000, incomeMultiplier: 0.5, descriptionRu: 'Регулярные платежи от тысяч компаний (+50%)', descriptionEn: 'Recurring payments from thousands of corporate customers (+50%)' },
    { id: 'b7_u2', nameRu: 'Кибербезопасность корпоративного уровня', nameEn: 'Enterprise Cyber Security', cost: 8000000, incomeMultiplier: 1.0, descriptionRu: 'Защита данных крупных клиентов, работа с госсектором (+100%)', descriptionEn: 'Data protection for enterprise and government clients (+100%)' },
    { id: 'b7_u3', nameRu: 'Глобальные продажи Enterprise', nameEn: 'Global Enterprise Sales', cost: 25000000, incomeMultiplier: 2.0, descriptionRu: 'Сделки на миллионы долларов с лидерами рынка (+200%)', descriptionEn: 'Multi-million dollar deals with industry leaders (+200%)' }
  ],
  b8: [
    { id: 'b8_u1', nameRu: 'Мишленовский ресторан', nameEn: 'Michelin Star Restaurant', cost: 15000000, incomeMultiplier: 0.4, descriptionRu: 'Привлекает элитных гостей со всего мира (+40%)', descriptionEn: 'Attracts elite diners and wealthy guests worldwide (+40%)' },
    { id: 'b8_u2', nameRu: 'Элитный спа-комплекс', nameEn: 'Premium Spa & Wellness', cost: 40000000, incomeMultiplier: 0.8, descriptionRu: 'Водолечение и массаж премиум-класса (+80%)', descriptionEn: 'High-end therapeutic treatments (+80%)' },
    { id: 'b8_u3', nameRu: 'Вертолетная площадка на крыше', nameEn: 'Rooftop Helipad', cost: 100000000, incomeMultiplier: 1.8, descriptionRu: 'VIP-трансфер для самых богатых клиентов (+180%)', descriptionEn: 'VIP helicopter shuttle service for elite clients (+180%)' }
  ],
  b9: [
    { id: 'b9_u1', nameRu: 'Таможенный хаб', nameEn: 'Customs Logistics Hub', cost: 80000000, incomeMultiplier: 0.5, descriptionRu: 'Ускоренное оформление грузов на месте (+50%)', descriptionEn: 'On-site fast-track cargo clearance and inspection (+50%)' },
    { id: 'b9_u2', nameRu: 'Глубоководный причал', nameEn: 'Deep-Water Pier', cost: 200000000, incomeMultiplier: 1.0, descriptionRu: 'Возможность принимать крупнейшие грузовые супертанкеры (+100%)', descriptionEn: 'Allows accommodating the largest cargo supertankers (+100%)' },
    { id: 'b9_u3', nameRu: 'Автоматизация терминала ИИ', nameEn: 'AI-Driven Container Terminal', cost: 600000000, incomeMultiplier: 2.0, descriptionRu: 'Беспилотное перемещение контейнеров 24/7 (+200%)', descriptionEn: 'Autonomous container stacking and routing 24/7 (+200%)' }
  ],
  b10: [
    { id: 'b10_u1', nameRu: 'Премиальные кредитные карты', nameEn: 'Premium Credit Cards', cost: 400000000, incomeMultiplier: 0.4, descriptionRu: 'Уникальные привилегии и высокие комиссии с транзакций (+40%)', descriptionEn: 'Exclusive privileges and high transaction fees (+40%)' },
    { id: 'b10_u2', nameRu: 'Управление крупным капиталом (Private Banking)', nameEn: 'Private Wealth Management', cost: 1000000000, incomeMultiplier: 0.9, descriptionRu: 'Инвестиции и управление активами мультимиллионеров (+90%)', descriptionEn: 'Asset management for ultra-high-net-worth individuals (+90%)' },
    { id: 'b10_u3', nameRu: 'Собственная космическая платежная система', nameEn: 'Space Payment Network', cost: 3000000000, incomeMultiplier: 2.2, descriptionRu: 'Платежные шлюзы для орбитальных и лунных колоний (+220%)', descriptionEn: 'Payment gateways for orbital and lunar colonies (+220%)' }
  ]
};

export const getBusinessTaxRate = (baseCost: number): number => {
  if (baseCost >= 250000000) return 0.20; // 20% for Global Bank
  if (baseCost >= 10000000) return 0.15;  // 15% for luxury hotels / cargo ports
  if (baseCost >= 50000) return 0.10;     // 10% for medium businesses
  return 0.05;                            // 5% for small businesses
};

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
  businessStates: {},
  clickLevel: 1,
  activeForecasts: {},
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
          const mergedLuxuryAssets = INITIAL_LUXURY_ASSETS;
          const mergedStocks = (data.stocks || INITIAL_STOCKS).map((stock: any) => {
            const initial = INITIAL_STOCKS.find(s => s.symbol === stock.symbol);
            let history = Array.isArray(stock.history) ? stock.history : [];
            if (history.length < 50) {
              const needed = 50 - history.length;
              const startVal = history[0] || stock.price;
              const mockPad = generateMockHistory(startVal, initial?.volatility || 0.03, needed + 1);
              history = [...mockPad.slice(0, -1), ...history];
            }
            return {
              ...stock,
              history: history,
              volatility: initial?.volatility || stock.volatility || 0.03
            };
          });
          const mergedBusinessStates = data.businessStates || {};
          const ownedBizes = data.ownedBusinesses || [];
          ownedBizes.forEach((id: string) => {
            if (!mergedBusinessStates[id]) {
              mergedBusinessStates[id] = { level: 1, upgrades: [] };
            }
          });
          setState({
            ...data,
            businessStates: mergedBusinessStates,
            clickLevel: data.clickLevel || 1,
            activeForecasts: data.activeForecasts || {},
            luxuryAssets: mergedLuxuryAssets,
            stocks: mergedStocks
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
      
      const nextForecasts = { ...prev.activeForecasts };

      const newStocks = prev.stocks.map((stock) => {
        let volatility = stock.volatility;
        let trend = 0;

        const forecast = nextForecasts[stock.symbol];
        let hasForecast = false;

        if (forecast && forecast.ticksLeft > 0) {
          hasForecast = true;
          trend = forecast.direction === 'up' ? 0.045 : -0.045;
          nextForecasts[stock.symbol] = {
            ...forecast,
            ticksLeft: forecast.ticksLeft - 1
          };
          if (nextForecasts[stock.symbol].ticksLeft <= 0) {
            delete nextForecasts[stock.symbol];
          }
        }

        if (!hasForecast && currentEvent && ticksLeft <= 12 && ticksLeft > 0) {
          if (!currentEvent.impactSymbol || currentEvent.impactSymbol === stock.symbol) {
            trend = currentEvent.impactType === 'positive' ? 0.03 : -0.03;
            volatility *= currentEvent.impactMultiplier;
          }
        }

        const baseDrift = (volatility * volatility) / 2 + 0.001; // Offset volatility drag and add a slight positive growth trend
        let randomFactor = (Math.random() - 0.5) * 2 * volatility;
        if (hasForecast) {
          if (forecast.direction === 'up') {
            randomFactor = (Math.random() - 0.15) * 1.3 * volatility;
          } else {
            randomFactor = (Math.random() - 0.85) * 1.3 * volatility;
          }
        }

        // Find the base price of the stock from INITIAL_STOCKS to calculate deviation
        const initialStock = INITIAL_STOCKS.find(s => s.symbol === stock.symbol);
        const basePrice = initialStock ? initialStock.price : 100;
        
        // Logarithm of ratio of current price to base price
        const logRatio = Math.log(stock.price / basePrice);
        
        // Quadratic mean reversion: when near base price, pull is negligible.
        // As it deviates more, pull grows quadratically to act as a soft boundary.
        const meanReversionDrift = -0.008 * logRatio * Math.abs(logRatio);

        const changePercent = randomFactor + trend + baseDrift + meanReversionDrift;
        const newPrice = Math.max(1, stock.price * (1 + changePercent));
        const newHistory = [...stock.history, newPrice].slice(-50);
        return { ...stock, price: newPrice, history: newHistory };
      });

      let totalBusinessGross = 0;
      let totalTaxPaid = 0;

      prev.ownedBusinesses.forEach((bId) => {
        const business = prev.businesses.find((b) => b.id === bId);
        if (!business) return;
        const bizState = (prev.businessStates && prev.businessStates[bId]) || { level: 1, upgrades: [] };
        const levelMultiplier = Math.pow(1.3, bizState.level - 1);
        const upgradesList = BUSINESS_UPGRADES[bId] || [];
        const upgradesMultiplier = bizState.upgrades.reduce((sum, upId) => {
          const upgradeObj = upgradesList.find(u => u.id === upId);
          return sum + (upgradeObj ? upgradeObj.incomeMultiplier : 0);
        }, 1.0);
        const grossIncome = Math.round(business.incomePerTick * levelMultiplier * upgradesMultiplier);
        const taxRate = getBusinessTaxRate(business.baseCost);
        const tax = Math.round(grossIncome * taxRate);
        
        totalBusinessGross += grossIncome;
        totalTaxPaid += tax;
      });

      const passiveIncome = totalBusinessGross - totalTaxPaid;
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
        activeForecasts: nextForecasts
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
      const initialStates = prev.businessStates || {};
      return { 
        ...prev, 
        cash: prev.cash - business.baseCost, 
        ownedBusinesses: [...prev.ownedBusinesses, id],
        businessStates: {
          ...initialStates,
          [id]: { level: 1, upgrades: [] }
        }
      };
    });
  };

  const upgradeBusinessLevel = (id: string) => {
    setState((prev) => {
      const business = prev.businesses.find((b) => b.id === id);
      if (!business || !prev.ownedBusinesses.includes(id)) return prev;
      
      const bizStates = prev.businessStates || {};
      const bizState = bizStates[id] || { level: 1, upgrades: [] };
      const currentLevel = bizState.level;
      
      // Cap business level at 20
      if (currentLevel >= 20) return prev;
      
      // Calculate level upgrade cost: baseCost * (1.6 ^ level)
      const upgradeCost = Math.round(business.baseCost * Math.pow(1.6, currentLevel));
      
      if (prev.cash < upgradeCost) return prev;
      
      const updatedStates = { ...bizStates };
      updatedStates[id] = {
        ...bizState,
        level: currentLevel + 1
      };
      
      return {
        ...prev,
        cash: prev.cash - upgradeCost,
        businessStates: updatedStates
      };
    });
  };

  const buyBusinessUpgrade = (businessId: string, upgradeId: string) => {
    setState((prev) => {
      const business = prev.businesses.find((b) => b.id === businessId);
      if (!business || !prev.ownedBusinesses.includes(businessId)) return prev;
      
      const upgrades = BUSINESS_UPGRADES[businessId] || [];
      const upgrade = upgrades.find((u) => u.id === upgradeId);
      if (!upgrade || prev.cash < upgrade.cost) return prev;
      
      const bizStates = prev.businessStates || {};
      const bizState = bizStates[businessId] || { level: 1, upgrades: [] };
      if (bizState.upgrades.includes(upgradeId)) return prev; // already bought
      
      const updatedStates = { ...bizStates };
      updatedStates[businessId] = {
        ...bizState,
        upgrades: [...bizState.upgrades, upgradeId]
      };
      
      return {
        ...prev,
        cash: prev.cash - upgrade.cost,
        businessStates: updatedStates
      };
    });
  };

  const upgradeClick = () => {
    setState((prev) => {
      const clickLvl = prev.clickLevel || 1;
      const upgradeCost = Math.round(100 * Math.pow(1.8, clickLvl - 1));
      if (prev.cash < upgradeCost) return prev;
      return {
        ...prev,
        cash: prev.cash - upgradeCost,
        clickLevel: clickLvl + 1
      };
    });
  };

  const buyStockForecast = (symbol: string) => {
    setState((prev) => {
      const stock = prev.stocks.find((s) => s.symbol === symbol);
      if (!stock) return prev;
      
      // Forecast cost: 3 times the stock price, minimum $100
      const cost = Math.max(100, Math.round(stock.price * 3));
      if (prev.cash < cost) return prev;
      
      const forecasts = prev.activeForecasts || {};
      // 65% chance of growth, 35% decline
      const direction: 'up' | 'down' = Math.random() > 0.35 ? 'up' : 'down';
      
      const updatedForecasts = {
        ...forecasts,
        [symbol]: {
          direction,
          ticksLeft: 15
        }
      };
      
      const newsItem: NewsItem = {
        ru: `[АНАЛИТИКА]: Получен прогноз для ${stock.symbol}. Ожидается ${direction === 'up' ? 'рост' : 'падение'} актива.`,
        en: `[ANALYTICS]: Forecast purchased for ${stock.symbol}. ${direction === 'up' ? 'Growth' : 'Decline'} expected.`
      };
      const updatedNews = [newsItem, ...prev.news].slice(0, 5);
      
      return {
        ...prev,
        cash: prev.cash - cost,
        activeForecasts: updatedForecasts,
        news: updatedNews
      };
    });
  };

  const buyLuxuryAsset = (id: string) => {
    setState((prev) => {
      const asset = prev.luxuryAssets.find((a) => a.id === id);
      if (!asset || prev.cash < asset.cost || prev.ownedLuxuryAssets.includes(id)) return prev;
      return { ...prev, cash: prev.cash - asset.cost, ownedLuxuryAssets: [...prev.ownedLuxuryAssets, id] };
    });
  };

  const addCash = (amount: number) => setState(prev => {
    // Scale clicker earnings with clickLevel
    const reward = amount === 10 ? (10 + ((prev.clickLevel || 1) - 1) * 15) : amount;
    return { ...prev, cash: prev.cash + reward };
  });
  const resetGame = () => setState(INITIAL_STATE);
  const setLanguage = (lang: 'ru' | 'en') => setState(prev => ({ ...prev, language: lang }));

  return (
    <GameContext.Provider value={{ ...state, buyStock, sellStock, buyBusiness, upgradeBusinessLevel, buyBusinessUpgrade, upgradeClick, buyStockForecast, buyLuxuryAsset, addCash, resetGame, setLanguage, user, login, logout, serverUrl, setServerUrl }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame must be used within a GameProvider');
  return context;
};
