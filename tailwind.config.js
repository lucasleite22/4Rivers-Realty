/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#174079',
        cyan: {
          brand: '#00aeef',
          light: '#33ccff',
        },
        'site-bg': '#f0f7fc',
        dark: '#07162b',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        barlow: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
