import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MapPin, Users, Globe, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshLocations';
import { api } from '../api/client';
import { Institution } from '../types';
import { useAuth } from '../context/AuthContext';
import { DemoBanner } from '../components/DemoBanner';

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
      <DemoBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-mainText flex items-center gap-2">
            <Building2 className="w-7 h-7 text-tealAccent" />
            <span>অংশগ্রহণকারী শিক্ষা প্রতিষ্ঠান ও সংগঠনসমূহ</span>
          </h1>
          <p className="text-xs sm:text-sm text-subText mt-1">
            স্বেচ্ছায় রক্তদানে অংশ নেওয়া বাংলাদেশের বিভিন্ন বিশ্ববিদ্যালয়, কলেজ ও মেডিকেল ইউনিট
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-tealAccent hover:bg-teal-800 text-white font-bold rounded-xl text-sm shadow transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>প্রতিষ্ঠান যুক্ত করার আবেদন</span>
        </button>
      </div>

      {/* Filter Box */}
      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="প্রতিষ্ঠানের নাম বা কোড দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-page border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={division}
          onChange={e => setDivision(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 bg-page border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
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
          {[1, 2, 3].map(n => <div key={n} className="h-56 bg-gray-200 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : institutions.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-appBorder p-12 text-center text-subText">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="font-semibold text-sm">কোনো অনুমোদিত প্রতিষ্ঠান পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutions.map(inst => (
            <div key={inst._id} className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 flex flex-col justify-between hover:border-teal-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-tealAccent flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">
                    {inst.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-mainText text-base">{inst.nameBn}</h3>
                  <p className="text-xs text-subText">{inst.name}</p>
                </div>

                <div className="text-xs text-subText space-y-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{inst.address}, {inst.district}</span>
                  </p>
                  {inst.website && (
                    <a href={inst.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-tealAccent hover:underline">
                      <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{inst.website}</span>
                    </a>
                  )}
                </div>

                {inst.description && (
                  <p className="text-xs text-subText italic line-clamp-2 bg-gray-50 p-2 rounded">
                    "{inst.description}"
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs font-semibold text-subText">
                <span className="flex items-center gap-1.5 text-tealAccent">
                  <Users className="w-4 h-4" />
                  <span>নিবন্ধিত রক্তদাতা: {inst.totalRegisteredDonors} জন</span>
                </span>
                <span className="text-appSuccess font-medium">✓ অনুমোদিত</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-mainText mb-2">প্রতিষ্ঠান যুক্ত করার আবেদন ফরম</h3>
            <p className="text-xs text-subText mb-4">
              আপনার স্কুল, কলেজ, বিশ্ববিদ্যালয় বা ক্লাবের তথ্য দিয়ে আবেদন করুন। যাচাইয়ের পর ডিরেক্টরিতে প্রকাশিত হবে।
            </p>

            {applySuccess ? (
              <div className="bg-green-50 text-appSuccess p-6 rounded-xl text-center space-y-2 border border-green-200">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="font-bold text-sm">আবেদন সফলভাবে গৃহীত হয়েছে!</p>
                <p className="text-xs text-green-700">প্রশাসনিক পর্যালোচনার পর অনুমোদন জানানো হবে।</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                {applyError && (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                    {applyError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-mainText mb-1">
                    প্রতিষ্ঠানের পূর্ণ নাম (বাংলায়) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameBn}
                    onChange={e => setNameBn(e.target.value)}
                    placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                    className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mainText mb-1">
                    প্রতিষ্ঠানের ইংরেজি নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. University of Dhaka"
                    className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-mainText mb-1">
                      সংক্ষিপ্ত কোড *
                    </label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. DU-BD"
                      className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mainText mb-1">
                      ধরণ *
                    </label>
                    <select
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText"
                    >
                      <option value="university">বিশ্ববিদ্যালয়</option>
                      <option value="medical_college">মেডিকেল কলেজ</option>
                      <option value="college">কলেজ</option>
                      <option value="school">স্কুল</option>
                      <option value="other">অন্যান্য সংগঠন</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mainText mb-1">
                    ক্যাম্পাস বা অফিসের ঠিকানা *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="রোড, এলাকা, জেলা"
                    className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-mainText mb-1">
                      অফিসিয়াল ইমেইল
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="bloodclub@domain.edu"
                      className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mainText mb-1">
                      যোগাযোগ ফোন
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mainText mb-1">
                    সংক্ষিপ্ত বর্ণনা
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="প্রতিষ্ঠানের রক্তদান কার্যক্রম বা ক্লাবের পরিচিতি..."
                    className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 py-2.5 border border-appBorder rounded-xl text-sm font-medium hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="flex-1 py-2.5 bg-tealAccent hover:bg-teal-800 text-white font-bold rounded-xl text-sm shadow transition-colors"
                  >
                    {applyLoading ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

