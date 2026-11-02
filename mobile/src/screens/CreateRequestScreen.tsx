import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MobileApi } from '../api/client';
import { Button } from '../components/Button';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { NativeDigitalCard, NativeBloodRequestData } from '../components/NativeDigitalCard';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface CreateRequestScreenProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const CreateRequestScreen: React.FC<CreateRequestScreenProps> = ({ 
  onSuccess,
  onNavigateLogin
}) => {
  const { user } = useAuth();
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsRequired, setUnitsRequired] = useState('1');
  const [hospitalName, setHospitalName] = useState('');
  const [division, setDivision] = useState(user?.division || 'dhaka');
  const [district, setDistrict] = useState(user?.district || 'dhaka');
  const [districtNameBn, setDistrictNameBn] = useState('ঢাকা');
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'urgent' | 'critical'>('urgent');
  const [contactPersonName, setContactPersonName] = useState(user?.name || '');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [consentForPublicShare, setConsentForPublicShare] = useState(true);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<NativeBloodRequestData | null>(null);

  if (!user) {
    return (
      <View style={styles.authPromptContainer}>
        <View style={styles.authPromptCard}>
          <Ionicons name="lock-closed" size={48} color={Colors.primary} />
          <Text style={styles.authPromptTitle}>লগইন প্রয়োজন</Text>
          <Text style={styles.authPromptSub}>
            রক্তের নতুন আবেদন তৈরি করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন। এর মাধ্যমে রোগী ও রক্তদাতার নিরাপত্তা নিশ্চিত হয়।
          </Text>
          <Button
            title="লগইন করুন"
            onPress={onNavigateLogin}
            style={{ width: '100%', marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!patientName.trim()) {
      Alert.alert('ভুল তথ্য', 'অনুগ্রহ করে রোগীর নাম লিখুন।');
      return;
    }
    if (!hospitalName.trim()) {
      Alert.alert('ভুল তথ্য', 'হাসপাতাল বা ক্লিনিকের নাম লিখুন।');
      return;
    }
    const cleanPhone = contactNumber.replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      Alert.alert('ভুল তথ্য', 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!consentForPublicShare) {
      Alert.alert('সম্মতি প্রয়োজন', 'জরুরি রক্তদাতা অনুসন্ধানে যোগাযোগের সম্মতি দিন।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await MobileApi.createBloodRequest({
        patientName: patientName.trim(),
        bloodGroup,
        unitsRequired: parseInt(unitsRequired, 10) || 1,
        hospitalName: hospitalName.trim(),
        division,
        district,
        urgencyLevel,
        contactPersonName: contactPersonName.trim() || user.name,
        contactNumber: cleanPhone,
        reason: reason.trim() || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
        consentForPublicShare
      });

      if (res.success && res.data) {
        setCreatedRequest(res.data);
      } else if (res.success) {
        // Fallback if data is not directly nested
        setCreatedRequest({
          patientName: patientName.trim(),
          bloodGroup,
          unitsRequired: parseInt(unitsRequired, 10) || 1,
          hospitalName: hospitalName.trim(),
          district,
          contactNumber: cleanPhone,
          contactPersonName: contactPersonName.trim() || user.name,
          urgencyLevel,
          reason: reason.trim(),
          publicId: res.publicId || 'BR-' + Date.now().toString().slice(-6)
        });
      } else {
        Alert.alert('ব্যর্থ', res.message || 'আবেদন সংরক্ষণ করা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  // If a request was just created, show its digital card!
  if (createdRequest) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={40} color="#059669" />
          <Text style={styles.successBannerTitle}>আবেদন সফলভাবে প্রকাশিত হয়েছে!</Text>
          <Text style={styles.successBannerSub}>
            নিচে আপনার ডিজিটাল কার্ড ও কিউআর কোড তৈরি হয়েছে। এটি সরাসরি সামাজিক মাধ্যমে শেয়ার করতে পারবেন।
          </Text>
        </View>

        <NativeDigitalCard request={createdRequest} />

        <View style={{ marginTop: 14, gap: 10 }}>
          <Button
            title="সকল রক্তের আবেদন দেখুন"
            onPress={onSuccess}
            style={{ width: '100%' }}
          />
          <TouchableOpacity 
            onPress={() => {
              setCreatedRequest(null);
              setPatientName('');
              setHospitalName('');
              setReason('');
            }}
            style={styles.anotherBtn}
          >
            <Text style={styles.anotherBtnText}>আরেকটি নতুন আবেদন করুন</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.card}>
        <Text style={styles.formTitle}>জরুরি রক্তের আবেদন ফর্ম</Text>
        <Text style={styles.formSub}>রোগীর সঠিক তথ্য প্রদান করুন যেন রক্তদাতারা দ্রুত পৌঁছাতে পারেন</Text>

        {/* Patient Name */}
        <Text style={styles.label}>রোগীর নাম <Text style={{ color: Colors.primary }}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="যেমন: মোছাঃ সালমা বেগম"
          value={patientName}
          onChangeText={setPatientName}
        />

        {/* Blood Group */}
        <Text style={styles.label}>প্রয়োজনীয় রক্তের গ্রুপ <Text style={{ color: Colors.primary }}>*</Text></Text>
        <View style={styles.bgGrid}>
          {BLOOD_GROUPS.map(bg => (
            <TouchableOpacity
              key={bg}
              onPress={() => setBloodGroup(bg)}
              style={[
                styles.bgChip,
                bloodGroup === bg && styles.bgChipActive
              ]}
            >
              <Text style={[
                styles.bgChipText,
                bloodGroup === bg && styles.bgChipTextActive
              ]}>
                {bg}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Units Required */}
        <Text style={styles.label}>কত ব্যাগ রক্ত প্রয়োজন? (Units)</Text>
        <View style={styles.unitRow}>
          {['1', '2', '3', '4', '5+'].map(u => (
            <TouchableOpacity
              key={u}
              onPress={() => setUnitsRequired(u)}
              style={[
                styles.unitChip,
                unitsRequired === u && styles.unitChipActive
              ]}
            >
              <Text style={[
                styles.unitText,
                unitsRequired === u && styles.unitTextActive
              ]}>
                {u} ব্যাগ
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Urgency Level */}
        <Text style={styles.label}>জরুরিতার মাত্রা (Urgency Level)</Text>
        <View style={styles.urgencyRow}>
          {[
            { id: 'critical', label: '🚨 মুমূর্ষু', sub: '১-৪ ঘণ্টা' },
            { id: 'urgent', label: '⚠️ জরুরি', sub: '১২-২৪ ঘণ্টা' },
            { id: 'normal', label: 'নিয়মিত', sub: '১-২ দিন' }
          ].map(u => (
            <TouchableOpacity
              key={u.id}
              onPress={() => setUrgencyLevel(u.id as any)}
              style={[
                styles.urgencyChip,
                urgencyLevel === u.id && styles.urgencyChipActive
              ]}
            >
              <Text style={[
                styles.urgencyLabel,
                urgencyLevel === u.id && styles.urgencyLabelActive
              ]}>
                {u.label}
              </Text>
              <Text style={[
                styles.urgencySub,
                urgencyLevel === u.id && styles.urgencySubActive
              ]}>
                {u.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hospital */}
        <Text style={styles.label}>হাসপাতাল বা ক্লিনিকের নাম <Text style={{ color: Colors.primary }}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল (DMCH)"
          value={hospitalName}
          onChangeText={setHospitalName}
        />

        {/* Location / District */}
        <Text style={styles.label}>হাসপাতালের জেলা ও অবস্থান <Text style={{ color: Colors.primary }}>*</Text></Text>
        <TouchableOpacity
          onPress={() => setPickerVisible(true)}
          style={styles.locSelector}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.locSelectorText}>
              {districtNameBn} ({division.toUpperCase()})
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.subText} />
        </TouchableOpacity>

        {/* Contact Person Name */}
        <Text style={styles.label}>যোগাযোগের ব্যক্তির নাম</Text>
        <TextInput
          style={styles.input}
          placeholder="যেমন: রোগীর ভাই / আত্মীয়"
          value={contactPersonName}
          onChangeText={setContactPersonName}
        />

        {/* Contact Phone */}
        <Text style={styles.label}>যোগাযোগের মোবাইল নম্বর <Text style={{ color: Colors.primary }}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="01XXXXXXXXX"
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={setContactNumber}
        />

        {/* Reason / Note */}
        <Text style={styles.label}>রোগীর সমস্যা বা কারণ</Text>
        <TextInput
          style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
          placeholder="যেমন: সিজারিয়ান ডেলিভারি / ডেঙ্গু প্লাটিলেট প্রয়োজন..."
          multiline
          numberOfLines={2}
          value={reason}
          onChangeText={setReason}
        />

        {/* Additional Notes */}
        <Text style={styles.label}>অতিরিক্ত নির্দেশনা (ঐচ্ছিক)</Text>
        <TextInput
          style={[styles.input, { height: 50, textAlignVertical: 'top' }]}
          placeholder="যেমন: যাতায়াত সহায়তা দেওয়া হবে..."
          multiline
          numberOfLines={2}
          value={additionalNotes}
          onChangeText={setAdditionalNotes}
        />

        {/* Consent Checkbox */}
        <TouchableOpacity 
          style={styles.consentRow} 
          onPress={() => setConsentForPublicShare(!consentForPublicShare)}
        >
          <Ionicons 
            name={consentForPublicShare ? "checkbox" : "square-outline"} 
            size={22} 
            color={consentForPublicShare ? Colors.primary : Colors.subText} 
          />
          <Text style={styles.consentText}>
            আমি নিশ্চিত করছি যে তথ্যাদি সঠিক এবং রক্তের প্রয়োজনে যোগাযোগের অনুমতি দিচ্ছি।
          </Text>
        </TouchableOpacity>

        <Button
          title={submitting ? "প্রকাশ হচ্ছে..." : "আবেদন প্রকাশ করুন ও কার্ড তৈরি করুন"}
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={{ marginTop: 18 }}
        />
      </View>

      <LocationPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        selectedDivision={division}
        selectedDistrict={district}
        onSelect={(div, dist, nameBn) => {
          setDivision(div);
          setDistrict(dist);
          setDistrictNameBn(nameBn);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.page,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.mainText,
  },
  formSub: {
    fontSize: 12,
    color: Colors.subText,
    marginBottom: 16,
    marginTop: 2,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.mainText,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.appBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.mainText,
  },
  bgGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bgChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  bgChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bgChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mainText,
  },
  bgChipTextActive: {
    color: '#FFFFFF',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  unitChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.appBorder,
    alignItems: 'center',
  },
  unitChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: Colors.primary,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.mainText,
  },
  unitTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.appBorder,
    alignItems: 'center',
  },
  urgencyChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: Colors.primary,
  },
  urgencyLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.mainText,
  },
  urgencyLabelActive: {
    color: Colors.primary,
  },
  urgencySub: {
    fontSize: 9.5,
    color: Colors.subText,
    marginTop: 2,
  },
  urgencySubActive: {
    color: Colors.primary,
  },
  locSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.appBorder,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  locSelectorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.mainText,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
  },
  consentText: {
    flex: 1,
    fontSize: 11,
    color: Colors.subText,
    lineHeight: 16,
  },
  authPromptContainer: {
    flex: 1,
    backgroundColor: Colors.page,
    justifyContent: 'center',
    padding: 20,
  },
  authPromptCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  authPromptTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.mainText,
    marginTop: 14,
    marginBottom: 6,
  },
  authPromptSub: {
    fontSize: 12.5,
    color: Colors.subText,
    textAlign: 'center',
    lineHeight: 18,
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  successBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
    marginTop: 6,
  },
  successBannerSub: {
    fontSize: 12,
    color: '#047857',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  anotherBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  anotherBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
});
