import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  Wifi, Bluetooth, Palette, Monitor, Bell, Lock, Users, Keyboard,
  Mouse, Accessibility, Clock, Battery, Globe, ChevronRight
} from 'lucide-react';

interface SettingsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const SettingsWindow: React.FC<SettingsWindowProps> = ({ onClose, onFocus }) => {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'users', label: 'Users & Groups', icon: Users },
    { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
    { id: 'trackpad', label: 'Trackpad', icon: Mouse },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'datetime', label: 'Date & Time', icon: Clock },
    { id: 'battery', label: 'Battery', icon: Battery },
    { id: 'language', label: 'Language & Region', icon: Globe },
  ];

  return (
    <ZWindow
      title="System Preferences"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 200, y: 120 }}
      initialSize={{ width: 800, height: 550 }}
      windowType="system"
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-56 bg-black/30 border-r border-white/10 overflow-y-auto">
          <div className="p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-500/20 text-white'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-blue-400' : 'text-white/50'}`} />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeSection === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">General</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h3 className="text-white font-medium">About This zOS</h3>
                    <p className="text-sm text-white/50">Version 1.0.0</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h3 className="text-white font-medium">Software Update</h3>
                    <p className="text-sm text-white/50">Your system is up to date</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-3">Theme</h3>
                  <div className="flex gap-4">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border-2 border-blue-500">
                      <div className="w-16 h-12 rounded bg-[#1e1e1e] border border-white/20" />
                      <span className="text-sm text-white">Dark</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20">
                      <div className="w-16 h-12 rounded bg-white border border-gray-300" />
                      <span className="text-sm text-white/70">Light</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20">
                      <div className="w-16 h-12 rounded bg-gradient-to-b from-white to-[#1e1e1e] border border-white/20" />
                      <span className="text-sm text-white/70">Auto</span>
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-3">Accent Color</h3>
                  <div className="flex gap-3">
                    {['#007AFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#AF52DE', '#FF2D55', '#8E8E93'].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection !== 'general' && activeSection !== 'appearance' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  {sections.find(s => s.id === activeSection)?.icon &&
                    React.createElement(sections.find(s => s.id === activeSection)!.icon, {
                      className: 'w-8 h-8 text-white/30'
                    })
                  }
                </div>
                <h3 className="text-white/50">
                  {sections.find(s => s.id === activeSection)?.label} settings
                </h3>
                <p className="text-sm text-white/30 mt-1">Coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default SettingsWindow;
