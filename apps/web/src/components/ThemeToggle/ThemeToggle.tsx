/**
 * Theme Toggle Component
 * Sprint 5.4 - Dark/Light mode toggle
 */

import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300"
      data-testid="theme-toggle"
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <MoonIcon className="w-4 h-4 text-gray-700" />
        ) : (
          <SunIcon className="w-4 h-4 text-yellow-500" />
        )}
      </motion.div>
    </button>
  );
}
