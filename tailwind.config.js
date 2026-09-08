/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      // ✅ Better structured colors
      colors: {
        primary: {
          purple: '#8b5cf6',
          pink: '#ec4899',
        },
        danger: '#ef4444',
        background: '#020617',
        card: 'rgba(0, 0, 0, 0.4)', // glass cards
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },

      // ✅ Stronger shadows for visibility
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.8)',
        'glass-hover': '0 8px 32px rgba(139,92,246,0.4)',
        glow: '0 0 25px rgba(236,72,153,0.5)', // unified glow
      },

      // ✅ Add gradient background (VERY USEFUL)
      backgroundImage: {
        'primary-gradient': 'linear-gradient(90deg, #8b5cf6, #ec4899)',
      },

      // ✅ Animations (keep but clean)
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }, // smoother
        }
      },

      backdropBlur: {
        xs: '2px',
        sm: '6px',
        md: '12px',
      }
    },
  },
  plugins: [],
}
