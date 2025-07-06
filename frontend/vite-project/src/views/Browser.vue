<template>
  <div class="browser-container">
    <div class="browser-header">
      <button 
        class="back-button" 
        @click="goBack"
        aria-label="Назад"
      >
        <span class="arrow"></span>
      </button>
      <div class="center-content">
        <img :src="hydraLogo" alt="Hydra Logo" class="logo" />
        <div class="logo-text">HYDRA</div>
      </div>
      <button 
        class="close-button" 
        @click="closeBrowser"
        aria-label="Закрыть"
      >
        <span class="close-icon"></span>
      </button>
    </div>
    <router-view class="browser-content" />
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import hydraLogo from '../assets/hydra.png'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    const closeBrowser = () => router.push('/')

    const goBack = () => route.path !== '/browser' ? router.go(-1) : router.push('/')

    const currentTabName = computed(() => {
      return {
        'Store': 'Мастер позиции',
        'Work': 'Позиции Товаров',
        'BrowserHome': ''
      }[route.name] || ''
    })

    return { closeBrowser, goBack, currentTabName, hydraLogo }
  }
}
</script>

<style scoped>
.browser-header {
  padding: 10px 16px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button, .close-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.back-button:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.close-button:hover {
  background: #ff4444;
  color: white;
  transform: scale(1.05);
}

.arrow {
  width: 12px;
  height: 12px;
  border: 2px solid #333;
  border-right: 0;
  border-bottom: 0;
  transform: rotate(-45deg);
  margin-left: 4px;
  transition: transform 0.2s ease;
}

.close-icon {
  position: relative;
  width: 18px;
  height: 18px;
}

.close-icon:before, 
.close-icon:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: #666;
  top: 50%;
  left: 0;
  transition: all 0.2s ease;
}

.close-icon:before {
  transform: rotate(45deg);
}

.close-icon:after {
  transform: rotate(-45deg);
}

.close-button:hover .close-icon:before,
.close-button:hover .close-icon:after {
  background: white;
}

.back-button:active {
  transform: translateY(1px) scale(0.95);
}

.close-button:active {
  transform: scale(0.95);
}

.tab {
  font-weight: 500;
  font-size: 16px;
  color: #333;
  flex-grow: 1;
  text-align: center;
  padding: 0 12px;
}

.browser-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0);
}

.browser-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.logo {
  width: 32px;
  height: auto;
}

.center-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logo-text {
  margin-left: 8px;
  font-weight: 600;
  font-size: 20px;
  color: #0066ff;
}
</style>