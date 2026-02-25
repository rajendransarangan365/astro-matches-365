import React, { useState } from 'react';
import PersonForm from './components/PersonForm';
import PoruthamResult from './components/PoruthamResult';
import JathagamCalculator from './components/JathagamCalculator';
import MatchFinder from './components/MatchFinder';
import { Heart, Sparkles, LogOut, Save, CheckCircle2, History, User, Calculator, HeartHandshake, Search } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPassword from './components/ForgotPassword';
import ProfileSettingsModal from './components/ProfileSettingsModal';

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

  if (loading) return <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>Loading...</div>;

  if (!isAuthenticated) {
    if (authMode === 'login') return <LoginPage onSwitch={() => setAuthMode('signup')} onForgot={() => setAuthMode('forgot-password')} />;
    if (authMode === 'signup') return <SignupPage onSwitch={() => setAuthMode('login')} />;
    if (authMode === 'forgot-password') return <ForgotPassword onBack={() => setAuthMode('login')} />;
  }

  return (
    <>
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Modern Navbar */}
      <nav className="navbar">
        <button
          className="nav-brand"
          onClick={() => setIsProfileModalOpen(true)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem', transition: 'background 0.2s', outline: 'none'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}>
            <User size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1 }}>வணக்கம்,</span>
            <strong style={{ fontSize: '0.9rem', lineHeight: 1.2 }}>{user?.name}</strong>
          </div>
        </button>

        {/* Page Tabs */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activePage === 'matching' ? 'active' : ''}`}
            onClick={() => setActivePage('matching')}
          >
            <HeartHandshake size={14} /> பொருத்தம்
          </button>
          <button
            className={`nav-tab ${activePage === 'jathagam' ? 'active' : ''}`}
            onClick={() => setActivePage('jathagam')}
          >
            <Calculator size={14} /> ஜாதகம்
          </button>
          <button
            className={`nav-tab ${activePage === 'matches' ? 'active' : ''}`}
            onClick={() => setActivePage('matches')}
          >
            <Search size={14} /> தேடல்
          </button>
          <button
            className={`nav-tab ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              if (activePage !== 'dashboard') fetchMatches();
              setActivePage('dashboard');
            }}
          >
            <History size={14} /> Dashboard
          </button>
        </div>

        <div className="nav-actions">
          <button className="nav-btn danger" onClick={logout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      {/* Page Content */}
      {activePage === 'jathagam' ? (
        <JathagamCalculator />
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
