import { useMainStore } from '~/store';

export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtContext = useNuxtApp()

  const mainStore = useMainStore()

 try {
  await useAsyncData('getLayoutData', () => mainStore.getLayoutData({
    route: to.href,
    nuxtContext: nuxtContext
  }))
  } catch(error) {
    // TO:DO add error handler
    console.error(error)
  }
})