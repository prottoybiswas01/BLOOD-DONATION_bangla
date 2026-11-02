import React from 'react';
import { 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Phone, 
  Building2, 
  Flag,
  Share2,
  Clock
} from 'lucide-react';
import { BloodRequest } from '../types';
import { Badge } from './ui/Badge';

interface RequestCardProps {
  request: BloodRequest;
  onReport?: (requestId: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onReport }) => {
  const isEmergency = request.urgencyLevel === 'emergency';
  const isUrgent = request.urgencyLevel === 'urgent';

  const getUrgencyBadge = () => {
    if (isEmergency) {
      return (
        <Badge variant="danger" size="sm" dot>
          জরুরি প্রয়োজন
        </Badge>
      );
    }
    if (isUrgent) {
      return (
        <Badge variant="warning" size="sm">
          অতি জরুরি
        </Badge>
      );
    }
    return (
      <Badge variant="info" size="sm">
        নিয়মিত
      </Badge>
    );
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case 'open':
        return (
          <Badge variant="success" size="sm">
            খোলা রয়েছে
          </Badge>
        );
      case 'partially_fulfilled':
        return (
          <Badge variant="warning" size="sm">
            আংশিক সম্পন্ন ({request.unitsFulfilled}/{request.unitsRequired} ব্যাগ)
          </Badge>
        );
      case 'fulfilled':
        return (
          <Badge variant="neutral" size="sm">
            সম্পন্ন
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="neutral" size="sm">
            মেয়াদোত্তীর্ণ
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `জরুরি ${request.bloodGroup} রক্তের প্রয়োজন`,
        text: `${request.patientName}-এর জন্য জরুরি ভিত্তিতে ${request.unitsRequired} ব্যাগ ${request.bloodGroup} রক্ত প্রয়োজন। হাসপাতাল: ${request.hospitalName}, ${request.district}`,
        url: window.location.origin + `/requests/${request._id}`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/requests/${request._id}`);
      alert('অনুরোধের লিংক ক্লিপবোর্ডে কপি করা হয়েছে!');
    }
  };

  return (
    <div className={`bg-surface rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between ${
      isEmergency 
        ? 'border-rose-300 shadow-md ring-1 ring-rose-200/50 hover:shadow-elevated' 
        : 'border-appBorder shadow-soft hover:shadow-card hover:border-slate-300'
    }`}>
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm text-white ${
              isEmergency 
                ? 'bg-gradient-to-br from-red-600 to-rose-700 shadow-glow' 
                : 'bg-gradient-to-br from-primary to-primary-dark'
            }`}>
              {request.bloodGroup}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-mainText text-base leading-snug">
                  {request.patientName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">
                  {request.unitsRequired} ব্যাগ রক্ত প্রয়োজন
                </span>
                <span className="text-slate-300">•</span>
                {getStatusBadge()}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {getUrgencyBadge()}
          </div>
        </div>

        {/* Hospital Location & Date Information */}
        <div className="space-y-2 text-xs text-subText bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl mb-3.5">
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="font-semibold text-mainText leading-snug">{request.hospitalName}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span className="text-slate-600 leading-snug">
              {request.hospitalAddress ? `${request.hospitalAddress}, ` : ''}
              {request.upazila ? `${request.upazila}, ` : ''}
              {request.district}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <Calendar className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span className="text-slate-700">
              রক্তদানের তারিখ: <strong className="text-mainText">{new Date(request.requiredDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </span>
          </div>
        </div>

        {/* Reason / Details */}
        {request.reason && (
          <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
            <strong className="text-mainText font-semibold">প্রয়োজনীয়তা:</strong> {request.reason}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <a
          href={`tel:${request.contactNumber}`}
          className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-soft hover:shadow-md transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>কল করুন ({request.contactNumber})</span>
        </a>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.hospitalName + ', ' + request.district)}`}
          target="_blank"
          rel="noreferrer"
          title="গুগল ম্যাপে হাসপাতালের অবস্থান দেখুন"
          aria-label="গুগল ম্যাপে দেখুন"
          className="p-2.5 border border-appBorder rounded-xl text-teal-600 hover:text-white hover:bg-teal-600 hover:border-teal-600 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">ম্যাপে দেখুন</span>
        </a>

        <button
          onClick={handleShare}
          title="শেয়ার করুন"
          aria-label="শেয়ার করুন"
          className="p-2.5 border border-appBorder rounded-xl text-slate-600 hover:text-primary hover:bg-rose-50 hover:border-rose-200 active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {onReport && (
          <button
            onClick={() => onReport(request._id)}
            title="ভুয়া অনুরোধ বা অপব্যবহার রিপোর্ট করুন"
            aria-label="রিপোর্ট করুন"
            className="p-2.5 border border-appBorder rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 active:scale-95 transition-all"
          >
            <Flag className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
