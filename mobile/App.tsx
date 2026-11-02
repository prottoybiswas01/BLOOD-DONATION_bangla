import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { updateManager } from './src/services/updateService';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepareFonts() {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
        });
      } catch (e) {
        console.warn('[App] Font preloading warning:', e);
      } finally {
        setFontsLoaded(true);
      }
    }

    prepareFonts();

    // Trigger background OTA update check
    updateManager.checkAndDownloadUpdateInBackground();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#C62828" translucent={false} />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
