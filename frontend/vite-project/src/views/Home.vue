<template>
  <div class="home-screen">
    <div class="app-icon" @click="openApp('browser')">
      <div>🌐</div>
      <span>Браузер</span>
    </div>
    <div class="app-icon" @click="openApp('gallery')">
      <div>🖼️</div>
      <span>Галерея</span>
    </div>
    <div class="app-icon" @click="openApp('camera')">
      <div>📷</div>
      <span>Камера</span>
    </div>
    <div class="app-icon" @click="spawnBallsAtCustomPosition">
      <div>🔵</div>
      <span>Dev: Спавн мячей</span>
    </div>
  </div>

  <!-- Custom spawn controls -->
  <div class="custom-spawn">
    <input v-model="customX" type="number" placeholder="X" />
    <input v-model="customY" type="number" placeholder="Y" />
    <input v-model="customZ" type="number" placeholder="Z" />
    <button @click="spawnBallAtCustom">Spawn Custom Ball</button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

export default {
  setup() {
    const router = useRouter()

    // Поля для кастомных координат
    const customX = ref(0)
    const customY = ref(0)
    const customZ = ref(0)

    function spawnBallAtCustom() {
      console.log(`[VUE] Спавн мяча в кастомной позиции: x=${customX.value}, y=${customY.value}, z=${customZ.value}`)
      if (window.mp && window.mp.trigger) {
        window.mp.trigger('spawnBallAtCustomPosition', Number(customX.value), Number(customY.value), Number(customZ.value))
        window.mp.trigger('chatPush', `Создаем мяч в: ${customX.value}, ${customY.value}, ${customZ.value}`)
      }
    }

    // Предустановленные позиции для спавна
    const predefinedPositions = [
      { x: -1065, y: -3425, z: 15 }, // Рядом с точкой спавна игрока
      { x: -1070, y: -3430, z: 15 }, // Немного в стороне
      { x: -1060, y: -3420, z: 15 }, // Другая сторона
      { x: -1075, y: -3435, z: 15 }, // Дальше от игрока
      { x: -1055, y: -3415, z: 15 }  // Еще одна позиция
    ];

    function spawnBallsAtCustomPosition() {
      console.log('[VUE] Нажата кнопка спавна мячей');

      if (window.mp && window.mp.trigger) {
        console.log('[VUE] RAGE MP доступен, отправляем события...');
        // Спавним мячи в предустановленных позициях с задержкой
        predefinedPositions.forEach((pos, index) => {
          setTimeout(() => {
            console.log(`[VUE] Отправляем событие для мяча ${index + 1}: x=${pos.x}, y=${pos.y}, z=${pos.z}`);
            window.mp.trigger('spawnBallAtCustomPosition', pos.x, pos.y, pos.z);
          }, index * 300); // Задержка между спавнами
        });

        // Показываем уведомление пользователю
        if (window.mp.trigger) {
          setTimeout(() => {
            window.mp.trigger('chatPush', `Создаем ${predefinedPositions.length} мячей в разных позициях...`);
          }, 100);
        }
      } else {
        // Для тестирования без RAGE MP
        console.log('[VUE] RAGE MP недоступен, имитация спавна мячей:');
        predefinedPositions.forEach((pos, index) => {
          console.log(`Мяч ${index + 1}: x=${pos.x}, y=${pos.y}, z=${pos.z}`);
        });
        alert(`Спавн ${predefinedPositions.length} мячей (тестовый режим)`);
      }
    }

    // Альтернативная функция для случайных позиций (можно использовать позже)
    function spawnBallsRandomly(count = 5) {
      console.log('[VUE] Запуск случайного спавна мячей');
      const baseX = -1069;
      const baseY = -3427;
      const baseZ = 15;
      const radius = 20; // Радиус разброса

      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const randomX = baseX + (Math.random() - 0.5) * radius * 2;
          const randomY = baseY + (Math.random() - 0.5) * radius * 2;
          const randomZ = baseZ + Math.random() * 5; // Высота от 15 до 20

          if (window.mp && window.mp.trigger) {
            console.log(`[VUE] Случайный мяч ${i + 1}: x=${randomX.toFixed(1)}, y=${randomY.toFixed(1)}, z=${randomZ.toFixed(1)}`);
            window.mp.trigger('spawnBallAtCustomPosition', randomX, randomY, randomZ);
          } else {
            console.log(`Случайный мяч ${i + 1}: x=${randomX.toFixed(1)}, y=${randomY.toFixed(1)}, z=${randomZ.toFixed(1)}`);
          }
        }, i * 200);
      }
    }

    function openApp(appName) {
      console.log(`[VUE] Открытие приложения: ${appName}`);
      if (appName === 'camera') {
        router.push('/camera')
      } else if (appName === 'browser') {
        router.push('/browser')
      } else {
        alert(`Приложение "${appName}" в разработке!`)
      }
    }

    return {
      openApp,
      spawnBallsAtCustomPosition,
      spawnBallsRandomly,
      spawnBallAtCustom,
      customX,
      customY,
      customZ
    }
  }
}
</script>

<style scoped>
.home-screen {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 15px;
  color: white;
}

.app-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: transform 0.2s;
}

.app-icon:hover {
  transform: scale(1.1);
}

.app-icon div {
  width: 60px;
  height: 60px;
  background: var(--secondary-color);
  border-radius: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
}

.app-icon span {
  font-size: 12px;
  text-align: center;
}
</style>