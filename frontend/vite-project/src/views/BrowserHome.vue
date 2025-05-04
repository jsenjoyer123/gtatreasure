<template>
    <div class="browser-home">
      <h2>Выберите раздел</h2>
      <div class="links">
        <router-link to="/browser/store" class="link-button">🛍️ Магазин</router-link>
        <router-link to="/browser/work" class="link-button">💼 Работа</router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'BrowserHome'
  }
  </script>
  
  <style scoped>
  .browser-home {
    padding: 20px;
    text-align: center;
    height: 100%;
  }
  
  .links {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 40px;
  }
  
  .link-button {
    background: rgba(0, 122, 255, 0.9);
    color: white;
    padding: 20px;
    border-radius: 15px;
    text-decoration: none;
    font-size: 18px;
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  
  .link-button:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
  }
  </style>