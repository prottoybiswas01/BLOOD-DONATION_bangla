import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { MobileApi } from '../api/client';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { BLOOD_GROUPS, BloodGroup } from '../data/bangladeshLocations';
import { APP_CONFIG } from '../api/config';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, donorProfile, token, refreshUser, logout } = useAuth();

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>((donorProfile?.bloodGroup as BloodGroup) || 'O+');
  const [division, setDivision] = useState(donorProfile?.division || 'dhaka');
  const [district, setDistrict] = useState(donorProfile?.district || 'dhaka');
  const [upazila, setUpazila] = useState(donorProfile?.upazila || '');
  const [bio, setBio] = useState(donorProfile?.bio || '');
  const [isAvailable, setIsAvailable] = useState(donorProfile?.availabilityStatus === 'available');
  const [consentContact, setConsentContact] = useState(donorProfile?.consentToShareContact ?? true);

  const [saving, setSaving] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Phone Change Modal
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneReason, setPhoneReason] = useState('');
  const [submittingPhone, setSubmittingPhone] = useState(false);
  const [pendingPhoneRequest, setPendingPhoneRequest] = useState<any | null>(null);

  // Institution Transfer Modal
  const [instModalVisible, setInstModalVisible] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [instStudentId, setInstStudentId] = useState('');
  const [instDept, setInstDept] = useState('');
  const [instReason, setInstReason] = useState('');
  const [submittingInst, setSubmittingInst] = useState(false);
  const [pendingInstRequest, setPendingInstRequest] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
    if (donorProfile) {
      setBloodGroup((donorProfile.bloodGroup as BloodGroup) || 'O+');
      setDivision(donorProfile.division);
      setDistrict(donorProfile.district);
      setUpazila(donorProfile.upazila || '');
      setBio(donorProfile.bio || '');
      setIsAvailable(donorProfile.availabilityStatus === 'available');
      setConsentContact(donorProfile.consentToShareContact ?? true);
    }

    if (token) {
      loadPendingRequests();
    }
  }, [user, donorProfile, token]);

  const loadPendingRequests = async () => {
    try {
      const [pRes, iRes, instList] = await Promise.all([
        MobileApi.getMyPhoneChangeRequest().catch(() => null),
        MobileApi.getMyInstitutionChangeRequest().catch(() => null),
        MobileApi.getInstitutions().catch(() => null)
      ]);

      if (pRes?.success && pRes.pendingRequest) {
        setPendingPhoneRequest(pRes.pendingRequest);
      }
      if (iRes?.success && iRes.pendingRequest) {
        setPendingInstRequest(iRes.pendingRequest);
      }
      if (instList?.success && instList.institutions) {
        setInstitutions(instList.institutions);
      }
    } catch {}
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('ত্রুটি', 'আপনার নাম প্রদান করুন');
      return;
    }

    setSaving(true);
    try {
      await MobileApi.updateDonorProfile({
        name: name.trim(),
        bloodGroup,
        division,
        district,
        upazila: upazila.trim(),
        bio: bio.trim(),
        availabilityStatus: isAvailable ? 'available' : 'unavailable',
        consentToShareContact: consentContact
      });
      await refreshUser();
      Alert.alert('সফল', 'প্রোফাইল তথ্য সফলভাবে হালনাগাদ হয়েছে।');
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneChangeSubmit = async () => {
    const cleanPhone = newPhone.replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      Alert.alert('ত্রুটি', '১১ ডিজিটের সঠিক মোবাইল নম্বর দিন');
      return;
    }
    if (!phoneReason.trim()) {
      Alert.alert('ত্রুটি', 'নম্বর পরিবর্তনের কারণ উল্লেখ করুন');
      return;
    }

    setSubmittingPhone(true);
    try {
      const res = await MobileApi.requestPhoneChange(cleanPhone, phoneReason.trim());
      setPendingPhoneRequest(res.request);
      setPhoneModalVisible(false);
      setNewPhone('');
      setPhoneReason('');
      Alert.alert('আবেদন গৃহীত', 'নম্বর পরিবর্তনের আবেদন জমা হয়েছে। মডারেটর যাচাই করার পর নম্বর পরিবর্তন হবে।');
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'আবেদন জমা দেওয়া সম্ভব হয়নি');
    } finally {
      setSubmittingPhone(false);
    }
  };

  const handleInstChangeSubmit = async () => {
    if (!selectedInstId) {
      Alert.alert('ত্রুটি', 'শিক্ষা প্রতিষ্ঠান নির্বাচন করুন');
      return;
    }
    if (!instReason.trim()) {
      Alert.alert('ত্রুটি', 'প্রতিষ্ঠান পরিবর্তনের কারণ উল্লেখ করুন');
      return;
    }

    setSubmittingInst(true);
    try {
      const res = await MobileApi.requestInstitutionChange(
        selectedInstId,
        instStudentId.trim() || undefined,
        instDept.trim() || undefined,
        instReason.trim()
      );
      setPendingInstRequest(res.request);
      setInstModalVisible(false);
      setInstReason('');
      Alert.alert('আবেদন গৃহীত', 'ক্যাম্পাস পরিবর্তনের আবেদন জমা হয়েছে।');
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে');
    } finally {
      setSubmittingInst(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'লগআউট',
      'আপনি কি নিশ্চিত যে লগআউট করতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'হ্যাঁ, লগআউট',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('MainTabs');
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Header title="আমার প্রোফাইল" subtitle="রক্তদাতা ও সদস্য অ্যাকাউন্ট" />
        <View style={styles.loggedOutBox}>
          <Ionicons name="person-circle-outline" size={72} color={colors.textLight} />
          <Text style={styles.loggedOutTitle}>লগইন করা নেই</Text>
          <Text style={styles.loggedOutSub}>
            আপনার প্রোফাইল দেখতে ও রক্তদানের তথ্য পরিচালনা করতে লগইন করুন
          </Text>
          <Button
            title="লগইন করুন"
            onPress={() => navigation.navigate('Login')}
            variant="primary"
            style={{ width: '80%', marginTop: 16 }}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: 14 }}
          >
            <Text style={styles.registerLink}>অ্যাকাউন্ট নেই? নতুন নিবন্ধন করুন</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'সুপার অ্যাডমিন',
    ADMIN: 'অ্যাডমিন',
    DIVISION_COORDINATOR: 'বিভাগীয় সমন্বয়ক',
    INSTITUTION_HEAD: 'ক্যাম্পাস প্রধান',
    INSTITUTION_MODERATOR: 'ক্যাম্পাস মডারেটর',
    DONOR: 'নিয়মিত রক্তদাতা',
    REQUESTER: 'রক্তগ্রহীতা'
  };

  return (
    <View style={styles.container}>
      <Header
        title="আমার প্রোফাইল"
        subtitle={user.phone}
        rightComponent={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutTopBtn}>
            <Ionicons name="log-out-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Status Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{bloodGroup}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
              <View style={styles.badgeRow}>
                <Badge
                  label={roleLabels[user.role] || user.role}
                  variant="primary"
                  style={{ marginRight: 6 }}
                />
                <Badge
                  label={user.status === 'ACTIVE' ? 'সক্রিয়' : user.status}
                  variant={user.status === 'ACTIVE' ? 'success' : 'warning'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Dashboard Navigation Buttons for Admin/Mod */}
        {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
          <TouchableOpacity
            style={styles.adminActionBanner}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <Ionicons name="shield-checkmark" size={24} color={colors.surface} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.adminBannerTitle}>অ্যাডমিন প্যানেল</Text>
              <Text style={styles.adminBannerSub}>ইউজার নিয়ন্ত্রণ ও প্রতিষ্ঠান অনুমোদন পরিচালনা</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.surface} />
          </TouchableOpacity>
        )}

        {(user.role === 'INSTITUTION_MODERATOR' || user.role === 'INSTITUTION_HEAD') && (
          <TouchableOpacity
            style={styles.modActionBanner}
            onPress={() => navigation.navigate('ModeratorDashboard')}
          >
            <Ionicons name="school" size={24} color={colors.surface} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.adminBannerTitle}>মডারেটর প্যানেল</Text>
              <Text style={styles.adminBannerSub}>ক্যাম্পাস ডোনার তালিকা ও নম্বর পরিবর্তন আবেদন</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.surface} />
          </TouchableOpacity>
        )}

        {/* Availability Switch */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.switchTitle}>জরুরি রক্তদানে প্রস্তুত</Text>
              <Text style={styles.switchSub}>
                {isAvailable
                  ? 'আপনার স্ট্যাটাস বর্তমানে সক্রিয়। অন্যেরা আপনাকে রক্তদানের জন্য ফোন করতে পারবেন।'
                  : 'আপনি বর্তমানে রক্তদানের জন্য প্রস্তুত নন। সার্চ তালিকায় আপনার নম্বর লুকানো থাকবে।'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isAvailable ? colors.primary : '#ccc'}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 12 }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.switchTitle}>যোগাযোগের সম্মতি</Text>
              <Text style={styles.switchSub}>
                অনুমোদিত ব্যবহারকারীদের জরুরি মুহূর্তে আপনার মোবাইল নম্বর প্রদর্শন করতে সম্মতি দিন
              </Text>
            </View>
            <Switch
              value={consentContact}
              onValueChange={setConsentContact}
              trackColor={{ false: colors.border, true: colors.tealLight }}
              thumbColor={consentContact ? colors.teal : '#ccc'}
            />
          </View>
        </View>

        {/* Edit Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ব্যক্তিগত তথ্য হালনাগাদ</Text>

          <Text style={styles.label}>সম্পূর্ণ নাম</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="আপনার নাম"
          />

          <Text style={styles.label}>রক্তের গ্রুপ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
            {BLOOD_GROUPS.map((bg) => (
              <TouchableOpacity
                key={bg}
                style={[styles.bgChip, bloodGroup === bg && styles.bgChipSelected]}
                onPress={() => setBloodGroup(bg)}
              >
                <Text style={[styles.bgChipText, bloodGroup === bg && styles.bgChipTextSelected]}>
                  {bg}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>এলাকা ও জেলা</Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => setLocationModalVisible(true)}
          >
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.locationSelectorText}>
              {district ? `${district.toUpperCase()}, ${division.toUpperCase()}` : 'জেলা নির্বাচন করুন'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textLight} />
          </TouchableOpacity>

          <Text style={styles.label}>উপজেলা / থানা</Text>
          <TextInput
            style={styles.input}
            value={upazila}
            onChangeText={setUpazila}
            placeholder="উপজেলা বা থানার নাম"
          />

          <Text style={styles.label}>পরিচিতি বা নোট (ঐচ্ছিক)</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            value={bio}
            onChangeText={setBio}
            placeholder="রক্তদান সংক্রান্ত যে কোনো তথ্য..."
            multiline
          />

          <Button
            title="তথ্য সংরক্ষণ করুন"
            onPress={handleSaveProfile}
            loading={saving}
            variant="primary"
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Security & System Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>অ্যাকাউন্ট ও নিরাপত্তা</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setPhoneModalVisible(true)}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.actionRowTitle}>মোবাইল নম্বর পরিবর্তন আবেদন</Text>
              <Text style={styles.actionRowSub}>
                {pendingPhoneRequest
                  ? `একটি আবেদন প্রক্রিয়াধীন রয়েছে (${pendingPhoneRequest.newPhone})`
                  : 'সঠিক পরিচয় যাচাইয়ের পর মডারেটর নম্বর আপডেট করবেন'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderTopWidth: 1, borderTopColor: colors.border }]}
            onPress={() => setInstModalVisible(true)}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.tealLight }]}>
              <Ionicons name="school-outline" size={20} color={colors.teal} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.actionRowTitle}>শিক্ষা প্রতিষ্ঠান পরিবর্তন আবেদন</Text>
              <Text style={styles.actionRowSub}>
                {pendingInstRequest
                  ? 'প্রতিষ্ঠান পরিবর্তনের আবেদন প্রক্রিয়াধীন'
                  : 'অন্য ক্যাম্পাস বা প্রতিষ্ঠানে স্থানান্তর আবেদন করুন'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <Button
          title="লগআউট করুন"
          onPress={handleLogout}
          variant="outline"
          style={{ marginVertical: 18 }}
        />

        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
            অ্যাপ সংস্করণ: v{APP_CONFIG.version} (Build {APP_CONFIG.buildNumber})
          </Text>
        </View>
      </ScrollView>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        selectedDivision={division}
        selectedDistrict={district}
        onSelect={(div, dist) => {
          setDivision(div);
          setDistrict(dist);
        }}
      />

      {/* Phone Change Modal */}
      <Modal visible={phoneModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নম্বর পরিবর্তনের আবেদন</Text>
            <Text style={styles.modalSub}>
              অ্যাকাউন্টের নিরাপত্তার স্বার্থে নম্বর সরাসরি পরিবর্তনযোগ্য নয়। আবেদনটি মডারেটর কর্তৃক অনুমোদনের পর হালনাগাদ হবে।
            </Text>

            <Text style={styles.label}>নতুন মোবাইল নম্বর</Text>
            <TextInput
              style={styles.input}
              placeholder="01XXXXXXXXX"
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={setNewPhone}
            />

            <Text style={styles.label}>নম্বর পরিবর্তনের কারণ</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              placeholder="সঠিক কারণ উল্লেখ করুন..."
              multiline
              value={phoneReason}
              onChangeText={setPhoneReason}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="বাতিল"
                variant="outline"
                onPress={() => setPhoneModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="জমা দিন"
                variant="primary"
                loading={submittingPhone}
                onPress={handlePhoneChangeSubmit}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Campus Transfer Modal */}
      <Modal visible={instModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ক্যাম্পাস পরিবর্তনের আবেদন</Text>

            <Text style={styles.label}>নতুন প্রতিষ্ঠান নির্বাচন করুন</Text>
            <ScrollView style={{ maxHeight: 120, marginVertical: 6 }}>
              {institutions.map((inst) => (
                <TouchableOpacity
                  key={inst._id || inst.id}
                  style={[
                    styles.instItem,
                    selectedInstId === (inst._id || inst.id) && styles.instItemSelected
                  ]}
                  onPress={() => setSelectedInstId(inst._id || inst.id)}
                >
                  <Text
                    style={[
                      styles.instItemText,
                      selectedInstId === (inst._id || inst.id) && { color: colors.primary, fontWeight: '700' }
                    ]}
                  >
                    {inst.name} ({inst.district})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>স্টুডেন্ট / স্টাফ আইডি (যদি থাকে)</Text>
            <TextInput
              style={styles.input}
              placeholder="যেমন: 2021-1-60-..."
              value={instStudentId}
              onChangeText={setInstStudentId}
            />

            <Text style={styles.label}>স্থানান্তরের কারণ</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              placeholder="স্থানান্তরের সুনির্দিষ্ট কারণ লিখুন..."
              multiline
              value={instReason}
              onChangeText={setInstReason}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="বাতিল"
                variant="outline"
                onPress={() => setInstModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="আবেদন করুন"
                variant="teal"
                loading={submittingInst}
                onPress={handleInstChangeSubmit}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  logoutTopBtn: {
    padding: 6,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  loggedOutBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loggedOutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12
  },
  loggedOutSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20
  },
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'
  },
  profileHeaderCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800'
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  userPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  adminActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12
  },
  modActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12
  },
  adminBannerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  },
  adminBannerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2
  },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  switchSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 17
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 5
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
  bgChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.pageBackground,
    marginRight: 8
  },
  bgChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  bgChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary
  },
  bgChipTextSelected: {
    color: '#fff'
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pageBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12
  },
  locationSelectorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  actionRowSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
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
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
    marginBottom: 8
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 18
  },
  instItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6
  },
  instItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  },
  instItemText: {
    fontSize: 13,
    color: colors.textPrimary
  }
});
