import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Linking,
  ActivityIndicator
} from 'react-native';
import QRCode from 'qrcode';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export interface NativeBloodRequestData {
  _id?: string;
  publicId?: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  unitsFulfilled?: number;
  hospitalName: string;
  hospitalAddress?: string;
  division?: string;
  district?: string;
  requiredDate?: string;
  requiredWithin?: string;
  urgencyLevel?: string;
  contactPersonName?: string;
  contactNumber: string;
  alternativeContactNumber?: string;
  reason?: string;
  additionalNotes?: string;
  status?: string;
  createdAt?: string;
}

interface NativeDigitalCardProps {
  request: NativeBloodRequestData;
  onClose?: () => void;
}

export const NativeDigitalCard: React.FC<NativeDigitalCardProps> = ({ request, onClose }) => {
  const publicId = request.publicId || request._id || 'BR-EMERGENCY';
  const canonicalUrl = `https://blood-donationbangla.vercel.app/blood-request/${publicId}`;
  const defaultQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(canonicalUrl)}&color=991B1B&bgcolor=FFFFFF`;

  const [qrUri, setQrUri] = useState<string>(defaultQrUrl);
  const [qrLoading, setQrLoading] = useState(false);

  const unitsRequired = request.unitsRequired || 1;
  const unitsFulfilled = request.unitsFulfilled || 0;
  const unitsRemaining = Math.max(0, unitsRequired - unitsFulfilled);
  const isFulfilled = request.status === 'fulfilled' || unitsRemaining === 0;

  useEffect(() => {
    // Ensure qrUri is always fresh for canonicalUrl
    const newQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(canonicalUrl)}&color=991B1B&bgcolor=FFFFFF`;
    setQrUri(newQrUrl);
  }, [canonicalUrl]);

  const handleShare = async () => {
    try {
      const shareMsg = `🩸 জরুরি রক্তের আবেদন (${request.bloodGroup})
রোগী: ${request.patientName}
হাসপাতাল: ${request.hospitalName}, ${request.district || ''}
প্রয়োজন: ${unitsRequired} ব্যাগ (${unitsRemaining} ব্যাগ অবশিষ্ট)
জরুরি যোগাযোগ: ${request.contactNumber}
লাইভ স্ট্যাটাস ও ডিজিটাল কার্ড দেখতে স্ক্যান বা ক্লিক করুন:
${canonicalUrl}`;

      await Share.share({
        message: shareMsg,
        title: `জরুরি রক্তের আবেদন: ${request.bloodGroup}`
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  const handleCall = () => {
    if (request.contactNumber) {
      Linking.openURL(`tel:${request.contactNumber}`);
    }
  };

  const handleOpenBrowser = () => {
    Linking.openURL(canonicalUrl);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Banner Header */}
      <View style={[styles.headerBanner, isFulfilled && styles.headerBannerFulfilled]}>
        <View style={styles.headerRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="water" size={16} color="#FFFFFF" />
            <Text style={styles.logoBadgeText}>বাংলাদেশ রক্তদান</Text>
          </View>
          <View style={styles.publicIdPill}>
            <Text style={styles.publicIdText}>{publicId}</Text>
          </View>
        </View>

        <Text style={styles.cardHeaderTitle}>
          {isFulfilled ? 'রক্ত সংগ্রহ সম্পন্ন হয়েছে' : 'জরুরি রক্তের ডিজিটাল রিকোয়েস্ট কার্ড'}
        </Text>
      </View>

      {/* Main Body */}
      <View style={styles.body}>
        {/* Patient & Blood Group Highlight */}
        <View style={styles.heroRow}>
          <View style={styles.bloodGroupCircle}>
            <Text style={styles.bloodGroupText}>{request.bloodGroup}</Text>
            <Text style={styles.bloodGroupSubText}>{unitsRequired} ব্যাগ</Text>
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.patientName}>{request.patientName}</Text>
            <View style={styles.urgencyBadge}>
              <Ionicons 
                name={isFulfilled ? "checkmark-circle" : "alert-circle"} 
                size={13} 
                color={isFulfilled ? "#059669" : "#DC2626"} 
              />
              <Text style={[styles.urgencyBadgeText, isFulfilled && { color: '#059669' }]}>
                {isFulfilled 
                  ? 'সংগ্রহ সম্পন্ন' 
                  : request.urgencyLevel === 'critical' 
                    ? 'মুমূর্ষু অবস্থা (জরুরি)' 
                    : 'জরুরি রক্তের প্রয়োজন'}
              </Text>
            </View>
            <Text style={styles.reasonText} numberOfLines={2}>
              {request.reason || 'জরুরি চিকিৎসার জন্য নির্ধারিত সময়ে রক্ত প্রয়োজন।'}
            </Text>
          </View>
        </View>

        {/* Units Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>রক্ত সংগ্রহের অগ্রগতি:</Text>
            <Text style={styles.progressCount}>
              {unitsFulfilled} / {unitsRequired} ব্যাগ (বাকি {unitsRemaining} ব্যাগ)
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${Math.min(100, Math.round((unitsFulfilled / unitsRequired) * 100))}%` },
                isFulfilled && { backgroundColor: '#10B981' }
              ]} 
            />
          </View>
        </View>

        {/* Location & Contact Information Grid */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="business" size={16} color={Colors.primary} style={styles.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>হাসপাতাল ও ঠিকানা</Text>
              <Text style={styles.infoValue}>
                {request.hospitalName}
                {request.hospitalAddress ? `, ${request.hospitalAddress}` : ''}
                {request.district ? ` (${request.district})` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={16} color="#059669" style={styles.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>জরুরি যোগাযোগ</Text>
              <Text style={[styles.infoValue, styles.contactHighlight]}>
                {request.contactNumber} {request.contactPersonName ? `(${request.contactPersonName})` : ''}
              </Text>
            </View>
          </View>

          {request.requiredDate && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color="#D97706" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>প্রয়োজনীয় সময়</Text>
                <Text style={styles.infoValue}>
                  {request.requiredDate} {request.requiredWithin ? `• ${request.requiredWithin}` : ''}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrWrapper}>
            <Image 
              source={{ uri: qrUri }} 
              style={styles.qrImage}
              onLoadStart={() => setQrLoading(true)}
              onLoadEnd={() => setQrLoading(false)}
            />
            {qrLoading && (
              <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }]}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.qrInfo}>
            <Text style={styles.qrTitle}>লাইভ কিউআর কোড</Text>
            <Text style={styles.qrSubtitle}>
              ফোনের ক্যামেরা দিয়ে স্ক্যান করলেই সরাসরি এই রোগীর লাইভ পেজ ওপেন হবে।
            </Text>
            <TouchableOpacity onPress={handleOpenBrowser} style={styles.linkRow}>
              <Text style={styles.linkText} numberOfLines={1}>
                {canonicalUrl}
              </Text>
              <Ionicons name="open-outline" size={12} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.callBtnText}>কল দিন</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={16} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>শেয়ার কার্ড</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.browserBtn} onPress={handleOpenBrowser}>
            <Ionicons name="globe-outline" size={16} color={Colors.mainText} />
          </TouchableOpacity>
        </View>

        {onClose && (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>বন্ধ করুন</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginVertical: 10,
  },
  headerBanner: {
    backgroundColor: '#B91C1C', // Rich Crimson Red
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  headerBannerFulfilled: {
    backgroundColor: '#047857', // Emerald Green
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  publicIdPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  publicIdText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  cardHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    padding: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 14,
  },
  bloodGroupCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodGroupText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#B91C1C',
  },
  bloodGroupSubText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991B1B',
  },
  heroInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  urgencyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  reasonText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  progressContainer: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  progressCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  infoSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 1,
  },
  contactHighlight: {
    color: '#059669',
    fontWeight: '800',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    gap: 12,
  },
  qrWrapper: {
    width: 76,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 2,
  },
  qrImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
  },
  qrInfo: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  qrSubtitle: {
    fontSize: 10,
    color: '#7F1D1D',
    lineHeight: 14,
    marginBottom: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  linkText: {
    fontSize: 9.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  browserBtn: {
    padding: 11,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    marginTop: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});

