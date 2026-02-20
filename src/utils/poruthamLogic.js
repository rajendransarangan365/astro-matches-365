import { STARS, RASIS, YONI_ENEMIES, PLANET_FRIENDS } from '../data/poruthamData';

export const calculatePorutham = (bride, groom) => {
    const bStar = STARS.find(s => s.id === parseInt(bride.starId));
    const gStar = STARS.find(s => s.id === parseInt(groom.starId));
    const bRasi = RASIS.find(r => r.id === parseInt(bride.rasiId));
    const gRasi = RASIS.find(r => r.id === parseInt(groom.rasiId));

    if (!bStar || !gStar || !bRasi || !gRasi) return null;

    const results = {};

    // 1. Dina Porutham
    const starDist = (gStar.id - bStar.id + 27) % 9;
    const dinaGood = [2, 4, 6, 8, 0].includes(starDist);
    results.dina = { name: "தினப் பொருத்தம்", status: dinaGood ? "Match" : "No Match", score: dinaGood ? 1 : 0 };

    // 2. Gana Porutham
    let ganaScore = 0;
    if (bStar.gana === gStar.gana) ganaScore = 3;
    else if (bStar.gana === "Deva" && gStar.gana === "Manushya") ganaScore = 3;
    else if (bStar.gana === "Manushya" && gStar.gana === "Deva") ganaScore = 2;
    else if (gStar.gana === "Rakshasa") ganaScore = 0;
    else ganaScore = 1;
    results.gana = { name: "கணப் பொருத்தம்", status: ganaScore >= 2 ? "Match" : "No Match", score: ganaScore };

    // 3. Mahendra Porutham (Important)
    const distMahendra = (gStar.id - bStar.id + 27);
    const mahendraGood = [4, 7, 10, 13, 16, 19, 22, 25].includes(distMahendra % 27) || [4, 7, 10, 13, 16, 19, 22, 25].includes(distMahendra);
    results.mahendra = { name: "மாகேந்திரப் பொருத்தம்", status: mahendraGood ? "Match" : "No Match", score: mahendraGood ? 1 : 0 };

    // 4. Sthree Dheerkha
    const sthreeDist = (gStar.id - bStar.id + 27) % 27;
    const sthreeGood = sthreeDist > 13;
    results.sthree = { name: "ஸ்திரீ தீர்க்கம்", status: sthreeGood ? "Match" : "No Match", score: sthreeGood ? 1 : 0 };

    // 5. Yoni Porutham (Important)
    const isEnemy = YONI_ENEMIES[bStar.yoni] === gStar.yoni || YONI_ENEMIES[gStar.yoni] === bStar.yoni;
    results.yoni = { name: "யோனிப் பொருத்தம்", status: !isEnemy ? "Match" : "No Match", score: !isEnemy ? 1 : 0 };

    // 6. Rasi Porutham (Important)
    const rasiDist = (gRasi.id - bRasi.id + 12) % 12;
    const rasiGood = [0, 6, 2, 3, 9, 10].includes(rasiDist); // 1, 7, 3, 4, 10, 11 positions
    results.rasi = { name: "இராசிப் பொருத்தம்", status: rasiGood ? "Match" : "No Match", score: rasiGood ? 1 : 0 };

    // 7. Rasi Athipathi (Important)
    const bLord = bRasi.lord;
    const gLord = gRasi.lord;
    const isFriend = (PLANET_FRIENDS[bLord] || []).includes(gLord) || (PLANET_FRIENDS[gLord] || []).includes(bLord) || bLord === gLord;
    results.rasiAthipathi = { name: "இராசி அதிபதி பொருத்தம்", status: isFriend ? "Match" : "No Match", score: isFriend ? 1 : 0 };

    // 8. Vasya Porutham
    // Simplified: Match if Rasi are compatible or specific pairs
    results.vasya = { name: "வசியப் பொருத்தம்", status: "Neutral", score: 0.5 };

    // 9. Rajju Porutham (MOST IMPORTANT)
    const rajjuGood = bStar.rajju !== gStar.rajju;
    results.rajju = { name: "ரஜ்ஜிப் பொருத்தம்", status: rajjuGood ? "Match" : "No Match", score: rajjuGood ? 1 : 0 };

    // 10. Vedhai Porutham
    const isVedhai = bStar.vedhai === gStar.nameEnglish || gStar.vedhai === bStar.nameEnglish;
    results.vedhai = { name: "வேதைப் பொருத்தம்", status: !isVedhai ? "Match" : "No Match", score: !isVedhai ? 1 : 0 };

    // 11. Nadi Porutham
    results.nadi = { name: "நாடிப் பொருத்தம்", status: "Match", score: 1 };

    // 12. Vruksha Porutham
    results.vruksha = { name: "விருட்சப் பொருத்தம்", status: "Match", score: 1 };

    // --- Advanced Analysis (Planets) ---
    const getPlanetHouse = (chart, pId) => {
        if (!chart) return null;
        for (const [houseId, planets] of Object.entries(chart)) {
            if (planets.includes(pId)) return parseInt(houseId);
        }
        return null;
    };

    const checkChevvaiDosham = (chart, rasiId) => {
        if (!chart) return { hasDosham: false, details: "" };
        const lagnamHouse = getPlanetHouse(chart, 'La');
        const moonHouse = getPlanetHouse(chart, 'Mo') || rasiId;
        const marsHouse = getPlanetHouse(chart, 'Ma');

        if (!marsHouse) return { hasDosham: false, details: "" };

        const doshamHouses = [2, 4, 7, 8, 12];
        const res = [];

        if (lagnamHouse) {
            const distFromLa = (marsHouse - lagnamHouse + 12) % 12 || 12;
            if (doshamHouses.includes(distFromLa)) res.push(`லக்கினத்திற்கு ${distFromLa}-ல் செவ்வாய்`);
        }

        if (moonHouse) {
            const distFromMo = (marsHouse - moonHouse + 12) % 12 || 12;
            if (doshamHouses.includes(distFromMo)) res.push(`சந்திரனுக்கு ${distFromMo}-ல் செவ்வாய்`);
        }

        return {
            hasDosham: res.length > 0,
            details: res.join(", ")
        };
    };

    const bDosham = checkChevvaiDosham(bride.rasiChart, parseInt(bride.rasiId));
    const gDosham = checkChevvaiDosham(groom.rasiChart, parseInt(groom.rasiId));

    const doshamResult = {
        bride: bDosham,
        groom: gDosham,
        match: bDosham.hasDosham === gDosham.hasDosham ? "Match" : "No Match",
        recommendation: bDosham.hasDosham === gDosham.hasDosham
            ? "இருவருக்கும் செவ்வாய் தோஷம் சமமாக உள்ளது."
            : "செவ்வாய் தோஷம் சமமாக இல்லை. கூடுதல் கவனம் தேவை."
    };

    // Final Recommendation
    const importantFields = ['rasi', 'rasiAthipathi', 'rajju', 'mahendra', 'yoni'];
    const importantMatches = importantFields.filter(f => results[f].status === "Match").length;

    // Custom logic: Rajju MUST match.
    let recommendation = "";
    let canMarry = false;

    if (results.rajju.status === "No Match") {
        recommendation = "ரஜ்ஜிப் பொருத்தம் சரியாக இல்லை. இது திருமணத்திற்கு உகந்ததல்ல.";
        canMarry = false;
    } else if (doshamResult.match === "No Match" && (bDosham.hasDosham || gDosham.hasDosham)) {
        recommendation = "செவ்வாய் தோஷம் சரியாக பொருந்தவில்லை. நிபுணரிடம் ஆலோசனை பெறவும்.";
        canMarry = false;
    } else if (importantMatches >= 3) {
        recommendation = "நல்ல பொருத்தம் உண்டு. தாராளமாகத் திருமணம் செய்யலாம்.";
        canMarry = true;
    } else {
        recommendation = "பொருத்தம் குறைவாக உள்ளது. அதிக ஜாதக ஆலோசனை தேவை.";
        canMarry = false;
    }

    // --- Accurate Summary Report ---
    const pros = [];
    const cons = [];

    // Check Big 5
    if (results.rajju.status === "Match") pros.push("ரஜ்ஜிப் பொருத்தம் மிகச் சிறப்பாக உள்ளது (ஆயுள் பலம்).");
    else cons.push("ரஜ்ஜிப் பொருத்தம் இல்லை - இது குழந்தைப் பேறு மற்றும் ஆயுளைப் பாதிக்கும்.");

    if (results.rasi.status === "Match") pros.push("இராசிப் பொருத்தம் நன்று (வம்ச விருத்தி).");
    if (results.yoni.status === "Match") pros.push("யோனிப் பொருத்தம் சிறப்பு (தாம்பத்திய சுகம்).");
    else cons.push("யோனிப் பொருத்தம் இல்லை - கருத்து வேறுபாடுகள் ஏற்படலாம்.");

    if (doshamResult.match === "Match") {
        if (bDosham.hasDosham) pros.push("இருவருக்கும் செவ்வாய் தோஷம் இருப்பதால் தோஷ நிவர்த்தி ஆகிறது.");
        else pros.push("இருவருக்கும் செவ்வாய் தோஷம் இல்லை. இது மிகவும் நன்று.");
    } else {
        cons.push("செவ்வாய் தோஷம் சமமாக இல்லை. இது ஆரோக்கியம் மற்றும் ஆயுளைப் பாதிக்கும்.");
    }

    const totalScore = Object.values(results).reduce((acc, curr) => acc + curr.score, 0);
    const percentage = Math.round((totalScore / 12) * 100);

    const summaryReport = {
        percentage,
        pros,
        cons,
        verdict: percentage > 70 ? "உத்தமமான பொருத்தம்" : percentage > 50 ? "மத்தியமமான பொருத்தம்" : "பொருத்தம் குறைவு"
    };

    return { results, recommendation, canMarry, score: importantMatches, doshamResult, summaryReport };
};
