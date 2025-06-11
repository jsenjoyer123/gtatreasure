// freeroam/smartphone.js
// =============================================================
//  CEF-смартфон. Не открывается, пока активно окно авторизации
// =============================================================

/* -------------------------------------------------------------
 *  Переменные
 * ----------------------------------------------------------- */
let smartphoneBrowser   = null;  // ссылка на CEF-окно смартфона
let authBrowserLoaded   = false; // true, пока открыта авторизация
const SMARTPHONE_URL    = 'http://localhost:5173/'; // главная страница SPA

/* -------------------------------------------------------------
 *  Открыть смартфон
 * ----------------------------------------------------------- */
function openSmartphone () {
    // Запрещаем открывать, пока идёт авторизация
    if (authBrowserLoaded) {
        mp.gui.chat.push('Сначала завершите авторизацию!');
        return;
    }

    // Если уже открыт – повторный вызов пропускаем
    if (smartphoneBrowser) return;

    smartphoneBrowser = mp.browsers.new(SMARTPHONE_URL);

    // Передаём id игрока внутрь приложения
    const playerId = mp.players.local.remoteId;
    smartphoneBrowser.execute(`window.ragePlayerId = ${playerId};`);

    // Показываем курсор и убираем лишний интерфейс
    mp.gui.cursor.show(true, true);
    mp.game.ui.displayHud(false);
    mp.game.ui.displayRadar(false);
    mp.gui.chat.show(false);
}

/* -------------------------------------------------------------
 *  Закрыть смартфон
 * ----------------------------------------------------------- */
function closeSmartphone () {
    if (!smartphoneBrowser) return;

    smartphoneBrowser.destroy();
    smartphoneBrowser = null;

    // Возвращаем интерфейс игры
    mp.gui.cursor.show(false, false);
    mp.game.ui.displayHud(true);
    mp.game.ui.displayRadar(true);
    mp.gui.chat.show(true);
}

/* -------------------------------------------------------------
 *  Сеттер флага авторизации
 *  Используется из authBrowser.js и client index.js
 * ----------------------------------------------------------- */
function setAuthBrowserLoaded (state) {
    authBrowserLoaded = !!state;

    // Если авторизация закрылась, можно сразу показать HUD/чат
    if (!authBrowserLoaded && smartphoneBrowser) {
        mp.gui.cursor.show(true, true); // оставить курсор, смартфон уже открыт
    }
}

/* -------------------------------------------------------------
 *  Горячие клавиши
 * ----------------------------------------------------------- */
// открыть смартфон – клавиша M (0x4D), по клику
mp.keys.bind(0x4D, true, () => {
    // Чтобы не запускать нажатие, когда фокус в CEF
    if (mp.gui.cursor.visible) return;
    openSmartphone();
});

// закрыть смартфон – Backspace (0x08), по клику
mp.keys.bind(0x08, true, () => {
    if (!smartphoneBrowser) return;
    closeSmartphone();
});

/* -------------------------------------------------------------
 *  Экспорт
 * ----------------------------------------------------------- */
exports.openSmartphone        = openSmartphone;
exports.closeSmartphone       = closeSmartphone;
exports.setAuthBrowserLoaded  = setAuthBrowserLoaded;