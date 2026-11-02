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
  Activity,
  Lock,
  RotateCcw,
  UserCheck,
  XCircle,
  Search,
  KeyRound,
  History
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS, BANGLADESH_DIVISIONS, BloodGroup } from '../data/bangladeshLocations';
import { ContactRequest, ModeratorActivity } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/ui/StatsCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Modal } from '../components/ui/Modal';

export const ModeratorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [activities, setActivities] = useState<ModeratorActivity[]>([]);
  const [phoneChangeRequests, setPhoneChangeRequests] = useState<any[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [instChanges, setInstChanges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'roster' | 'contact_requests' | 'phone_requests' | 'password_recovery' | 'institution_changes' | 'activities'>('roster');

  // Scoped User Search states (PART 04)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);

  // Password Recovery Approval Modal (PART 03)
  const [approvingRecovery, setApprovingRecovery] = useState<any | null>(null);
  const [recoveryApproveNotes, setRecoveryApproveNotes] = useState('');
  const [submittingRecoveryApprove, setSubmittingRecoveryApprove] = useState(false);
  const [revealedRecoveryCreds, setRevealedRecoveryCreds] = useState<{
    phone: string;
    temporaryPassword: string;
    message: string;
    warning: string;
  } | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Password Recovery Rejection Modal
  const [rejectingRecovery, setRejectingRecovery] = useState<any | null>(null);
  const [recoveryRejectReason, setRecoveryRejectReason] = useState('');
  const [submittingRecoveryReject, setSubmittingRecoveryReject] = useState(false);

  // Review Institution Change Modal (PART 06)
  const [reviewingChangeReq, setReviewingChangeReq] = useState<any | null>(null);
  const [changeDecision, setChangeDecision] = useState<'approved' | 'rejected'>('approved');
  const [changeReviewNotes, setChangeReviewNotes] = useState('');
  const [submittingChangeReview, setSubmittingChangeReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Phone Change Review Modal
  const [reviewingPhoneReq, setReviewingPhoneReq] = useState<any | null>(null);
  const [phoneReviewStatus, setPhoneReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [phoneReviewNotes, setPhoneReviewNotes] = useState('');
  const [submittingPhoneReview, setSubmittingPhoneReview] = useState(false);

  // Manual Member Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [memName, setMemName] = useState('');
  const [memPhone, setMemPhone] = useState('');
  const [memGender, setMemGender] = useState<'male' | 'female' | 'unspecified' | 'other'>('unspecified');
  const [memBloodGroup, setMemBloodGroup] = useState<BloodGroup>('O+');
  const [memDivision, setMemDivision] = useState('dhaka');
  const [memDistrict, setMemDistrict] = useState('dhaka');
  const [memUpazila, setMemUpazila] = useState('');
  const [memConsent, setMemConsent] = useState(true);
  const [submittingMember, setSubmittingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  // One-time temporary password reveal
  const [revealedCreds, setRevealedCreds] = useState<{
    name: string;
    phone: string;
    temporaryPassword: string;
    warning: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Contact request handling modal
  const [handlingReq, setHandlingReq] = useState<ContactRequest | null>(null);
  const [reqStatus, setReqStatus] = useState<'in_progress' | 'fulfilled' | 'cancelled'>('in_progress');
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [submittingHandling, setSubmittingHandling] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, contactRes, actRes, phoneRes, recRes, chgRes] = await Promise.all([
        api.getModeratorDashboard(),
        api.getContactRequests(),
        api.getModeratorActivities(),
        api.getPhoneChangeRequests(),
        api.getPasswordRecoveryRequests(),
        api.getInstitutionChangeRequests()
      ]);

      if (dashRes.success) setData(dashRes);
      if (contactRes.success) setContactRequests(contactRes.requests || []);
      if (actRes.success) setActivities(actRes.activities || []);
      if (phoneRes.success) setPhoneChangeRequests(phoneRes.requests || []);
      if (recRes && recRes.success) setRecoveryRequests(recRes.requests || []);
      if (chgRes && chgRes.success) setInstChanges(chgRes.requests || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'ড্যাশবোর্ড তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
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
    if (!approvingRecovery) return;
    setSubmittingRecoveryApprove(true);
    try {
      const res = await api.approvePasswordRecoveryRequest(approvingRecovery._id, recoveryApproveNotes.trim() || undefined);
      if (res.success && res.temporaryPassword) {
        setRevealedRecoveryCreds({
          phone: approvingRecovery.userPhone,
          temporaryPassword: res.temporaryPassword,
          message: res.message,
          warning: res.securityNotice || 'এটি এককালীন ব্যবহারের জন্য। ব্যবহারকারী লগইন করার পর নতুন পাসওয়ার্ড সেট করতে বাধ্য থাকবে।'
        });
        setApprovingRecovery(null);
        setRecoveryApproveNotes('');
        loadDashboardData();
      } else {
        alert(res.message || 'পাসওয়ার্ড প্রদান প্রক্রিয়া ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      alert(err.message || 'অনুমোদন ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingRecoveryApprove(false);
    }
  };

  const handleRejectRecovery = async () => {
    if (!rejectingRecovery) return;
    if (recoveryRejectReason.trim().length < 5) {
      alert('বাতিলের সুস্পষ্ট কারণ (কমপক্ষে ৫ অক্ষর) উল্লেখ করুন।');
      return;
    }
    setSubmittingRecoveryReject(true);
    try {
      const res = await api.rejectPasswordRecoveryRequest(rejectingRecovery._id, recoveryRejectReason.trim());
      if (res.success) {
        setRejectingRecovery(null);
        setRecoveryRejectReason('');
        loadDashboardData();
      } else {
        alert(res.message || 'বাতিল করা যায়নি।');
      }
    } catch (err: any) {
      alert(err.message || 'ত্রুটি দেখা দিয়েছে।');
    } finally {
      setSubmittingRecoveryReject(false);
    }
  };

  const handleReviewChangeRequest = async () => {
    if (!reviewingChangeReq) return;
    setSubmittingChangeReview(true);
    try {
      const res = await api.reviewInstitutionChangeRequest(reviewingChangeReq._id, {
        status: changeDecision,
        decisionReason: changeReviewNotes.trim() || (changeDecision === 'approved' ? 'অনুমোদিত' : 'বাতিল'),
        reviewNotes: changeReviewNotes.trim() || undefined
      });
      if (res.success) {
        setReviewingChangeReq(null);
        setChangeReviewNotes('');
        loadDashboardData();
      } else {
        alert(res.message || 'নিষ্পত্তি করা যায়নি।');
      }
    } catch (err: any) {
      alert(err.message || 'পর্যালোচনা ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingChangeReview(false);
    }
  };

  const handleReviewPhoneRequest = async (e?: React.SyntheticEvent) => {
    if (e?.preventDefault) e.preventDefault();
    if (!reviewingPhoneReq) return;
    setSubmittingPhoneReview(true);
    try {
      const res = await api.reviewPhoneChangeRequest(reviewingPhoneReq._id, {
        status: phoneReviewStatus,
        reviewNotes: phoneReviewNotes.trim() || undefined
      });
      if (res.success) {
        setReviewingPhoneReq(null);
        setPhoneReviewNotes('');
        loadDashboardData();
      } else {
        alert(res.message || 'পর্যালোচনা ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      alert(err.message || 'পর্যালোচনা ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingPhoneReview(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.institution?._id) return;

    setSubmittingMember(true);
    setMemberError(null);

    try {
      const res = await api.createMemberByModerator({
        name: memName.trim(),
        phone: memPhone.trim(),
        gender: memGender,
        bloodGroup: memBloodGroup,
        division: memDivision,
        district: memDistrict,
        upazila: memUpazila,
        institutionId: data.institution._id,
        consentToShareContact: memConsent
      });

      if (res.success && res.temporaryPassword) {
        setRevealedCreds({
          name: res.user.name,
          phone: res.user.phone,
          temporaryPassword: res.temporaryPassword,
          warning: res.warning || 'এই সাময়িক পাসওয়ার্ডটি পুনরায় দেখানো হবে না।'
        });
        setShowCreateModal(false);
        setMemName('');
        setMemPhone('');
        setMemUpazila('');
        loadDashboardData();
      } else {
        setMemberError(res.message || 'সদস্য তৈরি করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setMemberError(err.message || 'সদস্য তৈরি করা যায়নি।');
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleCopyPassword = () => {
    if (!revealedCreds) return;
    const textToCopy = `রক্তদান বাংলাদেশ - সদস্য লগইন তথ্য:\nনাম: ${revealedCreds.name}\nমোবাইল: ${revealedCreds.phone}\nসাময়িক পাসওয়ার্ড: ${revealedCreds.temporaryPassword}\n\nপ্রথমবার লগইন করে আপনার নতুন পাসওয়ার্ড পরিবর্তন করে নিন।`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateContactRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handlingReq) return;

    setSubmittingHandling(true);
    try {
      const res = await api.updateContactRequestStatus(handlingReq._id, {
        status: reqStatus,
        moderatorNotes
      });

      if (res.success) {
        setHandlingReq(null);
        setModeratorNotes('');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingHandling(false);
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
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-mainText text-lg">অনুমতি সীমাবদ্ধ</h3>
        <p className="text-xs text-subText">{errorMsg}</p>
      </div>
    );
  }

  const { institution, stats, donors } = data || {};

  // Group counts calculation
  const groupCounts: Record<string, number> = {};
  BLOOD_GROUPS.forEach(bg => { groupCounts[bg] = 0; });
  if (donors) {
    donors.forEach((d: any) => {
      if (groupCounts[d.bloodGroup] !== undefined) {
        groupCounts[d.bloodGroup]++;
      }
    });
  }

  return (
    <div className="min-h-screen bg-page pb-12">
      {/* Top Header / Breadcrumb Bar */}
      <div className="bg-surface border-b border-appBorder px-4 sm:px-6 lg:px-8 py-4 shadow-soft">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Breadcrumb items={[{ label: 'প্রতিষ্ঠান মডারেটর ড্যাশবোর্ড' }]} />
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-mainText tracking-tight">
                {institution?.nameBn || 'শিক্ষাপ্রতিষ্ঠান'} রক্তদান কার্যক্রম
              </h1>
              <Badge variant="teal" size="sm">ক্যাম্পাস মডারেটর</Badge>
            </div>
            <p className="text-xs text-subText mt-0.5">
              {institution?.name} • কোড: <span className="font-mono font-bold text-mainText">{institution?.code}</span> • দায়িত্বপ্রাপ্ত: {user?.name}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              isLoading={loading}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              হালনাগাদ
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowCreateModal(true);
                setMemberError(null);
              }}
              icon={<UserPlus className="w-4 h-4" />}
              className="bg-teal-700 hover:bg-teal-800"
            >
              নতুন সদস্য যোগ করুন
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* 4 Summary StatsCards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            title="মোট নিবন্ধিত সদস্য"
            value={donors?.length || stats?.totalDonors || 0}
            subtitle="ক্যাম্পাস রক্তদাতা পুল"
            icon={<Users className="w-5 h-5" />}
            iconColor="teal"
            onClick={() => setActiveTab('roster')}
          />
          <StatsCard
            title="রক্তদানে প্রস্তুত"
            value={stats?.availableDonors || 0}
            subtitle="বর্তমানে সক্রিয় দাতা"
            icon={<Droplet className="w-5 h-5" />}
            iconColor="emerald"
          />
          <StatsCard
            title="যোগাযোগের অনুরোধ"
            value={contactRequests.length}
            subtitle="অনুমোদনের অপেক্ষায়"
            icon={<HeartHandshake className="w-5 h-5" />}
            iconColor="primary"
            onClick={() => setActiveTab('contact_requests')}
          />
          <StatsCard
            title="মডারেটর অ্যাক্টিভিটি"
            value={activities.length}
            subtitle="সংরক্ষিত কার্যক্রম হিস্ট্রি"
            icon={<Activity className="w-5 h-5" />}
            iconColor="purple"
            onClick={() => setActiveTab('activities')}
          />
        </div>

        {/* Scoped Profile Search (PART 04) */}
        <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 space-y-4">
          <div>
            <h2 className="text-sm font-black text-mainText flex items-center gap-2">
              <Search className="w-4 h-4 text-teal-700" />
              <span>প্রতিষ্ঠান স্কোপড প্রোফাইল অনুসন্ধান (Scoped User Search)</span>
            </h2>
            <p className="text-xs text-subText mt-0.5">
              আইডি, ফোন নম্বর বা নাম দিয়ে আপনার প্রতিষ্ঠানের আওতাভুক্ত যে কোনো সদস্য অনুসন্ধান করুন
            </p>
          </div>

          <form onSubmit={handleScopedSearch} className="flex gap-2">
            <input
              type="text"
              required
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="মোবাইল নম্বর / আইডি / নাম লিখুন..."
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

          {searchResult && (
            <div className="mt-3">
              {searchResult.isOutOfScope ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800">অধিকারবর্হিভূত প্রোফাইল</h4>
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

        {/* Blood Group Distribution Grid */}
        <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-mainText flex items-center gap-2">
              <Droplet className="w-4 h-4 text-primary" />
              <span>প্রতিষ্ঠান রক্তদাতাদের গ্রুপভিত্তিক বিন্যাস:</span>
            </span>
            <span className="text-[11px] text-subText font-medium">রিয়েল-টাইম তথ্য</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {BLOOD_GROUPS.map(bg => (
              <div key={bg} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-xs font-extrabold text-primary block">{bg}</span>
                <span className="text-lg font-black text-mainText block mt-0.5">{groupCounts[bg] || 0}</span>
                <span className="text-[10px] text-subText font-medium">জন</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-appBorder gap-2 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'roster' ? 'border-teal-700 text-teal-800' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>অধিভুক্ত সদস্য ও রক্তদাতা ({donors?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('contact_requests')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'contact_requests' ? 'border-teal-700 text-teal-800' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>যোগাযোগের অনুরোধসমূহ ({contactRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'activities' ? 'border-teal-700 text-teal-800' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>মডারেশন ইতিহাস ({activities.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('phone_requests')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'phone_requests' ? 'border-teal-700 text-teal-800' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>নম্বর পরিবর্তন ({phoneChangeRequests.filter(r => r.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('password_recovery')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'password_recovery' ? 'border-teal-700 text-teal-800' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>পাসওয়ার্ড রিকভারি ({recoveryRequests.filter(r => r.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('institution_changes')}
            className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'institution_changes' ? 'border-teal-700 text-teal-800' : 'border-transparent text-subText hover:text-mainText'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>ক্যাম্পাস পরিবর্তন ({instChanges.filter(r => r.status === 'pending').length})</span>
          </button>
        </div>

        {/* TAB 1: MEMBER ROSTER */}
        {activeTab === 'roster' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-appBorder">
              <div>
                <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                  <Users className="w-5 h-5 text-tealAccent" />
                  <span>অধিভুক্ত রক্তদাতাদের তালিকা (যাচাইকৃত শিক্ষার্থী ও সদস্য)</span>
                </h3>
                <p className="text-xs text-subText mt-0.5">রক্তদাতার গোপনীয়তা সুরক্ষিত অবস্থায় সংরক্ষিত</p>
              </div>
              <Badge variant="teal">মোট: {donors?.length || 0} জন</Badge>
            </div>

            {(!donors || donors.length === 0) ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                এখনো কোনো সদস্য বা রক্তদাতা যুক্ত হননি। "নতুন সদস্য যোগ করুন" বাটনে ক্লিক করে যোগ করতে পারেন।
              </div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">সদস্যের নাম</th>
                      <th className="py-3 px-4">রক্তের গ্রুপ</th>
                      <th className="py-3 px-4">উপলব্ধতা</th>
                      <th className="py-3 px-4">মোট রক্তদান</th>
                      <th className="py-3 px-4">যোগাযোগ সম্মতি</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donors.map((d: any) => (
                      <tr key={d._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-bold text-mainText">{d.displayName}</div>
                          <div className="text-[10px] text-subText capitalize">{d.gender || 'unspecified'}</div>
                        </td>
                        <td className="py-3 px-4 font-black text-primary text-sm">{d.bloodGroup}</td>
                        <td className="py-3 px-4">
                          <Badge variant={d.availabilityStatus === 'available' ? 'success' : 'neutral'} dot size="sm">
                            {d.availabilityStatus === 'available' ? 'প্রস্তুত' : 'বিরতি'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">{d.totalDonations || 0} বার</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            d.consentToShareContact ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {d.consentToShareContact ? 'উন্মুক্ত অনুমতি' : 'সুরক্ষিত/ব্যক্তিগত'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-teal-700 font-semibold flex items-center gap-1">
                          <UserCheck className="w-4 h-4 text-teal-600" />
                          <span>প্রত্যয়িত সদস্য</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONTACT REQUESTS */}
        {activeTab === 'contact_requests' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-appBorder">
              <div>
                <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-primary" />
                  <span>রক্তপ্রত্যাশীদের প্রাতিষ্ঠানিক যোগাযোগের অনুরোধসমূহ</span>
                </h3>
                <p className="text-xs text-subText mt-0.5">মডারেটরের মাধ্যমে ক্যাম্পাসের রক্তদাতাদের সাথে সমন্বয় করুন</p>
              </div>
              <Badge variant="primary">{contactRequests.length} টি অনুরোধ</Badge>
            </div>

            {contactRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">কোনো যোগাযোগের অনুরোধ জমা নেই।</div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">অনুরোধকারী</th>
                      <th className="py-3 px-4">জরুরিতা</th>
                      <th className="py-3 px-4">রোগী ও প্রয়োজনীয়তা</th>
                      <th className="py-3 px-4">অবস্থা</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contactRequests.map(req => (
                      <tr key={req._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-bold text-mainText">{req.requesterName}</div>
                          <div className="font-mono text-[10px] text-subText">{req.requesterPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={req.urgency === 'emergency' ? 'danger' : 'warning'} size="sm">
                            {req.urgency}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-primary">{req.targetBloodGroup} রক্ত প্রয়োজন</div>
                          <div className="text-slate-600 text-[11px] max-w-xs">{req.patientName ? `${req.patientName} (${req.hospitalName})` : req.reason}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={req.status === 'fulfilled' ? 'success' : req.status === 'cancelled' ? 'neutral' : 'warning'} size="sm">
                            {req.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setHandlingReq(req);
                              setReqStatus(req.status as any || 'in_progress');
                              setModeratorNotes(req.moderatorNotes || '');
                            }}
                            className="bg-teal-700 hover:bg-teal-800"
                          >
                            সমন্বয় করুন
                          </Button>
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
                <span>মডারেটর কার্যকলাপ ও অডিট ইতিহাস</span>
              </h3>
              <p className="text-xs text-subText mt-0.5">আপনার অ্যাকাউন্ট থেকে সম্পন্ন হওয়া সকল প্রশাসনিক কাজের রেকর্ড</p>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">কোনো কার্যক্রমের রেকর্ড নেই।</div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">কার্যকলাপ</th>
                      <th className="py-3 px-4">বিবরণ / কারণ</th>
                      <th className="py-3 px-4">সময়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activities.map(act => (
                      <tr key={act._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-teal-800">{act.action}</td>
                        <td className="py-3 px-4 text-slate-700 max-w-sm">{act.reason || 'নিয়মিত মডারেশন'}</td>
                        <td className="py-3 px-4 text-subText">{new Date(act.createdAt).toLocaleString('bn-BD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PHONE CHANGE REQUESTS */}
        {activeTab === 'phone_requests' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-appBorder">
              <div>
                <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                  <Phone className="w-5 h-5 text-teal-700" />
                  <span>ক্যাম্পাস সদস্যদের নম্বর পরিবর্তনের আবেদন</span>
                </h3>
                <p className="text-xs text-subText mt-0.5">আপনার শিক্ষা প্রতিষ্ঠানের অন্তর্ভুক্ত রক্তদাতা ও শিক্ষার্থীদের ফোন নম্বর পরিবর্তন যাচাই</p>
              </div>
              <Badge variant="teal">মোট: {phoneChangeRequests.length} টি</Badge>
            </div>

            {phoneChangeRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                কোনো নম্বর পরিবর্তনের আবেদন অপেক্ষমাণ নেই।
              </div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">সদস্যের নাম</th>
                      <th className="py-3 px-4">পদবি</th>
                      <th className="py-3 px-4">বর্তমান নম্বর</th>
                      <th className="py-3 px-4">অনুরোধকৃত নতুন নম্বর</th>
                      <th className="py-3 px-4">পরিবর্তনের কারণ</th>
                      <th className="py-3 px-4">আবেদনের তারিখ</th>
                      <th className="py-3 px-4">অবস্থা</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {phoneChangeRequests.map(r => (
                      <tr key={r._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-mainText">{r.userName}</td>
                        <td className="py-3 px-4">
                          <Badge variant="neutral" size="sm">{r.userRole}</Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 line-through">{r.currentPhone}</td>
                        <td className="py-3 px-4 font-mono font-bold text-teal-800">{r.newPhone}</td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs">{r.reason}</td>
                        <td className="py-3 px-4 text-subText">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('bn-BD') : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'} 
                            size="sm"
                          >
                            {r.status === 'approved' ? 'অনুমোদিত' : r.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.status === 'pending' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-teal-700 hover:bg-teal-800"
                              onClick={() => {
                                setReviewingPhoneReq(r);
                                setPhoneReviewStatus('approved');
                                setPhoneReviewNotes('');
                              }}
                            >
                              পর্যালোচনা
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400">পর্যালোচিত</span>
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

        {/* TAB 5: PASSWORD RECOVERY */}
        {activeTab === 'password_recovery' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-appBorder">
              <div>
                <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                  <span>ক্যাম্পাস সদস্যদের পাসওয়ার্ড রিকভারি আবেদন</span>
                </h3>
                <p className="text-xs text-subText mt-0.5">আপনার প্রতিষ্ঠানের যেসব সদস্য লগইন সমস্যায় পড়েছেন তাদের এককালীন অস্থায়ী পাসওয়ার্ড প্রদান</p>
              </div>
              <Badge variant="warning">মোট: {recoveryRequests.length} টি আবেদন</Badge>
            </div>

            {recoveryRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                কোনো পাসওয়ার্ড রিকভারি আবেদন অপেক্ষমাণ নেই।
              </div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">সদস্যের নাম</th>
                      <th className="py-3 px-4">মোবাইল নম্বর</th>
                      <th className="py-3 px-4">রিকভারির কারণ</th>
                      <th className="py-3 px-4">আবেদনের তারিখ</th>
                      <th className="py-3 px-4">অবস্থা</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recoveryRequests.map((r: any) => (
                      <tr key={r._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-bold text-mainText">{r.userName}</div>
                          <div className="text-[10px] text-subText">{r.userRole}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">{r.userPhone}</td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs">{r.reason}</td>
                        <td className="py-3 px-4 text-subText">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString('bn-BD') : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'} 
                            size="sm"
                          >
                            {r.status === 'approved' ? 'অনুমোদিত' : r.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {r.status === 'pending' ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setApprovingRecovery(r);
                                  setRecoveryApproveNotes('ক্যাম্পাস সদস্যের পরিচয় নিশ্চিত হয়ে অনুমোদিত');
                                }}
                                className="bg-amber-600 hover:bg-amber-700"
                              >
                                অনুমোদন ও পাসওয়ার্ড
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setRejectingRecovery(r);
                                  setRecoveryRejectReason('');
                                }}
                              >
                                বাতিল
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400">নিষ্পন্ন</span>
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

        {/* TAB 6: INSTITUTION CHANGES */}
        {activeTab === 'institution_changes' && (
          <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-appBorder">
              <div>
                <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-teal-700" />
                  <span>ক্যাম্পাস ও প্রতিষ্ঠান পরিবর্তন আবেদন</span>
                </h3>
                <p className="text-xs text-subText mt-0.5">আপনার শিক্ষা প্রতিষ্ঠানে যুক্ত হওয়ার বা স্থানান্তরিত হওয়ার আবেদন পর্যালোচনা</p>
              </div>
              <Badge variant="teal">মোট: {instChanges.length} টি আবেদন</Badge>
            </div>

            {instChanges.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                কোনো ক্যাম্পাস পরিবর্তন আবেদন অপেক্ষমাণ নেই।
              </div>
            ) : (
              <div className="overflow-x-auto border border-appBorder rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">সদস্যের নাম</th>
                      <th className="py-3 px-4">মোবাইল নম্বর</th>
                      <th className="py-3 px-4">বর্তমান প্রতিষ্ঠান</th>
                      <th className="py-3 px-4">অনুরোধকৃত নতুন প্রতিষ্ঠান</th>
                      <th className="py-3 px-4">আইডি / বিভাগ</th>
                      <th className="py-3 px-4">অবস্থা</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {instChanges.map((c: any) => (
                      <tr key={c._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-mainText">{c.userName}</td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">{c.phone || c.userPhone}</td>
                        <td className="py-3 px-4 text-slate-500">{c.currentInstitutionName || 'অনির্দিষ্ট'}</td>
                        <td className="py-3 px-4 font-bold text-teal-700">{c.targetInstitutionName}</td>
                        <td className="py-3 px-4 text-[11px] text-subText">
                          {c.studentOrStaffId ? `ID: ${c.studentOrStaffId}` : ''} {c.department ? `(${c.department})` : ''}
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={c.status === 'approved' ? 'success' : c.status === 'rejected' ? 'danger' : 'warning'} 
                            size="sm"
                          >
                            {c.status === 'approved' ? 'অনুমোদিত' : c.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {c.status === 'pending' ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setReviewingChangeReq(c);
                                  setChangeDecision('approved');
                                  setChangeReviewNotes('ক্যাম্পাস স্থানান্তর যাচাইপূর্বক অনুমোদন প্রদান করা হলো।');
                                }}
                                className="bg-teal-700 hover:bg-teal-800"
                              >
                                অনুমোদন
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setReviewingChangeReq(c);
                                  setChangeDecision('rejected');
                                  setChangeReviewNotes('তথ্য সন্তোষজনক না হওয়ায় বাতিল করা হলো।');
                                }}
                              >
                                বাতিল
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400">নিষ্পন্ন</span>
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

      </div>

      {/* Manual Member Creation Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="প্রতিষ্ঠানের নতুন সদস্য নিবন্ধন"
          description={`প্রতিষ্ঠান: ${institution?.nameBn}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>বাতিল</Button>
              <Button 
                variant="primary" 
                size="sm" 
                isLoading={submittingMember} 
                onClick={handleCreateMember}
                className="bg-teal-700 hover:bg-teal-800"
              >
                সদস্য তৈরি করুন
              </Button>
            </>
          }
        >
          {memberError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{memberError}</span>
            </div>
          )}

          <form onSubmit={handleCreateMember} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">শিক্ষার্থী / সদস্যের নাম <span className="text-primary">*</span></label>
              <input
                type="text"
                required
                value={memName}
                onChange={e => setMemName(e.target.value)}
                placeholder="যেমন: রাফিদ হাসান"
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">মোবাইল নম্বর <span className="text-primary">*</span></label>
              <input
                type="tel"
                required
                value={memPhone}
                onChange={e => setMemPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs font-mono focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-mainText mb-1">রক্তের গ্রুপ <span className="text-primary">*</span></label>
                <select
                  value={memBloodGroup}
                  onChange={e => setMemBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs font-bold text-primary"
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1">লিঙ্গ</label>
                <select
                  value={memGender}
                  onChange={e => setMemGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs"
                >
                  <option value="male">পুরুষ</option>
                  <option value="female">নারী</option>
                  <option value="unspecified">অন্যান্য</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>এককালীন সাময়িক পাসওয়ার্ড সুরক্ষা:</span>
              </p>
              <p>সদস্য তৈরির পর একটি সাময়িক পাসওয়ার্ড প্রদর্শিত হবে যা শিক্ষার্থীকে প্রদান করতে হবে। প্রথম লগইনে পাসওয়ার্ড পরিবর্তন বাধ্যতামূলক।</p>
            </div>
          </form>
        </Modal>
      )}

      {/* Temporary Password Reveal Modal */}
      {revealedCreds && (
        <Modal
          isOpen={Boolean(revealedCreds)}
          onClose={() => setRevealedCreds(null)}
          title="সদস্য সফলভাবে তৈরি হয়েছে!"
          description="লগইন তথ্য এখনই কপি করে সদস্যকে প্রদান করুন"
          footer={<Button variant="primary" size="sm" onClick={() => setRevealedCreds(null)}>সম্পন্ন</Button>}
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs text-emerald-800 font-semibold">সদস্যের সাময়িক এককালীন পাসওয়ার্ড তৈরি হয়েছে</p>
              
              <div className="p-3 bg-white rounded-xl border border-emerald-300 font-mono text-xl font-bold text-slate-800 tracking-wider">
                {revealedCreds.temporaryPassword}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPassword}
                icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                className="text-xs font-bold"
              >
                {copied ? 'কপি করা হয়েছে!' : 'লগইন তথ্য কপি করুন'}
              </Button>
            </div>

            <div className="text-xs text-subText space-y-1">
              <p>👤 <strong>নাম:</strong> {revealedCreds.name}</p>
              <p>📱 <strong>মোবাইল:</strong> <span className="font-mono">{revealedCreds.phone}</span></p>
              <p className="text-rose-600 font-semibold pt-1">⚠️ {revealedCreds.warning}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Handling Contact Request Modal */}
      {handlingReq && (
        <Modal
          isOpen={Boolean(handlingReq)}
          onClose={() => setHandlingReq(null)}
          title="যোগাযোগের অনুরোধ সমন্বয়"
          description={`রোগী: ${handlingReq.patientName || handlingReq.reason || 'জরুরি রক্ত প্রয়োজন'}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setHandlingReq(null)}>বাতিল</Button>
              <Button 
                variant="primary" 
                size="sm" 
                isLoading={submittingHandling} 
                onClick={handleUpdateContactRequest}
                className="bg-teal-700 hover:bg-teal-800"
              >
                সংরক্ষণ করুন
              </Button>
            </>
          }
        >
          <form onSubmit={handleUpdateContactRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">অবস্থা হালনাগাদ</label>
              <select
                value={reqStatus}
                onChange={e => setReqStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs font-semibold"
              >
                <option value="in_progress">প্রক্রিয়াধীন (In Progress)</option>
                <option value="fulfilled">সম্পন্ন / রক্তদাতা পাওয়া গেছে (Fulfilled)</option>
                <option value="cancelled">বাতিলকৃত (Cancelled)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">মডারেটর মন্তব্য ও পদক্ষেপ</label>
              <textarea
                rows={3}
                value={moderatorNotes}
                onChange={e => setModeratorNotes(e.target.value)}
                placeholder="যেমন: ক্যাম্পাসের অমুক হলের রক্তদাতার সাথে যোগাযোগ করিয়ে দেওয়া হয়েছে..."
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs focus:border-primary"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Phone Change Review Modal */}
      {reviewingPhoneReq && (
        <Modal
          isOpen={Boolean(reviewingPhoneReq)}
          onClose={() => setReviewingPhoneReq(null)}
          title="নম্বর পরিবর্তনের আবেদন পর্যালোচনা"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setReviewingPhoneReq(null)}>বাতিল</Button>
              <Button
                variant={phoneReviewStatus === 'approved' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleReviewPhoneRequest}
                isLoading={submittingPhoneReview}
                className={phoneReviewStatus === 'approved' ? 'bg-teal-700 hover:bg-teal-800' : ''}
              >
                {phoneReviewStatus === 'approved' ? 'অনুমোদন নিশ্চিত করুন' : 'প্রত্যাখ্যান করুন'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-appBorder space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-mainText">{reviewingPhoneReq.userName}</span>
                <Badge variant="neutral" size="sm">{reviewingPhoneReq.userRole}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-subText block">বর্তমান নম্বর:</span>
                  <span className="font-mono line-through text-slate-500">{reviewingPhoneReq.currentPhone}</span>
                </div>
                <div>
                  <span className="text-subText block">অনুরোধকৃত নতুন নম্বর:</span>
                  <span className="font-mono font-bold text-emerald-700">{reviewingPhoneReq.newPhone}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-subText block text-[10px] uppercase font-bold">নম্বর পরিবর্তনের কারণ:</span>
                <p className="font-medium text-slate-800 mt-0.5">{reviewingPhoneReq.reason}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">পর্যালোচনা সিদ্ধান্ত</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPhoneReviewStatus('approved')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    phoneReviewStatus === 'approved'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>অনুমোদন করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneReviewStatus('rejected')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    phoneReviewStatus === 'rejected'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>প্রত্যাখ্যান করুন</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                মডারেটরের মন্তব্য (ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                value={phoneReviewNotes}
                onChange={e => setPhoneReviewNotes(e.target.value)}
                placeholder="যেমন: শিক্ষার্থীর পরিচয় যাচাই করে নতুন নম্বরটি অনুমোদন দেওয়া হলো..."
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs focus:border-primary"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Approve Recovery */}
      {approvingRecovery && (
        <Modal
          isOpen={!!approvingRecovery}
          onClose={() => setApprovingRecovery(null)}
          title="পাসওয়ার্ড রিকভারি অনুমোদন"
          description={`ব্যবহারকারী ${approvingRecovery.userName} (${approvingRecovery.userPhone})-কে এককালীন পাসওয়ার্ড প্রদান করা হবে।`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setApprovingRecovery(null)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingRecoveryApprove}
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
              <strong>আইনি নোটিশ:</strong> আবেদনকারীর সঠিক পরিচয় নিশ্চিত করার পরেই কেবল অনুমোদন করুন। এই পাসওয়ার্ড দিয়ে তিনি কেবল একবার লগইন করতে পারবেন।
            </div>
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">অনুমোদনের নোট (ঐচ্ছিক)</label>
              <textarea
                rows={2}
                value={recoveryApproveNotes}
                onChange={e => setRecoveryApproveNotes(e.target.value)}
                placeholder="সরাসরি কথা বলে পরিচয় নিশ্চিত করা হয়েছে..."
                className="w-full px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Reveal Temporary Password */}
      {revealedRecoveryCreds && (
        <Modal
          isOpen={!!revealedRecoveryCreds}
          onClose={() => setRevealedRecoveryCreds(null)}
          title="এককালীন অস্থায়ী পাসওয়ার্ড প্রস্তুত"
          footer={
            <Button variant="primary" size="sm" onClick={() => setRevealedRecoveryCreds(null)}>
              ঠিক আছে
            </Button>
          }
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-mainText text-sm">
              ব্যবহারকারীর ফোন: <span className="font-mono">{revealedRecoveryCreds.phone}</span>
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

      {/* Modal: Reject Recovery */}
      {rejectingRecovery && (
        <Modal
          isOpen={!!rejectingRecovery}
          onClose={() => setRejectingRecovery(null)}
          title="পাসওয়ার্ড রিকভারি আবেদন বাতিল"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setRejectingRecovery(null)}>
                পিছনে যান
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingRecoveryReject}
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
              value={recoveryRejectReason}
              onChange={e => setRecoveryRejectReason(e.target.value)}
              placeholder="আবেদনকারীর পরিচয় যাচাই করা সম্ভব হয়নি..."
              className="w-full px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
            />
          </div>
        </Modal>
      )}

      {/* Modal: Review Institution Change */}
      {reviewingChangeReq && (
        <Modal
          isOpen={!!reviewingChangeReq}
          onClose={() => setReviewingChangeReq(null)}
          title={`প্রতিষ্ঠান পরিবর্তন আবেদন ${changeDecision === 'approved' ? 'অনুমোদন' : 'বাতিল'}`}
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
          <div className="space-y-3 text-xs">
            <p className="text-subText">
              আবেদনকারী: <strong>{reviewingChangeReq.userName}</strong> ({reviewingChangeReq.userPhone})
            </p>
            <p className="text-subText">
              অনুরোধকৃত প্রতিষ্ঠান: <strong>{reviewingChangeReq.targetInstitutionName}</strong>
            </p>
            <label className="block text-xs font-bold text-mainText">প্রশাসনিক মন্তব্য / নোট</label>
            <textarea
              rows={3}
              value={changeReviewNotes}
              onChange={e => setChangeReviewNotes(e.target.value)}
              placeholder="আবেদনটি পর্যবেক্ষণপূর্বক সিদ্ধান্ত গ্রহণ করা হলো..."
              className="w-full px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
