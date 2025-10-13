/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'figma-bg': '#2c2c2c',
        'figma-surface': '#383838',
        'figma-border': '#4a4a4a',
        'figma-text': '#ffffff',
        'figma-text-secondary': '#b3b3b3',
        'figma-primary': '#18a0fb',
        'figma-primary-hover': '#0d8bd9',
        'figma-danger': '#f24822',
        'figma-success': '#0fa958',
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '13px',
        'lg': '14px',
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
      },
      borderRadius: {
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
      },
    },
  },
  plugins: [],
}
