/**
 * Dynamic App Loader
 *
 * Loads apps dynamically from the zos-apps CDN or uses bundled fallbacks.
 * Core system apps are bundled for offline support.
 */

import React, { Suspense, lazy, useState, useEffect, ComponentType } from 'react';
import { ZWindow } from '@z-os/ui';

// CDN base for dynamic app loading
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/zos-apps';

// App component props interface
interface AppProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Bundled core system apps (for offline/boot)
const BUNDLED_APPS: Record<string, () => Promise<{ default: ComponentType<AppProps> }>> = {
  'Finder': () => import('./windows/FinderWindow'),
  'Terminal': () => import('./windows/TerminalWindow'),
  'System Preferences': () => import('./windows/SettingsWindow'),
};

// App metadata for dynamic loading
interface AppMeta {
  id: string;
  name: string;
  repo: string;
  bundled?: boolean;
}

// Registry of all apps with their loading info
const APP_REGISTRY: Record<string, AppMeta> = {
  'Finder': { id: 'ai.hanzo.finder', name: 'Finder', repo: 'finder', bundled: true },
  'Terminal': { id: 'ai.hanzo.terminal', name: 'Terminal', repo: 'terminal', bundled: true },
  'System Preferences': { id: 'ai.hanzo.settings', name: 'System Preferences', repo: 'settings', bundled: true },
  'Safari': { id: 'ai.hanzo.safari', name: 'Safari', repo: 'safari' },
  'Mail': { id: 'ai.hanzo.mail', name: 'Mail', repo: 'mail' },
  'Calendar': { id: 'ai.hanzo.calendar', name: 'Calendar', repo: 'calendar' },
  'Photos': { id: 'ai.hanzo.photos', name: 'Photos', repo: 'photos' },
  'Messages': { id: 'ai.hanzo.messages', name: 'Messages', repo: 'messages' },
  'FaceTime': { id: 'ai.hanzo.facetime', name: 'FaceTime', repo: 'facetime' },
  'Music': { id: 'ai.hanzo.music', name: 'Music', repo: 'music' },
  'Notes': { id: 'ai.hanzo.notes', name: 'Notes', repo: 'notes' },
  'Reminders': { id: 'ai.hanzo.reminders', name: 'Reminders', repo: 'reminders' },
  'TextEdit': { id: 'ai.hanzo.textedit', name: 'TextEdit', repo: 'textedit' },
  'Calculator': { id: 'ai.hanzo.calculator', name: 'Calculator', repo: 'calculator' },
  'Clock': { id: 'ai.hanzo.clock', name: 'Clock', repo: 'clock' },
  'Weather': { id: 'ai.hanzo.weather', name: 'Weather', repo: 'weather' },
  'Stickies': { id: 'ai.hanzo.stickies', name: 'Stickies', repo: 'stickies' },
  'Activity Monitor': { id: 'ai.hanzo.activity-monitor', name: 'Activity Monitor', repo: 'activity-monitor' },
  'Hanzo AI': { id: 'ai.hanzo.hanzo-ai', name: 'Hanzo AI', repo: 'hanzo-ai' },
  'Lux Wallet': { id: 'ai.hanzo.lux-wallet', name: 'Lux Wallet', repo: 'lux' },
  'Zoo': { id: 'ai.hanzo.zoo', name: 'Zoo', repo: 'zoo' },
  'App Store': { id: 'ai.hanzo.appstore', name: 'App Store', repo: 'appstore' },
};

// Cache for loaded app components
const appCache = new Map<string, ComponentType<AppProps>>();

/**
 * Load an app component dynamically
 */
async function loadApp(appName: string): Promise<ComponentType<AppProps>> {
  // Check cache first
  if (appCache.has(appName)) {
    return appCache.get(appName)!;
  }

  const meta = APP_REGISTRY[appName];
  if (!meta) {
    throw new Error(`Unknown app: ${appName}`);
  }

  // Use bundled version if available
  if (BUNDLED_APPS[appName]) {
    const module = await BUNDLED_APPS[appName]();
    appCache.set(appName, module.default);
    return module.default;
  }

  // Dynamic import from CDN
  const moduleUrl = `${CDN_BASE}/${meta.repo}@main/dist/index.js`;

  try {
    const module = await import(/* @vite-ignore */ moduleUrl);
    const Component = module.default;
    appCache.set(appName, Component);
    return Component;
  } catch (error) {
    console.error(`Failed to load app ${appName} from CDN:`, error);

    // Try loading bundled fallback if available
    const bundledLoader = await tryBundledFallback(appName);
    if (bundledLoader) {
      appCache.set(appName, bundledLoader);
      return bundledLoader;
    }

    throw error;
  }
}

