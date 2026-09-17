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
        brand: {
          bg: '#FFFFFF',
          secondary: '#EAF5EE',
          primary: '#6B9B7C',
          accent: '#A8D5BA',
          text: '#2E3D34',
          dark: '#1C2721',
          light: '#F4FAF6',
        },
        status: {
          authorized: '#4A9B8E',
          denied: '#E8A0A0',
          warning: '#E8C687',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        heading: ['Poppins', 'Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
