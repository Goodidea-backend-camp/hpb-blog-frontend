import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [vue()],
        test: {
          name: 'unit',
          include: ['test/{e2e,unit}/*.{test,spec}.ts'],
          environment: 'happy-dom'
        },
        resolve: {
          alias: {
            '@': fileURLToPath(new URL('./app', import.meta.url)),
            '#app': fileURLToPath(new URL('./node_modules/nuxt/dist/app', import.meta.url))
          }
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt'
        }
      })
    ]
  }
})
