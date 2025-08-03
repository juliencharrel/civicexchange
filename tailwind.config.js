/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          light: '#3B82F6', // bleu clair (buttons, accents)
          DEFAULT: '#1D4ED8', // bleu principal
          dark: '#1E40AF',   // bleu foncé (hover, focus)
        },
        secondary: {
          light: '#10B981',  // vert clair (validation, succès)
          DEFAULT: '#059669', 
          dark: '#047857',
        },
        neutral: {
          light: '#F3F4F6', // gris très clair (background sections)
          DEFAULT: '#9CA3AF', // gris moyen
          dark: '#374151',   // gris foncé (titres)
        },
        danger: {
          light: '#FCA5A5',
          DEFAULT: '#DC2626',
          dark: '#B91C1C',
        }
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 6px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
