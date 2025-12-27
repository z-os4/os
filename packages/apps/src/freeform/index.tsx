/**
 * Freeform App
 *
 * Infinite canvas whiteboard app for zOS.
 * Sleek macOS dark mode glass morphism UI.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  PenTool,
  MousePointer,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  StickyNote,
  Image,
  Eraser,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  Grid,
  Download,
  Plus,
  Trash2,
  Palette,
} from 'lucide-react';

interface FreeformWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

type Tool = 'select' | 'pen' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky' | 'image' | 'eraser' | 'pan';

interface Point {
  x: number;
  y: number;
}

interface CanvasElement {
  id: string;
  type: 'path' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky';
  points?: Point[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  layer: number;
}

interface Board {
  id: string;
  name: string;
  elements: CanvasElement[];
}

const COLORS = [
  '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#000000',
];

const STROKE_WIDTHS = [2, 4, 6, 8, 12];

const STORAGE_KEY = 'zos-freeform-boards';

const FreeformWindow: React.FC<FreeformWindowProps> = ({ onClose, onFocus }) => {
  // Tool state
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(4);

  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);

  // Board state
  const [boards, setBoards] = useState<Board[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load boards:', e);
    }
    return [{ id: '1', name: 'Board 1', elements: [] }];
  });
  const [activeBoardId, setActiveBoardId] = useState(boards[0]?.id || '1');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];
  const elements = activeBoard?.elements || [];

  // Persist boards to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    } catch (e) {
      console.error('Failed to save boards:', e);
    }
  }, [boards]);

  // Update elements for active board
  const updateElements = useCallback((newElements: CanvasElement[]) => {
    setBoards(prev =>
      prev.map(b => (b.id === activeBoardId ? { ...b, elements: newElements } : b))
    );
  }, [activeBoardId]);

  // Canvas rendering
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with dark transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transform
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid with subtle lines
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1 / zoom;
      const gridSize = 40;
      const startX = Math.floor(-pan.x / zoom / gridSize) * gridSize;
      const startY = Math.floor(-pan.y / zoom / gridSize) * gridSize;
      const endX = startX + canvas.width / zoom + gridSize * 2;
      const endY = startY + canvas.height / zoom + gridSize * 2;

      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }

    // Sort elements by layer
    const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);

    // Draw elements
    sortedElements.forEach(el => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (el.type) {
        case 'path':
          if (el.points && el.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(el.points[0].x, el.points[0].y);
            el.points.forEach((point, i) => {
              if (i > 0) ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;

        case 'rectangle':
          if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          }
          break;

        case 'circle':
          if (el.x !== undefined && el.y !== undefined && el.width !== undefined) {
            ctx.beginPath();
            ctx.arc(el.x, el.y, el.width / 2, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;

        case 'line':
          if (el.points && el.points.length === 2) {
            ctx.beginPath();
            ctx.moveTo(el.points[0].x, el.points[0].y);
            ctx.lineTo(el.points[1].x, el.points[1].y);
            ctx.stroke();
          }
          break;

        case 'arrow':
          if (el.points && el.points.length === 2) {
            const [start, end] = el.points;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            // Draw arrowhead
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const arrowLength = 15;
            ctx.beginPath();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - arrowLength * Math.cos(angle - Math.PI / 6),
              end.y - arrowLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - arrowLength * Math.cos(angle + Math.PI / 6),
              end.y - arrowLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
          }
          break;

        case 'text':
          if (el.x !== undefined && el.y !== undefined && el.text) {
            ctx.font = '16px system-ui, -apple-system, sans-serif';
            ctx.fillText(el.text, el.x, el.y);
          }
          break;

        case 'sticky':
          if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
            // Dark glass sticky note
            ctx.fillStyle = 'rgba(255, 230, 109, 0.15)';
            ctx.fillRect(el.x, el.y, el.width, el.height);
            ctx.strokeStyle = 'rgba(255, 230, 109, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(el.x, el.y, el.width, el.height);
            if (el.text) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.font = '14px system-ui, -apple-system, sans-serif';
              const lines = el.text.split('\n');
              lines.forEach((line, i) => {
                ctx.fillText(line, el.x! + 10, el.y! + 20 + i * 18);
              });
            }
          }
          break;
      }

      // Draw selection
      if (selectedElement === el.id) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
          ctx.strokeRect(el.x - 5, el.y - 5, el.width + 10, el.height + 10);
        } else if (el.points && el.points.length > 0) {
          const minX = Math.min(...el.points.map(p => p.x));
          const maxX = Math.max(...el.points.map(p => p.x));
          const minY = Math.min(...el.points.map(p => p.y));
          const maxY = Math.max(...el.points.map(p => p.y));
          ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);
        }
        ctx.setLineDash([]);
      }
    });

    // Draw current path being drawn
    if (currentPath.length > 0 && activeTool === 'pen') {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach((point, i) => {
        if (i > 0) ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }

    // Draw shape preview
    if (startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1];
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;

      switch (activeTool) {
        case 'rectangle':
          ctx.strokeRect(
            startPoint.x,
            startPoint.y,
            endPoint.x - startPoint.x,
            endPoint.y - startPoint.y
          );
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
          );
          ctx.beginPath();
          ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'line':
        case 'arrow':
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(endPoint.x, endPoint.y);
          ctx.stroke();
          if (activeTool === 'arrow') {
            const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
            const arrowLength = 15;
            ctx.beginPath();
            ctx.moveTo(endPoint.x, endPoint.y);
            ctx.lineTo(
              endPoint.x - arrowLength * Math.cos(angle - Math.PI / 6),
              endPoint.y - arrowLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(endPoint.x, endPoint.y);
            ctx.lineTo(
              endPoint.x - arrowLength * Math.cos(angle + Math.PI / 6),
              endPoint.y - arrowLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
          }
          break;
      }
    }

    ctx.restore();
  }, [elements, pan, zoom, showGrid, currentPath, startPoint, activeTool, activeColor, strokeWidth, selectedElement]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      renderCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [renderCanvas]);

  // Re-render on state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Get canvas coordinates
  const getCanvasPoint = useCallback((e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const point = getCanvasPoint(e);

    if (activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      return;
    }

    if (activeTool === 'select') {
      // Find clicked element
      const clicked = [...elements].reverse().find(el => {
        if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
          return (
            point.x >= el.x &&
            point.x <= el.x + el.width &&
            point.y >= el.y &&
            point.y <= el.y + el.height
          );
        }
        return false;
      });
      setSelectedElement(clicked?.id || null);
      return;
    }

    if (activeTool === 'eraser') {
      // Find and delete element under cursor
      const toDelete = [...elements].reverse().find(el => {
        if (el.points) {
          return el.points.some(
            p => Math.abs(p.x - point.x) < 10 && Math.abs(p.y - point.y) < 10
          );
        }
        if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
          return (
            point.x >= el.x &&
            point.x <= el.x + el.width &&
            point.y >= el.y &&
            point.y <= el.y + el.height
          );
        }
        return false;
      });
      if (toDelete) {
        updateElements(elements.filter(el => el.id !== toDelete.id));
      }
      return;
    }

    if (activeTool === 'text') {
      const newEl: CanvasElement = {
        id: Date.now().toString(),
        type: 'text',
        x: point.x,
        y: point.y,
        text: 'Text',
        color: activeColor,
        strokeWidth,
        layer: elements.length,
      };
      updateElements([...elements, newEl]);
      setEditingText(newEl.id);
      return;
    }

    if (activeTool === 'sticky') {
      const newEl: CanvasElement = {
        id: Date.now().toString(),
        type: 'sticky',
        x: point.x,
        y: point.y,
        width: 200,
        height: 150,
        text: '',
        color: activeColor,
        strokeWidth,
        layer: elements.length,
      };
      updateElements([...elements, newEl]);
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPath([point]);
  }, [activeTool, elements, getCanvasPoint, activeColor, strokeWidth, updateElements]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
      return;
    }

    if (!isDrawing) return;

    const point = getCanvasPoint(e);

    if (activeTool === 'pen') {
      setCurrentPath(prev => [...prev, point]);
    } else {
      setCurrentPath([point]);
    }
  }, [isPanning, isDrawing, activeTool, getCanvasPoint]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing || !startPoint) {
      setIsDrawing(false);
      return;
    }

    const endPoint = currentPath[currentPath.length - 1] || startPoint;

    let newElement: CanvasElement | null = null;

    switch (activeTool) {
      case 'pen':
        if (currentPath.length > 1) {
          newElement = {
            id: Date.now().toString(),
            type: 'path',
            points: currentPath,
            color: activeColor,
            strokeWidth,
            layer: elements.length,
          };
        }
        break;

      case 'rectangle':
        newElement = {
          id: Date.now().toString(),
          type: 'rectangle',
          x: Math.min(startPoint.x, endPoint.x),
          y: Math.min(startPoint.y, endPoint.y),
          width: Math.abs(endPoint.x - startPoint.x),
          height: Math.abs(endPoint.y - startPoint.y),
          color: activeColor,
          strokeWidth,
          layer: elements.length,
        };
        break;

      case 'circle':
        const radius = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
        );
        newElement = {
          id: Date.now().toString(),
          type: 'circle',
          x: startPoint.x,
          y: startPoint.y,
          width: radius * 2,
          height: radius * 2,
          color: activeColor,
          strokeWidth,
          layer: elements.length,
        };
        break;

      case 'line':
        newElement = {
          id: Date.now().toString(),
          type: 'line',
          points: [startPoint, endPoint],
          color: activeColor,
          strokeWidth,
          layer: elements.length,
        };
        break;

      case 'arrow':
        newElement = {
          id: Date.now().toString(),
          type: 'arrow',
          points: [startPoint, endPoint],
          color: activeColor,
          strokeWidth,
          layer: elements.length,
        };
        break;
    }

    if (newElement) {
      updateElements([...elements, newElement]);
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setStartPoint(null);
  }, [isPanning, isDrawing, startPoint, currentPath, activeTool, activeColor, strokeWidth, elements, updateElements]);

  // Zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  }, []);

  const fitToScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Board management
  const addBoard = () => {
    const newBoard: Board = {
      id: Date.now().toString(),
      name: `Board ${boards.length + 1}`,
      elements: [],
    };
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
  };

  const deleteBoard = (id: string) => {
    if (boards.length <= 1) return;
    setBoards(prev => prev.filter(b => b.id !== id));
    if (activeBoardId === id) {
      setActiveBoardId(boards[0].id);
    }
  };

  // Export canvas
  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${activeBoard.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Delete selected element
  const deleteSelected = () => {
    if (selectedElement) {
      updateElements(elements.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  // Tool button component with glass morphism
  const ToolButton = ({ tool, icon: Icon, label }: { tool: Tool; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setActiveTool(tool)}
      className={`p-2 rounded-lg transition-all duration-200 ${
        activeTool === tool
          ? 'bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.2)]'
          : 'text-white/60 hover:text-white/90 hover:bg-white/10'
      }`}
      title={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );

  return (
    <ZWindow
      title="Freeform"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 60 }}
      initialSize={{ width: 1000, height: 700 }}
      windowType="system"
    >
      <div className="flex flex-col h-full bg-black/90">
        {/* Toolbar - Glass morphism */}
        <div
          className="flex items-center justify-between p-2 border-b border-white/10"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Tools - Glass morphism palette */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <ToolButton tool="select" icon={MousePointer} label="Select" />
            <ToolButton tool="pen" icon={PenTool} label="Pen" />
            <div className="w-px h-6 bg-white/10 mx-1" />
            <ToolButton tool="rectangle" icon={Square} label="Rectangle" />
            <ToolButton tool="circle" icon={Circle} label="Circle" />
            <ToolButton tool="line" icon={Minus} label="Line" />
            <ToolButton tool="arrow" icon={ArrowRight} label="Arrow" />
            <div className="w-px h-6 bg-white/10 mx-1" />
            <ToolButton tool="text" icon={Type} label="Text" />
            <ToolButton tool="sticky" icon={StickyNote} label="Sticky Note" />
            <ToolButton tool="image" icon={Image} label="Image" />
            <div className="w-px h-6 bg-white/10 mx-1" />
            <ToolButton tool="eraser" icon={Eraser} label="Eraser" />
            <ToolButton tool="pan" icon={Hand} label="Pan" />
          </div>

          {/* Color & Stroke - Glass morphism */}
          <div
            className="flex items-center gap-2 px-2 py-1 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-1 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div
                  className="w-5 h-5 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
                  style={{ backgroundColor: activeColor }}
                />
                <Palette className="w-4 h-4 text-white/50" />
              </button>
              {showColorPicker && (
                <div
                  className="absolute top-full right-0 mt-2 p-3 rounded-xl shadow-2xl z-20"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setActiveColor(color);
                          setShowColorPicker(false);
                        }}
                        className={`w-7 h-7 rounded-full transition-transform hover:scale-110 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] ${
                          activeColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    {STROKE_WIDTHS.map(width => (
                      <button
                        key={width}
                        onClick={() => setStrokeWidth(width)}
                        className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          strokeWidth === width
                            ? 'bg-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="rounded-full bg-white"
                          style={{ width: width, height: width }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-white/10" />

            {/* Canvas Controls */}
            <button
              onClick={() => setZoom(z => Math.min(z * 1.2, 5))}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-white/60" />
            </button>
            <span className="text-white/50 text-xs w-12 text-center font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.max(z * 0.8, 0.1))}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={fitToScreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Fit to Screen"
            >
              <Maximize className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10'
              }`}
              title="Toggle Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={`p-2 rounded-lg transition-colors ${
                showLayers ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10'
              }`}
              title="Layers"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={exportCanvas}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Export as Image"
            >
              <Download className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Canvas - Dark transparent background */}
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden relative"
            style={{ background: 'rgba(10, 10, 12, 0.95)' }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className={`w-full h-full ${
                activeTool === 'pan' || isPanning
                  ? 'cursor-grab active:cursor-grabbing'
                  : activeTool === 'pen' || activeTool === 'eraser'
                  ? 'cursor-crosshair'
                  : 'cursor-default'
              }`}
            />

            {/* Selected element controls - Glass morphism */}
            {selectedElement && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-xl shadow-2xl"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <button
                  onClick={deleteSelected}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            )}
          </div>

          {/* Layers Panel - Glass morphism */}
          {showLayers && (
            <div
              className="w-56 border-l border-white/10 flex flex-col"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div className="p-3 border-b border-white/10">
                <span className="text-white/50 text-xs uppercase tracking-wider font-medium">Layers</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {[...elements].reverse().map((el, i) => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedElement(el.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                      selectedElement === el.id
                        ? 'bg-white/15 text-white'
                        : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
                      style={{ backgroundColor: el.color }}
                    />
                    <span className="capitalize">{el.type}</span>
                    <span className="text-white/30 ml-auto text-xs">{elements.length - i}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Board Tabs - Glass morphism */}
        <div
          className="flex items-center gap-1 p-2 border-t border-white/10 overflow-x-auto"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {boards.map(board => (
            <div
              key={board.id}
              className={`group flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all ${
                activeBoardId === board.id
                  ? 'bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)]'
                  : 'text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
              onClick={() => setActiveBoardId(board.id)}
            >
              <span>{board.name}</span>
              {boards.length > 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteBoard(board.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addBoard}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="New Board"
          >
            <Plus className="w-4 h-4 text-white/50" />
          </button>
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Freeform app manifest
 */
export const FreeformManifest = {
  identifier: 'ai.hanzo.freeform',
  name: 'Freeform',
  version: '1.0.0',
  description: 'Infinite canvas whiteboard for zOS',
  category: 'productivity' as const,
  permissions: ['storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 1000, height: 700 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Freeform menu bar configuration
 */
export const FreeformMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newBoard', label: 'New Board', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'export', label: 'Export as Image...', shortcut: '⇧⌘E' },
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
        { type: 'item' as const, id: 'delete', label: 'Delete', shortcut: '⌘⌫' },
        { type: 'item' as const, id: 'selectAll', label: 'Select All', shortcut: '⌘A' },
      ],
    },
    {
      id: 'insert',
      label: 'Insert',
      items: [
        { type: 'item' as const, id: 'text', label: 'Text', shortcut: 'T' },
        { type: 'item' as const, id: 'stickyNote', label: 'Sticky Note', shortcut: 'S' },
        { type: 'item' as const, id: 'shape', label: 'Shape...' },
        { type: 'item' as const, id: 'image', label: 'Image...', shortcut: '⌘I' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'zoomIn', label: 'Zoom In', shortcut: '⌘+' },
        { type: 'item' as const, id: 'zoomOut', label: 'Zoom Out', shortcut: '⌘-' },
        { type: 'item' as const, id: 'fitToScreen', label: 'Fit to Screen', shortcut: '⌘0' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showGrid', label: 'Show Grid', shortcut: '⌘G' },
        { type: 'item' as const, id: 'showLayers', label: 'Show Layers', shortcut: '⌘L' },
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
        { type: 'item' as const, id: 'freeformHelp', label: 'Freeform Help' },
      ],
    },
  ],
};

/**
 * Freeform dock configuration
 */
export const FreeformDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newBoard', label: 'New Board' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Freeform App definition for registry
 */
export const FreeformApp = {
  manifest: FreeformManifest,
  component: FreeformWindow,
  icon: PenTool,
  menuBar: FreeformMenuBar,
  dockConfig: FreeformDockConfig,
};

export default FreeformWindow;
