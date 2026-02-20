import { useState, useCallback, useEffect } from 'react';
import { fetchWithToken } from '../utils/api';

export const useMatches = (token) => {
    const [savedMatches, setSavedMatches] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMatches = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await fetchWithToken('/api/matches', token);
            setSavedMatches(data);
        } catch (err) {
            console.error("Failed to fetch matches:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    return {
        savedMatches,
        loading,
        fetchMatches
    };
};
