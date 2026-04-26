import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fb: {
          bg: "#fbf8f4",
          surface: "#fffdf8",
          card: "#ffffff",
          ink: "#17211f",
          muted: "#68736f",
          subtle: "#8b948f",
          line: "#e7e2d8",
          green: {
            DEFAULT: "#1e5b4a",
            900: "#123d33",
            100: "#e7f1ec",
            50: "#f2f8f5",
          },
          sage: "#a8bfaf",
          sand: "#f2e9dc",
          stone: "#e7e2d8",
          slate: "#3e4752",
          bluegray: "#6b7c93",
          warning: {
            DEFAULT: "#c98e20",
            bg: "#fff3cf",
          },
          danger: {
            DEFAULT: "#a85645",
            bg: "#f8e8e3",
          },
          kakao: "#f8d75b",
        },
      },
      borderRadius: {
        card: "1.125rem",
        soft: "0.875rem",
        button: "0.875rem",
      },
      boxShadow: {
        card: "0 10px 30px rgba(18, 61, 51, 0.08)",
        soft: "0 18px 60px rgba(18, 61, 51, 0.12)",
        elevated: "0 28px 90px rgba(18, 61, 51, 0.16)",
        "inner-soft": "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
      },
    },
  },
};

export default config;
