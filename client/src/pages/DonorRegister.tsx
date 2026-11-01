import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  KeyRound, 
  Building2, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Lock,
  Heart
} from 'lucide-react';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Institution } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const DonorRegister: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  // Multi-step progress (1: Role & Identity, 2: Health & Blood, 3: Location & Privacy, 4: OTP Verification)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form fields
  const [role, setRole] = useState<'DONOR' | 'REQUESTER'>('DONOR');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-01');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'unspecified'>('male');
  const [institutionId, setInstitutionId] = useState('');
  const [division, setDivision] = useState('dhaka');
  const [district, setDistrict] = useState('dhaka');
  const [upazila, setUpazila] = useState('');
  const [consentToShareContact, setConsentToShareContact] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadInsts() {
      try {
        const res = await api.getInstitutions();
        if (res.success && res.institutions) {
          setInstitutions(res.institutions);
        }
      } catch {}
    }
    loadInsts();
  }, []);

  // Validation before proceeding from Step 1 to Step 2
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 01XXXXXXXXX)।');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('কমপক্ষে ৬ অক্ষরের একটি শক্তিশালী পাসওয়ার্ড নির্ধারণ করুন।');
      return;
    }

    if (role === 'REQUESTER') {
      // For requesters, blood group is optional/not required, jump to Location & Privacy
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  // Validation before proceeding from Step 2 to Step 3
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (role === 'DONOR' && dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const ageDiff = Date.now() - dob.getTime();
      const age = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
      if (age < 18) {
        setErrorMsg('রক্তদাতা হিসেবে নিবন্ধনের জন্য ন্যূনতম বয়স ১৮ বছর হওয়া বাধ্যতামূলক।');
        return;
      }
    }

    setCurrentStep(3);
  };

  // Step 3: Location, Terms & Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!termsAccepted) {
      setErrorMsg('প্ল্যাটফর্মের শর্তাবলী ও নীতিমালা মেনে নেওয়া আবশ্যক।');
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestOtp(phone.trim(), 'registration');
      if (res.success) {
        setDevOtp(res.devOtp || null);
        setCurrentStep(4);
      } else {
        setErrorMsg(res.message || 'ওটিপি পাঠাতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'সার্ভারে সংযোগ ত্রুটি।');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Verify OTP & Register
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Verify OTP
      const verifyRes = await api.verifyOtp(phone.trim(), otpCode.trim(), 'registration');
      if (!verifyRes.success) {
        setErrorMsg(verifyRes.message || 'ভুল ওটিপি কোড। পুনরায় চেষ্টা করুন।');
        setLoading(false);
        return;
      }

      // 2. Complete Registration
      const regRes = await api.register({
        name: name.trim(),
        phone: phone.trim(),
        password,
        role,
        bloodGroup: role === 'DONOR' ? bloodGroup : undefined,
        division,
        district,
        upazila,
        dateOfBirth: role === 'DONOR' ? dateOfBirth : undefined,
        gender: role === 'DONOR' ? gender : undefined,
        institutionId: institutionId || undefined,
        consentToShareContact,
        termsAccepted
      });

      if (regRes.success) {
        setAuthData(regRes.token, regRes.user, regRes.donorProfile);
        navigate(role === 'DONOR' ? '/donor/dashboard' : '/requests');
      } else {
        setErrorMsg(regRes.message || 'নিবন্ধন সম্পন্ন করা যায়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'নিবন্ধন সম্পন্ন করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'পরিচয় ও ভূমিকা' },
    { num: 2, title: 'রক্তের গ্রুপ ও স্বাস্থ্য' },
    { num: 3, title: 'অবস্থান ও সম্মতি' },
    { num: 4, title: 'মোবাইল যাচাই' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-page py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-red-50 text-primary border border-red-100 rounded-2xl flex items-center justify-center mx-auto shadow-soft">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-mainText tracking-tight">
            স্বেচ্ছাসেবী রক্তদান নেটওয়ার্কে নিবন্ধন
          </h1>
          <p className="text-xs sm:text-sm text-subText">
            আপনার রক্তদানের একটি মানবিক সিদ্ধান্তই বাঁচাতে পারে মুমূর্ষু রোগীর প্রাণ
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between relative z-10">
            {stepsList.map(s => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div 
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                      isPassed 
                        ? 'bg-emerald-600 text-white shadow-soft' 
                        : isCurrent 
                          ? 'bg-primary text-white ring-4 ring-red-100 shadow-soft' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                    isCurrent ? 'text-primary' : isPassed ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Role, Name, Phone, Password */}
        {currentStep === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-mainText mb-2">
                আপনি কী হিসেবে যুক্ত হতে চান?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('DONOR')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                    role === 'DONOR'
                      ? 'border-primary bg-red-50/50 shadow-soft'
                      : 'border-appBorder bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    role === 'DONOR' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-mainText">স্বেচ্ছাসেবী রক্তদাতা</p>
                    <p className="text-[11px] text-subText mt-0.5">জরুরি প্রয়োজনে স্বেচ্ছায় রক্তদানে আগ্রহী</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('REQUESTER')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                    role === 'REQUESTER'
                      ? 'border-primary bg-red-50/50 shadow-soft'
                      : 'border-appBorder bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    role === 'REQUESTER' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-mainText">রক্তপ্রত্যাশী / সাধারণ সদস্য</p>
                    <p className="text-[11px] text-subText mt-0.5">রক্তের অনুরোধ করতে বা পরিবারকে সহায়তা করতে</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">
                  সম্পূর্ণ নাম <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">
                  মোবাইল নম্বর <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">
                পাসওয়ার্ড নির্ধারণ করুন (কমপক্ষে ৬ অক্ষর) <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              iconRight={<ArrowRight className="w-4 h-4" />}
              className="w-full font-bold shadow-soft"
            >
              পরবর্তী ধাপ: স্বাস্থ্য ও অবস্থান
            </Button>
          </form>
        )}

        {/* Step 2: Health, Blood Group, Gender, DOB (Donor Only) */}
        {currentStep === 2 && (
          <form onSubmit={handleNextStep2} className="space-y-6">
            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">রক্তদাতা স্বাস্থ্য ও তথ্য</h4>
                <p className="text-xs text-subText mt-0.5">রক্তদানের সঠিক গ্রুপ এবং উপযুক্ত বয়স নিশ্চিত করুন</p>
              </div>
              <Badge variant="primary">ধাপ ২ / ৪</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">
                  রক্তের গ্রুপ <span className="text-primary">*</span>
                </label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm font-bold text-primary focus:bg-surface focus:border-primary"
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">
                  জন্ম তারিখ (ন্যূনতম ১৮ বছর) <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:bg-surface focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">
                  লিঙ্গ
                </label>
                <select
                  value={gender}
                  onChange={e => {
                    const val = e.target.value as any;
                    setGender(val);
                    if (val === 'female') {
                      setConsentToShareContact(false); // Default false for female privacy
                    } else {
                      setConsentToShareContact(true);
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:bg-surface focus:border-primary"
                >
                  <option value="male">পুরুষ</option>
                  <option value="female">নারী</option>
                  <option value="other">অন্যান্য</option>
                  <option value="unspecified">বলতে অনিচ্ছুক</option>
                </select>
              </div>
            </div>

            {/* Female Donor Privacy Safeguard Banner */}
            {gender === 'female' && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs sm:text-sm">
                  <ShieldCheck className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>নারী রক্তদাতাদের বিশেষ নিরাপত্তা ও গোপনীয়তা সুরক্ষা</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  নারী রক্তদাতাদের নিরাপত্তা ও অনাকাঙ্ক্ষিত কল রোধে আপনার মোবাইল নম্বর প্ল্যাটফর্মে উন্মুক্ত থাকবে না। কেউ রক্তের প্রয়োজনে যোগাযোগ করতে চাইলে তা দায়িত্বপ্রাপ্ত সমন্বয়ক বা ভেরিফাইড চ্যানেলের মাধ্যমে পরিচালিত হবে।
                </p>
                <label className="flex items-start gap-2.5 pt-2 cursor-pointer border-t border-rose-200/60 mt-2">
                  <input
                    type="checkbox"
                    checked={consentToShareContact}
                    onChange={e => setConsentToShareContact(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs font-semibold text-rose-900">
                    (ঐচ্ছিক) আমি অবগত এবং জরুরি প্রয়োজনে প্ল্যাটফর্মে আমার ফোন নম্বর যাচাইকৃত গ্রহীতাদের দেখানোর বিশেষ সম্মতি প্রদান করছি
                  </span>
                </label>
              </div>
            )}

            {/* Institution Affiliation */}
            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">
                শিক্ষা প্রতিষ্ঠান / ক্যাম্পাস অধিভুক্তি (ঐচ্ছিক)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={institutionId}
                  onChange={e => setInstitutionId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:bg-surface focus:border-primary"
                >
                  <option value="">কোনো নির্দিষ্ট প্রতিষ্ঠান নয়</option>
                  {institutions.map(inst => (
                    <option key={inst._id} value={inst._id}>
                      {inst.nameBn} ({inst.code})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-subText mt-1">
                শিক্ষাপ্রতিষ্ঠান নির্বাচন করলে প্রতিষ্ঠান মডারেটরদের মাধ্যমে আপনার স্টুডেন্ট প্রোফাইল যাচাইকৃত ব্যাজ পাবে।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(1)}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="w-1/3"
              >
                পিছনে যান
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                iconRight={<ArrowRight className="w-4 h-4" />}
                className="w-2/3 font-bold shadow-soft"
              >
                পরবর্তী ধাপ: ঠিকানা ও সম্মতি
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Location, Terms & Consent */}
        {currentStep === 3 && (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-appBorder flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">অবস্থান ও গোপনীয়তা সম্মতি</h4>
                <p className="text-xs text-subText mt-0.5">আপনার রক্তদানের এলাকা নির্ধারণ করুন</p>
              </div>
              <Badge variant="info">ধাপ ৩ / ৪</Badge>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-2">
                বর্তমান ঠিকানা / রক্তদানের এলাকা: <span className="text-primary">*</span>
              </label>
              <LocationSelector
                division={division}
                district={district}
                upazila={upazila}
                onDivisionChange={setDivision}
                onDistrictChange={setDistrict}
                onUpazilaChange={setUpazila}
                required
              />
            </div>

            {/* Privacy Preferences */}
            <div className="space-y-3 pt-3 border-t border-appBorder">
              {role === 'DONOR' && gender !== 'female' && (
                <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-appBorder cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentToShareContact}
                    onChange={e => setConsentToShareContact(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="text-xs text-subText">
                    জরুরি রক্তের প্রয়োজনে প্ল্যাটফর্মে লগইনকৃত যাচাইকৃত রোগীদের আমার ফোন নম্বর দেখার অনুমতি প্রদান করছি। (অবাঞ্ছিত যোগাযোগ রোধে দৈনিক সীমা ও অডিট লগ প্রযোজ্য)
                  </span>
                </label>
              )}

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/40 border border-red-100 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs text-mainText font-medium">
                  আমি নিশ্চিত করছি যে আমি স্বেচ্ছায় এই প্ল্যাটফর্মে যুক্ত হচ্ছি এবং প্ল্যাটফর্মের{' '}
                  <Link to="/privacy-terms" className="text-primary font-bold hover:underline">
                    শর্তাবলী ও মানবিক নীতিমালা
                  </Link>{' '}
                  মেনে চলতে প্রতিশ্রুতিবদ্ধ।
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(role === 'REQUESTER' ? 1 : 2)}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="w-1/3"
              >
                পিছনে যান
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                iconRight={<Phone className="w-4 h-4" />}
                className="w-2/3 font-bold shadow-soft"
              >
                {loading ? 'ওটিপি পাঠানো হচ্ছে...' : 'ওটিপি কোড পাঠান'}
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: OTP Verification */}
        {currentStep === 4 && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center space-y-1.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-blue-950">
                {phone} নম্বরে ৬-ডিজিটের ওটিপি পাঠানো হয়েছে
              </h3>
              <p className="text-xs text-blue-800">
                কোডটি পরবর্তী ৫ মিনিটের জন্য কার্যকর থাকবে।
              </p>
            </div>

            {/* Dev Simulator OTP Indicator */}
            {devOtp && (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  [পরীক্ষামূলক/Dev ওটিপি কোড]: <code className="bg-white px-2.5 py-0.5 rounded-lg border font-mono text-sm">{devOtp}</code>
                </span>
                <p className="text-[11px] text-amber-800">
                  স্থানীয় উন্নয়ন ও পরীক্ষার সুবিধার্থে ওটিপি প্রদর্শিত হচ্ছে।
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-mainText text-center">
                মোবাইলে প্রাপ্ত ৬-সংখ্যার কোডটি লিখুন:
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="XXXXXX"
                className="w-48 mx-auto block text-center tracking-widest text-3xl font-extrabold font-mono px-4 py-2.5 bg-slate-50 border border-appBorder rounded-2xl text-mainText focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(3)}
                className="w-1/3"
              >
                পিছনে যান
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                disabled={otpCode.length !== 6}
                iconRight={<CheckCircle2 className="w-4 h-4" />}
                className="w-2/3 font-bold shadow-soft"
              >
                {loading ? 'যাচাই করা হচ্ছে...' : 'যাচাই ও নিবন্ধন সম্পন্ন করুন'}
              </Button>
            </div>
          </form>
        )}

        <div className="text-center pt-4 border-t border-appBorder text-xs text-subText">
          ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে?{' '}
          <Link to="/login" className="font-bold text-primary hover:text-primary-dark underline">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};
