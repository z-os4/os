import React from 'react';

// ============================================================================
// MACOS-STYLE ICON PACK
// All icons are designed to look like native macOS dock icons
// ============================================================================

// Finder Icon - Classic macOS Finder face (2-tone with simple black features)
export const FinderIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="finderFaceClip">
        <rect x="8" y="10" width="48" height="44" rx="10" />
      </clipPath>
    </defs>
    {/* Rounded square background */}
    <rect x="4" y="4" width="56" height="56" rx="12" fill="#1E90FF" />
    {/* Face container with clip */}
    <g clipPath="url(#finderFaceClip)">
      {/* Face - left half (darker blue) */}
      <rect x="8" y="10" width="24" height="44" fill="#3BABF0" />
      {/* Face - right half (lighter blue) */}
      <rect x="32" y="10" width="24" height="44" fill="#A8DBF7" />
    </g>
    {/* Face outline for rounded corners */}
    <rect x="8" y="10" width="48" height="44" rx="10" fill="none" stroke="#1E90FF" strokeWidth="0.5" />
    {/* Left eye - simple black rectangle with rounded corners */}
    <rect x="19" y="24" width="3" height="9" rx="1.5" fill="#1a1a1a" />
    {/* Right eye - simple black rectangle with rounded corners */}
    <rect x="42" y="24" width="3" height="9" rx="1.5" fill="#1a1a1a" />
    {/* Smile - simple black curved line */}
    <path d="M21 42 Q32 50 43 42" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// Safari Icon - Compass
export const SafariIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="safariGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#63D3FF" />
        <stop offset="100%" stopColor="#0070E0" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#safariGrad)" />
    {/* Compass outer ring */}
    <circle cx="32" cy="32" r="20" fill="none" stroke="white" strokeWidth="2" />
    {/* Direction marks */}
    <text x="32" y="17" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">N</text>
    <text x="32" y="51" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">S</text>
    <text x="17" y="34" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">W</text>
    <text x="47" y="34" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">E</text>
    {/* Compass needle */}
    <polygon points="32,18 36,32 32,36 28,32" fill="#FF3B30" />
    <polygon points="32,46 28,32 32,28 36,32" fill="white" />
  </svg>
);

// Terminal Icon - Clean minimal design
export const TerminalIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="56" height="56" rx="12" fill="#1a1a1a" />
    {/* Terminal prompt chevron */}
    <path d="M16 24 L26 32 L16 40" stroke="#4AF626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Underscore cursor at baseline */}
    <rect x="32" y="38" width="14" height="3" fill="#4AF626" opacity="0.9" />
  </svg>
);

// Calculator Icon
export const CalculatorIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="calcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4A4A4A" />
        <stop offset="100%" stopColor="#2A2A2A" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#calcGrad)" />
    {/* Display */}
    <rect x="10" y="10" width="44" height="16" rx="4" fill="#1c1c1c" />
    <text x="48" y="22" textAnchor="end" fill="#FF9F0A" fontSize="10" fontWeight="300">1,234</text>
    {/* Buttons */}
    <circle cx="16" cy="34" r="5" fill="#A5A5A5" />
    <circle cx="28" cy="34" r="5" fill="#505050" />
    <circle cx="40" cy="34" r="5" fill="#505050" />
    <circle cx="52" cy="34" r="5" fill="#FF9F0A" />
    <circle cx="16" cy="46" r="5" fill="#505050" />
    <circle cx="28" cy="46" r="5" fill="#505050" />
    <circle cx="40" cy="46" r="5" fill="#505050" />
    <circle cx="52" cy="46" r="5" fill="#FF9F0A" />
  </svg>
);

// Notes Icon - Yellow notepad (macOS style)
export const NotesIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="notesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFDC5D" />
        <stop offset="100%" stopColor="#FFB800" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#notesGrad)" />
    {/* Paper */}
    <rect x="12" y="10" width="40" height="44" rx="4" fill="white" />
    {/* Lines */}
    <line x1="18" y1="22" x2="46" y2="22" stroke="#E0E0E0" strokeWidth="1" />
    <line x1="18" y1="30" x2="46" y2="30" stroke="#E0E0E0" strokeWidth="1" />
    <line x1="18" y1="38" x2="46" y2="38" stroke="#E0E0E0" strokeWidth="1" />
    <line x1="18" y1="46" x2="38" y2="46" stroke="#E0E0E0" strokeWidth="1" />
    {/* Text */}
    <text x="18" y="20" fill="#333" fontSize="7" fontWeight="500">Hello World</text>
  </svg>
);

