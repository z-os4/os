import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  List,
  Bookmark,
  Settings,
  Type,
  Sun,
  Moon,
  Coffee,
  X,
} from 'lucide-react';

interface BooksWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  progress: number;
  totalPages: number;
  currentPage: number;
  chapters: Chapter[];
  content: string[];
}

interface Chapter {
  title: string;
  page: number;
}

interface BookmarkItem {
  bookId: string;
  page: number;
  text: string;
}

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Art of Programming',
    author: 'Donald E. Knuth',
    cover: 'https://picsum.photos/seed/book1/150/225',
    progress: 35,
    totalPages: 652,
    currentPage: 228,
    chapters: [
      { title: 'Introduction', page: 1 },
      { title: 'Basic Concepts', page: 25 },
      { title: 'Data Structures', page: 89 },
      { title: 'Algorithms', page: 178 },
      { title: 'Advanced Topics', page: 312 },
      { title: 'Optimization', page: 445 },
      { title: 'Conclusion', page: 620 },
    ],
    content: [
      `The Art of Programming is a comprehensive exploration of the fundamental principles that underlie all software development. In this opening chapter, we examine the philosophical foundations of computational thinking and its profound impact on modern problem-solving.

Programming is not merely the act of writing code; it is a discipline that demands precision, creativity, and a deep understanding of both the problem domain and the tools at our disposal. The journey of a programmer begins not with syntax or languages, but with the cultivation of a particular way of thinking.`,
      `Consider the humble algorithm—a step-by-step procedure for solving a problem. Before we can write a single line of code, we must first understand the problem we wish to solve. This understanding comes through analysis, decomposition, and abstraction.

When we encounter a complex problem, our first instinct should be to break it down into smaller, more manageable pieces. This is the essence of computational thinking. Each piece can then be analyzed independently, solutions can be developed, and finally, these solutions can be composed into a complete answer.`,
      `Data structures form the backbone of efficient programs. A well-chosen data structure can mean the difference between a program that runs in seconds and one that takes hours. In this chapter, we explore the fundamental structures that every programmer should understand.

Arrays, linked lists, trees, and graphs—each has its place in the programmer's toolkit. Understanding when to use each, and how to implement them efficiently, is a skill that separates novice programmers from experts.`,
    ],
  },
  {
    id: '2',
    title: 'Design Patterns',
    author: 'Gang of Four',
    cover: 'https://picsum.photos/seed/book2/150/225',
    progress: 68,
    totalPages: 416,
    currentPage: 283,
    chapters: [
      { title: 'What is a Design Pattern?', page: 1 },
      { title: 'Creational Patterns', page: 45 },
      { title: 'Structural Patterns', page: 120 },
      { title: 'Behavioral Patterns', page: 210 },
      { title: 'Case Studies', page: 350 },
    ],
    content: [
      `Design patterns are solutions to commonly occurring problems in software design. They are templates that can be applied to real-world programming challenges. This book catalogs twenty-three fundamental patterns that have proven useful over decades of software development.

The patterns in this book capture solutions that have developed and evolved over time. Hence they aren't the designs people tend to generate initially. They reflect untold redesign and recoding as developers have struggled for greater reuse and flexibility in their software.`,
    ],
  },
  {
    id: '3',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    cover: 'https://picsum.photos/seed/book3/150/225',
    progress: 12,
    totalPages: 464,
    currentPage: 55,
    chapters: [
      { title: 'Clean Code', page: 1 },
      { title: 'Meaningful Names', page: 28 },
      { title: 'Functions', page: 65 },
      { title: 'Comments', page: 95 },
      { title: 'Formatting', page: 130 },
    ],
    content: [
      `You are reading this book for two reasons. First, you are a programmer. Second, you want to be a better programmer. Good. We need better programmers.

This is a book about good programming. It is filled with code. We are going to look at code from every different direction. We'll look down at it from the top, up at it from the bottom, and through it from the inside out.`,
    ],
  },
  {
    id: '4',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    cover: 'https://picsum.photos/seed/book4/150/225',
    progress: 89,
    totalPages: 352,
    currentPage: 313,
    chapters: [
      { title: 'A Pragmatic Philosophy', page: 1 },
      { title: 'A Pragmatic Approach', page: 45 },
      { title: 'The Basic Tools', page: 100 },
      { title: 'Pragmatic Paranoia', page: 165 },
    ],
    content: [
      `What makes a Pragmatic Programmer? Each developer is unique, with individual strengths and weaknesses, preferences and dislikes. Over time, each will craft their own personal environment.

That environment will reflect the programmer's individuality just as strongly as his or her hobbies, clothing, or haircut. However, if you're a Pragmatic Programmer, you'll share many of the following characteristics.`,
    ],
  },
  {
    id: '5',
    title: 'Structure and Interpretation',
    author: 'Harold Abelson',
    cover: 'https://picsum.photos/seed/book5/150/225',
    progress: 0,
    totalPages: 657,
    currentPage: 1,
    chapters: [
      { title: 'Building Abstractions', page: 1 },
      { title: 'Building Abstractions with Data', page: 125 },
      { title: 'Modularity, Objects, and State', page: 265 },
      { title: 'Metalinguistic Abstraction', page: 395 },
    ],
    content: [
      `We are about to study the idea of a computational process. Computational processes are abstract beings that inhabit computers. As they evolve, processes manipulate other abstract things called data.

The evolution of a process is directed by a pattern of rules called a program. People create programs to direct processes. In effect, we conjure the spirits of the computer with our spells.`,
    ],
  },
  {
    id: '6',
    title: 'Refactoring',
    author: 'Martin Fowler',
    cover: 'https://picsum.photos/seed/book6/150/225',
    progress: 45,
    totalPages: 448,
    currentPage: 201,
    chapters: [
      { title: 'Refactoring: A First Example', page: 1 },
      { title: 'Principles in Refactoring', page: 45 },
      { title: 'Bad Smells in Code', page: 85 },
      { title: 'Building Tests', page: 125 },
    ],
    content: [
      `Refactoring is the process of changing a software system in such a way that it does not alter the external behavior of the code yet improves its internal structure.

It is a disciplined way to clean up code that minimizes the chances of introducing bugs. In essence, when you refactor, you are improving the design of the code after it has been written.`,
    ],
  },
];

