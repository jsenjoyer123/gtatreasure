<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">Авторизация</h2>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            class="form-input"
            placeholder="Введите ваш email"
          >
        </div>

        <div class="form-group">
          <label for="password">Пароль:</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            class="form-input"
            placeholder="Введите пароль"
          >
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Загрузка...' : 'Войти' }}
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>

      <div class="auth-links">
        <router-link to="/register">Создать аккаунт</router-link>
<!--        <router-link to="/forgot-password">Забыли пароль?</router-link>-->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthPage',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.validateForm()) return
      
      this.loading = true
      this.errorMessage = ''

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${baseUrl}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.form),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Ошибка авторизации');
        }

        // Сохраняем данные пользователя
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Перенаправление
        this.$router.push('/');
        
      } catch (error) {
        this.errorMessage = error.message || 'Ошибка при авторизации';
      } finally {
        this.loading = false
      }
    },
    validateForm() {
      this.errorMessage = '';
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errorMessage = 'Введите корректный email';
        return false;
      }
      
      if (this.form.password.length < 6) {
        this.errorMessage = 'Пароль должен содержать минимум 6 символов';
        return false;
      }
      
      return true;
    }
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1rem;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  width: 100%;
  max-width: 440px;
  transform: translateY(0);
  animation: cardEntrance 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transition: transform 0.3s ease;
}

.auth-card:hover {
  transform: translateY(-2px);
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #2d3436;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #636e72;
  font-size: 0.95rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #dfe6e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  box-sizing: border-box; /* Добавлено */
}

.form-input:focus {
  outline: none;
  border-color: #74b9ff;
  background: white;
  box-shadow: 0 4px 6px rgba(116, 185, 255, 0.15);
}

.form-input::placeholder {
  color: #b2bec3;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  box-sizing: border-box; /* Добавлено */
  border: 2px solid transparent; /* Добавлено */
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(116, 185, 255, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: #b2bec3;
  cursor: not-allowed;
  opacity: 0.9;
}

.error-message {
  color: #d63031;
  margin-top: 1.5rem;
  text-align: center;
  padding: 0.8rem;
  background: rgba(214, 48, 49, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(214, 48, 49, 0.2);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-message::before {
  content: "!";
  display: inline-block;
  width: 20px;
  height: 20px;
  background: #d63031;
  color: white;
  border-radius: 50%;
  text-align: center;
  font-weight: bold;
  line-height: 20px;
}

.auth-links {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}

.auth-links a {
  color: #0984e3;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  padding: 0.3rem;
  border-radius: 4px;
}

.auth-links a:hover {
  color: #74b9ff;
  background: rgba(116, 185, 255, 0.1);
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
    border-radius: 12px;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
  
  .form-input,
  .submit-btn {
    padding: 0.9rem;
  }
}
</style>