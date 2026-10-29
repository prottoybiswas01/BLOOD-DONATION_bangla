import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, Search, Filter, AlertCircle, RotateCcw } from 'lucide-react';
import { BLOOD_GROUPS } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { RequestCard } from '../components/RequestCard';
import { ReportModal } from '../components/ReportModal';
import { BloodRequest } from '../types';
import { api } from '../api/client';
import { DemoBanner } from '../components/DemoBanner';

export const BloodRequests: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [bloodGroup, setBloodGroup] = useState<string>(searchParams.get('bloodGroup') || '');
  const [division, setDivision] = useState<string>(searchParams.get('division') || '');
  const [district, setDistrict] = useState<string>(searchParams.get('district') || '');
  const [upazila, setUpazila] = useState<string>(searchParams.get('upazila') || '');
  const [urgencyLevel, setUrgencyLevel] = useState<string>(searchParams.get('urgencyLevel') || '');
  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Report modal
  const [reportingRequestId, setReportingRequestId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.searchRequests({
        bloodGroup,
        division,
        district,
        upazila,
        urgencyLevel,
        status,
        page,
        limit: 9,
      });

      if (res.success) {
        setRequests(res.requests || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      } else {
        setErrorMsg(res.message || 'রক্তের অনুরোধ লোড করা যায়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'সার্ভারে সংযোগ ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const q: Record<string, string> = {};
    if (bloodGroup) q.bloodGroup = bloodGroup;
    if (division) q.division = division;
    if (district) q.district = district;
    if (upazila) q.upazila = upazila;
    if (urgencyLevel) q.urgencyLevel = urgencyLevel;
    if (status) q.status = status;
    if (page > 1) q.page = String(page);
    setSearchParams(q, { replace: true });
  }, [bloodGroup, division, district, upazila, urgencyLevel, status, page]);

  const handleReset = () => {
    setBloodGroup('');
    setDivision('');
    setDistrict('');
    setUpazila('');
    setUrgencyLevel('');
    setStatus('');
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <DemoBanner />

      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-mainText flex items-center gap-2">
            <PlusCircle className="w-7 h-7 text-primary" />
            <span>চলমান রক্তের অনুরোধসমূহ</span>
          </h1>
          <p className="text-xs sm:text-sm text-subText mt-1">
            জরুরি প্রয়োজনে হাসপাতালে রক্তের জন্য সাহায্য আবেদন
          </p>
        </div>

        <Link
          to="/create-request"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow transition-colors text-sm"
        >
          <PlusCircle className="w-5 h-5" />
          <span>রক্তের আবেদন পোস্ট করুন</span>
        </Link>
      </div>

      {/* Filter Box */}
      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-mainText">
            <Filter className="w-4 h-4 text-primary" />
            <span>ফিল্টার ও অনুসন্ধান</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-subText hover:text-primary transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>
        </div>

        {/* Blood groups */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-mainText mr-2">গ্রুপ:</span>
          <button
            onClick={() => { setBloodGroup(''); setPage(1); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
              bloodGroup === ''
                ? 'bg-primary text-white border-primary'
                : 'bg-page text-mainText border-appBorder hover:bg-gray-100'
            }`}
          >
            সকল
          </button>
          {BLOOD_GROUPS.map(bg => (
            <button
              key={bg}
              onClick={() => { setBloodGroup(bloodGroup === bg ? '' : bg); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                bloodGroup === bg
                  ? 'bg-primary text-white border-primary'
                  : 'bg-page text-mainText border-appBorder hover:bg-gray-100'
              }`}
            >
              {bg}
            </button>
          ))}
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

        {/* Urgency & Status filter pills */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-mainText">জরুরিতা:</span>
            {[
              { id: '', label: 'সকল' },
              { id: 'emergency', label: 'জরুরি' },
              { id: 'urgent', label: 'অতি জরুরি' },
              { id: 'standard', label: 'নিয়মিত' }
            ].map(u => (
              <button
                key={u.id}
                onClick={() => { setUrgencyLevel(u.id); setPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  urgencyLevel === u.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-subText border-appBorder hover:bg-gray-50'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-mainText">অবস্থা:</span>
            {[
              { id: '', label: 'সক্রিয় (খোলা)' },
              { id: 'fulfilled', label: 'সম্পন্ন' },
              { id: 'expired', label: 'মেয়াদোত্তীর্ণ' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => { setStatus(s.id); setPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  status === s.id
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-surface text-subText border-appBorder hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-subText">
        <span>মোট অনুরোধ: <strong>{totalCount} টি</strong></span>
        <span>পৃষ্ঠা: {page} / {totalPages}</span>
      </div>

      {/* Grid */}
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
      ) : requests.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-appBorder p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-bold text-mainText text-lg">কোনো রক্তের অনুরোধ পাওয়া যায়নি</h3>
          <p className="text-xs text-subText max-w-md mx-auto">
            আপনার অনুসন্ধান মানদণ্ডের সাথে মিলে এমন কোনো রক্তের অনুরোধ বর্তমানে নেই।
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
          {requests.map(req => (
            <RequestCard
              key={req._id}
              request={req}
              onReport={id => setReportingRequestId(id)}
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
      {reportingRequestId && (
        <ReportModal
          targetType="blood_request"
          targetId={reportingRequestId}
          onClose={() => setReportingRequestId(null)}
        />
      )}
    </div>
  );
};
