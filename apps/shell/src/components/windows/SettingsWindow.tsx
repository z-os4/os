import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { useDesktopSettings } from '@z-os/core';
import {
  Wifi, Bluetooth, Palette, Monitor, Bell, Lock, Users, Keyboard,
  Mouse, Accessibility, Clock, Battery, Globe, ChevronRight, Check,
  Volume2, Moon, Sun, Laptop, WifiOff, BluetoothOff, User, Camera,
  Fingerprint, Shield, Eye, EyeOff, HardDrive, Cloud, Download,
  Trash2, RefreshCw, Info, ExternalLink, Zap, Gauge
} from 'lucide-react';
import { cn } from '@z-os/ui';

interface SettingsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Toggle switch component
const Toggle: React.FC<{ enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({
  enabled, onChange, disabled
}) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    className={cn(
      "w-11 h-6 rounded-full transition-colors relative",
      enabled ? "bg-green-500" : "bg-[var(--zos-border-primary)]",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <div className={cn(
      "absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform",
      enabled ? "translate-x-5 bg-white" : "translate-x-0.5 bg-[var(--zos-text-primary)]"
    )} />
  </button>
);

// Slider component
const Slider: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number }> = ({
  value, onChange, min = 0, max = 100
}) => (
  <input
    type="range"
    min={min}
    max={max}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    className="w-full h-1 bg-[var(--zos-border-primary)] rounded-full appearance-none cursor-pointer
      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--zos-accent-primary)] [&::-webkit-slider-thumb]:shadow"
  />
);

// Setting row component
const SettingRow: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ label, description, children, onClick }) => (
  <div
    className={cn(
      "flex items-center justify-between p-4 rounded-lg bg-[var(--zos-bg-tertiary)] border border-[var(--zos-border-primary)]",
      onClick && "cursor-pointer hover:bg-[var(--zos-surface-glass-hover)]"
    )}
    onClick={onClick}
  >
    <div>
      <h3 className="zos-text-primary font-medium">{label}</h3>
      {description && <p className="text-sm zos-text-muted">{description}</p>}
    </div>
    {children}
  </div>
);

