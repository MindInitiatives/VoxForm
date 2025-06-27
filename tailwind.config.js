const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(240, 47%, 52%)',
          light: 'hsl(240, 47%, 70%)',
          dark: 'hsl(240, 47%, 35%)',
        },
        secondary: {
          DEFAULT: 'hsl(210, 100%, 50%)',
          light: 'hsl(210, 100%, 70%)',
          dark: 'hsl(210, 100%, 35%)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  // plugins: [
  //   require('@tailwindcss/forms'),
  //   require('@tailwindcss/typography'),
  // ],
};