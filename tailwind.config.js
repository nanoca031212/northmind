const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a09",
        foreground: "#ffffff",
        accent: {
          light: "#d4bc8d",
          DEFAULT: "#c5a358",
          dark: "#a6874a",
        },
        card: "#121211",
        border: "rgba(255, 255, 255, 0.05)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "sans-serif"],
      },
      letterSpacing: {
        luxury: "0.25em",
        premium: "0.15em",
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // Opt-in "light:" variant — only applies when <html> has the "light" class,
    // set by ThemeContext. Storefront components add light: overrides explicitly;
    // anything without them (e.g. admin) is unaffected by the toggle.
    plugin(({ addVariant }) => {
      addVariant("light", "html.light &");
    }),
  ],
};
