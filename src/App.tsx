import React, { useState } from 'react';
import './App.css';
import { useGame } from './context/GameContext';

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
  }
};

const Sparkline = ({ history, isUp }: { history: number[]; isUp: boolean }) => {
  if (history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min === 0 ? 1 : max - min;
  
  const width = 100;
  const height = 30;
  
  const points = history.map((val, idx) => {
    const x = (idx / (history.length - 1)) * width;
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
}: {
  symbol: string;
  onClose: () => void;
}) => {
  const { stocks, ownedStocks, cash, buyStock, sellStock, language } = useGame();
  const stock = stocks.find(s => s.symbol === symbol);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!stock) return null;

  const t = TRANSLATIONS[language];
  const history = stock.history;
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

          <div className="detailed-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {statsList.map((stat, i) => (
              <div key={i} className="detail-stat-card" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', textAlign: 'left' }}>
                <div className="detail-stat-label" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{stat.label}</div>
                <div className="detail-stat-value" style={{ fontSize: '1rem', fontWeight: 700 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="modal-trade-section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px' }}>
            <div className="trade-info-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>
              <span>{t.inStock}: <strong style={{ color: '#fff' }}>{ownedStocks[stock.symbol] || 0}</strong></span>
              <span>{t.balance}: <strong style={{ color: '#fff' }}>{formatCurrency(cash)}</strong></span>
            </div>
            <div className="trade-actions-row" style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => buyStock(stock.symbol, 1)} 
                disabled={cash < stock.price} 
                className="buy-btn"
                style={{ flex: 1, padding: '12px 0', fontSize: '0.95rem', fontWeight: 700 }}
              >
                {t.buy} 1
              </button>
              <button 
                onClick={() => sellStock(stock.symbol, 1)} 
                disabled={(ownedStocks[stock.symbol] || 0) <= 0} 
                className="sell-btn"
                style={{ flex: 1, padding: '12px 0', fontSize: '0.95rem', fontWeight: 700 }}
              >
                {t.sell} 1
              </button>
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

  const { cash, netWorth, stocks, ownedStocks, businesses, ownedBusinesses, luxuryAssets, ownedLuxuryAssets, news, language, user, login, logout, buyStock, sellStock, buyBusiness, buyLuxuryAsset, addCash, resetGame, setLanguage, serverUrl } = useGame();


  const t = TRANSLATIONS[language];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency: 'USD' }).format(val);
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
                <div className="card-balance">{formatCurrency(cash)}</div>
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
              <p>{t.netWorth}: <span className="stat-value">{formatCurrency(netWorth)}</span></p>
              <button onClick={() => addCash(10)}>{t.earn}</button>
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
                return (
                  <div key={biz.id} className="card business-card-item">
                    <div className="business-info">
                      <strong>{getName(biz.name)}</strong>
                      <div className="business-income">{t.income}: {formatCurrency(biz.incomePerTick)} / {t.sec}</div>
                    </div>
                    <div className="business-controls">
                      {owned ? (
                        <span className="owned-status">{t.owned}</span>
                      ) : (
                        <button onClick={() => buyBusiness(biz.id)} disabled={cash < biz.baseCost} className="buy-btn">
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
                      <div className="luxury-category">{t.category}: {asset.category === 'Real Estate' ? t.realEstate : t.transport}</div>
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
            <span className="stat-value">{formatCurrency(cash)}</span>
          </div>
          <div className="header-stat-item">
            <span className="stat-label-text">{t.netWorth}:</span>
            <span className="stat-icon">💎</span>
            <span className="stat-value">{formatCurrency(netWorth)}</span>
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
        />
      )}
    </div>
  );
}

export default App;
