# zOS Framework - LLM Context Document

## Overview

zOS is a web-based desktop operating system built with React, TypeScript, and Tailwind CSS. It provides a macOS-like experience in the browser with a comprehensive app framework supporting 50-100+ applications.

## Architecture

```
z-os4/
├── apps/
│   └── shell/           # Main desktop shell application
├── packages/
│   ├── core/            # Core services, hooks, and contexts
│   ├── ui/              # UI component library
│   ├── sdk/             # App development SDK
│   ├── apps/            # Built-in app definitions
│   ├── apps-loader/     # Dynamic app loading
│   └── runtime/         # Runtime environment
```

## Package Details

### @z-os/core (60KB gzipped: 18KB)

Core services and hooks for zOS applications.

#### Services (`/packages/core/src/services/`)

| Service | Purpose | Key Exports |
|---------|---------|-------------|
| **menuRegistry** | Dynamic menu management | `menuRegistry`, `createStandardMenus`, `useMenu` |
| **appLifecycle** | App registration & lifecycle | `appRegistry`, `defineApp`, `useAppLifecycle` |
| **fileAssociations** | File type handlers | `fileAssociations`, `useFileAssociations` |
| **dragDrop** | Drag & drop system | `DragDropProvider`, `useDrag`, `useDrop` |
| **clipboard** | Clipboard with history | `clipboard`, `useClipboard` |
| **history** | Undo/redo system | `historyManager`, `useHistory`, `createCommand` |
| **keyboard** | Keyboard shortcuts | `keyboardManager`, `useKeyboardShortcut` |
| **windowState** | Window persistence | `windowStateManager`, `useWindowState` |
| **i18n** | Internationalization | `i18n`, `useTranslation`, `useI18n` |
| **fileSystem** | Virtual file system | `VirtualFileSystem` |

#### Hooks (`/packages/core/src/hooks/`)

| Hook | Purpose |
|------|---------|
| `useWindowManager` | Window state management |
| `useDesktopSettings` | User preferences |
| `useMenu` | App menu registration |
| `useAppStorage` | Per-app persistent storage |
| `useSceneStorage` | Per-window storage |
| `useUserDefaults` | Global preferences |

#### Contexts (`/packages/core/src/contexts/`)

- `DockContext` - Dock state and actions
- `TerminalContext` - Terminal state
- `QuickLookContext` - File preview
- `MenuContext` - Dynamic menus

#### Testing (`/packages/core/src/testing/`)

- `renderWithProviders` - Test render with all contexts
- `createMockWindowManager`, `createMockFileSystem`, etc.
- `simulateMenuAction`, `simulateKeyboardShortcut`
- `waitFor`, `waitForElement`, event helpers

### @z-os/ui (331KB gzipped: 92KB)

Comprehensive UI component library with glass morphism design.

#### Window System (`/packages/ui/src/window/`)

- `ZWindow` - Draggable, resizable window component
- Window controls (close, minimize, maximize)
- `WindowChrome` - Complete window frame with toolbar/statusbar

#### Layouts (`/packages/ui/src/layouts/`)

| Layout | Use Case |
|--------|----------|
| `ChatLayout` | Messaging apps |
| `ListDetailLayout` | List + detail view |
| `GalleryLayout` | Photo/media apps |
| `SettingsLayout` | Settings panels |
| `BrowserLayout` | Web browser style |
| `SplitPane` | Resizable split layouts |

#### Components

