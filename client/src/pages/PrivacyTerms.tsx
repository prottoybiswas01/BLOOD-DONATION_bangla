import React from 'react';
import { ShieldCheck, Lock, FileText, AlertTriangle, Shield } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const PrivacyTerms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <Badge variant="teal" size="sm" className="shadow-soft">
          আইনি ও সুরক্ষা নীতিমালা
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-mainText tracking-tight">গোপনীয়তা রক্ষা নীতি ও ব্যবহারের শর্তাবলী</h1>
        <p className="text-sm text-subText max-w-xl mx-auto">বাংলাদেশ রক্তদান প্ল্যাটফর্মের সুরক্ষা, ডাটা প্রটেকশন ও জাতীয় আচরণবিধির বিশদ বিবরণ</p>
      </div>

      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-subText leading-relaxed">
        {/* Section 1: Privacy Policy */}
        <div id="privacy" className="space-y-4">
          <div className="flex items-center gap-2.5 text-primary font-black text-lg sm:text-xl">
            <Lock className="w-5 h-5 text-primary" />
            <h2>গোপনীয়তা রক্ষা নীতি (Privacy Policy)</h2>
          </div>
          <p>
            আমাদের প্রধান অগ্রাধিকার হলো রক্তদাতাদের ব্যক্তিগত তথ্যের সুরক্ষা নিশ্চিত করা। রক্তদানের এই মানবিক কাজে অংশ নেওয়ার কারণে কোনো রক্তদাতা যেন অবাঞ্ছিত কল, তথ্য পাচার বা হয়রানির শিকার না হন, সেজন্য আমরা কঠোর নিরাপত্তামূলক ব্যবস্থা গ্রহণ করেছি।
          </p>
          <div className="space-y-2.5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-mainText text-sm">নম্বর সুরক্ষার মূলনীতি:</h4>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>সাধারণ বা গেস্ট দর্শনার্থীদের অনুসন্ধানে রক্তদাতার ফোন নম্বর কখনো প্রকাশ করা হয় না।</li>
              <li>কেবলমাত্র নিবন্ধিত ও মোবাইল নম্বর যাচাইকৃত ব্যবহারকারীই জরুরি প্রয়োজনে নম্বর দেখার অনুরোধ করতে পারেন।</li>
              <li>প্রতিটি নম্বর উন্মুক্ত করার ঘটনা কে, কখন এবং কী কারণে করেছে—তা অডিট ট্রেইলে সংরক্ষিত থাকে।</li>
              <li>অবাঞ্ছিত তথ্য সংগ্রহ রোধে একজন ব্যবহারকারীর জন্য দৈনিক সর্বোচ্চ ৫ জনের নম্বর দেখার সীমা (Rate Limit) বলবৎ রয়েছে।</li>
              <li>রক্তদাতা তার প্রোফাইল থেকে যেকোনো সময় নম্বর প্রকাশের অনুমতি পরিবর্তন বা সাময়িক বন্ধ রাখতে পারেন।</li>
            </ul>
          </div>
        </div>

        {/* Section 2: Terms of Service */}
        <div id="terms" className="space-y-4 pt-6 border-t border-appBorder">
          <div className="flex items-center gap-2.5 text-primary font-black text-lg sm:text-xl">
            <FileText className="w-5 h-5 text-primary" />
            <h2>ব্যবহারের শর্তাবলী (Terms of Service)</h2>
          </div>
          <p>
            প্ল্যাটফর্মটি ব্যবহারের মাধ্যমে আপনি নিম্নলিখিত শর্তসমূহে সম্মতি প্রদান করছেন:
          </p>
          <ul className="list-decimal pl-5 space-y-2.5 text-slate-700">
            <li>
              <strong className="text-mainText">সম্পূর্ণ অলাভজনক ও স্বেচ্ছাভিত্তিক:</strong> রক্ত সম্পূর্ণ নিঃস্বার্থ উপহার। রক্তের বিনিময়ে কোনো প্রকার আর্থিক সুবিধা দাবি বা লেনদেন আইনত দণ্ডনীয় অপরাধ।
            </li>
            <li>
              <strong className="text-mainText">সঠিক তথ্য প্রদান:</strong> রোগীর অবস্থা, রক্তের গ্রুপ এবং হাসপাতালের অবস্থান সংক্রান্ত সকল তথ্য সত্য ও নির্ভুল হতে হবে। ভুয়া বা বিভ্রান্তিকর পোস্ট করা হলে অ্যাকাউন্ট স্থায়ীভাবে স্থগিত ও আইনি ব্যবস্থা নেওয়া হতে পারে।
            </li>
            <li>
              <strong className="text-mainText">বয়সসীমা:</strong> রক্তদাতা হিসেবে নিবন্ধনের জন্য ন্যূনতম বয়স ১৮ বছর হওয়া বাধ্যতামূলক।
            </li>
            <li>
              <strong className="text-mainText">দায়সীমা:</strong> প্ল্যাটফর্ম রক্তদাতা এবং গ্রহীতার মধ্যে প্রাথমিক সেতু হিসেবে কাজ করে। রক্তদানের চূড়ান্ত স্বাস্থ্যগত উপযুক্ততা যাচাই এবং ট্রান্সফিউশন সংক্রান্ত সিদ্ধান্তের দায়িত্ব রক্ত পরিসঞ্চালনকারী হাসপাতাল কর্তৃপক্ষের।
            </li>
          </ul>
        </div>

        {/* Section 3: Community Guidelines */}
        <div id="guidelines" className="space-y-4 pt-6 border-t border-appBorder">
          <div className="flex items-center gap-2.5 text-teal-800 font-black text-lg sm:text-xl">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h2>কমিউনিটি আচরণবিধি (Community Guidelines)</h2>
          </div>
          <p className="text-slate-700">
            রক্তদাতা ও স্বেচ্ছাসেবকদের সাথে সর্বদা শ্রদ্ধাশীল ও মার্জিত ভাষায় কথা বলুন। কোনো রক্তদাতা শারীরিক বা ব্যক্তিগত কারণে রক্তদানে অপারগতা প্রকাশ করলে তার সিদ্ধান্তকে সম্মান জানান। কোনো ধরনের অযাচিত কল বা অসঙ্গতি পরিলক্ষিত হলে প্ল্যাটফর্মের "অভিযোগ করুন" ফিচারের মাধ্যমে অবিলম্বে অবহিত করুন।
          </p>
        </div>
      </div>
    </div>
  );
};
