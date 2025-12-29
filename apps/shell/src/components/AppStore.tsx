import React, { useState, useEffect, useMemo } from 'react';
import { fetchApps, type AppManifest, categoryIcons } from '@z-os/apps';
import {
  Search,
  Grid,
  List,
  ExternalLink,
  Download,
  Star,
  Github,
  Book,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  FileText,
} from 'lucide-react';

interface AppStoreProps {
  onLaunchApp: (identifier: string) => void;
  onClose: () => void;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'date' | 'rating';

const AppStore: React.FC<AppStoreProps> = ({ onLaunchApp, onClose }) => {
  const [apps, setApps] = useState<AppManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [selectedApp, setSelectedApp] = useState<AppManifest | null>(null);

  useEffect(() => {
    fetchApps()
      .then(setApps)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ['all', ...new Set(apps.map((a) => a.category || 'other'))],
    [apps]
  );

  const featuredApps = useMemo(() => apps.filter((a) => a.featured), [apps]);

  const filteredApps = useMemo(() => {
    let result = apps;

    if (selectedCategory !== 'all') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query) ||
          a.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating?.average ?? 0) - (a.rating?.average ?? 0);
        case 'date':
          return (
            new Date(b.releaseDate || 0).getTime() -
            new Date(a.releaseDate || 0).getTime()
          );
        default:
          return 0;
      }
    });

    return result;
  }, [apps, selectedCategory, searchQuery, sortBy]);

  if (selectedApp) {
    return (
      <AppDetailView
        app={selectedApp}
        onBack={() => setSelectedApp(null)}
        onLaunch={() => onLaunchApp(selectedApp.id)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1c1c1e] text-white">
      {/* Header */}
      <header className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Discover</h1>
            <p className="text-white/50 text-sm">Apps for zOS</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2 py-1 bg-white/10 rounded text-sm border-none outline-none"
            >
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="date">Recent</option>
            </select>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-lg text-white
                       placeholder:text-white/40 focus:outline-none focus:ring-1
                       focus:ring-blue-500"
          />
        </div>
      </header>

      {/* Categories */}
      <nav className="p-4 border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm
                          capitalize whitespace-nowrap transition-colors
                ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
            >
              <span>{categoryIcons[cat as keyof typeof categoryIcons] || '📦'}</span>
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {/* Featured Section */}
        {selectedCategory === 'all' && !searchQuery && featuredApps.length > 0 && (
          <FeaturedSection
            apps={featuredApps}
            onSelect={setSelectedApp}
            onLaunch={onLaunchApp}
          />
        )}

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-white/50">Failed to load apps</p>
            <p className="text-white/30 text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && filteredApps.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/50">No apps found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-400 text-sm mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* App Grid/List */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
              : 'flex flex-col gap-2'
          }
        >
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              viewMode={viewMode}
              onClick={() => setSelectedApp(app)}
              onLaunch={() => onLaunchApp(app.id)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 border-t border-white/10 text-center text-xs text-white/30">
        {apps.length} apps available • Powered by zOS
      </footer>
    </div>
  );
};

// ============================================================================
// AppCard Component
// ============================================================================

