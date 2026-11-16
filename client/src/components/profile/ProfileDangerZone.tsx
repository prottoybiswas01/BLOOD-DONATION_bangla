import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle, ShieldAlert, HeartOff, UserX } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface ProfileDangerZoneProps {
  onSuccessMessage: (msg: string) => void;
  onErrorMessage: (msg: string) => void;
}

export const ProfileDangerZone: React.FC<ProfileDangerZoneProps> = ({
  onSuccessMessage,
  onErrorMessage
}) => {
  const { user, donorProfile, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  // Modal states
  const [showDeleteDonorModal, setShowDeleteDonorModal] = useState(false);
  const [isDeletingDonor, setIsDeletingDonor] = useState(false);

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  // Delete Donor Profile
  const handleDeleteDonorProfile = async () => {
    setIsDeletingDonor(true);
    try {
      const res = await api.deleteMyDonorProfile();
      if (res.success) {
        setShowDeleteDonorModal(false);
        await refreshUser();
        onSuccessMessage(res.message || 'রক্তদাতার প্রোফাইল সফলভাবে তালিকা থেকে মুছে ফেলা হয়েছে।');
      } else {
        onErrorMessage(res.message || 'রক্তদাতার প্রোফাইল মোছা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      onErrorMessage(err.message || 'সার্ভারে সংযোগে সমস্যা হয়েছে।');
    } finally {
      setIsDeletingDonor(false);
    }
  };

  // Delete Entire User Account
  const handleDeleteAccount = async () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE' && confirmInput.trim() !== 'মুছে ফেলুন') {
      onErrorMessage('নিশ্চিতকরণের জন্য সঠিকভাবে "DELETE" অথবা "মুছে ফেলুন" লিখুন।');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await api.deleteMyAccount();
      if (res.success) {
        setShowDeleteAccountModal(false);
        logout();
        navigate('/', { replace: true });
        alert(res.message || 'আপনার অ্যাকাউন্ট ও সংশ্লিষ্ট সকল তথ্য স্থায়ীভাবে মুছে ফেলা হয়েছে।');
      } else {
        onErrorMessage(res.message || 'অ্যাকাউন্ট মুছে ফেলা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      onErrorMessage(err.message || 'সার্ভার প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-rose-50/60 to-surface rounded-3xl border border-rose-200 shadow-soft p-6 sm:p-8 space-y-6">
      <div className="border-b border-rose-200 pb-4">
        <h2 className="text-base sm:text-lg font-black text-rose-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>ডেঞ্জার জোন: প্রোফাইল ও অ্যাকাউন্ট ব্যবস্থাপনা</span>
        </h2>
        <p className="text-xs text-rose-700/80 mt-1">
          এখানে আপনি আপনার রক্তদাতার প্রোফাইল অপসারণ অথবা আপনার সম্পূর্ণ অ্যাকাউন্ট ও সমস্ত ডাটা স্থায়ীভাবে মুছে ফেলতে পারেন।
        </p>
      </div>

      <div className="space-y-4">
        {/* Option 1: Delete / Remove Donor Profile (If user is registered as donor) */}
        {donorProfile && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white/90 rounded-2xl border border-rose-100 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-mainText flex items-center gap-2">
                <HeartOff className="w-4 h-4 text-rose-500" />
                <span>রক্তদাতার তালিকা থেকে প্রোফাইল অপসারণ</span>
              </h3>
              <p className="text-xs text-subText leading-relaxed">
                আপনার রক্তদাতা প্রোফাইলটি সাধারণ অনুসন্ধান ও তালিকা থেকে স্থায়ীভাবে মুছে যাবে। তবে আপনার মূল অ্যাকাউন্ট সক্রিয় থাকবে।
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDonorModal(true)}
              className="text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50 self-start sm:self-auto flex-shrink-0"
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
            >
              রক্তদাতা প্রোফাইল মুছুন
            </Button>
          </div>
        )}

        {/* Option 2: Delete Entire Account & All Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-rose-50/80 rounded-2xl border border-rose-200 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-600" />
              <span>সম্পূর্ণ অ্যাকাউন্ট ও সমস্ত ডাটা স্থায়ীভাবে মুছে ফেলুন</span>
            </h3>
            <p className="text-xs text-rose-700/90 leading-relaxed">
              সতর্কতা: এটি আপনার অ্যাকাউন্ট, রক্তদাতার তথ্য, রক্তের অনুরোধের রেকর্ড এবং সমস্ত ব্যক্তিগত লগ স্থায়ীভাবে নিশ্চিহ্ন করবে। এটি অপরিবর্তনীয়।
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setConfirmInput('');
              setShowDeleteAccountModal(true);
            }}
            className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white self-start sm:self-auto flex-shrink-0 shadow-sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            অ্যাকাউন্ট মুছে ফেলুন
          </Button>
        </div>
      </div>

      {/* Delete Donor Profile Modal */}
      {showDeleteDonorModal && (
        <Modal
          isOpen={showDeleteDonorModal}
          onClose={() => setShowDeleteDonorModal(false)}
          title="রক্তদাতার প্রোফাইল অপসারণ নিশ্চিতকরণ"
          description="আপনি কি নিশ্চিত যে আপনি রক্তদাতার তালিকা থেকে আপনার প্রোফাইল মুছে ফেলতে চান?"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteDonorModal(false)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isDeletingDonor}
                onClick={handleDeleteDonorProfile}
                className="bg-rose-600 hover:bg-rose-700"
              >
                হ্যাঁ, প্রোফাইল অপসারণ করুন
              </Button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs text-subText">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                প্রোফাইল অপসারণের পর কোনো রক্তপ্রার্থী আপনাকে তালিকায় খুঁজে পাবেন না। তবে পরবর্তীতে আপনি চাইলে পুনরায় রক্তদাতা হিসেবে নিবন্ধন করতে পারবেন।
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Full Account Modal */}
      {showDeleteAccountModal && (
        <Modal
          isOpen={showDeleteAccountModal}
          onClose={() => setShowDeleteAccountModal(false)}
          title="স্থায়ীভাবে অ্যাকাউন্ট মুছে ফেলার চূড়ান্ত নিশ্চিতকরণ"
          description="এই প্রক্রিয়াটি সম্পূর্ণরূপে অপরিবর্তনীয়। অনুগ্রহ করে সতর্কতা অবলম্বন করুন।"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteAccountModal(false)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isDeletingAccount}
                onClick={handleDeleteAccount}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                স্থায়ীভাবে মুছে ফেলুন
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">আপনার নিচের সকল তথ্য স্থায়ীভাবে মুছে যাবে:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                  <li>আপনার লগইন তথ্য ও সদস্য প্রোফাইল ({user?.name} - {user?.phone})</li>
                  <li>রক্তদাতা প্রোফাইল ও রক্তদানের হিস্ট্রি (যদি থাকে)</li>
                  <li>আপনার তৈরি করা সকল রক্তের অনুরোধ ও সম্পর্কিত তথ্য</li>
                  <li>সকল নোটিফিকেশন ও যোগাযোগের রেকর্ড</li>
                </ul>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-mainText">
                নিশ্চিত করতে নিচে <span className="text-rose-600 font-mono font-black">DELETE</span> অথবা <span className="text-rose-600 font-black">মুছে ফেলুন</span> লিখুন:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={e => setConfirmInput(e.target.value)}
                placeholder="DELETE অথবা মুছে ফেলুন"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-rose-300 rounded-xl text-xs text-mainText focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
