const backendPort = process.env.BACKEND_PORT || '8080';

export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    backendPort,
  },

  routeRules: {
    '/api/**': {
      proxy: `http://backend:${backendPort}/**`,
    },
  },
})
