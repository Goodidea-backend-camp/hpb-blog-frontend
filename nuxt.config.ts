import tailwindcss from '@tailwindcss/vite'

/// <reference types="node" />
const backendPort = process.env.BACKEND_PORT || '8080'

export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    backendPort
  },

  routeRules: {
    '/api/**': {
      proxy: `http://backend:${backendPort}/**`
    },
    '/admin/**': {
      ssr: false
    }
  },

  modules: ['@nuxt/eslint', '@nuxt/test-utils/module', 'shadcn-nuxt'],

  vite: {
    plugins: [tailwindcss()]
  },

  css: ['~/assets/css/main.css'],

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  }
})
