import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  CheckCircle2, 
  Flag,
  UserCheck
} from 'lucide-react';
import { DonorProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

interface DonorCardProps {
  donor: DonorProfile;
  onReport?: (donorId: string) => void;
}

export const DonorCard: React.FC<DonorCardProps> = ({ donor, onReport }) => {
  const { user } = useAuth();
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [remainingLimit, setRemainingLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const getStatusBadge = () => {
    switch (donor.availabilityStatus) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-appSuccess border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-appSuccess animate-pulse"></span>
            রক্তদানে প্রস্তুত
          </span>
        );
      case 'recently_donated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            সম্প্রতি রক্তদান করেছেন
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-subText">
            সাময়িক বিরতিতে
          </span>
        );
    }
  };

  const handleRevealContact = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.revealDonorContact(donor._id, {
        purpose: 'emergency_search'
      });
      if (res.success) {
        setRevealedPhone(res.contactNumber);
        if (res.remainingDailyLimit !== undefined) {
          setRemainingLimit(res.remainingDailyLimit);
        }
      } else {
        setErrorMsg(res.message || 'নম্বর দেখা সম্ভব হচ্ছে না।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'নম্বর দেখা ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-appBorder shadow-card p-5 hover:border-red-200 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header: Blood Group & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-primary-light border border-red-200 text-primary flex items-center justify-center font-bold text-xl shadow-sm">
              {donor.bloodGroup}
            </div>
            <div>
              <h3 className="font-bold text-mainText text-base flex items-center gap-1.5">
                {donor.displayName}
                {donor.institutionMembershipVerified && (
                  <span title="যাচাইকৃত শিক্ষার্থী/সদস্য" className="text-tealAccent">
                    <UserCheck className="w-4 h-4" />
                  </span>
                )}
              </h3>
              <p className="text-xs text-subText flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>
                  {donor.upazila ? `${donor.upazila}, ` : ''}{donor.district}, {donor.division}
                </span>
              </p>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Institution Badge if exists */}
        {donor.institutionName && (
          <div className="mb-3 px-2.5 py-1.5 bg-teal-50 border border-teal-100 rounded-lg flex items-center gap-1.5 text-xs text-tealAccent font-medium">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{donor.institutionName}</span>
          </div>
        )}

        {/* Bio if exists */}
        {donor.bio && (
          <p className="text-xs text-subText italic line-clamp-2 mb-3 bg-gray-50 p-2 rounded">
            "{donor.bio}"
          </p>
        )}

        {/* Metrics: Donations & Last Donation */}
        <div className="grid grid-cols-2 gap-2 text-xs text-subText py-2 border-y border-gray-100 mb-3">
          <div>
            <span className="text-gray-400 block text-[11px]">মোট রক্তদান:</span>
            <span className="font-semibold text-mainText">{donor.totalDonations} বার</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">সর্বশেষ রক্তদান:</span>
            <span className="font-semibold text-mainText">
              {donor.lastDonationDate 
                ? new Date(donor.lastDonationDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short' })
                : 'তথ্য নেই'}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Action Footer */}
      <div className="pt-2">
        {revealedPhone ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center space-y-2">
            <div className="text-xs text-green-800 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-appSuccess" />
              <span>যোগাযোগের নম্বর উন্মুক্ত হয়েছে</span>
            </div>
            <a
              href={`tel:${revealedPhone}`}
              className="inline-flex items-center justify-center gap-2 w-full py-2 bg-appSuccess hover:bg-green-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>{revealedPhone} এ কল করুন</span>
            </a>
            {remainingLimit !== null && (
              <p className="text-[10px] text-subText">
                আজকের অবশিষ্ট সীমা: {remainingLimit} বার
              </p>
            )}
          </div>
        ) : (
          <div>
            {errorMsg && (
              <p className="text-xs text-red-600 mb-2 bg-red-50 p-2 rounded flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {errorMsg}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRevealContact}
                disabled={loading}
                className="flex-1 py-2 px-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{loading ? 'যাচাই হচ্ছে...' : 'যোগাযোগের নম্বর দেখুন'}</span>
              </button>
              {onReport && (
                <button
                  onClick={() => onReport(donor._id)}
                  title="ভুয়া প্রোফাইল অভিযোগ করুন"
                  className="p-2 border border-appBorder rounded-lg text-subText hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              <span>ডেটা সুরক্ষার্থে নম্বরটি এনক্রিপ্টেড থাকে</span>
            </p>
          </div>
        )}
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-primary flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-mainText">লগইন প্রয়োজন</h4>
              <p className="text-xs text-subText mt-1">
                রক্তদাতাদের গোপনীয়তা ও সুরক্ষার স্বার্থে যোগাযোগের নম্বর কেবল প্ল্যাটফর্মে লগইনকৃত ব্যবহারকারীদের জন্য দৃশ্যমান।
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                className="w-full block py-2.5 text-center bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-hover transition-colors"
              >
                লগইন করুন
              </Link>
              <Link
                to="/register"
                className="w-full block py-2.5 text-center border border-appBorder text-mainText rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                নতুন অ্যাকাউন্ট খুলুন
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2 text-center text-xs text-subText hover:text-mainText"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
