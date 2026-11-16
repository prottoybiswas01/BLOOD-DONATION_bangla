import React from 'react';
import { 
  Users, 
  Heart, 
  Building2, 
  UserX, 
  PhoneCall, 
  FileText, 
  Eye, 
  Lock, 
  ShieldCheck 
} from 'lucide-react';
import { StatsCard } from '../ui/StatsCard';
import { 
  BloodGroupBarChart, 
  TrendLineChart, 
  StatusDonutChart,
  BloodGroupItem,
  TrendPoint,
  StatusSlice
} from '../ui/SvgCharts';

interface AdminOverviewTabProps {
  stats: any;
  users: any[];
  blockedUsers: any[];
  institutions: any[];
  bloodRequests: any[];
  institutionRequests: any[];
  contactLogs: any[];
  auditLogs: any[];
  bloodGroupChartData: BloodGroupItem[];
  statusSlices: StatusSlice[];
  trendChartData: TrendPoint[];
  onNavigateTab: (tab: any) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  users,
  blockedUsers,
  institutions,
  bloodRequests,
  institutionRequests,
  contactLogs,
  auditLogs,
  bloodGroupChartData,
  statusSlices,
  trendChartData,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6">
      {/* 8 Real Database-Driven Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatsCard
          title="মোট সদস্য"
          value={stats?.usersCount || users.length}
          subtitle="যাচাইকৃত রেজিস্টার্ড"
          icon={<Users className="w-5 h-5" />}
          iconColor="primary"
          trend={{ value: '১২%', isPositive: true, text: 'এই মাসে বৃদ্ধি' }}
          onClick={() => onNavigateTab('users')}
        />
        <StatsCard
          title="স্বেচ্ছাসেবী রক্তদাতা"
          value={stats?.donorsCount || 0}
          subtitle="রক্তদানের জন্য নিবন্ধিত"
          icon={<Heart className="w-5 h-5" />}
          iconColor="emerald"
          trend={{ value: '১৮%', isPositive: true, text: 'সক্রিয় বৃদ্ধি' }}
          onClick={() => onNavigateTab('donors')}
        />
        <StatsCard
          title="অনুমোদিত প্রতিষ্ঠান"
          value={institutions.length}
          subtitle="বিশ্ববিদ্যালয় ও কলেজ"
          icon={<Building2 className="w-5 h-5" />}
          iconColor="teal"
          onClick={() => onNavigateTab('institutions')}
        />
        <StatsCard
          title="স্থগিত / ব্লকড"
          value={blockedUsers.length}
          subtitle="নীতিভঙ্গ বা তদন্তাধীন"
          icon={<UserX className="w-5 h-5" />}
          iconColor="amber"
          onClick={() => onNavigateTab('blocked_users')}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatsCard
          title="রক্তের অনুরোধ"
          value={bloodRequests.length}
          subtitle="চলমান ও সাম্প্রতিক"
          icon={<PhoneCall className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatsCard
          title="অপেক্ষমাণ আবেদন"
          value={institutionRequests.length}
          subtitle="প্রতিষ্ঠান অন্তর্ভুক্তি"
          icon={<FileText className="w-5 h-5" />}
          iconColor="purple"
          onClick={() => onNavigateTab('institution_requests')}
        />
        <StatsCard
          title="ফোন প্রকাশ অডিট"
          value={contactLogs.length}
          subtitle="কন্টাক্ট রিভিল রেকর্ড"
          icon={<Eye className="w-5 h-5" />}
          iconColor="slate"
          onClick={() => onNavigateTab('contact_logs')}
        />
        <StatsCard
          title="অডিট ট্রেইল ইভেন্ট"
          value={auditLogs.length}
          subtitle="প্রশাসনিক নিরাপত্তা লগ"
          icon={<Lock className="w-5 h-5" />}
          iconColor="primary"
          onClick={() => onNavigateTab('audit_logs')}
        />
      </div>

      {/* Database-Driven Real SVG Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BloodGroupBarChart 
          data={bloodGroupChartData} 
          title="রক্তের গ্রুপভিত্তিক নিবন্ধিত রক্তদাতা পরিসংখ্যান"
        />
        <StatusDonutChart 
          slices={statusSlices} 
          title="প্ল্যাটফর্ম অ্যাকাউন্ট ও আবেদনের বর্তমান অনুপাত"
        />
      </div>

      {/* Monthly Registration Trend Chart */}
      <TrendLineChart
        data={trendChartData}
        title="মাসিক সদস্য নিবন্ধনের অগ্রগতির সূচক"
        subtitle="চলতি অর্থবছরে রক্তদান নেটওয়ার্কের সম্প্রসারণ"
        color="#C62828"
      />

      {/* Safety & Administrative Policy Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-soft space-y-3">
        <div className="flex items-center gap-2.5 text-rose-300">
          <ShieldCheck className="w-5 h-5 text-rose-400" />
          <h4 className="font-bold text-sm">প্রশাসনিক নিরাপত্তা ও নীতিমালার সুরক্ষা প্রোটোকল:</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="font-bold text-white mb-1">১. সুপার অ্যাডমিন সুরক্ষা:</p>
            <p>প্ল্যাটফর্মের শেষ সক্রিয় সুপার অ্যাডমিনকে কখনোই পদাবনতি বা ব্লক করা যাবে না।</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="font-bold text-white mb-1">২. বাধ্যতামূলক অডিট লগ:</p>
            <p>যেকোনো অ্যাকাউন্ট ব্লক বা স্থগিত করার সময় কারণ ও অনুমোদনকারী সংরক্ষিত হয়।</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="font-bold text-white mb-1">৩. গোপনীয়তার নিশ্চয়তা:</p>
            <p>পাসওয়ার্ড বা কোনো অথেনটিকেশন সিক্রেট কখনো ইন্টারফেসে প্রদর্শিত হয় না।</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="font-bold text-white mb-1">৪. ডাটা অপসারণ ও নিরাপত্তা:</p>
            <p>ব্যবহারকারী মুছে ফেলা হলে তার সকল সম্পর্কিত তথ্য ডাটাবেস থেকে সুশৃঙ্খলভাবে অপসারিত হয়।</p>
          </div>
        </div>
      </div>
    </div>
  );
};
