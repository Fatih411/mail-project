/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Enable dark mode via class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4f46e5', // Indigo-600
          DEFAULT: '#4338ca', // Indigo-700
          dark: '#3730a3', // Indigo-800
        },
        secondary: {
          light: '#10b981', // Emerald-500
          DEFAULT: '#059669', // Emerald-600
          dark: '#047857', // Emerald-700
        }
      }
    },
  },
  plugins: [],
}
