import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Platform,
  BackHandler
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AppRoutes, MainTabKey, resolveNavigationTarget } from './routes';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { DonorSearchScreen } from '../screens/DonorSearchScreen';
import { BloodRequestsScreen } from '../screens/BloodRequestsScreen';
import { CreateRequestScreen } from '../screens/CreateRequestScreen';
import { InstitutionsScreen } from '../screens/InstitutionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { PasswordRecoveryScreen } from '../screens/PasswordRecoveryScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { ModeratorDashboardScreen } from '../screens/ModeratorDashboardScreen';

const Stack = createNativeStackNavigator();

// Persistent Tab Navigator: Keeps screen states and lists alive without remount overhead
const MainTabNavigator: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState<MainTabKey>('Home');
  const insets = useSafeAreaInsets();

  // Android hardware back button handler
  useEffect(() => {
    const onBackPress = () => {
      if (currentTab !== 'Home') {
        setCurrentTab('Home');
        return true; // Prevent app exit, go to Home tab
      }
      return false; // On Home tab, let default Android back action occur
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandlerSubscription.remove();
  }, [currentTab]);

  const handleNavigate = (target: string) => {
    const resolved = resolveNavigationTarget(target);
    if (resolved.type === 'tab') {
      setCurrentTab(resolved.tab);
    } else {
      navigation.navigate(resolved.screen);
    }
  };

  const tabs: { key: MainTabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'Home', label: 'হোম', icon: 'home' },
    { key: 'Donors', label: 'রক্তদাতা', icon: 'water' },
    { key: 'Requests', label: 'জরুরি আবেদন', icon: 'medkit' },
    { key: 'Institutions', label: 'প্রতিষ্ঠান', icon: 'school' },
    { key: 'Profile', label: 'প্রোফাইল', icon: 'person' }
  ];

  return (
    <View style={styles.tabContainer}>
      {/* Persistent Tab Views to preserve state, scroll position & cache */}
      <View style={styles.screensArea}>
        <View style={[styles.screenWrapper, currentTab === 'Home' ? styles.visibleScreen : styles.hiddenScreen]}>
          <HomeScreen onNavigate={handleNavigate} />
        </View>

        <View style={[styles.screenWrapper, currentTab === 'Donors' ? styles.visibleScreen : styles.hiddenScreen]}>
          <DonorSearchScreen />
        </View>

        <View style={[styles.screenWrapper, currentTab === 'Requests' ? styles.visibleScreen : styles.hiddenScreen]}>
          <BloodRequestsScreen onNavigateCreate={() => navigation.navigate(AppRoutes.CREATE_REQUEST)} />
        </View>

        <View style={[styles.screenWrapper, currentTab === 'Institutions' ? styles.visibleScreen : styles.hiddenScreen]}>
          <InstitutionsScreen />
        </View>

        <View style={[styles.screenWrapper, currentTab === 'Profile' ? styles.visibleScreen : styles.hiddenScreen]}>
          <ProfileScreen navigation={navigation} />
        </View>
      </View>

      {/* Native-feeling Bottom Navigation Bar with Safe Area Insets */}
      <View 
        style={[
          styles.bottomBar, 
          { 
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 8),
            height: 60 + Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 8)
          }
        ]}
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => setCurrentTab(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <View style={[styles.iconIndicator, isActive && styles.iconIndicatorActive]}>
                <Ionicons
                  name={tab.icon}
                  size={21}
                  color={isActive ? Colors.primary : '#64748B'}
                />
              </View>
              <Text 
                style={[
                  styles.tabLabel, 
                  isActive && styles.tabLabelActive
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const CreateRequestScreenWrapper: React.FC<{ navigation: any }> = ({ navigation }) => (
  <CreateRequestScreen
    onSuccess={() => navigation.navigate(AppRoutes.MAIN_TABS)}
    onNavigateLogin={() => navigation.navigate(AppRoutes.LOGIN)}
  />
);

const LoginScreenWrapper: React.FC<{ navigation: any }> = ({ navigation }) => (
  <LoginScreen
    onSuccess={() => navigation.navigate(AppRoutes.MAIN_TABS)}
    onNavigateRegister={() => navigation.navigate(AppRoutes.REGISTER)}
    onNavigateRecovery={() => navigation.navigate(AppRoutes.PASSWORD_RECOVERY)}
  />
);

const RegisterScreenWrapper: React.FC<{ navigation: any }> = ({ navigation }) => (
  <RegisterScreen
    onSuccess={() => navigation.navigate(AppRoutes.MAIN_TABS)}
    onNavigateLogin={() => navigation.navigate(AppRoutes.LOGIN)}
  />
);

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="CreateRequest" component={CreateRequestScreenWrapper} />
        <Stack.Screen name="Login" component={LoginScreenWrapper} />
        <Stack.Screen name="Register" component={RegisterScreenWrapper} />
        <Stack.Screen name="PasswordRecovery" component={PasswordRecoveryScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="ModeratorDashboard" component={ModeratorDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: Colors.page,
  },
  screensArea: {
    flex: 1,
  },
  screenWrapper: {
    flex: 1,
  },
  visibleScreen: {
    display: 'flex',
  },
  hiddenScreen: {
    display: 'none',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.appBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 2,
  },
  iconIndicator: {
    width: 38,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconIndicatorActive: {
    backgroundColor: '#FEE2E2',
  },
  tabLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
