import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './styles/**/*.css'
  ],
  theme: {
    extend: {
      colors: {
        background: '#040711',
        foreground: '#f5f8ff',
        border: 'rgba(255,255,255,0.12)',
        card: 'rgba(255,255,255,0.04)',
        accent: '#38bdf8'
      },
      animation: {
        orb: 'orb 18s ease-in-out infinite alternate'
      },
      keyframes: {
        orb: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '100%': { transform: 'translate(30px, -20px) scale(1.1)' }
        }
      }
    }
  },
  plugins: []
};

export default config;