const SettingsWindow: React.FC<SettingsWindowProps> = ({ onClose, onFocus }) => {
  const [activeSection, setActiveSection] = useState('general');
  const { theme, setTheme, colorScheme, setColorScheme } = useDesktopSettings();

  // Local state for settings
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(80);
  const [nightShift, setNightShift] = useState(false);
  const [autoLock, setAutoLock] = useState('5');
  const [keyRepeatSpeed, setKeyRepeatSpeed] = useState(70);
  const [trackpadSpeed, setTrackpadSpeed] = useState(50);
  const [tapToClick, setTapToClick] = useState(true);
  const [naturalScrolling, setNaturalScrolling] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [increaseContrast, setIncreaseContrast] = useState(false);
  const [is24Hour, setIs24Hour] = useState(true);
  const [autoTimezone, setAutoTimezone] = useState(true);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [optimizedCharging, setOptimizedCharging] = useState(true);

  const sections = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'sound', label: 'Sound', icon: Volume2 },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'users', label: 'Users & Groups', icon: Users },
    { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
    { id: 'trackpad', label: 'Trackpad', icon: Mouse },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'datetime', label: 'Date & Time', icon: Clock },
    { id: 'battery', label: 'Battery', icon: Battery },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'language', label: 'Language & Region', icon: Globe },
  ];

  const wallpapers = [
    { id: 'sequoia', name: 'Sequoia', preview: '/wallpapers/sequoia.png' },
    { id: 'sonoma', name: 'Sonoma', preview: '/wallpapers/sonoma.png' },
    { id: 'ventura', name: 'Ventura', preview: '/wallpapers/ventura.png' },
    { id: 'monterey', name: 'Monterey', preview: '/wallpapers/monterey.png' },
    { id: 'big-sur', name: 'Big Sur', preview: '/wallpapers/big-sur.png' },
    { id: 'catalina', name: 'Catalina', preview: '/wallpapers/catalina.png' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">General</h2>
            <div className="space-y-3">
              <SettingRow label="About This zOS" description="Version 4.2.0">
                <ChevronRight className="w-5 h-5 zos-text-muted" />
              </SettingRow>
              <SettingRow label="Software Update" description="Your system is up to date">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <ChevronRight className="w-5 h-5 zos-text-muted" />
                </div>
              </SettingRow>
              <SettingRow label="Storage" description="128 GB available">
                <ChevronRight className="w-5 h-5 zos-text-muted" />
              </SettingRow>
              <SettingRow label="AirDrop" description="Contacts Only">
                <ChevronRight className="w-5 h-5 zos-text-muted" />
              </SettingRow>
              <SettingRow label="Login Items" description="5 items open at login">
                <ChevronRight className="w-5 h-5 zos-text-muted" />
              </SettingRow>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Appearance</h2>

            {/* Theme */}
            <div>
              <h3 className="zos-text-primary font-medium mb-3">Theme</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setColorScheme('dark')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border-2 transition-colors",
                    colorScheme === 'dark' ? "border-blue-500" : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="w-16 h-12 rounded bg-[#1e1e1e] border border-white/20 flex items-center justify-center">
                    <Moon className="w-6 h-6 zos-text-muted" />
                  </div>
                  <span className="text-sm zos-text-primary">Dark</span>
                </button>
                <button
                  onClick={() => setColorScheme('light')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border-2 transition-colors",
                    colorScheme === 'light' ? "border-blue-500" : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="w-16 h-12 rounded bg-white border border-gray-300 flex items-center justify-center">
                    <Sun className="w-6 h-6 text-yellow-500" />
                  </div>
                  <span className="text-sm zos-text-primary/70">Light</span>
                </button>
                <button
                  onClick={() => setColorScheme('system')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border-2 transition-colors",
                    colorScheme === 'system' ? "border-blue-500" : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="w-16 h-12 rounded bg-gradient-to-b from-white to-[#1e1e1e] border border-white/20 flex items-center justify-center">
                    <Laptop className="w-6 h-6 text-gray-500" />
                  </div>
                  <span className="text-sm zos-text-primary/70">Auto</span>
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <h3 className="zos-text-primary font-medium mb-3">Accent Color</h3>
              <div className="flex gap-3">
                {['#007AFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#AF52DE', '#FF2D55', '#8E8E93'].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors hover:scale-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Wallpaper */}
            <div>
              <h3 className="zos-text-primary font-medium mb-3">Wallpaper</h3>
              <div className="grid grid-cols-3 gap-3">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setTheme(wp.id)}
                    className={cn(
                      "relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                      theme === wp.id ? "border-blue-500 ring-2 ring-blue-500/50" : "border-white/10"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900" />
                    <span className="absolute bottom-1 left-2 text-xs zos-text-secondary">{wp.name}</span>
                    {theme === wp.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Night Shift */}
            <SettingRow label="Night Shift" description="Reduces blue light after sunset">
              <Toggle enabled={nightShift} onChange={setNightShift} />
            </SettingRow>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Wi-Fi</h2>
            <SettingRow label="Wi-Fi" description={wifiEnabled ? "Connected to Home Network" : "Off"}>
              <Toggle enabled={wifiEnabled} onChange={setWifiEnabled} />
            </SettingRow>

            {wifiEnabled && (
              <>
                <div>
                  <h3 className="zos-text-muted text-sm mb-2">Known Networks</h3>
                  <div className="space-y-2">
                    {['Home Network', 'Office WiFi', 'Coffee Shop'].map((network, i) => (
                      <div key={network} className="flex items-center justify-between p-3 rounded-lg bg-[var(--zos-bg-tertiary)] border border-[var(--zos-border-primary)]">
                        <div className="flex items-center gap-3">
                          <Wifi className={cn("w-4 h-4", i === 0 ? "text-blue-400" : "zos-text-muted")} />
                          <span className="zos-text-primary">{network}</span>
                          {i === 0 && <span className="text-xs zos-text-muted">Connected</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {i === 0 && <Check className="w-4 h-4 text-blue-400" />}
                          <Lock className="w-3 h-3 zos-text-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <SettingRow label="Ask to Join Networks" description="Known networks will be joined automatically">
                  <Toggle enabled={true} onChange={() => {}} />
                </SettingRow>
              </>
            )}
          </div>
        );

      case 'bluetooth':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Bluetooth</h2>
            <SettingRow label="Bluetooth" description={bluetoothEnabled ? "On" : "Off"}>
              <Toggle enabled={bluetoothEnabled} onChange={setBluetoothEnabled} />
            </SettingRow>

            {bluetoothEnabled && (
              <div>
                <h3 className="zos-text-muted text-sm mb-2">My Devices</h3>
                <div className="space-y-2">
                  {[
                    { name: 'AirPods Pro', type: 'Headphones', connected: true, battery: 85 },
                    { name: 'Magic Keyboard', type: 'Keyboard', connected: true, battery: 92 },
                    { name: 'Magic Mouse', type: 'Mouse', connected: false, battery: 45 },
                  ].map((device) => (
                    <div key={device.name} className="flex items-center justify-between p-3 rounded-lg bg-[var(--zos-bg-tertiary)] border border-[var(--zos-border-primary)]">
                      <div className="flex items-center gap-3">
                        <Bluetooth className={cn("w-4 h-4", device.connected ? "text-blue-400" : "zos-text-muted")} />
                        <div>
                          <span className="zos-text-primary">{device.name}</span>
                          <span className="text-xs zos-text-muted ml-2">{device.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Battery className="w-4 h-4 zos-text-muted" />
                          <span className="text-xs zos-text-muted">{device.battery}%</span>
                        </div>
                        {device.connected && <span className="text-xs text-green-400">Connected</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Notifications</h2>
            <SettingRow label="Allow Notifications" description="Show notifications on the desktop">
              <Toggle enabled={notificationsEnabled} onChange={setNotificationsEnabled} />
            </SettingRow>
            <SettingRow label="Do Not Disturb" description="Silence all notifications">
              <Toggle enabled={doNotDisturb} onChange={setDoNotDisturb} />
            </SettingRow>

            <div>
              <h3 className="zos-text-muted text-sm mb-2">Application Notifications</h3>
              <div className="space-y-2">
                {['Messages', 'Mail', 'Calendar', 'Reminders', 'Safari'].map((app) => (
                  <div key={app} className="flex items-center justify-between p-3 rounded-lg bg-[var(--zos-bg-tertiary)] border border-[var(--zos-border-primary)]">
                    <span className="zos-text-primary">{app}</span>
                    <Toggle enabled={true} onChange={() => {}} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'sound':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Sound</h2>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="zos-text-primary font-medium">Output Volume</h3>
                <span className="zos-text-muted">{volume}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 zos-text-muted" />
                <Slider value={volume} onChange={setVolume} />
              </div>
            </div>

            <div>
              <h3 className="zos-text-muted text-sm mb-2">Output Device</h3>
              <div className="space-y-2">
                {['MacBook Pro Speakers', 'AirPods Pro', 'External Display'].map((device, i) => (
                  <div key={device} className="flex items-center justify-between p-3 rounded-lg bg-[var(--zos-bg-tertiary)] border border-[var(--zos-border-primary)]">
                    <span className="zos-text-primary">{device}</span>
                    {i === 0 && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                ))}
              </div>
            </div>

            <SettingRow label="Play sound effects" description="UI sounds and alerts">
              <Toggle enabled={true} onChange={() => {}} />
            </SettingRow>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Privacy & Security</h2>

            <div>
              <h3 className="zos-text-muted text-sm mb-2">Privacy</h3>
              <div className="space-y-2">
                {[
                  { icon: Camera, label: 'Camera', desc: '2 apps have access' },
                  { icon: Volume2, label: 'Microphone', desc: '3 apps have access' },
                  { icon: Globe, label: 'Location Services', desc: 'On' },
                  { icon: User, label: 'Contacts', desc: '4 apps have access' },
                  { icon: Fingerprint, label: 'Touch ID', desc: 'Configured' },
                ].map(({ icon: Icon, label, desc }) => (
                  <SettingRow key={label} label={label} description={desc}>
                    <ChevronRight className="w-5 h-5 zos-text-muted" />
                  </SettingRow>
                ))}
              </div>
            </div>

            <div>
              <h3 className="zos-text-muted text-sm mb-2">Security</h3>
              <SettingRow label="FileVault" description="Disk encryption is on">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">On</span>
                </div>
              </SettingRow>
              <div className="mt-2">
                <SettingRow label="Firewall" description="Protecting your system">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">On</span>
                  </div>
                </SettingRow>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Users & Groups</h2>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--zos-bg-tertiary)] border border-[var(--zos-border-primary)]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                Z
              </div>
              <div>
                <h3 className="zos-text-primary font-medium text-lg">Zach Kelling</h3>
                <p className="zos-text-muted">Admin</p>
              </div>
            </div>

            <SettingRow label="Password" description="Last changed 30 days ago">
              <button className="px-3 py-1.5 rounded bg-[var(--zos-border-primary)] zos-text-primary text-sm hover:bg-[var(--zos-border-primary)]/80">
                Change...
              </button>
            </SettingRow>

            <SettingRow label="Login Options" description="Automatic login disabled">
              <ChevronRight className="w-5 h-5 zos-text-muted" />
            </SettingRow>

            <div>
              <h3 className="zos-text-muted text-sm mb-2">Other Users</h3>
              <SettingRow label="Guest User" description="Allow guests to log in">
                <Toggle enabled={false} onChange={() => {}} />
              </SettingRow>
            </div>
          </div>
        );

      case 'keyboard':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Keyboard</h2>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="zos-text-primary font-medium">Key Repeat Speed</h3>
                <span className="zos-text-muted">{keyRepeatSpeed}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs zos-text-muted">Slow</span>
                <Slider value={keyRepeatSpeed} onChange={setKeyRepeatSpeed} />
                <span className="text-xs zos-text-muted">Fast</span>
              </div>
            </div>

            <SettingRow label="Press fn key to" description="Change Input Source">
              <ChevronRight className="w-5 h-5 zos-text-muted" />
            </SettingRow>

            <SettingRow label="Keyboard Shortcuts" description="Customize keyboard shortcuts">
              <ChevronRight className="w-5 h-5 zos-text-muted" />
            </SettingRow>

            <SettingRow label="Text Replacements" description="8 replacements configured">
              <ChevronRight className="w-5 h-5 zos-text-muted" />
            </SettingRow>

            <SettingRow label="Dictation" description="Off">
              <Toggle enabled={false} onChange={() => {}} />
            </SettingRow>
          </div>
        );

      case 'trackpad':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Trackpad</h2>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="zos-text-primary font-medium">Tracking Speed</h3>
                <span className="zos-text-muted">{trackpadSpeed}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs zos-text-muted">Slow</span>
                <Slider value={trackpadSpeed} onChange={setTrackpadSpeed} />
                <span className="text-xs zos-text-muted">Fast</span>
              </div>
            </div>

            <SettingRow label="Tap to Click" description="Tap with one finger to click">
              <Toggle enabled={tapToClick} onChange={setTapToClick} />
            </SettingRow>

            <SettingRow label="Natural Scrolling" description="Content tracks finger movement">
              <Toggle enabled={naturalScrolling} onChange={setNaturalScrolling} />
            </SettingRow>

            <SettingRow label="Force Click and haptic feedback" description="Click then press firmly for more options">
              <Toggle enabled={true} onChange={() => {}} />
            </SettingRow>

            <SettingRow label="More Gestures" description="Configure swipes and taps">
              <ChevronRight className="w-5 h-5 zos-text-muted" />
            </SettingRow>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Accessibility</h2>

            <div>
              <h3 className="zos-text-muted text-sm mb-2">Vision</h3>
              <div className="space-y-2">
                <SettingRow label="VoiceOver" description="Screen reader">
                  <Toggle enabled={false} onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Zoom" description="Magnify the screen">
                  <Toggle enabled={false} onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Increase Contrast" description="Reduce transparency">
                  <Toggle enabled={increaseContrast} onChange={setIncreaseContrast} />
                </SettingRow>
              </div>
            </div>

            <div>
              <h3 className="zos-text-muted text-sm mb-2">Motor</h3>
              <SettingRow label="Reduce Motion" description="Minimize interface animations">
                <Toggle enabled={reduceMotion} onChange={setReduceMotion} />
              </SettingRow>
            </div>

            <div>
              <h3 className="zos-text-muted text-sm mb-2">Hearing</h3>
              <SettingRow label="Captions" description="Show closed captions when available">
                <Toggle enabled={false} onChange={() => {}} />
              </SettingRow>
            </div>
          </div>
        );

      case 'datetime':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Date & Time</h2>

            <div className="p-4 rounded-lg bg-[var(--zos-bg-tertiary)] border border-[var(--zos-border-primary)] text-center">
              <div className="text-4xl font-light zos-text-primary mb-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="zos-text-muted">
                {new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <SettingRow label="Set time and date automatically" description="Using network time">
              <Toggle enabled={true} onChange={() => {}} />
            </SettingRow>

            <SettingRow label="Set time zone automatically" description="Using current location">
              <Toggle enabled={autoTimezone} onChange={setAutoTimezone} />
            </SettingRow>

            <SettingRow label="24-hour time" description="Use 24-hour clock format">
              <Toggle enabled={is24Hour} onChange={setIs24Hour} />
            </SettingRow>

            <SettingRow label="Show date in menu bar" description="Display date next to time">
              <Toggle enabled={true} onChange={() => {}} />
            </SettingRow>
          </div>
        );

      case 'battery':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Battery</h2>

            <div className="p-4 rounded-lg bg-[var(--zos-bg-tertiary)] border border-[var(--zos-border-primary)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Battery className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-semibold zos-text-primary">87%</div>
                    <div className="text-sm zos-text-muted">Power Adapter Connected</div>
                  </div>
                </div>
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>

            <SettingRow label="Low Power Mode" description="Reduces energy usage">
              <Toggle enabled={lowPowerMode} onChange={setLowPowerMode} />
            </SettingRow>

            <SettingRow label="Optimized Battery Charging" description="Reduces battery aging">
              <Toggle enabled={optimizedCharging} onChange={setOptimizedCharging} />
            </SettingRow>

            <SettingRow label="Show battery percentage" description="In menu bar">
              <Toggle enabled={true} onChange={() => {}} />
            </SettingRow>

            <div>
              <h3 className="zos-text-muted text-sm mb-2">Battery Health</h3>
              <SettingRow label="Maximum Capacity" description="Your battery is functioning normally">
                <span className="text-green-400">98%</span>
              </SettingRow>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Storage</h2>

            <div className="p-4 rounded-lg bg-[var(--zos-bg-tertiary)] border border-[var(--zos-border-primary)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-medium zos-text-primary">Macintosh HD</div>
                  <div className="text-sm zos-text-muted">128 GB available of 512 GB</div>
                </div>
                <HardDrive className="w-6 h-6 zos-text-muted" />
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: '45%' }} title="Apps" />
                <div className="h-full bg-yellow-500" style={{ width: '15%' }} title="Documents" />
                <div className="h-full bg-purple-500" style={{ width: '10%' }} title="Photos" />
                <div className="h-full bg-green-500" style={{ width: '5%' }} title="System" />
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Apps</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Documents</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Photos</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> System</div>
              </div>
            </div>

            <SettingRow label="Empty Trash Automatically" description="Remove items after 30 days">
              <Toggle enabled={false} onChange={() => {}} />
            </SettingRow>

            <SettingRow label="Optimize Storage" description="Store files in iCloud when space is low">
              <ChevronRight className="w-5 h-5 zos-text-muted" />
            </SettingRow>

            <button className="w-full p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clean Up Storage...
            </button>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold zos-text-primary">Language & Region</h2>

            <div>
              <h3 className="zos-text-muted text-sm mb-2">Preferred Languages</h3>
              <div className="space-y-2">
                {['English (US)', 'Spanish', 'Japanese'].map((lang, i) => (
                  <div key={lang} className="flex items-center justify-between p-3 rounded-lg bg-[var(--zos-bg-tertiary)] border border-[var(--zos-border-primary)]">
                    <div className="flex items-center gap-3">
                      <span className="zos-text-muted text-sm">{i + 1}</span>
                      <span className="zos-text-primary">{lang}</span>
                      {i === 0 && <span className="text-xs text-blue-400">Primary</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SettingRow label="Region" description="United States">
              <ChevronRight className="w-5 h-5 zos-text-muted" />
            </SettingRow>

            <SettingRow label="Calendar" description="Gregorian">
              <ChevronRight className="w-5 h-5 zos-text-muted" />
            </SettingRow>

            <SettingRow label="Temperature" description="Fahrenheit">
              <ChevronRight className="w-5 h-5 zos-text-muted" />
            </SettingRow>

            <SettingRow label="First day of week" description="Sunday">
              <ChevronRight className="w-5 h-5 zos-text-muted" />
            </SettingRow>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                {sections.find(s => s.id === activeSection)?.icon &&
                  React.createElement(sections.find(s => s.id === activeSection)!.icon, {
                    className: 'w-8 h-8 zos-text-muted'
                  })
                }
              </div>
              <h3 className="zos-text-muted">
                {sections.find(s => s.id === activeSection)?.label} settings
              </h3>
            </div>
          </div>
        );
    }
  };

  return (
    <ZWindow
      title="System Preferences"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 200, y: 80 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full zos-bg-elevated">
        {/* Sidebar */}
        <div className="w-56 zos-bg-secondary border-r border-[var(--zos-border-primary)] overflow-y-auto">
          <div className="p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeSection === section.id
                    ? "bg-[var(--zos-accent-primary)]/20 zos-text-primary"
                    : "zos-text-secondary hover:bg-[var(--zos-border-primary)]"
                )}
              >
                <section.icon className={cn(
                  "w-5 h-5",
                  activeSection === section.id ? "text-[var(--zos-accent-primary)]" : "zos-text-muted"
                )} />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </ZWindow>
  );
};

export default SettingsWindow;
