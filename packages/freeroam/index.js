// const markerPos = { x: -263.631591796875, y: 2195.6708984375, z: 128.47988891601562}
// mp.events.add('playerReady', (player) => {
//     player.call('playerInitLogistWork', [markerPos]);
// })

// mp.events.addCommand('sp', (player) => {
//     const {position} = player.vehicle
//     console.log(`{ x: ${position.x}, y: ${position.y}, z: ${position.z}, heading: ${player.vehicle.rotation.z}}`)
// })

// const ball = mp.objects.new(mp.joaat('prop_beachball_02'), new mp.Vector3(-1069, -3427, 20));

// // Глобальные объекты для хранения данных игроков
// const ballCount = {};
// const playerBallInventory = {};
// const ballsArray = [];

// // Инициализация переменных при входе игрока
// mp.events.add('playerJoin', (player) => {
//     ballCount[player.id] = 0;
//     playerBallInventory[player.id] = 1;
// });

// // Создание мяча
// async function spawnObjectNearby(player, checkLimit = true) {
//     if (checkLimit && (!playerBallInventory[player.id] || playerBallInventory[player.id] <= 0)) {
//         player.outputChatBox('У вас нет мячей для создания.');
//         return;
//     }

//     const modelHash = mp.game.joaat('prop_beachball_02');
    
//     // Тут можно добавить логику загрузки модели если хотите серверно

//     const pos = player.position;
//     const spawnPos = new mp.Vector3(pos.x + 3, pos.y, pos.z);
    
//     const ball = mp.objects.new(modelHash, spawnPos, { alpha: 255 });
//     ballsArray.push(ball);

//     const colshape = mp.colshapes.newSphere(spawnPos.x, spawnPos.y, spawnPos.z, 1.0);
//     colshape.ball = ball;

//     if (checkLimit) playerBallInventory[player.id]--;

//     player.outputChatBox(`Мяч создан! Остаток мячей: ${playerBallInventory[player.id]}`);
// }

// // Сбор мяча
// function collectBall(player, ball) {
//     if (!ballCount[player.id]) ballCount[player.id] = 0;
//     if (!playerBallInventory[player.id]) playerBallInventory[player.id] = 0;

//     ball.destroy();
//     const idx = ballsArray.indexOf(ball);
//     if (idx !== -1) ballsArray.splice(idx, 1);

//     ballCount[player.id]++;
//     playerBallInventory[player.id]++;
//     player.outputChatBox(`Вы собрали мяч! Всего собрано: ${ballCount[player.id]}. Мячей в запасе: ${playerBallInventory[player.id]}`);
// }

// // Обработчики
// mp.events.add('spawnObjectNearby', (player, checkLimit = false) => {
//     spawnObjectNearby(player, checkLimit);
// });

// mp.events.add('playerEnterColshape', (shape, player) => {
//     if (shape.ball) {
//         collectBall(player, shape.ball);
//         shape.destroy();
//     }
// });

// // Привязка клавиши P
// mp.events.add('playerKeyPress', (player, key) => {
//     if (key === 0x50) {
//         spawnObjectNearby(player, true);
//     }
// });


// -1069, -3427, 14

// Серверная часть (server-side)
// mp.events.addCommand('veh', async (player, _, argsString) => {
//     try {
//         // 1. Парсинг аргументов
//         const args = argsString ? argsString.split(' ') : [];
//         if (args.length < 1) {
//             return player.outputChatBox('Использование: /veh [model]');
//         }

//         // 2. Получение модели
//         const modelName = args[0].toLowerCase();
//         const modelHash = mp.joaat(modelName);

//         // 3. Проверка модели
//         if (!mp.vehicles.exists(modelHash)) {
//             return player.outputChatBox(`Модель ${modelName} не найдена!`);
//         }

//         // 4. Расчет позиции спавна
//         const heading = player.heading;
//         const forwardVector = {
//             x: Math.sin(-heading) * 3,
//             y: Math.cos(-heading) * 3,
//             z: 0
//         };

//         const spawnPos = new mp.Vector3(
//             player.position.x + forwardVector.x,
//             player.position.y + forwardVector.y,
//             player.position.z + 0.5
//         );

//         // 5. Создание транспорта
//         const vehicle = mp.vehicles.new(modelHash, spawnPos, {
//             heading: heading,
//             dimension: player.dimension,
//             engine: true,
//             locked: false,
//             numberPlate: "RAGE",
//             alpha: 255
//         });

//         // 6. Настройка транспорта
//         await waitForEntity(vehicle); // Ждем синхронизации

//         vehicle.setInvincible(true);
//         vehicle.setEngineOn(true);
//         player.putIntoVehicle(vehicle, -1);

//         // 7. Настройки handling (пример)
//         const handlingMultipliers = {
//             'fInitialDriveForce': 1.5,
//             'fDriveInertia': 0.8,
//             'fBrakeForce': 1.2
//         };

//         Object.entries(handlingMultipliers).forEach(([key, value]) => {
//             vehicle.setHandling(key, vehicle.getHandling(key) * value);
//         });

//         // 8. Очистка
//         mp.game.streaming.setModelAsNoLongerNeeded(modelHash);
//         player.outputChatBox(`Транспорт ${modelName} создан!`);

