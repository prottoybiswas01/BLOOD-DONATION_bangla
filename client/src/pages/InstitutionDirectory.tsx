import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, Plus, MapPin, Users, Globe, Mail, Phone, CheckCircle2, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshLocations';
import { api } from '../api/client';
import { Institution } from '../types';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const InstitutionDirectory: React.FC = () => {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [search, setSearch] = useState('');
  const [division, setDivision] = useState('');
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('university');
  const [appDivision, setAppDivision] = useState('dhaka');
  const [appDistrict, setAppDistrict] = useState('dhaka');
  const [appUpazila, setAppUpazila] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await api.getInstitutions({ search, division });
      if (res.success && res.institutions) {
        setInstitutions(res.institutions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [search, division]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError(null);

    try {
      const res = await api.createInstitution({
        name,
        nameBn,
        code,
        type,
        division: appDivision,
        district: appDistrict,
        upazila: appUpazila || appDistrict,
        address,
        email,
        phone,
        description,
      });

      if (res.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setShowApplyModal(false);
          setApplySuccess(false);
          fetchInstitutions();
        }, 2000);
      } else {
        setApplyError(res.message || 'আবেদন জমা দেওয়া যায়নি।');
      }
    } catch (err: any) {
      setApplyError(err.message || 'আবেদন জমা দেওয়া যায়নি।');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-mainText flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span>অংশগ্রহণকারী শিক্ষা প্রতিষ্ঠান ও সংগঠনসমূহ</span>
          </h1>
          <p className="text-xs sm:text-sm text-subText mt-1">
            স্বেচ্ছায় রক্তদানে অংশ নেওয়া বাংলাদেশের বিভিন্ন বিশ্ববিদ্যালয়, কলেজ ও মেডিকেল ইউনিট
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowApplyModal(true)}
          className="bg-teal-700 hover:bg-teal-800 shadow-soft"
        >
          প্রতিষ্ঠান যুক্ত করার আবেদন
        </Button>
      </div>

      {/* Filter Box */}
      <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="প্রতিষ্ঠানের নাম বা কোড দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <select
          value={division}
          onChange={e => setDivision(e.target.value)}
          className="w-full sm:w-56 px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-sm font-semibold text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">সকল বিভাগ</option>
          {BANGLADESH_DIVISIONS.map(d => (
            <option key={d.id} value={d.id}>{d.nameBn} ({d.nameEn})</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <div key={n} className="h-64 bg-slate-200/70 animate-pulse rounded-3xl"></div>)}
        </div>
      ) : institutions.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-appBorder p-12 text-center text-subText shadow-soft space-y-3">
          <Building2 className="w-14 h-14 text-slate-300 mx-auto" />
          <h3 className="font-bold text-mainText text-lg">কোনো অনুমোদিত প্রতিষ্ঠান পাওয়া যায়নি</h3>
          <p className="text-xs text-subText max-w-sm mx-auto">আপনার অনুসন্ধানের সাথে মিলে এমন কোনো শিক্ষাপ্রতিষ্ঠান বর্তমানে ডিরেক্টরিতে নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutions.map(inst => (
            <div key={inst._id} className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 flex flex-col justify-between hover:border-teal-300 hover:shadow-elevated transition-all">
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shadow-soft">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <Badge variant="teal" size="sm">
                    {inst.code}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-black text-mainText text-base leading-snug">{inst.nameBn}</h3>
                  <p className="text-xs text-subText mt-0.5">{inst.name}</p>
                </div>

                <div className="text-xs text-subText space-y-1.5 pt-1">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{inst.address}, {inst.district}</span>
                  </p>
                  {inst.website && (
                    <a href={inst.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-teal-700 hover:underline">
                      <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{inst.website}</span>
                    </a>
                  )}
                </div>

                {inst.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{inst.description}"
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-teal-800 font-bold">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>রক্তদাতা: {inst.totalRegisteredDonors} জন</span>
                  </span>
                  <Badge variant="success" size="sm" dot>অনুমোদিত</Badge>
                </div>

                <Link
                  to={`/institutions/${inst._id}`}
                  className="block w-full py-2.5 text-center text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100/80 active:scale-[0.98] rounded-xl transition border border-teal-200 shadow-soft"
                >
                  ক্যাম্পাস ডিরেক্টরি দেখুন →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <Modal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          title="প্রতিষ্ঠান যুক্ত করার আবেদন ফরম"
          description="আপনার স্কুল, কলেজ, বিশ্ববিদ্যালয় বা ক্লাবের তথ্য দিয়ে আবেদন করুন। যাচাইয়ের পর ডিরেক্টরিতে প্রকাশিত হবে।"
          footer={
            applySuccess ? undefined : (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowApplyModal(false)}>
                  বাতিল
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={applyLoading}
                  onClick={handleApply as any}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  আবেদন জমা দিন
                </Button>
              </>
            )
          }
        >
          {applySuccess ? (
            <div className="bg-emerald-50 text-emerald-800 p-8 rounded-2xl text-center space-y-3 border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
              <p className="font-black text-lg">আবেদন সফলভাবে গৃহীত হয়েছে!</p>
              <p className="text-xs text-emerald-700">বিভাগীয় সমন্বয়ক ও প্রশাসনিক পর্যালোচনার পর অনুমোদন জানানো হবে।</p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              {applyError && (
                <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200">
                  {applyError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-mainText mb-1">
                  প্রতিষ্ঠানের পূর্ণ নাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={e => setNameBn(e.target.value)}
                  placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1">
                  প্রতিষ্ঠানের নাম (ইংরেজিতে) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. University of Dhaka"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">
                    কোড / সংক্ষিপ্ত রূপ *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="DU"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">
                    প্রতিষ্ঠানের ধরন *
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
                  >
                    <option value="university">বিশ্ববিদ্যালয়</option>
                    <option value="medical_college">মেডিকেল কলেজ</option>
                    <option value="college">কলেজ</option>
                    <option value="club">স্বেচ্ছাসেবী ক্লাব / সংগঠন</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">বিভাগ *</label>
                  <select
                    value={appDivision}
                    onChange={e => setAppDivision(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
                  >
                    {BANGLADESH_DIVISIONS.map(d => (
                      <option key={d.id} value={d.id}>{d.nameBn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">জেলা *</label>
                  <input
                    type="text"
                    required
                    value={appDistrict}
                    onChange={e => setAppDistrict(e.target.value)}
                    placeholder="যেমন: ঢাকা"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1">ঠিকানা *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="ক্যাম্পাসের সঠিক অবস্থান বা পূর্ণ ঠিকানা"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">অফিসিয়াল ইমেইল</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contact@campus.edu.bd"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mainText mb-1">যোগাযোগ নম্বর</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1">বিবরণ / লক্ষ্য</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="স্বেচ্ছাসেবী বা ব্লাড ক্লাবের সংক্ষিপ্ত বিবরণ..."
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
