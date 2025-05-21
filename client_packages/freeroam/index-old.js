// // Только для однопользовательского режима (не синхронизируется)
// const pos = mp.players.local.position;
// mp.vehicles.new(mp.game.joaat('adder'), new mp.Vector3(pos.x, pos.y, pos.z));



// // Создаем текстовое поле для отображения координат
// let coordsLabel = mp.labels.new("Координаты: ", new mp.Vector3(0, 0, 0), {
//     font: 0,
//     drawDistance: 100,
//     los: true,
//     dimension: 0
// });

// // Функция для обновления координат игрока
// function updateCoords() {
//     let player = mp.players.local;
//     let position = player.position;

//     // Обновляем текстовое поле с координатами
//     coordsLabel.position = new mp.Vector3(position.x, position.y, position.z);
//     coordsLabel.text = `Координаты: X: ${position.x.toFixed(2)}, Y: ${position.y.toFixed(2)}, Z: ${position.z.toFixed(2)}`;
// }

// // Обновляем координаты каждые 100 миллисекунд
// setInterval(updateCoords, 100);














// async function createFollowerPed(spawnPos) {
//     try {
//         const modelName = 'a_f_y_runner_01';
//         const modelHash = mp.game.joaat(modelHash);
        
//         // Загрузка модели с проверкой
//         if (!mp.game.streaming.isModelValid(modelHash)) {
//             throw new Error('Invalid ped model');
//         }

//         await loadModel(modelHash);

//         // Создание педа с проверкой высоты
//         const ped = mp.peds.new(
//             modelHash,
//             new mp.Vector3(
//                 spawnPos.x + 2,
//                 spawnPos.y + 2,
//                 spawnPos.z + 0.5
//             ),
//             {
//                 dynamic: true,
//                 frozen: false,
//                 invincible: true
//             }
//         );

//         if (!ped || !ped.exists()) {
//             throw new Error('Ped creation failed');
//         }

//         // Настройка поведения (RAGE MP specific)
//         ped.setConfigFlag(6, true);    // Не реагировать на окружение
//         ped.setConfigFlag(292, true);  // Всегда сохранять задачи

//         // Анимация бега
//         ped.task.startAnimation(
//             "move_m@quick", 
//             "move_m@quick", 
//             8.0, 
//             -8.0, 
//             -1, 
//             0, 
//             0, 
//             false, 
//             false, 
//             false, 
//             0, 
//             false
//         );

//         // Преследование игрока
//         ped.task.followToEntity(
//             mp.players.local, 
//             1.0,     // Скорость
//             -1,      // Тайм-аут
//             1.0,      // Радиус остановки
//             true      // Персистентность
//         );

//         mp.gui.chat.push(`[SUCCESS] NPC создан! ID: ${ped.id}`);
//         return ped;

//     } catch (error) {
//         mp.gui.chat.push(`[ERROR] ${error.message}`);
//         console.error(error.stack);
//         return null;
//     }
// }











































async function setSpawnPoint() {
    try {
        const spawnPosition = new mp.Vector3(-1096, -3233, 15);
        mp.players.local.position = spawnPosition;
        await mp.game.waitAsync(2000);
        
        const pos = mp.players.local.position;

        // Создаем транспорт и объекты
        await createVehicle('adder', new mp.Vector3(pos.x + 2, pos.y, pos.z));
        await createRoadObjects(pos);
        
        // Создаем NPC с задержкой
        await mp.game.waitAsync(1000);
        const ped = await createFollowerPed(pos);
        
        // Отладка: маркер для NPC
        if (ped) {
            mp.events.add('render', () => {
                if (ped && ped.position) {
                    mp.game.graphics.drawMarker(
                        1,
                        ped.position.x,
                        ped.position.y,
                        ped.position.z + 2,
                        0, 0, 0,
                        0, 0, 0,
                        0.5, 0.5, 0.5,
                        255, 0, 0, 180,
                        false,
                        true,
                        2,
                        false,
                        null,
                        null,
                        false
                    );
                }
            });
        }

    } catch (error) {
        mp.gui.chat.push(`Ошибка: ${error.message}`);
        console.error(error.stack);
    }
}

async function loadModel(modelHash) {
    return new Promise((resolve, reject) => {
        if (!mp.game.streaming.hasModelLoaded(modelHash)) {
            mp.game.streaming.requestModel(modelHash);
            
            let attempts = 0;
            const checkInterval = setInterval(() => {
                if (mp.game.streaming.hasModelLoaded(modelHash)) {
                    clearInterval(checkInterval);
                    resolve();
                }
                attempts++;
                
                if (attempts > 50) {
                    clearInterval(checkInterval);
                    reject(new Error('Timeout loading model'));
                }
            }, 100);
        } else {
            resolve();
        }
    });
}

async function createVehicle(modelName, position) {
    const modelHash = mp.game.joaat(modelName);
    await loadModel(modelHash);
    return mp.vehicles.new(modelHash, position, {
        heading: 0,
        numberPlate: 'SPAWN',
        alpha: 255,
        locked: false
    });
}

