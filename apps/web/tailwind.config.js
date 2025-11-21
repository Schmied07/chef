/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
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
    },
  },
  plugins: [],
}
