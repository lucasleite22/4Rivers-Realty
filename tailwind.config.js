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
        'dark-navy': '#181B3A',
        navy: '#252859',
        'brand-blue': '#86ACDB',
        'light-blue': '#B5CEEA',
        'off-white': '#F8F9FC',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        barlow: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
