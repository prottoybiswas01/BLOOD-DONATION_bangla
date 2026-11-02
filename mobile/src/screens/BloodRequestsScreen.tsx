import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl,
  FlatList,
  Platform,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MobileApi } from '../api/client';
import { BloodRequestCard, BloodRequestItem } from '../components/BloodRequestCard';
import { StateView } from '../components/StateView';
import { NativeDigitalCard } from '../components/NativeDigitalCard';

interface BloodRequestsScreenProps {
  onNavigateCreate: () => void;
}

export const BloodRequestsScreen: React.FC<BloodRequestsScreenProps> = ({ onNavigateCreate }) => {
  const [requests, setRequests] = useState<BloodRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequestItem | null>(null);

  const loadRequests = async (skipCache: boolean = false) => {
    setLoading(true);
    setRequestError(null);
    try {
      const res = await MobileApi.getBloodRequests({ limit: 25 }, skipCache);
      if (res.success && Array.isArray(res.requests)) {
        setRequests(res.requests);
      } else {
        setRequests([]);
      }
    } catch (e: any) {
      const message = e?.userMessage || e?.message || 'রক্তের আবেদনসমূহ লোড করা সম্ভব হয়নি।';
      setRequestError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests(false);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests(true);
  };

  const filtered = requests.filter(r => {
    if (filterUrgency === 'all') return true;
    if (filterUrgency === 'critical' || filterUrgency === 'emergency') {
      return r.urgencyLevel === 'emergency' || r.urgencyLevel === 'critical';
    }
    return r.urgencyLevel === filterUrgency;
  });

  return (
    <View style={styles.container}>
      {/* Urgency Filter Tabs */}
      <View style={styles.filterBar}>
        {[
          { id: 'all', label: 'সকল আবেদন' },
          { id: 'emergency', label: '🚨 মুমূর্ষু' },
          { id: 'urgent', label: '⚠️ জরুরি' },
          { id: 'normal', label: 'নিয়মিত' }
        ].map(tab => {
          const isActive = filterUrgency === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setFilterUrgency(tab.id)}
              style={[
                styles.filterTab,
                isActive && styles.filterTabActive
              ]}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterTabText,
                isActive && styles.filterTabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main List with Explicit UI States */}
      <View style={styles.listContainer}>
        {loading && requests.length === 0 ? (
          <StateView 
            type="loading" 
            message="জরুরি রক্তের আবেদনসমূহ লোড হচ্ছে..." 
          />
        ) : requestError && requests.length === 0 ? (
          <StateView 
            type="error"
            title="আবেদনগুলো লোড করা সম্ভব হয়নি"
            message={requestError}
            onRetry={() => loadRequests(true)}
            retryLabel="পুনরায় চেষ্টা করুন"
          />
        ) : filtered.length === 0 ? (
          <StateView 
            type="empty"
            icon="clipboard-outline"
            title="কোনো আবেদন পাওয়া যায়নি"
            message={filterUrgency !== 'all' 
              ? 'নির্বাচিত ক্যাটাগরিতে এই মুহূর্তে কোনো সক্রিয় রক্তের আবেদন নেই।' 
              : 'বর্তমানে প্ল্যাটফর্মে কোনো অপেক্ষমাণ রক্তের আবেদন নেই। আপনার বা আপনার পরিচিত কারও রক্তের প্রয়োজন হলে এখনই আবেদন পোস্ট করুন।'}
            onAction={onNavigateCreate}
            actionLabel="রক্তের আবেদন করুন"
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <BloodRequestCard 
                request={item} 
                onPressCard={(req) => setSelectedRequest(req)} 
              />
            )}
            contentContainerStyle={styles.flatListContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={[Colors.primary]} 
              />
            }
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Digital Card Preview Modal */}
      <Modal
        visible={!!selectedRequest}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRequest && (
                <NativeDigitalCard
                  request={selectedRequest}
                  onClose={() => setSelectedRequest(null)}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Native Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onNavigateCreate}
        style={styles.fab}
        accessibilityLabel="রক্তের আবেদন তৈরি করুন"
      >
        <Ionicons name="add" size={24} color="#FFFFFF" style={{ marginRight: 6 }} />
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
    paddingVertical: 7,
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
    fontWeight: '800',
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    padding: 16,
    paddingBottom: 90,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 18,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 48,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    maxHeight: '90%',
  },
});