// Clock Icon
export const ClockIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="clockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2A2A2A" />
        <stop offset="100%" stopColor="#1A1A1A" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#clockGrad)" />
    {/* Clock face */}
    <circle cx="32" cy="32" r="22" fill="white" />
    {/* Hour markers */}
    <rect x="31" y="12" width="2" height="4" fill="#333" />
    <rect x="31" y="48" width="2" height="4" fill="#333" />
    <rect x="12" y="31" width="4" height="2" fill="#333" />
    <rect x="48" y="31" width="4" height="2" fill="#333" />
    {/* Hour hand */}
    <rect x="31" y="22" width="2" height="12" rx="1" fill="#333" />
    {/* Minute hand */}
    <rect x="31" y="17" width="1.5" height="15" rx="0.75" fill="#666" transform="rotate(90 32 32)" />
    {/* Second hand */}
    <rect x="31.5" y="14" width="1" height="18" rx="0.5" fill="#FF3B30" />
    {/* Center dot */}
    <circle cx="32" cy="32" r="2" fill="#333" />
  </svg>
);

// Weather Icon
export const WeatherIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="weatherGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5AB3FF" />
        <stop offset="100%" stopColor="#1E90FF" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#weatherGrad)" />
    {/* Sun */}
    <circle cx="42" cy="22" r="8" fill="#FFD426" />
    {/* Sun rays */}
    <line x1="42" y1="10" x2="42" y2="14" stroke="#FFD426" strokeWidth="2" strokeLinecap="round" />
    <line x1="54" y1="22" x2="50" y2="22" stroke="#FFD426" strokeWidth="2" strokeLinecap="round" />
    <line x1="50" y1="14" x2="48" y2="16" stroke="#FFD426" strokeWidth="2" strokeLinecap="round" />
    {/* Cloud */}
    <ellipse cx="28" cy="38" rx="14" ry="10" fill="white" />
    <ellipse cx="20" cy="42" rx="10" ry="8" fill="white" />
    <ellipse cx="38" cy="42" rx="12" ry="8" fill="white" />
    <rect x="16" y="42" width="28" height="10" fill="white" />
  </svg>
);

// Reminders Icon - Checklist (macOS style)
export const RemindersIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="56" height="56" rx="12" fill="white" />
    {/* Checkmarks */}
    <circle cx="18" cy="20" r="6" fill="none" stroke="#ff9500" strokeWidth="2" />
    <path d="M15 20 L17 22 L21 17" stroke="#ff9500" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="28" y="17" width="24" height="3" rx="1" fill="#1a1a1a" />

    <circle cx="18" cy="36" r="6" fill="none" stroke="#34c759" strokeWidth="2" />
    <path d="M15 36 L17 38 L21 33" stroke="#34c759" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="28" y="33" width="20" height="3" rx="1" fill="#1a1a1a" />

    <circle cx="18" cy="52" r="6" fill="none" stroke="#007aff" strokeWidth="2" />
    <rect x="28" y="49" width="16" height="3" rx="1" fill="#1a1a1a" />
  </svg>
);

// App Store Icon - macOS style with blue gradient and stylized A
export const AppStoreIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="appStoreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#19AFFF" />
        <stop offset="100%" stopColor="#0066CC" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#appStoreGrad)" />
    {/* Stylized A made of overlapping drawing tools */}
    {/* Main A shape */}
    <path d="M32 12 L18 52 L24 52 L27 44 L37 44 L40 52 L46 52 L32 12Z" fill="white" />
    {/* Inner triangle cutout */}
    <path d="M32 24 L28.5 40 L35.5 40 L32 24Z" fill="url(#appStoreGrad)" />
    {/* Horizontal crossbar enhancement */}
    <rect x="26" y="36" width="12" height="3" rx="1" fill="white" />
    {/* Decorative pencils/rulers forming the A */}
    <rect x="14" y="48" width="14" height="4" rx="1" fill="white" opacity="0.8" transform="rotate(-15 21 50)" />
    <rect x="36" y="48" width="14" height="4" rx="1" fill="white" opacity="0.8" transform="rotate(15 43 50)" />
  </svg>
);

