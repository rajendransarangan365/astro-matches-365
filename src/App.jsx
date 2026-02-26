import React, { useState, useEffect } from 'react';
import PersonForm from './components/PersonForm';
import PoruthamResult from './components/PoruthamResult';
import JathagamCalculator from './components/JathagamCalculator';
import MatchFinder from './components/MatchFinder';
import { Heart, Sparkles, LogOut, Save, CheckCircle2, History, User, Calculator, HeartHandshake, Search, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPassword from './components/ForgotPassword';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import BackgroundEffects from './components/BackgroundEffects';

import { useProfiles } from './hooks/useProfiles';
import { usePorutham } from './hooks/usePorutham';
import { useMatches } from './hooks/useMatches';
import Dashboard from './components/Dashboard';

function App() {
  const { user, token, logout, isAuthenticated, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [activePage, setActivePage] = useState('matching'); // 'matching', 'jathagam', 'matches', 'dashboard'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [brideData, setBrideData] = useState({ name: '', starId: '', rasiId: '', rasiChart: {}, navamsamChart: {}, birthPlace: '', birthTime: '', dob: '', meridian: 'AM' });
  const [groomData, setGroomData] = useState({ name: '', starId: '', rasiId: '', rasiChart: {}, navamsamChart: {}, birthPlace: '', birthTime: '', dob: '', meridian: 'AM' });

  const { savedBrides, savedGrooms, profileSaveStatus, handleSaveProfile, handleDeleteProfile } = useProfiles(token);
  const { savedMatches, fetchMatches } = useMatches(token);
  const { result, saveStatus, handleCalculate, handleSaveMatch } = usePorutham(token, brideData, groomData);

  // Effect to automatically switch to admin dashboard if an admin just logged in
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin && activePage === 'matching' && authMode === 'admin-login') {
      setActivePage('admin');
      setAuthMode('login'); // Reset auth mode for next time
    }
  }, [isAuthenticated, user, activePage, authMode]);

  if (loading) return <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>Loading...</div>;

  if (!isAuthenticated) {
    if (authMode === 'login') return <LoginPage onSwitch={() => setAuthMode('signup')} onForgot={() => setAuthMode('forgot-password')} onAdmin={() => setAuthMode('admin-login')} />;
    if (authMode === 'signup') return <SignupPage onSwitch={() => setAuthMode('login')} />;
    if (authMode === 'forgot-password') return <ForgotPassword onBack={() => setAuthMode('login')} />;
    if (authMode === 'admin-login') return <AdminLogin onBack={() => setAuthMode('login')} />;
  }

  return (
    <>
      <BackgroundEffects />
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Top Header Bar */}
      <nav className="navbar">
        <div className="nav-header">
          <button
            className="nav-user-btn"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <div className="nav-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="nav-username">{user?.name}</span>
          </button>

          <div className="nav-header-center">
            <Heart size={16} className="nav-logo-icon" />
            <span className="nav-app-name">பொருத்தம்</span>
          </div>

          <button className="nav-logout-btn" onClick={logout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* Bottom Tab Bar (Mobile) / Inline Tabs (Desktop) */}
      <div className="bottom-tab-bar">
        {[
          { id: 'matching', icon: HeartHandshake, label: 'பொருத்தம்' },
          { id: 'jathagam', icon: Calculator, label: 'ஜாதகம்' },
          { id: 'matches', icon: Search, label: 'தேடல்' },
          { id: 'dashboard', icon: History, label: 'வரலாறு', onClick: fetchMatches },
          ...(user?.isAdmin ? [{ id: 'admin', icon: ShieldCheck, label: 'Admin' }] : [])
        ].map((tab) => {
          const isActive = activePage === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`bottom-tab ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (tab.onClick && activePage !== tab.id) tab.onClick();
                setActivePage(tab.id);
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="bottom-tab-label">{tab.label}</span>
              {isActive && <div className="bottom-tab-indicator" />}
            </button>
          );
        })}
      </div>

      {/* Page Content */}
      {activePage === 'jathagam' ? (
        <JathagamCalculator />
      ) : activePage === 'admin' ? (
        <div className="container" style={{ maxWidth: '1000px' }}>
          <AdminDashboard token={token} />
        </div>
      ) : activePage === 'matches' ? (
        <div className="container">
          <MatchFinder />
        </div>
      ) : activePage === 'dashboard' ? (
        <div className="container">
          <Dashboard
            savedBrides={savedBrides}
            savedGrooms={savedGrooms}
            savedMatches={savedMatches}
            onBack={() => setActivePage('matching')}
          />
        </div>
      ) : (
        <div className="container">
          <div className="title-section">
            <h1>திருமணப் பொருத்தம்</h1>
            <p>Tamil Marriage Compatibility Matching</p>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${!result ? 'active' : 'completed'}`}>
              {result ? '✓' : '1'}
            </div>
            <div className={`step-line ${result ? 'active' : ''}`}></div>
            <div className={`step-dot ${result ? 'active' : ''}`}>
              2
            </div>
          </div>

          {/* Two-column Bride & Groom forms */}
          <div className="two-column-grid">
            <PersonForm
              title="பெண் (Bride)"
              data={brideData}
              onChange={setBrideData}
              type="bride"
              profiles={savedBrides}
              onSaveProfile={handleSaveProfile}
              onDeleteProfile={handleDeleteProfile}
              saveStatus={profileSaveStatus.type === 'bride' ? profileSaveStatus.status : null}
            />

            <PersonForm
              title="ஆண் (Groom)"
              data={groomData}
              onChange={setGroomData}
              type="groom"
              profiles={savedGrooms}
              onSaveProfile={handleSaveProfile}
              onDeleteProfile={handleDeleteProfile}
              saveStatus={profileSaveStatus.type === 'groom' ? profileSaveStatus.status : null}
            />
          </div>

          {/* Action Buttons */}
          <div className="action-row">
            <button onClick={handleCalculate}>
              <Sparkles size={18} /> பொருத்தம் பார்க்க (Check Match)
            </button>

            {result && (
              <button
                className="btn-outline"
                onClick={handleSaveMatch}
                disabled={saveStatus === 'saving'}
                style={{
                  ...(saveStatus === 'success' && {
                    background: 'rgba(52, 211, 153, 0.1)',
                    borderColor: 'rgba(52, 211, 153, 0.3)',
                    color: 'var(--success)'
                  })
                }}
              >
                {saveStatus === 'saving' ? 'சேமிக்கப்படுகிறது...' :
                  saveStatus === 'success' ? <><CheckCircle2 size={18} /> சேமிக்கப்பட்டது</> :
                    <><Save size={18} /> சேமி (Save)</>}
              </button>
            )}
          </div>

          {result && (
            <div style={{ marginTop: '2rem' }}>
              <PoruthamResult data={result} />
            </div>
          )}

          <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', paddingBottom: '1rem' }}>
            <p>© 2026 Tamil Marriage Matching • Made with ❤️</p>
          </footer>
        </div>
      )}
    </>
  );
}

export default App;
