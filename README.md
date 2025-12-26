# z-os4

A modular, composable web-based operating system built with React.

## Architecture

```
packages/
  @z-os/core        # Window manager, hooks, contexts, services
  @z-os/ui          # UI components (ZWindow, etc.)
  @z-os/sdk         # App development SDK
  @z-os/apps-loader # Dynamic app loading from CDN

apps/
  shell             # Minimal shell app that composes everything
```

## Quick Start

```bash
pnpm install
pnpm dev
```

## Building

```bash
pnpm build
```

## Package Structure

### @z-os/core
Core OS functionality:
- `useWindowManager` - Window state management
- `useDesktopSettings` - Theme, wallpaper, dock settings
- `useOverlays` - Modal/overlay management
- `DockProvider` / `useDock` - Dock state management
- `TerminalProvider` / `useTerminal` - Terminal emulator
- `logger` - Unified logging utility

### @z-os/ui
UI components:
- `ZWindow` - macOS-style window with titlebar, resize, drag
- `WindowTitleBar` - Window title bar with traffic light controls
- `WindowControls` - Close/minimize/maximize buttons
- `cn` - Tailwind class name utility

### @z-os/sdk
App development SDK:
- `ZOSApp` - App wrapper component with standard window chrome
- `useSDK` - Access all SDK functionality
- Hooks: `useApp`, `useStorage`, `useNotifications`, `useFileSystem`, etc.
- Types for app manifests

### @z-os/apps-loader
Dynamic app loading:
- Load apps from zos-apps GitHub org via ESM CDN (jsDelivr)
- Registry caching with GitHub Pages
- Sandbox/error boundary

## Creating Apps

Apps are loaded dynamically from the `zos-apps` GitHub organization.

### App package.json

```json
{
  "name": "@zos-apps/my-app",
  "version": "1.0.0",
  "zos": {
    "id": "com.example.myapp",
    "name": "My App",
    "icon": "🚀",
    "category": "utilities",
    "permissions": ["storage.local"]
  }
}
```

### App Component

```tsx
import { ZOSApp, useSDK } from '@z-os/sdk';

const manifest = {
  identifier: 'com.example.myapp',
  name: 'My App',
  version: '1.0.0',
};

export default function MyApp({ onClose }) {
  return (
    <ZOSApp manifest={manifest} onClose={onClose}>
      <MyAppContent />
    </ZOSApp>
  );
}

function MyAppContent() {
  const { app, notifications } = useSDK();

  return (
    <div>
      <h1>{app.manifest.name}</h1>
      <button onClick={() => notifications.show({ title: 'Hello!' })}>
        Notify
      </button>
    </div>
  );
}
```

## Bundle Sizes

| Package | Size (gzip) |
|---------|-------------|
| @z-os/core | ~4 KB |
| @z-os/ui | ~14 KB |
| @z-os/sdk | ~20 KB |
| @z-os/apps-loader | ~4 KB |

## License

MIT
