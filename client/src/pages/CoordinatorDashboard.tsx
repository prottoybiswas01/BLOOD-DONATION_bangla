import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, AlertTriangle, Users, Building2, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CoordinatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoordinatorData() {
      try {
        const res = await api.getCoordinatorDashboard();
        if (res.success) {
          setData(res);
        } else {
          setErrorMsg(res.message || 'বিভাগীয় তথ্য লোড করা যায়নি।');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'অনধিকার প্রবেশ বা সার্ভার ত্রুটি।');
      } finally {
        setLoading(false);
      }
    }
    loadCoordinatorData();
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-8"><div className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div></div>;
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface rounded-2xl border border-appBorder shadow text-center space-y-3">
        <AlertTriangle className="w-12 h-12 text-primary mx-auto" />
        <h3 className="font-bold text-mainText text-lg">অনুমতি নেই</h3>
        <p className="text-xs text-subText">{errorMsg}</p>
      </div>
    );
  }

  const { division, stats, requests, reports, institutions } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold inline-block mb-2">
            বিভাগীয় সমন্বয়ক প্যানেল
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{division?.nameBn} বিভাগ সমন্বয় কেন্দ্র</h1>
          <p className="text-xs text-blue-100 mt-1">
            দায়িত্বপ্রাপ্ত এলাকা: {division?.nameBn} ({division?.nameEn}) বিভাগ • অনুমোদিত সমন্বয়ক: {user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-blue-200" />
          <span className="text-xs font-semibold">বিভাগীয় নিরাপত্তা ও মডারেশন</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">বিভাগে নিবন্ধিত রক্তদাতা</span>
          <span className="text-2xl font-extrabold text-mainText mt-1 block">{stats?.totalDonors || 0} জন</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">বর্তমানে প্রস্তুত রক্তদাতা</span>
          <span className="text-2xl font-extrabold text-appSuccess mt-1 block">{stats?.availableDonors || 0} জন</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">বিভাগে মোট রক্তের অনুরোধ</span>
          <span className="text-2xl font-extrabold text-mainText mt-1 block">{stats?.totalRequests || 0} টি</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">অমীমাংসিত অভিযোগ</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{stats?.pendingReports || 0} টি</span>
        </div>
      </div>

      {/* Division Blood Requests */}
      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-primary" />
            <span>{division?.nameBn} বিভাগের চলমান রক্তের অনুরোধসমূহ</span>
          </h3>
          <span className="text-xs text-subText">আঞ্চলিক তদারকি</span>
        </div>

        {(!requests || requests.length === 0) ? (
          <p className="text-xs text-subText py-6 text-center">বিভাগে কোনো রক্তের অনুরোধ নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                <tr>
                  <th className="py-3 px-4">রোগী</th>
                  <th className="py-3 px-4">গ্রুপ</th>
                  <th className="py-3 px-4">হাসপাতাল ও জেলা</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r: any) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-mainText">{r.patientName}</td>
                    <td className="py-3 px-4 font-bold text-primary">{r.bloodGroup}</td>
                    <td className="py-3 px-4">{r.hospitalName}, {r.district}</td>
                    <td className="py-3 px-4">{new Date(r.requiredDate).toLocaleDateString('bn-BD')}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-appSuccess">
                        {r.status}
                      </span>
                    </td>
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

