import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  KeyRound, 
  ArrowRight,
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Lock,
  Heart,
  Droplet,
  Users
} from 'lucide-react';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const DonorRegister: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  // Multi-step progress (1: Role & Identity, 2: Health & Blood, 3: Location & Agreement)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form fields
  const [role, setRole] = useState<'DONOR' | 'REQUESTER'>('DONOR');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-01');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'unspecified'>('male');
  const [division, setDivision] = useState('dhaka');
  const [district, setDistrict] = useState('dhaka');
  const [upazila, setUpazila] = useState('');
  const [consentToShareContact, setConsentToShareContact] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validation before proceeding from Step 1 to Step 2
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 01XXXXXXXXX)।');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('কমপক্ষে ৬ অক্ষরের একটি শক্তিশালী পাসওয়ার্ড নির্ধারণ করুন।');
      return;
    }

    if (role === 'REQUESTER') {
      // Requesters can skip the blood group / medical step
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

  // Final Direct Registration (No OTP required)
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!termsAccepted) {
      setErrorMsg('প্ল্যাটফর্মের শর্তাবলী ও নীতিমালা মেনে নেওয়া আবশ্যক।');
      return;
    }

    setLoading(true);

    try {
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
        consentToShareContact,
        termsAccepted
      });

      if (regRes.success) {
        setAuthData(regRes.token, regRes.user, regRes.donorProfile);
        navigate(role === 'DONOR' ? '/donor/dashboard' : '/requester/dashboard');
      } else {
        setErrorMsg(regRes.message || 'নিবন্ধন সম্পন্ন করা যায়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'নিবন্ধন সম্পন্ন করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = role === 'DONOR' 
    ? [
        { num: 1, title: 'পরিচয় ও ভূমিকা' },
        { num: 2, title: 'রক্তের গ্রুপ ও স্বাস্থ্য' },
        { num: 3, title: 'অবস্থান ও সম্মতি' }
      ]
    : [
        { num: 1, title: 'পরিচয় ও যোগাযোগ' },
        { num: 3, title: 'অবস্থান ও সম্মতি' }
      ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-page py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-surface rounded-3xl border border-appBorder shadow-elevated p-6 sm:p-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="w-14 h-14 bg-rose-50 text-primary border border-rose-100 rounded-2xl flex items-center justify-center mx-auto shadow-soft">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-mainText tracking-tight">
            নতুন সদস্য নিবন্ধন
          </h1>
          <p className="text-xs sm:text-sm text-subText">
            মানবতার সেবায় সরাসরি রক্তদাতা অথবা রক্তপ্রত্যাশী হিসেবে যুক্ত হোন
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 border-b border-appBorder pb-6">
          {stepsList.map(st => {
            const isActive = currentStep === st.num;
            const isCompleted = currentStep > st.num;
            return (
              <div key={st.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-soft scale-105' 
                    : isCompleted 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {isCompleted ? '✓' : st.num}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${
                  isActive ? 'text-primary font-bold' : isCompleted ? 'text-emerald-700' : 'text-slate-500'
                }`}>
                  {st.title}
                </span>
                {st.num !== 3 && <span className="text-slate-300 font-bold hidden sm:inline">→</span>}
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-primary" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Role & Identity */}
        {currentStep === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-mainText mb-2.5">
                আপনার প্রধান ভূমিকা নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setRole('DONOR')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    role === 'DONOR'
                      ? 'border-primary bg-rose-50/70 shadow-soft ring-1 ring-primary/40'
                      : 'border-appBorder bg-slate-50 hover:bg-slate-100/70'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    role === 'DONOR' ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-mainText">স্বেচ্ছায় রক্তদাতা (Donor)</h4>
                    <p className="text-[11px] text-subText mt-0.5">আমি রক্তদান করে মানুষের জীবন বাঁচাতে প্রস্তুত</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('REQUESTER')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    role === 'REQUESTER'
                      ? 'border-primary bg-rose-50/70 shadow-soft ring-1 ring-primary/40'
                      : 'border-appBorder bg-slate-50 hover:bg-slate-100/70'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    role === 'REQUESTER' ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-mainText">রক্তপ্রত্যাশী (Requester)</h4>
                    <p className="text-[11px] text-subText mt-0.5">আমার রোগী বা স্বজনের জন্য রক্তের প্রয়োজন</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Name */}
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">
                মোবাইল নম্বর (১১ ডিজিট) <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <p className="text-[11px] text-subText mt-1">লগইন করতে এই মোবাইল নম্বরটি ইউজার আইডি হিসেবে ব্যবহৃত হবে।</p>
            </div>

            {/* Password */}
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full shadow-soft"
            >
              পরবর্তী ধাপ
            </Button>
          </form>
        )}

        {/* Step 2: Health & Blood (Only for Donor) */}
        {currentStep === 2 && (
          <form onSubmit={handleNextStep2} className="space-y-6">
            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-mainText mb-2.5">
                রক্তের গ্রুপ নির্বাচন করুন <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {BLOOD_GROUPS.map(bg => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-3 rounded-2xl text-sm font-black border transition-all ${
                      bloodGroup === bg
                        ? 'bg-primary text-white border-primary shadow-glow scale-105'
                        : 'bg-slate-50 hover:bg-rose-50 text-mainText border-appBorder'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Date of Birth & Age Check */}
            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">
                জন্ম তারিখ (ন্যূনতম ১৮ বছর বয়স আবশ্যক) <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-mainText mb-2">
                লিঙ্গ (Gender)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'male', label: 'পুরুষ' },
                  { id: 'female', label: 'নারী' },
                  { id: 'other', label: 'অন্যান্য' }
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGender(g.id as any);
                      if (g.id === 'female') {
                        setConsentToShareContact(false); // Default safety for female donors
                      }
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      gender === g.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-soft'
                        : 'bg-slate-50 text-slate-700 border-appBorder hover:bg-slate-100'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(1)}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="flex-1"
              >
                পূর্ববর্তী
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                className="flex-1 shadow-soft"
              >
                পরবর্তী ধাপ
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Location & Agreement */}
        {currentStep === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-mainText">
                আপনার বর্তমান ভৌগোলিক অবস্থান <span className="text-primary">*</span>
              </label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
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
            </div>

            {/* Privacy for Donors */}
            {role === 'DONOR' && (
              <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consentToShareContact"
                    checked={consentToShareContact}
                    onChange={e => setConsentToShareContact(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="consentToShareContact" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                    <strong>জরুরি প্রয়োজনে আমার সাথে যোগাযোগের অনুমতি দিচ্ছি।</strong> <br />
                    (আপনার ফোন নম্বর সরাসরি উন্মুক্ত থাকবে না; কেবল যাচাইকৃত ও অনুমোদিত রক্তপ্রত্যাশীদের দৈনিক সীমিত নিয়মে দেখার সুযোগ থাকবে)
                  </label>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  required
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="termsAccepted" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                  আমি স্বীকার করছি যে আমি সম্পূর্ণ স্বেচ্ছায় ও নিঃস্বার্থভাবে যুক্ত হচ্ছি। রক্তের বিনিময়ে কোনো প্রকার আর্থিক লেনদেন আইনত দণ্ডনীয় এবং আমি প্ল্যাটফর্মের <Link to="/privacy-terms" target="_blank" className="text-primary font-bold underline">শর্তাবলী ও নীতিমালা</Link> মেনে চলব।
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(role === 'DONOR' ? 2 : 1)}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="flex-1"
              >
                পূর্ববর্তী
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="flex-1 shadow-soft"
              >
                নিবন্ধন সম্পন্ন করুন
              </Button>
            </div>
          </form>
        )}

        {/* Footer login link */}
        <div className="text-center text-xs text-subText pt-2 border-t border-appBorder">
          ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};