| Category | Components |
|----------|------------|
| **Forms** | `TextField`, `TextArea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`, `DatePicker`, `ColorPicker`, `FileInput`, `Form` |
| **Data** | `Table`, `DataList`, `Tree`, `Grid`, `Accordion`, `Tabs`, `Badge`, `Tag`, `Avatar`, `Progress`, `Spinner`, `Empty` |
| **Navigation** | `Breadcrumb`, `Pagination`, `Stepper`, `Navbar`, `NavSidebar`, `LinkButton`, `BackButton` |
| **Feedback** | `Dialog`, `AlertDialog`, `ConfirmDialog`, `PromptDialog`, Notifications/Toast |
| **Animation** | `Transition`, `Fade`, `Scale`, `Slide`, `Collapse`, `AnimatePresence` |
| **A11y** | `VisuallyHidden`, `LiveRegion`, `FocusTrap`, `FocusScope`, `SkipLink` |
| **Icons** | `Icon`, `AppIcon`, `FileIcon`, 100+ file type mappings |
| **Media** | `ImageViewer`, `VideoPlayer`, `AudioPlayer`, `MediaControls` |
| **Error** | `ErrorBoundary`, `AppErrorBoundary`, `ErrorFallback`, `AppCrashScreen` |
| **Toolbar** | `WindowToolbar`, `ToolbarButton`, `ToolbarDropdown`, `StatusBar` |
| **Split** | `SplitPane`, `Pane`, `ResizablePane`, `Gutter` |

#### Context Menu (`/packages/ui/src/context-menu/`)

- `ContextMenuProvider`, `ContextMenu`, `ContextMenuTrigger`
- Built-in templates for files, folders, desktop

#### Command Palette (`/packages/ui/src/command-palette/`)

- Spotlight-style search interface
- Fuzzy matching with categories
- Calculator integration

#### Quick Look (`/packages/ui/src/quick-look/`)

- File preview system
- Image, video, audio, code, PDF support

### @z-os/sdk

App development SDK re-exporting core and UI packages.

```typescript
import { defineApp, useWindowManager, ZWindow, Button } from '@z-os/sdk';
```

## Design System

### Glass Morphism

```css
/* Standard glass panel */
bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl

/* Elevated glass */
bg-black/80 backdrop-blur-2xl border border-white/20 shadow-2xl
```

### Color Palette

- Primary: Blue (`bg-blue-500`)
- Destructive: Red (`bg-red-500`)
- Success: Green (`bg-green-500`)
- Warning: Yellow/Orange

### Sizing

- `sm`, `md`, `lg` variants throughout
- Consistent spacing scale

## Creating Apps

### Basic App Definition

```typescript
import { defineApp } from '@z-os/core';
import { ZWindow, Button } from '@z-os/ui';

const MyApp = defineApp({
  manifest: {
    id: 'com.example.myapp',
    name: 'My App',
    version: '1.0.0',
    icon: <MyIcon />,
    capabilities: {
      canOpenFiles: ['.txt', '.md'],
      urlSchemes: ['myapp'],
    },
  },
  component: MyAppComponent,
  hooks: {
    onLaunch: async () => { /* initialize */ },
    onTerminate: async () => { /* cleanup */ },
    onSaveState: () => ({ /* state to persist */ }),
    onRestoreState: (state) => { /* restore */ },
  },
});
```

### Using Menus

```typescript
import { useMenu, createStandardMenus } from '@z-os/core';

function MyAppComponent() {
  useMenu({
    appId: 'com.example.myapp',
    appName: 'My App',
    menus: createStandardMenus({
      appName: 'My App',
      fileHandlers: {
        onNew: () => createNewDocument(),
        onSave: () => saveDocument(),
      },
      editHandlers: {
        onUndo: () => undo(),
        onRedo: () => redo(),
      },
    }),
  });

  return <div>...</div>;
}
```

### Using Keyboard Shortcuts

```typescript
import { useKeyboardShortcut } from '@z-os/core';

function MyComponent() {
  useKeyboardShortcut('Cmd+S', () => save(), {
    description: 'Save document',
  });
}
```

### Using Dialogs

```typescript
import { useDialogs } from '@z-os/ui';

function MyComponent() {
  const { alert, confirm, prompt } = useDialogs();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete?',
      message: 'This cannot be undone.',
      danger: true,
    });
    if (confirmed) {
      deleteItem();
    }
  };
}
```

### Using Undo/Redo

