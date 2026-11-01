import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

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
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <Badge variant="primary" size="sm" className="shadow-soft">
          হেল্পডেস্ক ও সহায়তা
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-mainText tracking-tight">যোগাযোগ ও হেল্পডেস্ক</h1>
        <p className="text-sm text-subText max-w-xl mx-auto">যেকোনো প্রশ্ন, কারিগরি সমস্যা বা প্রাতিষ্ঠানিক সমন্বয়ের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1">
          <div className="bg-surface rounded-3xl border border-appBorder p-6 shadow-card space-y-4 text-xs text-subText">
            <h3 className="font-black text-mainText text-sm border-b border-appBorder pb-2">সরাসরি যোগাযোগ</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>রক্তদান বাংলাদেশ কেন্দ্রীয় সমন্বয় সেল, ঢাকা</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-mono">support@blooddonationbd.org</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary flex-shrink-0" />
              <span>+৮৮০১৭১১-২২৩৩৪৪ (সকাল ৯টা - রাত ১০টা)</span>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-xs text-rose-950 space-y-2 shadow-soft">
            <h4 className="font-black text-primary text-sm">জরুরি রক্তের জন্য:</h4>
            <p className="leading-relaxed">
              জরুরি রক্তের প্রয়োজনে সরাসরি প্ল্যাটফর্মের "রক্তদাতা খুঁজুন" বা "রক্তের অনুরোধ" ফিচার ব্যবহার করুন।
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8 md:col-span-2">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-mainText">বার্তা সফলভাবে পাঠানো হয়েছে!</h3>
              <p className="text-xs text-subText max-w-sm mx-auto">আমাদের প্রতিনিধি দল দ্রুত আপনার ইমেইলে যোগাযোগ করবে। ধন্যবাদ।</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-black text-mainText text-base flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>আমাদের বার্তা পাঠান</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">আপনার নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="আপনার সম্পূর্ণ নাম..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">ইমেইল ঠিকানা *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1.5">বার্তার বিষয়বস্তু *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="আপনার মতামত, অভিযোগ বা পরামর্শ বিস্তারিত লিখুন..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Send className="w-4 h-4" />}
                  className="w-full shadow-soft"
                >
                  বার্তা পাঠান
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
