import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Filter, AlertCircle, Users } from 'lucide-react';
import { BLOOD_GROUPS } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { DonorCard } from '../components/DonorCard';
import { ReportModal } from '../components/ReportModal';
import { DonorProfile } from '../types';
import { api } from '../api/client';
import { DemoBanner } from '../components/DemoBanner';

export const DonorSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [bloodGroup, setBloodGroup] = useState<string>(searchParams.get('bloodGroup') || '');
  const [division, setDivision] = useState<string>(searchParams.get('division') || '');
  const [district, setDistrict] = useState<string>(searchParams.get('district') || '');
  const [upazila, setUpazila] = useState<string>(searchParams.get('upazila') || '');
  const [availabilityStatus, setAvailabilityStatus] = useState<string>(searchParams.get('availabilityStatus') || '');
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));

  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reporting
  const [reportingDonorId, setReportingDonorId] = useState<string | null>(null);

  const fetchDonors = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.searchDonors({
        bloodGroup,
        division,
        district,
        upazila,
        availabilityStatus,
        page,
        limit: 9,
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
  }, [bloodGroup, division, district, upazila, availabilityStatus, page]);

  const handleReset = () => {
    setBloodGroup('');
    setDivision('');
    setDistrict('');
    setUpazila('');
    setAvailabilityStatus('');
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <DemoBanner />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-mainText flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          <span>রক্তদাতা সন্ধান ও ডিরেক্টরি</span>
        </h1>
        <p className="text-xs sm:text-sm text-subText mt-1">
          রক্তদাতার গোপনীয়তা সুরক্ষিত রেখে স্বেচ্ছাসেবী রক্তদাতাদের তালিকা
        </p>
      </div>

      {/* Filter Box */}
      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-mainText">
            <Filter className="w-4 h-4 text-primary" />
            <span>ফিল্টার ও অনুসন্ধান মানদণ্ড</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-subText hover:text-primary transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ফিল্টার রিসেট</span>
          </button>
        </div>

        {/* Blood Groups selection */}
        <div>
          <label className="block text-xs font-semibold text-mainText mb-2">
            রক্তের গ্রুপ:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setBloodGroup(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                bloodGroup === ''
                  ? 'bg-primary text-white border-primary'
                  : 'bg-page text-mainText border-appBorder hover:bg-gray-100'
              }`}
            >
              সকল গ্রুপ
            </button>
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => { setBloodGroup(bloodGroup === bg ? '' : bg); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  bloodGroup === bg
                    ? 'bg-primary text-white border-primary'
                    : 'bg-page text-mainText border-appBorder hover:bg-gray-100'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Cascading Location Selector */}
        <LocationSelector
          division={division}
          district={district}
          upazila={upazila}
          onDivisionChange={v => { setDivision(v); setPage(1); }}
          onDistrictChange={v => { setDistrict(v); setPage(1); }}
          onUpazilaChange={v => { setUpazila(v); setPage(1); }}
        />

        {/* Availability Status Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-mainText">উপলব্ধতা:</span>
          {[
            { id: '', label: 'সকল' },
            { id: 'available', label: 'রক্তদানে প্রস্তুত' },
            { id: 'recently_donated', label: 'সম্প্রতি রক্তদান করেছেন' },
            { id: 'temporarily_unavailable', label: 'সাময়িক বিরতিতে' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => { setAvailabilityStatus(st.id); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                availabilityStatus === st.id
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-surface text-subText border-appBorder hover:bg-gray-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-subText">
        <span>মোট রক্তদাতা পাওয়া গেছে: <strong>{totalCount} জন</strong></span>
        <span>পৃষ্ঠা: {page} / {totalPages}</span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : errorMsg ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="font-semibold">{errorMsg}</p>
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-appBorder p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-bold text-mainText text-lg">কোনো রক্তদাতা পাওয়া যায়নি</h3>
          <p className="text-xs text-subText max-w-md mx-auto">
            আপনার নির্বাচিত গ্রুপ বা স্থানে বর্তমানে কোনো রক্তদাতা সক্রিয় নেই। অনুগ্রহ করে নিকটবর্তী অন্য কোনো উপজেলা বা জেলা নির্বাচন করে পুনরায় অনুসন্ধান করুন।
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-appBorder rounded-lg text-xs font-medium disabled:opacity-50"
          >
            পূর্ববর্তী
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-bold ${
                p === page
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-appBorder text-mainText hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 border border-appBorder rounded-lg text-xs font-medium disabled:opacity-50"
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
