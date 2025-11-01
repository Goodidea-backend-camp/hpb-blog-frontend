import tailwindcss from '@tailwindcss/vite'

/// <reference types="node" />
const backendPort = process.env.BACKEND_PORT || '8080'
const environment = process.env.ENVIRONMENT || 'dev'

// 從環境變數讀取允許的主機列表。如果沒有設定，則根據環境提供預設值
const getAllowedHosts = () => {
  const allowedHostsEnv = process.env.ALLOWED_HOSTS
  
  if (allowedHostsEnv) {
    // 從環境變數讀取，移除空白並分割
    return allowedHostsEnv.split(',').map((host: string) => host.trim()).filter((host: string) => host.length > 0)
  }
  
  // 如果沒有設定環境變數，提供預設值
  switch (environment) {
    case 'dev':
      return ['localhost', '127.0.0.1']
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
    '/api/**': {
      proxy: `http://backend:${backendPort}/**`
    },
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
