/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moxie: {
          cream: '#FFFBE3',
          dark: '#121212',
          blue: '#334FB4',
          'blue-hover': '#263D93',
          lavender: '#EFE3FF',
          'lavender-dark': '#BFAED4',
          'tag-green': '#53FF73',
          'tag-yellow': '#F1FF54',
          'tag-pink': '#FFD1DC',
          gray: '#F3F3F3',
          border: '#E5E0D8',
        },
        brand: {
          50: '#fffbe3',
          100: '#efe3ff',
          200: '#bfaed4',
          300: '#758ee6',
          400: '#4767ca',
          500: '#334FB4', // Moxie royal blue
          600: '#263D93',
          700: '#1b2c70',
          800: '#121212',
          900: '#000000',
          950: '#000000',
        },
        navy: {
          800: '#1e293b',
          900: '#121212',
          950: '#000000',
        }
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(18, 18, 18, 0.04), 0 2px 6px -1px rgba(18, 18, 18, 0.02)',
        'card-hover': '0 12px 30px -4px rgba(18, 18, 18, 0.08), 0 4px 12px -2px rgba(18, 18, 18, 0.04)',
        'moxie': '0 8px 24px -6px rgba(51, 79, 180, 0.12)',
        'glow': '0 0 25px -5px rgba(51, 79, 180, 0.25)',
      }
    },
  },
  plugins: [],
}
