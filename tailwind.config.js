/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#FF6B35',
          50: '#FFF3E6',
          100: '#FFE0B3',
          200: '#FFCC80',
          300: '#FFB34D',
          400: '#FF991A',
          500: '#FF6B35',
          600: '#E65A2B',
          700: '#CC4A21',
          800: '#B33917',
          900: '#99280D',
        },
        secondary: {
          DEFAULT: '#2C3E50',
          50: '#E8EDF2',
          100: '#C5D2E0',
          200: '#A0B7CC',
          300: '#7B9CB8',
          400: '#5681A4',
          500: '#2C3E50',
          600: '#273748',
          700: '#223140',
          800: '#1D2B38',
          900: '#121519',
        },
        accent: {
          DEFAULT: '#F39C12',
          50: '#FEF5E6',
          100: '#FCE7B3',
          200: '#FAD980',
          300: '#F8CB4D',
          400: '#F6BD1A',
          500: '#F39C12',
          600: '#E8910F',
          700: '#DD860C',
          800: '#D27B09',
          900: '#C76906',
        },
        // Semantic colors
        success: '#27AE60',
        warning: '#F39C12',
        error: '#E74C3C',
        info: '#3498DB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      zIndex: {
        '60': 60,
        '70': 70,
        '80': 80,
        '90': 90,
        '100': 100,
      },
    },
  },
  plugins: [],
  // Disable preflight to avoid conflicts with Angular Material
  corePlugins: {
    preflight: false,
  },
};
