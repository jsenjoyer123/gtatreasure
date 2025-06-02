// freeroam/smartphone.js
let smartphoneBrowser = null;
let authBrowserLoaded = false;

function openSmartphone() {
    if (!smartphoneBrowser) {
        smartphoneBrowser = mp.browsers.new('localhost:5173');
        const playerId = mp.players.local.remoteId;
        smartphoneBrowser.execute(`window.ragePlayerId = ${playerId};`);
    }
    mp.gui.cursor.visible = true;
}

function closeSmartphone() {
    if (smartphoneBrowser && authBrowserLoaded) {
        smartphoneBrowser.execute(`
            const user = localStorage.getItem('user');
            if (user) {
                window.mp.trigger('closeAuthBrowser', true);
            } else {
                window.mp.trigger('closeAuthBrowser', false);
            }
        `);
    } else if (smartphoneBrowser) {
        smartphoneBrowser.destroy();
        smartphoneBrowser = null;
        mp.gui.cursor.visible = false;
    }
}

// Обработчик закрытия браузера авторизации
mp.events.add('closeAuthBrowser', (isLoggedIn) => {
    if (smartphoneBrowser) {
        if (isLoggedIn) {
            smartphoneBrowser.destroy();
            smartphoneBrowser = null;
            mp.gui.cursor.visible = false;
            authBrowserLoaded = false;
        } else {
            mp.gui.chat.push("Необходимо войти в аккаунт или зарегистрироваться!");
        }
    }
});

// Привязка клавиш
mp.keys.bind(0x4D, true, openSmartphone); // M
mp.keys.bind(0x08, true, closeSmartphone); // Backspace

// Экспортируем функции
exports.openSmartphone = openSmartphone;
exports.closeSmartphone = closeSmartphone;
exports.setAuthBrowserLoaded = (value) => { authBrowserLoaded = value; };