import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Phone, Mail, MapPin, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-appBorder mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Platform Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-primary">বাংলাদেশ রক্তদান</span>
            </div>
            <p className="text-xs text-subText leading-relaxed">
              স্বেচ্ছায় রক্তদানকে সহজ, নিরাপদ এবং প্রযুক্তিবান্ধব করতে বাংলাদেশের ৬৪ জেলার রক্তদাতা এবং গ্রহীতাদের এক সুতোয় বাঁধার জাতীয় মানবিক উদ্যোগ।
            </p>
            <div className="text-xs text-subText space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>ঢাকা, বাংলাদেশ</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>support@blooddonationbd.org</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-mainText mb-3">দ্রুত অনুসন্ধান</h4>
            <ul className="space-y-2 text-xs text-subText">
              <li>
                <Link to="/donors" className="hover:text-primary transition-colors">রক্তদাতা খুঁজুন</Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-primary transition-colors">চলমান রক্তের অনুরোধ</Link>
              </li>
              <li>
                <Link to="/create-request" className="hover:text-primary transition-colors">জরুরি রক্তের আবেদন</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">রক্তদাতা হিসেবে নিবন্ধন</Link>
              </li>
              <li>
                <Link to="/institutions" className="hover:text-primary transition-colors">অংশগ্রহণকারী প্রতিষ্ঠান</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Guidelines & Safety */}
          <div>
            <h4 className="text-sm font-semibold text-mainText mb-3">নির্দেশিকা ও নীতিমালা</h4>
            <ul className="space-y-2 text-xs text-subText">
              <li>
                <Link to="/safety" className="hover:text-primary transition-colors">রক্তদানের যোগ্যতা ও সতর্কতা</Link>
              </li>
              <li>
                <Link to="/privacy-terms" className="hover:text-primary transition-colors">গোপনীয়তা রক্ষা নীতি</Link>
              </li>
              <li>
                <Link to="/privacy-terms#terms" className="hover:text-primary transition-colors">ব্যবহারের শর্তাবলী</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">আমাদের লক্ষ্য ও উদ্দেশ্য</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">যোগাযোগ ও সহায়তা</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Medical & Legal Disclaimer */}
          <div className="bg-gray-50 p-4 rounded-xl border border-appBorder">
            <div className="flex items-center gap-2 text-primary text-xs font-semibold mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>চিকিৎসা ও আইনি সতর্কতা</span>
            </div>
            <p className="text-[11px] text-subText leading-relaxed">
              এই প্ল্যাটফর্মটি স্বেচ্ছাসেবী সমন্বয়ক হিসেবে কাজ করে, কোনো সরাসরি স্বাস্থ্যসেবা বা রক্ত পরীক্ষা করে না। রক্তদানের চূড়ান্ত উপযুক্ততা কেবল রেজিস্টার্ড চিকিৎসক ও প্রত্যয়িত রক্ত পরিসঞ্চালন কেন্দ্র দ্বারাই নির্ধারিত হবে। রক্ত ক্রয়-বিক্রয় আইনত দণ্ডনীয় অপরাধ।
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-appBorder pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-subText gap-4">
          <p>© {new Date().getFullYear()} বাংলাদেশ রক্তদান প্ল্যাটফর্ম। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-terms" className="hover:text-primary">প্রাইভেসি</Link>
            <span>•</span>
            <Link to="/privacy-terms#terms" className="hover:text-primary">শর্তাবলী</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-primary">হেল্পডেস্ক</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

