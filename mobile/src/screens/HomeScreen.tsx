import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Linking,
  ActivityIndicator,
  AppState
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MobileApi } from '../api/client';
import { BloodRequestCard, BloodRequestItem } from '../components/BloodRequestCard';
import { StateView } from '../components/StateView';
import { AppRoutes } from '../navigation/routes';
import { useAuth } from '../context/AuthContext';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
  isActive?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onNavigate, 
  isActive = false 
}) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentRequests, setRecentRequests] = useState<BloodRequestItem[]>([]);
  const [stats, setStats] = useState<{
    totalDonors: number | null;
    availableDonors: number | null;
    activeRequests: number | null;
    districtsCovered: number | null;
  }>({
    totalDonors: null,
    availableDonors: null,
    activeRequests: null,
    districtsCovered: null
  });
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);

  const loadHomeData = async (skipCache: boolean = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setRequestError(null);
      const [reqRes, statsRes] = await Promise.allSettled([
        MobileApi.getBloodRequests({ limit: 4 }, skipCache),
        MobileApi.getPublicStats(skipCache)
      ]);

      // Handle Blood Requests
      if (reqRes.status === 'fulfilled' && reqRes.value.success && reqRes.value.requests) {
        setRecentRequests(reqRes.value.requests);
      } else if (reqRes.status === 'rejected') {
        const errMsg = reqRes.reason?.userMessage || reqRes.reason?.message || 'রক্তের আবেদন লোড করা যায়নি।';
        setRequestError(errMsg);
      }

      // Handle Live Statistics
      if (statsRes.status === 'fulfilled' && statsRes.value.success && statsRes.value.stats) {
        setStats({
          totalDonors: statsRes.value.stats.totalDonors ?? 0,
          availableDonors: statsRes.value.stats.availableDonors ?? 0,
          activeRequests: statsRes.value.stats.activeRequests ?? 0,
          districtsCovered: statsRes.value.stats.districtsCovered ?? 0
        });
      } else if (reqRes.status === 'fulfilled' && reqRes.value.total !== undefined) {
        // Fallback for requests count if stats endpoint blips
        setStats(prev => ({ ...prev, activeRequests: reqRes.value.total }));
      }
    } catch (e: any) {
      setRequestError(e?.userMessage || e?.message || 'তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  // Safe polling and lifecycle controller
  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(() => {
        if (AppState.currentState === 'active' && isActive) {
          loadHomeData(true);
        }
      }, 45000);
    };

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    if (isActive && AppState.currentState === 'active') {
      loadHomeData(true);
      startPolling();
    } else {
      stopPolling();
    }

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isActive) {
        loadHomeData(true);
        startPolling();
      } else {
        stopPolling(); // Immediately stop polling when in background
      }
    });

    return () => {
      stopPolling();
      appStateSub.remove();
    };
  }, [isActive]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData(true);
  };

  const formatStat = (num: number | null, suffix: string = '') => {
    if (num === null) return '—';
    return `${num}${suffix}`;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>মানবিক উদ্যোগ</Text>
        </View>
        <Text style={styles.heroTitle}>
          এক ব্যাগ রক্ত,{'\n'}একটি সম্ভাবনাময় জীবন
        </Text>
        <Text style={styles.heroSub}>
          বাংলাদেশের সকল জেলা ও শিক্ষা প্রতিষ্ঠানের স্বেচ্ছাসেবী রক্তদাতাদের সরাসরি যোগাযোগের ডিজিটাল নেটওয়ার্ক।
        </Text>

        <View style={styles.heroBtnRow}>
          <TouchableOpacity 
            activeOpacity={0.85}
            onPress={() => onNavigate(AppRoutes.DONORS)}
            style={styles.heroPrimaryBtn}
          >
            <Ionicons name="search" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.heroPrimaryBtnText}>রক্তদাতা খুঁজুন</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.85}
            onPress={() => onNavigate(AppRoutes.CREATE_REQUEST)}
            style={styles.heroSecondaryBtn}
          >
            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.heroSecondaryBtnText}>রক্তের আবেদন</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Action Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>গুরুত্বপূর্ণ সেবাসমূহ</Text>
        <View style={styles.grid}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => onNavigate(AppRoutes.DONORS)}
            style={styles.gridItem}
          >
            <View style={[styles.gridIconBox, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="water" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.gridItemTitle}>রক্তদাতা খুঁজুন</Text>
            <Text style={styles.gridItemSub}>নিকটস্থ রক্তদাতা</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => onNavigate(AppRoutes.REQUESTS)}
            style={styles.gridItem}
          >
            <View style={[styles.gridIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="alarm" size={24} color="#D97706" />
            </View>
            <Text style={styles.gridItemTitle}>জরুরি প্রয়োজন</Text>
            <Text style={styles.gridItemSub}>চলমান আবেদনসমূহ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => onNavigate(AppRoutes.INSTITUTIONS)}
            style={styles.gridItem}
          >
            <View style={[styles.gridIconBox, { backgroundColor: Colors.tealLight }]}>
              <Ionicons name="school" size={24} color={Colors.tealAccent} />
            </View>
            <Text style={styles.gridItemTitle}>ক্যাম্পাস ও কলেজ</Text>
            <Text style={styles.gridItemSub}>প্রাতিষ্ঠানিক তালিকা</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => Linking.openURL('tel:999')}
            style={styles.gridItem}
          >
            <View style={[styles.gridIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="call" size={24} color="#DC2626" />
            </View>
            <Text style={styles.gridItemTitle}>জরুরি হটলাইন</Text>
            <Text style={styles.gridItemSub}>কল করুন ৯৯৯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Impact Stats (Verified Backend Data) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>প্ল্যাটফর্ম পরিসংখ্যান</Text>
          <Text style={styles.liveBadge}>লাইভ ডাটা</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{formatStat(stats.totalDonors, stats.totalDonors ? '+' : '')}</Text>
            <Text style={styles.statLabel}>নিবন্ধিত রক্তদাতা</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: Colors.tealAccent }]}>
              {formatStat(stats.availableDonors, stats.availableDonors ? '+' : '')}
            </Text>
            <Text style={styles.statLabel}>প্রস্তুত রক্তদাতা</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: Colors.primary }]}>
              {formatStat(stats.activeRequests)}
            </Text>
            <Text style={styles.statLabel}>জরুরি প্রয়োজন</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#0F172A' }]}>
              {formatStat(stats.districtsCovered)}
            </Text>
            <Text style={styles.statLabel}>জেলায় সক্রিয়</Text>
          </View>
        </View>
      </View>

      {/* Recent Blood Requests */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>জরুরি রক্তের আবেদনসমূহ</Text>
          <TouchableOpacity onPress={() => onNavigate(AppRoutes.REQUESTS)}>
            <Text style={styles.seeAllText}>সকল আবেদন →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <StateView type="loading" message="সাম্প্রতিক রক্তের আবেদনসমূহ লোড হচ্ছে..." />
        ) : requestError && recentRequests.length === 0 ? (
          <StateView 
            type="error"
            title="আবেদনগুলো লোড করা সম্ভব হয়নি"
            message={requestError}
            onRetry={() => loadHomeData(true)}
            retryLabel="পুনরায় চেষ্টা করুন"
          />
        ) : recentRequests.length === 0 ? (
          <StateView 
            type="empty"
            icon="clipboard-outline"
            title="বর্তমানে কোনো জরুরি আবেদন নেই"
            message="এখন এই প্ল্যাটফর্মে কোনো জরুরি রক্তের আবেদন অপেক্ষমাণ নেই। প্রয়োজনে আপনি নতুন আবেদন তৈরি করতে পারেন।"
            onAction={() => onNavigate(AppRoutes.CREATE_REQUEST)}
            actionLabel="রক্তের আবেদন করুন"
          />
        ) : (
          recentRequests.map(r => (
            <BloodRequestCard key={r._id} request={r} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.page,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 22,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  heroBtnRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  heroPrimaryBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPrimaryBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  heroSecondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroSecondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginTop: 22,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.mainText,
  },
  liveBadge: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  gridIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridItemTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.mainText,
  },
  gridItemSub: {
    fontSize: 11,
    color: Colors.subText,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.appBorder,
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.subText,
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
});
