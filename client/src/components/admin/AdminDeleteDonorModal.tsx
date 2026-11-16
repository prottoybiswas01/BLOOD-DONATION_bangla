import React, { useState } from 'react';
import { AlertTriangle, Trash2, HeartOff } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AdminDeleteDonorModalProps {
  donor: any | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (donorId: string) => Promise<void>;
}

export const AdminDeleteDonorModal: React.FC<AdminDeleteDonorModalProps> = ({
  donor,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!donor) return null;

  const handleDelete = async () => {
    setErrorMsg(null);
    setIsDeleting(true);
    try {
      await onConfirmDelete(donor._id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'রক্তদাতার প্রোফাইল অপসারণ করা যায়নি।');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="রক্তদাতা প্রোফাইল অপসারণের নিশ্চিতকরণ"
      description="সার্বজনীন তালিকা ও অনুসন্ধান থেকে রক্তদাতার প্রোফাইলটি মুছে ফেলা হবে।"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            বাতিল
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isDeleting}
            onClick={handleDelete}
            className="bg-rose-600 hover:bg-rose-700 text-white"
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            হ্যাঁ, প্রোফাইল অপসারন করুন
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="p-4 bg-slate-50 border border-appBorder rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-mainText">{donor.name}</span>
            <Badge variant="primary" size="sm">{donor.bloodGroup}</Badge>
          </div>
          <div className="text-xs text-subText font-mono space-y-0.5">
            <div>ঠিকানা: {donor.district}, {donor.division}</div>
            <div>আইডি: {donor._id}</div>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
          <HeartOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            এই ক্রিয়াটি রক্তদাতাকে পাবলিক সার্চ ও তালিকা থেকে মুছে ফেলবে। তবে তার সাধারণ ইউজার অ্যাকাউন্ট সংরক্ষিত থাকবে যদি তিনি প্ল্যাটফর্মে লগইন করতে চান।
          </p>
        </div>
      </div>
    </Modal>
  );
};
