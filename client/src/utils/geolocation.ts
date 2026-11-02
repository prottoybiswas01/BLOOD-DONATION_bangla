/**
 * Bangladesh Geolocation & Reverse Geocoding Utility
 * 
 * Provides privacy-preserving client-side location detection for Bangladesh.
 * Coordinates are mapped to Bangladesh Division and District without saving
 * raw GPS coordinates to backend databases.
 */

import { BANGLADESH_DIVISIONS } from '../data/bangladeshLocations';

export interface DetectedLocation {
  division: string;
  district: string;
  upazila?: string;
  districtNameBn: string;
  divisionNameBn: string;
}

// Centroids (latitude, longitude) for Bangladesh's 64 districts
// Enables instant, resilient, 100% offline reverse-geocoding without external API dependency
const BANGLADESH_DISTRICT_CENTROIDS: Record<string, { lat: number; lng: number; division: string }> = {
  // Dhaka Division
  dhaka: { lat: 23.8103, lng: 90.4125, division: 'dhaka' },
  gazipur: { lat: 24.0023, lng: 90.4264, division: 'dhaka' },
  narayanganj: { lat: 23.6238, lng: 90.5000, division: 'dhaka' },
  tangail: { lat: 24.2513, lng: 89.9167, division: 'dhaka' },
  kishoreganj: { lat: 24.4449, lng: 90.7766, division: 'dhaka' },
  manikganj: { lat: 23.8617, lng: 90.0003, division: 'dhaka' },
  munshiganj: { lat: 23.5422, lng: 90.5305, division: 'dhaka' },
  narsingdi: { lat: 23.9193, lng: 90.7176, division: 'dhaka' },
  faridpur: { lat: 23.6071, lng: 89.8429, division: 'dhaka' },
  gopalganj: { lat: 23.0051, lng: 89.8266, division: 'dhaka' },
  madaripur: { lat: 23.1641, lng: 90.1897, division: 'dhaka' },
  rajbari: { lat: 23.7574, lng: 89.6445, division: 'dhaka' },
  shariatpur: { lat: 23.2423, lng: 90.4348, division: 'dhaka' },

  // Chittagong Division
  chattogram: { lat: 22.3569, lng: 91.7832, division: 'chattogram' },
  coxs_bazar: { lat: 21.4272, lng: 92.0058, division: 'chattogram' },
  cumilla: { lat: 23.4682, lng: 91.1788, division: 'chattogram' },
  brahmanbaria: { lat: 23.9571, lng: 91.1119, division: 'chattogram' },
  chandpur: { lat: 23.2333, lng: 90.6667, division: 'chattogram' },
  feni: { lat: 23.0186, lng: 91.3966, division: 'chattogram' },
  lakshmipur: { lat: 22.9425, lng: 90.8412, division: 'chattogram' },
  noakhali: { lat: 22.8696, lng: 91.0994, division: 'chattogram' },
  bandarban: { lat: 22.1953, lng: 92.2184, division: 'chattogram' },
  khagrachhari: { lat: 23.1193, lng: 91.9847, division: 'chattogram' },
  rangamati: { lat: 22.6574, lng: 92.1754, division: 'chattogram' },

  // Sylhet Division
  sylhet: { lat: 24.8949, lng: 91.8687, division: 'sylhet' },
  moulvibazar: { lat: 24.4829, lng: 91.7774, division: 'sylhet' },
  habiganj: { lat: 24.3749, lng: 91.4155, division: 'sylhet' },
  sunamganj: { lat: 25.0658, lng: 91.3950, division: 'sylhet' },

  // Rajshahi Division
  rajshahi: { lat: 24.3745, lng: 88.6042, division: 'rajshahi' },
  bogra: { lat: 24.8465, lng: 89.3770, division: 'rajshahi' },
  pabna: { lat: 24.0064, lng: 89.2372, division: 'rajshahi' },
  sirajganj: { lat: 24.4534, lng: 89.7008, division: 'rajshahi' },
  naogaon: { lat: 24.7936, lng: 88.9318, division: 'rajshahi' },
  natore: { lat: 24.4206, lng: 88.9324, division: 'rajshahi' },
  chapainawabganj: { lat: 24.5965, lng: 88.2775, division: 'rajshahi' },
  joypurhat: { lat: 25.1015, lng: 89.0270, division: 'rajshahi' },

  // Khulna Division
  khulna: { lat: 22.8456, lng: 89.5403, division: 'khulna' },
  jessore: { lat: 23.1664, lng: 89.2182, division: 'khulna' },
  satkhira: { lat: 22.7185, lng: 89.0705, division: 'khulna' },
  bagerhat: { lat: 22.6516, lng: 89.7859, division: 'khulna' },
  chuadanga: { lat: 23.6402, lng: 88.8418, division: 'khulna' },
  kushtia: { lat: 23.9013, lng: 89.1205, division: 'khulna' },
  jhenaidah: { lat: 23.5448, lng: 89.1539, division: 'khulna' },
  magura: { lat: 23.4873, lng: 89.4199, division: 'khulna' },
  meherpur: { lat: 23.7622, lng: 88.6318, division: 'khulna' },
  narail: { lat: 23.1725, lng: 89.5127, division: 'khulna' },

  // Barishal Division
  barishal: { lat: 22.7010, lng: 90.3535, division: 'barishal' },
  bhola: { lat: 22.6859, lng: 90.6482, division: 'barishal' },
  patuakhali: { lat: 22.3596, lng: 90.3299, division: 'barishal' },
  pirojpur: { lat: 22.5841, lng: 89.9720, division: 'barishal' },
  barguna: { lat: 22.1587, lng: 90.1121, division: 'barishal' },
  jhalokati: { lat: 22.6406, lng: 90.1987, division: 'barishal' },

  // Rangpur Division
  rangpur: { lat: 25.7439, lng: 89.2752, division: 'rangpur' },
  dinajpur: { lat: 25.6217, lng: 88.6355, division: 'rangpur' },
  gaibandha: { lat: 25.3288, lng: 89.5404, division: 'rangpur' },
  kurigram: { lat: 25.8054, lng: 89.6362, division: 'rangpur' },
  lalmonirhat: { lat: 25.9923, lng: 89.2847, division: 'rangpur' },
  nilphamari: { lat: 25.9318, lng: 88.8560, division: 'rangpur' },
  panchagarh: { lat: 26.3411, lng: 88.5542, division: 'rangpur' },
  thakurgaon: { lat: 26.0337, lng: 88.4617, division: 'rangpur' },

  // Mymensingh Division
  mymensingh: { lat: 24.7471, lng: 90.4203, division: 'mymensingh' },
  jamalpur: { lat: 24.9375, lng: 89.9378, division: 'mymensingh' },
  netrokona: { lat: 24.8709, lng: 90.7279, division: 'mymensingh' },
  sherpur: { lat: 25.0205, lng: 90.0153, division: 'mymensingh' }
};

