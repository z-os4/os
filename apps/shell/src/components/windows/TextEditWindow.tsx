import React, { useState, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Undo, Redo } from 'lucide-react';

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

  return (
    <ZWindow
      title="TextEdit"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 180, y: 60 }}
      initialSize={{ width: 700, height: 500 }}
      windowType="textpad"
    >
      <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e]">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#2c2c2e]">
          {/* Undo/Redo */}
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors">
            <Undo className="w-4 h-4 text-gray-600 dark:text-white/70" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors">
            <Redo className="w-4 h-4 text-gray-600 dark:text-white/70" />
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-white/20 mx-1" />

          {/* Font Controls */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="px-2 py-1 text-sm bg-transparent border border-gray-300 dark:border-white/20 rounded text-gray-700 dark:text-white/70 outline-none"
          >
            <option value="system-ui">System</option>
            <option value="serif">Serif</option>
            <option value="monospace">Mono</option>
          </select>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="px-2 py-1 text-sm bg-transparent border border-gray-300 dark:border-white/20 rounded text-gray-700 dark:text-white/70 outline-none w-16"
          >
            {[10, 12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          <div className="w-px h-5 bg-gray-300 dark:bg-white/20 mx-1" />

          {/* Text Formatting */}
          <button
            onClick={() => setIsBold(!isBold)}
            className={`p-1.5 rounded transition-colors ${
              isBold ? 'bg-blue-100 dark:bg-blue-500/30' : 'hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <Bold className={`w-4 h-4 ${isBold ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-white/70'}`} />
          </button>
          <button
            onClick={() => setIsItalic(!isItalic)}
            className={`p-1.5 rounded transition-colors ${
              isItalic ? 'bg-blue-100 dark:bg-blue-500/30' : 'hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <Italic className={`w-4 h-4 ${isItalic ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-white/70'}`} />
          </button>
          <button
            onClick={() => setIsUnderline(!isUnderline)}
            className={`p-1.5 rounded transition-colors ${
              isUnderline ? 'bg-blue-100 dark:bg-blue-500/30' : 'hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <Underline className={`w-4 h-4 ${isUnderline ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-white/70'}`} />
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-white/20 mx-1" />

          {/* Alignment */}
          <button
            onClick={() => setAlignment('left')}
            className={`p-1.5 rounded transition-colors ${
              alignment === 'left' ? 'bg-blue-100 dark:bg-blue-500/30' : 'hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <AlignLeft className={`w-4 h-4 ${alignment === 'left' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-white/70'}`} />
          </button>
          <button
            onClick={() => setAlignment('center')}
            className={`p-1.5 rounded transition-colors ${
              alignment === 'center' ? 'bg-blue-100 dark:bg-blue-500/30' : 'hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <AlignCenter className={`w-4 h-4 ${alignment === 'center' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-white/70'}`} />
          </button>
          <button
            onClick={() => setAlignment('right')}
            className={`p-1.5 rounded transition-colors ${
              alignment === 'right' ? 'bg-blue-100 dark:bg-blue-500/30' : 'hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <AlignRight className={`w-4 h-4 ${alignment === 'right' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-white/70'}`} />
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-white/20 mx-1" />

          {/* Lists */}
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors">
            <List className="w-4 h-4 text-gray-600 dark:text-white/70" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors">
            <ListOrdered className="w-4 h-4 text-gray-600 dark:text-white/70" />
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-6 resize-none outline-none bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white/90 leading-relaxed"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isUnderline ? 'underline' : 'none',
              textAlign: alignment,
            }}
            placeholder="Start typing..."
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#2c2c2e] text-gray-500 dark:text-white/40 text-xs">
          <span>{wordCount} words, {charCount} characters</span>
          <span>TextEdit</span>
        </div>
      </div>
    </ZWindow>
  );
};

export default TextEditWindow;
