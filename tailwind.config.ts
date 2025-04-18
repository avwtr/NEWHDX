import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-jetbrains-mono), monospace"],
        mono: ["var(--font-jetbrains-mono), monospace"],
      },
      colors: {
        // Main theme colors
        background: "#070D2C",
        foreground: "#FFFFFF",
        accent: "#A0FFDD",

        // Science domain colors
        science: {
          neuroscience: "#9D4EDD",
          ai: "#3A86FF",
          biology: "#38B000",
          chemistry: "#FF5400",
          physics: "#FFD60A",
          medicine: "#FF0054",
          psychology: "#FB5607",
          engineering: "#4361EE",
          mathematics: "#7209B7",
          environmental: "#2DC653",
          astronomy: "#3F37C9",
          geology: "#AA6C25",
          default: "#6C757D",
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        primary: {
          DEFAULT: "#A0FFDD",
          foreground: "#070D2C",
        },

        secondary: {
          DEFAULT: "#1A2252",
          foreground: "#FFFFFF",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        muted: {
          DEFAULT: "#1A2252",
          foreground: "#A6ADCF",
        },

        card: {
          DEFAULT: "#0F1642",
          foreground: "#FFFFFF",
        },

        popover: {
          DEFAULT: "#0F1642",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
