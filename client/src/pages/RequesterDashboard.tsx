import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, CheckCircle2, AlertCircle, Phone, MapPin, Building2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { BloodRequest } from '../types';

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
        setMsg({ text: 'অনুরোধের অবস্থা হালনাগাদ করা হয়েছে।', type: 'success' });
        fetchMyRequests();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'হালনাগাদ ব্যর্থ হয়েছে।', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mainText">আমার রক্তের অনুরোধসমূহ</h1>
          <p className="text-xs text-subText mt-1">আপনার পোস্টকৃত সকল রক্তের আবেদন ব্যবস্থাপনা করুন</p>
        </div>
        <Link
          to="/create-request"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm shadow transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>নতুন আবেদন তৈরি করুন</span>
        </Link>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${
          msg.type === 'success' ? 'bg-green-50 text-appSuccess border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(n => <div key={n} className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-appBorder p-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-mainText">আপনার কোনো রক্তের আবেদন নেই</h3>
          <p className="text-xs text-subText">রোগীর জরুরি রক্তের প্রয়োজন হলে যেকোনো সময় আবেদন তৈরি করতে পারেন।</p>
          <Link
            to="/create-request"
            className="inline-block mt-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
          >
            আবেদন করুন
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map(req => (
            <div key={req._id} className="bg-surface rounded-2xl border border-appBorder shadow-card p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold text-lg flex items-center justify-center">
                    {req.bloodGroup}
                  </div>
                  <div>
                    <h3 className="font-bold text-mainText text-base">{req.patientName}</h3>
                    <p className="text-xs text-subText">{req.unitsRequired} ব্যাগ রক্ত প্রয়োজন</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  req.status === 'open' ? 'bg-green-100 text-appSuccess' :
                  req.status === 'fulfilled' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {req.status === 'open' ? 'খোলা (সক্রিয়)' : req.status === 'fulfilled' ? 'রক্ত পাওয়া গেছে' : req.status}
                </span>
              </div>

              <div className="text-xs text-subText space-y-1 bg-gray-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-mainText">{req.hospitalName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{req.hospitalAddress}, {req.district}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-tealAccent" />
                  <span>তারিখ: {new Date(req.requiredDate).toLocaleDateString('bn-BD')}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 text-xs">
                {req.status === 'open' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(req._id, 'fulfilled')}
                      className="px-3 py-1.5 bg-appSuccess hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      ✓ রক্ত পাওয়া গেছে
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req._id, 'cancelled')}
                      className="px-3 py-1.5 border border-appBorder hover:bg-gray-100 text-subText rounded-lg transition-colors"
                    >
                      বাতিল করুন
                    </button>
                  </>
                )}
                {req.status === 'fulfilled' && (
                  <span className="text-xs text-appSuccess font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> সম্পন্ন হয়েছে
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
