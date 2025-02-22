import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    './src/**/*.{ts,tsx,html}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        poppins: ['Poppins'],
        archivo: ['Archivo', 'sans'],
        geist: ['Geist', 'sans'],
        geistmono: ['Geist Mono', 'monospace'],
        jetbrainsMono: ['JetBrains Mono', 'monospace'],
        sans: [
          'Geist',
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Ubuntu',
          'Cantarell',
          'Noto Sans',
          'sans-serif',
          'Helvetica Neue',
          'Arial',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--border))',
        ring: 'hsl(var(--primary))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        tertiary: {
          DEFAULT: 'hsl(var(--tertiary))',
          foreground: 'hsl(var(--tertiary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        message: {
          DEFAULT: 'hsl(var(--message))',
          foreground: 'hsl(var(--message-foreground))',
        },
        chart: {
          DEFAULT: 'hsl(var(--chart-1))',
          foreground: 'hsl(var(--chart-2))',
        },
        chart2: {
          DEFAULT: 'hsl(var(--chart-2))',
          foreground: 'hsl(var(--chart-1))',
        },
        chart3: {
          DEFAULT: 'hsl(var(--chart-3))',
          foreground: 'hsl(var(--chart-4))',
        },
        chart4: {
          DEFAULT: 'hsl(var(--chart-4))',
          foreground: 'hsl(var(--chart-3))',
        },
        
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': 'calc(var(--radius) + 25px)',


      },
      borderWidth: {
        DEFAULT: 'var(--border-width)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'toast-in': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'toast-out': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'toast-in': 'toast-in 0.5s ease-in-out forwards',
        'toast-out': 'toast-out 0.5s ease-in-out forwards',
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        bounce: 'bounce 0.6s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animated'), require('tailwindcss-animate')],
} satisfies Config;