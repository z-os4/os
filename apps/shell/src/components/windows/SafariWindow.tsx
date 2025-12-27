import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZWindow } from '@z-os/ui';
import { ChevronLeft, ChevronRight, RotateCw, Share, Plus, Lock, Search, ExternalLink, Shield, Download, Code, Bug, Layers, Copy, Printer, BookOpen, Star, Home } from 'lucide-react';

interface SafariWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Tab {
  id: string;
  url: string;
  displayUrl: string;
  title: string;
  history: string[];
  historyIndex: number;
  favicon?: string;
}

// ============================================================================
// Google Search Component
// ============================================================================

interface GoogleSearchProps {
  onSearch: (query: string) => void;
}

const GoogleSearch: React.FC<GoogleSearchProps> = ({ onSearch }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInputRef.current?.value;
    if (query) onSearch(query);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8">
      <div className="mb-8">
        <svg viewBox="0 0 272 92" width="272" height="92">
          <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
          <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
          <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
          <path fill="#4285F4" d="M225 3v65h-9.5V3h9.5z"/>
          <path fill="#34A853" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
          <path fill="#EA4335" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
        </svg>
      </div>
      <form onSubmit={handleSearch} className="w-full max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search Google or type a URL"
            className="w-full px-12 py-3 text-lg border border-gray-200 rounded-full shadow-sm hover:shadow-md focus:shadow-md focus:outline-none transition-shadow"
            autoFocus
          />
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <button type="submit" className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
            Google Search
          </button>
          <button type="button" onClick={() => window.open('https://www.google.com/doodles', '_blank')} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
            I'm Feeling Lucky
          </button>
        </div>
      </form>
      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200">
        <div className="flex justify-between items-center px-6 py-3 text-sm text-gray-600">
          <span>United States</span>
          <div className="flex gap-6">
            <a href="https://about.google" target="_blank" rel="noopener noreferrer" className="hover:underline">About</a>
            <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Advertising</a>
            <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Business</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Search Results Component
// ============================================================================

interface SearchResultsProps {
  query: string;
  onNewSearch: (query: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onNewSearch }) => {
  const [results, setResults] = useState<Array<{title: string; snippet: string; url: string}>>([]);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=8`
        );
        const data = await response.json();
        if (data.query?.search) {
          setResults(data.query.search.map((item: { title: string; snippet: string }) => ({
            title: item.title,
            snippet: item.snippet.replace(/<[^>]*>/g, ''),
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`
          })));
        }
      } catch (e) {
        console.error('Search failed:', e);
      }
      setLoading(false);
    };
    fetchResults();
  }, [query]);

  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <form onSubmit={(e) => { e.preventDefault(); if (searchInputRef.current?.value) onNewSearch(searchInputRef.current.value); }} className="max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input ref={searchInputRef} type="text" defaultValue={query} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">Search</button>
        </form>
      </div>
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-sm text-gray-500 mb-4">
          Showing Wikipedia results for "{query}"
          <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')} className="ml-2 text-blue-500 hover:underline inline-flex items-center gap-1">
            Open Google <ExternalLink className="w-3 h-3" />
          </button>
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-12"><RotateCw className="w-6 h-6 text-gray-400 animate-spin" /></div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            {results.map((result, i) => (
              <div key={i}>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-lg font-medium">{result.title}</a>
                <p className="text-sm text-green-700 truncate">{result.url}</p>
                <p className="text-sm text-gray-600 mt-1">{result.snippet}...</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">No results found</p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Developer Tools Panel
// ============================================================================

interface DevToolsProps {
  url: string;
  pageSource: string;
  onClose: () => void;
}

