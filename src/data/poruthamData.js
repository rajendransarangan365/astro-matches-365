// Stars with exact Pada (quarter) to Rasi mappings
export const STARS = [
  { id: 1, nameTamil: "அஸ்வினி", nameEnglish: "Ashwini", gana: "Deva", yoni: "Horse", rajju: "Foot", vedhai: "Jyeshtha", rasiMapping: [{ rasiId: 1, padas: "1,2,3,4" }] },
  { id: 2, nameTamil: "பரணி", nameEnglish: "Bharani", gana: "Manushya", yoni: "Elephant", rajju: "Thigh", vedhai: "Anuradha", rasiMapping: [{ rasiId: 1, padas: "1,2,3,4" }] },
  { id: 3, nameTamil: "கார்த்திகை", nameEnglish: "Krittika", gana: "Rakshasa", yoni: "Goat", rajju: "Middle", vedhai: "Vishakha", rasiMapping: [{ rasiId: 1, padas: "1" }, { rasiId: 2, padas: "2,3,4" }] },
  { id: 4, nameTamil: "ரோகிணி", nameEnglish: "Rohini", gana: "Manushya", yoni: "Serpent", rajju: "Neck", vedhai: "Swati", rasiMapping: [{ rasiId: 2, padas: "1,2,3,4" }] },
  { id: 5, nameTamil: "மிருகசீரிஷம்", nameEnglish: "Mrigashirsha", gana: "Deva", yoni: "Serpent", rajju: "Head", vedhai: "Chitra", rasiMapping: [{ rasiId: 2, padas: "1,2" }, { rasiId: 3, padas: "3,4" }] },
  { id: 6, nameTamil: "திருவாதிரை", nameEnglish: "Ardra", gana: "Manushya", yoni: "Dog", rajju: "Neck", vedhai: "Thiruvonam", rasiMapping: [{ rasiId: 3, padas: "1,2,3,4" }] },
  { id: 7, nameTamil: "புனர்பூசம்", nameEnglish: "Punarvasu", gana: "Deva", yoni: "Cat", rajju: "Middle", vedhai: "Uthiraadam", rasiMapping: [{ rasiId: 3, padas: "1,2,3" }, { rasiId: 4, padas: "4" }] },
  { id: 8, nameTamil: "பூசம்", nameEnglish: "Pushya", gana: "Deva", yoni: "Goat", rajju: "Thigh", vedhai: "Pooradam", rasiMapping: [{ rasiId: 4, padas: "1,2,3,4" }] },
  { id: 9, nameTamil: "ஆயில்யம்", nameEnglish: "Ashlesha", gana: "Rakshasa", yoni: "Cat", rajju: "Foot", vedhai: "Moolam", rasiMapping: [{ rasiId: 4, padas: "1,2,3,4" }] },
  { id: 10, nameTamil: "மகம்", nameEnglish: "Magha", gana: "Rakshasa", yoni: "Rat", rajju: "Foot", vedhai: "Revati", rasiMapping: [{ rasiId: 5, padas: "1,2,3,4" }] },
  { id: 11, nameTamil: "பூரம்", nameEnglish: "Purva Phalguni", gana: "Manushya", yoni: "Rat", rajju: "Thigh", vedhai: "Uttara Bhadrapada", rasiMapping: [{ rasiId: 5, padas: "1,2,3,4" }] },
  { id: 12, nameTamil: "உத்திரம்", nameEnglish: "Uttara Phalguni", gana: "Manushya", yoni: "Cow", rajju: "Middle", vedhai: "Purva Bhadrapada", rasiMapping: [{ rasiId: 5, padas: "1" }, { rasiId: 6, padas: "2,3,4" }] },
  { id: 13, nameTamil: "ஹஸ்தம்", nameEnglish: "Hasta", gana: "Deva", yoni: "Buffalo", rajju: "Neck", vedhai: "Shatabhisha", rasiMapping: [{ rasiId: 6, padas: "1,2,3,4" }] },
  { id: 14, nameTamil: "சித்திரை", nameEnglish: "Chitra", gana: "Rakshasa", yoni: "Tiger", rajju: "Head", vedhai: "Mrigashirsha", rasiMapping: [{ rasiId: 6, padas: "1,2" }, { rasiId: 7, padas: "3,4" }] },
  { id: 15, nameTamil: "சுவாதி", nameEnglish: "Swati", gana: "Deva", yoni: "Buffalo", rajju: "Neck", vedhai: "Rohini", rasiMapping: [{ rasiId: 7, padas: "1,2,3,4" }] },
  { id: 16, nameTamil: "விசாகம்", nameEnglish: "Vishakha", gana: "Rakshasa", yoni: "Tiger", rajju: "Middle", vedhai: "Krittika", rasiMapping: [{ rasiId: 7, padas: "1,2,3" }, { rasiId: 8, padas: "4" }] },
  { id: 17, nameTamil: "அனுஷம்", nameEnglish: "Anuradha", gana: "Deva", yoni: "Deer", rajju: "Thigh", vedhai: "Bharani", rasiMapping: [{ rasiId: 8, padas: "1,2,3,4" }] },
  { id: 18, nameTamil: "கேட்டை", nameEnglish: "Jyeshtha", gana: "Rakshasa", yoni: "Deer", rajju: "Foot", vedhai: "Ashwini", rasiMapping: [{ rasiId: 8, padas: "1,2,3,4" }] },
  { id: 19, nameTamil: "மூலம்", nameEnglish: "Mula", gana: "Rakshasa", yoni: "Dog", rajju: "Foot", vedhai: "Ashlesha", rasiMapping: [{ rasiId: 9, padas: "1,2,3,4" }] },
  { id: 20, nameTamil: "பூராடம்", nameEnglish: "Purva Ashadha", gana: "Manushya", yoni: "Monkey", rajju: "Thigh", vedhai: "Pushya", rasiMapping: [{ rasiId: 9, padas: "1,2,3,4" }] },
  { id: 21, nameTamil: "உத்திராடம்", nameEnglish: "Uttara Ashadha", gana: "Manushya", yoni: "Mongoose", rajju: "Middle", vedhai: "Punarvasu", rasiMapping: [{ rasiId: 9, padas: "1" }, { rasiId: 10, padas: "2,3,4" }] },
  { id: 22, nameTamil: "திருவோணம்", nameEnglish: "Shravana", gana: "Deva", yoni: "Monkey", rajju: "Neck", vedhai: "Ardra", rasiMapping: [{ rasiId: 10, padas: "1,2,3,4" }] },
  { id: 23, nameTamil: "அவிட்டம்", nameEnglish: "Dhanishta", gana: "Rakshasa", yoni: "Lion", rajju: "Head", vedhai: "Chitra", rasiMapping: [{ rasiId: 10, padas: "1,2" }, { rasiId: 11, padas: "3,4" }] },
  { id: 24, nameTamil: "சதயம்", nameEnglish: "Shatabhisha", gana: "Rakshasa", yoni: "Horse", rajju: "Neck", vedhai: "Hasta", rasiMapping: [{ rasiId: 11, padas: "1,2,3,4" }] },
  { id: 25, nameTamil: "பூரட்டாதி", nameEnglish: "Purva Bhadrapada", gana: "Manushya", yoni: "Lion", rajju: "Middle", vedhai: "Uttara Phalguni", rasiMapping: [{ rasiId: 11, padas: "1,2,3" }, { rasiId: 12, padas: "4" }] },
  { id: 26, nameTamil: "உத்திரட்டாதி", nameEnglish: "Uttara Bhadrapada", gana: "Manushya", yoni: "Cow", rajju: "Thigh", vedhai: "Purva Phalguni", rasiMapping: [{ rasiId: 12, padas: "1,2,3,4" }] },
  { id: 27, nameTamil: "ரேவதி", nameEnglish: "Revati", gana: "Deva", yoni: "Elephant", rajju: "Foot", vedhai: "Magha", rasiMapping: [{ rasiId: 12, padas: "1,2,3,4" }] }
];

