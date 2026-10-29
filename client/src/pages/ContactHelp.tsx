import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const ContactHelp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-mainText">যোগাযোগ ও হেল্পডেস্ক</h1>
        <p className="text-sm text-subText">যেকোনো প্রশ্ন, কারিগরি সমস্যা বা প্রাতিষ্ঠানিক সমন্বয়ের জন্য আমাদের লিখুন</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1">
          <div className="bg-surface rounded-2xl border border-appBorder p-5 shadow-card space-y-4 text-xs text-subText">
            <h3 className="font-bold text-mainText text-sm">সরাসরি যোগাযোগ</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>রক্তদান বাংলাদেশ কেন্দ্রীয় সমন্বয় সেল, ঢাকা</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              <span>support@blooddonationbd.org</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary flex-shrink-0" />
              <span>+৮৮০১৭১১-২২৩৩৪৪ (সকাল ৯টা - রাত ১০টা)</span>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-xs text-red-900 space-y-2">
            <h4 className="font-bold text-primary">জরুরি রক্তের জন্য:</h4>
            <p className="leading-relaxed">
              জরুরি রক্তের প্রয়োজনে সরাসরি প্ল্যাটফর্মের "রক্তদাতা খুঁজুন" বা "রক্তের অনুরোধ" ফিচার ব্যবহার করুন।
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 md:col-span-2">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-appSuccess mx-auto" />
              <h3 className="text-lg font-bold text-mainText">বার্তা সফলভাবে পাঠানো হয়েছে!</h3>
              <p className="text-xs text-subText">আমাদের প্রতিনিধি দল দ্রুত আপনার ইমেইলে যোগাযোগ করবে।</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-mainText text-base flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>আমাদের বার্তা পাঠান</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="আপনার সম্পূর্ণ নাম..."
                  className="w-full px-3 py-2 bg-page border border-appBorder rounded-lg text-sm text-mainText"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">ইমেইল ঠিকানা *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-page border border-appBorder rounded-lg text-sm text-mainText"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mainText mb-1">বার্তার বিষয়বস্তু *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="আপনার মতামত, অভিযোগ বা পরামর্শ বিস্তারিত লিখুন..."
                  className="w-full px-3 py-2 bg-page border border-appBorder rounded-lg text-sm text-mainText"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow"
              >
                <Send className="w-4 h-4" />
                <span>বার্তা প্রেরণ করুন</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
