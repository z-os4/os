/**
 * zOS Apps Package
 *
 * Dynamic app loader that fetches applications from the zos-apps GitHub organization.
 * Apps are loaded on-demand rather than bundled.
 *
 * @example
 * ```tsx
 * import { fetchApps, loadApp, getInstalledApps } from '@z-os/apps';
 *
 * // Fetch available apps from GitHub
 * const apps = await fetchApps();
 *
 * // Load and render an app
 * const Calculator = await loadApp('calculator');
 * ```
 */

import type { AppCategory as BaseAppCategory } from '@z-os/core';

// ============================================================================
// Types
// ============================================================================

// Re-export base types and extend for App Store features
export type { AppManifest as BaseAppManifest, AppCategory as BaseAppCategory } from '@z-os/core';

/**
 * Extended app category including additional store categories
 */
export type AppCategory = BaseAppCategory | 'games' | 'audio' | 'social';

export interface ScreenshotConfig {
  /** Hero/featured image for cards */
  hero?: string;
  /** Array of screenshot URLs */
  images: string[];
  /** Optional video preview URL */
  video?: string;
}

export interface DownloadAsset {
  url: string;
  version?: string;
  size?: number;
  checksum?: string;
  arch?: 'x64' | 'arm64' | 'universal';
}

export interface DownloadConfig {
  macos?: DownloadAsset;
  windows?: DownloadAsset;
  linux?: DownloadAsset;
  web?: string;
}

export interface RatingInfo {
  average: number;
  count: number;
}

/**
 * App Store manifest - extends base manifest with store-specific fields
 */
export interface AppStoreManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  category: AppCategory;
  author?: string;
  repository?: string;
  homepage?: string;
  permissions?: string[];
  about?: string;
  help?: string[];
  docs?: string;
  site?: string;
  shortcuts?: string[];
  features?: string[];
  /** Screenshot gallery configuration */
  screenshots?: ScreenshotConfig;
  /** Platform-specific downloads */
  downloads?: DownloadConfig;
  /** App rating info */
  rating?: RatingInfo;
  /** Featured in App Store */
  featured?: boolean;
  /** Searchable tags */
  tags?: string[];
  /** Release date (ISO string) */
  releaseDate?: string;
  /** Support/issues URL */
  support?: string;
  /** Changelog URL */
  changelog?: string;
  window?: {
    defaultSize?: { width: number; height: number };
    minSize?: { width: number; height: number };
    maxSize?: { width: number; height: number };
    resizable?: boolean;
  };
}

/**
 * @deprecated Use AppStoreManifest instead
 */
export type AppManifest = AppStoreManifest;

export interface InstalledApp extends AppManifest {
  installedAt: Date;
  updatedAt?: Date;
  source: 'builtin' | 'zos-apps' | 'external';
  enabled: boolean;
}

export interface AppWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

export const GITHUB_ORG = 'zos-apps';
const GITHUB_API = 'https://api.github.com';
const RAW_GITHUB = 'https://raw.githubusercontent.com';
export const CDN_BASE = 'https://cdn.jsdelivr.net/gh/zos-apps';

const STORAGE_KEY = 'zos:apps:installed';
const CACHE_VERSION = 'v2'; // Increment to invalidate old cache with encoding issues
const CACHE_KEY = `zos:apps:cache:${CACHE_VERSION}`;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Resolve screenshot URL to full CDN path
 */
function resolveScreenshotUrl(repoName: string, relativePath: string): string {
  if (relativePath.startsWith('http')) return relativePath;
  return `${CDN_BASE}/${repoName}@main/${relativePath}`;
}

// ============================================================================
// GitHub API
// ============================================================================

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  default_branch: string;
  archived: boolean;
}

/**
 * Fetch all available apps from the zos-apps GitHub organization
 */
