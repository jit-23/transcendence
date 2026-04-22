import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["DM Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        border: "var(--border)",
        ink: "var(--ink)",
        muted: "var(--ink3)",
      },
      boxShadow: {
        panel: "var(--shadow)",
        panelSm: "var(--shadow-sm)",
      },
    },
  },
  plugins: [],
};

export default config;
