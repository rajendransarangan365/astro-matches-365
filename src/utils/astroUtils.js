import { getPlanetaryPositions, getPanchang, getMoonSign, getKundali } from 'vedic-astro';

// Tamil Names for Planets (with synonyms mentioned)
export const PLANET_TAMIL_NAMES = {
    Sun: "சூரியன்",
    Moon: "சந்திரன்",
    Mars: "செவ்வாய்",
    Mercury: "புதன்",
    Jupiter: "குரு (வியாழன்)",
    Venus: "சுக்கிரன்",
    Saturn: "சனி",
    Rahu: "ராகு",
    Ketu: "கேது",
    Lagnam: "லக்கினம்"
};

const RASI_TAMIL_NAMES = [
    "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
    "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"
];

const STAR_TAMIL_NAMES = [
    "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை",
    "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
    "ஹஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
    "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
    "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
];

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
    "Kanyakumari": { lat: 8.0883, lng: 77.5385 },
    "Rameswaram": { lat: 9.2881, lng: 79.3129 },
    "Pondicherry": { lat: 11.9416, lng: 79.8083 }
};

export const calculateAstroDetails = async (dob, time, place, meridian = 'AM') => {
    try {
        console.log("Starting calculation for:", { dob, time, place, meridian });

        // 1. Get Coordinates
        const coords = CITY_COORDINATES[place] || CITY_COORDINATES["Chennai"];

        // 2. Prepare Time with IST offset (+05:30)
        let [hours, minutes] = time.split(':').map(Number);
        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;

        const pad = (n) => String(n).padStart(2, '0');
        const iso = `${dob}T${pad(hours)}:${pad(minutes)}:00+05:30`;

        console.log("Forced IST ISO:", iso);

        const location = { latitude: coords.lat, longitude: coords.lng };

        // 3. Get Positions
        const eph = await getPlanetaryPositions({ iso }, location);
        const panchang = getPanchang(eph, location);
        const moonSign = getMoonSign(eph);
        const kundali = getKundali(eph);

        console.log("Library raw sample:", { rashi: moonSign.rashi, star: panchang.nakshatra });

        // 4. Map Rasi and Star (Library uses Sanskrit names)
        const RASI_ENG = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
        const STAR_ENG = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsa", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanistha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

        // Normalize string for safety
        const matchName = (arr, val) => arr.findIndex(name => name.toLowerCase() === val?.toLowerCase()) + 1;

        const rasiId = matchName(RASI_ENG, moonSign.rashi) || 1;
        const starId = matchName(STAR_ENG, panchang.nakshatra) || 1;

        // 5. Generate Charts
        const rasiChart = {};

        if (kundali && kundali.houses) {
            kundali.houses.forEach((house, index) => {
                const houseNum = index + 1;
                const planets = house.planets || [];
                if (planets.length > 0) {
                    // Map directly to English IDs (Su, Mo, etc.)
                    rasiChart[houseNum] = planets;
                }
            });

            // Lagnam
            if (kundali.ascendant) {
                const lagnaHouse = kundali.ascendant.house;
                if (!rasiChart[lagnaHouse]) rasiChart[lagnaHouse] = [];
                if (!rasiChart[lagnaHouse].includes("La")) {
                    rasiChart[lagnaHouse].push("La");
                }
            }
        }

        console.log("Final Calculated State:", { rasiId, starId, chartKeys: Object.keys(rasiChart) });

        console.log("Generated Rasi Chart:", rasiChart);

        return {
            rasiId,
            starId,
            rasiChart,
            navamsamChart: JSON.parse(JSON.stringify(rasiChart)), // Deep copy
            lagnam: rasiId // Default to rasi for now
        };

    } catch (err) {
        console.error("Astro Calculation Error:", err);
        return null;
    }
};

const translatePlanet = (planetCode) => {
    // UI components now handle translation using PLANETS metadata
    return planetCode;
};

const rasiIdToHouse = (signName) => {
    return RASI_TAMIL_NAMES.indexOf(signName) + 1;
};
