import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  PlusCircle, 
  Users, 
  ShieldCheck, 
  Building2, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { RequestCard } from '../components/RequestCard';
import { BloodRequest } from '../types';
import { api } from '../api/client';
import { DemoBanner } from '../components/DemoBanner';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [upazila, setUpazila] = useState<string>('');
  
  const [emergencyRequests, setEmergencyRequests] = useState<BloodRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    async function loadEmergencies() {
      try {
        const res = await api.searchRequests({ urgencyLevel: 'emergency', limit: 3 });
        if (res.success && res.requests) {
          setEmergencyRequests(res.requests);
        }
      } catch (err) {
        console.error('Failed to load emergency requests:', err);
      } finally {
        setLoadingRequests(false);
      }
    }
    loadEmergencies();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedGroup) params.append('bloodGroup', selectedGroup);
    if (division) params.append('division', division);
    if (district) params.append('district', district);
    if (upazila) params.append('upazila', upazila);
    navigate(`/donors?${params.toString()}`);
  };

  return (
    <div className="space-y-12">
      <DemoBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/70 via-surface to-page pt-8 pb-14 border-b border-appBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-primary border border-red-200">
              <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
              জাতীয় স্বেচ্ছাসেবী রক্তদান উদ্যোগ
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-mainText tracking-tight leading-tight">
              এক ব্যাগ রক্ত, <span className="text-primary">বাঁচায় একটি মূল্যবান প্রাণ</span>
            </h1>
            <p className="text-base sm:text-lg text-subText leading-relaxed">
              সরাসরি যোগাযোগ করুন আপনার নিকটস্থ স্বেচ্ছায় রক্তদাতাদের সাথে। কোনো মধ্যস্বত্বভোগী বা অর্থ লেনদেন ছাড়া সম্পূর্ণ নিঃস্বার্থ মানবিক সেবা।
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/donors"
                className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform transform active:scale-95 text-base"
              >
                <Search className="w-5 h-5" />
                <span>রক্তদাতা খুঁজুন</span>
              </Link>

              <Link
                to="/create-request"
                className="w-full sm:w-auto px-6 py-3.5 bg-surface hover:bg-red-50 text-primary border-2 border-primary font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-transform transform active:scale-95 text-base"
              >
                <PlusCircle className="w-5 h-5" />
                <span>রক্তের জন্য অনুরোধ করুন</span>
              </Link>
            </div>
          </div>

          {/* Quick Search Widget */}
          <div className="mt-10 max-w-4xl mx-auto bg-surface rounded-2xl border border-appBorder shadow-card p-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <Search className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-mainText text-base">দ্রুত রক্তদাতা সন্ধান করুন</h2>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              {/* Blood group selection pills */}
              <div>
                <label className="block text-xs font-semibold text-mainText mb-2">
                  রক্তের গ্রুপ নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {BLOOD_GROUPS.map(bg => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setSelectedGroup(selectedGroup === bg ? '' : bg)}
                      className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                        selectedGroup === bg
                          ? 'bg-primary text-white border-primary shadow-sm scale-105'
                          : 'bg-page hover:bg-red-50 text-mainText border-appBorder'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cascading Location Selector */}
              <LocationSelector
                division={division}
                district={district}
                upazila={upazila}
                onDivisionChange={setDivision}
                onDistrictChange={setDistrict}
                onUpazilaChange={setUpazila}
              />

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>অনুসন্ধান করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Distinction Section: Donor Search vs Blood Requests */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-red-500 to-primary text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold inline-block">
                রক্তগ্রহীতাদের জন্য
              </span>
              <h3 className="text-xl sm:text-2xl font-bold">
                জরুরি রক্তের সন্ধান করছেন?
              </h3>
              <p className="text-sm text-red-100 leading-relaxed">
                আপনার কাঙ্ক্ষিত রক্তের গ্রুপ ও জেলার তথ্য দিয়ে তাত্ক্ষণিক রক্তদাতাদের খুঁজুন অথবা একটি জরুরি অনুরোধ পোস্ট করে দ্রুত সবার দৃষ্টি আকর্ষণ করুন।
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/donors"
                className="inline-flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-red-50 transition-colors"
              >
                <span>রক্তদাতা ডিরেক্টরি</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-700 to-tealAccent text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold inline-block">
                স্বেচ্ছাসেবীদের জন্য
              </span>
              <h3 className="text-xl sm:text-2xl font-bold">
                আপনি কি রক্তদান করতে প্রস্তুত?
              </h3>
              <p className="text-sm text-teal-100 leading-relaxed">
                একজন স্বেচ্ছায় রক্তদাতা হিসেবে নাম অন্তর্ভুক্ত করুন। আপনার এলাকার মুমূর্ষু রোগীর জীবন বাঁচাতে আপনার এগিয়ে আসা অত্যন্ত গুরুত্বপূর্ণ।
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-tealAccent px-5 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-teal-50 transition-colors"
              >
                <span>রক্তদাতা হিসেবে নিবন্ধন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Blood Requests Stream */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
              <h2 className="text-xl sm:text-2xl font-bold text-mainText">জরুরি রক্তের প্রয়োজনসমূহ</h2>
            </div>
            <p className="text-xs text-subText mt-0.5">
              এই মুহূর্তে হাসপাতালে চিকিৎসাধীন রোগীদের রক্তের জরুরি আবেদন
            </p>
          </div>
          <Link
            to="/requests"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>সকল অনুরোধ দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingRequests ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-48 bg-gray-200 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : emergencyRequests.length === 0 ? (
          <div className="bg-surface rounded-xl border border-appBorder p-8 text-center text-subText">
            <CheckCircle2 className="w-10 h-10 text-appSuccess mx-auto mb-2" />
            <p className="font-semibold text-sm">এই মুহূর্তে কোনো জরুরি রক্তের অনুরোধ নেই।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {emergencyRequests.map(req => (
              <RequestCard key={req._id} request={req} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-surface py-12 border-y border-appBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-mainText">কিভাবে কাজ করে রক্তদান বাংলাদেশ</h2>
            <p className="text-xs sm:text-sm text-subText mt-1">
              স্বচ্ছ, দ্রুত এবং সুরক্ষিত উপায়ে রক্তদাতা ও গ্রহীতাদের সংযোগ স্থাপন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-page p-6 rounded-2xl border border-appBorder text-center space-y-3">
              <div className="w-12 h-12 bg-red-100 text-primary font-bold text-lg rounded-2xl flex items-center justify-center mx-auto">
                ১
              </div>
              <h3 className="font-bold text-base text-mainText">রক্তদাতা খুঁজুন বা অনুরোধ করুন</h3>
              <p className="text-xs text-subText leading-relaxed">
                রক্তের গ্রুপ ও অবস্থান নির্বাচন করে রক্তদাতাদের তালিকা দেখুন অথবা রোগীর সুনির্দিষ্ট তথ্য দিয়ে সরাসরি রক্তের পোস্ট দিন।
              </p>
            </div>

            <div className="bg-page p-6 rounded-2xl border border-appBorder text-center space-y-3">
              <div className="w-12 h-12 bg-teal-100 text-tealAccent font-bold text-lg rounded-2xl flex items-center justify-center mx-auto">
                ২
              </div>
              <h3 className="font-bold text-base text-mainText">সুরক্ষিত উপায়ে যোগাযোগ</h3>
              <p className="text-xs text-subText leading-relaxed">
                রক্তদাতার গোপনীয়তা বজায় রেখে অনুমোদিত লগইন প্রক্রিয়ার মাধ্যমে সরাসরি যোগাযোগের নম্বর দেখুন এবং কথা বলুন।
              </p>
            </div>

            <div className="bg-page p-6 rounded-2xl border border-appBorder text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 text-appSuccess font-bold text-lg rounded-2xl flex items-center justify-center mx-auto">
                ৩
              </div>
              <h3 className="font-bold text-base text-mainText">রক্তদান ও প্রাণ রক্ষা</h3>
              <p className="text-xs text-subText leading-relaxed">
                হাসপাতালে উপস্থিত হয়ে স্বাস্থ্য পরীক্ষা ও ক্রস-ম্যাচিং সম্পন্ন করে রক্তদান করুন এবং একটি পরিবারকে নতুন আশা দিন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Educational & FAQs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-2xl border border-appBorder p-6 sm:p-10 shadow-soft">
          <div className="flex items-center gap-2 mb-6 text-primary font-bold text-xl">
            <HelpCircle className="w-6 h-6" />
            <h2>সাধারণ জিজ্ঞাসা ও স্বাস্থ্য নির্দেশিকা</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-bold text-mainText flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                কে রক্তদান করতে পারবেন?
              </h4>
              <p className="text-xs text-subText leading-relaxed pl-4">
                ১৮ থেকে ৬০ বছর বয়সী যেকোনো সুস্থ প্রাপ্তবয়স্ক নারী ও পুরুষ যাদের ওজন ন্যূনতম ৫০ কেজি এবং হিমোগ্লোবিন সন্তোষজনক, তারা প্রতি ৪ মাস পরপর নিরাপদে রক্তদান করতে পারেন।
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-mainText flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                রক্তদাতার ফোন নম্বর সরাসরি কেন দেখা যায় না?
              </h4>
              <p className="text-xs text-subText leading-relaxed pl-4">
                রক্তদাতাদের অবাঞ্ছিত কল, স্প্যামিং এবং তথ্য পাচার থেকে রক্ষা করতে শুধু লগইনকৃত ও যাচাইকৃত ব্যবহারকারীদের নির্দিষ্ট সীমার মধ্যে যোগাযোগের নম্বর দেখার অনুমতি দেওয়া হয়।
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-mainText flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                রক্তদানের পর কি কোনো পার্শ্বপ্রতিক্রিয়া হয়?
              </h4>
              <p className="text-xs text-subText leading-relaxed pl-4">
                রক্তদান সম্পূর্ণ স্বাভাবিক ও নিরাপদ একটি জৈবিক প্রক্রিয়া। রক্তদানের পর মানবদেহের তরল অংশ ২৪-৪৮ ঘণ্টার মধ্যে এবং রক্তকোষগুলো কয়েক সপ্তাহের মধ্যে নতুনভাবে পূর্ণ হয়ে যায়।
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-mainText flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                কোনো আর্থিক লেনদেন কি অনুমোদিত?
              </h4>
              <p className="text-xs text-subText leading-relaxed pl-4">
                সম্পূর্ণ না। এই প্ল্যাটফর্মটি শতভাগ স্বেচ্ছাসেবী। রক্তের বিনিময়ে যেকোনো অর্থ দাবি বা প্রদান আইনত দণ্ডনীয় অপরাধ। এমন কোনো ঘটনা লক্ষ্য করলে সাথে সাথে রিপোর্ট করুন।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

