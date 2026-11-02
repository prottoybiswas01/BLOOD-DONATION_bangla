import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar,
  HeartHandshake,
  RotateCcw,
  Sparkles,
  QrCode,
  Check,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { BloodRequest } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/ui/StatsCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export const RequesterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getMyRequests();
      if (res.success && res.requests) {
        setRequests(res.requests);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleAddReceivedBag = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await api.updateRequestProgress(id, { unitsReceivedDelta: 1 });
      if (res.success) {
        setMsg({ text: '১ ব্যাগ রক্ত প্রাপ্তি সফলভাবে যুক্ত হয়েছে।', type: 'success' });
        fetchMyRequests();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'প্রাপ্তি যোগ করা ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const confirm = window.confirm(
      status === 'fulfilled' 
        ? 'আপনি কি নিশ্চিত যে সম্পূর্ণ রক্ত সংগ্রহ সম্পন্ন হয়েছে?' 
        : 'আপনি কি নিশ্চিত যে আবেদনটি বাতিল করতে চান?'
    );
    if (!confirm) return;

    setUpdatingId(id);
    try {
      const res = await api.updateRequestStatus(id, { status });
      if (res.success) {
        setMsg({ 
          text: status === 'fulfilled' 
            ? 'আবেদন সফলভাবে সম্পন্ন চিহ্নিত করা হয়েছে!' 
            : 'আবেদনটি বাতিল করা হয়েছে।', 
          type: 'success' 
        });
        fetchMyRequests();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'হালনাগাদ ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const openCount = requests.filter(r => r.status === 'open' || r.status === 'partially_fulfilled').length;
  const fulfilledCount = requests.filter(r => r.status === 'fulfilled').length;

  return (
    <div className="min-h-screen bg-page pb-12">
      {/* Top Header / Breadcrumb */}
      <div className="bg-surface border-b border-appBorder px-4 sm:px-6 lg:px-8 py-3.5 shadow-soft">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Breadcrumb items={[{ label: 'রক্তপ্রার্থী ড্যাশবোর্ড' }]} />
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-mainText tracking-tight">আমার রক্তের অনুরোধসমূহ</h1>
              <Badge variant="primary" size="sm">রক্তপ্রার্থী প্যানেল</Badge>
            </div>
            <p className="text-xs text-subText mt-0.5">আপনার পোস্টকৃত রক্তের আবেদন, ডিজিটাল কার্ড ও ডোনার সংগ্রহের অগ্রগতি পরিচালনা করুন</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMyRequests}
              isLoading={loading}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              হালনাগাদ
            </Button>
            <Link to="/create-request">
              <Button
                variant="primary"
                size="sm"
                icon={<PlusCircle className="w-4 h-4" />}
                className="font-bold shadow-soft"
              >
                নতুন আবেদন তৈরি করুন
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Action Alert Banner */}
        {msg && (
          <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-soft animate-in fade-in duration-150 ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-xs font-bold px-2">✕</button>
          </div>
        )}

        {/* 3 Summary StatsCards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="মোট আবেদন"
            value={requests.length}
            subtitle="আপনার তৈরি সর্বমোট অনুরোধ"
            icon={<Clock className="w-5 h-5" />}
            iconColor="primary"
          />
          <StatsCard
            title="বর্তমানে সক্রিয়"
            value={openCount}
            subtitle="রক্তদাতার সন্ধান চলছে"
            icon={<HeartHandshake className="w-5 h-5" />}
            iconColor="amber"
          />
          <StatsCard
            title="রক্ত সংগ্রহ সম্পন্ন"
            value={fulfilledCount}
            subtitle="রক্তদাতা পাওয়া গেছে"
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconColor="emerald"
          />
        </div>

        {/* Request List Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(n => (
              <div key={n} className="h-48 bg-slate-100 animate-pulse rounded-2xl border border-appBorder"></div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-surface rounded-3xl border border-appBorder shadow-soft p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-primary flex items-center justify-center mx-auto shadow-soft">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-mainText">আপনার কোনো চলমান রক্তের আবেদন নেই</h3>
            <p className="text-xs text-subText leading-relaxed">
              রোগীর জরুরি রক্তের প্রয়োজন হলে যেকোনো সময় বিনামূল্যে রক্তের অনুরোধ পোস্ট করতে পারেন।
            </p>
            <Link to="/create-request" className="inline-block pt-1">
              <Button variant="primary" size="md" icon={<PlusCircle className="w-4 h-4" />}>
                জরুরি রক্তের আবেদন করুন
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {requests.map(req => {
              const publicId = req.publicId || req._id;
              const unitsFulfilled = req.unitsFulfilled || 0;
              const unitsRemaining = Math.max(0, req.unitsRequired - unitsFulfilled);
              const isFulfilled = req.status === 'fulfilled';
              const isCancelled = req.status === 'cancelled';
              const isUpdating = updatingId === req._id;

              return (
                <div key={req._id} className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 space-y-4 hover:border-red-200 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center shadow-soft">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <h3 className="font-bold text-mainText text-base">{req.patientName}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-primary">
                            মোট: {req.unitsRequired} ব্যাগ
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500 font-mono">
                            ID: {publicId}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={isFulfilled ? 'info' : isCancelled ? 'neutral' : req.status === 'partially_fulfilled' ? 'warning' : 'success'} 
                      size="sm" 
                      dot
                    >
                      {isFulfilled ? 'সম্পন্ন' : isCancelled ? 'বাতিল' : req.status === 'partially_fulfilled' ? 'আংশিক সম্পন্ন' : 'সক্রিয় (খোলা)'}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>সংগ্রহ: <strong className="text-emerald-700">{unitsFulfilled} ব্যাগ</strong></span>
                      <span>বাকি: <strong className="text-primary">{unitsRemaining} ব্যাগ</strong></span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFulfilled ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.round((unitsFulfilled / req.unitsRequired) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-subText space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-mainText">{req.hospitalName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{req.hospitalAddress}, {req.district}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>প্রয়োজনীয় তারিখ: {new Date(req.requiredDate).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-appBorder text-xs">
                    <Link
                      to={`/blood-request/${publicId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-primary hover:bg-primary hover:text-white rounded-lg font-semibold transition-all border border-red-200 text-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      কার্ড ও কিউআর
                    </Link>

                    {!isFulfilled && !isCancelled && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleAddReceivedBag(req._id)}
                          className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          +১ ব্যাগ প্রাপ্তি
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(req._id, 'fulfilled')}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          সম্পন্ন
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(req._id, 'cancelled')}
                        >
                          বাতিল
                        </Button>
                      </div>
                    )}

                    {isFulfilled && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>রক্ত সংগ্রহ সফল হয়েছে</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