export async function fetchApps(): Promise<AppManifest[]> {
  // Check cache first
  const cached = getCachedApps();
  if (cached) return cached;

  try {
    const response = await fetch(
      `${GITHUB_API}/orgs/${GITHUB_ORG}/repos?per_page=100&sort=updated`
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();

    // Filter out archived repos and non-app repos
    const appRepos = repos.filter(
      (r) => !r.archived && r.name !== 'template' && r.name !== '.github'
    );

    // Fetch manifests for each app
    const apps = await Promise.all(
      appRepos.map((repo) => fetchAppManifest(repo))
    );

    // Filter out nulls (failed fetches)
    const validApps = apps.filter((a): a is AppManifest => a !== null);

    // Cache results
    setCachedApps(validApps);

    return validApps;
  } catch (error) {
    console.error('Failed to fetch apps:', error);
    throw error;
  }
}

/**
 * Fetch app manifest from package.json
 */
async function fetchAppManifest(repo: GitHubRepo): Promise<AppManifest | null> {
  try {
    const response = await fetch(
      `${RAW_GITHUB}/${repo.full_name}/${repo.default_branch}/package.json`
    );

    if (!response.ok) {
      return createManifestFromRepo(repo);
    }

    const pkg = await response.json();
    const zos = pkg.zos || {};

    // Resolve screenshot URLs
    let screenshots: ScreenshotConfig | undefined;
    if (zos.screenshots) {
      screenshots = {
        hero: zos.screenshots.hero
          ? resolveScreenshotUrl(repo.name, zos.screenshots.hero)
          : undefined,
        images: (zos.screenshots.images || []).map((img: string) =>
          resolveScreenshotUrl(repo.name, img)
        ),
        video: zos.screenshots.video,
      };
    }

    return {
      id: zos.id || `ai.hanzo.${repo.name}`,
      name: zos.name || formatName(repo.name),
      version: pkg.version || '1.0.0',
      description: zos.description || pkg.description || repo.description || '',
      icon: zos.icon || '📦',
      category: zos.category || 'other',
      author: zos.author || pkg.author || 'zOS Community',
      repository: repo.html_url,
      homepage: pkg.homepage,
      permissions: zos.permissions || [],
      about: zos.about,
      help: zos.help,
      docs: zos.docs || `https://${GITHUB_ORG}.github.io/${repo.name}`,
      site: zos.site || repo.html_url,
      shortcuts: zos.shortcuts,
      features: zos.features,
      screenshots,
      downloads: zos.downloads,
      rating: zos.rating,
      featured: zos.featured || false,
      tags: zos.tags || [],
      releaseDate: zos.releaseDate,
      support: zos.support || `${repo.html_url}/issues`,
      changelog: zos.changelog || `${repo.html_url}/releases`,
      window: zos.window,
    };
  } catch {
    return createManifestFromRepo(repo);
  }
}

/**
 * Create basic manifest from repo info
 */
function createManifestFromRepo(repo: GitHubRepo): AppManifest {
  return {
    id: `ai.hanzo.${repo.name}`,
    name: formatName(repo.name),
    version: '1.0.0',
    description: repo.description || `${formatName(repo.name)} app for zOS`,
    icon: '📦',
    category: 'other',
    repository: repo.html_url,
    docs: `https://${GITHUB_ORG}.github.io/${repo.name}`,
    site: repo.html_url,
  };
}

/**
 * Format repo name to display name
 */
function formatName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// App Installation
// ============================================================================

/**
 * Get installed apps from localStorage
 */
export function getInstalledApps(): InstalledApp[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    return JSON.parse(stored).map((app: InstalledApp) => ({
      ...app,
      installedAt: new Date(app.installedAt),
      updatedAt: app.updatedAt ? new Date(app.updatedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Install an app
 */
export function installApp(manifest: AppManifest): InstalledApp {
  const apps = getInstalledApps();

  const installed: InstalledApp = {
    ...manifest,
    installedAt: new Date(),
    source: 'zos-apps',
    enabled: true,
  };

  const filtered = apps.filter((a) => a.id !== manifest.id);
  saveInstalledApps([...filtered, installed]);

  window.dispatchEvent(new CustomEvent('zos:app-installed', { detail: installed }));

  return installed;
}

/**
 * Uninstall an app
 */
export function uninstallApp(id: string): void {
  const apps = getInstalledApps();
  const app = apps.find((a) => a.id === id);

  if (app?.source === 'builtin') {
    throw new Error('Cannot uninstall builtin apps');
  }

  const filtered = apps.filter((a) => a.id !== id);
  saveInstalledApps(filtered);

  window.dispatchEvent(new CustomEvent('zos:app-uninstalled', { detail: id }));
}

/**
 * Save installed apps to localStorage
 */
function saveInstalledApps(apps: InstalledApp[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  window.dispatchEvent(new CustomEvent('zos:apps-updated', { detail: apps }));
}

// ============================================================================
// Cache
// ============================================================================

function getCachedApps(): AppManifest[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { apps, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return apps;
  } catch {
    return null;
  }
}

function setCachedApps(apps: AppManifest[]): void {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ apps, timestamp: Date.now() })
  );
}

/**
 * Clear app cache
 */
export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

// ============================================================================
// Category Helpers
// ============================================================================

export const categoryLabels: Record<AppCategory, string> = {
  productivity: 'Productivity',
  development: 'Development',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  communication: 'Communication',
  finance: 'Finance',
  system: 'System',
  games: 'Games',
  audio: 'Audio',
  social: 'Social',
  other: 'Other',
};

export const categoryIcons: Record<AppCategory, string> = {
  productivity: '📊',
  development: '💻',
  utilities: '🔧',
  entertainment: '🎬',
  communication: '💬',
  finance: '💰',
  system: '⚙️',
  games: '🎮',
  audio: '🎵',
  social: '👥',
  other: '📦',
};

// ============================================================================
// Upgrade System
// ============================================================================

export * from './upgrade';
