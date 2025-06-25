import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          secondary: 'var(--background-secondary)',
          tertiary: 'var(--background-tertiary)',
        },
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          hover: 'var(--card-hover)',
          foreground: 'var(--card-foreground)',
        },
        neutral: {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
          950: 'var(--color-neutral-950)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        input: {
          DEFAULT: 'var(--input)',
          border: 'var(--input-border)',
        },
        ring: 'var(--ring)',
        overlay: 'var(--overlay)',
        // Priority colors
        'priority-low': {
          bg: 'var(--priority-low-bg)',
          text: 'var(--priority-low-text)',
        },
        'priority-medium': {
          bg: 'var(--priority-medium-bg)',
          text: 'var(--priority-medium-text)',
        },
        'priority-high': {
          bg: 'var(--priority-high-bg)',
          text: 'var(--priority-high-text)',
        },
        // Status colors
        'status-pending': {
          bg: 'var(--status-pending-bg)',
          text: 'var(--status-pending-text)',
        },
        'status-in-progress': {
          bg: 'var(--status-in-progress-bg)',
          text: 'var(--status-in-progress-text)',
        },
        'status-completed': {
          bg: 'var(--status-completed-bg)',
          text: 'var(--status-completed-text)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-base)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
        none: 'none',
      },
      fontFamily: {
        display: ['var(--font-family-display)'],
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)'],
      },
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
      },
      fontWeight: {
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
      zIndex: {
        modal: '1040',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-scale': 'fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-top': 'slideInFromTop 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-bottom': 'slideInFromBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-left': 'slideInFromLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'lift': 'lift 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInScale: {
          from: { 
            opacity: '0',
            transform: 'scale(0.95)',
          },
          to: { 
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        slideInFromTop: {
          from: { 
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          to: { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInFromBottom: {
          from: { 
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInFromLeft: {
          from: { 
            opacity: '0',
            transform: 'translateX(-10px)',
          },
          to: { 
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideInFromRight: {
          from: { 
            opacity: '0',
            transform: 'translateX(10px)',
          },
          to: { 
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        lift: {
          from: {
            transform: 'translateY(0) scale(1)',
            boxShadow: 'var(--shadow-base)',
          },
          to: {
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: 'var(--shadow-md)',
          },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'swift': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.6, 1)',
        'spring': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
    },
  },
  plugins: [],
}
export default config