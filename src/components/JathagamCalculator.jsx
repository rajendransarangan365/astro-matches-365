import React, { useState } from 'react';
import { STARS, RASIS } from '../data/poruthamData';
import { calculateAstroDetails, PLANET_TAMIL_NAMES } from '../utils/astroUtils';
import RasiKattam from './RasiKattam';
import SearchableSelect from './SearchableSelect';
import { MapPin, Calendar, Clock, Sparkles, User, Moon, Star, Sun, ArrowLeft } from 'lucide-react';

const CITIES = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Vellore", "Thoothukudi", "Thanjavur", "Nagercoil",
    "Karaikudi", "Arimalam", "Sivaganga", "Kanyakumari", "Rameswaram",
    "Pondicherry", "Erode", "Kumbakonam", "Dindigul", "Virudhunagar",
    "Ramanathapuram", "Pudukkottai", "Nagapattinam", "Tiruvallur",
    "Villupuram", "Cuddalore", "Tiruvannamalai", "Krishnagiri",
    "Dharmapuri", "Kanchipuram", "Tiruppur"
];

const CITY_OPTIONS = CITIES.map(c => ({ value: c, label: c }));

const JathagamCalculator = ({ onBack }) => {
    const [name, setName] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [dob, setDob] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [meridian, setMeridian] = useState('AM');
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleCalculate = async () => {
        if (!dob || !birthTime || !birthPlace) {
            setError("தயவுசெய்து பிறந்த தேதி, நேரம் மற்றும் இடத்தை உள்ளிடவும்.");
            return;
        }
        setError('');
        setCalculating(true);
        try {
            const res = await calculateAstroDetails(dob, birthTime, birthPlace, meridian);
            if (res) {
                setResult(res);
            } else {
                setError("கணக்கீட்டில் பிழை! தயவுசெய்து மீண்டும் முயற்சிக்கவும்.");
            }
        } catch (err) {
            console.error(err);
            setError("கணக்கீட்டில் பிழை: " + err.message);
        } finally {
            setCalculating(false);
        }
    };

    const rasi = result ? RASIS.find(r => r.id === result.rasiId) : null;
    const star = result ? STARS.find(s => s.id === result.starId) : null;
    const lagnamRasi = result ? RASIS.find(r => r.id === result.lagnam) : null;

    // Format DOB for display
    const formatDob = (d) => {
        if (!d) return '';
        const [y, m, day] = d.split('-');
        return `${day}-${m}-${y}`;
    };

    return (
        <div className="container">
            {/* Title */}
            <div className="title-section">
                <h1>ஜாதக கணிப்பான்</h1>
                <p>Birth Chart Calculator (Jathagam)</p>
            </div>

            {/* Input Card */}
            <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto 2rem' }}>
                <div className="person-header" style={{ color: 'var(--accent-light)' }}>
                    <Sun size={18} /> பிறந்த விவரங்கள் (Birth Details)
                </div>

                <div className="form-grid">
                    {/* Name */}
                    <div className="input-group">
                        <label><User size={12} /> பெயர் (Name)</label>
                        <input
                            type="text"
                            placeholder="உங்கள் பெயர்"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Birth Place */}
                    <div className="input-group">
                        <label><MapPin size={12} /> பிறந்த இடம் (Place)</label>
                        <SearchableSelect
                            options={CITY_OPTIONS}
                            value={CITIES.includes(birthPlace) ? birthPlace : ''}
                            onChange={(val) => setBirthPlace(val)}
                            placeholder="-- நகரத்தை தேடு --"
                            icon={<MapPin size={14} />}
                            emptyMessage="நகரம் கிடைக்கவில்லை"
                        />
                        {!CITIES.includes(birthPlace) && (
                            <input
                                type="text"
                                placeholder="ஊர் பெயர் (Type city name)"
                                value={birthPlace}
                                onChange={(e) => setBirthPlace(e.target.value)}
                                style={{ marginTop: '0.375rem' }}
                            />
                        )}
                    </div>

                    {/* DOB + Time Row */}
                    <div className="date-time-row" style={{ gridColumn: '1 / -1' }}>
                        <div className="input-group">
                            <label><Calendar size={12} /> பிறந்த தேதி (DOB)</label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label><Clock size={12} /> நேரம் (Time)</label>
                            <input
                                type="time"
                                value={birthTime}
                                onChange={(e) => setBirthTime(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ visibility: 'hidden' }}>AM</label>
                            <select
                                value={meridian}
                                onChange={(e) => setMeridian(e.target.value)}
                                style={{ width: '70px' }}
                            >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            gridColumn: '1 / -1',
                            padding: '0.6rem 0.875rem',
                            background: 'rgba(248, 113, 113, 0.08)',
                            border: '1px solid rgba(248, 113, 113, 0.2)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--danger)',
                            fontSize: '0.85rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Calculate Button */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <button onClick={handleCalculate} disabled={calculating}>
                            <Sparkles size={18} />
                            {calculating ? 'கணக்கிடப்படுகிறது...' : 'ஜாதகம் கணக்கிடு (Calculate)'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div style={{ animation: 'slideUp 0.5s ease-out' }}>
                    {/* Summary Card */}
                    <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto 1.5rem' }}>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                                {name || 'ஜாதக விவரம்'}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                {formatDob(dob)} • {birthTime} {meridian} • {birthPlace}
                            </p>
                        </div>

                        {/* Key Details Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1rem',
                            marginBottom: '0.5rem'
                        }}>
                            {/* Rasi */}
                            <div style={{
                                textAlign: 'center',
                                padding: '1rem',
                                background: 'rgba(139, 92, 246, 0.06)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid rgba(139, 92, 246, 0.12)'
                            }}>
                                <Moon size={20} style={{ color: 'var(--accent-light)', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                    இராசி (Rasi)
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-light)' }}>
                                    {rasi?.nameTamil || '—'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {rasi?.nameEnglish || ''}
                                </div>
                            </div>

                            {/* Star */}
                            <div style={{
                                textAlign: 'center',
                                padding: '1rem',
                                background: 'rgba(245, 158, 11, 0.06)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid rgba(245, 158, 11, 0.12)'
                            }}>
                                <Star size={20} style={{ color: 'var(--primary-light)', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                    நட்சத்திரம் (Star)
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-light)' }}>
                                    {star?.nameTamil || '—'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Pada {star ? Math.floor((result.starId - 1) % 4) + 1 : ''}
                                </div>
                            </div>

                            {/* Lagnam */}
                            <div style={{
                                textAlign: 'center',
                                padding: '1rem',
                                background: 'rgba(52, 211, 153, 0.06)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid rgba(52, 211, 153, 0.12)'
                            }}>
                                <Sun size={20} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                    லக்கினம் (Lagnam)
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--success)' }}>
                                    {lagnamRasi?.nameTamil || '—'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {lagnamRasi?.nameEnglish || ''}
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.75rem',
                            marginTop: '1rem',
                            padding: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem'
                        }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>இராசி அதிபதி: </span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{rasi?.lord || '—'}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>கணம்: </span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{star?.gana || '—'}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>யோனி: </span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{star?.yoni || '—'}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>ரஜ்ஜு: </span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{star?.rajju || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts side by side */}
                    <div className="two-column-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {/* Rasi Chart */}
                        <div className="glass-card">
                            <RasiKattam
                                title="ராசிக் கட்டம் (Rasi Chart)"
                                chartData={result.rasiChart}
                                color="var(--accent-light)"
                                highlightRasiId={result.rasiId}
                            />
                        </div>

                        {/* Navamsam Chart */}
                        <div className="glass-card">
                            <RasiKattam
                                title="நவாம்சம் (Navamsam D9)"
                                chartData={result.navamsamChart}
                                color="var(--primary-light)"
                                highlightRasiId={null}
                            />
                        </div>
                    </div>

                    {/* Planet Positions Table */}
                    <div className="glass-card" style={{ maxWidth: '650px', margin: '1.5rem auto 0' }}>
                        <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                            கிரக நிலைகள் (Planet Positions)
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {Object.entries(result.rasiChart).sort((a, b) => a[0] - b[0]).map(([houseId, planets]) => {
                                const houseRasi = RASIS.find(r => r.id === parseInt(houseId));
                                return planets.filter(p => p !== 'La').map(planetId => {
                                    const planetName = {
                                        'Su': 'சூரியன்', 'Mo': 'சந்திரன்', 'Ma': 'செவ்வாய்',
                                        'Me': 'புதன்', 'Ju': 'குரு', 'Ve': 'சுக்கிரன்',
                                        'Sa': 'சனி', 'Ra': 'ராகு', 'Ke': 'கேது'
                                    }[planetId] || planetId;

                                    const planetIcon = {
                                        'Su': '☉', 'Mo': '☽', 'Ma': '♂',
                                        'Me': '☿', 'Ju': '♃', 'Ve': '♀',
                                        'Sa': '♄', 'Ra': '☊', 'Ke': '☋'
                                    }[planetId] || '•';

                                    return (
                                        <div key={planetId} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.6rem 0',
                                            borderBottom: '1px solid var(--glass-border)',
                                            fontSize: '0.85rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1rem', width: '1.5rem', textAlign: 'center' }}>{planetIcon}</span>
                                                <span style={{ fontWeight: '500' }}>{planetName}</span>
                                            </div>
                                            <div style={{ color: 'var(--accent-light)', fontWeight: '500' }}>
                                                {houseRasi?.nameTamil || `House ${houseId}`}
                                            </div>
                                        </div>
                                    );
                                });
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JathagamCalculator;
