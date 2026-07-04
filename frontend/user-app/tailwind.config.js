/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        krikso: {
          50: "#edf9ef",
          100: "#d4f1d8",
          200: "#a8e3b3",
          300: "#7cd58e",
          400: "#50c769",
          500: "#2f9e44",
          600: "#268536",
          700: "#1f6d2e",
          800: "#175422",
          900: "#0f3f1a"
        }
      },
      animation: {
        "toast-in": "toast-slide-in 0.35s cubic-bezier(0.21,1.02,0.73,1) forwards",
        "toast-out": "toast-slide-out 0.3s ease-in forwards",
        "fade-in-up": "fade-in-up 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "checkmark": "checkmark 0.6s ease-out forwards",
      },
      keyframes: {
        "toast-slide-in": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "toast-slide-out": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        "fade-in-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "checkmark": {
          "0%": { transform: "scale(0) rotate(-45deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
    }
  },
  plugins: []
};
