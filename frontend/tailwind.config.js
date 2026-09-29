/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0B0F17',
          blue: '#1E293B',
          saffron: '#FF9933',
          green: '#064E3B',
          purple: '#581C87',
          light: '#F8FAFC',
          cardLight: '#FFFFFF',
          borderLight: '#E2E8F0'
        },
        onion: {
          ruby: '#581C87',      // Deep Ruby / Dark Purple (#581C87)
          deep: '#4A1525',      // Deep Dark Purple (#4A1525)
          burgundy: '#5A0E45',  // Dark Burgundy Purple
          skin: '#064E3B',      // Dark Green (#064E3B)
          amber: '#059669',     // Emerald Green Accent
          light: '#A7F3D0',     // Light Green Accent
        },
        dark: {
          bg: '#0B0F17',        // Deep Charcoal Slate Canvas
          card: '#1E293B',      // Solid Charcoal Surface
          border: '#334155',    // Subtle Border
          muted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'onion-glow': '0 0 25px rgba(88, 28, 135, 0.4)',
        'emerald-glow': '0 0 25px rgba(6, 78, 59, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
