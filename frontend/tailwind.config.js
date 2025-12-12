/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a',
          dark: '#1e40af',
          light: '#3b82f6',
        },
        secondary: '#7c2d12',
        accent: '#dc2626',
        success: '#059669',
        error: '#dc2626',
        text: {
          DEFAULT: '#111827',
          muted: '#6b7280',
        },
        bgPrimary: '#fafafa',
        bgSecondary: '#f8fafc',
        border: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Poppins', 'serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lift: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }
    }
  },
  plugins: [],
}
