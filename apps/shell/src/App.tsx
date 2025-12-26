import React, { useState, useCallback } from 'react';
import { DockProvider } from '@z-os/core';
import Desktop from './components/Desktop';

// System states
type SystemState = 'booting' | 'running' | 'locked' | 'sleeping' | 'shutdown';

function App() {
  const [systemState, setSystemState] = useState<SystemState>('running');

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
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍎</div>
          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
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
