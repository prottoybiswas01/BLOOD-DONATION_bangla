import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Badge } from './Badge';

export interface BloodRequestItem {
  _id: string;
  publicId?: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  unitsFulfilled?: number;
  hospitalName: string;
  hospitalAddress?: string;
  district: string;
  division: string;
  urgencyLevel: 'emergency' | 'critical' | 'urgent' | 'standard' | 'normal';
  contactPersonName?: string;
  contactNumber: string;
  requiredDate?: string;
  requiredWithin?: string;
  reason?: string;
  status?: string;
}

interface BloodRequestCardProps {
  request: BloodRequestItem;
  onPressCard?: (request: BloodRequestItem) => void;
}

export const BloodRequestCard: React.FC<BloodRequestCardProps> = ({ request, onPressCard }) => {
  const handleCall = () => {
    if (request.contactNumber) {
      Linking.openURL(`tel:${request.contactNumber}`).catch(() => {
        Alert.alert('ত্রুটি', 'সরাসরি কল সংযোগ করা সম্ভব হয়নি।');
      });
    }
  };

  const getUrgencyBadge = () => {
    if (request.urgencyLevel === 'critical' || request.urgencyLevel === 'emergency') {
      return <Badge variant="danger" size="sm">মুমূর্ষু (Critical)</Badge>;
    }
    if (request.urgencyLevel === 'urgent') {
      return <Badge variant="warning" size="sm">জরুরি (Urgent)</Badge>;
    }
    return <Badge variant="info" size="sm">নিয়মিত</Badge>;
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.leftGroup}>
          <View style={styles.bloodTag}>
            <Text style={styles.bloodText}>{request.bloodGroup}</Text>
          </View>
          <View style={styles.titleInfo}>
            <Text style={styles.patientName} numberOfLines={1}>
              রোগী: {request.patientName}
            </Text>
            <Text style={styles.unitsText}>
              প্রয়োজন: <Text style={{ fontWeight: '800', color: Colors.primary }}>{request.unitsRequired} ব্যাগ</Text>
            </Text>
          </View>
        </View>

        <View>{getUrgencyBadge()}</View>
      </View>

      <View style={styles.body}>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={14} color={Colors.subText} style={styles.detailIcon} />
          <Text style={styles.detailText} numberOfLines={1}>
            {request.hospitalName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={Colors.subText} style={styles.detailIcon} />
          <Text style={styles.detailText} numberOfLines={1}>
            {request.district}, {request.division}
          </Text>
        </View>

        {request.reason && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText} numberOfLines={2}>
              "{request.reason}"
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCall}
          style={[styles.callButton, { flex: 1, marginRight: onPressCard ? 8 : 0 }]}
        >
          <Ionicons name="call" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.callButtonText} numberOfLines={1}>
            কল করুন ({request.contactNumber})
          </Text>
        </TouchableOpacity>

        {onPressCard && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPressCard(request)}
            style={styles.qrButton}
          >
            <Ionicons name="qr-code-outline" size={15} color={Colors.primary} style={{ marginRight: 5 }} />
            <Text style={styles.qrButtonText}>ডিজিটাল কার্ড</Text>
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.appBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  bloodTag: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  titleInfo: {
    marginLeft: 10,
    flex: 1,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.mainText,
  },
  unitsText: {
    fontSize: 11.5,
    color: Colors.subText,
    marginTop: 2,
  },
  body: {
    paddingVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 12,
    color: Colors.mainText,
    fontWeight: '500',
    flex: 1,
  },
  reasonBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  reasonText: {
    fontSize: 11,
    color: '#334155',
    fontStyle: 'italic',
  },
  footer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  qrButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
