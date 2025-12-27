import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { useDesktopSettings } from '@z-os/core';
import {
  Wifi, Bluetooth, Palette, Monitor, Bell, Lock, Users, Keyboard,
  Mouse, Accessibility, Clock, Battery, Globe, ChevronRight, Check,
  Volume2, Moon, Sun, Laptop, WifiOff, BluetoothOff, User, Camera,
  Fingerprint, Shield, Eye, EyeOff, HardDrive, Cloud, Download,
  Trash2, RefreshCw, Info, ExternalLink, Zap, Gauge, Settings
} from 'lucide-react';
import { cn } from '@z-os/ui';

interface SettingsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Glass panel wrapper for sections
const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn(
    "bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-lg shadow-black/20",
    className
  )}>
    {children}
  </div>
);

// Toggle switch component
const Toggle: React.FC<{ enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({
  enabled, onChange, disabled
}) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    className={cn(
      "w-11 h-6 rounded-full transition-all duration-200 relative",
      enabled ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "bg-white/10",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <div className={cn(
      "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200",
      enabled ? "translate-x-5" : "translate-x-0.5"
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
    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
      [&::-webkit-slider-thumb]:shadow-black/30 [&::-webkit-slider-thumb]:border-0
      [&::-webkit-slider-runnable-track]:rounded-full"
  />
);

// Setting row component
const SettingRow: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
  onClick?: () => void;
  first?: boolean;
  last?: boolean;
}> = ({ label, description, children, onClick, first, last }) => (
  <div
    className={cn(
      "flex items-center justify-between px-4 py-3 bg-white/[0.02] transition-colors",
      onClick && "cursor-pointer hover:bg-white/[0.05]",
      first && "rounded-t-lg",
      last && "rounded-b-lg",
      !last && "border-b border-white/[0.05]"
    )}
    onClick={onClick}
  >
    <div className="flex-1 min-w-0">
      <h3 className="text-[13px] font-medium text-white/90">{label}</h3>
      {description && <p className="text-[11px] text-white/40 mt-0.5">{description}</p>}
    </div>
    <div className="ml-4 flex-shrink-0">
      {children}
    </div>
  </div>
);

// Section header
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-[11px] font-medium text-white/40 uppercase tracking-wider px-1 mb-2">{title}</h3>
);

// Content section title
const ContentTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[22px] font-semibold text-white/90 mb-6">{children}</h2>
);

const SettingsWindow: React.FC<SettingsWindowProps> = ({ onClose, onFocus }) => {
  const [activeSection, setActiveSection] = useState('general');
  const { theme, setTheme } = useDesktopSettings();

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
            <ContentTitle>General</ContentTitle>
            <GlassPanel>
              <SettingRow label="About This zOS" description="Version 4.2.0" first>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
              <SettingRow label="Software Update" description="Your system is up to date">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </div>
              </SettingRow>
              <SettingRow label="Storage" description="128 GB available">
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
              <SettingRow label="AirDrop" description="Contacts Only">
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
              <SettingRow label="Login Items" description="5 items open at login" last>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
            </GlassPanel>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <ContentTitle>Appearance</ContentTitle>

            {/* Theme */}
            <div>
              <SectionHeader title="Theme" />
              <div className="flex gap-4">
                <button
                  onClick={() => setTheme('sequoia')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] backdrop-blur-sm border transition-all duration-200",
                    theme === 'sequoia' 
                      ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                      : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05]"
                  )}
                >
                  <div className="w-16 h-12 rounded-lg bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-white/50" />
                  </div>
                  <span className="text-[12px] text-white/80">Dark</span>
                </button>
                <button
                  onClick={() => setTheme('sonoma')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] backdrop-blur-sm border transition-all duration-200",
                    theme === 'sonoma' 
                      ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                      : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05]"
                  )}
                >
                  <div className="w-16 h-12 rounded-lg bg-gradient-to-b from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-[12px] text-white/60">Light</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-200">
                  <div className="w-16 h-12 rounded-lg bg-gradient-to-b from-gray-200 to-[#0a0a0a] border border-white/10 flex items-center justify-center">
                    <Laptop className="w-5 h-5 text-white/50" />
                  </div>
                  <span className="text-[12px] text-white/60">Auto</span>
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <SectionHeader title="Accent Color" />
              <GlassPanel className="p-4">
                <div className="flex gap-3">
                  {['#007AFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#AF52DE', '#FF2D55', '#8E8E93'].map((color) => (
                    <button
                      key={color}
                      className="w-7 h-7 rounded-full transition-transform duration-200 hover:scale-110 ring-2 ring-black/20 hover:ring-white/30"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* Wallpaper */}
            <div>
              <SectionHeader title="Wallpaper" />
              <div className="grid grid-cols-3 gap-3">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setTheme(wp.id)}
                    className={cn(
                      "relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-[1.02]",
                      theme === wp.id 
                        ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                        : "border-white/[0.08] hover:border-white/[0.15]"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80" />
                    <span className="absolute bottom-1.5 left-2 text-[10px] text-white/70 font-medium">{wp.name}</span>
                    {theme === wp.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Night Shift */}
            <GlassPanel>
              <SettingRow label="Night Shift" description="Reduces blue light after sunset" first last>
                <Toggle enabled={nightShift} onChange={setNightShift} />
              </SettingRow>
            </GlassPanel>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-6">
            <ContentTitle>Wi-Fi</ContentTitle>
            <GlassPanel>
              <SettingRow label="Wi-Fi" description={wifiEnabled ? "Connected to Home Network" : "Off"} first last>
                <Toggle enabled={wifiEnabled} onChange={setWifiEnabled} />
              </SettingRow>
            </GlassPanel>

            {wifiEnabled && (
              <>
                <div>
                  <SectionHeader title="Known Networks" />
                  <GlassPanel>
                    {['Home Network', 'Office WiFi', 'Coffee Shop'].map((network, i, arr) => (
                      <div 
                        key={network} 
                        className={cn(
                          "flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.03]",
                          i === 0 && "rounded-t-lg",
                          i === arr.length - 1 && "rounded-b-lg",
                          i !== arr.length - 1 && "border-b border-white/[0.05]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Wifi className={cn("w-4 h-4", i === 0 ? "text-blue-400" : "text-white/30")} />
                          <span className="text-[13px] text-white/90">{network}</span>
                          {i === 0 && <span className="text-[11px] text-white/40">Connected</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {i === 0 && <Check className="w-4 h-4 text-blue-400" />}
                          <Lock className="w-3 h-3 text-white/30" />
                        </div>
                      </div>
                    ))}
                  </GlassPanel>
                </div>
                <GlassPanel>
                  <SettingRow label="Ask to Join Networks" description="Known networks will be joined automatically" first last>
                    <Toggle enabled={true} onChange={() => {}} />
                  </SettingRow>
                </GlassPanel>
              </>
            )}
          </div>
        );

      case 'bluetooth':
        return (
          <div className="space-y-6">
            <ContentTitle>Bluetooth</ContentTitle>
            <GlassPanel>
              <SettingRow label="Bluetooth" description={bluetoothEnabled ? "On" : "Off"} first last>
                <Toggle enabled={bluetoothEnabled} onChange={setBluetoothEnabled} />
              </SettingRow>
            </GlassPanel>

            {bluetoothEnabled && (
              <div>
                <SectionHeader title="My Devices" />
                <GlassPanel>
                  {[
                    { name: 'AirPods Pro', type: 'Headphones', connected: true, battery: 85 },
                    { name: 'Magic Keyboard', type: 'Keyboard', connected: true, battery: 92 },
                    { name: 'Magic Mouse', type: 'Mouse', connected: false, battery: 45 },
                  ].map((device, i, arr) => (
                    <div 
                      key={device.name} 
                      className={cn(
                        "flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.03]",
                        i === 0 && "rounded-t-lg",
                        i === arr.length - 1 && "rounded-b-lg",
                        i !== arr.length - 1 && "border-b border-white/[0.05]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Bluetooth className={cn("w-4 h-4", device.connected ? "text-blue-400" : "text-white/30")} />
                        <div>
                          <span className="text-[13px] text-white/90">{device.name}</span>
                          <span className="text-[11px] text-white/40 ml-2">{device.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Battery className="w-4 h-4 text-white/40" />
                          <span className="text-[11px] text-white/40">{device.battery}%</span>
                        </div>
                        {device.connected && <span className="text-[11px] text-green-400">Connected</span>}
                      </div>
                    </div>
                  ))}
                </GlassPanel>
              </div>
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <ContentTitle>Notifications</ContentTitle>
            <GlassPanel>
              <SettingRow label="Allow Notifications" description="Show notifications on the desktop" first>
                <Toggle enabled={notificationsEnabled} onChange={setNotificationsEnabled} />
              </SettingRow>
              <SettingRow label="Do Not Disturb" description="Silence all notifications" last>
                <Toggle enabled={doNotDisturb} onChange={setDoNotDisturb} />
              </SettingRow>
            </GlassPanel>

            <div>
              <SectionHeader title="Application Notifications" />
              <GlassPanel>
                {['Messages', 'Mail', 'Calendar', 'Reminders', 'Safari'].map((app, i, arr) => (
                  <div 
                    key={app}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.03]",
                      i === 0 && "rounded-t-lg",
                      i === arr.length - 1 && "rounded-b-lg",
                      i !== arr.length - 1 && "border-b border-white/[0.05]"
                    )}
                  >
                    <span className="text-[13px] text-white/90">{app}</span>
                    <Toggle enabled={true} onChange={() => {}} />
                  </div>
                ))}
              </GlassPanel>
            </div>
          </div>
        );

      case 'sound':
        return (
          <div className="space-y-6">
            <ContentTitle>Sound</ContentTitle>

            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-medium text-white/90">Output Volume</h3>
                <span className="text-[12px] text-white/40">{volume}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-white/40" />
                <Slider value={volume} onChange={setVolume} />
              </div>
            </GlassPanel>

            <div>
              <SectionHeader title="Output Device" />
              <GlassPanel>
                {['MacBook Pro Speakers', 'AirPods Pro', 'External Display'].map((device, i, arr) => (
                  <div 
                    key={device}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.03] cursor-pointer",
                      i === 0 && "rounded-t-lg",
                      i === arr.length - 1 && "rounded-b-lg",
                      i !== arr.length - 1 && "border-b border-white/[0.05]"
                    )}
                  >
                    <span className="text-[13px] text-white/90">{device}</span>
                    {i === 0 && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                ))}
              </GlassPanel>
            </div>

            <GlassPanel>
              <SettingRow label="Play sound effects" description="UI sounds and alerts" first last>
                <Toggle enabled={true} onChange={() => {}} />
              </SettingRow>
            </GlassPanel>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <ContentTitle>Privacy & Security</ContentTitle>

            <div>
              <SectionHeader title="Privacy" />
              <GlassPanel>
                {[
                  { icon: Camera, label: 'Camera', desc: '2 apps have access' },
                  { icon: Volume2, label: 'Microphone', desc: '3 apps have access' },
                  { icon: Globe, label: 'Location Services', desc: 'On' },
                  { icon: User, label: 'Contacts', desc: '4 apps have access' },
                  { icon: Fingerprint, label: 'Touch ID', desc: 'Configured' },
                ].map(({ icon: Icon, label, desc }, i, arr) => (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.03] cursor-pointer",
                      i === 0 && "rounded-t-lg",
                      i === arr.length - 1 && "rounded-b-lg",
                      i !== arr.length - 1 && "border-b border-white/[0.05]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-white/50" />
                      <div>
                        <span className="text-[13px] text-white/90">{label}</span>
                        <p className="text-[11px] text-white/40">{desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </div>
                ))}
              </GlassPanel>
            </div>

            <div>
              <SectionHeader title="Security" />
              <GlassPanel>
                <SettingRow label="FileVault" description="Disk encryption is on" first>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-[12px]">On</span>
                  </div>
                </SettingRow>
                <SettingRow label="Firewall" description="Protecting your system" last>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-[12px]">On</span>
                  </div>
                </SettingRow>
              </GlassPanel>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <ContentTitle>Users & Groups</ContentTitle>

            <GlassPanel className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-semibold text-white shadow-lg shadow-blue-500/20">
                  Z
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-white/90">Zach Kelling</h3>
                  <p className="text-[12px] text-white/40">Admin</p>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel>
              <SettingRow label="Password" description="Last changed 30 days ago" first>
                <button className="px-3 py-1.5 rounded-lg bg-white/[0.08] text-[12px] text-white/80 hover:bg-white/[0.12] transition-colors border border-white/[0.08]">
                  Change...
                </button>
              </SettingRow>
              <SettingRow label="Login Options" description="Automatic login disabled" last>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
            </GlassPanel>

            <div>
              <SectionHeader title="Other Users" />
              <GlassPanel>
                <SettingRow label="Guest User" description="Allow guests to log in" first last>
                  <Toggle enabled={false} onChange={() => {}} />
                </SettingRow>
              </GlassPanel>
            </div>
          </div>
        );

      case 'keyboard':
        return (
          <div className="space-y-6">
            <ContentTitle>Keyboard</ContentTitle>

            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-medium text-white/90">Key Repeat Speed</h3>
                <span className="text-[12px] text-white/40">{keyRepeatSpeed}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-white/40">Slow</span>
                <Slider value={keyRepeatSpeed} onChange={setKeyRepeatSpeed} />
                <span className="text-[11px] text-white/40">Fast</span>
              </div>
            </GlassPanel>

            <GlassPanel>
              <SettingRow label="Press fn key to" description="Change Input Source" first>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
              <SettingRow label="Keyboard Shortcuts" description="Customize keyboard shortcuts">
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
              <SettingRow label="Text Replacements" description="8 replacements configured">
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
              <SettingRow label="Dictation" description="Off" last>
                <Toggle enabled={false} onChange={() => {}} />
              </SettingRow>
            </GlassPanel>
          </div>
        );

      case 'trackpad':
        return (
          <div className="space-y-6">
            <ContentTitle>Trackpad</ContentTitle>

            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-medium text-white/90">Tracking Speed</h3>
                <span className="text-[12px] text-white/40">{trackpadSpeed}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-white/40">Slow</span>
                <Slider value={trackpadSpeed} onChange={setTrackpadSpeed} />
                <span className="text-[11px] text-white/40">Fast</span>
              </div>
            </GlassPanel>

            <GlassPanel>
              <SettingRow label="Tap to Click" description="Tap with one finger to click" first>
                <Toggle enabled={tapToClick} onChange={setTapToClick} />
              </SettingRow>
              <SettingRow label="Natural Scrolling" description="Content tracks finger movement">
                <Toggle enabled={naturalScrolling} onChange={setNaturalScrolling} />
              </SettingRow>
              <SettingRow label="Force Click and haptic feedback" description="Click then press firmly for more options">
                <Toggle enabled={true} onChange={() => {}} />
              </SettingRow>
              <SettingRow label="More Gestures" description="Configure swipes and taps" last>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
            </GlassPanel>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <ContentTitle>Accessibility</ContentTitle>

            <div>
              <SectionHeader title="Vision" />
              <GlassPanel>
                <SettingRow label="VoiceOver" description="Screen reader" first>
                  <Toggle enabled={false} onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Zoom" description="Magnify the screen">
                  <Toggle enabled={false} onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Increase Contrast" description="Reduce transparency" last>
                  <Toggle enabled={increaseContrast} onChange={setIncreaseContrast} />
                </SettingRow>
              </GlassPanel>
            </div>

            <div>
              <SectionHeader title="Motor" />
              <GlassPanel>
                <SettingRow label="Reduce Motion" description="Minimize interface animations" first last>
                  <Toggle enabled={reduceMotion} onChange={setReduceMotion} />
                </SettingRow>
              </GlassPanel>
            </div>

            <div>
              <SectionHeader title="Hearing" />
              <GlassPanel>
                <SettingRow label="Captions" description="Show closed captions when available" first last>
                  <Toggle enabled={false} onChange={() => {}} />
                </SettingRow>
              </GlassPanel>
            </div>
          </div>
        );

      case 'datetime':
        return (
          <div className="space-y-6">
            <ContentTitle>Date & Time</ContentTitle>

            <GlassPanel className="p-6 text-center">
              <div className="text-4xl font-light text-white/90 mb-1 tracking-tight">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[13px] text-white/40">
                {new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </GlassPanel>

            <GlassPanel>
              <SettingRow label="Set time and date automatically" description="Using network time" first>
                <Toggle enabled={true} onChange={() => {}} />
              </SettingRow>
              <SettingRow label="Set time zone automatically" description="Using current location">
                <Toggle enabled={autoTimezone} onChange={setAutoTimezone} />
              </SettingRow>
              <SettingRow label="24-hour time" description="Use 24-hour clock format">
                <Toggle enabled={is24Hour} onChange={setIs24Hour} />
              </SettingRow>
              <SettingRow label="Show date in menu bar" description="Display date next to time" last>
                <Toggle enabled={true} onChange={() => {}} />
              </SettingRow>
            </GlassPanel>
          </div>
        );

      case 'battery':
        return (
          <div className="space-y-6">
            <ContentTitle>Battery</ContentTitle>

            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Battery className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-semibold text-white/90">87%</div>
                    <div className="text-[12px] text-white/40">Power Adapter Connected</div>
                  </div>
                </div>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '87%' }} />
              </div>
            </GlassPanel>

            <GlassPanel>
              <SettingRow label="Low Power Mode" description="Reduces energy usage" first>
                <Toggle enabled={lowPowerMode} onChange={setLowPowerMode} />
              </SettingRow>
              <SettingRow label="Optimized Battery Charging" description="Reduces battery aging">
                <Toggle enabled={optimizedCharging} onChange={setOptimizedCharging} />
              </SettingRow>
              <SettingRow label="Show battery percentage" description="In menu bar" last>
                <Toggle enabled={true} onChange={() => {}} />
              </SettingRow>
            </GlassPanel>

            <div>
              <SectionHeader title="Battery Health" />
              <GlassPanel>
                <SettingRow label="Maximum Capacity" description="Your battery is functioning normally" first last>
                  <span className="text-green-400 text-[13px] font-medium">98%</span>
                </SettingRow>
              </GlassPanel>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-6">
            <ContentTitle>Storage</ContentTitle>

            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[15px] font-medium text-white/90">Macintosh HD</div>
                  <div className="text-[12px] text-white/40">128 GB available of 512 GB</div>
                </div>
                <HardDrive className="w-5 h-5 text-white/30" />
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: '45%' }} title="Apps" />
                <div className="h-full bg-amber-500" style={{ width: '15%' }} title="Documents" />
                <div className="h-full bg-purple-500" style={{ width: '10%' }} title="Photos" />
                <div className="h-full bg-green-500" style={{ width: '5%' }} title="System" />
              </div>
              <div className="flex gap-4 mt-3 text-[11px] text-white/50">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Apps</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Documents</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /> Photos</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> System</div>
              </div>
            </GlassPanel>

            <GlassPanel>
              <SettingRow label="Empty Trash Automatically" description="Remove items after 30 days" first>
                <Toggle enabled={false} onChange={() => {}} />
              </SettingRow>
              <SettingRow label="Optimize Storage" description="Store files in iCloud when space is low" last>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
            </GlassPanel>

            <button className="w-full p-3 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-colors flex items-center justify-center gap-2 text-[13px] font-medium">
              <Trash2 className="w-4 h-4" />
              Clean Up Storage...
            </button>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <ContentTitle>Language & Region</ContentTitle>

            <div>
              <SectionHeader title="Preferred Languages" />
              <GlassPanel>
                {['English (US)', 'Spanish', 'Japanese'].map((lang, i, arr) => (
                  <div 
                    key={lang}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.03]",
                      i === 0 && "rounded-t-lg",
                      i === arr.length - 1 && "rounded-b-lg",
                      i !== arr.length - 1 && "border-b border-white/[0.05]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-white/30 w-4">{i + 1}</span>
                      <span className="text-[13px] text-white/90">{lang}</span>
                      {i === 0 && <span className="text-[10px] text-blue-400 font-medium">Primary</span>}
                    </div>
                  </div>
                ))}
              </GlassPanel>
            </div>

            <GlassPanel>
              <SettingRow label="Region" description="United States" first>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
              <SettingRow label="Calendar" description="Gregorian">
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
              <SettingRow label="Temperature" description="Fahrenheit">
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
              <SettingRow label="First day of week" description="Sunday" last>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </SettingRow>
            </GlassPanel>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                {sections.find(s => s.id === activeSection)?.icon &&
                  React.createElement(sections.find(s => s.id === activeSection)!.icon, {
                    className: 'w-7 h-7 text-white/30'
                  })
                }
              </div>
              <h3 className="text-[14px] text-white/40">
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
      <div className="flex h-full bg-[#0d0d0d]/95 backdrop-blur-2xl">
        {/* Sidebar */}
        <div className="w-56 bg-black/40 backdrop-blur-xl border-r border-white/[0.06] overflow-y-auto">
          <div className="p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
                  activeSection === section.id
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white/80"
                )}
              >
                <section.icon className={cn(
                  "w-[18px] h-[18px]",
                  activeSection === section.id ? "text-blue-400" : "text-white/40"
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

// ============================================================================
// App Definition
// ============================================================================

/**
 * Settings app manifest
 */
export const SettingsManifest = {
  identifier: 'ai.hanzo.settings',
  name: 'System Preferences',
  version: '1.0.0',
  description: 'System settings for zOS',
  category: 'system' as const,
  permissions: ['system'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Settings menu bar configuration
 */
export const SettingsMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
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
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showAll', label: 'Show All Preferences', shortcut: '⌘L' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'search', label: 'Search', shortcut: '⌘F' },
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
        { type: 'item' as const, id: 'settingsHelp', label: 'System Preferences Help' },
      ],
    },
  ],
};

/**
 * Settings dock configuration
 */
export const SettingsDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'showAll', label: 'Show All Preferences' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Settings App definition for registry
 */
export const SettingsApp = {
  manifest: SettingsManifest,
  component: SettingsWindow,
  icon: Settings,
  menuBar: SettingsMenuBar,
  dockConfig: SettingsDockConfig,
};

export default SettingsWindow;
