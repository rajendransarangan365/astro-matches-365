import React, { useState } from 'react';
import { STARS, RASIS } from '../data/poruthamData';
import { User, Star, Moon, BarChart3, ChevronDown, ChevronUp, MapPin, Calendar, Clock, Sparkles, Save, Download } from 'lucide-react';
import ChartInput from './ChartInput';
import SearchableSelect from './SearchableSelect';
import { calculateAstroDetails } from '../utils/astroUtils';
import { useAuth } from '../context/AuthContext';
import ImageUploader from './ImageUploader';

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

const PersonForm = ({ title, data, onChange, type, profiles = [], onSaveProfile, onDeleteProfile, saveStatus }) => {
    const { user, token } = useAuth();
    const canUploadPhotos = user && (user.isAdmin || user.canUploadImages);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [calculating, setCalculating] = useState(false);

    const selectedStar = STARS.find(s => s.id === data.starId);
    const availableRasis = selectedStar
        ? RASIS.filter(r => selectedStar.rasiMapping.some(rm => rm.rasiId === r.id))
        : RASIS;

    const accentColor = type === 'bride' ? '#f472b6' : '#60a5fa';

    // Build profile options for SearchableSelect
    const profileOptions = profiles.map(p => ({
        value: p._id,
        label: `${p.profileData.name} ${p.profileData.dob ? `(${p.profileData.dob})` : ''} — ${p.profileData.birthPlace || ''}`
    }));

    // Build star options
    const starOptions = STARS.map(s => ({ value: s.id, label: s.nameTamil }));

    // Build rasi options
    const rasiOptions = availableRasis.map(r => {
        const padas = selectedStar ? selectedStar.rasiMapping.find(rm => rm.rasiId === r.id)?.padas : "";
        const padaText = padas ? ` (பா ${padas})` : "";
        return { value: r.id, label: `${r.nameTamil}${padaText}` };
    });

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
            {/* Header */}
            <div className="person-header" style={{ color: accentColor }}>
                <User size={18} /> {title}
            </div>

            {/* Quick Add */}
            {profiles && profiles.length > 0 && (
                <div className="quick-add-section">
                    <label>
                        <Download size={10} /> Quick Add
                    </label>
                    <SearchableSelect
                        options={profileOptions}
                        value=""
                        onChange={(val) => {
                            const selectedProfile = profiles.find(p => p._id === val);
                            if (selectedProfile) {
                                // Include the _id in the data passed to onChange so we can use it for updates
                                onChange({ ...selectedProfile.profileData, _id: selectedProfile._id });
                            }
                        }}
                        placeholder="-- சேமிக்கப்பட்ட தகவல் தேடு --"
                        icon={<Download size={14} />}
                        onDelete={onDeleteProfile}
                    />
                </div>
            )}

            {/* Image Uploader (Authorized Users Only) */}
            {canUploadPhotos && (
                <ImageUploader
                    token={token}
                    currentImageUrl={data.imageUrl}
                    currentImagePublicId={data.imagePublicId}
                    onUploadSuccess={(url, publicId) => onChange({ ...data, imageUrl: url, imagePublicId: publicId })}
                    onDeleteSuccess={() => onChange({ ...data, imageUrl: '', imagePublicId: '' })}
                />
            )}

            {/* Form Fields */}
            <div className="form-grid">
                {/* Name */}
                <div className="input-group">
                    <label><User size={12} /> பெயர் (Name)</label>
                    <input
                        type="text"
                        placeholder="பெயர்"
                        value={data.name}
                        onChange={(e) => onChange({ ...data, name: e.target.value })}
                    />
                </div>

                {/* Birth Place */}
                <div className="input-group">
                    <label><MapPin size={12} /> பிறந்த இடம் (Place)</label>
                    <SearchableSelect
                        options={CITY_OPTIONS}
                        value={CITIES.includes(data.birthPlace) ? data.birthPlace : ''}
                        onChange={(val) => onChange({ ...data, birthPlace: val })}
                        placeholder="-- நகரத்தை தேடு --"
                        icon={<MapPin size={14} />}
                        emptyMessage="நகரம் கிடைக்கவில்லை"
                    />
                    {!CITIES.includes(data.birthPlace) && (
                        <input
                            type="text"
                            placeholder="ஊர் பெயர் (Type city name)"
                            value={data.birthPlace || ''}
                            onChange={(e) => onChange({ ...data, birthPlace: e.target.value })}
                            style={{ marginTop: '0.375rem' }}
                        />
                    )}
                </div>

                {/* DOB + Time Row */}
                <div className="date-time-row" style={{ gridColumn: '1 / -1' }}>
                    <div className="input-group">
                        <label><Calendar size={12} /> DOB</label>
                        <input
                            type="date"
                            value={data.dob || ''}
                            onChange={(e) => onChange({ ...data, dob: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label><Clock size={12} /> Time</label>
                        <input
                            type="time"
                            value={data.birthTime || ''}
                            onChange={(e) => onChange({ ...data, birthTime: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label style={{ visibility: 'hidden' }}>AM</label>
                        <select
                            value={data.meridian || 'AM'}
                            onChange={(e) => onChange({ ...data, meridian: e.target.value })}
                            style={{ width: '70px' }}
                        >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn-sm btn-outline"
                        onClick={handleCalculate}
                        disabled={calculating}
                        style={{ flex: 1, color: accentColor, borderColor: `${accentColor}30` }}
                    >
                        {calculating ? '...' : <><Sparkles size={14} /> ஜாதகம் கணக்கிடு</>}
                    </button>
                    {onSaveProfile && (
                        <button
                            className="btn-sm btn-outline"
                            onClick={() => onSaveProfile(type, data, data._id)}
                            disabled={saveStatus === 'saving'}
                            style={{ flex: 1 }}
                        >
                            {saveStatus === 'saving' ? '...' : <><Save size={14} /> சேமிக்க</>}
                        </button>
                    )}
                </div>
            </div>

            {/* Rasi & Star Section */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <div className="rasi-star-row">
                    <div className="input-group">
                        <label><Moon size={12} /> இராசி (Rasi)</label>
                        <SearchableSelect
                            options={rasiOptions}
                            value={data.rasiId}
                            onChange={(val) => onChange({ ...data, rasiId: val })}
                            placeholder="இராசி தேர்ந்தெடுக்கவும்"
                            icon={<Moon size={14} />}
                        />
                    </div>

                    <div className="input-group">
                        <label><Star size={12} /> நட்சத்திரம் (Star)</label>
                        <SearchableSelect
                            options={starOptions}
                            value={data.starId}
                            onChange={(val) => {
                                const starId = val;
                                const newStar = STARS.find(s => s.id === starId);
                                let newRasiId = data.rasiId;
                                if (newStar) {
                                    if (newStar.rasiMapping.length === 1) {
                                        newRasiId = newStar.rasiMapping[0].rasiId;
                                    } else if (!newStar.rasiMapping.some(rm => rm.rasiId === data.rasiId)) {
                                        newRasiId = '';
                                    }
                                }
                                onChange({ ...data, starId, rasiId: newRasiId });
                            }}
                            placeholder="நட்சத்திரம் தேர்ந்தெடுக்கவும்"
                            icon={<Star size={14} />}
                        />
                    </div>
                </div>

                {/* Auto Calculated Info Message */}
                <div style={{
                    marginTop: '1rem',
                    padding: '0.6rem 0.75rem',
                    background: 'rgba(56, 189, 248, 0.05)',
                    border: '1px dashed rgba(56, 189, 248, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'flex-start'
                }}>
                    <Sparkles size={14} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                    <span>இராசி, நட்சத்திரம் மற்றும் கட்டங்கள் கணினி மூலம் கணிக்கப்பட்டவை. உங்கள் விவரங்களுக்கு ஏற்ப அவற்றை தேவையானால் மாற்றிக்கொள்ளலாம். (Calculated based on your details, you may change them if needed.)</span>
                </div>

                {/* Collapsible Charts */}
                <button
                    className="collapsible-toggle"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    <BarChart3 size={14} />
                    {showAdvanced ? 'Charts மறை' : 'Charts காட்டு'}
                    {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showAdvanced && (
                    <div className="chart-container" style={{ animation: 'fadeIn 0.3s ease' }}>
                        <ChartInput
                            title="ராசிக் கட்டம் (Rasi Chart)"
                            chartData={data.rasiChart || {}}
                            onChange={(val) => onChange({ ...data, rasiChart: val })}
                        />
                        <ChartInput
                            title="நவாம்சம் (Navamsam)"
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
