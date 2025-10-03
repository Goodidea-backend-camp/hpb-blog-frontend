import { provideSSRWidth } from '@vueuse/core'
import { defineNuxtPlugin } from '#app/nuxt'

export default defineNuxtPlugin((nuxtApp) => {
  provideSSRWidth(1024, nuxtApp.vueApp)
})
