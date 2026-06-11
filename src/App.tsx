import { useState } from 'react';
import './App.css';
import { useGame } from './context/GameContext';

type View = 'dashboard' | 'market' | 'businesses' | 'luxury';

const TRANSLATIONS = {
  ru: {
    title: 'ИнвестСим',
    dashboard: 'Кабинет',
    market: 'Рынок акций',
    businesses: 'Мой бизнес',
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
  },
  en: {
    title: 'InvestSim',
    dashboard: 'Dashboard',
    market: 'Stock Market',
    businesses: 'Businesses',
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
  }
};

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { cash, netWorth, stocks, ownedStocks, businesses, ownedBusinesses, luxuryAssets, ownedLuxuryAssets, news, language, user, login, logout, buyStock, sellStock, buyBusiness, buyLuxuryAsset, addCash, resetGame, setLanguage, serverUrl, setServerUrl } = useGame();
  
  const [tempServerUrl, setTempServerUrl] = useState(serverUrl);


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
        <div className="settings-trigger-auth" onClick={() => { setTempServerUrl(serverUrl); setShowSettings(true); }} style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer', fontSize: '1.5rem', opacity: 0.7 }}>⚙️</div>
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

        {showSettings && (
          <div className="modal-overlay" style={{ zIndex: 1000 }}>
            <div className="card modal-content" style={{ maxWidth: '400px', width: '90%' }}>
              <h3>{language === 'ru' ? 'Настройки сервера API' : 'API Server Settings'}</h3>
              <p style={{ fontSize: '0.85rem', color: '#bdc3c7', marginBottom: '15px' }}>
                {language === 'ru' 
                  ? 'Введите адрес запущенного Node.js сервера (например, http://192.168.1.50:5000).' 
                  : 'Enter the URL of your Node.js server (e.g., http://192.168.1.50:5000).'}
              </p>
              <input 
                type="text" 
                placeholder="http://10.0.2.2:5000" 
                value={tempServerUrl} 
                onChange={e => setTempServerUrl(e.target.value)} 
                style={{ width: '100%', padding: '10px', backgroundColor: '#2c3e50', border: '1px solid #34495e', borderRadius: '5px', color: '#fff', marginBottom: '20px' }}
              />
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={() => { setServerUrl(tempServerUrl); setShowSettings(false); }} style={{ backgroundColor: '#2ecc71' }}>
                  {language === 'ru' ? 'Сохранить' : 'Save'}
                </button>
                <button onClick={() => setShowSettings(false)} style={{ backgroundColor: '#7f8c8d' }}>
                  {language === 'ru' ? 'Отмена' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
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
                  <div key={i} className="news-item">{item}</div>
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
                    <span>{getName(stock?.name || '')} ({symbol}): {qty}</span>
                    <span>{formatCurrency((stock?.price || 0) * qty)}</span>
                  </div>
                );
              })}
              {Object.entries(ownedStocks).filter(([_, qty]) => qty > 0).length === 0 && <p>{t.noStocks}</p>}
            </div>
            
            <div style={{marginTop: '40px'}}>
              <button onClick={() => setShowResetModal(true)} style={{backgroundColor: '#7f8c8d'}}>{t.reset}</button>
            </div>

            {showResetModal && (
              <div className="modal-overlay">
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
      case 'market':
        return (
          <div className="view">
            <h2>{t.market}</h2>
            {stocks.map(stock => (
              <div key={stock.id} className="card stock-item">
                <div>
                  <strong>{getName(stock.name)} ({stock.symbol})</strong>
                  <div className={`stock-price ${stock.history.length > 1 && stock.price >= stock.history[stock.history.length - 2] ? 'up' : 'down'}`}>
                    {formatCurrency(stock.price)}
                  </div>
                </div>
                <div>
                  <button onClick={() => buyStock(stock.symbol, 1)} disabled={cash < stock.price}>{t.buy} 1</button>
                  <button onClick={() => sellStock(stock.symbol, 1)} disabled={(ownedStocks[stock.symbol] || 0) <= 0} style={{marginLeft: '10px', backgroundColor: '#e74c3c'}}>{t.sell} 1</button>
                  <div style={{fontSize: '0.8rem', marginTop: '5px'}}>{t.inStock}: {ownedStocks[stock.symbol] || 0}</div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'businesses':
        return (
          <div className="view">
            <h2>{t.businesses}</h2>
            {businesses.map(biz => {
              const owned = ownedBusinesses.includes(biz.id);
              return (
                <div key={biz.id} className="card business-item">
                  <div>
                    <strong>{getName(biz.name)}</strong>
                    <div>{t.income}: {formatCurrency(biz.incomePerTick)} / {t.sec}</div>
                  </div>
                  <div>
                    {owned ? (
                      <span style={{color: '#27ae60', fontWeight: 'bold'}}>{t.owned}</span>
                    ) : (
                      <button onClick={() => buyBusiness(biz.id)} disabled={cash < biz.baseCost}>
                        {t.buy} - {formatCurrency(biz.baseCost)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      case 'luxury':
        return (
          <div className="view">
            <h2>{t.shop}</h2>
            {luxuryAssets.map(asset => {
              const owned = ownedLuxuryAssets.includes(asset.id);
              return (
                <div key={asset.id} className="card luxury-item">
                  <div>
                    <strong>{getName(asset.name)}</strong>
                    <div>{t.category}: {asset.category === 'Real Estate' ? t.realEstate : t.transport}</div>
                  </div>
                  <div>
                    {owned ? (
                      <span style={{color: '#27ae60', fontWeight: 'bold'}}>{t.property}</span>
                    ) : (
                      <button onClick={() => buyLuxuryAsset(asset.id)} disabled={cash < asset.cost}>
                        {t.purchase} {formatCurrency(asset.cost)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>{t.title}</h1>
        <div style={{marginBottom: '20px', fontSize: '0.9rem'}}>
          {t.welcome}, <strong>{user}</strong>
        </div>
        <nav>
          <div className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>{t.dashboard}</div>
          <div className={`nav-link ${view === 'market' ? 'active' : ''}`} onClick={() => setView('market')}>{t.market}</div>
          <div className={`nav-link ${view === 'businesses' ? 'active' : ''}`} onClick={() => setView('businesses')}>{t.businesses}</div>
          <div className={`nav-link ${view === 'luxury' ? 'active' : ''}`} onClick={() => setView('luxury')}>{t.shop}</div>
        </nav>
        
        <div className="lang-selector">
          <span>{t.lang}: </span>
          <button onClick={() => setLanguage('ru')} className={language === 'ru' ? 'active' : ''}>RU</button>
          <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>EN</button>
        </div>

        <button onClick={() => { setTempServerUrl(serverUrl); setShowSettings(true); }} style={{ marginTop: '10px', backgroundColor: '#34495e', width: '100%' }}>⚙️ {language === 'ru' ? 'Адрес сервера' : 'Server IP'}</button>
        <button onClick={logout} style={{marginTop: '20px', backgroundColor: '#e74c3c', width: '100%'}}>{t.logout}</button>
      </div>
      <header className="header">
        <div>{t.cash}: <span className="stat-value">{formatCurrency(cash)}</span></div>
        <div>{t.netWorth}: <span className="stat-value">{formatCurrency(netWorth)}</span></div>
      </header>
      <main className="main-content">
        {renderView()}
      </main>

      {showSettings && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="card modal-content" style={{ maxWidth: '400px', width: '90%' }}>
            <h3>{language === 'ru' ? 'Настройки сервера API' : 'API Server Settings'}</h3>
            <p style={{ fontSize: '0.85rem', color: '#bdc3c7', marginBottom: '15px' }}>
              {language === 'ru' 
                ? 'Введите адрес запущенного Node.js сервера (например, http://192.168.1.50:5000).' 
                : 'Enter the URL of your Node.js server (e.g., http://192.168.1.50:5000).'}
            </p>
            <input 
              type="text" 
              placeholder="http://10.0.2.2:5000" 
              value={tempServerUrl} 
              onChange={e => setTempServerUrl(e.target.value)} 
              style={{ width: '100%', padding: '10px', backgroundColor: '#2c3e50', border: '1px solid #34495e', borderRadius: '5px', color: '#fff', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={() => { setServerUrl(tempServerUrl); setShowSettings(false); }} style={{ backgroundColor: '#2ecc71' }}>
                {language === 'ru' ? 'Сохранить' : 'Save'}
              </button>
              <button onClick={() => setShowSettings(false)} style={{ backgroundColor: '#7f8c8d' }}>
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
