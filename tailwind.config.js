/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#021024',
        secondary: '#052659',
        mid: '#5483B3',
        soft: '#7DA0CA',
        accent: '#C1E8FF',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #021024 0%, #052659 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(5,38,89,0.8) 0%, rgba(84,131,179,0.2) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #5483B3 0%, #7DA0CA 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(2, 16, 36, 0.4)',
        'card': '0 4px 24px rgba(84, 131, 179, 0.15)',
        'glow': '0 0 20px rgba(193, 232, 255, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(193, 232, 255, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(193, 232, 255, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}
