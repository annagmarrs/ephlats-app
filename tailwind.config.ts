import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'purple-primary': '#6B2D8B',
        'purple-dark': '#4A1F62',
        'purple-light': '#F3E8FB',
        'gold-primary': '#FFCD00',
        'gold-dark': '#D4AA00',
        'gold-light': '#FFF9D6',
        'neutral-900': '#111827',
        'neutral-600': '#4B5563',
        'neutral-300': '#D1D5DB',
        'neutral-100': '#F3F4F6',
        'error': '#EF4444',
        'success': '#22C55E',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      lineHeight: {
        'body': '1.6',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
};

export default config;
