# @z-os/sdk

SDK for building native applications for zOS.

[![npm version](https://img.shields.io/npm/v/@z-os/sdk.svg)](https://www.npmjs.com/package/@z-os/sdk)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@z-os/sdk)](https://bundlephobia.com/package/@z-os/sdk)

## Installation

```bash
npm install @z-os/sdk
# or
pnpm add @z-os/sdk
```

## Features

- **ZOSApp Wrapper** - Standard app chrome with window management
- **SDK Hooks** - Access storage, notifications, file system, and more
- **Menu Bar Integration** - Define app-specific menus
- **Dock Integration** - Configure dock appearance and context menus
- **Type-safe Manifests** - Full TypeScript support for app configuration

## Quick Start

```tsx
import { ZOSApp, useSDK } from '@z-os/sdk';

const manifest = {
  identifier: 'com.example.myapp',
  name: 'My App',
  version: '1.0.0',
  category: 'productivity',
};

export default function MyApp({ onClose }) {
  return (
    <ZOSApp manifest={manifest} onClose={onClose}>
      <MyAppContent />
    </ZOSApp>
  );
}

function MyAppContent() {
  const { app, storage, notifications } = useSDK();

  const handleSave = async () => {
    await storage.set('data', { saved: true });
    notifications.show({
      title: 'Saved!',
      body: 'Your data has been saved.',
    });
  };

  return (
    <div className="p-4">
      <h1>{app.manifest.name}</h1>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

## App Manifest

```typescript
interface AppManifest {
  identifier: string;      // Unique app ID (e.g., 'com.company.app')
  name: string;            // Display name
  version: string;         // Semantic version
  category?: AppCategory;  // App category
  permissions?: string[];  // Required permissions
  window?: {
    defaultWidth?: number;
    defaultHeight?: number;
    minWidth?: number;
    minHeight?: number;
    resizable?: boolean;
  };
}

type AppCategory =
  | 'productivity'
  | 'communication'
  | 'media'
  | 'system'
  | 'utilities'
  | 'reference'
  | 'finance'
  | 'navigation';
```

## SDK Hooks

### useSDK()

Main hook providing access to all SDK features:

```tsx
const {
  app,           // App manifest and metadata
  storage,       // Local storage API
  notifications, // Notification system
  fileSystem,    // File system access
  clipboard,     // Clipboard API
  menu,          // Menu bar integration
  dock,          // Dock integration
} = useSDK();
```

### Storage API

```tsx
const { storage } = useSDK();

// Get/Set values
await storage.set('key', { data: 'value' });
const data = await storage.get('key');

// Delete
await storage.delete('key');

// Clear all app storage
await storage.clear();
```

### Notifications API

```tsx
const { notifications } = useSDK();

notifications.show({
  title: 'Hello',
  body: 'This is a notification',
  icon: '/app-icon.png',
  actions: [
    { label: 'View', onClick: () => console.log('viewed') },
  ],
});
```

### File System API

```tsx
const { fileSystem } = useSDK();

// Read file
const content = await fileSystem.readFile('/path/to/file.txt');

// Write file
await fileSystem.writeFile('/path/to/file.txt', 'content');

// List directory
const files = await fileSystem.readDirectory('/path/to/dir');

// Check if exists
const exists = await fileSystem.exists('/path/to/file.txt');
```

### Menu Bar Integration

```tsx
import { useMenu } from '@z-os/sdk';

function MyApp() {
  const { setMenuBar } = useMenu();

  useEffect(() => {
    setMenuBar([
      {
        label: 'File',
        items: [
          { label: 'New', shortcut: '⌘N', onClick: handleNew },
          { label: 'Open...', shortcut: '⌘O', onClick: handleOpen },
          { type: 'separator' },
          { label: 'Save', shortcut: '⌘S', onClick: handleSave },
        ],
      },
      {
        label: 'Edit',
        items: [
          { label: 'Undo', shortcut: '⌘Z', onClick: handleUndo },
          { label: 'Redo', shortcut: '⇧⌘Z', onClick: handleRedo },
        ],
      },
    ]);
  }, []);

  return <div>...</div>;
}
```

### Dock Integration

```tsx
import { useDock } from '@z-os/sdk';

function MyApp() {
  const { setDockConfig } = useDock();

  useEffect(() => {
    setDockConfig({
      contextMenu: [
        { label: 'New Window', onClick: handleNewWindow },
        { type: 'separator' },
        { label: 'Options', items: [
          { label: 'Show Badge', checked: true, onClick: toggleBadge },
        ]},
      ],
      badge: 3, // Show notification badge
    });
  }, []);

  return <div>...</div>;
}
```

## Full App Example

```tsx
import { ZOSApp, useSDK, useMenu } from '@z-os/sdk';

const manifest = {
  identifier: 'com.example.notes',
  name: 'Notes',
  version: '1.0.0',
  category: 'productivity',
  permissions: ['storage.local', 'notifications'],
  window: {
    defaultWidth: 600,
    defaultHeight: 500,
    minWidth: 300,
    minHeight: 200,
  },
};

const menuBar = [
  {
    label: 'File',
    items: [
      { label: 'New Note', shortcut: '⌘N' },
      { label: 'Save', shortcut: '⌘S' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: '⌘Z' },
      { label: 'Redo', shortcut: '⇧⌘Z' },
    ],
  },
];

const dockConfig = {
  contextMenu: [
    { label: 'New Note' },
    { type: 'separator' },
    { label: 'Show All Notes' },
  ],
};

export function NotesApp({ onClose, onFocus }) {
  return (
    <ZOSApp
      manifest={manifest}
      menuBar={menuBar}
      dockConfig={dockConfig}
      onClose={onClose}
      onFocus={onFocus}
    >
      <NotesContent />
    </ZOSApp>
  );
}

function NotesContent() {
  const { storage, notifications } = useSDK();
  const [notes, setNotes] = useState([]);

  // Load notes on mount
  useEffect(() => {
    storage.get('notes').then(setNotes);
  }, []);

  const saveNotes = async () => {
    await storage.set('notes', notes);
    notifications.show({ title: 'Saved!' });
  };

  return (
    <div className="p-4">
      {notes.map(note => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}

export default NotesApp;
```

## Bundle Size

~36 KB (gzipped)

## License

MIT

## Links

- [GitHub](https://github.com/z-os4/os)
- [Documentation](https://z-os4.github.io/os/)
- [npm](https://www.npmjs.com/package/@z-os/sdk)
