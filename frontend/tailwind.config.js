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
        background: '#0B0F17',
        surface: '#131B2B',
        primary: '#0EA5E9',
        safe: '#10B981',
        alert: '#EF4444',
      }
    },
  },
  plugins: [],
}
