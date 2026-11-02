import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  AlertCircle, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  HeartPulse, 
  User, 
  Share2, 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DigitalBloodRequestCard } from '../components/DigitalBloodRequestCard';
import { BloodRequest } from '../types';

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
  const [requiredWithin, setRequiredWithin] = useState('জরুরি, এখনই প্রয়োজন।');
  const [urgencyLevel, setUrgencyLevel] = useState<'emergency' | 'urgent' | 'standard'>('emergency');
  const [reason, setReason] = useState('');
  const [contactPersonName, setContactPersonName] = useState(user?.name || '');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [alternativeContactNumber, setAlternativeContactNumber] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [consentForPublicShare, setConsentForPublicShare] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<BloodRequest | null>(null);

  useEffect(() => {
    if (user?.phone && !contactNumber) {
      setContactNumber(user.phone);
    }
    if (user?.name && !contactPersonName) {
      setContactPersonName(user.name);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-surface rounded-3xl border border-appBorder p-8 shadow-card space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-primary flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-mainText">রক্তের অনুরোধ পোস্ট করতে লগইন করুন</h2>
          <p className="text-xs text-subText leading-relaxed">
            রোগীর সুরক্ষা ও ভুয়া আবেদন প্রতিরোধে প্ল্যাটফর্মে রক্তের জরুরি আবেদন পোস্ট করতে অ্যাকাউন্ট লগইন বাধ্যতামূলক।
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/login?redirect=/create-request">
              <Button variant="primary" size="md">লগইন করুন</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="md">নতুন অ্যাকাউন্ট তৈরি করুন</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

    if (!consentForPublicShare) {
      setErrorMsg('জরুরি রক্তদাতা অনুসন্ধানে তথ্যের সত্যতা ও যোগাযোগের সম্মতি দিন।');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.createRequest({
        patientName: patientName.trim(),
        bloodGroup,
        unitsRequired: Number(unitsRequired),
        hospitalName: hospitalName.trim(),
        hospitalAddress: hospitalAddress.trim(),
        division,
        district,
        upazila,
        requiredDate,
        requiredWithin,
        urgencyLevel,
        reason: reason.trim(),
        contactPersonName: contactPersonName.trim() || user.name,
        contactNumber: contactNumber.trim(),
        alternativeContactNumber: alternativeContactNumber.trim() || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
        consentForPublicShare
      });

      if (res.success && res.data) {
        setCreatedRequest(res.data);
      } else {
        setErrorMsg(res.message || 'অনুরোধ পোস্ট করা যায়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'সার্ভারে সংযোগ স্থাপন সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-surface rounded-3xl border border-appBorder shadow-elevated p-6 sm:p-10 space-y-8">
        <div className="border-b border-appBorder pb-5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-rose-100 text-primary flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-mainText">জরুরি রক্তের আবেদন ফরম</h1>
              <p className="text-xs text-subText mt-0.5">
                সঠিক তথ্য দিয়ে পোস্ট করুন যাতে ডিজিটাল কার্ড ও কিউআর কোডসহ দ্রুত রক্তদাতা পাওয়া যায়
              </p>
            </div>
          </div>
        </div>

        {createdRequest ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-emerald-950">রক্তের আবেদন সফলভাবে প্রকাশিত হয়েছে!</h3>
              <p className="text-sm text-emerald-700 max-w-lg mx-auto">
                আপনার আবেদনের জন্য একটি স্বয়ংক্রিয় ডিজিটাল কার্ড ও কিউআর কোড তৈরি হয়েছে। ফেসবুক, হোয়াটসঅ্যাপ বা সরাসরি প্রিন্ট করে শেয়ার করুন।
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Link to={`/blood-request/${createdRequest.publicId || createdRequest._id}`}>
                  <Button variant="primary" size="md">
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    লাইভ কিউআর ল্যান্ডিং পেজে যান
                  </Button>
                </Link>
                <Link to="/requests">
                  <Button variant="outline" size="md">
                    সকল আবেদন তালিকা
                  </Button>
                </Link>
              </div>
            </div>

            {/* Embedded Digital Blood Request Card */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-center font-bold text-mainText text-lg mb-4">আপনার ডিজিটাল ব্লাড রিকোয়েস্ট কার্ড</h4>
              <DigitalBloodRequestCard request={createdRequest} />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-7">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-primary" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Patient Name & Blood Group */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-subText uppercase tracking-wider">১. রোগীর স্বাস্থ্য তথ্য</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    রোগীর নাম ও বয়স <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="যেমন: ফরিদা বেগম (৪৫)"
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    রক্তের গ্রুপ <span className="text-primary">*</span>
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    প্রয়োজনীয় রক্তের পরিমাণ (ব্যাগ) <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={unitsRequired}
                    onChange={e => setUnitsRequired(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    জরুরিতার মাত্রা <span className="text-primary">*</span>
                  </label>
                  <select
                    value={urgencyLevel}
                    onChange={e => setUrgencyLevel(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="emergency">জরুরি (আজকেই প্রয়োজন)</option>
                    <option value="urgent">অতি জরুরি (আগামীকাল প্রয়োজন)</option>
                    <option value="standard">নিয়মিত (নির্দিষ্ট তারিখে)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hospital Name & Address */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-subText uppercase tracking-wider">২. হাসপাতালের অবস্থান ও তারিখ</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    হাসপাতালের নাম <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল"
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    হাসপাতালের বিস্তারিত অবস্থান / ওয়ার্ড / বেড নং <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hospitalAddress}
                    onChange={e => setHospitalAddress(e.target.value)}
                    placeholder="যেমন: জরুরি বিভাগ, নতুন ভবন, ৪র্থ তলা, ওটি-২"
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Location Selector */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                <span className="block text-xs font-bold text-mainText mb-2.5">
                  হাসপাতালের ভৌগোলিক এলাকা নির্বাচন করুন:
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

              {/* Date Required & Required Within Timeframe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    রক্তদানের সম্ভাব্য তারিখ <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={requiredDate}
                    onChange={e => setRequiredDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    রক্ত কত সময়ের মধ্যে প্রয়োজন? <span className="text-primary">*</span>
                  </label>
                  <select
                    value={requiredWithin}
                    onChange={e => setRequiredWithin(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm font-semibold text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="জরুরি, এখনই প্রয়োজন।">জরুরি, এখনই প্রয়োজন।</option>
                    <option value="৬ ঘণ্টার মধ্যে">৬ ঘণ্টার মধ্যে</option>
                    <option value="১২ ঘণ্টার মধ্যে">১২ ঘণ্টার মধ্যে</option>
                    <option value="২৪ ঘণ্টার মধ্যে">২৪ ঘণ্টার মধ্যে</option>
                    <option value="২ দিনের মধ্যে">২ দিনের মধ্যে</option>
                    <option value="৩ দিনের মধ্যে">৩ দিনের মধ্যে</option>
                    <option value="নির্দিষ্ট তারিখ ও সময়">নির্দিষ্ট তারিখ ও সময়</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Numbers & Authorized Person */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-subText uppercase tracking-wider">৩. যোগাযোগ ও চিকিৎসা কারণ</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    যোগাযোগের ব্যক্তির নাম <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPersonName}
                    onChange={e => setContactPersonName(e.target.value)}
                    placeholder="যেমন: রোগীর ভাই / আত্মীয়"
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    যোগাযোগের মোবাইল নম্বর <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1.5">
                    বিকল্প মোবাইল নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    value={alternativeContactNumber}
                    onChange={e => setAlternativeContactNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                  />
                </div>
              </div>

              {/* Medical Reason */}
              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">
                  রক্তের প্রয়োজনীয়তার কারণ <span className="text-primary">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="যেমন: রোগীর সিজারিয়ান অপারেশন / থ্যালাসেমিয়া নিয়মিত ট্রান্সফিউশন / সড়ক দুর্ঘটনা ইত্যাদি..."
                  className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">
                  রক্তদাতাদের জন্য বিশেষ নির্দেশনা (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="যেমন: রক্তদাতাকে যাতায়াত সহায়তা দেওয়া হবে / রক্তের ক্রস-ম্যাচিং খরচ পরিবার বহন করবে..."
                  className="w-full px-4 py-2.5 bg-surface border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Public Sharing Consent */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={consentForPublicShare}
                    onChange={e => setConsentForPublicShare(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    আমি নিশ্চিত করছি যে উপরের তথ্যসমূহ সঠিক এবং রক্তের জরুরি প্রয়োজনে রক্তদাতাদের সাথে যোগাযোগ ও সামাজিক মাধ্যমে ডিজিটাল কার্ড শেয়ার করার পূর্ণ সম্মতি দিচ্ছি।
                  </span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-appBorder">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                disabled={loading}
                icon={<PlusCircle className="w-5 h-5" />}
                className="w-full shadow-soft"
              >
                {loading ? 'আবেদন প্রকাশ হচ্ছে...' : 'রক্তের আবেদন প্রকাশ করুন ও ডিজিটাল কার্ড তৈরি করুন'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
