import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'seat-available': 'var(--seat-available)',
        'seat-reserved': 'var(--seat-reserved)',
        'seat-sold': 'var(--seat-sold)',
        'seat-held': 'var(--seat-held)',
        'seat-selected': 'var(--seat-selected)',
        'seat-focused': 'var(--seat-focused)',
        'price-tier-1': 'var(--price-tier-1)',
        'price-tier-2': 'var(--price-tier-2)',
        'price-tier-3': 'var(--price-tier-3)',
      },
    },
  },
  plugins: [],
};

export default config;
