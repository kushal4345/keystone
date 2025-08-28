/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        keystone: {
          primary: '#1a1a1a',      // Dark grey background
          secondary: '#2a2a2a',    // Lighter grey for cards
          accent: '#D4AF37',       // Golden accent
          'accent-light': '#F4E4B8', // Light golden
          'accent-dark': '#B8941F',  // Dark golden
          text: '#F5F5F5',         // Off-white text
          'text-muted': '#B0B0B0',  // Muted text
          border: '#404040',       // Border color
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
