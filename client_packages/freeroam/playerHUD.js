// playerHUD.js
let playerData = {
    inventory: 0,
    count: 0
};

exports.initHUD = () => {
    // Обновление данных при получении с сервера
    mp.events.add('updateUI', (inventory, count) => {
        playerData.inventory = inventory;
        playerData.count = count;
    });

    // Рендер интерфейса
    mp.events.add('render', () => {
        const player = mp.players.local;
        const speed = Math.round(player.getSpeed() * 3.6);
        const pos = player.position;

        // Скорость и мячи
        mp.game.graphics.drawText(
            `Скорость: ${speed} км/ч | Мячи: ${playerData.count}`,
            [0.5, 0.03],
            {
                font: 4,
                color: [255, 255, 255, 220],
                scale: [0.5, 0.5],
                outline: true,
                centre: true
            }
        );

        // Координаты
        mp.game.graphics.drawText(
            `X: ${pos.x.toFixed(1)} Y: ${pos.y.toFixed(1)} Z: ${pos.z.toFixed(1)}`,
            [0.5, 0.075],
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
            {text: "[BACKSPACE] - Закрыть смарфтон", offsetX: 0.065}
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
}