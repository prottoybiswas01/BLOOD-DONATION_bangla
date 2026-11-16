import React, { useState } from 'react';
import { Phone, Send } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { api } from '../../api/client';
import { PhoneChangeRequest } from '../../types';

interface ProfilePhoneSectionProps {
  phone: string;
  pendingPhoneRequest: PhoneChangeRequest | null;
  onPhoneRequestSubmitted: (req: PhoneChangeRequest, successMsg: string) => void;
}

export const ProfilePhoneSection: React.FC<ProfilePhoneSectionProps> = ({
  phone,
  pendingPhoneRequest,
  onPhoneRequestSubmitted
}) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [submittingPhoneChange, setSubmittingPhoneChange] = useState(false);
  const [phoneChangeMsg, setPhoneChangeMsg] = useState<string | null>(null);

  const handleSubmitPhoneChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPhoneChange(true);
    setPhoneChangeMsg(null);

    const cleanNew = newPhone.replace(/\D/g, '');
    if (!cleanNew || cleanNew.length < 11) {
      setPhoneChangeMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)');
      setSubmittingPhoneChange(false);
      return;
    }

    try {
      const res = await api.submitPhoneChangeRequest({
        newPhone: cleanNew,
        reason: changeReason
      });

      if (res.success) {
        setShowPhoneModal(false);
        setNewPhone('');
        setChangeReason('');
        onPhoneRequestSubmitted(
          res.request,
          'মোবাইল নম্বর পরিবর্তনের আবেদন সফলভাবে জমা হয়েছে। সংশ্লিষ্ট মডারেটর বা সমন্বয়ক কর্তৃক পর্যালোচনার পর নম্বর হালনাগাদ হবে।'
        );
      } else {
        setPhoneChangeMsg(res.message || 'আবেদন জমা দেওয়া যায়নি।');
      }
    } catch (err: any) {
      setPhoneChangeMsg(err.message || 'আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setSubmittingPhoneChange(false);
    }
  };

  return (
    <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-appBorder pb-4">
        <div>
          <h2 className="text-base font-black text-mainText flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <span>নিবন্ধিত মোবাইল নম্বর</span>
          </h2>
          <p className="text-xs text-subText mt-0.5">নিরাপত্তা ও অপব্যবহার রোধে নম্বর পরিবর্তন প্রক্রিয়ায় প্রশাসনিক অনুমোদন প্রয়োজন হয়</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPhoneModal(true)}
          className="text-xs font-bold"
        >
          নম্বর পরিবর্তন আবেদন
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div>
          <span className="text-xs text-subText block mb-0.5">বর্তমান নম্বর:</span>
          <span className="font-mono text-base font-black text-mainText">{phone}</span>
        </div>
        <Badge variant="success" size="sm" dot>সক্রিয় ও যাচাইকৃত</Badge>
      </div>

      {pendingPhoneRequest && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <span>নম্বর পরিবর্তনের একটি আবেদন অপেক্ষমাণ রয়েছে</span>
          </div>
          <p className="text-xs text-amber-800">
            নতুন নম্বর: <strong className="font-mono">{pendingPhoneRequest.newPhone}</strong> | কারণ: "{pendingPhoneRequest.reason}"
          </p>
        </div>
      )}

      {showPhoneModal && (
        <Modal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          title="মোবাইল নম্বর পরিবর্তনের আবেদন"
          description="রক্তদাতাদের সুরক্ষা ও সঠিক রেকর্ড নিশ্চিত করতে মোবাইল নম্বর সরাসরি পরিবর্তনযোগ্য নয়। আবেদনটি সমন্বয়ক কর্তৃক অনুমোদনের পর পরিবর্তন কার্যকর হবে।"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setShowPhoneModal(false)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingPhoneChange}
                onClick={handleSubmitPhoneChange as any}
                icon={<Send className="w-4 h-4" />}
              >
                আবেদন জমা দিন
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmitPhoneChange} className="space-y-4">
            {phoneChangeMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {phoneChangeMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">বর্তমান মোবাইল নম্বর</label>
              <input
                type="text"
                disabled
                value={phone}
                className="w-full px-3.5 py-2 bg-slate-100 border border-appBorder rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                অনুরোধকৃত নতুন মোবাইল নম্বর (১১ ডিজিট) *
              </label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs font-mono text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                নম্বর পরিবর্তনের সুস্পষ্ট কারণ *
              </label>
              <textarea
                rows={3}
                required
                value={changeReason}
                onChange={e => setChangeReason(e.target.value)}
                placeholder="যেমন: পূর্বের সিমটি হারিয়ে গেছে / কর্মস্থলের নতুন নম্বর যুক্ত করতে চাই..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
