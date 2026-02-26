import { useState, useCallback, useEffect } from 'react';
import { fetchWithToken } from '../utils/api';

export const useProfiles = (token) => {
    const [savedBrides, setSavedBrides] = useState([]);
    const [savedGrooms, setSavedGrooms] = useState([]);
    const [profileSaveStatus, setProfileSaveStatus] = useState({ type: null, status: null });

    const fetchProfiles = useCallback(async () => {
        if (!token) return;
        try {
            const data = await fetchWithToken('/api/profiles', token);
            setSavedBrides(data.filter(p => p.type === 'bride'));
            setSavedGrooms(data.filter(p => p.type === 'groom'));
        } catch (err) {
            console.error("Failed to fetch profiles:", err);
        }
    }, [token]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleSaveProfile = async (type, profileData, id = null) => {
        if (!profileData.name || !profileData.dob) {
            alert("தயவுசெய்து பெயர் மற்றும் பிறந்த தேதியை நிரப்பவும் (Please fill Name and DOB to save)");
            return;
        }

        setProfileSaveStatus({ type, status: 'saving' });
        try {
            await fetchWithToken('/api/profiles', token, {
                method: 'POST',
                body: JSON.stringify({ type, profileData, id })
            });
            setProfileSaveStatus({ type, status: 'success' });
            fetchProfiles(); // Refresh the list
            setTimeout(() => setProfileSaveStatus({ type: null, status: null }), 3000);
        } catch (err) {
            alert("புரொஃபைல் சேமிப்பதில் பிழை: " + err.message);
            setProfileSaveStatus({ type: null, status: null });
        }
    };

    const handleDeleteProfile = async (profileId) => {
        if (!window.confirm("இந்த தகவலை அழிக்க விரும்புகிறீர்களா? (Are you sure you want to delete this profile?)")) {
            return;
        }
        try {
            await fetchWithToken(`/api/profiles/${profileId}`, token, {
                method: 'DELETE'
            });
            fetchProfiles(); // Refresh the list
        } catch (err) {
            alert("இந்த தகவலை அழிப்பதில் பிழை: " + err.message);
        }
    };

    return {
        savedBrides,
        savedGrooms,
        profileSaveStatus,
        handleSaveProfile,
        handleDeleteProfile
    };
};
