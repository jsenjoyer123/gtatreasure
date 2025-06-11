// const markerPos = { x: -263.631591796875, y: 2195.6708984375, z: 128.47988891601562}
// mp.events.add('playerReady', (player) => {
//     player.call('playerInitLogistWork', [markerPos]);
// })

/* ==========================================================
 *  СИСТЕМА МЯЧЕЙ - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ
 * ========================================================== */

// Глобальные переменные для системы мячей
let balls = new Map(); // Хранилище мячей: { ballId: { ownerId, position, colshapeId } }
let playerBalls = new Map(); // Хранит данные игроков: { playerId: { inventory, count } }

// Предустановленные позиции для спавна мячей при заказах
const ORDER_SPAWN_POSITIONS = [
    { x: -1065, y: -3425, z: 15, name: "Позиция А" },
    { x: -1070, y: -3430, z: 15, name: "Позиция Б" },
    { x: -1060, y: -3420, z: 15, name: "Позиция В" },
    { x: -1075, y: -3435, z: 15, name: "Позиция Г" },
    { x: -1055, y: -3415, z: 15, name: "Позиция Д" },
    { x: -1080, y: -3440, z: 15, name: "Позиция Е" },
    { x: -1050, y: -3410, z: 15, name: "Позиция Ж" },
    { x: -1085, y: -3445, z: 15, name: "Позиция З" },
    { x: -1045, y: -3405, z: 15, name: "Позиция И" },
    { x: -1090, y: -3450, z: 15, name: "Позиция К" }
];

// Инициализация данных игрока при входе
mp.events.add('playerJoin', (player) => {
    playerBalls.set(player.id, {
        inventory: 5,
        count: 0 // Начинаем с 0 собранных мячей
    });
    console.log(`[BALL SYSTEM] Инициализированы данные для игрока ${player.name} (ID: ${player.id})`);

    // Отправляем начальные данные клиенту
    player.call('updateInventory', [5, 0]);
});

// Удаление данных при отключении
mp.events.add('playerQuit', (player) => {
    playerBalls.delete(player.id);
    console.log(`[BALL SYSTEM] Удалены данные игрока ${player.name} (ID: ${player.id})`);
});

// Обработка создания мяча
mp.events.add('spawnObjectNearby', (player, checkLimit = true, customPos = null) => {
    const playerData = playerBalls.get(player.id);
    if (!playerData) {
        console.log(`[BALL SYSTEM] Нет данных для игрока ${player.name} (ID: ${player.id})`);
        return;
    }

    // Проверка лимита инвентаря (только если checkLimit = true)
    if (checkLimit && playerData.inventory <= 0) {
        player.outputChatBox('У вас нет мячей для создания!');
        return;
    }

    // Определяем позицию спавна
    let spawnPos;
    if (customPos && Array.isArray(customPos)) {
        // Используем переданные координаты [x, y, z]
        spawnPos = new mp.Vector3(
            parseFloat(customPos[0]),
            parseFloat(customPos[1]),
            parseFloat(customPos[2])
        );

        // Античит-проверка (опционально - проверяем максимальное расстояние)
        const distance = Math.sqrt(
            Math.pow(spawnPos.x - player.position.x, 2) +
            Math.pow(spawnPos.y - player.position.y, 2) +
            Math.pow(spawnPos.z - player.position.z, 2)
        );

        if (distance > 1000.0) {
            player.outputChatBox('Слишком далеко от цели!');
            return;
        }
    } else {
        // Дефолтная позиция возле игрока
        const playerPos = player.position;
        spawnPos = new mp.Vector3(
            playerPos.x + 3,
            playerPos.y,
            playerPos.z
        );
    }

    try {
        // Создание объекта
        const ball = mp.objects.new(
            mp.joaat('prop_mp_drug_pack_blue'),
            spawnPos,
            { alpha: 255, dimension: player.dimension }
        );

        // Создаем коллайдер с увеличенным радиусом для удобства
        const colshape = mp.colshapes.newSphere(spawnPos.x, spawnPos.y, spawnPos.z, 2.5, player.dimension);
        colshape.ballId = ball.id;
        colshape.ballObject = ball;

        // Сохраняем информацию о мяче
        balls.set(ball.id, {
            ownerId: player.id,
            position: spawnPos,
            colshapeId: colshape.id
        });

        // Обновление инвентаря (только если проверяем лимит)
        if (checkLimit) {
            playerData.inventory--;
            playerBalls.set(player.id, playerData);
            player.call('updateInventory', [playerData.inventory, playerData.count]);
        }

        player.outputChatBox(`Мяч создан в позиции: ${spawnPos.x.toFixed(1)}, ${spawnPos.y.toFixed(1)}, ${spawnPos.z.toFixed(1)}`);
        console.log(`[BALL SYSTEM] Мяч создан игроком ${player.name} (ID: ${ball.id}) в позиции ${spawnPos.x}, ${spawnPos.y}, ${spawnPos.z}`);

    } catch (error) {
        console.error(`[BALL SYSTEM] Ошибка создания мяча:`, error);
        player.outputChatBox('Ошибка создания мяча!');
    }
});

