
// freeroam/ballSystem.js
let playerData = {
    inventory: 0,
    count: 0
};

// Функция для включения визуальных эффектов опьянения
function enableDrunkVisuals(duration = 30000) {
    const visualModifier = "spectator5";
    mp.game.graphics.setTimecycleModifier(visualModifier);
    mp.game.graphics.setTimecycleModifierStrength(0.8);
    mp.game.cam.shakeGameplayCam("DRUNK_SHAKE", 1.0);

    setTimeout(() => {
        mp.game.graphics.clearTimecycleModifier();
        mp.game.cam.stopGameplayCamShaking(true);
    }, duration);
}

exports.initBallSystem = () => {
    console.log('[CLIENT] Инициализация системы мячей...');

    // Обработка нажатия клавиш
    mp.keys.bind(0x58, true, () => {
        console.log('[CLIENT] Нажата клавиша X - создание мяча');
        mp.events.callRemote('spawnObjectNearby', true);
    }); // X

    mp.keys.bind(0x50, true, () => {
        console.log('[CLIENT] Нажата клавиша P - поедание мяча');
        // Проверка наличия мячей локально для мгновенной обратной связи
        if (playerData.inventory > 0) {
            mp.events.callRemote('eatBall');
        } else {
            mp.gui.chat.push('У вас нет мячей для употребления!');
        }
    }); // P

    // ИСПРАВЛЕННЫЙ обработчик для спавна в кастомной позиции
    mp.events.add('spawnBallAtCustomPosition', (x, y, z) => {
        console.log(`[CLIENT] Получен запрос на спавн мяча в позиции: ${x}, ${y}, ${z}`);

        // Проверяем, что координаты валидны
        if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
            console.error('[CLIENT] Неверные координаты для спавна мяча:', { x, y, z });
            return;
        }

        // Отправляем событие на сервер
        mp.events.callRemote('spawnBallAtPosition', x, y, z);
        mp.gui.chat.push(`Запрос на создание мяча в: ${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}`);
    });

    // НОВЫЙ обработчик для заказов из веб-интерфейса
    mp.events.add('webPurchaseCompleted', (productData) => {
        console.log('[CLIENT] Получено уведомление о покупке из веб-интерфейса:', productData);

        try {
            // Парсим данные товара, если это строка
            let product = productData;
            if (typeof productData === 'string') {
                product = JSON.parse(productData);
            }

            // Отправляем данные на сервер для обработки заказа
            mp.events.callRemote('processPurchase', product);

            // Показываем уведомление в чате
            mp.gui.chat.push(`🛒 Заказ "${product.name}" отправлен на обработку...`);

        } catch (error) {
            console.error('[CLIENT] Ошибка при обработке покупки:', error);
            mp.gui.chat.push('❌ Ошибка при обработке заказа!');
        }
    });

    // Обработчик для отправки сообщений в чат из браузера
    mp.events.add('chatPush', (message) => {
        mp.gui.chat.push(message);
    });

    // Обновление интерфейса
    mp.events.add('updateInventory', (inventory, count) => {
        console.log(`[CLIENT] Обновление инвентаря: мячей=${inventory}, собрано=${count}`);
        playerData.inventory = inventory;
        playerData.count = count;
        mp.gui.chat.push(`Мячей: ${inventory} | Собрано: ${count}`);
        mp.players.local.setVariable('inventory', inventory);
    });

    // Сбор мяча
    mp.events.add('clientCollectBall', async (ballId) => {
        console.log(`[CLIENT] Начинаем анимацию сбора мяча ID: ${ballId}`);
        const ball = mp.objects.at(ballId);
        if (!ball) {
            console.error(`[CLIENT] Мяч с ID ${ballId} не найден`);
            return;
        }

        const animDict = 'pickup_object';
        mp.game.streaming.requestAnimDict(animDict);

        while (!mp.game.streaming.hasAnimDictLoaded(animDict)) {
            await mp.game.waitAsync(100);
        }

        mp.players.local.taskPlayAnim(
            animDict,
            'putdown_low',
            8.0,
            -8.0,
            1000,
            1,
            0,
            false,
            false,
            false
        );

        mp.game.graphics.startParticleFxNonLoopedOnEntity(
            'scr_pickup_health',
            ball.handle,
            0, 0, 0,
            0, 0, 0,
            1.0,
            false, false, false
        );
    });

    // Анимация поедания
    mp.events.add('playEatAnimation', async () => {
        console.log('[CLIENT] Начинаем анимацию поедания мяча');
        const animDict = 'mp_suicide';
        mp.game.streaming.requestAnimDict(animDict);

        while (!mp.game.streaming.hasAnimDictLoaded(animDict)) {
            await mp.game.waitAsync(100);
        }

        mp.players.local.taskPlayAnim(
            animDict,
            'pill',
            8.0,
            -8.0,
            2500,
            1,
            0,
            false,
            false,
            false
        );

        mp.game.graphics.startParticleFxNonLoopedOnEntity(
            'scr_fbi_falling_debris',
            mp.players.local.handle,
            0, 0, 0,
            0, 0, 0,
            1.0,
            false, false, false
        );
        enableDrunkVisuals(120000);
    });

    console.log('[CLIENT] Система мячей инициализирована успешно');
};