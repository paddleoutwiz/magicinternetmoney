import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wizard colors
        'wizard-blue': '#2f53fe',
        'wizard-face': '#e9ca1a',
        'wizard-beard': '#aaabbc',
        'wizard-black': '#040104',
        'wizard-text': '#030505',
        'wizard-highlight': '#6ef405',
        'wizard-cyan': '#67d1e3',
        
        // Bitcoin colors
        'bitcoin-orange': '#f09f00',
        'bitcoin-brown': '#9d4602',
        
        // Fire colors
        'fire-yellow': '#e6b003',
        'fire-orange': '#e98903',
        'fire-light': '#eff797',
        
        // Magic colors
        'magic-yellow': '#f3ff00',
        
        // Glitch effect colors
        'glitch-magenta': '#ff00ff',
        'glitch-cyan': '#00ffff',
      },
      fontFamily: {
        'derp': ['Derp', 'Permanent Marker', 'cursive'],
        'caveat': ['var(--font-caveat)', 'cursive'],
      },
      animation: {
        // Basic movements
        'float': 'float 3s ease-in-out infinite',
        'bounce': 'bounce 2s ease-in-out infinite',
        'spin': 'spin 2s linear infinite',
        
        // Effects
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'pulse': 'pulse 2s ease-in-out infinite',
        'rainbow-glow': 'rainbow-glow 3s ease-in-out infinite',
        
        // Glitch animations
        'glitch': 'glitch 0.5s infinite',
        'glitch-1': 'glitch-1 0.5s infinite',
        'glitch-2': 'glitch-2 0.5s infinite 0.1s',
        
        // Matrix effect
        'matrix-fall': 'matrix-fall linear infinite',
        'matrix-glow': 'matrix-glow 2s ease-in-out infinite',
        
        // Screen effects
        'screen-shake': 'screen-shake 0.5s ease-in-out',
        
        // Special effects
        'vortex-spin': 'spin 30s linear infinite',
        'laser-shoot': 'laser-shoot 0.5s ease-out forwards',
        'pulse-crazy': 'pulse-crazy 2s ease-in-out infinite',
      },
      keyframes: {
        // Only add keyframes not defined in globals.css
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
export default config