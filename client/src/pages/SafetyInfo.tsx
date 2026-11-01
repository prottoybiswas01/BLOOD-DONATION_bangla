import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Heart, Info, Clock, Thermometer, ShieldAlert, HeartPulse } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const SafetyInfo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="teal" size="sm" className="shadow-soft">
          স্বাস্থ্য ও চিকিৎসা নির্দেশিকা
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-mainText tracking-tight">রক্তদানের নিরাপত্তা ও স্বাস্থ্যবিধি</h1>
        <p className="text-sm text-subText max-w-xl mx-auto">রক্তদানের পূর্বে ও পরবর্তীতে আপনার সুস্থতার প্রয়োজনীয় জাতীয় স্বাস্থ্য গাইডলাইন</p>
      </div>

      {/* Prominent Medical Disclaimer Banner */}
      <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 text-amber-950 space-y-3 shadow-soft">
        <div className="flex items-center gap-2.5 font-black text-base text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <span>গুরুত্বপূর্ণ চিকিৎসা সতর্কতা ও দায়মুক্তি বার্তা</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-amber-900/90">
          এই প্ল্যাটফর্মটি রক্তদাতা ও গ্রহীতাদের মধ্যে সমন্বয়কারী মাধ্যম হিসেবে কাজ করে। এটি কোনো চিকিৎসা কেন্দ্র বা চিকিৎসকের বিকল্প নয়। প্ল্যাটফর্মে কোনো ব্যক্তির প্রোফাইল থাকা মানেই তিনি চিকিৎসাগতভাবে রক্তদানে উপযুক্ত—এমন কোনো নিশ্চয়তা দেওয়া হয় না। রক্ত গ্রহণের পূর্বে সংশ্লিষ্ট হাসপাতাল বা প্রত্যয়িত ব্লাড ব্যাংকের চিকিৎসক দ্বারা রক্তদাতার হিমোগ্লোবিন, রক্তচাপ, ওজন এবং সংক্রমণ স্ক্রীনিং (এইচআইভি, হেপাটাইটিস বি ও সি, ম্যালেরিয়া, সিফিলিস) পরীক্ষা সম্পন্ন করা বাধ্যতামূলক।
        </p>
      </div>

      {/* Basic Eligibility Checklist */}
      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-10 space-y-8">
        <div className="flex items-center gap-2.5 border-b border-appBorder pb-4">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-black text-mainText">রক্তদানের সাধারণ যোগ্যতা মানদণ্ড</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-subText">
          <div className="flex items-start gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-mainText text-sm block mb-0.5">বয়সসীমা:</strong>
              ১৮ থেকে ৬০ বছর বয়সী যেকোনো সুস্থ নারী বা পুরুষ।
            </div>
          </div>

          <div className="flex items-start gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-mainText text-sm block mb-0.5">শারীরিক ওজন:</strong>
              পুরুষদের ক্ষেত্রে ন্যূনতম ৫০ কেজি এবং নারীদের ক্ষেত্রে ন্যূনতম ৪৫ কেজি।
            </div>
          </div>

          <div className="flex items-start gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-mainText text-sm block mb-0.5">হিমোগ্লোবিনের মাত্রা:</strong>
              পুরুষদের ক্ষেত্রে ন্যূনতম ১২.৫ গ্রাম/ডেসিলিটার এবং নারীদের ক্ষেত্রে ন্যূনতম ১২.০ গ্রাম/ডেসিলিটার।
            </div>
          </div>

          <div className="flex items-start gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-mainText text-sm block mb-0.5">রক্তদানের বিরতি:</strong>
              পুরুষরা প্রতি ৩ মাস পর পর এবং নারীরা প্রতি ৪ মাস পর পর নিরাপদে রক্তদান করতে পারেন।
            </div>
          </div>
        </div>

        {/* Temporary Deferrals */}
        <div className="pt-6 border-t border-appBorder space-y-4">
          <h3 className="text-base font-black text-mainText flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-amber-600" />
            <span>কখন রক্তদান থেকে সাময়িক বিরত থাকবেন?</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-subText list-disc pl-5 leading-relaxed">
            <li>জ্বর, সর্দি-কাশি বা যেকোনো সক্রিয় ইনফেকশন চলাকালীন।</li>
            <li>অ্যান্টিবায়োটিক ওষুধ সেবন শেষ হওয়ার ৭ দিন পর্যন্ত।</li>
            <li>গত ৬ মাসের মধ্যে কোনো বড় ধরনের সার্জারি হয়ে থাকলে।</li>
            <li>গর্ভকালীন সময় এবং সন্তানকে বুকের দুধ খাওয়ানোর সময়।</li>
            <li>অনিয়ন্ত্রিত উচ্চ রক্তচাপ বা ডায়াবেটিসের সমস্যা থাকলে।</li>
            <li>গত ৬ মাসের মধ্যে কোনো উল্কি (ট্যাটু) বা কান ফোঁড়ানো হয়ে থাকলে।</li>
          </ul>
        </div>

        {/* Pre & Post Donation Care */}
        <div className="pt-6 border-t border-appBorder grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-2.5">
            <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>রক্তদানের পূর্বে করণীয়:</span>
            </h4>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>রক্তদানের আগের রাতে পর্যাপ্ত (৭-৮ ঘণ্টা) ঘুমান।</li>
              <li>রক্তদানের পূর্বে পর্যাপ্ত পানি ও পুষ্টিকর হালকা খাবার গ্রহণ করুন। খালি পেটে রক্তদান করবেন না।</li>
              <li>ধূমপান থেকে রক্তদানের পূর্বে কমপক্ষে ২ ঘণ্টা বিরত থাকুন।</li>
            </ul>
          </div>

          <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2.5">
            <h4 className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-emerald-600" />
              <span>রক্তদানের পর করণীয়:</span>
            </h4>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>রক্তদানের পর কমপক্ষে ১০-১৫ মিনিট বিশ্রাম নিন।</li>
              <li>পর্যাপ্ত পানি, জুস ও হালকা নাস্তা গ্রহণ করুন।</li>
              <li>রক্তদানের পর কয়েক ঘণ্টা ভারী ওজন উত্তোলন বা অতিরিক্ত শারীরিক পরিশ্রম এড়িয়ে চলুন।</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
