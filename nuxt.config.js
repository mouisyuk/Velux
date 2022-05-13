import { defineNuxtConfig } from 'nuxt'
import serverConfig  from './server/server.config';

export default defineNuxtConfig({
  plugins: [
    { 
      src: '~/plugins/export-route-data-context-plugin', 
      mode: 'server' 
    }
  ],
  buildModules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],
  modules: [
    '~/modules/express/initialize',
    [
      '~/modules/jss/standard/initialize', 
      { dataFetcherType: 'axios' }
    ],
    '@nuxtjs-alt/axios',
    '@nuxtjs/pwa',
    [
      '~/modules/jss/rendering-host/initialize',
      {
        enabled: true,
        resolveRenderingHostPublicUrl: (nuxtApp, nuxtCfg) => {
          const serverUrl = serverConfig.resolveServerUrl();
          const publicServerUrl = serverConfig.resolvePublicServerUrl();
          return publicServerUrl.url || serverUrl.url;
        },
      },
    ]
  ],
  build: {
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map';
      }
    },
  },
  generate: {
    dir: 'out',
    crawler: false,
  },
  ssr: false,
  server: {
    port: serverConfig.resolveListeningPort(),
  },
});
