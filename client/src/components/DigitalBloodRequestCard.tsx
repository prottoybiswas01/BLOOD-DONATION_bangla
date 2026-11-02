import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Heart, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  MapPin, 
  Building2, 
  Calendar, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { BloodRequest } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface DigitalBloodRequestCardProps {
  request: BloodRequest;
  onClose?: () => void;
  showActions?: boolean;
}

export const DigitalBloodRequestCard: React.FC<DigitalBloodRequestCardProps> = ({
  request,
  onClose,
  showActions = true
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const publicId = request.publicId || request._id;
  const canonicalUrl = `https://blood-donationbangla.vercel.app/blood-request/${publicId}`;
  const unitsRemaining = Math.max(0, request.unitsRequired - (request.unitsFulfilled || 0));

  useEffect(() => {
    QRCode.toDataURL(canonicalUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#991B1B', // Deep red QR code
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation failed:', err));
  }, [canonicalUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    const title = `জরুরি রক্তের আবেদন: ${request.bloodGroup} রক্ত প্রয়োজন`;
    const text = `রোগী: ${request.patientName}\nহাসপাতাল: ${request.hospitalName}, ${request.district}\nরক্তের গ্রুপ: ${request.bloodGroup} (${request.unitsRequired} ব্যাগ)\nজরুরি যোগাযোগ: ${request.contactNumber}\nবিস্তারিত লাইভ স্ট্যাটাস দেখতে ভিজিট করুন:\n${canonicalUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: canonicalUrl });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
    }
  };

  const handleDownloadPNG = async () => {
    setDownloading(true);
    try {
      // Create high-res canvas (1200x1600) for sharp print and social sharing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = 2;
      canvas.width = 600 * scale;
      canvas.height = 800 * scale;
      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 600, 800);

      // Red Header Bar
      const headerGrad = ctx.createLinearGradient(0, 0, 600, 130);
      headerGrad.addColorStop(0, '#B91C1C'); // Red-700
      headerGrad.addColorStop(1, '#991B1B'); // Red-800
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, 600, 130);

      // Top Header Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('বাংলাদেশ রক্তদান প্ল্যাটফর্ম', 300, 42);

      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('Bangladesh Blood Donation Platform • জরুরি রক্তের আবেদন কার্ড', 300, 66);

      // Urgent Ribbon
      ctx.fillStyle = request.status === 'fulfilled' ? '#059669' : '#DC2626';
      ctx.beginPath();
      ctx.roundRect(160, 85, 280, 32, 16);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      const statusTitle = request.status === 'fulfilled' 
        ? '✓ রক্ত সংগ্রহ সম্পন্ন (Fulfilled)' 
        : (request.urgencyLevel === 'emergency' ? '🚨 মুমূর্ষু রোগীর জন্য জরুরি আবেদন' : '⚠️ জরুরি রক্তের প্রয়োজন');
      ctx.fillText(statusTitle, 300, 106);

      // Blood Group Huge Circle Badge
      ctx.beginPath();
      ctx.arc(300, 205, 55, 0, Math.PI * 2);
      ctx.fillStyle = '#FEF2F2';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#DC2626';
      ctx.stroke();

      ctx.fillStyle = '#DC2626';
      ctx.font = '900 46px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(request.bloodGroup, 300, 222);

      // Units Badge
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`প্রয়োজন: ${request.unitsRequired} ব্যাগ রক্ত`, 300, 285);

      if (request.status === 'partially_fulfilled') {
        ctx.fillStyle = '#D97706';
        ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`(সংগৃহীত: ${request.unitsFulfilled} ব্যাগ • এখনও প্রয়োজন: ${unitsRemaining} ব্যাগ)`, 300, 310);
      } else if (request.status === 'fulfilled') {
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`সকল ${request.unitsRequired} ব্যাগ রক্ত সংগ্রহ সম্পন্ন হয়েছে`, 300, 310);
      }

      // Divider Line
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 330);
      ctx.lineTo(560, 330);
      ctx.stroke();

      // Info Table
      ctx.textAlign = 'left';
      let y = 365;

      const drawInfoRow = (label: string, value: string) => {
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
        ctx.fillText(label, 45, y);

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        ctx.fillText(value, 180, y);
        y += 32;
      };

      drawInfoRow('রোগীর নাম:', request.patientName);
      drawInfoRow('হাসপাতাল:', request.hospitalName);
      drawInfoRow('ঠিকানা ও জেলা:', `${request.hospitalAddress}, ${request.district}`);
      drawInfoRow('রক্তদানের তারিখ:', new Date(request.requiredDate).toLocaleDateString('bn-BD'));
      drawInfoRow('যোগাযোগ:', `${request.contactNumber} ${request.contactPersonName ? `(${request.contactPersonName})` : ''}`);

      if (request.reason) {
        drawInfoRow('রোগীর অবস্থা:', request.reason.slice(0, 45));
      }

      // QR Code Block Box
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.roundRect(40, 565, 520, 175, 16);
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw QR Image inside Box
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((res) => {
          qrImg.onload = res;
        });
        ctx.drawImage(qrImg, 60, 580, 145, 145);
      }

      // QR Text
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText('লাইভ স্ট্যাটাস দেখতে স্ক্যান করুন', 225, 615);

      ctx.fillStyle = '#64748B';
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillText('এই কিউআর কোড স্ক্যান করলে সরাসরি রোগীর বর্তমান', 225, 642);
      ctx.fillText('লাইভ রক্ত সংগ্রহের সর্বশেষ অগ্রগতি দেখা যাবে।', 225, 662);

      ctx.fillStyle = '#B91C1C';
      ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`অনুরোধ আইডি: ${publicId}`, 225, 695);

      // Card Footer
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ওয়েবসাইট: blood-donationbangla.vercel.app • নিঃস্বার্থ স্বেচ্ছাসেবী রক্তদান উদ্যোগ', 300, 775);

      // Download
      const link = document.createElement('a');
      link.download = `Blood-Request-${request.bloodGroup}-${publicId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Digital Card Preview */}
      <div 
        ref={cardRef}
        className="max-w-lg mx-auto bg-surface rounded-3xl border-2 border-red-100 shadow-elevated overflow-hidden text-mainText"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-700 via-primary to-red-800 text-white p-5 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-red-200 fill-white" />
            <h3 className="font-black text-lg sm:text-xl tracking-tight">বাংলাদেশ রক্তদান প্ল্যাটফর্ম</h3>
          </div>
          <p className="text-xs text-red-100 font-medium">
            জরুরি ডিজিটাল রক্তের আবেদন কার্ড • Live Status Tracking
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white text-primary shadow-soft">
            {request.status === 'fulfilled' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">রক্ত সংগ্রহ সম্পন্ন (Fulfilled)</span>
              </>
            ) : request.urgencyLevel === 'emergency' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>🚨 মুমূর্ষু রোগীর জরুরি আবেদন</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>⚠️ জরুরি রক্তের প্রয়োজন</span>
              </>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Blood Group and Units Highlight */}
          <div className="flex items-center justify-between bg-red-50/70 p-4 rounded-2xl border border-red-100">
            <div className="space-y-1">
              <span className="text-xs font-bold text-subText">প্রয়োজনীয় রক্তের গ্রুপ</span>
              <div className="text-4xl font-black text-primary tracking-tight">
                {request.bloodGroup}
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs font-bold text-subText">মোট রক্তের পরিমাণ</span>
              <div className="text-2xl font-black text-mainText">
                {request.unitsRequired} ব্যাগ
              </div>
              {request.status === 'partially_fulfilled' && (
                <span className="text-xs font-bold text-amber-600 block">
                  (সংগৃহীত: {request.unitsFulfilled} | অবশিষ্ট: {unitsRemaining})
                </span>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-subText block font-medium">রোগীর নাম</span>
                <span className="font-bold text-mainText">{request.patientName}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-subText block font-medium">হাসপাতাল ও ঠিকানা</span>
                <span className="font-bold text-mainText">{request.hospitalName}</span>
                <p className="text-xs text-subText">{request.hospitalAddress}, {request.district}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-subText block font-medium">রক্তদানের তারিখ ও সময়</span>
                <span className="font-bold text-mainText">
                  {new Date(request.requiredDate).toLocaleDateString('bn-BD')} {request.requiredWithin ? `(${request.requiredWithin})` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-subText block font-medium">জরুরি যোগাযোগের মোবাইল</span>
                <a 
                  href={`tel:${request.contactNumber}`} 
                  className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1.5"
                >
                  {request.contactNumber}
                  {request.contactPersonName && <span className="text-xs text-subText font-normal">({request.contactPersonName})</span>}
                </a>
              </div>
            </div>

            {request.reason && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-subText italic">
                "{request.reason}"
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-appBorder flex items-center gap-4">
            <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 shrink-0 flex items-center justify-center shadow-soft">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-bold text-mainText block">
                লাইভ স্ট্যাটাস দেখতে স্ক্যান করুন
              </span>
              <p className="text-[11px] text-subText leading-tight">
                এই কিউআর কোড স্ক্যান করলে সরাসরি রোগীর বর্তমান লাইভ রক্ত সংগ্রহের অগ্রগতি দেখা যাবে।
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-100 text-primary text-[10px] font-black tracking-wide">
                আইডি: {publicId}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-appBorder text-center">
          <p className="text-[10px] text-subText">
            বাংলাদেশ রক্তদান প্ল্যাটফর্ম • blood-donationbangla.vercel.app
          </p>
        </div>
      </div>

      {/* Action Controls */}
      {showActions && (
        <div className="max-w-lg mx-auto flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownloadPNG}
            disabled={downloading}
          >
            {downloading ? 'ডাউনলোড হচ্ছে...' : 'কার্ড ডাউনলোড করুন (PNG)'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            icon={<Share2 className="w-4 h-4" />}
            onClick={handleShare}
          >
            শেয়ার করুন
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            onClick={handleCopyLink}
          >
            {copied ? 'লিঙ্ক কপি হয়েছে!' : 'লিঙ্ক কপি করুন'}
          </Button>

          {onClose && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
            >
              বন্ধ করুন
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

