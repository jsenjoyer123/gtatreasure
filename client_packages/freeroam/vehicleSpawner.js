// freeroam/vehicleSpawner.js
async function loadModel(modelHash, timeoutMs = 5000) {
    if (!mp.game.streaming.hasModelLoaded(modelHash)) {
        mp.game.streaming.requestModel(modelHash);
        const startTime = Date.now();
        while (!mp.game.streaming.hasModelLoaded(modelHash)) {
            if (Date.now() - startTime > timeoutMs) {
                throw new Error('Не удалось загрузить модель');
            }
            await new Promise(res => setTimeout(res, 100));
        }
    }
}

exports.spawnCarNearby = async () => {
    try {
        const modelName = 'cheburek'
        // const modelName = 'tezeract';
        const modelHash = mp.game.joaat(modelName);
        await loadModel(modelHash);

        const player = mp.players.local;
        const spawnPos = new mp.Vector3(
            player.position.x + 3,
            player.position.y,
            player.position.z
        );

        const vehicle = mp.vehicles.new(modelHash, spawnPos, {
            heading: player.heading,
            numberPlate: 'NOSPEED',
            alpha: 10,
            locked: false,
            engine: true,
        });

        vehicle.setCanBeDamaged(false);
        vehicle.setInvincible(true);
        vehicle.setEngineHealth(1000);
        vehicle.setBodyHealth(1000);
        vehicle.setPetrolTankHealth(1000);

        const handlingSettings = {
            fInitialDriveForce: 2000.0,
            nInitialDriveGears: 6,
            fClutchChangeRateScaleUpShift: 25.0,
            fClutchChangeRateScaleDownShift: 999.0,
            fInitialDragCoeff: 0.0,
            fBrakeForce: 0.5,
            fInitialDriveMaxFlatVel: 500
        };

        Object.entries(handlingSettings).forEach(([key, val]) => {
            vehicle.setHandling(key, val);
        });

        vehicle.setReduceGrip(false);
        vehicle.setTyresCanBurst(false);
        vehicle.setCanBeVisiblyDamaged(false);
        vehicle.setEngineOn(true, true, false);
        vehicle.setRocketBoostActive(true);
        vehicle.setMaxSpeed(300.0);
        vehicle.setLodMultiplier(100.0);

        mp.gui.chat.push('Гоночный болид заспавнен!');
    } catch (err) {
        mp.gui.chat.push(`Ошибка спавна авто: ${err.message}`);
    }
}
