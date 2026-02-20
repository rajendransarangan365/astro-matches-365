import React, { useState } from 'react';
import { STARS, RASIS } from '../data/poruthamData';
import { User, Star, Moon, BarChart3, ChevronDown, ChevronUp, MapPin, Calendar, Clock, Sparkles } from 'lucide-react';
import ChartInput from './ChartInput';
import { calculateAstroDetails } from '../utils/astroUtils';

const PersonForm = ({ title, data, onChange, type }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [calculating, setCalculating] = useState(false);

    const handleCalculate = async () => {
        if (!data.dob || !data.birthTime || !data.birthPlace) {
            alert("தயவுசெய்து பிறந்த தேதி, நேரம் மற்றும் இடத்தை உள்ளிடவும்.");
            return;
        }
        setCalculating(true);
        try {
            const results = await calculateAstroDetails(data.dob, data.birthTime, data.birthPlace, data.meridian || 'AM');
            if (results) {
                onChange({
                    ...data,
                    rasiId: results.rasiId,
                    starId: results.starId,
                    rasiChart: results.rasiChart,
                    navamsamChart: results.navamsamChart,
                    lagnam: results.lagnam
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCalculating(false);
        }
    };

    return (
        <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: type === 'bride' ? '#f472b6' : '#60a5fa' }}>
                <User size={20} /> {title}
            </h3>

            <div className="form-grid" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* 1. Name */}
                <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
                    <label><User size={16} /> பெயர் (Name)</label>
                    <input
                        type="text"
                        placeholder="பெயர்"
                        value={data.name}
                        onChange={(e) => onChange({ ...data, name: e.target.value })}
                    />
                </div>

                {/* 2. Birth Place */}
                <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
                    <label><MapPin size={16} /> பிறந்த இடம் (Birth Place)</label>
                    <input
                        type="text"
                        placeholder="ஊர் (e.g. Chennai, Madurai...)"
                        value={data.birthPlace || ''}
                        onChange={(e) => onChange({ ...data, birthPlace: e.target.value })}
                    />
                </div>

                {/* 3. DOB */}
                <div className="input-group">
                    <label><Calendar size={16} /> பிறந்த தேதி (DOB)</label>
                    <input
                        type="date"
                        value={data.dob || ''}
                        onChange={(e) => onChange({ ...data, dob: e.target.value })}
                    />
                </div>

                {/* 4. Time with AM/PM */}
                <div className="input-group">
                    <label><Clock size={16} /> நேரம் (Time)</label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input
                            type="time"
                            style={{ flex: 1 }}
                            value={data.birthTime || ''}
                            onChange={(e) => onChange({ ...data, birthTime: e.target.value })}
                        />
                        <select
                            style={{ width: '70px', padding: '0 0.5rem' }}
                            value={data.meridian || 'AM'}
                            onChange={(e) => onChange({ ...data, meridian: e.target.value })}
                        >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                        </select>
                    </div>
                </div>

                {/* Calculate Button */}
                <div style={{ gridColumn: '1 / span 2', marginTop: '0.5rem' }}>
                    <button
                        onClick={handleCalculate}
                        disabled={calculating}
                        style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.2)', width: '100%', fontSize: '0.85rem' }}
                    >
                        {calculating ? 'கணக்கிடப்படுகிறது...' : <><Sparkles size={16} /> ஜாதகம் கணக்கிடு (Calculate Chart)</>}
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
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
                    <BarChart3 size={14} /> கட்டங்கள் சரிபார்க்க (Verify Charts) {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showAdvanced && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <ChartInput
                            title="ராசிக் கட்டம் - கிரகங்கள் (Rasi Chart)"
                            chartData={data.rasiChart || {}}
                            onChange={(val) => onChange({ ...data, rasiChart: val })}
                        />
                        <ChartInput
                            title="நவாம்சம் - கிரகங்கள் (Navamsam)"
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
