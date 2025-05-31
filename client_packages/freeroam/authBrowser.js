// authBrowser.js
let authBrowserLoaded = false;
let smartphoneBrowser = null;

function openAuthBrowser() {
    if (!authBrowserLoaded) {
        // Уничтожаем существующий браузер если он есть
        if (smartphoneBrowser) {
            smartphoneBrowser.destroy();
            smartphoneBrowser = null;
        }

        // Создаем браузер ДО установки фокуса
        smartphoneBrowser = mp.browsers.new('localhost:5173/register');
        const playerId = mp.players.local.remoteId;

        // Ждем готовности браузера
        smartphoneBrowser.execute(`
            window.ragePlayerId = ${playerId};
            document.addEventListener('DOMContentLoaded', () => {
                mp.invoke('focus', true);
            });
        `);

        // Настройки интерфейса ПОСЛЕ создания браузера
        mp.gui.cursor.show(true, true);
        mp.game.ui.displayRadar(false);
        mp.game.ui.displayHud(false);
        mp.gui.chat.activate(false);

        authBrowserLoaded = true;
    }
}

function closeAuthBrowser() {
    if (smartphoneBrowser) {
        smartphoneBrowser.destroy();
        smartphoneBrowser = null;
        mp.gui.cursor.visible = false;
        authBrowserLoaded = false;
    }
}

// Экспорт для CommonJS
exports.openAuthBrowser = openAuthBrowser;
exports.closeAuthBrowser = closeAuthBrowser;