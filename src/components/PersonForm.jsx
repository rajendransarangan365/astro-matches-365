import React, { useState } from 'react';
import { STARS, RASIS } from '../data/poruthamData';
import { User, Star, Moon, BarChart3, ChevronDown, ChevronUp, MapPin, Calendar, Clock, Sparkles, Save, Download } from 'lucide-react';
import ChartInput from './ChartInput';
import { calculateAstroDetails } from '../utils/astroUtils';

// Cities available for birth place selection
const CITIES = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Vellore", "Thoothukudi", "Thanjavur", "Nagercoil",
    "Karaikudi", "Arimalam", "Sivaganga", "Kanyakumari", "Rameswaram",
    "Pondicherry", "Erode", "Kumbakonam", "Dindigul", "Virudhunagar",
    "Ramanathapuram", "Pudukkottai", "Nagapattinam", "Tiruvallur",
    "Villupuram", "Cuddalore", "Tiruvannamalai", "Krishnagiri",
    "Dharmapuri", "Kanchipuram", "Tiruppur"
];

const PersonForm = ({ title, data, onChange, type, profiles = [], onSaveProfile, saveStatus }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [calculating, setCalculating] = useState(false);

    // Get selected star to filter Rasi dropdown
    const selectedStar = STARS.find(s => s.id === data.starId);

    // Filter RASIS based on the selected star's mapping
    const availableRasis = selectedStar
        ? RASIS.filter(r => selectedStar.rasiMapping.some(rm => rm.rasiId === r.id))
        : RASIS;

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
            } else {
                alert("கணக்கீட்டில் பிழை! தயவுசெய்து மீண்டும் முயற்சிக்கவும்.");
            }
        } catch (err) {
            console.error(err);
            alert("கணக்கீட்டில் பிழை: " + err.message);
        } finally {
            setCalculating(false);
        }
    };

    return (
        <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: type === 'bride' ? '#f472b6' : '#60a5fa' }}>
                <User size={20} /> {title}
            </h3>

            {profiles && profiles.length > 0 && (
                <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                        <Download size={12} style={{ display: 'inline', marginRight: '4px' }} /> விரைவாக சேர்க்க (Quick Add)
                    </label>
                    <select
                        style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
                        onChange={(e) => {
                            const selectedProfile = profiles.find(p => p._id === e.target.value);
                            if (selectedProfile) {
                                onChange({ ...selectedProfile.profileData });
                            }
                        }}
                    >
                        <option value="">-- சேமிக்கப்பட்டதைத் தேர்ந்தெடுக்கவும் --</option>
                        {profiles.map(p => (
                            <option key={p._id} value={p._id}>
                                {p.profileData.name} {p.profileData.dob ? `(${p.profileData.dob})` : ''} - {p.profileData.birthPlace}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-grid" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {/* 1. Name */}
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label><User size={16} /> பெயர் (Name)</label>
                    <input
                        type="text"
                        placeholder="பெயர்"
                        value={data.name}
                        onChange={(e) => onChange({ ...data, name: e.target.value })}
                    />
                </div>

                {/* 2. Birth Place - Dropdown + Manual Input */}
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label><MapPin size={16} /> பிறந்த இடம் (Birth Place)</label>
                    <select
                        value={CITIES.includes(data.birthPlace) ? data.birthPlace : '__other__'}
                        onChange={(e) => {
                            if (e.target.value === '__other__') {
                                onChange({ ...data, birthPlace: '' });
                            } else {
                                onChange({ ...data, birthPlace: e.target.value });
                            }
                        }}
                    >
                        <option value="">-- தேர்ந்தெடுக்கவும் --</option>
                        {CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                        <option value="__other__">மற்றவை (Other)...</option>
                    </select>
                    {(!CITIES.includes(data.birthPlace) && data.birthPlace !== '' || data.birthPlace === '') && !CITIES.includes(data.birthPlace) && (
                        <input
                            type="text"
                            placeholder="ஊர் பெயர் (Type city name)"
                            value={data.birthPlace || ''}
                            onChange={(e) => onChange({ ...data, birthPlace: e.target.value })}
                            style={{ marginTop: '0.5rem' }}
                        />
                    )}
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

                {/* Calculate and Save Buttons */}
                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleCalculate}
                        disabled={calculating}
                        style={{ flex: 1, background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.2)', width: '100%', fontSize: '0.85rem' }}
                    >
                        {calculating ? 'கணக்கிடப்படுகிறது...' : <><Sparkles size={16} /> ஜாதகம் கணக்கிடு</>}
                    </button>
                    {onSaveProfile && (
                        <button
                            onClick={() => onSaveProfile(type, data)}
                            disabled={saveStatus === 'saving'}
                            style={{ flex: 1, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', width: '100%', fontSize: '0.85rem' }}
                        >
                            {saveStatus === 'saving' ? 'சேமிக்கிறது...' : <><Save size={16} /> சேமிக்க (Save)</>}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="input-group">
                        <label><Moon size={16} /> இராசி (Rasi)</label>
                        <select
                            value={data.rasiId}
                            onChange={(e) => onChange({ ...data, rasiId: parseInt(e.target.value) || '' })}
                        >
                            <option value="">தேர்ந்தெடுக்கவும்</option>
                            {availableRasis.map(r => {
                                // Find exactly which padas belong to this Rasi
                                const padas = selectedStar ? selectedStar.rasiMapping.find(rm => rm.rasiId === r.id)?.padas : "";
                                const padaText = padas ? ` (பாதம் ${padas})` : "";
                                return (
                                    <option key={r.id} value={r.id}>{r.nameTamil}{padaText}</option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="input-group">
                        <label><Star size={16} /> நட்சத்திரம் (Star)</label>
                        <select
                            value={data.starId}
                            onChange={(e) => {
                                const starId = parseInt(e.target.value) || '';
                                const newStar = STARS.find(s => s.id === starId);

                                // Auto-select Rasi if the star perfectly maps to exactly one Rasi
                                let newRasiId = data.rasiId;
                                if (newStar) {
                                    if (newStar.rasiMapping.length === 1) {
                                        newRasiId = newStar.rasiMapping[0].rasiId; // Auto-select
                                    } else if (!newStar.rasiMapping.some(rm => rm.rasiId === data.rasiId)) {
                                        newRasiId = ''; // Clear Rasi if current Rasi is invalid for new Star
                                    }
                                }

                                onChange({ ...data, starId, rasiId: newRasiId });
                            }}
                        >
                            <option value="">தேர்ந்தெடுக்கவும்</option>
                            {STARS.map(s => (
                                <option key={s.id} value={s.id}>{s.nameTamil}</option>
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
