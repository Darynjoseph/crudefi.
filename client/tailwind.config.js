/* eslint-env node */
/* global module */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a4d3a', // Dark forest green
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bbe5cb',
          300: '#8cd1a7',
          400: '#57b37c',
          500: '#34965b',
          600: '#277a47',
          700: '#20603a',
          800: '#1c4f31',
          900: '#1a4d3a',
          950: '#0d2419'
        },
        accent: {
          DEFAULT: '#f59e0b', // Golden yellow
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03'
        },
        background: {
          DEFAULT: '#faf7f0', // Warm cream
          light: '#ffffff',
          card: '#ffffff'
        },
        surface: {
          DEFAULT: '#ffffff',
          light: '#f9f9f9',
          dark: '#f5f5f5'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1a4d3a, #277a47)',
        'gradient-accent': 'linear-gradient(135deg, #f59e0b, #fbbf24)',
        'gradient-warm': 'linear-gradient(135deg, #faf7f0, #ffffff)'
      }
    },
  },
  plugins: [],
}
