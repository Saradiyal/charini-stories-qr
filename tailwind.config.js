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
          green: "#033431",
          "green-hover": "#084642",
          "green-subtle": "rgba(3, 52, 49, 0.06)",
          "green-soft": "rgba(3, 52, 49, 0.12)",
          "neutral-bg": "#F8F6F2",
          cream: "#F2EEE6",
          dark: "#172321",
          muted: "#65706D",
          white: "#FFFFFF",
          border: "rgba(3, 52, 49, 0.15)",
          "border-strong": "rgba(3, 52, 49, 0.35)",
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
