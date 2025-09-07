export default defineNuxtConfig({
  devtools: { enabled: true },

  routeRules: {
    '/api/**': {
      proxy: `http://backend:${process.env.BACKEND_PORT || '8080'}/**`,
    },
  },
})