import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  Check, 
  Droplet, 
  Phone, 
  HeartHandshake, 
  Clock, 
  Send,
  Lock, 
  RotateCcw, 
  Search,
  KeyRound,
  FileText,
  AlertTriangle,
  History,
  XCircle
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/ui/StatsCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Modal } from '../components/ui/Modal';

export const InstitutionHeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [institution, setInstitution] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [recoveryHistory, setRecoveryHistory] = useState<any[]>([]);
  const [instChangeRequests, setInstChangeRequests] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'roster' | 'recovery' | 'inst_changes' | 'history' | 'register'>('roster');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Scoped User Search state (PART 04)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);

  // Password Recovery Approval Modal (PART 03)
  const [approvingReq, setApprovingReq] = useState<any | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [submittingApprove, setSubmittingApprove] = useState(false);
  const [revealedRecoveryCreds, setRevealedRecoveryCreds] = useState<{
    phone: string;
    temporaryPassword: string;
    message: string;
    warning: string;
  } | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Password Recovery Rejection Modal
  const [rejectingReq, setRejectingReq] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Review Institution Change Modal (PART 06)
  const [reviewingChangeReq, setReviewingChangeReq] = useState<any | null>(null);
  const [changeDecision, setChangeDecision] = useState<'approved' | 'rejected'>('approved');
  const [changeNotes, setChangeNotes] = useState('');
  const [submittingChangeReview, setSubmittingChangeReview] = useState(false);

  // Manual Member Registration Modal (PART 08)
  const [memName, setMemName] = useState('');
  const [memPhone, setMemPhone] = useState('');
  const [memGender, setMemGender] = useState<'male' | 'female' | 'unspecified' | 'other'>('unspecified');
  const [memBloodGroup, setMemBloodGroup] = useState<BloodGroup>('O+');
  const [memUpazila, setMemUpazila] = useState('');
  const [memConsent, setMemConsent] = useState(true);
  const [submittingMember, setSubmittingMember] = useState(false);
  const [registeredCreds, setRegisteredCreds] = useState<{
    phone: string;
    temporaryPassword: string;
    warning: string;
  } | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, recRes, histRes, chgRes] = await Promise.all([
        api.getModeratorDashboard(),
        api.getPasswordRecoveryRequests(),
        api.getPasswordRecoveryHistory(),
        api.getInstitutionChangeRequests()
      ]);

      if (dashRes.success) {
        setData(dashRes);
        setInstitution(dashRes.institution);
        setDonors(dashRes.donors || []);
      }
      if (recRes.success) setRecoveryRequests(recRes.requests || []);
      if (histRes.success) setRecoveryHistory(histRes.history || []);
      if (chgRes.success) setInstChangeRequests(chgRes.requests || []);

      // If institution id is present, also load member list
      if (dashRes.institution?._id) {
        try {
          const memRes = await api.getInstitutionMembers(dashRes.institution._id);
          if (memRes.success) {
            setMembers(memRes.members || []);
          }
        } catch {}
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'প্রতিষ্ঠান প্রধান ড্যাশবোর্ড তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleScopedSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchingUser(true);
    setSearchResult(null);
    try {
      const res = await api.scopedUserSearch(searchQuery.trim());
      setSearchResult(res);
    } catch (err: any) {
      setSearchResult({
        success: false,
        isOutOfScope: true,
        guidanceBn: err.message || 'অনুসন্ধান প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে।'
      });
    } finally {
      setSearchingUser(false);
    }
  };

  const handleApproveRecovery = async () => {
    if (!approvingReq) return;
    setSubmittingApprove(true);
    try {
      const res = await api.approvePasswordRecoveryRequest(approvingReq._id, approvalNotes.trim() || undefined);
      if (res.success && res.temporaryPassword) {
        setRevealedRecoveryCreds({
          phone: approvingReq.userPhone,
          temporaryPassword: res.temporaryPassword,
          message: res.message,
          warning: res.securityNotice || 'এটি এককালীন ব্যবহারের জন্য। ব্যবহারকারীকে লগইনের পর অবিলম্বে পাসওয়ার্ড পরিবর্তন করতে হবে।'
        });
        setApprovingReq(null);
        setApprovalNotes('');
        loadAllData();
      } else {
        setActionMsg({ text: res.message || 'পাসওয়ার্ড প্রদান প্রক্রিয়া ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'অনুমোদন ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setSubmittingApprove(false);
    }
  };

  const handleRejectRecovery = async () => {
    if (!rejectingReq) return;
    if (rejectReason.trim().length < 5) {
      setActionMsg({ text: 'বাতিলের সুস্পষ্ট কারণ (কমপক্ষে ৫ অক্ষর) উল্লেখ করুন।', type: 'error' });
      return;
    }
    setSubmittingReject(true);
    try {
      const res = await api.rejectPasswordRecoveryRequest(rejectingReq._id, rejectReason.trim());
      if (res.success) {
        setActionMsg({ text: 'আবেদনটি সফলভাবে বাতিল করা হয়েছে।', type: 'success' });
        setRejectingReq(null);
        setRejectReason('');
        loadAllData();
      } else {
        setActionMsg({ text: res.message || 'বাতিল করা যায়নি।', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'বাতিলকরণে ত্রুটি হয়েছে।', type: 'error' });
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleReviewChangeRequest = async () => {
    if (!reviewingChangeReq) return;
    setSubmittingChangeReview(true);
    try {
      const res = await api.reviewInstitutionChangeRequest(reviewingChangeReq._id, {
        status: changeDecision,
        decisionReason: changeNotes.trim() || (changeDecision === 'approved' ? 'অনুমোদিত' : 'বাতিল'),
        reviewNotes: changeNotes.trim() || undefined
      });
      if (res.success) {
        setActionMsg({ text: res.message || 'প্রতিষ্ঠান পরিবর্তনের আবেদন নিষ্পত্তি সম্পন্ন হয়েছে।', type: 'success' });
        setReviewingChangeReq(null);
        setChangeNotes('');
        loadAllData();
      } else {
        setActionMsg({ text: res.message || 'নিষ্পত্তি করা সম্ভব হয়নি।', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'পর্যালোচনা ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setSubmittingChangeReview(false);
    }
  };

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution?._id) return;
    const cleanPhone = memPhone.replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setActionMsg({ text: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।', type: 'error' });
      return;
    }

    setSubmittingMember(true);
    try {
      const res = await api.createMemberByModerator({
        name: memName.trim(),
        phone: cleanPhone,
        gender: memGender,
        bloodGroup: memBloodGroup,
        division: institution.division,
        district: institution.district,
        upazila: memUpazila.trim() || institution.upazila || '',
        institutionId: institution._id,
        consentToShareContact: memConsent
      });

      if (res.success && res.temporaryPassword) {
        setRegisteredCreds({
          phone: cleanPhone,
          temporaryPassword: res.temporaryPassword,
          warning: res.warning || 'সদস্যের প্রাথমিক পাসওয়ার্ড এটি। প্রথমবার লগইনের পর নতুন পাসওয়ার্ড সেট করতে হবে।'
        });
        setMemName('');
        setMemPhone('');
        loadAllData();
      } else {
        setActionMsg({ text: res.message || 'সদস্য নিবন্ধন সম্পন্ন হয়নি।', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'নিবন্ধন প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে।', type: 'error' });
    } finally {
      setSubmittingMember(false);
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
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="font-bold text-mainText text-lg">অনুমতি সীমাবদ্ধ</h3>
        <p className="text-xs text-subText">{errorMsg}</p>
      </div>
    );
  }

  const pendingRecoveryCount = recoveryRequests.filter(r => r.status === 'pending').length;
  const pendingChangeCount = instChangeRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-page pb-12">
      {/* Header Bar */}
      <div className="bg-surface border-b border-appBorder px-4 sm:px-6 lg:px-8 py-5 shadow-soft">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Breadcrumb items={[{ label: 'প্রতিষ্ঠান প্রধান ড্যাশবোর্ড' }]} />
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-mainText tracking-tight">
                {institution?.nameBn || institution?.name || 'শিক্ষা প্রতিষ্ঠান'} নিয়ন্ত্রণ প্যানেল
              </h1>
              <Badge variant="teal" size="sm">প্রতিষ্ঠান প্রধান</Badge>
            </div>
            <p className="text-xs text-subText mt-0.5">
              প্রতিষ্ঠান প্রধান: <strong className="text-mainText">{user?.name}</strong> • কোড: <strong className="font-mono text-teal-800">{institution?.code}</strong> • জেলা: {institution?.district}
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>ক্যাম্পাস পোর্টাল সক্রিয়</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Action Alert Banner */}
        {actionMsg && (
          <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-soft ${
            actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
              <span>{actionMsg.text}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-xs font-bold px-2">✕</button>
          </div>
        )}

        {/* 4 Top Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            title="মোট ক্যাম্পাস সদস্য"
            value={members.length || donors.length}
            subtitle="নিবন্ধিত শিক্ষার্থী ও কর্মী"
            icon={<Users className="w-5 h-5" />}
            iconColor="teal"
            onClick={() => setActiveTab('roster')}
          />
          <StatsCard
            title="সক্রিয় রক্তদাতা"
            value={donors.filter(d => d.availabilityStatus === 'available').length}
            subtitle="জরুরি রক্তদানে প্রস্তুত"
            icon={<Droplet className="w-5 h-5" />}
            iconColor="primary"
            onClick={() => setActiveTab('roster')}
          />
          <StatsCard
            title="পাসওয়ার্ড রিকভারি আবেদন"
            value={pendingRecoveryCount}
            subtitle="এককালীন পাসওয়ার্ড অনুমোদন"
            icon={<KeyRound className="w-5 h-5" />}
            iconColor="amber"
            onClick={() => setActiveTab('recovery')}
          />
          <StatsCard
            title="প্রতিষ্ঠান পরিবর্তন আবেদন"
            value={pendingChangeCount}
            subtitle="নতুন সদস্য অন্তর্ভুক্তি"
            icon={<Building2 className="w-5 h-5" />}
            iconColor="blue"
            onClick={() => setActiveTab('inst_changes')}
          />
        </div>

        {/* PART 04: Role-Based Scoped Profile Search */}
        <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 space-y-4">
          <div>
            <h2 className="text-sm font-black text-mainText flex items-center gap-2">
              <Search className="w-4 h-4 text-teal-700" />
              <span>প্রতিষ্ঠান স্কোপড প্রোফাইল অনুসন্ধান (Scoped User Search)</span>
            </h2>
            <p className="text-xs text-subText mt-0.5">
              ব্যবহারকারী আইডি, ১১ ডিজিটের মোবাইল নম্বর অথবা নাম দিয়ে আপনার শিক্ষা প্রতিষ্ঠানের আওতাভুক্ত যে কোনো সদস্য অনুসন্ধান করুন
            </p>
          </div>

          <form onSubmit={handleScopedSearch} className="flex gap-2">
            <input
              type="text"
              required
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="মোবাইল নম্বর (01XXXXXXXXX) / আইডি (usr_...) / নাম লিখুন..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs sm:text-sm text-mainText focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={searchingUser}
              className="bg-teal-700 hover:bg-teal-800"
            >
              অনুসন্ধান
            </Button>
          </form>

          {/* Search Result Display */}
          {searchResult && (
            <div className="mt-3">
              {searchResult.isOutOfScope ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800">অধিকারবর্হিভূত প্রোফাইল (Out of Scope)</h4>
                    <p className="text-xs text-amber-700 mt-0.5">{searchResult.guidanceBn}</p>
                  </div>
                </div>
              ) : searchResult.user ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                      {searchResult.user.name?.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-mainText text-sm">{searchResult.user.name}</h4>
                        <Badge variant="teal" size="sm">{searchResult.user.role}</Badge>
                        <Badge variant="neutral" size="sm">{searchResult.user.accountStatus}</Badge>
                      </div>
                      <p className="text-xs text-subText font-mono mt-0.5">
                        ফোন: <strong>{searchResult.user.phone}</strong> | আইডি: {searchResult.user._id}
                      </p>
                      {searchResult.donorProfile && (
                        <p className="text-xs text-teal-800 font-semibold mt-0.5">
                          রক্তের গ্রুপ: {searchResult.donorProfile.bloodGroup} | উপলব্ধতা: {searchResult.donorProfile.availabilityStatus}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="success" size="sm">✓ প্রতিষ্ঠানভুক্ত প্রোফাইল</Badge>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-xs text-center">
                  কোনো ব্যবহারকারী পাওয়া যায়নি।
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-appBorder pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'roster' ? 'bg-teal-700 text-white shadow-soft' : 'text-subText hover:text-mainText'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ক্যাম্পাস সদস্য তালিকা ({members.length || donors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recovery')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'recovery' ? 'bg-amber-600 text-white shadow-soft' : 'text-subText hover:text-mainText'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>পাসওয়ার্ড রিকভারি আবেদন {pendingRecoveryCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-white text-amber-700 text-[10px] font-black">{pendingRecoveryCount}</span>}</span>
          </button>

          <button
            onClick={() => setActiveTab('inst_changes')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'inst_changes' ? 'bg-blue-600 text-white shadow-soft' : 'text-subText hover:text-mainText'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>প্রতিষ্ঠান পরিবর্তন আবেদন {pendingChangeCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-white text-blue-700 text-[10px] font-black">{pendingChangeCount}</span>}</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'register' ? 'bg-emerald-700 text-white shadow-soft' : 'text-subText hover:text-mainText'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন সদস্য নিবন্ধন</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'history' ? 'bg-slate-800 text-white shadow-soft' : 'text-subText hover:text-mainText'
            }`}
          >
            <History className="w-4 h-4" />
            <span>রিকভারি অডিট ইতিহাস</span>
          </button>
        </div>

        {/* Tab 1: Member & Donor Roster */}
        {activeTab === 'roster' && (
          <div className="bg-surface rounded-3xl border border-appBorder shadow-card overflow-hidden">
            <div className="p-5 border-b border-appBorder flex items-center justify-between">
              <div>
                <h3 className="font-bold text-mainText text-sm sm:text-base">ক্যাম্পাস রক্তদাতা ও সদস্য তালিকা</h3>
                <p className="text-xs text-subText">উক্ত শিক্ষা প্রতিষ্ঠানের নিবন্ধিত ডোনার ও শিক্ষার্থী সদস্যদের তথ্য</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-appBorder text-subText">
                  <tr>
                    <th className="p-3.5 font-bold">সদস্যের নাম</th>
                    <th className="p-3.5 font-bold">রক্তের গ্রুপ</th>
                    <th className="p-3.5 font-bold">মোবাইল নম্বর</th>
                    <th className="p-3.5 font-bold">অবস্থা</th>
                    <th className="p-3.5 font-bold">মোট রক্তদান</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-appBorder">
                  {(members.length > 0 ? members : donors).map((m: any) => (
                    <tr key={m._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-mainText">{m.name || m.displayName}</div>
                        <div className="text-[11px] text-subText font-mono">আইডি: {m._id}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-black text-primary px-2 py-1 bg-rose-50 rounded-lg border border-rose-100">
                          {m.bloodGroup}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-xs">
                        {m.phone ? (
                          <a href={`tel:${m.phone}`} className="text-teal-700 hover:underline flex items-center gap-1 font-semibold">
                            <Phone className="w-3 h-3" />
                            {m.phone}
                          </a>
                        ) : (
                          <span className="text-subText italic">গোপনকৃত</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <Badge variant={m.availabilityStatus === 'available' ? 'success' : 'neutral'} size="sm">
                          {m.availabilityStatus === 'available' ? 'প্রস্তুত' : 'অনুপলব্ধ'}
                        </Badge>
                      </td>
                      <td className="p-3.5 font-semibold text-mainText">
                        {m.totalDonations || 0} বার
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && donors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-subText text-xs">
                        কোনো সদস্য পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Password Recovery Requests (PART 03) */}
        {activeTab === 'recovery' && (
          <div className="bg-surface rounded-3xl border border-appBorder shadow-card overflow-hidden">
            <div className="p-5 border-b border-appBorder">
              <h3 className="font-bold text-mainText text-sm sm:text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>অপেক্ষমাণ পাসওয়ার্ড রিকভারি আবেদনসমূহ (Password Recovery Queue)</span>
              </h3>
              <p className="text-xs text-subText mt-0.5">
                ব্যবহারকারীর পরিচয় যাচাই করে এককালীন অস্থায়ী পাসওয়ার্ড প্রদান করুন। অনুমোদন বা বাতিলের পূর্ণাঙ্গ অডিট ট্রেইল সংরক্ষিত থাকবে।
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-appBorder text-subText">
                  <tr>
                    <th className="p-3.5 font-bold">আবেদনকারীর তথ্য</th>
                    <th className="p-3.5 font-bold">অনুরোধের কারণ</th>
                    <th className="p-3.5 font-bold">তারিখ ও সময়</th>
                    <th className="p-3.5 font-bold">স্ট্যাটাস</th>
                    <th className="p-3.5 font-bold text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-appBorder">
                  {recoveryRequests.map((req: any) => (
                    <tr key={req._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-mainText">{req.userName}</div>
                        <div className="text-xs font-mono text-teal-800">{req.userPhone}</div>
                        <div className="text-[11px] text-subText font-mono">আইডি: {req.userId}</div>
                      </td>
                      <td className="p-3.5 text-xs text-mainText max-w-xs">
                        "{req.reason}"
                      </td>
                      <td className="p-3.5 text-xs text-subText font-mono">
                        {new Date(req.createdAt).toLocaleString('bn-BD')}
                      </td>
                      <td className="p-3.5">
                        <Badge 
                          variant={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'danger'} 
                          size="sm"
                        >
                          {req.status === 'pending' ? 'অপেক্ষমাণ' : req.status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {req.status === 'pending' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRejectingReq(req);
                                setRejectReason('');
                              }}
                              className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                            >
                              বাতিল
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setApprovingReq(req);
                                setApprovalNotes('');
                              }}
                              className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              পাসওয়ার্ড দিন
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-subText italic">নিষ্পন্ন</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {recoveryRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-subText text-xs">
                        বর্তমানে কোনো পাসওয়ার্ড রিকভারি আবেদন অপেক্ষমাণ নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Institution Change Requests (PART 06) */}
        {activeTab === 'inst_changes' && (
          <div className="bg-surface rounded-3xl border border-appBorder shadow-card overflow-hidden">
            <div className="p-5 border-b border-appBorder">
              <h3 className="font-bold text-mainText text-sm sm:text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>প্রতিষ্ঠান পরিবর্তন বা অন্তর্ভুক্তি আবেদনসমূহ</span>
              </h3>
              <p className="text-xs text-subText mt-0.5">
                যে সকল রক্তদাতা আপনার প্রতিষ্ঠানের সাথে সংযুক্ত হতে আবেদন করেছেন
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-appBorder text-subText">
                  <tr>
                    <th className="p-3.5 font-bold">আবেদনকারী</th>
                    <th className="p-3.5 font-bold">শিক্ষার্থী আইডি / বিভাগ</th>
                    <th className="p-3.5 font-bold">কারণ</th>
                    <th className="p-3.5 font-bold">স্ট্যাটাস</th>
                    <th className="p-3.5 font-bold text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-appBorder">
                  {instChangeRequests.map((req: any) => (
                    <tr key={req._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-mainText">{req.userName}</div>
                        <div className="text-xs font-mono text-subText">{req.userPhone}</div>
                      </td>
                      <td className="p-3.5 text-xs text-mainText">
                        <div>আইডি: {req.studentOrStaffId || 'প্রযোজ্য নয়'}</div>
                        <div className="text-subText">বিভাগ: {req.department || 'সাধারণ'}</div>
                      </td>
                      <td className="p-3.5 text-xs text-mainText max-w-xs">
                        "{req.reason}"
                      </td>
                      <td className="p-3.5">
                        <Badge 
                          variant={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'danger'} 
                          size="sm"
                        >
                          {req.status === 'pending' ? 'অপেক্ষমাণ' : req.status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {req.status === 'pending' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReviewingChangeReq(req);
                                setChangeDecision('rejected');
                                setChangeNotes('');
                              }}
                              className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                            >
                              বাতিল
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setReviewingChangeReq(req);
                                setChangeDecision('approved');
                                setChangeNotes('');
                              }}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              অনুমোদন
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-subText italic">নিষ্পন্ন</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {instChangeRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-subText text-xs">
                        কোনো অপেক্ষমাণ আবেদন নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Register New Member */}
        {activeTab === 'register' && (
          <div className="max-w-2xl bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-appBorder pb-4">
              <h3 className="font-bold text-mainText text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                <span>নতুন ক্যাম্পাস সদস্য নিবন্ধন</span>
              </h3>
              <p className="text-xs text-subText mt-0.5">
                ক্যাম্পাসের কোনো শিক্ষার্থী বা কর্মীকে সরাসরি সিস্টেমে অন্তর্ভুক্ত করুন। তাকে একটি নিরাপদ এককালীন পাসওয়ার্ড প্রদান করা হবে।
              </p>
            </div>

            <form onSubmit={handleRegisterMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">সদস্যের নাম *</label>
                  <input
                    type="text"
                    required
                    value={memName}
                    onChange={e => setMemName(e.target.value)}
                    placeholder="পুরো নাম লিখুন"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs sm:text-sm text-mainText"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">১১ ডিজিটের মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={memPhone}
                    onChange={e => setMemPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs sm:text-sm font-mono text-mainText"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">রক্তের গ্রুপ *</label>
                  <select
                    value={memBloodGroup}
                    onChange={e => setMemBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs sm:text-sm font-black text-primary"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">উপজেলা / ক্যাম্পাসের অবস্থান</label>
                  <input
                    type="text"
                    value={memUpazila}
                    onChange={e => setMemUpazila(e.target.value)}
                    placeholder="ক্যাম্পাস এলাকা"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs sm:text-sm text-mainText"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={memConsent}
                  onChange={e => setMemConsent(e.target.checked)}
                  className="rounded border-gray-300 text-teal-700"
                />
                <label htmlFor="consent" className="text-xs text-subText">
                  জরুরি প্রয়োজনে সদস্যের নম্বর পাবলিক অনুসন্ধানে দৃশ্যমান রাখতে সদস্যের সম্মতি রয়েছে
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={submittingMember}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  সদস্য তৈরি ও পাসওয়ার্ড উৎপন্ন করুন
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Recovery Audit History */}
        {activeTab === 'history' && (
          <div className="bg-surface rounded-3xl border border-appBorder shadow-card overflow-hidden">
            <div className="p-5 border-b border-appBorder">
              <h3 className="font-bold text-mainText text-sm sm:text-base flex items-center gap-2">
                <History className="w-5 h-5 text-slate-700" />
                <span>পাসওয়ার্ড রিকভারি অডিট ট্রেইল ও ইতিহাস</span>
              </h3>
              <p className="text-xs text-subText mt-0.5">
                অতীতে সম্পন্ন হওয়া সকল অস্থায়ী পাসওয়ার্ড ইস্যু ও বাতিলের আইনি নিরাপত্তা রেকর্ড
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-appBorder text-subText">
                  <tr>
                    <th className="p-3.5 font-bold">তারিখ ও সময়</th>
                    <th className="p-3.5 font-bold">ব্যবহারকারী</th>
                    <th className="p-3.5 font-bold">কার্যক্রম</th>
                    <th className="p-3.5 font-bold">অনুমোদনকারী</th>
                    <th className="p-3.5 font-bold">বিবরণ / নোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-appBorder">
                  {recoveryHistory.map((h: any) => (
                    <tr key={h._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 text-xs font-mono text-subText">
                        {new Date(h.createdAt).toLocaleString('bn-BD')}
                      </td>
                      <td className="p-3.5 font-semibold text-mainText">
                        {h.userPhone}
                      </td>
                      <td className="p-3.5">
                        <Badge variant={h.action === 'APPROVED' ? 'success' : 'danger'} size="sm">
                          {h.action === 'APPROVED' ? 'পাসওয়ার্ড ইস্যু' : 'আবেদন বাতিল'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-xs text-teal-800 font-bold">
                        {h.actorName} ({h.actorRole})
                      </td>
                      <td className="p-3.5 text-xs text-subText">
                        {h.notes || 'কোনো মন্তব্য নেই'}
                      </td>
                    </tr>
                  ))}
                  {recoveryHistory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-subText text-xs">
                        কোনো অডিট লগ রেকর্ড নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Approve Recovery and Reveal Temporary Password (PART 03) */}
      {approvingReq && (
        <Modal
          isOpen={!!approvingReq}
          onClose={() => setApprovingReq(null)}
          title="পাসওয়ার্ড রিকভারি অনুমোদন ও অস্থায়ী পাসওয়ার্ড"
          description={`ব্যবহারকারী ${approvingReq.userName} (${approvingReq.userPhone})-এর জন্য এককালীন অস্থায়ী পাসওয়ার্ড তৈরি হবে।`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setApprovingReq(null)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingApprove}
                onClick={handleApproveRecovery}
                className="bg-amber-600 hover:bg-amber-700"
              >
                অনুমোদন ও পাসওয়ার্ড উৎপন্ন করুন
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <strong>সতর্কতা:</strong> আবেদনকারীর সত্যতা যাচাই করার পর অনুমোদন করুন। এই পাসওয়ার্ডটি দিয়ে ব্যবহারকারী একবারই লগইন করতে পারবেন এবং অবিলম্বে নতুন পাসওয়ার্ড দিতে বাধ্য থাকবেন।
            </div>
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">অনুমোদনের নোট (ঐচ্ছিক)</label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                placeholder="সদস্যের সাথে সরাসরি কথা বলে পরিচয় নিশ্চিত করা হলো..."
                className="w-full px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Temporary Password Generated Display (PART 03) */}
      {revealedRecoveryCreds && (
        <Modal
          isOpen={!!revealedRecoveryCreds}
          onClose={() => setRevealedRecoveryCreds(null)}
          title="এককালীন অস্থায়ী পাসওয়ার্ড প্রস্তুত"
          footer={
            <Button variant="primary" size="sm" onClick={() => setRevealedRecoveryCreds(null)}>
              সম্পন্ন করেছি
            </Button>
          }
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-mainText text-sm">
              মোবাইল: <span className="font-mono">{revealedRecoveryCreds.phone}</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xl tracking-wider flex items-center justify-between">
              <span>{revealedRecoveryCreds.temporaryPassword}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(revealedRecoveryCreds.temporaryPassword);
                  setCopiedOtp(true);
                  setTimeout(() => setCopiedOtp(false), 2000);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400"
              >
                {copiedOtp ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-rose-600 font-semibold">
              {revealedRecoveryCreds.warning}
            </p>
          </div>
        </Modal>
      )}

      {/* Modal: Registered Member Temporary Password Display */}
      {registeredCreds && (
        <Modal
          isOpen={!!registeredCreds}
          onClose={() => setRegisteredCreds(null)}
          title="নতুন সদস্যের প্রাথমিক পাসওয়ার্ড"
          footer={
            <Button variant="primary" size="sm" onClick={() => setRegisteredCreds(null)}>
              ঠিক আছে
            </Button>
          }
        >
          <div className="space-y-4 text-center">
            <h4 className="font-bold text-mainText text-sm">
              মোবাইল নম্বর: <span className="font-mono">{registeredCreds.phone}</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xl tracking-wider flex items-center justify-between">
              <span>{registeredCreds.temporaryPassword}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(registeredCreds.temporaryPassword);
                  setCopiedOtp(true);
                  setTimeout(() => setCopiedOtp(false), 2000);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400"
              >
                {copiedOtp ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-subText">
              {registeredCreds.warning}
            </p>
          </div>
        </Modal>
      )}

      {/* Modal: Reject Recovery */}
      {rejectingReq && (
        <Modal
          isOpen={!!rejectingReq}
          onClose={() => setRejectingReq(null)}
          title="পাসওয়ার্ড রিকভারি আবেদন বাতিল"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setRejectingReq(null)}>
                পিছনে যান
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingReject}
                onClick={handleRejectRecovery}
                className="bg-rose-600 hover:bg-rose-700"
              >
                বাতিল নিশ্চিত করুন
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <label className="block text-xs font-bold text-mainText">বাতিলকরণের কারণ * (কমপক্ষে ৫ অক্ষর)</label>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="পরিচয় নিশ্চিত হওয়া সম্ভব হয়নি..."
              className="w-full px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
            />
          </div>
        </Modal>
      )}

      {/* Modal: Review Institution Change Request */}
      {reviewingChangeReq && (
        <Modal
          isOpen={!!reviewingChangeReq}
          onClose={() => setReviewingChangeReq(null)}
          title={`প্রতিষ্ঠান পরিবর্তনের আবেদন ${changeDecision === 'approved' ? 'অনুমোদন' : 'বাতিল'}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setReviewingChangeReq(null)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingChangeReview}
                onClick={handleReviewChangeRequest}
                className={changeDecision === 'approved' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'}
              >
                {changeDecision === 'approved' ? 'অনুমোদন করুন' : 'বাতিল করুন'}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-subText">
              আবেদনকারী: <strong>{reviewingChangeReq.userName}</strong> ({reviewingChangeReq.userPhone})
            </p>
            <label className="block text-xs font-bold text-mainText">পর্যালোচনা নোট / মন্তব্য (ঐচ্ছিক)</label>
            <textarea
              rows={3}
              value={changeNotes}
              onChange={e => setChangeNotes(e.target.value)}
              placeholder="শিক্ষার্থী আইডি যাচাই করে অনুমোদন প্রদান করা হলো..."
              className="w-full px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
