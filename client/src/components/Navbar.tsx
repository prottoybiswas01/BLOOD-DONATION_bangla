import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartHandshake, 
  Search, 
  PlusCircle, 
  Building2, 
  ShieldCheck, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  Bell,
  LayoutDashboard,
  PhoneCall,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './ui/Badge';

export const Navbar: React.FC = () => {
  const { user, logout, unreadCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return '/admin/dashboard';
      case 'DIVISION_COORDINATOR':
        return '/coordinator/dashboard';
      case 'INSTITUTION_MODERATOR':
        return '/moderator/dashboard';
      case 'DONOR':
      case 'MEMBER':
        return '/donor/dashboard';
      case 'REQUESTER':
        return '/requester/dashboard';
      default:
        return '/donor/dashboard';
    }
  };

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <Badge variant="danger" size="sm">সর্বোচ্চ প্রশাসক</Badge>;
      case 'ADMIN':
        return <Badge variant="primary" size="sm">অ্যাডমিন</Badge>;
      case 'DIVISION_COORDINATOR':
        return <Badge variant="info" size="sm">বিভাগীয় সমন্বয়ক</Badge>;
      case 'INSTITUTION_MODERATOR':
        return <Badge variant="teal" size="sm">প্রতিষ্ঠান মডারেটর</Badge>;
      case 'DONOR':
        return <Badge variant="success" size="sm">স্বেচ্ছাসেবী রক্তদাতা</Badge>;
      default:
        return <Badge variant="neutral" size="sm">সদস্য</Badge>;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-appBorder shadow-soft transition-all">
      {/* Emergency Hotline Top Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-1 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-white">জরুরি রক্তের জন্য যোগাযোগ:</span>
            <span className="text-slate-200">জাতীয় কল সেন্টার ৯৯৯ | স্বাস্থ্য বাতায়ন ১৬২৬৩</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            <span>১০০% নিরাপদ ও মানবিক উদ্যোগ</span>
            <span className="text-slate-600">•</span>
            <Link to="/safety" className="text-slate-300 hover:text-white transition-colors">নিরাপত্তা নীতিমালা</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-rose-600 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight block leading-tight group-hover:text-primary transition-colors">
                রক্তদান <span className="text-primary">বাংলাদেশ</span>
              </span>
              <span className="text-[10px] text-subText block font-medium tracking-wide">
                Bangladesh Blood Donation Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/donors"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/donors') 
                  ? 'text-primary bg-primary-light shadow-sm' 
                  : 'text-mainText hover:bg-slate-100/80 hover:text-primary'
              }`}
            >
              <Search className="w-4 h-4 text-primary" />
              <span>রক্তদাতা খুঁজুন</span>
            </Link>

            <Link
              to="/requests"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/requests') 
                  ? 'text-primary bg-primary-light shadow-sm' 
                  : 'text-mainText hover:bg-slate-100/80 hover:text-primary'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              <span>রক্তের অনুরোধ</span>
            </Link>

            <Link
              to="/institutions"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/institutions') 
                  ? 'text-primary bg-primary-light shadow-sm' 
                  : 'text-mainText hover:bg-slate-100/80 hover:text-primary'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>প্রতিষ্ঠানসমূহ</span>
            </Link>

            <Link
              to="/safety"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/safety') 
                  ? 'text-primary bg-primary-light shadow-sm' 
                  : 'text-mainText hover:bg-slate-100/80 hover:text-primary'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>নির্দেশিকা</span>
            </Link>
          </nav>

          {/* User Account & Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-appBorder transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name ? user.name.slice(0, 1) : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-mainText truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-subText font-medium">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-surface rounded-2xl border border-appBorder shadow-elevated py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-appBorder bg-slate-50/50">
                      <p className="text-xs text-subText">লগইন করা অ্যাকাউন্ট</p>
                      <p className="text-sm font-bold text-mainText truncate">{user.name}</p>
                      <div className="mt-1.5">{getRoleBadge()}</div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-mainText hover:bg-red-50 hover:text-primary rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>ড্যাশবোর্ড প্যানেল</span>
                      </Link>

                      <Link
                        to="/donor/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-mainText hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span>আমার প্রোফাইল ও সেটিংস</span>
                      </Link>
                    </div>

                    <div className="p-1 border-t border-appBorder">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>লগআউট করুন</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-colors"
                >
                  লগইন
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-soft hover:shadow-card transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>রক্তদাতা হিসেবে যুক্ত হোন</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link
                to={getDashboardPath()}
                className="p-2 text-primary bg-primary-light rounded-xl"
                title="ড্যাশবোর্ড"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-appBorder bg-surface px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {user && (
            <div className="p-3 bg-slate-50 rounded-xl border border-appBorder flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name.slice(0, 1) : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-mainText">{user.name}</p>
                  <p className="text-[10px] text-subText">{user.phone}</p>
                </div>
              </div>
              <div>{getRoleBadge()}</div>
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/donors"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive('/donors') ? 'bg-primary-light text-primary font-bold' : 'text-mainText hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-primary" />
              <span>রক্তদাতা খুঁজুন</span>
            </Link>

            <Link
              to="/requests"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive('/requests') ? 'bg-primary-light text-primary font-bold' : 'text-mainText hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              <span>রক্তের অনুরোধসমূহ</span>
            </Link>

            <Link
              to="/create-request"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-mainText hover:bg-slate-50"
            >
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>জরুরি রক্তের আবেদন করুন</span>
            </Link>

            <Link
              to="/institutions"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive('/institutions') ? 'bg-primary-light text-primary font-bold' : 'text-mainText hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>নিবন্ধিত শিক্ষা প্রতিষ্ঠান</span>
            </Link>

            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive('/safety') ? 'bg-primary-light text-primary font-bold' : 'text-mainText hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>সুরক্ষা ও নিরাপত্তা নির্দেশিকা</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-appBorder space-y-2">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-soft"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>ড্যাশবোর্ড প্রবেশ করুন</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 text-rose-600 hover:bg-rose-50 text-sm font-semibold rounded-xl border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-mainText bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  লগইন
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-soft"
                >
                  নিবন্ধন
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
