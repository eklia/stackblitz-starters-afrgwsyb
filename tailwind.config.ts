import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        brand: {
          primary: '#059669', // hijau utama
          primarySoft: '#ECFDF5', // hijau muda background
          accent: '#047857', // hijau lebih gelap (button, dsb.)
          dark: '#064E3B', // hijau gelap (hover)
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(16,185,129,0.18)', // shadow lembut ala startup
      },
    },
  },
  plugins: [],
};
export default config;
