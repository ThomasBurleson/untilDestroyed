// https://dev.to/this-is-angular/why-tailwind-s-just-in-time-mode-is-a-game-changer-and-how-to-use-it-right-now-36c0

module.exports = {
  purge: {
    content: ['./public/**/*.html', './src/**/*.{js,jsx,ts,tsx,scss,html}'],
    // PurgeCSS options
    // Reference: https://purgecss.com/
    options: {
      rejected: true,
      printRejected: true,
    },
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