export const RASIS = [
  { id: 1, nameTamil: "மேஷம்", nameEnglish: "Aries", nameSanskrit: "Mesha", lord: "Mars" },
  { id: 2, nameTamil: "ரிஷபம்", nameEnglish: "Taurus", nameSanskrit: "Vrishabha", lord: "Venus" },
  { id: 3, nameTamil: "மிதுனம்", nameEnglish: "Gemini", nameSanskrit: "Mithuna", lord: "Mercury" },
  { id: 4, nameTamil: "கடகம்", nameEnglish: "Cancer", nameSanskrit: "Karka", lord: "Moon" },
  { id: 5, nameTamil: "சிம்மம்", nameEnglish: "Leo", nameSanskrit: "Simha", lord: "Sun" },
  { id: 6, nameTamil: "கன்னி", nameEnglish: "Virgo", nameSanskrit: "Kanya", lord: "Mercury" },
  { id: 7, nameTamil: "துலாம்", nameEnglish: "Libra", nameSanskrit: "Tula", lord: "Venus" },
  { id: 8, nameTamil: "விருச்சிகம்", nameEnglish: "Scorpio", nameSanskrit: "Vrishchika", lord: "Mars" },
  { id: 9, nameTamil: "தனுசு", nameEnglish: "Sagittarius", nameSanskrit: "Dhanu", lord: "Jupiter" },
  { id: 10, nameTamil: "மகரம்", nameEnglish: "Capricorn", nameSanskrit: "Makara", lord: "Saturn" },
  { id: 11, nameTamil: "கும்பம்", nameEnglish: "Aquarius", nameSanskrit: "Kumbha", lord: "Saturn" },
  { id: 12, nameTamil: "மீனம்", nameEnglish: "Pisces", nameSanskrit: "Meena", lord: "Jupiter" }
];

