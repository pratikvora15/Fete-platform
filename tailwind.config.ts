import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#141210',
        ink2: '#5E5B54',
        ink3: '#A09C93',
        cream: '#FAF8F3',
        warm: '#F2EDE3',
        gold: '#C4913A',
        'gold-lt': '#FBF4E6',
        'gold-dk': '#9A6E25',
        rose: '#C4506A',
        'rose-lt': '#FCEEF2',
        teal: '#2E9B72',
        'teal-lt': '#E8F6EF',
        blue: '#2F6EC4',
        'blue-lt': '#EAF1FB',
        amber: '#B8700A',
      },
    },
  },
  plugins: [],
}
export default config