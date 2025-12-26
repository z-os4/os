# @z-os/core

Core hooks, contexts, and utilities for zOS - a web-based operating system.

[![npm version](https://img.shields.io/npm/v/@z-os/core.svg)](https://www.npmjs.com/package/@z-os/core)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@z-os/core)](https://bundlephobia.com/package/@z-os/core)

## Installation

```bash
npm install @z-os/core
# or
pnpm add @z-os/core
```

## Features

- **Window Management** - Open, close, focus, minimize, maximize windows
- **Desktop Settings** - Theme, wallpaper, dock configuration
- **Dock Management** - Dock state and pinned apps
- **Terminal Emulator** - Built-in terminal with command history
- **Overlay System** - Modal and overlay management

## Usage

### Window Manager

```tsx
import { useWindowManager } from '@z-os/core';

function MyComponent() {
  const windows = useWindowManager();

  return (
    <div>
      <button onClick={() => windows.openWindow('Calculator')}>
        Open Calculator
      </button>
      <button onClick={() => windows.closeWindow('Calculator')}>
        Close Calculator
      </button>

      {windows.isOpen('Calculator') && <CalculatorWindow />}
    </div>
  );
}
```

### Desktop Settings

```tsx
import { useDesktopSettings } from '@z-os/core';

function SettingsPanel() {
  const { theme, setTheme, customBgUrl, setCustomBgUrl } = useDesktopSettings();

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="auto">Auto</option>
      </select>

      <input
        type="text"
        value={customBgUrl}
        onChange={(e) => setCustomBgUrl(e.target.value)}
        placeholder="Custom wallpaper URL"
      />
    </div>
  );
}
```

### Dock Provider

```tsx
import { DockProvider, useDock } from '@z-os/core';

// Wrap your app
function App() {
  return (
    <DockProvider>
      <Desktop />
    </DockProvider>
  );
}

// Use in components
function Dock() {
  const { pinnedApps, addToDock, removeFromDock } = useDock();

  return (
    <div className="dock">
      {pinnedApps.map(app => (
        <DockIcon key={app.id} app={app} />
      ))}
    </div>
  );
}
```

### Terminal Provider

```tsx
import { TerminalProvider, useTerminal } from '@z-os/core';

function Terminal() {
  const {
    history,
    executeCommand,
    currentDirectory,
    setCurrentDirectory
  } = useTerminal();

  const handleCommand = (cmd: string) => {
    executeCommand(cmd);
  };

  return (
    <div className="terminal">
      {history.map((entry, i) => (
        <div key={i}>
          <span>{entry.prompt}</span>
          <span>{entry.command}</span>
          <pre>{entry.output}</pre>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### Hooks

| Hook | Description |
|------|-------------|
| `useWindowManager()` | Window state management (open, close, focus, minimize, maximize) |
| `useDesktopSettings()` | Theme, wallpaper, and desktop preferences |
| `useDock()` | Dock state and pinned applications |
| `useTerminal()` | Terminal emulator with command execution |
| `useOverlays()` | Modal and overlay management |

### Types

```typescript
type AppType =
  | 'Finder' | 'Terminal' | 'Safari' | 'Music' | 'Mail' | 'Calendar'
  | 'System Preferences' | 'Photos' | 'FaceTime' | 'TextEdit' | 'Notes'
  | 'Messages' | 'Activity Monitor' | 'Hanzo AI' | 'Lux Wallet' | 'Zoo'
  | 'Calculator' | 'Clock' | 'Weather' | 'Stickies' | 'Reminders'
  | 'Books' | 'Console' | 'Contacts' | 'Dictionary' | 'Disk Utility'
  | 'Font Book' | 'Freeform' | 'Maps' | 'News' | 'Passwords'
  | 'Podcasts' | 'Preview' | 'Stocks' | 'Translate' | 'Voice Memos';

interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}
```

### Context Providers

| Provider | Purpose |
|----------|---------|
| `DockProvider` | Dock state management |
| `TerminalProvider` | Terminal emulator context |
| `QuickLookProvider` | Quick Look preview system |

## Bundle Size

~4 KB (gzipped)

## License

MIT

## Links

- [GitHub](https://github.com/z-os4/os)
- [Documentation](https://z-os4.github.io/os/)
- [npm](https://www.npmjs.com/package/@z-os/core)
