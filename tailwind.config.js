module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        forest: {
          light:  '#2D6A4F',
          DEFAULT:'#1B4332',
          dark:   '#0B3D2E',
          darker: '#081C15',
        },
        accent: {
          emerald: '#10B981',
          gold:    '#F59E0B',
          cyan:    '#06B6D4',
          rose:    '#F43F5E',
          blue:    '#3B82F6',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          2:       '#F8FAF9',
          3:       '#F0F7F4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.35s ease-out',
        'slide-up':    'slideUp 0.35s ease-out',
        'slide-right': 'slideInRight 0.3s ease-out',
        'scale-in':    'scaleIn 0.2s ease-out',
        'shimmer':     'shimmer 2s linear infinite',
        'float':       'float 3s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:      { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:      { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:      { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      boxShadow: {
        'card':      '0 2px 16px rgba(0,0,0,0.06)',
        'card-hover':'0 6px 32px rgba(0,0,0,0.10)',
        'glow-green':'0 0 24px rgba(27,67,50,0.25)',
        'sidebar':   '4px 0 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
