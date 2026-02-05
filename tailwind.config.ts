import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Charte VDS - couleurs du logo
        primary: {
          DEFAULT: '#d4af37',  // Or/Gold (croix du logo)
          dark: '#b8962f',
          light: '#e6c85a',
        },
        vds: {
          blue: '#1e4a8d',     // Bleu du globe
          'blue-light': '#3a7fc7',
          red: '#c41e3a',      // Rouge "VDS"
          gold: '#d4af37',     // Or/Jaune de la croix
        },
        dark: {
          DEFAULT: '#1a1a2e',
          light: '#16213e',
          lighter: '#0f3460',
        },
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
