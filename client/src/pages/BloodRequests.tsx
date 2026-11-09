import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, Search, Filter, AlertCircle, RotateCcw, HeartPulse } from 'lucide-react';
import { BLOOD_GROUPS } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { RequestCard } from '../components/RequestCard';
import { ReportModal } from '../components/ReportModal';
import { BloodRequest } from '../types';
import { api } from '../api/client';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

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
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-mainText flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-rose-100 text-primary flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </span>
            <span>চলমান রক্তের অনুরোধসমূহ</span>
          </h1>
          <p className="text-xs sm:text-sm text-subText mt-1">
            জরুরি প্রয়োজনে হাসপাতালে রক্তের জন্য সাহায্য আবেদন ও সাড়া প্রদান
          </p>
        </div>

        <Link to="/create-request">
          <Button
            variant="primary"
            size="md"
            icon={<PlusCircle className="w-4 h-4" />}
            className="shadow-soft"
          >
            রক্তের আবেদন পোস্ট করুন
          </Button>
        </Link>
      </div>

      {/* Filter Box */}
      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-appBorder pb-4">
          <div className="flex items-center gap-2.5 text-sm font-bold text-mainText">
            <Filter className="w-4 h-4 text-primary" />
            <span>ফিল্টার ও অনুসন্ধান</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-subText hover:text-primary active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>
        </div>

        {/* Blood groups */}
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
              সকল
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

        {/* Cascading Location Selector */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
          <LocationSelector
            division={division}
            district={district}
            upazila={upazila}
            onDivisionChange={v => { setDivision(v); setPage(1); }}
            onDistrictChange={v => { setDistrict(v); setPage(1); }}
            onUpazilaChange={v => { setUpazila(v); setPage(1); }}
          />
        </div>

        {/* Urgency & Status filter pills */}
        <div className="flex flex-wrap items-center gap-6 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-mainText mr-1">জরুরিতা:</span>
            {[
              { id: '', label: 'সকল' },
              { id: 'emergency', label: 'জরুরি' },
              { id: 'urgent', label: 'অতি জরুরি' },
              { id: 'standard', label: 'নিয়মিত' }
            ].map(u => (
              <button
                key={u.id}
                onClick={() => { setUrgencyLevel(u.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  urgencyLevel === u.id
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-surface text-subText border-appBorder hover:bg-slate-50'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-mainText mr-1">অবস্থা:</span>
            {[
              { id: '', label: 'সক্রিয় (খোলা)' },
              { id: 'fulfilled', label: 'সম্পন্ন' },
              { id: 'expired', label: 'মেয়াদোত্তীর্ণ' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => { setStatus(s.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  status === s.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-soft'
                    : 'bg-surface text-subText border-appBorder hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-subText px-1">
        <span>মোট আবেদন পাওয়া গেছে: <strong className="text-mainText font-bold">{totalCount} টি</strong></span>
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
          <Button variant="outline" size="sm" onClick={fetchRequests}>পুনরায় চেষ্টা করুন</Button>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-appBorder p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <PlusCircle className="w-8 h-8" />
          </div>
          <h3 className="font-black text-mainText text-xl">এখনো কোনো রক্তের অনুরোধ নেই</h3>
          <p className="text-xs sm:text-sm text-subText max-w-md mx-auto leading-relaxed">
            বর্তমানে কোনো সক্রিয় রক্তের অনুরোধ পাওয়া যায়নি। জরুরি প্রয়োজনে নতুন একটি রক্তের আবেদন তৈরি করতে পারেন।
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={handleReset}>
              ফিল্টার রিসেট করুন
            </Button>
            <Link to="/create-request">
              <Button variant="primary" size="sm">
                নতুন রক্তের আবেদন তৈরি করুন
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
