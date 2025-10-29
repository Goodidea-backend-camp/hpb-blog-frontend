import tailwindcss from '@tailwindcss/vite'

/// <reference types="node" />
const backendPort = process.env.BACKEND_PORT || '8080'
const environment = process.env.ENVIRONMENT || 'dev'

// 根據環境設定允許的主機
const getAllowedHosts = () => {
  switch (environment) {
    case 'dev':
      return ['localhost', '127.0.0.1', 'www.hpb.testdata.work', 'admin.hpb.testdata.work', 'api.hpb.testdata.work']
    case 'stage':
      return ['www.hpb.stage.work', 'admin.hpb.stage.work', 'api.hpb.stage.work']
    case 'prod':
      return ['www.hpb.work', 'admin.hpb.work', 'api.hpb.work']
    default:
      return ['localhost', '127.0.0.1']
  }
}

export default defineNuxtConfig({
  devtools: { enabled: true },

  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  runtimeConfig: {
    backendPort,
    environment
  },

  routeRules: {
    // TEMPORARILY DISABLED: Using Nitro dev server mock APIs instead
    // Uncomment when backend server is ready
    // '/api/**': {
    //   proxy: `http://backend:${backendPort}/**`
    // },
    '/admin/**': {
      ssr: false
    }
  },

  modules: ['@nuxt/eslint', '@nuxt/test-utils/module', 'shadcn-nuxt'],

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: getAllowedHosts()
    }
  },

  css: ['~/assets/css/main.css'],

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  }
})
