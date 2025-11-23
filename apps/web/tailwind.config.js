/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Sprint 5.4 - Dark mode support
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bolt-elements-background-depth-1': 'var(--bolt-elements-bg-depth-1)',
        'bolt-elements-background-depth-2': 'var(--bolt-elements-bg-depth-2)',
        'bolt-elements-background-depth-3': 'var(--bolt-elements-bg-depth-3)',
        'bolt-elements-textPrimary': 'var(--bolt-elements-textPrimary)',
        'bolt-elements-textSecondary': 'var(--bolt-elements-textSecondary)',
        'bolt-elements-borderColor': 'var(--bolt-elements-borderColor)',
        'bolt-elements-item-contentDefault': 'var(--bolt-elements-item-contentDefault)',
        'bolt-elements-item-contentActive': 'var(--bolt-elements-item-contentActive)',
        'bolt-elements-item-contentAccent': 'var(--bolt-elements-item-contentAccent)',
        'bolt-elements-item-backgroundDefault': 'var(--bolt-elements-item-backgroundDefault)',
        'bolt-elements-item-backgroundActive': 'var(--bolt-elements-item-backgroundActive)',
        'bolt-elements-item-backgroundAccent': 'var(--bolt-elements-item-backgroundAccent)',
      },
      // Sprint 5.4 - Smooth animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
