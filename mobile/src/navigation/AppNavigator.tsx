import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

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

// Tab Wrapper Component that maintains state and renders active tab screen with custom bottom bar
const MainTabNavigator: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState<'Home' | 'Donors' | 'Requests' | 'Institutions' | 'Profile'>('Home');

  const renderActiveTabScreen = () => {
    switch (currentTab) {
      case 'Home':
        return (
          <HomeScreen
            onNavigate={(screen) => {
              if (screen === 'DonorSearch' || screen === 'Donors') setCurrentTab('Donors');
              else if (screen === 'BloodRequests' || screen === 'Requests') setCurrentTab('Requests');
              else if (screen === 'Institutions') setCurrentTab('Institutions');
              else if (screen === 'Profile') setCurrentTab('Profile');
              else navigation.navigate(screen);
            }}
          />
        );
      case 'Donors':
        return <DonorSearchScreen />;
      case 'Requests':
        return (
          <BloodRequestsScreen
            onNavigateCreate={() => navigation.navigate('CreateRequest')}
          />
        );
      case 'Institutions':
        return <InstitutionsScreen />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} />;
      default:
        return (
          <HomeScreen
            onNavigate={(screen) => navigation.navigate(screen)}
          />
        );
    }
  };

  const tabs: { key: typeof currentTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'Home', label: 'হোম', icon: 'home' },
    { key: 'Donors', label: 'রক্তদাতা', icon: 'water' },
    { key: 'Requests', label: 'জরুরি আবেদন', icon: 'medkit' },
    { key: 'Institutions', label: 'প্রতিষ্ঠান', icon: 'school' },
    { key: 'Profile', label: 'প্রোফাইল', icon: 'person' }
  ];

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabContent}>{renderActiveTabScreen()}</View>
      <SafeAreaView style={styles.bottomBarSafeArea}>
        <View style={styles.bottomBar}>
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                onPress={() => setCurrentTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={22}
                  color={isActive ? Colors.primary : Colors.subText}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};

const CreateRequestScreenWrapper: React.FC<{ navigation: any }> = ({ navigation }) => (
  <CreateRequestScreen
    onSuccess={() => navigation.navigate('MainTabs')}
    onNavigateLogin={() => navigation.navigate('Login')}
  />
);

const LoginScreenWrapper: React.FC<{ navigation: any }> = ({ navigation }) => (
  <LoginScreen
    onSuccess={() => navigation.navigate('MainTabs')}
    onNavigateRegister={() => navigation.navigate('Register')}
    onNavigateRecovery={() => navigation.navigate('PasswordRecovery')}
  />
);

const RegisterScreenWrapper: React.FC<{ navigation: any }> = ({ navigation }) => (
  <RegisterScreen
    onSuccess={() => navigation.navigate('MainTabs')}
    onNavigateLogin={() => navigation.navigate('Login')}
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
    backgroundColor: Colors.page
  },
  tabContent: {
    flex: 1
  },
  bottomBarSafeArea: {
    backgroundColor: Colors.surface
  },
  bottomBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.appBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 4 : 0
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.subText,
    marginTop: 2,
    fontWeight: '500'
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700'
  }
});
