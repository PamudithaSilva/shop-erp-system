module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#01696f',
          hover:   '#0c4e54',
          light:   '#cedcd8',
          faint:   '#eaf2f1',
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  plugins: []
};