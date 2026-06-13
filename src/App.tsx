import React, { useState } from 'react';
import './App.css';
import { useGame, BUSINESS_UPGRADES, getBusinessTaxRate } from './context/GameContext';

type View = 'dashboard' | 'market' | 'businesses' | 'luxury';

const TRANSLATIONS = {
  ru: {
    title: 'ИнвестСим',
    dashboard: 'Кабинет',
    market: 'Акции',
    businesses: 'Бизнес',
    shop: 'Магазин',
    cash: 'Наличные',
    netWorth: 'Капитал',
    stats: 'Статистика',
    earn: 'Заработать $10',
    latestNews: 'Последние новости',
    portfolio: 'Портфель акций',
    noStocks: 'У вас пока нет акций.',
    reset: 'Сбросить игру',
    resetConfirm: 'Вы уверены, что хотите сбросить весь прогресс?',
    buy: 'Купить',
    sell: 'Продать',
    owned: 'Куплено',
    inStock: 'В наличии',
    income: 'Доход',
    sec: 'сек',
    category: 'Категория',
    realEstate: 'Недвижимость',
    transport: 'Транспорт',
    art: 'Искусство',
    property: 'В собственности',
    purchase: 'Приобрести за',
    lang: 'Язык',
    login: 'Войти',
    register: 'Регистрация',
    username: 'Имя пользователя',
    password: 'Пароль',
    logout: 'Выйти',
    noAccount: 'Нет аккаунта?',
    haveAccount: 'Уже есть аккаунт?',
    welcome: 'Добро пожаловать',
    balance: 'Баланс счета',
    cardHolder: 'ВЛАДЕЛЕЦ КАРТЫ',
    settings: 'Настройки',
    stockDetails: 'Детали акции',
    close: 'Закрыть',
    high: 'Максимум',
    low: 'Минимум',
    avg: 'Средняя',
    volatility: 'Волатильность',
    viewFullChart: 'Смотреть полный график',
    level: 'Уровень',
    upgrades: 'Улучшения',
    upgradeLevel: 'Повысить уровень',
    cost: 'Стоимость',
    nextLevelIncome: 'Доход на след. уровне',
    activeUpgrades: 'Куплено улучшений',
    availableUpgrades: 'Доступные улучшения',
    buyUpgrade: 'Купить',
    alreadyPurchased: 'Куплено',
    businessManagement: 'Управление бизнесом',
    multiplier: 'Множитель',
    upgradeClick: 'Улучшить клик',
    clickLevel: 'Уровень клика',
    earnVal: 'Клик приносит',
    buyForecast: 'Купить прогноз',
    forecastActive: 'Прогноз активен',
    forecastGrowth: '🚀 РОСТ',
    forecastDecline: '📉 ПАДЕНИЕ',
    forecastTimeLeft: 'сек',
    maxLevel: 'МАКС. УРОВЕНЬ',
  },
  en: {
    title: 'InvestSim',
    dashboard: 'Dashboard',
    market: 'Stocks',
    businesses: 'Business',
    shop: 'Shop',
    cash: 'Cash',
    netWorth: 'Net Worth',
    stats: 'Stats',
    earn: 'Earn $10',
    latestNews: 'Latest News',
    portfolio: 'Portfolio',
    noStocks: 'No stocks owned.',
    reset: 'Reset Game',
    resetConfirm: 'Are you sure you want to reset all progress?',
    buy: 'Buy',
    sell: 'Sell',
    owned: 'Owned',
    inStock: 'In Stock',
    income: 'Income',
    sec: 'sec',
    category: 'Category',
    realEstate: 'Real Estate',
    transport: 'Transport',
    art: 'Art',
    property: 'Owned',
    purchase: 'Purchase for',
    lang: 'Language',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    logout: 'Logout',
    noAccount: 'No account?',
    haveAccount: 'Already have an account?',
    welcome: 'Welcome',
    balance: 'Account Balance',
    cardHolder: 'CARD HOLDER',
    settings: 'Settings',
    stockDetails: 'Stock Details',
    close: 'Close',
    high: 'High',
    low: 'Low',
    avg: 'Average',
    volatility: 'Volatility',
    viewFullChart: 'View Full Chart',
    level: 'Level',
    upgrades: 'Upgrades',
    upgradeLevel: 'Upgrade Level',
    cost: 'Cost',
    nextLevelIncome: 'Next Level Income',
    activeUpgrades: 'Upgrades Owned',
    availableUpgrades: 'Available Upgrades',
    buyUpgrade: 'Buy',
    alreadyPurchased: 'Purchased',
    businessManagement: 'Business Management',
    currentLevel: 'Current Level',
    multiplier: 'Multiplier',
    upgradeClick: 'Upgrade Click',
    clickLevel: 'Click Level',
    earnVal: 'Click earns',
    buyForecast: 'Buy Forecast',
    forecastActive: 'Forecast Active',
    forecastGrowth: '🚀 GROWTH',
    forecastDecline: '📉 DECLINE',
    forecastTimeLeft: 'sec',
    maxLevel: 'MAX LEVEL',
  }
};