// Обработчик для спавна в кастомной позиции (из браузера/телефона)
mp.events.add('spawnBallAtPosition', (player, x, y, z) => {
    console.log(`[BALL SYSTEM] Запрос на спавн мяча от ${player.name} в позиции: ${x}, ${y}, ${z}`);
    const customPos = [x, y, z];
    mp.events.call('spawnObjectNearby', player, false, customPos);
});

// НОВЫЙ обработчик для массового спавна мячей при заказе
mp.events.add('spawnOrderBalls', (player, quantity = 5) => {
    console.log(`[ORDER SYSTEM] Игрок ${player.name} заказал ${quantity} мячей`);

    // Ограничиваем количество мячей для производительности
    const maxBalls = Math.min(quantity, ORDER_SPAWN_POSITIONS.length);

    // Перемешиваем позиции для случайности
    const shuffledPositions = [...ORDER_SPAWN_POSITIONS].sort(() => Math.random() - 0.5);

    // Спавним мячи с задержкой
    for (let i = 0; i < maxBalls; i++) {
        setTimeout(() => {
            const position = shuffledPositions[i];
            const customPos = [position.x, position.y, position.z];

            // Спавним мяч без проверки лимита инвентаря
            mp.events.call('spawnObjectNearby', player, false, customPos);

            console.log(`[ORDER SYSTEM] Мяч ${i + 1}/${maxBalls} создан в ${position.name} (${position.x}, ${position.y}, ${position.z})`);

            // Уведомляем игрока
            if (i === 0) {
                player.outputChatBox(`🎾 Заказ принят! Создаем ${maxBalls} мячей в разных локациях...`);
            }
            if (i === maxBalls - 1) {
                player.outputChatBox(`✅ Заказ выполнен! Все ${maxBalls} мячей размещены на карте.`);
            }

        }, i * 300); // Задержка 300мс между спавнами
    }

    // Логируем статистику
    console.log(`[ORDER SYSTEM] Заказ игрока ${player.name} на ${maxBalls} мячей запущен`);
});

// Обработка сбора мяча
mp.events.add('collectBall', (player, ballId) => {
    const ballInfo = balls.get(ballId);
    if (!ballInfo) {
        console.log(`[BALL SYSTEM] Мяч с ID ${ballId} не найден в базе данных`);
        return;
    }

    // Получаем объект мяча
    const ball = mp.objects.at(ballId);
    if (ball) {
        ball.destroy();
        console.log(`[BALL SYSTEM] Мяч с ID ${ballId} уничтожен`);
    }

    // Обновляем данные СОБИРАЮЩЕГО игрока (не владельца мяча)
    let playerData = playerBalls.get(player.id);
    if (playerData) {
        playerData.inventory++;
        playerData.count++;
        playerBalls.set(player.id, playerData);
        player.call('updateInventory', [playerData.inventory, playerData.count]);
        player.outputChatBox(`Мяч собран! Всего мячей: ${playerData.inventory} | Собрано: ${playerData.count}`);
        console.log(`[BALL SYSTEM] Игрок ${player.name} собрал мяч. Инвентарь=${playerData.inventory}, собрано=${playerData.count}`);
    }

    // Удаляем мяч из базы данных
    balls.delete(ballId);
});

// КЛЮЧЕВОЙ ОБРАБОТЧИК - обработчик входа в коллайдер
mp.events.add('playerEnterColshape', (player, colshape) => {
    // Проверяем, является ли это коллайдером мяча
    if (colshape.ballId !== undefined) {
        console.log(`[BALL SYSTEM] Игрок ${player.name} вошел в зону мяча ID: ${colshape.ballId}`);

        // Проверяем, существует ли мяч
        const ball = mp.objects.at(colshape.ballId);
        if (ball) {
            // Дополнительная проверка расстояния для надежности
            const distance = Math.sqrt(
                Math.pow(ball.position.x - player.position.x, 2) +
                Math.pow(ball.position.y - player.position.y, 2) +
                Math.pow(ball.position.z - player.position.z, 2)
            );

            console.log(`[BALL SYSTEM] Расстояние до мяча: ${distance.toFixed(2)}`);

            if (distance < 4.0) { // Увеличиваем допустимое расстояние
                // Запускаем анимацию на клиенте
                player.call('clientCollectBall', [colshape.ballId]);

                // Собираем мяч на сервере
                mp.events.call('collectBall', player, colshape.ballId);

                // Уничтожаем коллайдер
                colshape.destroy();

                console.log(`[BALL SYSTEM] Мяч ${colshape.ballId} успешно собран игроком ${player.name}`);
            } else {
                console.log(`[BALL SYSTEM] Игрок ${player.name} слишком далеко от мяча (${distance.toFixed(2)}m)`);
            }
        } else {
            console.log(`[BALL SYSTEM] Мяч с ID ${colshape.ballId} не найден, удаляем коллайдер`);
            balls.delete(colshape.ballId);
            colshape.destroy();
        }
    }
});

