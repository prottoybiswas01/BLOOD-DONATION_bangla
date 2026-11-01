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
  Eye,
  Plus,
  Phone,
  KeyRound,
  Copy,
  ExternalLink,
  Droplet
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { InstitutionRequest, ModeratorActivity, PhoneChangeRequest } from '../types';
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
  const [phoneRequests, setPhoneRequests] = useState<PhoneChangeRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'moderators' | 'institutions' | 'phone_requests' | 'institution_requests' | 'activities' | 'requests'>('moderators');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Appoint Moderator Modal
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [appointInstId, setAppointInstId] = useState('');
  const [appointName, setAppointName] = useState('');
  const [appointPhone, setAppointPhone] = useState('');
  const [appointEmail, setAppointEmail] = useState('');
  const [appointGender, setAppointGender] = useState('unspecified');
  const [submittingAppoint, setSubmittingAppoint] = useState(false);
  const [appointedCreds, setAppointedCreds] = useState<{ phone: string; password?: string; message: string } | null>(null);

  // Review modal for Institution Request
  const [reviewingReq, setReviewingReq] = useState<InstitutionRequest | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [decisionReason, setDecisionReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Block modal
  const [blockingTarget, setBlockingTarget] = useState<any | null>(null);
  const [blockReason, setBlockReason] = useState('');

  // Drill-down Modal (View all members under an institution or moderator)
  const [drillDownInstitution, setDrillDownInstitution] = useState<any | null>(null);
  const [drillDownMembers, setDrillDownMembers] = useState<any[]>([]);
  const [drillDownModerators, setDrillDownModerators] = useState<any[]>([]);
  const [loadingDrillDown, setLoadingDrillDown] = useState(false);
  const [drillDownSearch, setDrillDownSearch] = useState('');

  // Review Phone Change Request
  const [reviewingPhoneReq, setReviewingPhoneReq] = useState<PhoneChangeRequest | null>(null);
  const [phoneReviewNotes, setPhoneReviewNotes] = useState('');
  const [submittingPhoneReview, setSubmittingPhoneReview] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, reqsRes, actsRes, phoneRes] = await Promise.all([
        api.getCoordinatorDashboard(),
        api.getInstitutionRequests(),
        api.getModeratorActivities(),
        api.getPhoneChangeRequests()
      ]);

      if (dashRes.success) {
        setData(dashRes);
        setModerators(dashRes.moderators || []);
      }
      if (reqsRes.success) setInstitutionRequests(reqsRes.requests || []);
      if (actsRes.success) setActivities(actsRes.activities || []);
      if (phoneRes.success) setPhoneRequests(phoneRes.requests || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'বিভাগীয় তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAppointModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointInstId) {
      setActionMsg({ text: 'অনুগ্রহ করে প্রতিষ্ঠান নির্বাচন করুন।', type: 'error' });
      return;
    }
    const cleanPhone = appointPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setActionMsg({ text: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।', type: 'error' });
      return;
    }

    setSubmittingAppoint(true);
    try {
      const res = await api.coordinatorAppointModerator({
        institutionId: appointInstId,
        name: appointName.trim(),
        phone: cleanPhone,
        email: appointEmail.trim() || undefined,
        gender: appointGender
      });

      if (res.success) {
        setAppointedCreds({
          phone: cleanPhone,
          password: res.temporaryPassword,
          message: res.message
        });
        setShowAppointModal(false);
        setAppointName('');
        setAppointPhone('');
        setAppointEmail('');
        setActionMsg({ text: res.message || 'মডারেটর সফলভাবে নিয়োগ করা হয়েছে।', type: 'success' });
        loadAllData();
      } else {
        setActionMsg({ text: res.message || 'মডারেটর নিয়োগ ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'নিয়োগ প্রক্রিয়া সম্পন্ন করা যায়নি।', type: 'error' });
    } finally {
      setSubmittingAppoint(false);
    }
  };

  const handleDrillDown = async (institutionId: string) => {
    setLoadingDrillDown(true);
    setDrillDownSearch('');
    try {
      const res = await api.getInstitutionMembers(institutionId);
      if (res.success) {
        setDrillDownInstitution(res.institution);
        setDrillDownMembers(res.members || []);
        setDrillDownModerators(res.moderators || []);
      } else {
        setActionMsg({ text: res.message || 'সদস্য তালিকা লোড করা যায়নি।', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'ডাটাবেজ থেকে তথ্য আনা যায়নি।', type: 'error' });
    } finally {
      setLoadingDrillDown(false);
    }
  };

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
      const res = await api.coordinatorBlockUser(blockingTarget._id, blockReason, 'temporarily_blocked');
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
      const res = await api.coordinatorUnblockUser(userObj._id, reason);
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

  const handlePhoneReview = async (status: 'approved' | 'rejected') => {
    if (!reviewingPhoneReq) return;
    setSubmittingPhoneReview(true);
    try {
      const res = await api.reviewPhoneChangeRequest(reviewingPhoneReq._id, {
        status,
        reviewNotes: phoneReviewNotes.trim() || undefined
      });

      if (res.success) {
        setActionMsg({ text: res.message || 'আবেদনটির নিষ্পত্তি সম্পন্ন হয়েছে।', type: 'success' });
        setReviewingPhoneReq(null);
        setPhoneReviewNotes('');
        loadAllData();
      } else {
        setActionMsg({ text: res.message || 'প্রক্রিয়া ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'প্রক্রিয়া সম্পন্ন করা যায়নি।', type: 'error' });
    } finally {
      setSubmittingPhoneReview(false);
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

  const { division, stats, requests, institutions = [] } = data || {};

  const filteredDrillDownMembers = drillDownMembers.filter(m => {
    if (!drillDownSearch) return true;
    const q = drillDownSearch.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.bloodGroup?.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.upazila?.toLowerCase().includes(q)
    );
  });

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
            title="অনুমোদিত প্রতিষ্ঠান"
            value={institutions.length}
            subtitle="ক্যাম্পাস রক্তদান ইউনিট"
            icon={<Building2 className="w-5 h-5" />}
            iconColor="teal"
            onClick={() => setActiveTab('institutions')}
          />
          <StatsCard
            title="নম্বর পরিবর্তন আবেদন"
            value={phoneRequests.filter(p => p.status === 'pending').length}
            subtitle="পর্যালোচনা অপেক্ষমাণ"
            icon={<Phone className="w-5 h-5" />}
            iconColor="amber"
            onClick={() => setActiveTab('phone_requests')}
          />
          <StatsCard
            title="সক্রিয় রক্তদাতা পুল"
            value={stats?.availableDonors || 0}
            subtitle="বিভাগে প্রস্তুত রক্তদাতা"
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
            <span>মডারেটর নিয়োগ ও পরিচালনা ({moderators.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('institutions')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'institutions' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>প্রতিষ্ঠানসমূহ ও সদস্য ডাটা ({institutions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('phone_requests')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'phone_requests' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>নম্বর পরিবর্তনের আবেদন ({phoneRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('institution_requests')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'institution_requests' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>প্রতিষ্ঠান নিবন্ধন আবেদন ({institutionRequests.length})</span>
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
        </div>

        {/* TAB 1: MODERATORS */}
        {activeTab === 'moderators' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-appBorder">
              <div>
                <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-700" />
                  <span>{division?.nameBn} বিভাগের প্রাতিষ্ঠানিক মডারেটর তালিকা</span>
                </h3>
                <p className="text-xs text-subText mt-0.5">মডারেটর নিয়োগ, ব্লক/আনব্লক এবং প্রতিষ্ঠানের সদস্য ডাটা ড্রিল-ডাউন</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setAppointInstId(institutions[0]?._id || '');
                  setShowAppointModal(true);
                }}
                className="shadow-soft"
              >
                নতুন মডারেটর নিয়োগ করুন
              </Button>
            </div>

            {moderators.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                এই বিভাগে বর্তমানে কোনো প্রতিষ্ঠান মডারেটর নিযুক্ত নেই। উপরের বাটন ক্লিক করে নতুন মডারেটর নিয়োগ করুন।
              </div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">মডারেটরের নাম</th>
                      <th className="py-3 px-4">দায়িত্বপ্রাপ্ত প্রতিষ্ঠান</th>
                      <th className="py-3 px-4">অবস্থা</th>
                      <th className="py-3 px-4 text-center">সদস্য ডাটা</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ (ব্লক/সচল)</th>
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
                            <div>{m.institutionName || 'অনির্ধারিত'}</div>
                            {m.institutionCode && <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">{m.institutionCode}</span>}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={!isBlocked ? 'success' : 'danger'} dot>
                              {!isBlocked ? 'সক্রিয়' : 'স্থগিত/ব্লকড'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {m.assignedInstitution ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDrillDown(m.assignedInstitution)}
                                icon={<Eye className="w-3.5 h-3.5 text-blue-600" />}
                                className="text-xs"
                              >
                                সদস্য তালিকা
                              </Button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">প্রতিষ্ঠানহীন</span>
                            )}
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
                                ব্লক করুন
                              </Button>
                            ) : (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleUnblockUser(m)}
                              >
                                আনব্লক করুন
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

        {/* TAB 2: INSTITUTIONS & MEMBER DRILL-DOWN */}
        {activeTab === 'institutions' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-appBorder">
              <div>
                <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-700" />
                  <span>{division?.nameBn} বিভাগের অনুমোদিত শিক্ষা প্রতিষ্ঠান ও সংগঠন</span>
                </h3>
                <p className="text-xs text-subText mt-0.5">যেকোনো প্রতিষ্ঠানের উপর ক্লিক করে এর অধীনস্থ রক্তদাতা ও সদস্য তালিকা ড্রিল-ডাউন করুন</p>
              </div>
              <Badge variant="teal">মোট: {institutions.length} টি</Badge>
            </div>

            {institutions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">এই বিভাগে কোনো প্রতিষ্ঠান পাওয়া যায়নি।</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {institutions.map((inst: any) => (
                  <div
                    key={inst._id}
                    className="p-5 rounded-2xl border border-appBorder bg-slate-50/70 hover:bg-white hover:border-teal-300 hover:shadow-card transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="teal" size="sm">{inst.code}</Badge>
                        <Badge variant="success" size="sm" dot>অনুমোদিত</Badge>
                      </div>
                      <h4 className="font-black text-mainText text-base">{inst.nameBn}</h4>
                      <p className="text-xs text-subText">{inst.address}, {inst.district}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-800">
                        রক্তদাতা: {inst.totalRegisteredDonors || 0} জন
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDrillDown(inst._id)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        className="bg-teal-700 hover:bg-teal-800"
                      >
                        সদস্য দেখুন
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PHONE NUMBER CHANGE REQUESTS */}
        {activeTab === 'phone_requests' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-appBorder">
              <div>
                <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                  <Phone className="w-5 h-5 text-amber-600" />
                  <span>মোবাইল নম্বর পরিবর্তনের আবেদনসমূহ ({division?.nameBn} বিভাগ)</span>
                </h3>
                <p className="text-xs text-subText mt-0.5">সদস্য ও রক্তদাতাদের নম্বর পরিবর্তনের আবেদন পর্যালোচনা ও অনুমোদন</p>
              </div>
              <Badge variant="warning">
                অপেক্ষমাণ: {phoneRequests.filter(p => p.status === 'pending').length} টি
              </Badge>
            </div>

            {phoneRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">এই বিভাগে কোনো নম্বর পরিবর্তনের আবেদন নেই।</div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">আবেদনকারীর নাম</th>
                      <th className="py-3 px-4">বর্তমান নম্বর</th>
                      <th className="py-3 px-4">অনুরোধকৃত নতুন নম্বর</th>
                      <th className="py-3 px-4">কারণ</th>
                      <th className="py-3 px-4">অবস্থা</th>
                      <th className="py-3 px-4 text-right">সিদ্ধান্ত</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {phoneRequests.map(req => (
                      <tr key={req._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-bold text-mainText">{req.userName}</div>
                          <div className="text-[10px] text-subText">{req.userRole} {req.institutionName ? `• ${req.institutionName}` : ''}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">{req.currentPhone}</td>
                        <td className="py-3 px-4 font-mono font-black text-primary text-sm">{req.newPhone}</td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs">{req.reason}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'} 
                            size="sm"
                          >
                            {req.status === 'approved' ? 'অনুমোদিত' : req.status === 'rejected' ? 'বাতিলকৃত' : 'অপেক্ষমাণ'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {req.status === 'pending' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setReviewingPhoneReq(req);
                                setPhoneReviewNotes('');
                              }}
                            >
                              পর্যালোচনা
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400">{req.reviewedByName || 'মীমাংসিত'}</span>
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

        {/* TAB 4: INSTITUTION REQUESTS */}
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
                            <span className="text-[11px] text-slate-400 font-medium">{req.decisionReason || 'মীমাংসিত'}</span>
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

        {/* TAB 5: ACTIVITIES */}
        {activeTab === 'activities' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-mainText flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>মডারেটরদের সাম্প্রতিক কার্যবিবরণী (Activity Log)</span>
            </h3>

            {activities.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">কোনো অ্যাক্টিভিটি পাওয়া যায়নি।</div>
            ) : (
              <div className="space-y-3">
                {activities.map((act: any) => (
                  <div key={act._id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-mainText">{act.description}</p>
                      <p className="text-[10px] text-subText mt-0.5">মডারেটর: {act.moderatorName} ({act.moderatorRole})</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.createdAt).toLocaleString('bn-BD')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Appoint Moderator Modal */}
      {showAppointModal && (
        <Modal
          isOpen={showAppointModal}
          onClose={() => setShowAppointModal(false)}
          title="নতুন প্রতিষ্ঠান মডারেটর নিয়োগ"
          description={`আপনার আওতাধীন (${division?.nameBn}) বিভাগের যেকোনো অনুমোদিত প্রতিষ্ঠানে একজন দায়িত্বশীল মডারেটর নিয়োগ করুন।`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowAppointModal(false)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingAppoint}
                onClick={handleAppointModerator as any}
                icon={<UserCheck className="w-4 h-4" />}
              >
                নিয়োগ সম্পন্ন করুন
              </Button>
            </>
          }
        >
          <form onSubmit={handleAppointModerator} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                দায়িত্বপ্রাপ্ত প্রতিষ্ঠান নির্বাচন করুন *
              </label>
              <select
                required
                value={appointInstId}
                onChange={e => setAppointInstId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText font-bold"
              >
                <option value="">প্রতিষ্ঠান নির্বাচন করুন...</option>
                {institutions.map((i: any) => (
                  <option key={i._id} value={i._id}>
                    {i.nameBn} ({i.code}) - {i.district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">মডারেটরের পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={appointName}
                onChange={e => setAppointName(e.target.value)}
                placeholder="যেমন: ফয়সাল আহমেদ"
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
              <input
                type="tel"
                required
                value={appointPhone}
                onChange={e => setAppointPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs font-mono text-mainText"
              />
              <p className="text-[10px] text-subText mt-1">এই নম্বরে মডারেটরের লগইন অ্যাকাউন্ট তৈরি হবে বা বিদ্যমান আইডিটি মডারেটরে রূপান্তরিত হবে।</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">অফিসিয়াল ইমেইল (ঐচ্ছিক)</label>
              <input
                type="email"
                value={appointEmail}
                onChange={e => setAppointEmail(e.target.value)}
                placeholder="mod@campus.edu.bd"
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Appointed Credentials Notice Modal */}
      {appointedCreds && (
        <Modal
          isOpen={Boolean(appointedCreds)}
          onClose={() => setAppointedCreds(null)}
          title="মডারেটর নিয়োগ সম্পন্ন হয়েছে"
          description={appointedCreds.message}
          footer={
            <Button variant="primary" size="sm" onClick={() => setAppointedCreds(null)}>
              ঠিক আছে
            </Button>
          }
        >
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
            <p className="font-bold text-emerald-900">মডারেটরের লগইন তথ্য:</p>
            <p>📱 <strong>মোবাইল:</strong> <span className="font-mono font-bold">{appointedCreds.phone}</span></p>
            {appointedCreds.password && (
              <p>🔑 <strong>অস্থায়ী পাসওয়ার্ড:</strong> <span className="font-mono font-bold text-primary">{appointedCreds.password}</span></p>
            )}
            <p className="text-[11px] text-emerald-700 pt-1">
              মডারেটরকে এই তথ্য প্রদান করুন। প্রথম লগইনের সময় তাকে নিজস্ব গোপন পাসওয়ার্ড নির্ধারণ করতে হবে।
            </p>
          </div>
        </Modal>
      )}

      {/* Drill-down Modal (View All Members of Institution) */}
      {drillDownInstitution && (
        <Modal
          isOpen={Boolean(drillDownInstitution)}
          onClose={() => setDrillDownInstitution(null)}
          title={`${drillDownInstitution.nameBn} - সদস্য ও রক্তদাতা তালিকা`}
          description={`ক্যাম্পাস কোড: ${drillDownInstitution.code} • মোট সদস্য: ${drillDownMembers.length} জন`}
          footer={
            <Button variant="outline" size="sm" onClick={() => setDrillDownInstitution(null)}>
              বন্ধ করুন
            </Button>
          }
        >
          <div className="space-y-4">
            {/* Search inside drilldown */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={drillDownSearch}
                onChange={e => setDrillDownSearch(e.target.value)}
                placeholder="নাম, রক্তের গ্রুপ, মোবাইল বা এলাকা দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
              />
            </div>

            {loadingDrillDown ? (
              <div className="text-center py-8 text-xs text-subText">তথ্য লোড হচ্ছে...</div>
            ) : filteredDrillDownMembers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">এই প্রতিষ্ঠানে কোনো সদস্য বা রক্তদাতা পাওয়া যায়নি।</div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder font-bold text-[11px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">নাম ও ফোন</th>
                      <th className="py-2.5 px-3">গ্রুপ</th>
                      <th className="py-2.5 px-3">উপলব্ধতা</th>
                      <th className="py-2.5 px-3">রক্তদান সংখ্যা</th>
                      <th className="py-2.5 px-3">এলাকা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDrillDownMembers.map((m: any) => (
                      <tr key={m._id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-mainText">{m.name}</div>
                          <div className="font-mono text-[10px] text-subText">{m.phone || 'গোপন'}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="primary" size="sm">{m.bloodGroup}</Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge 
                            variant={m.availabilityStatus === 'available' ? 'success' : 'neutral'} 
                            size="sm"
                          >
                            {m.availabilityStatus === 'available' ? 'প্রস্তুত' : 'বিশ্রামে'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-center">{m.totalDonations || 0} বার</td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600">{m.upazila || m.district}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Review Phone Request Modal */}
      {reviewingPhoneReq && (
        <Modal
          isOpen={Boolean(reviewingPhoneReq)}
          onClose={() => setReviewingPhoneReq(null)}
          title="নম্বর পরিবর্তনের আবেদন পর্যালোচনা"
          description={`আবেদনকারী: ${reviewingPhoneReq.userName} (${reviewingPhoneReq.userRole})`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setReviewingPhoneReq(null)}>
                বাতিল
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={submittingPhoneReview}
                onClick={() => handlePhoneReview('rejected')}
              >
                আবেদন বাতিল
              </Button>
              <Button
                variant="success"
                size="sm"
                isLoading={submittingPhoneReview}
                onClick={() => handlePhoneReview('approved')}
              >
                অনুমোদন ও নম্বর হালনাগাদ
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-subText block mb-0.5">বর্তমান নম্বর:</span>
                <span className="font-mono font-bold text-slate-700">{reviewingPhoneReq.currentPhone}</span>
              </div>
              <div>
                <span className="text-subText block mb-0.5">অনুরোধকৃত নতুন নম্বর:</span>
                <span className="font-mono font-black text-primary text-sm">{reviewingPhoneReq.newPhone}</span>
              </div>
            </div>

            <div>
              <span className="text-subText block mb-1">আবেদনকারীর কারণ:</span>
              <p className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-slate-800 italic">
                "{reviewingPhoneReq.reason}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">মন্তব্য (ঐচ্ছিক)</label>
              <input
                type="text"
                value={phoneReviewNotes}
                onChange={e => setPhoneReviewNotes(e.target.value)}
                placeholder="যেমন: টেলিফোনে যাচাইকৃত ও অনুমোদিত"
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Review Institution Request Modal */}
      {reviewingReq && (
        <Modal
          isOpen={Boolean(reviewingReq)}
          onClose={() => setReviewingReq(null)}
          title="প্রতিষ্ঠান আবেদন পর্যালোচনা"
          description={`${reviewingReq.nameBn} (${reviewingReq.code})`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setReviewingReq(null)}>
                বাতিল
              </Button>
              <Button
                variant={reviewDecision === 'approved' ? 'success' : 'danger'}
                size="sm"
                isLoading={submittingReview}
                onClick={handleReviewSubmit as any}
              >
                {reviewDecision === 'approved' ? 'অনুমোদন নিশ্চিত করুন' : 'বাতিল নিশ্চিত করুন'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">
                সিদ্ধান্তের কারণ / প্রশাসনিক নোট *
              </label>
              <textarea
                rows={3}
                required
                value={decisionReason}
                onChange={e => setDecisionReason(e.target.value)}
                placeholder="অনুমোদন বা বাতিলের সুস্পষ্ট কারণ লিখুন..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Block User Modal */}
      {blockingTarget && (
        <Modal
          isOpen={Boolean(blockingTarget)}
          onClose={() => setBlockingTarget(null)}
          title="অ্যাকাউন্ট স্থগিত / ব্লক করুন"
          description={`লক্ষ্য: ${blockingTarget.name} (${blockingTarget.phone})`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setBlockingTarget(null)}>
                বাতিল
              </Button>
              <Button variant="danger" size="sm" onClick={handleBlockUser as any}>
                স্থগিত কার্যকর করুন
              </Button>
            </>
          }
        >
          <form onSubmit={handleBlockUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">
                স্থগিতের কারণ (বাধ্যতামূলক) *
              </label>
              <textarea
                rows={3}
                required
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="যেমন: দায়িত্ব পালনে অবহেলা / নীতিমালার লঙ্ঘন..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
