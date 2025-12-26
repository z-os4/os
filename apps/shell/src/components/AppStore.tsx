import React, { useState, useEffect } from 'react';
import { getAvailableApps, type AppManifest } from '@z-os/apps-loader';

interface AppStoreProps {
  onLaunchApp: (identifier: string) => void;
  onClose: () => void;
}

const AppStore: React.FC<AppStoreProps> = ({ onLaunchApp, onClose }) => {
  const [apps, setApps] = useState<AppManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    getAvailableApps()
      .then(setApps)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(apps.map(a => a.category || 'other'))];

  const filteredApps = selectedCategory === 'all'
    ? apps
    : apps.filter(a => a.category === selectedCategory);

  return (
    <div className="h-full flex flex-col bg-[#1c1c1e] text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h1 className="text-xl font-semibold">Discover</h1>
        <p className="text-white/50 text-sm mt-1">Apps for zOS</p>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize whitespace-nowrap transition-colors
                ${selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">😕</div>
            <p className="text-white/50">Failed to load apps</p>
            <p className="text-white/30 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && filteredApps.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-white/50">No apps available</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredApps.map(app => (
            <div
              key={app.identifier}
              className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="text-4xl mb-3">{app.icon || '📱'}</div>
              <h3 className="font-medium truncate">{app.name}</h3>
              <p className="text-white/50 text-sm truncate">{app.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-white/30 capitalize">{app.category}</span>
                <button
                  onClick={() => onLaunchApp(app.identifier)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-sm rounded-lg transition-colors"
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-center text-xs text-white/30">
        {apps.length} apps available • Powered by zOS
      </div>
    </div>
  );
};

export default AppStore;
