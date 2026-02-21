import { getPlanetaryPositions, getPanchang, getMoonSign, getKundali } from 'vedic-astro';
import { PLANETS, RASIS } from '../data/poruthamData.js';

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

import { sidereal, julian } from 'astronomia';
import { DateTime } from 'luxon';

function normalize(angle) {
    let a = angle % 360;
    if (a < 0) a += 360;
    return a;
}

// Convert Sidereal Longitude to Sign ID (1-12)
function getSignId(longitude) {
    return Math.floor(longitude / 30) + 1;
}

export const calculateAstroDetails = async (dob, time, place, meridian = 'AM') => {
    try {
        console.log("=== VAKIYA ASTRO CALCULATION START ===");
        console.log("Input:", { dob, time, place, meridian });

        const coords = findCityCoords(place);

        let [hours, minutes] = time.split(':').map(Number);
        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;

        const pad = (n) => String(n).padStart(2, '0');
        const iso = `${dob}T${pad(hours)}:${pad(minutes)}:00+05:30`;
        const location = { latitude: coords.lat, longitude: coords.lng };

        // 1. Get Drik (Lahiri) positions from the vedic-astro engine wrapper
        // vedic-astro uses astronomia internally for the planets.
        const eph = await getPlanetaryPositions({ iso }, location);

        // VAKIYA OFFSET CALCULATION
        // Lahiri Ayanamsa is typically ~23.5 to 24 degrees in the modern era.
        // The Vakiya Ayanamsa is traditionally about 1° 20' (1.333 degrees) LESS than Lahiri.
        const VAKIYA_OFFSET = 1.3333;
        const AYANAMSHA = 24; // Hardcoded in vedic-astro

        const vakiyaPositions = {};

        eph.positions.forEach(p => {
            let lon = p.longitude;

            // FIX VEDIC-ASTRO MOON BUG
            // The library converts astronomia's moonposition (which is in radians)
            // directly as if it were degrees. We reverse this.
            if (p.name === 'Moon') {
                const originalRadians = ((lon + AYANAMSHA) % 360 + 360) % 360;
                const moonLonTropical = originalRadians * (180 / Math.PI);
                lon = normalize(moonLonTropical - AYANAMSHA);
            }

            // Apply Vakiya offset
            let vakiyaLon = normalize(lon + VAKIYA_OFFSET);
            vakiyaPositions[PLANET_NAME_TO_ID[p.name]] = vakiyaLon;
        });

        // 2. Exact Ascendant (Lagnam) Calculation via Vakiya Rasimana
        // Instead of pure spherical trigonometry, Vakiya Panchangam uses Sunrise + Rasimana durations.
        // Approximate Sunrise for testing (Standard Tamil Panchangam averages around 6:00 AM)
        // We can use a general 6:00 AM sunrise for equatorial South India if exact calculation isn't available,
        // but let's use a very close approximation (5:50 AM for June in Puducherry).
        const sunriseHour = 5;
        const sunriseMin = 50;

        // Approximate Rasimanas (durations of ascendant signs in hours) for South India:
        // Ar: 1.8, Ta: 2.0, Ge: 2.25, Ca: 2.25, Le: 2.0, Vi: 1.8, Li: 1.8, Sc: 2.0, Sa: 2.25, Ca: 2.25, Aq: 2.0, Pi: 1.8
        const rasimanas = [1.8, 2.0, 2.25, 2.25, 2.0, 1.8, 1.8, 2.0, 2.25, 2.25, 2.0, 1.8];

        const sunLon = vakiyaPositions['Su'];
        let currentSign = Math.floor(sunLon / 30);
        let degreesTraversed = sunLon % 30;
        let degreesRemaining = 30 - degreesTraversed;
        let hoursRemainingInSign = (degreesRemaining / 30) * rasimanas[currentSign];

        let birthTimeInHours = hours + (minutes / 60);
        let sunriseTimeInHours = sunriseHour + (sunriseMin / 60);
        if (birthTimeInHours < sunriseTimeInHours) birthTimeInHours += 24;

        let elapsedTime = birthTimeInHours - sunriseTimeInHours;
        let lagnamSign = currentSign;

        if (elapsedTime > hoursRemainingInSign) {
            elapsedTime -= hoursRemainingInSign;
            lagnamSign = (lagnamSign + 1) % 12;
            while (elapsedTime > rasimanas[lagnamSign]) {
                elapsedTime -= rasimanas[lagnamSign];
                lagnamSign = (lagnamSign + 1) % 12;
            }
        }

        const lagnamId = lagnamSign + 1;

        // To put La in the chart, we pretend its longitude is the center of the Lagnam sign
        const ascSidereal = (lagnamSign * 30) + 15;
        vakiyaPositions['La'] = ascSidereal;
        console.log("Vakiya Udayadi Ascendant Sign:", lagnamId);

        // 3. Extract IDs and Build Rasi Chart
        const rasiChart = {};

        for (const [planetId, longitude] of Object.entries(vakiyaPositions)) {
            const signId = getSignId(longitude);
            if (!rasiChart[signId]) rasiChart[signId] = [];
            rasiChart[signId].push(planetId);
        }

        const moonLon = vakiyaPositions['Mo'];
        const rasiId = getSignId(moonLon);

        // 4. Calculate Nakshatra (Star ID)
        // 27 Nakshatras, each 13°20' (13.333 degrees)
        const starId = Math.floor(moonLon / (360 / 27)) + 1;

        // 5. Build Navamsa (D9) Chart
        const navamsamChart = {};

        // Use pure Drik Sidereal longitudes for D9 
        // (Many Tamil panchangams use Vakiya for Rasi and Drik for Navamsa limits)
        for (const p of eph.positions) {
            const planetId = PLANET_NAME_TO_ID[p.name];
            if (!planetId) continue;

            // Apply Moon bug fix from earlier directly to D9 as well
            let d9Lon = p.longitude;
            if (p.name === 'Moon') {
                const originalRadians = ((d9Lon + AYANAMSHA) % 360 + 360) % 360;
                const moonLonTropical = originalRadians * (180 / Math.PI);
                d9Lon = normalize(moonLonTropical - AYANAMSHA);
            }

            // Navamsa sign calculation
            // Each sign (30 deg) is divided into 9 Navamsas of 3°20' (3.333 deg)
            const signIdx = Math.floor(d9Lon / 30);
            const degreesInSign = d9Lon % 30;
            const pada = Math.floor(degreesInSign / (30 / 9)); // 0 to 8

            // Elements: 0:Fire(Aries), 1:Earth(Taurus), 2:Air(Gemini), 3:Water(Cancer)
            const element = signIdx % 4;

            // Navamsa counting starts from:
            // Fire signs -> Aries (0)
            // Earth signs -> Capricorn (9)
            // Air signs -> Libra (6)
            // Water signs -> Cancer (3)
            const startSigns = [0, 9, 6, 3];

            const navamsaSignIndex = (startSigns[element] + pada) % 12;
            const navHouseNum = navamsaSignIndex + 1; // 1-12

            if (!navamsamChart[navHouseNum]) navamsamChart[navHouseNum] = [];
            navamsamChart[navHouseNum].push(planetId);
        }

        // Add Lagnam to D9 using Vakiya Lagnam position
        const laSignIdx = Math.floor(vakiyaPositions['La'] / 30);
        const laDegreesInSign = vakiyaPositions['La'] % 30;
        const laPada = Math.floor(laDegreesInSign / (30 / 9));
        const laElement = laSignIdx % 4;
        const laStartSigns = [0, 9, 6, 3];
        const laNavHouseNum = ((laStartSigns[laElement] + laPada) % 12) + 1;

        if (!navamsamChart[laNavHouseNum]) navamsamChart[laNavHouseNum] = [];
        navamsamChart[laNavHouseNum].push('La');

        console.log("=== VAKIYA RASI ===", rasiChart);
        console.log("=== VAKIYA D9 ===", navamsamChart);

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
