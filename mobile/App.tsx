import React, { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { versionCheckManager, AppReleaseInfo } from './src/services/versionCheckService';
import { UpdatePromptModal } from './src/components/UpdatePromptModal';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState<AppReleaseInfo | null>(null);

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

    // Check version on initial app launch (non-blocking)
    const checkVersion = async () => {
      try {
        const res = await versionCheckManager.checkForNewVersion(false);
        if (res.updateAvailable && res.release) {
          setReleaseInfo(res.release);
          setUpdateAvailable(true);
        }
      } catch (e) {
        // Non-blocking
      }
    };

    checkVersion();

    // Check version when returning from background
    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkVersion();
      }
    });

    return () => {
      appStateSub.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#C62828" translucent={false} />
      <AuthProvider>
        <AppNavigator />
        <UpdatePromptModal
          visible={updateAvailable}
          release={releaseInfo}
          onDismiss={() => setUpdateAvailable(false)}
        />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
