import { getPlanetaryPositions, getPanchang, getMoonSign, getKundali } from 'vedic-astro';
import { PLANETS, RASIS } from '../data/poruthamData';

// Tamil Names for Planets (with synonyms mentioned)
export const PLANET_TAMIL_NAMES = {
    Sun: "சூரியன் (ஞாயிறு/ரவி)",
    Moon: "சந்திரன் (திங்கள்/சோமன்)",
    Mars: "செவ்வாய் (அங்காரகன்/குஜன்)",
    Mercury: "புதன் (சௌமியன்/புத)",
    Jupiter: "குரு (வியாழன்/பிரகஸ்பதி)",
    Venus: "சுக்கிரன் (வெள்ளி/பார்கவன்)",
    Saturn: "சனி (மந்தன்/சனீஸ்வரர்)",
    Rahu: "ராகு (தமஸ்/சாயா கிரகம்)",
    Ketu: "கேது (சிகி/மேக கிரகம்)",
    Lagnam: "லக்கினம் (உதயம்)"
};

// Major Tamil Nadu Cities Coordinates
const CITY_COORDINATES = {
    "Chennai": { lat: 13.0827, lng: 80.2707 },
    "Coimbatore": { lat: 11.0168, lng: 76.9558 },
    "Madurai": { lat: 9.9252, lng: 78.1198 },
    "Tiruchirappalli": { lat: 10.7905, lng: 78.7047 },
    "Salem": { lat: 11.6643, lng: 78.1460 },
    "Tirunelveli": { lat: 8.7139, lng: 77.7567 },
    "Vellore": { lat: 12.9165, lng: 79.1323 },
    "Thoothukudi": { lat: 8.7642, lng: 78.1348 },
    "Thanjavur": { lat: 10.7870, lng: 79.1378 },
    "Nagercoil": { lat: 8.1833, lng: 77.4119 },
    "Karaikudi": { lat: 10.0747, lng: 78.7735 },
    "Arimalam": { lat: 10.2540, lng: 78.8840 },
    "Sivaganga": { lat: 10.1353, lng: 78.4810 },
    "Kanyakumari": { lat: 8.0883, lng: 77.5385 },
    "Rameswaram": { lat: 9.2881, lng: 79.3129 },
    "Pondicherry": { lat: 11.9416, lng: 79.8083 },
    "Erode": { lat: 11.3410, lng: 77.7172 },
    "Kumbakonam": { lat: 10.9602, lng: 79.3845 },
    "Dindigul": { lat: 10.3673, lng: 77.9803 },
    "Virudhunagar": { lat: 9.5851, lng: 77.9528 },
    "Ramanathapuram": { lat: 9.3639, lng: 78.8395 },
    "Pudukkottai": { lat: 10.3833, lng: 78.8001 },
    "Nagapattinam": { lat: 10.7672, lng: 79.8449 },
    "Tiruvallur": { lat: 13.1249, lng: 79.9086 },
    "Villupuram": { lat: 11.9401, lng: 79.4861 },
    "Cuddalore": { lat: 11.7480, lng: 79.7714 },
    "Tiruvannamalai": { lat: 12.2253, lng: 79.0747 },
    "Krishnagiri": { lat: 12.5186, lng: 78.2137 },
    "Dharmapuri": { lat: 12.1211, lng: 78.1582 },
    "Kanchipuram": { lat: 12.8342, lng: 79.7036 },
    "Tiruppur": { lat: 11.1085, lng: 77.3411 }
};

// Sanskrit Rasis as used by the vedic-astro library
const RASHIS_SANSKRIT = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

// Nakshatras as used by the vedic-astro library
const NAKSHATRAS_LIB = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

// Map library planet full names to our short IDs
const PLANET_NAME_TO_ID = {
    'Sun': 'Su',
    'Moon': 'Mo',
    'Mars': 'Ma',
    'Mercury': 'Me',
    'Jupiter': 'Ju',
    'Venus': 'Ve',
    'Saturn': 'Sa',
    'Rahu': 'Ra',
    'Ketu': 'Ke'
};

