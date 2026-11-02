import * as Updates from 'expo-updates';

export interface UpdateStatus {
  isChecking: boolean;
  isDownloading: boolean;
  updateAvailable: boolean;
  updateDownloaded: boolean;
  error: string | null;
  manifestId?: string;
  channel?: string;
  runtimeVersion?: string;
}

/**
 * UpdateService
 * Manages Expo EAS Over-The-Air (OTA) updates.
 * - Checks for updates automatically in the background
 * - Downloads compatible updates silently
 * - Applies updates seamlessly on next app launch
 * - Preserves all user data (AsyncStorage, SecureStore, SQLite)
 */
class UpdateManager {
  private status: UpdateStatus = {
    isChecking: false,
    isDownloading: false,
    updateAvailable: false,
    updateDownloaded: false,
    error: null,
  };

  /**
   * Check and download updates in background.
   * Never blocks app startup or active user interactions.
   */
  async checkAndDownloadUpdateInBackground(): Promise<UpdateStatus> {
    if (__DEV__) {
      // In development mode, OTA updates are not active
      return this.status;
    }

    try {
      this.status.isChecking = true;
      this.status.error = null;
      this.status.channel = Updates.channel || 'production';
      this.status.runtimeVersion = Updates.runtimeVersion || '1.0.0';

      if (!Updates.isEnabled) {
        console.log('[UpdateService] Updates are not enabled in this build environment.');
        return this.status;
      }

      console.log(`[UpdateService] Checking for updates (Channel: ${this.status.channel}, Runtime: ${this.status.runtimeVersion})...`);
      
      const checkResult = await Updates.checkForUpdateAsync();

      if (checkResult.isAvailable) {
        this.status.updateAvailable = true;
        this.status.isDownloading = true;
        console.log('[UpdateService] Compatible update found! Downloading in background...');

        const fetchResult = await Updates.fetchUpdateAsync();
        
        if (fetchResult.isNew) {
          this.status.updateDownloaded = true;
          this.status.manifestId = fetchResult.manifest?.id;
          console.log(`[UpdateService] Update ${this.status.manifestId || ''} downloaded successfully. It will be applied on the next app launch.`);
        }
      } else {
        console.log('[UpdateService] App is up to date with the latest bundle.');
      }
    } catch (err: any) {
      this.status.error = err?.message || 'Failed to check or fetch update';
      // Non-blocking: Network failures during background check must not crash the app
      console.warn('[UpdateService] Update check warning (offline or unreachable):', this.status.error);
    } finally {
      this.status.isChecking = false;
      this.status.isDownloading = false;
    }

    return this.status;
  }

  getStatus(): UpdateStatus {
    return { ...this.status };
  }
}

export const updateManager = new UpdateManager();

