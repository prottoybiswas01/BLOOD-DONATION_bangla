import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Droplet, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Save, 
  KeyRound, 
  ArrowRight,
  Send,
  Building2,
  Heart,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Info,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PhoneChangeRequest } from '../types';
import { getReadableLocation } from '../utils/locationNames';

type ProfileSection = 'all' | 'personal' | 'donation' | 'requests' | 'security';

export const ProfileSettings: React.FC = () => {
  const { user, donorProfile, refreshUser } = useAuth();

  // Active Section for Ergonomic Mobile and Desktop Navigation
  const [activeSection, setActiveSection] = useState<ProfileSection>('all');

  // Form Initialized Tracker to Preserve User's Input on Save Failure
  const isInitializedRef = useRef(false);

  // Personal Info Fields
  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState(user?.gender || 'unspecified');
  const [division, setDivision] = useState(user?.division || donorProfile?.division || 'dhaka');
  const [district, setDistrict] = useState(user?.district || donorProfile?.district || 'dhaka');
  const [upazila, setUpazila] = useState(user?.upazila || donorProfile?.upazila || '');

  // Donor Profile Specific Fields
  const hasDonorProfile = Boolean(donorProfile);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(donorProfile?.bloodGroup || 'O+');
  const [bio, setBio] = useState(donorProfile?.bio || '');
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'recently_donated' | 'temporarily_unavailable'>(
    donorProfile?.availabilityStatus || 'available'
  );
  const [isPubliclyListed, setIsPubliclyListed] = useState<boolean>(
    donorProfile?.isPubliclyListed ?? true
  );
  const [consentToShareContact, setConsentToShareContact] = useState<boolean>(
    donorProfile?.consentToShareContact ?? true
  );

  // Voluntary Activation State (for users without a donor profile)
  const [activateBloodGroup, setActivateBloodGroup] = useState<BloodGroup>('O+');
  const [activatingDonor, setActivatingDonor] = useState(false);

  // Password Change Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Status & Feedback Messages
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Phone Change Modal & States
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [submittingPhoneChange, setSubmittingPhoneChange] = useState(false);
  const [phoneChangeMsg, setPhoneChangeMsg] = useState<string | null>(null);

  // Institution Change Modal & States
  const [showInstModal, setShowInstModal] = useState(false);
  const [approvedInstitutions, setApprovedInstitutions] = useState<any[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  const [institutionsLoaded, setInstitutionsLoaded] = useState(false);
  const [institutionsError, setInstitutionsError] = useState<string | null>(null);

  const [targetInstId, setTargetInstId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [instDepartment, setInstDepartment] = useState('');
  const [instChangeReason, setInstChangeReason] = useState('');
  const [submittingInstChange, setSubmittingInstChange] = useState(false);
  const [instChangeMsg, setInstChangeMsg] = useState<string | null>(null);

  // Lazy Loaded Requests States (Section 3)
  const [pendingPhoneRequest, setPendingPhoneRequest] = useState<PhoneChangeRequest | null>(null);
  const [pendingInstRequest, setPendingInstRequest] = useState<any | null>(null);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsLoaded, setRequestsLoaded] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // Initial Form Field Population - Executed once on mount, preserving user typing thereafter
  useEffect(() => {
    if (!isInitializedRef.current && user) {
      setName(user.name || '');
      setGender(user.gender || 'unspecified');
      if (user.division) setDivision(user.division);
      if (user.district) setDistrict(user.district);
      if (user.upazila !== undefined) setUpazila(user.upazila || '');

      if (donorProfile) {
        setBloodGroup(donorProfile.bloodGroup || 'O+');
        if (donorProfile.division) setDivision(donorProfile.division);
        if (donorProfile.district) setDistrict(donorProfile.district);
        if (donorProfile.upazila !== undefined) setUpazila(donorProfile.upazila || '');
        setBio(donorProfile.bio || '');
        setAvailabilityStatus(donorProfile.availabilityStatus || 'available');
        setIsPubliclyListed(donorProfile.isPubliclyListed ?? true);
        setConsentToShareContact(donorProfile.consentToShareContact ?? true);
      }
      isInitializedRef.current = true;
    }
  }, [user, donorProfile]);

  // Lazy Load Applications when Section 3 is visible or opened
  const loadMyRequests = async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const [phoneRes, instRes] = await Promise.all([
        api.getMyPhoneChangeRequest(),
        api.getMyInstitutionChangeRequest()
      ]);
      if (phoneRes?.success && phoneRes.pendingRequest) {
        setPendingPhoneRequest(phoneRes.pendingRequest);
      } else {
        setPendingPhoneRequest(null);
      }
      if (instRes?.success && instRes.pendingRequest) {
        setPendingInstRequest(instRes.pendingRequest);
      } else {
        setPendingInstRequest(null);
      }
      setRequestsLoaded(true);
    } catch (err: any) {
      setRequestsError(err?.message || 'আবেদনসমূহ লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setRequestsLoading(false);
    }
  };

  // Trigger lazy loading of requests if Section 3 is selected or opened
  useEffect(() => {
    if ((activeSection === 'requests' || activeSection === 'all') && !requestsLoaded && !requestsLoading && user) {
      loadMyRequests();
    }
  }, [activeSection, requestsLoaded, requestsLoading, user]);

  // Lazy Load Approved Institutions when Institution Modal is opened
  const loadApprovedInstitutions = async () => {
    setInstitutionsLoading(true);
    setInstitutionsError(null);
    try {
      const res = await api.getInstitutions();
      if (res?.success && res.institutions) {
        setApprovedInstitutions(res.institutions);
        setInstitutionsLoaded(true);
      } else {
        setInstitutionsError(res?.message || 'শিক্ষা প্রতিষ্ঠান তালিকা পাওয়া যায়নি।');
      }
    } catch (err: any) {
      setInstitutionsError(err?.message || 'শিক্ষা প্রতিষ্ঠান লোড করতে সমস্যা হয়েছে।');
    } finally {
      setInstitutionsLoading(false);
    }
  };

  const handleOpenInstModal = () => {
    setShowInstModal(true);
    setInstChangeMsg(null);
    if (!institutionsLoaded && !institutionsLoading) {
      loadApprovedInstitutions();
    }
  };

  // Activate Donor Profile Voluntarily (Preserving User's Account Role)
  const handleActivateDonor = async () => {
    setActivatingDonor(true);
    setProfileMsg(null);
    try {
      const res = await api.activateDonorProfile({
        bloodGroup: activateBloodGroup,
        division,
        district,
        upazila,
        isPubliclyListed: true,
        consentToShareContact: true
      });
      if (res.success) {
        setProfileMsg({ 
          text: 'স্বেচ্ছাসেবী রক্তদাতা প্রোফাইল সফলভাবে চালু হয়েছে! আপনার মূল অ্যাকাউন্ট পদবি অপরিবর্তিত রাখা হয়েছে।', 
          type: 'success' 
        });
        setBloodGroup(activateBloodGroup);
        setIsPubliclyListed(true);
        setConsentToShareContact(true);
        setAvailabilityStatus('available');
        await refreshUser();
      } else {
        setProfileMsg({ text: res.message || 'রক্তদাতা প্রোফাইল সক্রিয় করা যায়নি।', type: 'error' });
      }
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'অনুরোধ প্রক্রিয়াকরণে সমস্যা হয়েছে।', type: 'error' });
    } finally {
      setActivatingDonor(false);
    }
  };

  // Update Personal Profile & Donor Profile (Preserving user input if error occurs)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const payload: Record<string, any> = {
        name,
        gender,
        division,
        district,
        upazila
      };

      if (hasDonorProfile) {
        payload.bloodGroup = bloodGroup;
        payload.bio = bio;
        payload.availabilityStatus = availabilityStatus;
        payload.isPubliclyListed = isPubliclyListed;
        payload.consentToShareContact = consentToShareContact;
      }

      const res = await api.updateProfile(payload);

      if (res.success) {
        setProfileMsg({ text: 'আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।', type: 'success' });
        await refreshUser();
      } else {
        // Retain user's typed changes in dirty state and notify clearly
        setProfileMsg({ text: res.message || 'হালনাগাদ করা যায়নি। আপনার লেখা পরিবর্তনগুলো সংরক্ষিত আছে।', type: 'error' });
      }
    } catch (err: any) {
      // Retain user's typed changes in dirty state
      setProfileMsg({ text: err.message || 'সার্ভারে সংযোগ ব্যর্থ হয়েছে। আপনার ফর্মের তথ্য অক্ষুণ্ণ আছে।', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।', type: 'error' });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword
      });

      if (res.success) {
        setPasswordMsg({ text: 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ text: res.message || 'পাসওয়ার্ড পরিবর্তন করা যায়নি। বর্তমান পাসওয়ার্ড সঠিক কি না পরীক্ষা করুন।', type: 'error' });
      }
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setChangingPassword(false);
    }
  };

  // Submit Phone Change Request
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
        loadMyRequests();
      } else {
        setPhoneChangeMsg(res.message || 'আবেদন জমা দেওয়া যায়নি।');
      }
    } catch (err: any) {
      setPhoneChangeMsg(err.message || 'আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setSubmittingPhoneChange(false);
    }
  };

  // Submit Institution Change Request
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
        loadMyRequests();
      } else {
        setInstChangeMsg(res.message || 'আবেদন জমা দেওয়া সম্ভব হয়নি।');
      }
    } catch (err: any) {
      setInstChangeMsg(err.message || 'আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setSubmittingInstChange(false);
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

  const getRoleDisplayName = (r?: string) => {
    switch (r) {
      case 'SUPER_ADMIN': return 'সুপার অ্যাডমিন';
      case 'ADMIN': return 'প্ল্যাটফর্ম অ্যাডমিন';
      case 'DIVISION_COORDINATOR': return 'বিভাগীয় সমন্বয়ক';
      case 'INSTITUTION_HEAD': return 'প্রতিষ্ঠান প্রধান';
      case 'INSTITUTION_MODERATOR': return 'ক্যাম্পাস মডারেটর';
      case 'DONOR': return 'স্বেচ্ছাসেবী রক্তদাতা';
      case 'REQUESTER': return 'রক্তপ্রার্থী';
      default: return 'সাধারণ সদস্য';
    }
  };

  const readableLoc = getReadableLocation(division, district, upazila);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-surface rounded-3xl border border-appBorder text-center space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-primary" />
        <h2 className="text-xl font-bold text-mainText">লগইন আবশ্যক</h2>
        <p className="text-xs text-subText">প্রোফাইল দেখতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।</p>
        <Link to="/login">
          <Button variant="primary" size="md">লগইন করুন</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Top Hero Summary Card: Name, Blood Group, Area, Current Donation State */}
      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-5 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          {/* Avatar & Main Identity */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary via-rose-600 to-red-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-soft flex-shrink-0">
              {hasDonorProfile ? bloodGroup : user.name.slice(0, 1)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-mainText">{user.name}</h1>
                <Badge variant={user.role === 'SUPER_ADMIN' ? 'danger' : (user.role === 'ADMIN' ? 'teal' : 'primary')} size="sm">
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>

              {/* Blood Group, Area & Donation State */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-subText">
                <span className="font-bold text-primary flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 fill-current" />
                  <span>গ্রুপ: {hasDonorProfile ? bloodGroup : 'নির্ধারিত নেই'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>{readableLoc.displayText || 'অবস্থান নির্ধারিত নেই'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {hasDonorProfile ? (
                    availabilityStatus === 'available' ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        রক্তদানে প্রস্তুত
                      </span>
                    ) : availabilityStatus === 'temporarily_unavailable' ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        সাময়িক বিরতিতে
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        সম্প্রতি রক্তদান করেছেন
                      </span>
                    )
                  ) : (
                    <span className="text-slate-500 font-medium">রক্তদাতা প্রোফাইল সক্রিয় নেই</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button to Admin/Donor Dashboard */}
          <Link to={getDashboardPath()} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />} className="w-full sm:w-auto justify-center">
              ড্যাশবোর্ড প্যানেল
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile-Friendly Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none border-b border-appBorder">
        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeSection === 'all'
              ? 'bg-primary text-white shadow-soft'
              : 'text-subText hover:text-mainText hover:bg-slate-100'
          }`}
        >
          সবগুলো একসাথে
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('personal')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'personal'
              ? 'bg-primary text-white shadow-soft'
              : 'text-subText hover:text-mainText hover:bg-slate-100'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>১. ব্যক্তিগত তথ্য</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('donation')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'donation'
              ? 'bg-primary text-white shadow-soft'
              : 'text-subText hover:text-mainText hover:bg-slate-100'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>২. রক্তদান ও গোপনীয়তা</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSection('requests');
            if (!requestsLoaded && !requestsLoading) loadMyRequests();
          }}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'requests'
              ? 'bg-primary text-white shadow-soft'
              : 'text-subText hover:text-mainText hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>৩. আমার আবেদন</span>
          {(pendingPhoneRequest || pendingInstRequest) && (
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('security')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'security'
              ? 'bg-primary text-white shadow-soft'
              : 'text-subText hover:text-mainText hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>৪. নিরাপত্তা</span>
        </button>
      </div>

      {profileMsg && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
          profileMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {profileMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{profileMsg.text}</span>
        </div>
      )}

      {/* Main Form Wrapping Personal and Donation Sections */}
      <form onSubmit={handleUpdateProfile} className="space-y-6 sm:space-y-8">
        {/* SECTION 1: ব্যক্তিগত তথ্য ও এলাকা (Personal Information & Location) */}
        {(activeSection === 'all' || activeSection === 'personal') && (
          <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-5 sm:p-8 space-y-6">
            <div className="border-b border-appBorder pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-mainText flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-primary" />
                  <span>১. ব্যক্তিগত ও ভৌগোলিক তথ্য</span>
                </h2>
                <p className="text-xs text-subText mt-0.5">আপনার নাম, মোবাইল নম্বর ও অবস্থান হালনাগাদ রাখুন</p>
              </div>
            </div>

            {/* Phone Number Display & Modal Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs text-subText block mb-0.5">নিবন্ধিত মোবাইল নম্বর:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-mainText">{user.phone}</span>
                  <Badge variant="success" size="sm" dot>সক্রিয় ও সংরক্ষিত</Badge>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPhoneModal(true)}
                className="text-xs font-bold self-start sm:self-auto"
              >
                মোবাইল নম্বর পরিবর্তন আবেদন
              </Button>
            </div>

            {/* Pending Phone Request Banner */}
            {pendingPhoneRequest && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>মোবাইল নম্বর পরিবর্তনের আবেদন পর্যালোচনার অপেক্ষায় রয়েছে</span>
                </div>
                <p className="text-xs text-amber-700">
                  অনুরোধকৃত নতুন নম্বর: <strong className="font-mono">{pendingPhoneRequest.newPhone}</strong> | কারণ: "{pendingPhoneRequest.reason}"
                </p>
              </div>
            )}

            {/* Institution Attachment Display & Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs text-subText block mb-0.5">সংযুক্ত শিক্ষা প্রতিষ্ঠান:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-mainText">
                    {user.assignedInstitution 
                      ? (approvedInstitutions.find(i => i._id === user.assignedInstitution)?.nameBn || 'ক্যাম্পাস অধিভুক্ত') 
                      : 'বর্তমানে কোনো শিক্ষা প্রতিষ্ঠানের সাথে সংযুক্ত নন'}
                  </span>
                  <Badge variant={user.assignedInstitution ? 'teal' : 'neutral'} size="sm">
                    {user.assignedInstitution ? 'ক্যাম্পাস সদস্য' : 'সাধারণ সদস্য'}
                  </Badge>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenInstModal}
                className="text-xs font-bold text-teal-800 border-teal-200 hover:bg-teal-50 self-start sm:self-auto"
              >
                প্রতিষ্ঠান পরিবর্তন / যুক্ত করুন
              </Button>
            </div>

            {/* Pending Institution Request Banner */}
            {pendingInstRequest && (
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs sm:text-sm space-y-1">
                <div className="flex items-center gap-2 font-bold text-teal-800">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>শিক্ষা প্রতিষ্ঠান পরিবর্তনের আবেদন অপেক্ষমাণ রয়েছে</span>
                </div>
                <p className="text-xs text-teal-800">
                  অনুরোধকৃত প্রতিষ্ঠান: <strong>{pendingInstRequest.targetInstitutionName}</strong> | কারণ: "{pendingInstRequest.reason}"
                </p>
              </div>
            )}

            {/* Personal Details Form Inputs */}
            <div className="space-y-4 pt-2">
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="male">পুরুষ</option>
                    <option value="female">নারী</option>
                    <option value="other">অন্যান্য</option>
                    <option value="unspecified">বলতে অনিচ্ছুক</option>
                  </select>
                </div>
              </div>

              {/* Location Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-mainText">আপনার ভৌগোলিক এলাকা / বর্তমান ঠিকানা</label>
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
            </div>
          </div>
        )}

        {/* SECTION 2: স্বেচ্ছাসেবী রক্তদান ও গোপনীয়তা সেটিংস */}
        {(activeSection === 'all' || activeSection === 'donation') && (
          <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-5 sm:p-8 space-y-6">
            <div className="border-b border-appBorder pb-4">
              <h2 className="text-base font-black text-mainText flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <span>২. স্বেচ্ছাসেবী রক্তদান ও গোপনীয়তা সেটিংস</span>
              </h2>
              <p className="text-xs text-subText mt-0.5">
                আপনার বিদ্যমান অ্যাকাউন্ট পদবি নির্বিশেষে স্বেচ্ছায় রক্তদাতা হিসেবে প্রাপ্যতা ও গোপনীয়তা নিয়ন্ত্রণ করুন
              </p>
            </div>

            {!hasDonorProfile ? (
              /* Voluntary Activation Prompt if user has no donor profile */
              <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-mainText">স্বেচ্ছাসেবী রক্তদাতা হিসেবে যুক্ত হতে চান?</h3>
                    <p className="text-xs text-subText mt-1 leading-relaxed">
                      আপনি সুপার অ্যাডমিন, অ্যাডমিন, সমন্বয়ক, মডারেটর বা সাধারণ সদস্য—যেকোনো ভূমিকাতেই থাকুন না কেন, 
                      রক্তদানের জন্য নিজেকে প্ল্যাটফর্মে নিবন্ধিত করতে পারেন। এটি আপনার বিদ্যমান প্রশাসনিক পদবি পরিবর্তন করবে না।
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-mainText">আপনার রক্তের গ্রুপ:</span>
                    <select
                      value={activateBloodGroup}
                      onChange={e => setActivateBloodGroup(e.target.value as BloodGroup)}
                      className="px-3 py-1.5 bg-white border border-rose-200 rounded-xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    isLoading={activatingDonor}
                    onClick={handleActivateDonor}
                    icon={<Heart className="w-4 h-4" />}
                    className="bg-rose-600 hover:bg-rose-700 shadow-soft"
                  >
                    স্বেচ্ছাসেবী রক্তদাতা প্রোফাইল চালু করুন
                  </Button>
                </div>
              </div>
            ) : (
              /* Donor Configuration when user already has donor profile */
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-mainText mb-1.5">রক্তের গ্রুপ</label>
                    <select
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mainText mb-1.5">
                      ১. রক্তদানের প্রাপ্যতা ও সাময়িক বিরতি
                    </label>
                    <select
                      value={availabilityStatus}
                      onChange={e => setAvailabilityStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm font-semibold text-mainText focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="available">রক্তদানে প্রস্তুত (সক্রিয়)</option>
                      <option value="temporarily_unavailable">সাময়িক বিরতিতে (স্থগিত)</option>
                      <option value="recently_donated">সম্প্রতি রক্তদান করেছি (বিশ্রামে)</option>
                    </select>
                  </div>
                </div>

                {/* 1. Availability Status Single Line Consequence */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-subText">
                  💡 <strong>ফল:</strong> 'সাময়িক বিরতি' দিলে অনুসন্ধান তালিকায় আপনার স্ট্যাটাস 'বিরতিতে' দেখাবে এবং জরুরি কল আসবে না, তবে আপনার প্রোফাইল সুরক্ষিত থাকবে।
                </div>

                {/* 2. Public Visibility Toggle */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-appBorder space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <label className="text-xs font-bold text-mainText block">
                        ২. পাবলিক রক্তদাতা অনুসন্ধানে প্রদর্শন (Directory Visibility)
                      </label>
                      <p className="text-[11px] text-subText mt-1 leading-relaxed">
                        💡 <strong>ফল:</strong> এটি বন্ধ রাখলে পাবলিক রক্তদাতা সার্চ ও সরাসরি প্রোফাইল লিংকে আপনার নাম সম্পূর্ণ আড়ালে থাকবে; চালু রাখলে সবাই সার্চে খুঁজে পাবে।
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={isPubliclyListed}
                        onChange={e => setIsPubliclyListed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className={`font-semibold ${isPubliclyListed ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isPubliclyListed ? '✓ বর্তমানে অনুসন্ধান তালিকায় দৃশ্যমান' : '⊘ অনুসন্ধান তালিকা থেকে সম্পূর্ণ আড়ালে রাখা হয়েছে'}
                    </span>
                  </div>
                </div>

                {/* 3. Contact Disclosure Toggle */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-appBorder space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <label className="text-xs font-bold text-mainText block">
                        ৩. সরাসরি ফোন নম্বর প্রকাশের অনুমতি (Direct Phone Disclosure)
                      </label>
                      <p className="text-[11px] text-subText mt-1 leading-relaxed">
                        💡 <strong>ফল:</strong> এটি চালু রাখলে রক্তপ্রার্থীরা সরাসরি আপনার ফোনে কল করতে পারবে; বন্ধ রাখলে আপনার ব্যক্তিগত নম্বর সম্পূর্ণ সুরক্ষিত ও গোপন থাকবে।
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
                    <span className={`font-semibold ${consentToShareContact ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {consentToShareContact ? '✓ বর্তমানে সরাসরি যোগাযোগ অনুমোদিত' : '🔒 ব্যক্তিগত নম্বর সুরক্ষিত ও গোপন রাখা হয়েছে'}
                    </span>
                  </div>
                </div>

                {/* Bio / Message */}
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1.5">রক্তদাতা হিসেবে সংক্ষিপ্ত বার্তা বা অভিজ্ঞতা</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="রক্তদান সংক্রান্ত আপনার অনুপ্রেরণা বা বার্তা..."
                    className="w-full px-4 py-2 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button for Personal and Donation Sections */}
        {(activeSection === 'all' || activeSection === 'personal' || activeSection === 'donation') && (
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={savingProfile}
              icon={<Save className="w-4 h-4" />}
              className="shadow-soft w-full sm:w-auto"
            >
              তথ্য সংরক্ষণ করুন
            </Button>
          </div>
        )}
      </form>

      {/* SECTION 3: আমার আবেদন ও হিস্ট্রি (My Applications & Requests) - Lazy Loaded on Demand */}
      {(activeSection === 'all' || activeSection === 'requests') && (
        <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-5 sm:p-8 space-y-4">
          <div className="border-b border-appBorder pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-mainText flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-700" />
                <span>৩. আমার প্রশাসনিক আবেদনসমূহ</span>
              </h2>
              <p className="text-xs text-subText mt-0.5">আপনার জমা দেওয়া নম্বর ও প্রতিষ্ঠান পরিবর্তন আবেদনের অবস্থা</p>
            </div>
            <button
              type="button"
              onClick={loadMyRequests}
              disabled={requestsLoading}
              className="p-2 text-subText hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${requestsLoading ? 'animate-spin text-teal-600' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {requestsLoading ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-appBorder space-y-2">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-t-transparent"></div>
                <p className="text-xs text-subText">আপনার প্রশাসনিক আবেদনসমূহ লোড হচ্ছে...</p>
              </div>
            ) : requestsError ? (
              <div className="p-6 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-center space-y-3">
                <p className="text-xs font-semibold">{requestsError}</p>
                <Button variant="outline" size="sm" onClick={loadMyRequests}>
                  পুনরায় চেষ্টা করুন
                </Button>
              </div>
            ) : (
              <>
                {pendingPhoneRequest && (
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-amber-900">মোবাইল নম্বর পরিবর্তন আবেদন</span>
                        <Badge variant="warning" size="sm">অপেক্ষমাণ</Badge>
                      </div>
                      <p className="text-xs text-amber-800">
                        অনুরোধকৃত নতুন নম্বর: <strong className="font-mono">{pendingPhoneRequest.newPhone}</strong> (বর্তমান: {user.phone})
                      </p>
                      <p className="text-[11px] text-amber-700">কারণ: "{pendingPhoneRequest.reason}"</p>
                    </div>
                    <span className="text-[10px] text-amber-600 whitespace-nowrap">
                      {new Date(pendingPhoneRequest.createdAt || Date.now()).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                )}

                {pendingInstRequest && (
                  <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/60 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-teal-900">শিক্ষা প্রতিষ্ঠান পরিবর্তন আবেদন</span>
                        <Badge variant="teal" size="sm">অপেক্ষমাণ</Badge>
                      </div>
                      <p className="text-xs text-teal-800">
                        অনুরোধকৃত নতুন প্রতিষ্ঠান: <strong>{pendingInstRequest.targetInstitutionName}</strong>
                      </p>
                      <p className="text-[11px] text-teal-700">কারণ: "{pendingInstRequest.reason}"</p>
                    </div>
                    <span className="text-[10px] text-teal-600 whitespace-nowrap">
                      {new Date(pendingInstRequest.createdAt || Date.now()).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                )}

                {!pendingPhoneRequest && !pendingInstRequest && (
                  <div className="p-6 rounded-2xl border border-dashed border-appBorder text-center bg-slate-50/50 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h3 className="text-xs font-bold text-mainText">বর্তমানে কোনো প্রশাসনিক আবেদন অপেক্ষমাণ নেই</h3>
                    <p className="text-[11px] text-subText">আপনার মোবাইল নম্বর ও প্রতিষ্ঠান সংক্রান্ত সকল তথ্য হালনাগাদ ও সক্রিয় রয়েছে।</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: অ্যাকাউন্ট নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন (Account Security) */}
      {(activeSection === 'all' || activeSection === 'security') && (
        <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-5 sm:p-8 space-y-5">
          <div className="border-b border-appBorder pb-4">
            <h2 className="text-base font-black text-mainText flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              <span>৪. অ্যাকাউন্ট নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন</span>
            </h2>
            <p className="text-xs text-subText mt-0.5">
              নিয়মিত পাসওয়ার্ড পরিবর্তন করে আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করুন
            </p>
          </div>

          {passwordMsg && (
            <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
              passwordMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">বর্তমান পাসওয়ার্ড *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="বর্তমান অ্যাকাউন্টের পাসওয়ার্ড"
                className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">নতুন পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">নতুন পাসওয়ার্ড নিশ্চিতকরণ *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="পুনরায় নতুন পাসওয়ার্ড দিন"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={changingPassword}
                icon={<KeyRound className="w-4 h-4" />}
                className="bg-amber-600 hover:bg-amber-700 shadow-soft w-full sm:w-auto"
              >
                পাসওয়ার্ড পরিবর্তন করুন
              </Button>
            </div>
          </form>
        </div>
      )}

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
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs font-mono text-mainText focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">পরিবর্তনের কারণ *</label>
              <textarea
                required
                rows={3}
                value={changeReason}
                onChange={e => setChangeReason(e.target.value)}
                placeholder="মোবাইল নম্বর পরিবর্তনের সুনির্দিষ্ট কারণ সংক্ষেপে লিখুন..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Institution Change Modal - Lazy Loaded Institutions */}
      {showInstModal && (
        <Modal
          isOpen={showInstModal}
          onClose={() => setShowInstModal(false)}
          title="শিক্ষা প্রতিষ্ঠান পরিবর্তন / যুক্ত করার আবেদন"
          description="আপনার ক্যাম্পাস ক্লাস্টার পরিবর্তনের জন্য নিচের ফর্মটি পূরণ করুন। সংশ্লিষ্ট প্রতিষ্ঠান প্রধান কর্তৃক অনুমোদনের পর তথ্য আপডেট হবে।"
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
                icon={<Building2 className="w-4 h-4" />}
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

            {institutionsLoading ? (
              <div className="p-4 text-center text-xs text-subText bg-slate-50 rounded-xl">
                শিক্ষা প্রতিষ্ঠানসমূহ লোড হচ্ছে...
              </div>
            ) : institutionsError ? (
              <div className="p-3 text-center bg-rose-50 text-rose-700 text-xs rounded-xl space-y-2">
                <p>{institutionsError}</p>
                <Button variant="outline" size="sm" onClick={loadApprovedInstitutions}>
                  পুনরায় চেষ্টা করুন
                </Button>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-mainText mb-1">
                  কাঙ্ক্ষিত শিক্ষা প্রতিষ্ঠান নির্বাচন করুন *
                </label>
                <select
                  required
                  value={targetInstId}
                  onChange={e => setTargetInstId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-700/20"
                >
                  <option value="">-- প্রতিষ্ঠান নির্বাচন করুন --</option>
                  {approvedInstitutions.map(inst => (
                    <option key={inst._id} value={inst._id}>
                      {inst.nameBn || inst.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-mainText mb-1">স্টুডেন্ট / স্টাফ আইডি</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="যেমন: CSE-190101"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs font-mono text-mainText focus:ring-2 focus:ring-teal-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1">বিভাগ / ডিপার্টমেন্ট</label>
                <input
                  type="text"
                  value={instDepartment}
                  onChange={e => setInstDepartment(e.target.value)}
                  placeholder="যেমন: কম্পিউটার সায়েন্স"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-700/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">পরিবর্তন / যুক্ত করার কারণ *</label>
              <textarea
                required
                rows={3}
                value={instChangeReason}
                onChange={e => setInstChangeReason(e.target.value)}
                placeholder="প্রতিষ্ঠান পরিবর্তন বা নতুন যুক্ত হওয়ার সুনির্দিষ্ট কারণ সংক্ষেপে লিখুন..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-700/20"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
