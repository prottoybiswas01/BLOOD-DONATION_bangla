import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Badge } from './Badge';

export interface DonorItem {
  _id: string;
  displayName: string;
  bloodGroup: string;
  division: string;
  district: string;
  upazila?: string;
  availabilityStatus: 'available' | 'recently_donated' | 'temporarily_unavailable';
  totalDonations?: number;
  institutionName?: string;
  emergencyAvailable?: boolean;
  consentToShareContact: boolean;
  phone?: string;
}

interface DonorCardProps {
  donor: DonorItem;
  onRevealContact?: (donor: DonorItem) => void;
  isLoggedIn?: boolean;
}

export const DonorCard: React.FC<DonorCardProps> = ({ 
  donor, 
  onRevealContact,
  isLoggedIn = false
}) => {
  const isAvailable = donor.availabilityStatus === 'available';

  const handleCall = () => {
    if (donor.phone) {
      Linking.openURL(`tel:${donor.phone}`).catch(() => {
        Alert.alert('ত্রুটি', 'সরাসরি কল সংযোগ করা সম্ভব হয়নি।');
      });
    } else if (onRevealContact) {
      onRevealContact(donor);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.bloodBadge}>
          <Text style={styles.bloodText}>{donor.bloodGroup}</Text>
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {donor.displayName}
            </Text>
            {donor.emergencyAvailable && (
              <Ionicons name="flash" size={14} color="#EA580C" style={{ marginLeft: 4 }} />
            )}
          </View>

          <Text style={styles.locationText} numberOfLines={1}>
            📍 {donor.upazila ? `${donor.upazila}, ` : ''}{donor.district}
          </Text>

          {donor.institutionName && (
            <Text style={styles.instText} numberOfLines={1}>
              🎓 {donor.institutionName}
            </Text>
          )}
        </View>

        <View style={styles.statusCol}>
          <Badge 
            variant={isAvailable ? 'success' : 'neutral'} 
            size="sm"
          >
            {isAvailable ? 'প্রস্তুত' : 'অনুপলব্ধ'}
          </Badge>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.donationCount}>
          <Text style={styles.countNumber}>
            {donor.totalDonations || 0}
          </Text>
          <Text style={styles.countLabel}> বার রক্তদান</Text>
        </View>

        {donor.phone ? (
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleCall}
            style={styles.callBtn}
          >
            <Ionicons name="call" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.callBtnText}>সরাসরি কল করুন</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleCall}
            style={styles.contactBtn}
          >
            <Ionicons name="eye-outline" size={15} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.contactBtnText}>
              {isLoggedIn ? 'নম্বর দেখুন' : 'যোগাযোগ করুন'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.appBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  bloodText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.mainText,
  },
  locationText: {
    fontSize: 11.5,
    color: Colors.subText,
    marginTop: 2,
  },
  instText: {
    fontSize: 11,
    color: Colors.tealAccent,
    fontWeight: '600',
    marginTop: 2,
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  donationCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  countLabel: {
    fontSize: 11.5,
    color: Colors.subText,
  },
  callBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  contactBtn: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  contactBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
