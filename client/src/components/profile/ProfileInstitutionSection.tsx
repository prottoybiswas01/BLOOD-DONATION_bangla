import React, { useState } from 'react';
import { Building2, Clock, Send } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { api } from '../../api/client';

interface ProfileInstitutionSectionProps {
  user: any;
  approvedInstitutions: any[];
  pendingInstRequest: any;
  onInstRequestSubmitted: (req: any, successMsg: string) => void;
}

export const ProfileInstitutionSection: React.FC<ProfileInstitutionSectionProps> = ({
  user,
  approvedInstitutions,
  pendingInstRequest,
  onInstRequestSubmitted
}) => {
  const [showInstModal, setShowInstModal] = useState(false);
  const [targetInstId, setTargetInstId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [instDepartment, setInstDepartment] = useState('');
  const [instChangeReason, setInstChangeReason] = useState('');
  const [submittingInstChange, setSubmittingInstChange] = useState(false);
  const [instChangeMsg, setInstChangeMsg] = useState<string | null>(null);

  const handleSubmitInstChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInstId) {
      setInstChangeMsg('অনুগ্রহ করে একটি শিক্ষা প্রতিষ্ঠান নির্বাচন করুন।');
      return;
    }
    if (instChangeReason.trim().length < 5) {
      setInstChangeMsg('প্রতিষ্ঠান পরিবর্তনের সুনির্দিষ্ট কারণ (কমপক্ষে ৫ অক্ষর) উল্লেখ করুন।');
      return;
    }

    setSubmittingInstChange(true);
    setInstChangeMsg(null);
    try {
      const res = await api.submitInstitutionChangeRequest({
        targetInstitutionId: targetInstId,
        studentOrStaffId: studentId.trim() || undefined,
        department: instDepartment.trim() || undefined,
        reason: instChangeReason.trim()
      });

      if (res.success) {
        setShowInstModal(false);
        setInstChangeReason('');
        const myRes = await api.getMyInstitutionChangeRequest();
        onInstRequestSubmitted(
          myRes.success ? myRes.pendingRequest : null,
          res.message || 'প্রতিষ্ঠান পরিবর্তনের আবেদন সফলভাবে জমা হয়েছে।'
        );
      } else {
        setInstChangeMsg(res.message || 'আবেদন জমা দেওয়া সম্ভব হয়নি।');
      }
    } catch (err: any) {
      setInstChangeMsg(err.message || 'আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setSubmittingInstChange(false);
    }
  };

  return (
    <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-appBorder pb-4">
        <div>
          <h2 className="text-base font-black text-mainText flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <span>শিক্ষা প্রতিষ্ঠান ও ক্যাম্পাস সংযুক্তি</span>
          </h2>
          <p className="text-xs text-subText mt-0.5">আপনার কলেজ বা বিশ্ববিদ্যালয় নির্বাচন করে প্রাতিষ্ঠানিক রক্তদান ক্লাবে যুক্ত হোন</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInstModal(true)}
          className="text-xs font-bold text-teal-800 border-teal-200 hover:bg-teal-50"
        >
          প্রতিষ্ঠান পরিবর্তন / সংযুক্তি
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div>
          <span className="text-xs text-subText block mb-0.5">বর্তমান প্রতিষ্ঠান:</span>
          <span className="text-sm font-bold text-mainText">
            {user.assignedInstitution ? `ক্যাম্পাস আইডি: ${user.assignedInstitution}` : 'কোনো প্রতিষ্ঠানে সংযুক্ত নন'}
          </span>
        </div>
        <Badge variant={user.assignedInstitution ? 'teal' : 'neutral'} size="sm">
          {user.assignedInstitution ? 'ক্যাম্পাস সদস্য' : 'সাধারণ সদস্য'}
        </Badge>
      </div>

      {pendingInstRequest && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs sm:text-sm space-y-1">
          <div className="flex items-center gap-2 font-bold text-teal-800">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>প্রতিষ্ঠান পরিবর্তনের একটি আবেদন পর্যালোচনার অপেক্ষায় রয়েছে</span>
          </div>
          <p className="text-xs text-teal-800">
            অনুরোধকৃত নতুন প্রতিষ্ঠান: <strong>{pendingInstRequest.targetInstitutionName}</strong> | কারণ: "{pendingInstRequest.reason}"
          </p>
        </div>
      )}

      {showInstModal && (
        <Modal
          isOpen={showInstModal}
          onClose={() => setShowInstModal(false)}
          title="শিক্ষা প্রতিষ্ঠান পরিবর্তন বা সংযুক্তিকরণের আবেদন"
          description="আপনার পছন্দের বিশ্ববিদ্যালয় বা কলেজ নির্বাচন করে আবেদন করুন। সুপার এডমিন বা বিভাগীয় সমন্বয়ক কর্তৃক পর্যালোচনার পর অনুমোদন দেওয়া হবে।"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setShowInstModal(false)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingInstChange}
                onClick={handleSubmitInstChange as any}
                icon={<Send className="w-4 h-4" />}
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                আবেদন জমা দিন
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmitInstChange} className="space-y-4">
            {instChangeMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {instChangeMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                শিক্ষা প্রতিষ্ঠান নির্বাচন করুন *
              </label>
              <select
                required
                value={targetInstId}
                onChange={e => setTargetInstId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
              >
                <option value="">-- প্রতিষ্ঠান নির্বাচন করুন --</option>
                {approvedInstitutions.map((inst: any) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.nameBn} ({inst.nameEn || inst.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-mainText mb-1">শিক্ষার্থী / স্টাফ আইডি (যদি থাকে)</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="ID: 1910..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-mainText mb-1">বিভাগ / অনুষদ (যদি থাকে)</label>
                <input
                  type="text"
                  value={instDepartment}
                  onChange={e => setInstDepartment(e.target.value)}
                  placeholder="যেমন: CSE, BBA"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                প্রতিষ্ঠান পরিবর্তনের কারণ * (কমপক্ষে ৫ অক্ষর)
              </label>
              <textarea
                rows={3}
                required
                value={instChangeReason}
                onChange={e => setInstChangeReason(e.target.value)}
                placeholder="যেমন: নতুন শিক্ষাবর্ষে উক্ত প্রতিষ্ঠানে ভর্তি হয়েছি..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
