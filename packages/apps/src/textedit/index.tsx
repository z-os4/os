/**
 * TextEdit App
 *
 * Rich text editor for zOS following macOS TextEdit patterns.
 * Black glass UI with glassmorphism design.
 */

import React, { useState, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Undo, Redo, FileText } from 'lucide-react';

interface TextEditWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const STORAGE_KEY = 'zos-textedit-content';

const defaultContent = `Welcome to TextEdit

This is a simple text editor for zOS. You can use it to write notes, documents, and more.

Features:
• Rich text formatting
• Auto-save to local storage
• Clean, distraction-free interface

Start typing to begin...`;

const TextEditWindow: React.FC<TextEditWindowProps> = ({ onClose, onFocus }) => {
  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || defaultContent;
    } catch {
      return defaultContent;
    }
  });
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('system-ui');

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, content);
      } catch (e) {
        console.error('Failed to save:', e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  // Toolbar button style helper
  const toolbarBtnClass = (active: boolean) =>
    `p-1.5 rounded transition-all duration-150 ${
      active
        ? 'bg-white/20 text-white shadow-inner'
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <ZWindow
      title="TextEdit"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 180, y: 60 }}
      initialSize={{ width: 700, height: 500 }}
      windowType="textpad"
    >
      <div className="flex flex-col h-full bg-black/80">
        {/* Glassmorphism Toolbar */}
        <div
          className="flex items-center gap-1 px-3 py-2 border-b border-white/10"
          style={{
            background: 'rgba(30, 30, 30, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Undo/Redo */}
          <button className={toolbarBtnClass(false)}>
            <Undo className="w-4 h-4" />
          </button>
          <button className={toolbarBtnClass(false)}>
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Font Controls */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="px-2 py-1 text-sm bg-white/5 border border-white/20 rounded text-white/80 outline-none hover:bg-white/10 transition-colors cursor-pointer"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <option value="system-ui" className="bg-neutral-900">System</option>
            <option value="serif" className="bg-neutral-900">Serif</option>
            <option value="monospace" className="bg-neutral-900">Mono</option>
          </select>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="px-2 py-1 text-sm bg-white/5 border border-white/20 rounded text-white/80 outline-none w-16 hover:bg-white/10 transition-colors cursor-pointer"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            {[10, 12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
              <option key={size} value={size} className="bg-neutral-900">{size}</option>
            ))}
          </select>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Text Formatting */}
          <button
            onClick={() => setIsBold(!isBold)}
            className={toolbarBtnClass(isBold)}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsItalic(!isItalic)}
            className={toolbarBtnClass(isItalic)}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsUnderline(!isUnderline)}
            className={toolbarBtnClass(isUnderline)}
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Alignment */}
          <button
            onClick={() => setAlignment('left')}
            className={toolbarBtnClass(alignment === 'left')}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAlignment('center')}
            className={toolbarBtnClass(alignment === 'center')}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAlignment('right')}
            className={toolbarBtnClass(alignment === 'right')}
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Lists */}
          <button className={toolbarBtnClass(false)}>
            <List className="w-4 h-4" />
          </button>
          <button className={toolbarBtnClass(false)}>
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Area - Dark with subtle texture */}
        <div className="flex-1 overflow-hidden bg-[#0d0d0d]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-6 resize-none outline-none bg-transparent text-white/90 leading-relaxed placeholder-white/30 selection:bg-white/20"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isUnderline ? 'underline' : 'none',
              textAlign: alignment,
              caretColor: 'rgba(255, 255, 255, 0.8)',
            }}
            placeholder="Start typing..."
          />
        </div>

        {/* Glass Status Bar */}
        <div
          className="flex items-center justify-between px-4 py-1.5 border-t border-white/10 text-white/50 text-xs"
          style={{
            background: 'rgba(30, 30, 30, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <span>{wordCount} words, {charCount} characters</span>
          <span className="text-white/30">TextEdit</span>
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * TextEdit app manifest
 */
export const TextEditManifest = {
  identifier: 'ai.hanzo.textedit',
  name: 'TextEdit',
  version: '1.0.0',
  description: 'Rich text editor for zOS',
  category: 'productivity' as const,
  permissions: ['storage', 'filesystem'] as const,
  window: {
    type: 'textpad' as const,
    defaultSize: { width: 700, height: 500 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * TextEdit menu bar configuration
 */
export const TextEditMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'new', label: 'New', shortcut: '⌘N' },
        { type: 'item' as const, id: 'open', label: 'Open...', shortcut: '⌘O' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'save', label: 'Save', shortcut: '⌘S' },
        { type: 'item' as const, id: 'saveAs', label: 'Save As...', shortcut: '⇧⌘S' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'print', label: 'Print...', shortcut: '⌘P' },
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
        { type: 'separator' as const },
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: '⌘F' },
        { type: 'item' as const, id: 'replace', label: 'Find and Replace...', shortcut: '⌥⌘F' },
      ],
    },
    {
      id: 'format',
      label: 'Format',
      items: [
        { type: 'item' as const, id: 'font', label: 'Font...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'bold', label: 'Bold', shortcut: '⌘B' },
        { type: 'item' as const, id: 'italic', label: 'Italic', shortcut: '⌘I' },
        { type: 'item' as const, id: 'underline', label: 'Underline', shortcut: '⌘U' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'alignLeft', label: 'Align Left', shortcut: '⌘{' },
        { type: 'item' as const, id: 'center', label: 'Center', shortcut: '⌘|' },
        { type: 'item' as const, id: 'alignRight', label: 'Align Right', shortcut: '⌘}' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'list', label: 'List' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'wrapToPage', label: 'Wrap to Page' },
        { type: 'item' as const, id: 'wrapToWindow', label: 'Wrap to Window' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showRuler', label: 'Show Ruler' },
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
        { type: 'item' as const, id: 'texteditHelp', label: 'TextEdit Help' },
      ],
    },
  ],
};

/**
 * TextEdit dock configuration
 */
export const TextEditDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newDocument', label: 'New Document' },
    { type: 'item' as const, id: 'openRecent', label: 'Open Recent' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * TextEdit App definition for registry
 */
export const TextEditApp = {
  manifest: TextEditManifest,
  component: TextEditWindow,
  icon: FileText,
  menuBar: TextEditMenuBar,
  dockConfig: TextEditDockConfig,
};

export default TextEditWindow;
