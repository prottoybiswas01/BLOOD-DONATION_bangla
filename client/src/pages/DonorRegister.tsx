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
  Sparkles 
} from 'lucide-react';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Institution } from '../types';

export const DonorRegister: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  // Registration form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'DONOR' | 'REQUESTER'>('DONOR');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [division, setDivision] = useState('dhaka');
  const [district, setDistrict] = useState('dhaka');
  const [upazila, setUpazila] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-01');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'unspecified'>('male');
  const [institutionId, setInstitutionId] = useState('');
  const [consentToShareContact, setConsentToShareContact] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // OTP Verification state
  const [step, setStep] = useState<'form' | 'otp'>('form');
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

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate 18+ age for donors
    if (role === 'DONOR' && dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const ageDiff = Date.now() - dob.getTime();
      const age = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
      if (age < 18) {
        setErrorMsg('রক্তদাতা হিসেবে নিবন্ধনের জন্য ন্যূনতম বয়স ১৮ বছর হওয়া বাধ্যতামূলক।');
        return;
      }
    }

    if (!termsAccepted) {
      setErrorMsg('প্ল্যাটফর্মের শর্তাবলী ও নীতিমালা মেনে নেওয়া আবশ্যক।');
      return;
    }

    setLoading(true);
    try {
      // Request OTP
      const res = await api.requestOtp(phone, 'registration');
      if (res.success) {
        setDevOtp(res.devOtp || null);
        setStep('otp');
      } else {
        setErrorMsg(res.message || 'ওটিপি পাঠাতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'সার্ভারে সংযোগ ত্রুটি।');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Verify OTP
      const verifyRes = await api.verifyOtp(phone, otpCode, 'registration');
      if (!verifyRes.success) {
        setErrorMsg(verifyRes.message || 'ভুল ওটিপি কোড।');
        setLoading(false);
        return;
      }

      // 2. Complete Registration
      const regRes = await api.register({
        name,
        phone,
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-2xl flex items-center justify-center mx-auto">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-mainText">স্বেচ্ছায় রক্তদান নেটওয়ার্কে নিবন্ধন</h1>
          <p className="text-xs text-subText">
            আপনার রক্তদানের একটি সিদ্ধান্তই দিতে পারে একটি পরিবারের নতুন ভবিষ্যৎ
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleInitialSubmit} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-mainText mb-1.5">
                নিবন্ধনের ধরণ:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('DONOR')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    role === 'DONOR'
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-page text-mainText border-appBorder hover:bg-gray-100'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>স্বেচ্ছায় রক্তদাতা (Donor)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('REQUESTER')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    role === 'REQUESTER'
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-page text-mainText border-appBorder hover:bg-gray-100'
                  }`}
                >
                  <span>রক্তপ্রত্যাশী (Requester)</span>
                </button>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">
                  আপনার সম্পূর্ণ নাম <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">
                  মোবাইল নম্বর <span className="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-mainText mb-1">
                পাসওয়ার্ড নির্ধারণ করুন (কমপক্ষে ৬ অক্ষর) <span className="text-primary">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Donor specific fields */}
            {role === 'DONOR' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-mainText mb-1">
                      রক্তের গ্রুপ <span className="text-primary">*</span>
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm font-bold text-primary focus:ring-2 focus:ring-primary"
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-mainText mb-1">
                      জন্ম তারিখ (ন্যূনতম ১৮ বছর) <span className="text-primary">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-mainText mb-1">
                      লিঙ্গ
                    </label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                    >
                      <option value="male">পুরুষ</option>
                      <option value="female">নারী</option>
                      <option value="other">অন্যান্য</option>
                      <option value="unspecified">বলতে অনিচ্ছুক</option>
                    </select>
                  </div>
                </div>

                {/* Institution Affiliation */}
                <div>
                  <label className="block text-xs font-semibold text-mainText mb-1">
                    শিক্ষা প্রতিষ্ঠান / ক্যাম্পাস অধিভুক্তি (ঐচ্ছিক)
                  </label>
                  <select
                    value={institutionId}
                    onChange={e => setInstitutionId(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                  >
                    <option value="">কোনো নির্দিষ্ট প্রতিষ্ঠান নয়</option>
                    {institutions.map(inst => (
                      <option key={inst._id} value={inst._id}>
                        {inst.nameBn} ({inst.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="pt-2 border-t border-gray-100">
              <span className="block text-xs font-semibold text-mainText mb-2">
                বর্তমান ঠিকানা / অবস্থান:
              </span>
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

            {/* Privacy & Consent Preferences */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              {role === 'DONOR' && (
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentToShareContact}
                    onChange={e => setConsentToShareContact(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-subText">
                    জরুরি রক্তের প্রয়োজনে প্ল্যাটফর্মে লগইনকৃত যাচাইকৃত রোগীদের আমার ফোন নম্বর দেখার অনুমতি প্রদান করছি। (অবাঞ্ছিত যোগাযোগ রোধে দৈনিক সীমা প্রযোজ্য)
                  </span>
                </label>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary"
                />
                <span className="text-xs text-mainText font-medium">
                  আমি নিশ্চিত করছি যে আমি স্বেচ্ছায় যুক্ত হচ্ছি এবং প্ল্যাটফর্মের{' '}
                  <Link to="/privacy-terms" className="text-primary hover:underline">
                    শর্তাবলী ও নীতিমালা
                  </Link>{' '}
                  মেনে চলতে সম্মতি জানাচ্ছি।
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-colors text-base flex items-center justify-center gap-2 mt-4"
            >
              <Phone className="w-5 h-5" />
              <span>{loading ? 'যাচাই করা হচ্ছে...' : 'ওটিপি কোড পাঠান'}</span>
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleVerifyAndRegister} className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center space-y-1">
              <KeyRound className="w-6 h-6 text-blue-600 mx-auto" />
              <p className="text-xs font-semibold text-blue-900">
                {phone} নম্বরে ৬ ডিজিটের ওটিপি পাঠানো হয়েছে
              </p>
              <p className="text-[11px] text-blue-700">
                কোডটি পরবর্তী ৫ মিনিটের জন্য কার্যকর থাকবে।
              </p>
            </div>

            {/* Dev Simulator OTP Indicator */}
            {devOtp && (
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-center space-y-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  [পরীক্ষামূলক/Dev ওটিপি কোড]: <code className="bg-white px-2 py-0.5 rounded border font-mono text-sm">{devOtp}</code>
                </span>
                <p className="text-[10px] text-amber-700">
                  স্থানীয় উন্নয়ন ও পরীক্ষার সুবিধার্থে ওটিপি প্রদর্শিত হচ্ছে।
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-mainText mb-1 text-center">
                ৬ ডিজিটের ওটিপি কোডটি লিখুন
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="XXXXXX"
                className="w-48 mx-auto block text-center tracking-widest text-2xl font-bold font-mono px-3 py-2 bg-surface border border-appBorder rounded-lg text-mainText focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-1/3 py-2.5 border border-appBorder rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                পিছনে যান
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-2/3 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow transition-colors text-sm disabled:opacity-50"
              >
                {loading ? 'যাচাই হচ্ছে...' : 'যাচাই ও নিবন্ধন সম্পন্ন করুন'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-appBorder text-xs text-subText">
          ইতিমধ্যে অ্যাকাউন্ট রয়েছে?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};

