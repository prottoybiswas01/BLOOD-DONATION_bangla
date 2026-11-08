import { AppState, Platform } from 'react-native';
import { API_BASE_URL, APP_CONFIG } from '../api/config';

export interface AppReleaseInfo {
  platform: string;
  packageName: string;
  latestVersion: string;
  versionCode: number;
  minSupportedVersion: string;
  forceUpdate: boolean;
  downloadUrl: string;
  releaseNotes?: string;
  fileSizeMb?: number;
}

class VersionCheckManager {
  private sessionDismissed: boolean = false;
  private lastCheckedTimestamp: number = 0;
  private cachedRelease: AppReleaseInfo | null = null;

  /**
   * Reset session dismissal flag (e.g., on app full restart)
   */
  resetSessionDismissal() {
    this.sessionDismissed = false;
  }

  /**
   * Mark as dismissed for current session so user is not repeatedly interrupted
   */
  dismissForSession() {
    this.sessionDismissed = true;
  }

  isDismissedForSession(): boolean {
    return this.sessionDismissed;
  }

  /**
   * Check if a newer version is available on the server.
   * Completely non-blocking: Never throws, fails silently if offline.
   */
  async checkForNewVersion(force: boolean = false): Promise<{
    updateAvailable: boolean;
    release: AppReleaseInfo | null;
  }> {
    // If user already tapped "পরে করুন" in this session, do not interrupt again unless forced
    if (this.sessionDismissed && !force) {
      return { updateAvailable: false, release: this.cachedRelease };
    }

    // Rate-limit checks to at most once per 60 seconds (unless forced)
    const now = Date.now();
    if (!force && now - this.lastCheckedTimestamp < 60000 && this.cachedRelease) {
      const isNewer = this.cachedRelease.versionCode > APP_CONFIG.buildNumber;
      return {
        updateAvailable: isNewer,
        release: this.cachedRelease
      };
    }

    try {
      this.lastCheckedTimestamp = now;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${API_BASE_URL}/v1/app/latest`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-client-platform': Platform.OS,
          'x-app-version': APP_CONFIG.version,
          'x-app-build': String(APP_CONFIG.buildNumber)
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Fallback to /app/latest if /v1/app/latest returned 404
        const fallbackRes = await fetch(`${API_BASE_URL}/app/latest`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'x-client-platform': Platform.OS,
            'x-app-version': APP_CONFIG.version,
          }
        }).catch(() => null);

        if (!fallbackRes || !fallbackRes.ok) {
          return { updateAvailable: false, release: null };
        }
        const data = await fallbackRes.json();
        return this.processReleaseData(data);
      }

      const data = await response.json();
      return this.processReleaseData(data);
    } catch (err) {
      // Network failure, offline, or timeout: proceed gracefully without blocking user
      return { updateAvailable: false, release: null };
    }
  }

  private processReleaseData(data: any): {
    updateAvailable: boolean;
    release: AppReleaseInfo | null;
  } {
    if (!data || !data.versionCode) {
      return { updateAvailable: false, release: null };
    }

    const release: AppReleaseInfo = {
      platform: data.platform || 'android',
      packageName: data.packageName || 'org.bloodbd.app',
      latestVersion: data.latestVersion || '1.0.0',
      versionCode: typeof data.versionCode === 'number' ? data.versionCode : parseInt(data.versionCode, 10),
      minSupportedVersion: data.minSupportedVersion || '1.0.0',
      forceUpdate: Boolean(data.forceUpdate),
      downloadUrl: data.downloadUrl || 'https://blood-donationbangla.vercel.app',
      releaseNotes: data.releaseNotes,
      fileSizeMb: data.fileSizeMb
    };

    this.cachedRelease = release;

    // Check if server versionCode is higher than currently running app buildNumber
    const updateAvailable = release.versionCode > APP_CONFIG.buildNumber;

    return {
      updateAvailable,
      release
    };
  }
}

export const versionCheckManager = new VersionCheckManager();

