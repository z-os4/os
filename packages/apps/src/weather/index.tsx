import React, { useState, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, ThermometerSun, MapPin, RefreshCw, CloudSun } from 'lucide-react';

interface WeatherWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface WeatherData {
  city: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  humidity: number;
  wind: number;
  high: number;
  low: number;
  forecast: {
    day: string;
    high: number;
    low: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  }[];
}

// Mock weather data
const mockWeather: WeatherData = {
  city: 'San Francisco',
  temp: 68,
  condition: 'cloudy',
  humidity: 65,
  wind: 12,
  high: 72,
  low: 58,
  forecast: [
    { day: 'Mon', high: 72, low: 58, condition: 'cloudy' },
    { day: 'Tue', high: 74, low: 60, condition: 'sunny' },
    { day: 'Wed', high: 70, low: 56, condition: 'cloudy' },
    { day: 'Thu', high: 68, low: 54, condition: 'rainy' },
    { day: 'Fri', high: 66, low: 52, condition: 'rainy' },
    { day: 'Sat', high: 70, low: 55, condition: 'cloudy' },
    { day: 'Sun', high: 73, low: 58, condition: 'sunny' },
  ],
};

const WeatherWindow: React.FC<WeatherWindowProps> = ({ onClose, onFocus }) => {
  const [weather, setWeather] = useState<WeatherData>(mockWeather);
  const [loading, setLoading] = useState(false);

  const getWeatherIcon = (condition: string, size = 'w-8 h-8') => {
    const icons: Record<string, React.ReactNode> = {
      sunny: <Sun className={`${size} text-amber-400`} />,
      cloudy: <Cloud className={`${size} text-white/80`} />,
      rainy: <CloudRain className={`${size} text-sky-400`} />,
      snowy: <CloudSnow className={`${size} text-white`} />,
    };
    return icons[condition] || icons.sunny;
  };

  const refresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setWeather({
        ...mockWeather,
        temp: Math.round(mockWeather.temp + (Math.random() - 0.5) * 10),
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <ZWindow
      title="Weather"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 160, y: 90 }}
      initialSize={{ width: 380, height: 520 }}
      windowType="system"
    >
      <div className="h-full bg-black/80 backdrop-blur-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4 text-white/60" />
            <span className="font-medium">{weather.city}</span>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-white/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Current Weather */}
        <div className="text-center py-8 px-4">
          <div className="flex items-center justify-center mb-4">
            {getWeatherIcon(weather.condition, 'w-20 h-20')}
          </div>
          <div className="text-7xl font-extralight text-white mb-2 tracking-tight">
            {weather.temp}<span className="text-4xl text-white/50">°</span>
          </div>
          <div className="text-white/60 text-lg capitalize mb-4">
            {weather.condition}
          </div>
          <div className="text-white/40 text-sm">
            H:{weather.high}° L:{weather.low}°
          </div>
        </div>

        {/* Weather Details */}
        <div className="mx-4 mb-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-1">
                <Droplets className="w-5 h-5 text-sky-400/80" />
              </div>
              <div className="text-white text-lg font-medium">{weather.humidity}%</div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Humidity</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Wind className="w-5 h-5 text-white/60" />
              </div>
              <div className="text-white text-lg font-medium">{weather.wind} mph</div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Wind</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <ThermometerSun className="w-5 h-5 text-orange-400/80" />
              </div>
              <div className="text-white text-lg font-medium">{weather.high}°</div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Feels Like</div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="mx-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-3">7-Day Forecast</div>
          <div className="space-y-1">
            {weather.forecast.map((day, i) => (
              <div
                key={day.day}
                className={`flex items-center justify-between py-2 ${
                  i < weather.forecast.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="w-12 text-white/80 font-medium">{day.day}</div>
                <div className="flex-1 flex justify-center">
                  {getWeatherIcon(day.condition, 'w-5 h-5')}
                </div>
                <div className="text-right">
                  <span className="text-white/90">{day.high}°</span>
                  <span className="text-white/40 ml-2">{day.low}°</span>
                </div>
              </div>
            ))}
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
 * Weather app manifest
 */
export const WeatherManifest = {
  identifier: 'ai.hanzo.weather',
  name: 'Weather',
  version: '1.0.0',
  description: 'Weather app for zOS',
  category: 'utilities' as const,
  permissions: ['location', 'network'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 380, height: 520 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Weather menu bar configuration
 */
export const WeatherMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'addLocation', label: 'Add Location...', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'refresh', label: 'Refresh', shortcut: '⌘R' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'hourlyForecast', label: 'Hourly Forecast' },
        { type: 'item' as const, id: 'dailyForecast', label: '10-Day Forecast' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'radarMap', label: 'Radar Map' },
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
        { type: 'item' as const, id: 'weatherHelp', label: 'Weather Help' },
      ],
    },
  ],
};

/**
 * Weather dock configuration
 */
export const WeatherDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'refresh', label: 'Refresh' },
    { type: 'item' as const, id: 'addLocation', label: 'Add Location' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Weather App definition for registry
 */
export const WeatherApp = {
  manifest: WeatherManifest,
  component: WeatherWindow,
  icon: CloudSun,
  menuBar: WeatherMenuBar,
  dockConfig: WeatherDockConfig,
};

export default WeatherWindow;
