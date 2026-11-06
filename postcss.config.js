// Project-local PostCSS config.
// This site uses plain CSS (no Tailwind), so no plugins are needed.
// Its presence stops Vite from searching parent directories and picking up
// an unrelated config (e.g. C:\Users\Admin\postcss.config.js).
export default {
  plugins: {},
};