//     } catch (error) {
//         player.outputChatBox(`Ошибка: ${error.message}`);
//         console.error('Vehicle spawn error:', error);
//     }
// });

// // Вспомогательная функция для ожидания entity
// function waitForEntity(entity, timeout = 5000) {
//     return new Promise((resolve, reject) => {
//         const start = Date.now();
//         const check = () => {
//             if (entity.handle !== 0) {
//                 resolve();
//             } else if (Date.now() - start > timeout) {
//                 reject(new Error('Timeout waiting for entity'));
//             } else {
//                 setTimeout(check, 100);
//             }
//         };
//         check();
//     });
// }


// // server.js
// mp.events.add('requestModelsPage', (player, page) => {
//     player.call('showModels', [page]);
// });

// server-side (index.js или другой серверный файл)

let playerBalls = new Map(); // Хранит данные игроков: { id: { inventory: 1, count: 0 } }

mp.events.add('playerJoin', (player) => {
    playerBalls.set(player.id, { 
        inventory: 5, 
        count: 1 // Инициализируем счётчик здесь
    });
});

// Удаление данных при отключении
mp.events.add('playerQuit', (player) => {
    playerBalls.delete(player.id);
});

// Обработка создания мяча
mp.events.add('spawnObjectNearby', (player, checkLimit = true, customPos = null) => {
    const playerData = playerBalls.get(player.id);
    if (!playerData) return;

    // Проверка лимита инвентаря
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
        
        // Античит-проверка (опционально)
        if (spawnPos.dist(player.position) > 100.0) {
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

    // Создание объекта
    const ball = mp.objects.new(
        mp.joaat('prop_mp_drug_pack_blue'),
        spawnPos,
        { alpha: 255 }
    );

    // Создание коллайдера
    // const colshape = mp.colshapes.newSphere(
    //     spawnPos.x,
    //     spawnPos.y,
    //     spawnPos.z,
    //     1.5
    // );
    colshape.ballId = ball.id;
    // colshape.playerId = player.id;

    // Обновление инвентаря
    if (checkLimit) {
        playerData.inventory--;
        playerBalls.set(player.id, playerData);
        player.call('updateInventory', [playerData.inventory, playerData.count]);
    }



    balls.set(ball.id, {
        ownerId: player.remoteId // Используем уникальный ID игрока
    });

    // Создаем коллайдер только с ID мяча
    const colshape = mp.colshapes.newSphere(spawnPos.x, spawnPos.y, spawnPos.z, 1.5);
    colshape.ballId = ball.id;
});

// Обработка сбора мяча
mp.events.add('collectBall', (player, ballId) => {
    const ballInfo = balls.get(ballId);
    if (!ballInfo) return;

    const ball = mp.objects.at(ballId);
    if (ball) ball.destroy();

    // Обновляем данные собирающего игрока
    const targetPlayer = mp.players.atRemoteId(ballInfo.ownerId);
    if (targetPlayer) {
        const playerData = playerBalls.get(targetPlayer.id);
        playerData.inventory++;
        playerData.count++;
        playerBalls.set(targetPlayer.id, playerData);
        targetPlayer.call('updateInventory', [playerData.inventory, playerData.count]);
    }

    balls.delete(ballId);
});

// Обработка входа в коллайдер
mp.events.add('playerEnterColshape', (player, colshape) => {
    if (colshape.ballId) {
        const ball = mp.objects.at(colshape.ballId);
        if (ball && ball.position.dist(player.position) < 2.0) {
            player.call('clientCollectBall', [colshape.ballId]);
            mp.events.call('collectBall', player, colshape.ballId);
            colshape.destroy();
        }
    }
});


// Обработка поедания мяча
mp.events.add('eatBall', (player) => {
    const playerData = playerBalls.get(player.id);
    if (!playerData || playerData.inventory <= 0) {
        player.outputChatBox('У вас нет мячей!');
        return;
    }

    // Уменьшаем инвентарь
    playerData.inventory--;
    playerBalls.set(player.id, playerData);

    // Визуальные эффекты
    player.call('playEatAnimation');
    player.outputChatBox('Вы съели мяч! Осталось: ' + playerData.inventory);

    // Синхронизация интерфейса
    player.call('updateInventory', [playerData.inventory, playerData.count]);
});

















// mp.events.add("forceRespawn", (player) => {
//     player.spawn(new mp.Vector3(-425, 1123, 325));
//     player.health = 100;
//     player.armour = 0;
//     player.setVariable("isDead", false);
//     player.call("clientRespawn"); // уведомляем клиента!
// });
//
// // Смерть
// // Сервер: обработка смерти и респавн с задержкой
// mp.events.add('playerDeath', (player, reason, killer) => {
//     // Можно отключить управление или показать экран смерти через .call("showDeathScreen")
//     // Ждём 5 секунд и респавним
//     setTimeout(() => {
//         player.spawn(new mp.Vector3(-1069, -3427, 14));
//         // По желанию меняй скин, оружие, здоровье и т.д.
//         player.health = 100;
//         player.armour = 0;
//         // По желанию: триггер клиентских ивентов
//         player.call("onPlayerRespawn");
//     }, 5000);
// });



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
