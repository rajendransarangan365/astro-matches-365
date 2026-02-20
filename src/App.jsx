import React, { useState } from 'react';
import PersonForm from './components/PersonForm';
import PoruthamResult from './components/PoruthamResult';
import { calculatePorutham } from './utils/poruthamLogic';
import { Heart, Sparkles } from 'lucide-react';

function App() {
  const [brideData, setBrideData] = useState({ name: '', starId: '', rasiId: '', rasiChart: {}, navamsamChart: {} });
  const [groomData, setGroomData] = useState({ name: '', starId: '', rasiId: '', rasiChart: {}, navamsamChart: {} });
  const [result, setResult] = useState(null);

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

  return (
    <div className="container">
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
        />

        <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
          <Heart size={32} />
        </div>

        <PersonForm
          title="ஆண் (Groom)"
          data={groomData}
          onChange={setGroomData}
          type="groom"
        />

        <button onClick={handleCalculate}>
          <Sparkles size={20} /> பொருத்தம் பார்க்க (Check Match)
        </button>

        {result && <PoruthamResult data={result} />}
      </div>

      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        <p>© 2026 Tamil Marriage Matching • Made with ❤️</p>
      </footer>
    </div>
  );
}

export default App;
