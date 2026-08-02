/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF3131',
          hover: '#E82C2C',
          light: '#FFF0F0',
          gradient: 'linear-gradient(135deg, #FF3131, #FF6B6B)',
        },
        surface: {
          bg: '#F7F8FC',
          card: '#FFFFFF',
          border: 'rgba(0, 0, 0, 0.06)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '24px',
        'xl': '20px',
      }
    },
  },
  plugins: [],
}
