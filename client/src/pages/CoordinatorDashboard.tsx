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
  FileText
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { InstitutionRequest, ModeratorActivity } from '../types';

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
    return <div className="max-w-7xl mx-auto p-8"><div className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div></div>;
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface rounded-2xl border border-appBorder shadow text-center space-y-3">
        <AlertTriangle className="w-12 h-12 text-primary mx-auto" />
        <h3 className="font-bold text-mainText text-lg">অনুমতি নেই</h3>
        <p className="text-xs text-subText">{errorMsg}</p>
      </div>
    );
  }

  const { division, stats, requests } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
              বিভাগীয় সমন্বয়ক প্যানেল
            </span>
            <span className="px-3 py-1 bg-blue-500/30 rounded-full text-xs font-bold uppercase">
              {division?.nameBn} বিভাগ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{division?.nameBn} বিভাগ সমন্বয় কেন্দ্র</h1>
          <p className="text-xs text-blue-100 mt-1">
            দায়িত্বপ্রাপ্ত এলাকা: {division?.nameBn} ({division?.nameEn}) • অনুমোদিত সমন্বয়ক: {user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-blue-200" />
          <span className="text-xs font-semibold">বিভাগীয় নিরাপত্তা ও মডারেশন</span>
        </div>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          actionMsg.type === 'success' ? 'bg-green-50 text-appSuccess border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-xs font-bold px-2">✕</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">দায়িত্বপ্রাপ্ত মডারেটর</span>
          <span className="text-2xl font-extrabold text-blue-900 mt-1 block">{moderators.length} জন</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">প্রতিষ্ঠানের নিবন্ধন আবেদন</span>
          <span className="text-2xl font-extrabold text-tealAccent mt-1 block">{institutionRequests.length} টি</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">বিভাগে রক্তের অনুরোধ</span>
          <span className="text-2xl font-extrabold text-mainText mt-1 block">{stats?.totalRequests || 0} টি</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">সক্রিয় রক্তদাতা পুল</span>
          <span className="text-2xl font-extrabold text-appSuccess mt-1 block">{stats?.availableDonors || 0} জন</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-appBorder gap-4 text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('moderators')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'moderators' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          বিভাগীয় মডারেটরগণ ({moderators.length})
        </button>
        <button
          onClick={() => setActiveTab('institution_requests')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'institution_requests' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          প্রতিষ্ঠান আবেদন পর্যালোচনা ({institutionRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'activities' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          মডারেটর অ্যাক্টিভিটি লগ ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          জরুরি রক্তের অনুরোধসমূহ
        </button>
      </div>

      {/* Tab 1: Moderators List & Performance */}
      {activeTab === 'moderators' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-appBorder">
            <div>
              <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-700" />
                <span>{division?.nameBn} বিভাগের প্রাতিষ্ঠানিক মডারেটর তালিকা ও কার্যক্রম</span>
              </h3>
              <p className="text-xs text-subText">মডারেটরদের কর্মক্ষমতা, ম্যানুয়াল সদস্য সংযোজন ও স্ট্যাটাস পর্যবেক্ষণ</p>
            </div>
          </div>

          {moderators.length === 0 ? (
            <div className="text-center py-12 text-xs text-subText">এই বিভাগে কোনো প্রতিষ্ঠান মডারেটর নিযুক্ত নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                  <tr>
                    <th className="py-3 px-4">মডারেটরের নাম ও ফোন</th>
                    <th className="py-3 px-4">দায়িত্বপ্রাপ্ত প্রতিষ্ঠান</th>
                    <th className="py-3 px-4">যুক্তকৃত সদস্য</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {moderators.map((m: any) => {
                    const isBlocked = m.accountStatus && m.accountStatus !== 'active';
                    return (
                      <tr key={m._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-mainText">{m.name}</div>
                          <div className="text-gray-400 font-mono text-[10px]">{m.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-800">{m.assignedInstitution || 'অনির্ধারিত'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {m.membersCreatedCount || 0} জন
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            !isBlocked ? 'bg-green-100 text-appSuccess' : 'bg-red-100 text-red-600'
                          }`}>
                            {!isBlocked ? 'সক্রিয়' : 'স্থগিত'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isBlocked ? (
                            <button
                              onClick={() => {
                                setBlockingTarget(m);
                                setBlockReason('');
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold"
                            >
                              স্থগিত করুন
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblockUser(m)}
                              className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-appSuccess rounded text-xs font-semibold"
                            >
                              সচল করুন
                            </button>
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

      {/* Tab 2: Institution Requests Decision */}
      {activeTab === 'institution_requests' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-appBorder">
            <div>
              <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                <Building2 className="w-5 h-5 text-tealAccent" />
                <span>{division?.nameBn} বিভাগের প্রাতিষ্ঠানিক নিবন্ধন আবেদনসমূহ</span>
              </h3>
              <p className="text-xs text-subText">আবেদন যাচাইপূর্বক অনুমোদন বা প্রত্যাখ্যানের সিদ্ধান্ত গ্রহণ করুন</p>
            </div>
          </div>

          {institutionRequests.length === 0 ? (
            <div className="text-center py-12 text-xs text-subText">এই বিভাগে কোনো আবেদন অপেক্ষমাণ নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                  <tr>
                    <th className="py-3 px-4">প্রতিষ্ঠানের নাম</th>
                    <th className="py-3 px-4">কোড ও ধরণ</th>
                    <th className="py-3 px-4">ঠিকানা ও জেলা</th>
                    <th className="py-3 px-4">আবেদনকারীর তথ্য</th>
                    <th className="py-3 px-4">বর্তমান অবস্থা</th>
                    <th className="py-3 px-4 text-right">সিদ্ধান্ত গ্রহণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {institutionRequests.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-mainText">{req.nameBn}</div>
                        <div className="text-[10px] text-gray-400">{req.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs">{req.code}</span>
                        <div className="text-[10px] text-gray-500">{req.type}</div>
                      </td>
                      <td className="py-3 px-4">{req.address}, {req.district}</td>
                      <td className="py-3 px-4">
                        <div>{req.applicantName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{req.applicantPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'approved' ? 'bg-green-100 text-appSuccess' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'approved' ? 'অনুমোদিত' : req.status === 'rejected' ? 'বাতিল' : 'বিচারাধীন'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {req.status === 'pending_review' || req.status === 'under_review' ? (
                          <div className="space-x-1.5">
                            <button
                              onClick={() => {
                                setReviewingReq(req);
                                setReviewDecision('approved');
                                setDecisionReason('');
                              }}
                              className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-appSuccess rounded font-bold text-xs"
                            >
                              অনুমোদন
                            </button>
                            <button
                              onClick={() => {
                                setReviewingReq(req);
                                setReviewDecision('rejected');
                                setDecisionReason('');
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded font-bold text-xs"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">মীমাংসিত</span>
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

      {/* Tab 3: Activities */}
      {activeTab === 'activities' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span>বিভাগীয় মডারেটর কার্যকলাপ ট্র্যাকিং</span>
          </h3>

          {activities.length === 0 ? (
            <div className="text-center py-10 text-xs text-subText">কোনো অ্যাক্টিভিটি রেকর্ড নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                  <tr>
                    <th className="py-3 px-4">কার্যকলাপ (Action)</th>
                    <th className="py-3 px-4">মডারেটর</th>
                    <th className="py-3 px-4">প্রতিষ্ঠান</th>
                    <th className="py-3 px-4">বিবরণ / কারণ</th>
                    <th className="py-3 px-4">সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activities.map(act => (
                    <tr key={act._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-mainText">{act.action}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{act.actorName}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">{act.institutionScope || 'N/A'}</td>
                      <td className="py-3 px-4 max-w-xs text-subText">{act.reason || 'স্বাভাবিক কার্যক্রম'}</td>
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

      {/* Tab 4: Division Blood Requests */}
      {activeTab === 'requests' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-primary" />
            <span>{division?.nameBn} বিভাগের চলমান রক্তের অনুরোধসমূহ</span>
          </h3>

          {(!requests || requests.length === 0) ? (
            <p className="text-xs text-subText py-6 text-center">বিভাগে কোনো রক্তের অনুরোধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                  <tr>
                    <th className="py-3 px-4">রোগী</th>
                    <th className="py-3 px-4">গ্রুপ</th>
                    <th className="py-3 px-4">হাসপাতাল ও জেলা</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r: any) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-mainText">{r.patientName}</td>
                      <td className="py-3 px-4 font-bold text-primary">{r.bloodGroup}</td>
                      <td className="py-3 px-4">{r.hospitalName}, {r.district}</td>
                      <td className="py-3 px-4">{new Date(r.requiredDate).toLocaleDateString('bn-BD')}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-appSuccess">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewingReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">প্রাতিষ্ঠানিক আবেদন পর্যালোচনা</h3>
            <p className="text-xs text-gray-500 mb-4">{reviewingReq.nameBn} ({reviewingReq.code})</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">সিদ্ধান্ত</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('approved')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      reviewDecision === 'approved'
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>অনুমোদন করুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('rejected')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      reviewDecision === 'rejected'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>বাতিল করুন</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  সিদ্ধান্তের লিখিত কারণ ও মন্তব্য <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={decisionReason}
                  onChange={e => setDecisionReason(e.target.value)}
                  placeholder="অনুমোদন বা বাতিলের কারণ স্পষ্ট করে লিখুন..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingReq(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  ফিরে যান
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow transition disabled:opacity-50"
                >
                  {submittingReview ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {blockingTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">মডারেটর অ্যাকাউন্ট স্থগিত</h3>
            <p className="text-xs text-gray-500 mb-4">{blockingTarget.name} ({blockingTarget.phone})</p>

            <form onSubmit={handleBlockUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  স্থগিতের সুনির্দিষ্ট কারণ <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder="স্থগিতকরণের কারণ উল্লেখ করুন..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockingTarget(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  স্থগিত নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
