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
        heading: ["var(--font-hebrew)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
