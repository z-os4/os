/**
 * Passwords App
 *
 * Password manager and keychain for zOS.
 * Black glass UI with backdrop blur and glass morphism.
 */

import React, { useState, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  Key, Lock, Eye, EyeOff, Copy, Trash2, Plus, Search,
  Globe, Wifi, StickyNote, Folder, RefreshCw, Check,
  Shield, AlertCircle, ChevronRight, Edit2, Star
} from 'lucide-react';
import { cn } from '@z-os/ui';

interface PasswordsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface PasswordEntry {
  id: string;
  type: 'password' | 'note' | 'wifi';
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  category?: string;
  createdAt: Date;
  modifiedAt: Date;
  strength?: 'weak' | 'medium' | 'strong';
  favorite?: boolean;
}

const STORAGE_KEY = 'zos-passwords';

// Mock password entries
const defaultEntries: PasswordEntry[] = [
  {
    id: '1',
    type: 'password',
    title: 'GitHub',
    username: 'zeekay',
    password: 'Gh$ecur3P@ss2024!',
    url: 'https://github.com',
    category: 'Development',
    createdAt: new Date('2024-01-15'),
    modifiedAt: new Date('2024-06-20'),
    strength: 'strong',
    favorite: true,
  },
  {
    id: '2',
    type: 'password',
    title: 'Google',
    username: 'zach.kelling@gmail.com',
    password: 'G00gl3P@ss!',
    url: 'https://accounts.google.com',
    category: 'Personal',
    createdAt: new Date('2023-08-10'),
    modifiedAt: new Date('2024-03-15'),
    strength: 'strong',
    favorite: true,
  },
  {
    id: '3',
    type: 'password',
    title: 'AWS Console',
    username: 'admin@hanzo.ai',
    password: 'Aws$3cure#2024',
    url: 'https://aws.amazon.com',
    category: 'Development',
    createdAt: new Date('2024-02-01'),
    modifiedAt: new Date('2024-02-01'),
    strength: 'strong',
  },
  {
    id: '4',
    type: 'password',
    title: 'Netflix',
    username: 'zach@example.com',
    password: 'password123',
    url: 'https://netflix.com',
    category: 'Entertainment',
    createdAt: new Date('2023-05-20'),
    modifiedAt: new Date('2023-05-20'),
    strength: 'weak',
  },
  {
    id: '5',
    type: 'wifi',
    title: 'Home Network',
    password: 'WifiP@ss2024!',
    notes: '5GHz network',
    createdAt: new Date('2024-01-01'),
    modifiedAt: new Date('2024-01-01'),
    strength: 'strong',
  },
  {
    id: '6',
    type: 'wifi',
    title: 'Office WiFi',
    password: 'Office123',
    createdAt: new Date('2024-03-01'),
    modifiedAt: new Date('2024-03-01'),
    strength: 'medium',
  },
  {
    id: '7',
    type: 'note',
    title: 'Recovery Codes',
    notes: 'GitHub:\n1234-5678-9012\n3456-7890-1234\n\nGoogle:\nABCD-EFGH-IJKL\nMNOP-QRST-UVWX',
    createdAt: new Date('2024-01-20'),
    modifiedAt: new Date('2024-01-20'),
  },
  {
    id: '8',
    type: 'password',
    title: 'Slack',
    username: 'zach@hanzo.ai',
    password: 'Sl@ck2024!',
    url: 'https://slack.com',
    category: 'Work',
    createdAt: new Date('2024-04-10'),
    modifiedAt: new Date('2024-04-10'),
    strength: 'strong',
  },
];

// Generate random password
const generatePassword = (length: number = 16): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Check password strength
const checkStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const isLong = password.length >= 12;

  const score = [hasLower, hasUpper, hasNumber, hasSpecial, isLong].filter(Boolean).length;

  if (score >= 4) return 'strong';
  if (score >= 2) return 'medium';
  return 'weak';
};

// Glass morphism style classes
const glassPanel = "bg-black/40 backdrop-blur-xl border border-white/[0.08]";
const glassPanelHover = "hover:bg-white/[0.06] hover:border-white/[0.12]";
const glassInput = "bg-black/30 backdrop-blur-md border border-white/[0.1] text-white/90 placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-black/40";
const glassButton = "bg-white/[0.06] backdrop-blur-md border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.15] transition-all duration-200";
const glassDivider = "border-white/[0.06]";

