import React from 'react';
import { HeartHandshake, ShieldCheck, Users, Target, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 bg-red-100 text-primary rounded-full text-xs font-bold inline-block">
          আমাদের পরিচয় ও লক্ষ্য
        </span>
        <h1 className="text-3xl font-extrabold text-mainText">বাংলাদেশ রক্তদান প্ল্যাটফর্ম</h1>
        <p className="text-sm text-subText max-w-2xl mx-auto">
          রক্তের অভাবে যেন একটি জীবনও ঝরে না যায়—এই প্রত্যয়ে স্বেচ্ছায় রক্তদাতাদের জাতীয় ডিজিটাল সংযোগ ব্যবস্থা
        </p>
      </div>

      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-mainText flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span>আমাদের মূল উদ্দেশ্য</span>
          </h2>
          <p className="text-xs sm:text-sm text-subText leading-relaxed">
            বাংলাদেশে প্রতিদিন হাজার হাজার ব্যাগ রক্তের প্রয়োজন হয়। থ্যালাসেমিয়া রোগী, প্রসূতি মা, জরুরি সার্জারি বা সড়ক দুর্ঘটনায় রক্তের জন্য রোগীর স্বজনদের দিশেহারা হতে হয়। আমাদের মূল লক্ষ্য হলো মধ্যস্বত্বভোগী ও প্রতারণামূলক চক্রকে নির্মূল করে সরাসরি রক্তের রোগী ও স্বেচ্ছায় রক্তদাতাদের মধ্যে দ্রুত, স্বচ্ছ এবং সুরক্ষিত যোগাযোগ স্থাপন করা।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="bg-page p-4 rounded-xl border border-appBorder space-y-2">
            <ShieldCheck className="w-6 h-6 text-appSuccess" />
            <h3 className="font-bold text-sm text-mainText">শতভাগ অলাভজনক ও মানবিক</h3>
            <p className="text-xs text-subText">
              এখানে কোনো বিজ্ঞাপন, সাবস্ক্রিপশন ফি বা রক্তের কেনাবেচার সুযোগ নেই। এটি একটি সার্বজনীন জনকল্যাণমূলক প্রযুক্তি উদ্যোগ।
            </p>
          </div>

          <div className="bg-page p-4 rounded-xl border border-appBorder space-y-2">
            <Users className="w-6 h-6 text-tealAccent" />
            <h3 className="font-bold text-sm text-mainText">ক্যাম্পাস ও তৃণমূল সংযোগ</h3>
            <p className="text-xs text-subText">
              দেশের স্কুল, কলেজ, বিশ্ববিদ্যালয় এবং মেডিকেল কলেজের রক্তদান সংগঠনগুলোকে একক নেটওয়ার্কে সম্পৃক্ত করা হয়েছে।
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm text-mainText">আপনি কি রক্তদানে অংশ নিতে চান?</p>
            <p className="text-xs text-subText">আপনার এলাকার রোগীদের পাশে দাঁড়াতে আজই নাম নিবন্ধন করুন।</p>
          </div>
          <Link
            to="/register"
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow transition-colors"
          >
            রক্তদাতা হিসেবে যুক্ত হোন
          </Link>
        </div>
      </div>
    </div>
  );
};

