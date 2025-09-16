/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        neutral: '#374151',
        'base-100': '#FFFFFF',
        'base-200': '#F9FAFB',
        'base-300': '#E5E7EB',
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#F59E0B',
          neutral: '#374151',
          'base-100': '#FFFFFF',
          'base-200': '#F9FAFB',
          'base-300': '#E5E7EB',
          info: '#06B6D4',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
      },
    ],
  },
};