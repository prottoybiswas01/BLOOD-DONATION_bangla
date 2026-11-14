import { BANGLADESH_DIVISIONS } from '../data/bangladeshLocations';

export function getReadableLocation(division?: string, district?: string, upazila?: string): {
  divisionBn: string;
  districtBn: string;
  upazilaBn?: string;
  displayText: string;
} {
  const normDiv = (division || '').toLowerCase().trim();
  const normDist = (district || '').toLowerCase().trim();
  const normUpz = (upazila || '').toLowerCase().trim();

  let divObj = BANGLADESH_DIVISIONS.find(d => d.id === normDiv || d.nameEn.toLowerCase() === normDiv || d.nameBn === division);
  let distObj = divObj?.districts.find(d => d.id === normDist || d.nameEn.toLowerCase() === normDist || d.nameBn === district);

  if (!distObj && normDist) {
    for (const d of BANGLADESH_DIVISIONS) {
      const found = d.districts.find(dst => dst.id === normDist || dst.nameEn.toLowerCase() === normDist || dst.nameBn === district);
      if (found) {
        distObj = found;
        if (!divObj) divObj = d;
        break;
      }
    }
  }

  let upzObj = distObj?.upazilas.find(u => u.id === normUpz || u.nameEn.toLowerCase() === normUpz || u.nameBn === upazila);
  if (!upzObj && normUpz) {
    for (const d of BANGLADESH_DIVISIONS) {
      for (const dst of d.districts) {
        const found = dst.upazilas.find(u => u.id === normUpz || u.nameEn.toLowerCase() === normUpz || u.nameBn === upazila);
        if (found) {
          upzObj = found;
          if (!distObj) distObj = dst;
          if (!divObj) divObj = d;
          break;
        }
      }
      if (upzObj) break;
    }
  }

  const divisionBn = divObj?.nameBn || division || '';
  const districtBn = distObj?.nameBn || district || '';
  const upazilaBn = upzObj?.nameBn || (upazila && upazila !== district ? upazila : undefined);

  const parts = [upazilaBn, districtBn].filter(Boolean);
  return {
    divisionBn,
    districtBn,
    upazilaBn,
    displayText: parts.length > 0 ? parts.join(', ') : 'অঞ্চল নির্ধারিত নয়'
  };
}
