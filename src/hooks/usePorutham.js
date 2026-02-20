import { useState } from 'react';
import { calculatePorutham } from '../utils/poruthamLogic';
import { fetchWithToken } from '../utils/api';

export const usePorutham = (token, brideData, groomData) => {
    const [result, setResult] = useState(null);
    const [saveStatus, setSaveStatus] = useState(null);

    const handleCalculate = () => {
        if (!brideData.starId || !groomData.starId || !brideData.rasiId || !groomData.rasiId) {
            alert("தயவுசெய்து அனைத்து விவரங்களையும் பூர்த்தி செய்யவும் (Please fill all details)");
            return;
        }
        const matchResult = calculatePorutham(brideData, groomData);
        setResult({ ...matchResult, bride: brideData, groom: groomData });

        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    const handleSaveMatch = async () => {
        if (!result) return;
        setSaveStatus('saving');
        try {
            await fetchWithToken('/api/matches', token, {
                method: 'POST',
                body: JSON.stringify({
                    brideName: brideData.name,
                    groomName: groomData.name,
                    brideData,
                    groomData,
                    result
                })
            });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            alert("சேமிப்பதில் பிழை: " + err.message);
            setSaveStatus(null);
        }
    };

    return {
        result,
        saveStatus,
        handleCalculate,
        handleSaveMatch
    };
};
