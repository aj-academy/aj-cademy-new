module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  ...(process.env.TAILWIND_MODE === 'watch' ? { watch: true } : {})
} 