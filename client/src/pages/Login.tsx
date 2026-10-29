import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, Phone, Lock, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await login(phone, password);
    setLoading(false);

    if (res.success) {
      navigate('/donors');
    } else {
      setErrorMsg(res.message || 'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।');
    }
  };

  const handleQuickLogin = (p: string, pass = 'password123') => {
    setPhone(p);
    setPassword(pass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-2xl flex items-center justify-center mx-auto">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-mainText">অ্যাকাউন্টে লগইন করুন</h1>
          <p className="text-xs text-subText">
            রক্তদানের মানবিক নেটওয়ার্কে আপনাকে স্বাগতম
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-mainText mb-1">
              মোবাইল নম্বর
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full pl-9 pr-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-mainText">
                পাসওয়ার্ড
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-colors text-sm flex items-center justify-center gap-2 pt-2.5"
          >
            <span>{loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Test Credentials helper for local development */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>পরীক্ষামূলক অ্যাকাউন্টসমূহ (1-Click Test):</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('01700000001')}
              className="p-1.5 bg-white border border-gray-200 hover:border-primary rounded text-left truncate"
            >
              👑 সুপার এডমিন
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('01700000002')}
              className="p-1.5 bg-white border border-gray-200 hover:border-primary rounded text-left truncate"
            >
              🏢 ঢাকা সমন্বয়ক
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('01700000004')}
              className="p-1.5 bg-white border border-gray-200 hover:border-primary rounded text-left truncate"
            >
              🎓 ঢাবি মডারেটর
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('01711111111')}
              className="p-1.5 bg-white border border-gray-200 hover:border-primary rounded text-left truncate"
            >
              🩸 রক্তদাতা (O+)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('01755555555')}
              className="col-span-2 p-1.5 bg-white border border-gray-200 hover:border-primary rounded text-left truncate"
            >
              📋 রক্তপ্রত্যাশী (Requester)
            </button>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-appBorder text-xs text-subText">
          এখনো অ্যাকাউন্ট নেই?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            নতুন নিবন্ধন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};
