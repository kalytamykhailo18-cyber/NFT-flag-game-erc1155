/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#a078fdff',
        'primary-dark': '#9152ffff',
        dark: '#0f0f0f',
        'dark-lighter': '#1a1a1a',
        'dark-darker': '#0a0a0a',
      },
    },
  },
  plugins: [],
};