async function createRoadObjects(spawnPos) {
    const roadObjects = []; // Добавьте свои объекты при необходимости
    
    for (const obj of roadObjects) {
        const modelHash = mp.game.joaat(obj.model);
        await loadModel(modelHash);
        
        mp.objects.new(modelHash, new mp.Vector3(
            spawnPos.x + obj.offset.x,
            spawnPos.y + obj.offset.y,
            spawnPos.z + obj.offset.z
        ), {
            rotation: obj.rotation,
            alpha: 255,
            dimension: 0
        });
    }
}




















async function createFollowerPed(spawnPos) {
    try {
        const modelName = 'a_f_y_runner_01';
        const modelHash = mp.game.joaat(modelName);
        
        if (!mp.game.streaming.isModelValid(modelHash)) {
            throw new Error('Invalid model');
        }

        // Загружаем модель
        await loadModel(modelHash);

        // Попытка получить корректное значение земли.
        let z = spawnPos.z;
        // Запрашиваем "collision" по координатам для корректного вычисления высоты
        mp.game.streaming.requestCollisionAtCoord(spawnPos.x + 2, spawnPos.y + 2, spawnPos.z + 100);
        // Необходимо дать движку время чтобы подгрузить коллизии
        await mp.game.waitAsync(100);

        // Вызов функции для получения groundZ.
        // Функция возвращает значение высоты или 0, если не удалось определить.
        const groundZ = mp.game.gameplay.getGroundZFor3dCoord(spawnPos.x + 2, spawnPos.y + 2, spawnPos.z + 100, false);

        // Если получено значение больше 0, считаем его ок
        if (groundZ && groundZ > 0) {
            z = groundZ;
        } else {
            mp.gui.chat.push("Не удалось получить корректную Z-координату, используется spawnPos.z");
        }

        // Создаем NPC (пешехода)
        const ped = mp.peds.new(
            modelHash,
            new mp.Vector3(spawnPos.x + 2, spawnPos.y + 2, z),
            { invincible: true }
        );

        // Проверьте, что ped создан корректно
        if (!ped || !ped.handle) {
            throw new Error('Ped handle is missing');
        }

        mp.gui.chat.push(`NPC создан по координатам: (${spawnPos.x + 2}, ${spawnPos.y + 2}, ${z})`);
        console.log(`NPC создан по координатам: (${spawnPos.x + 2}, ${spawnPos.y + 2}, ${z})`);

        // Задаем NPC простую задачу для перемещения в ограниченной области
        ped.taskWanderInArea(
            spawnPos.x, 
            spawnPos.y, 
            spawnPos.z, 
            10,  // Радиус области
            10,  // Длительность выполнения задачи (примерно, может интерпретироваться как таймаут)
            10   // Дополнительный параметр (если требуется)
        );

        return ped;
    } catch (error) {
        console.error(`createFollowerPed error: ${error.message}`);
        mp.gui.chat.push(`Ошибка создания NPC: ${error.message}`);
        return null;
    }
}
























// Инициализация
mp.events.add('playerSpawn', () => {
    setSpawnPoint();
});

// Первый запуск
setSpawnPoint();































mp.events.add("showSmartphone", () => {
    // Активация NUI-окна смартфона
    mp.gui.execute(`window.location = "package://freeroam/ui/index.html";`);
    mp.gui.cursor.visible = true; // делаем курсор видимым для взаимодействия
});

// Обработчики для второго смартфона
// mp.events.add("showSecondSmartphone", () => {
//     mp.gui.execute(`window.location = "package://freeroam/ui/secondary.html";`);
//     mp.gui.cursor.visible = true;
// });

// Общий обработчик закрытия для обоих смартфонов
mp.events.add("hideSmartphone", () => {
    mp.gui.execute(`document.body.innerHTML = "";`);
    mp.gui.cursor.visible = false;
});

// client.js
mp.keys.bind(0x4D, true, () => mp.events.call("showSmartphone"));      // M - первый смартфон
mp.keys.bind(0x4E, true, () => mp.events.call("showSecondSmartphone")); // N - второй смартфон
mp.keys.bind(0x08, true, () => mp.events.call("hideSmartphone")); 

































// client.js
let camera = null;

mp.events.add("smartphone:activateCamera", () => {
    // Функционал камеры отключен
});

// Подписываемся на событие "smartphone:takePhoto"
mp.events.add("smartphone:takePhoto", () => {
    mp.game.graphics.takeScreenshot((error, data) => {
        if (error) {
            console.error("Ошибка при создании скриншота:", error);
            return;
        }
        console.log("Скриншот успешно создан:", data);
        
        // Можно отправить скриншот на сервер, сохранить или выполнить другую логику
        // Например, отправим данные скриншота на сервер:
        mp.events.callRemote("smartphone:photoTaken", data);
    });
});

mp.events.add("smartphone:deactivateCamera", () => {
    // Функционал деактивации камеры отключен
});



