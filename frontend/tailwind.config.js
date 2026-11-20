/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#171a18',
          900: '#1c201d',
          850: '#222722',
          800: '#282e28',
          700: '#353d35',
        },
        sage: {
          200: '#c7d4c4',
          300: '#aabca6',
          400: '#8ea688',
          500: '#738d6d',
          600: '#5b7256',
        },
        parchment: {
          100: '#f4f1e8',
          200: '#e7e2d6',
          300: '#c9c5ba',
          400: '#9c9b93',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Iowan Old Style', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
