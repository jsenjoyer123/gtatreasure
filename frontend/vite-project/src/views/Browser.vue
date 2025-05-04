<template>
  <div class="browser-container">
    <div class="browser-header">
      <button class="back-button" @click="goBack">←</button>
      <div class="tab">{{ currentTabName }}</div>
      <button class="close-button" @click="closeBrowser">×</button>
    </div>
    <router-view class="browser-content" />
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    const closeBrowser = () => router.push('/')
    
    const goBack = () => route.path !== '/browser' ? router.go(-1) : router.push('/')

    const currentTabName = computed(() => {
      return {
        'Store': 'Интернет-магазин',
        'Work': 'Рабочий портал',
        'BrowserHome': 'Браузер'
      }[route.name] || 'Браузер'
    })

    return { closeBrowser, goBack, currentTabName }
  }
}
</script>

<style scoped>
.browser-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.98);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.browser-header {
  padding: 12px 20px;
  background: #f8f8f8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.browser-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

/* Остальные стили оставить без изменений */
.back-button, .close-button {
  width: 40px;
  height: 40px;
  /* ... */
}
</style>