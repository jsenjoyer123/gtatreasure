<template>
    <div class="home-screen">
      <div class="app-icon" @click="openApp('browser')">
        <div>🌐</div>
        <span>Браузер</span>
      </div>
      <div class="app-icon" @click="openApp('gallery')">
        <div>🖼️</div>
        <span>Галерея</span>
      </div>
      <div class="app-icon" @click="openApp('camera')">
        <div>📷</div>
        <span>Камера</span>
      </div>
      <div class="app-icon" @click="spawnMultipleBalls(5)">
        <div>🔵</div>
        <span>Шар</span>
      </div>
    </div>
  </template>
  
  <script>
  import { useRouter } from 'vue-router'
  
  export default {
    setup() {
      const router = useRouter()
  
      function spawnMultipleBalls(count) {
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            // Предполагаемый вызов внешнего API mp
            if (window.mp?.trigger) {
              window.mp.trigger('spawnObjectNearby', false)
            } else {
              console.log('spawnObjectNearby triggered', false)
            }
          }, i * 500)
        }
      }
  
      function openApp(appName) {
        if (appName === 'camera') {
          router.push('/camera')
        } else if (appName === 'browser') {
          router.push('/browser') // Изменяем на навигацию по маршруту
        } else {
          alert(`Приложение "${appName}" в разработке!`)
        }
      }
  
      return { openApp, spawnMultipleBalls }
    }
  }
  </script>
  
  <style scoped>
  .home-screen {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    padding: 15px;
    color: white;
  }
  
  .app-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .app-icon:hover {
    transform: scale(1.1);
  }
  
  .app-icon div {
    width: 60px;
    height: 60px;
    background: var(--secondary-color);
    border-radius: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 28px;
  }
  </style>
  