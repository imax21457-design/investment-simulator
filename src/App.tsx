import { useState } from 'react';
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

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
                  <div key={symbol} className="stock-item">
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
                    <div className="stock-info">
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
    </div>
  );
}

export default App;
