/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zos-bg-primary': 'var(--zos-bg-primary)',
        'zos-bg-secondary': 'var(--zos-bg-secondary)',
        'zos-bg-tertiary': 'var(--zos-bg-tertiary)',
        'zos-bg-elevated': 'var(--zos-bg-elevated)',
        'zos-text-primary': 'var(--zos-text-primary)',
        'zos-text-secondary': 'var(--zos-text-secondary)',
        'zos-text-muted': 'var(--zos-text-muted)',
        'zos-text-inverted': 'var(--zos-text-inverted)',
        'zos-accent-primary': 'var(--zos-accent-primary)',
        'zos-accent-secondary': 'var(--zos-accent-secondary)',
        'zos-accent-hover': 'var(--zos-accent-hover)',
        'zos-border-primary': 'var(--zos-border-primary)',
        'zos-border-secondary': 'var(--zos-border-secondary)',
        'zos-border-focus': 'var(--zos-border-focus)',
        'zos-red': 'var(--zos-red)',
        'zos-orange': 'var(--zos-orange)',
        'zos-yellow': 'var(--zos-yellow)',
        'zos-green': 'var(--zos-green)',
        'zos-blue': 'var(--zos-blue)',
        'zos-purple': 'var(--zos-purple)',
        'zos-pink': 'var(--zos-pink)',
        'zos-cyan': 'var(--zos-cyan)',
      },
    },
  },
  plugins: [],
}
