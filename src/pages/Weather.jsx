import { useState, useEffect } from 'react';
import { getWeatherByCity, getForecastByCity, getWeatherEmoji, getFarmingTip, getWeatherIcon } from '../services/weatherService';
import { Search, MapPin, Droplets, Wind, Thermometer, Eye, Gauge, Sunrise, CloudRain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';
import './Weather.css';

export default function Weather() {
  const [city, setCity] = useState('Delhi');
  const [searchInput, setSearchInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeather('Delhi');
  }, []);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    try {
      const [weatherData, forecastData] = await Promise.all([
        getWeatherByCity(cityName),
        getForecastByCity(cityName),
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
      setTips(getFarmingTip(weatherData));
      setCity(weatherData.name);
    } catch (err) {
      toast.error('City not found. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput.trim());
      setSearchInput('');
    }
  };

  const get5DayForecast = () => {
    if (!forecast) return [];
    const daily = {};
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const key = date.toLocaleDateString('en-IN', { weekday: 'short' });
      if (!daily[key]) {
        daily[key] = {
          day: key,
          temp: item.main.temp,
          min: item.main.temp_min,
          max: item.main.temp_max,
          rain: (item.rain?.['3h'] || 0),
          icon: item.weather[0].icon,
          desc: item.weather[0].main,
          humidity: item.main.humidity,
        };
      } else {
        daily[key].min = Math.min(daily[key].min, item.main.temp_min);
        daily[key].max = Math.max(daily[key].max, item.main.temp_max);
        daily[key].rain += (item.rain?.['3h'] || 0);
      }
    });
    return Object.values(daily).slice(0, 5);
  };

  const getHourlyData = () => {
    if (!forecast) return [];
    return forecast.list.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      humidity: item.main.humidity,
      rain: Math.round((item.pop || 0) * 100),
    }));
  };

  const quickCities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur'];

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>🌦️ Weather Intelligence</h1>
        <p>Real-time weather data with AI farming insights</p>
      </div>

      {/* Search */}
      <div className="weather-search-section">
        <form onSubmit={handleSearch} className="weather-search-form">
          <div className="search-input-wrap">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Search'}
          </button>
        </form>
        <div className="quick-cities">
          {quickCities.map(c => (
            <button key={c} className={`city-chip ${city === c ? 'active' : ''}`} onClick={() => fetchWeather(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {weather && (
        <>
          {/* Main Weather Card */}
          <div className="weather-hero card">
            <div className="weather-hero-left">
              <div className="weather-location">
                <MapPin size={16} />
                <span>{weather.name}, {weather.sys?.country}</span>
              </div>
              <div className="weather-hero-temp">
                <span className="hero-emoji">{getWeatherEmoji(weather.weather[0].main)}</span>
                <h2>{Math.round(weather.main.temp)}°</h2>
              </div>
              <p className="weather-desc">{weather.weather[0].description}</p>
              <p className="weather-feels">Feels like {Math.round(weather.main.feels_like)}°C</p>
            </div>

            <div className="weather-hero-right">
              <div className="weather-metric">
                <Droplets size={18} />
                <div>
                  <span>{weather.main.humidity}%</span>
                  <small>Humidity</small>
                </div>
              </div>
              <div className="weather-metric">
                <Wind size={18} />
                <div>
                  <span>{weather.wind.speed} m/s</span>
                  <small>Wind Speed</small>
                </div>
              </div>
              <div className="weather-metric">
                <Gauge size={18} />
                <div>
                  <span>{weather.main.pressure} hPa</span>
                  <small>Pressure</small>
                </div>
              </div>
              <div className="weather-metric">
                <Eye size={18} />
                <div>
                  <span>{(weather.visibility / 1000).toFixed(1)} km</span>
                  <small>Visibility</small>
                </div>
              </div>
              <div className="weather-metric">
                <Thermometer size={18} />
                <div>
                  <span>{Math.round(weather.main.temp_min)}° / {Math.round(weather.main.temp_max)}°</span>
                  <small>Min / Max</small>
                </div>
              </div>
              <div className="weather-metric">
                <CloudRain size={18} />
                <div>
                  <span>{weather.clouds?.all || 0}%</span>
                  <small>Cloud Cover</small>
                </div>
              </div>
            </div>
          </div>

          <div className="weather-grid">
            {/* Hourly Forecast Chart */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📈 Hourly Forecast</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={getHourlyData()}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
                  <XAxis dataKey="time" stroke="#6b8f7c" fontSize={11} />
                  <YAxis stroke="#6b8f7c" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: '#162019',
                      border: '1px solid rgba(34,197,94,0.2)',
                      borderRadius: '10px',
                      color: '#f0fdf4',
                      fontSize: '13px',
                    }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#38bdf8" strokeWidth={2} fill="url(#tempGrad)" name="Temp °C" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Rain Probability */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🌧️ Rain Probability</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={getHourlyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
                  <XAxis dataKey="time" stroke="#6b8f7c" fontSize={11} />
                  <YAxis stroke="#6b8f7c" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: '#162019',
                      border: '1px solid rgba(34,197,94,0.2)',
                      borderRadius: '10px',
                      color: '#f0fdf4',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="rain" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Rain %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 5-Day Forecast */}
            <div className="card forecast-card">
              <div className="card-header">
                <h3 className="card-title">📅 5-Day Forecast</h3>
              </div>
              <div className="forecast-list">
                {get5DayForecast().map((day, i) => (
                  <div className="forecast-item" key={i}>
                    <span className="forecast-day">{day.day}</span>
                    <img src={getWeatherIcon(day.icon)} alt={day.desc} width={36} />
                    <span className="forecast-desc">{day.desc}</span>
                    <div className="forecast-temps">
                      <span className="temp-max">{Math.round(day.max)}°</span>
                      <span className="temp-min">{Math.round(day.min)}°</span>
                    </div>
                    <div className="forecast-humidity">
                      <Droplets size={12} />
                      {day.humidity}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Farming Tips */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🌾 Farming Recommendations</h3>
              </div>
              <div className="tips-list">
                {tips.map((tip, i) => (
                  <div className="tip-item" key={i}>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {loading && !weather && (
        <div className="loading-page">
          <div className="spinner spinner-lg"></div>
          <p>Fetching weather data...</p>
        </div>
      )}
    </div>
  );
}
