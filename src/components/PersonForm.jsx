import React, { useState } from 'react';
import { STARS, RASIS } from '../data/poruthamData';
import { User, Star, Moon, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import ChartInput from './ChartInput';

const PersonForm = ({ title, data, onChange, type }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: type === 'bride' ? '#f472b6' : '#60a5fa' }}>
                <User size={20} /> {title}
            </h3>
            <div className="form-grid" style={{ marginTop: '1rem' }}>
                <div className="input-group">
                    <label><User size={16} /> பெயர் (Name)</label>
                    <input
                        type="text"
                        placeholder="பெயர்"
                        value={data.name}
                        onChange={(e) => onChange({ ...data, name: e.target.value })}
                    />
                </div>

                <div className="input-group">
                    <label><Moon size={16} /> இராசி (Rasi)</label>
                    <select
                        value={data.rasiId}
                        onChange={(e) => onChange({ ...data, rasiId: e.target.value })}
                    >
                        <option value="">தேர்ந்தெடுக்கவும்</option>
                        {RASIS.map(r => (
                            <option key={r.id} value={r.id}>{r.nameTamil} ({r.nameEnglish})</option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label><Star size={16} /> நட்சத்திரம் (Star)</label>
                    <select
                        value={data.starId}
                        onChange={(e) => onChange({ ...data, starId: e.target.value })}
                    >
                        <option value="">தேர்ந்தெடுக்கவும்</option>
                        {STARS.map(s => (
                            <option key={s.id} value={s.id}>{s.nameTamil} ({s.nameEnglish})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: 'auto',
                        padding: '0.5rem 1rem',
                        margin: '0 auto'
                    }}
                >
                    <BarChart3 size={14} /> கூடுதல் விவரங்கள் (Advanced Details) {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showAdvanced && (
                    <div style={{ marginTop: '1rem' }}>
                        <ChartInput
                            title="ராசிக் கட்டம் - கிரகங்கள் (Rasi Chart Planets)"
                            chartData={data.rasiChart || {}}
                            onChange={(val) => onChange({ ...data, rasiChart: val })}
                        />
                        <ChartInput
                            title="நவாம்சம் - கிரகங்கள் (Navamsam Planets)"
                            chartData={data.navamsamChart || {}}
                            onChange={(val) => onChange({ ...data, navamsamChart: val })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonForm;
