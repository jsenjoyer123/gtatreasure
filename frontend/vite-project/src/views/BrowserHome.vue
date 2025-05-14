<template>
  <div class="browser-home">
    <h2>Выберите раздел</h2>
    <div class="links">
      <router-link to="/browser/store" class="link-button">💼 Мастер позиции</router-link>
      <router-link to="/browser/work" class="link-button">🛍️ Магазин</router-link>
      <router-link to="/browser/upload" class="link-button">⬆️ Загрузить позицию</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BrowserHome',
  methods: {
    uploadPosition() {
      // Реализуйте логику загрузки позиции здесь
      console.log('Инициализация загрузки позиции...');
      // Можно добавить:
      // - Открытие модального окна
      // - Выбор файла через input
      // - Интеграцию с API
      this.$emit('upload-requested');
    }
  }
}
</script>

<style scoped>
.browser-home {
  padding: 20px;
  text-align: center;
  height: 100%;
  background: #f8f9fa;
}

h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.links {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 40px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  width: 100%; /* Добавлено */
  padding: 0 20px; /* Добавлено */
  box-sizing: border-box; /* Добавлено */
}

/* Общие стили для всех типов кнопок */
.link-button {
  background: linear-gradient(135deg, #007AFF 0%, #0040FF 100%);
  color: white;
  padding: 20px 24px;
  border-radius: 14px;
  font-size: 17px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0,0,0,0.08);
  border: none;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.5;
  min-height: 60px;
  position: relative;
  overflow: hidden;
  backface-visibility: hidden;
  box-sizing: border-box; /* Добавлено */
}

/* Остальные стили без изменений */
.link-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.15);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.link-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 122, 255, 0.25);
}

.link-button:hover::after {
  opacity: 1;
}

.link-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.3);
}

a.link-button {
  display: flex;
}

button.link-button {
  letter-spacing: 0.02em;
}

.link-button > :first-child {
  font-size: 20px;
  margin-right: 4px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
}
</style>