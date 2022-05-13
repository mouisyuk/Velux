const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    'components/**/*.vue',
    'layouts/**/*.vue',
    'pages/**/*.vue',
    'plugins/**/*.js',
    'app.vue',
  ],
  theme: {
    extend: {
      extend: {
        padding: {
          4.5: '1.125rem',
          13: '3.25rem',
          18: '4.5rem',
          19: '4.75rem',
          26: '6.5rem',
          30: '7.5rem',
        },
        margin: {
          18: '4.5rem',
          21: '5.25rem',
          41: '10.25rem',
        },
        spacing: {
          18: '4.5rem',
        },
        height: {
          18: '4.5rem',
        },
        width: {
          100: '25rem',
        },
        minHeight: {
          39: '9.75rem',
        },
        maxHeight: {
          22: '5.5rem',
          35: '8.75rem',
        },
        opacity: {
          94: '.94',
        },
        typography: ({ theme }) => ({
          DEFAULT: {
            css: {
              color: theme('colors.velux.grey.800'),
            },
          },
        }),
      },
      screens: {
        sm: '768px',
        md: '1280px',
        lg: '1768px',
        xl: '2160px',
        mobile: { max: '768px' },
      },
      container: {
        center: true,
        screens: {
          DEFAULT: '100vw',
          xl: '2160px',
        },
        padding: {
          DEFAULT: '1rem',
        },
      },
      boxShadow: {
        medium: '0px 16px 32px rgba(0, 0, 0, 0.06)',
        large: '0px 32px 128px rgba(0, 0, 0, 0.12)',
        none: '0 0 #0000',
      },
      colors: {
        // Setting up VELUX colour pallette
        transparent: 'transparent',
        velux: {
          red: {
            100: '#d16b76', // Light Red
            500: '#ee0000', // Red
            900: '#a11515', // Dark Red
          },
          white: '#ffffff', // White
          blue: {
            100: '#cfe1f0', // Light Blue (proposal)
            200: '#a9cae5', // Blue
            900: '#476996', // Dark Blue
          },
          grey: {
            100: '#f2f2f2', // Light Grey
            200: '#e0e0e0', // Medium Grey
            300: '#c4c4c4', // Medium Grey
            700: '#737373', // Dark Grey
            800: '#28231f', // Dusty Black
            900: '#191919', // Dusty Black
          },
          green: '#264f48',
          hover: {
            red: '#aa0000', // Hover red
          },
        },
      },
      fontFamily: {
        sans: ['VeluxFont', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xxs: '0.625rem',
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        17: '1.0625rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '1.75rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.125rem',
      },
      lineHeight: {
        100: '100%',
        110: '110%',
        120: '120%',
        130: '130%',
        140: '140%',
        160: '160%',
      },
      letterSpacing: {
        normal: '0em',
        1: '1px',
        10: '0.010em',
        12: '0.012em',
        14: '0.014em',
        wider: '0.0625em',
      },
    },
  },
  safeList: ['overflow-hidden'],
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-debug-screens'),
  ],
}
