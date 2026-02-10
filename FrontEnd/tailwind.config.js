/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rustic: {
          // Light mode colors
          green: '#2D5F4C',        // Deeper, richer green
          beige: '#FAF8F3',        // Warmer, creamier beige
          clay: '#D97941',         // Vibrant terracotta
          cream: '#FFF9E6',        // Soft cream
          moss: '#5A7247',         // Natural moss green

          // Dark mode colors - completely redesigned
          charcoal: '#1a1a1a',     // Deep charcoal background
          slate: '#2a2a2a',        // Card background
          stone: '#3a3a3a',        // Elevated surfaces
          ash: '#4a4a4a',          // Borders and dividers

          // Accent colors for dark mode
          emerald: '#10B981',      // Bright emerald for CTAs
          amber: '#F59E0B',        // Warm amber for highlights
          coral: '#FF6B6B',        // Coral for alerts/warnings
          red: '#EF4444',          // Standard red for errors (softer than default)

          // Legacy (keeping for compatibility)
          mud: '#2a2a2a',
          earth: '#4f3730ff',
          deep: '#1a1a1a',
          terracotta: '#D2691E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.12)',
        'hard': '0 8px 30px rgba(0, 0, 0, 0.16)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        jump: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
      },
      animation: {
        jump: "jump 1.2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite linear",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};