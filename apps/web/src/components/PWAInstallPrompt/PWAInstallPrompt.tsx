/**
 * PWA Install Prompt Component
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadIcon, Cross2Icon } from '@radix-ui/react-icons';
import { showInstallPrompt } from '../../utils/pwa';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleInstallAvailable = () => {
      setShowPrompt(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    return () => window.removeEventListener('pwa-install-available', handleInstallAvailable);
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already dismissed
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm z-50"
          data-testid="pwa-install-prompt"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss"
          >
            <Cross2Icon className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DownloadIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Install Chef
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Install Chef as an app for a better experience with offline support.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-sm"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
