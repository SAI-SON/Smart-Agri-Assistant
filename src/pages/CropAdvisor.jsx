import { useState } from 'react';
import { getCropRecommendation } from '../services/cropService';
import { Sprout, MapPin, Droplets, Layers, Calendar, Ruler, Sparkles, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './CropAdvisor.css';

const soilTypes = ['Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Sandy', 'Clayey', 'Loamy', 'Peaty', 'Saline'];
const seasons = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)', 'Perennial'];
const waterOptions = ['Abundant (Canal/River)', 'Moderate (Well/Borewell)', 'Limited (Rain-fed)', 'Drip Irrigation'];

export default function CropAdvisor() {
  const [form, setForm] = useState({
    soilType: '',
    phLevel: '',
    location: '',
    season: '',
    waterAvailability: '',
    landSize: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.soilType || !form.location || !form.season) {
      toast.error('Please fill soil type, location, and season');
      return;
    }
    setLoading(true);
    try {
      const data = await getCropRecommendation(form);
      setResult(data);
      toast.success('Crop recommendations ready! 🌱');
    } catch (err) {
      toast.error('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 85) return '#22c55e';
    if (conf >= 70) return '#fbbf24';
    return '#f87171';
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>🌱 AI Crop Advisor</h1>
        <p>Get intelligent crop recommendations based on your farm conditions</p>
      </div>

      <div className="crop-layout">
        {/* Input Form */}
        <div className="card crop-form-card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-6)' }}>
            <Sparkles size={18} style={{ color: 'var(--color-primary-400)' }} />
            Farm Details
          </h3>

          <form onSubmit={handleSubmit} className="crop-form">
            <div className="input-group">
              <label className="input-label">
                <Layers size={14} /> Soil Type *
              </label>
              <select
                className="input input-select"
                value={form.soilType}
                onChange={(e) => setForm({ ...form, soilType: e.target.value })}
                required
              >
                <option value="">Select soil type...</option>
                {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">
                <AlertCircle size={14} /> pH Level
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                className="input"
                placeholder="e.g., 6.5"
                value={form.phLevel}
                onChange={(e) => setForm({ ...form, phLevel: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <MapPin size={14} /> Location / Region *
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Punjab, Tamil Nadu"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Calendar size={14} /> Season *
              </label>
              <select
                className="input input-select"
                value={form.season}
                onChange={(e) => setForm({ ...form, season: e.target.value })}
                required
              >
                <option value="">Select season...</option>
                {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">
                <Droplets size={14} /> Water Availability
              </label>
              <select
                className="input input-select"
                value={form.waterAvailability}
                onChange={(e) => setForm({ ...form, waterAvailability: e.target.value })}
              >
                <option value="">Select water source...</option>
                {waterOptions.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">
                <Ruler size={14} /> Land Size (acres)
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g., 5 acres"
                value={form.landSize}
                onChange={(e) => setForm({ ...form, landSize: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Get Recommendations
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="crop-results">
          {result && result.recommendations?.length > 0 ? (
            <>
              {/* Crop Cards */}
              <div className="crop-cards stagger">
                {result.recommendations.map((crop, i) => (
                  <div className="card crop-card" key={i}>
                    <div className="crop-card-header">
                      <div className="crop-rank">#{i + 1}</div>
                      <div className="crop-name-section">
                        <h3>{crop.crop}</h3>
                        <div className="crop-meta">
                          <span className="badge badge-info">
                            <Clock size={10} /> {crop.growingPeriod}
                          </span>
                          <span className="badge badge-success">
                            <TrendingUp size={10} /> {crop.marketDemand} Demand
                          </span>
                        </div>
                      </div>
                      <div className="confidence-ring" style={{ '--conf-color': getConfidenceColor(crop.confidence) }}>
                        <svg viewBox="0 0 36 36" className="conf-svg">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="var(--conf-color)"
                            strokeWidth="3"
                            strokeDasharray={`${crop.confidence}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>{crop.confidence}%</span>
                      </div>
                    </div>

                    <div className="crop-details">
                      <div className="crop-detail">
                        <span className="detail-label">Expected Yield</span>
                        <span className="detail-value">{crop.expectedYield}</span>
                      </div>
                      <div className="crop-detail">
                        <span className="detail-label">Water Needs</span>
                        <span className="detail-value">{crop.waterNeeds}</span>
                      </div>
                      <div className="crop-detail">
                        <span className="detail-label">Est. Profit</span>
                        <span className="detail-value highlight">{crop.estimatedProfit}</span>
                      </div>
                    </div>

                    {crop.tips && crop.tips.length > 0 && (
                      <div className="crop-tips">
                        <h4>Growing Tips:</h4>
                        <ul>
                          {crop.tips.map((tip, j) => (
                            <li key={j}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="advice-cards grid-2">
                {result.soilAdvice && (
                  <div className="card advice-card">
                    <h3 className="card-title">🌍 Soil Management</h3>
                    <p>{result.soilAdvice}</p>
                  </div>
                )}
                {result.fertilizerSuggestion && (
                  <div className="card advice-card">
                    <h3 className="card-title">🧪 Fertilizer Guide</h3>
                    <p>{result.fertilizerSuggestion}</p>
                  </div>
                )}
                {result.seasonalNotes && (
                  <div className="card advice-card" style={{ gridColumn: '1 / -1' }}>
                    <h3 className="card-title">📋 Seasonal Notes</h3>
                    <p>{result.seasonalNotes}</p>
                  </div>
                )}
              </div>
            </>
          ) : result?.rawResponse ? (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>AI Response</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.rawResponse}</p>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🌾</div>
              <h3>Enter Your Farm Details</h3>
              <p>Fill in the form with your soil type, location, and season to get AI-powered crop recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
