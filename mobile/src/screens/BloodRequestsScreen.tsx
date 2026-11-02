import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MobileApi } from '../api/client';
import { BloodRequestCard, BloodRequestItem } from '../components/BloodRequestCard';

interface BloodRequestsScreenProps {
  onNavigateCreate: () => void;
}

export const BloodRequestsScreen: React.FC<BloodRequestsScreenProps> = ({ onNavigateCreate }) => {
  const [requests, setRequests] = useState<BloodRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  const loadRequests = async () => {
    try {
      const res = await MobileApi.getBloodRequests({ limit: 20 });
      if (res.success && res.requests) {
        setRequests(res.requests);
      }
    } catch (e) {
      console.warn('Load requests error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const filtered = requests.filter(r => {
    if (filterUrgency === 'all') return true;
    return r.urgencyLevel === filterUrgency;
  });

  return (
    <View style={styles.container}>
      {/* Urgency Filter Tabs */}
      <View style={styles.filterBar}>
        {[
          { id: 'all', label: 'সকল আবেদন' },
          { id: 'critical', label: '🚨 মুমূর্ষু' },
          { id: 'urgent', label: '⚠️ জরুরি' },
          { id: 'normal', label: 'নিয়মিত' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setFilterUrgency(tab.id)}
            style={[
              styles.filterTab,
              filterUrgency === tab.id && styles.filterTabActive
            ]}
          >
            <Text style={[
              styles.filterTabText,
              filterUrgency === tab.id && styles.filterTabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="clipboard-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>কোনো আবেদন পাওয়া যায়নি</Text>
            <Text style={styles.emptySub}>
              বর্তমানে এই ক্যাটাগরিতে কোনো জরুরি রক্তের আবেদন অপেক্ষমাণ নেই।
            </Text>
          </View>
        ) : (
          filtered.map(r => (
            <BloodRequestCard key={r._id} request={r} />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onNavigateCreate}
        style={styles.fab}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>রক্তের আবেদন করুন</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.page,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.appBorder,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.mainText,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: 30,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.mainText,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.subText,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
});

