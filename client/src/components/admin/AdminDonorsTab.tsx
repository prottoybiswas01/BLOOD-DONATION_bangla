import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AdminDonorsTabProps {
  users: any[];
  stats: any;
  setDeletingDonor: (donor: any) => void;
}

export const AdminDonorsTab: React.FC<AdminDonorsTabProps> = ({
  users,
  stats,
  setDeletingDonor
}) => {
  const donors = users.filter(u => u.role === 'DONOR' || u.role === 'MEMBER');

  return (
    <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <span>রক্তদাতা ডিরেক্টরি প্রোফাইল</span>
          </h3>
          <p className="text-xs text-subText mt-0.5">স্বেচ্ছাসেবী রক্তদাতাদের তালিকা, প্রাপ্যতা ও প্রোফাইল ব্যবস্থাপনা</p>
        </div>
        <Badge variant="success">নিবন্ধিত রক্তদাতা: {stats?.donorsCount || donors.length} জন</Badge>
      </div>

      {donors.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          কোনো নিবন্ধিত রক্তদাতার তথ্য পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {donors.map((d: any) => (
            <div key={d._id} className="p-4 rounded-2xl border border-appBorder bg-slate-50/50 space-y-3 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-primary font-black flex items-center justify-center text-sm border border-red-200">
                    {d.bloodGroup || 'O+'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-mainText">{d.name}</p>
                    <p className="text-[11px] text-subText font-mono">{d.phone}</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">প্রস্তুত</Badge>
              </div>

              <div className="text-xs text-subText space-y-1">
                <p>📍 অবস্থান: {d.division || 'ঢাকা'}, {d.district || 'ঢাকা'}</p>
                <p>🔒 অনুমতি: জরুরী ভিত্তিতে ফোন প্রদর্শন অনুমোদিত</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">আইডি: {d._id.slice(-6)}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingDonor(d)}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 font-medium py-1 px-2.5 h-auto"
                  icon={<Trash2 className="w-3 h-3 text-rose-500" />}
                >
                  প্রোফাইল মুছুন
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