// Settings/System Preferences Icon - Gear
export const SettingsIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="settingsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8E8E93" />
        <stop offset="100%" stopColor="#636366" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#settingsGrad)" />
    {/* Gear */}
    <path d="M32 20c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="white"/>
    <path d="M50 29h-3.1c-.4-1.5-1-2.9-1.8-4.2l2.2-2.2c.8-.8.8-2 0-2.8l-2.8-2.8c-.8-.8-2-.8-2.8 0l-2.2 2.2c-1.3-.8-2.7-1.4-4.2-1.8V14c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3.1c-1.5.4-2.9 1-4.2 1.8l-2.2-2.2c-.8-.8-2-.8-2.8 0l-2.8 2.8c-.8.8-.8 2 0 2.8l2.2 2.2c-.8 1.3-1.4 2.7-1.8 4.2H14c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h3.1c.4 1.5 1 2.9 1.8 4.2l-2.2 2.2c-.8.8-.8 2 0 2.8l2.8 2.8c.8.8 2 .8 2.8 0l2.2-2.2c1.3.8 2.7 1.4 4.2 1.8V50c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-3.1c1.5-.4 2.9-1 4.2-1.8l2.2 2.2c.8.8 2 .8 2.8 0l2.8-2.8c.8-.8.8-2 0-2.8l-2.2-2.2c.8-1.3 1.4-2.7 1.8-4.2H50c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2z" fill="white"/>
  </svg>
);

// macOS Trash Icon
export const TrashIcon: React.FC<{ className?: string; full?: boolean }> = ({ className = "w-12 h-12", full = false }) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="trashBodyGrad" x1="32" y1="14" x2="32" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D8D8DA"/>
        <stop offset="0.5" stopColor="#C0C0C2"/>
        <stop offset="1" stopColor="#A8A8AA"/>
      </linearGradient>
      <linearGradient id="trashLidGrad" x1="32" y1="8" x2="32" y2="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E0E0E2"/>
        <stop offset="1" stopColor="#C8C8CA"/>
      </linearGradient>
    </defs>
    <path d="M16 14H48V56C48 58.2091 46.2091 60 44 60H20C17.7909 60 16 58.2091 16 56V14Z" fill="url(#trashBodyGrad)"/>
    <rect x="22" y="20" width="2" height="34" rx="1" fill="rgba(0,0,0,0.15)"/>
    <rect x="31" y="20" width="2" height="34" rx="1" fill="rgba(0,0,0,0.15)"/>
    <rect x="40" y="20" width="2" height="34" rx="1" fill="rgba(0,0,0,0.15)"/>
    <path d="M12 10C12 8.89543 12.8954 8 14 8H50C51.1046 8 52 8.89543 52 10V14H12V10Z" fill="url(#trashLidGrad)"/>
    <rect x="26" y="4" width="12" height="4" rx="2" fill="#8A8A8C"/>
    {full && (
      <>
        <circle cx="28" cy="8" r="6" fill="#F0E6D3"/>
        <circle cx="36" cy="6" r="5" fill="#E8DCC8"/>
        <circle cx="32" cy="2" r="4" fill="#F5EDE0"/>
      </>
    )}
  </svg>
);

// Hanzo AI Icon - White H shape with diagonal stripe on black background
export const HanzoIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="64" height="64" rx="12" fill="#000000" />
    <g transform="translate(12, 12) scale(0.6)">
      <path d="M22.21 67V44.6369H0V67H22.21Z" fill="white"/>
      <path d="M0 44.6369L22.21 46.8285V44.6369H0Z" fill="white" opacity="0.7"/>
      <path d="M66.7038 22.3184H22.2534L0.0878906 44.6367H44.4634L66.7038 22.3184Z" fill="white"/>
      <path d="M22.21 0H0V22.3184H22.21V0Z" fill="white"/>
      <path d="M66.7198 0H44.5098V22.3184H66.7198V0Z" fill="white"/>
      <path d="M66.6753 22.3185L44.5098 20.0822V22.3185H66.6753Z" fill="white" opacity="0.7"/>
      <path d="M66.7198 67V44.6369H44.5098V67H66.7198Z" fill="white"/>
    </g>
  </svg>
);

// Mail Icon - Envelope
export const MailIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5AC8FA" />
        <stop offset="100%" stopColor="#007AFF" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#mailGrad)" />
    {/* Envelope body */}
    <rect x="10" y="18" width="44" height="30" rx="2" fill="white" />
    {/* Envelope flap */}
    <path d="M10 20 L32 36 L54 20" stroke="#007AFF" strokeWidth="2" fill="none" />
  </svg>
);

