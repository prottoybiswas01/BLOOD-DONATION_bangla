import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Droplet, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Save, 
  KeyRound, 
  ArrowRight,
  Send,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PhoneChangeRequest } from '../types';

export const ProfileSettings: React.FC = () => {
  const { user, donorProfile, refreshUser } = useAuth();

  // Editable Profile fields
  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState(user?.gender || 'unspecified');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(donorProfile?.bloodGroup || 'O+');
  const [division, setDivision] = useState(donorProfile?.division || 'dhaka');
  const [district, setDistrict] = useState(donorProfile?.district || 'dhaka');
  const [upazila, setUpazila] = useState(donorProfile?.upazila || '');
  const [bio, setBio] = useState(donorProfile?.bio || '');
  const [availabilityStatus, setAvailabilityStatus] = useState(donorProfile?.availabilityStatus || 'available');
  const [consentToShareContact, setConsentToShareContact] = useState(donorProfile?.consentToShareContact ?? true);

  // States
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Phone Change Modal & Status
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [submittingPhoneChange, setSubmittingPhoneChange] = useState(false);
  const [phoneChangeMsg, setPhoneChangeMsg] = useState<string | null>(null);
  const [pendingPhoneRequest, setPendingPhoneRequest] = useState<PhoneChangeRequest | null>(null);

  // Institution Membership & Change States
  const [showInstModal, setShowInstModal] = useState(false);
  const [approvedInstitutions, setApprovedInstitutions] = useState<any[]>([]);
  const [targetInstId, setTargetInstId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [instDepartment, setInstDepartment] = useState('');
  const [instChangeReason, setInstChangeReason] = useState('');
  const [submittingInstChange, setSubmittingInstChange] = useState(false);
  const [instChangeMsg, setInstChangeMsg] = useState<string | null>(null);
  const [pendingInstRequest, setPendingInstRequest] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setGender(user.gender || 'unspecified');
    }
    if (donorProfile) {
      setBloodGroup(donorProfile.bloodGroup);
      setDivision(donorProfile.division);
      setDistrict(donorProfile.district);
      setUpazila(donorProfile.upazila || '');
      setBio(donorProfile.bio || '');
      setAvailabilityStatus(donorProfile.availabilityStatus);
      setConsentToShareContact(donorProfile.consentToShareContact ?? true);
    }

    // Load active phone request and institution change request
    async function loadRequests() {
      try {
        const [phoneRes, instRes, instListRes] = await Promise.all([
          api.getMyPhoneChangeRequest(),
          api.getMyInstitutionChangeRequest(),
          api.getInstitutions()
        ]);
        if (phoneRes.success && phoneRes.pendingRequest) {
          setPendingPhoneRequest(phoneRes.pendingRequest);
        }
        if (instRes.success && instRes.pendingRequest) {
          setPendingInstRequest(instRes.pendingRequest);
        }
        if (instListRes.success && instListRes.institutions) {
          setApprovedInstitutions(instListRes.institutions);
        }
      } catch {}
    }
    loadRequests();
  }, [user, donorProfile]);

  const handleSubmitInstChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInstId) {
      setInstChangeMsg('অনুগ্রহ করে একটি শিক্ষা প্রতিষ্ঠান নির্বাচন করুন।');
      return;
    }
    if (instChangeReason.trim().length < 5) {
      setInstChangeMsg('প্রতিষ্ঠান পরিবর্তনের সুনির্দিষ্ট কারণ (কমপক্ষে ৫ অক্ষর) উল্লেখ করুন।');
      return;
    }

    setSubmittingInstChange(true);
    setInstChangeMsg(null);
    try {
      const res = await api.submitInstitutionChangeRequest({
        targetInstitutionId: targetInstId,
        studentOrStaffId: studentId.trim() || undefined,
        department: instDepartment.trim() || undefined,
        reason: instChangeReason.trim()
      });

      if (res.success) {
        setShowInstModal(false);
        setInstChangeReason('');
        setProfileMsg({ text: res.message || 'প্রতিষ্ঠান পরিবর্তনের আবেদন জমা হয়েছে।', type: 'success' });
        const myRes = await api.getMyInstitutionChangeRequest();
        if (myRes.success && myRes.pendingRequest) setPendingInstRequest(myRes.pendingRequest);
      } else {
        setInstChangeMsg(res.message || 'আবেদন জমা দেওয়া সম্ভব হয়নি।');
      }
    } catch (err: any) {
      setInstChangeMsg(err.message || 'আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setSubmittingInstChange(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await api.updateProfile({
        name,
        gender,
        bloodGroup: user?.role === 'DONOR' ? bloodGroup : undefined,
        division,
        district,
        upazila,
        bio,
        availabilityStatus: user?.role === 'DONOR' ? availabilityStatus : undefined,
        consentToShareContact
      });

      if (res.success) {
        setProfileMsg({ text: 'আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।', type: 'success' });
        await refreshUser();
      } else {
        setProfileMsg({ text: res.message || 'হালনাগাদ করা যায়নি।', type: 'error' });
      }
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'সার্ভারে সংযোগ ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmitPhoneChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPhoneChange(true);
    setPhoneChangeMsg(null);

    const cleanNew = newPhone.replace(/\D/g, '');
    if (!cleanNew || cleanNew.length < 11) {
      setPhoneChangeMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)');
      setSubmittingPhoneChange(false);
      return;
    }

    try {
      const res = await api.submitPhoneChangeRequest({
        newPhone: cleanNew,
        reason: changeReason
      });

      if (res.success) {
        setPendingPhoneRequest(res.request);
        setShowPhoneModal(false);
        setNewPhone('');
        setChangeReason('');
        setProfileMsg({
          text: 'মোবাইল নম্বর পরিবর্তনের আবেদন সফলভাবে জমা হয়েছে। সংশ্লিষ্ট মডারেটর বা সমন্বয়ক কর্তৃক পর্যালোচনার পর নম্বর হালনাগাদ হবে।',
          type: 'success'
        });
      } else {
        setPhoneChangeMsg(res.message || 'আবেদন জমা দেওয়া যায়নি।');
      }
    } catch (err: any) {
      setPhoneChangeMsg(err.message || 'আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setSubmittingPhoneChange(false);
    }
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return '/admin/dashboard';
      case 'DIVISION_COORDINATOR':
        return '/coordinator/dashboard';
      case 'INSTITUTION_HEAD':
        return '/head/dashboard';
      case 'INSTITUTION_MODERATOR':
        return '/moderator/dashboard';
      case 'REQUESTER':
        return '/requester/dashboard';
      default:
        return '/donor/dashboard';
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-surface rounded-3xl border border-appBorder text-center space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-primary" />
        <h2 className="text-xl font-bold text-mainText">লগইন আবশ্যক</h2>
        <Link to="/login">
          <Button variant="primary" size="md">লগইন করুন</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-soft">
            {user.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-mainText">{user.name}</h1>
              <Badge variant="primary" size="sm">{user.role}</Badge>
            </div>
            <p className="text-xs text-subText font-mono">আইডি: {user._id}</p>
          </div>
        </div>

        <Link to={getDashboardPath()}>
          <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
            ড্যাশবোর্ড প্যানেল
          </Button>
        </Link>
      </div>

      {profileMsg && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
          profileMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {profileMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
          <span>{profileMsg.text}</span>
        </div>
      )}

      {/* Phone Number & Safety Section */}
      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-appBorder pb-4">
          <div>
            <h2 className="text-base font-black text-mainText flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              <span>নিবন্ধিত মোবাইল নম্বর</span>
            </h2>
            <p className="text-xs text-subText mt-0.5">নিরাপত্তা ও অপব্যবহার রোধে নম্বর পরিবর্তন প্রক্রিয়ায় প্রশাসনিক অনুমোদন প্রয়োজন হয়</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPhoneModal(true)}
            className="text-xs font-bold"
          >
            নম্বর পরিবর্তন আবেদন
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-xs text-subText block mb-0.5">বর্তমান নম্বর:</span>
            <span className="font-mono text-base font-black text-mainText">{user.phone}</span>
          </div>
          <Badge variant="success" size="sm" dot>সক্রিয় ও যাচাইকৃত</Badge>
        </div>

        {/* Pending Request Indicator */}
        {pendingPhoneRequest && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>নম্বর পরিবর্তনের একটি আবেদন অপেক্ষমাণ রয়েছে</span>
            </div>
            <p className="text-xs text-amber-700">
              অনুরোধকৃত নতুন নম্বর: <strong className="font-mono">{pendingPhoneRequest.newPhone}</strong> | কারণ: "{pendingPhoneRequest.reason}"
            </p>
            <p className="text-[11px] text-amber-600">
              আপনার বিভাগীয় সমন্বয়ক বা প্রতিষ্ঠান মডারেটর এটি খতিয়ে দেখে অনুমোদন করবেন।
            </p>
          </div>
        )}
      </div>

      {/* PART 06: My Institution / প্রতিষ্ঠান সংযুক্তকরণ Section */}
      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-appBorder pb-4">
          <div>
            <h2 className="text-base font-black text-mainText flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-700" />
              <span>আমার প্রতিষ্ঠান (My Institution)</span>
            </h2>
            <p className="text-xs text-subText mt-0.5">বিশ্ববিদ্যালয় বা কলেজ ক্যাম্পাসের সাথে যুক্ত হয়ে ক্যাম্পাস রক্তদান কার্যক্রমে অংশ নিন</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowInstModal(true);
              setInstChangeMsg(null);
            }}
            className="text-xs font-bold text-teal-800 border-teal-200 hover:bg-teal-50"
          >
            প্রতিষ্ঠান পরিবর্তন / যুক্ত করুন
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-xs text-subText block mb-0.5">বর্তমান প্রতিষ্ঠান:</span>
            <span className="text-sm font-bold text-mainText">
              {user.assignedInstitution 
                ? (approvedInstitutions.find(i => i._id === user.assignedInstitution)?.nameBn || 'অধিভুক্ত প্রতিষ্ঠান') 
                : 'বর্তমানে কোনো শিক্ষা প্রতিষ্ঠানের সাথে সংযুক্ত নন'}
            </span>
          </div>
          <Badge variant={user.assignedInstitution ? 'teal' : 'neutral'} size="sm">
            {user.assignedInstitution ? 'ক্যাম্পাস সদস্য' : 'সাধারণ সদস্য'}
          </Badge>
        </div>

        {/* Pending Institution Change Indicator */}
        {pendingInstRequest && (
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs sm:text-sm space-y-1">
            <div className="flex items-center gap-2 font-bold text-teal-800">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>প্রতিষ্ঠান পরিবর্তনের একটি আবেদন পর্যালোচনার অপেক্ষায় রয়েছে</span>
            </div>
            <p className="text-xs text-teal-800">
              অনুরোধকৃত নতুন প্রতিষ্ঠান: <strong>{pendingInstRequest.targetInstitutionName}</strong> | কারণ: "{pendingInstRequest.reason}"
            </p>
          </div>
        )}
      </div>

      {/* Main Profile Details Form */}
      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8 space-y-6">
        <div className="border-b border-appBorder pb-4">
          <h2 className="text-base font-black text-mainText flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            <span>ব্যক্তিগত ও স্বাস্থ্য তথ্য</span>
          </h2>
          <p className="text-xs text-subText mt-0.5">আপনার নাম, রক্তের গ্রুপ ও ভৌগোলিক তথ্য হালনাগাদ রাখুন</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">সম্পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">লিঙ্গ (Gender)</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText"
              >
                <option value="male">পুরুষ</option>
                <option value="female">নারী</option>
                <option value="other">অন্যান্য</option>
                <option value="unspecified">অনির্দিষ্ট</option>
              </select>
            </div>
          </div>

          {/* Blood Group & Availability (For Donors) */}
          {user.role === 'DONOR' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">রক্তের গ্রুপ</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm font-black text-primary"
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">রক্তদানে বর্তমান উপলব্ধতা</label>
                <select
                  value={availabilityStatus}
                  onChange={e => setAvailabilityStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText"
                >
                  <option value="available">রক্তদানে প্রস্তুত (সক্রিয়)</option>
                  <option value="recently_donated">সম্প্রতি রক্তদান করেছি (বিশ্রামে)</option>
                  <option value="temporarily_unavailable">সাময়িক বিরতি (শারীরিক কারণ)</option>
                </select>
              </div>
            </div>
          )}

          {/* Location Selector */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-mainText">আপনার এলাকা / অবস্থান</label>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <LocationSelector
                division={division}
                district={district}
                upazila={upazila}
                onDivisionChange={setDivision}
                onDistrictChange={setDistrict}
                onUpazilaChange={setUpazila}
              />
            </div>
          </div>

          {/* Privacy & Public Contact Visibility (PART 02) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-appBorder space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label className="text-xs font-bold text-mainText block">
                  পাবলিক অনুসন্ধানে সরাসরি যোগাযোগের অনুমতি (Privacy & Visibility)
                </label>
                <p className="text-[11px] text-subText mt-0.5 leading-relaxed">
                  চিহ্নিত থাকলে জরুরি রক্তের সন্ধানে আসা যে কোনো ভিজিটর লগইন না করেই আপনার সাথে সরাসরি ফোনে যোগাযোগ করতে পারবেন। আনচেক করলে পাবলিক অনুসন্ধানে আপনার মোবাইল নম্বর সম্পূর্ণ গোপন থাকবে।
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={consentToShareContact}
                  onChange={e => setConsentToShareContact(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px]">
              <span className={`font-semibold ${consentToShareContact ? 'text-emerald-700' : 'text-amber-700'}`}>
                {consentToShareContact ? '✓ বর্তমানে নম্বর উন্মুক্ত রয়েছে' : '⚠ বর্তমানে নম্বর গোপন রাখা হয়েছে'}
              </span>
            </div>
          </div>

          {/* Bio / Motivation */}
          <div>
            <label className="block text-xs font-bold text-mainText mb-1.5">সংক্ষিপ্ত পরিচয় বা বার্তা</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="রক্তদান সংক্রান্ত আপনার অভিজ্ঞতা বা বার্তা..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={savingProfile}
              icon={<Save className="w-4 h-4" />}
              className="shadow-soft"
            >
              তথ্য সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </div>

      {/* Phone Change Modal */}
      {showPhoneModal && (
        <Modal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          title="মোবাইল নম্বর পরিবর্তনের আবেদন"
          description="রক্তদাতাদের সুরক্ষা ও সঠিক রেকর্ড নিশ্চিত করতে মোবাইল নম্বর সরাসরি পরিবর্তনযোগ্য নয়। আবেদনটি সমন্বয়ক কর্তৃক অনুমোদনের পর পরিবর্তন কার্যকর হবে।"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowPhoneModal(false)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingPhoneChange}
                onClick={handleSubmitPhoneChange as any}
                icon={<Send className="w-4 h-4" />}
              >
                আবেদন জমা দিন
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmitPhoneChange} className="space-y-4">
            {phoneChangeMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {phoneChangeMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">বর্তমান মোবাইল নম্বর</label>
              <input
                type="text"
                disabled
                value={user.phone}
                className="w-full px-3.5 py-2 bg-slate-100 border border-appBorder rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                অনুরোধকৃত নতুন মোবাইল নম্বর (১১ ডিজিট) *
              </label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs font-mono text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                নম্বর পরিবর্তনের সুস্পষ্ট কারণ *
              </label>
              <textarea
                rows={3}
                required
                value={changeReason}
                onChange={e => setChangeReason(e.target.value)}
                placeholder="যেমন: পূর্বের সিমটি হারিয়ে গেছে / কর্মস্থলের নতুন নম্বর যুক্ত করতে চাই..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Institution Change / Attachment Modal (PART 06) */}
      {showInstModal && (
        <Modal
          isOpen={showInstModal}
          onClose={() => setShowInstModal(false)}
          title="শিক্ষা প্রতিষ্ঠান পরিবর্তন বা সংযুক্তিকরণের আবেদন"
          description="আপনার পছন্দের বিশ্ববিদ্যালয় বা কলেজ নির্বাচন করে আবেদন করুন। সুপার এডমিন বা বিভাগীয় সমন্বয়ক কর্তৃক পর্যালোচনার পর অনুমোদন দেওয়া হবে।"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowInstModal(false)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingInstChange}
                onClick={handleSubmitInstChange as any}
                icon={<Send className="w-4 h-4" />}
                className="bg-teal-700 hover:bg-teal-800"
              >
                আবেদন জমা দিন
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmitInstChange} className="space-y-4">
            {instChangeMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {instChangeMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                শিক্ষা প্রতিষ্ঠান নির্বাচন করুন *
              </label>
              <select
                required
                value={targetInstId}
                onChange={e => setTargetInstId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
              >
                <option value="">-- প্রতিষ্ঠান নির্বাচন করুন --</option>
                {approvedInstitutions.map((inst: any) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.nameBn} ({inst.nameEn || inst.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-mainText mb-1">শিক্ষার্থী / স্টাফ আইডি (যদি থাকে)</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="ID: 1910..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-mainText mb-1">বিভাগ / অনুষদ (যদি থাকে)</label>
                <input
                  type="text"
                  value={instDepartment}
                  onChange={e => setInstDepartment(e.target.value)}
                  placeholder="যেমন: CSE, BBA"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                প্রতিষ্ঠান পরিবর্তনের কারণ * (কমপক্ষে ৫ অক্ষর)
              </label>
              <textarea
                rows={3}
                required
                value={instChangeReason}
                onChange={e => setInstChangeReason(e.target.value)}
                placeholder="যেমন: নতুন শিক্ষাবর্ষে উক্ত প্রতিষ্ঠানে ভর্তি হয়েছি..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

