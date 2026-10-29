import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, AlertCircle, Building2, Phone, Calendar, CheckCircle2, Lock } from 'lucide-react';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Institution } from '../types';

export const CreateBloodRequest: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('A+');
  const [unitsRequired, setUnitsRequired] = useState<number>(1);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [division, setDivision] = useState('dhaka');
  const [district, setDistrict] = useState('dhaka');
  const [upazila, setUpazila] = useState('');
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // default tomorrow
  );
  const [urgencyLevel, setUrgencyLevel] = useState<'emergency' | 'urgent' | 'standard'>('emergency');
  const [reason, setReason] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [alternativeContactNumber, setAlternativeContactNumber] = useState('');
  const [institutionId, setInstitutionId] = useState('');

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.phone && !contactNumber) {
      setContactNumber(user.phone);
    }

    async function loadInsts() {
      try {
        const res = await api.getInstitutions();
        if (res.success && res.institutions) {
          setInstitutions(res.institutions);
        }
      } catch {}
    }
    loadInsts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('রক্তের আবেদন পোস্ট করতে অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }

    if (!patientName.trim()) {
      setErrorMsg('রোগীর নাম আবশ্যক।');
      return;
    }

    if (!hospitalName.trim() || !hospitalAddress.trim()) {
      setErrorMsg('হাসপাতালের নাম ও সম্পূর্ণ ঠিকানা প্রদান করুন।');
      return;
    }

    if (!contactNumber.trim()) {
      setErrorMsg('জরুরি যোগাযোগের মোবাইল নম্বর দিন।');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.createRequest({
        patientName,
        bloodGroup,
        unitsRequired: Number(unitsRequired),
        hospitalName,
        hospitalAddress,
        division,
        district,
        upazila,
        requiredDate,
        urgencyLevel,
        reason,
        contactNumber,
        alternativeContactNumber: alternativeContactNumber || undefined,
        institutionId: institutionId || undefined
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/requests');
        }, 2000);
      } else {
        setErrorMsg(res.message || 'অনুরোধ প্রকাশ করা যায়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'অনুরোধ প্রকাশে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface rounded-2xl border border-appBorder shadow-card text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-primary rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-mainText">লগইন আবশ্যক</h2>
        <p className="text-xs text-subText">
          ভুয়া অনুরোধ ও অপব্যবহার রোধে রক্তপ্রত্যাশীদের মোবাইল ভেরিফিকেশন ও একাউন্ট থাকা বাধ্যতামূলক।
        </p>
        <div className="space-y-2 pt-2">
          <Link
            to="/login"
            className="w-full block py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow transition-colors"
          >
            লগইন করুন
          </Link>
          <Link
            to="/register"
            className="w-full block py-2.5 border border-appBorder hover:bg-gray-50 text-mainText rounded-xl font-medium text-sm transition-colors"
          >
            নতুন অ্যাকাউন্ট তৈরি করুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 sm:p-10 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-mainText flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-primary" />
            <span>জরুরি রক্তের আবেদন ফরম</span>
          </h1>
          <p className="text-xs text-subText mt-1">
            সঠিক তথ্য দিয়ে পোস্ট করুন যাতে আশেপাশের রক্তদাতারা দ্রুত সাড়া দিতে পারেন
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-appSuccess p-8 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto" />
            <h3 className="text-xl font-bold">রক্তের আবেদন সফলভাবে প্রকাশিত হয়েছে!</h3>
            <p className="text-xs text-green-700">
              নিকটবর্তী সংশ্লিষ্ট গ্রুপের রক্তদাতাদের জানানো হচ্ছে। আপনাকে সরাসরি ফিডে নিয়ে যাওয়া হচ্ছে...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Patient Name & Blood Group */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-mainText mb-1">
                  রোগীর নাম ও বয়স <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="যেমন: ফরিদা বেগম (৪৫)"
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                />
              </div>

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
            </div>

            {/* Units & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">
                  প্রয়োজনীয় রক্তের পরিমাণ (ব্যাগ) <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={unitsRequired}
                  onChange={e => setUnitsRequired(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">
                  জরুরিতার মাত্রা <span className="text-primary">*</span>
                </label>
                <select
                  value={urgencyLevel}
                  onChange={e => setUrgencyLevel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                >
                  <option value="emergency">জরুরি (আজকেই প্রয়োজন)</option>
                  <option value="urgent">অতি জরুরি (আগামীকাল)</option>
                  <option value="standard">নিয়মিত (নির্দিষ্ট তারিখে)</option>
                </select>
              </div>
            </div>

            {/* Hospital Name & Address */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">
                  হাসপাতালের নাম <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল"
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">
                  হাসপাতালের বিস্তারিত অবস্থান / ওয়ার্ড / বেড নং <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={hospitalAddress}
                  onChange={e => setHospitalAddress(e.target.value)}
                  placeholder="যেমন: জরুরি বিভাগ, নতুন ভবন, ৪র্থ তলা, ওটি-২"
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Location Selector */}
            <div>
              <span className="block text-xs font-semibold text-mainText mb-2">
                হাসপাতালের ভৌগোলিক অবস্থান:
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

            {/* Date Required & Optional Institution Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">
                  রক্তদানের সম্ভাব্য তারিখ <span className="text-primary">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={requiredDate}
                  onChange={e => setRequiredDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">
                  সংশ্লিষ্ট ক্যাম্পাস/প্রতিষ্ঠান (ঐচ্ছিক)
                </label>
                <select
                  value={institutionId}
                  onChange={e => setInstitutionId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
                >
                  <option value="">কোনো সুনির্দিষ্ট প্রতিষ্ঠান নয়</option>
                  {institutions.map(inst => (
                    <option key={inst._id} value={inst._id}>
                      {inst.nameBn} ({inst.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">
                  যোগাযোগের মোবাইল নম্বর <span className="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">
                  বিকল্প মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="tel"
                  value={alternativeContactNumber}
                  onChange={e => setAlternativeContactNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
            </div>

            {/* Medical Reason */}
            <div>
              <label className="block text-xs font-semibold text-mainText mb-1">
                রক্তের প্রয়োজনীয়তার কারণ <span className="text-primary">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="যেমন: রোগীর সিজারিয়ান অপারেশন / থ্যালাসেমিয়া নিয়মিত ট্রান্সফিউশন / সড়ক দুর্ঘটনা ইত্যাদি..."
                className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-colors text-base flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>{loading ? 'আবেদন জমা হচ্ছে...' : 'রক্তের আবেদন প্রকাশ করুন'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
