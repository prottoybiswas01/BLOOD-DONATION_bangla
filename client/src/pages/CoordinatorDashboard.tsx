import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Building2, 
  HeartHandshake, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  History, 
  Activity, 
  UserCheck, 
  UserX, 
  FileText,
  RotateCcw,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { InstitutionRequest, ModeratorActivity } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/ui/StatsCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Modal } from '../components/ui/Modal';

export const CoordinatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [moderators, setModerators] = useState<any[]>([]);
  const [institutionRequests, setInstitutionRequests] = useState<InstitutionRequest[]>([]);
  const [activities, setActivities] = useState<ModeratorActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'moderators' | 'institution_requests' | 'activities' | 'requests'>('moderators');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Review modal for Institution Request
  const [reviewingReq, setReviewingReq] = useState<InstitutionRequest | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [decisionReason, setDecisionReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Block modal
  const [blockingTarget, setBlockingTarget] = useState<any | null>(null);
  const [blockReason, setBlockReason] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, modsRes, reqsRes, actsRes] = await Promise.all([
        api.getCoordinatorDashboard(),
        api.getDivisionModeratorsSummary(),
        api.getInstitutionRequests(),
        api.getModeratorActivities()
      ]);

      if (dashRes.success) setData(dashRes);
      if (modsRes.success) setModerators(modsRes.moderators || []);
      if (reqsRes.success) setInstitutionRequests(reqsRes.requests || []);
      if (actsRes.success) setActivities(actsRes.activities || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'বিভাগীয় তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingReq) return;
    if (decisionReason.trim().length < 5) {
      setActionMsg({ text: 'অনুমোদন বা বাতিলের সুস্পষ্ট কারণ (কমপক্ষে ৫ অক্ষর) উল্লেখ করুন।', type: 'error' });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.reviewInstitutionRequest(reviewingReq._id, {
        status: reviewDecision,
        decisionReason
      });

      if (res.success) {
        setActionMsg({ text: res.message || 'সিদ্ধান্ত সফলভাবে কার্যকর হয়েছে।', type: 'success' });
        setReviewingReq(null);
        setDecisionReason('');
        loadAllData();
      } else {
        setActionMsg({ text: res.message || 'সিদ্ধান্ত বাস্তবায়ন ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'পর্যালোচনা ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockingTarget) return;
    if (blockReason.trim().length < 5) {
      setActionMsg({ text: 'স্থগিতের কারণ (কমপক্ষে ৫ অক্ষর) দিন।', type: 'error' });
      return;
    }

    try {
      const res = await api.blockUser(blockingTarget._id, blockReason, 'temporarily_blocked');
      if (res.success) {
        setActionMsg({ text: 'অ্যাকাউন্ট সফলভাবে স্থগিত করা হয়েছে।', type: 'success' });
        setBlockingTarget(null);
        setBlockReason('');
        loadAllData();
      } else {
        setActionMsg({ text: res.message || 'অ্যাকশন ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'অ্যাকশন ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  const handleUnblockUser = async (userObj: any) => {
    const reason = 'বিভাগীয় সমন্বয়ক কর্তৃক অ্যাকাউন্ট পুনরায় সক্রিয় করা হলো।';
    try {
      const res = await api.unblockUser(userObj._id, reason);
      if (res.success) {
        setActionMsg({ text: 'অ্যাকাউন্ট সফলভাবে সচল করা হয়েছে।', type: 'success' });
        loadAllData();
      } else {
        setActionMsg({ text: res.message || 'সচল করতে ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'অ্যাকশন ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="h-64 bg-slate-100 animate-pulse rounded-3xl border border-appBorder"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface rounded-3xl border border-appBorder shadow-card text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-mainText text-lg">অনুমতি সীমাবদ্ধ</h3>
        <p className="text-xs text-subText">{errorMsg}</p>
      </div>
    );
  }

  const { division, stats, requests } = data || {};

  return (
    <div className="min-h-screen bg-page pb-12">
      {/* Top Header / Breadcrumb Bar */}
      <div className="bg-surface border-b border-appBorder px-4 sm:px-6 lg:px-8 py-4 shadow-soft">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Breadcrumb items={[{ label: 'বিভাগীয় সমন্বয়ক ড্যাশবোর্ড' }]} />
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-mainText tracking-tight">
                {division?.nameBn || 'বিভাগীয়'} সমন্বয় প্যানেল
              </h1>
              <Badge variant="info" size="sm">{division?.nameBn || 'বিভাগ'} সমন্বয়ক</Badge>
            </div>
            <p className="text-xs text-subText mt-0.5">
              অনুমোদিত আঞ্চলিক সমন্বয়ক: <strong className="text-mainText">{user?.name}</strong> • দায়িত্বপ্রাপ্ত এলাকা: {division?.nameBn} ({division?.nameEn})
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllData}
              isLoading={loading}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              হালনাগাদ
            </Button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>আঞ্চলিক মডারেশন সক্রিয়</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Action Alert Banner */}
        {actionMsg && (
          <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-soft animate-in fade-in duration-150 ${
            actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
              <span>{actionMsg.text}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-xs font-bold px-2">✕</button>
          </div>
        )}

        {/* 4 Summary StatsCards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            title="দায়িত্বপ্রাপ্ত মডারেটর"
            value={moderators.length}
            subtitle="ক্যাম্পাস ও প্রতিষ্ঠান"
            icon={<Users className="w-5 h-5" />}
            iconColor="blue"
            onClick={() => setActiveTab('moderators')}
          />
          <StatsCard
            title="প্রতিষ্ঠান আবেদন"
            value={institutionRequests.length}
            subtitle="পর্যালোচনা অপেক্ষমান"
            icon={<Building2 className="w-5 h-5" />}
            iconColor="teal"
            onClick={() => setActiveTab('institution_requests')}
          />
          <StatsCard
            title="বিভাগে রক্তের অনুরোধ"
            value={stats?.totalRequests || 0}
            subtitle="জরুরি রক্তদান কেস"
            icon={<HeartHandshake className="w-5 h-5" />}
            iconColor="primary"
            onClick={() => setActiveTab('requests')}
          />
          <StatsCard
            title="সক্রিয় রক্তদাতা পুল"
            value={stats?.availableDonors || 0}
            subtitle="অবস্থানরত রক্তদাতা"
            icon={<ShieldCheck className="w-5 h-5" />}
            iconColor="emerald"
          />
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-appBorder gap-2 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('moderators')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'moderators' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>বিভাগীয় মডারেটরগণ ({moderators.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('institution_requests')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'institution_requests' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>প্রতিষ্ঠান আবেদন পর্যালোচনা ({institutionRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'activities' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>মডারেটর অ্যাক্টিভিটি লগ ({activities.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>চলমান রক্তের অনুরোধসমূহ</span>
          </button>
        </div>

        {/* TAB 1: MODERATORS */}
        {activeTab === 'moderators' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-appBorder">
              <div>
                <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-700" />
                  <span>{division?.nameBn} বিভাগের প্রাতিষ্ঠানিক মডারেটর তালিকা</span>
                </h3>
                <p className="text-xs text-subText mt-0.5">মডারেটরদের কার্যকারিতা ও সদস্য সংযোজন পর্যবেক্ষণ</p>
              </div>
              <Badge variant="info">মোট: {moderators.length} জন</Badge>
            </div>

            {moderators.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                এই বিভাগে বর্তমানে কোনো প্রতিষ্ঠান মডারেটর নিযুক্ত নেই।
              </div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">মডারেটর নাম</th>
                      <th className="py-3 px-4">দায়িত্বপ্রাপ্ত প্রতিষ্ঠান</th>
                      <th className="py-3 px-4">যুক্তকৃত সদস্য</th>
                      <th className="py-3 px-4">অবস্থা</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {moderators.map((m: any) => {
                      const isBlocked = m.accountStatus && m.accountStatus !== 'active';
                      return (
                        <tr key={m._id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <div className="font-bold text-mainText">{m.name}</div>
                            <div className="font-mono text-[10px] text-subText">{m.phone}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {m.assignedInstitution || 'অনির্ধারিত'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="info" size="sm">
                              {m.membersCreatedCount || 0} জন
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={!isBlocked ? 'success' : 'danger'} dot>
                              {!isBlocked ? 'সক্রিয়' : 'স্থগিত'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isBlocked ? (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setBlockingTarget(m);
                                  setBlockReason('');
                                }}
                              >
                                স্থগিত করুন
                              </Button>
                            ) : (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleUnblockUser(m)}
                              >
                                সচল করুন
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INSTITUTION REQUESTS */}
        {activeTab === 'institution_requests' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-appBorder">
              <div>
                <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-tealAccent" />
                  <span>{division?.nameBn} বিভাগের প্রাতিষ্ঠানিক নিবন্ধন আবেদনসমূহ</span>
                </h3>
                <p className="text-xs text-subText mt-0.5">আবেদন যাচাইপূর্বক অনুমোদন বা বাতিলের সিদ্ধান্ত প্রদান করুন</p>
              </div>
              <Badge variant="teal">আবেদন: {institutionRequests.length} টি</Badge>
            </div>

            {institutionRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">এই বিভাগে কোনো আবেদন অপেক্ষমাণ নেই।</div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">প্রতিষ্ঠানের নাম</th>
                      <th className="py-3 px-4">কোড ও ধরণ</th>
                      <th className="py-3 px-4">ঠিকানা</th>
                      <th className="py-3 px-4">আবেদনকারী</th>
                      <th className="py-3 px-4">অবস্থা</th>
                      <th className="py-3 px-4 text-right">সিদ্ধান্ত গ্রহণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {institutionRequests.map(req => (
                      <tr key={req._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-bold text-mainText">{req.nameBn}</div>
                          <div className="text-[10px] text-subText">{req.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-xs">{req.code}</span>
                          <div className="text-[10px] text-subText">{req.type}</div>
                        </td>
                        <td className="py-3 px-4">{req.district}, {req.division}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-mainText">{req.applicantName}</div>
                          <div className="font-mono text-[10px] text-subText">{req.applicantPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'} 
                            size="sm"
                          >
                            {req.status === 'approved' ? 'অনুমোদিত' : req.status === 'rejected' ? 'বাতিল' : 'বিচারাধীন'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {req.status === 'pending_review' || req.status === 'under_review' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => {
                                  setReviewingReq(req);
                                  setReviewDecision('approved');
                                  setDecisionReason('');
                                }}
                              >
                                অনুমোদন
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setReviewingReq(req);
                                  setReviewDecision('rejected');
                                  setDecisionReason('');
                                }}
                              >
                                বাতিল
                              </Button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">মীমাংসিত</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACTIVITIES */}
        {activeTab === 'activities' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>বিভাগীয় মডারেটর কার্যকলাপ ট্র্যাকিং</span>
              </h3>
              <p className="text-xs text-subText mt-0.5">মডারেটরদের প্রতিটি কর্মকাণ্ডের বিস্তারিত হিস্ট্রি</p>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">কোনো অ্যাক্টিভিটি রেকর্ড নেই।</div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">কার্যকলাপ (Action)</th>
                      <th className="py-3 px-4">মডারেটর</th>
                      <th className="py-3 px-4">প্রতিষ্ঠান</th>
                      <th className="py-3 px-4">বিবরণ / কারণ</th>
                      <th className="py-3 px-4">সময়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activities.map(act => (
                      <tr key={act._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-mainText">{act.action}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{act.actorName}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-subText">{act.institutionScope || 'N/A'}</td>
                        <td className="py-3 px-4 max-w-xs text-slate-600">{act.reason || 'স্বাভাবিক কার্যক্রম'}</td>
                        <td className="py-3 px-4 text-subText">
                          {new Date(act.createdAt).toLocaleString('bn-BD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BLOOD REQUESTS */}
        {activeTab === 'requests' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-primary" />
                <span>{division?.nameBn} বিভাগের চলমান রক্তের অনুরোধসমূহ</span>
              </h3>
              <p className="text-xs text-subText mt-0.5">হাসপাতাল ও এলাকাভিত্তিক সাম্প্রতিক রক্তের চাহিদা</p>
            </div>

            {(!requests || requests.length === 0) ? (
              <p className="text-xs text-slate-400 py-8 text-center">বিভাগে কোনো সক্রিয় রক্তের অনুরোধ নেই।</p>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">রোগীর নাম</th>
                      <th className="py-3 px-4">রক্তের গ্রুপ</th>
                      <th className="py-3 px-4">হাসপাতাল ও অবস্থান</th>
                      <th className="py-3 px-4">প্রয়োজনীয় তারিখ</th>
                      <th className="py-3 px-4">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((r: any) => (
                      <tr key={r._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-mainText">{r.patientName}</td>
                        <td className="py-3 px-4 font-black text-primary text-sm">{r.bloodGroup}</td>
                        <td className="py-3 px-4">{r.hospitalName}, {r.district}</td>
                        <td className="py-3 px-4">{new Date(r.requiredDate).toLocaleDateString('bn-BD')}</td>
                        <td className="py-3 px-4">
                          <Badge variant="success" size="sm">{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Review Modal */}
      {reviewingReq && (
        <Modal
          isOpen={Boolean(reviewingReq)}
          onClose={() => setReviewingReq(null)}
          title="প্রাতিষ্ঠানিক আবেদন পর্যালোচনা"
          description={`${reviewingReq.nameBn} (${reviewingReq.code})`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setReviewingReq(null)}>ফিরে যান</Button>
              <Button variant="primary" size="sm" isLoading={submittingReview} onClick={handleReviewSubmit}>
                সিদ্ধান্ত নিশ্চিত করুন
              </Button>
            </>
          }
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-2">সিদ্ধান্তের ধরণ</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewDecision('approved')}
                  className={`py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    reviewDecision === 'approved'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft'
                      : 'bg-slate-50 text-slate-700 border-appBorder'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>অনুমোদন করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewDecision('rejected')}
                  className={`py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    reviewDecision === 'rejected'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-soft'
                      : 'bg-slate-50 text-slate-700 border-appBorder'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>বাতিল করুন</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                সিদ্ধান্তের লিখিত কারণ ও পর্যবেক্ষণ <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                minLength={5}
                rows={3}
                value={decisionReason}
                onChange={e => setDecisionReason(e.target.value)}
                placeholder="অনুমোদন বা বাতিলের সুনির্দিষ্ট কারণ ব্যাখ্যা করুন..."
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs focus:border-primary"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Block Moderator Modal */}
      {blockingTarget && (
        <Modal
          isOpen={Boolean(blockingTarget)}
          onClose={() => setBlockingTarget(null)}
          title="মডারেটর অ্যাকাউন্ট সাময়িক স্থগিত"
          description={`${blockingTarget.name} (${blockingTarget.phone})`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setBlockingTarget(null)}>বাতিল</Button>
              <Button variant="danger" size="sm" onClick={handleBlockUser}>স্থগিত নিশ্চিত করুন</Button>
            </>
          }
        >
          <form onSubmit={handleBlockUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                স্থগিতের সুনির্দিষ্ট কারণ <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                minLength={5}
                rows={3}
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="স্থগিতকরণের সুনির্দিষ্ট কারণ উল্লেখ করুন..."
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs focus:border-primary"
              />
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