```typescript
import { useHistory, createCommand } from '@z-os/core';

function MyEditor() {
  const { execute, undo, redo, canUndo, canRedo } = useHistory('my-editor');

  const updateText = (newText: string) => {
    const oldText = text;
    execute(createCommand({
      type: 'text-change',
      description: 'Edit text',
      execute: () => setText(newText),
      undo: () => setText(oldText),
    }));
  };
}
```

## Key Patterns

### Provider Hierarchy

```tsx
<I18nProvider>
  <ThemeProvider>
    <AppProvider>
      <WindowStateProvider>
        <DragDropProvider>
          <ClipboardProvider>
            <DialogProvider>
              <App />
            </DialogProvider>
          </ClipboardProvider>
        </DragDropProvider>
      </WindowStateProvider>
    </AppProvider>
  </ThemeProvider>
</I18nProvider>
```

### Service Singletons

Services use singleton pattern with React context wrappers:
- `menuRegistry` (service) + `MenuProvider` (context)
- `appRegistry` (service) + `AppProvider` (context)
- `clipboard` (service) + `ClipboardProvider` (context)

### Storage Keys

- `zos:app:{appId}:{key}` - App-specific storage
- `zos:scene:{sceneId}:{key}` - Window-specific storage
- `zos:user:{key}` - Global user preferences
- `zos:window-states` - Window positions/sizes
- `zos:locale` - User locale preference

## Build Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm dev              # Development server
pnpm test             # Run tests
```

## Package Dependencies

- React 18
- TypeScript 5
- Tailwind CSS
- Lucide Icons
- class-variance-authority (cva)
- clsx + tailwind-merge (via cn utility)

## Z-Index Layers

Consistent z-index values for proper stacking order:

| Layer | Z-Index | Purpose |
|-------|---------|---------|
| Windows | 100-999 | Application windows (managed) |
| Dialogs | 5000 | Modal dialogs |
| Context Menus | 6000 | Right-click menus |
| Notifications | 7000 | Toast notifications |
| Tooltips | 7500 | Hover tooltips |
| Menu Bar | 8000 | System menu bar |
| Menu Dropdowns | 8500 | Menu bar dropdowns |
| Quick Look | 9000 | File preview |
| Command Palette | 9500 | Spotlight search |

Import from `@z-os/ui`:
```typescript
import { Z_INDEX, windowZIndexManager } from '@z-os/ui';
```

## CI/CD

- **Build on push/PR**: `pnpm build` via Turbo
- **NPM publish on tags**: Creates `v*` tag → publishes packages
- **GitHub Pages**: Deploys shell to Pages on main branch
- **App Store**: Daily updates via `update-app-store.yml`

## Type System Architecture

Shared types are consolidated in `@z-os/core/src/types/shared.ts` and re-exported by other packages:

```
@z-os/core (canonical source)
├── types/shared.ts  ← AppManifest, StorageAPI, MenuAPI, DockAPI, etc.
└── exports all shared types

@z-os/sdk (re-exports for app developers)
├── types.ts         ← re-exports from @z-os/core
└── framework/types.ts ← framework-specific extended types

@z-os/apps-loader (imports from core)
└── types.ts         ← LoadedApp, AppRegistry (loader-specific)

@z-os/runtime (imports from core)
└── AppProps, LoadedApp (runtime-specific)

@z-os/apps (extends base types)
└── AppStoreManifest ← extends base with screenshots, ratings, etc.
```

**Key Types:**
- `AppManifest` - App metadata (identifier, name, version, category, permissions)
- `StorageAPI` - Persistent storage interface
- `MenuAPI` - Menu bar management
- `DockAPI` - Dock icon control (badges, progress, bounce)
- `AppWindowProps` - Standard props for app components

## Notes

- All components support `forwardRef` for DOM access
- Accessibility is built-in (ARIA attributes, keyboard navigation)
- Reduced motion preferences are respected
- Cross-tab sync via BroadcastChannel where applicable
- No framer-motion - pure CSS transitions
- macOS Sequoia style menu bar (transparent with gradient fade)
