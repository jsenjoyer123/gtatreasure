<template>
    <div class="phone-frame" @click.self="goHome">
      <div class="status-bar">
        <span>9:41</span>
        <div>
          <span>📶</span>
          <span>100%</span>
        </div>
      </div>
      <router-view class="app-container" />
    </div>
  </template>
  
  <script>
  import { useRouter } from 'vue-router'
  
  export default {
    setup() {
      const router = useRouter()
      function goHome() {
        router.push('/')
      }
      return { goHome }
    }
  }
  </script>
  
  <style scoped>
  .phone-frame {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--primary-color);
    width: 375px;
    height: 667px;
    border-radius: 40px;
    box-shadow: 0 0 60px rgba(0,0,0,0.3);
    overflow: hidden;
  }
  
  .status-bar {
    display: flex;
    justify-content: space-between;
    padding: 8px 20px;
    background: var(--secondary-color);
    font-size: 14px;
  }
  
  .app-container {
    padding: 20px;
    height: calc(100% - 40px);
  }
  </style>