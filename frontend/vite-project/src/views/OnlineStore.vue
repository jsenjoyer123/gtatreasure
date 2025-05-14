<template>
  <div class="store-container">
    <div class="store-header">
      <h2>Мастер позции</h2>
      <div class="header-controls">
        <div class="category-filter">
          <button
            v-for="category in categories"
            :key="category"
            @click="changeCategory(category)"
            :class="{ active: selectedCategory === category }"
          >
            {{ category }}
          </button>
        </div>
        <div class="cart-indicator" @click="showCart = !showCart">
          🛒 {{ cartItems.length }}
        </div>
      </div>
    </div>

    <div class="product-grid">
      <div 
        class="product-card"
        v-for="product in filteredProducts"
        :key="product.id"
      >
        <img 
          :src="product.image" 
          :alt="product.name"
          class="product-image"
        />
        <h3 class="product-title">{{ product.name }}</h3>
        <p class="description">{{ product.description }}</p>
        
        <div class="product-details">
          <p>⚖️ {{ product.weight.toLocaleString() }} г</p>
          <p>📍 Р-н {{ product.district }}</p>
          <p>🛒 {{ product.stock }} шт.</p>
        </div>

        <div class="price-row">
          <span class="price">₽{{ product.price.toLocaleString() }}</span>
          <button 
            class="order-btn"
            @click="addToCart(product)"
          >
            В корзину
          </button>
        </div>
      </div>
    </div>

    <!-- Корзина -->
    <div v-if="showCart" class="cart-overlay">
      <div class="cart-content">
        <h3>Ваша корзина</h3>
        
        <div 
          v-for="item in cartItems" 
          :key="item.id" 
          class="cart-item"
        >
          <img 
            :src="item.image" 
            :alt="item.name"
            class="cart-item-image"
          />
          <div class="cart-item-info">
            <p class="cart-item-title">{{ item.name }}</p>
            <p>Количество: {{ item.quantity }}</p>
          </div>
          <button 
            class="remove-btn"
            @click="removeFromCart(item.id)"
          >
            ×
          </button>
        </div>
        
        <button 
          class="checkout-btn" 
          @click="checkout"
        >
          Оформить заказ
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCatalog',
  data() {
    return {
      selectedCategory: 'Электроника',
      categories: ['Электроника', 'Мебель', 'Одежда', 'Книги', 'Спорт'],
      showCart: false,
      cartItems: [],
      products: [
  // Электроника
  { 
    name: 'Игровой ноутбук ASUS ROG',
    price: 149990,
    weight: 2500,
    stock: 10,
    district: 'Центральный',
    category: 'Электроника',
    description: 'RTX 4080, 32GB DDR5, 1TB SSD, 17.3" 240Hz',
    image: 'https://loremflickr.com/400/300/laptop?lock=1'
  },
  {
    name: 'Смартфон iPhone 15 Pro',
    price: 99990,
    weight: 187,
    stock: 15,
    district: 'Северный',
    category: 'Электроника',
    description: '6.1" OLED, A17 Bionic, 256GB',
    image: 'https://loremflickr.com/400/300/phone?lock=2'
  },
  {
    name: 'Наушники Sony WH-1000XM5',
    price: 29990,
    weight: 250,
    stock: 8,
    district: 'Западный',
    category: 'Электроника',
    description: 'Беспроводные с шумоподавлением',
    image: 'https://loremflickr.com/400/300/headphones?lock=3'
  },

  // Мебель
  {
    name: 'Угловой диван "Милан"',
    price: 65990,
    weight: 85000,
    stock: 3,
    district: 'Южный',
    category: 'Мебель',
    description: 'Кожаная обивка, модульная система',
    image: 'https://loremflickr.com/400/300/sofa?lock=4'
  },
  {
    name: 'Офисный стол "Престиж"',
    price: 18990,
    weight: 15000,
    stock: 7,
    district: 'Центральный',
    category: 'Мебель',
    description: 'Стеклянная столешница, металлический каркас',
    image: 'https://loremflickr.com/400/300/desk?lock=5'
  },
  {
    name: 'Книжный шкаф "Винтаж"',
    price: 23490,
    weight: 32000,
    stock: 2,
    district: 'Восточный',
    category: 'Мебель',
    description: 'Дуб, 4 секции, витражные стекла',
    image: 'https://loremflickr.com/400/300/bookshelf?lock=6'
  },

  // Одежда
  {
    name: 'Зимняя куртка Canada Goose',
    price: 89990,
    weight: 1300,
    stock: 5,
    district: 'Северный',
    category: 'Одежда',
    description: 'Пуховая, ветрозащитная, размеры 48-56',
    image: 'https://loremflickr.com/400/300/jacket?lock=7'
  },
  {
    name: 'Джинсы Levi\'s 501',
    price: 7990,
    weight: 450,
    stock: 12,
    district: 'Центральный',
    category: 'Одежда',
    description: 'Классический крой, сырой деним',
    image: 'https://loremflickr.com/400/300/jeans?lock=8'
  },
  {
    name: 'Вечернее платье Gucci',
    price: 120000,
    weight: 800,
    stock: 1,
    district: 'Западный',
    category: 'Одежда',
    description: 'Шёлковое, ручная вышивка',
    image: 'https://loremflickr.com/400/300/dress?lock=9'
  },

  // Книги
  {
    name: '1984 - Джордж Оруэлл',
    price: 890,
    weight: 350,
    stock: 20,
    district: 'Восточный',
    category: 'Книги',
    description: 'Антиутопия, новое переводное издание',
    image: 'https://loremflickr.com/400/300/book?lock=10'
  },
  {
    name: 'Властелин Колец - Полное собрание',
    price: 4590,
    weight: 2100,
    stock: 6,
    district: 'Южный',
    category: 'Книги',
    description: 'Подарочное издание с иллюстрациями',
    image: 'https://loremflickr.com/400/300/lotr?lock=11'
  },
  {
    name: 'Краткая история времени - Хокинг',
    price: 1290,
    weight: 480,
    stock: 9,
    district: 'Центральный',
    category: 'Книги',
    description: 'Популярная наука о космологии',
    image: 'https://loremflickr.com/400/300/science?lock=12'
  },

  // Спорт
  {
    name: 'Горный велосипед Stern',
    price: 75990,
    weight: 14500,
    stock: 4,
    district: 'Северный',
    category: 'Спорт',
    description: '29" колёса, алюминиевая рама',
    image: 'https://loremflickr.com/400/300/bicycle?lock=13'
  },
  {
    name: 'Набор гантелей 20 кг',
    price: 3490,
    weight: 20000,
    stock: 8,
    district: 'Восточный',
    category: 'Спорт',
    description: 'Регулируемый вес, прорезиненные диски',
    image: 'https://loremflickr.com/400/300/dumbbell?lock=14'
  },
  {
    name: 'Кроссовки Nike Air Max',
    price: 12990,
    weight: 320,
    stock: 11,
    district: 'Центральный',
    category: 'Спорт',
    description: 'Беговые, амортизация Air',
    image: 'https://loremflickr.com/400/300/sneakers?lock=15'
  }
].map((p, index) => ({
  ...p,
  tempId: `temp${index + 1}`, // Генерация читаемых временных ID
  serverId: null
}))
    }
  },
  computed: {
    filteredProducts() {
      return this.products.filter(p => p.category === this.selectedCategory)
    }
  },
  methods: {
    async loadProducts() {
      try {
        // Пример запроса к API
        const response = await fetch('/api/products')
        const serverProducts = await response.json()
        
        // Синхронизация с серверными данными
        this.products = this.products.map(localProduct => {
          const serverData = serverProducts.find(sp => sp.tempId === localProduct.tempId)
          return serverData ? { ...localProduct, ...serverData } : localProduct
        })
      } catch (error) {
        console.error('Ошибка загрузки продуктов:', error)
      }
    },

    changeCategory(category) {
      this.selectedCategory = category
    },

    addToCart(product) {
      const existingItem = this.cartItems.find(item => item.tempId === product.tempId)
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.cartItems.push({
          ...product,
          quantity: 1
        })
      }
    },

    removeFromCart(tempId) {
      this.cartItems = this.cartItems.filter(item => item.tempId !== tempId)
    },

    checkout() {
      // Отправка на сервер с использованием serverId
      const orderData = {
        items: this.cartItems.map(item => ({
          productId: item.serverId, // Используем серверный ID
          quantity: item.quantity
        }))
      }

      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      .then(() => {
        alert('Заказ успешно оформлен!')
        this.cartItems = []
        this.showCart = false
      })
      .catch(error => {
        console.error('Ошибка оформления заказа:', error)
        alert('Ошибка при оформлении заказа')
      })
    },

    getImageUrl(product) {
      // Прежняя реализация без изменений
      const tags = {
        'Электроника': 'electronics',
        'Мебель': 'furniture',
        'Одежда': 'clothes',
        'Книги': 'books',
        'Спорт': 'sport'
      }
      const tag = tags[product.category] || 'product'
      return `https://loremflickr.com/400/300/${tag}?lock=${product.tempId}`
    }
  },
  mounted() {
    this.loadProducts()
  }
}
</script>

