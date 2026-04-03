import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeatherByCity, getWeatherEmoji, getFarmingTip } from '../services/weatherService';
import { Link } from 'react-router-dom';
import {
  CloudSun, Sprout, Camera, TrendingUp, MessageCircle,
  Droplets, Wind, Thermometer, ArrowUpRight, Leaf, Sun,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const quickActions = [
  { icon: CloudSun, label: 'Weather', path: '/weather', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  { icon: Sprout, label: 'Crop Advisor', path: '/crop-advisor', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  { icon: Camera, label: 'Disease Detect', path: '/disease-detect', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  { icon: TrendingUp, label: 'Market Prices', path: '/market', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  { icon: MessageCircle, label: 'AI Expert', path: '/chat', color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
];

const mockYieldData = [
  { month: 'Jan', yield: 45 }, { month: 'Feb', yield: 52 },
  { month: 'Mar', yield: 48 }, { month: 'Apr', yield: 61 },
  { month: 'May', yield: 55 }, { month: 'Jun', yield: 67 },
  { month: 'Jul', yield: 72 }, { month: 'Aug', yield: 69 },
  { month: 'Sep', yield: 78 }, { month: 'Oct', yield: 82 },
  { month: 'Nov', yield: 75 }, { month: 'Dec', yield: 71 },
];

const recentAlerts = [
  { type: 'warning', msg: 'Heavy rainfall expected in 2 days — prepare drainage', time: '2h ago' },
  { type: 'info', msg: 'Best time to sell Rice — prices at seasonal high', time: '5h ago' },
  { type: 'success', msg: 'Wheat crop is in optimal growth phase', time: '1d ago' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [tips, setTips] = useState([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      const data = await getWeatherByCity('Delhi');
      setWeather(data);
      setTips(getFarmingTip(data));
    } catch (err) {
      console.log('Weather load error:', err);
    }
  };

  return (
    <div className="page-container animate-fadeIn">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <div>
          <h1>
            {greeting}, <span className="highlight">{user?.displayName || 'Farmer'}</span> 👋
          </h1>
          <p>Here's your farm intelligence overview for today</p>
        </div>
        <div className="welcome-date">
          <Sun size={16} />
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </div>
      </div>

      {/* Weather Strip */}
      {weather && (
        <div className="weather-strip card">
          <div className="weather-main">
            <span className="weather-emoji">{getWeatherEmoji(weather.weather[0].main)}</span>
            <div>
              <h3>{Math.round(weather.main.temp)}°C</h3>
              <p>{weather.weather[0].description} • {weather.name}</p>
            </div>
          </div>
          <div className="weather-details">
            <div className="weather-detail">
              <Droplets size={16} />
              <span>{weather.main.humidity}%</span>
              <small>Humidity</small>
            </div>
            <div className="weather-detail">
              <Wind size={16} />
              <span>{weather.wind.speed} m/s</span>
              <small>Wind</small>
            </div>
            <div className="weather-detail">
              <Thermometer size={16} />
              <span>{Math.round(weather.main.feels_like)}°C</span>
              <small>Feels Like</small>
            </div>
          </div>
          <Link to="/weather" className="btn btn-ghost">
            View Full <ArrowUpRight size={16} />
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Quick Actions</h2>
          <p className="section-subtitle">Access key features at a glance</p>
        </div>
      </div>

      <div className="quick-actions stagger">
        {quickActions.map(action => (
          <Link key={action.path} to={action.path} className="quick-action-card card">
            <div className="qa-icon" style={{ background: action.bg, color: action.color }}>
              <action.icon size={24} />
            </div>
            <span className="qa-label">{action.label}</span>
            <ArrowUpRight size={16} className="qa-arrow" />
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Yield Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <h3 className="card-title">
              <Leaf size={18} style={{ color: 'var(--color-primary-400)' }} />
              Yield Performance
            </h3>
            <span className="badge badge-success">+12% YoY</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mockYieldData}>
                <defs>
                  <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
                <XAxis dataKey="month" stroke="#6b8f7c" fontSize={12} />
                <YAxis stroke="#6b8f7c" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#162019',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: '10px',
                    color: '#f0fdf4',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="yield"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#yieldGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Farming Tips */}
        <div className="card tips-card">
          <div className="card-header">
            <h3 className="card-title">
              <Sprout size={18} style={{ color: 'var(--color-primary-400)' }} />
              Today's Farming Tips
            </h3>
          </div>
          <div className="tips-list">
            {tips.length > 0 ? tips.map((tip, i) => (
              <div className="tip-item" key={i}>
                <p>{tip}</p>
              </div>
            )) : (
              <div className="tip-item">
                <p>🌤️ Loading weather-based farming tips...</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="card alerts-card">
          <div className="card-header">
            <h3 className="card-title">
              <AlertTriangle size={18} style={{ color: 'var(--color-accent-light)' }} />
              Recent Alerts
            </h3>
          </div>
          <div className="alerts-list">
            {recentAlerts.map((alert, i) => (
              <div className={`alert-item alert-${alert.type}`} key={i}>
                <div className="alert-content">
                  <p>{alert.msg}</p>
                  <small>{alert.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="card stats-summary">
          <div className="card-header">
            <h3 className="card-title">Farm Stats</h3>
          </div>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon green"><Sprout size={22} /></div>
              <div className="stat-info">
                <h3>5</h3>
                <p>Active Crops</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><Droplets size={22} /></div>
              <div className="stat-info">
                <h3>82%</h3>
                <p>Water Efficiency</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><TrendingUp size={22} /></div>
              <div className="stat-info">
                <h3>₹2.4L</h3>
                <p>Est. Revenue</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red"><Camera size={22} /></div>
              <div className="stat-info">
                <h3>3</h3>
                <p>Health Scans</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
