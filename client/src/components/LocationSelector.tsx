import React, { useMemo } from 'react';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshLocations';

interface LocationSelectorProps {
  division: string;
  district: string;
  upazila: string;
  onDivisionChange: (val: string) => void;
  onDistrictChange: (val: string) => void;
  onUpazilaChange: (val: string) => void;
  required?: boolean;
  className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  division,
  district,
  upazila,
  onDivisionChange,
  onDistrictChange,
  onUpazilaChange,
  required = false,
  className = '',
}) => {
  const currentDivision = useMemo(() => {
    return BANGLADESH_DIVISIONS.find(d => d.id === division);
  }, [division]);

  const currentDistrict = useMemo(() => {
    if (!currentDivision) return null;
    return currentDivision.districts.find(dst => dst.id === district);
  }, [currentDivision, district]);

  const handleDivChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiv = e.target.value;
    onDivisionChange(newDiv);
    onDistrictChange('');
    onUpazilaChange('');
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDist = e.target.value;
    onDistrictChange(newDist);
    onUpazilaChange('');
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      {/* Division */}
      <div>
        <label className="block text-xs font-medium text-mainText mb-1">
          বিভাগ {required && <span className="text-primary">*</span>}
        </label>
        <select
          value={division}
          onChange={handleDivChange}
          required={required}
          className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">সকল বিভাগ / নির্বাচন করুন</option>
          {BANGLADESH_DIVISIONS.map(d => (
            <option key={d.id} value={d.id}>
              {d.nameBn} ({d.nameEn})
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block text-xs font-medium text-mainText mb-1">
          জেলা {required && <span className="text-primary">*</span>}
        </label>
        <select
          value={district}
          onChange={handleDistChange}
          disabled={!currentDivision}
          required={required}
          className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">সকল জেলা / নির্বাচন করুন</option>
          {currentDivision?.districts.map(dst => (
            <option key={dst.id} value={dst.id}>
              {dst.nameBn} ({dst.nameEn})
            </option>
          ))}
        </select>
      </div>

      {/* Upazila / Thana */}
      <div>
        <label className="block text-xs font-medium text-mainText mb-1">
          উপজেলা / থানা {required && <span className="text-primary">*</span>}
        </label>
        <select
          value={upazila}
          onChange={e => onUpazilaChange(e.target.value)}
          disabled={!currentDistrict}
          required={required}
          className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">সকল উপজেলা / থানা</option>
          {currentDistrict?.upazilas.map(upz => (
            <option key={upz.id} value={upz.id}>
              {upz.nameBn} ({upz.nameEn})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
