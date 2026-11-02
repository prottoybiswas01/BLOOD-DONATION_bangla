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
  HelpCircle,
  Sparkles,
  Award,
  Clock,
  Shield,
  Activity,
  Smartphone,
  Download,
  ExternalLink
} from 'lucide-react';
import { BLOOD_GROUPS } from '../data/bangladeshLocations';
import { LocationSelector } from '../components/LocationSelector';
import { RequestCard } from '../components/RequestCard';
import { BloodRequest } from '../types';
import { api } from '../api/client';
import { DemoBanner } from '../components/DemoBanner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

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
    <div className="space-y-16 pb-16 bg-page">
      <DemoBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/70 via-surface to-page pt-10 pb-16 border-b border-appBorder">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-rose-100/40 blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-80 h-80 rounded-full bg-teal-50/50 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100/80 text-primary border border-rose-200/80 shadow-soft">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>জাতীয় স্বেচ্ছাসেবী রক্তদান উদ্যোগ • বাংলাদেশ</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-mainText tracking-tight leading-[1.15]">
              এক ব্যাগ রক্ত, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-rose-700 to-primary-dark bg-clip-text text-transparent">
                বাঁচায় একটি অমূল্য জীবন
              </span>
            </h1>

            <p className="text-base sm:text-lg text-subText max-w-2xl mx-auto leading-relaxed">
              সরাসরি যোগাযোগ করুন আপনার নিকটস্থ স্বেচ্ছায় রক্তদাতাদের সাথে। কোনো মধ্যস্বত্বভোগী বা অর্থ লেনদেন ছাড়া সম্পূর্ণ নিঃস্বার্থ মানবিক সেবা।
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                to="/donors"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold rounded-2xl shadow-md hover:shadow-glow flex items-center justify-center gap-2.5 transition-all text-sm sm:text-base"
              >
                <Search className="w-5 h-5" />
                <span>রক্তদাতা খুঁজুন</span>
              </Link>

              <Link
                to="/create-request"
                className="w-full sm:w-auto px-8 py-3.5 bg-surface hover:bg-rose-50/80 text-primary border-2 border-primary/40 hover:border-primary font-bold rounded-2xl shadow-soft flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] text-sm sm:text-base"
              >
                <PlusCircle className="w-5 h-5 text-primary" />
                <span>রক্তের জন্য অনুরোধ পোস্ট করুন</span>
              </Link>
            </div>

            {/* Trust Badges Bar */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
              <div className="p-3 bg-white/80 rounded-xl border border-appBorder shadow-soft flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-mainText">১০০% ফ্রি</p>
                  <p className="text-[10px] text-subText">কোনো ফি নেই</p>
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-appBorder shadow-soft flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-primary flex items-center justify-center font-bold">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-mainText">যাচাইকৃত রক্তদাতা</p>
                  <p className="text-[10px] text-subText">নিরাপদ পরিচয়</p>
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-appBorder shadow-soft flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-mainText">৬৪ জেলা</p>
                  <p className="text-[10px] text-subText">সারাদেশে বিস্তৃত</p>
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-appBorder shadow-soft flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-mainText">২৪/৭ সেবা</p>
                  <p className="text-[10px] text-subText">জরুরি হটলাইন</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Search Widget */}
          <div className="mt-12 max-w-4xl mx-auto bg-surface rounded-3xl border border-appBorder shadow-elevated p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-appBorder pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-primary flex items-center justify-center font-bold">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-mainText text-base sm:text-lg">দ্রুত রক্তদাতা সন্ধান করুন</h2>
                  <p className="text-xs text-subText">আপনার কাঙ্ক্ষিত রক্তের গ্রুপ ও এলাকা নির্বাচন করুন</p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">সার্চ ফিল্টার</Badge>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-6">
              {/* Blood group selection pills */}
              <div>
                <label className="block text-xs font-bold text-mainText mb-2.5">
                  রক্তের গ্রুপ নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {BLOOD_GROUPS.map(bg => {
                    const isSelected = selectedGroup === bg;
                    return (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setSelectedGroup(isSelected ? '' : bg)}
                        className={`py-3 rounded-2xl text-sm font-black border transition-all duration-150 active:scale-95 ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-glow scale-105'
                            : 'bg-page hover:bg-rose-50/70 text-mainText border-appBorder hover:border-rose-200'
                        }`}
                      >
                        {bg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cascading Location Selector */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <LocationSelector
                  division={division}
                  district={district}
                  upazila={upazila}
                  onDivisionChange={setDivision}
                  onDistrictChange={setDistrict}
                  onUpazilaChange={setUpazila}
                />
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-subText">
                  {selectedGroup ? `নির্বাচিত গ্রুপ: ${selectedGroup}` : 'সব রক্তের গ্রুপ অন্তর্ভুক্ত থাকবে'}
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={<Search className="w-4 h-4" />}
                  className="w-full sm:w-auto px-10 shadow-soft"
                >
                  রক্তদাতা খুঁজুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Distinction Section: Donor Search vs Blood Requests */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-rose-600 via-primary to-primary-dark text-white p-7 sm:p-8 rounded-3xl shadow-card flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-3 relative z-10">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold inline-block">
                রক্তগ্রহীতাদের জন্য
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                জরুরি রক্তের সন্ধান করছেন?
              </h3>
              <p className="text-sm text-rose-100 leading-relaxed max-w-md">
                আপনার কাঙ্ক্ষিত রক্তের গ্রুপ ও জেলার তথ্য দিয়ে তাত্ক্ষণিক রক্তদাতাদের খুঁজুন অথবা একটি জরুরি অনুরোধ পোস্ট করে দ্রুত সবার দৃষ্টি আকর্ষণ করুন।
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <Link
                to="/donors"
                className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-2xl font-black text-sm shadow hover:bg-rose-50 active:scale-95 transition-all"
              >
                <span>রক্তদাতা ডিরেক্টরি দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-tealAccent text-white p-7 sm:p-8 rounded-3xl shadow-card flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-3 relative z-10">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold inline-block">
                স্বেচ্ছাসেবীদের জন্য
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                আপনি কি রক্তদান করতে প্রস্তুত?
              </h3>
              <p className="text-sm text-teal-100 leading-relaxed max-w-md">
                একজন স্বেচ্ছায় রক্তদাতা হিসেবে নাম অন্তর্ভুক্ত করুন। আপনার এলাকার মুমূর্ষু রোগীর জীবন বাঁচাতে আপনার এগিয়ে আসা অত্যন্ত গুরুত্বপূর্ণ।
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-tealAccent px-6 py-3 rounded-2xl font-black text-sm shadow hover:bg-teal-50 active:scale-95 transition-all"
              >
                <span>রক্তদাতা হিসেবে নিবন্ধন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Blood Requests Stream */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-mainText">জরুরি রক্তের প্রয়োজনসমূহ</h2>
            </div>
            <p className="text-xs sm:text-sm text-subText mt-1">
              এই মুহূর্তে হাসপাতালে চিকিৎসাধীন রোগীদের রক্তের জরুরি আবেদন
            </p>
          </div>
          <Link
            to="/requests"
            className="text-xs sm:text-sm font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1.5 transition-colors"
          >
            <span>সকল অনুরোধ দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingRequests ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-56 bg-slate-200/70 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : emergencyRequests.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-appBorder p-10 text-center text-subText shadow-soft">
            <CheckCircle2 className="w-12 h-12 text-appSuccess mx-auto mb-3" />
            <h3 className="font-bold text-mainText text-base mb-1">এই মুহূর্তে কোনো জরুরি রক্তের অনুরোধ নেই</h3>
            <p className="text-xs text-subText max-w-sm mx-auto">সকল অনুরোধ সফলভাবে সম্পন্ন হয়েছে অথবা নতুন কোনো জরুরি অনুরোধ পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emergencyRequests.map(req => (
              <RequestCard key={req._id} request={req} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-surface py-16 border-y border-appBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="teal" size="sm" className="mb-2">সহজ ৩ ধাপ</Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-mainText">কিভাবে কাজ করে রক্তদান বাংলাদেশ</h2>
            <p className="text-xs sm:text-sm text-subText mt-2">
              স্বচ্ছ, দ্রুত এবং সুরক্ষিত উপায়ে রক্তদাতা ও গ্রহীতাদের সংযোগ স্থাপন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-page p-7 rounded-3xl border border-appBorder text-center space-y-4 hover:shadow-card transition-all">
              <div className="w-14 h-14 bg-rose-100 text-primary font-black text-xl rounded-2xl flex items-center justify-center mx-auto shadow-soft">
                ১
              </div>
              <h3 className="font-black text-lg text-mainText">রক্তদাতা খুঁজুন বা অনুরোধ করুন</h3>
              <p className="text-xs text-subText leading-relaxed">
                রক্তের গ্রুপ ও অবস্থান নির্বাচন করে রক্তদাতাদের তালিকা দেখুন অথবা রোগীর সুনির্দিষ্ট তথ্য দিয়ে সরাসরি রক্তের পোস্ট দিন।
              </p>
            </div>

            <div className="bg-page p-7 rounded-3xl border border-appBorder text-center space-y-4 hover:shadow-card transition-all">
              <div className="w-14 h-14 bg-teal-100 text-tealAccent font-black text-xl rounded-2xl flex items-center justify-center mx-auto shadow-soft">
                ২
              </div>
              <h3 className="font-black text-lg text-mainText">সুরক্ষিত উপায়ে যোগাযোগ</h3>
              <p className="text-xs text-subText leading-relaxed">
                রক্তদাতার গোপনীয়তা বজায় রেখে অনুমোদিত লগইন প্রক্রিয়ার মাধ্যমে সরাসরি যোগাযোগের নম্বর দেখুন এবং কথা বলুন।
              </p>
            </div>

            <div className="bg-page p-7 rounded-3xl border border-appBorder text-center space-y-4 hover:shadow-card transition-all">
              <div className="w-14 h-14 bg-emerald-100 text-appSuccess font-black text-xl rounded-2xl flex items-center justify-center mx-auto shadow-soft">
                ৩
              </div>
              <h3 className="font-black text-lg text-mainText">রক্তদান ও প্রাণ রক্ষা</h3>
              <p className="text-xs text-subText leading-relaxed">
                হাসপাতালে উপস্থিত হয়ে স্বাস্থ্য পরীক্ষা ও ক্রস-ম্যাচিং সম্পন্ন করে রক্তদান করুন এবং একটি পরিবারকে নতুন আশা দিন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Native Android App Distribution Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-slate-700">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* App Info */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Smartphone className="w-3.5 h-3.5" />
                <span>অফিসিয়াল নেটিভ অ্যান্ড্রয়েড অ্যাপ্লিকেশন • সংস্করণ ১.০.০</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                স্মার্টফোনে নিন <span className="text-rose-400">বাংলাদেশ রক্তদান</span> অ্যাপ
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                জরুরি মুহূর্তে রক্তের সন্ধান এখন আরও দ্রুত ও সহজ। নেটিভ অ্যান্ড্রয়েড অ্যাপের মাধ্যমে সরাসরি জিপিএস ও জেলাভিত্তিক ফিল্টারিং, ক্যাম্পাসভিত্তিক তালিকা এবং পুশ নোটিফিকেশন সুবিধা উপভোগ করুন।
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">প্যাকেজ</span>
                  <span className="text-xs font-bold font-mono text-white truncate block">org.bloodbd.app</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">ভার্সন</span>
                  <span className="text-xs font-bold text-white block">v1.0.0 (Build 1)</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">ফাইলের আকার</span>
                  <span className="text-xs font-bold text-emerald-400 block">~২৪.৮ মেগাবাইট</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">ন্যূনতম ওএস</span>
                  <span className="text-xs font-bold text-white block">Android 6.0+</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <a href="https://github.com/prottoybiswas01/BLOOD-DONATION_bangla/releases/download/v1.0.0/blood-donation-bangla.apk" download="blood-donation-bangla.apk" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all text-base">
                  <Download className="w-6 h-6 animate-pulse" />
                  <span>এক ক্লিকে APK সরাসরি ডাউনলোড করুন (Android App)</span>
                </a>
              </div>
            </div>

            {/* Install Guide Card with AI Artwork */}
            <div className="lg:col-span-5 bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
              <div className="overflow-hidden rounded-xl border border-slate-700 shadow-md">
                <img src="/images/blood-donation-logo.svg" alt="বাংলাদেশ রক্তদান প্ল্যাটফর্ম এআই ব্যানার ও অ্যাপ লোগো" className="w-full h-auto object-cover" />
              </div>
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>নিরাপদ ইনস্টলেশন নির্দেশিকা</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                    ১
                  </div>
                  <p>
                    উপরের বাটন চেপে <strong className="text-white">APK ফাইলটি</strong> আপনার ফোনে ডাউনলোড করুন।
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                    ২
                  </div>
                  <p>
                    ডাউনলোড শেষে ফাইলে ক্লিক করে <strong className="text-white">"Install unknown apps"</strong> বা অজানা উৎস থেকে ইনস্টল করার অনুমতি দিন।
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                    ৩
                  </div>
                  <p>
                    গুগল প্লে প্রোটেক্টের বার্তা প্রদর্শিত হলে <strong className="text-white">"Install anyway"</strong> নির্বাচন করুন।
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                    ৪
                  </div>
                  <p>
                    ইনস্টল শেষে অ্যাপ ওপেন করে আপনার বর্তমান একাউন্ট দিয়ে লগইন করলেই ডাটা স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/80 text-[11px] text-slate-400">
                <span className="font-mono text-[10px] break-all block">
                  SHA-256: a7c936df35b4ce70a6c221191a92eef851a7e2b694697bfb557c6b907153641b
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational & FAQs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-3xl border border-appBorder p-7 sm:p-12 shadow-soft">
          <div className="flex items-center gap-3 mb-8 text-primary font-black text-xl sm:text-2xl border-b border-appBorder pb-4">
            <HelpCircle className="w-7 h-7" />
            <h2>সাধারণ জিজ্ঞাসা ও স্বাস্থ্য নির্দেশিকা</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-black text-mainText text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></span>
                কে রক্তদান করতে পারবেন?
              </h4>
              <p className="text-xs text-subText leading-relaxed pl-4.5">
                ১৮ থেকে ৬০ বছর বয়সী যেকোনো সুস্থ প্রাপ্তবয়স্ক নারী ও পুরুষ যাদের ওজন ন্যূনতম ৫০ কেজি এবং হিমোগ্লোবিন সন্তোষজনক, তারা প্রতি ৪ মাস পরপর নিরাপদে রক্তদান করতে পারেন।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-black text-mainText text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></span>
                রক্তদাতার ফোন নম্বর সরাসরি কেন দেখা যায় না?
              </h4>
              <p className="text-xs text-subText leading-relaxed pl-4.5">
                রক্তদাতাদের অবাঞ্ছিত কল, স্প্যামিং এবং তথ্য অপব্যবহার থেকে রক্ষা করতে শুধু লগইনকৃত ও যাচাইকৃত ব্যবহারকারীদের নির্দিষ্ট সীমার মধ্যে যোগাযোগের নম্বর দেখার অনুমতি দেওয়া হয়।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-black text-mainText text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></span>
                রক্তদানের পর কি কোনো পার্শ্বপ্রতিক্রিয়া হয়?
              </h4>
              <p className="text-xs text-subText leading-relaxed pl-4.5">
                রক্তদান সম্পূর্ণ স্বাভাবিক ও নিরাপদ একটি জৈবিক প্রক্রিয়া। রক্তদানের পর মানবদেহের তরল অংশ ২৪-৪৮ ঘণ্টার মধ্যে এবং রক্তকোষগুলো কয়েক সপ্তাহের মধ্যে নতুনভাবে পূর্ণ হয়ে যায়।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-black text-mainText text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></span>
                কোনো আর্থিক লেনদেন কি অনুমোদিত?
              </h4>
              <p className="text-xs text-subText leading-relaxed pl-4.5">
                সম্পূর্ণ না। এই প্ল্যাটফর্মটি শতভাগ স্বেচ্ছাসেবী। রক্তের বিনিময়ে যেকোনো অর্থ দাবি বা প্রদান আইনত দণ্ডনীয় অপরাধ। এমন কোনো ঘটনা লক্ষ্য করলে সাথে সাথে রিপোর্ট করুন।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
