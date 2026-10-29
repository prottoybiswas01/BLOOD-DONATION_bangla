import React, { useState } from 'react';
import { Flag, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface ReportModalProps {
  targetType: 'donor_profile' | 'blood_request' | 'institution' | 'user';
  targetId: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetId,
  onClose,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<string>('false_information');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('অভিযোগ দায়ের করতে অনুগ্রহ করে প্রথমে অ্যাকাউন্টে লগইন করুন।');
      return;
    }

    if (description.trim().length < 10) {
      setErrorMsg('অভিযোগের সুনির্দিষ্ট কারণ কমপক্ষে ১০ অক্ষরে বিস্তারিত লিখুন।');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.createReport({
        targetType,
        targetId,
        reason,
        description,
      });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setErrorMsg(res.message || 'রিপোর্ট জমা দেওয়া যায়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'রিপোর্ট জমা দেওয়া যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
          <Flag className="w-5 h-5 text-primary" />
          <span>অনিয়ম বা ভুয়া তথ্য অভিযোগ করুন</span>
        </div>
        <p className="text-xs text-subText mb-4">
          আমাদের প্ল্যাটফর্মকে নিরাপদ ও মানবিক রাখতে যেকোনো ভুয়া তথ্য, প্রতারণা বা অনুপযুক্ত আচরণ দ্রুত রিপোর্ট করুন।
        </p>

        {success ? (
          <div className="bg-green-50 text-appSuccess p-4 rounded-xl text-center space-y-2 border border-green-200">
            <CheckCircle2 className="w-8 h-8 mx-auto" />
            <p className="font-semibold text-sm">আপনার অভিযোগটি সফলভাবে গৃহীত হয়েছে।</p>
            <p className="text-xs text-green-700">আমাদের মডারেশন টিম দ্রুত প্রয়োজনীয় ব্যবস্থা গ্রহণ করবে।</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-1.5 border border-red-200">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-mainText mb-1">
                অভিযোগের ধরণ
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
              >
                <option value="false_information">ভুল বা মিথ্যা তথ্য প্রদান</option>
                <option value="fake_request">ভুয়া রক্তের অনুরোধ / ইতিমধ্যে রক্ত পাওয়া গেছে</option>
                <option value="commercial_solicitation">টাকা দাবি করা / রক্ত ক্রয়-বিক্রয়ের চেষ্টা</option>
                <option value="harassment">হয়রানি বা আপত্তিকর আচরণ</option>
                <option value="impersonation">অন্যের নাম বা নম্বর ব্যবহার</option>
                <option value="spam">স্প্যাম বা অপ্রাসঙ্গিক বিজ্ঞাপন</option>
                <option value="other">অন্যান্য অনিয়ম</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-mainText mb-1">
                অভিযোগের সুনির্দিষ্ট বিবরণ <span className="text-primary">*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="সমস্যাটি স্পষ্টভাবে বর্ণনা করুন (যেমন: কি ধরনের ভুয়া তথ্য বা অসঙ্গতি পেয়েছেন)..."
                rows={4}
                required
                className="w-full px-3 py-2 bg-surface border border-appBorder rounded-lg text-sm text-mainText focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-appBorder rounded-lg text-sm font-medium text-mainText hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                {loading ? 'জমা হচ্ছে...' : 'অভিযোগ জমা দিন'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

