import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Bell, 
  Edit3, 
  Save, 
  AlertCircle,
  Plus,
  Droplet,
  User,
  Phone,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { RequestCard } from '../components/RequestCard';
import { BloodRequest, NotificationItem } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/ui/StatsCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export const DonorDashboard: React.FC = () => {
  const { user, donorProfile, refreshUser } = useAuth();

  const [availabilityStatus, setAvailabilityStatus] = useState<string>(
    donorProfile?.availabilityStatus || 'available'
  );
  const [bio, setBio] = useState(donorProfile?.bio || '');
  const [emergencyAvailable, setEmergencyAvailable] = useState(donorProfile?.emergencyAvailable !== false);
  const [consentToShareContact, setConsentToShareContact] = useState(donorProfile?.consentToShareContact !== false);

  const [matchingRequests, setMatchingRequests] = useState<BloodRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (donorProfile) {
      setAvailabilityStatus(donorProfile.availabilityStatus);
      setBio(donorProfile.bio || '');
      setEmergencyAvailable(donorProfile.emergencyAvailable !== false);
      setConsentToShareContact(donorProfile.consentToShareContact !== false);
    }
  }, [donorProfile]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        if (donorProfile) {
          const reqRes = await api.searchRequests({
            bloodGroup: donorProfile.bloodGroup,
            division: donorProfile.division,
            limit: 4
          });
          if (reqRes.success && reqRes.requests) {
            setMatchingRequests(reqRes.requests);
          }
        }

        const notifRes = await api.getNotifications();
        if (notifRes.success && notifRes.notifications) {
          setNotifications(notifRes.notifications);
        }
      } catch (err) {
        console.error('Failed to load donor dashboard data:', err);
      }
    }

    loadDashboardData();
  }, [donorProfile]);

  const handleStatusChange = async (newStatus: string) => {
    setLoadingAction(true);
    setMsg(null);
    try {
      const res = await api.updateMyDonorProfile({ availabilityStatus: newStatus });
      if (res.success) {
        setAvailabilityStatus(newStatus);
        setMsg({ text: 'আপনার রক্তদানের অবস্থা সফলভাবে হালনাগাদ হয়েছে।', type: 'success' });
        await refreshUser();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'হালনাগাদ ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRecordDonation = async () => {
    setLoadingAction(true);
    setMsg(null);
    try {
      const res = await api.recordDonation();
      if (res.success) {
        setMsg({ text: 'রক্তদানের তথ্য সফলভাবে লিপিবদ্ধ করা হয়েছে! আপনার এই মানবিক অবদানকে স্যালুট।', type: 'success' });
        await refreshUser();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setMsg(null);
    try {
      const res = await api.updateMyDonorProfile({
        bio,
        emergencyAvailable,
        consentToShareContact
      });
      if (res.success) {
        setMsg({ text: 'প্রোফাইলের সেটিংস সফলভাবে সংরক্ষিত হয়েছে।', type: 'success' });
        await refreshUser();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setLoadingAction(false);
    }
  };

  // Calculate profile completion percentage
  let profileCompletion = 70;
  if (bio && bio.length > 5) profileCompletion += 15;
  if (donorProfile?.district) profileCompletion += 15;

  return (
    <div className="min-h-screen bg-page pb-12">
      {/* Top Header / Breadcrumb */}
      <div className="bg-surface border-b border-appBorder px-4 sm:px-6 lg:px-8 py-3.5 shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Breadcrumb items={[{ label: 'রক্তদাতা প্রোফাইল ও ড্যাশবোর্ড' }]} />
          <Badge variant="success" size="sm" dot>স্বেচ্ছাসেবী রক্তদাতা</Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Personalized Welcome Banner */}
        <div className="bg-gradient-to-r from-red-700 via-primary to-rose-700 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-rose-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>স্বেচ্ছাসেবী মানবিক সেবক</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              স্বাগতম, {user?.name || 'সম্মানিত রক্তদাতা'}!
            </h1>
            <p className="text-xs sm:text-sm text-red-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>
                {donorProfile?.upazila ? `${donorProfile.upazila}, ` : ''}{donorProfile?.district || 'ঢাকা'}, {donorProfile?.division || 'ঢাকা'}
              </span>
            </p>
          </div>

          {/* Blood Group Emblem Card */}
          <div className="flex items-center gap-4 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/25 shadow-soft relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white text-primary flex items-center justify-center font-black text-2xl sm:text-3xl shadow-soft">
              {donorProfile?.bloodGroup || 'O+'}
            </div>
            <div>
              <span className="text-xs text-rose-100 block font-medium">রক্তদানের ইতিহাস:</span>
              <span className="text-2xl font-black text-white">{donorProfile?.totalDonations || 0} বার</span>
              <span className="text-[10px] text-rose-200 block">জীবন বাঁচিয়েছেন</span>
            </div>
          </div>
        </div>

        {/* Status / Error Alert Message */}
        {msg && (
          <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-soft animate-in fade-in duration-150 ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-xs font-bold px-2">✕</button>
          </div>
        )}

        {/* 3 Summary StatsCards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="বর্তমান প্রাপ্যতা"
            value={availabilityStatus === 'available' ? 'প্রস্তুত' : availabilityStatus === 'recently_donated' ? 'বিশ্রামে' : 'বিরতিতে'}
            subtitle="জরুরি প্রয়োজনে রোগীরা আপনাকে খুঁজে পাবেন"
            icon={<Clock className="w-5 h-5" />}
            iconColor={availabilityStatus === 'available' ? 'emerald' : 'amber'}
          />
          <StatsCard
            title="মোট মানবিক রক্তদান"
            value={`${donorProfile?.totalDonations || 0} বার`}
            subtitle={donorProfile?.lastDonationDate ? `সর্বশেষ: ${new Date(donorProfile.lastDonationDate).toLocaleDateString('bn-BD')}` : 'এখনো রক্তদান লিপিবদ্ধ করেননি'}
            icon={<HeartHandshake className="w-5 h-5" />}
            iconColor="primary"
          />
          <StatsCard
            title="প্রোফাইল সম্পূর্ণতা"
            value={`${profileCompletion}%`}
            subtitle="তথ্য যত পূর্ণাঙ্গ, যোগাযোগ তত দ্রুত হবে"
            icon={<User className="w-5 h-5" />}
            iconColor="teal"
          />
        </div>

        {/* Main Grid: Status Control & Matching Requests (Left) vs Settings & Notifications (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Availability Control Card */}
            <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-appBorder">
                <div>
                  <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>রক্তদানের বর্তমান অবস্থা ও নিয়ন্ত্রণ</span>
                  </h3>
                  <p className="text-xs text-subText mt-0.5">আপনার রক্তদানের বর্তমান সক্ষমতা অনুযায়ী স্ট্যাটাস আপডেট রাখুন</p>
                </div>
                <Badge variant={availabilityStatus === 'available' ? 'success' : 'neutral'} dot size="sm">
                  {availabilityStatus === 'available' ? 'সক্রিয় রক্তদাতা' : 'সাময়িক স্থগিত'}
                </Badge>
              </div>

              {/* Status Option Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange('available')}
                  disabled={loadingAction}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    availabilityStatus === 'available'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-soft'
                      : 'border-appBorder hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="text-sm font-bold text-mainText">রক্তদানে প্রস্তুত</span>
                  </div>
                  <p className="text-[11px] text-subText mt-1.5 leading-relaxed">
                    জরুরি প্রয়োজনে রোগীরা আপনাকে খুঁজে পাবেন ও অনুরোধ পাঠাতে পারবেন।
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('recently_donated')}
                  disabled={loadingAction}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    availabilityStatus === 'recently_donated'
                      ? 'border-amber-500 bg-amber-50/60 shadow-soft'
                      : 'border-appBorder hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-sm font-bold text-mainText">সম্প্রতি রক্তদান করেছি</span>
                  </div>
                  <p className="text-[11px] text-subText mt-1.5 leading-relaxed">
                    শারীরিক সুস্থতার জন্য ৩-৪ মাসের বিশ্রাম সময়কাল চলমান রয়েছে।
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('temporarily_unavailable')}
                  disabled={loadingAction}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    availabilityStatus === 'temporarily_unavailable'
                      ? 'border-slate-500 bg-slate-100 shadow-soft'
                      : 'border-appBorder hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                    <span className="text-sm font-bold text-mainText">সাময়িক বিরতিতে</span>
                  </div>
                  <p className="text-[11px] text-subText mt-1.5 leading-relaxed">
                    অসুস্থতা, ভ্রমণ বা ব্যক্তিগত ব্যস্ততার কারণে রক্তদানে অপারগ।
                  </p>
                </button>
              </div>

              {/* Medical Notice */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>চিকিৎসাগত সতর্কতা:</strong> 'রক্তদানে প্রস্তুত' থাকার অর্থ এই নয় যে আপনি তাৎক্ষণিক যেকোনো ক্ষেত্রে চিকিৎসাগতভাবে উপযুক্ত। রক্তদানের পূর্বে রক্তচাপ, হিমোগ্লোবিন এবং চিকিৎসকের সাধারণ স্বাস্থ্য যাচাই নিশ্চিত করা জরুরি।
                </p>
              </div>

              {/* Record Donation Action */}
              <div className="pt-3 border-t border-appBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-mainText">আজকে কি স্বেচ্ছায় রক্তদান সম্পন্ন করেছেন?</p>
                  <p className="text-[11px] text-subText">আপনার রক্তদানের তারিখ ও ইতিহাসের রেকর্ড যুক্ত করুন</p>
                </div>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleRecordDonation}
                  isLoading={loadingAction}
                  icon={<Plus className="w-4 h-4" />}
                >
                  রক্তদান লিপিবদ্ধ করুন
                </Button>
              </div>
            </div>

            {/* Relevant Blood Requests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-primary" />
                    <span>আপনার রক্তের গ্রুপের জরুরি চাহিদা ({donorProfile?.bloodGroup || 'O+'})</span>
                  </h3>
                  <p className="text-xs text-subText mt-0.5">আপনার এলাকার আশেপাশে চলমান রক্তের অনুরোধসমূহ</p>
                </div>
                <Badge variant="primary">ম্যাচিং অনুরোধ: {matchingRequests.length} টি</Badge>
              </div>

              {matchingRequests.length === 0 ? (
                <div className="bg-surface rounded-2xl border border-appBorder p-8 text-center text-subText space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-semibold text-mainText">এই মুহূর্তে আপনার এলাকায় জরুরি কোনো রক্তের অনুরোধ নেই।</p>
                  <p className="text-[11px] text-slate-400">নতুন অনুরোধ এলে নোটিফিকেশনের মাধ্যমে জানানো হবে।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchingRequests.map(req => (
                    <RequestCard key={req._id} request={req} />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (4 cols): Profile & Privacy Settings */}
          <div className="lg:col-span-4 space-y-6">

            {/* Notifications Card */}
            <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 space-y-3">
              <h3 className="font-bold text-mainText text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span>বিজ্ঞপ্তি ও নোটিফিকেশন</span>
                </span>
                <span className="text-[11px] text-subText font-mono font-bold">{notifications.length} টি</span>
              </h3>

              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">নতুন কোনো বিজ্ঞপ্তি নেই</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n._id} className="p-3 bg-slate-50 rounded-xl border border-appBorder text-xs space-y-1">
                      <p className="font-bold text-mainText">{n.title}</p>
                      <p className="text-subText text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile & Privacy Settings Form */}
            <form onSubmit={handleSaveProfile} className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 space-y-4">
              <h3 className="font-bold text-mainText text-sm flex items-center gap-2 pb-2 border-b border-appBorder">
                <Edit3 className="w-4 h-4 text-primary" />
                <span>প্রোফাইল ও গোপনীয়তা সেটিংস</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">
                  সংক্ষিপ্ত বায়ো / রক্তদানের বার্তা
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="যেমন: যেকোনো জরুরি প্রয়োজনে রক্তদানে প্রস্তুত..."
                  className="w-full px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:bg-surface focus:border-primary"
                />
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-2.5 text-xs text-mainText cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emergencyAvailable}
                    onChange={e => setEmergencyAvailable(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="text-slate-700 font-medium">জরুরি পরিস্থিতিতে দ্রুত সাড়া দিতে সম্মত</span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-mainText cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentToShareContact}
                    onChange={e => setConsentToShareContact(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="text-slate-700 font-medium leading-relaxed">
                    অনুমোদিত অনুরোধে যোগাযোগের নম্বর দৃশ্যমান রাখা (অবাঞ্ছিত কল রোধে দৈনিক সীমা নিয়ন্ত্রিত)
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loadingAction}
                icon={<Save className="w-4 h-4" />}
                className="w-full font-bold shadow-soft"
              >
                সেটিংস সংরক্ষণ করুন
              </Button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
