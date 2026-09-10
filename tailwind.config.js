/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand / Primary
        slate: {
          50:  '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0',
          300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B',
          600: '#475569', 700: '#334155', 800: '#1E293B',
          900: '#0F172A', 950: '#020617',
        },
        // Accent blue (brand)
        blue: {
          50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE',
          500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8',
          800: '#1E40AF', 900: '#1E3A8A',
        },
        // Financial status
        emerald: { 50:'#F0FDF4', 100:'#DCFCE7', 500:'#10B981', 700:'#059669', 800:'#065F46' },
        rose:    { 50:'#FFF1F2', 100:'#FFE4E6', 500:'#F43F5E', 700:'#BE123C', 800:'#9F1239' },
        amber:   { 50:'#FFFBEB', 100:'#FEF3C7', 500:'#F59E0B', 700:'#B45309', 800:'#92400E' },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Source Code Pro"', 'monospace'],
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'sidebar': '2px 0 12px -2px rgb(0 0 0 / 0.25)',
      },
    },
  },
  plugins: [],
}
