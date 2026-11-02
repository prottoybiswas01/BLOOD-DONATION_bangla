import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  FlatList,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MobileApi, MobileApiError } from '../api/client';
import { DonorCard, DonorItem } from '../components/DonorCard';
import { StateView } from '../components/StateView';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { detectDeviceDistrict } from '../utils/location';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['সকল', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonorSearchScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState('সকল');
  const [division, setDivision] = useState('dhaka');
  const [district, setDistrict] = useState('dhaka');
  const [districtNameBn, setDistrictNameBn] = useState('ঢাকা');
  const [isGpsVerified, setIsGpsVerified] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [totalFound, setTotalFound] = useState(0);

  // Keep track of active search invocation to prevent out-of-order stale response overwrites
  const currentSearchId = useRef(0);

  const performSearch = async (
    targetDistrict: string, 
    targetDivision: string, 
    blood: string,
    skipCache: boolean = false
  ) => {
    const searchId = ++currentSearchId.current;
    setLoading(true);
    setSearchError(null);

    try {
      const normalizedDistrict = (targetDistrict || '').toLowerCase().trim();
      const normalizedDivision = (targetDivision || '').toLowerCase().trim();

      const params: Record<string, any> = {
        district: normalizedDistrict,
        division: normalizedDivision,
        // Rule: Default district search must show no more than seven eligible donors
        limit: 7
      };

      if (blood !== 'সকল') {
        params.bloodGroup = blood;
      }

      const res = await MobileApi.searchDonors(params, skipCache);

      // Protect against out-of-order race conditions
      if (searchId !== currentSearchId.current) return;

      if (res.success && Array.isArray(res.donors)) {
        // Authoritative server response: normalize district field comparison
        const matchedDonors = res.donors.filter((d: any) => {
          if (!d.district) return true;
          return d.district.toLowerCase().trim() === normalizedDistrict;
        }).slice(0, 7);

        setDonors(matchedDonors);
        setTotalFound(res.total ?? matchedDonors.length);
      } else {
        setDonors([]);
        setTotalFound(0);
      }
    } catch (err: any) {
      if (searchId !== currentSearchId.current) return;
      const message = err?.userMessage || err?.message || 'রক্তদাতাদের তথ্য লোড করতে সমস্যা হয়েছে।';
      setSearchError(message);
    } finally {
      if (searchId === currentSearchId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    // 1. Immediately initiate search with default district (Dhaka) without waiting for GPS
    performSearch(district, division, selectedGroup, false);

    // 2. Non-blocking background GPS detection
    attemptBackgroundLocation();
  }, []);

  const attemptBackgroundLocation = async () => {
    setLocatingGps(true);
    try {
      const res = await detectDeviceDistrict();
      if (res.success && res.location) {
        const newDist = res.location.district;
        const newDiv = res.location.division;
        const newDistBn = res.location.districtNameBn;

        setDistrict(newDist);
        setDivision(newDiv);
        setDistrictNameBn(newDistBn);
        setIsGpsVerified(true);

        // If detected district differs from initial default, refresh results for that district
        if (newDist !== 'dhaka') {
          performSearch(newDist, newDiv, selectedGroup, false);
        }
      }
    } catch {
      // Non-blocking: retain default district silently
    } finally {
      setLocatingGps(false);
    }
  };

  const handleManualGpsPress = async () => {
    setLocatingGps(true);
    try {
      const res = await detectDeviceDistrict();
      if (res.success && res.location) {
        setDistrict(res.location.district);
        setDivision(res.location.division);
        setDistrictNameBn(res.location.districtNameBn);
        setIsGpsVerified(true);
        performSearch(res.location.district, res.location.division, selectedGroup, true);
      } else {
        Alert.alert(
          'জিপিএস লোকেশন',
          res.error || 'ডিভাইসের জিপিএস থেকে জেলা শনাক্ত করা সম্ভব হয়নি। অনুগ্রহ করে ম্যানুয়ালি জেলা নির্বাচন করুন।',
          [{ text: 'ঠিক আছে' }]
        );
      }
    } catch (e: any) {
      Alert.alert('জিপিএস ত্রুটি', e?.message || 'লোকেশন প্রাপ্তিতে সমস্যা হয়েছে।');
    } finally {
      setLocatingGps(false);
    }
  };

  const handleSelectGroup = (bg: string) => {
    setSelectedGroup(bg);
    performSearch(district, division, bg, false);
  };

  const handleLocationSelect = (newDiv: string, newDist: string, newDistBn: string) => {
    setDivision(newDiv);
    setDistrict(newDist);
    setDistrictNameBn(newDistBn);
    setIsGpsVerified(false); // Manually chosen
    performSearch(newDist, newDiv, selectedGroup, true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    performSearch(district, division, selectedGroup, true);
  };

  const handleRevealContact = async (donor: DonorItem) => {
    if (!user) {
      Alert.alert(
        'লগইন প্রয়োজন',
        'রক্তদাতার যোগাযোগের নম্বর দেখতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।',
        [{ text: 'ঠিক আছে' }]
      );
      return;
    }

    try {
      const res = await MobileApi.revealDonorContact(donor._id, 'emergency_search');
      if (res.success && res.phone) {
        Alert.alert(
          'রক্তদাতার মোবাইল নম্বর',
          `${donor.displayName}\nমোবাইল: ${res.phone}\n(ব্যবহার সীমা: দৈনিক সর্বোচ্চ ৫ জন)`,
          [{ text: 'ধন্যবাদ' }]
        );
        setDonors(prev => prev.map(d => d._id === donor._id ? { ...d, phone: res.phone } : d));
      } else {
        Alert.alert('অনুপলব্ধ', res.message || 'নম্বর উন্মুক্ত করা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.userMessage || err.message || 'যোগাযোগের তথ্য পেতে ব্যর্থ হয়েছে।');
    }
  };

  return (
    <View style={styles.container}>
      {/* Location Bar with GPS and Manual Selection */}
      <View style={styles.locationBar}>
        <View style={styles.locLeft}>
          <Ionicons 
            name={isGpsVerified ? "navigate-circle" : "location-sharp"} 
            size={18} 
            color={isGpsVerified ? Colors.tealAccent : Colors.primary} 
          />
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.locLabel}>
              {isGpsVerified ? 'যাচাইকৃত জিপিএস জেলা' : 'নির্বাচিত জেলা'}
            </Text>
            <Text style={styles.locDistrictText}>
              {districtNameBn} ({district.toUpperCase()})
            </Text>
          </View>
        </View>

        <View style={styles.locRight}>
          <TouchableOpacity 
            onPress={handleManualGpsPress}
            disabled={locatingGps}
            style={styles.gpsBtn}
            accessibilityLabel="জিপিএস দিয়ে অবস্থান খুঁজুন"
          >
            {locatingGps ? (
              <ActivityIndicator size="small" color={Colors.tealAccent} />
            ) : (
              <Ionicons name="locate" size={17} color={Colors.tealAccent} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setPickerVisible(true)}
            style={styles.changeLocBtn}
            activeOpacity={0.8}
            accessibilityLabel="জেলা পরিবর্তন করুন"
          >
            <Text style={styles.changeLocBtnText}>জেলা পরিবর্তন</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Blood Group Filter Chips */}
      <View style={styles.bloodFilterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bloodChipsScroll}
        >
          {BLOOD_GROUPS.map(bg => {
            const isSelected = selectedGroup === bg;
            return (
              <TouchableOpacity
                key={bg}
                onPress={() => handleSelectGroup(bg)}
                style={[
                  styles.bloodChip,
                  isSelected && styles.bloodChipActive
                ]}
                activeOpacity={0.75}
              >
                <Text style={[
                  styles.bloodChipText,
                  isSelected && styles.bloodChipTextActive
                ]}>
                  {bg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Strict 7-Donor Policy Bar */}
      <View style={styles.noticeBar}>
        <Ionicons name="shield-checkmark" size={14} color="#059669" />
        <Text style={styles.noticeText}>
          জেলা ভিত্তিক অনুসন্ধান: সর্বোচ্চ ৭ জন রক্তদাতা প্রদর্শিত হচ্ছে।
        </Text>
      </View>

      {/* Main Donor List with Explicit UI States */}
      <View style={styles.listContainer}>
        {loading && donors.length === 0 ? (
          <StateView 
            type="loading" 
            message={`${districtNameBn} জেলার রক্তদাতাদের তালিকা লোড হচ্ছে...`} 
          />
        ) : searchError && donors.length === 0 ? (
          <StateView 
            type="error"
            title="রক্তদাতা তথ্য লোড করতে ব্যর্থ হয়েছে"
            message={searchError}
            onRetry={() => performSearch(district, division, selectedGroup, true)}
            retryLabel="পুনরায় চেষ্টা করুন"
          />
        ) : donors.length === 0 ? (
          <StateView 
            type="empty"
            icon="search-outline"
            title="কোনো রক্তদাতা পাওয়া যায়নি"
            message={`${districtNameBn} জেলায় ${selectedGroup !== 'সকল' ? `${selectedGroup} গ্রুপের ` : ''}আপাতত কোনো সক্রিয় রক্তদাতা তালিকাভুক্ত নেই। অন্য জেলা বা গ্রুপ নির্বাচন করে চেষ্টা করতে পারেন।`}
            onAction={() => setPickerVisible(true)}
            actionLabel="অন্য জেলা নির্বাচন করুন"
          />
        ) : (
          <FlatList
            data={donors}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <DonorCard 
                donor={item} 
                onRevealContact={handleRevealContact}
                isLoggedIn={!!user}
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
            initialNumToRender={7}
            maxToRenderPerBatch={7}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        selectedDivision={division}
        selectedDistrict={district}
        onSelect={handleLocationSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.page,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.appBorder,
  },
  locLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locLabel: {
    fontSize: 10.5,
    color: Colors.subText,
    fontWeight: '600',
  },
  locDistrictText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.mainText,
  },
  locRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeLocBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  changeLocBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.mainText,
  },
  bloodFilterContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.appBorder,
  },
  bloodChipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  bloodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bloodChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.mainText,
  },
  bloodChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  noticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 6,
  },
  noticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
