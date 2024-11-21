/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#f3e8ff',
          dark: '#0f0616'
        }
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-border': 'pulse-border 2s infinite',
        gradient: 'gradient 15s ease infinite',
        blob: 'blob 7s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-border': {
          '0%': { boxShadow: '0 0 0 0 rgba(147, 51, 234, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(147, 51, 234, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(147, 51, 234, 0)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};