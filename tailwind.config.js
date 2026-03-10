/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'nunito-sans': ['"Nunito Sans"', 'sans-serif'],
      },
      colors: {
        amadeus: {
          navy: '#0f172a',
          blue: '#1e3a5f',
          'blue-light': '#3b82f6',
        },
      },
    },
  },
  plugins: [],
};
