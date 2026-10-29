import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  FileText, 
  Eye, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  UserCheck
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'contact_logs' | 'audit_logs'>('overview');

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [contactLogs, setContactLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes, contactRes, auditRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers({ search: userSearch }),
        api.getContactAccessLogs(),
        api.getAuditLogs()
      ]);

      if (overviewRes.success) setStats(overviewRes.stats);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (contactRes.success) setContactLogs(contactRes.logs || []);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userSearch]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setMsg(null);
    try {
      const res = await api.updateUserRole(userId, { role: newRole });
      if (res.success) {
        setMsg({ text: 'ব্যবহারকারীর ভূমিকা হালনাগাদ করা হয়েছে।', type: 'success' });
        loadData();
      } else {
        setMsg({ text: res.message || 'ভূমিকা পরিবর্তন করা যায়নি।', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'ভূমিকা পরিবর্তন ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setMsg(null);
    try {
      const res = await api.toggleUserStatus(userId);
      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        loadData();
      } else {
        setMsg({ text: res.message || 'অ্যাকশন ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'অ্যাকশন ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-red-600 rounded-full text-xs font-bold inline-block mb-2">
            সর্বোচ্চ প্রশাসনিক নিয়ন্ত্রণ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">সুপার এডমিন প্যানেল</h1>
          <p className="text-xs text-gray-300 mt-1">
            সিস্টেমের বাস্তব ডাটা রেকর্ড, ইউজার রোল ব্যবস্থাপনা এবং কন্টাক্ট অ্যাক্সেস অডিট লগ
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl">
          <ShieldAlert className="w-6 h-6 text-red-400" />
          <span className="text-xs font-semibold">নিরাপত্তা ও অডিট সিস্টেম সক্রিয়</span>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${
          msg.type === 'success' ? 'bg-green-50 text-appSuccess border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-appBorder gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          ওভারভিউ ও মেট্রিক্স
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          ইউজার ও রোল ম্যানেজমেন্ট ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('contact_logs')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'contact_logs' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          কন্টাক্ট রিভিল অডিট ট্রেইল ({contactLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'audit_logs' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          প্রশাসনিক অডিট লগ ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
              <span className="text-xs text-subText block">মোট নিবন্ধিত ইউজার</span>
              <span className="text-2xl font-extrabold text-mainText mt-1 block">{stats?.usersCount || 0}</span>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
              <span className="text-xs text-subText block">স্বেচ্ছায় রক্তদাতা প্রোফাইল</span>
              <span className="text-2xl font-extrabold text-primary mt-1 block">{stats?.donorsCount || 0}</span>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
              <span className="text-xs text-subText block">রক্তের অনুরোধ (মোট)</span>
              <span className="text-2xl font-extrabold text-mainText mt-1 block">{stats?.requestsCount || 0}</span>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
              <span className="text-xs text-subText block">ফোন নম্বর উন্মুক্ত অডিট</span>
              <span className="text-2xl font-extrabold text-tealAccent mt-1 block">{stats?.totalContactReveals || 0} বার</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-xs text-blue-900 space-y-2">
            <h4 className="font-bold text-sm">প্রশাসনিক নিরাপত্তা নীতিমালা:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>প্ল্যাটফর্মের শেষ অবশিষ্ট সুপার অ্যাডমিনকে কখনোই পদাবনতি বা নিষ্ক্রিয় করা যাবে না।</li>
              <li>পাবলিক বা গেস্ট এপিআই কখনোই রক্তদাতার ব্যক্তিগত মোবাইল নম্বর প্রদান করবে না।</li>
              <li>সকল সংবেদনশীল রোল পরিবর্তন ও কন্টাক্ট রিভিল অডিট লগে অপরিবর্তনীয়ভাবে সংরক্ষিত হয়।</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 bg-page border border-appBorder rounded-lg text-xs"
              />
            </div>
            <span className="text-xs text-subText">মোট ব্যবহারকারী: {users.length} জন</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                <tr>
                  <th className="py-3 px-4">নাম</th>
                  <th className="py-3 px-4">মোবাইল নম্বর</th>
                  <th className="py-3 px-4">বর্তমান ভূমিকা (Role)</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">পদবি পরিবর্তন ও নিয়ন্ত্রণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-mainText">{u.name}</td>
                    <td className="py-3 px-4 font-mono">{u.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'DIVISION_COORDINATOR' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'INSTITUTION_MODERATOR' ? 'bg-teal-100 text-teal-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isActive ? 'bg-green-100 text-appSuccess' : 'bg-red-100 text-red-600'
                      }`}>
                        {u.isActive ? 'সক্রিয়' : 'স্থগিত'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        className="p-1 border border-appBorder rounded bg-surface text-xs"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="DIVISION_COORDINATOR">DIVISION_COORDINATOR</option>
                        <option value="INSTITUTION_MODERATOR">INSTITUTION_MODERATOR</option>
                        <option value="DONOR">DONOR</option>
                        <option value="REQUESTER">REQUESTER</option>
                      </select>

                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-appSuccess hover:bg-green-100'
                        }`}
                      >
                        {u.isActive ? 'স্থগিত করুন' : 'পুনরুদ্ধার'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Contact Reveal Logs */}
      {activeTab === 'contact_logs' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-mainText flex items-center gap-2">
              <Eye className="w-5 h-5 text-tealAccent" />
              <span>রক্তদাতার যোগাযোগের নম্বর উন্মুক্ত করার অডিট ট্রেইল</span>
            </h3>
            <span className="text-xs text-subText">গোপনীয়তা নজরদারি</span>
          </div>

          {contactLogs.length === 0 ? (
            <p className="text-xs text-subText py-6 text-center">কোনো কন্টাক্ট রিভিল রেকর্ড নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                  <tr>
                    <th className="py-3 px-4">সময় ও তারিখ</th>
                    <th className="py-3 px-4">অনুরোধকারী (Viewer)</th>
                    <th className="py-3 px-4">অনুরোধকারীর মোবাইল</th>
                    <th className="py-3 px-4">লক্ষ্য রক্তদাতা</th>
                    <th className="py-3 px-4">রক্তদাতার নম্বর</th>
                    <th className="py-3 px-4">উদ্দেশ্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contactLogs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">{new Date(log.createdAt).toLocaleString('bn-BD')}</td>
                      <td className="py-3 px-4 font-semibold text-mainText">{log.viewerName}</td>
                      <td className="py-3 px-4 font-mono">{log.viewerPhone}</td>
                      <td className="py-3 px-4 font-semibold text-primary">{log.donorName}</td>
                      <td className="py-3 px-4 font-mono text-appSuccess font-bold">{log.donorPhone}</td>
                      <td className="py-3 px-4">{log.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Administrative Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>প্রশাসনিক কার্যক্রমের অডিট হিস্টোরি</span>
          </h3>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-subText py-6 text-center">কোনো অডিট লগ পাওয়া যায়নি।</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((al: any) => (
                <div key={al._id} className="p-3 bg-page rounded-xl border border-appBorder text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-mainText mr-2">{al.action}</span>
                    <span className="text-subText text-[11px] font-mono">({al.targetType} #{al.targetId})</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      ভূমিকা: <span className="font-semibold text-primary">{al.actorRole}</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {new Date(al.createdAt).toLocaleString('bn-BD')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

