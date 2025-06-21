// playerHUD.js
let playerData = {
    inventory: 0,
    count: 0,
    balance: 0 // Кастомный баланс для отображения в HUD
};

exports.initHUD = () => {
    // Обновление данных при получении с сервера
    mp.events.add('updateUI', (inventory, count) => {
        playerData.inventory = inventory;
        playerData.count = count;
    });

    // Обновление кастомного баланса при получении с сервера
    mp.events.add('updateBalance', (balance) => {
        playerData.balance = balance;
        mp.gui.chat.push(`💰 Ваш баланс обновлен: ${balance.toLocaleString()} ₽`);
    });

    // Установка нативного GTA баланса
    mp.events.add('setNativeBalance', (balance) => {
        try {
            // Устанавливаем нативный баланс GTA
            mp.game.player.setMoney(balance);

            // Также обновляем наш кастомный баланс
            playerData.balance = balance;

            console.log(`[CLIENT] Установлен нативный баланс: ${balance}`);
            mp.gui.chat.push(`🎮 Нативный GTA баланс установлен: ${balance.toLocaleString()} ₽`);
        } catch (error) {
            console.error(`[CLIENT] Ошибка установки нативного баланса: ${error}`);
        }
    });

    // Функция для получения текущего нативного баланса
    mp.events.add('getNativeBalance', () => {
        try {
            const nativeBalance = mp.game.player.getMoney();
            console.log(`[CLIENT] Текущий нативный баланс: ${nativeBalance}`);
            return nativeBalance;
        } catch (error) {
            console.error(`[CLIENT] Ошибка получения нативного баланса: ${error}`);
            return 0;
        }
    });

    // Рендер интерфейса
    mp.events.add('render', () => {
        const player = mp.players.local;
        const speed = Math.round(player.getSpeed() * 3.6);
        const pos = player.position;

        // Получаем текущий нативный баланс для отображения
        let nativeBalance = 0;
        try {
            nativeBalance = mp.game.player.getMoney();
        } catch (error) {
            nativeBalance = playerData.balance; // Фоллбэк на кастомный баланс
        }

        // Скорость, мячи и баланс (показываем нативный баланс)
        mp.game.graphics.drawText(
            `Скорость: ${speed} км/ч | Мячи: ${playerData.count} | Баланс: ${nativeBalance.toLocaleString()} ₽`,
            [0.5, 0.03],
            {
                font: 4,
                color: [255, 255, 255, 220],
                scale: [0.5, 0.5],
                outline: true,
                centre: true
            }
        );

        // Дополнительная информация о балансе (для отладки)
        mp.game.graphics.drawText(
            `Нативный: ${nativeBalance.toLocaleString()} ₽ | Кастомный: ${playerData.balance.toLocaleString()} ₽`,
            [0.5, 0.06],
            {
                font: 4,
                color: [200, 200, 200, 150],
                scale: [0.3, 0.3],
                outline: true,
                centre: true
            }
        );

        // Координаты
        mp.game.graphics.drawText(
            `X: ${pos.x.toFixed(1)} Y: ${pos.y.toFixed(1)} Z: ${pos.z.toFixed(1)}`,
            [0.5, 0.095],
            {
                font: 4,
                color: [200, 200, 200, 180],
                scale: [0.4, 0.4],
                outline: true,
                centre: true
            }
        );

        // Блок управления
        const controlsConfig = {
            startY: 0.4,
            yStep: 0.045,
            colors: {
                header: [100, 200, 255, 220],
                text: [220, 220, 220, 200]
            }
        };

        const controls = [
            {text: "Управление", offsetX: 0.03},
            {text: "[M] - Телефон", offsetX: 0.03},
            {text: "[X] - Оставить клад", offsetX: 0.04},
            {text: "[P] - Дунуть", offsetX: 0.025},
            {text: "[B] - Проверить баланс", offsetX: 0.045}, // Новая команда
            {text: "[BACKSPACE] - Закрыть смартфон", offsetX: 0.065}
        ];

        controls.forEach((item, index) => {
            const yPos = controlsConfig.startY + (index * controlsConfig.yStep);
            const style = {
                font: 4,
                color: index < 1 ? controlsConfig.colors.header : controlsConfig.colors.text,
                scale: [0.45, 0.45],
                outline: true
            };

            mp.game.graphics.drawText(item.text, [item.offsetX, yPos], style);
        });
    });

    // Обработчик клавиши B для проверки баланса
    mp.keys.bind(0x42, true, () => { // B key
        try {
            const nativeBalance = mp.game.player.getMoney();
            mp.gui.chat.push(`🎮 Нативный GTA баланс: ${nativeBalance.toLocaleString()} ₽`);
            mp.gui.chat.push(`💰 Кастомный баланс: ${playerData.balance.toLocaleString()} ₽`);
        } catch (error) {
            mp.gui.chat.push(`❌ Ошибка проверки баланса: ${error}`);
        }
    });
}