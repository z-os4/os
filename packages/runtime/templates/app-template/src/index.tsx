/**
 * zOS App Template
 *
 * This is a template for creating zOS apps that:
 * - Load dynamically from CDN
 * - Use shared OS libraries (react, @z-os/*)
 * - Support hot reload
 */

import React from 'react';
import { ZWindow } from '@z-os/ui';
import type { AppManifest } from '@z-os/sdk';

// App manifest - exported for runtime to read
export const manifest: AppManifest = {
  identifier: 'ai.hanzo.myapp',
  name: 'My App',
  version: '1.0.0',
  category: 'productivity',
};

// App props interface
interface AppProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Main app component
const MyApp: React.FC<AppProps> = ({ onClose, onFocus }) => {
  return (
    <ZWindow
      title={manifest.name}
      onClose={onClose}
      onFocus={onFocus}
      initialSize={{ width: 400, height: 300 }}
    >
      <div className="flex flex-col h-full bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold mb-4">{manifest.name}</h1>
        <p className="text-gray-400">
          This app is loaded dynamically and uses shared OS libraries.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Version: {manifest.version}
        </p>
      </div>
    </ZWindow>
  );
};

// Default export for dynamic loading
export default MyApp;
