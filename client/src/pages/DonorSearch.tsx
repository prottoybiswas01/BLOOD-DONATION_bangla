import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Filter, AlertCircle, Users, CheckCircle, MapPin, Compass, Navigation } from 'lucide-react';
import { BLOOD_GROUPS, BANGLADESH_DIVISIONS } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { DonorCard } from '../components/DonorCard';
import { ReportModal } from '../components/ReportModal';
import { DonorProfile } from '../types';
import { api } from '../api/client';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  detectUserDistrict, 
  getSavedDefaultDistrict, 
  saveDefaultDistrict, 
  DetectedLocation 
} from '../utils/geolocation';

export const DonorSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [bloodGroup, setBloodGroup] = useState<string>(searchParams.get('bloodGroup') || '');
  const [division, setDivision] = useState<string>(searchParams.get('division') || '');
  const [district, setDistrict] = useState<string>(searchParams.get('district') || '');
  const [upazila, setUpazila] = useState<string>(searchParams.get('upazila') || '');
  const [availabilityStatus, setAvailabilityStatus] = useState<string>(searchParams.get('availabilityStatus') || '');
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));

  // Geolocation states
  const [isAutoLocationActive, setIsAutoLocationActive] = useState<boolean>(false);
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [detectedDistrictName, setDetectedDistrictName] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState<boolean>(false);

  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reporting
  const [reportingDonorId, setReportingDonorId] = useState<string | null>(null);

  // Automatically detect visitor location on initial mount if no district in URL
  useEffect(() => {
    const urlDistrict = searchParams.get('district');
    if (urlDistrict) {
      setDistrict(urlDistrict);
      return;
    }

    const saved = getSavedDefaultDistrict();
    if (saved?.district) {
      setDistrict(saved.district);
      if (saved.division) setDivision(saved.division);
      setIsAutoLocationActive(true);
      const divObj = BANGLADESH_DIVISIONS.find(d => d.id === saved.division);
      const distObj = divObj?.districts.find(dst => dst.id === saved.district);
      setDetectedDistrictName(distObj?.nameBn || saved.district);
      return;
    }

    // Try browser geolocation
    setDetectingLocation(true);
    detectUserDistrict().then(res => {
      setDetectingLocation(false);
      if (res.success && res.location) {
        setDistrict(res.location.district);
        setDivision(res.location.division);
        setDetectedDistrictName(res.location.districtNameBn);
        setIsAutoLocationActive(true);
      } else if (res.isPermissionDenied) {
        setLocationDenied(true);
      }
    });
  }, []);

  const fetchDonors = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Default local search shows maximum 7 donors per user requirement
      const searchLimit = isAutoLocationActive ? 7 : 9;

      const res = await api.searchDonors({
        bloodGroup,
        division,
        district,
        upazila,
        availabilityStatus,
        page,
        limit: searchLimit,
      });

      if (res.success) {
        setDonors(res.donors || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      } else {
        setErrorMsg(res.message || 'রক্তদাতা তথ্য লোড করা যায়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'সার্ভারে সংযোগ স্থাপন সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
    // Sync with query params
    const q: Record<string, string> = {};
    if (bloodGroup) q.bloodGroup = bloodGroup;
    if (division) q.division = division;
    if (district) q.district = district;
    if (upazila) q.upazila = upazila;
    if (availabilityStatus) q.availabilityStatus = availabilityStatus;
    if (page > 1) q.page = String(page);
    setSearchParams(q, { replace: true });
  }, [bloodGroup, division, district, upazila, availabilityStatus, page, isAutoLocationActive]);

  const handleManualDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setUpazila('');
    setPage(1);
    setIsAutoLocationActive(false); // Switched to manual district
  };

  const handleManualDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    setDistrict('');
    setUpazila('');
    setPage(1);
    setIsAutoLocationActive(false);
  };

  const handleManualUpazilaChange = (newUpazila: string) => {
    setUpazila(newUpazila);
    setPage(1);
  };

  const handleReset = () => {
    setBloodGroup('');
    setDivision('');
    setDistrict('');
    setUpazila('');
    setAvailabilityStatus('');
    setPage(1);
    setIsAutoLocationActive(false);
    setDetectedDistrictName(null);
  };

  const handleRequestLocationAgain = async () => {
    setDetectingLocation(true);
    setLocationDenied(false);
    const res = await detectUserDistrict();
    setDetectingLocation(false);
    if (res.success && res.location) {
      setDistrict(res.location.district);
      setDivision(res.location.division);
      setDetectedDistrictName(res.location.districtNameBn);
      setIsAutoLocationActive(true);
      setPage(1);
    } else {
      setLocationDenied(true);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-mainText flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-rose-100 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </span>
            <span>রক্তদাতা সন্ধান ও ডিরেক্টরি</span>
          </h1>
          <p className="text-xs sm:text-sm text-subText mt-1">
            রক্তদাতার গোপনীয়তা সুরক্ষিত রেখে যাচাইকৃত স্বেচ্ছাসেবী রক্তদাতাদের জাতীয় তালিকা
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm" dot>সক্রিয় ও উন্মুক্ত</Badge>
          <Badge variant="neutral" size="sm">সারাদেশব্যাপী</Badge>
        </div>
      </div>

      {/* Filter Box */}
      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-appBorder pb-4">
          <div className="flex items-center gap-2.5 text-sm font-bold text-mainText">
            <Filter className="w-4 h-4 text-primary" />
            <span>ফিল্টার ও অনুসন্ধান মানদণ্ড</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-subText hover:text-primary active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ফিল্টার রিসেট</span>
          </button>
        </div>

        {/* Blood Groups selection */}
        <div>
          <label className="block text-xs font-bold text-mainText mb-2.5">
            রক্তের গ্রুপ:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setBloodGroup(''); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                bloodGroup === ''
                  ? 'bg-primary text-white border-primary shadow-soft'
                  : 'bg-page text-mainText border-appBorder hover:bg-rose-50/60'
              }`}
            >
              সকল গ্রুপ
            </button>
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => { setBloodGroup(bloodGroup === bg ? '' : bg); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                  bloodGroup === bg
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-page text-mainText border-appBorder hover:bg-rose-50/60'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Geolocation Detection Banner */}
        {detectingLocation && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2 text-xs text-blue-800">
            <Navigation className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
            <span>আপনার বর্তমান অবস্থান শনাক্ত করা হচ্ছে...</span>
          </div>
        )}

        {isAutoLocationActive && detectedDistrictName && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 font-semibold shadow-soft">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>আপনার বর্তমান অবস্থান অনুযায়ী <strong>{detectedDistrictName}</strong> জেলার রক্তদাতাদের তালিকা দেখানো হচ্ছে (সর্বোচ্চ ৭ জন)।</span>
            </div>
            <button onClick={handleReset} className="text-emerald-700 hover:text-emerald-800 underline text-xs whitespace-nowrap">
              সব জেলা দেখুন
            </button>
          </div>
        )}

        {locationDenied && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>স্বয়ংক্রিয় লোকেশন অনুমতি বন্ধ রয়েছে। আপনি নিচের ড্রপডাউন থেকে যেকোনো জেলা নির্বাচন করে রক্তদাতা খুঁজতে পারেন।</span>
            </div>
            <button onClick={handleRequestLocationAgain} className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg">
              পুনরায় অনুমতি দিন
            </button>
          </div>
        )}

        {/* Cascading Location Selector */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
          <LocationSelector
            division={division}
            district={district}
            upazila={upazila}
            onDivisionChange={handleManualDivisionChange}
            onDistrictChange={handleManualDistrictChange}
            onUpazilaChange={handleManualUpazilaChange}
          />
        </div>

        {/* Availability Status Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-mainText mr-1">উপলব্ধতা:</span>
          {[
            { id: '', label: 'সকল' },
            { id: 'available', label: 'রক্তদানে প্রস্তুত' },
            { id: 'recently_donated', label: 'সম্প্রতি রক্তদান করেছেন' },
            { id: 'temporarily_unavailable', label: 'সাময়িক বিরতিতে' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => { setAvailabilityStatus(st.id); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                availabilityStatus === st.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-soft'
                  : 'bg-surface text-subText border-appBorder hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-subText px-1">
        <span>মোট রক্তদাতা পাওয়া গেছে: <strong className="text-mainText font-bold">{totalCount} জন</strong></span>
        <span>পৃষ্ঠা: <strong>{page}</strong> / {totalPages}</span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-64 bg-slate-200/70 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : errorMsg ? (
        <div className="bg-rose-50 text-rose-700 p-8 rounded-3xl border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-primary" />
          <p className="font-bold text-base">{errorMsg}</p>
          <Button variant="outline" size="sm" onClick={fetchDonors}>পুনরায় চেষ্টা করুন</Button>
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-appBorder p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-black text-mainText text-xl">এখনো কোনো রক্তদাতার তথ্য নেই</h3>
          <p className="text-xs sm:text-sm text-subText max-w-md mx-auto leading-relaxed">
            আপনার নির্বাচিত মানদণ্ডে বর্তমানে কোনো রক্তদাতা সক্রিয় নেই। রক্তদাতা হিসেবে নিজে যুক্ত হতে পারেন অথবা ফিল্টার রিসেট করতে পারেন।
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleReset}
            className="shadow-soft"
          >
            ফিল্টার রিসেট করুন
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map(donor => (
            <DonorCard
              key={donor._id}
              donor={donor}
              onReport={id => setReportingDonorId(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-appBorder bg-surface rounded-xl text-xs font-bold text-mainText disabled:opacity-40 hover:bg-slate-50 transition-all"
          >
            পূর্ববর্তী
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                p === page
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-surface border border-appBorder text-mainText hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-appBorder bg-surface rounded-xl text-xs font-bold text-mainText disabled:opacity-40 hover:bg-slate-50 transition-all"
          >
            পরবর্তী
          </button>
        </div>
      )}

      {/* Report Modal */}
      {reportingDonorId && (
        <ReportModal
          targetType="donor_profile"
          targetId={reportingDonorId}
          onClose={() => setReportingDonorId(null)}
        />
      )}
    </div>
  );
};
