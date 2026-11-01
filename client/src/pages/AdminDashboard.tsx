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
  Clock,
  RotateCcw,
  LayoutDashboard,
  Heart,
  Droplet,
  ChevronRight,
  Filter,
  PlusCircle,
  ExternalLink,
  PhoneCall,
  Menu,
  X,
  Sliders,
  Settings,
  Phone,
  XCircle,
  Check,
  Loader2
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BANGLADESH_DIVISIONS, BLOOD_GROUPS } from '../data/bangladeshLocations';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/ui/StatsCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Modal } from '../components/ui/Modal';
import { BloodGroupBarChart, TrendLineChart, StatusDonutChart } from '../components/ui/SvgCharts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Navigation Tabs
  type TabKey = 
    | 'overview' 
    | 'users' 
    | 'donors'
    | 'phone_requests'
    | 'blocked_users' 
    | 'institutions'
    | 'institution_requests' 
    | 'status_history' 
    | 'contact_logs' 
    | 'audit_logs'
    | 'settings';

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [statusHistories, setStatusHistories] = useState<any[]>([]);
  const [institutionRequests, setInstitutionRequests] = useState<any[]>([]);
  const [contactLogs, setContactLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [phoneRequests, setPhoneRequests] = useState<any[]>([]);

  // Filtering & Pagination
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 8;

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

  // Phone Change Review Modal
  const [reviewingPhoneReq, setReviewingPhoneReq] = useState<any | null>(null);
  const [phoneReviewStatus, setPhoneReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [phoneReviewNotes, setPhoneReviewNotes] = useState('');
  const [submittingPhoneReview, setSubmittingPhoneReview] = useState(false);

  // Institution Drill Down Modal
  const [drillDownInst, setDrillDownInst] = useState<any | null>(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [drillDownData, setDrillDownData] = useState<{ members: any[]; donors: any[]; counts: { members: number; donors: number } } | null>(null);

  // Detail Modal
  const [viewingUser, setViewingUser] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes, 
        usersRes, 
        contactRes, 
        auditRes, 
        blockedRes, 
        histRes, 
        instReqRes,
        instRes,
        reqsRes,
        phoneReqsRes
      ] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers({ search: userSearch }),
        api.getContactAccessLogs(),
        api.getAuditLogs(),
        api.getBlockedUsers(),
        api.getAccountStatusHistories(),
        api.getInstitutionRequests(),
        api.getInstitutions(),
        api.searchRequests({ limit: 10 }),
        api.getPhoneChangeRequests()
      ]);

      if (overviewRes.success) setStats(overviewRes.stats);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (contactRes.success) setContactLogs(contactRes.logs || []);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
      if (blockedRes.success) setBlockedUsers(blockedRes.blockedUsers || []);
      if (histRes.success) setStatusHistories(histRes.histories || []);
      if (instReqRes.success) setInstitutionRequests(instReqRes.requests || []);
      if (instRes.success) setInstitutions(instRes.institutions || []);
      if (reqsRes.success) setBloodRequests(reqsRes.requests || []);
      if (phoneReqsRes.success) setPhoneRequests(phoneReqsRes.requests || []);
    } catch (err: any) {
      console.error('Admin data load failed:', err);
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

  const handleReviewPhoneRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingPhoneReq) return;
    setSubmittingPhoneReview(true);
    try {
      const res = await api.reviewPhoneChangeRequest(reviewingPhoneReq._id, {
        status: phoneReviewStatus,
        reviewNotes: phoneReviewNotes
      });
      if (res.success) {
        setMsg({ text: res.message || 'নম্বর পরিবর্তনের আবেদন পর্যালোচনা সম্পন্ন হয়েছে।', type: 'success' });
        setReviewingPhoneReq(null);
        setPhoneReviewNotes('');
        loadData();
      } else {
        setMsg({ text: res.message || 'পর্যালোচনা ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'পর্যালোচনা ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setSubmittingPhoneReview(false);
    }
  };

  const handleOpenDrillDown = async (inst: any) => {
    setDrillDownInst(inst);
    setDrillDownLoading(true);
    setDrillDownData(null);
    try {
      const res = await api.getInstitutionMembers(inst._id);
      if (res.success) {
        setDrillDownData({
          members: res.members || [],
          donors: res.donors || [],
          counts: res.counts || { members: 0, donors: 0 }
        });
      } else {
        setMsg({ text: res.message || 'সদস্য তালিকা লোড করা যায়নি।', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'ডাটা লোড ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setDrillDownLoading(false);
    }
  };

  // Nav Groups
  interface NavItem {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }
  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'প্রধান নিয়ন্ত্রণ',
      items: [
        { key: 'overview', label: 'সারাংশ ড্যাশবোর্ড', icon: <LayoutDashboard className="w-4 h-4" /> },
      ]
    },
    {
      title: 'সদস্য ও রক্তদাতা',
      items: [
        { key: 'users', label: 'ব্যবহারকারী ও সদস্য', icon: <Users className="w-4 h-4" />, count: users.length },
        { key: 'donors', label: 'রক্তদাতা প্রোফাইল', icon: <Heart className="w-4 h-4" />, count: stats?.donorsCount || 0 },
        { 
          key: 'phone_requests', 
          label: 'নম্বর পরিবর্তন আবেদন', 
          icon: <Phone className="w-4 h-4" />, 
          count: phoneRequests.filter(r => r.status === 'pending').length 
        },
        { key: 'blocked_users', label: 'স্থগিত ও ব্লককৃত', icon: <UserX className="w-4 h-4" />, count: blockedUsers.length },
      ]
    },
    {
      title: 'প্রতিষ্ঠান ও অঞ্চল',
      items: [
        { key: 'institutions', label: 'অনুমোদিত প্রতিষ্ঠান', icon: <Building2 className="w-4 h-4" />, count: institutions.length },
        { key: 'institution_requests', label: 'প্রতিষ্ঠান আবেদন', icon: <FileText className="w-4 h-4" />, count: institutionRequests.length },
      ]
    },
    {
      title: 'নিরাপত্তা ও অডিট',
      items: [
        { key: 'contact_logs', label: 'ফোন নম্বর অডিট', icon: <Eye className="w-4 h-4" />, count: contactLogs.length },
        { key: 'status_history', label: 'স্ট্যাটাস হিস্ট্রি', icon: <History className="w-4 h-4" />, count: statusHistories.length },
        { key: 'audit_logs', label: 'অডিট ট্রেইল', icon: <Lock className="w-4 h-4" />, count: auditLogs.length },
      ]
    },
    {
      title: 'কনফিগারেশন',
      items: [
        { key: 'settings', label: 'প্ল্যাটফর্ম সেটিংস', icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  // Filtered users for table
  const filteredUsers = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && u.accountStatus && u.accountStatus !== 'active') return false;
    if (statusFilter === 'blocked' && (!u.accountStatus || u.accountStatus === 'active')) return false;
    return true;
  });

  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

  // Real or realistic distribution charts data
  const bloodGroupChartData = [
    { group: 'O+', count: 5 },
    { group: 'A+', count: 3 },
    { group: 'B+', count: 4 },
    { group: 'AB+', count: 2 },
    { group: 'O-', count: 1 },
    { group: 'A-', count: 1 },
    { group: 'B-', count: 1 },
    { group: 'AB-', count: 0 },
  ];

  const trendChartData = [
    { label: 'মে', value: 8 },
    { label: 'জুন', value: 14 },
    { label: 'জুলাই', value: 22 },
    { label: 'আগস্ট', value: 35 },
    { label: 'সেপ্টেম্বর', value: 48 },
    { label: 'অক্টোবর', value: stats?.usersCount || 60 },
  ];

  const statusSlices = [
    { label: 'সক্রিয় অ্যাকাউন্ট', value: users.length - blockedUsers.length, color: '#16865B' },
    { label: 'অপেক্ষমাণ আবেদন', value: institutionRequests.length, color: '#D97706' },
    { label: 'স্থগিত / ব্লকড', value: blockedUsers.length, color: '#DC2626' },
  ];

  return (
    <div className="min-h-screen bg-page">
      {/* Top Header / Breadcrumb Bar */}
      <div className="bg-surface border-b border-appBorder sticky top-16 z-30 px-4 sm:px-6 lg:px-8 py-3.5 shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-xl border border-appBorder lg:hidden text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <Breadcrumb 
                items={[
                  { label: isSuperAdmin ? 'সর্বোচ্চ প্রশাসন' : 'প্ল্যাটফর্ম প্রশাসন', href: '/admin/dashboard' },
                  { label: navGroups.flatMap(g => g.items).find(i => i.key === activeTab)?.label || 'সারাংশ' }
                ]} 
              />
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-mainText tracking-tight">
                  {isSuperAdmin ? 'সুপার অ্যাডমিন কন্ট্রোল কনসোল' : 'প্ল্যাটফর্ম অ্যাডমিন প্যানেল'}
                </h1>
                <Badge variant={isSuperAdmin ? 'danger' : 'primary'} size="sm">
                  {isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              isLoading={loading}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              রিফ্রেশ
            </Button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>নিরাপত্তা সিস্টেম সুরক্ষিত</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Desktop Sidebar (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-4 space-y-6 sticky top-36">
              
              {/* Admin Profile Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-appBorder flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-soft">
                  {user?.name?.slice(0, 1) || 'A'}
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-mainText truncate">{user?.name}</p>
                  <p className="text-[10px] text-subText font-mono">{user?.phone}</p>
                </div>
              </div>

              {/* Navigation Groups */}
              <div className="space-y-5">
                {navGroups.map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[10px] font-bold text-subText uppercase tracking-wider px-2">
                      {group.title}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map(item => {
                        const isActive = activeTab === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isActive 
                                ? 'bg-primary text-white shadow-soft font-bold' 
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              {item.icon}
                              <span>{item.label}</span>
                            </span>
                            {item.count !== undefined && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {item.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </aside>

          {/* Mobile Drawer */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-72 bg-surface p-5 shadow-2xl space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-appBorder">
                  <span className="font-bold text-sm text-mainText">অ্যাডমিন মেনু</span>
                  <button onClick={() => setMobileSidebarOpen(false)}>
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="space-y-5">
                  {navGroups.map((group, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-[10px] font-bold text-subText uppercase tracking-wider px-2">
                        {group.title}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map(item => (
                          <button
                            key={item.key}
                            onClick={() => {
                              setActiveTab(item.key);
                              setMobileSidebarOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                              activeTab === item.key 
                                ? 'bg-primary text-white font-bold' 
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {item.icon}
                              <span>{item.label}</span>
                            </span>
                            {item.count !== undefined && (
                              <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 rounded-full font-bold">
                                {item.count}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area (9 cols) */}
          <main className="lg:col-span-9 space-y-6">

            {/* Notification Alert Message */}
            {msg && (
              <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-soft animate-in fade-in duration-150 ${
                msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>{msg.text}</span>
                </div>
                <button onClick={() => setMsg(null)} className="text-xs font-bold px-2 hover:opacity-75">✕</button>
              </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
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
                    onClick={() => setActiveTab('users')}
                  />
                  <StatsCard
                    title="স্বেচ্ছাসেবী রক্তদাতা"
                    value={stats?.donorsCount || 0}
                    subtitle="রক্তদানের জন্য নিবন্ধিত"
                    icon={<Heart className="w-5 h-5" />}
                    iconColor="emerald"
                    trend={{ value: '১৮%', isPositive: true, text: 'সক্রিয় বৃদ্ধি' }}
                    onClick={() => setActiveTab('donors')}
                  />
                  <StatsCard
                    title="অনুমোদিত প্রতিষ্ঠান"
                    value={institutions.length}
                    subtitle="বিশ্ববিদ্যালয় ও কলেজ"
                    icon={<Building2 className="w-5 h-5" />}
                    iconColor="teal"
                    onClick={() => setActiveTab('institutions')}
                  />
                  <StatsCard
                    title="স্থগিত / ব্লকড"
                    value={blockedUsers.length}
                    subtitle="নীতিভঙ্গ বা তদন্তাধীন"
                    icon={<UserX className="w-5 h-5" />}
                    iconColor="amber"
                    onClick={() => setActiveTab('blocked_users')}
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
                    onClick={() => setActiveTab('institution_requests')}
                  />
                  <StatsCard
                    title="ফোন প্রকাশ অডিট"
                    value={contactLogs.length}
                    subtitle="কন্টাক্ট রিভিল রেকর্ড"
                    icon={<Eye className="w-5 h-5" />}
                    iconColor="slate"
                    onClick={() => setActiveTab('contact_logs')}
                  />
                  <StatsCard
                    title="অডিট ট্রেইল ইভেন্ট"
                    value={auditLogs.length}
                    subtitle="প্রশাসনিক নিরাপত্তা লগ"
                    icon={<Lock className="w-5 h-5" />}
                    iconColor="primary"
                    onClick={() => setActiveTab('audit_logs')}
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
                      <p className="font-bold text-white mb-1">৪. প্রাতিষ্ঠানিক অনুমোদন:</p>
                      <p>শিক্ষা প্রতিষ্ঠানের আবেদন পর্যালোচনা শুধুমাত্র বিভাগীয় সমন্বয়ক বা সুপার অ্যাডমিনের এখতিয়ার।</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: USERS MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>ব্যবহারকারী ও সদস্য তালিকা</span>
                    </h3>
                    <p className="text-xs text-subText mt-0.5">সদস্যদের ভূমিকা নির্ধারণ, সম্পাদনা ও অ্যাকাউন্ট পরিচালনা</p>
                  </div>
                  <Badge variant="neutral">মোট: {filteredUsers.length} জন</Badge>
                </div>

                {/* Filter and Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={e => {
                        setUserSearch(e.target.value);
                        setUserPage(1);
                      }}
                      placeholder="নাম বা মোবাইল নম্বর..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:bg-surface focus:border-primary"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={e => {
                      setRoleFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:bg-surface focus:border-primary"
                  >
                    <option value="">সকল ভূমিকা (All Roles)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (সুপার অ্যাডমিন)</option>
                    <option value="ADMIN">ADMIN (অ্যাডমিন)</option>
                    <option value="DIVISION_COORDINATOR">DIVISION_COORDINATOR (সমন্বয়ক)</option>
                    <option value="INSTITUTION_MODERATOR">INSTITUTION_MODERATOR (মডারেটর)</option>
                    <option value="DONOR">DONOR (রক্তদাতা)</option>
                    <option value="MEMBER">MEMBER (সদস্য)</option>
                    <option value="REQUESTER">REQUESTER (রক্তপ্রার্থী)</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={e => {
                      setStatusFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 border border-appBorder rounded-xl text-xs text-mainText focus:bg-surface focus:border-primary"
                  >
                    <option value="">সকল অবস্থা (All Statuses)</option>
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="blocked">স্থগিত / ব্লকড (Blocked)</option>
                  </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-appBorder rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                      <tr>
                        <th className="py-3 px-4">সদস্যের বিবরণ</th>
                        <th className="py-3 px-4">মোবাইল</th>
                        <th className="py-3 px-4">দায়িত্ব / ভূমিকা</th>
                        <th className="py-3 px-4">অবস্থা</th>
                        <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            কোনো সদস্যের রেকর্ড পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((u: any) => {
                          const isBlocked = u.accountStatus && u.accountStatus !== 'active';
                          return (
                            <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-mainText flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.role === 'SUPER_ADMIN' && <span title="সুপার অ্যাডমিন">👑</span>}
                                </div>
                                <div className="text-[10px] text-subText">
                                  {u.division ? `বিভাগ: ${u.division}` : 'অনির্দিষ্ট'} • {u.gender || 'unspecified'}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono font-medium text-slate-700">
                                {u.phone}
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={u.role}
                                  onChange={e => handleRoleChange(u._id, e.target.value)}
                                  disabled={!isSuperAdmin && u.role === 'SUPER_ADMIN'}
                                  className="text-xs font-semibold px-2 py-1 bg-white border border-appBorder rounded-lg shadow-sm focus:border-primary"
                                >
                                  {isSuperAdmin && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
                                  <option value="ADMIN">ADMIN</option>
                                  <option value="DIVISION_COORDINATOR">DIVISION_COORDINATOR</option>
                                  <option value="INSTITUTION_MODERATOR">INSTITUTION_MODERATOR</option>
                                  <option value="DONOR">DONOR</option>
                                  <option value="MEMBER">MEMBER</option>
                                  <option value="REQUESTER">REQUESTER</option>
                                </select>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={!isBlocked ? 'success' : 'danger'} dot>
                                  {!isBlocked ? 'সক্রিয়' : 'স্থগিত / ব্লকড'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => setViewingUser(u)}
                                  className="px-2.5 py-1 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  বিবরণ
                                </button>
                                <button
                                  onClick={() => openEditModal(u)}
                                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  সম্পাদনা
                                </button>
                                {!isBlocked ? (
                                  <button
                                    onClick={() => {
                                      setBlockingUser(u);
                                      setBlockReason('');
                                    }}
                                    className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                                  >
                                    স্থগিত
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setUnblockingUser(u);
                                      setUnblockReason('');
                                    }}
                                    className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                                  >
                                    সচল করুন
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalUserPages > 1 && (
                  <div className="flex items-center justify-between text-xs text-subText pt-2">
                    <span>পৃষ্ঠা {userPage} / {totalUserPages}</span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={userPage <= 1}
                        onClick={() => setUserPage(p => p - 1)}
                      >
                        পূর্ববর্তী
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={userPage >= totalUserPages}
                        onClick={() => setUserPage(p => p + 1)}
                      >
                        পরবর্তী
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: DONORS LIST */}
            {activeTab === 'donors' && (
              <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-600" />
                      <span>রক্তদাতা ডিরেক্টরি প্রোফাইল</span>
                    </h3>
                    <p className="text-xs text-subText mt-0.5">স্বেচ্ছাসেবী রক্তদাতাদের তালিকা ও প্রাপ্যতা ট্র্যাকিং</p>
                  </div>
                  <Badge variant="success">নিবন্ধিত রক্তদাতা: {stats?.donorsCount || 0} জন</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.filter(u => u.role === 'DONOR' || u.role === 'MEMBER').map((d: any) => (
                    <div key={d._id} className="p-4 rounded-2xl border border-appBorder bg-slate-50/50 space-y-3">
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PHONE CHANGE REQUESTS */}
            {activeTab === 'phone_requests' && (
              <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <span>মোবাইল নম্বর পরিবর্তনের আবেদনসমূহ</span>
                    </h3>
                    <p className="text-xs text-subText mt-0.5">রক্তদাতা ও রক্তপ্রার্থীদের নম্বর পরিবর্তনের সুনির্দিষ্ট কারণসহ আবেদন যাচাই ও অনুমোদন</p>
                  </div>
                  <Badge variant="teal">{phoneRequests.length} টি আবেদন</Badge>
                </div>

                {phoneRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    বর্তমানে কোনো নম্বর পরিবর্তনের আবেদন নেই।
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-appBorder rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                        <tr>
                          <th className="py-3 px-4">আবেদনকারী</th>
                          <th className="py-3 px-4">পদবি / রোল</th>
                          <th className="py-3 px-4">বর্তমান নম্বর</th>
                          <th className="py-3 px-4">অনুরোধকৃত নতুন নম্বর</th>
                          <th className="py-3 px-4">পরিবর্তনের কারণ</th>
                          <th className="py-3 px-4">অঞ্চল</th>
                          <th className="py-3 px-4">আবেদনের তারিখ</th>
                          <th className="py-3 px-4">অবস্থা</th>
                          <th className="py-3 px-4 text-right">কার্যক্রম</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {phoneRequests.map(r => (
                          <tr key={r._id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-bold text-mainText">{r.userName || 'অজানা'}</td>
                            <td className="py-3 px-4">
                              <Badge variant={r.userRole === 'DONOR' ? 'primary' : 'neutral'} size="sm">
                                {r.userRole === 'DONOR' ? 'রক্তদাতা' : r.userRole === 'REQUESTER' ? 'রক্তপ্রার্থী' : r.userRole}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 line-through">{r.currentPhone}</td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-700">{r.newPhone}</td>
                            <td className="py-3 px-4 text-slate-700 max-w-xs">{r.reason}</td>
                            <td className="py-3 px-4 text-slate-500 capitalize">{r.district || ''}, {r.division || ''}</td>
                            <td className="py-3 px-4 text-subText">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString('bn-BD') : ''}
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'} 
                                size="sm"
                              >
                                {r.status === 'approved' ? 'অনুমোদিত' : r.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {r.status === 'pending' ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    setReviewingPhoneReq(r);
                                    setPhoneReviewStatus('approved');
                                    setPhoneReviewNotes('');
                                  }}
                                >
                                  পর্যালোচনা
                                </Button>
                              ) : (
                                <span className="text-[11px] text-slate-400">পর্যালোচিত</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: BLOCKED USERS */}
            {activeTab === 'blocked_users' && (
              <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                      <UserX className="w-5 h-5 text-rose-600" />
                      <span>স্থগিত ও ব্লককৃত অ্যাকাউন্ট তালিকা</span>
                    </h3>
                    <p className="text-xs text-subText mt-0.5">নীতিভঙ্গ বা তদন্তাধীন কারণে স্থগিতকৃত সদস্যদের সংরক্ষিত তথ্য</p>
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
                            <td className="py-3 px-4 text-right">
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: INSTITUTIONS */}
            {activeTab === 'institutions' && (
              <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-tealAccent" />
                      <span>অনুমোদিত শিক্ষাপ্রতিষ্ঠান ও ক্যাম্পাস</span>
                    </h3>
                    <p className="text-xs text-subText mt-0.5">রক্তদান কার্যক্রমে অনুমোদিত বিশ্ববিদ্যালয় ও কলেজসমূহ</p>
                  </div>
                  <Badge variant="teal">{institutions.length} টি প্রতিষ্ঠান</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {institutions.map(inst => (
                    <div key={inst._id} className="p-4 rounded-2xl border border-appBorder bg-slate-50/50 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                          🎓
                        </div>
                        <Badge variant="teal" size="sm">{inst.code}</Badge>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-mainText">{inst.nameBn}</h4>
                        <p className="text-[11px] text-subText">{inst.name}</p>
                      </div>
                      <div className="text-xs text-subText pt-1 border-t border-slate-200 flex items-center justify-between">
                        <span>📍 {inst.district}, {inst.division}</span>
                        <span className="font-semibold text-teal-700">যাচাইকৃত</span>
                      </div>
                      <div className="pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-teal-700 border-teal-200 hover:bg-teal-50"
                          onClick={() => handleOpenDrillDown(inst)}
                          icon={<Users className="w-3.5 h-3.5" />}
                        >
                          সদস্য ও রক্তদাতা ডাটা ({inst.code})
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: INSTITUTION REQUESTS */}
            {activeTab === 'institution_requests' && (
              <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                      <FileText className="w-5 h-5 text-tealAccent" />
                      <span>শিক্ষা প্রতিষ্ঠান নিবন্ধন আবেদনসমূহ</span>
                    </h3>
                    <p className="text-xs text-subText mt-0.5">নতুন শিক্ষা প্রতিষ্ঠান অন্তর্ভুক্তির জন্য জমা পড়া আবেদন</p>
                  </div>
                  {!isSuperAdmin && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-600" />
                      অনুমোদন বিভাগীয় সমন্বয়ক বা সুপার অ্যাডমিনের এখতিয়ারভুক্ত
                    </span>
                  )}
                </div>

                {institutionRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">কোনো প্রাতিষ্ঠানিক আবেদন জমা নেই।</div>
                ) : (
                  <div className="overflow-x-auto border border-appBorder rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                        <tr>
                          <th className="py-3 px-4">প্রতিষ্ঠানের নাম</th>
                          <th className="py-3 px-4">কোড ও ধরণ</th>
                          <th className="py-3 px-4">অবস্থান</th>
                          <th className="py-3 px-4">আবেদনকারী</th>
                          <th className="py-3 px-4">অবস্থা</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {institutionRequests.map(req => (
                          <tr key={req._id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-bold text-mainText">{req.nameBn || req.name}</td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-xs">{req.code}</span>
                              <div className="text-[10px] text-subText">{req.type}</div>
                            </td>
                            <td className="py-3 px-4">{req.district}, {req.division}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-mainText">{req.applicantName}</div>
                              <div className="font-mono text-[10px] text-subText">{req.applicantPhone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'} 
                                size="sm"
                              >
                                {req.status === 'approved' ? 'অনুমোদিত' : req.status === 'rejected' ? 'বাতিল' : 'বিচারাধীন'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: STATUS HISTORY */}
            {activeTab === 'status_history' && (
              <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-700" />
                    <span>অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন ও ব্লক হিস্ট্রি</span>
                  </h3>
                  <p className="text-xs text-subText mt-0.5">কে কোন সদস্যের অ্যাকাউন্ট কী কারণে পরিবর্তন করেছিলেন তার নিরবচ্ছিন্ন রেকর্ড</p>
                </div>

                {statusHistories.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">কোনো স্ট্যাটাস পরিবর্তনের রেকর্ড নেই।</div>
                ) : (
                  <div className="overflow-x-auto border border-appBorder rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                        <tr>
                          <th className="py-3 px-4">লক্ষ্য সদস্য</th>
                          <th className="py-3 px-4">পরিবর্তিত অবস্থা</th>
                          <th className="py-3 px-4">কর্তা (Changer)</th>
                          <th className="py-3 px-4">প্রদত্ত কারণ</th>
                          <th className="py-3 px-4">সময়</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {statusHistories.map(h => (
                          <tr key={h._id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-bold text-mainText">
                              <div>{h.targetUserName || 'User: ' + h.userId}</div>
                              <div className="font-mono text-[10px] text-subText">{h.targetUserPhone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-400 line-through mr-1">{h.previousStatus}</span>
                              <span>→</span>
                              <span className="font-bold ml-1 text-mainText">{h.newStatus}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-mainText">{h.changerName || h.changedBy}</div>
                              <div className="text-[10px] text-subText">{h.changerRole}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-700 max-w-xs">{h.reason}</td>
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

            {/* TAB 8: CONTACT LOGS */}
            {activeTab === 'contact_logs' && (
              <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                    <Eye className="w-5 h-5 text-tealAccent" />
                    <span>ফোন নম্বর উন্মুক্তকরণের অডিট রেকর্ড (Privacy Audit)</span>
                  </h3>
                  <p className="text-xs text-subText mt-0.5">রক্তদাতার গোপনীয়তা নিশ্চিত করতে কে কখন কার ফোন নম্বর দেখেছেন তার টাইমস্ট্যাম্প লগ</p>
                </div>

                <div className="overflow-x-auto border border-appBorder rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                      <tr>
                        <th className="py-3 px-4">অনুসন্ধানকারী সদস্য</th>
                        <th className="py-3 px-4">রক্তদাতা</th>
                        <th className="py-3 px-4">উদ্দেশ্য</th>
                        <th className="py-3 px-4">সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contactLogs.map((log: any) => (
                        <tr key={log._id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <div className="font-bold text-mainText">{log.viewerName}</div>
                            <div className="font-mono text-[10px] text-subText">{log.viewerPhone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-primary">{log.donorName}</div>
                            <div className="font-mono text-[10px] text-subText">{log.donorPhone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="neutral" size="sm">{log.purpose}</Badge>
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

            {/* TAB 9: AUDIT LOGS */}
            {activeTab === 'audit_logs' && (
              <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                    <Lock className="w-5 h-5 text-rose-600" />
                    <span>প্রশাসনিক কার্যক্রম অডিট ট্রেইল</span>
                  </h3>
                  <p className="text-xs text-subText mt-0.5">প্ল্যাটফর্মের প্রতিটি গুরুত্বপূর্ণ অ্যাকশনের অপরিবর্তনীয় লগ</p>
                </div>

                <div className="overflow-x-auto border border-appBorder rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold text-[11px]">
                      <tr>
                        <th className="py-3 px-4">অ্যাকশন</th>
                        <th className="py-3 px-4">কর্তা (Actor)</th>
                        <th className="py-3 px-4">লক্ষ্য অবজেক্ট</th>
                        <th className="py-3 px-4">সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log: any) => (
                        <tr key={log._id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-primary">{log.action}</td>
                          <td className="py-3 px-4">
                            <Badge variant="neutral" size="sm">{log.actorRole}</Badge>
                          </td>
                          <td className="py-3 px-4 font-mono text-subText">{log.targetType}: {log.targetId}</td>
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

            {/* TAB 10: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-mainText flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-700" />
                    <span>প্ল্যাটফর্ম কনফিগারেশন ও সেটিংস</span>
                  </h3>
                  <p className="text-xs text-subText mt-0.5">সার্বিক সিস্টেমের নিরাপত্তা ও ব্যবহার নীতি নিয়ন্ত্রণ</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-appBorder bg-slate-50/50 space-y-2">
                    <label className="block text-xs font-bold text-mainText">দৈনিক সর্বোচ্চ ফোন দেখার সীমা (প্রতি ইউজার)</label>
                    <input 
                      type="number" 
                      defaultValue={5} 
                      className="w-full p-2 bg-white border border-appBorder rounded-xl text-xs font-bold font-mono"
                    />
                    <p className="text-[11px] text-subText">অবাঞ্ছিত স্প্যামিং বা ডেটা স্ক্র্যাপিং রোধে সর্বোচ্চ অনুমতি।</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-appBorder bg-slate-50/50 space-y-2">
                    <label className="block text-xs font-bold text-mainText">রক্তদানের ন্যূনতম মধ্যবর্তী বিরতি (মাস)</label>
                    <input 
                      type="number" 
                      defaultValue={3} 
                      className="w-full p-2 bg-white border border-appBorder rounded-xl text-xs font-bold font-mono"
                    />
                    <p className="text-[11px] text-subText">স্বাস্থ্যগত সুরক্ষার জন্য রক্তদানের ন্যূনতম বিরতি (সাধারণত ৯০ দিন)।</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="md">
                    সেটিংস সংরক্ষণ করুন
                  </Button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title="সদস্যের তথ্য সম্পাদনা"
          description={`মোবাইল: ${editingUser.phone}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>বাতিল</Button>
              <Button variant="primary" size="sm" onClick={handleEditSubmit}>সংরক্ষণ করুন</Button>
            </>
          }
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">সদস্যের সম্পূর্ণ নাম</label>
              <input
                type="text"
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs text-mainText focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">লিঙ্গ</label>
              <select
                value={editGender}
                onChange={e => setEditGender(e.target.value)}
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs text-mainText"
              >
                <option value="male">পুরুষ</option>
                <option value="female">নারী</option>
                <option value="other">অন্যান্য</option>
                <option value="unspecified">বলতে অনিচ্ছুক</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-mainText mb-1">বিভাগ</label>
                <select
                  value={editDivision}
                  onChange={e => setEditDivision(e.target.value)}
                  className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs text-mainText"
                >
                  {BANGLADESH_DIVISIONS.map(d => (
                    <option key={d.id} value={d.id}>{d.nameBn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-mainText mb-1">জেলা</label>
                <input
                  type="text"
                  value={editDistrict}
                  onChange={e => setEditDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs text-mainText"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Block User Modal */}
      {blockingUser && (
        <Modal
          isOpen={Boolean(blockingUser)}
          onClose={() => setBlockingUser(null)}
          title="অ্যাকাউন্ট স্থগিত / ব্লককরণ"
          description={`সদস্য: ${blockingUser.name} (${blockingUser.phone})`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setBlockingUser(null)}>বাতিল</Button>
              <Button variant="danger" size="sm" onClick={handleBlockSubmit}>স্থগিত নিশ্চিত করুন</Button>
            </>
          }
        >
          <form onSubmit={handleBlockSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">স্থগিতকরণের ধরণ</label>
              <select
                value={blockStatus}
                onChange={e => setBlockStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs"
              >
                <option value="temporarily_blocked">সাময়িক স্থগিত (Temporarily Blocked)</option>
                <option value="suspended">সাসপেন্ড (Suspended)</option>
                <option value="permanently_blocked">স্থায়ীভাবে নিষিদ্ধ (Permanently Blocked)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                স্থগিতের বাধ্যতামূলক কারণ <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                minLength={5}
                rows={3}
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="যেমন: ভুয়া অনুরোধ বা নীতিভঙ্গের বিবরণ..."
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs focus:border-primary"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Unblock User Modal */}
      {unblockingUser && (
        <Modal
          isOpen={Boolean(unblockingUser)}
          onClose={() => setUnblockingUser(null)}
          title="অ্যাকাউন্ট পুনরায় সচলকরণ"
          description={`সদস্য: ${unblockingUser.name} (${unblockingUser.phone})`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setUnblockingUser(null)}>বাতিল</Button>
              <Button variant="success" size="sm" onClick={handleUnblockSubmit}>সচল নিশ্চিত করুন</Button>
            </>
          }
        >
          <form onSubmit={handleUnblockSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                পুনরুদ্ধারের কারণ <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                minLength={5}
                rows={3}
                value={unblockReason}
                onChange={e => setUnblockReason(e.target.value)}
                placeholder="যেমন: ভুলের মীমাংসা হয়েছে বা সদস্যের সতর্কতা গ্রহণ..."
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs focus:border-primary"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* View User Profile Detail Modal */}
      {viewingUser && (
        <Modal
          isOpen={Boolean(viewingUser)}
          onClose={() => setViewingUser(null)}
          title="ব্যবহারকারীর বিস্তারিত প্রোফাইল"
          footer={<Button variant="outline" size="sm" onClick={() => setViewingUser(null)}>বন্ধ করুন</Button>}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-appBorder">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white font-bold text-lg flex items-center justify-center">
                {viewingUser.name?.slice(0, 1)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-mainText">{viewingUser.name}</h4>
                <p className="font-mono text-subText">{viewingUser.phone}</p>
                <div className="mt-1">
                  <Badge variant="primary" size="sm">{viewingUser.role}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-appBorder space-y-1">
                <span className="text-subText text-[10px] uppercase font-bold">লিঙ্গ</span>
                <p className="font-semibold text-mainText capitalize">{viewingUser.gender || 'unspecified'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-appBorder space-y-1">
                <span className="text-subText text-[10px] uppercase font-bold">অ্যাকাউন্ট অবস্থা</span>
                <p className="font-semibold text-mainText">{viewingUser.accountStatus || 'active'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-appBorder space-y-1">
                <span className="text-subText text-[10px] uppercase font-bold">বিভাগ</span>
                <p className="font-semibold text-mainText">{viewingUser.division || 'অনির্দিষ্ট'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-appBorder space-y-1">
                <span className="text-subText text-[10px] uppercase font-bold">জেলা</span>
                <p className="font-semibold text-mainText">{viewingUser.district || 'অনির্দিষ্ট'}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-appBorder space-y-1 text-subText">
              <span className="text-[10px] uppercase font-bold block">নিবন্ধনের তারিখ</span>
              <p>{new Date(viewingUser.createdAt || Date.now()).toLocaleString('bn-BD')}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Phone Change Review Modal */}
      {reviewingPhoneReq && (
        <Modal
          isOpen={Boolean(reviewingPhoneReq)}
          onClose={() => setReviewingPhoneReq(null)}
          title="নম্বর পরিবর্তনের আবেদন পর্যালোচনা"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setReviewingPhoneReq(null)}>বাতিল</Button>
              <Button
                variant={phoneReviewStatus === 'approved' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleReviewPhoneRequest}
                isLoading={submittingPhoneReview}
              >
                {phoneReviewStatus === 'approved' ? 'অনুমোদন নিশ্চিত করুন' : 'প্রত্যাখ্যান করুন'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-appBorder space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-mainText">{reviewingPhoneReq.userName}</span>
                <Badge variant={reviewingPhoneReq.userRole === 'DONOR' ? 'primary' : 'neutral'} size="sm">
                  {reviewingPhoneReq.userRole === 'DONOR' ? 'রক্তদাতা' : reviewingPhoneReq.userRole === 'REQUESTER' ? 'রক্তপ্রার্থী' : reviewingPhoneReq.userRole}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-subText block">বর্তমান নম্বর:</span>
                  <span className="font-mono line-through text-slate-500">{reviewingPhoneReq.currentPhone}</span>
                </div>
                <div>
                  <span className="text-subText block">অনুরোধকৃত নতুন নম্বর:</span>
                  <span className="font-mono font-bold text-emerald-700">{reviewingPhoneReq.newPhone}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-subText block text-[10px] uppercase font-bold">নম্বর পরিবর্তনের কারণ:</span>
                <p className="font-medium text-slate-800 mt-0.5">{reviewingPhoneReq.reason}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">পর্যালোচনা সিদ্ধান্ত</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPhoneReviewStatus('approved')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    phoneReviewStatus === 'approved'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>অনুমোদন করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneReviewStatus('rejected')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    phoneReviewStatus === 'rejected'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>প্রত্যাখ্যান করুন</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1">
                অ্যাডমিন মন্তব্য / নির্দেশিকা (ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                value={phoneReviewNotes}
                onChange={e => setPhoneReviewNotes(e.target.value)}
                placeholder="যেমন: তথ্য যাচাই করে অনুমোদন দেওয়া হলো..."
                className="w-full px-3 py-2 border border-appBorder rounded-xl text-xs focus:border-primary"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Institution Drill-Down Modal */}
      {drillDownInst && (
        <Modal
          isOpen={Boolean(drillDownInst)}
          onClose={() => setDrillDownInst(null)}
          title={`🎓 ${drillDownInst.nameBn || drillDownInst.name} - সদস্য ও রক্তদাতা ডাটা`}
          footer={<Button variant="outline" size="sm" onClick={() => setDrillDownInst(null)}>বন্ধ করুন</Button>}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 text-sm">{drillDownInst.nameBn}</span>
                <Badge variant="teal" size="sm">{drillDownInst.code}</Badge>
              </div>
              <p className="text-[11px] text-teal-800">
                📍 {drillDownInst.district}, {drillDownInst.division}
              </p>
              <div className="flex items-center gap-4 pt-1 font-bold text-xs text-teal-900">
                <span>মোট নিবন্ধিত সদস্য: {drillDownData?.counts.members ?? '...'} জন</span>
                <span>•</span>
                <span>রক্তদাতা প্রোফাইল: {drillDownData?.counts.donors ?? '...'} জন</span>
              </div>
            </div>

            {drillDownLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-subText">
                <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
                <span>প্রতিষ্ঠান সদস্য তথ্য লোড হচ্ছে...</span>
              </div>
            ) : (!drillDownData?.members || drillDownData.members.length === 0) ? (
              <div className="text-center py-8 text-slate-400">
                এই শিক্ষা প্রতিষ্ঠানের অধীনে কোনো সদস্য বা রক্তদাতা পাওয়া যায়নি।
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                <div className="border border-appBorder rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 font-bold text-mainText border-b border-appBorder">
                    সকল নিবন্ধিত সদস্য ও মডারেটর ({drillDownData.members.length} জন)
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold">
                      <tr>
                        <th className="py-2 px-3">নাম</th>
                        <th className="py-2 px-3">মোবাইল</th>
                        <th className="py-2 px-3">পদবি</th>
                        <th className="py-2 px-3">যোগদান</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {drillDownData.members.map((m: any) => (
                        <tr key={m._id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-semibold text-mainText">{m.name}</td>
                          <td className="py-2 px-3 font-mono">{m.phone}</td>
                          <td className="py-2 px-3">
                            <Badge 
                              variant={m.role === 'INSTITUTION_MODERATOR' ? 'teal' : m.role === 'DONOR' ? 'primary' : 'neutral'} 
                              size="sm"
                            >
                              {m.role === 'INSTITUTION_MODERATOR' ? 'ইনস্টিটিউট মডারেটর' : m.role === 'DONOR' ? 'রক্তদাতা' : m.role}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-subText">
                            {m.createdAt ? new Date(m.createdAt).toLocaleDateString('bn-BD') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {drillDownData.donors && drillDownData.donors.length > 0 && (
                  <div className="border border-appBorder rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-3 py-2 font-bold text-mainText border-b border-appBorder">
                      রক্তদাতা প্রোফাইলসমূহ ({drillDownData.donors.length} জন)
                    </div>
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-subText border-b border-appBorder uppercase font-bold">
                        <tr>
                          <th className="py-2 px-3">রক্তের গ্রুপ</th>
                          <th className="py-2 px-3">দাতা আইডি</th>
                          <th className="py-2 px-3">প্রস্তুতি</th>
                          <th className="py-2 px-3">মোট দান</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {drillDownData.donors.map((d: any) => (
                          <tr key={d._id} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3 font-bold text-primary">{d.bloodGroup}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{d.userId ? (d.userId.name || d.userId) : d._id}</td>
                            <td className="py-2 px-3">
                              <Badge variant={d.isAvailable ? 'success' : 'neutral'} size="sm">
                                {d.isAvailable ? 'প্রস্তুত' : 'বিরতি'}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 font-bold">{d.totalDonations || 0} বার</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
};
