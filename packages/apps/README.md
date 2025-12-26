# @z-os/apps

36 built-in applications for zOS.

[![npm version](https://img.shields.io/npm/v/@z-os/apps.svg)](https://www.npmjs.com/package/@z-os/apps)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@z-os/apps)](https://bundlephobia.com/package/@z-os/apps)

## Installation

```bash
npm install @z-os/apps
# or
pnpm add @z-os/apps
```

## Usage

### Import Individual Apps

```tsx
import { CalculatorWindow, NotesWindow, TerminalWindow } from '@z-os/apps';

function Desktop() {
  return (
    <>
      <CalculatorWindow onClose={() => {}} onFocus={() => {}} />
      <NotesWindow onClose={() => {}} onFocus={() => {}} />
      <TerminalWindow onClose={() => {}} onFocus={() => {}} />
    </>
  );
}
```

### Access App Definitions

```tsx
import { CalculatorApp, NotesApp, TerminalApp } from '@z-os/apps';

// Get manifest
console.log(CalculatorApp.manifest);
// { identifier: 'ai.hanzo.calculator', name: 'Calculator', ... }

// Get menu bar config
console.log(NotesApp.menuBar);
// [{ label: 'File', items: [...] }, ...]

// Get dock config
console.log(TerminalApp.dockConfig);
// { contextMenu: [...] }
```

## Apps Catalog

### Core Apps (10)

| App | Export | Description |
|-----|--------|-------------|
| Finder | `FinderWindow`, `FinderApp` | File manager |
| Safari | `SafariWindow`, `SafariApp` | Web browser |
| Mail | `MailWindow`, `MailApp` | Email client |
| Photos | `PhotosWindow`, `PhotosApp` | Photo library |
| Calendar | `CalendarWindow`, `CalendarApp` | Calendar |
| Messages | `MessagesWindow`, `MessagesApp` | Messaging |
| FaceTime | `FaceTimeWindow`, `FaceTimeApp` | Video calls |
| Music | `MusicWindow`, `MusicApp` | Music player |
| Terminal | `TerminalWindow`, `TerminalApp` | Command line |
| TextEdit | `TextEditWindow`, `TextEditApp` | Text editor |

### Productivity Apps (6)

| App | Export | Description |
|-----|--------|-------------|
| Notes | `NotesWindow`, `NotesApp` | Note taking |
| Reminders | `RemindersWindow`, `RemindersApp` | Tasks & reminders |
| Stickies | `StickiesWindow`, `StickiesApp` | Sticky notes |
| Contacts | `ContactsWindow`, `ContactsApp` | Address book |
| Freeform | `FreeformWindow`, `FreeformApp` | Whiteboard |
| Translate | `TranslateWindow`, `TranslateApp` | Translation |

### Media Apps (5)

| App | Export | Description |
|-----|--------|-------------|
| Podcasts | `PodcastsWindow`, `PodcastsApp` | Podcast player |
| Books | `BooksWindow`, `BooksApp` | E-book reader |
| News | `NewsWindow`, `NewsApp` | News aggregator |
| Voice Memos | `VoiceMemosWindow`, `VoiceMemosApp` | Audio recorder |
| Preview | `PreviewWindow`, `PreviewApp` | Document viewer |

### Navigation (1)

| App | Export | Description |
|-----|--------|-------------|
| Maps | `MapsWindow`, `MapsApp` | Maps & directions |

### System Apps (9)

| App | Export | Description |
|-----|--------|-------------|
| Settings | `SettingsWindow`, `SettingsApp` | System preferences |
| Calculator | `CalculatorWindow`, `CalculatorApp` | Calculator |
| Clock | `ClockWindow`, `ClockApp` | World clock |
| Weather | `WeatherWindow`, `WeatherApp` | Weather forecast |
| Activity Monitor | `ActivityMonitorWindow`, `ActivityMonitorApp` | System monitor |
| Console | `ConsoleWindow`, `ConsoleApp` | System logs |
| Disk Utility | `DiskUtilityWindow`, `DiskUtilityApp` | Disk management |
| Font Book | `FontBookWindow`, `FontBookApp` | Font manager |
| Passwords | `PasswordsWindow`, `PasswordsApp` | Password manager |

### Reference & Finance (2)

| App | Export | Description |
|-----|--------|-------------|
| Dictionary | `DictionaryWindow`, `DictionaryApp` | Dictionary |
| Stocks | `StocksWindow`, `StocksApp` | Stock market |

### Hanzo Ecosystem (3)

| App | Export | Description |
|-----|--------|-------------|
| Hanzo AI | `HanzoAIWindow`, `HanzoAIApp` | AI assistant |
| Lux Wallet | `LuxWindow`, `LuxApp` | Crypto wallet |
| Zoo | `ZooWindow`, `ZooApp` | Zoo Labs |

## App Structure

Each app exports:

```typescript
// Window component
export const XxxWindow: React.FC<AppWindowProps>;

// Full app definition
export const XxxApp: {
  manifest: AppManifest;
  menuBar: MenuBarConfig;
  dockConfig: DockConfig;
  icon: React.FC;
};

// Individual exports
export const XxxManifest: AppManifest;
export const XxxMenuBar: MenuBarConfig;
export const XxxDockConfig: DockConfig;
```

## Window Props

All window components accept:

```typescript
interface AppWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}
```

## Examples

### Render Calculator

```tsx
import { CalculatorWindow } from '@z-os/apps';

<CalculatorWindow
  onClose={() => closeWindow('Calculator')}
  onFocus={() => focusWindow('Calculator')}
/>
```

### Get All Apps

```tsx
import * as Apps from '@z-os/apps';

const allApps = [
  Apps.FinderApp,
  Apps.SafariApp,
  Apps.CalculatorApp,
  // ...
];

// List all app names
allApps.forEach(app => {
  console.log(app.manifest.name);
});
```

### Dynamic Loading

```tsx
import { lazy, Suspense } from 'react';

const CalculatorWindow = lazy(() =>
  import('@z-os/apps').then(m => ({ default: m.CalculatorWindow }))
);

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <CalculatorWindow onClose={handleClose} />
    </Suspense>
  );
}
```

## Bundle Size

~347 KB (gzipped) - includes all 36 apps

For smaller bundles, consider dynamic imports for apps not needed at startup.

## License

MIT

## Links

- [GitHub](https://github.com/z-os4/os)
- [Documentation](https://z-os4.github.io/os/)
- [npm](https://www.npmjs.com/package/@z-os/apps)
