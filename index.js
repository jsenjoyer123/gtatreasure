//СПАВН ИГРОКА
mp.events.add('playerReady', () => {
    let modelName = 'mp_f_freemode_01';
    let modelHash = mp.game.joaat(modelName);
    
    // Запрос модели
    mp.game.streaming.requestModel(modelHash);
    while (!mp.game.streaming.hasModelLoaded(modelHash)) {
        mp.game.wait(0);
    }

    mp.players.local.model = modelHash;
    mp.players.local.position = new mp.Vector3(-1069, -3427, 14);

    createFollowingWomen(10);
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////







































//Преследующие женщины
function createFollowingWomen(count) {
    const player = mp.players.local;
    const basePos = player.position;
    const offsets = [
        { x: 2,  y: 0 },
        { x: 0,  y: 2 },
        { x: -2, y: 0 }
    ];

    for (let i = 0; i < count; i++) {
        const ofs = offsets[i % offsets.length];
        const spawnPos = new mp.Vector3(
            basePos.x + ofs.x,
            basePos.y + ofs.y,
            basePos.z
        );

        const npc = mp.peds.new(
            mp.game.joaat('mp_f_freemode_01'),
            spawnPos,
            player.getHeading(),
            player.dimension
        );

        // Даем немного времени NPC "прогрузиться" перед задачей
        setTimeout(() => {
            if (mp.peds.exists(npc)) {
                npc.setBlockingOfNonTemporaryEvents(false);

                // Устанавливаем анимацию танца
                const danceAnimation = "anim@amb@nightclub@dancers@crowddance_groups@";
                const danceName = "mi_dance_facedj_17_v1_male";
                const danceFlag = 1; // 1 - play once, 2 - loop, 3 - stop

                // Запускаем анимацию танца
                mp.game.task.playAnim(npc.handle, danceAnimation, danceName, 8.0, -8.0, -1, danceFlag, 0, false, false, false);

                // Если хотите, можете добавить случайные движения или другие анимации
                // Например, через некоторое время менять анимацию
                setTimeout(() => {
                    if (mp.peds.exists(npc)) {
                        // Меняем анимацию на другую
                        const newDanceName = "mi_dance_facedj_17_v1_female"; // Пример другой анимации
                        mp.game.task.playAnim(npc.handle, danceAnimation, newDanceName, 8.0, -8.0, -1, danceFlag, 0, false, false, false);
                    }
                }, 5000); // Меняем анимацию через 5 секунд
            }
        }, 500);
    }
  }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  




































// ОТОБРАЖЕНИЕ РАЗНЫХ ПОКАЗАТЕЛЕЙ
let playerData = { // Добавьте этот объект для хранения данных
    inventory: 0,
    count: 0
};

// Обновляем данные при получении с сервера
mp.events.add('updateUI', (inventory, count) => {
    playerData.inventory = inventory;
    playerData.count = count;
});

mp.events.add('render', () => {
    const player = mp.players.local;

    // Скорость
    const speed = Math.round(player.getSpeed() * 3.6);
    
    // Координаты
    const pos = player.position;
    const coordsText = `X: ${pos.x.toFixed(2)}  Y: ${pos.y.toFixed(2)}  Z: ${pos.z.toFixed(2)}`;

    // Все элементы отображения
    const texts = [
        `Скорость: ${speed} км/ч`,
        coordsText,
        `Собранные мячи: ${playerData.count}`,      // Используем данные с сервера
        `Мячей в запасе: ${playerData.inventory}`   // Используем данные с сервера
    ];

    // Отрисовка всех элементов
    texts.forEach((text, index) => {
        mp.game.graphics.drawText(text, [0.5, 0.1 + (0.05 * index)], {
            font: 4,
            color: [255, 255, 255, 255],
            scale: [0.5, 0.5],
            outline: true,
            centre: true
        });
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//бессмертие
// mp.events.add('render', () => {
//     const player = mp.players.local;

//     // Убедитесь, что игрок не может получать урон
//     if (player.health <= 0) {
//         player.health = 100; // Восстанавливаем здоровье, если оно равно 0
//     }
// });

// mp.events.add('playerDamage', (damage) => {
//     // отменяем урон
//     return false;
// });













































/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Функция для спавна автомобиля рядом с игроком
async function loadModel(modelHash, timeoutMs = 5000) {
    if (!mp.game.streaming.hasModelLoaded(modelHash)) {
        mp.game.streaming.requestModel(modelHash);
        const startTime = Date.now();
        while (!mp.game.streaming.hasModelLoaded(modelHash)) {
            if (Date.now() - startTime > timeoutMs) {
                throw new Error('Не удалось загрузить модель автомобиля');
            }
            await new Promise(res => setTimeout(res, 100));
        }
    }
}

// Основная функция для спавна автомобиля рядом с игроком
async function spawnCarNearby() {
    try {
        const modelName = 'T20';
        const modelHash = mp.game.joaat(modelName);
        mp.game.invoke('0xDBA3C090E3D74690', 0.0); // ClearEntityLastDamageEntity
        mp.game.invoke('0xF8EBCCC96ADB9FB7', true); // SetIgnoreLowPriorityShockingEvents

        await loadModel(modelHash); // Ждем загрузки модели

        const playerPos = mp.players.local.position;
        const spawnPos = new mp.Vector3(playerPos.x + 3, playerPos.y, playerPos.z);

        const vehicle = mp.vehicles.new(modelHash, spawnPos, {
            heading: mp.players.local.heading,
            numberPlate: 'NOSPEED',
            alpha: 10,
            locked: false,
            engine: true,
        });

        // Настройки прочности и неуязвимости
        vehicle.setCanBeDamaged(false);
        vehicle.setInvincible(true);
        vehicle.setEngineHealth(1000);
        vehicle.setBodyHealth(1000);
        vehicle.setPetrolTankHealth(1000);

        // Настройки handling
        const handlingSettings = {
            fInitialDriveForce: 200.0,
            fDriveInertia: 0.05,
            nInitialDriveGears: 8,
            fTractionCurveMax: 10.0,
            fTractionCurveMin: 14.9,
            fTractionLossMult: 0.01,
            vecTractionCurveMax: new mp.Vector3(2.5, 10.5, 0),
            fClutchChangeRateScaleUpShift: 15.0,
            fClutchChangeRateScaleDownShift: 999.0,
            fInitialDragCoeff: 0.0,
            fMass: 500.0,
            vecInertiaMultiplier: new mp.Vector3(1, 1, 1),
            fDriveBiasFront: 0.11,
            fBrakeForce: 0.5,
            fInitialDriveMaxFlatVel: 1000.0,
            vecCentreOfMassOffset: new mp.Vector3(0, 0, -1.0),
            fDownforceModifier: 15.0,
            fSuspensionForce: 10.0,
        };

        // Применяем обработку
        Object.entries(handlingSettings).forEach(([key, val]) => {
            vehicle.setHandling(key, val);
        });

        // Дополнительные параметры
        vehicle.setReduceGrip(false);
        vehicle.setTyresCanBurst(false);
        vehicle.setCanBeVisiblyDamaged(false);
        vehicle.setEngineOn(true, true, false);
        vehicle.setRocketBoostActive(true);
        vehicle.setMaxSpeed(300.0);
        vehicle.setLodMultiplier(100.0);

        // Отладка через 1 сек
        setTimeout(() => {
            mp.gui.chat.push(
                `Авто готово! Скорость: ${(vehicle.getSpeed() * 3.6).toFixed(1)} км/ч, ` +
                `Ускорение: ${vehicle.getAcceleration().toFixed(2)} м/с², ` +
                `Максимальная: ${handlingSettings.fInitialDriveMaxFlatVel} км/ч`
            );
        }, 1000);

        mp.gui.chat.push('Гоночный болид заспавнен и откалиброван!');
    } catch (err) {
        mp.gui.chat.push(`Ошибка спавна авто: ${err.message}`);
    }
}

// Вызов при нажатию клавиши (например, X)
mp.keys.bind(0x58, true, () => {
    spawnCarNearby();
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////







































/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// client-side
// let playerData = {
//     inventory: 0,
//     count: 0
// };

// Обработка нажатия клавиши P
mp.keys.bind(0x50, true, () => {
    mp.events.callRemote('spawnObjectNearby', true);
});

// Обновление интерфейса
mp.events.add('updateInventory', (inventory, count) => {
    mp.gui.chat.push(`Мячей: ${inventory} | Собрано: ${count}`);
});

// Обработка сбора мяча (анимация и визуальные эффекты)
mp.events.add('clientCollectBall', async (ballId) => {
    const ball = mp.objects.at(ballId);
    if (!ball) return;

    // Анимация сбора
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

    // Эффекты
    mp.game.graphics.startParticleFxNonLoopedOnEntity(
        'scr_pickup_health', 
        ball.handle, 
        0, 0, 0, 
        0, 0, 0, 
        1.0, 
        false, false, false
    );
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////






































let smartphoneBrowser = null;

function openSmartphone() {
    if (!smartphoneBrowser) {
        smartphoneBrowser = mp.browsers.new('http://localhost:5173/');
    }
    mp.gui.cursor.visible = true;
}

function closeSmartphone() {
    if (smartphoneBrowser) {
        smartphoneBrowser.destroy();
        smartphoneBrowser = null;
    }
    mp.gui.cursor.visible = false;
}

mp.keys.bind(0x4D, true, () => { // M
    openSmartphone();
});

mp.keys.bind(0x08, true, () => { // Backspace
    closeSmartphone();
});





// Обработка события из интерфейса
mp.events.add('doScrenshot', () => {
    mp.gui.takeScreenshot("eegfsdersfesdfe.png", 1, 100, 0);
    mp.gui.chat.push("Скриншот создан через интерфейс!");
});

// // Обработка клавиши F12
// mp.keys.bind(0x7B, false, () => {
//     mp.gui.takeScreenshot("fadfaedsfeasdsdfsed.png", 1, 100, 0);
//     mp.gui.chat.push("Скриншот создан через F12!");
// });


// mp.events.addCommand('veh', (player, _, args) => {
//     if (!args || args.length === 0) {
//         return player.outputChatBox('/veh [model]');
//     }
//     let modelName = args[0];
//     let tpos = player.position;
//     mp.vehicles.new(mp.joaat(modelName), new mp.Vector3(tpos.x + 2, tpos.y, tpos.z));
// });
// client-side
// client_packages/vehicles/modelList.js
// let currentPage = 0;
// let allModels = null;

// // Инициализация при загрузке
// mp.events.add('playerReady', () => {
//     // Безопасное получение моделей
//     allModels = Array.from(mp.vehicles.models).sort();
// });

// mp.keys.bind(0x76, false, () => {
//     showModelsPage(currentPage);
// });

// function showModelsPage(page) {
//     try {
//         if (!allModels) {
//             mp.gui.chat.push("Модели еще не загружены!");
//             return;
//         }

//         const safePage = Math.max(0, Math.min(page, Math.floor(allModels.length / 10)));
//         const start = safePage * 10;
//         const end = start + 10;
        
//         mp.gui.chat.push(`=== Page ${safePage} ===`);
        
//         allModels.slice(start, end).forEach((model, index) => {
//             mp.gui.chat.push(`${start + index + 1}. ${model}`);
//         });
        
//         currentPage = safePage;
//     } catch(e) {
//         console.error("Ошибка:", e);
//     }
// }