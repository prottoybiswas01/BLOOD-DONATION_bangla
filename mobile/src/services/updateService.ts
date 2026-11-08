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
   * Automatic silent background OTA updates are intentionally disabled.
   * All updates are controlled via user-driven In-App Prompts (with "আপডেট করুন" and "পরে করুন" choices).
   */
  async checkAndDownloadUpdateInBackground(): Promise<UpdateStatus> {
    console.log('[UpdateService] Silent background updates are disabled to respect user choice.');
    return this.status;
  }

  getStatus(): UpdateStatus {
    return { ...this.status };
  }
}

export const updateManager = new UpdateManager();

