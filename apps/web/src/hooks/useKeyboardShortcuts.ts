/**
 * Keyboard Shortcuts Hook
 * Sprint 5.4
 */

import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === e.ctrlKey;
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === e.shiftKey;
        const altMatch = shortcut.alt === undefined || shortcut.alt === e.altKey;
        const metaMatch = shortcut.meta === undefined || shortcut.meta === e.metaKey;
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.callback(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Utility to check if Mac
export const isMac = () => {
  if (typeof window === 'undefined') return false;
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

// Utility to format shortcut display
export const formatShortcut = (shortcut: ShortcutConfig): string => {
  const parts: string[] = [];
  const mac = isMac();

  if (shortcut.ctrl) parts.push(mac ? '⌘' : 'Ctrl');
  if (shortcut.shift) parts.push('⇧');
  if (shortcut.alt) parts.push(mac ? '⌥' : 'Alt');
  if (shortcut.meta && !mac) parts.push('Win');
  
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
};
