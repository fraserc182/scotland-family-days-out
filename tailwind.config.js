/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'scotland-blue': '#0369a1',
        'scotland-cyan': '#06b6d4',
        'scotland-emerald': '#059669',
      },
      backgroundImage: {
        'gradient-scotland': 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #06b6d4 100%)',
      },
    },
  },
  plugins: [],
}

