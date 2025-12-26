import React, { useState, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, ThermometerSun, MapPin, RefreshCw } from 'lucide-react';

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
      sunny: <Sun className={`${size} text-yellow-400`} />,
      cloudy: <Cloud className={`${size} text-gray-300`} />,
      rainy: <CloudRain className={`${size} text-blue-400`} />,
      snowy: <CloudSnow className={`${size} text-white`} />,
    };
    return icons[condition] || icons.sunny;
  };

  const getGradient = (condition: string) => {
    const gradients: Record<string, string> = {
      sunny: 'from-orange-400 via-yellow-300 to-blue-400',
      cloudy: 'from-gray-500 via-gray-400 to-gray-600',
      rainy: 'from-gray-600 via-blue-500 to-gray-700',
      snowy: 'from-blue-200 via-gray-200 to-white',
    };
    return gradients[condition] || gradients.sunny;
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
      <div className={`h-full bg-gradient-to-b ${getGradient(weather.condition)} overflow-hidden`}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{weather.city}</span>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Current Weather */}
        <div className="text-center py-8 px-4">
          <div className="flex items-center justify-center mb-4">
            {getWeatherIcon(weather.condition, 'w-20 h-20')}
          </div>
          <div className="text-7xl font-light text-white mb-2">
            {weather.temp}
          </div>
          <div className="text-white/70 text-lg capitalize mb-4">
            {weather.condition}
          </div>
          <div className="text-white/60 text-sm">
            H:{weather.high} L:{weather.low}
          </div>
        </div>

        {/* Weather Details */}
        <div className="mx-4 mb-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-1">
                <Droplets className="w-5 h-5 text-white/70" />
              </div>
              <div className="text-white text-lg font-medium">{weather.humidity}%</div>
              <div className="text-white/50 text-xs">Humidity</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Wind className="w-5 h-5 text-white/70" />
              </div>
              <div className="text-white text-lg font-medium">{weather.wind} mph</div>
              <div className="text-white/50 text-xs">Wind</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <ThermometerSun className="w-5 h-5 text-white/70" />
              </div>
              <div className="text-white text-lg font-medium">{weather.high}</div>
              <div className="text-white/50 text-xs">Feels Like</div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="mx-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-3">7-Day Forecast</div>
          <div className="space-y-2">
            {weather.forecast.map((day, i) => (
              <div
                key={day.day}
                className={`flex items-center justify-between py-2 ${
                  i < weather.forecast.length - 1 ? 'border-b border-white/10' : ''
                }`}
              >
                <div className="w-12 text-white font-medium">{day.day}</div>
                <div className="flex-1 flex justify-center">
                  {getWeatherIcon(day.condition, 'w-5 h-5')}
                </div>
                <div className="text-right">
                  <span className="text-white">{day.high}</span>
                  <span className="text-white/50 ml-2">{day.low}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default WeatherWindow;
