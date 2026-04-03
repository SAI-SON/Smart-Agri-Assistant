import { useState } from 'react';
import { getMarketPrices, getCropsList } from '../services/marketService';
import { TrendingUp, ArrowUpRight, ArrowDownRight, MapPin, IndianRupee, BarChart3, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import './MarketPrices.css';

const states = ['All India', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Gujarat', 'Bihar', 'West Bengal', 'Andhra Pradesh', 'Telangana', 'Kerala'];

export default function MarketPrices() {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedState, setSelectedState] = useState('All India');
  const [selectedMonth, setSelectedMonth] = useState('Current');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const crops = getCropsList();
  const monthOptions = ['Current', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthPrice = selectedMonth === 'Current'
    ? data?.currentPrice?.modal
    : data?.priceHistory?.find((item) => item.month === selectedMonth)?.price;

  const displayPrice = monthPrice ?? data?.currentPrice?.modal;

  const fetchPrices = async () => {
    if (!selectedCrop) {
      toast.error('Please select a crop');
      return;
    }
    setLoading(true);
    try {
      const result = await getMarketPrices(selectedCrop, selectedState);
      setData(result);
      setSelectedMonth('Current');
      toast.success('Market data loaded! 💰');
    } catch (err) {
      toast.error('Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  const trendIcon = () => {
    if (data?.trend === 'Rising') return <ArrowUpRight size={16} style={{ color: '#4ade80' }} />;
    if (data?.trend === 'Falling') return <ArrowDownRight size={16} style={{ color: '#f87171' }} />;
    return <TrendingUp size={16} style={{ color: '#fbbf24' }} />;
  };

  const trendBadge = () => {
    if (data?.trend === 'Rising') return 'badge-success';
    if (data?.trend === 'Falling') return 'badge-danger';
    return 'badge-warning';
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>💰 Market Price Tracker</h1>
        <p>Track real-time crop prices and find the best time to sell</p>
      </div>

      {/* Search Section */}
      <div className="market-search card">
        <div className="market-search-grid">
          <div className="input-group">
            <label className="input-label">Select Crop</label>
            <select
              className="input input-select"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="">Choose a crop...</option>
              {crops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">State / Region</label>
            <select
              className="input input-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Month</label>
            <select
              className="input input-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={fetchPrices}
            disabled={loading}
            style={{ alignSelf: 'flex-end' }}
          >
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              <>
                <BarChart3 size={18} /> Get Prices
              </>
            )}
          </button>
        </div>

        {/* Quick crop buttons */}
        <div className="quick-crops">
          {['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Soybean', 'Potato', 'Onion', 'Tomato'].map(c => (
            <button
              key={c}
              className={`city-chip ${selectedCrop === c ? 'active' : ''}`}
              onClick={() => setSelectedCrop(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {data && !data.rawResponse ? (
        <div className="market-results stagger">
          {/* Price Overview */}
          <div className="price-overview">
            <div className="card price-main">
              <div className="price-header">
                <h2>{data.crop}</h2>
                <span className={`badge ${trendBadge()}`}>
                  {trendIcon()} {data.trend}
                </span>
              </div>

              <div className="price-current">
                <div className="range-label" style={{ marginBottom: 'var(--space-2)' }}>
                  {selectedMonth === 'Current' ? 'Current Price' : `${selectedMonth} Price`} (1 kg)
                </div>
                <div className="price-value">
                  <span className="currency">₹</span>
                  <span className="amount">{displayPrice?.toLocaleString()}</span>
                  <span className="unit">/{data.currentPrice?.unit?.replace('per ', '').replace(' (INR)', '')}</span>
                </div>
              </div>

              <div className="price-range">
                <div className="range-item">
                  <span className="range-label">Min Price</span>
                  <span className="range-value">₹{data.currentPrice?.min?.toLocaleString()}</span>
                </div>
                <div className="range-item">
                  <span className="range-label">Max Price</span>
                  <span className="range-value">₹{data.currentPrice?.max?.toLocaleString()}</span>
                </div>
                {data.msp && (
                  <div className="range-item msp">
                    <span className="range-label">MSP</span>
                    <span className="range-value">₹{data.msp?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="market-info-cards">
              <div className="card info-card">
                <MapPin size={18} style={{ color: 'var(--color-secondary-light)' }} />
                <div>
                  <span className="info-label">Region</span>
                  <span className="info-value">{data.state}</span>
                </div>
              </div>
              <div className="card info-card">
                <IndianRupee size={18} style={{ color: 'var(--color-primary-400)' }} />
                <div>
                  <span className="info-label">Best Sell Time</span>
                  <span className="info-value">{data.bestTimeToSell}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price History Chart */}
          <div className="card chart-card">
            <div className="card-header">
              <h3 className="card-title">📈 Price Trend (12 Months)</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.priceHistory}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
                <XAxis dataKey="month" stroke="#6b8f7c" fontSize={12} />
                <YAxis stroke="#6b8f7c" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#162019', border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: '10px', color: '#f0fdf4',
                  }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Price']}
                />
                <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} fill="url(#priceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid-2">
            {/* Top Markets */}
            {data.topMarkets?.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">🏪 Top Markets</h3>
                </div>
                <div className="markets-list">
                  {data.topMarkets.map((m, i) => (
                    <div className="market-item" key={i}>
                      <div className="market-rank">#{i + 1}</div>
                      <div className="market-name">{m.market}</div>
                      <div className="market-price">₹{m.price?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Insight */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><Info size={16} /> Market Insight</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-sm)', marginTop: 'var(--space-3)' }}>
                {data.marketInsight}
              </p>
            </div>
          </div>
        </div>
      ) : data?.rawResponse ? (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>AI Response</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.rawResponse}</p>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>Select a Crop to View Prices</h3>
          <p>Choose a crop and state to get real-time market prices, trends, and selling insights.</p>
        </div>
      )}
    </div>
  );
}
