/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Функция для спавна автомобиля рядом с игроком
async function spawnCarNearby() {
    try {
        // Имя модели автомобиля для спавна
        // const carModelName = 'Zentorno';
       const modelName = 'cheburek'
        // Хэш модели (уникальный идентификатор модели в игре)
        const modelHash = mp.game.joaat(carModelName);
        mp.game.invoke('0xDBA3C090E3D74690', 0.0); // ClearEntityLastDamageEntity
        mp.game.invoke('0xF8EBCCC96ADB9FB7', true); // SetIgnoreLowPriorityShockingEvents
        // Проверяем, загружена ли модель, если нет — запрашиваем загрузку
        if (!mp.game.streaming.hasModelLoaded(modelHash)) {
            mp.game.streaming.requestModel(modelHash);
            // Ожидаем загрузки модели с таймаутом в 5 секунд (50 попыток по 100 мс)
            await new Promise((resolve, reject) => {
                let attempts = 0;
                const interval = setInterval(() => {
                    if (mp.game.streaming.hasModelLoaded(modelHash)) {
                        clearInterval(interval);
                        resolve();
                    } else if (attempts++ > 50) {
                        clearInterval(interval);
                        reject(new Error('Не удалось загрузить модель автомобиля'));
                    }
                }, 100);
            });
        }

        // Позиция для спавна — смещена на 3 единицы по оси X относительно позиции игрока
        const pos = mp.players.local.position;
        const spawnPos = new mp.Vector3(pos.x + 3, pos.y, pos.z);

        // Создаём автомобиль с заданными параметрами
        const vehicle = mp.vehicles.new(modelHash, spawnPos, {
            heading: mp.players.local.heading,  // Направление автомобиля совпадает с направлением игрока
            numberPlate: 'NOSPEED',              // Текст на номерном знаке
            alpha: 10,                         // Прозрачность (0–255, 255 — полностью непрозрачный)
            locked: false,                      // Закрыт ли замок автомобиля (false — открыт)
            engine: true                       // Состояние двигателя (true — двигатель включён)
        });

        // Настройки неуязвимости и максимального здоровья автомобиля
        vehicle.setCanBeDamaged(false);         // Машина не может получать урон (true/false)
        vehicle.setInvincible(true);             // Машина бессмертна (не горит, не взрывается) (true/false)
        vehicle.setEngineHealth(1000);           // Здоровье двигателя (0–1000, 1000 — максимум)
        vehicle.setBodyHealth(1000);             // Здоровье кузова (0–1000, 1000 — максимум)
        vehicle.setPetrolTankHealth(1000);       // Здоровье топливного бака (0–1000, 1000 — максимум)

        // Улучшенные характеристики handling (управляемости и физики)
        // const handling = {

        //     // Максимальная скорость автомобиля (км/ч), допустимый диапазон примерно 0 - 600+
        //     fInitialDriveMaxFlatVel: 500.0,// max ~600+

        //     // Движение/торможение
        //     // Масса автомобиля (кг), типичные значения от ~800 до 5000. Очень низкое значение даст "лёгкую" машину, слишком низкое — неадекватно.
        //     fMass: 10.0,     // Рекомендуется минимум ~500 для реалистичности. Здесь очень низкое значение для особых целей.

        //     // Сила двигателя, влияет на ускорение. Минимум 0.1 и выше (искусственный параметр, чем больше - тем мощнее)
        //     fInitialDriveForce: 3000.0, // Очень высокая мощность (обычно 0.1 - 10+)

        //     // Иннерция трансмиссии (0–2), чем выше — медленнее отклик двигателя на изменение оборотов
        //     fDriveInertia: 6.3,   // Обычно 0.5 - 2.0

        //     // Сила тормозов (0.1–5+), чем выше — сильнее тормоза
        //     fBrakeForce: 2.0, 

        //     // Тяга и сцепление с дорогой
        //     // Максимальное сцепление при прямолинейном движении, обычно 0.5 - 3.8
        //     fTractionCurveMax: 7.8,  // max ~3.8

        //     // Минимальное сцепление при заносах/поворотах (0.1 - 2.0)
        //     fTractionCurveMin: 5.5,

        //     // Распределение сцепления между передней (0.0) и задней (1.0) осями, 0.0 ≤ x ≤ 1.0
        //     fTractionBiasFront: 0.55,

        //     // Множитель потери сцепления при пробуксовке (0.0 - 1.0), чем меньше — тем лучше сцепление
        //     fTractionLossMult: 0.2,

        //     // Рулевое управление
        //     // Максимальный угол поворота руля (в градусах), обычно 10 - 40 (не задан в данном коде)
        //     // fSteeringLock: 10.0,

        //     // Отзывчивость руля (0.0 - 10+), чем выше — тем более резкий отклик на поворот
        //     fSteeringResponse: 20.0,

        //     // Подвеска и устойчивость кузова
        //     // Жёсткость подвески (0.0 - 10+), выше — жёстче подвеска и меньше крен кузова
        //     fSuspensionForce: 7.2,

        //     // Баланс подвески между передней (0.0) и задней (1.0) осями, 0.0 ≤ x ≤ 1.0
        //     fSuspensionBiasFront: 0.45,

        //     // Сила антиролл-бара (стабилизатора), 0.0 - 5+; выше — меньше крена кузова
        //     fAntiRollBarForce: 5.5,

        //     // Аэродинамика
        //     // Прижимная сила, помогает держать машину на дороге; обычно 0.0 - 5.0+
        //     fDownforceModifier: 5.5,

        //     // Трансмиссия
        //     // Количество скоростей коробки передач, минимум 1, обычно до 10+
        //     nInitialDriveGears: 12,  

        //     // Скорость переключения передач (вверх), чем выше — тем быстрее (1.0 - 10+)
        //     fClutchChangeRateScaleUpShift: 600.0, 

        //     // Скорость переключения передач (вниз), чем выше — тем быстрее (1.0 - 10+)
        //     fClutchChangeRateScaleDownShift: 100.0, 

        //     fInitialDragCoeff: 0,
        //     fDriveBiasFront: 0.5,
        //     nInitialDriveGears: 10,
        //     fInitialDriveForce: 2,
        //     fDriveInertia: 2,
        //     fClutchChangeRateScaleUpShift: 2,
        //     fClutchChangeRateScaleDownShift: 1,
        //     fBrakeBiasFront: 0.5,
        //     fHandBrakeForce: 2,

        // };
        const handling = {
            // Ядерный двигатель (в 20+ раз мощнее стандартного)
            fInitialDriveForce: 200.0,              // Макс. тяга (при лимите ~2.0 в документации)
            fDriveInertia: 0.05,                   // Двигатель мгновенно набирает обороты
            nInitialDriveGears: 8,                 // Только 1 передача = прямой привод
            
            // Квантовое сцепление
            fTractionCurveMax: 10.0,               // Сцепление как у болида F1 на сликах
            fTractionCurveMin: 14.9,               // Нулевая пробуксовка даже при 100% газе
            fTractionLossMult: 0.01,              // Шины буквально приклеены к асфальту
            vecTractionCurveMax: new mp.Vector3(2.5, 10.5, 0), // Адаптивное сцепление

            // Антигравитационная трансмиссия
            fClutchChangeRateScaleUpShift: 15.0,  // Мгновенные переключения
            fClutchChangeRateScaleDownShift: 999.0,
            fInitialDragCoeff: 0.0,               // Отрицательное сопротивление = ускоряющий вакуум
            
            // Экзоскелет вместо кузова
            fMass: 500.0,                           // Масса как у картинга
            vecInertiaMultiplier: new mp.Vector3(1, 1, 1), // Стандартная инерция
            
            // Гипер-привод
            fDriveBiasFront: 0.11,                // 99.9% на передние колёса
            fBrakeForce: 0.5,                      // Тормоза только мешают
            // fSteeringLock: 70.0,                   // Руль поворачивает на 70 градусов
            
            // Секретный параметр из файлов handling.meta
            fInitialDriveMaxFlatVel: 500.0,// Теоретический максимум 1500 км/ч




            vecCentreOfMassOffset: new mp.Vector3(0, 0, -1.0), // Центр масс у пола
fDownforceModifier: 15.0, // Экстремальный прижим
fSuspensionForce: 10.0, // Жесткая подвеска
        };
        // Применяем новые значения handling к автомобилю
        Object.entries(handling).forEach(([key, val]) => {
            vehicle.setHandling(key, val);
        });

        // Дополнительные параметры для контроля поведения автомобиля
        vehicle.setReduceGrip(false);            // true/false — снижение сцепления при необходимости
        vehicle.setTyresCanBurst(false);         // true/false — возможность прокола шин
        vehicle.setCanBeVisiblyDamaged(false);   // true/false — видимые повреждения (царапины, вмятины)
        vehicle.setEngineOn(true, true, false);  // Запускаем двигатель (звуки и эффекты): (true, true, false)

        vehicle.setRocketBoostActive(true);
// vehicle.setBoostActive(1.0);

// vehicle.setBoostLevel(100.0); // Мощность буста
// vehicle.setBoostDuration(30.0); // Длительность 30 сек
// Убрать ограничитель скорости
vehicle.setMaxSpeed(300.0);

// Активировать "гиперпространственный прыжок"
vehicle.setLodMultiplier(100.0); // Отключает LOD-оптимизации
        // Через секунду выводим текущую скорость и ускорение в чат для отладки
        setTimeout(() => {
            mp.gui.chat.push(
                `Авто готово! Скорость: ${(vehicle.getSpeed() * 3.6).toFixed(1)} км/ч, ` +
                `Ускорение: ${vehicle.getAcceleration().toFixed(2)} м/с²` +
                `Максимальная скорость: ${handling.fInitialDriveMaxFlatVel} км/ч`
            );
        }, 1000);

        // Информационное сообщение об успешном создании и настройке болида
        mp.gui.chat.push('Гоночный болид заспавнен и откалиброван!');
    } catch (err) {
        // Если что-то пошло не так — выводим ошибку в чат
        mp.gui.chat.push(`Ошибка спавна авто: ${err.message}`);
    }
}



// Например, вызов при нажатии кнопки:
mp.keys.bind(0x58, true, () => { // X
    spawnCarNearby();
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
