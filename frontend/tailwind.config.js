/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { brandblue: '#3B5BFF', brandpurple: '#8B5CF6' },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3B5BFF 0%, #8B5CF6 100%)',
      },
      animation: {
        'fade-up':        'fadeUp .5s ease forwards',
        'toast-in':       'toastIn .3s ease forwards',
        'spin-slow':      'spin 6s linear infinite',
        'slide-in-left':  'slideInLeft .6s ease forwards',
        'slide-in-right': 'slideInRight .6s ease forwards',
        'zoom-in':        'zoomIn .5s ease forwards',
        'float':          'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:       { '0%': { opacity: 0, transform: 'translateY(28px)' },  '100%': { opacity: 1, transform: 'translateY(0)' } },
        toastIn:      { '0%': { opacity: 0, transform: 'translateX(40px)' },  '100%': { opacity: 1, transform: 'translateX(0)' } },
        slideInLeft:  { '0%': { opacity: 0, transform: 'translateX(-40px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        slideInRight: { '0%': { opacity: 0, transform: 'translateX(40px)' },  '100%': { opacity: 1, transform: 'translateX(0)' } },
        zoomIn:       { '0%': { opacity: 0, transform: 'scale(0.88)' },       '100%': { opacity: 1, transform: 'scale(1)' } },
        float:        { '0%,100%': { transform: 'translateY(0)' },            '50%':  { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
}
