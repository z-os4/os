# @z-os/apps-loader

Dynamic app loading system for zOS - load apps from CDN at runtime.

[![npm version](https://img.shields.io/npm/v/@z-os/apps-loader.svg)](https://www.npmjs.com/package/@z-os/apps-loader)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@z-os/apps-loader)](https://bundlephobia.com/package/@z-os/apps-loader)

## Installation

```bash
npm install @z-os/apps-loader
# or
pnpm add @z-os/apps-loader
```

## Features

- **CDN Loading** - Load apps from jsDelivr/unpkg at runtime
- **Registry Caching** - Cache app manifests for fast discovery
- **Sandbox/Error Boundary** - Isolate app errors from the system
- **Version Resolution** - Support for semver ranges

## Usage

### Load an App from CDN

```tsx
import { loadApp, AppLoader } from '@z-os/apps-loader';

// Load app by package name
const calculator = await loadApp('@zos-apps/calculator');

// Render the app
function AppContainer() {
  const [App, setApp] = useState(null);

  useEffect(() => {
    loadApp('@zos-apps/calculator').then(setApp);
  }, []);

  if (!App) return <Loading />;

  return <App onClose={() => {}} />;
}
```

### Using AppLoader Component

```tsx
import { AppLoader } from '@z-os/apps-loader';

function DynamicApp({ packageName, onClose }) {
  return (
    <AppLoader
      package={packageName}
      fallback={<Loading />}
      errorFallback={<ErrorMessage />}
      onClose={onClose}
    />
  );
}

// Usage
<DynamicApp package="@zos-apps/calculator" onClose={handleClose} />
```

### App Registry

```tsx
import { getRegistry, refreshRegistry } from '@z-os/apps-loader';

// Get cached registry
const registry = await getRegistry();

console.log(registry);
// {
//   '@zos-apps/calculator': { version: '1.0.0', ... },
//   '@zos-apps/notes': { version: '1.2.0', ... },
// }

// Force refresh from GitHub
const fresh = await refreshRegistry();
```

### Custom CDN

```tsx
import { configure } from '@z-os/apps-loader';

configure({
  cdn: 'https://cdn.example.com',
  registry: 'https://registry.example.com/apps.json',
  cacheTime: 3600000, // 1 hour
});
```

## API

### loadApp(packageName, options?)

Load an app from CDN.

```typescript
interface LoadOptions {
  version?: string;      // Specific version or range
  timeout?: number;      // Load timeout in ms
  retries?: number;      // Number of retry attempts
}

const App = await loadApp('@zos-apps/calculator', {
  version: '^1.0.0',
  timeout: 5000,
  retries: 2,
});
```

### AppLoader Component

```typescript
interface AppLoaderProps {
  package: string;                    // Package name
  version?: string;                   // Version constraint
  fallback?: ReactNode;               // Loading fallback
  errorFallback?: ReactNode;          // Error fallback
  onLoad?: (app: AppModule) => void;  // Load callback
  onError?: (error: Error) => void;   // Error callback
  onClose: () => void;                // Close handler
  onFocus?: () => void;               // Focus handler
}
```

### Registry Functions

```typescript
// Get cached registry
getRegistry(): Promise<AppRegistry>

// Force refresh registry
refreshRegistry(): Promise<AppRegistry>

// Check if app exists
hasApp(packageName: string): Promise<boolean>

// Get app info
getAppInfo(packageName: string): Promise<AppInfo | null>
```

## Publishing Apps

Apps are loaded from the `zos-apps` GitHub organization via jsDelivr.

### App Package Structure

```
@zos-apps/my-app/
├── package.json
├── dist/
│   └── index.js      # ESM bundle
└── src/
    └── index.tsx     # Source
```

### package.json

```json
{
  "name": "@zos-apps/my-app",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "zos": {
    "identifier": "com.example.myapp",
    "name": "My App",
    "category": "utilities",
    "permissions": ["storage.local"]
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "@z-os/sdk": "^1.0.0"
  }
}
```

### Build & Publish

```bash
# Build
npm run build

# Publish to npm (automatically available on jsDelivr)
npm publish --access public
```

## Error Handling

```tsx
import { AppLoader, AppLoadError } from '@z-os/apps-loader';

function App() {
  const handleError = (error: Error) => {
    if (error instanceof AppLoadError) {
      console.error(`Failed to load ${error.packageName}: ${error.message}`);
    }
  };

  return (
    <AppLoader
      package="@zos-apps/calculator"
      onError={handleError}
      errorFallback={
        <div className="error">
          <p>Failed to load app</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      }
      onClose={() => {}}
    />
  );
}
```

## Caching

The loader caches:
- **Registry**: App list and versions (1 hour default)
- **Modules**: Loaded app bundles (session)

```tsx
import { clearCache } from '@z-os/apps-loader';

// Clear all caches
clearCache();

// Clear specific app
clearCache('@zos-apps/calculator');
```

## Bundle Size

~2 KB (gzipped)

## License

MIT

## Links

- [GitHub](https://github.com/z-os4/os)
- [Documentation](https://z-os4.github.io/os/)
- [npm](https://www.npmjs.com/package/@z-os/apps-loader)
