import { useState, useRef } from 'react';
import { detectPlantDisease } from '../services/diseaseService';
import { Camera, Upload, X, AlertTriangle, CheckCircle, Zap, Shield, Bug, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import './DiseaseDetect.css';

export default function DiseaseDetect() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      const base64 = e.target.result.split(',')[1];
      setImage({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const analyze = async () => {
    if (!image) {
      toast.error('Please upload a plant leaf image first');
      return;
    }
    setLoading(true);
    try {
      const data = await detectPlantDisease(image.base64, image.mimeType);
      setResult(data);
      if (data.isHealthy) {
        toast.success('Plant looks healthy! ✅');
      } else if (data.isHealthy === false) {
        toast('Disease detected! Check results below.', { icon: '⚠️' });
      }
    } catch (err) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
  };

  const getSeverityColor = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'mild') return { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.2)' };
    if (s === 'moderate') return { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)' };
    return { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.2)' };
  };

  const getUrgencyBadge = (urgency) => {
    const u = urgency?.toLowerCase();
    if (u === 'low') return 'badge-success';
    if (u === 'medium') return 'badge-warning';
    if (u === 'high') return 'badge-danger';
    return 'badge-danger';
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>📸 Plant Disease Detection</h1>
        <p>Upload a plant leaf image for AI-powered disease diagnosis and treatment suggestions</p>
      </div>

      <div className="disease-layout">
        {/* Upload Section */}
        <div className="upload-section">
          <div
            className={`upload-zone card ${dragActive ? 'drag-active' : ''} ${imagePreview ? 'has-image' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileRef.current?.click()}
          >
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Plant leaf" />
                <button className="clear-btn" onClick={(e) => { e.stopPropagation(); clearImage(); }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon-wrap">
                  <Camera size={32} />
                </div>
                <h3>Upload Plant Leaf Image</h3>
                <p>Drag & drop or click to browse</p>
                <span className="upload-formats">Supports: JPG, PNG, WebP</span>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          <div className="upload-actions">
            <button
              className="btn btn-secondary"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={16} /> Choose Image
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={analyze}
              disabled={!image || loading}
              style={{ flex: 1 }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap size={18} /> Analyze Disease
                </>
              )}
            </button>
          </div>

          {/* How it works */}
          <div className="how-it-works card">
            <h3 className="card-title">How It Works</h3>
            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <div>
                  <strong>Upload</strong>
                  <p>Take a clear photo of the affected leaf</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div>
                  <strong>Analyze</strong>
                  <p>AI examines the leaf for disease patterns</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div>
                  <strong>Get Results</strong>
                  <p>Receive diagnosis with treatment plans</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {result ? (
            <div className="disease-results stagger">
              {/* Status Card */}
              <div className={`card status-card ${result.isHealthy ? 'healthy' : result.isHealthy === false ? 'diseased' : 'unknown'}`}>
                <div className="status-icon-wrap">
                  {result.isHealthy ? <CheckCircle size={28} /> : result.isHealthy === false ? <AlertTriangle size={28} /> : <Bug size={28} />}
                </div>
                <div className="status-info">
                  <h2>{result.diseaseName}</h2>
                  <div className="status-badges">
                    {result.plantType && <span className="badge badge-info"><Leaf size={10} /> {result.plantType}</span>}
                    {result.confidence && <span className="badge badge-success">{result.confidence}% Confidence</span>}
                    {result.severity && (
                      <span 
                        className="badge" 
                        style={{
                          background: getSeverityColor(result.severity).bg,
                          color: getSeverityColor(result.severity).color,
                          border: `1px solid ${getSeverityColor(result.severity).border}`,
                        }}
                      >
                        {result.severity} Severity
                      </span>
                    )}
                    {result.urgency && <span className={`badge ${getUrgencyBadge(result.urgency)}`}>{result.urgency} Urgency</span>}
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              {result.symptoms?.length > 0 && (
                <div className="card">
                  <h3 className="card-title"><Bug size={16} /> Symptoms Detected</h3>
                  <ul className="detail-list">
                    {result.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Causes */}
              {result.causes?.length > 0 && (
                <div className="card">
                  <h3 className="card-title"><AlertTriangle size={16} /> Possible Causes</h3>
                  <ul className="detail-list">
                    {result.causes.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {/* Treatment */}
              {result.treatment && (
                <div className="card treatment-card">
                  <h3 className="card-title"><Shield size={16} /> Treatment Plan</h3>
                  <div className="treatment-grid">
                    {result.treatment.chemical?.length > 0 && (
                      <div className="treatment-section">
                        <h4>🧪 Chemical Treatment</h4>
                        <ul>{result.treatment.chemical.map((t, i) => <li key={i}>{t}</li>)}</ul>
                      </div>
                    )}
                    {result.treatment.organic?.length > 0 && (
                      <div className="treatment-section">
                        <h4>🌿 Organic Treatment</h4>
                        <ul>{result.treatment.organic.map((t, i) => <li key={i}>{t}</li>)}</ul>
                      </div>
                    )}
                    {result.treatment.cultural?.length > 0 && (
                      <div className="treatment-section">
                        <h4>🌾 Cultural Practices</h4>
                        <ul>{result.treatment.cultural.map((t, i) => <li key={i}>{t}</li>)}</ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prevention */}
              {result.prevention?.length > 0 && (
                <div className="card">
                  <h3 className="card-title"><Shield size={16} /> Prevention Tips</h3>
                  <ul className="detail-list">
                    {result.prevention.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}

              {/* Additional Notes */}
              {result.additionalNotes && (
                <div className="card">
                  <h3 className="card-title">📝 Additional Notes</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-sm)' }}>{result.additionalNotes}</p>
                </div>
              )}

              {/* Raw Response Fallback */}
              {result.rawResponse && (
                <div className="card">
                  <h3 className="card-title">AI Analysis</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: 'var(--text-sm)' }}>{result.rawResponse}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔬</div>
              <h3>Ready to Analyze</h3>
              <p>Upload a clear image of a plant leaf to detect diseases and get treatment recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