<style scoped>
.store-container {
  padding: 20px;
  background: #ffffff;
  font-family: 'Arial', sans-serif;
}

.store-header {
  max-width: 1800px;
  margin: 0 auto 30px;
  padding: 0 20px;
}

h2 {
  font-size: 2.4em;
  color: #2c3e50;
  margin: 0 0 25px;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-filter {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.category-filter button {
  padding: 12px 28px;
  border: 2px solid #e0e3e9;
  border-radius: 30px;
  background: #fff;
  font-size: 1em;
  transition: all 0.2s;
  cursor: pointer;
}

.category-filter button.active {
  background: #007aff;
  border-color: #007aff;
  color: white;
}

.cart-indicator {
  padding: 12px 28px;
  border: 2px solid #e0e3e9;
  border-radius: 30px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.cart-indicator:hover {
  border-color: #007aff;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 20px;
}

.product-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-3px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
  padding: 10px;
  margin-bottom: 15px;
}

.product-title {
  font-size: 1.2em;
  margin: 0 0 10px;
  color: #1a1a1a;
  line-height: 1.4;
}

.description {
  font-size: 0.9em;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
}

.product-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  font-size: 0.9em;
  color: #666;
  margin: 15px 0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.price {
  font-size: 1.4em;
  color: #007aff;
  font-weight: 700;
}

.order-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95em;
  cursor: pointer;
  transition: background 0.2s;
}

.order-btn:hover {
  background: #005fcc;
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
  padding: 25px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.cart-item-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.remove-btn {
  background: #ff3b30;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.checkout-btn {
  background: #34c759;
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 8px;
  width: 100%;
  margin-top: 20px;
  font-size: 1.1em;
  cursor: pointer;
}

@media (max-width: 1600px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  .category-filter {
    gap: 10px;
  }
  
  .category-filter button {
    padding: 10px 20px;
    font-size: 0.9em;
  }
}

@media (max-width: 480px) {
  h2 {
    font-size: 1.8em;
  }
  
  .product-details {
    grid-template-columns: 1fr;
  }
}
</style>