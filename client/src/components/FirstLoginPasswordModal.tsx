import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';

export const FirstLoginPasswordModal: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user || !user.requirePasswordChangeAtFirstLogin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('উভয় পাসওয়ার্ড হুবহু মিলতে হবে।');
      return;
    }

    try {
      setLoading(true);
      const res = await api.changeFirstLoginPassword(newPassword);
      if (res.success) {
        setSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setTimeout(async () => {
          await refreshUser();
        }, 1000);
      } else {
        setError(res.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setError(err.message || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4 text-red-600">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">স্থায়ী পাসওয়ার্ড নির্ধারণ</h3>
            <p className="text-xs text-gray-500">প্রথমবার লগইনে বাধ্যতামূলক নিরাপত্তা ধাপ</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            মডারেটর কর্তৃক তৈরি সাময়িক পাসওয়ার্ড দিয়ে লগইন করেছেন। আপনার অ্যাকাউন্টের সম্পূর্ণ নিরাপত্তার জন্য অনুগ্রহ করে একটি নতুন স্থায়ী পাসওয়ার্ড সেট করুন।
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              নতুন স্থায়ী পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষরের গোপন পাসওয়ার্ড"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              পাসওয়ার্ড নিশ্চিত করুন
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="পাসওয়ার্ডটি পুনরায় লিখুন"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full mt-2 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>সংরক্ষণ করা হচ্ছে...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>স্থায়ী পাসওয়ার্ড সেট করুন ও চালিয়ে যান</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
