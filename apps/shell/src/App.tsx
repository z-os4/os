import React, { useState, useCallback } from 'react';
import { DockProvider } from '@z-os/core';
import Desktop from './components/Desktop';
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
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <p className="text-white/50 text-sm">System shut down</p>
      </div>
    );
  }

  if (systemState === 'booting') {
    return <BootSequence onComplete={() => setSystemState('running')} />;
  }

  return (
    <DockProvider>
      <div className="h-screen w-screen overflow-hidden bg-black">
        <Desktop
          isLocked={systemState === 'locked'}
          onUnlock={handleUnlock}
          onShutdown={handleShutdown}
          onRestart={handleRestart}
          onLock={handleLock}
        />
      </div>
    </DockProvider>
  );
}

export default App;
