import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Button } from '../components/Button';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { MobileApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface RegisterScreenProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onSuccess,
  onNavigateLogin
}) => {
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [role, setRole] = useState<'DONOR' | 'REQUESTER'>('DONOR');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-01');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [division, setDivision] = useState('dhaka');
  const [district, setDistrict] = useState('dhaka');
  const [districtNameBn, setDistrictNameBn] = useState('ঢাকা');
  const [institutionId, setInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [consentToShareContact, setConsentToShareContact] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    MobileApi.getInstitutions().then(res => {
      if (res.success && res.institutions) {
        setInstitutions(res.institutions);
      }
    }).catch(() => {});
  }, []);

  const sanitizePhone = (raw: string) => {
    let clean = raw.replace(/[\s\-]/g, '');
    if (clean.startsWith('+88')) clean = clean.slice(3);
    if (clean.startsWith('88') && clean.length === 13) clean = clean.slice(2);
    return clean;
  };

  const handleNextStep1 = () => {
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }
    const cleanPhone = sanitizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (role === 'REQUESTER') {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    setErrorMsg(null);
    if (role === 'DONOR' && dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const ageDiff = Date.now() - dob.getTime();
      const age = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
      if (age < 18) {
        setErrorMsg('রক্তদাতা হিসেবে নিবন্ধনের জন্য ন্যূনতম বয়স ১৮ বছর হওয়া আবশ্যক।');
        return;
      }
    }
    setStep(3);
  };

  const handleCompleteRegistration = async () => {
    setErrorMsg(null);
    if (!termsAccepted) {
      setErrorMsg('প্ল্যাটফর্মের শর্তাবলী ও নীতিমালা মেনে নেওয়া আবশ্যক।');
      return;
    }

    const cleanPhone = sanitizePhone(phone);
    setLoading(true);

    try {
      const res = await register({
        name: name.trim(),
        phone: cleanPhone,
        password,
        role,
        bloodGroup: role === 'DONOR' ? bloodGroup : undefined,
        division,
        district,
        dateOfBirth: role === 'DONOR' ? dateOfBirth : undefined,
        gender: role === 'DONOR' ? gender : undefined,
        institutionId: institutionId || undefined,
        consentToShareContact,
        femaleSafetyAcknowledged: gender === 'female',
        femalePublicPhoneConsent: gender === 'female' ? false : consentToShareContact,
        termsAccepted
      });

      if (res.success) {
        Alert.alert('অভিনন্দন!', 'আপনার নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।', [
          { text: 'ঠিক আছে', onPress: onSuccess }
        ]);
      } else {
        setErrorMsg(res.message || 'নিবন্ধন প্রক্রিয়া সম্পন্ন করা যায়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'ত্রুটি দেখা দিয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 18, paddingTop: 20 }}>
      <View style={styles.card}>
        <Text style={styles.title}>নতুন সদস্য নিবন্ধন</Text>
        <Text style={styles.subtitle}>
          ধাপ {step}/৩: {step === 1 ? 'পরিচয় ও ভূমিকা' : step === 2 ? 'রক্তের গ্রুপ ও স্বাস্থ্য' : 'অবস্থান ও সম্মতি'}
        </Text>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <View>
            <Text style={styles.label}>আপনার ভূমিকা নির্বাচন করুন</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                onPress={() => setRole('DONOR')}
                style={[styles.roleCard, role === 'DONOR' && styles.roleCardActive]}
              >
                <Ionicons name="water" size={24} color={role === 'DONOR' ? Colors.primary : Colors.subText} />
                <Text style={[styles.roleTitle, role === 'DONOR' && styles.roleTitleActive]}>
                  স্বেচ্ছায় রক্তদাতা
                </Text>
                <Text style={styles.roleSub}>রক্তদান করতে প্রস্তুত</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole('REQUESTER')}
                style={[styles.roleCard, role === 'REQUESTER' && styles.roleCardActive]}
              >
                <Ionicons name="heart" size={24} color={role === 'REQUESTER' ? Colors.primary : Colors.subText} />
                <Text style={[styles.roleTitle, role === 'REQUESTER' && styles.roleTitleActive]}>
                  রক্তপ্রত্যাশী
                </Text>
                <Text style={styles.roleSub}>রোগীর জন্য রক্ত প্রয়োজন</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>সম্পূর্ণ নাম <Text style={{ color: Colors.primary }}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="যেমন: তানভীর আহমেদ"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>মোবাইল নম্বর (১১ ডিজিট) <Text style={{ color: Colors.primary }}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="01XXXXXXXXX"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) <Text style={{ color: Colors.primary }}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Button
              title="পরবর্তী ধাপ →"
              onPress={handleNextStep1}
              style={{ marginTop: 20 }}
            />
          </View>
        )}

        {/* STEP 2: HEALTH & BLOOD GROUP (For Donor) */}
        {step === 2 && (
          <View>
            <Text style={styles.label}>রক্তের গ্রুপ নির্বাচন করুন <Text style={{ color: Colors.primary }}>*</Text></Text>
            <View style={styles.bgGrid}>
              {BLOOD_GROUPS.map(bg => (
                <TouchableOpacity
                  key={bg}
                  onPress={() => setBloodGroup(bg)}
                  style={[styles.bgChip, bloodGroup === bg && styles.bgChipActive]}
                >
                  <Text style={[styles.bgChipText, bloodGroup === bg && styles.bgChipTextActive]}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>জন্ম তারিখ (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2000-01-01"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />

            <Text style={styles.label}>লিঙ্গ (Gender)</Text>
            <View style={styles.genderRow}>
              {[
                { id: 'male', label: 'পুরুষ' },
                { id: 'female', label: 'নারী' },
                { id: 'other', label: 'অন্যান্য' }
              ].map(g => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => {
                    setGender(g.id as any);
                    if (g.id === 'female') setConsentToShareContact(false);
                  }}
                  style={[styles.genderChip, gender === g.id && styles.genderChipActive]}
                >
                  <Text style={[styles.genderText, gender === g.id && styles.genderTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.navRow}>
              <Button
                title="← পূর্ববর্তী"
                variant="outline"
                onPress={() => setStep(1)}
                style={{ flex: 1 }}
              />
              <Button
                title="পরবর্তী ধাপ →"
                onPress={handleNextStep2}
                style={{ flex: 1, marginLeft: 10 }}
              />
            </View>
          </View>
        )}

        {/* STEP 3: LOCATION & AGREEMENT */}
        {step === 3 && (
          <View>
            <Text style={styles.label}>বর্তমান ভৌগোলিক অবস্থান <Text style={{ color: Colors.primary }}>*</Text></Text>
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

            <Text style={styles.label}>শিক্ষা প্রতিষ্ঠান / ক্যাম্পাস (ঐচ্ছিক)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="প্রতিষ্ঠান আইডি বা নাম (ঐচ্ছিক)"
                value={institutionId}
                onChangeText={setInstitutionId}
              />
            </View>

            {role === 'DONOR' && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setConsentToShareContact(!consentToShareContact)}
                style={styles.checkRow}
              >
                <Ionicons
                  name={consentToShareContact ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={consentToShareContact ? Colors.primary : Colors.subText}
                />
                <Text style={styles.checkText}>
                  জরুরি রক্তপ্রয়োজনে যোগাযোগের সম্মতি প্রদান করছি (ফোন নম্বর যাচাইকৃত অনুরোধকারীদের নিকট প্রকাশিত হবে)।
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={styles.checkRow}
            >
              <Ionicons
                name={termsAccepted ? 'checkbox' : 'square-outline'}
                size={20}
                color={termsAccepted ? Colors.primary : Colors.subText}
              />
              <Text style={styles.checkText}>
                আমি রক্তদান প্ল্যাটফর্মের সমস্ত নীতিমালা ও নিরাপত্তা শর্তাবলী মেনে নিচ্ছি।
              </Text>
            </TouchableOpacity>

            <View style={styles.navRow}>
              <Button
                title="← পূর্ববর্তী"
                variant="outline"
                onPress={() => setStep(role === 'DONOR' ? 2 : 1)}
                style={{ flex: 1 }}
              />
              <Button
                title="নিবন্ধন সম্পন্ন করুন"
                onPress={handleCompleteRegistration}
                loading={loading}
                style={{ flex: 1.5, marginLeft: 10 }}
              />
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ইতিমধ্যে অ্যাকাউন্ট আছে? </Text>
          <TouchableOpacity onPress={onNavigateLogin}>
            <Text style={styles.loginLink}>লগইন করুন</Text>
          </TouchableOpacity>
        </View>
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
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.mainText,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.subText,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.mainText,
    marginTop: 10,
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
  inputBox: {
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.appBorder,
    alignItems: 'center',
  },
  roleCardActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.mainText,
    marginTop: 6,
  },
  roleTitleActive: {
    color: Colors.primary,
  },
  roleSub: {
    fontSize: 10.5,
    color: Colors.subText,
    marginTop: 2,
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
    fontWeight: '800',
    color: Colors.mainText,
  },
  bgChipTextActive: {
    color: '#FFFFFF',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  genderChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  genderText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.mainText,
  },
  genderTextActive: {
    color: '#FFFFFF',
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
    fontWeight: '700',
    color: Colors.mainText,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 8,
  },
  checkText: {
    fontSize: 11.5,
    color: Colors.mainText,
    flex: 1,
    lineHeight: 16,
  },
  navRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: {
    fontSize: 12.5,
    color: Colors.subText,
  },
  loginLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.primary,
  },
});

