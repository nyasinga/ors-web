import type { Config } from "tailwindcss";

/** ISIPPE-3 / ACA ORS design tokens from UX Screens 2 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: "#0B45E0",
          50: "#EEF3FF",
          100: "#D9E4FF",
          600: "#0B45E0",
          700: "#0938B8",
          800: "#0A2A7A",
        },
        navy: {
          DEFAULT: "#0A2A7A",
          900: "#061B52",
        },
        green: {
          DEFAULT: "#0B7A3B",
          50: "#E8F6EE",
          600: "#0B7A3B",
          700: "#096532",
        },
        red: {
          DEFAULT: "#D7263D",
          50: "#FDE8EB",
          600: "#D7263D",
          700: "#B51E32",
        },
        ink: {
          DEFAULT: "#0F1B3D",
          800: "#1A274D",
        },
        mute: {
          DEFAULT: "#5B6685",
        },
        soft: {
          DEFAULT: "#EEF3FF",
        },
      },
      fontFamily: {
        sans: ["Inter", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 27, 61, 0.04), 0 4px 12px rgba(15, 27, 61, 0.06)",
      },
      maxWidth: {
        /** Soft cap for prose/forms only — public chrome uses full-bleed `.page-container`. */
        container: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
