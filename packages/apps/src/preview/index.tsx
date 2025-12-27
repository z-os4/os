/**
 * Preview App
 *
 * Image and PDF viewer for zOS with markup tools.
 * Unified black glass UI with macOS dark mode aesthetics.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Highlighter,
  Square,
  Circle,
  Type,
  PenTool,
  X,
  Undo,
  Redo,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface PreviewWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

type MarkupTool = 'pen' | 'highlighter' | 'rectangle' | 'circle' | 'text' | 'signature' | null;

interface MarkupAnnotation {
  id: string;
  tool: MarkupTool;
  color: string;
  points?: { x: number; y: number }[];
  rect?: { x: number; y: number; width: number; height: number };
  text?: string;
}

interface PreviewFile {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  src: string;
  pages?: string[];
}

// ============================================================================
// Mock Data
// ============================================================================

const mockFiles: PreviewFile[] = [
  {
    id: '1',
    name: 'Landscape.jpg',
    type: 'image',
    src: 'https://picsum.photos/seed/preview1/1200/800',
  },
  {
    id: '2',
    name: 'Portrait.jpg',
    type: 'image',
    src: 'https://picsum.photos/seed/preview2/800/1200',
  },
  {
    id: '3',
    name: 'Document.pdf',
    type: 'pdf',
    src: 'https://picsum.photos/seed/preview3/800/1000',
    pages: [
      'https://picsum.photos/seed/doc1/800/1000',
      'https://picsum.photos/seed/doc2/800/1000',
      'https://picsum.photos/seed/doc3/800/1000',
      'https://picsum.photos/seed/doc4/800/1000',
    ],
  },
  {
    id: '4',
    name: 'Screenshot.png',
    type: 'image',
    src: 'https://picsum.photos/seed/preview4/1920/1080',
  },
];

const markupColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ffffff', // white
];

// ============================================================================
// Glass UI Styles
// ============================================================================

const glassStyles = {
  // Main container with deep black transparency
  container: 'bg-black/80 backdrop-blur-xl',
  // Toolbar with frosted glass effect
  toolbar: 'bg-white/[0.03] backdrop-blur-2xl border-b border-white/[0.08]',
  // Sidebar with subtle transparency
  sidebar: 'bg-white/[0.02] backdrop-blur-xl border-r border-white/[0.06]',
  // Button base style
  button: 'hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-150',
  // Active button state
  buttonActive: 'bg-white/[0.10] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]',
  // Text colors
  textPrimary: 'text-white/90',
  textSecondary: 'text-white/60',
  textMuted: 'text-white/40',
  // Divider
  divider: 'bg-white/[0.08]',
  // Preview area
  previewArea: 'bg-black/60',
  // Thumbnail selected
  thumbnailSelected: 'ring-2 ring-white/40 shadow-[0_0_12px_rgba(255,255,255,0.1)]',
  thumbnailHover: 'hover:ring-1 hover:ring-white/20',
};

// ============================================================================
// Preview Window Component
// ============================================================================

const PreviewWindow: React.FC<PreviewWindowProps> = ({ onClose, onFocus }) => {
  const [currentFile, setCurrentFile] = useState<PreviewFile>(mockFiles[2]); // Start with PDF
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMarkup, setShowMarkup] = useState(false);
  const [activeTool, setActiveTool] = useState<MarkupTool>(null);
  const [markupColor, setMarkupColor] = useState('#ef4444');
  const [annotations, setAnnotations] = useState<MarkupAnnotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = currentFile.type === 'pdf' && currentFile.pages ? currentFile.pages.length : 1;
  const currentSrc = currentFile.type === 'pdf' && currentFile.pages
    ? currentFile.pages[currentPage]
    : currentFile.src;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(z => Math.min(z + 25, 400));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom(z => Math.max(z - 25, 25));
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        setCurrentPage(p => p - 1);
      } else if (e.key === 'ArrowRight' && currentPage < totalPages - 1) {
        setCurrentPage(p => p + 1);
      } else if (e.key === '0' && e.metaKey) {
        e.preventDefault();
        setZoom(100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // Drawing handlers
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool || activeTool === 'text' || activeTool === 'signature') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  }, [activeTool]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPath(prev => [...prev, { x, y }]);

    // Draw on canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = markupColor;
    ctx.lineWidth = activeTool === 'highlighter' ? 20 : 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'highlighter') {
      ctx.globalAlpha = 0.3;
    } else {
      ctx.globalAlpha = 1;
    }

    if (currentPath.length > 0) {
      const lastPoint = currentPath[currentPath.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }, [isDrawing, activeTool, markupColor, currentPath]);

  const stopDrawing = useCallback(() => {
    if (isDrawing && currentPath.length > 0 && activeTool) {
      setAnnotations(prev => [...prev, {
        id: Date.now().toString(),
        tool: activeTool,
        color: markupColor,
        points: currentPath,
      }]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, activeTool, markupColor]);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const toggleMarkup = () => {
    setShowMarkup(!showMarkup);
    if (!showMarkup) {
      setActiveTool('pen');
    } else {
      setActiveTool(null);
    }
  };

  const toolButtons: { tool: MarkupTool; icon: React.ElementType; label: string }[] = [
    { tool: 'pen', icon: Pencil, label: 'Pen' },
    { tool: 'highlighter', icon: Highlighter, label: 'Highlighter' },
    { tool: 'rectangle', icon: Square, label: 'Rectangle' },
    { tool: 'circle', icon: Circle, label: 'Circle' },
    { tool: 'text', icon: Type, label: 'Text' },
    { tool: 'signature', icon: PenTool, label: 'Signature' },
  ];

  // Glass button component
  const GlassButton: React.FC<{
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ onClick, active, disabled, title, children, className = '' }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded-lg transition-all duration-150
        ${active
          ? 'bg-white/[0.12] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]'
          : 'hover:bg-white/[0.08] active:bg-white/[0.12]'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <ZWindow
      title={currentFile.name}
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 60 }}
      initialSize={{ width: 1000, height: 700 }}
      windowType="system"
    >
      <div className={`flex h-full ${glassStyles.container}`}>
        {/* Sidebar - Thumbnails */}
        {showSidebar && (
          <div className={`w-48 flex flex-col ${glassStyles.sidebar}`}>
            <div className="p-3 border-b border-white/[0.06]">
              <span className={`text-[11px] font-medium uppercase tracking-wider ${glassStyles.textSecondary}`}>
                Files
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {mockFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    setCurrentFile(file);
                    setCurrentPage(0);
                    setZoom(100);
                    setRotation(0);
                  }}
                  className={`w-full rounded-lg overflow-hidden transition-all duration-200 ${
                    currentFile.id === file.id
                      ? glassStyles.thumbnailSelected
                      : glassStyles.thumbnailHover
                  }`}
                >
                  <div className="aspect-[4/3] bg-white/[0.03]">
                    <img
                      src={file.type === 'pdf' && file.pages ? file.pages[0] : file.src}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 bg-black/30">
                    <p className={`text-xs truncate ${glassStyles.textPrimary}`}>{file.name}</p>
                    {file.type === 'pdf' && file.pages && (
                      <p className={`text-[10px] ${glassStyles.textMuted}`}>{file.pages.length} pages</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* PDF Page Thumbnails */}
            {currentFile.type === 'pdf' && currentFile.pages && (
              <>
                <div className="p-3 border-t border-white/[0.06]">
                  <span className={`text-[11px] font-medium uppercase tracking-wider ${glassStyles.textSecondary}`}>
                    Pages
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-60">
                  {currentFile.pages.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-full rounded-lg overflow-hidden transition-all duration-200 ${
                        currentPage === index
                          ? glassStyles.thumbnailSelected
                          : glassStyles.thumbnailHover
                      }`}
                    >
                      <div className="aspect-[3/4] bg-white/[0.03] relative">
                        <img
                          src={page}
                          alt={`Page ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className={`
                          absolute bottom-1 right-1 
                          bg-black/70 backdrop-blur-sm
                          text-[10px] px-1.5 py-0.5 rounded
                          ${glassStyles.textPrimary}
                        `}>
                          {index + 1}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className={`flex items-center justify-between px-3 py-2 ${glassStyles.toolbar}`}>
            <div className="flex items-center gap-1">
              <GlassButton
                onClick={() => setShowSidebar(!showSidebar)}
                active={showSidebar}
                title="Toggle Sidebar"
              >
                <ChevronLeft className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
              
              <div className={`w-px h-5 mx-1 ${glassStyles.divider}`} />
              
              <GlassButton
                onClick={() => setZoom(z => Math.max(z - 25, 25))}
                title="Zoom Out"
              >
                <ZoomOut className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
              
              <span className={`text-xs w-12 text-center font-medium ${glassStyles.textSecondary}`}>
                {zoom}%
              </span>
              
              <GlassButton
                onClick={() => setZoom(z => Math.min(z + 25, 400))}
                title="Zoom In"
              >
                <ZoomIn className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
              
              <div className={`w-px h-5 mx-1 ${glassStyles.divider}`} />
              
              <GlassButton
                onClick={() => setRotation(r => (r + 90) % 360)}
                title="Rotate"
              >
                <RotateCw className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
            </div>

            <div className="flex items-center gap-1">
              <GlassButton
                onClick={toggleMarkup}
                active={showMarkup}
                title="Markup Tools"
              >
                <Pencil className={`w-4 h-4 ${showMarkup ? 'text-blue-400' : glassStyles.textPrimary}`} />
              </GlassButton>
              
              <GlassButton title="Share">
                <Share2 className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
              
              <GlassButton title="Download">
                <Download className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
            </div>
          </div>

          {/* Markup Toolbar */}
          {showMarkup && (
            <div className={`flex items-center gap-3 px-3 py-2 ${glassStyles.toolbar}`}>
              <div className="flex items-center gap-1">
                {toolButtons.map(({ tool, icon: Icon, label }) => (
                  <GlassButton
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    active={activeTool === tool}
                    title={label}
                  >
                    <Icon className={`w-4 h-4 ${
                      activeTool === tool ? 'text-blue-400' : glassStyles.textPrimary
                    }`} />
                  </GlassButton>
                ))}
              </div>
              
              <div className={`w-px h-5 ${glassStyles.divider}`} />
              
              <div className="flex items-center gap-1.5">
                {markupColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setMarkupColor(color)}
                    className={`
                      w-5 h-5 rounded-full transition-all duration-150
                      ${markupColor === color
                        ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-black/50 scale-110'
                        : 'hover:scale-110'
                      }
                    `}
                    style={{ 
                      backgroundColor: color,
                      boxShadow: color === '#ffffff' ? 'inset 0 0 0 1px rgba(255,255,255,0.2)' : undefined
                    }}
                  />
                ))}
              </div>
              
              <div className={`w-px h-5 ${glassStyles.divider}`} />
              
              <GlassButton title="Undo">
                <Undo className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
              
              <GlassButton title="Redo">
                <Redo className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
              
              <GlassButton onClick={clearAnnotations} title="Clear All">
                <X className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
            </div>
          )}

          {/* Preview Area */}
          <div
            ref={containerRef}
            className={`flex-1 overflow-auto flex items-center justify-center p-6 ${glassStyles.previewArea}`}
          >
            <div
              className="relative"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
              }}
            >
              <img
                src={currentSrc}
                alt={currentFile.name}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                }}
                draggable={false}
              />
              {showMarkup && (
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="absolute inset-0 cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              )}
            </div>
          </div>

          {/* Page Navigation */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-center gap-4 px-3 py-2 ${glassStyles.toolbar} border-t border-white/[0.08]`}>
              <GlassButton
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
              
              <span className={`text-sm font-medium ${glassStyles.textSecondary}`}>
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <GlassButton
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className={`w-4 h-4 ${glassStyles.textPrimary}`} />
              </GlassButton>
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
 * Preview app manifest
 */
export const PreviewManifest = {
  identifier: 'ai.hanzo.preview',
  name: 'Preview',
  version: '1.0.0',
  description: 'Image and PDF viewer for zOS',
  category: 'utilities' as const,
  permissions: ['filesystem'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 1000, height: 700 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Preview menu bar configuration
 */
export const PreviewMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'open', label: 'Open...', shortcut: '⌘O' },
        { type: 'item' as const, id: 'openRecent', label: 'Open Recent' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'save', label: 'Save', shortcut: '⌘S' },
        { type: 'item' as const, id: 'saveAs', label: 'Save As...', shortcut: '⇧⌘S' },
        { type: 'item' as const, id: 'export', label: 'Export...', shortcut: '⌘E' },
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
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'zoomIn', label: 'Zoom In', shortcut: '⌘+' },
        { type: 'item' as const, id: 'zoomOut', label: 'Zoom Out', shortcut: '⌘-' },
        { type: 'item' as const, id: 'actualSize', label: 'Actual Size', shortcut: '⌘0' },
        { type: 'item' as const, id: 'fitToWindow', label: 'Fit to Window', shortcut: '⌘9' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'rotateLeft', label: 'Rotate Left', shortcut: '⌘L' },
        { type: 'item' as const, id: 'rotateRight', label: 'Rotate Right', shortcut: '⌘R' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showSidebar', label: 'Show Sidebar', shortcut: '⌘\\' },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        { type: 'item' as const, id: 'markup', label: 'Show Markup Toolbar', shortcut: '⇧⌘A' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'pen', label: 'Pen' },
        { type: 'item' as const, id: 'highlighter', label: 'Highlighter' },
        { type: 'item' as const, id: 'shapes', label: 'Shapes' },
        { type: 'item' as const, id: 'text', label: 'Text' },
        { type: 'item' as const, id: 'signature', label: 'Signature' },
      ],
    },
    {
      id: 'go',
      label: 'Go',
      items: [
        { type: 'item' as const, id: 'nextPage', label: 'Next Page', shortcut: '⌘→' },
        { type: 'item' as const, id: 'prevPage', label: 'Previous Page', shortcut: '⌘←' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'firstPage', label: 'First Page', shortcut: '⌥⌘↑' },
        { type: 'item' as const, id: 'lastPage', label: 'Last Page', shortcut: '⌥⌘↓' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'goToPage', label: 'Go to Page...', shortcut: '⌥⌘G' },
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
        { type: 'item' as const, id: 'previewHelp', label: 'Preview Help' },
      ],
    },
  ],
};

/**
 * Preview dock configuration
 */
export const PreviewDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'open', label: 'Open File...' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Preview App definition for registry
 */
export const PreviewApp = {
  manifest: PreviewManifest,
  component: PreviewWindow,
  icon: Eye,
  menuBar: PreviewMenuBar,
  dockConfig: PreviewDockConfig,
};

export default PreviewWindow;
