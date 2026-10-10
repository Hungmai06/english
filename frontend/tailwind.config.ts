import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/design-system/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#F8F4EC',
          ink: '#102A43',
          navy: '#102A43',
          accent: '#FF6B2E',
          orange: '#FF6B2E',
          muted: '#718096',
          border: '#E7DED2',
          blue: '#EEF4F7',
          softOrange: '#FFF0E7',
        },
        cream: {
          50: '#FDFCF9',
          100: '#F8F4EC',
          200: '#F4EEE5',
          300: '#E7DED2',
        },
        brand: {
          50: '#EEF4F7',
          500: '#102A43',
          600: '#0c2236',
          700: '#081726',
        },
        action: {
          50: '#FFF0E7',
          500: '#FF6B2E',
          600: '#ea580c',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Newsreader', 'Georgia', 'serif'],
        handwriting: ['var(--font-handwriting)', 'Caveat', 'cursive'],
      },
      boxShadow: {
        subtle: '0 2px 8px rgba(16, 42, 67, 0.04)',
        card: '0 4px 16px rgba(16, 42, 67, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
