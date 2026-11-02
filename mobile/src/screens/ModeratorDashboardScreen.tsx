import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MobileApi } from '../api/client';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

interface ModeratorDashboardScreenProps {
  navigation: any;
}

export const ModeratorDashboardScreen: React.FC<ModeratorDashboardScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'phones' | 'recovery' | 'transfers'>('phones');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [phoneRequests, setPhoneRequests] = useState<any[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [transferRequests, setTransferRequests] = useState<any[]>([]);

  // Action states for Phone
  const [selectedPhoneReq, setSelectedPhoneReq] = useState<any | null>(null);
  const [phoneNotes, setPhoneNotes] = useState('');
  const [submittingPhone, setSubmittingPhone] = useState(false);

  // Action states for Password Recovery
  const [selectedRecoveryReq, setSelectedRecoveryReq] = useState<any | null>(null);
  const [recoveryNotes, setRecoveryNotes] = useState('');
  const [submittingRecovery, setSubmittingRecovery] = useState(false);
  const [approvedOtpCreds, setApprovedOtpCreds] = useState<any | null>(null);

  // Action states for Transfer
  const [selectedTransferReq, setSelectedTransferReq] = useState<any | null>(null);
  const [transferNotes, setTransferNotes] = useState('');
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  useEffect(() => {
    loadModeratorData();
  }, []);

  const loadModeratorData = async () => {
    try {
      const [modRes, phoneRes, recRes, transRes] = await Promise.all([
        MobileApi.getModeratorDashboard().catch(() => null),
        MobileApi.getPhoneChangeRequests().catch(() => null),
        MobileApi.getPasswordRecoveryRequests().catch(() => null),
        MobileApi.getInstitutionChangeRequests().catch(() => null)
      ]);

      if (modRes?.success) {
        setDashboardData(modRes.data || modRes);
      }
      if (phoneRes?.success && phoneRes.requests) {
        setPhoneRequests(phoneRes.requests);
      }
      if (recRes?.success && recRes.requests) {
        setRecoveryRequests(recRes.requests);
      }
      if (transRes?.success && transRes.requests) {
        setTransferRequests(transRes.requests);
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'মডারেটর ডেটা লোড করা সম্ভব হয়নি');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadModeratorData();
  };

  // Review Phone
  const handleReviewPhone = async (status: 'approved' | 'rejected') => {
    if (!selectedPhoneReq) return;
    setSubmittingPhone(true);
    try {
      await MobileApi.reviewPhoneChangeRequest(
        selectedPhoneReq._id || selectedPhoneReq.id,
        status,
        phoneNotes.trim() || undefined
      );
      Alert.alert(
        'সফল',
        status === 'approved' ? 'নম্বর পরিবর্তন অনুমোদন সম্পন্ন হয়েছে' : 'আবেদনটি প্রত্যাখ্যান করা হয়েছে'
      );
      setSelectedPhoneReq(null);
      setPhoneNotes('');
      loadModeratorData();
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'পর্যালোচনা ব্যর্থ হয়েছে');
    } finally {
      setSubmittingPhone(false);
    }
  };

  // Approve Recovery Request
  const handleApproveRecovery = async () => {
    if (!selectedRecoveryReq) return;
    setSubmittingRecovery(true);
    try {
      const res = await MobileApi.approvePasswordRecoveryRequest(
        selectedRecoveryReq._id || selectedRecoveryReq.id,
        recoveryNotes.trim() || undefined
      );
      setSelectedRecoveryReq(null);
      setRecoveryNotes('');
      if (res?.temporaryPassword) {
        setApprovedOtpCreds(res);
      } else {
        Alert.alert('সফল', 'পাসওয়ার্ড রিকভারি সফলভাবে অনুমোদিত হয়েছে');
      }
      loadModeratorData();
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'রিকভারি অনুমোদন ব্যর্থ হয়েছে');
    } finally {
      setSubmittingRecovery(false);
    }
  };

  // Review Transfer
  const handleReviewTransfer = async (status: 'approved' | 'rejected') => {
    if (!selectedTransferReq) return;
    setSubmittingTransfer(true);
    try {
      await MobileApi.reviewInstitutionChangeRequest(
        selectedTransferReq._id || selectedTransferReq.id,
        status,
        transferNotes.trim() || undefined
      );
      Alert.alert('সফল', 'ক্যাম্পাস স্থানান্তর সিদ্ধান্ত সংরক্ষণ করা হয়েছে');
      setSelectedTransferReq(null);
      setTransferNotes('');
      loadModeratorData();
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'স্থানান্তর সিদ্ধান্ত ব্যর্থ হয়েছে');
    } finally {
      setSubmittingTransfer(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>মডারেটর প্যানেল প্রস্তুত হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="মডারেটর প্যানেল"
        subtitle={dashboardData?.institution?.name || 'ক্যাম্পাস ব্যবস্থাপনা'}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'phones' && styles.tabItemActive]}
          onPress={() => setActiveTab('phones')}
        >
          <Text style={[styles.tabText, activeTab === 'phones' && styles.tabTextActive]}>
            ফোন পরিবর্তন ({phoneRequests.filter(r => r.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'recovery' && styles.tabItemActive]}
          onPress={() => setActiveTab('recovery')}
        >
          <Text style={[styles.tabText, activeTab === 'recovery' && styles.tabTextActive]}>
            পাসওয়ার্ড ({recoveryRequests.filter(r => r.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'transfers' && styles.tabItemActive]}
          onPress={() => setActiveTab('transfers')}
        >
          <Text style={[styles.tabText, activeTab === 'transfers' && styles.tabTextActive]}>
            স্থানান্তর ({transferRequests.filter(r => r.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'roster' && styles.tabItemActive]}
          onPress={() => setActiveTab('roster')}
        >
          <Text style={[styles.tabText, activeTab === 'roster' && styles.tabTextActive]}>রোস্টার</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.teal]} />}
      >
        {/* Phone Requests Tab */}
        {activeTab === 'phones' && (
          <View>
            {phoneRequests.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="checkmark-circle-outline" size={48} color={colors.teal} />
                <Text style={styles.emptyText}>কোনো পেন্ডিং নম্বর পরিবর্তন আবেদন নেই</Text>
              </View>
            ) : (
              phoneRequests.map((req) => (
                <View key={req._id || req.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>{req.userName || req.userId?.name || 'শিক্ষার্থী/সদস্য'}</Text>
                    <Badge
                      label={req.status === 'pending' ? 'অপেক্ষমাণ' : req.status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
                      variant={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'outline'}
                    />
                  </View>
                  <Text style={styles.cardText}>বর্তমান নম্বর: {req.currentPhone || req.userId?.phone || '—'}</Text>
                  <Text style={[styles.cardText, { color: colors.teal, fontWeight: '700' }]}>
                    নতুন নম্বর: {req.newPhone}
                  </Text>
                  <Text style={styles.cardText}>আবেদনের কারণ: {req.reason || 'উল্লেখ নেই'}</Text>

                  {req.status === 'pending' && (
                    <Button
                      title="নম্বর পরিবর্তন যাচাই ও সিদ্ধান্ত"
                      variant="teal"
                      size="sm"
                      style={{ marginTop: 12 }}
                      onPress={() => {
                        setSelectedPhoneReq(req);
                        setPhoneNotes('');
                      }}
                    />
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Password Recovery Tab */}
        {activeTab === 'recovery' && (
          <View>
            {recoveryRequests.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="shield-checkmark-outline" size={48} color={colors.teal} />
                <Text style={styles.emptyText}>কোনো রিকভারি আবেদন জমা নেই</Text>
              </View>
            ) : (
              recoveryRequests.map((req) => (
                <View key={req._id || req.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>{req.userName || req.phone}</Text>
                    <Badge
                      label={req.status === 'pending' ? 'অপেক্ষমাণ' : req.status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
                      variant={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'outline'}
                    />
                  </View>
                  <Text style={styles.cardText}>মোবাইল নম্বর: {req.phone}</Text>
                  <Text style={styles.cardText}>কারণ: {req.reason || 'পাসওয়ার্ড ভুলে গেছি'}</Text>

                  {req.status === 'pending' && (
                    <Button
                      title="সাময়িক পাসওয়ার্ড অনুমোদন দিন"
                      variant="primary"
                      size="sm"
                      style={{ marginTop: 12 }}
                      onPress={() => {
                        setSelectedRecoveryReq(req);
                        setRecoveryNotes('');
                      }}
                    />
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Transfers Tab */}
        {activeTab === 'transfers' && (
          <View>
            {transferRequests.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="swap-horizontal-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyText}>কোনো ক্যাম্পাস স্থানান্তর আবেদন নেই</Text>
              </View>
            ) : (
              transferRequests.map((req) => (
                <View key={req._id || req.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>{req.userName || req.userId?.name || 'সদস্য'}</Text>
                    <Badge
                      label={req.status === 'pending' ? 'অপেক্ষমাণ' : req.status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
                      variant={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'outline'}
                    />
                  </View>
                  <Text style={styles.cardText}>বর্তমান ক্যাম্পাস: {req.sourceInstitutionName || '—'}</Text>
                  <Text style={[styles.cardText, { color: colors.teal, fontWeight: '700' }]}>
                    আবেদনকৃত ক্যাম্পাস: {req.targetInstitutionName || req.targetInstitutionId?.name || '—'}
                  </Text>
                  <Text style={styles.cardText}>কারণ: {req.reason || 'স্থানান্তর'}</Text>

                  {req.status === 'pending' && (
                    <Button
                      title="স্থানান্তর পর্যালোচনা করুন"
                      variant="teal"
                      size="sm"
                      style={{ marginTop: 12 }}
                      onPress={() => {
                        setSelectedTransferReq(req);
                        setTransferNotes('');
                      }}
                    />
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Campus Roster Tab */}
        {activeTab === 'roster' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>ক্যাম্পাস ডোনার তথ্য</Text>
              <Text style={styles.cardText}>
                মোট অনুমোদিত সদস্য: {dashboardData?.membersCount ?? dashboardData?.roster?.length ?? '—'}
              </Text>
              <Text style={styles.cardText}>
                জরুরি প্রয়োজনে প্রস্তুত রক্তদাতা: {dashboardData?.activeDonorsCount ?? '—'}
              </Text>
            </View>
            {dashboardData?.roster && dashboardData.roster.map((m: any) => (
              <View key={m._id || m.id} style={styles.card}>
                <Text style={styles.cardTitle}>{m.name}</Text>
                <Text style={styles.cardText}>রক্তের গ্রুপ: {m.bloodGroup} • ফোন: {m.phone}</Text>
                <Text style={styles.cardText}>বিভাগ/ডিপার্টমেন্ট: {m.department || 'সাধারণ'}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Phone Review Modal */}
      <Modal visible={!!selectedPhoneReq} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নম্বর পরিবর্তন অনুমোদন</Text>
            <Text style={styles.modalSub}>নতুন নম্বর: {selectedPhoneReq?.newPhone}</Text>

            <Text style={styles.label}>অনুমোদন বা অস্বীকৃতির মন্তব্য</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="যাচাই মন্তব্য লিখুন..."
              value={phoneNotes}
              onChangeText={setPhoneNotes}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="প্রত্যাখ্যান"
                variant="outline"
                loading={submittingPhone}
                onPress={() => handleReviewPhone('rejected')}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="অনুমোদন করুন"
                variant="teal"
                loading={submittingPhone}
                onPress={() => handleReviewPhone('approved')}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>

            <TouchableOpacity
              onPress={() => setSelectedPhoneReq(null)}
              style={{ alignItems: 'center', marginTop: 14 }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Password Recovery Approval Modal */}
      <Modal visible={!!selectedRecoveryReq} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>পাসওয়ার্ড রিকভারি অনুমোদন</Text>
            <Text style={styles.modalSub}>নম্বর: {selectedRecoveryReq?.phone}</Text>
            <Text style={styles.cardText}>
              অনুমোদন দিলে সিস্টেম থেকে একটি সাময়িক এককালীন পাসওয়ার্ড জেনারেট হবে। শিক্ষার্থীকে সরাসরি বা ফোনে পাসওয়ার্ডটি প্রদান করুন।
            </Text>

            <Text style={styles.label}>ভেরিফিকেশন নোট (ঐচ্ছিক)</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="আইডি বা পরিচয় যাচাইয়ের নোট..."
              value={recoveryNotes}
              onChangeText={setRecoveryNotes}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="বাতিল"
                variant="outline"
                onPress={() => setSelectedRecoveryReq(null)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="পাসওয়ার্ড প্রদান করুন"
                variant="primary"
                loading={submittingRecovery}
                onPress={handleApproveRecovery}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Generated OTP Modal */}
      <Modal visible={!!approvedOtpCreds} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="key" size={36} color={colors.teal} style={{ alignSelf: 'center', marginBottom: 8 }} />
            <Text style={[styles.modalTitle, { textAlign: 'center' }]}>সাময়িক পাসওয়ার্ড তৈরি হয়েছে</Text>
            <Text style={[styles.modalSub, { textAlign: 'center', marginBottom: 16 }]}>
              মোবাইল নম্বর: {approvedOtpCreds?.phone}
            </Text>

            <View style={styles.otpBox}>
              <Text style={styles.otpText}>{approvedOtpCreds?.temporaryPassword}</Text>
            </View>

            <Text style={[styles.cardText, { textAlign: 'center', marginVertical: 12 }]}>
              এই পাসওয়ার্ডটি ব্যবহারকারীকে দিন। প্রথমবার লগইন করলেই তাকে নতুন গোপন পাসওয়ার্ড সেট করতে হবে।
            </Text>

            <Button
              title="সম্পন্ন"
              variant="teal"
              onPress={() => setApprovedOtpCreds(null)}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* Transfer Review Modal */}
      <Modal visible={!!selectedTransferReq} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>স্থানান্তর আবেদন পর্যালোচনা</Text>
            <Text style={styles.modalSub}>
              আবেদনকারী: {selectedTransferReq?.userName || 'সদস্য'}
            </Text>

            <Text style={styles.label}>সিদ্ধান্ত বা নোট</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="অনুমোদন বা প্রত্যাখ্যানের কারণ..."
              value={transferNotes}
              onChangeText={setTransferNotes}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="প্রত্যাখ্যান"
                variant="outline"
                loading={submittingTransfer}
                onPress={() => handleReviewTransfer('rejected')}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="অনুমোদন"
                variant="teal"
                loading={submittingTransfer}
                onPress={() => handleReviewTransfer('approved')}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>

            <TouchableOpacity
              onPress={() => setSelectedTransferReq(null)}
              style={{ alignItems: 'center', marginTop: 14 }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pageBackground
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pageBackground
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabItemActive: {
    borderBottomColor: colors.teal
  },
  tabText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  tabTextActive: {
    color: colors.teal,
    fontWeight: '700'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  cardText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 3
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6
  },
  input: {
    backgroundColor: colors.pageBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary
  },
  modalSub: {
    fontSize: 13,
    color: colors.teal,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 10
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 16
  },
  otpBox: {
    backgroundColor: colors.tealLight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.teal
  },
  otpText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.teal,
    letterSpacing: 4
  }
});
