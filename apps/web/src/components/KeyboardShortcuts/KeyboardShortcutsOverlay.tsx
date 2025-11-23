/**
 * Keyboard Shortcuts Overlay
 * Sprint 5.4 - Keyboard shortcuts
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Cross2Icon } from '@radix-ui/react-icons';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // File Operations
  { keys: ['Cmd', 'S'], description: 'Save current file', category: 'File' },
  { keys: ['Cmd', 'N'], description: 'New file', category: 'File' },
  { keys: ['Cmd', 'O'], description: 'Open file', category: 'File' },
  { keys: ['Cmd', 'W'], description: 'Close tab', category: 'File' },

  // Editor
  { keys: ['Cmd', 'F'], description: 'Find in file', category: 'Editor' },
  { keys: ['Cmd', 'H'], description: 'Find and replace', category: 'Editor' },
  { keys: ['Cmd', 'D'], description: 'Duplicate line', category: 'Editor' },
  { keys: ['Cmd', '/'], description: 'Toggle comment', category: 'Editor' },

  // Navigation
  { keys: ['Cmd', 'P'], description: 'Quick file open', category: 'Navigation' },
  { keys: ['Cmd', 'K'], description: 'Command palette', category: 'Navigation' },
  { keys: ['Cmd', 'B'], description: 'Toggle sidebar', category: 'Navigation' },
  { keys: ['Cmd', '1-9'], description: 'Switch to tab', category: 'Navigation' },

  // View
  { keys: ['Cmd', '+'], description: 'Zoom in', category: 'View' },
  { keys: ['Cmd', '-'], description: 'Zoom out', category: 'View' },
  { keys: ['Cmd', '0'], description: 'Reset zoom', category: 'View' },

  // Other
  { keys: ['Cmd', 'Shift', 'P'], description: 'Preview mode', category: 'Other' },
  { keys: ['Cmd', 'Shift', 'L'], description: 'Show logs', category: 'Other' },
  { keys: ['?'], description: 'Show this help', category: 'Other' },
];

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsOverlay({ isOpen, onClose }: KeyboardShortcutsOverlayProps) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  const formatKey = (key: string) => {
    if (key === 'Cmd') return isMac ? '⌘' : 'Ctrl';
    if (key === 'Shift') return '⇧';
    if (key === 'Alt') return isMac ? '⌥' : 'Alt';
    return key;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
          data-testid="keyboard-shortcuts-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
                data-testid="close-shortcuts"
              >
                <Cross2Icon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 88px)' }}>
              {categories.map((category) => (
                <div key={category} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
                  <div className="space-y-3">
                    {shortcuts
                      .filter((s) => s.category === category)
                      .map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                        >
                          <span className="text-gray-700">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key, i) => (
                              <span key={i}>
                                <kbd className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-md font-mono">
                                  {formatKey(key)}
                                </kbd>
                                {i < shortcut.keys.length - 1 && (
                                  <span className="mx-1 text-gray-400">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
