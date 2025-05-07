<template>
    <div class="store-container">
      <div class="store-header">
        <h2>Мобильный Магазин</h2>
        <div class="cart-indicator" @click="showCart = !showCart">
          🛒 {{ cartItems.length }}
        </div>
      </div>
  
      <div class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <img :src="product.image" class="product-image" />
          <h3>{{ product.name }}</h3>
          <p>{{ product.price }} ₽</p>
          <button @click="spawnMultipleBalls(5)">Заказать</button>
        </div>
      </div>
  
      <div v-if="showCart" class="cart-overlay">
        <div class="cart-content">
          <h3>Ваша корзина</h3>
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <img :src="item.image" class="cart-item-image" />
            <div class="cart-item-info">
              <p>{{ item.name }}</p>
              <p>Количество: {{ item.quantity }}</p>
            </div>
            <button @click="removeFromCart(item.id)">×</button>
          </div>
          <button class="checkout-btn" @click="checkout">Оформить заказ</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  
  export default {
    setup() {
            const showCart = ref(false)
    const cartItems = ref([])
    
      const products = ref([
        { id: 1, name: 'Смартфон', price: 29999, image: '/images/phone.png' },
        { id: 2, name: 'Наушники', price: 7999, image: '/images/headphones.png' },
        { id: 3, name: 'Чехол', price: 1499, image: '/images/case.png' },
      ])
  
      // Функция спавна шаров
      function spawnMultipleBalls(count) {
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            // Предполагаемый вызов внешнего API mp
            if (true) {
              window.mp.trigger('spawnBallNearby')
            } else {
              console.log('spawnObjectNearby triggered', false)
            }
          }, i * 500)
        }
      }
  

      return { 
        spawnMultipleBalls,
        products,
      cartItems,
      showCart,
      }
    }
  }
  </script>
  
  <style scoped>
  .store-container {
    padding: 20px;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }
  
  .store-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .product-card {
    background: rgba(255, 255, 255, 0.9);
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    text-align: center;
  }
  
  .product-image {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }
  
  .cart-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .cart-content {
    background: white;
    padding: 20px;
    border-radius: 15px;
    max-width: 400px;
    width: 90%;
  }
  
  .cart-item {
    display: flex;
    align-items: center;
    margin: 10px 0;
  }
  
  .cart-item-image {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
  
  .checkout-btn {
    background: #007aff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    margin-top: 15px;
    width: 100%;
  }
  </style>