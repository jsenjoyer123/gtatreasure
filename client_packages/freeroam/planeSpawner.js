// Спавн самолёта рядом с игроком по нажатию F7.
// Авторизация не проверяется – при необходимости добавьте свою логику.

const SPAWN_KEY      = 0x76;           // F7 – свободная клавиша по-умолчанию
const planeModelName = 'velum';        // Модель самолёта, можно заменить на dodo, luxor2 и т.д.
const spawnCooldown  = 5000;           // анти-спам: 5 секунд

let lastSpawn = 0;

// Главная функция
async function spawnPlaneNearby () {
    const now = Date.now();
    if (now - lastSpawn < spawnCooldown) {
        mp.gui.chat.push('~r~Подождите пару секунд прежде, чем спавнить ещё один самолёт.');
        return;
    }
    lastSpawn = now;

    const modelHash = mp.game.joaat(planeModelName);

    // Проверяем, действительно ли это самолёт/вертолёт
    if (
        !mp.game.vehicle.isThisModelAPlane(modelHash) &&
        !mp.game.vehicle.isThisModelAHeli(modelHash)
    ){
        mp.gui.chat.push(`~r~${planeModelName} не является самолётом или вертолётом.`);
        return;
    }

    // Запрашиваем модель
    if (!mp.game.streaming.hasModelLoaded(modelHash)) {
        mp.game.streaming.requestModel(modelHash);

        // ждём до 50×100мс (5 с.)
        await new Promise((resolve, reject) => {
            let tries = 0;
            const intv = setInterval(() => {
                if (mp.game.streaming.hasModelLoaded(modelHash)) {
                    clearInterval(intv); resolve();
                } else if (++tries > 50) {
                    clearInterval(intv); reject(new Error('Не удалось загрузить модель самолёта'));
                }
            }, 100);
        }).catch(err => {
            mp.gui.chat.push('~r~' + err.message);
            return;
        });
    }

    // Координаты появления – впереди на 10 м.
    const player  = mp.players.local;
    const forward = player.getForwardVector();
    const pos     = new mp.Vector3(
        player.position.x + forward.x * 10,
        player.position.y + forward.y * 10,
        player.position.z + 2           // чуть выше земли
    );

    const plane = mp.vehicles.new(modelHash, pos, {
        heading: player.heading,
        numberPlate: 'AIR★',
        engine: true
    });

    // Базовая «неубиваемость» (по желанию уберите)
    plane.setInvincible(true);
    plane.setCanBeDamaged(false);

    // Сразу усаживаем игрока в кабину
    player.taskWarpIntoVehicle(plane.handle, 0);

    mp.gui.chat.push('~g~Самолёт заспавнен!');
}

// Привязываем к клавише F7
mp.keys.bind(SPAWN_KEY, false, () => {
    // Игнор, если открыт курсор/чат/меню
    if (mp.gui.cursor.visible || mp.gui.chat.enabled) return;
    spawnPlaneNearby();
});