// Photos Icon - Colorful flower
export const PhotosIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="photosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF9500" />
        <stop offset="33%" stopColor="#FF2D55" />
        <stop offset="66%" stopColor="#AF52DE" />
        <stop offset="100%" stopColor="#5856D6" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="white" />
    {/* Flower petals */}
    <circle cx="32" cy="22" r="8" fill="#FF9500" />
    <circle cx="22" cy="30" r="8" fill="#FF2D55" />
    <circle cx="24" cy="42" r="8" fill="#AF52DE" />
    <circle cx="40" cy="42" r="8" fill="#5856D6" />
    <circle cx="42" cy="30" r="8" fill="#34C759" />
    <circle cx="32" cy="34" r="6" fill="#FFD60A" />
  </svg>
);

// Calendar Icon - Calendar with current date
export const CalendarIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  const today = new Date();
  const day = today.getDate().toString();
  const weekday = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="white" />
      {/* Red header */}
      <rect x="4" y="4" width="56" height="18" rx="12" fill="#FF3B30" />
      <rect x="4" y="14" width="56" height="8" fill="#FF3B30" />
      {/* Day of week */}
      <text x="32" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">{weekday}</text>
      {/* Date number */}
      <text x="32" y="48" textAnchor="middle" fill="#1a1a1a" fontSize="26" fontWeight="300">{day}</text>
    </svg>
  );
};

// Messages Icon - Chat bubble (macOS style)
export const MessagesIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="messagesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5AF158" />
        <stop offset="100%" stopColor="#2BD439" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#messagesGrad)" />
    {/* Chat bubble */}
    <ellipse cx="32" cy="30" rx="18" ry="14" fill="white" />
    <path d="M20 40 Q18 48 12 50 Q22 48 26 42" fill="white" />
  </svg>
);

// FaceTime Icon - Video camera on green background (macOS style)
export const FaceTimeIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="faceTimeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5AF158" />
        <stop offset="100%" stopColor="#32D74B" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#faceTimeGrad)" />
    {/* Video camera body - rounded rectangle */}
    <rect x="10" y="22" width="30" height="20" rx="4" fill="white" />
    {/* Video camera lens/viewfinder triangle */}
    <path d="M42 24 L54 18 L54 46 L42 40 Z" fill="white" />
  </svg>
);

// Music Icon
export const MusicIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="musicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FC5C7D" />
        <stop offset="100%" stopColor="#6A82FB" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#musicGrad)" />
    {/* Music note - properly connected */}
    <ellipse cx="22" cy="44" rx="9" ry="7" fill="white" />
    <rect x="28" y="16" width="4" height="30" fill="white" />
    <path d="M28 16 L28 20 L48 14 L48 10 Z" fill="white" />
  </svg>
);

// TextEdit Icon - Notepad with lines and red margin (macOS style)
export const TextEditIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="textEditClip">
        <rect x="4" y="4" width="56" height="56" rx="12" />
      </clipPath>
    </defs>
    {/* White background with rounded corners */}
    <rect x="4" y="4" width="56" height="56" rx="12" fill="white" />
    {/* Clipped content */}
    <g clipPath="url(#textEditClip)">
      {/* Red margin line - full height */}
      <line x1="16" y1="0" x2="16" y2="64" stroke="#E85D5D" strokeWidth="1.5" />
      {/* Horizontal ruled lines - full width */}
      <line x1="0" y1="18" x2="64" y2="18" stroke="#C8C8CD" strokeWidth="1" />
      <line x1="0" y1="28" x2="64" y2="28" stroke="#C8C8CD" strokeWidth="1" />
      <line x1="0" y1="38" x2="64" y2="38" stroke="#C8C8CD" strokeWidth="1" />
      <line x1="0" y1="48" x2="64" y2="48" stroke="#C8C8CD" strokeWidth="1" />
    </g>
  </svg>
);

