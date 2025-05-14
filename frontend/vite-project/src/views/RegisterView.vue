<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">Регистрация</h2>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            class="form-input"
            placeholder="Введите email"
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
            placeholder="Придумайте пароль (минимум 6 символов)"
          >
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>

      <div class="auth-links">
        <router-link to="/login">Уже есть аккаунт? Войти</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
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
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        })

        const data = await response.json()
        
        if (!response.ok) throw new Error(data.message || 'Ошибка регистрации')
        
        this.$router.push('/login')
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.loading = false
      }
    },
    validateForm() {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errorMessage = 'Некорректный email'
        return false
      }
      
      if (this.form.password.length < 6) {
        this.errorMessage = 'Пароль должен быть не менее 6 символов'
        return false
      }
      
      return true
    }
  }
}
</script>