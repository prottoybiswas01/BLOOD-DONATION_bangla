import React, { useState } from 'react';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AdminDeleteUserModalProps {
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (userId: string) => Promise<void>;
  isSuperAdmin: boolean;
}

export const AdminDeleteUserModal: React.FC<AdminDeleteUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirmDelete,
  isSuperAdmin
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const isTargetSuperAdmin = user.role === 'SUPER_ADMIN';

  const handleDelete = async () => {
    setErrorMsg(null);
    setIsDeleting(true);
    try {
      await onConfirmDelete(user._id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'ব্যবহারকারী মুছে ফেলতে ব্যর্থ হয়েছে।');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ব্যবহারকারী স্থায়ীভাবে মুছে ফেলার নিশ্চিতকরণ"
      description="প্ল্যাটফর্ম থেকে এই অ্যাকাউন্টটি সম্পূর্ণরূপে মুছে ফেলা হবে।"
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
            disabled={isTargetSuperAdmin && !isSuperAdmin}
            className="bg-rose-600 hover:bg-rose-700 text-white"
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            হ্যাঁ, স্থায়ীভাবে মুছে ফেলুন
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
            <span className="text-xs font-bold text-mainText">{user.name}</span>
            <Badge variant="primary" size="sm">{user.role}</Badge>
          </div>
          <div className="text-xs text-subText font-mono space-y-0.5">
            <div>মোবাইল: <span className="font-semibold text-mainText">{user.phone}</span></div>
            <div>আইডি: {user._id}</div>
            {user.division && <div>বিভাগ: {user.division}</div>}
          </div>
        </div>

        {isTargetSuperAdmin && !isSuperAdmin ? (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p>
              অনধিকার চর্চা: সুপার অ্যাডমিন অ্যাকাউন্ট মুছে ফেলার অনুমতি শুধুমাত্র অন্য একজন সুপার অ্যাডমিনের রয়েছে।
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">সতর্কীকরণ:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-700 leading-relaxed">
                <li>এই ব্যবহারকারীর অ্যাকাউন্ট ও ক্রেডেনশিয়াল স্থায়ীভাবে মুছে যাবে।</li>
                <li>ব্যবহারকারী সম্পর্কিত রক্তদাতার প্রোফাইল থাকলে তা অপসারিত হবে।</li>
                <li>ব্যবহারকারীর সকল রক্তের অনুরোধ, নোটিফিকেশন ও সংশ্লিষ্ট ইতিহাস স্থায়ীভাবে মুছে যাবে।</li>
                <li>এই প্রক্রিয়াটি পূর্বাবস্থায় ফিরিয়ে আনা সম্ভব নয়।</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
