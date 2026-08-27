import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        terracotta: {
          DEFAULT: "var(--terracotta)",
          dark: "var(--terracotta-dark)",
        },
        olive: {
          DEFAULT: "var(--olive)",
          light: "var(--olive-light)",
        },
        marble: "var(--marble)",
      },
      backgroundImage: {
        marble: "var(--marble-texture)",
      },
      fontFamily: {
        script: ["var(--font-script)", "cursive"],
        heading: ["var(--font-heading-he)", "serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
