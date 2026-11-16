import React, { useState } from 'react';
import { AlertTriangle, Trash2, ShieldAlert, Lock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

interface AdminDeleteUserModalProps {
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (userId: string) => Promise<void>;
  isSuperAdmin: boolean;
}

const isProttoy = (u: any) =>
  u?.phone === '01978167016' ||
  (u?.name && (u.name.includes('Prottoy') || u.name.includes('প্রত্যয়')));

export const AdminDeleteUserModal: React.FC<AdminDeleteUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirmDelete,
  isSuperAdmin
}) => {
  const { user: currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const isTargetRoot = isProttoy(user);
  const isActorRoot = isProttoy(currentUser);
  const isTargetSuperAdmin = user.role === 'SUPER_ADMIN';

  // Can this deletion proceed?
  const canDelete = !isTargetRoot && (!isTargetSuperAdmin || isActorRoot) && isSuperAdmin;

  const handleDelete = async () => {
    if (!canDelete) return;
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
            disabled={!canDelete}
            className="bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span className="text-xs font-bold text-mainText flex items-center gap-1.5">
              <span>{user.name}</span>
              {isTargetRoot && <span title="প্রধান সুপার অ্যাডমিন">👑</span>}
            </span>
            <Badge variant="primary" size="sm">{user.role}</Badge>
          </div>
          <div className="text-xs text-subText font-mono space-y-0.5">
            <div>মোবাইল: <span className="font-semibold text-mainText">{user.phone}</span></div>
            <div>আইডি: {user._id}</div>
            {user.division && <div>বিভাগ: {user.division}</div>}
          </div>
        </div>

        {isTargetRoot ? (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <Lock className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="font-medium">
              সুরক্ষা সতর্কতা: প্রধান সুপার অ্যাডমিন (প্রত্যয় কুমার বিশ্বাস) অ্যাকাউন্ট মুছে ফেলা সম্পূর্ণ নিষিদ্ধ ও অসম্ভব। এই অ্যাকাউন্ট অপরিবর্তনীয়।
            </p>
          </div>
        ) : isTargetSuperAdmin && !isActorRoot ? (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="font-medium">
              অনধিকার চর্চা: কোনো সাধারণ সুপার অ্যাডমিন অন্য কোনো সুপার অ্যাডমিন অ্যাকাউন্ট মুছে ফেলতে পারবেন না। শুধুমাত্র প্রধান সুপার অ্যাডমিন (প্রত্যয় কুমার বিশ্বাস) এই অধিকার রাখেন।
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
