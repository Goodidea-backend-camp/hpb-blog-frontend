/// <reference types="node" />
const backendPort = process.env.BACKEND_PORT || "8080";

export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    backendPort,
  },

  routeRules: {
    "/api/**": {
      proxy: `http://backend:${backendPort}/**`,
    },
  },

  modules: ["@nuxt/eslint", "@nuxt/test-utils/module"],
});
