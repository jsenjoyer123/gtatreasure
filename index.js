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
        // `Собранные мячи: ${playerData.count}`,      // Используем данные с сервера
        // `Мячей в запасе: ${playerData.inventory}`   // Используем данные с сервера
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
        const modelName = 'tezeract';
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
            // Основная мощность двигателя (чем выше - тем больше ускорение)
            fInitialDriveForce: 2000.0,         // Высокая мощность для спортивного авто
            
            // Инерция при разгоне (меньше значение = быстрее реакция на газ)
            // fDriveInertia: 0.05,               // Очень отзывчивое ускорение
            
            // Количество передач в коробке
            nInitialDriveGears: 6,             // 8-ступенчатая коробка (характерно для гиперкаров)
            
            // Пределы сцепления (мин/макс значения кривой сцепления)
            // fTractionCurveMax: 10.0,           // Максимальное сцепление на низких скоростях
            // fTractionCurveMin: 14.9,           // Минимальное сцепление на высоких скоростях (возможна опечатка)
            
            // Множитель потери сцепления (меньше = лучше управляемость)
            // fTractionLossMult: 0.01,           // Минимальная пробуксовка колес
            
            // Вектор максимального сцепления (X,Y,Z-корректировки)
            // vecTractionCurveMax: new mp.Vector3(2.5, 10.5, 0), // Настройки для разных осей
            
            // Скорость переключения передач (вверх/вниз)
            fClutchChangeRateScaleUpShift: 25.0,   // Быстрое переключение на повышенную
            fClutchChangeRateScaleDownShift: 999.0,// Мгновенное переключение на пониженную
            
            // Аэродинамическое сопротивление (0 = отсутствие сопротивления)
            fInitialDragCoeff: 0.0,            // Максимальная скорость не ограничена воздухом
            
            // Масса автомобиля в кг
            // fMass: 500.0,                      // Очень легкий кузов (типично для гоночных авто)
            
            // Множители инерции по осям
            // vecInertiaMultiplier: new mp.Vector3(1, 1, 1), // Стандартное распределение массы
            
            // Распределение привода (0.0 = задний, 1.0 = передний)
            // fDriveBiasFront: 0.11,             // Заднеприводная компоновка (11% на перед)
            
            // Сила торможения (чем выше - тем резче торможение)
            fBrakeForce: 0.5,                  // Умеренная тормозная мощность
            
            // Максимальная скорость (в единицах игры)
            fInitialDriveMaxFlatVel: 500,   // Экстремально высокая макс. скорость
            
            // Смещение центра масс (Z = -1 опускает центр тяжести)
            // vecCentreOfMassOffset: new mp.Vector3(0, 0, -1.0), // Улучшенная устойчивость
            
            // Аэродинамическая прижимная сила
            // fDownforceModifier: 15.0,           // Сильное прижатие к дороге на скорости
            
            // Жесткость подвески
            // fSuspensionForce: 10.0,            // Жесткая спортивная подвеска
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
mp.keys.bind(0x45, true, () => {
    mp.events.callRemote('spawnObjectNearby', true);
});

mp.events.add('spawnBallNearby', () => {
    mp.events.callRemote('spawnObjectNearby', false); 
});

mp.keys.bind(0x50, true, () => {
    // Проверка наличия мячей локально для мгновенной обратной связи
    if (true) {
        mp.events.callRemote('eatBall');
    }
});

// Обновление интерфейса
mp.events.add('updateInventory', (inventory, count) => {
    mp.gui.chat.push(`Мячей: ${inventory} | Собрано: ${count}`);
    mp.players.local.setVariable('inventory', inventory); // Сохраняем в переменные игрока
});


function enableDrunkVisuals(duration = 30000) {
    // В качестве примера используется модификатор "spectator5"
    // Вы можете экспериментировать, например, с "drunk", "HeistPink1", "drug_trip" и др.
    const visualModifier = "spectator5";

    // Устанавливаем модификатор тайм-цикла
    mp.game.graphics.setTimecycleModifier(visualModifier);
    
    // Можно задать интенсивность эффекта (от 0.0 до 1.0, где 1.0 – максимальная сила)
    mp.game.graphics.setTimecycleModifierStrength(0.8);

    // Дополнительно можно добавить эффект тряски камеры для усиления визуального восприятия
    mp.game.cam.shakeGameplayCam("DRUNK_SHAKE", 1.0);

    // Сброс эффекта через duration миллисекунд
    setTimeout(() => {
        // Сброс модификатора тайм-цикла
        mp.game.graphics.clearTimecycleModifier();

        // Остановка эффекта тряски камеры
        mp.game.cam.stopGameplayCamShaking(true);
    }, duration);
}

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

// Анимация поедания
mp.events.add('playEatAnimation', async () => {
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

    // Эффекты
    mp.game.graphics.startParticleFxNonLoopedOnEntity(
        'scr_fbi_falling_debris', 
        mp.players.local.handle, 
        0, 0, 0, 
        0, 0, 0, 
        1.0, 
        false, false, false
    );
    enableDrunkVisuals(120000); // эффект на 30 секунд
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







// // Пример: функция для включения эффекта опьянения
// function enableDrunkEffect(duration = 30000) { // duration в мс, по умолчанию 30 секунд
//     // Анимация походки: сперва запрашиваем клипсет движения "drunk"
//     const animSet = "move_m@drunk@verydrunk";
//     mp.game.streaming.requestAnimSet(animSet);

//     // Ждём загрузки анимсета (можно повторять проверку до таймаута)
//     const checkInterval = setInterval(() => {
//         if (mp.game.streaming.hasAnimSetLoaded(animSet)) {
//             clearInterval(checkInterval);

//             // Устанавливаем изменённый клипсет движения для игрока
//             const playerPed = mp.players.local.handle;
//             mp.game.streaming.requestAnimSet(animSet);
//             mp.game.ped.setPedMovementClipset(playerPed, animSet, 0.25);

//             // Применяем эффект тряски камеры
//             mp.game.cam.shakeGameplayCam("DRUNK_SHAKE", 1.0);

//             // Опционально: можно изменить FOV или добавить другие эффекты с помощью native функций

//             // По истечении времени эффект сбрасывается
//             setTimeout(() => {
//                 // Сброс клипсета движения на дефолтный (обычно "" или "move_m@player@")
//                 mp.game.ped.resetPedMovementClipset(playerPed, 0.0);

//                 // Останавливаем тряску камеры
//                 mp.game.cam.stopGameplayCamShaking(true);
//             }, duration);
//         }
//     }, 100);
// }


//     enableDrunkEffect(30000); // эффект на 30 секунд


// Функция для включения визуальных эффектов опьянения