export const YONI_ENEMIES = {
  "Horse": "Buffalo",
  "Elephant": "Lion",
  "Goat": "Monkey",
  "Serpent": "Mongoose",
  "Dog": "Deer",
  "Cat": "Rat",
  "Cow": "Tiger"
};

export const PLANET_FRIENDS = {
  "Sun": ["Moon", "Mars", "Jupiter"],
  "Moon": ["Sun", "Mercury"],
  "Mars": ["Sun", "Moon", "Jupiter"],
  "Mercury": ["Sun", "Venus"],
  "Jupiter": ["Sun", "Moon", "Mars"],
  "Venus": ["Mercury", "Saturn"],
  "Saturn": ["Mercury", "Venus"]
};

// Planet data with all alternate names as per traditional Tamil astrology
// குரு (Guru) மற்றும் வியாழன் (Jupiter/Brihaspati) ஆகிய இரண்டும் ஒன்றே
export const PLANETS = [
  { id: "Su", nameTamil: "சூரியன் (ஞாயிறு)", nameTamilShort: "சூ", nameEnglish: "Sun", libName: "Sun", altNames: "சூரியன் / ஞாயிறு / ரவி / Surya / Ravi" },
  { id: "Mo", nameTamil: "சந்திரன் (திங்கள்)", nameTamilShort: "சந்", nameEnglish: "Moon", libName: "Moon", altNames: "சந்திரன் / திங்கள் / Chandra / Soma" },
  { id: "Ma", nameTamil: "செவ்வாய் (அங்காரகன்)", nameTamilShort: "செ", nameEnglish: "Mars", libName: "Mars", altNames: "செவ்வாய் / அங்காரகன் / குஜன் / Mangal / Kuja" },
  { id: "Me", nameTamil: "புதன் (சௌமியன்)", nameTamilShort: "பு", nameEnglish: "Mercury", libName: "Mercury", altNames: "புதன் / சௌமியன் / Budh / Soumya" },
  { id: "Ju", nameTamil: "குரு (வியாழன்)", nameTamilShort: "கு", nameEnglish: "Jupiter", libName: "Jupiter", altNames: "குரு / வியாழன் / பிரகஸ்பதி / Guru / Brihaspati" },
  { id: "Ve", nameTamil: "சுக்கிரன் (வெள்ளி)", nameTamilShort: "சு", nameEnglish: "Venus", libName: "Venus", altNames: "சுக்கிரன் / வெள்ளி / Shukra / Bhargava" },
  { id: "Sa", nameTamil: "சனி (மந்தன்)", nameTamilShort: "ச", nameEnglish: "Saturn", libName: "Saturn", altNames: "சனி / மந்தன் / Shani / Manda" },
  { id: "Ra", nameTamil: "ராகு", nameTamilShort: "ரா", nameEnglish: "Rahu", libName: "Rahu", altNames: "ராகு / தமஸ் / Rahu / Tamas" },
  { id: "Ke", nameTamil: "கேது", nameTamilShort: "கே", nameEnglish: "Ketu", libName: "Ketu", altNames: "கேது / சிகி / Ketu / Sikhi" },
  { id: "La", nameTamil: "லக்கினம்", nameTamilShort: "லக்", nameEnglish: "Lagnam", libName: "Lagnam", altNames: "லக்கினம் / உதயம் / Lagna / Ascendant" }
];

