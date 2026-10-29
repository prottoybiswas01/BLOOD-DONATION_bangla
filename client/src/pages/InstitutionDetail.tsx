import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Globe, 
  HeartHandshake, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  Droplet
} from 'lucide-react';
import { api } from '../api/client';
import { Institution, DonorProfile } from '../types';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { useAuth } from '../context/AuthContext';
import { DonorCard } from '../components/DonorCard';

export const InstitutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contact request modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [targetBloodGroup, setTargetBloodGroup] = useState<BloodGroup>('O+');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [urgency, setUrgency] = useState<'emergency' | 'urgent' | 'standard'>('emergency');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.getInstitutionById(id);
        if (res.success && res.institution) {
          setInstitution(res.institution);
        } else {
          setError('প্রতিষ্ঠানটি খুঁজে পাওয়া যায়নি।');
        }

        // Load donors from this institution
        const donorRes = await api.searchDonors({ institutionId: id });
        if (donorRes.success && donorRes.donors) {
          setDonors(donorRes.donors);
        }
      } catch (err: any) {
        setError(err.message || 'তথ্য লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSubmitError('যোগাযোগের অনুরোধ পাঠানোর পূর্বে অনুগ্রহ করে লগইন করুন।');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await api.submitContactRequest({
        institutionId: id,
        targetBloodGroup,
        patientName,
        hospitalName,
        unitsRequired: Number(unitsRequired),
        urgency,
        reason
      });

      if (res.success) {
        setSubmitSuccess(res.message || 'অনুরোধটি সফলভাবে গৃহীত হয়েছে!');
        setTimeout(() => {
          setShowContactModal(false);
          setSubmitSuccess(null);
          // reset form
          setPatientName('');
          setHospitalName('');
          setReason('');
        }, 2500);
      } else {
        setSubmitError(res.message || 'অনুরোধ জমা দিতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'অনুরোধ পাঠাতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDonors = selectedBloodGroup
    ? donors.filter(d => d.bloodGroup === selectedBloodGroup)
    : donors;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">প্রতিষ্ঠান পাওয়া যায়নি</h2>
        <p className="text-sm text-gray-500 mb-6">{error || 'অনুরোধকৃত প্রতিষ্ঠানটির তথ্য সিস্টেমে নেই।'}</p>
        <Link to="/institutions" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>প্রতিষ্ঠান তালিকায় ফিরুন</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/institutions" className="inline-flex items-center gap-1.5 text-xs text-subText hover:text-primary font-medium transition">
        <ArrowLeft className="w-4 h-4" />
        <span>প্রতিষ্ঠান তালিকায় ফিরে যান</span>
      </Link>

      {/* Institution Banner Card */}
      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-appBorder">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-tealAccent shrink-0 shadow-sm">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 uppercase">
                  {institution.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {institution.type === 'university' ? 'বিশ্ববিদ্যালয়' : institution.type === 'college' ? 'কলেজ' : institution.type === 'medical' ? 'মেডিকেল কলেজ' : 'শিক্ষা প্রতিষ্ঠান'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>অনুমোদিত রক্তদান ইউনিট</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-mainText">{institution.nameBn}</h1>
              <p className="text-sm text-subText">{institution.name}</p>
            </div>
          </div>

          {/* Action button: Send Contact Request */}
          <button
            onClick={() => setShowContactModal(true)}
            className="w-full sm:w-auto px-5 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>প্রতিষ্ঠানে রক্তের অনুরোধ পাঠান</span>
          </button>
        </div>

        {/* Institution Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs text-subText">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>{institution.address}, {institution.district}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-tealAccent shrink-0" />
            <span>মোট নিবন্ধিত রক্তদাতা: <strong className="text-mainText text-sm font-bold">{institution.totalRegisteredDonors || donors.length}</strong> জন</span>
          </div>
          {institution.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{institution.phone}</span>
            </div>
          )}
          {institution.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{institution.email}</span>
            </div>
          )}
        </div>

        {institution.description && (
          <p className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
            {institution.description}
          </p>
        )}
      </div>

      {/* Donors Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-mainText flex items-center gap-2">
              <Droplet className="w-5 h-5 text-primary" />
              <span>এই প্রতিষ্ঠানের রক্তদাতাগণ ({filteredDonors.length} জন)</span>
            </h2>
            <p className="text-xs text-subText">সরাসরি বা মডারেটরের মাধ্যমে দ্রুত যোগাযোগ করুন</p>
          </div>

          {/* Filter by Blood Group */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedBloodGroup('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedBloodGroup === ''
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-subText border border-appBorder hover:bg-gray-100'
              }`}
            >
              সব গ্রুপ
            </button>
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => setSelectedBloodGroup(bg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedBloodGroup === bg
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface text-subText border border-appBorder hover:bg-gray-100'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {filteredDonors.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-appBorder p-12 text-center text-subText space-y-2">
            <Users className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-sm font-semibold text-mainText">এই রক্তের গ্রুপের কোনো রক্তদাতা এখনো নিবন্ধিত নেই</p>
            <p className="text-xs">আপনি কি এই প্রতিষ্ঠানের শিক্ষার্থী বা কর্মী? আজই রক্তদাতা হিসেবে যোগ দিন।</p>
            <div className="pt-2">
              <Link to="/register" className="inline-block px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm">
                রক্তদাতা নিবন্ধন করুন
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDonors.map(donor => (
              <DonorCard key={donor._id} donor={donor} />
            ))}
          </div>
        )}
      </div>

      {/* Contact Request Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">প্রতিষ্ঠানে রক্তের অনুরোধ</h3>
                  <p className="text-xs text-gray-500">{institution.nameBn}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    প্রয়োজনীয় রক্তের গ্রুপ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={targetBloodGroup}
                    onChange={e => setTargetBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-red-600 focus:ring-2 focus:ring-primary"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    রক্তের ব্যাগ / ইউনিট
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={unitsRequired}
                    onChange={e => setUnitsRequired(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  রোগীর নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="যেমন: রোগীর পূর্ণ নাম"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  হাসপাতাল / ক্লিনিকের নাম ও ঠিকানা <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  placeholder="যেমন: ঢাকা মেডিকেল কলেজ ও হাসপাতাল"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  জরুরিতা স্তর
                </label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="emergency">জরুরি (আজকের মধ্যে প্রয়োজন)</option>
                  <option value="urgent">অতি দ্রুত (আগামী ২৪-৪৮ ঘণ্টার মধ্যে)</option>
                  <option value="standard">সাধারণ (নির্ধারিত তারিখে)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  রক্তের কারণ ও সংক্ষিপ্ত বর্ণনা <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="রোগীর শারীরিক অবস্থা বা অপারেশনের বিবরণ লিখুন..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting || !!submitSuccess}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? 'প্রেরণ হচ্ছে...' : 'অনুরোধ নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
