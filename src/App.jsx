import React, { useState, useEffect, useCallback } from 'react';
import PersonForm from './components/PersonForm';
import PoruthamResult from './components/PoruthamResult';
import { calculatePorutham } from './utils/poruthamLogic';
import { Heart, Sparkles, LogOut, Save, History, CheckCircle2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';

function App() {
  const { user, token, logout, isAuthenticated, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const [brideData, setBrideData] = useState({ name: '', starId: '', rasiId: '', rasiChart: {}, navamsamChart: {}, birthPlace: '', birthTime: '', dob: '', meridian: 'AM' });
  const [groomData, setGroomData] = useState({ name: '', starId: '', rasiId: '', rasiChart: {}, navamsamChart: {}, birthPlace: '', birthTime: '', dob: '', meridian: 'AM' });
  const [result, setResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const [savedBrides, setSavedBrides] = useState([]);
  const [savedGrooms, setSavedGrooms] = useState([]);
  const [profileSaveStatus, setProfileSaveStatus] = useState({ type: null, status: null });

  const fetchProfiles = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/profiles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedBrides(data.filter(p => p.type === 'bride'));
        setSavedGrooms(data.filter(p => p.type === 'groom'));
      }
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSaveProfile = async (type, profileData) => {
    if (!profileData.name || !profileData.dob) {
      alert("தயவுசெய்து பெயர் மற்றும் பிறந்த தேதியை நிரப்பவும் (Please fill Name and DOB to save)");
      return;
    }

    setProfileSaveStatus({ type, status: 'saving' });
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, profileData })
      });

      if (!response.ok) throw new Error('Failed to save profile');
      setProfileSaveStatus({ type, status: 'success' });
      fetchProfiles(); // Refresh the list
      setTimeout(() => setProfileSaveStatus({ type: null, status: null }), 3000);
    } catch (err) {
      alert("புரொஃபைல் சேமிப்பதில் பிழை: " + err.message);
      setProfileSaveStatus({ type: null, status: null });
    }
  };

  const handleCalculate = () => {
    if (!brideData.starId || !groomData.starId || !brideData.rasiId || !groomData.rasiId) {
      alert("தயவுசெய்து அனைத்து விவரங்களையும் பூர்த்தி செய்யவும் (Please fill all details)");
      return;
    }
    const matchResult = calculatePorutham(brideData, groomData);
    setResult({ ...matchResult, bride: brideData, groom: groomData });

    // Smooth scroll to results
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleSaveMatch = async () => {
    if (!result) return;
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          brideName: brideData.name,
          groomName: groomData.name,
          brideData,
          groomData,
          result
        })
      });

      if (!response.ok) throw new Error('Failed to save');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      alert("சேமிப்பதில் பிழை: " + err.message);
      setSaveStatus(null);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginPage onSwitch={() => setAuthMode('signup')} />
    ) : (
      <SignupPage onSwitch={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          வணக்கம், <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user?.name}</span>
        </div>
        <button onClick={logout} style={{ width: 'auto', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LogOut size={14} /> வெளியேறு (Logout)
        </button>
      </div>

      <div className="title-section">
        <h1>திருமணப் பொருத்தம்</h1>
        <p>Tamil Marriage Compatibility Matching</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <PersonForm
          title="பெண் (Bride)"
          data={brideData}
          onChange={setBrideData}
          type="bride"
          profiles={savedBrides}
          onSaveProfile={handleSaveProfile}
          saveStatus={profileSaveStatus.type === 'bride' ? profileSaveStatus.status : null}
        />

        <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
          <Heart size={32} />
        </div>

        <PersonForm
          title="ஆண் (Groom)"
          data={groomData}
          onChange={setGroomData}
          type="groom"
          profiles={savedGrooms}
          onSaveProfile={handleSaveProfile}
          saveStatus={profileSaveStatus.type === 'groom' ? profileSaveStatus.status : null}
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleCalculate} style={{ flex: 1 }}>
            <Sparkles size={20} /> பொருத்தம் பார்க்க (Check Match)
          </button>

          {result && (
            <button
              onClick={handleSaveMatch}
              disabled={saveStatus === 'saving'}
              style={{
                flex: 1,
                background: saveStatus === 'success' ? '#4ade80' : 'rgba(251, 191, 36, 0.1)',
                color: saveStatus === 'success' ? 'black' : 'var(--primary)',
                border: '1px solid var(--primary)'
              }}
            >
              {saveStatus === 'saving' ? 'சேமிக்கப்படுகிறது...' :
                saveStatus === 'success' ? <><CheckCircle2 size={20} /> சேமிக்கப்பட்டது</> :
                  <><Save size={20} /> விவரங்களைச் சேமி (Save Details)</>}
            </button>
          )}
        </div>

        {result && <PoruthamResult data={result} />}
      </div>

      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        <p>© 2026 Tamil Marriage Matching • Made with ❤️</p>
      </footer>
    </div>
  );
}

export default App;
