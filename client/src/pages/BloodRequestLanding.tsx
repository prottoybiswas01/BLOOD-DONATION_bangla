import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Building2, 
  Calendar, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Download, 
  PlusCircle, 
  XCircle, 
  ArrowLeft,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BloodRequest, RequestStatus } from '../types';
import { DigitalBloodRequestCard } from '../components/DigitalBloodRequestCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const BloodRequestLanding: React.FC = () => {
  const { publicId, id } = useParams<{ publicId?: string; id?: string }>();
  const requestId = publicId || id || '';
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRequestData = async () => {
    if (!requestId) {
      setError('অনুরোধ আইডি পাওয়া যায়নি।');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRequestById(requestId);
      if (res && res.data) {
        setRequest(res.data);
      } else {
        setError('আবেদনের তথ্য পাওয়া যায়নি।');
      }
    } catch (err: any) {
      const msg = err?.message || 'অনুরোধ লোড করতে ব্যর্থ হয়েছে। সংযোগ পরীক্ষা করুন।';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestData();
  }, [requestId]);

  const isOwnerOrAdmin = user && request && (
    user._id === request.requesterId ||
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ADMIN'
  );

  const handleAddReceivedBag = async () => {
    if (!request) return;
    try {
      setUpdating(true);
      const res = await api.updateRequestProgress(request._id, { unitsReceivedDelta: 1 });
      if (res && res.data) {
        setRequest(res.data);
        setActionSuccess('১ ব্যাগ রক্ত প্রাপ্তি সফলভাবে যুক্ত হয়েছে!');
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (err: any) {
      alert(err?.message || 'রক্ত প্রাপ্তি যোগ করা ব্যর্থ হয়েছে');
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkFulfilled = async () => {
    if (!request) return;
    const confirm = window.confirm('আপনি কি নিশ্চিত যে সম্পূর্ণ প্রয়োজনীয় রক্ত সংগ্রহ সম্পন্ন হয়েছে?');
    if (!confirm) return;

    try {
      setUpdating(true);
      const res = await api.updateRequestStatus(request._id, { 
        status: 'fulfilled',
        fulfillmentNotes: 'ব্যবহারকারী কর্তৃক সম্পূর্ণ সংগৃহীত চিহ্নিত করা হয়েছে।' 
      });
      if (res && res.data) {
        setRequest(res.data);
        setActionSuccess('আবেদন সফলভাবে সম্পন্ন চিহ্নিত করা হয়েছে!');
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (err: any) {
      alert(err?.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!request) return;
    const reason = window.prompt('আবেদন বাতিলের কারণ লিখুন:');
    if (!reason) return;

    try {
      setUpdating(true);
      const res = await api.updateRequestStatus(request._id, { 
        status: 'cancelled',
        cancellationReason: reason
      });
      if (res && res.data) {
        setRequest(res.data);
        setActionSuccess('আবেদন সফলভাবে বাতিল করা হয়েছে।');
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (err: any) {
      alert(err?.message || 'আবেদন বাতিল করতে ব্যর্থ হয়েছে');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-secondaryText font-medium">রক্তের আবেদনের তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-primary mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-mainText mb-2">আবেদনটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-secondaryText mb-6">{error || 'অনুরোধটি হয়তো মুছে ফেলা হয়েছে বা মেয়াদ শেষ হয়েছে।'}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => fetchRequestData()}>
            আবার চেষ্টা করুন
          </Button>
          <Button onClick={() => navigate('/requests')}>
            সকল রক্তের আবেদন দেখুন
          </Button>
        </div>
      </div>
    );
  }

  const unitsRemaining = Math.max(0, request.unitsRequired - (request.unitsFulfilled || 0));
  const isFulfilled = request.status === 'fulfilled';
  const isCancelled = request.status === 'cancelled';
  const isExpired = request.status === 'expired';
  const isPartiallyFulfilled = request.status === 'partially_fulfilled' || (request.unitsFulfilled > 0 && !isFulfilled);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link 
            to="/requests" 
            className="inline-flex items-center gap-1.5 text-sm font-medium text-secondaryText hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            সকল জরুরি আবেদন
          </Link>
          <div className="text-xs text-secondaryText bg-white px-3 py-1 rounded-full border border-slate-200">
            আইডি: <span className="font-mono font-bold text-mainText">{request.publicId || request._id}</span>
          </div>
        </div>

        {/* Live Status Banners */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
        )}

        {isFulfilled ? (
          <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg text-center space-y-2 animate-fade-in">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">রক্ত সংগ্রহ সফলভাবে সম্পন্ন হয়েছে</h1>
            <p className="text-emerald-100 max-w-xl mx-auto text-base">
              এই রোগীর প্রয়োজনীয় রক্ত সংগ্রহ সম্পন্ন হয়েছে। সকল রক্তদাতা ও সহযোগীদের আন্তরিক ধন্যবাদ।
            </p>
          </div>
        ) : isCancelled ? (
          <div className="bg-slate-700 text-white p-6 rounded-2xl shadow text-center space-y-2">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-8 h-8 text-slate-300" />
            </div>
            <h1 className="text-2xl font-bold">এই আবেদনটি বাতিল করা হয়েছে</h1>
            <p className="text-slate-300 text-sm">
              রোগীর পরিবার অথবা কর্তৃপক্ষের পক্ষ থেকে আবেদনটি বাতিল ঘোষণা করা হয়েছে।
            </p>
          </div>
        ) : isExpired ? (
          <div className="bg-amber-600 text-white p-6 rounded-2xl shadow text-center space-y-2">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">আবেদনের মেয়াদ উত্তীর্ণ হয়েছে</h1>
            <p className="text-amber-100 text-sm">
              নির্ধারিত তারিখ ও সময় অতিক্রান্ত হওয়ায় আবেদনটির সক্রিয় সময় শেষ হয়েছে।
            </p>
          </div>
        ) : (
          <div className="bg-red-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-4">
              <Heart className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold mb-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping"></span>
                  জরুরি রক্তের প্রয়োজন — লাইভ স্ট্যাটাস
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {request.bloodGroup} রক্তের জরুরি আবেদন
                </h1>
                <p className="text-red-100 mt-1">
                  রোগী: <strong className="text-white">{request.patientName}</strong> | হাসপাতাল: <strong className="text-white">{request.hospitalName}</strong>
                </p>
              </div>
              <div className="bg-white text-red-600 px-5 py-3 rounded-xl shadow-md text-center flex-shrink-0 self-start md:self-auto">
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">প্রয়োজনীয় রক্ত</div>
                <div className="text-2xl font-black text-primary">{request.unitsRequired} ব্যাগ</div>
                {unitsRemaining > 0 && (
                  <div className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1">
                    বাকি আছে {unitsRemaining} ব্যাগ
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Units Progress Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-mainText flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              রক্ত সংগ্রহের অগ্রগতি
            </span>
            <span className="text-slate-600 font-medium">
              মোট প্রয়োজন: {request.unitsRequired} ব্যাগ | সংগৃহীত: {request.unitsFulfilled || 0} ব্যাগ
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isFulfilled ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, Math.round(((request.unitsFulfilled || 0) / request.unitsRequired) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-secondaryText pt-1">
            <span>০ ব্যাগ</span>
            <span className="font-semibold text-slate-700">
              {unitsRemaining > 0 ? `${unitsRemaining} ব্যাগ এখনও প্রয়োজন` : 'সম্পূর্ণ পূরণ হয়েছে'}
            </span>
            <span>{request.unitsRequired} ব্যাগ</span>
          </div>
        </div>

        {/* Requester / Admin Controls */}
        {isOwnerOrAdmin && !isFulfilled && !isCancelled && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-900 flex items-center gap-2 text-sm">
                <ShieldCheck className="w-5 h-5 text-primary" />
                আপনার আবেদন পরিচালনা প্যানেল (মালিক / প্রশাসক)
              </h3>
              <span className="text-xs text-red-600 bg-white px-2.5 py-0.5 rounded-full border border-red-200">
                স্বত্বাধিকারী
              </span>
            </div>
            <p className="text-xs text-slate-600">
              রক্তদাতা রক্ত প্রদান করলে প্রাপ্তি আপডেট করুন। সকল ব্যাগ সংগ্রহ হলে সম্পূর্ণ ঘোষণা করুন।
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button 
                size="sm" 
                onClick={handleAddReceivedBag} 
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                ১ ব্যাগ রক্ত প্রাপ্তি যোগ করুন
              </Button>
              <Button 
                size="sm" 
                onClick={handleMarkFulfilled} 
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="w-4 h-4 mr-1.5" />
                অনুরোধ সম্পন্ন ঘোষণা করুন
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancelRequest} 
                disabled={updating}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                আবেদন বাতিল
              </Button>
            </div>
          </div>
        )}

        {/* Detailed Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Patient and Hospital Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-mainText border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              রোগী ও হাসপাতালের তথ্য
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start py-1 border-b border-slate-50">
                <span className="text-secondaryText">রোগীর নাম</span>
                <span className="font-semibold text-mainText">{request.patientName}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-50">
                <span className="text-secondaryText">রক্তের গ্রুপ</span>
                <span className="font-bold text-primary text-base">{request.bloodGroup}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-50">
                <span className="text-secondaryText">প্রয়োজনের কারণ / অবস্থা</span>
                <span className="font-medium text-mainText text-right max-w-[60%]">{request.reason}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-50">
                <span className="text-secondaryText">হাসপাতাল</span>
                <span className="font-semibold text-mainText text-right max-w-[60%]">{request.hospitalName}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-50">
                <span className="text-secondaryText">ঠিকানা ও এলাকা</span>
                <span className="font-medium text-slate-700 text-right max-w-[60%]">
                  {request.hospitalAddress ? `${request.hospitalAddress}, ` : ''}{request.upazila}, {request.district}
                </span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-50">
                <span className="text-secondaryText">রক্তদানের সময়</span>
                <span className="font-semibold text-amber-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(request.requiredDate).toLocaleDateString('bn-BD', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  {request.requiredWithin ? ` (${request.requiredWithin})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details & Emergency Action */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-mainText border-b border-slate-100 pb-2 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" />
                জরুরি যোগাযোগের তথ্য
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start py-1 border-b border-slate-50">
                  <span className="text-secondaryText">যোগাযোগের ব্যক্তি</span>
                  <span className="font-semibold text-mainText">
                    {request.contactPersonName || request.requesterName || 'অনুরোধকারী'}
                  </span>
                </div>
                <div className="flex justify-between items-start py-1 border-b border-slate-50">
                  <span className="text-secondaryText">জরুরি মোবাইল নম্বর</span>
                  <a 
                    href={`tel:${request.contactNumber}`} 
                    className="font-bold text-emerald-600 font-mono text-base hover:underline"
                  >
                    {request.contactNumber}
                  </a>
                </div>
                {request.alternativeContactNumber && (
                  <div className="flex justify-between items-start py-1 border-b border-slate-50">
                    <span className="text-secondaryText">বিকল্প নম্বর</span>
                    <a 
                      href={`tel:${request.alternativeContactNumber}`} 
                      className="font-medium text-slate-700 font-mono hover:underline"
                    >
                      {request.alternativeContactNumber}
                    </a>
                  </div>
                )}
                {request.additionalNotes && (
                  <div className="py-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600">
                    <strong className="block text-slate-800 mb-0.5">অতিরিক্ত নির্দেশনা:</strong>
                    {request.additionalNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Direct Call Action Button */}
            {!isFulfilled && !isCancelled && (
              <div className="pt-4 space-y-2">
                <a
                  href={`tel:${request.contactNumber}`}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Phone className="w-5 h-5" />
                  সরাসরি কল দিন ({request.contactNumber})
                </a>
                <p className="text-[11px] text-center text-slate-400">
                  অযথা কল করা থেকে বিরত থাকুন। শুধুমাত্র রক্তদানে আগ্রহীগণ যোগাযোগ করুন।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Digital Blood Request Card Component Embedded */}
        <div className="mt-8">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-mainText">ডিজিটাল কার্ড ও কিউআর কোড</h2>
            <p className="text-sm text-secondaryText">
              সামাজিক মাধ্যমে শেয়ার করতে অথবা সহজে স্ক্যান করতে কার্ডটি ডাউনলোড করুন
            </p>
          </div>
          <DigitalBloodRequestCard request={request} />
        </div>

      </div>
    </div>
  );
};

