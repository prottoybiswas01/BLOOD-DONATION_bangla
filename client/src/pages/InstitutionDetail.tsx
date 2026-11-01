import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Globe, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  Droplet,
  GraduationCap
} from 'lucide-react';
import { api } from '../api/client';
import { Institution, DonorProfile } from '../types';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { useAuth } from '../context/AuthContext';
import { DonorCard } from '../components/DonorCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-primary flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-mainText">প্রতিষ্ঠান পাওয়া যায়নি</h2>
        <p className="text-sm text-subText max-w-sm mx-auto">{error || 'অনুরোধকৃত প্রতিষ্ঠানটির তথ্য সিস্টেমে নেই।'}</p>
        <Link to="/institutions">
          <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            প্রতিষ্ঠান তালিকায় ফিরুন
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/institutions" className="inline-flex items-center gap-1.5 text-xs text-subText hover:text-primary font-bold transition">
        <ArrowLeft className="w-4 h-4" />
        <span>প্রতিষ্ঠান তালিকায় ফিরে যান</span>
      </Link>

      {/* Institution Banner Card */}
      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-appBorder">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 shadow-soft">
              <GraduationCap className="w-9 h-9" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Badge variant="teal" size="sm">
                  {institution.code}
                </Badge>
                <Badge variant="neutral" size="sm">
                  {institution.type === 'university' ? 'বিশ্ববিদ্যালয়' : institution.type === 'college' ? 'কলেজ' : institution.type === 'medical' ? 'মেডিকেল কলেজ' : 'শিক্ষা প্রতিষ্ঠান'}
                </Badge>
                <Badge variant="success" size="sm" dot>
                  অনুমোদিত রক্তদান ইউনিট
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-mainText">{institution.nameBn}</h1>
              <p className="text-sm text-subText mt-0.5">{institution.name}</p>
            </div>
          </div>

          {/* Action button: Send Contact Request */}
          <Button
            variant="primary"
            size="lg"
            icon={<Send className="w-4 h-4" />}
            onClick={() => setShowContactModal(true)}
            className="w-full md:w-auto shadow-soft"
          >
            প্রতিষ্ঠানে রক্তের অনুরোধ পাঠান
          </Button>
        </div>

        {/* Institution Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs text-subText">
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{institution.address}, {institution.district}</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <Users className="w-4 h-4 text-teal-700 shrink-0" />
            <span>নিবন্ধিত রক্তদাতা: <strong className="text-mainText text-sm font-black">{institution.totalRegisteredDonors || donors.length}</strong> জন</span>
          </div>
          {institution.phone && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-mono">{institution.phone}</span>
            </div>
          )}
          {institution.email && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-mono truncate">{institution.email}</span>
            </div>
          )}
        </div>

        {institution.description && (
          <p className="mt-4 pt-4 border-t border-appBorder text-xs text-slate-600 leading-relaxed">
            {institution.description}
          </p>
        )}
      </div>

      {/* Donors Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-mainText flex items-center gap-2.5">
              <Droplet className="w-5 h-5 text-primary" />
              <span>এই প্রতিষ্ঠানের রক্তদাতাগণ ({filteredDonors.length} জন)</span>
            </h2>
            <p className="text-xs text-subText mt-0.5">সরাসরি বা মডারেটরের মাধ্যমে দ্রুত যোগাযোগ করুন</p>
          </div>

          {/* Filter by Blood Group */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedBloodGroup('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedBloodGroup === ''
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-surface text-subText border border-appBorder hover:bg-slate-50'
              }`}
            >
              সব গ্রুপ
            </button>
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => setSelectedBloodGroup(selectedBloodGroup === bg ? '' : bg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedBloodGroup === bg
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-surface text-subText border border-appBorder hover:bg-slate-50'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {filteredDonors.length === 0 ? (
          <div className="bg-surface rounded-3xl border border-appBorder p-12 text-center text-subText shadow-soft space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-mainText text-base">এই গ্রুপে কোনো রক্তদাতা নিবন্ধিত নেই</h3>
            <p className="text-xs text-subText">অন্য কোনো রক্তের গ্রুপ নির্বাচন করে দেখুন অথবা সরাসরি অনুরোধ পাঠান।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map(donor => (
              <DonorCard key={donor._id} donor={donor} />
            ))}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <Modal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          title="প্রতিষ্ঠানের মডারেটরের কাছে রক্তের অনুরোধ"
          description={`ক্যাম্পাসের রক্তদাতাদের মধ্যে সমন্বয় করতে এই আবেদনটি ${institution.nameBn}-এর মডারেটরের কাছে পাঠানো হবে।`}
          footer={
            submitSuccess ? undefined : (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowContactModal(false)}>
                  বাতিল
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                  onClick={handleContactSubmit as any}
                >
                  অনুরোধ পাঠান
                </Button>
              </>
            )
          }
        >
          {submitSuccess ? (
            <div className="bg-emerald-50 text-emerald-800 p-8 rounded-2xl text-center space-y-3 border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
              <p className="font-black text-lg">{submitSuccess}</p>
              <p className="text-xs text-emerald-700">প্রতিষ্ঠানের মডারেটর শীঘ্রই আপনার সাথে যোগাযোগ করবেন।</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {submitError && (
                <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">রোগীর নাম *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="রোগীর নাম"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">রক্তের গ্রুপ *</label>
                  <select
                    value={targetBloodGroup}
                    onChange={e => setTargetBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs font-bold text-primary"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">প্রয়োজনীয় ব্যাগ *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={unitsRequired}
                    onChange={e => setUnitsRequired(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">জরুরিতা *</label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
                  >
                    <option value="emergency">জরুরি (আজকেই)</option>
                    <option value="urgent">অতি জরুরি (আগামীকাল)</option>
                    <option value="standard">নিয়মিত</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1">হাসপাতালের নাম ও অবস্থান *</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1">রোগীর বিবরণ / কারণ *</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="অপারেশন / রক্তস্বল্পতা ইত্যাদির সংক্ষিপ্ত বিবরণ..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
                />
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
