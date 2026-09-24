/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0B0B0A",
          surface: "#141312",
          "surface-subtle": "#1A1918",
          "surface-hover": "#22201D",
          gold: "#E3C080",
          "gold-light": "#F3DCAB",
          "gold-dark": "#C7B78B",
          "gold-muted": "#A38D62",
          cream: "#F7F4EE",
          sand: "#DDC388",
          border: "rgba(227, 192, 128, 0.18)",
          "border-strong": "rgba(227, 192, 128, 0.4)",
          "border-subtle": "rgba(255, 255, 255, 0.08)",
          text: "#F5F2EB",
          "text-muted": "#A8A29E",
          "text-dim": "#78716C",
        },
      },
      fontFamily: {
        serif: [
          '"Cormorant Garamond"',
          "Didot",
          '"Bodoni MT"',
          "Cinzel",
          '"Playfair Display"',
          "Georgia",
          "serif",
        ],
        sans: [
          '"Plus Jakarta Sans"',
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      letterSpacing: {
        widest2: "0.2em",
        widest3: "0.28em",
      },
    },
  },
  plugins: [],
};
