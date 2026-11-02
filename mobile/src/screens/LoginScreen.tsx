import React, { useState } from 'react';
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
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
  onNavigateRecovery: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onNavigateRegister,
  onNavigateRecovery
}) => {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!password) {
      setErrorMsg('পাসওয়ার্ড প্রদান করা আবশ্যক।');
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanPhone, password);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg(res.message || 'লগইন ব্যর্থ হয়েছে। মোবাইল নম্বর বা পাসওয়ার্ড পুনরায় যাচাই করুন।');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'নেটওয়ার্ক সংযোগে ত্রুটি দেখা দিয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 30 }}>
      <View style={styles.card}>
        <View style={styles.brandIconBox}>
          <Ionicons name="heart" size={32} color={Colors.primary} />
        </View>

        <Text style={styles.title}>অ্যাকাউন্টে লগইন করুন</Text>
        <Text style={styles.subtitle}>
          রক্তদান কার্যক্রমে আপনার প্রোফাইল ও অনুরোধসমূহ পরিচালনা করতে লগইন করুন
        </Text>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Phone Input */}
        <Text style={styles.label}>মোবাইল নম্বর (ইউজার আইডি)</Text>
        <View style={styles.inputBox}>
          <Ionicons name="call-outline" size={18} color={Colors.subText} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <Text style={styles.label}>পাসওয়ার্ড</Text>
        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.subText} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Recovery Link */}
        <TouchableOpacity 
          onPress={onNavigateRecovery}
          style={styles.forgotBtn}
        >
          <Text style={styles.forgotText}>পাসওয়ার্ড ভুলে গেছেন? রিকভারি করুন</Text>
        </TouchableOpacity>

        <Button
          title="লগইন সম্পন্ন করুন"
          onPress={handleLogin}
          loading={loading}
          style={{ marginTop: 14 }}
        />

        {/* Register footer link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>এখনো কোনো অ্যাকাউন্ট নেই? </Text>
          <TouchableOpacity onPress={onNavigateRegister}>
            <Text style={styles.registerLink}>নতুন নিবন্ধন করুন</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  brandIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
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
    marginBottom: 20,
    lineHeight: 18,
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
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.appBorder,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.mainText,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: {
    fontSize: 12.5,
    color: Colors.subText,
  },
  registerLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.primary,
  },
});

