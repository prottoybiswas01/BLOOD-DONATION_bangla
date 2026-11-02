import Constants from 'expo-constants';

export const API_BASE_URL = 
  Constants.expoConfig?.extra?.apiUrl || 
  'https://blood-donationbangla.vercel.app/api';

export const APP_CONFIG = {
  version: '1.0.0',
  buildNumber: 1,
  appNameBn: 'রক্তদান বাংলাদেশ',
  appNameEn: 'Bangladesh Blood Donation Platform',
  platform: 'android' as const,
  emergencyCall999: '999',
  healthHotline16263: '16263',
  apkDownloadWebUrl: 'https://blood-donationbangla.vercel.app/#download-app'
};

