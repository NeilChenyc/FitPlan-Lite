/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 深色主题配色
        background: "#1a1a1a",
        surface: "#2d2d2d",
        primary: "#4ade80", // 亮绿色
        secondary: "#60a5fa", // 亮蓝色
        text: "#ffffff",
        textSecondary: "#9ca3af",
      },
      borderRadius: {
        "2xl": "0.75rem",
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};
