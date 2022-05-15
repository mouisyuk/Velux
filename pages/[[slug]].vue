<template>
  <div>
    <testComponent/>
    <sc-placeholder 
      v-if="routeData" 
      name="main" 
      :rendering="routeData"
    />
  </div>
</template>

<script setup>
  import { Placeholder as scPlaceholder } from '@sitecore-jss/sitecore-jss-vue';

  import { storeToRefs } from 'pinia'
  import { useMainStore } from '~/store';
  import {useRoute} from 'vue-router'
  const mainStore = useMainStore()

  const { routeData } = storeToRefs(mainStore);
    
  const nuxtContext = useNuxtApp()
  const route = useRoute();
 
  await useAsyncData('getLayoutData', () => mainStore.getLayoutData({
    route: route.path,
    nuxtContext: nuxtContext
  }));
</script>
