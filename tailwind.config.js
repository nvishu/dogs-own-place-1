/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: { xs: '420px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    extend: {
      colors: {
        orange: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        brand: {
          primary:   '#E8622A',
          secondary: '#C44D1A',
          dark:      '#5C2E0A',
          brown:     '#7B3F1A',
          light:     '#FFF4EB',
          cream:     '#FDF8F0',
          accent:    '#F5A623',
          muted:     '#A0522D',
          teal:      '#14B8A6',
          sky:       '#0EA5E9',
          rose:      '#F43F5E',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['Nunito', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up':      'fadeUp 0.6s ease forwards',
        'fade-in':      'fadeIn 0.5s ease forwards',
        'slide-right':  'slideRight 0.5s ease forwards',
        'bounce-slow':  'bounce 3s infinite',
        'pulse-slow':   'pulse 3s infinite',
        'float':        'float 3s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'spin-slow':    'spin 8s linear infinite',
        'scale-up':     'scaleUp 0.3s ease forwards',
        'pop-in':       'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'gradient-x':   'gradientX 6s ease infinite',
        'drift':        'drift 12s ease-in-out infinite',
        'ping-soft':    'pingSoft 2s cubic-bezier(0,0,0.2,1) infinite',
        'slide-down':   'slideDown 0.25s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        popIn: {
          '0%':   { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        gradientX: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        drift: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%':     { transform: 'translate(30px,-20px) scale(1.08)' },
        },
        pingSoft: {
          '75%,100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%':   { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        brand:  '0 4px 24px rgba(232,98,42,0.25)',
        'brand-lg': '0 8px 40px rgba(232,98,42,0.35)',
        warm:   '0 4px 24px rgba(91,46,10,0.15)',
        'warm-lg': '0 8px 40px rgba(91,46,10,0.25)',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #E8622A 0%, #F5A623 100%)',
        'brown-gradient':  'linear-gradient(135deg, #5C2E0A 0%, #7B3F1A 100%)',
        'hero-pattern':    'radial-gradient(circle at 20% 50%, rgba(232,98,42,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,166,35,0.1) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
