/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#ffcc00',
        'card-bg': '#002b3d',
        'darkest-bg': 'rgb(0,19,30)',
        'accent-pink': 'rgb(247,50,99)',
      },
    },
  },
  plugins: [],
}
