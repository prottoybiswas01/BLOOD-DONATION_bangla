/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C62828',
          dark: '#B71C1C',
          light: '#FFEBEE',
          hover: '#9A0007',
        },
        surface: '#FFFFFF',
        page: '#F8F9FA',
        mainText: '#212121',
        subText: '#616161',
        tealAccent: '#00695C',
        appSuccess: '#2E7D32',
        appWarning: '#ED6C02',
        appBorder: '#E0E0E0',
      },
      fontFamily: {
        sans: ['Hind Siliguri', 'Noto Sans Bengali', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px rgba(0, 0, 0, 0.05)',
        card: '0 4px 20px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}

