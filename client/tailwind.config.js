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
          dark: '#A91F24',
          light: '#FCEBEC',
          hover: '#9A0007',
        },
        surface: '#FFFFFF',
        page: '#F7F8FA',
        mainText: '#1F2937',
        subText: '#64748B',
        appBorder: '#E5E7EB',
        tealAccent: '#00695C',
        appSuccess: '#16865B',
        appWarning: '#D97706',
        appDanger: '#DC2626',
        appInfo: '#2563EB',
      },
      fontFamily: {
        sans: ['Hind Siliguri', 'Noto Sans Bengali', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        glow: '0 0 15px rgba(198, 40, 40, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

