/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#08090A',
        'background-2': '#0C0D10',
        surface: '#101113',
        'surface-2': '#16181C',
        'surface-3': '#1C1F24',
        gold: {
          DEFAULT: '#E6C687',
          bright: '#F3D99A',
          deep: '#C9A961',
        },
        ivory: {
          DEFAULT: '#F5EFE0',
          dim: '#C7C0AD',
          mute: '#8A857A',
        },
        positive: '#B9D4A3',
        negative: '#E09B87',
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '18px',
        lg: '24px',
        xl: '32px',
      },
      fontFamily: {
        marcellus: ['Marcellus', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
