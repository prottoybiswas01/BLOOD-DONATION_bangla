import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  RefreshControl,
  FlatList,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MobileApi } from '../api/client';
import { Badge } from '../components/Badge';
import { StateView } from '../components/StateView';

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
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadInstitutions = async (skipCache: boolean = false) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await MobileApi.getInstitutions({}, skipCache);
      if (res.success && Array.isArray(res.institutions)) {
        setInstitutions(res.institutions);
      } else {
        setInstitutions([]);
      }
    } catch (e: any) {
      const message = e?.userMessage || e?.message || 'প্রতিষ্ঠানসমূহের তালিকা লোড করতে সমস্যা হয়েছে।';
      setLoadError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInstitutions(false);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadInstitutions(true);
  };

  const filtered = institutions.filter(i => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (i.nameBn && i.nameBn.toLowerCase().includes(q)) ||
      (i.name && i.name.toLowerCase().includes(q)) ||
      (i.code && i.code.toLowerCase().includes(q)) ||
      (i.district && i.district.toLowerCase().includes(q))
    );
  });

  const renderInstitutionCard = ({ item }: { item: InstitutionItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.instIconBox}>
          <Ionicons name="school" size={22} color={Colors.tealAccent} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{item.nameBn || item.name}</Text>
          {item.nameBn && item.name && (
            <Text style={styles.cardSubTitle}>{item.name}</Text>
          )}
        </View>
        <Badge label={item.code || 'ক্যাম্পাস'} variant="neutral" />
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={14} color={Colors.subText} style={{ marginRight: 4 }} />
          <Text style={styles.footerText}>{item.district || 'বাংলাদেশ'}</Text>
        </View>

        {item.totalRegisteredDonors !== undefined && (
          <View style={styles.footerItem}>
            <Ionicons name="people-outline" size={14} color={Colors.tealAccent} style={{ marginRight: 4 }} />
            <Text style={[styles.footerText, { color: Colors.tealAccent, fontWeight: '700' }]}>
              {item.totalRegisteredDonors} জন রক্তদাতা
            </Text>
          </View>
        )}
      </View>
    </View>
  );

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
          placeholderTextColor="#94A3B8"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.subText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content Area */}
      <View style={styles.listContainer}>
        {loading && institutions.length === 0 ? (
          <StateView 
            type="loading" 
            message="শিক্ষা প্রতিষ্ঠানসমূহের তালিকা লোড হচ্ছে..." 
          />
        ) : loadError && institutions.length === 0 ? (
          <StateView 
            type="error"
            title="প্রতিষ্ঠান তালিকা লোড করতে ব্যর্থ হয়েছে"
            message={loadError}
            onRetry={() => loadInstitutions(true)}
            retryLabel="পুনরায় চেষ্টা করুন"
          />
        ) : filtered.length === 0 ? (
          <StateView 
            type="empty"
            icon="school-outline"
            title="কোনো প্রতিষ্ঠান পাওয়া যায়নি"
            message={searchQuery.trim()
              ? `"${searchQuery}" এর সাথে মিলে এমন কোনো ক্যাম্পাস বা শিক্ষা প্রতিষ্ঠান পাওয়া যায়নি। বানানের শুদ্ধতা যাচাই করুন।`
              : 'বর্তমানে প্ল্যাটফর্মে কোনো প্রতিষ্ঠান তালিকাভুক্ত নেই।'}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
            actionLabel={searchQuery ? 'অনুসন্ধান মুছুন' : undefined}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            renderItem={renderInstitutionCard}
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
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.mainText,
    height: '100%',
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.appBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.mainText,
  },
  cardSubTitle: {
    fontSize: 11.5,
    color: Colors.subText,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.appBorder,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.subText,
    fontWeight: '600',
  },
});
