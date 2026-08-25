/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './src/**/*.css'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: 'rgb(var(--cream) / <alpha-value>)',
        sand: 'rgb(var(--sand) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        wood: 'rgb(var(--wood) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        softgreen: 'rgb(var(--softgreen) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
