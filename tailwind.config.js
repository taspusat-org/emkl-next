/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './constants/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './sections/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: 'true',
      padding: '2rem',
      screens: {
        '2xl': '1400px',
        '3xl': '1600px'
      }
    },
    extend: {
      textTransform: {
        none: 'none' // Membuat pengaturan text-transform: none
      },
      fontSize: {
        unset: 'unset' // Membuat pengaturan font-size: unset
      },
      colors: {
        green: {
          100: '#d4edda', // Light green
          200: '#c3e6cb', // Lighter green
          300: '#8fd19e', // Light green
          400: '#5cb85c', // Medium green
          500: '#28a745', // Base green
          600: '#218838', // Darker green
          700: '#1e7e34', // Dark green
          800: '#1c7430', // Darker green
          900: '#155724' // Very dark green
        },
        red: {
          100: '#f8d7da', // Light red
          200: '#f5c6cb', // Lighter red
          300: '#f1b0b7', // Light red
          400: '#e57373', // Medium light red
          500: '#dc3545', // Base red
          600: '#c82333', // Darker red
          700: '#bd2131', // Dark red
          800: '#a71c1c', // Darker red
          900: '#721c24' // Very dark red
        },
        yellow: {
          100: '#ffec3d', // lightest shade
          200: '#ffe05a',
          300: '#ffd47a',
          400: '#ffca98',
          500: '#ffc107', // base color
          600: '#e6b005',
          700: '#cc9e04',
          800: '#b38a03',
          900: '#997702' // darkest shade
        },
        blue: {
          100: '#e4effc', // lightest shade
          200: '#caddf8',
          300: '#afd0f4',
          400: '#95c3f0',
          500: '#95b8e7', // base color
          600: '#86a6cf',
          700: '#7794b8',
          800: '#6782a0',
          900: '#576f89' // darkest shade
        },
        backgroundImage: {
          'gradient-to-bottom':
            'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
        },
        primary: '#007bff',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
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
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addComponents }) {
      addComponents({
        '#content': {
          'text-transform': 'none', // Menghilangkan pengaruh text-transform
          'font-size': 'unset' // Menghilangkan pengaruh font-size
        }
      });
    }
  ]
};
