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
            <span class="weight">⚖️ {{ product.weight.toLocaleString() }} г</span>
            <span class="district">📍 Р-н {{ product.district }}</span>
          </div>

          <div class="price-row">
            <span class="price">₽ {{ product.price.toLocaleString() }}</span>
            <button
                class="buy-btn"
                @click="buyProduct(product)"
            >
              Купить
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
      products: [],
      isLoading: false,
      error: null
    }
  },
  computed: {
    filteredProducts() {
      return this.products.filter(p => p.category === this.selectedCategory)
    }
  },
  methods: {
    async loadProducts() {
      this.isLoading = true;
      this.error = null;

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        // Кодируем категорию для URL
        const encodedCategory = encodeURIComponent(this.selectedCategory);
        const url = `${baseUrl}/api/products/category/${encodedCategory}`;

        console.log('Начало загрузки данных');
        console.log('URL запроса:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // Убираем credentials, так как они не нужны для получения товаров
          // credentials: 'include'
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Ошибка ответа:', text);
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const serverProducts = await response.json();
        console.log('Полученные данные:', serverProducts);

        this.products = serverProducts;

      } catch (error) {
        console.error('Подробная ошибка:', error);
        this.error = `Не удалось загрузить товары: ${error.message}`;
      } finally {
        this.isLoading = false;
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

    async changeCategory(category) {
      this.selectedCategory = category;
      // При смене категории загружаем соответствующие товары
      await this.loadProducts();
    },

    async buyProduct(product) {
      try {
        // Показываем подтверждение покупки
        if (!confirm(`Подтвердите покупку товара "${product.name}" за ${product.price.toLocaleString()} ₽`)) {
          return;
        }

        // Получаем ID пользователя из локального хранилища (если авторизован)
        const userId = localStorage.getItem('userId');

        // Добавим абсолютный URL для бэкенда
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        // Запрос к API для обработки покупки
        const response = await fetch(`${baseUrl}/api/purchase`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            productId: product.serverId || product.tempId,
            quantity: 1,
            userId: userId // Передаем ID пользователя, если он авторизован
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Ответ сервера:', errorText);
          throw new Error('Ошибка при выполнении покупки');
        }

        const result = await response.json();

        // Показываем уведомление об успешной покупке
        alert(`Спасибо за покупку! Товар "${product.name}" успешно оплачен.\nНомер заказа: ${result.purchaseId}`);

        // Отправляем событие о успешной покупке
        this.$emit('purchase-completed', {
          product,
          purchaseId: result.purchaseId
        });

      } catch (error) {
        console.error('Ошибка при покупке:', error);
        alert(`Произошла ошибка при оформлении покупки: ${error.message || 'Пожалуйста, попробуйте позже.'}`);
      }
    }
  },
  async mounted() {
    // Загружаем товары при монтировании компонента
    await this.loadProducts();
  },
  watch: {
    // Если на странице товаров нет, это может означать, что нужно обновить список
    filteredProducts(newValue) {
      if (newValue.length === 0 && !this.isLoading) {
        this.loadProducts();
      }
    }
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
  background: #007aff;
  border-color: #007aff;
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
  color: #007aff;
}

.buy-btn {
  background: #007aff;
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