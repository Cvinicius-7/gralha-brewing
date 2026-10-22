/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#111315',
        charcoal: '#171A1D',
        prussian: {
          DEFAULT: '#1D435A',
          dark: '#132C3C',
          light: '#275976',
        },
        amber: {
          brand: '#D88128',
          light: '#E39647',
          dark: '#B56718',
        },
        cyan: {
          gralha: '#0095D9',
        },
        hop: {
          DEFAULT: '#5A7D53',
          light: '#749B6C',
        },
        cream: {
          DEFAULT: '#F4F1EA',
          paper: '#EFECE4',
          muted: '#C8C3B8',
        },
        mist: '#8E969F',
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