interface AppCardProps {
  app: AppManifest;
  viewMode: ViewMode;
  onClick: () => void;
  onLaunch: () => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, viewMode, onClick, onLaunch }) => {
  const heroImage = app.screenshots?.hero || app.screenshots?.images?.[0];

  if (viewMode === 'list') {
    return (
      <div
        className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10
                   transition-colors cursor-pointer"
        onClick={onClick}
      >
        <div className="text-3xl flex-shrink-0">{app.icon || '📱'}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{app.name}</h3>
          <p className="text-white/50 text-sm truncate">{app.description}</p>
        </div>
        {app.rating && (
          <div className="flex items-center gap-1 text-sm text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            {app.rating.average.toFixed(1)}
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLaunch();
          }}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-sm rounded-lg"
        >
          Open
        </button>
      </div>
    );
  }

  return (
    <div
      className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10
                 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      {/* Screenshot Preview */}
      {heroImage ? (
        <div className="aspect-video bg-black/30 overflow-hidden">
          <img
            src={heroImage}
            alt={`${app.name} screenshot`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
          <span className="text-5xl">{app.icon || '📱'}</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{app.icon || '📱'}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{app.name}</h3>
            <p className="text-white/50 text-xs truncate capitalize">{app.category}</p>
          </div>
        </div>

        <p className="text-white/50 text-sm mt-2 line-clamp-2">{app.description}</p>

        <div className="mt-3 flex items-center justify-between">
          {app.rating ? (
            <div className="flex items-center gap-1 text-sm text-yellow-400">
              <Star className="w-3 h-3 fill-current" />
              {app.rating.average.toFixed(1)}
            </div>
          ) : (
            <span className="text-xs text-white/30">{app.version}</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLaunch();
            }}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-sm rounded-lg"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Featured Section
// ============================================================================

interface FeaturedSectionProps {
  apps: AppManifest[];
  onSelect: (app: AppManifest) => void;
  onLaunch: (id: string) => void;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ apps, onSelect, onLaunch }) => {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Featured</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {apps.map((app) => (
          <div
            key={app.id}
            className="flex-shrink-0 w-72 bg-gradient-to-br from-blue-600/30 to-purple-600/30
                       rounded-xl overflow-hidden cursor-pointer hover:from-blue-600/40
                       hover:to-purple-600/40 transition-colors"
            onClick={() => onSelect(app)}
          >
            {app.screenshots?.hero ? (
              <div className="aspect-video">
                <img
                  src={app.screenshots.hero}
                  alt={app.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <span className="text-6xl">{app.icon || '📱'}</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{app.icon || '📱'}</span>
                <div>
                  <h3 className="font-medium">{app.name}</h3>
                  <p className="text-white/50 text-xs capitalize">{app.category}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ============================================================================
// App Detail View
// ============================================================================

interface AppDetailViewProps {
  app: AppManifest;
  onBack: () => void;
  onLaunch: () => void;
}

const AppDetailView: React.FC<AppDetailViewProps> = ({ app, onBack, onLaunch }) => {
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const screenshots = app.screenshots?.images || [];

  return (
    <div className="h-full flex flex-col bg-[#1c1c1e] text-white overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 bg-[#1c1c1e]/95 backdrop-blur p-4 border-b border-white/10 z-10">
        <button onClick={onBack} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Back to Apps
        </button>
      </header>

      {/* App Info */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{app.icon || '📱'}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{app.name}</h1>
            <p className="text-white/50">{app.author || 'zOS Community'}</p>

            {app.rating && (
              <div className="flex items-center gap-2 mt-2">
                <RatingStars rating={app.rating.average} />
                <span className="text-white/50 text-sm">({app.rating.count} ratings)</span>
              </div>
            )}
          </div>
          <button
            onClick={onLaunch}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg font-medium"
          >
            Open
          </button>
        </div>
      </div>

      {/* Screenshot Gallery */}
      {screenshots.length > 0 && (
        <section className="px-6 pb-6">
          <h2 className="text-lg font-semibold mb-3">Screenshots</h2>

          {/* Main Screenshot */}
          <div className="relative aspect-video bg-black/30 rounded-lg overflow-hidden mb-3">
            <img
              src={screenshots[currentScreenshot]}
              alt={`Screenshot ${currentScreenshot + 1}`}
              className="w-full h-full object-contain"
            />

            {/* Navigation Arrows */}
            {screenshots.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentScreenshot((i) => (i > 0 ? i - 1 : screenshots.length - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50
                             rounded-full hover:bg-black/70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentScreenshot((i) => (i < screenshots.length - 1 ? i + 1 : 0))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50
                             rounded-full hover:bg-black/70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {screenshots.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {screenshots.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentScreenshot(i)}
                  className={`flex-shrink-0 w-20 aspect-video rounded overflow-hidden border-2
                             ${i === currentScreenshot ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Description */}
      <section className="px-6 pb-6">
        <h2 className="text-lg font-semibold mb-3">About</h2>
        <p className="text-white/70 leading-relaxed">{app.description || app.about}</p>

        {app.features && app.features.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-white/50 mb-2">Features</h3>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              {app.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {app.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-white/10 rounded text-xs text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Links */}
      <section className="px-6 pb-6">
        <h2 className="text-lg font-semibold mb-3">Information</h2>
        <div className="grid grid-cols-2 gap-3">
          {app.docs && <LinkButton icon={<Book className="w-4 h-4" />} label="Documentation" href={app.docs} />}
          {app.repository && (
            <LinkButton icon={<Github className="w-4 h-4" />} label="Repository" href={app.repository} />
          )}
          {app.site && <LinkButton icon={<Globe className="w-4 h-4" />} label="Website" href={app.site} />}
          {app.support && (
            <LinkButton icon={<MessageCircle className="w-4 h-4" />} label="Support" href={app.support} />
          )}
          {app.changelog && (
            <LinkButton icon={<FileText className="w-4 h-4" />} label="Changelog" href={app.changelog} />
          )}
          {app.homepage && (
            <LinkButton icon={<ExternalLink className="w-4 h-4" />} label="Homepage" href={app.homepage} />
          )}
        </div>
      </section>

      {/* Downloads */}
      {app.downloads && (
        <section className="px-6 pb-6">
          <h2 className="text-lg font-semibold mb-3">Downloads</h2>
          <div className="flex flex-wrap gap-3">
            {app.downloads.macos && (
              <DownloadLink platform="macOS" asset={app.downloads.macos} />
            )}
            {app.downloads.windows && (
              <DownloadLink platform="Windows" asset={app.downloads.windows} />
            )}
            {app.downloads.linux && (
              <DownloadLink platform="Linux" asset={app.downloads.linux} />
            )}
          </div>
        </section>
      )}

      {/* App Details */}
      <section className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/40">Version</span>
            <p>{app.version}</p>
          </div>
          <div>
            <span className="text-white/40">Category</span>
            <p className="capitalize">{app.category}</p>
          </div>
          {app.releaseDate && (
            <div>
              <span className="text-white/40">Released</span>
              <p>{new Date(app.releaseDate).toLocaleDateString()}</p>
            </div>
          )}
          {app.author && (
            <div>
              <span className="text-white/40">Developer</span>
              <p>{app.author}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Helper Components
// ============================================================================

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
};

interface LinkButtonProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const LinkButton: React.FC<LinkButtonProps> = ({ icon, label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg
               hover:bg-white/10 transition-colors text-sm"
  >
    {icon}
    {label}
  </a>
);

interface DownloadLinkProps {
  platform: string;
  asset: { url: string; version?: string; size?: number; arch?: string };
}

const DownloadLink: React.FC<DownloadLinkProps> = ({ platform, asset }) => (
  <a
    href={asset.url}
    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50
               rounded-lg hover:bg-blue-500/30 transition-colors"
  >
    <Download className="w-4 h-4" />
    <span>{platform}</span>
    {asset.arch && <span className="text-xs text-white/50">({asset.arch})</span>}
  </a>
);

export default AppStore;
