/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AfterPassing Guide — primary background
        'vault-dark': '#1F2534',
        'vault-darker': '#1A2130',
        
        // Sidebar / card
        'sidebar-bg': '#2A3340',
        'card-bg': '#303A48',
        'card-bg-hover': '#3A4552',
        
        // Accent (APG branding)
        'accent-gold': '#C9AE66',
        'accent-gold-hover': '#D1B26E',
        
        // Text Colors - Ivory, not bright white
        'text-primary': '#FFF8E7',
        'text-secondary': '#A0AAB6',
        'text-muted': '#8590A2',
        
        // Borders
        'border-subtle': 'rgba(255, 255, 255, 0.10)',
        
        // Legacy aliases for compatibility
        'brand-gold': '#C9AE66',
        'burnt-orange': '#cc6600',
        white: '#FFF8E7',
      },
      borderRadius: {
        'card': '12px',
        'button': '10px',
        'input': '10px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
