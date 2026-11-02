import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MobileApi } from '../api/client';
import { Badge } from '../components/Badge';

interface InstitutionItem {
  _id: string;
  name: string;
  nameBn: string;
  code: string;
  division: string;
  district: string;
  address?: string;
  totalRegisteredDonors?: number;
}

export const InstitutionsScreen: React.FC = () => {
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInstitutions = async () => {
    try {
      const res = await MobileApi.getInstitutions();
      if (res.success && res.institutions) {
        setInstitutions(res.institutions);
      }
    } catch (e) {
      console.warn('Load institutions error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadInstitutions();
  };

  const filtered = institutions.filter(i => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.nameBn?.toLowerCase().includes(q) ||
      i.name?.toLowerCase().includes(q) ||
      i.code?.toLowerCase().includes(q) ||
      i.district?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.subText} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="প্রতিষ্ঠান বা ক্যাম্পাসের নাম লিখুন..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={Colors.subText} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="school-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>কোনো প্রতিষ্ঠান পাওয়া যায়নি</Text>
            <Text style={styles.emptySub}>আপনার অনুসন্ধানের সাথে মিলে এমন কোনো অনুমোদিত ক্যাম্পাস নেই।</Text>
          </View>
        ) : (
          filtered.map(inst => (
            <View key={inst._id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>🎓</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.instNameBn}>{inst.nameBn}</Text>
                  <Text style={styles.instNameEn}>{inst.name}</Text>
                </View>
                <Badge variant="teal" size="sm">{inst.code}</Badge>
              </View>

              <View style={styles.cardBottom}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-outline" size={14} color={Colors.subText} style={{ marginRight: 4 }} />
                  <Text style={styles.metaText}>{inst.district}, {inst.division}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={14} color={Colors.tealAccent} style={{ marginRight: 4 }} />
                  <Text style={[styles.metaText, { color: Colors.tealAccent, fontWeight: '700' }]}>
                    {inst.totalRegisteredDonors || 0} জন রক্তদাতা
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.page,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    height: 48,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.mainText,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.appBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  instNameBn: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.mainText,
  },
  instNameEn: {
    fontSize: 11,
    color: Colors.subText,
    marginTop: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  metaText: {
    fontSize: 11.5,
    color: Colors.subText,
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
  },
});

