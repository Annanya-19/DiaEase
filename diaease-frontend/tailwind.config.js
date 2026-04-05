/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          gold: '#d4af37',
          goldLight: '#e6c86a',
          navy: '#060B14',
          navyLight: '#0d1627',
          neon: '#00ffa3', // Neon green for health
          offwhite: '#fcfbf8',
          muted: '#8c7d60'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'glass-hover': '0 8px 32px 0 rgba(212, 175, 55, 0.2)',
      }
    },
  },
  plugins: [],
}
