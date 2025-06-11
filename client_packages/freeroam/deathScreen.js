let isDead = false;
let alpha  = 0;

mp.events.add('playerDeath', () => {
    mp.gui.chat.push('[DEATH] Клиент получил событие playerDeath');
    mp.events.call('showDeathScreen');
});

mp.events.add('showDeathScreen', () => {
    mp.gui.chat.push('[DEATH] Показываем экран смерти');
    isDead = true;
    alpha  = 0;
});

mp.events.add('hideDeathScreen', () => {
    mp.gui.chat.push('[DEATH] Скрываем экран смерти');
    isDead = false;
    alpha  = 0;
});

/* рисуем каждый кадр */
mp.events.add('render', () => {
    if (!isDead) return;

    alpha = Math.min(alpha + 3, 200);

    mp.game.graphics.drawRect(0.5, 0.5, 1, 1, 0, 0, 0, alpha);
    mp.game.graphics.drawText(
        'Вы умерли… Ожидайте возрождения...',
        [0.5, 0.45],
        {
            font: 4,
            colour: [255, 255, 255, 255],
            scale: [0.65, 0.65],
            outline: true,
            centre: true
        }
    );
});