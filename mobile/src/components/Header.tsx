import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  showEmergencyRibbon?: boolean;
  onNotificationPress?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightComponent,
  showEmergencyRibbon = true,
  onNotificationPress,
  unreadCount = 0
}) => {
  const callEmergency = () => {
    Linking.openURL('tel:999').catch(() => {});
  };

  return (
    <View style={styles.wrapper}>
      {showEmergencyRibbon && (
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={callEmergency}
          style={styles.ribbon}
        >
          <View style={styles.pulseDot} />
          <Text style={styles.ribbonText}>
            জরুরি রক্তের প্রয়োজনে: ৯৯৯ | ১৬২৬৩ (ট্যাপ করে কল করুন)
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.mainText} />
          </TouchableOpacity>
        ) : null}

        {title ? (
          <View style={{ flex: 1, marginLeft: showBack ? 8 : 0 }}>
            <Text style={styles.pageTitle} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={styles.pageSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
        ) : (
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="heart" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.titleText}>
                রক্তদান <Text style={{ color: Colors.primary }}>বাংলাদেশ</Text>
              </Text>
              <Text style={styles.subText}>
                Bangladesh Blood Donation Platform
              </Text>
            </View>
          </View>
        )}

        {rightComponent ? (
          <View style={styles.rightSlot}>{rightComponent}</View>
        ) : onNotificationPress ? (
          <TouchableOpacity 
            onPress={onNotificationPress}
            style={styles.notifBtn}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.mainText} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.appBorder,
  },
  ribbon: {
    backgroundColor: '#0F172A',
    paddingVertical: 5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  ribbonText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '600',
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subText: {
    fontSize: 9.5,
    color: Colors.subText,
    fontWeight: '500',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.mainText,
  },
  pageSubtitle: {
    fontSize: 11,
    color: Colors.subText,
    marginTop: 1,
  },
  rightSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
