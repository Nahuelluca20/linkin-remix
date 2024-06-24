import type { Config } from "tailwindcss";

export default {
  darkMode: ["selector", '[data-mode="dark"]'],
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
