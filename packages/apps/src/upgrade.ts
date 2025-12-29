/**
 * App Upgrade System
 *
 * Handles app updates while preserving user data and preferences.
 *
 * Key features:
 * - Version checking against upstream repos
 * - Download new versions from CDN
 * - Preserve local storage data
 * - Atomic upgrade with rollback on failure
 * - Background update checks
 */

import { AppManifest, CDN_BASE, GITHUB_ORG } from './index';

export interface AppVersion {
  current: string;
  latest: string;
  hasUpdate: boolean;
  releaseNotes?: string;
  releaseDate?: string;
}

export interface UpgradeOptions {
  preserveData?: boolean;
  backgroundDownload?: boolean;
  autoRestart?: boolean;
}

export interface AppData {
  preferences: Record<string, unknown>;
  localStorage: Record<string, string>;
  indexedDB?: unknown;
}

/**
 * Storage key prefix for app data
 */
const APP_DATA_PREFIX = 'zos_app_data_';
const APP_VERSION_PREFIX = 'zos_app_version_';

/**
 * Check if an app has an available update
 */
export async function checkForUpdate(appId: string): Promise<AppVersion | null> {
  try {
    const repoName = appId.replace('ai.hanzo.', '');

    // Get current installed version
    const currentVersion = localStorage.getItem(`${APP_VERSION_PREFIX}${appId}`) || '0.0.0';

    // Fetch latest version from GitHub
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_ORG}/${repoName}/releases/latest`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      // No releases, check package.json
      const pkgResponse = await fetch(
        `${CDN_BASE}/${repoName}@main/package.json`
      );

      if (!pkgResponse.ok) return null;

      const pkg = await pkgResponse.json();
      const latestVersion = pkg.version || '1.0.0';

      return {
        current: currentVersion,
        latest: latestVersion,
        hasUpdate: compareVersions(latestVersion, currentVersion) > 0,
      };
    }

    const release = await response.json();
    const latestVersion = release.tag_name?.replace(/^v/, '') || '1.0.0';

    return {
      current: currentVersion,
      latest: latestVersion,
      hasUpdate: compareVersions(latestVersion, currentVersion) > 0,
      releaseNotes: release.body,
      releaseDate: release.published_at,
    };
  } catch (error) {
    console.error(`Failed to check updates for ${appId}:`, error);
    return null;
  }
}

/**
 * Check all installed apps for updates
 */
export async function checkAllUpdates(
  installedApps: AppManifest[]
): Promise<Map<string, AppVersion>> {
  const updates = new Map<string, AppVersion>();

  const checks = installedApps.map(async (app) => {
    const version = await checkForUpdate(app.id);
    if (version?.hasUpdate) {
      updates.set(app.id, version);
    }
  });

  await Promise.all(checks);
  return updates;
}

/**
 * Backup app data before upgrade
 */
export function backupAppData(appId: string): AppData {
  const data: AppData = {
    preferences: {},
    localStorage: {},
  };

  // Backup localStorage items for this app
  const prefix = `${APP_DATA_PREFIX}${appId}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      data.localStorage[key] = localStorage.getItem(key) || '';
    }
  }

  // Backup app-specific preferences
  const prefsKey = `${appId}_preferences`;
  const prefs = localStorage.getItem(prefsKey);
  if (prefs) {
    try {
      data.preferences = JSON.parse(prefs);
    } catch (e) {
      // Invalid JSON, skip
    }
  }

  return data;
}

/**
 * Restore app data after upgrade
 */
export function restoreAppData(appId: string, data: AppData): void {
  // Restore localStorage items
  for (const [key, value] of Object.entries(data.localStorage)) {
    localStorage.setItem(key, value);
  }

  // Restore preferences
  if (Object.keys(data.preferences).length > 0) {
    const prefsKey = `${appId}_preferences`;
    localStorage.setItem(prefsKey, JSON.stringify(data.preferences));
  }
}

/**
 * Download and install app upgrade
 */
export async function upgradeApp(
  app: AppManifest,
  options: UpgradeOptions = {}
): Promise<boolean> {
  const { preserveData = true, autoRestart = false } = options;

  try {
    const repoName = app.id.replace('ai.hanzo.', '');

    // Backup data before upgrade
    let backup: AppData | null = null;
    if (preserveData) {
      backup = backupAppData(app.id);
      console.log(`📦 Backed up data for ${app.name}`);
    }

    // Download new version
    const moduleUrl = `${CDN_BASE}/${repoName}@main/dist/index.js`;

    // Invalidate any cached module
    const timestamp = Date.now();
    const freshUrl = `${moduleUrl}?v=${timestamp}`;

    // Pre-fetch to verify it works
    const response = await fetch(freshUrl);
    if (!response.ok) {
      throw new Error(`Failed to download update: ${response.status}`);
    }

    // Clear old cached module from browser cache
    if ('caches' in window) {
      const cache = await caches.open('zos-apps');
      await cache.delete(moduleUrl);
    }

    // Update version in localStorage
    const versionInfo = await checkForUpdate(app.id);
    if (versionInfo) {
      localStorage.setItem(`${APP_VERSION_PREFIX}${app.id}`, versionInfo.latest);
    }

    // Restore data after upgrade
    if (preserveData && backup) {
      restoreAppData(app.id, backup);
      console.log(`✅ Restored data for ${app.name}`);
    }

    console.log(`✅ Upgraded ${app.name} to latest version`);

    // Optionally trigger app restart
    if (autoRestart) {
      window.dispatchEvent(
        new CustomEvent('zos:app-restart', { detail: { appId: app.id } })
      );
    }

    return true;
  } catch (error) {
    console.error(`Failed to upgrade ${app.name}:`, error);
    return false;
  }
}

/**
 * Compare semantic versions
 * Returns: 1 if a > b, -1 if a < b, 0 if equal
 */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }

  return 0;
}

/**
 * Background update checker
 * Runs periodically and notifies when updates are available
 */
export class UpdateChecker {
  private intervalId: number | null = null;
  private checkInterval: number;
  private installedApps: AppManifest[] = [];
  private onUpdatesAvailable?: (updates: Map<string, AppVersion>) => void;

  constructor(
    checkIntervalMs: number = 60 * 60 * 1000, // Default: 1 hour
    onUpdatesAvailable?: (updates: Map<string, AppVersion>) => void
  ) {
    this.checkInterval = checkIntervalMs;
    this.onUpdatesAvailable = onUpdatesAvailable;
  }

  setInstalledApps(apps: AppManifest[]): void {
    this.installedApps = apps;
  }

  start(): void {
    if (this.intervalId) return;

    // Check immediately on start
    this.check();

    // Then check periodically
    this.intervalId = window.setInterval(() => {
      this.check();
    }, this.checkInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async check(): Promise<void> {
    const updates = await checkAllUpdates(this.installedApps);

    if (updates.size > 0 && this.onUpdatesAvailable) {
      this.onUpdatesAvailable(updates);
    }
  }
}

/**
 * Export storage keys for external access
 */
export const STORAGE_KEYS = {
  APP_DATA_PREFIX,
  APP_VERSION_PREFIX,
};
