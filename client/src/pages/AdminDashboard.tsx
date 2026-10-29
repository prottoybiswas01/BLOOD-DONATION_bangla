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
  UserCheck,
  UserX,
  History,
  ShieldCheck,
  Edit,
  Info,
  Clock
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshLocations';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'blocked_users' | 'institution_requests' | 'status_history' | 'contact_logs' | 'audit_logs'>('overview');

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [statusHistories, setStatusHistories] = useState<any[]>([]);
  const [institutionRequests, setInstitutionRequests] = useState<any[]>([]);
  const [contactLogs, setContactLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [blockingUser, setBlockingUser] = useState<any | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockStatus, setBlockStatus] = useState<'temporarily_blocked' | 'permanently_blocked' | 'suspended'>('temporarily_blocked');

  const [unblockingUser, setUnblockingUser] = useState<any | null>(null);
  const [unblockReason, setUnblockReason] = useState('');

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState('unspecified');
  const [editDivision, setEditDivision] = useState('dhaka');
  const [editDistrict, setEditDistrict] = useState('dhaka');

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes, contactRes, auditRes, blockedRes, histRes, instReqRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers({ search: userSearch }),
        api.getContactAccessLogs(),
        api.getAuditLogs(),
        api.getBlockedUsers(),
        api.getAccountStatusHistories(),
        api.getInstitutionRequests()
      ]);

      if (overviewRes.success) setStats(overviewRes.stats);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (contactRes.success) setContactLogs(contactRes.logs || []);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
      if (blockedRes.success) setBlockedUsers(blockedRes.blockedUsers || []);
      if (histRes.success) setStatusHistories(histRes.histories || []);
      if (instReqRes.success) setInstitutionRequests(instReqRes.requests || []);
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
    if (!isSuperAdmin && newRole === 'SUPER_ADMIN') {
      setMsg({ text: 'অনধিকার চর্চা: শুধুমাত্র সুপার অ্যাডমিন নতুন সুপার অ্যাডমিন পদবি প্রদান করতে পারেন।', type: 'error' });
      return;
    }

    try {
      const res = await api.updateUserRole(userId, { role: newRole });
      if (res.success) {
        setMsg({ text: 'ব্যবহারকারীর ভূমিকা সফলভাবে হালনাগাদ করা হয়েছে।', type: 'success' });
        loadData();
      } else {
        setMsg({ text: res.message || 'ভূমিকা পরিবর্তন করা যায়নি।', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'ভূমিকা পরিবর্তন ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockingUser) return;
    if (blockReason.trim().length < 5) {
      setMsg({ text: 'অ্যাকাউন্ট ব্লক বা স্থগিত করার সুস্পষ্ট কারণ (কমপক্ষে ৫ অক্ষর) উল্লেখ করুন।', type: 'error' });
      return;
    }

    try {
      const res = await api.blockUser(blockingUser._id, blockReason, blockStatus);
      if (res.success) {
        setMsg({ text: res.message || 'অ্যাকাউন্টটি সফলভাবে স্থগিত/ব্লক করা হয়েছে।', type: 'success' });
        setBlockingUser(null);
        setBlockReason('');
        loadData();
      } else {
        setMsg({ text: res.message || 'অ্যাকশন ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'অ্যাকশন ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  const handleUnblockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unblockingUser) return;
    if (unblockReason.trim().length < 5) {
      setMsg({ text: 'অ্যাকাউন্ট পুনরায় সচল করার কারণ (কমপক্ষে ৫ অক্ষর) উল্লেখ করুন।', type: 'error' });
      return;
    }

    try {
      const res = await api.unblockUser(unblockingUser._id, unblockReason);
      if (res.success) {
        setMsg({ text: res.message || 'অ্যাকাউন্টটি পুনরায় সক্রিয় করা হয়েছে।', type: 'success' });
        setUnblockingUser(null);
        setUnblockReason('');
        loadData();
      } else {
        setMsg({ text: res.message || 'অ্যাকশন ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'অ্যাকশন ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setEditName(u.name || '');
    setEditGender(u.gender || 'unspecified');
    setEditDivision(u.division || 'dhaka');
    setEditDistrict(u.district || 'dhaka');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await api.adminEditUserProfile(editingUser._id, {
        name: editName,
        gender: editGender,
        division: editDivision,
        district: editDistrict
      });

      if (res.success) {
        setMsg({ text: 'সদস্যের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।', type: 'success' });
        setEditingUser(null);
        loadData();
      } else {
        setMsg({ text: res.message || 'হালনাগাদ করা সম্ভব হয়নি।', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'হালনাগাদ ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-red-600 rounded-full text-xs font-bold inline-block mb-2">
            {isSuperAdmin ? 'সর্বোচ্চ প্রশাসনিক নিয়ন্ত্রণ (Super Admin)' : 'প্ল্যাটফর্ম পরিচালনা প্যানেল (Platform Admin)'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {isSuperAdmin ? 'সুপার অ্যাডমিন ড্যাশবোর্ড' : 'প্ল্যাটফর্ম অ্যাডমিন ড্যাশবোর্ড'}
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            সদস্য ব্যবস্থাপনা, অ্যাকাউন্ট নিয়ন্ত্রণ ও কারণ সংরক্ষণ, এবং সার্বিক নিরাপত্তা ট্র্যাকিং
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl">
          <ShieldAlert className="w-6 h-6 text-red-400" />
          <span className="text-xs font-semibold">নিরাপত্তা ও অডিট সিস্টেম সক্রিয়</span>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          msg.type === 'success' ? 'bg-green-50 text-appSuccess border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-xs font-bold px-2">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-appBorder gap-4 text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          ওভারভিউ
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          সদস্য ও ইউজার ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('blocked_users')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'blocked_users' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          স্থগিত ও ব্লককৃত ({blockedUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('institution_requests')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'institution_requests' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          প্রতিষ্ঠান আবেদন ({institutionRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('status_history')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'status_history' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          স্ট্যাটাস হিস্ট্রি ({statusHistories.length})
        </button>
        <button
          onClick={() => setActiveTab('contact_logs')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'contact_logs' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          কন্টাক্ট রিভিল ({contactLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'audit_logs' ? 'border-primary text-primary' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          অডিট লগ ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
              <span className="text-xs text-subText block">মোট নিবন্ধিত সদস্য</span>
              <span className="text-2xl font-extrabold text-mainText mt-1 block">{stats?.usersCount || 0}</span>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
              <span className="text-xs text-subText block">স্বেচ্ছায় রক্তদাতা প্রোফাইল</span>
              <span className="text-2xl font-extrabold text-primary mt-1 block">{stats?.donorsCount || 0}</span>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
              <span className="text-xs text-subText block">স্থগিত / ব্লককৃত অ্যাকাউন্ট</span>
              <span className="text-2xl font-extrabold text-red-600 mt-1 block">{blockedUsers.length}</span>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
              <span className="text-xs text-subText block">প্রাতিষ্ঠানিক আবেদন</span>
              <span className="text-2xl font-extrabold text-tealAccent mt-1 block">{institutionRequests.length}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-xs text-blue-900 space-y-2">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>প্রশাসনিক নিরাপত্তা ও নীতিমালার নিয়মাবলী:</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>প্ল্যাটফর্মের শেষ অবশিষ্ট সুপার অ্যাডমিনকে কখনোই পদাবনতি বা ব্লক করা যাবে না।</li>
              <li>প্ল্যাটফর্ম অ্যাডমিন কোনো প্রাতিষ্ঠানিক নিবন্ধন আবেদন এককভাবে অনুমোদন বা প্রত্যাখ্যান করতে পারেন না (এটি বিভাগীয় সমন্বয়কারী বা সুপার অ্যাডমিনের এখতিয়ার)।</li>
              <li>যেকোনো অ্যাকাউন্ট ব্লক বা স্থগিত করার সময় বাধ্যতামূলকভাবে যুক্তিসঙ্গত কারণ উল্লেখ করতে হবে।</li>
              <li>পাসওয়ার্ড বা কোনো গোপনীয় হ্যাশ অ্যাডমিন প্যানেলে কখনোই প্রদর্শিত হয় না।</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            <span className="text-xs text-subText font-medium">মোট ব্যবহারকারী: {users.length} জন</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                <tr>
                  <th className="py-3 px-4">নাম</th>
                  <th className="py-3 px-4">মোবাইল নম্বর</th>
                  <th className="py-3 px-4">বর্তমান ভূমিকা</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u: any) => {
                  const isBlocked = u.accountStatus && u.accountStatus !== 'active';
                  return (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-mainText">{u.name}</div>
                        <div className="text-[10px] text-gray-400 capitalize">{u.gender || 'unspecified'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">{u.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' :
                          u.role === 'DIVISION_COORDINATOR' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'INSTITUTION_MODERATOR' ? 'bg-teal-100 text-teal-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          !isBlocked ? 'bg-green-100 text-appSuccess' : 'bg-red-100 text-red-600'
                        }`}>
                          {!isBlocked ? 'সক্রিয়' : 'স্থগিত / ব্লকড'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {/* Edit Profile */}
                        <button
                          onClick={() => openEditModal(u)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold"
                        >
                          সম্পাদনা
                        </button>

                        {/* Role Change */}
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          disabled={!isSuperAdmin && u.role === 'SUPER_ADMIN'}
                          className="p-1 border border-appBorder rounded bg-surface text-xs"
                        >
                          {isSuperAdmin && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
                          <option value="ADMIN">ADMIN</option>
                          <option value="DIVISION_COORDINATOR">DIVISION_COORDINATOR</option>
                          <option value="INSTITUTION_MODERATOR">INSTITUTION_MODERATOR</option>
                          <option value="MEMBER">MEMBER</option>
                          <option value="DONOR">DONOR</option>
                          <option value="REQUESTER">REQUESTER</option>
                        </select>

                        {/* Block/Unblock */}
                        {!isBlocked ? (
                          <button
                            onClick={() => {
                              setBlockingUser(u);
                              setBlockReason('');
                            }}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            ব্লক / স্থগিত
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setUnblockingUser(u);
                              setUnblockReason('');
                            }}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-green-50 text-appSuccess hover:bg-green-100"
                          >
                            পুনরুদ্ধার
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Blocked Users */}
      {activeTab === 'blocked_users' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-mainText flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              <span>স্থগিত ও ব্লককৃত অ্যাকাউন্ট তালিকা ({blockedUsers.length})</span>
            </h3>
          </div>

          {blockedUsers.length === 0 ? (
            <div className="text-center py-10 text-xs text-subText">বর্তমানে কোনো ব্লককৃত অ্যাকাউন্ট নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                  <tr>
                    <th className="py-3 px-4">সদস্যের নাম</th>
                    <th className="py-3 px-4">মোবাইল নম্বর</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4">স্থগিতের কারণ</th>
                    <th className="py-3 px-4">সময়</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {blockedUsers.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-mainText">{b.name}</td>
                      <td className="py-3 px-4 font-mono">{b.phone}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                          {b.accountStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-red-700 max-w-xs">{b.blockReason || 'কারণ লিপিবদ্ধ নেই'}</td>
                      <td className="py-3 px-4 text-subText">
                        {b.blockedAt ? new Date(b.blockedAt).toLocaleDateString('bn-BD') : 'অজানা'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setUnblockingUser(b);
                            setUnblockReason('');
                          }}
                          className="px-3 py-1 bg-green-50 hover:bg-green-100 text-appSuccess rounded font-semibold text-xs"
                        >
                          সচল করুন (Unblock)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Institution Requests */}
      {activeTab === 'institution_requests' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-appBorder">
            <div>
              <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                <Building2 className="w-5 h-5 text-tealAccent" />
                <span>শিক্ষা প্রতিষ্ঠান নিবন্ধন আবেদনসমূহ</span>
              </h3>
              <p className="text-xs text-subText">নতুন প্রতিষ্ঠান বা ক্লাবের অন্তর্ভুক্তির অনুরোধের তালিকা</p>
            </div>
            {!isSuperAdmin && (
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>রিড-অনলি মোড: অনুমোদন কেবল বিভাগীয় সমন্বয়কারী বা সুপার অ্যাডমিনের এখতিয়ারভুক্ত</span>
              </span>
            )}
          </div>

          {institutionRequests.length === 0 ? (
            <div className="text-center py-10 text-xs text-subText">কোনো প্রাতিষ্ঠানিক আবেদন জমা নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                  <tr>
                    <th className="py-3 px-4">প্রতিষ্ঠানের নাম</th>
                    <th className="py-3 px-4">কোড ও ধরণ</th>
                    <th className="py-3 px-4">বিভাগ ও জেলা</th>
                    <th className="py-3 px-4">আবেদনকারী</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4">তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {institutionRequests.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-mainText">{req.nameBn || req.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs">{req.code}</span>
                        <div className="text-[10px] text-gray-500">{req.type}</div>
                      </td>
                      <td className="py-3 px-4">{req.division}, {req.district}</td>
                      <td className="py-3 px-4">
                        <div>{req.applicantName}</div>
                        <div className="text-gray-400 font-mono text-[10px]">{req.applicantPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'approved' ? 'bg-green-100 text-appSuccess' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'approved' ? 'অনুমোদিত' : req.status === 'rejected' ? 'বাতিলকৃত' : 'বিচারাধীন'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-subText">
                        {new Date(req.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Status History */}
      {activeTab === 'status_history' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <History className="w-5 h-5 text-gray-700" />
            <span>অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন ও ব্লক হিস্ট্রি ({statusHistories.length})</span>
          </h3>

          {statusHistories.length === 0 ? (
            <div className="text-center py-10 text-xs text-subText">কোনো স্ট্যাটাস পরিবর্তনের রেকর্ড নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                  <tr>
                    <th className="py-3 px-4">লক্ষ্য সদস্য</th>
                    <th className="py-3 px-4">পরিবর্তিত অবস্থা</th>
                    <th className="py-3 px-4">কর্তা (Changer)</th>
                    <th className="py-3 px-4">প্রদত্ত কারণ</th>
                    <th className="py-3 px-4">তারিখ ও সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {statusHistories.map(h => (
                    <tr key={h._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-mainText">
                        <div>{h.targetUserName || 'ইউজার ID: ' + h.userId}</div>
                        <div className="text-gray-400 font-mono text-[10px]">{h.targetUserPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-subText line-through mr-1">{h.previousStatus}</span>
                        <span>→</span>
                        <span className="font-bold ml-1 text-mainText">{h.newStatus}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{h.changerName || h.changedBy}</div>
                        <div className="text-[10px] text-gray-400">{h.changerRole}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-gray-700">{h.reason}</td>
                      <td className="py-3 px-4 text-subText">
                        {new Date(h.changedAt).toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Contact Logs */}
      {activeTab === 'contact_logs' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <Eye className="w-5 h-5 text-tealAccent" />
            <span>ফোন নম্বর উন্মুক্তকরণের অডিট রেকর্ড</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                <tr>
                  <th className="py-3 px-4">অনুসন্ধানকারী</th>
                  <th className="py-3 px-4">রক্তদাতা</th>
                  <th className="py-3 px-4">উদ্দেশ্য</th>
                  <th className="py-3 px-4">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contactLogs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-mainText">{log.viewerName}</div>
                      <div className="text-subText font-mono text-[10px]">{log.viewerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-primary">{log.donorName}</div>
                      <div className="text-subText font-mono text-[10px]">{log.donorPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100">
                        {log.purpose}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-subText">
                      {new Date(log.createdAt).toLocaleString('bn-BD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            <span>প্রশাসনিক কার্যক্রম অডিট ট্রেইল</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                <tr>
                  <th className="py-3 px-4">অ্যাকশন</th>
                  <th className="py-3 px-4">কর্তা (Actor)</th>
                  <th className="py-3 px-4">টার্গেট</th>
                  <th className="py-3 px-4">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono font-bold text-mainText">{log.action}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-subText font-mono">{log.targetType}: {log.targetId}</td>
                    <td className="py-3 px-4 text-subText">
                      {new Date(log.createdAt).toLocaleString('bn-BD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {blockingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-gray-900">অ্যাকাউন্ট স্থগিত / ব্লক করণ</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              সদস্য: <strong>{blockingUser.name}</strong> ({blockingUser.phone})
            </p>

            <form onSubmit={handleBlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  স্থগিতকরণের ধরণ
                </label>
                <select
                  value={blockStatus}
                  onChange={e => setBlockStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="temporarily_blocked">সাময়িক স্থগিত (Temporarily Blocked)</option>
                  <option value="suspended">সাসপেন্ড (Suspended)</option>
                  <option value="permanently_blocked">স্থায়ীভাবে নিষিদ্ধ (Permanently Blocked)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  স্থগিতের বাধ্যতামূলক কারণ <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder="যেমন: ভুয়া অনুরোধ বা নীতিভঙ্গের বিবরণ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  অ্যাকাউন্ট স্থগিত নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unblock User Modal */}
      {unblockingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-green-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-green-600 mb-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-gray-900">অ্যাকাউন্ট পুনরায় সচল করণ</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              সদস্য: <strong>{unblockingUser.name}</strong> ({unblockingUser.phone})
            </p>

            <form onSubmit={handleUnblockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  পুনরুদ্ধারের কারণ ও পর্যবেক্ষণ <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={unblockReason}
                  onChange={e => setUnblockReason(e.target.value)}
                  placeholder="যেমন: ভুলের মীমাংসা হয়েছে বা সদস্যের সতর্কতা গ্রহণ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUnblockingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  পুনরুদ্ধার নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-gray-800 mb-3">
              <Edit className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">সদস্যের তথ্য সম্পাদনা</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              মোবাইল: <strong className="font-mono text-gray-700">{editingUser.phone}</strong>
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">সদস্যের নাম</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">লিঙ্গ</label>
                <select
                  value={editGender}
                  onChange={e => setEditGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                >
                  <option value="male">পুরুষ</option>
                  <option value="female">নারী</option>
                  <option value="other">অন্যান্য</option>
                  <option value="unspecified">বলতে অনিচ্ছুক</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">বিভাগ</label>
                  <select
                    value={editDivision}
                    onChange={e => setEditDivision(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  >
                    {BANGLADESH_DIVISIONS.map(d => (
                      <option key={d.id} value={d.id}>{d.nameBn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">জেলা</label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={e => setEditDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow transition"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
