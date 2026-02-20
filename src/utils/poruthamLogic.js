import { STARS, RASIS, YONI_ENEMIES, PLANET_FRIENDS } from '../data/poruthamData';

// Calculates total malefic dosha points from Lagna, Moon, and Venus
const calculatePapasamyam = (chart, lagnamId, moonRasiId, venusHouseId) => {
    if (!chart) return { points: 0, details: [] };

    // Core Malefics
    const malefics = ['Su', 'Ma', 'Sa', 'Ra', 'Ke', 'சூ', 'செ', 'ச', 'ரா', 'கே'];
    // Houses that cause dosham (2, 4, 7, 8, 12) + 1st house
    const doshamHouses = [1, 2, 4, 7, 8, 12];

    let totalPoints = 0;
    const details = [];

    const checkFromRef = (refHouseId, refName, weight) => {
        if (!refHouseId) return;
        doshamHouses.forEach(dh => {
            const targetHouse = (refHouseId + dh - 2) % 12 + 1;
            const planetsInHouse = chart[targetHouse] || [];

            planetsInHouse.forEach(p => {
                if (malefics.includes(p)) {
                    let point = weight;
                    // Mars in 7/8 is usually severe
                    if ((p === 'Ma' || p === 'செ') && (dh === 7 || dh === 8)) point *= 1.5;
                    // Saturn dosha is slightly milder
                    if (p === 'Sa' || p === 'ச') point *= 0.75;

                    totalPoints += point;
                    details.push(`${refName}க்கு ${dh}-ல் ${p}`);
                }
            });
        });
    };

    // 1. From Lagna (Weight: 1.0)
    checkFromRef(lagnamId, "லக்னத்திற்", 1.0);
    // 2. From Moon (Weight: 0.75 - Mental/Emotional)
    checkFromRef(moonRasiId, "சந்திரனுங்", 0.75);
    // 3. From Venus (Weight: 0.5 - Marital Bliss)
    checkFromRef(venusHouseId, "சுக்கிரனுங்", 0.5);

    return { points: parseFloat(totalPoints.toFixed(2)), details };
};

const getPlanetHouse = (chart, pIds) => {
    if (!chart) return null;
    for (const [houseId, planets] of Object.entries(chart)) {
        if (planets.some(p => pIds.includes(p))) return parseInt(houseId);
    }
    return null;
};

const analyzeNavamsam7th = (navChart, lagnamId) => {
    if (!navChart || !lagnamId) return { text: "", isGood: true };
    const seventhHouse = (lagnamId + 5) % 12 + 1;
    const planetsIn7th = navChart[seventhHouse] || [];

    const benefics = ['Ju', 'Ve', 'Me', 'கு', 'சு', 'பு'];
    const malefics = ['Su', 'Ma', 'Sa', 'Ra', 'Ke', 'சூ', 'செ', 'ச', 'ரா', 'கே'];

    const hasBenefic = planetsIn7th.some(p => benefics.includes(p));
    const hasMalefic = planetsIn7th.some(p => malefics.includes(p));

    if (hasBenefic && !hasMalefic) return { text: "நவாம்சத்தில் 7-ம் வீட்டில் சுப கிரகங்கள் இருப்பதால், திருமண வாழ்க்கை மிகவும் மகிழ்ச்சியாக இருக்கும்.", isGood: true };
    if (hasMalefic && !hasBenefic) return { text: "நவாம்சத்தில் 7-ம் வீட்டில் பாப கிரகங்கள் இருப்பதால், வாழ்க்கைத் துணையிடம் விட்டுக்கொடுத்து செல்வது அவசியம்.", isGood: false };
    if (hasBenefic && hasMalefic) return { text: "நவாம்சத்தில் 7-ம் வீட்டில் சுப மற்றும் பாப கிரகங்கள் இணைந்திருப்பதால், திருமணப் பெருவாழ்வு கலவையான பலன்களைத் தரும்.", isGood: true };

    return { text: "நவாம்சத்தில் 7-ம் வீடு வெற்றிடமாக இருப்பதால், பொதுவான திருமண வாழ்க்கை அமையும்.", isGood: true };
};

