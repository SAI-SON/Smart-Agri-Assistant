import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, CloudSun, Sprout, Camera, TrendingUp, 
  MessageCircle, Settings, LogOut, ChevronLeft, ChevronRight, Leaf,
  User
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/weather', icon: CloudSun, label: 'Weather' },
  { path: '/crop-advisor', icon: Sprout, label: 'Crop Advisor' },
  { path: '/disease-detect', icon: Camera, label: 'Disease Detect' },
  { path: '/market', icon: TrendingUp, label: 'Market Prices' },
  { path: '/chat', icon: MessageCircle, label: 'AI Expert' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Leaf size={24} />
        </div>
        {!collapsed && (
          <div className="logo-text">
            <h2>SAIP</h2>
            <span>Smart Agri Intel</span>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        className="sidebar-toggle" 
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
            end={item.path === '/'}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" />
            ) : (
              <User size={18} />
            )}
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{user?.displayName || 'Farmer'}</span>
              <span className="user-role">Pro Farmer</span>
            </div>
          )}
        </div>
        <button 
          className="nav-item logout-btn" 
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