const mockBookmarks: BookmarkItem[] = [
  { bookId: '1', page: 45, text: 'The essence of computational thinking...' },
  { bookId: '1', page: 112, text: 'Data structures form the backbone...' },
  { bookId: '2', page: 67, text: 'Design patterns are solutions...' },
];

type Theme = 'dark' | 'light' | 'sepia';

// Glass morphism style constants
const glassStyles = {
  panel: 'bg-black/40 backdrop-blur-xl border border-white/10',
  panelHover: 'hover:bg-white/10 hover:border-white/20',
  button: 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-white/25',
  buttonActive: 'bg-white/20 border-white/30',
  input: 'bg-white/5 border border-white/10 focus:border-white/30 focus:bg-white/10',
  card: 'bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20',
  sidebar: 'bg-black/30 backdrop-blur-xl border-r border-white/10',
  header: 'bg-black/20 backdrop-blur-xl border-b border-white/10',
  footer: 'bg-black/20 backdrop-blur-xl border-t border-white/10',
};

const BooksWindow: React.FC<BooksWindowProps> = ({ onClose, onFocus }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<Theme>('dark');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(mockBookmarks);

  const themeStyles = {
    dark: 'bg-transparent text-white/90',
    light: 'bg-white/90 backdrop-blur-xl text-gray-900',
    sepia: 'bg-amber-50/90 backdrop-blur-xl text-amber-950',
  };

  const openBook = (book: Book) => {
    setSelectedBook(book);
    setIsReading(true);
    setCurrentPage(0);
  };

  const goToPage = (page: number) => {
    if (selectedBook && page >= 0 && page < selectedBook.content.length) {
      setCurrentPage(page);
    }
  };

  const toggleBookmark = () => {
    if (!selectedBook) return;
    const existingIdx = bookmarks.findIndex(
      (b) => b.bookId === selectedBook.id && b.page === currentPage
    );
    if (existingIdx >= 0) {
      setBookmarks(bookmarks.filter((_, i) => i !== existingIdx));
    } else {
      setBookmarks([
        ...bookmarks,
        {
          bookId: selectedBook.id,
          page: currentPage,
          text: selectedBook.content[currentPage].substring(0, 50) + '...',
        },
      ]);
    }
  };

  const isCurrentPageBookmarked = selectedBook
    ? bookmarks.some((b) => b.bookId === selectedBook.id && b.page === currentPage)
    : false;

  const renderLibrary = () => (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-white/90 text-2xl font-semibold mb-6 tracking-tight">Your Library</h2>
      <div className="grid grid-cols-3 gap-6">
        {mockBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => openBook(book)}
            className="group cursor-pointer"
          >
            {/* Glass morphism book cover */}
            <div className={`relative mb-3 rounded-xl overflow-hidden ${glassStyles.card} transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-white/5`}>
              <div className="relative">
                <img
                  src={book.cover}
                  alt=""
                  className="w-full aspect-[2/3] object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                {/* Glass overlay on cover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Progress bar at bottom */}
                {book.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-white/90 font-medium truncate">{book.title}</p>
            <p className="text-white/50 text-sm truncate">{book.author}</p>
            {book.progress > 0 && (
              <p className="text-white/30 text-xs mt-1">
                {book.progress}% complete
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderReader = () => {
    if (!selectedBook) return null;

    return (
      <div className={`flex-1 flex flex-col ${themeStyles[theme]} transition-colors duration-300`}>
        {/* Reader Header - Glass */}
        <div className={`flex items-center justify-between px-4 py-2 ${glassStyles.header}`}>
          <button
            onClick={() => { setIsReading(false); setSelectedBook(null); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${glassStyles.button} transition-all duration-200`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Library</span>
          </button>
          <div className="text-center">
            <p className="font-medium text-sm text-white/90">{selectedBook.title}</p>
            <p className="text-xs text-white/50">{selectedBook.author}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowToc(!showToc)}
              className={`p-2 rounded-lg transition-all duration-200 ${showToc ? glassStyles.buttonActive : glassStyles.button}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-lg transition-all duration-200 ${isCurrentPageBookmarked ? 'text-blue-400 ' + glassStyles.buttonActive : glassStyles.button}`}
            >
              <Bookmark className="w-4 h-4" fill={isCurrentPageBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-all duration-200 ${showSettings ? glassStyles.buttonActive : glassStyles.button}`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Table of Contents Sidebar - Glass */}
          {showToc && (
            <div className={`w-64 p-4 overflow-y-auto ${glassStyles.sidebar}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white/90">Contents</h3>
                <button 
                  onClick={() => setShowToc(false)} 
                  className={`p-1 rounded ${glassStyles.button}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {selectedBook.chapters.map((chapter, idx) => (
                <button
                  key={idx}
                  onClick={() => goToPage(Math.min(idx, selectedBook.content.length - 1))}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 text-white/80 hover:text-white ${glassStyles.panelHover}`}
                >
                  <span className="text-white/40 mr-2">{idx + 1}.</span>
                  {chapter.title}
                </button>
              ))}

              {bookmarks.filter((b) => b.bookId === selectedBook.id).length > 0 && (
                <>
                  <h3 className="font-semibold mt-6 mb-2 text-white/90">Bookmarks</h3>
                  {bookmarks
                    .filter((b) => b.bookId === selectedBook.id)
                    .map((bm, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToPage(bm.page)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 text-white/80 hover:text-white ${glassStyles.panelHover}`}
                      >
                        <Bookmark className="w-3 h-3 inline mr-2 text-blue-400" />
                        {bm.text}
                      </button>
                    ))}
                </>
              )}
            </div>
          )}

          {/* Reading Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto px-12 py-8">
              <div className="max-w-2xl mx-auto">
                <p
                  className="leading-relaxed whitespace-pre-line"
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                >
                  {selectedBook.content[currentPage]}
                </p>
              </div>
            </div>

            {/* Navigation - Glass */}
            <div className={`flex items-center justify-between px-6 py-3 ${glassStyles.footer}`}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 ${glassStyles.button}`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/50">
                  Page {currentPage + 1} of {selectedBook.content.length}
                </span>
                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all"
                    style={{ width: `${((currentPage + 1) / selectedBook.content.length) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === selectedBook.content.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 ${glassStyles.button}`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel - Glass */}
          {showSettings && (
            <div className={`w-64 p-4 bg-black/30 backdrop-blur-xl border-l border-white/10`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white/90">Settings</h3>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className={`p-1 rounded ${glassStyles.button}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block text-white/70">Font Size</label>
                  <div className="flex items-center gap-3">
                    <Type className="w-4 h-4 text-white/50" />
                    <input
                      type="range"
                      min="14"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-sm w-8 text-white/70">{fontSize}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-white/70">Theme</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'border-blue-500/50 bg-blue-500/20 text-blue-400' 
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                        theme === 'light' 
                          ? 'border-blue-500/50 bg-blue-500/20 text-blue-400' 
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTheme('sepia')}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                        theme === 'sepia' 
                          ? 'border-blue-500/50 bg-blue-500/20 text-blue-400' 
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Coffee className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ZWindow
      title="Books"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 180, y: 80 }}
      initialSize={{ width: 950, height: 700 }}
      windowType="system"
    >
      <div className="flex flex-col h-full bg-black/80 backdrop-blur-2xl">
        {isReading ? renderReader() : renderLibrary()}
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Books app manifest
 */
export const BooksManifest = {
  identifier: 'ai.hanzo.books',
  name: 'Books',
  version: '1.0.0',
  description: 'E-book reader for zOS',
  category: 'media' as const,
  permissions: ['storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 950, height: 700 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Books menu bar configuration
 */
export const BooksMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'open', label: 'Open Book...', shortcut: 'CmdO' },
        { type: 'item' as const, id: 'addToLibrary', label: 'Add to Library...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: 'CmdW' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: 'CmdC' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: 'CmdF' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showToc', label: 'Table of Contents', shortcut: 'CmdT' },
        { type: 'item' as const, id: 'showBookmarks', label: 'Bookmarks', shortcut: 'CmdB' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'increaseFontSize', label: 'Increase Font Size', shortcut: 'Cmd+' },
        { type: 'item' as const, id: 'decreaseFontSize', label: 'Decrease Font Size', shortcut: 'Cmd-' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'themeLight', label: 'Light Theme' },
        { type: 'item' as const, id: 'themeDark', label: 'Dark Theme' },
        { type: 'item' as const, id: 'themeSepia', label: 'Sepia Theme' },
      ],
    },
    {
      id: 'go',
      label: 'Go',
      items: [
        { type: 'item' as const, id: 'nextPage', label: 'Next Page', shortcut: 'Right' },
        { type: 'item' as const, id: 'prevPage', label: 'Previous Page', shortcut: 'Left' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'goToPage', label: 'Go to Page...', shortcut: 'CmdG' },
        { type: 'item' as const, id: 'goToChapter', label: 'Go to Chapter...' },
      ],
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      items: [
        { type: 'item' as const, id: 'addBookmark', label: 'Add Bookmark', shortcut: 'CmdD' },
        { type: 'item' as const, id: 'showAllBookmarks', label: 'Show All Bookmarks' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: 'CmdM' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'booksHelp', label: 'Books Help' },
      ],
    },
  ],
};

/**
 * Books dock configuration
 */
export const BooksDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'open', label: 'Open Book...' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'recentBooks', label: 'Recent Books' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Books App definition for registry
 */
export const BooksApp = {
  manifest: BooksManifest,
  component: BooksWindow,
  icon: BookMarked,
  menuBar: BooksMenuBar,
  dockConfig: BooksDockConfig,
};

export default BooksWindow;
