/**
 * Notes App
 *
 * Note-taking app for zOS following macOS Notes patterns.
 * Black glass UI with transparency and backdrop blur.
 */

import React, { useState, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import { Plus, Trash2, Palette, StickyNote, Search } from 'lucide-react';

interface NotesWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface StickyNote {
  id: string;
  content: string;
  color: string;
  createdAt: Date;
}

// Glass-friendly accent colors (subtle, translucent)
const noteColors = [
  { name: 'White', accent: 'bg-white/20', ring: 'ring-white/40', dot: 'bg-white/60' },
  { name: 'Blue', accent: 'bg-blue-400/20', ring: 'ring-blue-400/40', dot: 'bg-blue-400/60' },
  { name: 'Purple', accent: 'bg-purple-400/20', ring: 'ring-purple-400/40', dot: 'bg-purple-400/60' },
  { name: 'Pink', accent: 'bg-pink-400/20', ring: 'ring-pink-400/40', dot: 'bg-pink-400/60' },
  { name: 'Green', accent: 'bg-emerald-400/20', ring: 'ring-emerald-400/40', dot: 'bg-emerald-400/60' },
  { name: 'Orange', accent: 'bg-orange-400/20', ring: 'ring-orange-400/40', dot: 'bg-orange-400/60' },
];

const STORAGE_KEY = 'zos-notes';

const defaultNotes: StickyNote[] = [
  { id: '1', content: 'Welcome to Notes!\n\nClick + to add a new note.', color: 'White', createdAt: new Date() },
  { id: '2', content: 'Remember to:\n- Check emails\n- Review PRs\n- Deploy updates', color: 'Blue', createdAt: new Date() },
  { id: '3', content: 'Ideas:\n- New terminal features\n- Better animations\n- More themes', color: 'Purple', createdAt: new Date() },
];

const NotesWindow: React.FC<NotesWindowProps> = ({ onClose, onFocus }) => {
  // Load notes from localStorage
  const [notes, setNotes] = useState<StickyNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((note: Omit<StickyNote, 'createdAt'> & { createdAt: string }) => ({
          ...note,
          createdAt: new Date(note.createdAt)
        }));
      }
    } catch (e) {
      console.error('Failed to load notes:', e);
    }
    return defaultNotes;
  });
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  }, [notes]);

  const addNote = () => {
    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: '',
      color: 'White',
      createdAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote.id);
  };

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, content } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote === id) {
      setSelectedNote(null);
    }
  };

  const changeColor = (id: string, color: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, color } : note
    ));
    setShowColorPicker(null);
  };

  const getColorClasses = (colorName: string) => {
    return noteColors.find(c => c.name === colorName) || noteColors[0];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ZWindow
      title="Notes"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 140, y: 70 }}
      initialSize={{ width: 700, height: 500 }}
      windowType="system"
    >
      {/* Main glass container */}
      <div className="flex h-full bg-black/60 backdrop-blur-2xl">
        {/* Sidebar - Notes List */}
        <div className="w-56 border-r border-white/[0.08] flex flex-col bg-white/[0.02]">
          {/* Search Bar */}
          <div className="p-3 border-b border-white/[0.08]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-8 pr-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08]">
            <button
              onClick={addNote}
              className="p-1.5 hover:bg-white/[0.08] rounded-md transition-colors group"
              title="New Note"
            >
              <Plus className="w-4 h-4 text-white/50 group-hover:text-white/80" />
            </button>
            <span className="text-white/30 text-xs font-medium">{filteredNotes.length} notes</span>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.map((note) => {
              const colors = getColorClasses(note.color);
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note.id)}
                  className={`group px-3 py-2.5 cursor-pointer border-b border-white/[0.04] transition-all ${
                    selectedNote === note.id 
                      ? 'bg-white/[0.1] border-l-2 border-l-white/40' 
                      : 'hover:bg-white/[0.05] border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0 mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/90 text-sm font-medium truncate leading-tight">
                        {note.content.split('\n')[0] || 'New Note'}
                      </p>
                      <p className="text-white/30 text-xs mt-1 font-light">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/[0.1] rounded transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content - Note Editor */}
        <div className="flex-1 flex flex-col bg-black/20">
          {selectedNote ? (
            <>
              {/* Note Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-white/[0.02]">
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(showColorPicker === selectedNote ? null : selectedNote)}
                    className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/[0.08] rounded-md transition-colors group"
                  >
                    <div className={`w-3 h-3 rounded-full ${getColorClasses(notes.find(n => n.id === selectedNote)?.color || 'White').dot}`} />
                    <Palette className="w-3.5 h-3.5 text-white/40 group-hover:text-white/60" />
                  </button>

                  {showColorPicker === selectedNote && (
                    <div className="absolute top-full left-0 mt-1.5 bg-black/80 backdrop-blur-xl rounded-lg shadow-2xl border border-white/[0.12] p-2.5 z-10">
                      <div className="flex gap-1.5">
                        {noteColors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => changeColor(selectedNote, color.name)}
                            className={`w-6 h-6 rounded-full ${color.dot} hover:ring-2 ${color.ring} transition-all hover:scale-110`}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteNote(selectedNote)}
                  className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors group"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4 text-white/40 group-hover:text-red-400" />
                </button>
              </div>

              {/* Note Content */}
              {(() => {
                const note = notes.find(n => n.id === selectedNote);
                if (!note) return null;
                const colors = getColorClasses(note.color);
                return (
                  <div className={`flex-1 ${colors.accent} transition-colors`}>
                    <textarea
                      value={note.content}
                      onChange={(e) => updateNote(note.id, e.target.value)}
                      placeholder="Start typing..."
                      className="w-full h-full p-5 bg-transparent text-white/90 placeholder:text-white/25 resize-none outline-none text-base leading-relaxed font-light selection:bg-white/20"
                      autoFocus
                    />
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  <StickyNote className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/40 text-base font-light mb-1">No note selected</p>
                <p className="text-white/25 text-sm font-light">Select a note or click + to create one</p>
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
 * Notes app manifest
 */
export const NotesManifest = {
  identifier: 'ai.hanzo.notes',
  name: 'Notes',
  version: '1.0.0',
  description: 'Note-taking app for zOS',
  category: 'productivity' as const,
  permissions: ['storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 700, height: 500 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Notes menu bar configuration
 */
export const NotesMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newNote', label: 'New Note', shortcut: '⌘N' },
        { type: 'item' as const, id: 'newFolder', label: 'New Folder', shortcut: '⇧⌘N' },
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
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: '⌘F' },
        { type: 'item' as const, id: 'delete', label: 'Delete', shortcut: '⌘⌫' },
      ],
    },
    {
      id: 'format',
      label: 'Format',
      items: [
        { type: 'item' as const, id: 'bold', label: 'Bold', shortcut: '⌘B' },
        { type: 'item' as const, id: 'italic', label: 'Italic', shortcut: '⌘I' },
        { type: 'item' as const, id: 'underline', label: 'Underline', shortcut: '⌘U' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'checklist', label: 'Checklist', shortcut: '⇧⌘L' },
        { type: 'item' as const, id: 'bulletList', label: 'Bulleted List' },
        { type: 'item' as const, id: 'numberedList', label: 'Numbered List' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showFolders', label: 'Show Folders' },
        { type: 'item' as const, id: 'showAttachments', label: 'Show Attachments Browser' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'sortByDate', label: 'Sort by Date Edited' },
        { type: 'item' as const, id: 'sortByTitle', label: 'Sort by Title' },
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
        { type: 'item' as const, id: 'notesHelp', label: 'Notes Help' },
      ],
    },
  ],
};

/**
 * Notes dock configuration
 */
export const NotesDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newNote', label: 'New Note' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Notes App definition for registry
 */
export const NotesApp = {
  manifest: NotesManifest,
  component: NotesWindow,
  icon: StickyNote,
  menuBar: NotesMenuBar,
  dockConfig: NotesDockConfig,
};

export default NotesWindow;
