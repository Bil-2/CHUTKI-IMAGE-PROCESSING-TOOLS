/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
    extend: {
      screens: {
        xs: "480px", // 📱 Small phones
      },
      animation: {
        "bounce-slow": "bounce 3s infinite",
        "chutki-appear": "chutki-appear 0.8s ease-out",
      },
      keyframes: {
        "chutki-appear": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px) scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};