// macOS Folder Icon - Pure SVG for proper dock sizing
export const MacFolderIcon: React.FC<{ className?: string; badgeType?: 'apps' | 'downloads' }> = ({ className = "w-12 h-12", badgeType }) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="folderGrad" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6CB5E9"/>
        <stop offset="1" stopColor="#3A8DD0"/>
      </linearGradient>
      <linearGradient id="folderFrontGrad" x1="32" y1="14" x2="32" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8AC7F0"/>
        <stop offset="1" stopColor="#4A9FE3"/>
      </linearGradient>
    </defs>
    {/* Folder back */}
    <path d="M2 10C2 7.79086 3.79086 6 6 6H22L26 12H58C60.2091 12 62 13.7909 62 16V56C62 58.2091 60.2091 60 58 60H6C3.79086 60 2 58.2091 2 56V10Z" fill="url(#folderGrad)"/>
    {/* Folder front */}
    <path d="M2 18C2 15.7909 3.79086 14 6 14H58C60.2091 14 62 15.7909 62 18V56C62 58.2091 60.2091 60 58 60H6C3.79086 60 2 58.2091 2 56V18Z" fill="url(#folderFrontGrad)"/>
    {/* Apps badge - Grid of app squares like macOS Launchpad */}
    {badgeType === 'apps' && (
      <g transform="translate(18, 24)">
        {/* 3x3 grid of rounded squares */}
        <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.95"/>
        <rect x="11" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.95"/>
        <rect x="20" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.95"/>
        <rect x="2" y="11" width="6" height="6" rx="1.5" fill="white" opacity="0.95"/>
        <rect x="11" y="11" width="6" height="6" rx="1.5" fill="white" opacity="0.95"/>
        <rect x="20" y="11" width="6" height="6" rx="1.5" fill="white" opacity="0.95"/>
        <rect x="2" y="20" width="6" height="6" rx="1.5" fill="white" opacity="0.85"/>
        <rect x="11" y="20" width="6" height="6" rx="1.5" fill="white" opacity="0.85"/>
        <rect x="20" y="20" width="6" height="6" rx="1.5" fill="white" opacity="0.85"/>
      </g>
    )}
    {/* Downloads badge - Arrow down in circle */}
    {badgeType === 'downloads' && (
      <g transform="translate(20, 26)">
        <circle cx="12" cy="12" r="10" fill="white" opacity="0.95"/>
        <path d="M12 6V14M12 14L8 10M12 14L16 10" stroke="#4A9FE3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 18H17" stroke="#4A9FE3" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    )}
  </svg>
);

// Lux Logo - Upside down triangle
export const LuxLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="64" height="64" rx="12" fill="#000000" />
    <path d="M32 48 L16 20 L48 20 Z" fill="white"/>
  </svg>
);

// Zoo Logo - Three overlapping RGB circles (larger, less whitespace)
export const ZooLogo: React.FC<{ className?: string; mono?: boolean }> = ({ className = "w-12 h-12", mono = false }) => {
  if (mono) {
    return (
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="64" height="64" rx="12" fill="#000000" />
        <g transform="translate(2, 4) scale(0.060)">
          <defs>
            <clipPath id="outerCircleMono">
              <circle cx="508" cy="510" r="283"/>
            </clipPath>
          </defs>
          <g clipPath="url(#outerCircleMono)">
            <circle cx="513" cy="369" r="234" fill="none" stroke="white" strokeWidth="33"/>
            <circle cx="365" cy="595" r="234" fill="none" stroke="white" strokeWidth="33"/>
            <circle cx="643" cy="595" r="234" fill="none" stroke="white" strokeWidth="33"/>
            <circle cx="508" cy="510" r="265" fill="none" stroke="white" strokeWidth="36"/>
          </g>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="64" height="64" rx="12" fill="#000000" />
      <g transform="translate(2, 4) scale(0.060)">
      <defs>
        <clipPath id="outerCircleColor">
          <circle cx="512" cy="511" r="270"/>
        </clipPath>
        <clipPath id="greenClip">
          <circle cx="513" cy="369" r="234"/>
        </clipPath>
        <clipPath id="redClip">
          <circle cx="365" cy="595" r="234"/>
        </clipPath>
        <clipPath id="blueClip">
          <circle cx="643" cy="595" r="234"/>
        </clipPath>
      </defs>
      <g clipPath="url(#outerCircleColor)">
        <circle cx="513" cy="369" r="234" fill="#00A652"/>
        <circle cx="365" cy="595" r="234" fill="#ED1C24"/>
        <circle cx="643" cy="595" r="234" fill="#2E3192"/>
        <g clipPath="url(#greenClip)">
          <circle cx="365" cy="595" r="234" fill="#FCF006"/>
        </g>
        <g clipPath="url(#greenClip)">
          <circle cx="643" cy="595" r="234" fill="#01ACF1"/>
        </g>
        <g clipPath="url(#redClip)">
          <circle cx="643" cy="595" r="234" fill="#EA018E"/>
        </g>
        <g clipPath="url(#greenClip)">
          <g clipPath="url(#redClip)">
            <circle cx="643" cy="595" r="234" fill="#FFFFFF"/>
          </g>
        </g>
      </g>
      </g>
    </svg>
  );
};
