import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MobileApi } from '../api/client';
import { DonorCard, DonorItem } from '../components/DonorCard';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { detectDeviceDistrict, DetectedLocation } from '../utils/location';
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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalFound, setTotalFound] = useState(0);

  const performSearch = async (targetDistrict: string, targetDivision: string, blood: string) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        district: targetDistrict,
        division: targetDivision,
        // Rule: Default district search must show no more than seven eligible donors
        limit: 7
      };
      if (blood !== 'সকল') {
        params.bloodGroup = blood;
      }

      const res = await MobileApi.searchDonors(params);
      if (res.success && res.donors) {
        // Strict district enforcement: filter out any donors not in target district
        const strictDistrictDonors = res.donors.filter(
          (d: any) => d.district?.toLowerCase() === targetDistrict.toLowerCase()
        ).slice(0, 7);

        setDonors(strictDistrictDonors);
        setTotalFound(res.total || strictDistrictDonors.length);
      } else {
        setDonors([]);
        setTotalFound(0);
      }
    } catch (err: any) {
      console.warn('Search donors error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial load: Attempt GPS detection first
    handleDetectLocation();
  }, []);

  const handleDetectLocation = async () => {
    setLocatingGps(true);
    try {
      const res = await detectDeviceDistrict();
      if (res.success && res.location) {
        setDistrict(res.location.district);
        setDivision(res.location.division);
        setDistrictNameBn(res.location.districtNameBn);
        setIsGpsVerified(true);
        performSearch(res.location.district, res.location.division, selectedGroup);
      } else {
        setIsGpsVerified(false);
        // Default to Dhaka if permission denied or unavailable, without guessing
        performSearch(district, division, selectedGroup);
      }
    } catch (e) {
      setIsGpsVerified(false);
      performSearch(district, division, selectedGroup);
    } finally {
      setLocatingGps(false);
    }
  };

  const handleSelectGroup = (bg: string) => {
    setSelectedGroup(bg);
    performSearch(district, division, bg);
  };

  const handleLocationSelect = (newDiv: string, newDist: string, newDistBn: string) => {
    setDivision(newDiv);
    setDistrict(newDist);
    setDistrictNameBn(newDistBn);
    setIsGpsVerified(false); // Manually set
    performSearch(newDist, newDiv, selectedGroup);
  };

  const onRefresh = () => {
    setRefreshing(true);
    performSearch(district, division, selectedGroup);
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
        // Update local state to show phone
        setDonors(prev => prev.map(d => d._id === donor._id ? { ...d, phone: res.phone } : d));
      } else {
        Alert.alert('অনুপলব্ধ', res.message || 'নম্বর উন্মুক্ত করা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'যোগাযোগের তথ্য পেতে ব্যর্থ হয়েছে।');
    }
  };

  return (
    <View style={styles.container}>
      {/* Location Bar with GPS status */}
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
            onPress={handleDetectLocation}
            disabled={locatingGps}
            style={styles.gpsBtn}
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
          >
            <Text style={styles.changeLocBtnText}>পরিবর্তন</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Blood Group Chips Horizontal Scroll */}
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

      {/* Strict District Notice */}
      <View style={styles.noticeBar}>
        <Ionicons name="shield-checkmark" size={14} color="#059669" />
        <Text style={styles.noticeText}>
          জেলা ফিল্টার সক্রিয়: সর্বাধিক ৭ জন যাচাইকৃত রক্তদাতা প্রদর্শিত হচ্ছে।
        </Text>
      </View>

      {/* Donors List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : donors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>কোনো রক্তদাতা পাওয়া যায়নি</Text>
            <Text style={styles.emptySub}>
              {districtNameBn} জেলায় {selectedGroup !== 'সকল' ? `${selectedGroup} গ্রুপের ` : ''}আপাতত কোনো সক্রিয় রক্তদাতা নেই। অন্য জেলা বা গ্রুপ নির্বাচন করে চেষ্টা করুন।
            </Text>
          </View>
        ) : (
          donors.map(d => (
            <DonorCard 
              key={d._id} 
              donor={d} 
              onRevealContact={handleRevealContact}
              isLoggedIn={!!user}
            />
          ))
        )}
      </ScrollView>

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
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  changeLocBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.mainText,
  },
  bloodFilterContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.appBorder,
  },
  bloodChipsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.appBorder,
    marginRight: 4,
  },
  bloodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bloodChipText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.mainText,
  },
  bloodChipTextActive: {
    color: '#FFFFFF',
  },
  noticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  noticeText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.appBorder,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.mainText,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.subText,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
});

