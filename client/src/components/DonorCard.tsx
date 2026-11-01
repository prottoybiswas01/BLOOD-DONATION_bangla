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
  Droplet,
  Copy,
  Check
} from 'lucide-react';
import { DonorProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface DonorCardProps {
  donor: DonorProfile;
  onReport?: (donorId: string) => void;
}

export const DonorCard: React.FC<DonorCardProps> = ({ donor, onReport }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

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

  const handleCopy = (phoneNum: string) => {
    navigator.clipboard.writeText(phoneNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* Public Contact Action Footer - No Login Required if Consent is Given */}
      <div className="pt-2">
        {donor.phone ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>সরাসরি যোগাযোগ অনুমোদিত</span>
              </span>
              <span className="font-mono font-bold text-emerald-950 text-xs">{donor.phone}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <a
                href={`tel:${donor.phone}`}
                className="inline-flex items-center justify-center gap-2 flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-soft transition-colors text-xs font-mono"
              >
                <Phone className="w-4 h-4" />
                <span>সরাসরি কল করুন</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(donor.phone || '')}
                className="p-2 border border-emerald-300 rounded-xl bg-white hover:bg-emerald-100/60 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="নম্বর কপি করুন"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-700" />}
                <span>{copied ? 'কপি!' : 'কপি'}</span>
              </button>
              {onReport && (
                <button
                  onClick={() => onReport(donor._id)}
                  title="ভুয়া প্রোফাইল অভিযোগ করুন"
                  className="p-2 border border-emerald-300 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-2">
            <div className="text-xs text-slate-700 font-semibold flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>নম্বর গোপনীয় (রক্তদাতার সম্মতি নেই)</span>
            </div>
            <p className="text-[11px] text-subText">
              গোপনীয়তার কারণে সরাসরি ফোন নম্বর প্রদর্শিত নয়। রক্তের জরুরি প্রয়োজনে প্ল্যাটফর্মে রক্তের আবেদন পোস্ট করুন।
            </p>
            <div className="flex items-center gap-2">
              <Link
                to="/create-request"
                className="inline-flex items-center justify-center gap-1.5 flex-1 py-1.5 bg-white hover:bg-rose-50 text-primary border border-red-200 rounded-xl text-xs font-bold transition-colors"
              >
                <span>রক্তের আবেদন পোস্ট করুন →</span>
              </Link>
              {onReport && (
                <button
                  onClick={() => onReport(donor._id)}
                  title="ভুয়া প্রোফাইল অভিযোগ করুন"
                  className="p-1.5 border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
