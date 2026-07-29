module.exports = {
  content: ['./public/index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#245fa9',
          hover:   '#1b4b8b',
          light:   '#d9e8fb',
          faint:   '#eef5ff',
          dark:    '#183867',
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  plugins: []
};
