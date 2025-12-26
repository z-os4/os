# @z-os/ui

UI components for zOS - macOS-style windows, controls, and more.

[![npm version](https://img.shields.io/npm/v/@z-os/ui.svg)](https://www.npmjs.com/package/@z-os/ui)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@z-os/ui)](https://bundlephobia.com/package/@z-os/ui)

## Installation

```bash
npm install @z-os/ui
# or
pnpm add @z-os/ui
```

## Features

- **ZWindow** - Draggable, resizable macOS-style windows
- **Window Controls** - Traffic light buttons (close, minimize, maximize)
- **Quick Look** - File preview overlays
- **Utilities** - Class name helpers and theming

## Usage

### ZWindow

```tsx
import { ZWindow } from '@z-os/ui';

function MyApp({ onClose, onFocus }) {
  return (
    <ZWindow
      title="My Application"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={600}
      defaultHeight={400}
      defaultPosition={{ x: 100, y: 100 }}
      minWidth={300}
      minHeight={200}
      resizable={true}
    >
      <div className="p-4">
        <h1>Hello World!</h1>
        <p>This is my application content.</p>
      </div>
    </ZWindow>
  );
}
```

### Window Title Bar

```tsx
import { WindowTitleBar } from '@z-os/ui';

function CustomWindow() {
  return (
    <div className="window">
      <WindowTitleBar
        title="Custom Window"
        onClose={() => console.log('close')}
        onMinimize={() => console.log('minimize')}
        onMaximize={() => console.log('maximize')}
        showControls={true}
      />
      <div className="content">...</div>
    </div>
  );
}
```

### Window Controls

```tsx
import { WindowControls } from '@z-os/ui';

function TitleBar({ onClose, onMinimize, onMaximize }) {
  return (
    <div className="title-bar">
      <WindowControls
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
      />
      <span className="title">Window Title</span>
    </div>
  );
}
```

### Quick Look

```tsx
import { QuickLookOverlay } from '@z-os/ui/quick-look';

function FilePreview({ file, onClose }) {
  return (
    <QuickLookOverlay
      file={file}
      onClose={onClose}
    />
  );
}
```

### Utility Functions

```tsx
import { cn } from '@z-os/ui';

function Button({ className, variant, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className
      )}
      {...props}
    />
  );
}
```

## Components

### ZWindow Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Window title |
| `onClose` | `() => void` | - | Close handler |
| `onFocus` | `() => void` | - | Focus handler |
| `onMinimize` | `() => void` | - | Minimize handler |
| `onMaximize` | `() => void` | - | Maximize handler |
| `defaultWidth` | `number` | `400` | Initial width |
| `defaultHeight` | `number` | `300` | Initial height |
| `defaultPosition` | `{ x, y }` | centered | Initial position |
| `minWidth` | `number` | `200` | Minimum width |
| `minHeight` | `number` | `150` | Minimum height |
| `resizable` | `boolean` | `true` | Allow resizing |
| `children` | `ReactNode` | - | Window content |

### WindowControls Props

| Prop | Type | Description |
|------|------|-------------|
| `onClose` | `() => void` | Close button handler |
| `onMinimize` | `() => void` | Minimize button handler |
| `onMaximize` | `() => void` | Maximize button handler |
| `disabled` | `boolean` | Disable all controls |

## Styling

Components use Tailwind CSS classes. Ensure you have Tailwind configured:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@z-os/ui/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
};
```

## Bundle Size

~23 KB (gzipped)

## License

MIT

## Links

- [GitHub](https://github.com/z-os4/os)
- [Documentation](https://z-os4.github.io/os/)
- [npm](https://www.npmjs.com/package/@z-os/ui)
