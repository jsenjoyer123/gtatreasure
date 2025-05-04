<template>
  <div class="camera-ui">
    <video ref="cameraPreview" autoplay playsinline></video>
    <div class="camera-controls">
      <div class="control-btn switch-camera" @click="switchCamera">↻</div>
      <div class="camera-button" @click="takePhoto">камера</div>
      <div class="control-btn gallery-btn" @click="openGallery">🖼️</div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const cameraPreview = ref(null); // Объявляем cameraPreview

    function takePhoto() {
      // Правильный вызов клиентского события через CEF bridge
      if (window.mp?.trigger) {
        window.mp.trigger('doScrenshot'); // Измененное имя события
      }
      
      // Визуальные эффекты
      if (cameraPreview.value) {
        cameraPreview.value.style.filter = 'brightness(2)';
        setTimeout(() => {
          cameraPreview.value.style.filter = 'none';
        }, 200);
      }
    }

    // Возвращаем функции и переменные, чтобы они были доступны в шаблоне
    return {
      takePhoto,
      cameraPreview,
      // Не забудьте вернуть switchCamera и openGallery, если они определены
    }
  }
}
</script>


<style scoped>
.camera-ui {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.95;
  mix-blend-mode: multiply;
  filter: hue-rotate(5deg) contrast(1.05);
}

.camera-controls {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 30px;
  align-items: center;
  padding: 15px 25px;
  background: rgba(20, 20, 20, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.camera-button {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.camera-button:active {
  transform: scale(0.9);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.control-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(40, 40, 40, 0.6);
  backdrop-filter: blur(5px);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(60, 60, 60, 0.8);
}

.gallery-btn {
  font-size: 18px;
  padding-bottom: 2px;
}
</style>