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
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { RequestCard } from '../components/RequestCard';
import { BloodRequest, NotificationItem } from '../types';

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
        // Load matching blood requests
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

        // Load notifications
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
        setMsg({ text: 'রক্তদানের তথ্য সফলভাবে লিপিবদ্ধ করা হয়েছে! আপনাকে আন্তরিক ধন্যবাদ।', type: 'success' });
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
        setMsg({ text: 'প্রোফাইলের সেটিংস সংরক্ষিত হয়েছে।', type: 'success' });
        await refreshUser();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-red-600 to-primary text-white rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold inline-block">
            স্বেচ্ছায় রক্তদাতা ড্যাশবোর্ড
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            স্বাগতম, {user?.name || 'রক্তদাতা'}!
          </h1>
          <p className="text-xs sm:text-sm text-red-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{donorProfile?.upazila ? `${donorProfile.upazila}, ` : ''}{donorProfile?.district}, {donorProfile?.division}</span>
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="w-14 h-14 rounded-xl bg-white text-primary flex items-center justify-center font-black text-2xl shadow">
            {donorProfile?.bloodGroup || 'A+'}
          </div>
          <div>
            <span className="text-xs text-red-200 block">মোট রক্তদান:</span>
            <span className="text-2xl font-bold">{donorProfile?.totalDonations || 0} বার</span>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-green-50 text-appSuccess border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Grid: Controls & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Col 1 & 2: Status & Matching Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions: Availability & Record Donation */}
          <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
            <h2 className="text-base font-bold text-mainText flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>রক্তদানের বর্তমান অবস্থা ও অ্যাকশন</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleStatusChange('available')}
                disabled={loadingAction}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  availabilityStatus === 'available'
                    ? 'border-appSuccess bg-green-50 shadow-sm'
                    : 'border-appBorder hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-appSuccess"></span>
                  <span className="text-sm font-bold text-mainText">রক্তদানে প্রস্তুত</span>
                </div>
                <p className="text-[11px] text-subText mt-1">জরুরি প্রয়োজনে রোগীরা আপনাকে খুঁজে পাবেন।</p>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('recently_donated')}
                disabled={loadingAction}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  availabilityStatus === 'recently_donated'
                    ? 'border-amber-500 bg-amber-50 shadow-sm'
                    : 'border-appBorder hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-sm font-bold text-mainText">সম্প্রতি রক্তদান করেছি</span>
                </div>
                <p className="text-[11px] text-subText mt-1">সুস্থতার জন্য ৩-৪ মাসের বিশ্রাম সময়কাল।</p>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('temporarily_unavailable')}
                disabled={loadingAction}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  availabilityStatus === 'temporarily_unavailable'
                    ? 'border-gray-500 bg-gray-100 shadow-sm'
                    : 'border-appBorder hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                  <span className="text-sm font-bold text-mainText">সাময়িক বিরতিতে</span>
                </div>
                <p className="text-[11px] text-subText mt-1">অসুস্থতা বা ব্যস্ততার কারণে রক্তদানে অপারগ।</p>
              </button>
            </div>

            {/* Record Voluntary Donation Action */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-mainText">আজকে কি রক্তদান সম্পন্ন করেছেন?</p>
                <p className="text-[11px] text-subText">আপনার মানবিক অবদানের রেকর্ড যোগ করুন</p>
              </div>
              <button
                type="button"
                onClick={handleRecordDonation}
                disabled={loadingAction}
                className="px-4 py-2 bg-appSuccess hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>রক্তদান লিপিবদ্ধ করুন</span>
              </button>
            </div>
          </div>

          {/* Matching Blood Requests in Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-mainText flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-primary" />
                <span>আপনার গ্রুপের জরুরি অনুরোধ ({donorProfile?.bloodGroup})</span>
              </h2>
            </div>

            {matchingRequests.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-appBorder p-8 text-center text-subText">
                <CheckCircle2 className="w-8 h-8 text-appSuccess mx-auto mb-2" />
                <p className="text-xs font-medium">আপনার এলাকায় এই মুহূর্তে রক্তের কোনো জরুরি অনুরোধ নেই।</p>
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

        {/* Col 3: Profile Settings & Notifications */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-5 space-y-3">
            <h3 className="font-bold text-mainText text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span>বিজ্ঞপ্তি ও যোগাযোগ সতর্কতা</span>
            </h3>

            {notifications.length === 0 ? (
              <p className="text-xs text-subText py-4 text-center">কোনো নতুন বিজ্ঞপ্তি নেই</p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n._id} className="p-2.5 bg-page rounded-xl border border-appBorder text-xs space-y-1">
                    <p className="font-semibold text-mainText">{n.title}</p>
                    <p className="text-subText text-[11px]">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile & Privacy Settings */}
          <form onSubmit={handleSaveProfile} className="bg-surface rounded-2xl border border-appBorder shadow-card p-5 space-y-4">
            <h3 className="font-bold text-mainText text-sm flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-primary" />
              <span>প্রোফাইল ও গোপনীয়তা সেটিংস</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-mainText mb-1">
                সংক্ষিপ্ত পরিচিতি / বায়ো
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="নিজের সম্পর্কে সংক্ষেপে লিখুন..."
                className="w-full px-3 py-2 bg-page border border-appBorder rounded-lg text-xs text-mainText focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-mainText cursor-pointer">
                <input
                  type="checkbox"
                  checked={emergencyAvailable}
                  onChange={e => setEmergencyAvailable(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>জরুরি অবস্থায় দ্রুত সাড়া দিতে সম্মত</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-mainText cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentToShareContact}
                  onChange={e => setConsentToShareContact(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>অনুমোদিত অনুরোধে যোগাযোগের নম্বর দৃশ্যমান রাখা</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loadingAction}
              className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>সেটিংস সংরক্ষণ করুন</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

