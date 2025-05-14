<template>
  <div class="upload-position">
    <h2>📤 Загрузка позиции</h2>
    <div class="upload-container">
      <!-- Здесь можно добавить форму загрузки -->
      <div class="upload-placeholder">
        <p>Перетащите файлы сюда или</p>
        <button class="upload-button">Выберите файл</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UploadPosition',
  // Можно добавить логику загрузки файлов
}
</script>

<style scoped>
.upload-position {
  padding: 20px;
  text-align: center;
}

.upload-container {
  margin-top: 30px;
  border: 2px dashed #007AFF;
  border-radius: 15px;
  padding: 40px 20px;
  background: rgba(0, 122, 255, 0.05);
}

.upload-placeholder {
  color: #666;
  font-size: 16px;
}

.upload-button {
  margin-top: 15px;
  padding: 12px 24px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-button:hover {
  background: #005ecb;
  transform: translateY(-1px);
}
</style>