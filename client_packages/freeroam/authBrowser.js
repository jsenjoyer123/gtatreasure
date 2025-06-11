// freeroam/authBrowser.js

/* ============================================================
 *  Браузер регистрации / авторизации
 *  Исправлена передача фокуса – теперь CEF-окно
 *  получает его сразу после создания без ожидания
 *  DOMContentLoaded.
 * ============================================================
 */

let authBrowserLoaded = false;   // открыт ли сейчас браузер
let authBrowserInstance = null;  // ← ПЕРЕИМЕНОВАНО для избежания конфликта

/**
 * Открывает страницу регистрации / авторизации.
 * При повторном вызове не создаёт новый браузер,
 * если предыдущий ещё активен.
 */
function openAuthBrowser () {
    if (authBrowserLoaded) return;

    // удаляем ранее открытое окно, если оно почему-то осталось
    if (authBrowserInstance) {
        authBrowserInstance.destroy();
        authBrowserInstance = null;
    }

    // создаём CEF-браузер
    authBrowserInstance = mp.browsers.new('http://localhost:5173/register');
    const playerId = mp.players.local.remoteId;

    /* сразу передаём в окно id игрока
       и устанавливаем фокус, не дожидаясь событий загрузки */
    authBrowserInstance.execute(`
        window.ragePlayerId = ${playerId};
        if (typeof mp !== 'undefined') mp.invoke('focus', true);
    `);

    // настраиваем интерфейс клиента
    mp.gui.cursor.show(true, true);       // курсор + клики
    mp.game.ui.displayRadar(false);
    mp.game.ui.displayHud(false);
    mp.gui.chat.show(false);              // скрываем чат, чтобы Enter не открывал его

    authBrowserLoaded = true;
}

/**
 * Закрывает окно авторизации и возвращает интерфейс к обычному виду.
 */
function closeAuthBrowser () {
    if (!authBrowserInstance) return;

    authBrowserInstance.destroy();
    authBrowserInstance = null;

    mp.gui.cursor.show(false, false);
    mp.game.ui.displayRadar(true);
    mp.game.ui.displayHud(true);
    mp.gui.chat.show(true);

    authBrowserLoaded = false;
}

/* ===== Экспортируем функции (CommonJS) ===================== */
exports.openAuthBrowser  = openAuthBrowser;
exports.closeAuthBrowser = closeAuthBrowser;