/**
 * Dictionary App
 *
 * Word lookup app for zOS using dictionaryapi.dev.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  BookOpen,
  Search,
  Volume2,
  Clock,
  Star,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

interface DictionaryWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Phonetic {
  text?: string;
  audio?: string;
}

interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

interface WordEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  sourceUrls?: string[];
}

interface WordOfDay {
  word: string;
  definition: string;
  partOfSpeech: string;
}

const STORAGE_KEY = 'zos-dictionary-recent';

// Sample words of the day
const wordsOfDay: WordOfDay[] = [
  { word: 'serendipity', definition: 'The occurrence of events by chance in a happy way', partOfSpeech: 'noun' },
  { word: 'ephemeral', definition: 'Lasting for a very short time', partOfSpeech: 'adjective' },
  { word: 'eloquent', definition: 'Fluent or persuasive in speaking or writing', partOfSpeech: 'adjective' },
  { word: 'ubiquitous', definition: 'Present, appearing, or found everywhere', partOfSpeech: 'adjective' },
  { word: 'resilience', definition: 'The capacity to recover quickly from difficulties', partOfSpeech: 'noun' },
];

const DictionaryWindow: React.FC<DictionaryWindowProps> = ({ onClose, onFocus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wordData, setWordData] = useState<WordEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [wordOfDay] = useState<WordOfDay>(
    wordsOfDay[Math.floor(Math.random() * wordsOfDay.length)]
  );

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, []);

  // Save recent searches to localStorage
  const addToRecent = useCallback((word: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((w) => w.toLowerCase() !== word.toLowerCase());
      const updated = [word, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent searches:', e);
      }
      return updated;
    });
  }, []);

  // Search for word
  const searchWord = useCallback(async (word: string) => {
    if (!word.trim()) return;

    setLoading(true);
    setError(null);
    setWordData(null);

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError(`No definitions found for "${word}"`);
        } else {
          setError('Failed to fetch definition. Please try again.');
        }
        return;
      }

      const data = await response.json();
      setWordData(data);
      addToRecent(word.trim());
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [addToRecent]);

  // Play pronunciation audio
  const playAudio = useCallback((audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  }, []);

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchWord(searchTerm);
  };

  // Get audio URL from phonetics
  const getAudioUrl = (entry: WordEntry): string | null => {
    for (const phonetic of entry.phonetics) {
      if (phonetic.audio) return phonetic.audio;
    }
    return null;
  };

  return (
    <ZWindow
      title="Dictionary"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 160, y: 90 }}
      initialSize={{ width: 800, height: 550 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/80 backdrop-blur-2xl">
        {/* Sidebar */}
        <div className="w-56 border-r border-white/[0.08] flex flex-col bg-white/[0.02]">
          {/* Word of the Day */}
          <div className="p-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-amber-400/90 mb-2">
              <Star className="w-4 h-4 fill-amber-400/90" />
              <span className="text-xs uppercase tracking-wider font-medium">Word of the Day</span>
            </div>
            <button
              onClick={() => {
                setSearchTerm(wordOfDay.word);
                searchWord(wordOfDay.word);
              }}
              className="w-full text-left hover:bg-white/[0.06] rounded-lg p-2.5 -mx-0.5 transition-all duration-200 border border-transparent hover:border-white/[0.08]"
            >
              <p className="text-white/95 font-medium">{wordOfDay.word}</p>
              <p className="text-white/40 text-xs italic">{wordOfDay.partOfSpeech}</p>
              <p className="text-white/60 text-sm mt-1 line-clamp-2 leading-relaxed">
                {wordOfDay.definition}
              </p>
            </button>
          </div>

          {/* Recent Searches */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-medium">Recent Searches</span>
              </div>
              {recentSearches.length > 0 ? (
                <div className="space-y-0.5">
                  {recentSearches.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(word);
                        searchWord(word);
                      }}
                      className="w-full flex items-center justify-between text-left px-2.5 py-2 text-white/70 hover:text-white/90 hover:bg-white/[0.06] rounded-lg text-sm transition-all duration-200 group border border-transparent hover:border-white/[0.06]"
                    >
                      <span>{word}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm px-2.5">No recent searches</p>
              )}
            </div>
          </div>

          {/* Clear Recent */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  setRecentSearches([]);
                  localStorage.removeItem(STORAGE_KEY);
                }}
                className="w-full text-center text-white/40 hover:text-white/60 text-sm transition-colors py-1.5 rounded-lg hover:bg-white/[0.04]"
              >
                Clear Recent Searches
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="p-4 border-b border-white/[0.08]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a word..."
                className="w-full bg-white/[0.08] backdrop-blur-xl text-white/95 placeholder:text-white/35 pl-11 pr-11 py-3 rounded-xl outline-none focus:ring-2 focus:ring-white/20 border border-white/[0.08] focus:border-white/[0.15] transition-all duration-200"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setWordData(null);
                    setError(null);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors p-0.5 rounded-full hover:bg-white/[0.08]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                  <span className="text-white/40 text-sm">Looking up definition...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8">
                  <AlertCircle className="w-12 h-12 text-red-400/80 mb-4 mx-auto" />
                  <p className="text-white/90 text-lg font-medium">{error}</p>
                  <p className="text-white/40 text-sm mt-2">
                    Try checking your spelling or search for a different word
                  </p>
                </div>
              </div>
            )}

            {wordData && wordData.length > 0 && (
              <div className="space-y-6">
                {wordData.map((entry, entryIndex) => (
                  <div key={entryIndex} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
                    {/* Word Header */}
                    <div className="flex items-center gap-4 mb-5">
                      <h1 className="text-white/95 text-3xl font-semibold tracking-tight">{entry.word}</h1>
                      {entry.phonetic && (
                        <span className="text-white/45 text-lg font-light">{entry.phonetic}</span>
                      )}
                      {getAudioUrl(entry) && (
                        <button
                          onClick={() => playAudio(getAudioUrl(entry)!)}
                          className="p-2.5 hover:bg-white/[0.08] rounded-full transition-all duration-200 border border-transparent hover:border-white/[0.08]"
                          title="Listen to pronunciation"
                        >
                          <Volume2 className="w-5 h-5 text-blue-400/90" />
                        </button>
                      )}
                    </div>

                    {/* Meanings */}
                    {entry.meanings.map((meaning, meaningIndex) => (
                      <div key={meaningIndex} className="mb-6 last:mb-0">
                        {/* Part of Speech */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-blue-400/90 font-medium italic text-sm px-3 py-1 bg-blue-400/[0.08] rounded-full border border-blue-400/[0.15]">
                            {meaning.partOfSpeech}
                          </span>
                          <div className="flex-1 h-px bg-gradient-to-r from-white/[0.08] to-transparent" />
                        </div>

                        {/* Definitions */}
                        <div className="space-y-4 pl-1">
                          {meaning.definitions.slice(0, 5).map((def, defIndex) => (
                            <div key={defIndex} className="group">
                              <div className="flex gap-3">
                                <span className="text-white/30 font-mono text-sm mt-0.5 w-5 flex-shrink-0">
                                  {defIndex + 1}.
                                </span>
                                <div className="flex-1">
                                  <p className="text-white/85 leading-relaxed">{def.definition}</p>
                                  {def.example && (
                                    <p className="text-white/45 italic mt-2 pl-3 border-l-2 border-white/[0.1] leading-relaxed">
                                      "{def.example}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Synonyms */}
                        {meaning.synonyms.length > 0 && (
                          <div className="mt-5 pl-1 flex flex-wrap items-center gap-2">
                            <span className="text-white/40 text-sm">Synonyms:</span>
                            {meaning.synonyms.slice(0, 8).map((syn, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setSearchTerm(syn);
                                  searchWord(syn);
                                }}
                                className="text-emerald-400/80 text-sm hover:text-emerald-300 transition-colors px-2 py-0.5 rounded-md hover:bg-emerald-400/[0.08] border border-transparent hover:border-emerald-400/[0.15]"
                              >
                                {syn}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Antonyms */}
                        {meaning.antonyms.length > 0 && (
                          <div className="mt-3 pl-1 flex flex-wrap items-center gap-2">
                            <span className="text-white/40 text-sm">Antonyms:</span>
                            {meaning.antonyms.slice(0, 8).map((ant, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setSearchTerm(ant);
                                  searchWord(ant);
                                }}
                                className="text-rose-400/80 text-sm hover:text-rose-300 transition-colors px-2 py-0.5 rounded-md hover:bg-rose-400/[0.08] border border-transparent hover:border-rose-400/[0.15]"
                              >
                                {ant}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && !wordData && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-10">
                  <BookOpen className="w-16 h-16 text-white/20 mb-5 mx-auto" />
                  <p className="text-white/50 text-lg font-medium">Search for a word</p>
                  <p className="text-white/30 text-sm mt-2">
                    Type a word above to see its definition
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Dictionary app manifest
 */
export const DictionaryManifest = {
  identifier: 'ai.hanzo.dictionary',
  name: 'Dictionary',
  version: '1.0.0',
  description: 'Word lookup app for zOS',
  category: 'reference' as const,
  permissions: ['network'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 800, height: 550 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Dictionary menu bar configuration
 */
export const DictionaryMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newSearch', label: 'New Search', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: '⌘F' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showRecent', label: 'Show Recent Searches' },
        { type: 'item' as const, id: 'showFavorites', label: 'Show Favorites' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'clearHistory', label: 'Clear History' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'dictionaryHelp', label: 'Dictionary Help' },
      ],
    },
  ],
};

/**
 * Dictionary dock configuration
 */
export const DictionaryDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newSearch', label: 'New Search' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Dictionary App definition for registry
 */
export const DictionaryApp = {
  manifest: DictionaryManifest,
  component: DictionaryWindow,
  icon: BookOpen,
  menuBar: DictionaryMenuBar,
  dockConfig: DictionaryDockConfig,
};

export default DictionaryWindow;
