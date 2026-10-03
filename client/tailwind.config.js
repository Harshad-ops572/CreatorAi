/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080A10',
          card: '#0E131F',
          surface: '#151D2F',
          border: '#1E293B',
          muted: '#64748B',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          400: '#818CF8',
          500: '#6366F1', // Primary signature accent
          600: '#4F46E5',
          700: '#4338CA',
          cyan: '#06B6D4',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(99, 102, 241, 0.2)',
        'glow-md': '0 0 25px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
