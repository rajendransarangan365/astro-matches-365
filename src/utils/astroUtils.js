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

export const calculateAstroDetails = async (dob, time, place, meridian = 'AM') => {
    try {
        console.log("Starting calculation for:", { dob, time, place, meridian });

        // 1. Get Coordinates
        const coords = CITY_COORDINATES[place] || CITY_COORDINATES["Chennai"];

        // 2. Prepare Date with Meridian correction
        const [year, month, day] = dob.split('-').map(Number);
        let [hours, minutes] = time.split(':').map(Number);

        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;

        // Use UTC offset for India (+5:30) if possible, or just local date
        // Note: vedic-astro expects { iso } which usually implies UTC or ISO with offset
        const date = new Date(year, month - 1, day, hours, minutes);
        const iso = date.toISOString();

        console.log("Calculated ISO:", iso, "using coordinates:", coords);

        const location = { latitude: coords.lat, longitude: coords.lng };

        // 3. Get Positions
        const eph = await getPlanetaryPositions({ iso }, location);
        const panchang = getPanchang(eph, location);
        const moonSign = getMoonSign(eph);
        const kundali = getKundali(eph);

        console.log("Library Output Sample:", {
            rashi: moonSign.rashi,
            star: panchang.nakshatra,
            houses: kundali?.houses?.length
        });

        // 4. Map Rasi and Star (Library returns English names like 'Aries', 'Ashwini')
        // We use a helper to find the index
        const RASI_ENG = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        const STAR_ENG = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigasira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

        const rasiId = RASI_ENG.indexOf(moonSign.rashi) + 1 || 1;
        const starId = STAR_ENG.indexOf(panchang.nakshatra) + 1 || 1;

        // 5. Generate Charts
        const rasiChart = {};

        if (kundali && kundali.houses) {
            kundali.houses.forEach((house, index) => {
                const houseNum = index + 1;
                // Planets might be in house.planets (array of codes)
                const planetsInHouse = house.planets || [];
                if (planetsInHouse.length > 0) {
                    rasiChart[houseNum] = planetsInHouse.map(p => translatePlanet(p));
                }
            });

            // Lagnam (Ascendant)
            if (kundali.ascendant) {
                const lagnaHouse = kundali.ascendant.house;
                if (!rasiChart[lagnaHouse]) rasiChart[lagnaHouse] = [];
                if (!rasiChart[lagnaHouse].includes("லக்")) {
                    rasiChart[lagnaHouse].push("லக்");
                }
            }
        }

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
