import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export interface StateViewProps {
  type: 'loading' | 'error' | 'empty' | 'auth';
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onRetry?: () => void;
  retryLabel?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export const StateView: React.FC<StateViewProps> = ({
  type,
  title,
  message,
  icon,
  onRetry,
  retryLabel = 'আবার চেষ্টা করুন',
  onAction,
  actionLabel
}) => {
  if (type === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {message || 'তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...'}
        </Text>
      </View>
    );
  }

  if (type === 'error') {
    return (
      <View style={styles.cardContainer}>
        <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name={icon || 'alert-circle'} size={32} color={Colors.danger} />
        </View>
        <Text style={styles.titleText}>
          {title || 'তথ্য লোড করতে সমস্যা হয়েছে'}
        </Text>
        <Text style={styles.messageText}>
          {message || 'ইন্টারনেট সংযোগ চেক করুন অথবা সার্ভারে সাময়িক সমস্যা হচ্ছে।'}
        </Text>

        {onRetry && (
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={onRetry} 
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.retryButtonText}>{retryLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (type === 'auth') {
    return (
      <View style={styles.cardContainer}>
        <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name={icon || 'lock-closed'} size={32} color="#D97706" />
        </View>
        <Text style={styles.titleText}>
          {title || 'লগইন আবশ্যক'}
        </Text>
        <Text style={styles.messageText}>
          {message || 'এই ফিচারটি ব্যবহার করতে আপনার অ্যাকাউন্টে লগইন করুন।'}
        </Text>

        {onAction && (
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: Colors.primary }]} 
            onPress={onAction} 
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.retryButtonText}>{actionLabel || 'লগইন করুন'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // 'empty' genuine empty result
  return (
    <View style={styles.cardContainer}>
      <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
        <Ionicons name={icon || 'search-outline'} size={32} color="#94A3B8" />
      </View>
      <Text style={styles.titleText}>
        {title || 'কোনো তথ্য পাওয়া যায়নি'}
      </Text>
      <Text style={styles.messageText}>
        {message || 'বর্তমানে কোনো রেকর্ড তালিকাভুক্ত নেই।'}
      </Text>

      {onAction && actionLabel && (
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.appBorder }]} 
          onPress={onAction} 
          activeOpacity={0.8}
        >
          <Text style={[styles.retryButtonText, { color: Colors.mainText }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: Colors.subText,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.appBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  titleText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.mainText,
    textAlign: 'center',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 12.5,
    color: Colors.subText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

