/**
 * Stocks App
 *
 * Stock ticker and watchlist app for zOS.
 * Black glass UI with glass morphism effects.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  X,
  Star,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface StocksWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  marketCap: string;
  previousClose: number;
  historicalData: number[];
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

const STORAGE_KEY = 'zos-stocks-watchlist';

// Generate realistic-looking mock historical data
function generateHistoricalData(basePrice: number, points: number, volatility: number = 0.02): number[] {
  const data: number[] = [];
  let price = basePrice * (1 - Math.random() * 0.1);
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.48) * volatility * basePrice;
    price = Math.max(price * 0.8, price + change);
    data.push(price);
  }
  // Ensure last point is close to current price
  const adjustmentFactor = basePrice / data[data.length - 1];
  return data.map((p, i) => p * (1 + (adjustmentFactor - 1) * (i / data.length)));
}

// Mock stock data
const mockStocks: Record<string, StockData> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.72,
    change: 2.34,
    changePercent: 1.33,
    open: 176.38,
    high: 179.45,
    low: 175.82,
    volume: '52.3M',
    marketCap: '2.79T',
    previousClose: 176.38,
    historicalData: generateHistoricalData(178.72, 100),
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 141.80,
    change: -1.25,
    changePercent: -0.87,
    open: 143.05,
    high: 144.20,
    low: 140.95,
    volume: '18.7M',
    marketCap: '1.78T',
    previousClose: 143.05,
    historicalData: generateHistoricalData(141.80, 100),
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.91,
    change: 4.56,
    changePercent: 1.22,
    open: 374.35,
    high: 380.12,
    low: 373.50,
    volume: '21.4M',
    marketCap: '2.81T',
    previousClose: 374.35,
    historicalData: generateHistoricalData(378.91, 100),
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 178.25,
    change: 3.12,
    changePercent: 1.78,
    open: 175.13,
    high: 179.80,
    low: 174.50,
    volume: '45.2M',
    marketCap: '1.85T',
    previousClose: 175.13,
    historicalData: generateHistoricalData(178.25, 100),
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.50,
    change: -5.75,
    changePercent: -2.26,
    open: 254.25,
    high: 256.30,
    low: 246.80,
    volume: '112.5M',
    marketCap: '789.2B',
    previousClose: 254.25,
    historicalData: generateHistoricalData(248.50, 100, 0.03),
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 495.22,
    change: 12.45,
    changePercent: 2.58,
    open: 482.77,
    high: 498.50,
    low: 480.25,
    volume: '38.9M',
    marketCap: '1.22T',
    previousClose: 482.77,
    historicalData: generateHistoricalData(495.22, 100, 0.025),
  },
  META: {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 354.50,
    change: 6.80,
    changePercent: 1.96,
    open: 347.70,
    high: 356.25,
    low: 346.50,
    volume: '14.3M',
    marketCap: '910.5B',
    previousClose: 347.70,
    historicalData: generateHistoricalData(354.50, 100),
  },
  JPM: {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 172.35,
    change: -0.85,
    changePercent: -0.49,
    open: 173.20,
    high: 174.50,
    low: 171.80,
    volume: '8.2M',
    marketCap: '498.7B',
    previousClose: 173.20,
    historicalData: generateHistoricalData(172.35, 100, 0.015),
  },
};

// Mock news data
const mockNews: NewsItem[] = [
  { id: '1', title: 'Tech stocks rally as Fed signals rate pause', source: 'Reuters', time: '2h ago', url: '#' },
  { id: '2', title: 'Apple announces new AI features for iPhone', source: 'Bloomberg', time: '4h ago', url: '#' },
  { id: '3', title: 'Microsoft cloud revenue beats expectations', source: 'CNBC', time: '6h ago', url: '#' },
  { id: '4', title: 'NVIDIA chips power new AI infrastructure', source: 'WSJ', time: '8h ago', url: '#' },
  { id: '5', title: 'Tesla deliveries exceed analyst estimates', source: 'MarketWatch', time: '1d ago', url: '#' },
];

// Simple line chart component
const LineChart: React.FC<{
  data: number[];
  color: string;
  height?: number;
  showGrid?: boolean;
}> = ({ data, color, height = 200, showGrid = true }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative w-full" style={{ height }}>
      {showGrid && (
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-white/[0.03] w-full" />
          ))}
        </div>
      )}
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${color})`}
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {showGrid && (
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-white/30 -ml-1">
          <span>${max.toFixed(2)}</span>
          <span>${((max + min) / 2).toFixed(2)}</span>
          <span>${min.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

const StocksWindow: React.FC<StocksWindowProps> = ({ onClose, onFocus }) => {
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'GOOGL', 'MSFT', 'AMZN']);
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');

  // Load watchlist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchlist(parsed);
          setSelectedStock(parsed[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load watchlist:', e);
    }
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist:', e);
    }
  }, [watchlist]);

  // Get data points based on time range
  const getDataForRange = useCallback((data: number[]): number[] => {
    const rangePoints: Record<TimeRange, number> = {
      '1D': 24,
      '1W': 35,
      '1M': 50,
      '3M': 75,
      '1Y': 90,
      'ALL': 100,
    };
    const points = rangePoints[timeRange];
    return data.slice(-points);
  }, [timeRange]);

  // Filter stocks for search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return Object.values(mockStocks)
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query)
      )
      .filter((stock) => !watchlist.includes(stock.symbol))
      .slice(0, 5);
  }, [searchQuery, watchlist]);

  // Add to watchlist
  const addToWatchlist = useCallback((symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist((prev) => [...prev, symbol]);
    }
    setSearchQuery('');
    setShowSearch(false);
  }, [watchlist]);

  // Remove from watchlist
  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
    if (selectedStock === symbol) {
      const remaining = watchlist.filter((s) => s !== symbol);
      setSelectedStock(remaining[0] || '');
    }
  }, [watchlist, selectedStock]);

  const selected = mockStocks[selectedStock];

  return (
    <ZWindow
      title="Stocks"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 150, y: 80 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/80 backdrop-blur-2xl">
        {/* Watchlist Sidebar */}
        <div className="w-64 border-r border-white/[0.08] flex flex-col bg-black/40 backdrop-blur-xl">
          {/* Header */}
          <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
            <h2 className="text-white/90 font-medium text-sm tracking-wide">Watchlist</h2>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1.5 hover:bg-white/[0.08] rounded-lg transition-all duration-200 border border-transparent hover:border-white/[0.1]"
            >
              {showSearch ? (
                <X className="w-4 h-4 text-white/50" />
              ) : (
                <Plus className="w-4 h-4 text-white/50" />
              )}
            </button>
          </div>

          {/* Search */}
          {showSearch && (
            <div className="p-2 border-b border-white/[0.08]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks..."
                  className="w-full bg-white/[0.06] backdrop-blur-sm text-white/90 placeholder:text-white/30 pl-8 pr-3 py-2 rounded-lg text-sm outline-none border border-white/[0.08] focus:border-white/20 focus:bg-white/[0.08] transition-all duration-200"
                  autoFocus
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 space-y-1">
                  {searchResults.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => addToWatchlist(stock.symbol)}
                      className="w-full flex items-center justify-between p-2 hover:bg-white/[0.06] rounded-lg text-left transition-all duration-200 border border-transparent hover:border-white/[0.08]"
                    >
                      <div>
                        <p className="text-white/90 text-sm font-medium">{stock.symbol}</p>
                        <p className="text-white/40 text-xs truncate">{stock.name}</p>
                      </div>
                      <Plus className="w-4 h-4 text-green-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stock List */}
          <div className="flex-1 overflow-y-auto">
            {watchlist.map((symbol) => {
              const stock = mockStocks[symbol];
              if (!stock) return null;
              const isPositive = stock.change >= 0;
              return (
                <div
                  key={symbol}
                  onClick={() => setSelectedStock(symbol)}
                  className={`group p-3 cursor-pointer border-b border-white/[0.04] transition-all duration-200 ${
                    selectedStock === symbol 
                      ? 'bg-white/[0.08] border-l-2 border-l-blue-400' 
                      : 'hover:bg-white/[0.04] border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white/90 font-medium text-sm">{stock.symbol}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchlist(symbol);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-all duration-200"
                        >
                          <X className="w-3 h-3 text-white/40" />
                        </button>
                      </div>
                      <p className="text-white/40 text-xs truncate">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/90 font-medium text-sm">${stock.price.toFixed(2)}</p>
                      <p className={`text-xs flex items-center justify-end gap-0.5 font-medium ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  {/* Mini chart */}
                  <div className="mt-2 h-8">
                    <LineChart
                      data={stock.historicalData.slice(-30)}
                      color={isPositive ? '#34d399' : '#f87171'}
                      height={32}
                      showGrid={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
          {selected ? (
            <>
              {/* Stock Header */}
              <div className="p-5 border-b border-white/[0.08] bg-black/30 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-white/95 text-2xl font-semibold tracking-tight">{selected.name}</h1>
                    <p className="text-white/40 text-sm mt-0.5">{selected.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-3xl font-bold tracking-tight">${selected.price.toFixed(2)}</p>
                    <p className={`text-base flex items-center justify-end gap-1 font-semibold mt-1 ${
                      selected.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selected.change >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {selected.change >= 0 ? '+' : ''}{selected.change.toFixed(2)} ({selected.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="p-5 border-b border-white/[0.08]">
                {/* Time Range Selector */}
                <div className="flex gap-1 mb-4 p-1 bg-white/[0.04] rounded-lg w-fit backdrop-blur-sm border border-white/[0.06]">
                  {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        timeRange === range
                          ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                {/* Chart */}
                <div className="pl-10">
                  <LineChart
                    data={getDataForRange(selected.historicalData)}
                    color={selected.change >= 0 ? '#34d399' : '#f87171'}
                    height={200}
                  />
                </div>
              </div>

              {/* Stats and News */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-2 gap-6">
                  {/* Key Stats */}
                  <div>
                    <h3 className="text-white/80 font-medium mb-3 text-sm tracking-wide">Key Statistics</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Open', value: `$${selected.open.toFixed(2)}` },
                        { label: 'Previous Close', value: `$${selected.previousClose.toFixed(2)}` },
                        { label: 'Day High', value: `$${selected.high.toFixed(2)}` },
                        { label: 'Day Low', value: `$${selected.low.toFixed(2)}` },
                        { label: 'Volume', value: selected.volume },
                        { label: 'Market Cap', value: `$${selected.marketCap}` },
                      ].map((stat) => (
                        <div 
                          key={stat.label} 
                          className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-3 border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200"
                        >
                          <p className="text-white/40 text-xs">{stat.label}</p>
                          <p className="text-white/90 font-medium text-sm mt-0.5">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* News */}
                  <div>
                    <h3 className="text-white/80 font-medium mb-3 text-sm tracking-wide">Related News</h3>
                    <div className="space-y-2">
                      {mockNews.slice(0, 4).map((news) => (
                        <a
                          key={news.id}
                          href={news.url}
                          className="block bg-white/[0.04] backdrop-blur-sm rounded-xl p-3 border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200 group"
                        >
                          <p className="text-white/80 text-sm line-clamp-2 group-hover:text-white transition-colors duration-200">
                            {news.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-white/40 text-xs">{news.source}</span>
                            <span className="text-white/20 text-xs">|</span>
                            <span className="text-white/40 text-xs">{news.time}</span>
                            <ExternalLink className="w-3 h-3 text-white/20 ml-auto group-hover:text-white/40 transition-colors duration-200" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No stock selected</p>
                <p className="text-sm mt-1 text-white/20">Add stocks to your watchlist to get started</p>
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
 * Stocks app manifest
 */
export const StocksManifest = {
  identifier: 'ai.hanzo.stocks',
  name: 'Stocks',
  version: '1.0.0',
  description: 'Stock ticker and watchlist app for zOS',
  category: 'finance' as const,
  permissions: ['network', 'storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Stocks menu bar configuration
 */
export const StocksMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'addStock', label: 'Add Stock...', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'export', label: 'Export Watchlist...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: '1d', label: '1 Day', shortcut: '⌘1' },
        { type: 'item' as const, id: '1w', label: '1 Week', shortcut: '⌘2' },
        { type: 'item' as const, id: '1m', label: '1 Month', shortcut: '⌘3' },
        { type: 'item' as const, id: '3m', label: '3 Months', shortcut: '⌘4' },
        { type: 'item' as const, id: '1y', label: '1 Year', shortcut: '⌘5' },
        { type: 'item' as const, id: 'all', label: 'All Time', shortcut: '⌘6' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'refresh', label: 'Refresh Data', shortcut: '⌘R' },
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
        { type: 'item' as const, id: 'stocksHelp', label: 'Stocks Help' },
      ],
    },
  ],
};

/**
 * Stocks dock configuration
 */
export const StocksDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'addStock', label: 'Add Stock' },
    { type: 'item' as const, id: 'refresh', label: 'Refresh Data' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Stocks App definition for registry
 */
export const StocksApp = {
  manifest: StocksManifest,
  component: StocksWindow,
  icon: TrendingUp,
  menuBar: StocksMenuBar,
  dockConfig: StocksDockConfig,
};

export default StocksWindow;
