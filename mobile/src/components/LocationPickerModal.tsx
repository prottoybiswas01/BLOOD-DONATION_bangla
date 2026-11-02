import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshLocations';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDivision: string;
  selectedDistrict: string;
  onSelect: (division: string, district: string, districtNameBn: string) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  selectedDivision,
  selectedDistrict,
  onSelect
}) => {
  const [activeDivision, setActiveDivision] = useState(selectedDivision || 'dhaka');

  const currentDivObj = BANGLADESH_DIVISIONS.find(d => d.id === activeDivision);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={20} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.title}>জেলা নির্বাচন করুন</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.mainText} />
            </TouchableOpacity>
          </View>

          {/* Division Selector Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.divScroll}
            contentContainerStyle={styles.divContainer}
          >
            {BANGLADESH_DIVISIONS.map(d => (
              <TouchableOpacity
                key={d.id}
                onPress={() => setActiveDivision(d.id)}
                style={[
                  styles.divChip,
                  activeDivision === d.id && styles.divChipActive
                ]}
              >
                <Text style={[
                  styles.divText,
                  activeDivision === d.id && styles.divTextActive
                ]}>
                  {d.nameBn}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Districts Grid */}
          <Text style={styles.subHeading}>
            {currentDivObj?.nameBn} বিভাগের জেলাসমূহ:
          </Text>

          <ScrollView style={styles.districtList}>
            <View style={styles.districtGrid}>
              {currentDivObj?.districts.map(dst => {
                const isSelected = dst.id === selectedDistrict;
                return (
                  <TouchableOpacity
                    key={dst.id}
                    onPress={() => {
                      onSelect(activeDivision, dst.id, dst.nameBn);
                      onClose();
                    }}
                    style={[
                      styles.districtItem,
                      isSelected && styles.districtItemActive
                    ]}
                  >
                    <Text style={[
                      styles.districtText,
                      isSelected && styles.districtTextActive
                    ]}>
                      {dst.nameBn} ({dst.nameEn})
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.appBorder,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.mainText,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divScroll: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  divContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  divChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.appBorder,
    marginRight: 6,
  },
  divChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  divText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.mainText,
  },
  divTextActive: {
    color: '#FFFFFF',
  },
  subHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.subText,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
  },
  districtList: {
    paddingHorizontal: 16,
  },
  districtGrid: {
    paddingBottom: 20,
  },
  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  districtItemActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: '#FECDD3',
  },
  districtText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.mainText,
  },
  districtTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
