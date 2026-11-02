import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Phone, ShieldCheck, Mail, MapPin, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-14 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-soft">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight block">
                  রক্তদান বাংলাদেশ
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Bangladesh Blood Donation Platform
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              বাংলাদেশের প্রতিটি বিভাগ, জেলা এবং শিক্ষাপ্রতিষ্ঠানের স্বেচ্ছাসেবী রক্তদাতাদের একটি সুরক্ষিত, বিশ্বস্ত ও মানবিক নেটওয়ার্ক। জরুরি মুহূর্তে জীবন বাঁচাতে সরাসরি যোগাযোগ করুন।
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-emerald-400 rounded-full border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                ১০০% বিনামূল্যে সেবা
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                🔒 ডেটা সুরক্ষা নিয়ন্ত্রিত
              </span>
            </div>
          </div>

          {/* Quick Access */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">দ্রুত নেভিগেশন</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/donors" className="hover:text-white transition-colors">স্বেচ্ছাসেবী রক্তদাতা অনুসন্ধান</Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-white transition-colors">চলমান রক্তের অনুরোধসমূহ</Link>
              </li>
              <li>
                <Link to="/create-request" className="hover:text-white transition-colors">নতুন রক্তের আবেদন করুন</Link>
              </li>
              <li>
                <Link to="/institutions" className="hover:text-white transition-colors">অনুমোদিত শিক্ষাপ্রতিষ্ঠান</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">রক্তদাতা হিসেবে নিবন্ধন</Link>
              </li>
              <li>
                <a href="https://github.com/prottoybiswas01/BLOOD-DONATION_bangla/releases/download/v1.0.0/blood-donation-bangla.apk" download="blood-donation-bangla.apk" className="text-rose-400 font-semibold hover:text-rose-300 transition-colors flex items-center gap-1.5">
                  📱 অ্যান্ড্রয়েড অ্যাপ ডাউনলোড (APK)
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Safety */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">সহায়তা ও নীতি</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">রক্তদানের সাধারণ নির্দেশিকা</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">নারী রক্তদাতাদের নিরাপত্তা নীতি</Link>
              </li>
              <li>
                <Link to="/privacy-terms" className="hover:text-white transition-colors">গোপনীয়তা ও ব্যবহারের শর্তাবলী</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">আমাদের লক্ষ্য ও উদ্দেশ্য</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">অভিযোগ ও মতামত জানান</Link>
              </li>
            </ul>
          </div>

          {/* Emergency Hotlines */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">জরুরি জরুরি হেল্পলাইন</h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <p className="text-[11px] text-slate-400">জাতীয় জরুরি সেবা (অ্যাম্বুলেন্স / পুলিশ):</p>
                <p className="text-base font-bold text-white flex items-center gap-1.5 font-mono">
                  <Phone className="w-4 h-4 text-primary" />
                  ৯৯৯ (টোল ফ্রি)
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <p className="text-[11px] text-slate-400">স্বাস্থ্য বাতায়ন (২৪/৭ ডাক্তার পরামর্শ):</p>
                <p className="text-base font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  ১৬২৬৩
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} বাংলাদেশ রক্তদান প্ল্যাটফর্ম। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>নির্মিত হয়েছে</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>মানবতার কল্যাণে বাংলাদেশের প্রতিটি মানুষের জন্য</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
