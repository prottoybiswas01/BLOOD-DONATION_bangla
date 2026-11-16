import React from 'react';
import { UserX, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AdminBlockedUsersTabProps {
  blockedUsers: any[];
  setUnblockingUser: (u: any) => void;
  setUnblockReason: (val: string) => void;
  setDeletingUser: (u: any) => void;
}

export const AdminBlockedUsersTab: React.FC<AdminBlockedUsersTabProps> = ({
  blockedUsers,
  setUnblockingUser,
  setUnblockReason,
  setDeletingUser
}) => {
  return (
    <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <UserX className="w-5 h-5 text-rose-600" />
            <span>স্থগিত ও ব্লককৃত অ্যাকাউন্ট তালিকা</span>
          </h3>
          <p className="text-xs text-subText mt-0.5">নীতিভঙ্গ বা তদন্তাধীন কারণে স্থগিতকৃত সদস্যদের সংরক্ষিত তথ্য ও অপসারণ</p>
        </div>
        <Badge variant="danger">{blockedUsers.length} টি অ্যাকাউন্ট</Badge>
      </div>

      {blockedUsers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          বর্তমানে কোনো স্থগিত বা ব্লককৃত অ্যাকাউন্ট নেই।
        </div>
      ) : (
        <div className="overflow-x-auto border border-appBorder rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">সদস্যের নাম</th>
                <th className="py-3 px-4">মোবাইল</th>
                <th className="py-3 px-4">স্থগিত অবস্থা</th>
                <th className="py-3 px-4">বাধ্যতামূলক কারণ</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blockedUsers.map(b => (
                <tr key={b._id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-mainText">{b.name}</td>
                  <td className="py-3 px-4 font-mono">{b.phone}</td>
                  <td className="py-3 px-4">
                    <Badge variant="danger" size="sm">{b.accountStatus}</Badge>
                  </td>
                  <td className="py-3 px-4 text-rose-700 max-w-xs">{b.blockReason || 'কারণ সংরক্ষিত নেই'}</td>
                  <td className="py-3 px-4 text-subText">
                    {b.blockedAt ? new Date(b.blockedAt).toLocaleDateString('bn-BD') : 'অজানা'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        setUnblockingUser(b);
                        setUnblockReason('');
                      }}
                    >
                      সচল করুন
                    </Button>
                    <button
                      onClick={() => setDeletingUser(b)}
                      title="স্থায়ীভাবে ডাটা ও অ্যাকাউন্ট মুছে ফেলুন"
                      className="px-2.5 py-1 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>মুছুন</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
