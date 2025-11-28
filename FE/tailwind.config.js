/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A2B4C',
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#1A2B4C',
        },
        accent: {
          DEFAULT: '#3B82F6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        primary: {
          DEFAULT: '#1A2B4C',
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#1A2B4C',
        },
      },
      borderRadius: {
        'soft': '12px',
        'soft-lg': '16px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'neumorphism': '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'bgMove': 'bgMove 15s ease-in-out infinite',
        'fadeInUp': 'fadeInUp 0.6s ease forwards',
        'avatarPulse': 'avatarPulse 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradientShift': 'gradientShift 3s ease infinite',
        'buttonGlow': 'buttonGlow 2s ease-in-out infinite',
        'cardHover': 'cardHover 0.3s ease forwards',
        'iconBounce': 'iconBounce 1s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
        bgMove: {
          '0%': { 
            'background-position': '0% 50%' 
          },
          '50%': { 
            'background-position': '100% 50%' 
          },
          '100%': { 
            'background-position': '0% 50%' 
          },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(30px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        avatarPulse: {
          '0%': { 
            'box-shadow': '0 0 0 0 rgba(27, 122, 120, 0.4)' 
          },
          '70%': { 
            'box-shadow': '0 0 0 20px rgba(27, 122, 120, 0)' 
          },
          '100%': { 
            'box-shadow': '0 0 0 0 rgba(27, 122, 120, 0)' 
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px)' 
          },
          '50%': { 
            transform: 'translateY(-10px)' 
          },
        },
        gradientShift: {
          '0%': { 
            'background-position': '0% 50%' 
          },
          '50%': { 
            'background-position': '100% 50%' 
          },
          '100%': { 
            'background-position': '0% 50%' 
          },
        },
        buttonGlow: {
          '0%': { 
            'box-shadow': '0 4px 15px rgba(15, 95, 92, 0.2)' 
          },
          '50%': { 
            'box-shadow': '0 8px 25px rgba(15, 95, 92, 0.4)' 
          },
          '100%': { 
            'box-shadow': '0 4px 15px rgba(15, 95, 92, 0.2)' 
          },
        },
        cardHover: {
          '0%': { 
            transform: 'translateY(0) scale(1)' 
          },
          '100%': { 
            transform: 'translateY(-5px) scale(1.02)' 
          },
        },
        iconBounce: {
          '0%, 20%, 50%, 80%, 100%': { 
            transform: 'translateY(0)' 
          },
          '40%': { 
            transform: 'translateY(-10px)' 
          },
          '60%': { 
            transform: 'translateY(-5px)' 
          },
        },
        shimmer: {
          '0%': { 
            'background-position': '-200px 0' 
          },
          '100%': { 
            'background-position': 'calc(200px + 100%) 0' 
          },
        },
      },
    },
  },
  plugins: [],
}