const DevTools: React.FC<DevToolsProps> = ({ url, pageSource, onClose }) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'console' | 'network' | 'sources'>('elements');
  const [consoleLogs] = useState<string[]>([
    '[Info] Page loaded successfully',
    '[Info] DOM Content Loaded in 245ms',
    '[Info] Window loaded in 312ms',
  ]);

  return (
    <div className="h-64 border-t border-white/10 bg-[#1e1e1e] flex flex-col">
      <div className="flex items-center justify-between px-2 py-1 bg-[#252526] border-b border-white/10">
        <div className="flex gap-1">
          {(['elements', 'console', 'network', 'sources'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs rounded ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white/80'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">×</button>
      </div>
      <div className="flex-1 overflow-auto p-2 font-mono text-xs">
        {activeTab === 'elements' && (
          <pre className="text-green-400 whitespace-pre-wrap">{pageSource || `<!DOCTYPE html>\n<html>\n  <head>\n    <title>${url}</title>\n  </head>\n  <body>\n    <!-- Page content -->\n  </body>\n</html>`}</pre>
        )}
        {activeTab === 'console' && (
          <div className="space-y-1">
            {consoleLogs.map((log, i) => (
              <div key={i} className="text-white/80">{log}</div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-blue-400">&gt;</span>
              <input type="text" placeholder="Type command..." className="flex-1 bg-transparent border-none outline-none text-white/80" />
            </div>
          </div>
        )}
        {activeTab === 'network' && (
          <div className="space-y-1">
            <div className="flex gap-4 text-white/40 border-b border-white/10 pb-1 mb-2">
              <span className="w-48">Name</span><span className="w-20">Status</span><span className="w-20">Type</span><span>Size</span>
            </div>
            <div className="flex gap-4 text-white/80"><span className="w-48 truncate">{url}</span><span className="w-20 text-green-400">200</span><span className="w-20">document</span><span>12.4 KB</span></div>
            <div className="flex gap-4 text-white/80"><span className="w-48 truncate">style.css</span><span className="w-20 text-green-400">200</span><span className="w-20">stylesheet</span><span>3.2 KB</span></div>
            <div className="flex gap-4 text-white/80"><span className="w-48 truncate">app.js</span><span className="w-20 text-green-400">200</span><span className="w-20">script</span><span>45.6 KB</span></div>
          </div>
        )}
        {activeTab === 'sources' && (
          <div className="flex h-full">
            <div className="w-48 border-r border-white/10 pr-2">
              <div className="text-white/60 mb-2">Files</div>
              <div className="text-white/80 hover:bg-white/10 px-2 py-1 rounded cursor-pointer">index.html</div>
              <div className="text-white/80 hover:bg-white/10 px-2 py-1 rounded cursor-pointer">style.css</div>
              <div className="text-white/80 hover:bg-white/10 px-2 py-1 rounded cursor-pointer">app.js</div>
            </div>
            <div className="flex-1 pl-2">
              <pre className="text-white/80">{pageSource || '// Select a file to view source'}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// View Source Modal
// ============================================================================

interface ViewSourceProps {
  url: string;
  source: string;
  onClose: () => void;
}

const ViewSource: React.FC<ViewSourceProps> = ({ url, source, onClose }) => (
  <div className="absolute inset-0 bg-black/90 z-50 flex flex-col">
    <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10">
      <span className="text-white/80 text-sm">View Source: {url}</span>
      <div className="flex gap-2">
        <button onClick={() => navigator.clipboard.writeText(source)} className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white" title="Copy">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white">×</button>
      </div>
    </div>
    <pre className="flex-1 overflow-auto p-4 font-mono text-xs text-green-400 whitespace-pre-wrap">{source}</pre>
  </div>
);

// ============================================================================
// URL Utilities
// ============================================================================

const isGoogleUrl = (url: string): boolean => {
  try { return new URL(url).hostname.includes('google.com'); } catch { return false; }
};

const getSearchQuery = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'search.zos' || url.startsWith('search://')) return urlObj.searchParams.get('q');
  } catch {}
  return null;
};

const getPageTitle = (url: string): string => {
  if (isGoogleUrl(url)) return 'Google';
  const query = getSearchQuery(url);
  if (query) return `Search: ${query}`;
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// ============================================================================
// Safari Window Component
// ============================================================================

const SafariWindow: React.FC<SafariWindowProps> = ({ onClose, onFocus }) => {
  const createTab = (url = 'https://google.com'): Tab => ({
    id: generateId(),
    url,
    displayUrl: url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    title: getPageTitle(url),
    history: [url],
    historyIndex: 0,
  });

  const [tabs, setTabs] = useState<Tab[]>([createTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showViewSource, setShowViewSource] = useState(false);
  const [pageSource, setPageSource] = useState('');

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateActiveTab = useCallback((updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  }, [activeTabId]);

  const navigateTo = useCallback((newUrl: string) => {
    setIsLoading(true);
    const displayUrl = newUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const title = getPageTitle(newUrl);
    const newHistory = [...activeTab.history.slice(0, activeTab.historyIndex + 1), newUrl];
    updateActiveTab({
      url: newUrl,
      displayUrl,
      title,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
    setTimeout(() => setIsLoading(false), 500);
  }, [activeTab, updateActiveTab]);

  const handleSearch = useCallback((query: string) => {
    navigateTo(`search://zos?q=${encodeURIComponent(query)}`);
  }, [navigateTo]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = activeTab.displayUrl;
    if (!url.includes('.') || url.includes(' ')) { handleSearch(url); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    navigateTo(url);
  };

  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const url = activeTab.history[newIndex];
      updateActiveTab({
        historyIndex: newIndex,
        url,
        displayUrl: url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        title: getPageTitle(url),
      });
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const url = activeTab.history[newIndex];
      updateActiveTab({
        historyIndex: newIndex,
        url,
        displayUrl: url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        title: getPageTitle(url),
      });
    }
  };

  const refresh = () => { setIsLoading(true); setTimeout(() => setIsLoading(false), 500); };

  const newTab = () => {
    const tab = createTab();
    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return;
    const index = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (id === activeTabId) {
      setActiveTabId(newTabs[Math.min(index, newTabs.length - 1)].id);
    }
  };

  const duplicateTab = () => {
    const tab = createTab(activeTab.url);
    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
  };

  const viewSource = () => {
    const source = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeTab.title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav><!-- Navigation --></nav>
  </header>
  <main>
    <h1>${activeTab.title}</h1>
    <p>Page content for ${activeTab.url}</p>
  </main>
  <footer>
    <p>&copy; 2025</p>
  </footer>
  <script src="app.js"></script>
</body>
</html>`;
    setPageSource(source);
    setShowViewSource(true);
  };

  const openInNewWindow = () => window.open(activeTab.url, '_blank');
  const printPage = () => window.print();
  const copyUrl = () => navigator.clipboard.writeText(activeTab.url);
  const goHome = () => navigateTo('https://google.com');

  const searchQuery = getSearchQuery(activeTab.url);
  const showGoogleHome = isGoogleUrl(activeTab.url);

  // Google favicon for tab
  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  return (
    <ZWindow
      title="Safari"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 50 }}
      initialSize={{ width: 1100, height: 750 }}
      windowType="safari"
    >
      <div className="flex flex-col h-full bg-black/90 relative">
        {/* Unified toolbar with tabs (Safari style) */}
        <div className="flex items-center gap-2 px-2 py-1.5 bg-gradient-to-b from-[#3d3d3d] to-[#2d2d2d] border-b border-black/40">
          {/* Navigation buttons */}
          <div className="flex items-center gap-0.5">
            <button onClick={goBack} disabled={activeTab.historyIndex <= 0} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30" title="Back">
              <ChevronLeft className="w-4 h-4 text-white/80" />
            </button>
            <button onClick={goForward} disabled={activeTab.historyIndex >= activeTab.history.length - 1} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30" title="Forward">
              <ChevronRight className="w-4 h-4 text-white/80" />
            </button>
          </div>

          {/* Tabs - Safari style inline with toolbar */}
          {tabs.length > 1 && (
            <div className="flex items-center gap-0.5 mx-1">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`group flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer transition-all max-w-[180px] ${
                    tab.id === activeTabId 
                      ? 'bg-white/15 shadow-inner' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  {isGoogleUrl(tab.url) ? <GoogleIcon /> : (
                    <img src={`https://www.google.com/s2/favicons?domain=${tab.url}&sz=32`} alt="" className="w-4 h-4 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  )}
                  <span className="text-xs text-white/80 truncate">{tab.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} className="opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded w-4 h-4 flex items-center justify-center text-white/60 hover:text-white text-xs ml-1">×</button>
                </div>
              ))}
              <button onClick={newTab} className="p-1 rounded hover:bg-white/10 ml-1" title="New Tab">
                <Plus className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>
          )}

          {/* URL bar - centered and prominent */}
          <form onSubmit={handleUrlSubmit} className="flex-1 max-w-2xl mx-auto">
            <div className="relative flex items-center group">
              <div className="absolute inset-0 rounded-lg bg-black/40 border border-white/10 group-focus-within:border-blue-500/50 transition-all" />
              {activeTab.url.startsWith('https') && <Lock className="absolute left-3 w-3 h-3 text-emerald-400 z-10" />}
              {!activeTab.url.startsWith('https') && <Shield className="absolute left-3 w-3 h-3 text-white/40 z-10" />}
              <input
                type="text"
                value={activeTab.displayUrl}
                onChange={(e) => updateActiveTab({ displayUrl: e.target.value })}
                className="relative w-full h-7 pl-8 pr-10 bg-transparent text-sm text-white/90 text-center focus:outline-none z-10 placeholder:text-white/30"
                placeholder="Search or enter website name"
              />
              {isLoading ? (
                <RotateCw className="absolute right-3 w-3.5 h-3.5 text-white/60 animate-spin z-10" />
              ) : (
                <button type="button" onClick={refresh} className="absolute right-3 z-10">
                  <RotateCw className="w-3.5 h-3.5 text-white/40 hover:text-white/60" />
                </button>
              )}
            </div>
          </form>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5">
            <button onClick={goHome} className="p-1.5 rounded hover:bg-white/10" title="Home">
              <Home className="w-4 h-4 text-white/70" />
            </button>
            <button onClick={copyUrl} className="p-1.5 rounded hover:bg-white/10" title="Copy URL">
              <Share className="w-4 h-4 text-white/70" />
            </button>
            <button onClick={() => {}} className="p-1.5 rounded hover:bg-white/10" title="Add Bookmark">
              <Star className="w-4 h-4 text-white/70" />
            </button>
            <button onClick={openInNewWindow} className="p-1.5 rounded hover:bg-white/10" title="Open in New Window">
              <ExternalLink className="w-4 h-4 text-white/70" />
            </button>
            
            {/* Developer menu */}
            <div className="relative group">
              <button className="p-1.5 rounded hover:bg-white/10" title="Developer Tools">
                <Code className="w-4 h-4 text-white/70" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#2d2d2d] rounded-lg shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={viewSource} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-t-lg">
                  <Code className="w-4 h-4" /> View Page Source
                </button>
                <button onClick={() => setShowDevTools(!showDevTools)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                  <Bug className="w-4 h-4" /> {showDevTools ? 'Hide' : 'Show'} Developer Tools
                </button>
                <button onClick={duplicateTab} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                  <Layers className="w-4 h-4" /> Duplicate Tab
                </button>
                <button onClick={printPage} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-b-lg">
                  <Printer className="w-4 h-4" /> Print Page
                </button>
              </div>
            </div>

            {tabs.length === 1 && (
              <button onClick={newTab} className="p-1.5 rounded hover:bg-white/10" title="New Tab">
                <Plus className="w-4 h-4 text-white/70" />
              </button>
            )}
          </div>
        </div>

        {/* Browser content */}
        <div className="flex-1 bg-white overflow-hidden">
          {showGoogleHome ? (
            <GoogleSearch onSearch={handleSearch} />
          ) : searchQuery ? (
            <SearchResults query={searchQuery} onNewSearch={handleSearch} />
          ) : (
            <iframe
              src={activeTab.url}
              title="Browser Content"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          )}
        </div>

        {/* Developer Tools */}
        {showDevTools && <DevTools url={activeTab.url} pageSource={pageSource} onClose={() => setShowDevTools(false)} />}

        {/* View Source Modal */}
        {showViewSource && <ViewSource url={activeTab.url} source={pageSource} onClose={() => setShowViewSource(false)} />}
      </div>
    </ZWindow>
  );
};

export default SafariWindow;
