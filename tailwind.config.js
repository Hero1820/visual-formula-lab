/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#111118',
          card: '#16161F',
          elevated: '#1E1E2A',
        },
        accent: {
          blue: '#4F8EF7',
          violet: '#7C5CFC',
          teal: '#00D4AA',
          amber: '#F5A623',
          rose: '#FF6B8A',
        },
        text: {
          primary: '#EEEEF2',
          secondary: '#9090A8',
          muted: '#5A5A72',
        },
        border: {
          subtle: '#1E1E2E',
          default: '#2A2A3C',
          strong: '#3A3A52',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      }
    },
  },
  plugins: [],
}
