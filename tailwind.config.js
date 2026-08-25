/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './src/**/*.css'],
  theme: {
    extend: {
      colors: {
        cream: '#fbf6ec',
        sand: '#f1e8d8',
        gold: '#e2b155',
        wood: '#b07d3b',
        ink: '#3e2f1c',
        softgreen: '#8fd45e',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
