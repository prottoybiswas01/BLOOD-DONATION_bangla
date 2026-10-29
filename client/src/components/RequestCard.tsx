import React from 'react';
import { 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Phone, 
  Building2, 
  CheckCircle2, 
  Flag,
  Share2
} from 'lucide-react';
import { BloodRequest } from '../types';
import { Link } from 'react-router-dom';

interface RequestCardProps {
  request: BloodRequest;
  onReport?: (requestId: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onReport }) => {
  const getUrgencyBadge = () => {
    switch (request.urgencyLevel) {
      case 'emergency':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-primary border border-red-300 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-primary" />
            জরুরি প্রয়োজন
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
            <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
            অতি জরুরি
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
            নিয়মিত
          </span>
        );
    }
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case 'open':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-appSuccess">
            খোলা রয়েছে
          </span>
        );
      case 'partially_fulfilled':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
            আংশিক সংগ্রহীত ({request.unitsFulfilled}/{request.unitsRequired} ব্যাগ)
          </span>
        );
      case 'fulfilled':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">
            সম্পন্ন হয়েছে
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500">
            মেয়াদোত্তীর্ণ
          </span>
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
      alert('লিংক কপি করা হয়েছে!');
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-appBorder shadow-card p-5 hover:border-red-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {request.bloodGroup}
            </div>
            <div>
              <h3 className="font-bold text-mainText text-base">
                {request.patientName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-primary">
                  প্রয়োজন: {request.unitsRequired} ব্যাগ
                </span>
                <span className="text-gray-300">•</span>
                {getStatusBadge()}
              </div>
            </div>
          </div>
          <div>{getUrgencyBadge()}</div>
        </div>

        {/* Hospital Location & Date */}
        <div className="space-y-1.5 text-xs text-subText bg-gray-50 p-3 rounded-lg mb-3">
          <div className="flex items-start gap-1.5">
            <Building2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="font-medium text-mainText">{request.hospitalName}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span>{request.hospitalAddress}, {request.upazila ? `${request.upazila}, ` : ''}{request.district}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-tealAccent flex-shrink-0" />
            <span>
              তারিখ: <strong>{new Date(request.requiredDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </span>
          </div>
        </div>

        {/* Reason / Details */}
        <p className="text-xs text-mainText mb-4 line-clamp-2">
          <strong>রোগীর বিবরণ:</strong> {request.reason}
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
        <a
          href={`tel:${request.contactNumber}`}
          className="flex-1 py-2 px-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span>কল করুন ({request.contactNumber})</span>
        </a>

        <button
          onClick={handleShare}
          title="অনুরোধটি শেয়ার করুন"
          className="p-2 border border-appBorder rounded-lg text-subText hover:text-primary hover:bg-red-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {onReport && (
          <button
            onClick={() => onReport(request._id)}
            title="ভুয়া অনুরোধ বা অপব্যবহার রিপোর্ট করুন"
            className="p-2 border border-appBorder rounded-lg text-subText hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Flag className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
