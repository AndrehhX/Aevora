/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
      },
      colors: {
        void: "#0D0912",
        abyss: "#17101F",
        surface: "rgba(23,16,31,0.66)",
        accent: "#8263A1",
        accent2: "#A07CC1",
        aevora: {
          bg: "#0D0912",
          surface: "#17101F",
          deep: "#4A3560",
          purpleDark: "#654A7F",
          purple: "#8263A1",
          lavender: "#A07CC1",
          soft: "#BEA0D8",
          pale: "#D9C6EA",
          text: "#F1EAF8",
        },
      },
      boxShadow: {
        card: "0 12px 32px -12px rgba(0,0,0,0.7)",
        glow: "0 0 24px rgba(190,160,216,0.28)",
      }
    },
  },
  plugins: [],
}
