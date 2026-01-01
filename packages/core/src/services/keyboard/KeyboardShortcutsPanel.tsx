/**
 * Keyboard Shortcuts Panel
 *
 * UI component for viewing all registered keyboard shortcuts.
 * Can be opened with Cmd+/ (or Ctrl+/ on non-Mac).
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useKeyboardContext } from './KeyboardContext';
import { ShortcutGroup } from './types';

/**
 * Props for KeyboardShortcutsPanel
 */
export interface KeyboardShortcutsPanelProps {
  /** Whether the panel is open */
  open?: boolean;

  /** Callback when panel should close */
  onClose?: () => void;

  /** Optional CSS class name */
  className?: string;

  /** Optional inline styles */
  style?: React.CSSProperties;
}

/**
 * Keyboard shortcuts panel component
 *
 * Displays all registered keyboard shortcuts organized by group.
 * Includes search functionality and conflict warnings.
 */
export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  open: openProp,
  onClose,
  className,
  style,
}) => {
  const { groups, conflicts, formatKeys, isPanelOpen, closePanel } = useKeyboardContext();
  const [searchQuery, setSearchQuery] = useState('');

  // Use prop if provided, otherwise use context state
  const isOpen = openProp ?? isPanelOpen;
  const handleClose = onClose ?? closePanel;

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Filter groups based on search
  const filteredGroups = useMemo((): ShortcutGroup[] => {
    if (!searchQuery.trim()) {
      return groups;
    }

    const query = searchQuery.toLowerCase();

    return groups
      .map((group) => ({
        ...group,
        shortcuts: group.shortcuts.filter(
          (s) =>
            s.description.toLowerCase().includes(query) ||
            s.keys.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.shortcuts.length > 0);
  }, [groups, searchQuery]);

  // Check if a shortcut has conflicts
  const hasConflict = useCallback(
    (keys: string) => {
      return conflicts.some((c) => c.keys === keys);
    },
    [conflicts]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        ...style,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: '#fff',
              }}
            >
              Keyboard Shortcuts
            </h2>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '24px',
                lineHeight: 1,
                padding: '4px',
              }}
              aria-label="Close"
            >
              x
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Conflicts warning */}
        {conflicts.length > 0 && (
          <div
            style={{
              padding: '8px 20px',
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              borderBottom: '1px solid rgba(255, 193, 7, 0.2)',
              color: '#ffc107',
              fontSize: '13px',
            }}
          >
            {conflicts.length} shortcut conflict{conflicts.length > 1 ? 's' : ''} detected
          </div>
        )}

        {/* Shortcut list */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '8px 0',
          }}
        >
          {filteredGroups.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {searchQuery ? 'No shortcuts match your search' : 'No shortcuts registered'}
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.id} style={{ marginBottom: '16px' }}>
                {/* Group header */}
                <div
                  style={{
                    padding: '8px 20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {group.label}
                </div>

                {/* Shortcuts */}
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 20px',
                      opacity: shortcut.enabled === false ? 0.5 : 1,
                    }}
                  >
                    <span
                      style={{
                        color: '#fff',
                        fontSize: '14px',
                      }}
                    >
                      {shortcut.description || shortcut.id}
                    </span>
                    <kbd
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        backgroundColor: hasConflict(shortcut.keys)
                          ? 'rgba(255, 193, 7, 0.2)'
                          : 'rgba(255, 255, 255, 0.1)',
                        border: `1px solid ${
                          hasConflict(shortcut.keys)
                            ? 'rgba(255, 193, 7, 0.3)'
                            : 'rgba(255, 255, 255, 0.1)'
                        }`,
                        borderRadius: '6px',
                        color: hasConflict(shortcut.keys) ? '#ffc107' : 'rgba(255, 255, 255, 0.8)',
                        fontSize: '12px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      {formatKeys(shortcut.keys)}
                    </kbd>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            textAlign: 'center',
          }}
        >
          Press <kbd style={{ padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsPanel;
