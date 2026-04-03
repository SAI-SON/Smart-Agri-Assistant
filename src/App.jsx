import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Leaf } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import CropAdvisor from './pages/CropAdvisor';
import DiseaseDetect from './pages/DiseaseDetect';
import MarketPrices from './pages/MarketPrices';
import Chat from './pages/Chat';

function LoadingScreen() {
  return (
    <div className="loading-page loading-page-shell">
      <div className="loading-card">
        <div className="loading-brand">
          <div className="loading-brand-icon">
            <Leaf size={28} />
          </div>
          <div>
            <h1>SAIP</h1>
            <p>Smart Agri Intelligence Platform</p>
          </div>
        </div>

        <div className="spinner spinner-lg" aria-hidden="true"></div>
        <p className="loading-title">Loading your farm workspace</p>
        <span className="loading-subtitle">Preparing authentication and dashboard data.</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/weather" element={
        <ProtectedRoute>
          <AppLayout><Weather /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/crop-advisor" element={
        <ProtectedRoute>
          <AppLayout><CropAdvisor /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/disease-detect" element={
        <ProtectedRoute>
          <AppLayout><DiseaseDetect /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/market" element={
        <ProtectedRoute>
          <AppLayout><MarketPrices /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <AppLayout><Chat /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#162019',
              color: '#f0fdf4',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#0a0f0d' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0a0f0d' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
