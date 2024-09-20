/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        inter: ['Inter']
      },
      colors: {
        brand: {
          DEFAULT: 'hsl(var(--brand-primary))',
          secondary: 'hsl(var(--brand-secondary))',
          tertiary: 'hsl(var(--brand-tertiary))',
          highlight: 'hsl(var(--brand-highlight))'
        },
        neutral: {
          0: 'hsl(var(--neutral-0))',
          50: 'hsl(var(--neutral-50))',
          100: 'hsl(var(--neutral-100))',
          400: 'hsl(var(--neutral-400))',
          600: 'hsl(var(--neutral-600))',
          700: 'hsl(var(--neutral-700))',
          800: 'hsl(var(--neutral-800))',
          900: 'hsl(var(--neutral-900))'
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          dark: 'hsl(var(--danger-dark))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          light: 'hsl(var(--success-light))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))'
        },
        text: 'hsl(var(--text))',
        action: {
          DEFAULT: 'hsl(var(--action))',
          light: 'hsl(var(--action-light))'
        },
        background: {
          DEFAULT: 'hsl(var(--background))',
          200: 'hsl(var(--background-200))',
          300: 'hsl(var(--background-300) / 0.25)'
        },

        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        custom: {
          1: '#44444F',
          2: '#F3F3F3',
          3: '#7B829F',
          4: '#9c9c9c',
          5: '#5975AE'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