// Vasya Porutham Data - Which Rasis are Vasya to which
// Key = Rasi ID, Value = array of Rasi IDs that are Vasya (submissive/attracted) to it
export const VASYA_DATA = {
  1: [5, 8],       // Mesham -> Simham, Viruchigam
  2: [4, 7],       // Rishabam -> Kadagam, Thulam
  3: [6],          // Mithunam -> Kanni
  4: [8, 6],       // Kadagam -> Viruchigam, Kanni
  5: [7],          // Simmam -> Thulam
  6: [3, 12],      // Kanni -> Mithunam, Meenam
  7: [6],          // Thulam -> Kanni
  8: [4],          // Viruchigam -> Kadagam
  9: [12],         // Dhanusu -> Meenam
  10: [11],        // Makaram -> Kumbam
  11: [1],         // Kumbam -> Mesham
  12: [10]         // Meenam -> Makaram
};

// Nadi classification for all 27 stars
// Nadi: 1 = Vatha (வாதம்), 2 = Pitha (பித்தம்), 3 = Kapha (கபம்/சிலேத்துமம்)
export const NADI_GROUPS = {
  1: 1, 2: 2, 3: 3, 4: 1, 5: 2, 6: 3, 7: 1, 8: 2, 9: 3,    // Ashwini-Ashlesha
  10: 1, 11: 2, 12: 3, 13: 1, 14: 2, 15: 3, 16: 1, 17: 2, 18: 3, // Magha-Jyeshtha
  19: 1, 20: 2, 21: 3, 22: 1, 23: 2, 24: 3, 25: 1, 26: 2, 27: 3  // Mula-Revati
};

export const NADI_NAMES = {
  1: "வாதம் (Vatha)",
  2: "பித்தம் (Pitha)",
  3: "கபம் (Kapha)"
};

// Rasi Characteristics for story generation
export const RASI_CHARACTERISTICS = {
  1: { trait: "தைரியமும் துணிச்சலும்", nature: "fire", positives: "முன்னோடி குணம், தலைமைப் பண்பு", challenges: "கோபம், அவசரம்" },
  2: { trait: "நிதானமும் பொறுமையும்", nature: "earth", positives: "உறுதி, விசுவாசம், அமைதி", challenges: "பிடிவாதம், மாற்றத்தை ஏற்காத தன்மை" },
  3: { trait: "புத்திசாலித்தனமும் பேச்சுத்திறனும்", nature: "air", positives: "சமூகத் திறமை, புத்திசாலித்தனம்", challenges: "இருமுகம், நிலையற்ற மனம்" },
  4: { trait: "பாசமும் உணர்ச்சிவசமும்", nature: "water", positives: "குடும்ப பாசம், பராமரிப்பு குணம்", challenges: "அதிக உணர்ச்சி, சந்தேகம்" },
  5: { trait: "கம்பீரமும் தன்னம்பிக்கையும்", nature: "fire", positives: "தலைமை, தாராள மனம், நேர்மை", challenges: "ஆணவம், பிறரை ஆதிக்கம் செய்தல்" },
  6: { trait: "நுணுக்கமும் ஒழுங்கும்", nature: "earth", positives: "விவேகம், சேவை மனப்பான்மை", challenges: "அதிக எதிர்பார்ப்பு, குறை கண்டுபிடித்தல்" },
  7: { trait: "சமநிலையும் நியாயமும்", nature: "air", positives: "சமநிலை, அழகு உணர்வு, ராஜதந்திரம்", challenges: "முடிவெடுக்க தாமதம், பிறர் ஒப்புதலுக்கு ஏங்குதல்" },
  8: { trait: "ஆழமும் தீவிரமும்", nature: "water", positives: "ஆராய்ச்சி மனம், உறுதி, விசுவாசம்", challenges: "சந்தேகம், பழிவாங்கும் குணம்" },
  9: { trait: "நம்பிக்கையும் தர்மமும்", nature: "fire", positives: "நேர்மை, ஆன்மிகம், உயர் சிந்தனை", challenges: "அதிக நம்பிக்கை, நிதானமின்மை" },
  10: { trait: "கடின உழைப்பும் பொறுப்பும்", nature: "earth", positives: "ஒழுக்கம், விடாமுயற்சி, நடைமுறை அறிவு", challenges: "பயம், அதிக கட்டுப்பாடு" },
  11: { trait: "சுதந்திரமும் புரட்சியும்", nature: "air", positives: "புதுமை, மனிதநேயம், புத்திசாலி", challenges: "உணர்ச்சியற்ற தன்மை, பிடிவாதம்" },
  12: { trait: "கற்பனையும் ஆன்மிகமும்", nature: "water", positives: "கருணை, கலை உணர்வு, புரிந்துகொள்ளும் திறன்", challenges: "தப்பிக்கும் மனப்பான்மை, குழப்பம்" }
};