// Обработка поедания мяча
mp.events.add('eatBall', (player) => {
    const playerData = playerBalls.get(player.id);
    if (!playerData || playerData.inventory <= 0) {
        player.outputChatBox('У вас нет мячей для употребления!');
        return;
    }

    // Уменьшаем количество мячей
    playerData.inventory--;
    playerBalls.set(player.id, playerData);

    // Обновляем клиент
    player.call('updateInventory', [playerData.inventory, playerData.count]);
    player.call('playEatAnimation');

    player.outputChatBox(`Вы съели мяч! Осталось: ${playerData.inventory}`);
    console.log(`[BALL SYSTEM] Игрок ${player.name} съел мяч. Остаток: ${playerData.inventory}`);
});

/* ==========================================================
 *  ОБРАБОТКА ЗАКАЗОВ ИЗ ВЕБ-ИНТЕРФЕЙСА
 * ========================================================== */

// Обработчик заказа товаров из браузера
mp.events.add('processPurchase', (player, productData) => {
    console.log(`[PURCHASE] Игрок ${player.name} оформил заказ:`, productData);

    try {
        // Парсим данные о товаре
        let product = productData;
        if (typeof productData === 'string') {
            product = JSON.parse(productData);
        }

        // Определяем количество мячей в зависимости от типа товара
        let ballCount = 1; // По умолчанию 1 мяч

        // Логика определения количества мячей по категориям
        switch (product.category) {
            case 'Электроника':
                ballCount = 3;
                break;
            case 'Мебель':
                ballCount = 5;
                break;
            case 'Одежда':
                ballCount = 2;
                break;
            case 'Книги':
                ballCount = 1;
                break;
            case 'Спорт':
                ballCount = 4;
                break;
            default:
                ballCount = Math.min(3, Math.max(1, Math.floor(product.price / 50000))); // 1 мяч за каждые 50k рублей
        }

        // Ограничиваем максимальное количество
        ballCount = Math.min(ballCount, ORDER_SPAWN_POSITIONS.length);

        // Уведомляем игрока о заказе
        player.outputChatBox(`📦 Заказ "${product.name}" принят к обработке!`);
        player.outputChatBox(`💰 Стоимость: ${product.price.toLocaleString()} ₽`);
        player.outputChatBox(`🎾 Количество мячей для сбора: ${ballCount}`);

        // Запускаем спавн мячей
        mp.events.call('spawnOrderBalls', player, ballCount);

        console.log(`[PURCHASE] Для игрока ${player.name} запущен спавн ${ballCount} мячей по заказу "${product.name}"`);

    } catch (error) {
        console.error(`[PURCHASE] Ошибка обработки заказа игрока ${player.name}:`, error);
        player.outputChatBox('❌ Ошибка при обработке заказа! Попробуйте еще раз.');
    }
});

/* ==========================================================
 *  РЕСПАУН ПОСЛЕ СМЕРТИ
 * ========================================================== */
const RESPAWN_POS   = new mp.Vector3(-1069, -3427, 14); // куда спавнить
const RESPAWN_DELAY = 5000;                             // мс ожидания

mp.events.add('playerDeath', (player, reason, killer) => {
    console.log(`[DEATH] Игрок ${player.name} умер. Причина: ${reason}`);
    player.outputChatBox('Вы умерли! Ожидайте возрождения...');

    // Показываем экран смерти
    player.call('showDeathScreen');

    // Устанавливаем таймер на респавн
    setTimeout(() => {
        console.log(`[RESPAWN] Попытка возродить игрока ${player.name}`);

        // Проверяем, существует ли игрок
        if (!player || !mp.players.exists(player)) {
            console.log('[RESPAWN] Игрок не существует, отменяем возрождение');
            return;
        }

        try {
            const spawnPos = new mp.Vector3(-1069, -3427, 14);

            // Принудительно убираем экран смерти перед респавном
            player.call('hideDeathScreen');

            // Респавним игрока
            player.spawn(spawnPos);
            console.log(`[RESPAWN] Игрок ${player.name} возрожден в позиции: ${spawnPos.x}, ${spawnPos.y}, ${spawnPos.z}`);

            // Восстанавливаем параметры
            player.health = 100;
            player.armour = 0;

            // Уведомляем клиента
            player.call('onPlayerRespawn');
            player.outputChatBox('Вы возрождены!');

        } catch (error) {
            console.error(`[RESPAWN] Ошибка при возрождении игрока ${player.name}:`, error);
            player.outputChatBox('Ошибка возрождения! Попробуйте перезайти.');
        }
    }, RESPAWN_DELAY);
});

