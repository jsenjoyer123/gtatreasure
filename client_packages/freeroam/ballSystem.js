// freeroam/ballSystem.js
let playerData = {
    inventory: 0,
    count: 0
};

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
    // Обработка нажатия клавиш
    mp.keys.bind(0x58, true, () => mp.events.callRemote('spawnObjectNearby', true)); // X
    mp.keys.bind(0x50, true, () => {
        // Проверка наличия мячей локально для мгновенной обратной связи
        if (playerData.inventory > 0) {
            mp.events.callRemote('eatBall');
        }
    }); // P

    // Обновление интерфейса
    mp.events.add('updateInventory', (inventory, count) => {
        playerData.inventory = inventory;
        playerData.count = count;
        mp.gui.chat.push(`Мячей: ${inventory} | Собрано: ${count}`);
        mp.players.local.setVariable('inventory', inventory);
    });

    // Сбор мяча
    mp.events.add('clientCollectBall', async (ballId) => {
        const ball = mp.objects.at(ballId);
        if (!ball) return;

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
};