// Try to match city name (case-insensitive, partial match)
function findCityCoords(place) {
    if (!place) return CITY_COORDINATES["Chennai"];

    // Exact match first
    if (CITY_COORDINATES[place]) return CITY_COORDINATES[place];

    // Case-insensitive match
    const lowerPlace = place.toLowerCase().trim();
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
        if (city.toLowerCase() === lowerPlace) return coords;
    }

    // Partial match
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
        if (city.toLowerCase().includes(lowerPlace) || lowerPlace.includes(city.toLowerCase())) {
            return coords;
        }
    }

    // Default to center of Tamil Nadu
    console.warn(`City "${place}" not found in database, using default coordinates (Chennai)`);
    return CITY_COORDINATES["Chennai"];
}

export const calculateAstroDetails = async (dob, time, place, meridian = 'AM') => {
    try {
        console.log("=== ASTRO CALCULATION START ===");
        console.log("Input:", { dob, time, place, meridian });

        // 1. Get Coordinates
        const coords = findCityCoords(place);
        console.log("Coordinates:", coords);

        // 2. Prepare Time with IST offset (+05:30)
        let [hours, minutes] = time.split(':').map(Number);
        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;

        const pad = (n) => String(n).padStart(2, '0');
        const iso = `${dob}T${pad(hours)}:${pad(minutes)}:00+05:30`;
        console.log("IST ISO:", iso);

        const location = { latitude: coords.lat, longitude: coords.lng };

        // 3. Get Positions from vedic-astro
        const eph = await getPlanetaryPositions({ iso }, location);

        // ──────────────────────────────────────────────────────────────
        // BUG FIX: vedic-astro library has a critical bug in ephemeris.js
        // astronomia's moonposition.position(jd).lon returns RADIANS
        // but the library treats it as DEGREES, applying ayanamsha (24°)
        // to a value of ~0–6.28. This always gives ~336-342° sidereal 
        // longitude → always Meena (Pisces) / Uttara Bhadrapada.
        // 
        // Fix: reverse the incorrect operation, convert radians→degrees,
        // then reapply ayanamsha correctly.
        // ──────────────────────────────────────────────────────────────
        const AYANAMSHA = 24; // Same value used by the library
        const moonEntry = eph.positions.find(p => p.name === 'Moon');
        if (moonEntry) {
            const storedLon = moonEntry.longitude;
            // Reverse: storedLon = (radians - AYANAMSHA + 360) % 360
            // So: radians = (storedLon + AYANAMSHA) % 360
            const originalRadians = ((storedLon + AYANAMSHA) % 360 + 360) % 360;
            // Convert radians to degrees
            const moonLonTropical = originalRadians * (180 / Math.PI);
            // Apply ayanamsha correctly (in degrees)
            const moonLonSidereal = ((moonLonTropical - AYANAMSHA) % 360 + 360) % 360;

            console.log(`Moon Fix: stored=${storedLon.toFixed(2)}° → radians=${originalRadians.toFixed(4)} → tropical=${moonLonTropical.toFixed(2)}° → sidereal=${moonLonSidereal.toFixed(2)}°`);
            moonEntry.longitude = moonLonSidereal;
        }

        console.log("Corrected positions:", eph.positions.map(p => `${p.name}: ${p.longitude.toFixed(2)}°`));

        const panchang = getPanchang(eph, location);
        const moonSign = getMoonSign(eph);
        const kundali = getKundali(eph);

        console.log("Moon Sign (Rashi):", moonSign.rashi, "| Lord:", moonSign.lord);
        console.log("Nakshatra:", panchang.nakshatra);
        console.log("Ascendant:", kundali.ascendant);
        console.log("Houses:", kundali.houses.map((h, i) => `H${i + 1}(${h.sign}): [${h.planets.join(',')}]`));

        // 4. Map Rasi ID (library returns Sanskrit names like 'Mesha', 'Vrishabha')
        const rasiIdx = RASHIS_SANSKRIT.findIndex(r => r.toLowerCase() === moonSign.rashi?.toLowerCase());
        const rasiId = rasiIdx >= 0 ? rasiIdx + 1 : 1;

        // 5. Map Nakshatra ID (library returns 'Ashwini', 'Mrigashirsha', etc.)
        const starIdx = NAKSHATRAS_LIB.findIndex(n => n.toLowerCase() === panchang.nakshatra?.toLowerCase());
        const starId = starIdx >= 0 ? starIdx + 1 : 1;

        console.log("Mapped Rasi ID:", rasiId, "Star ID:", starId);

        // 6. Build Rasi Chart from kundali houses
        // Library returns: houses[0..11] = { sign: 'Mesha', planets: ['Sun', 'Mercury', ...] }
        // Ascendant is a string like 'Mesha' (the sign name)
        const rasiChart = {};

        kundali.houses.forEach((house, index) => {
            const houseNum = index + 1; // 1-based house number
            const planetIds = [];

            // Map library planet names (e.g. 'Sun', 'Moon') to our IDs ('Su', 'Mo')
            house.planets.forEach(planetName => {
                const id = PLANET_NAME_TO_ID[planetName];
                if (id) {
                    planetIds.push(id);
                }
            });

            if (planetIds.length > 0) {
                rasiChart[houseNum] = planetIds;
            }
        });

        // Add Lagnam to House 1 (Ascendant is always in house 1 by definition in whole-sign)
        if (!rasiChart[1]) rasiChart[1] = [];
        if (!rasiChart[1].includes('La')) {
            rasiChart[1].push('La');
        }

        // 7. Build Lagnam ID from ascendant sign
        const lagnamIdx = RASHIS_SANSKRIT.findIndex(r => r.toLowerCase() === kundali.ascendant?.toLowerCase());
        const lagnamId = lagnamIdx >= 0 ? lagnamIdx + 1 : rasiId;

        console.log("=== CHART DATA ===");
        for (let i = 1; i <= 12; i++) {
            if (rasiChart[i] && rasiChart[i].length > 0) {
                const housePlanets = rasiChart[i].map(id => {
                    const p = PLANETS.find(pl => pl.id === id);
                    return p ? `${p.nameTamilShort}(${id})` : id;
                });
                console.log(`House ${i} (${kundali.houses[i - 1].sign}): ${housePlanets.join(', ')}`);
            }
        }

        // 8. Build Navamsa Chart (D9)
        // Navamsa: each sign is divided into 9 parts of 3°20' each
        const navamsamChart = {};
        eph.positions.forEach(p => {
            const navamsaIdx = Math.floor((p.longitude % 30) / (30 / 9));
            const signIdx = Math.floor(p.longitude / 30) % 12;
            // Navamsa sign = (sign_index * 9 + navamsa_pada) % 12
            // For fire signs (0,4,8): starts from Aries
            // For earth signs (1,5,9): starts from Capricorn
            // For air signs (2,6,10): starts from Libra
            // For water signs (3,7,11): starts from Cancer
            const startSigns = [0, 9, 6, 3]; // Aries, Capricorn, Libra, Cancer
            const element = signIdx % 4;
            const navamsaSign = (startSigns[element] + navamsaIdx) % 12;
            const navHouseNum = navamsaSign + 1;

            const planetId = PLANET_NAME_TO_ID[p.name];
            if (planetId) {
                if (!navamsamChart[navHouseNum]) navamsamChart[navHouseNum] = [];
                navamsamChart[navHouseNum].push(planetId);
            }
        });

        console.log("=== NAVAMSA D9 ===");
        for (let i = 1; i <= 12; i++) {
            if (navamsamChart[i] && navamsamChart[i].length > 0) {
                console.log(`D9 House ${i}: ${navamsamChart[i].join(', ')}`);
            }
        }

        console.log("=== ASTRO CALCULATION COMPLETE ===");

        return {
            rasiId,
            starId,
            rasiChart,
            navamsamChart,
            lagnam: lagnamId
        };

    } catch (err) {
        console.error("Astro Calculation Error:", err);
        return null;
    }
};