/* ==========================================================
 *  КОМАНДЫ ДЛЯ РАЗРАБОТЧИКА
 * ========================================================== */

// Команда для получения позиции (для разработки)
mp.events.addCommand('getpos', (player) => {
    const pos = player.position;
    const rot = player.heading;
    console.log(`[DEBUG] Позиция игрока ${player.name}: x=${pos.x}, y=${pos.y}, z=${pos.z}, heading=${rot}`);
    player.outputChatBox(`Позиция: x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}, z=${pos.z.toFixed(2)}`);
});

// Команда для спавна мяча с координатами
mp.events.addCommand('spawnball', (player, fullText, x, y, z) => {
    if (!x || !y || !z) {
        player.outputChatBox('Использование: /spawnball [x] [y] [z]');
        return;
    }

    const customPos = [parseFloat(x), parseFloat(y), parseFloat(z)];
    mp.events.call('spawnObjectNearby', player, false, customPos);
});

// Команда для тестирования заказа
mp.events.addCommand('testorder', (player, fullText, count) => {
    const ballCount = count ? parseInt(count) : 5;
    player.outputChatBox(`🧪 Тестируем заказ на ${ballCount} мячей...`);
    mp.events.call('spawnOrderBalls', player, ballCount);
});

// Команда для получения статистики мячей
mp.events.addCommand('ballstats', (player) => {
    const playerData = playerBalls.get(player.id);
    if (playerData) {
        player.outputChatBox(`Статистика мячей: Инвентарь=${playerData.inventory}, Собрано=${playerData.count}`);
        console.log(`[BALL SYSTEM] Статистика ${player.name}: инвентарь=${playerData.inventory}, собрано=${playerData.count}`);
    } else {
        player.outputChatBox('Данные о мячах не найдены!');
    }
});

// Команда для сброса статистики мячей
mp.events.addCommand('resetballs', (player) => {
    playerBalls.set(player.id, {
        inventory: 5,
        count: 0
    });
    player.call('updateInventory', [5, 0]);
    player.outputChatBox('Статистика мячей сброшена!');
    console.log(`[BALL SYSTEM] Сброшена статистика для игрока ${player.name}`);
});

// Команда для отладки коллайдеров
mp.events.addCommand('debugballs', (player) => {
    player.outputChatBox(`Всего мячей в мире: ${balls.size}`);
    console.log(`[BALL SYSTEM] Отладка для ${player.name}:`);
    console.log(`- Всего мячей: ${balls.size}`);
    console.log(`- Данные игрока:`, playerBalls.get(player.id));

    // Выводим информацию о ближайших мячах
    let nearbyBalls = 0;
    balls.forEach((ballInfo, ballId) => {
        const ball = mp.objects.at(ballId);
        if (ball) {
            const distance = Math.sqrt(
                Math.pow(ball.position.x - player.position.x, 2) +
                Math.pow(ball.position.y - player.position.y, 2) +
                Math.pow(ball.position.z - player.position.z, 2)
            );
            if (distance < 10.0) {
                nearbyBalls++;
                console.log(`- Мяч ${ballId} на расстоянии ${distance.toFixed(2)}m`);
            }
        }
    });
    player.outputChatBox(`Мячей рядом (в радиусе 10м): ${nearbyBalls}`);
});

// Команда для показа всех позиций спавна
mp.events.addCommand('showpositions', (player) => {
    player.outputChatBox('📍 Доступные позиции для спавна мячей:');
    ORDER_SPAWN_POSITIONS.forEach((pos, index) => {
        player.outputChatBox(`${index + 1}. ${pos.name}: (${pos.x}, ${pos.y}, ${pos.z})`);
    });
});

/* ==========================================================
 *  ТРАНСПОРТ (существующий код)
 * ========================================================== */

// mp.events.addCommand('veh', async (player, _, argsString) => {
//     // ... существующий код для спавна транспорта
// });

// function waitForEntity(entity, timeout = 5000) {
//     // ... существующий код
// }

// mp.events.add('requestModelsPage', (player, page) => {
//     player.call('showModels', [page]);
// });

console.log('[BALL SYSTEM] Серверная система мячей полностью инициализирована');
console.log(`[ORDER SYSTEM] Загружено ${ORDER_SPAWN_POSITIONS.length} позиций для заказов`);
console.log('[SERVER] Все системы загружены успешно');