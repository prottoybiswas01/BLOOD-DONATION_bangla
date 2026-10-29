import React, { useState, useEffect } from 'react';
import { Building2, Users, PlusCircle, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const ModeratorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.getModeratorDashboard();
        if (res.success) {
          setData(res);
        } else {
          setErrorMsg(res.message || 'ড্যাশবোর্ড তথ্য লোড করা যায়নি।');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'অনধিকার প্রবেশ বা সার্ভার ত্রুটি।');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-8"><div className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div></div>;
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface rounded-2xl border border-appBorder shadow text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-primary mx-auto" />
        <h3 className="font-bold text-mainText text-lg">অনুমতি নেই</h3>
        <p className="text-xs text-subText">{errorMsg}</p>
      </div>
    );
  }

  const { institution, stats, donors, requests } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-tealAccent text-white rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold inline-block mb-2">
            প্রতিষ্ঠান মডারেটর ড্যাশবোর্ড
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{institution?.nameBn}</h1>
          <p className="text-xs text-teal-100 mt-1">{institution?.name} • কোড: {institution?.code}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-teal-200" />
          <span className="text-xs font-semibold">যাচাইকৃত প্রতিষ্ঠান পোর্টাল</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">মোট নিবন্ধিত রক্তদাতা</span>
          <span className="text-2xl font-extrabold text-mainText mt-1 block">{stats?.totalDonors || 0} জন</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">বর্তমানে রক্তদানে প্রস্তুত</span>
          <span className="text-2xl font-extrabold text-appSuccess mt-1 block">{stats?.availableDonors || 0} জন</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">মোট ক্যাম্প রক্তদান আবেদন</span>
          <span className="text-2xl font-extrabold text-mainText mt-1 block">{stats?.totalRequests || 0} টি</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">সক্রিয় অনুরোধ</span>
          <span className="text-2xl font-extrabold text-primary mt-1 block">{stats?.activeRequests || 0} টি</span>
        </div>
      </div>

      {/* Affiliated Donors List (Privacy-Safe Roster) */}
      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <Users className="w-5 h-5 text-tealAccent" />
            <span>অধিভুক্ত রক্তদাতাদের তালিকা (গোপনীয়তা সুরক্ষিত)</span>
          </h3>
          <span className="text-xs text-subText">ব্যক্তিগত ফোন নম্বর সুরক্ষিত</span>
        </div>

        {(!donors || donors.length === 0) ? (
          <p className="text-xs text-subText py-6 text-center">এখনো কোনো শিক্ষার্থী বা সদস্য যুক্ত হননি।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">নাম</th>
                  <th className="py-3 px-4">রক্তের গ্রুপ</th>
                  <th className="py-3 px-4">অবস্থা</th>
                  <th className="py-3 px-4">মোট রক্তদান</th>
                  <th className="py-3 px-4">সদস্যপদ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donors.map((d: any) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-mainText">{d.displayName}</td>
                    <td className="py-3 px-4 font-bold text-primary">{d.bloodGroup}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.availabilityStatus === 'available' ? 'bg-green-100 text-appSuccess' : 'bg-gray-100 text-subText'
                      }`}>
                        {d.availabilityStatus === 'available' ? 'প্রস্তুত' : 'বিরতি'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{d.totalDonations} বার</td>
                    <td className="py-3 px-4 text-tealAccent font-medium">✓ প্রত্যয়িত সদস্য</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
