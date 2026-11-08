import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { versionCheckManager, AppReleaseInfo } from '../services/versionCheckService';
import { APP_CONFIG } from '../api/config';

interface UpdatePromptModalProps {
  visible: boolean;
  release: AppReleaseInfo | null;
  onDismiss: () => void;
}

export const UpdatePromptModal: React.FC<UpdatePromptModalProps> = ({
  visible,
  release,
  onDismiss
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!visible || !release) {
    return null;
  }

  const handleUpdateNow = async () => {
    try {
      setDownloading(true);
      const url = release.downloadUrl;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to website
        await Linking.openURL('https://blood-donationbangla.vercel.app');
      }

      // If not a forced update, dismiss prompt after opening download link
      if (!release.forceUpdate) {
        versionCheckManager.dismissForSession();
        onDismiss();
      }
    } catch (e: any) {
      Alert.alert(
        'ডাউনলোড লিংক খুলতে সমস্যা হয়েছে',
        'অনুগ্রহ করে আপনার ব্রাউজারে blood-donationbangla.vercel.app ভিজিট করে নতুন সংস্করণ ডাউনলোড করুন।'
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleLater = () => {
    versionCheckManager.dismissForSession();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={release.forceUpdate ? undefined : handleLater}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {/* Top Banner Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="arrow-up-circle" size={44} color={Colors.primary} />
          </View>

          <Text style={styles.title}>নতুন সংস্করণ উপলব্ধ!</Text>
          <Text style={styles.versionBadge}>
            চলমান: v{APP_CONFIG.version} (Build {APP_CONFIG.buildNumber}) → নতুন: v{release.latestVersion} (Build {release.versionCode})
          </Text>

          {/* Release Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>নতুন কী যুক্ত হয়েছে:</Text>
            <ScrollView style={styles.notesScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.notesText}>
                {release.releaseNotes || '• অ্যাপের পারফরম্যান্স ও ডেটা লোডিং উন্নত করা হয়েছে।\n• সাধারণ বাগ ও ক্র্যাশ ফিক্স করা হয়েছে।'}
              </Text>
            </ScrollView>
          </View>

          {/* Android Installation Guidance Notice */}
          <View style={styles.guidanceBox}>
            <Ionicons name="information-circle" size={18} color="#0D9488" style={{ marginRight: 6, marginTop: 1 }} />
            <Text style={styles.guidanceText}>
              ডাউনলোড সম্পন্ন হলে নোটিফিকেশন থেকে ফাইলে ট্যাপ করুন। ফোনে প্রথমবারের মতো পারমিশন চাইলে 'Allow from this source' চালু করে আপডেট ইনস্টল করুন। আপনার পূর্বের লগইন অক্ষুণ্ণ থাকবে।
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            {!release.forceUpdate && (
              <TouchableOpacity
                style={styles.laterButton}
                onPress={handleLater}
                activeOpacity={0.7}
              >
                <Text style={styles.laterButtonText}>পরে করুন</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.updateButton, release.forceUpdate && { flex: 1 }]}
              onPress={handleUpdateNow}
              disabled={downloading}
              activeOpacity={0.85}
            >
              <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.updateButtonText}>
                {downloading ? 'ডাউনলোড শুরু হচ্ছে...' : 'আপডেট করুন'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.mainText,
    textAlign: 'center',
    marginBottom: 4,
  },
  versionBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.subText,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
    textAlign: 'center',
  },
  notesContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mainText,
    marginBottom: 6,
  },
  notesScroll: {
    maxHeight: 110,
  },
  notesText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  guidanceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    padding: 10,
    marginBottom: 18,
  },
  guidanceText: {
    flex: 1,
    fontSize: 11,
    color: '#115E59',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  laterButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  updateButton: {
    flex: 1.3,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
