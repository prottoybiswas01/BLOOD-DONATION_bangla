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
import { colors } from '../theme/colors';
import { MobileApi } from '../api/client';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

interface PasswordRecoveryScreenProps {
  navigation: any;
}

export const PasswordRecoveryScreen: React.FC<PasswordRecoveryScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      Alert.alert('ভুল তথ্য', 'অনুগ্রহ করে নিবন্ধিত মোবাইল নম্বর দিন');
      return;
    }

    setLoading(true);
    try {
      await MobileApi.requestPasswordRecovery({
        phone: cleanPhone,
        reason: reason.trim() || 'পাসওয়ার্ড ভুলে গেছি'
      });
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('আবেদন ব্যর্থ', err.message || 'রিকভারি আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="পাসওয়ার্ড পুনরুদ্ধার"
        subtitle="অ্যাকাউন্ট ভেরিফিকেশন ও সাময়িক পাসওয়ার্ড"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {submitted ? (
          <View style={styles.successBox}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-done" size={40} color={colors.teal} />
            </View>
            <Text style={styles.successTitle}>আবেদন সফলভাবে গৃহীত হয়েছে</Text>
            <Text style={styles.successDesc}>
              আপনার পাসওয়ার্ড রিকভারি আবেদনটি সংশ্লিষ্ট ক্যাম্পাস মডারেটর অথবা জেলা সমন্বয়কের কাছে পাঠানো হয়েছে।
              পরিচয় নিশ্চিত করার পর তারা একটি সাময়িক এককালীন পাসওয়ার্ড প্রদান করবেন।
            </Text>
            <Button
              title="লগইন পেজে ফিরে যান"
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              style={{ width: '100%', marginTop: 24 }}
            />
          </View>
        ) : (
          <View style={styles.formCard}>
            <View style={styles.infoBanner}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              <Text style={styles.infoText}>
                অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে প্ল্যাটফর্মে স্বয়ংক্রিয় এসএমএস লিংকের পরিবর্তে সংশ্লিষ্ট ক্যাম্পাস মডারেটর বা সমন্বয়ক কর্তৃক ম্যানুয়াল ভেরিফিকেশন অনুসরণ করা হয়।
              </Text>
            </View>

            <Text style={styles.label}>নিবন্ধিত মোবাইল নম্বর</Text>
            <TextInput
              style={styles.input}
              placeholder="01XXXXXXXXX"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoCapitalize="none"
            />

            <Text style={styles.label}>সমস্যার বিবরণ বা পরিচয়সূত্র (ঐচ্ছিক)</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="আপনার পরিচয়সূত্র যেমন: স্টুডেন্ট আইডি বা প্রতিষ্ঠানের নাম উল্লেখ করুন..."
              multiline
              value={reason}
              onChangeText={setReason}
            />

            <Button
              title="রিকভারি আবেদন পাঠান"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              style={{ marginTop: 20 }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>পাসওয়ার্ড মনে পড়েছে? লগইন করুন</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pageBackground
  },
  scrollContent: {
    padding: 16
  },
  formCard: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: colors.primary,
    lineHeight: 18
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 10,
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
  backLink: {
    alignItems: 'center',
    marginTop: 18
  },
  backLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'
  },
  successBox: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10
  },
  successDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20
  }
});