const STORAGE_KEY = 'blood_donation_user_district_pref';

/**
 * Calculate distance squared between two geo points
 */
function getDistanceSq(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = lat1 - lat2;
  const dLng = lng1 - lng2;
  return dLat * dLat + dLng * dLng;
}

/**
 * Match coordinates to the nearest Bangladesh District
 */
export function matchCoordinatesToDistrict(lat: number, lng: number): DetectedLocation {
  let closestDistrict = 'dhaka';
  let minDistance = Infinity;

  for (const [distKey, data] of Object.entries(BANGLADESH_DISTRICT_CENTROIDS)) {
    const distSq = getDistanceSq(lat, lng, data.lat, data.lng);
    if (distSq < minDistance) {
      minDistance = distSq;
      closestDistrict = distKey;
    }
  }

  const matched = BANGLADESH_DISTRICT_CENTROIDS[closestDistrict] || { division: 'dhaka' };
  
  // Find Bengali names from BANGLADESH_DIVISIONS data
  const divisionObj = BANGLADESH_DIVISIONS.find(d => d.id === matched.division);
  const districtObj = divisionObj?.districts.find(dst => dst.id === closestDistrict);

  return {
    division: matched.division,
    district: closestDistrict,
    districtNameBn: districtObj?.nameBn || closestDistrict,
    divisionNameBn: divisionObj?.nameBn || matched.division
  };
}

/**
 * Request Browser Geolocation and determine district
 */
export async function detectUserDistrict(): Promise<{
  success: boolean;
  location?: DetectedLocation;
  error?: string;
  isPermissionDenied?: boolean;
}> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return { success: false, error: 'ব্রাউজার জিওলোকেশন সমর্থন করে না।' };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const matched = matchCoordinatesToDistrict(latitude, longitude);
        saveDefaultDistrict(matched.district, matched.division);
        resolve({
          success: true,
          location: matched
        });
      },
      (err) => {
        resolve({
          success: false,
          error: err.message,
          isPermissionDenied: err.code === err.PERMISSION_DENIED
        });
      },
      {
        timeout: 8000,
        enableHighAccuracy: false,
        maximumAge: 3600000 // 1 hour cache
      }
    );
  });
}

/**
 * Save user's detected or preferred district in localStorage
 */
export function saveDefaultDistrict(district: string, division: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ district, division }));
  } catch {}
}

/**
 * Read saved district preference from localStorage
 */
export function getSavedDefaultDistrict(): { district: string; division: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

