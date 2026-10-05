/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
        severity: {
          low: "#10b981",
          medium: "#f59e0b",
          high: "#f97316",
          critical: "#ef4444",
        },
        forest: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
      },
      animation: {
        "green-pulse": "greenPulse 2s ease-in-out infinite",
        "scan-line": "scanLine 2s ease-in-out infinite",
        "score-ring": "scoreRing 1.5s ease-out forwards",
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "slide-right": "slideRight 0.6s ease-out forwards",
      },
      keyframes: {
        greenPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(34, 197, 94, 0)" },
        },
        scanLine: {
          "0%": { transform: "translateY(0%)", opacity: "1" },
          "50%": { transform: "translateY(100%)", opacity: "0.5" },
          "100%": { transform: "translateY(0%)", opacity: "1" },
        },
        scoreRing: {
          "0%": { strokeDashoffset: "440" },
          "100%": { strokeDashoffset: "var(--target-offset)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
