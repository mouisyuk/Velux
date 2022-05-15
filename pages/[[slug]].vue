<template>
  <div>
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

  const mainStore = useMainStore()

  const { routeData } = storeToRefs(mainStore);
</script>
