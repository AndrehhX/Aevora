/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
      },
      colors: {
        void: "#0e0716",
        abyss: "#140a20",
        surface: "rgba(32,18,48,0.62)",
        accent: "#b565ff",
        accent2: "#e5489b",
      },
      boxShadow: {
        card: "0 12px 32px -12px rgba(0,0,0,0.7)",
        glow: "0 0 24px rgba(181,101,255,0.35)",
      }
    },
  },
  plugins: [],
}
