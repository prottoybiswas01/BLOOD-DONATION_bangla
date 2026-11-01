import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Users,
  Building2,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { api } from '../api/client';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhoneOrId, setForgotPhoneOrId] = useState('');
  const [forgotReason, setForgotReason] = useState('');
  const [submittingForgot, setSubmittingForgot] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setErrorMsg('অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন।');
      setLoading(false);
      return;
    }

    const res = await login(cleanPhone, password);
    setLoading(false);

    if (res.success) {
      // Direct user based on role
      const user = res.user;
      if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'DIVISION_COORDINATOR') {
        navigate('/coordinator/dashboard');
      } else if (user?.role === 'INSTITUTION_HEAD') {
        navigate('/head/dashboard');
      } else if (user?.role === 'INSTITUTION_MODERATOR') {
        navigate('/moderator/dashboard');
      } else {
        navigate('/donor/dashboard');
      }
    } else {
      setErrorMsg(res.message || 'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhoneOrId.trim()) {
      setForgotErrorMsg('নিবন্ধিত মোবাইল নম্বর বা ইউজার আইডি দিন।');
      return;
    }

    setSubmittingForgot(true);
    setForgotErrorMsg(null);
    setForgotSuccessMsg(null);

    try {
      const res = await api.submitForgotPassword({
        phoneOrUserId: forgotPhoneOrId.trim(),
        reason: forgotReason.trim() || undefined
      });

      if (res.success) {
        setForgotSuccessMsg(res.message || 'আপনার পাসওয়ার্ড রিকভারির আবেদনটি গৃহীত হয়েছে। সংশ্লিষ্ট কর্তৃপক্ষ যাচাই করে সাময়িক পাসওয়ার্ড প্রদান করবেন।');
        setForgotPhoneOrId('');
        setForgotReason('');
      } else {
        setForgotErrorMsg(res.message || 'রিকভারি আবেদন সম্পন্ন করা যায়নি।');
      }
    } catch (err: any) {
      setForgotErrorMsg(err.message || 'সার্ভার যোগাযোগে সমস্যা হয়েছে।');
    } finally {
      setSubmittingForgot(false);
    }
  };

  const handleQuickLogin = (p: string, pass = 'password123') => {
    setPhone(p);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-page py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-surface rounded-3xl border border-appBorder shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Side: Healthcare Trust & Brand Visual (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 p-10 flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

          {/* Top Brand */}
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-rose-200">
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <span>জাতীয় রক্তদান নেটওয়ার্ক</span>
            </div>

            <h2 className="text-3xl font-black leading-tight tracking-tight">
              নিরাপদ রক্তদানে <br />
              <span className="text-rose-400">যুক্ত থাকুন সার্বক্ষণিক</span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              স্বেচ্ছাসেবী রক্তদাতা, হাসপাতাল এবং রক্তপ্রার্থীদের মধ্যে তাৎক্ষণিক ও নির্ভরযোগ্য সংযোগ তৈরির সর্বাধুনিক প্ল্যাটফর্ম।
            </p>
          </div>

          {/* Trust Pillars */}
          <div className="space-y-3.5 my-8 relative z-10">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">গোপনীয়তা ও নিরাপত্তা নীতি</p>
                <p className="text-[11px] text-slate-300">অননুমোদিত নম্বর প্রকাশ রোধ এবং নারীদের সর্বোচ্চ নিরাপত্তা।</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">যাচাইকৃত শিক্ষাপ্রতিষ্ঠান</p>
                <p className="text-[11px] text-slate-300">বিশ্ববিদ্যালয় ও কলেজের ক্যাম্পাস মডারেটরদের মাধ্যমে পরিচালিত।</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">সম্পূর্ণ নিঃস্বার্থ মানবিক উদ্যোগ</p>
                <p className="text-[11px] text-slate-300">কোনো মধ্যস্বত্বভোগী বা অর্থ লেনদেনের স্থান নেই।</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between relative z-10">
            <span>বাংলাদেশ স্বাস্থ্যসেবা সহায়তা</span>
            <span className="font-mono text-emerald-400">২৪/৭ অনলাইন</span>
          </div>
        </div>

        {/* Right Side: Clean Modern Login Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-primary border border-red-100 flex items-center justify-center shadow-soft lg:hidden">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-mainText tracking-tight">
                অ্যাকাউন্টে লগইন করুন
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-subText">
              আপনার নিবন্ধিত মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে নিরাপদে প্রবেশ করুন
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">
                মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText placeholder-slate-400 focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-mainText">
                  পাসওয়ার্ড <span className="text-rose-500">*</span>
                </label>
                <Link
                  to="/contact"
                  className="text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText placeholder-slate-400 focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-appBorder focus:ring-primary"
                />
                <span className="text-slate-600 font-medium">আমাকে মনে রাখুন</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotErrorMsg(null);
                  setForgotSuccessMsg(null);
                }}
                className="text-primary hover:underline font-bold text-xs"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              iconRight={<ArrowRight className="w-4 h-4" />}
              className="w-full font-bold shadow-soft"
            >
              {loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
            </Button>
          </form>

          {/* Quick One-Click Demo Role Logins */}
          <div className="pt-2 border-t border-appBorder space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-subText uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                পরীক্ষামূলক ডেমো লগইন (১-ক্লিক):
              </span>
              <span className="text-[10px] text-slate-400">পাসওয়ার্ড: password123</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('01700000001')}
                className="p-2 rounded-xl border border-appBorder bg-slate-50 hover:bg-red-50 hover:border-red-200 text-left transition-all"
              >
                <p className="font-bold text-slate-800 text-[11px]">👑 সুপার অ্যাডমিন</p>
                <p className="text-[10px] text-subText font-mono">01700000001</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('01700000002')}
                className="p-2 rounded-xl border border-appBorder bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-left transition-all"
              >
                <p className="font-bold text-slate-800 text-[11px]">🌐 ঢাকা সমন্বয়ক</p>
                <p className="text-[10px] text-subText font-mono">01700000002</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('01700000003')}
                className="p-2 rounded-xl border border-appBorder bg-slate-50 hover:bg-teal-50 hover:border-teal-200 text-left transition-all"
              >
                <p className="font-bold text-slate-800 text-[11px]">🎓 ঢাবি মডারেটর</p>
                <p className="text-[10px] text-subText font-mono">01700000003</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('01711111111')}
                className="p-2 rounded-xl border border-appBorder bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-all"
              >
                <p className="font-bold text-slate-800 text-[11px]">🩸 রক্তদাতা (O+)</p>
                <p className="text-[10px] text-subText font-mono">01711111111</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('01722222222')}
                className="p-2 rounded-xl border border-appBorder bg-slate-50 hover:bg-purple-50 hover:border-purple-200 text-left transition-all"
              >
                <p className="font-bold text-slate-800 text-[11px]">📋 রক্তপ্রার্থী</p>
                <p className="text-[10px] text-subText font-mono">01722222222</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('01700000008')}
                className="p-2 rounded-xl border border-appBorder bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-left transition-all"
              >
                <p className="font-bold text-slate-800 text-[11px]">🏫 ঢাবি কর্তৃপক্ষ প্রধান</p>
                <p className="text-[10px] text-subText font-mono">01700000008</p>
              </button>
            </div>
          </div>

          {/* Registration Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-subText">
              প্ল্যাটফর্মে নতুন একাউন্ট খুলতে চান?{' '}
              <Link to="/register" className="font-bold text-primary hover:text-primary-dark underline">
                নতুন রক্তদাতা বা সদস্য নিবন্ধন করুন
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Recovery Modal */}
      {showForgotModal && (
        <Modal
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
          title="পাসওয়ার্ড ভুলে গেছেন? (নিরাপদ ম্যানুয়াল রিকভারি)"
          description="আমাদের প্ল্যাটফর্ম সম্পূর্ণ নিরাপদ পদ্ধতিতে দায়িত্বপ্রাপ্ত কর্মকর্তার মাধ্যমে এককালীন সাময়িক পাসওয়ার্ড প্রদান করে।"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForgotModal(false)}>
                বন্ধ করুন
              </Button>
              {!forgotSuccessMsg && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleForgotSubmit}
                  isLoading={submittingForgot}
                >
                  আবেদন জমা দিন
                </Button>
              )}
            </div>
          }
        >
          {forgotSuccessMsg ? (
            <div className="space-y-3 py-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-emerald-900 font-semibold leading-relaxed">
                {forgotSuccessMsg}
              </p>
              <p className="text-[11px] text-subText">
                সংশ্লিষ্ট বিভাগীয় সমন্বয়ক বা প্রতিষ্ঠান মডারেটর আপনার পরিচয় নিশ্চিত করে আপনাকে একটি সাময়িক ওয়ান-টাইম পাসওয়ার্ড প্রদান করবেন।
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
              {forgotErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{forgotErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-mainText mb-1">
                  নিবন্ধিত মোবাইল নম্বর অথবা ইউজার আইডি <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={forgotPhoneOrId}
                  onChange={e => setForgotPhoneOrId(e.target.value)}
                  placeholder="যেমন: 01711000000 বা ইউজার আইডি"
                  className="w-full px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs font-mono text-mainText focus:bg-surface focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mainText mb-1">
                  সমস্যার কারণ / বিস্তারিত বিবরণ (ঐচ্ছিক)
                </label>
                <textarea
                  rows={3}
                  value={forgotReason}
                  onChange={e => setForgotReason(e.target.value)}
                  placeholder="যেমন: পাসওয়ার্ড মনে নেই বা ফোনে মেসেজ পাচ্ছি না..."
                  className="w-full px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:bg-surface focus:border-primary transition-all"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                <p className="font-bold">🔒 গোপনীয়তা ও অনুমোদন প্রক্রিয়া:</p>
                <p>
                  আপনার আবেদনটি সরাসরি সংশ্লিষ্ট <strong>বিভাগীয় সমন্বয়ক</strong> বা আপনার <strong>শিক্ষা প্রতিষ্ঠানের মডারেটরের</strong> ড্যাশবোর্ডে পৌঁছাবে। তারা যাচাই করে একটি নিরাপদ সাময়িক ওয়ান-টাইম পাসওয়ার্ড ইস্যু করবেন।
                </p>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
