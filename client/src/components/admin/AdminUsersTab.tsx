import React from 'react';
import { Users, Search, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AdminUsersTabProps {
  users: any[];
  filteredUsers: any[];
  paginatedUsers: any[];
  isSuperAdmin: boolean;
  userSearch: string;
  setUserSearch: (val: string) => void;
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  userPage: number;
  setUserPage: React.Dispatch<React.SetStateAction<number>>;
  totalUserPages: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchingUser: boolean;
  searchResult: any | null;
  setSearchResult: (val: any) => void;
  handleScopedSearch: (e: React.FormEvent) => void;
  handleRoleChange: (userId: string, newRole: string) => void;
  openEditModal: (u: any) => void;
  setViewingUser: (u: any) => void;
  setBlockingUser: (u: any) => void;
  setBlockReason: (val: string) => void;
  setUnblockingUser: (u: any) => void;
  setUnblockReason: (val: string) => void;
  setDeletingUser: (u: any) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  filteredUsers,
  paginatedUsers,
  isSuperAdmin,
  userSearch,
  setUserSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  userPage,
  setUserPage,
  totalUserPages,
  searchQuery,
  setSearchQuery,
  searchingUser,
  searchResult,
  setSearchResult,
  handleScopedSearch,
  handleRoleChange,
  openEditModal,
  setViewingUser,
  setBlockingUser,
  setBlockReason,
  setUnblockingUser,
  setUnblockReason,
  setDeletingUser
}) => {
  return (
    <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-mainText flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>ব্যবহারকারী ও সদস্য তালিকা</span>
          </h3>
          <p className="text-xs text-subText mt-0.5">সদস্যদের ভূমিকা নির্ধারণ, সম্পাদনা, মুছে ফেলা ও অ্যাকাউন্ট পরিচালনা</p>
        </div>
        <Badge variant="neutral">মোট: {filteredUsers.length} জন</Badge>
      </div>

      {/* Scoped Direct Search */}
      <div className="p-4 bg-slate-50/70 border border-appBorder rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-mainText flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-primary" />
            নির্দিষ্ট অ্যাকাউন্ট নির্ভুল অনুসন্ধান (মোবাইল নম্বর বা ইউজার আইডি)
          </span>
        </div>
        <form onSubmit={handleScopedSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="সরাসরি মোবাইল নম্বর (যেমন: 017XXXXXXXX) বা আইডি..."
            className="flex-1 px-3 py-2 bg-white border border-appBorder rounded-xl text-xs text-mainText font-mono focus:border-primary"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={searchingUser}
          >
            খুঁজুন
          </Button>
          {searchResult && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchResult(null);
                setSearchQuery('');
              }}
            >
              রিসেট
            </Button>
          )}
        </form>

        {searchResult && (
          <div className="p-3 bg-white rounded-xl border border-appBorder text-xs space-y-2 animate-in fade-in">
            {searchResult.success && searchResult.user ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-mainText text-sm flex items-center gap-2">
                    <span>{searchResult.user.name}</span>
                    <Badge variant="primary" size="sm">{searchResult.user.role}</Badge>
                    <Badge variant={searchResult.user.accountStatus === 'active' ? 'success' : 'danger'} size="sm">
                      {searchResult.user.accountStatus}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-subText mt-1">
                    মোবাইল: <strong className="font-mono text-slate-800">{searchResult.user.phone}</strong> | আইডি: {searchResult.user._id} | অবস্থান: {searchResult.user.district}, {searchResult.user.division}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(searchResult.user)}
                  >
                    সম্পাদনা
                  </Button>
                  {searchResult.user.accountStatus === 'active' ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setBlockingUser(searchResult.user);
                        setBlockReason('');
                      }}
                    >
                      স্থগিত করুন
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        setUnblockingUser(searchResult.user);
                        setUnblockReason('');
                      }}
                    >
                      সচল করুন
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeletingUser(searchResult.user)}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    মুছুন
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-rose-600 font-medium">
                {searchResult.guidanceBn || searchResult.message || 'কোনো ব্যবহারকারী পাওয়া যায়নি।'}
              </div>
            )}
          </div>
        )}
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
                      <button
                        onClick={() => setDeletingUser(u)}
                        title="ব্যবহারকারী ও সমস্ত ডাটা স্থায়ীভাবে মুছে ফেলুন"
                        className="px-2.5 py-1 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>মুছুন</span>
                      </button>
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
  );
};
