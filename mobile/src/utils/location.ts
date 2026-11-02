import * as Location from 'expo-location';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshLocations';

export interface DetectedLocation {
  division: string;
  district: string;
  districtNameBn: string;
  divisionNameBn: string;
}

const BANGLADESH_DISTRICT_CENTROIDS: Record<string, { lat: number; lng: number; division: string }> = {
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
  sylhet: { lat: 24.8949, lng: 91.8687, division: 'sylhet' },
  moulvibazar: { lat: 24.4829, lng: 91.7774, division: 'sylhet' },
  habiganj: { lat: 24.3749, lng: 91.4155, division: 'sylhet' },
  sunamganj: { lat: 25.0658, lng: 91.3950, division: 'sylhet' },
  rajshahi: { lat: 24.3745, lng: 88.6042, division: 'rajshahi' },
  bogra: { lat: 24.8465, lng: 89.3770, division: 'rajshahi' },
  pabna: { lat: 24.0064, lng: 89.2372, division: 'rajshahi' },
  sirajganj: { lat: 24.4534, lng: 89.7008, division: 'rajshahi' },
  naogaon: { lat: 24.8236, lng: 88.9318, division: 'rajshahi' },
  natore: { lat: 24.4206, lng: 88.9324, division: 'rajshahi' },
  chapainawabganj: { lat: 24.5965, lng: 88.2775, division: 'rajshahi' },
  joypurhat: { lat: 25.1015, lng: 89.0271, division: 'rajshahi' },
  khulna: { lat: 22.8456, lng: 89.5403, division: 'khulna' },
  jashore: { lat: 23.1664, lng: 89.2081, division: 'khulna' },
  kushtia: { lat: 23.9013, lng: 89.1205, division: 'khulna' },
  satkhira: { lat: 22.7185, lng: 89.0705, division: 'khulna' },
  bagerhat: { lat: 22.6516, lng: 89.7859, division: 'khulna' },
  jhenaidah: { lat: 23.5448, lng: 89.1539, division: 'khulna' },
  chuadanga: { lat: 23.6402, lng: 88.8418, division: 'khulna' },
  meherpur: { lat: 23.7622, lng: 88.6318, division: 'khulna' },
  magura: { lat: 23.4873, lng: 89.4199, division: 'khulna' },
  narail: { lat: 23.1725, lng: 89.5127, division: 'khulna' },
  barishal: { lat: 22.7010, lng: 90.3535, division: 'barishal' },
  patuakhali: { lat: 22.3596, lng: 90.3299, division: 'barishal' },
  bhola: { lat: 22.6859, lng: 90.6482, division: 'barishal' },
  pirojpur: { lat: 22.5841, lng: 89.9720, division: 'barishal' },
  barguna: { lat: 22.1570, lng: 90.1256, division: 'barishal' },
  jhalokati: { lat: 22.6406, lng: 90.1987, division: 'barishal' },
  rangpur: { lat: 25.7439, lng: 89.2752, division: 'rangpur' },
  dinajpur: { lat: 25.6217, lng: 88.6355, division: 'rangpur' },
  kurigram: { lat: 25.8054, lng: 89.6362, division: 'rangpur' },
  gaibandha: { lat: 25.3288, lng: 89.5430, division: 'rangpur' },
  nilphamari: { lat: 25.9318, lng: 88.8560, division: 'rangpur' },
  thakurgaon: { lat: 26.0337, lng: 88.4617, division: 'rangpur' },
  lalmonirhat: { lat: 25.9923, lng: 89.2847, division: 'rangpur' },
  panchagarh: { lat: 26.3411, lng: 88.5542, division: 'rangpur' },
  mymensingh: { lat: 24.7471, lng: 90.4203, division: 'mymensingh' },
  jamalpur: { lat: 24.9375, lng: 89.9378, division: 'mymensingh' },
  netrokona: { lat: 24.8770, lng: 90.7279, division: 'mymensingh' },
  sherpur: { lat: 25.0205, lng: 90.0153, division: 'mymensingh' },
};

function getDistanceSq(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dLat = lat1 - lat2;
  const dLng = lng1 - lng2;
  return dLat * dLat + dLng * dLng;
}

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
  const divisionObj = BANGLADESH_DIVISIONS.find(d => d.id === matched.division);
  const districtObj = divisionObj?.districts.find(dst => dst.id === closestDistrict);

  return {
    division: matched.division,
    district: closestDistrict,
    districtNameBn: districtObj?.nameBn || closestDistrict,
    divisionNameBn: divisionObj?.nameBn || matched.division,
  };
}

export async function detectDeviceDistrict(): Promise<{
  success: boolean;
  location?: DetectedLocation;
  error?: string;
  isPermissionDenied?: boolean;
}> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        error: 'লোকেশন পারমিশন প্রদান করা হয়নি। অনুগ্রহ করে ম্যানুয়ালি জেলা নির্বাচন করুন।',
        isPermissionDenied: true
      };
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    const detected = matchCoordinatesToDistrict(
      loc.coords.latitude,
      loc.coords.longitude
    );

    return {
      success: true,
      location: detected
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'লোকেশন শনাক্ত করতে সমস্যা হয়েছে।'
    };
  }
}
