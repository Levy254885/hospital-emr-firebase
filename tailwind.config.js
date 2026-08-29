/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f4f9',
          100: '#c0e5f0',
          200: '#93d4e5',
          300: '#66c3db',
          400: '#3db5d3',
          500: '#1fa8cb',
          600: '#1a96b8',
          700: '#1380a0',
          800: '#0d6b89',
          900: '#004961',
        },
        secondary: {
          50: '#e8f5f0',
          100: '#c5e8df',
          200: '#9fdacb',
          300: '#79ccb7',
          400: '#5bc2a8',
          500: '#3db89a',
          600: '#35a68a',
          700: '#2b9076',
          800: '#227b63',
          900: '#0d5742',
        },
        accent: {
          50: '#fef3e2',
          100: '#fde0b5',
          200: '#fccc83',
          300: '#fbb751',
          400: '#faa72b',
          500: '#f99705',
          600: '#f98d04',
          700: '#f87f03',
          800: '#f77202',
          900: '#f55900',
        },
        medical: {
          blue: '#0d6b89',
          teal: '#1fa8cb',
          green: '#3db89a',
          warm: '#f99705',
          red: '#dc3545',
          bg: '#f0f7fa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'medical': '0 4px 6px -1px rgba(13, 107, 137, 0.1), 0 2px 4px -1px rgba(13, 107, 137, 0.06)',
        'medical-lg': '0 10px 15px -3px rgba(13, 107, 137, 0.1), 0 4px 6px -2px rgba(13, 107, 137, 0.05)',
        'medical-xl': '0 20px 25px -5px rgba(13, 107, 137, 0.1), 0 10px 10px -5px rgba(13, 107, 137, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