/**
 * Try to load a bundled fallback for an app
 */
async function tryBundledFallback(appName: string): Promise<ComponentType<AppProps> | null> {
  // Map app names to bundled window components
  const bundledMap: Record<string, () => Promise<{ default: ComponentType<AppProps> }>> = {
    'Safari': () => import('./windows/SafariWindow'),
    'Calculator': () => import('./windows/CalculatorWindow'),
    'Clock': () => import('./windows/ClockWindow'),
    'Notes': () => import('./windows/NotesWindow'),
    'Weather': () => import('./windows/WeatherWindow'),
    'Reminders': () => import('./windows/RemindersWindow'),
    'Mail': () => import('./windows/MailWindow'),
    'Photos': () => import('./windows/PhotosWindow'),
    'Calendar': () => import('./windows/CalendarWindow'),
    'Messages': () => import('./windows/MessagesWindow'),
    'FaceTime': () => import('./windows/FaceTimeWindow'),
    'Music': () => import('./windows/MusicWindow'),
    'TextEdit': () => import('./windows/TextEditWindow'),
    'Hanzo AI': () => import('./windows/HanzoAIWindow'),
    'Lux Wallet': () => import('./windows/LuxWindow'),
    'Zoo': () => import('./windows/ZooWindow'),
    'Stickies': () => import('./windows/StickiesWindow'),
    'Activity Monitor': () => import('./windows/ActivityMonitorWindow'),
  };

  const loader = bundledMap[appName];
  if (loader) {
    try {
      const module = await loader();
      return module.default;
    } catch (e) {
      return null;
    }
  }

  return null;
}

/**
 * Loading placeholder component
 */
const LoadingPlaceholder: React.FC<{ appName: string }> = ({ appName }) => (
  <div className="flex items-center justify-center h-full bg-black/50">
    <div className="text-center text-white/70">
      <div className="w-8 h-8 mx-auto mb-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      <p className="text-sm">Loading {appName}...</p>
    </div>
  </div>
);

/**
 * Error fallback component
 */
const ErrorFallback: React.FC<{ appName: string; error: Error; onRetry: () => void }> = ({
  appName,
  error,
  onRetry,
}) => (
  <div className="flex items-center justify-center h-full bg-black/50">
    <div className="text-center text-white/70 p-6 max-w-sm">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-lg font-semibold mb-2">Failed to load {appName}</h3>
      <p className="text-sm text-white/50 mb-4">{error.message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

/**
 * Dynamic App Window Component
 *
 * Wraps dynamically loaded apps with ZWindow chrome and handles loading states.
 */
export interface DynamicAppWindowProps {
  appName: string;
  onClose: () => void;
  onFocus?: () => void;
}

export const DynamicAppWindow: React.FC<DynamicAppWindowProps> = ({
  appName,
  onClose,
  onFocus,
}) => {
  const [AppComponent, setAppComponent] = useState<ComponentType<AppProps> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAppComponent = async () => {
    setLoading(true);
    setError(null);

    try {
      const Component = await loadApp(appName);
      setAppComponent(() => Component);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppComponent();
  }, [appName]);

  if (loading) {
    return (
      <ZWindow
        title={appName}
        onClose={onClose}
        onFocus={onFocus}
        initialSize={{ width: 400, height: 300 }}
      >
        <LoadingPlaceholder appName={appName} />
      </ZWindow>
    );
  }

  if (error || !AppComponent) {
    return (
      <ZWindow
        title={appName}
        onClose={onClose}
        onFocus={onFocus}
        initialSize={{ width: 400, height: 300 }}
      >
        <ErrorFallback
          appName={appName}
          error={error || new Error('Component not loaded')}
          onRetry={loadAppComponent}
        />
      </ZWindow>
    );
  }

  // Render the loaded app component
  // Note: The app component should handle its own ZWindow wrapper
  return <AppComponent onClose={onClose} onFocus={onFocus} />;
};

/**
 * Check if an app is registered
 */
export function isAppRegistered(appName: string): boolean {
  return appName in APP_REGISTRY;
}

/**
 * Get app metadata
 */
export function getAppMeta(appName: string): AppMeta | undefined {
  return APP_REGISTRY[appName];
}

/**
 * Preload an app for faster opening
 */
export async function preloadApp(appName: string): Promise<void> {
  try {
    await loadApp(appName);
  } catch (e) {
    // Silently fail preloading
  }
}

/**
 * Preload commonly used apps
 */
export async function preloadCommonApps(): Promise<void> {
  const commonApps = ['Finder', 'Safari', 'Notes', 'Calculator'];
  await Promise.all(commonApps.map(preloadApp));
}

export default DynamicAppWindow;
