/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
      },
      colors: {
        void: "#0E1015",
        abyss: "#15181F",
        surface: "rgba(21, 24, 31, 0.78)",
        card: "#1B1E26",
        accent: "#FF6B2B",
        accent2: "#FFA043",
        steam: {
          bg: "#0E1015",
          surface: "#15181F",
          card: "#1B1E26",
          cardHover: "#222631",
          orange: "#FF6B2B",
          orangeHover: "#FF7D42",
          amber: "#FFA043",
          muted: "#8E929E",
          dim: "#5C606D",
        },
        aevora: {
          bg: "#0E1015",
          surface: "#15181F",
          deep: "#1B1E26",
          purpleDark: "#222631",
          purple: "#FF6B2B",
          lavender: "#FFA043",
          soft: "#D4D8E2",
          pale: "#8E929E",
          text: "#FFFFFF",
        },
      },
      boxShadow: {
        card: "0 16px 40px -12px rgba(0,0,0,0.85)",
        glow: "0 0 28px rgba(255,107,43,0.30)",
        orange: "0 8px 24px -4px rgba(255,107,43,0.45)",
      }
    },
  },
  plugins: [],
}
