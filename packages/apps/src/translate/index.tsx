/**
 * Translate App
 *
 * Translation interface with two-panel layout for zOS.
 * Unified black glass UI with macOS dark mode aesthetics.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  Languages,
  ArrowLeftRight,
  Copy,
  Volume2,
  Star,
  Clock,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';

interface TranslateWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
  favorite: boolean;
}

const LANGUAGES = [
  { code: 'auto', name: 'Detect Language' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'hi', name: 'Hindi' },
];

const STORAGE_KEY = 'zos-translate-history';

// Mock translation function (simulates translation)
const mockTranslate = async (text: string, _from: string, to: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Simple mock translations for demo
  const translations: Record<string, Record<string, string>> = {
    'Hello': { es: 'Hola', fr: 'Bonjour', de: 'Hallo', it: 'Ciao', ja: 'こんにちは', zh: '你好', ko: '안녕하세요' },
    'Goodbye': { es: 'Adiós', fr: 'Au revoir', de: 'Auf Wiedersehen', it: 'Arrivederci', ja: 'さようなら', zh: '再见', ko: '안녕히 가세요' },
    'Thank you': { es: 'Gracias', fr: 'Merci', de: 'Danke', it: 'Grazie', ja: 'ありがとう', zh: '谢谢', ko: '감사합니다' },
    'How are you?': { es: '¿Cómo estás?', fr: 'Comment allez-vous?', de: 'Wie geht es dir?', it: 'Come stai?', ja: 'お元気ですか？', zh: '你好吗？', ko: '어떻게 지내세요?' },
  };

  const exact = translations[text]?.[to];
  if (exact) return exact;

  // For other text, return a mock translation indicator
  return `[${to.toUpperCase()}] ${text}`;
};

const TranslateWindow: React.FC<TranslateWindowProps> = ({ onClose, onFocus }) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedSource, setCopiedSource] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'translate' | 'history' | 'favorites'>('translate');

  // Load history from localStorage
  const [history, setHistory] = useState<Translation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((t: Omit<Translation, 'timestamp'> & { timestamp: string }) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));
      }
    } catch (e) {
      console.error('Failed to load translation history:', e);
    }
    return [];
  });

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save translation history:', e);
    }
  }, [history]);

  const translate = useCallback(async () => {
    if (!sourceText.trim()) {
      setTranslatedText('');
      return;
    }

    setIsTranslating(true);
    try {
      const result = await mockTranslate(sourceText, sourceLang, targetLang);
      setTranslatedText(result);

      // Add to history
      const newTranslation: Translation = {
        id: Date.now().toString(),
        sourceText,
        translatedText: result,
        sourceLang,
        targetLang,
        timestamp: new Date(),
        favorite: false,
      };
      setHistory(prev => [newTranslation, ...prev.slice(0, 49)]);
    } catch (error) {
      setTranslatedText('Translation failed');
    }
    setIsTranslating(false);
  }, [sourceText, sourceLang, targetLang]);

  // Auto-translate with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sourceText.trim()) {
        translate();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [sourceText, targetLang, translate]);

  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = async (text: string, isSource: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isSource) {
        setCopiedSource(true);
        setTimeout(() => setCopiedSource(false), 2000);
      } else {
        setCopiedTarget(true);
        setTimeout(() => setCopiedTarget(false), 2000);
      }
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const speak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'auto' ? 'en' : lang;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev =>
      prev.map(t => (t.id === id ? { ...t, favorite: !t.favorite } : t))
    );
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(t => t.id !== id));
  };

  const loadTranslation = (t: Translation) => {
    setSourceText(t.sourceText);
    setTranslatedText(t.translatedText);
    setSourceLang(t.sourceLang);
    setTargetLang(t.targetLang);
    setActiveTab('translate');
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(l => l.code === code)?.name || code;
  };

  const favorites = history.filter(t => t.favorite);

  const LanguageDropdown = ({
    value,
    onChange,
    isOpen,
    setIsOpen,
    excludeAuto = false,
  }: {
    value: string;
    onChange: (code: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    excludeAuto?: boolean;
  }) => (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md rounded-xl text-white/90 text-sm font-medium transition-all duration-200 border border-white/[0.08] hover:border-white/[0.15] shadow-sm"
      >
        {getLanguageName(value)}
        <ChevronDown className="w-4 h-4 text-white/50" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-black/80 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/[0.12] py-1.5 z-20 max-h-64 overflow-y-auto">
          {LANGUAGES.filter(l => !excludeAuto || l.code !== 'auto').map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-all duration-150 ${
                value === lang.code
                  ? 'bg-white/[0.12] text-white'
                  : 'text-white/70 hover:bg-white/[0.08] hover:text-white/90'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <ZWindow
      title="Translate"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 160, y: 80 }}
      initialSize={{ width: 800, height: 500 }}
      windowType="system"
    >
      <div className="flex flex-col h-full bg-black/60 backdrop-blur-2xl">
        {/* Tabs */}
        <div className="flex items-center border-b border-white/[0.08] bg-black/20">
          <button
            onClick={() => setActiveTab('translate')}
            className={`px-5 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === 'translate'
                ? 'text-white border-b-2 border-white/80 bg-white/[0.05]'
                : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Translate
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === 'history'
                ? 'text-white border-b-2 border-white/80 bg-white/[0.05]'
                : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History
            </div>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-5 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === 'favorites'
                ? 'text-white border-b-2 border-white/80 bg-white/[0.05]'
                : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Favorites
            </div>
          </button>
        </div>

        {activeTab === 'translate' ? (
          <div className="flex-1 flex flex-col">
            {/* Language Selector Bar */}
            <div className="flex items-center justify-center gap-4 p-4 border-b border-white/[0.08] bg-black/20">
              <LanguageDropdown
                value={sourceLang}
                onChange={setSourceLang}
                isOpen={showSourceDropdown}
                setIsOpen={setShowSourceDropdown}
              />
              <button
                onClick={swapLanguages}
                disabled={sourceLang === 'auto'}
                className="p-2.5 hover:bg-white/[0.1] rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-white/[0.1]"
                title="Swap languages"
              >
                <ArrowLeftRight className="w-5 h-5 text-white/70" />
              </button>
              <LanguageDropdown
                value={targetLang}
                onChange={setTargetLang}
                isOpen={showTargetDropdown}
                setIsOpen={setShowTargetDropdown}
                excludeAuto
              />
            </div>

            {/* Translation Panels */}
            <div className="flex-1 flex gap-3 p-3">
              {/* Source Panel - Glass morphism box */}
              <div className="flex-1 flex flex-col bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden shadow-lg">
                <div className="flex-1 p-4">
                  <textarea
                    value={sourceText}
                    onChange={e => setSourceText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="w-full h-full bg-transparent text-white/95 text-lg resize-none outline-none placeholder:text-white/25 leading-relaxed"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-black/20">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speak(sourceText, sourceLang)}
                      disabled={!sourceText}
                      className="p-2 hover:bg-white/[0.1] rounded-lg transition-all duration-200 disabled:opacity-30"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4 text-white/60" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(sourceText, true)}
                      disabled={!sourceText}
                      className="p-2 hover:bg-white/[0.1] rounded-lg transition-all duration-200 disabled:opacity-30"
                      title="Copy"
                    >
                      {copiedSource ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/60" />
                      )}
                    </button>
                  </div>
                  <span className="text-white/25 text-xs font-medium">{sourceText.length} characters</span>
                </div>
              </div>

              {/* Target Panel - Glass morphism box */}
              <div className="flex-1 flex flex-col bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/[0.1] overflow-hidden shadow-lg">
                <div className="flex-1 p-4">
                  {isTranslating ? (
                    <div className="flex items-center gap-3 text-white/50">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                      <span className="text-sm">Translating...</span>
                    </div>
                  ) : (
                    <p className="text-white/95 text-lg whitespace-pre-wrap leading-relaxed">
                      {translatedText || (
                        <span className="text-white/25">Translation will appear here...</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-black/20">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speak(translatedText, targetLang)}
                      disabled={!translatedText}
                      className="p-2 hover:bg-white/[0.1] rounded-lg transition-all duration-200 disabled:opacity-30"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4 text-white/60" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(translatedText, false)}
                      disabled={!translatedText}
                      className="p-2 hover:bg-white/[0.1] rounded-lg transition-all duration-200 disabled:opacity-30"
                      title="Copy"
                    >
                      {copiedTarget ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/60" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (sourceText && translatedText) {
                          const existing = history.find(
                            t => t.sourceText === sourceText && t.targetLang === targetLang
                          );
                          if (existing) {
                            toggleFavorite(existing.id);
                          }
                        }
                      }}
                      disabled={!translatedText}
                      className="p-2 hover:bg-white/[0.1] rounded-lg transition-all duration-200 disabled:opacity-30"
                      title="Favorite"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          history.find(t => t.sourceText === sourceText && t.targetLang === targetLang)
                            ?.favorite
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-white/60'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // History or Favorites list
          <div className="flex-1 overflow-y-auto p-3">
            {(activeTab === 'history' ? history : favorites).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/30">
                {activeTab === 'history' ? (
                  <>
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center">
                      <Clock className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No translation history yet</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center">
                      <Star className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No favorite translations</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {(activeTab === 'history' ? history : favorites).map(t => (
                  <div
                    key={t.id}
                    className="group p-4 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl rounded-xl border border-white/[0.06] hover:border-white/[0.1] cursor-pointer transition-all duration-200"
                    onClick={() => loadTranslation(t)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-white/40 mb-2 font-medium">
                          <span>{getLanguageName(t.sourceLang)}</span>
                          <ArrowLeftRight className="w-3 h-3" />
                          <span>{getLanguageName(t.targetLang)}</span>
                        </div>
                        <p className="text-white/90 text-sm truncate">{t.sourceText}</p>
                        <p className="text-white/50 text-sm truncate mt-1">{t.translatedText}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleFavorite(t.id);
                          }}
                          className="p-2 hover:bg-white/[0.1] rounded-lg transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              t.favorite ? 'text-amber-400 fill-amber-400' : 'text-white/50'
                            }`}
                          />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteFromHistory(t.id);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-white/50" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Translate app manifest
 */