const PasswordsWindow: React.FC<PasswordsWindowProps> = ({ onClose, onFocus }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [masterPasswordError, setMasterPasswordError] = useState('');
  const [entries, setEntries] = useState<PasswordEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved).map((e: PasswordEntry) => ({
          ...e,
          createdAt: new Date(e.createdAt),
          modifiedAt: new Date(e.modifiedAt),
        }));
      }
    } catch (e) {
      console.error('Failed to load passwords:', e);
    }
    return defaultEntries;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PasswordEntry>>({});

  // Save entries to localStorage
  useEffect(() => {
    if (isUnlocked) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isUnlocked]);

  const categories = [
    { id: 'all', label: 'All Items', icon: Key, count: entries.length },
    { id: 'passwords', label: 'Passwords', icon: Lock, count: entries.filter(e => e.type === 'password').length },
    { id: 'notes', label: 'Secure Notes', icon: StickyNote, count: entries.filter(e => e.type === 'note').length },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi, count: entries.filter(e => e.type === 'wifi').length },
    { id: 'favorites', label: 'Favorites', icon: Star, count: entries.filter(e => e.favorite).length },
  ];

  const filteredEntries = entries.filter(entry => {
    if (selectedCategory === 'passwords' && entry.type !== 'password') return false;
    if (selectedCategory === 'notes' && entry.type !== 'note') return false;
    if (selectedCategory === 'wifi' && entry.type !== 'wifi') return false;
    if (selectedCategory === 'favorites' && !entry.favorite) return false;
    if (searchQuery && !entry.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword === 'zOS2024') {
      setIsUnlocked(true);
      setMasterPasswordError('');
    } else {
      setMasterPasswordError('Incorrect password');
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setEditForm({ ...editForm, password: newPassword });
  };

  const handleSave = () => {
    if (!editForm.title) return;

    const now = new Date();
    if (selectedEntry) {
      // Update existing
      setEntries(entries.map(e =>
        e.id === selectedEntry.id
          ? { ...e, ...editForm, modifiedAt: now, strength: editForm.password ? checkStrength(editForm.password) : e.strength }
          : e
      ));
      setSelectedEntry({ ...selectedEntry, ...editForm, modifiedAt: now });
    } else {
      // Create new
      const newEntry: PasswordEntry = {
        id: Date.now().toString(),
        type: editForm.type || 'password',
        title: editForm.title,
        username: editForm.username,
        password: editForm.password,
        url: editForm.url,
        notes: editForm.notes,
        category: editForm.category,
        createdAt: now,
        modifiedAt: now,
        strength: editForm.password ? checkStrength(editForm.password) : undefined,
      };
      setEntries([...entries, newEntry]);
      setSelectedEntry(newEntry);
    }
    setIsEditing(false);
    setEditForm({});
  };

  const handleDelete = () => {
    if (selectedEntry) {
      setEntries(entries.filter(e => e.id !== selectedEntry.id));
      setSelectedEntry(null);
    }
  };

  const handleAddNew = () => {
    setSelectedEntry(null);
    setEditForm({ type: 'password' });
    setIsEditing(true);
  };

  const toggleFavorite = (entry: PasswordEntry) => {
    setEntries(entries.map(e =>
      e.id === entry.id ? { ...e, favorite: !e.favorite } : e
    ));
    if (selectedEntry?.id === entry.id) {
      setSelectedEntry({ ...selectedEntry, favorite: !selectedEntry.favorite });
    }
  };

  const getStrengthColor = (strength?: string) => {
    switch (strength) {
      case 'strong': return 'text-emerald-400';
      case 'medium': return 'text-amber-400';
      case 'weak': return 'text-red-400';
      default: return 'text-white/40';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'password': return <Globe className="w-4 h-4" />;
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'note': return <StickyNote className="w-4 h-4" />;
      default: return <Key className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Lock screen
  if (!isUnlocked) {
    return (
      <ZWindow
        title="Passwords"
        onClose={onClose}
        onFocus={onFocus}
        initialPosition={{ x: 200, y: 150 }}
        initialSize={{ width: 400, height: 380 }}
        windowType="system"
      >
        <div className={cn("flex flex-col items-center justify-center h-full p-8", glassPanel, "rounded-none border-0 bg-black/60")}>
          {/* Glowing key icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full blur-xl" />
            <div className={cn("relative w-20 h-20 rounded-full flex items-center justify-center", glassPanel)}>
              <Key className="w-9 h-9 text-amber-400/90" />
            </div>
          </div>
          
          <h2 className="text-xl font-medium text-white/90 mb-2">Passwords is Locked</h2>
          <p className="text-white/40 text-sm mb-8 text-center">
            Enter your master password to unlock
          </p>
          
          <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Master Password"
                className={cn("w-full pl-12 pr-4 py-3 rounded-xl", glassInput)}
                autoFocus
              />
            </div>
            {masterPasswordError && (
              <p className="text-red-400/90 text-sm text-center">{masterPasswordError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-white/10 hover:bg-white/15 border border-white/[0.1] hover:border-white/20 text-white/90 font-medium rounded-xl transition-all duration-200 backdrop-blur-md"
            >
              Unlock
            </button>
            <p className="text-xs text-white/25 text-center">
              Hint: zOS2024
            </p>
          </form>
        </div>
      </ZWindow>
    );
  }

  return (
    <ZWindow
      title="Passwords"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 150, y: 100 }}
      initialSize={{ width: 950, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/70 backdrop-blur-2xl">
        {/* Sidebar */}
        <div className={cn("w-52 flex flex-col border-r", glassDivider, "bg-black/30")}>
          <div className={cn("p-3 border-b", glassDivider)}>
            <button
              onClick={handleAddNew}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-white/80",
                glassButton
              )}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Item</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150",
                  selectedCategory === category.id
                    ? "bg-white/[0.08] text-white/90 border border-white/[0.1]"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white/80 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <category.icon className={cn(
                    "w-4 h-4",
                    selectedCategory === category.id ? "text-white/70" : "text-white/40"
                  )} />
                  <span>{category.label}</span>
                </div>
                <span className="text-xs text-white/30 tabular-nums">{category.count}</span>
              </button>
            ))}
          </div>
          
          <div className={cn("p-2 border-t", glassDivider)}>
            <button
              onClick={() => setIsUnlocked(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg transition-all duration-150"
            >
              <Lock className="w-4 h-4" />
              <span className="text-sm">Lock</span>
            </button>
          </div>
        </div>

        {/* Entries list */}
        <div className={cn("w-72 border-r flex flex-col", glassDivider, "bg-black/20")}>
          {/* Search */}
          <div className={cn("p-3 border-b", glassDivider)}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={cn("w-full pl-9 pr-3 py-2 text-sm rounded-lg", glassInput)}
              />
            </div>
          </div>

          {/* Entries list */}
          <div className="flex-1 overflow-y-auto">
            {filteredEntries.map(entry => (
              <button
                key={entry.id}
                onClick={() => {
                  setSelectedEntry(entry);
                  setIsEditing(false);
                  setShowPassword(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 transition-all duration-150 text-left border-b",
                  glassDivider,
                  selectedEntry?.id === entry.id
                    ? "bg-white/[0.08]"
                    : "hover:bg-white/[0.04]"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/[0.08]",
                  entry.type === 'password' && "bg-blue-500/15 text-blue-400/80",
                  entry.type === 'wifi' && "bg-emerald-500/15 text-emerald-400/80",
                  entry.type === 'note' && "bg-amber-500/15 text-amber-400/80"
                )}>
                  {getTypeIcon(entry.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/85 font-medium truncate text-sm">{entry.title}</span>
                    {entry.favorite && <Star className="w-3 h-3 text-amber-400/80 fill-amber-400/80 flex-shrink-0" />}
                  </div>
                  {entry.username && (
                    <span className="text-xs text-white/35 truncate block">{entry.username}</span>
                  )}
                </div>
              </button>
            ))}
            {filteredEntries.length === 0 && (
              <div className="p-6 text-center text-white/25 text-sm">
                No items found
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
          {selectedEntry || isEditing ? (
            <>
              {/* Header */}
              <div className={cn("flex items-center justify-between p-4 border-b", glassDivider, "bg-black/20")}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/[0.08]",
                    (editForm.type || selectedEntry?.type) === 'password' && "bg-blue-500/15 text-blue-400/80",
                    (editForm.type || selectedEntry?.type) === 'wifi' && "bg-emerald-500/15 text-emerald-400/80",
                    (editForm.type || selectedEntry?.type) === 'note' && "bg-amber-500/15 text-amber-400/80"
                  )}>
                    {getTypeIcon(editForm.type || selectedEntry?.type || 'password')}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Title"
                      className="bg-transparent border-b border-white/15 text-xl font-medium text-white/90 focus:outline-none focus:border-white/30 pb-1"
                    />
                  ) : (
                    <h2 className="text-xl font-medium text-white/90">{selectedEntry?.title}</h2>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!isEditing && selectedEntry && (
                    <>
                      <button
                        onClick={() => toggleFavorite(selectedEntry)}
                        className={cn(
                          "p-2 rounded-lg transition-all duration-150",
                          selectedEntry.favorite
                            ? "text-amber-400/80"
                            : "text-white/30 hover:text-amber-400/60 hover:bg-white/[0.04]"
                        )}
                      >
                        <Star className={cn("w-4 h-4", selectedEntry.favorite && "fill-amber-400/80")} />
                      </button>
                      <button
                        onClick={() => {
                          setEditForm(selectedEntry);
                          setIsEditing(true);
                        }}
                        className="p-2 hover:bg-white/[0.06] rounded-lg text-white/40 hover:text-white/70 transition-all duration-150"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-2 hover:bg-red-500/15 rounded-lg text-white/40 hover:text-red-400/80 transition-all duration-150"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {isEditing && (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({});
                        }}
                        className="px-4 py-2 text-white/40 hover:text-white/70 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className={cn("px-4 py-2 rounded-lg text-white/90 text-sm font-medium", glassButton, "bg-white/[0.1]")}
                      >
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6 space-y-5">
                {/* URL */}
                {(isEditing || selectedEntry?.url) && (selectedEntry?.type === 'password' || editForm.type === 'password') && (
                  <div className="space-y-2">
                    <label className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.url || ''}
                        onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                        placeholder="https://example.com"
                        className={cn("w-full px-4 py-3 rounded-xl text-sm", glassInput)}
                      />
                    ) : (
                      <a
                        href={selectedEntry?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400/80 hover:text-blue-400 hover:underline text-sm"
                      >
                        {selectedEntry?.url}
                      </a>
                    )}
                  </div>
                )}

                {/* Username */}
                {(isEditing || selectedEntry?.username) && (selectedEntry?.type === 'password' || editForm.type === 'password') && (
                  <div className="space-y-2">
                    <label className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Username</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.username || ''}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        placeholder="Username or email"
                        className={cn("w-full px-4 py-3 rounded-xl text-sm", glassInput)}
                      />
                    ) : (
                      <div className={cn("flex items-center justify-between p-3 rounded-xl", glassPanel)}>
                        <span className="text-white/80 text-sm">{selectedEntry?.username}</span>
                        <button
                          onClick={() => handleCopy(selectedEntry?.username || '', 'username')}
                          className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors"
                        >
                          {copiedField === 'username' ? (
                            <Check className="w-4 h-4 text-emerald-400/80" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Password */}
                {(isEditing || selectedEntry?.password) && (selectedEntry?.type !== 'note' || editForm.type !== 'note') && (
                  <div className="space-y-2">
                    <label className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Password</label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={editForm.password || ''}
                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                            placeholder="Password"
                            className={cn("w-full px-4 py-3 rounded-xl font-mono text-sm", glassInput)}
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          onClick={handleGeneratePassword}
                          className={cn("px-4 py-3 rounded-xl", glassButton)}
                          title="Generate Password"
                        >
                          <RefreshCw className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                    ) : (
                      <div className={cn("flex items-center justify-between p-3 rounded-xl", glassPanel)}>
                        <span className="font-mono text-white/80 text-sm">
                          {showPassword ? selectedEntry?.password : '••••••••••••'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-white/40" />
                            ) : (
                              <Eye className="w-4 h-4 text-white/40" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(selectedEntry?.password || '', 'password')}
                            className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors"
                          >
                            {copiedField === 'password' ? (
                              <Check className="w-4 h-4 text-emerald-400/80" />
                            ) : (
                              <Copy className="w-4 h-4 text-white/40" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Password strength indicator */}
                    {(editForm.password || selectedEntry?.password) && (
                      <div className="flex items-center gap-2 mt-2">
                        <Shield className={cn("w-4 h-4", getStrengthColor(editForm.password ? checkStrength(editForm.password) : selectedEntry?.strength))} />
                        <span className={cn("text-sm", getStrengthColor(editForm.password ? checkStrength(editForm.password) : selectedEntry?.strength))}>
                          {(editForm.password ? checkStrength(editForm.password) : selectedEntry?.strength)?.charAt(0).toUpperCase() + (editForm.password ? checkStrength(editForm.password) : selectedEntry?.strength || '').slice(1)} password
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {(isEditing || selectedEntry?.notes || selectedEntry?.type === 'note' || editForm.type === 'note') && (
                  <div className="space-y-2">
                    <label className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Notes</label>
                    {isEditing ? (
                      <textarea
                        value={editForm.notes || ''}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        placeholder="Add notes..."
                        rows={6}
                        className={cn("w-full px-4 py-3 rounded-xl resize-none text-sm", glassInput)}
                      />
                    ) : (
                      <div className={cn("p-4 rounded-xl", glassPanel)}>
                        <pre className="text-white/70 whitespace-pre-wrap font-sans text-sm">{selectedEntry?.notes}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Category */}
                {(isEditing || selectedEntry?.category) && (
                  <div className="space-y-2">
                    <label className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Category</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        placeholder="e.g., Work, Personal"
                        className={cn("w-full px-4 py-3 rounded-xl text-sm", glassInput)}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-white/40" />
                        <span className="text-white/70 text-sm">{selectedEntry?.category}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Dates */}
                {!isEditing && selectedEntry && (
                  <div className={cn("pt-5 mt-5 border-t grid grid-cols-2 gap-4 text-sm", glassDivider)}>
                    <div>
                      <span className="text-white/35 text-xs">Created</span>
                      <p className="text-white/60 mt-0.5">{formatDate(selectedEntry.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-white/35 text-xs">Modified</span>
                      <p className="text-white/60 mt-0.5">{formatDate(selectedEntry.modifiedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5", glassPanel)}>
                  <Key className="w-9 h-9 text-white/20" />
                </div>
                <p className="text-white/35 text-sm">Select an item or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Passwords app manifest
 */
export const PasswordsManifest = {
  identifier: 'ai.hanzo.passwords',
  name: 'Passwords',
  version: '1.0.0',
  description: 'Password manager for zOS',
  category: 'utilities' as const,
  permissions: ['storage', 'keychain'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 950, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Passwords menu bar configuration
 */
export const PasswordsMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newPassword', label: 'New Password', shortcut: '⌘N' },
        { type: 'item' as const, id: 'newSecureNote', label: 'New Secure Note', shortcut: '⇧⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'import', label: 'Import...' },
        { type: 'item' as const, id: 'export', label: 'Export...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'lock', label: 'Lock Keychain', shortcut: '⌘L' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'copy', label: 'Copy Password', shortcut: '⌘C' },
        { type: 'item' as const, id: 'copyUsername', label: 'Copy Username', shortcut: '⇧⌘C' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'delete', label: 'Delete', shortcut: '⌘⌫' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: '⌘F' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showAll', label: 'All Items' },
        { type: 'item' as const, id: 'showPasswords', label: 'Passwords Only' },
        { type: 'item' as const, id: 'showNotes', label: 'Secure Notes Only' },
        { type: 'separator' as const },
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
        { type: 'item' as const, id: 'passwordsHelp', label: 'Passwords Help' },
      ],
    },
  ],
};

/**
 * Passwords dock configuration
 */
export const PasswordsDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newPassword', label: 'New Password' },
    { type: 'item' as const, id: 'lock', label: 'Lock Keychain' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Passwords App definition for registry
 */
export const PasswordsApp = {
  manifest: PasswordsManifest,
  component: PasswordsWindow,
  icon: Key,
  menuBar: PasswordsMenuBar,
  dockConfig: PasswordsDockConfig,
};

export default PasswordsWindow;