const generateLifeSummary = (bride, groom, bridePapasamyam, groomPapasamyam, bNavamsa, gNavamsa, hasCharts, results) => {
    const summary = [];

    summary.push("### 🌟 திருமண வாழ்க்கை கணிப்பு (Marriage Life Prediction)");

    // 1. Overall harmony (Fighting vs Love)
    let harmonyText = "**தம்பதியர் ஒற்றுமை:** ";
    if (results.rasiAthipathi.status === "Match" && results.rasi.status === "Match") {
        harmonyText += "இருவருக்கும் சிறந்த மனப்பொருத்தம் மற்றும் கிரக பலம் உள்ளதால், சண்டை சச்சரவுகள் இன்றி அன்பான, நெகிழ்வான வாழ்க்கை அமையும்.";
    } else if (results.rasiAthipathi.status === "Match" || results.rasi.status === "Match") {
        harmonyText += "சிறுசிறு கருத்து வேறுபாடுகள் வந்தாலும், விரைவில் சமாதானம் ஆகிவிடுவார்கள். அன்யோன்யம் குறையாது.";
    } else {
        harmonyText += "மனக்கசப்புகளும் சண்டைகளும் வர வாய்ப்புள்ளது. ஒருவர் மற்றவரைப் புரிந்துகொண்டு விட்டுக்கொடுத்துச் செல்வது கட்டாயம் தேவை.";
    }
    summary.push(harmonyText);

    // 2. Progeny (Children) based on Mahendra
    let progenyText = "**புத்திர பாக்கியம்:** ";
    if (results.mahendra.status === "Match") {
        progenyText += "மகேந்திரப் பொருத்தம் இருப்பதனால், நிச்சயமாக நல்ல ஆரோக்கியமான புத்திர பாக்கியம் கிடைக்கும். வம்சம் தழைத்தோங்கும்.";
    } else {
        progenyText += "மகேந்திரப் பொருத்தம் இல்லாததால், புத்திர பாக்கியம் சற்று தாமதமாகலாம் அல்லது மருத்துவ ஆலோசனைகள் தேவைப்படலாம். குலதெய்வ வழிபாடு அவசியம்.";
    }
    summary.push(progenyText);

    // 3. Financial Future & Longevity
    let futureText = "**எதிர்காலம் மற்றும் ஆயுள்:** ";
    if (results.rajju.status === "Match" && results.yoni.status === "Match") {
        futureText += "ரஜ்ஜு மற்றும் யோனிப் பொருத்தம் மிகச் சிறப்பாக உள்ளதால், நீண்ட ஆயுள், நிறைவான தாம்பத்திய சுகம் மற்றும் மகிழ்ச்சியான எதிர்காலம் உறுதியாகத் தெரிகிறது.";
    } else if (results.rajju.status === "Match") {
        futureText += "ஆயுள் பலம் நன்றாக உள்ளது. விடாமுயற்சியால் எதிர்கால வாழ்க்கையை வளப்படுத்திக் கொள்வார்கள்.";
    } else {
        futureText += "ரஜ்ஜுப் பொருத்தம் இல்லாததால், ஆரோக்கியத்திலும் பொருளாதாரத்திலும் ஏற்ற இறக்கங்கள் காணப்படலாம். இது ஒரு சவாலான பொருத்தமே.";
    }
    summary.push(futureText);

    // 4. Dosham/Navamsa Impact
    if (hasCharts) {
        summary.push("\n### ⚖️ கிரக பல கணிப்பு (Chart Analysis)");

        if (groomPapasamyam.points >= bridePapasamyam.points) {
            summary.push(`- **பாபசாம்யம்:** ஆணின் தோஷ அளவு (${groomPapasamyam.points}) பெண்ணை (${bridePapasamyam.points}) விட ஈடாக/அதிகமாக இருப்பதால் தோஷங்கள் விலகி நன்மைகள் நடைபெறும்.`);
        } else {
            summary.push(`- **பாபசாம்யம்:** பெண்ணின் தோஷ அளவு (${bridePapasamyam.points}) ஆணை (${groomPapasamyam.points}) விட அதிகமாக இருப்பதால், திருமண வாழ்வில் சில போராட்டங்கள் வரலாம்.`);
        }

        if (bNavamsa.isGood && gNavamsa.isGood) {
            summary.push(`- **நவாம்சம் (D9):** நவாம்ச அடிப்படையில் இருவருக்கும் 7-ம் வீடு சிறப்பாக உள்ளதால், கணவன்-மனைவி உறவு பலமாக இருக்கும்.`);
        } else if (!bNavamsa.isGood || !gNavamsa.isGood) {
            summary.push(`- **நவாம்சம் (D9):** நவாம்சத்தில் 7-ம் வீட்டில் பாப கிரகங்களின் பார்வை உள்ளதால் சவால்களை எதிர்கொள்ள நேரிடும்.`);
        }
    } else {
        summary.push("\n**குறிப்பு (Note):** ஜாதகக் கட்டங்கள் இல்லாததால் நவாம்சம் மற்றும் பாபசாம்ய அடிப்படையிலான ஆழமான பலன்கள் கணிக்கப்படவில்லை.");
    }

    return summary.join("\n\n");
};

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

    // --- AstroSage Advanced Analysis (Planetary Dosham) ---
    const bVenus = getPlanetHouse(bride.rasiChart, ['Ve', 'சு']);
    const gVenus = getPlanetHouse(groom.rasiChart, ['Ve', 'சு']);
    const bLagna = getPlanetHouse(bride.rasiChart, ['La', 'லக்']) || parseInt(bride.rasiId);
    const gLagna = getPlanetHouse(groom.rasiChart, ['La', 'லக்']) || parseInt(groom.rasiId);

    const bDosham = calculatePapasamyam(bride.rasiChart, bLagna, parseInt(bride.rasiId), bVenus);
    const gDosham = calculatePapasamyam(groom.rasiChart, gLagna, parseInt(groom.rasiId), gVenus);

    // AstroSage Rule: Groom Dosham must be >= Bride Dosham
    // Also consider it a match if both are low (< 3 points dosham)
    const doshamMatch = (gDosham.points >= bDosham.points) || (bDosham.points < 3 && gDosham.points < 3);

    const hasCharts = (bride.rasiChart && Object.keys(bride.rasiChart).length > 0) || (groom.rasiChart && Object.keys(groom.rasiChart).length > 0);

    const doshamResult = {
        bride: bDosham,
        groom: gDosham,
        match: hasCharts ? (doshamMatch ? "Match" : "No Match") : "Neutral",
        recommendation: hasCharts
            ? (doshamMatch
                ? "பாபசாம்யம் (Dosha Equivalency) நன்கு பொருந்தியுள்ளது."
                : "பெண்ணின் ஜாதகப் பாபப் பலன் ஆணின் ஜாதகத்தை விட அதிகம். இது திருமணத்திற்கு உகந்ததல்ல.")
            : "கட்டங்கள் இல்லாததால் பாபசாம்யம் அறியப்படவில்லை."
    };

    // Navamsam
    const bNavamsa = analyzeNavamsam7th(bride.navamsamChart, bLagna);
    const gNavamsa = analyzeNavamsam7th(groom.navamsamChart, gLagna);

    // Final Recommendation
    const importantFields = ['rasi', 'rasiAthipathi', 'rajju', 'mahendra', 'yoni'];
    const importantMatches = importantFields.filter(f => results[f].status === "Match").length;

    // Custom logic: Rajju MUST match.
    let recommendation = "";
    let canMarry = false;

    if (results.rajju.status === "No Match") {
        recommendation = "ரஜ்ஜிப் பொருத்தம் சரியாக இல்லை (ஆயுள் பலம் இல்லை). இது திருமணத்திற்கு உகந்ததல்ல.";
        canMarry = false;
    } else if (hasCharts && doshamResult.match === "No Match") {
        recommendation = "பெண்ணின் ஜாதகத்தில் பாப கிரகப் பலன் அதிகமாக உள்ளது, எனவே பாபசாம்யம் இல்லை.";
        canMarry = false;
    } else if (importantMatches >= 3) {
        recommendation = `முக்கியமான 5 பொருத்தங்களில் ${importantMatches} பொருத்தங்கள் உள்ளன. நல்ல பொருத்தம் உண்டு.`;
        canMarry = true;
    } else {
        recommendation = `முக்கியமான 5 பொருத்தங்களில் ${importantMatches} மட்டுமே உள்ளன. பொருத்தம் குறைவாக உள்ளது.`;
        canMarry = false;
    }

    // --- Accurate Summary Report ---
    const pros = [];
    const cons = [];

    // Check Big 5 (The most important Poruthams)
    if (results.rajju.status === "Match") pros.push("ரஜ்ஜிப் பொருத்தம் மிகச் சிறப்பாக உள்ளது (ஆயுள் மற்றும் மாங்கல்ய பலம்).");
    else cons.push("முக்கியமான ரஜ்ஜிப் பொருத்தம் இல்லை - இது மாங்கல்ய பலம் மற்றும் ஆயுளைப் பாதிக்கும்.");

    if (results.rasi.status === "Match") pros.push("இராசிப் பொருத்தம் நன்று (வம்ச விருத்தி).");
    else cons.push("முக்கியமான இராசிப் பொருத்தம் இல்லை - வம்ச விருத்தியில் தாமதம் ஏற்படலாம்.");

    if (results.rasiAthipathi.status === "Match") pros.push("இராசி அதிபதிப் பொருத்தம் உள்ளது (குடும்ப ஒற்றுமை).");
    else cons.push("முக்கியமான இராசி அதிபதிப் பொருத்தம் இல்லை - குடும்பத்தில் கருத்து வேறுபாடுகள் வரலாம்.");

    if (results.yoni.status === "Match") pros.push("யோனிப் பொருத்தம் சிறப்பு (தாம்பத்திய சுகம்).");
    else cons.push("முக்கியமான யோனிப் பொருத்தம் இல்லை - தாம்பத்திய வாழ்வில் திருப்தியின்மை ஏற்படலாம்.");

    if (results.mahendra.status === "Match") pros.push("மகேந்திரப் பொருத்தம் உள்ளது (புத்திர பாக்கியம் மற்றும் செல்வம்).");
    else cons.push("முக்கியமான மகேந்திரப் பொருத்தம் இல்லை - புத்திர பாக்கியம் தாமதமாகலாம்.");

    if (hasCharts) {
        if (doshamResult.match === "Match") {
            pros.push("பாபசாம்யம் (Dosha Equivalency) உள்ளது. தடைகள் நீங்கி நன்மைகள் நடக்கும்.");
        } else {
            cons.push("பெண்ணின் ஜாதகப் பாபப் பலன் ஆணின் ஜாதகத்தை விட அதிகம். இது ஆயுளையும், ஆரோக்கியத்தையும் பாதிக்கும்.");
        }

        if (!bNavamsa.isGood || !gNavamsa.isGood) {
            cons.push("நவாம்சத்தில் 7-ம் வீட்டில் பாப கிரகங்களின் தாக்கம் உள்ளது.");
        } else {
            pros.push("நவாம்ச பலம் (D9 Chart) சிறப்பாக உள்ளது.");
        }
    } else {
        cons.push("கட்டங்கள் (Charts) இல்லாததால் கிரக பலம், பாபசாம்யம், மற்றும் நவாம்சம் அறியப்படவில்லை.");
    }

    const totalScore = Object.values(results).reduce((acc, curr) => acc + curr.score, 0);
    let basePercentage = (totalScore / 12) * 100;

    // Apply Chart-based Penalties/Bonuses
    if (hasCharts) {
        if (doshamResult.match === "Match") {
            basePercentage += 8; // Bonus for good dosham match
        } else if (doshamResult.match === "No Match") {
            basePercentage -= 20; // Heavy penalty for bad dosham
        }

        if (bNavamsa.isGood && gNavamsa.isGood) {
            basePercentage += 8; // Both have good navamsa
        } else if (!bNavamsa.isGood && !gNavamsa.isGood) {
            basePercentage -= 15; // Both have bad navamsa
        } else {
            basePercentage -= 5; // One has bad navamsa
        }
    }

    // Huge penalty for bad rajju, regardless of score
    if (results.rajju.status === "No Match") {
        basePercentage -= 30; // Rajju is critical
    }

    // Keep within bounds 0-100
    const percentage = Math.max(0, Math.min(100, Math.round(basePercentage)));

    const lifeSummary = generateLifeSummary(bride, groom, bDosham, gDosham, bNavamsa, gNavamsa, hasCharts, results);

    const summaryReport = {
        percentage,
        pros,
        cons,
        lifeSummary,
        verdict: percentage > 70 ? "உத்தமமான பொருத்தம்" : percentage > 50 ? "மத்தியமமான பொருத்தம்" : "பொருத்தம் குறைவு"
    };

    return { results, recommendation, canMarry, score: importantMatches, doshamResult, summaryReport };
};