export const TranslateManifest = {
  identifier: 'ai.hanzo.translate',
  name: 'Translate',
  version: '1.0.0',
  description: 'Translation app for zOS',
  category: 'utilities' as const,
  permissions: ['storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 800, height: 500 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Translate menu bar configuration
 */
export const TranslateMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newTranslation', label: 'New Translation', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'clearHistory', label: 'Clear History' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'undo', label: 'Undo', shortcut: '⌘Z' },
        { type: 'item' as const, id: 'redo', label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'cut', label: 'Cut', shortcut: '⌘X' },
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'item' as const, id: 'paste', label: 'Paste', shortcut: '⌘V' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'selectAll', label: 'Select All', shortcut: '⌘A' },
      ],
    },
    {
      id: 'translate',
      label: 'Translate',
      items: [
        { type: 'item' as const, id: 'swapLanguages', label: 'Swap Languages', shortcut: '⌘S' },
        { type: 'item' as const, id: 'detectLanguage', label: 'Detect Language' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'speakSource', label: 'Speak Source Text' },
        { type: 'item' as const, id: 'speakTranslation', label: 'Speak Translation' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showTranslate', label: 'Translate' },
        { type: 'item' as const, id: 'showHistory', label: 'History' },
        { type: 'item' as const, id: 'showFavorites', label: 'Favorites' },
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
        { type: 'item' as const, id: 'translateHelp', label: 'Translate Help' },
      ],
    },
  ],
};

/**
 * Translate dock configuration
 */
export const TranslateDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newTranslation', label: 'New Translation' },
    { type: 'item' as const, id: 'showHistory', label: 'Show History' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Translate App definition for registry
 */
export const TranslateApp = {
  manifest: TranslateManifest,
  component: TranslateWindow,
  icon: Languages,
  menuBar: TranslateMenuBar,
  dockConfig: TranslateDockConfig,
};

export default TranslateWindow;
