import React, { useState, useCallback } from 'react';
import { DockProvider } from '@z-os/core';
import { ThemeProvider } from '@z-os/ui';
import ResponsiveShell from './components/ResponsiveShell';
import BootSequence from './components/BootSequence';

// System states
type SystemState = 'booting' | 'running' | 'locked' | 'sleeping' | 'shutdown';

function App() {
  const [systemState, setSystemState] = useState<SystemState>('booting');

  const handleShutdown = useCallback(() => setSystemState('shutdown'), []);
  const handleRestart = useCallback(() => {
    setSystemState('booting');
    setTimeout(() => setSystemState('running'), 2000);
  }, []);
  const handleLock = useCallback(() => setSystemState('locked'), []);
  const handleUnlock = useCallback(() => setSystemState('running'), []);

  if (systemState === 'shutdown') {
    return (
      <ThemeProvider>
        <div className="h-screen w-screen zos-bg-primary flex items-center justify-center">
          <p className="zos-text-muted text-sm">System shut down</p>
        </div>
      </ThemeProvider>
    );
  }

  if (systemState === 'booting') {
    return (
      <ThemeProvider>
        <BootSequence onComplete={() => setSystemState('running')} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <DockProvider>
        <div className="h-screen w-screen overflow-hidden zos-bg-primary">
          <ResponsiveShell
            isLocked={systemState === 'locked'}
            onUnlock={handleUnlock}
            onShutdown={handleShutdown}
            onRestart={handleRestart}
            onLock={handleLock}
          />
        </div>
      </DockProvider>
    </ThemeProvider>
  );
}

export default App;
