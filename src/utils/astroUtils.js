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
    "Kanyakumari": { lat: 8.0883, lng: 77.5385 },
    "Rameswaram": { lat: 9.2881, lng: 79.3129 },
    "Pondicherry": { lat: 11.9416, lng: 79.8083 }
};

export const calculateAstroDetails = async (dob, time, place) => {
    try {
        // 1. Get Coordinates
        const coords = CITY_COORDINATES[place] || CITY_COORDINATES["Chennai"]; // Default to Chennai if not found

        // 2. Prepare ISO string
        const [year, month, day] = dob.split('-').map(Number);
        let [hours, minutes] = time.split(':').map(Number);
        const date = new Date(year, month - 1, day, hours, minutes);
        const iso = date.toISOString();

        const location = { latitude: coords.lat, longitude: coords.lng };

        // 3. Get Positions
        const eph = await getPlanetaryPositions({ iso }, location);
        const panchang = getPanchang(eph, location);
        const moonSign = getMoonSign(eph);
        const kundali = getKundali(eph);

        // 4. Map Rasi and Star
        // Star index in STARS array (1-27)
        // Rasi index in RASIS array (1-12)
        // Note: Library might return names, we need to find our IDs

        const rasiId = RASIS_TAMIL_NAMES.indexOf(moonSign.rashi) + 1 || 1;
        const starId = STAR_TAMIL_NAMES.indexOf(panchang.nakshatra) + 1 || 1;

        // 5. Generate Charts
        // South Indian Style: Houses 1 to 12
        const rasiChart = {};
        const navamsamChart = {};

        // D1 (Rasi) positions
        kundali.houses.forEach((house, index) => {
            const houseNum = index + 1;
            const planetsInHouse = house.planets || [];
            rasiChart[houseNum] = planetsInHouse.map(p => translatePlanet(p));
        });

        // Lagnam (Ascendant)
        if (kundali.ascendant) {
            const lagnaHouse = kundali.ascendant.house;
            if (!rasiChart[lagnaHouse]) rasiChart[lagnaHouse] = [];
            rasiChart[lagnaHouse].push("லக்");
        }

        // Navamsam (D9) - Mock calculation for now if lib doesn't provide
        // Simple mock logic: just shift slightly for demo, or calculate if we have longitudes
        // D9 is more complex, usually lib provides it.
        // If vedic-astro doesn't have D9 in getKundali, we'll use a placeholder or calc.

        return {
            rasiId,
            starId,
            rasiChart,
            navamsamChart: rasiChart, // Defaulting to Rasi for now, update if D9 found
            lagnam: kundali.ascendant ? rasiIdToHouse(kundali.ascendant.sign) : 1
        };

    } catch (err) {
        console.error("Astro Calculation Error:", err);
        return null;
    }
};

const translatePlanet = (planetCode) => {
    const map = {
        "Su": "சூ",
        "Mo": "சந்",
        "Ma": "செ",
        "Me": "பு",
        "Ju": "கு",
        "Ve": "சு",
        "Sa": "ச",
        "Ra": "ரா",
        "Ke": "கே"
    };
    return map[planetCode] || planetCode;
};

const rasiIdToHouse = (signName) => {
    return RASI_TAMIL_NAMES.indexOf(signName) + 1;
};
