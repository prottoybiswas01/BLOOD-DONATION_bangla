import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  Check, 
  Droplet, 
  Phone, 
  HeartHandshake, 
  Clock, 
  Send,
  Activity,
  Lock
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS, BANGLADESH_DIVISIONS, BloodGroup } from '../data/bangladeshLocations';
import { ContactRequest, ModeratorActivity } from '../types';

export const ModeratorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [activities, setActivities] = useState<ModeratorActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'roster' | 'contact_requests' | 'activities'>('roster');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual Member Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [memName, setMemName] = useState('');
  const [memPhone, setMemPhone] = useState('');
  const [memGender, setMemGender] = useState<'male' | 'female' | 'unspecified' | 'other'>('unspecified');
  const [memBloodGroup, setMemBloodGroup] = useState<BloodGroup>('O+');
  const [memDivision, setMemDivision] = useState('dhaka');
  const [memDistrict, setMemDistrict] = useState('dhaka');
  const [memUpazila, setMemUpazila] = useState('');
  const [memConsent, setMemConsent] = useState(true);
  const [submittingMember, setSubmittingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  // One-time temporary password reveal
  const [revealedCreds, setRevealedCreds] = useState<{
    name: string;
    phone: string;
    temporaryPassword: string;
    warning: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Contact request handling modal
  const [handlingReq, setHandlingReq] = useState<ContactRequest | null>(null);
  const [reqStatus, setReqStatus] = useState<'in_progress' | 'fulfilled' | 'cancelled'>('in_progress');
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [submittingHandling, setSubmittingHandling] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, contactRes, actRes] = await Promise.all([
        api.getModeratorDashboard(),
        api.getContactRequests(),
        api.getModeratorActivities()
      ]);

      if (dashRes.success) setData(dashRes);
      if (contactRes.success) setContactRequests(contactRes.requests || []);
      if (actRes.success) setActivities(actRes.activities || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'ড্যাশবোর্ড তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.institution?._id) return;

    setSubmittingMember(true);
    setMemberError(null);

    try {
      const res = await api.createMemberByModerator({
        name: memName,
        phone: memPhone,
        gender: memGender,
        bloodGroup: memBloodGroup,
        division: memDivision,
        district: memDistrict,
        upazila: memUpazila,
        institutionId: data.institution._id,
        consentToShareContact: memConsent
      });

      if (res.success && res.temporaryPassword) {
        setRevealedCreds({
          name: res.user.name,
          phone: res.user.phone,
          temporaryPassword: res.temporaryPassword,
          warning: res.warning || 'এই সাময়িক পাসওয়ার্ডটি পুনরায় দেখানো হবে না।'
        });
        setShowCreateModal(false);
        // Reset form
        setMemName('');
        setMemPhone('');
        setMemUpazila('');
        loadDashboardData();
      } else {
        setMemberError(res.message || 'সদস্য তৈরি করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setMemberError(err.message || 'সদস্য তৈরি করা যায়নি।');
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleCopyPassword = () => {
    if (!revealedCreds) return;
    const textToCopy = `রক্তদান বাংলাদেশ - সদস্য লগইন তথ্য:\nনাম: ${revealedCreds.name}\nমোবাইল: ${revealedCreds.phone}\nসাময়িক পাসওয়ার্ড: ${revealedCreds.temporaryPassword}\n\nপ্রথমবার লগইন করে আপনার স্থায়ী পাসওয়ার্ড সেট করুন।`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateContactRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handlingReq) return;

    setSubmittingHandling(true);
    try {
      const res = await api.updateContactRequestStatus(handlingReq._id, {
        status: reqStatus,
        moderatorNotes
      });

      if (res.success) {
        setHandlingReq(null);
        setModeratorNotes('');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingHandling(false);
    }
  };

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

  const { institution, stats, donors } = data || {};

  // Group counts calculation
  const groupCounts: Record<string, number> = {};
  BLOOD_GROUPS.forEach(bg => { groupCounts[bg] = 0; });
  if (donors) {
    donors.forEach((d: any) => {
      if (groupCounts[d.bloodGroup] !== undefined) {
        groupCounts[d.bloodGroup]++;
      }
    });
  }

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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => {
              setShowCreateModal(true);
              setMemberError(null);
            }}
            className="px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-teal-700" />
            <span>নতুন সদস্য যোগ করুন</span>
          </button>
          <div className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl text-xs font-semibold">
            <ShieldCheck className="w-5 h-5 text-teal-200" />
            <span>যাচাইকৃত প্রতিষ্ঠান পোর্টাল</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">মোট নিবন্ধিত সদস্য</span>
          <span className="text-2xl font-extrabold text-mainText mt-1 block">{donors?.length || stats?.totalDonors || 0} জন</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">বর্তমানে রক্তদানে প্রস্তুত</span>
          <span className="text-2xl font-extrabold text-appSuccess mt-1 block">{stats?.availableDonors || 0} জন</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">যোগাযোগের অনুরোধ</span>
          <span className="text-2xl font-extrabold text-tealAccent mt-1 block">{contactRequests.length} টি</span>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-appBorder shadow-card">
          <span className="text-xs text-subText block">মডারেটর অ্যাক্টিভিটি</span>
          <span className="text-2xl font-extrabold text-mainText mt-1 block">{activities.length} টি</span>
        </div>
      </div>

      {/* Blood Group Distribution Bar */}
      <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-mainText flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-primary" />
            <span>রক্তের গ্রুপভিত্তিক সদস্য সংখ্যা বিন্যাস:</span>
          </span>
          <span className="text-[11px] text-subText">রিয়েল-টাইম ডাটা</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {BLOOD_GROUPS.map(bg => (
            <div key={bg} className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-center">
              <span className="text-xs font-extrabold text-primary block">{bg}</span>
              <span className="text-base font-bold text-gray-800 block mt-0.5">{groupCounts[bg] || 0}</span>
              <span className="text-[10px] text-gray-400">জন</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-appBorder gap-4 text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'roster' ? 'border-tealAccent text-tealAccent' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          অধিভুক্ত সদস্য ও রক্তদাতা ({donors?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('contact_requests')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'contact_requests' ? 'border-tealAccent text-tealAccent' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          যোগাযোগের অনুরোধ ({contactRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'activities' ? 'border-tealAccent text-tealAccent' : 'border-transparent text-subText hover:text-mainText'
          }`}
        >
          মডারেশন ইতিহাস ({activities.length})
        </button>
      </div>

      {/* Tab 1: Member Roster */}
      {activeTab === 'roster' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-appBorder">
            <h3 className="text-base font-bold text-mainText flex items-center gap-2">
              <Users className="w-5 h-5 text-tealAccent" />
              <span>অধিভুক্ত রক্তদাতাদের তালিকা (গোপনীয়তা সুরক্ষিত)</span>
            </h3>
            <span className="text-xs text-subText">ব্যক্তিগত মোবাইল নম্বর সংরক্ষিত</span>
          </div>

          {(!donors || donors.length === 0) ? (
            <div className="text-center py-12 text-xs text-subText">এখনো কোনো সদস্য বা রক্তদাতা যুক্ত হননি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">নাম</th>
                    <th className="py-3 px-4">রক্তের গ্রুপ</th>
                    <th className="py-3 px-4">অবস্থা</th>
                    <th className="py-3 px-4">মোট রক্তদান</th>
                    <th className="py-3 px-4">যোগাযোগ সম্মতি</th>
                    <th className="py-3 px-4">সদস্যপদ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donors.map((d: any) => (
                    <tr key={d._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-mainText">{d.displayName}</div>
                        <div className="text-[10px] text-gray-400 capitalize">{d.gender || 'unspecified'}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-primary">{d.bloodGroup}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.availabilityStatus === 'available' ? 'bg-green-100 text-appSuccess' : 'bg-gray-100 text-subText'
                        }`}>
                          {d.availabilityStatus === 'available' ? 'প্রস্তুত' : 'বিরতি'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{d.totalDonations || 0} বার</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          d.consentToShareContact ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {d.consentToShareContact ? 'উন্মুক্ত অনুমতি' : 'সুরক্ষিত/ব্যক্তিগত'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-tealAccent font-medium">✓ প্রত্যয়িত সদস্য</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Contact Requests Queue */}
      {activeTab === 'contact_requests' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-appBorder">
            <h3 className="text-base font-bold text-mainText flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-primary" />
              <span>রক্তপ্রত্যাশীদের প্রাতিষ্ঠানিক যোগাযোগের অনুরোধসমূহ</span>
            </h3>
            <span className="text-xs text-subText">সরাসরি প্রতিষ্ঠানের রক্তদাতা পুলের সাথে সমন্বয়</span>
          </div>

          {contactRequests.length === 0 ? (
            <div className="text-center py-12 text-xs text-subText">বর্তমানে কোনো যোগাযোগের অনুরোধ জমা নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                  <tr>
                    <th className="py-3 px-4">অনুরোধকারী</th>
                    <th className="py-3 px-4">রোগী ও হাসপাতাল</th>
                    <th className="py-3 px-4">গ্রুপ ও পরিমাণ</th>
                    <th className="py-3 px-4">জরুরিতা</th>
                    <th className="py-3 px-4">অবস্থা</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contactRequests.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-mainText">{req.requesterName}</div>
                        <div className="text-gray-400 font-mono text-[10px]">{req.requesterPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{req.patientName}</div>
                        <div className="text-subText text-[10px]">{req.hospitalName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-primary mr-1">{req.targetBloodGroup}</span>
                        <span className="text-subText">({req.unitsRequired} ব্যাগ)</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.urgency === 'emergency' ? 'bg-red-100 text-red-700' :
                          req.urgency === 'urgent' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {req.urgency === 'emergency' ? 'জরুরি' : req.urgency === 'urgent' ? 'অতি দ্রুত' : 'সাধারণ'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'fulfilled' ? 'bg-green-100 text-appSuccess' :
                          req.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          req.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'fulfilled' ? 'সম্পন্ন' : req.status === 'in_progress' ? 'চলমান' : req.status === 'cancelled' ? 'বাতিল' : 'অপেক্ষমাণ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setHandlingReq(req);
                            setReqStatus((req.status as any) || 'in_progress');
                            setModeratorNotes(req.moderatorNotes || '');
                          }}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-semibold text-xs"
                        >
                          হালনাগাদ
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

      {/* Tab 3: Activities */}
      {activeTab === 'activities' && (
        <div className="bg-surface rounded-2xl border border-appBorder shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <Activity className="w-5 h-5 text-tealAccent" />
            <span>প্রতিষ্ঠানের মডারেশন ও সদস্য সংযোজন ইতিহাস</span>
          </h3>

          {activities.length === 0 ? (
            <div className="text-center py-10 text-xs text-subText">কোনো অ্যাক্টিভিটি পাওয়া যায়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-subText border-b border-appBorder uppercase">
                  <tr>
                    <th className="py-3 px-4">অ্যাকশন</th>
                    <th className="py-3 px-4">মডারেটর</th>
                    <th className="py-3 px-4">বিবরণ / কারণ</th>
                    <th className="py-3 px-4">সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activities.map(act => (
                    <tr key={act._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-mainText">{act.action}</td>
                      <td className="py-3 px-4">{act.actorName}</td>
                      <td className="py-3 px-4 text-subText max-w-sm">{act.reason || 'সদস্য ব্যবস্থাপনা'}</td>
                      <td className="py-3 px-4 text-subText">
                        {new Date(act.createdAt).toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Manual Member Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-teal-700 mb-3">
              <UserPlus className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">নতুন সদস্য নিবন্ধন (ম্যানুয়াল সংযোজন)</h3>
                <p className="text-xs text-gray-500">এককালীন সাময়িক পাসওয়ার্ড স্বয়ংক্রিয়ভাবে তৈরি হবে</p>
              </div>
            </div>

            {memberError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{memberError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMember} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    সদস্যের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={memName}
                    onChange={e => setMemName(e.target.value)}
                    placeholder="পূর্ণ নাম লিখুন"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    মোবাইল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={memPhone}
                    onChange={e => setMemPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    রক্তের গ্রুপ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={memBloodGroup}
                    onChange={e => setMemBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-red-600 focus:ring-2 focus:ring-teal-500"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">লিঙ্গ</label>
                  <select
                    value={memGender}
                    onChange={e => {
                      const val = e.target.value as any;
                      setMemGender(val);
                      if (val === 'female') {
                        setMemConsent(false);
                      } else {
                        setMemConsent(true);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="unspecified">উল্লেখ নেই</option>
                    <option value="male">পুরুষ</option>
                    <option value="female">নারী</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>
              </div>

              {memGender === 'female' && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>নারী সদস্য নিরাপত্তা সুরক্ষা:</span>
                  </div>
                  নারী সদস্যদের ব্যক্তিগত নিরাপত্তা রক্ষার্থে ফোন নম্বর শেয়ারিং ডিফল্টভাবে নিষ্ক্রিয় থাকবে।
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">বিভাগ</label>
                  <select
                    value={memDivision}
                    onChange={e => setMemDivision(e.target.value)}
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
                    required
                    value={memDistrict}
                    onChange={e => setMemDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">উপজেলা / থানা</label>
                <input
                  type="text"
                  value={memUpazila}
                  onChange={e => setMemUpazila(e.target.value)}
                  placeholder="যেমন: ধানমন্ডি / মিরপুর"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingMember}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow transition disabled:opacity-50"
                >
                  {submittingMember ? 'যুক্ত হচ্ছে...' : 'সদস্য তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* One-Time Temporary Password Reveal Card / Modal */}
      {revealedCreds && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <Lock className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">এককালীন সাময়িক পাসওয়ার্ড</h3>
                <p className="text-xs text-amber-700 font-semibold">সদস্যের নিকট নিরাপদে পৌঁছে দিন</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-900">
              {revealedCreds.warning}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 mb-4 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">নাম:</span>
                <span className="font-bold text-gray-900 font-sans">{revealedCreds.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">মোবাইল:</span>
                <span className="font-bold text-gray-900">{revealedCreds.phone}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-500">সাময়িক পাসওয়ার্ড:</span>
                <span className="text-base font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {revealedCreds.temporaryPassword}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyPassword}
                className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'কপি সম্পন্ন হয়েছে!' : 'লগইন তথ্য কপি করুন'}</span>
              </button>
              <button
                type="button"
                onClick={() => setRevealedCreds(null)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handling Contact Request Modal */}
      {handlingReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">যোগাযোগের অনুরোধের অবস্থা হালনাগাদ</h3>
            <p className="text-xs text-gray-500 mb-4">{handlingReq.patientName} • {handlingReq.targetBloodGroup}</p>

            <form onSubmit={handleUpdateContactRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">অবস্থা (Status)</label>
                <select
                  value={reqStatus}
                  onChange={e => setReqStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                >
                  <option value="in_progress">চলমান (In Progress)</option>
                  <option value="fulfilled">সম্পন্ন (Fulfilled)</option>
                  <option value="cancelled">বাতিল (Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  মডারেটরের মন্তব্য বা অগ্রগতি বিবরণ
                </label>
                <textarea
                  rows={3}
                  value={moderatorNotes}
                  onChange={e => setModeratorNotes(e.target.value)}
                  placeholder="যেমন: রক্তদাতার সাথে যোগাযোগ সম্পন্ন হয়েছে..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setHandlingReq(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingHandling}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  {submittingHandling ? 'সংরক্ষণ হচ্ছে...' : 'হালনাগাদ নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
