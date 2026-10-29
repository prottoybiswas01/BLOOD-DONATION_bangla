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
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, unreadCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      case 'DIVISION_COORDINATOR':
        return '/coordinator/dashboard';
      case 'INSTITUTION_MODERATOR':
        return '/moderator/dashboard';
      case 'DONOR':
        return '/donor/dashboard';
      case 'REQUESTER':
        return '/requester/dashboard';
      default:
        return '/donor/dashboard';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'ড্যাশবোর্ড';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return 'সুপার এডমিন';
      case 'DIVISION_COORDINATOR':
        return 'বিভাগীয় প্যানেল';
      case 'INSTITUTION_MODERATOR':
        return 'প্রতিষ্ঠান প্যানেল';
      case 'DONOR':
        return 'আমার ড্যাশবোর্ড';
      case 'REQUESTER':
        return 'আমার অনুরোধ';
      default:
        return 'ড্যাশবোর্ড';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-appBorder shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-primary tracking-tight block leading-tight">
                রক্তদান বাংলাদেশ
              </span>
              <span className="text-[11px] text-subText block -mt-1 font-medium">
                জীবন বাঁচাতে রক্ত দিন
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            <Link
              to="/donors"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/donors') ? 'text-primary bg-primary-light font-semibold' : 'text-mainText hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4 text-primary" />
              রক্তদাতা খুঁজুন
            </Link>

            <Link
              to="/requests"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/requests') ? 'text-primary bg-primary-light font-semibold' : 'text-mainText hover:bg-gray-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              রক্তের অনুরোধ
            </Link>

            <Link
              to="/institutions"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/institutions') ? 'text-primary bg-primary-light font-semibold' : 'text-mainText hover:bg-gray-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-tealAccent" />
              প্রতিষ্ঠানসমূহ
            </Link>

            <Link
              to="/safety"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/safety') ? 'text-primary bg-primary-light font-semibold' : 'text-mainText hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-appSuccess" />
              নির্দেশিকা
            </Link>
          </nav>

          {/* User Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-mainText rounded-lg text-sm font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span>{getDashboardLabel()}</span>
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  title="লগআউট"
                  className="p-2 text-subText hover:text-primary hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-mainText hover:text-primary font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  লগইন
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium text-sm rounded-lg shadow-sm transition-all"
                >
                  রক্তদাতা হিসেবে যুক্ত হোন
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                to={getDashboardPath()}
                className="p-2 text-primary bg-primary-light rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-mainText hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-appBorder bg-surface px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/donors"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-mainText hover:bg-gray-100"
          >
            <Search className="w-5 h-5 text-primary" />
            রক্তদাতা খুঁজুন
          </Link>
          <Link
            to="/requests"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-mainText hover:bg-gray-100"
          >
            <PlusCircle className="w-5 h-5 text-primary" />
            রক্তের অনুরোধ
          </Link>
          <Link
            to="/create-request"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-primary font-semibold hover:bg-red-50"
          >
            <HeartHandshake className="w-5 h-5 text-primary" />
            জরুরি রক্তের আবেদন করুন
          </Link>
          <Link
            to="/institutions"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-mainText hover:bg-gray-100"
          >
            <Building2 className="w-5 h-5 text-tealAccent" />
            প্রতিষ্ঠান ও ক্যাম্পাস সমূহ
          </Link>
          <Link
            to="/safety"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-mainText hover:bg-gray-100"
          >
            <ShieldCheck className="w-5 h-5 text-appSuccess" />
            রক্তদানের নির্দেশিকা ও নিয়ম
          </Link>

          <div className="pt-3 border-t border-appBorder mt-2">
            {user ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-primary-light text-primary font-semibold rounded-lg"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    {user.name} ({getDashboardLabel()})
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  লগআউট করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center font-medium border border-appBorder rounded-lg text-mainText hover:bg-gray-50"
                >
                  লগইন
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center font-medium bg-primary text-white rounded-lg shadow-sm"
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
