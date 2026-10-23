/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charini: {
          bg: "#FAF8F5",
          surface: "#FFFFFF",
          "surface-alt": "#F5F2EB",
          charcoal: "#1A1918",
          "charcoal-deep": "#11100F",
          "charcoal-muted": "#68645E",
          "charcoal-dim": "#8A857D",
          border: "#E5E0D7",
          "border-subtle": "#EDE8E0",
          "border-strong": "#1A1918",
          sand: "#E8E3DA",
          gold: "#A38C61",
          error: "#943A3A",
          "error-bg": "#FDF6F6",
        },
      },
      fontFamily: {
        serif: [
          '"Cormorant Garamond"',
          "Didot",
          '"Bodoni MT"',
          '"Playfair Display"',
          "Georgia",
          "serif",
        ],
        sans: [
          '"Plus Jakarta Sans"',
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      letterSpacing: {
        editorial: "0.08em",
        wide2: "0.14em",
        wide3: "0.22em",
      },
    },
  },
  plugins: [],
};