const Sparkline = ({ history, isUp }: { history: number[]; isUp: boolean }) => {
  if (history.length < 2) return null;
  const sparkHistory = history.slice(-15);
  const min = Math.min(...sparkHistory);
  const max = Math.max(...sparkHistory);
  const range = max - min === 0 ? 1 : max - min;
  
  const width = 100;
  const height = 30;
  
  const points = sparkHistory.map((val, idx) => {
    const x = (idx / (sparkHistory.length - 1)) * width;
    const y = 2 + (height - 4) - ((val - min) / range) * (height - 4);
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = isUp ? '#4ecca3' : '#e94560';

  return (
    <div className="sparkline-container">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};

const StockDetailsModal = ({
  symbol,
  onClose,
  onOpenFullChart,
}: {
  symbol: string;
  onClose: () => void;
  onOpenFullChart: (symbol: string) => void;
}) => {
  const { stocks, ownedStocks, cash, buyStock, sellStock, buyStockForecast, activeForecasts, language } = useGame();
  const stock = stocks.find(s => s.symbol === symbol);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);

  if (!stock) return null;

  const t = TRANSLATIONS[language];
  // In the compact details modal, show the last 20 ticks
  const history = stock.history.slice(-20);
  const isUp = history.length > 1 && stock.price >= history[history.length - 2];
  const color = isUp ? '#4ecca3' : '#e94560';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const getName = (name: string) => {
    const parts = name.split(' / ');
    return language === 'ru' ? (parts[1] || parts[0]) : parts[0];
  };

  const min = Math.min(...history);
  const max = Math.max(...history);
  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  const range = max - min === 0 ? 1 : max - min;

  const width = 500;
  const height = 180;
  const padding = 20;

  const points = history.map((val, idx) => {
    const x = padding + (idx / (history.length - 1)) * (width - padding * 2);
    const y = padding + (height - padding * 2) - ((val - min) / range) * (height - padding * 2);
    return { x, y, val, idx };
  });

  const linePath = points.map(p => `${p.x},${p.y}`).join(' ');

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = `${firstPoint.x},${height - padding} ${linePath} ${lastPoint.x},${height - padding}`;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const innerWidth = rect.width - (padding * 2 * (rect.width / width));
    const startX = padding * (rect.width / width);
    const relativeX = clientX - startX;
    const pct = relativeX / innerWidth;
    const idx = Math.min(
      history.length - 1,
      Math.max(0, Math.round(pct * (history.length - 1)))
    );
    setHoveredIndex(idx);
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
  };

  const startPrice = history[0];
  const endPrice = stock.price;
  const totalChange = endPrice - startPrice;
  const totalChangePercent = (totalChange / startPrice) * 100;

  const statsList = [
    { label: t.high, value: formatCurrency(max) },
    { label: t.low, value: formatCurrency(min) },
    { label: t.avg, value: formatCurrency(avg) },
    { label: t.volatility, value: `${(stock.volatility * 100).toFixed(1)}%` },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="card modal-content stock-details-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
          <div className="modal-title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="stock-symbol-badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{stock.symbol}</span>
            <h3 style={{ margin: 0 }}>{getName(stock.name)}</h3>
          </div>
          <button className="close-modal-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' }}>✕</button>
        </div>

        <div className="modal-body" style={{ width: '100%' }}>
          <div className="modal-price-overview" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <div className="modal-current-price" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatCurrency(stock.price)}</div>
            <div className={`modal-price-change ${totalChange >= 0 ? 'up' : 'down'}`} style={{ fontSize: '1.05rem', fontWeight: 700, color: totalChange >= 0 ? '#4ecca3' : '#e94560' }}>
              {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)} ({totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%)
            </div>
          </div>

          <div className="detailed-chart-container" style={{ position: 'relative', width: '100%', marginBottom: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px 0' }}>
            <svg 
              width="100%" 
              height={height} 
              viewBox={`0 0 ${width} ${height}`} 
              preserveAspectRatio="none"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              style={{ overflow: 'visible', cursor: 'crosshair', display: 'block' }}
            >
              <defs>
                <linearGradient id="gradient-up" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ecca3" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4ecca3" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradient-down" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e94560" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#e94560" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal gridlines */}
              <line 
                x1={padding} 
                y1={padding} 
                x2={width - padding} 
                y2={padding} 
                stroke="rgba(255,255,255,0.05)" 
                strokeDasharray="4,4" 
              />
              <line 
                x1={padding} 
                y1={height / 2} 
                x2={width - padding} 
                y2={height / 2} 
                stroke="rgba(255,255,255,0.05)" 
                strokeDasharray="4,4" 
              />
              <line 
                x1={padding} 
                y1={height - padding} 
                x2={width - padding} 
                y2={height - padding} 
                stroke="rgba(255,255,255,0.05)" 
                strokeDasharray="4,4" 
              />

              {/* Area under the path */}
              <polygon
                fill={`url(#${isUp ? 'gradient-up' : 'gradient-down'})`}
                points={areaPath}
              />

              {/* Main polyline */}
              <polyline
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={linePath}
              />

              {/* Hover interactions */}
              {hoveredIndex !== null && points[hoveredIndex] && (
                <>
                  <line
                    x1={points[hoveredIndex].x}
                    y1={padding}
                    x2={points[hoveredIndex].x}
                    y2={height - padding}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={points[hoveredIndex].x}
                    cy={points[hoveredIndex].y}
                    r="6"
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
            
            {/* Tooltip display */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <div 
                className="chart-tooltip"
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: `${(points[hoveredIndex].x / width) * 100}%`,
                  transform: `translateX(-50%)`,
                  backgroundColor: '#0f3460',
                  border: `1.5px solid ${color}`,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  color: '#fff',
                  zIndex: 10
                }}
              >
                <div className="tooltip-price" style={{ fontSize: '0.85rem' }}>{formatCurrency(points[hoveredIndex].val)}</div>
                <div className="tooltip-time" style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>
                  {hoveredIndex === history.length - 1 ? t.close : `-${history.length - 1 - hoveredIndex}s`}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              onClose();
              onOpenFullChart(symbol);
            }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--accent-color)',
              width: '100%',
              padding: '10px 0',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background-color 0.2s, transform 0.1s'
            }}
            className="view-full-chart-btn"
          >
            📈 {t.viewFullChart}
          </button>

          <div className="detailed-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {statsList.map((stat, i) => (
              <div key={i} className="detail-stat-card" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', textAlign: 'left' }}>
                <div className="detail-stat-label" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{stat.label}</div>
                <div className="detail-stat-value" style={{ fontSize: '1rem', fontWeight: 700 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Forecast section */}
          <div className="forecast-card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px', borderRadius: '6px', marginBottom: '15px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>🔮 {t.buyForecast} (100% Accuracy)</span>
              {activeForecasts && activeForecasts[stock.symbol] ? (
                <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(78,204,163,0.1)', color: '#4ecca3', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {t.forecastActive}
                </span>
              ) : null}
            </div>

            {activeForecasts && activeForecasts[stock.symbol] && activeForecasts[stock.symbol].ticksLeft > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {language === 'ru' ? 'Направление' : 'Forecasted'}: {' '}
                  <span style={{ color: activeForecasts[stock.symbol].direction === 'up' ? '#4ecca3' : '#e94560' }}>
                    {activeForecasts[stock.symbol].direction === 'up' ? t.forecastGrowth : t.forecastDecline}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {activeForecasts[stock.symbol].ticksLeft} {t.forecastTimeLeft}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', flex: 1, lineHeight: 1.3 }}>
                  {language === 'ru' 
                    ? 'Анализ рыночных алгоритмов на 15 секунд.' 
                    : '15-second analysis of market algorithms.'}
                </div>
                <button
                  onClick={() => buyStockForecast(stock.symbol)}
                  disabled={cash < Math.max(100, Math.round(stock.price * 3))}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(241, 196, 15, 0.1)',
                    border: '1.5px solid rgba(241, 196, 15, 0.3)',
                    color: '#f1c40f',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  💵 {formatCurrency(Math.max(100, Math.round(stock.price * 3)))}
                </button>
              </div>
            )}
          </div>

          <div className="modal-trade-section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px' }}>
            <div className="qty-selector-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                {language === 'ru' ? 'Количество:' : 'Quantity:'}
              </span>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '6px',
                  width: '70px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              />
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {([5, 10, 100] as const).map(preset => (
                  <button
                    key={preset}
                    onClick={() => setQty(preset)}
                    style={{
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1.5px solid rgba(255,255,255,0.06)',
                      color: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: 'auto',
                      margin: 0
                    }}
                  >
                    +{preset}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const maxBuy = Math.floor(cash / stock.price);
                    setQty(Math.max(1, maxBuy));
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(78, 204, 163, 0.1)',
                    border: '1.5px solid rgba(78, 204, 163, 0.2)',
                    color: 'var(--accent-color)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: 'auto',
                    margin: 0
                  }}
                >
                  {language === 'ru' ? 'МАКС КУПИТЬ' : 'MAX BUY'}
                </button>
                <button
                  onClick={() => {
                    const maxSell = ownedStocks[stock.symbol] || 0;
                    setQty(Math.max(1, maxSell));
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(233, 69, 96, 0.1)',
                    border: '1.5px solid rgba(233, 69, 96, 0.2)',
                    color: 'var(--danger-color)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: 'auto',
                    margin: 0
                  }}
                >
                  {language === 'ru' ? 'МАКС ПРОДАТЬ' : 'MAX SELL'}
                </button>
              </div>
            </div>

            <div className="trade-info-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>
              <span>{t.inStock}: <strong style={{ color: '#fff' }}>{ownedStocks[stock.symbol] || 0}</strong></span>
              <span>{t.balance}: <strong style={{ color: '#fff' }}>{formatCurrency(cash)}</strong></span>
            </div>
            <div className="trade-actions-row" style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => buyStock(stock.symbol, qty)} 
                disabled={cash < stock.price * qty} 
                className="buy-btn"
                style={{ flex: 1, padding: '12px 0', fontSize: '0.95rem', fontWeight: 700 }}
              >
                {t.buy} {qty} ({formatCurrency(stock.price * qty)})
              </button>
              <button 
                onClick={() => sellStock(stock.symbol, qty)} 
                disabled={(ownedStocks[stock.symbol] || 0) < qty} 
                className="sell-btn"
                style={{ flex: 1, padding: '12px 0', fontSize: '0.95rem', fontWeight: 700 }}
              >
                {t.sell} {qty} ({formatCurrency(stock.price * qty)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StockFullChartModal = ({
  symbol,
  onClose,
}: {
  symbol: string;
  onClose: () => void;
}) => {
  const { stocks, ownedStocks, cash, buyStock, sellStock, buyStockForecast, activeForecasts, language } = useGame();
  const stock = stocks.find(s => s.symbol === symbol);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState<15 | 30 | 50>(50);
  const [qty, setQty] = useState<number>(1);

  if (!stock) return null;

  const t = TRANSLATIONS[language];
  const fullHistory = stock.history;
  const history = fullHistory.slice(-timeframe);
  const isUp = history.length > 1 && stock.price >= history[history.length - 2];
  const color = isUp ? '#4ecca3' : '#e94560';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const getName = (name: string) => {
    const parts = name.split(' / ');
    return language === 'ru' ? (parts[1] || parts[0]) : parts[0];
  };

  const min = Math.min(...history);
  const max = Math.max(...history);
  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  const range = max - min === 0 ? 1 : max - min;

  const width = 800;
  const height = 300;
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const points = history.map((val, idx) => {
    const x = paddingLeft + (idx / (history.length - 1)) * (width - paddingLeft - paddingRight);
    const y = paddingTop + (height - paddingTop - paddingBottom) - ((val - min) / range) * (height - paddingTop - paddingBottom);
    return { x, y, val, idx };
  });

  const linePath = points.map(p => `${p.x},${p.y}`).join(' ');

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = `${firstPoint.x},${height - paddingBottom} ${linePath} ${lastPoint.x},${height - paddingBottom}`;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const innerWidth = rect.width * ((width - paddingLeft - paddingRight) / width);
    const startX = rect.width * (paddingLeft / width);
    const relativeX = clientX - startX;
    const pct = relativeX / innerWidth;
    const idx = Math.min(
      history.length - 1,
      Math.max(0, Math.round(pct * (history.length - 1)))
    );
    setHoveredIndex(idx);
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
  };

  const startPrice = history[0];
  const endPrice = stock.price;
  const totalChange = endPrice - startPrice;
  const totalChangePercent = (totalChange / startPrice) * 100;

  const statsList = [
    { label: t.high, value: formatCurrency(max) },
    { label: t.low, value: formatCurrency(min) },
    { label: t.avg, value: formatCurrency(avg) },
    { label: t.volatility, value: `${(stock.volatility * 100).toFixed(1)}%` },
  ];

  const yLabelsCount = 5;
  const yLabels = Array.from({ length: yLabelsCount }).map((_, i) => {
    const ratio = i / (yLabelsCount - 1);
    const val = max - ratio * range;
    const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
    return { val, y };
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2010 }}>
      <div className="card modal-content stock-details-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '95%', maxHeight: '95vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
          <div className="modal-title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="stock-symbol-badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{stock.symbol}</span>
            <h3 style={{ margin: 0 }}>{getName(stock.name)} — {language === 'ru' ? 'Полный график' : 'Full Chart'}</h3>
          </div>
          <button className="close-modal-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' }}>✕</button>
        </div>

        <div className="modal-body" style={{ width: '100%' }}>
          <div className="modal-price-overview" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
            <div className="modal-current-price" style={{ fontSize: '2.2rem', fontWeight: 800 }}>{formatCurrency(stock.price)}</div>
            <div className={`modal-price-change ${totalChange >= 0 ? 'up' : 'down'}`} style={{ fontSize: '1.2rem', fontWeight: 700, color: totalChange >= 0 ? '#4ecca3' : '#e94560' }}>
              {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)} ({totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%)
            </div>
          </div>

          <div className="timeframe-selector" style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {([15, 30, 50] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  backgroundColor: timeframe === tf ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: timeframe === tf ? 'var(--primary-color)' : '#bdc3c7',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: 'auto',
                  margin: 0
                }}
              >
                {tf} {language === 'ru' ? 'тиков' : 'ticks'}
              </button>
            ))}
          </div>

          <div className="detailed-chart-container" style={{ position: 'relative', width: '100%', marginBottom: '25px', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '15px 0 10px 0' }}>
            <svg 
              width="100%" 
              height={height} 
              viewBox={`0 0 ${width} ${height}`} 
              preserveAspectRatio="none"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              style={{ overflow: 'visible', cursor: 'crosshair', display: 'block' }}
            >
              <defs>
                <linearGradient id="full-gradient-up" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ecca3" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4ecca3" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="full-gradient-down" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e94560" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#e94560" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {yLabels.map((lbl, idx) => (
                <g key={idx}>
                  <line 
                    x1={paddingLeft} 
                    y1={lbl.y} 
                    x2={width - paddingRight} 
                    y2={lbl.y} 
                    stroke="rgba(255,255,255,0.04)" 
                    strokeDasharray="4,4" 
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={lbl.y + 4} 
                    fill="#94a3b8" 
                    fontSize="11" 
                    fontWeight="500" 
                    textAnchor="end"
                  >
                    {formatCurrency(lbl.val)}
                  </text>
                </g>
              ))}

              <text x={paddingLeft} y={height - 8} fill="#64748b" fontSize="10" fontWeight="600" textAnchor="start">
                -{timeframe}s
              </text>
              <text x={paddingLeft + (width - paddingLeft - paddingRight) / 2} y={height - 8} fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle">
                -{Math.floor(timeframe / 2)}s
              </text>
              <text x={width - paddingRight} y={height - 8} fill="#64748b" fontSize="10" fontWeight="600" textAnchor="end">
                {t.close}
              </text>

              <polygon
                fill={`url(#${isUp ? 'full-gradient-up' : 'full-gradient-down'})`}
                points={areaPath}
              />

              <polyline
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={linePath}
              />

              {hoveredIndex !== null && points[hoveredIndex] && (
                <>
                  <line
                    x1={points[hoveredIndex].x}
                    y1={paddingTop}
                    x2={points[hoveredIndex].x}
                    y2={height - paddingBottom}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1={paddingLeft}
                    y1={points[hoveredIndex].y}
                    x2={width - paddingRight}
                    y2={points[hoveredIndex].y}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.2"
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={points[hoveredIndex].x}
                    cy={points[hoveredIndex].y}
                    r="7"
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                </>
              )}
            </svg>
            
            {hoveredIndex !== null && points[hoveredIndex] && (
              <div 
                className="chart-tooltip"
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: `${(points[hoveredIndex].x / width) * 100}%`,
                  transform: `translateX(-50%)`,
                  backgroundColor: '#0a0a14',
                  border: `2px solid ${color}`,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                  color: '#fff',
                  zIndex: 10
                }}
              >
                <div className="tooltip-price" style={{ fontSize: '1rem', color: color }}>{formatCurrency(points[hoveredIndex].val)}</div>
                <div className="tooltip-time" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500, marginTop: '2px' }}>
                  {hoveredIndex === history.length - 1 ? t.close : `-${history.length - 1 - hoveredIndex}s`}
                </div>
              </div>
            )}
          </div>

          <div className="detailed-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
            {statsList.map((stat, i) => (
              <div key={i} className="detail-stat-card" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', textAlign: 'left' }}>
                <div className="detail-stat-label" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>{stat.label}</div>
                <div className="detail-stat-value" style={{ fontSize: '1.15rem', fontWeight: 800 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Forecast section */}
          <div className="forecast-card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>🔮 {t.buyForecast} (100% Accuracy)</span>
              {activeForecasts && activeForecasts[stock.symbol] ? (
                <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(78,204,163,0.1)', color: '#4ecca3', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {t.forecastActive}
                </span>
              ) : null}
            </div>

            {activeForecasts && activeForecasts[stock.symbol] && activeForecasts[stock.symbol].ticksLeft > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {language === 'ru' ? 'Направление' : 'Forecasted'}: {' '}
                  <span style={{ color: activeForecasts[stock.symbol].direction === 'up' ? '#4ecca3' : '#e94560' }}>
                    {activeForecasts[stock.symbol].direction === 'up' ? t.forecastGrowth : t.forecastDecline}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {activeForecasts[stock.symbol].ticksLeft} {t.forecastTimeLeft}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', flex: 1, lineHeight: 1.3 }}>
                  {language === 'ru' 
                    ? 'Анализ рыночных алгоритмов на 15 секунд.' 
                    : '15-second analysis of market algorithms.'}
                </div>
                <button
                  onClick={() => buyStockForecast(stock.symbol)}
                  disabled={cash < Math.max(100, Math.round(stock.price * 3))}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(241, 196, 15, 0.1)',
                    border: '1.5px solid rgba(241, 196, 15, 0.3)',
                    color: '#f1c40f',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  💵 {formatCurrency(Math.max(100, Math.round(stock.price * 3)))}
                </button>
              </div>
            )}
          </div>

          <div className="modal-trade-section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
            <div className="qty-selector-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                {language === 'ru' ? 'Количество:' : 'Quantity:'}
              </span>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '6px',
                  width: '70px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              />
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {([5, 10, 100] as const).map(preset => (
                  <button
                    key={preset}
                    onClick={() => setQty(preset)}
                    style={{
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1.5px solid rgba(255,255,255,0.06)',
                      color: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: 'auto',
                      margin: 0
                    }}
                  >
                    +{preset}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const maxBuy = Math.floor(cash / stock.price);
                    setQty(Math.max(1, maxBuy));
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(78, 204, 163, 0.1)',
                    border: '1.5px solid rgba(78, 204, 163, 0.2)',
                    color: 'var(--accent-color)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: 'auto',
                    margin: 0
                  }}
                >
                  {language === 'ru' ? 'МАКС КУПИТЬ' : 'MAX BUY'}
                </button>
                <button
                  onClick={() => {
                    const maxSell = ownedStocks[stock.symbol] || 0;
                    setQty(Math.max(1, maxSell));
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(233, 69, 96, 0.1)',
                    border: '1.5px solid rgba(233, 69, 96, 0.2)',
                    color: 'var(--danger-color)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: 'auto',
                    margin: 0
                  }}
                >
                  {language === 'ru' ? 'МАКС ПРОДАТЬ' : 'MAX SELL'}
                </button>
              </div>
            </div>

            <div className="trade-info-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '15px' }}>
              <span>{t.inStock}: <strong style={{ color: '#fff' }}>{ownedStocks[stock.symbol] || 0}</strong></span>
              <span>{t.balance}: <strong style={{ color: '#fff' }}>{formatCurrency(cash)}</strong></span>
            </div>
            <div className="trade-actions-row" style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => buyStock(stock.symbol, qty)} 
                disabled={cash < stock.price * qty} 
                className="buy-btn"
                style={{ flex: 1, padding: '14px 0', fontSize: '1rem', fontWeight: 700 }}
              >
                {t.buy} {qty} ({formatCurrency(stock.price * qty)})
              </button>
              <button 
                onClick={() => sellStock(stock.symbol, qty)} 
                disabled={(ownedStocks[stock.symbol] || 0) < qty} 
                className="sell-btn"
                style={{ flex: 1, padding: '14px 0', fontSize: '1rem', fontWeight: 700 }}
              >
                {t.sell} {qty} ({formatCurrency(stock.price * qty)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessDetailsModal = ({
  businessId,
  onClose,
}: {
  businessId: string;
  onClose: () => void;
}) => {
  const { cash, businesses, businessStates, upgradeBusinessLevel, buyBusinessUpgrade, language } = useGame();
  const business = businesses.find(b => b.id === businessId);

  if (!business) return null;

  const t = TRANSLATIONS[language];
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const getName = (name: string) => {
    const parts = name.split(' / ');
    return language === 'ru' ? (parts[1] || parts[0]) : parts[0];
  };

  const bizState = (businessStates && businessStates[businessId]) || { level: 1, upgrades: [] };
  const level = bizState.level;
  const activeUpgrades = bizState.upgrades;

  // Calculate current income
  const levelMultiplier = Math.pow(1.3, level - 1);
  const upgradesList = BUSINESS_UPGRADES[businessId] || [];
  const upgradesMultiplier = activeUpgrades.reduce((sum, upId) => {
    const upgradeObj = upgradesList.find(u => u.id === upId);
    return sum + (upgradeObj ? upgradeObj.incomeMultiplier : 0);
  }, 1.0);
  const currentGrossIncome = Math.round(business.incomePerTick * levelMultiplier * upgradesMultiplier);
  const taxRate = getBusinessTaxRate(business.baseCost);
  const taxAmount = Math.round(currentGrossIncome * taxRate);
  const currentNetIncome = currentGrossIncome - taxAmount;

  // Calculate next level values
  const nextLevelCost = Math.round(business.baseCost * Math.pow(1.6, level));
  const nextLevelGross = Math.round(business.incomePerTick * Math.pow(1.3, level) * upgradesMultiplier);
  const nextLevelNet = nextLevelGross - Math.round(nextLevelGross * taxRate);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="card modal-content business-details-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: 'var(--accent-color)', color: '#1a1a2e', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>{t.level} {level}</span>
            <h3 style={{ margin: 0 }}>{getName(business.name)}</h3>
          </div>
          <button className="close-modal-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' }}>✕</button>
        </div>

        <div className="modal-body" style={{ width: '100%' }}>
          {/* Income & Tax Overview */}
          <div className="income-overview-card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '18px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '12px' }}>
              <div>
                <div style={{ color: '#4ecca3', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {language === 'ru' ? 'Чистый Доход' : 'Net Income'}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ecca3', marginTop: '4px' }}>
                  {formatCurrency(currentNetIncome)} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'normal' }}>/ {t.sec}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{t.multiplier}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px', color: '#fff' }}>x{(levelMultiplier * upgradesMultiplier).toFixed(2)}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div style={{ color: '#94a3b8' }}>
                {language === 'ru' ? 'Доход до налогов:' : 'Gross Income:'} <strong style={{ color: '#fff' }}>{formatCurrency(currentGrossIncome)}/{t.sec}</strong>
              </div>
              <div style={{ color: '#e94560', fontWeight: 600 }}>
                {language === 'ru' ? 'Налог' : 'Tax'} ({Math.round(taxRate * 100)}%): -{formatCurrency(taxAmount)}/{t.sec}
              </div>
            </div>
          </div>

          {/* Level Up section */}
          <div className="upgrade-level-section" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            {level >= 20 ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <span style={{ color: 'var(--accent-color)', fontWeight: 800, fontSize: '1.1rem' }}>🎉 {t.maxLevel} (20/20)</span>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
                  {language === 'ru' ? 'Достигнут максимальный предел эффективности для этой компании.' : 'Maximum efficiency limit reached for this company.'}
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, textAlign: 'left' }}>{t.upgradeLevel} ({level} ➔ {level + 1})</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', textAlign: 'left' }}>
                      {t.nextLevelIncome}: <span style={{ color: '#4ecca3', fontWeight: 700 }}>{formatCurrency(nextLevelNet)} / {t.sec}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, color: cash >= nextLevelCost ? '#fff' : '#e94560' }}>
                    {formatCurrency(nextLevelCost)}
                  </div>
                </div>
                
                <button
                  onClick={() => upgradeBusinessLevel(business.id)}
                  disabled={cash < nextLevelCost}
                  className="buy-btn"
                  style={{ width: '100%', padding: '12px 0', fontSize: '1rem', fontWeight: 700 }}
                >
                  {t.upgradeLevel}
                </button>
              </>
            )}
          </div>

          {/* Upgrades section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{t.upgrades} ({activeUpgrades.length}/{upgradesList.length})</h4>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.activeUpgrades}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upgradesList.map((upgrade) => {
                const purchased = activeUpgrades.includes(upgrade.id);
                const upgradeName = language === 'ru' ? upgrade.nameRu : upgrade.nameEn;
                const upgradeDesc = language === 'ru' ? upgrade.descriptionRu : upgrade.descriptionEn;
                
                return (
                  <div key={upgrade.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '6px', backgroundColor: purchased ? 'rgba(78, 204, 163, 0.04)' : 'rgba(255,255,255,0.01)', border: purchased ? '1.5px solid rgba(78, 204, 163, 0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ flex: 1, paddingRight: '15px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{upgradeName}</span>
                        <span style={{ fontSize: '0.75rem', color: '#4ecca3', backgroundColor: 'rgba(78,204,163,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>+{Math.round(upgrade.incomeMultiplier * 100)}%</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.3 }}>{upgradeDesc}</div>
                    </div>
                    <div>
                      {purchased ? (
                        <span style={{ color: '#4ecca3', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ✓ {t.alreadyPurchased}
                        </span>
                      ) : (
                        <button
                          onClick={() => buyBusinessUpgrade(business.id, upgrade.id)}
                          disabled={cash < upgrade.cost}
                          className="buy-btn"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700 }}
                        >
                          {t.buyUpgrade} - {formatCurrency(upgrade.cost)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {upgradesList.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  No upgrades available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


function App() {
  const [view, setView] = useState<View>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [selectedFullChartSymbol, setSelectedFullChartSymbol] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const { cash, netWorth, stocks, ownedStocks, businesses, ownedBusinesses, businessStates, clickLevel, luxuryAssets, ownedLuxuryAssets, news, language, user, login, logout, buyStock, sellStock, buyBusiness, upgradeClick, buyLuxuryAsset, addCash, resetGame, setLanguage, serverUrl } = useGame();


  const t = TRANSLATIONS[language];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatCompactCurrency = (val: number) => {
    if (val >= 10000000) { // 10M+
      return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2
      }).format(val);
    }
    return formatCurrency(val);
  };

  const getName = (name: string) => {
    const parts = name.split(' / ');
    return language === 'ru' ? (parts[1] || parts[0]) : parts[0];
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = authMode === 'login' ? 'login' : 'register';
    const apiUrl = serverUrl ? `${serverUrl}/api` : '/api';
    try {
      const res = await fetch(`${apiUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth failed');
      
      if (authMode === 'login') {
        login(data.token, data.username);
      } else {
        setAuthMode('login');
        alert('Registered! Please login.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };


  if (!user) {
    return (
      <div className="auth-container">
        <div className="card auth-card">
          <h1>{t.title}</h1>
          <h2>{authMode === 'login' ? t.login : t.register}</h2>
          <form onSubmit={handleAuth}>
            <input type="text" placeholder={t.username} value={username} onChange={e => setUsername(e.target.value)} required />
            <input type="password" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="error">{error}</p>}
            <button type="submit">{authMode === 'login' ? t.login : t.register}</button>
          </form>
          <p onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="toggle-auth">
            {authMode === 'login' ? t.noAccount : t.haveAccount}
          </p>
          <div className="lang-selector-auth">
            <button onClick={() => setLanguage('ru')} className={language === 'ru' ? 'active' : ''}>RU</button>
            <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>EN</button>
          </div>
        </div>
      </div>
    );
  }


  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="view">
            <h2>{t.dashboard}</h2>
            
            <div className="bank-card">
              <div>
                <div className="card-label">{t.balance}</div>
                <div className="card-balance">{formatCompactCurrency(cash)}</div>
                <div className="card-chip"></div>
              </div>
              <div className="card-footer">
                <div>
                  <div className="card-label">{t.cardHolder}</div>
                  <div className="card-holder">{user?.toUpperCase()}</div>
                </div>
                <div style={{fontSize: '1.2rem', fontWeight: 'bold', fontStyle: 'italic'}}>VISA</div>
              </div>
            </div>

            <div className="card">
              <h3>{t.stats}</h3>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}>
                <span style={{ color: '#94a3b8' }}>{language === 'ru' ? 'Баланс наличных' : 'Cash Balance'}:</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{formatCurrency(cash)}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: '#94a3b8' }}>{t.netWorth}:</span>
                <span className="stat-value">{formatCurrency(netWorth)}</span>
              </p>
            </div>
            
            <div className="card clicker-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ margin: 0, textAlign: 'left' }}>🖱️ {language === 'ru' ? 'Активный доход (Кликер)' : 'Active Clicker'}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{t.clickLevel}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2px' }}>{clickLevel || 1}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{t.earnVal}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-color)', marginTop: '2px' }}>
                    {formatCurrency(10 + ((clickLevel || 1) - 1) * 15)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                <button 
                  onClick={() => addCash(10)} 
                  className="buy-btn"
                  style={{ flex: 1.5, padding: '12px', fontWeight: 700, fontSize: '0.95rem' }}
                >
                  💵 {language === 'ru' ? `Кликнуть (+${10 + ((clickLevel || 1) - 1) * 15}$)` : `Click (+${10 + ((clickLevel || 1) - 1) * 15}$)`}
                </button>
                
                <button 
                  onClick={upgradeClick}
                  disabled={cash < Math.round(100 * Math.pow(1.8, (clickLevel || 1) - 1))}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    fontWeight: 700, 
                    fontSize: '0.85rem', 
                    backgroundColor: 'rgba(78, 204, 163, 0.1)', 
                    border: '1.5px solid rgba(78, 204, 163, 0.3)',
                    color: 'var(--accent-color)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  className="click-upgrade-btn"
                >
                  ⚡ {t.upgradeClick} <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginTop: '2px' }}>{formatCurrency(Math.round(100 * Math.pow(1.8, (clickLevel || 1) - 1)))}</div>
                </button>
              </div>
            </div>
            
            <div className="card">
              <h3>{t.latestNews}</h3>
              <div className="news-ticker">
                {news.map((item, i) => (
                  <div key={i} className="news-item">
                    {typeof item === 'string' ? item : (language === 'ru' ? item.ru : item.en)}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>{t.portfolio}</h3>
              {Object.entries(ownedStocks).map(([symbol, qty]) => {
                if (qty === 0) return null;
                const stock = stocks.find(s => s.symbol === symbol);
                return (
                  <div key={symbol} className="stock-item" onClick={() => setSelectedStockSymbol(symbol)} style={{ cursor: 'pointer' }}>
                    <div className="portfolio-stock-info">
                      <strong className="portfolio-stock-name">{getName(stock?.name || '')}</strong>
                      <span className="portfolio-stock-qty">{qty} {language === 'ru' ? 'шт.' : 'pcs'} ({symbol})</span>
                    </div>
                    {stock && (
                      <Sparkline 
                        history={stock.history} 
                        isUp={stock.history.length > 1 && stock.price >= stock.history[stock.history.length - 2]} 
                      />
                    )}
                    <span style={{ fontWeight: 700 }}>{formatCurrency((stock?.price || 0) * qty)}</span>
                  </div>
                );
              })}
              {Object.entries(ownedStocks).filter(([_, qty]) => qty > 0).length === 0 && <p>{t.noStocks}</p>}
            </div>
          </div>
        );
      case 'market':
        return (
          <div className="view">
            <h2>{t.market}</h2>
            <div className="market-grid">
              {stocks.map(stock => {
                const isUp = stock.history.length > 1 && stock.price >= stock.history[stock.history.length - 2];
                return (
                  <div key={stock.id} className="card stock-card-item">
                    <div className="stock-info" onClick={() => setSelectedStockSymbol(stock.symbol)} style={{ cursor: 'pointer' }}>
                      <div className="stock-name-group">
                        <strong className="stock-name">{getName(stock.name)}</strong>
                        <span className="stock-symbol-badge">{stock.symbol}</span>
                      </div>
                      
                      <Sparkline history={stock.history} isUp={isUp} />

                      <div className={`stock-price ${isUp ? 'up' : 'down'}`}>
                        {formatCurrency(stock.price)}
                      </div>
                    </div>
                    <div className="stock-controls">
                      <div className="item-actions">
                        <button onClick={() => buyStock(stock.symbol, 1)} disabled={cash < stock.price} className="buy-btn">{t.buy} 1</button>
                        <button onClick={() => sellStock(stock.symbol, 1)} disabled={(ownedStocks[stock.symbol] || 0) <= 0} className="sell-btn">{t.sell} 1</button>
                        <button onClick={() => setSelectedFullChartSymbol(stock.symbol)} className="chart-btn" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#bdc3c7', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }} title={t.viewFullChart}>📈</button>
                      </div>
                      <div className="in-stock-label">{t.inStock}: {ownedStocks[stock.symbol] || 0}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'businesses':
        return (
          <div className="view">
            <h2>{t.businesses}</h2>
            <div className="businesses-grid">
              {businesses.map(biz => {
                const owned = ownedBusinesses.includes(biz.id);
                const bizState = (businessStates && businessStates[biz.id]) || { level: 1, upgrades: [] };
                const levelMultiplier = Math.pow(1.3, bizState.level - 1);
                const upgradesList = BUSINESS_UPGRADES[biz.id] || [];
                const upgradesMultiplier = bizState.upgrades.reduce((sum, upId) => {
                  const upgradeObj = upgradesList.find(u => u.id === upId);
                  return sum + (upgradeObj ? upgradeObj.incomeMultiplier : 0);
                }, 1.0);
                const grossIncome = Math.round(biz.incomePerTick * levelMultiplier * upgradesMultiplier);
                const taxRate = getBusinessTaxRate(biz.baseCost);
                const taxAmount = Math.round(grossIncome * taxRate);
                const netIncome = grossIncome - taxAmount;

                return (
                  <div 
                    key={biz.id} 
                    className={`card business-card-item ${owned ? 'owned-card' : ''}`}
                    onClick={() => owned && setSelectedBusinessId(biz.id)}
                    style={{ cursor: owned ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div className="business-info" style={{ textAlign: 'left', width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '1.1rem' }}>{getName(biz.name)}</strong>
                        {owned && (
                          <span style={{ backgroundColor: 'var(--accent-color)', color: '#1a1a2e', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                            {t.level} {bizState.level}
                          </span>
                        )}
                      </div>
                      <div className="business-income" style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                        {t.income}: <span style={{ color: owned ? 'var(--accent-color)' : '#fff', fontWeight: 700 }}>{formatCurrency(owned ? netIncome : grossIncome)}</span> / {t.sec}
                        {owned && (
                          <span style={{ fontSize: '0.75rem', color: '#e94560', marginLeft: '6px' }}>
                            ({language === 'ru' ? 'налог' : 'tax'} {Math.round(taxRate * 100)}%)
                          </span>
                        )}
                      </div>
                      {owned && upgradesList.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                          {t.upgrades}: {bizState.upgrades.length} / {upgradesList.length}
                        </div>
                      )}
                    </div>
                    <div className="business-controls" style={{ marginTop: '15px', width: '100%' }} onClick={e => owned && e.stopPropagation()}>
                      {owned ? (
                        <button onClick={() => setSelectedBusinessId(biz.id)} className="manage-btn" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#4ecca3', width: '100%', padding: '8px 0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                          ⚙️ {language === 'ru' ? 'Управление' : 'Manage'}
                        </button>
                      ) : (
                        <button onClick={() => buyBusiness(biz.id)} disabled={cash < biz.baseCost} className="buy-btn" style={{ width: '100%', padding: '8px 0', fontSize: '0.85rem' }}>
                          {t.buy} - {formatCurrency(biz.baseCost)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'luxury':
        return (
          <div className="view">
            <h2>{t.shop}</h2>
            <div className="luxury-grid">
              {luxuryAssets.map(asset => {
                const owned = ownedLuxuryAssets.includes(asset.id);
                return (
                  <div key={asset.id} className="card luxury-card-item">
                    {asset.image && (
                      <div className="luxury-image-container">
                        <img src={asset.image} alt={getName(asset.name)} className="luxury-image" />
                      </div>
                    )}
                    <div className="luxury-info">
                      <strong>{getName(asset.name)}</strong>
                      <div className="luxury-category">
                        {t.category}: {asset.category === 'Real Estate' ? t.realEstate : (asset.category === 'Transport' ? t.transport : t.art)}
                      </div>
                    </div>
                    <div className="luxury-controls">
                      {owned ? (
                        <span className="owned-status">{t.property}</span>
                      ) : (
                        <button onClick={() => buyLuxuryAsset(asset.id)} disabled={cash < asset.cost} className="buy-btn">
                          {t.purchase} {formatCurrency(asset.cost)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>{t.title}</h1>
        <nav>
          <div className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">{t.dashboard}</span>
          </div>
          <div className={`nav-link ${view === 'market' ? 'active' : ''}`} onClick={() => setView('market')}>
            <span className="nav-icon">📈</span>
            <span className="nav-text">{t.market}</span>
          </div>
          <div className={`nav-link ${view === 'businesses' ? 'active' : ''}`} onClick={() => setView('businesses')}>
            <span className="nav-icon">💼</span>
            <span className="nav-text">{t.businesses}</span>
          </div>
          <div className={`nav-link ${view === 'luxury' ? 'active' : ''}`} onClick={() => setView('luxury')}>
            <span className="nav-icon">🛍️</span>
            <span className="nav-text">{t.shop}</span>
          </div>
        </nav>
      </div>
      
      <header className="header">
        <div className="header-stats">
          <div className="header-stat-item">
            <span className="stat-label-text">{t.cash}:</span>
            <span className="stat-icon">💵</span>
            <span className="stat-value">{formatCompactCurrency(cash)}</span>
          </div>
          <div className="header-stat-item">
            <span className="stat-label-text">{t.netWorth}:</span>
            <span className="stat-icon">💎</span>
            <span className="stat-value">{formatCompactCurrency(netWorth)}</span>
          </div>
        </div>
        <button className="settings-toggle-btn" onClick={() => setShowSettings(true)}>⚙️</button>
      </header>

      <main className="main-content">
        {renderView()}
      </main>

      {showSettings && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="card modal-content" style={{ maxWidth: '400px', width: '90%' }}>
            <h3>{t.settings}</h3>
            
            <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'stretch', textAlign: 'left' }}>
              <div>
                <span style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>{t.username}: </span>
                <strong style={{ fontSize: '1.1rem' }}>{user}</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>{t.lang}:</span>
                <div className="lang-selector-settings">
                  <button onClick={() => setLanguage('ru')} className={language === 'ru' ? 'active' : ''}>RU</button>
                  <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>EN</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => { setShowSettings(false); logout(); }} style={{ backgroundColor: '#e74c3c', color: '#fff', width: '100%' }}>
                {t.logout}
              </button>
              <button onClick={() => { setShowSettings(false); setShowResetModal(true); }} style={{ backgroundColor: '#7f8c8d', color: '#fff', width: '100%' }}>
                {t.reset}
              </button>
              <button onClick={() => setShowSettings(false)} style={{ backgroundColor: '#34495e', color: '#fff', width: '100%' }}>
                {language === 'ru' ? 'Закрыть' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="modal-overlay" style={{ zIndex: 1001 }}>
          <div className="card modal-content">
            <h3>{t.reset}</h3>
            <p>{t.resetConfirm}</p>
            <div style={{display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px'}}>
              <button onClick={() => { resetGame(); setShowResetModal(false); }} style={{backgroundColor: '#e74c3c'}}>{t.reset}</button>
              <button onClick={() => setShowResetModal(false)} style={{backgroundColor: '#7f8c8d'}}>{language === 'ru' ? 'Отмена' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {selectedStockSymbol && (
        <StockDetailsModal
          symbol={selectedStockSymbol}
          onClose={() => setSelectedStockSymbol(null)}
          onOpenFullChart={(symbol) => setSelectedFullChartSymbol(symbol)}
        />
      )}

      {selectedFullChartSymbol && (
        <StockFullChartModal
          symbol={selectedFullChartSymbol}
          onClose={() => setSelectedFullChartSymbol(null)}
        />
      )}

      {selectedBusinessId && (
        <BusinessDetailsModal
          businessId={selectedBusinessId}
          onClose={() => setSelectedBusinessId(null)}
        />
      )}
    </div>
  );
}

export default App;
