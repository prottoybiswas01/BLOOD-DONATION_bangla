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
  UserCheck,
  Droplet
} from 'lucide-react';
import { DonorProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

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
        return <Badge variant="success" size="sm" dot>রক্তদানে প্রস্তুত</Badge>;
      case 'recently_donated':
        return <Badge variant="warning" size="sm">সম্প্রতি রক্তদান করেছেন</Badge>;
      default:
        return <Badge variant="neutral" size="sm">সাময়িক বিরতিতে</Badge>;
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
    <div className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 hover:border-red-200 hover:shadow-card transition-all flex flex-col justify-between">
      <div>
        {/* Top Header: Blood Group & Status */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-primary text-white flex items-center justify-center font-black text-xl shadow-soft">
              {donor.bloodGroup}
            </div>
            <div>
              <h3 className="font-bold text-mainText text-base flex items-center gap-1.5">
                <span>{donor.displayName}</span>
                {donor.institutionMembershipVerified && (
                  <span title="যাচাইকৃত শিক্ষার্থী/সদস্য" className="text-teal-700">
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
          <div className="mb-3 px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-xl flex items-center gap-2 text-xs text-teal-800 font-semibold">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-teal-600" />
            <span className="truncate">{donor.institutionName}</span>
          </div>
        )}

        {/* Bio if exists */}
        {donor.bio && (
          <p className="text-xs text-slate-600 italic line-clamp-2 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            "{donor.bio}"
          </p>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs text-subText py-2.5 border-y border-appBorder mb-3">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">মোট রক্তদান:</span>
            <span className="font-bold text-mainText">{donor.totalDonations} বার</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">সর্বশেষ রক্তদান:</span>
            <span className="font-bold text-mainText">
              {donor.lastDonationDate 
                ? new Date(donor.lastDonationDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short' })
                : 'রেকর্ড নেই'}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Action Footer */}
      <div className="pt-1">
        {revealedPhone ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-2">
            <div className="text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>যোগাযোগের নম্বর উন্মুক্ত হয়েছে</span>
            </div>
            <a
              href={`tel:${revealedPhone}`}
              className="inline-flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-soft transition-colors text-sm font-mono"
            >
              <Phone className="w-4 h-4" />
              <span>{revealedPhone} কল করুন</span>
            </a>
            {remainingLimit !== null && (
              <p className="text-[10px] text-slate-500 font-medium">
                আজকের অবশিষ্ট সীমা: {remainingLimit} বার
              </p>
            )}
          </div>
        ) : (
          <div>
            {errorMsg && (
              <p className="text-xs text-rose-700 mb-2 bg-rose-50 border border-rose-200 p-2 rounded-xl flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleRevealContact}
                isLoading={loading}
                icon={<Phone className="w-4 h-4" />}
                className="flex-1 font-bold shadow-soft"
              >
                {loading ? 'যাচাই হচ্ছে...' : 'যোগাযোগের নম্বর দেখুন'}
              </Button>
              {onReport && (
                <button
                  onClick={() => onReport(donor._id)}
                  title="ভুয়া প্রোফাইল অভিযোগ করুন"
                  className="p-2.5 border border-appBorder rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>গোপনীয়তা সুরক্ষার্থে নম্বরটি সুরক্ষিত থাকে</span>
            </p>
          </div>
        )}
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <Modal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="লগইন প্রয়োজন"
          description="রক্তদাতাদের গোপনীয়তা ও সুরক্ষার স্বার্থে যোগাযোগের নম্বর কেবল প্ল্যাটফর্মে লগইনকৃত যাচাইকৃত সদস্যদের প্রদর্শিত হয়।"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowLoginModal(false)}>বাতিল</Button>
              <Link to="/login">
                <Button variant="primary" size="sm">লগইন করুন</Button>
              </Link>
            </>
          }
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-xs text-subText leading-relaxed">
              আপনার কি এখনো অ্যাকাউন্ট নেই? আপনি মাত্র ২ মিনিটে বিনামূল্যে সদস্য নিবন্ধন করতে পারেন।
            </p>
            <Link to="/register" className="inline-block">
              <span className="text-xs font-bold text-primary hover:underline">
                নতুন অ্যাকাউন্ট খুলুন →
              </span>
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
};
