import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#E8508A',
          soft: '#FFF0F5',
          deep: '#C8326C',
        },
        cream: {
          DEFAULT: '#FFF8F0',
          2: '#FBEFE0',
        },
        brown: {
          DEFAULT: '#3D2B1F',
          soft: '#7A5A45',
        },
        gold: {
          DEFAULT: '#D4A853',
          soft: '#F4DFA8',
        },
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
        cormorant: ['"Cormorant Infant"', 'serif'],
        unbounded: ['Unbounded', 'sans-serif'],
        geometria: ['Geometria', '"Work Sans"', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 4px 14px rgba(61,43,31,0.06)',
        DEFAULT: '0 12px 30px rgba(61,43,31,0.10)',
        lg: '0 24px 60px rgba(61,43,31,0.14)',
        pink: '0 16px 36px rgba(232,80,138,0.30)',
        'pink-lg': '0 22px 40px rgba(232,80,138,0.42)',
      },
      borderColor: { DEFAULT: 'rgba(61,43,31,0.10)' },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
        gentle: 'cubic-bezier(.2,.7,.2,1)',
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-22px) rotate(8deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0,0) rotate(0)' },
          '33%': { transform: 'translate(14px,-18px) rotate(10deg)' },
          '66%': { transform: 'translate(-12px,12px) rotate(-8deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0)' },
          '25%': { transform: 'rotate(-12deg) scale(1.12)' },
          '75%': { transform: 'rotate(12deg) scale(1.12)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          from: { transform: 'translateX(110%)' },
          to: { transform: 'translateX(0)' },
        },
        pulseBadge: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 6px 16px rgba(232,80,138,0.35)' },
          '50%': { transform: 'scale(1.06)', boxShadow: '0 10px 22px rgba(232,80,138,0.45)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        floatY: 'floatY 7s ease-in-out infinite',
        drift: 'drift 9s ease-in-out infinite',
        wiggle: 'wiggle .8s ease-in-out',
        fadeInUp: 'fadeInUp .65s cubic-bezier(.2,.7,.2,1) both',
        scaleIn: 'scaleIn .35s cubic-bezier(.2,.8,.2,1) both',
        slideInRight: 'slideInRight .4s cubic-bezier(.2,.8,.2,1)',
        pulseBadge: 'pulseBadge 2.2s ease-in-out infinite',
        shimmer: 'shimmer 14s ease-in-out infinite',
      },
      backgroundImage: {
        'hero-grad': 'linear-gradient(120deg, #FFF0F5 0%, #FFF8F0 35%, #FBEFE0 70%, #FFF0F5 100%)',
        'logo-grad': 'linear-gradient(135deg, #E8508A 0%, #D4A853 100%)',
        'footer-grad': 'linear-gradient(135deg, #3D2B1F 0%, #1E140C 100%)',
      },
      maxWidth: { container: '1240px' },
    },
  },
  plugins: [],
};

export default config;
