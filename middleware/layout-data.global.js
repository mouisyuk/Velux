import { useMainStore } from '~/store';

export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtContext = useNuxtApp()

  const mainStore = useMainStore()

  // TO:DO Add implementation for getting language from URL (route patterns)
  // TO:DO Add implementation for sending query params to sitecore app from URL
 try {
  await useAsyncData('getLayoutData', () => mainStore.getLayoutData({
    route: to.path,
    nuxtContext: nuxtContext
  }))
  } catch(error) {
    // TO:DO add error handler
    console.error(error)
  }
})