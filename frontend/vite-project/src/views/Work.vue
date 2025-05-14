<template>
  <div class="products-container">
    <div class="products-header">
      <h2>Каталог товаров</h2>
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
    </div>

    <div class="product-grid">
      <div 
        class="product-card"
        v-for="product in filteredProducts"
        :key="product.tempId"
      >
        <div class="product-image">
          <img :src="product.image" :alt="product.name">
        </div>
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="description">{{ product.description }}</p>
          
          <div class="specs-row">
            <span class="weight">{{ product.weight.toLocaleString() }} г</span>
            <span class="district">Р-н {{ product.district }}</span>
          </div>

          <div class="price-row">
            <span class="price">₽ {{ product.price.toLocaleString() }}</span>
            <button 
              class="buy-btn"
              @click="addToCart(product)"
            >
              В корзину
            </button>
          </div>
        </div>
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
      products: [
  // Электроника (10 товаров)
  { 
    name: 'Игровой ноутбук ASUS ROG',
    price: 149990,
    weight: 2500,
    district: 'Центральный',
    category: 'Электроника',
    description: 'RTX 4080, 32GB DDR5, 1TB SSD, 17.3" 240Hz'
  },
  {
    name: 'Смартфон iPhone 15 Pro',
    price: 99990,
    weight: 187,
    district: 'Северный',
    category: 'Электроника', 
    description: '6.1" OLED, A17 Bionic, 256GB'
  },
  {
    name: 'Умные часы Galaxy Watch 6',
    price: 29990,
    weight: 42,
    district: 'Западный',
    category: 'Электроника',
    description: 'AMOLED экран, мониторинг здоровья'
  },
  {
    name: 'Беспроводные наушники Sony',
    price: 21990,
    weight: 250,
    district: 'Восточный',
    category: 'Электроника',
    description: 'Шумоподавление, 30 часов работы'
  },
  {
    name: 'Электросамокат Xiaomi Pro',
    price: 45990,
    weight: 14200,
    district: 'Южный',
    category: 'Электроника',
    description: 'Запас хода 45 км, скорость 25 км/ч'
  },

  // Мебель (8 товаров)
  {
    name: 'Угловой диван "Милан"',
    price: 89990,
    weight: 85000,
    district: 'Центральный',
    category: 'Мебель',
    description: 'Кожаная обивка, модульная система'
  },
  {
    name: 'Рабочий стол "Modern"',
    price: 23490,
    weight: 15000,
    district: 'Северный',
    category: 'Мебель',
    description: 'Столешница из натурального дерева'
  },
  {
    name: 'Книжный шкаф "Винтаж"',
    price: 32990,
    weight: 32000,
    district: 'Западный',
    category: 'Мебель',
    description: '4 секции, витражные стекла'
  },

  // Одежда (7 товаров)
  {
    name: 'Зимняя куртка Canada Goose',
    price: 89990,
    weight: 1300,
    district: 'Восточный',
    category: 'Одежда',
    description: 'Пуховая, ветрозащитная, размеры 48-56'
  },
  {
    name: 'Кожаная куртка-косуха',
    price: 45990,
    weight: 850,
    district: 'Южный',
    category: 'Одежда',
    description: 'Натуральная кожа, размеры M-XXL'
  },
  {
    name: 'Футболка хлопковая Basic',
    price: 2990,
    weight: 220,
    district: 'Центральный',
    category: 'Одежда',
    description: '10 цветов, все размеры'
  },

  // Книги (5 товаров)
  {
    name: 'JavaScript. Полное руководство',
    price: 4590,
    weight: 850,
    district: 'Северный',
    category: 'Книги',
    description: '7-е издание Дэвида Флэнагана'
  },
  {
    name: 'Чистая архитектура',
    price: 3290,
    weight: 620,
    district: 'Западный',
    category: 'Книги',
    description: 'Роберт Мартин, 2022 год издания'
  },

  // Спорт (5 товаров)
  {
    name: 'Беговая дорожка ProForm',
    price: 129990,
    weight: 68000,
    district: 'Восточный',
    category: 'Спорт',
    description: 'Мощность 3.5 л.с., скорость до 20 км/ч'
  },
  {
    name: 'Гантели разборные 50 кг',
    price: 8990,
    weight: 25000,
    district: 'Южный',
    category: 'Спорт',
    description: 'Резиновое покрытие, 6 дисков'
  }
].map((p, index) => ({
  ...p,
  tempId: `temp-${Date.now()}-${index}`,
  serverId: null,
  image: this.generateImageUrl(p.category, index)
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
        const response = await fetch('/api/products')
        const serverProducts = await response.json()
        
        this.products = this.products.map(localProduct => {
          const serverData = serverProducts.find(sp => sp.tempId === localProduct.tempId)
          return serverData ? { ...localProduct, ...serverData } : localProduct
        })
      } catch (error) {
        console.error('Ошибка загрузки:', error)
      }
    },

    generateImageUrl(category, index) {
      const tags = {
        'Электроника': 'electronics',
        'Мебель': 'furniture',
        'Одежда': 'clothes',
        'Книги': 'books',
        'Спорт': 'sport'
      }
      return `https://loremflickr.com/400/300/${tags[category]}?lock=${index}`
    },

    changeCategory(category) {
      this.selectedCategory = category
    },

    addToCart(product) {
      this.$emit('add-to-cart', {
        tempId: product.tempId,
        serverId: product.serverId,
        ...product
      })
    }
  },
  mounted() {
    this.loadProducts()
  }
}
</script>

<style scoped>
.products-container {
  width: 100%;
  max-width: 2560px;
  margin: 0 auto;
  padding: 40px 20px;
  background: #f5f6fa;
  box-sizing: border-box;
}

.products-header {
  max-width: 1800px;
  margin: 0 auto 30px;
  padding: 0 20px;
}

h2 {
  font-size: 2.4em;
  color: #2c3e50;
  margin: 0 0 25px;
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
  background: #27ae60;
  border-color: #27ae60;
  color: white;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 25px;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 20px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-3px);
}

.product-image {
  height: 220px;
  flex-shrink: 0;
  border-bottom: 1px solid #eee;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.product-info h3 {
  font-size: 1.1em;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
}

.description {
  font-size: 0.88em;
  color: #666;
  line-height: 1.5;
  margin: 0;
  flex-grow: 1;
}

.specs-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82em;
  color: #888;
  margin-top: 10px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.price {
  font-size: 1.3em;
  font-weight: 700;
  color: #27ae60;
}

.buy-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background 0.2s;
}

.buy-btn:hover {
  background: #219a52;
}

@media (max-width: 1920px) {
  .product-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1600px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1366px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .product-image {
    height: 200px;
  }
}

@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  h2 {
    font-size: 2em;
  }
}

@media (max-width: 480px) {
  .product-info {
    padding: 15px;
  }
  
  .price {
    font-size: 1.2em;
  }
  
  .buy-btn {
    padding: 7px 18px;
  }
}
</style>