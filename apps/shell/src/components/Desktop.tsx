import React, { useState, useCallback, Suspense } from 'react';
import { useWindowManager, useDesktopSettings, type AppType } from '@z-os/core';
import { loadApp, type LoadedApp } from '@z-os/apps-loader';

interface DesktopProps {
  isLocked: boolean;
  onUnlock: () => void;
  onShutdown: () => void;
  onRestart: () => void;
  onLock: () => void;
}

// Dynamic app window wrapper
const DynamicAppWindow: React.FC<{
  identifier: string;
  onClose: () => void;
}> = ({ identifier, onClose }) => {
  const [app, setApp] = useState<LoadedApp | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadApp(identifier)
      .then(setApp)
      .catch(err => setError(err.message));
  }, [identifier]);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="bg-red-900 p-4 rounded-lg text-white">
          <h3>Failed to load app</h3>
          <p className="text-sm text-white/70">{error}</p>
          <button onClick={onClose} className="mt-2 px-4 py-1 bg-white/10 rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="text-white">Loading {identifier}...</div>
      </div>
    );
  }

  const AppComponent = app.component;
  return <AppComponent onClose={onClose} />;
};

const Desktop: React.FC<DesktopProps> = ({
  isLocked,
  onUnlock,
  onShutdown,
  onRestart,
  onLock,
}) => {
  const windows = useWindowManager();
  const { theme, customBgUrl } = useDesktopSettings();
  const wallpaper = customBgUrl || `/wallpapers/${theme}.jpg`;
  const [dynamicApps, setDynamicApps] = useState<string[]>([]);

  const openDynamicApp = useCallback((identifier: string) => {
    if (!dynamicApps.includes(identifier)) {
      setDynamicApps(prev => [...prev, identifier]);
    }
  }, [dynamicApps]);

  const closeDynamicApp = useCallback((identifier: string) => {
    setDynamicApps(prev => prev.filter(id => id !== identifier));
  }, []);

  if (isLocked) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover' }}
      >
        <div className="text-center text-white">
          <div className="w-24 h-24 rounded-full bg-white/20 mb-4 mx-auto" />
          <h2 className="text-2xl font-semibold mb-2">zOS</h2>
          <button
            onClick={onUnlock}
            className="px-6 py-2 bg-white/20 rounded-full hover:bg-white/30"
          >
            Click to unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full"
      style={{ backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover' }}
    >
      {/* Menu Bar */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-black/30 backdrop-blur-xl flex items-center px-4 text-white text-sm">
        <span className="font-semibold">🍎</span>
        <span className="ml-4">Finder</span>
        <span className="ml-auto">{new Date().toLocaleTimeString()}</span>
      </div>

      {/* Desktop Content */}
      <div className="pt-7 pb-20 h-full">
        {/* Dynamic App Windows */}
        {dynamicApps.map(identifier => (
          <Suspense key={identifier} fallback={<div>Loading...</div>}>
            <DynamicAppWindow
              identifier={identifier}
              onClose={() => closeDynamicApp(identifier)}
            />
          </Suspense>
        ))}
      </div>

      {/* Dock */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="flex items-end gap-1 px-2 py-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
          <DockIcon label="Finder" icon="📁" onClick={() => windows.openWindow('Finder')} />
          <DockIcon label="Safari" icon="🧭" onClick={() => windows.openWindow('Safari')} />
          <DockIcon label="Terminal" icon="💻" onClick={() => windows.openWindow('Terminal')} />
          <DockIcon label="Calculator" icon="🧮" onClick={() => openDynamicApp('ai.hanzo.calculator')} />
          <DockIcon label="Notes" icon="📝" onClick={() => openDynamicApp('ai.hanzo.notes')} />
          <DockIcon label="Settings" icon="⚙️" onClick={() => windows.openWindow('System Preferences')} />
          <div className="w-px h-8 bg-white/20 mx-1" />
          <DockIcon label="App Store" icon="🛍️" onClick={() => windows.openWindow('App Store')} />
          <DockIcon label="Trash" icon="🗑️" />
        </div>
      </div>
    </div>
  );
};

const DockIcon: React.FC<{ label: string; icon: string; onClick?: () => void }> = ({
  label,
  icon,
  onClick
}) => (
  <button
    onClick={onClick}
    className="w-12 h-12 flex items-center justify-center text-2xl rounded-xl hover:bg-white/10 transition-transform hover:scale-110"
    title={label}
  >
    {icon}
  </button>
);

export default Desktop;
