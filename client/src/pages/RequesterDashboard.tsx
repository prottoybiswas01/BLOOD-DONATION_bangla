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
  Sparkles
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

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await api.updateRequestStatus(id, { status });
      if (res.success) {
        setMsg({ text: 'অনুরোধের অবস্থা সফলভাবে হালনাগাদ করা হয়েছে।', type: 'success' });
        fetchMyRequests();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'হালনাগাদ ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  const openCount = requests.filter(r => r.status === 'open').length;
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
            <p className="text-xs text-subText mt-0.5">আপনার পোস্টকৃত রক্তের আবেদন ও ডোনার সংগ্রহের অগ্রগতি পরিচালনা করুন</p>
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
            {requests.map(req => (
              <div key={req._id} className="bg-surface rounded-2xl border border-appBorder shadow-soft p-5 space-y-4 hover:border-red-200 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center shadow-soft">
                      {req.bloodGroup}
                    </div>
                    <div>
                      <h3 className="font-bold text-mainText text-base">{req.patientName}</h3>
                      <p className="text-xs text-subText font-medium">{req.unitsRequired} ব্যাগ রক্ত প্রয়োজন</p>
                    </div>
                  </div>
                  <Badge 
                    variant={req.status === 'open' ? 'success' : req.status === 'fulfilled' ? 'info' : 'neutral'} 
                    size="sm" 
                    dot
                  >
                    {req.status === 'open' ? 'সক্রিয় (খোলা)' : req.status === 'fulfilled' ? 'সম্পন্ন' : req.status}
                  </Badge>
                </div>

                <div className="text-xs text-subText space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
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

                <div className="flex items-center justify-between pt-2 border-t border-appBorder text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    পোস্ট: {new Date(req.createdAt).toLocaleDateString('bn-BD')}
                  </span>

                  {req.status === 'open' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleUpdateStatus(req._id, 'fulfilled')}
                      >
                        ✓ রক্ত পাওয়া গেছে
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(req._id, 'cancelled')}
                      >
                        বাতিল
                      </Button>
                    </div>
                  )}

                  {req.status === 'fulfilled' && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>রক্ত সংগ্রহ সফল হয়েছে</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
