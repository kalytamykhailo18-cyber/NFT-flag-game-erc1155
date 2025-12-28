/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        'primary-dark': '#7C3AED',
        dark: '#0f0f0f',
        'dark-lighter': '#1a1a1a',
        'dark-darker': '#0a0a0a',
      },
    },
  },
  plugins: [],
};
