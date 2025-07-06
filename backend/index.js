const express = require('express');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const productsRoutes = require('./routes/productsRoutes');
const wholesaleProductsRoutes = require('./routes/wholesaleProductsRoutes');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept']
}));

// Middleware
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/api', productsRoutes.router);
app.use('/api/wholesale', wholesaleProductsRoutes.router);

// Конфигурация PostgreSQL
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

// Проверка подключения к БД при запуске
async function initializeDatabase(client) {
    try {

        const tableCheck = await client.query(`
            SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('🔄 Создаем таблицу users...');
            await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('✅ Таблица users создана');

            const saltRounds = 10;
            const passwordHash = await bcrypt.hash('password', saltRounds);
            await client.query(
                'INSERT INTO users(username, password_hash) VALUES($1, $2)',
                ['testuser', passwordHash]
            );
            console.log('✅ Тестовый пользователь создан');
        }
    } catch (err) {
        console.error('❌ Ошибка инициализации БД (users):', err);
        throw err; // Пробрасываем ошибку, чтобы остановить запуск
    }
}

// Middleware для логирования запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Роут авторизации
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const result = await client.query('SELECT id, username, password_hash FROM users WHERE username = $1', [username.toLowerCase().trim()]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }
        res.json({ message: 'Авторизация успешна', user: { id: user.id, username: user.username } });
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    } finally {
        await client.end();
    }
});

// Роут регистрации
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Все поля обязательны' });
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.status(400).json({ message: 'Username должен содержать от 3 до 20 символов' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
    }
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const existingUser = await client.query('SELECT id FROM users WHERE username = $1', [username.toLowerCase().trim()]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Пользователь уже существует' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.query('INSERT INTO users(username, password_hash) VALUES($1, $2) RETURNING id, username', [username.toLowerCase().trim(), hashedPassword]);
        res.status(201).json({ message: 'Регистрация успешна', user: result.rows[0] });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    } finally {
        await client.end();
    }
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Глобальная ошибка:', err);
    res.status(500).json({ message: 'Произошла непредвиденная ошибка' });
});

// Запуск сервера
async function startServer() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('✅ PostgreSQL подключен для инициализации');

        console.log('Шаг 1: Инициализация основной БД (users)...');
        await initializeDatabase(client);
        console.log('Шаг 1: Инициализация основной БД (users) завершена.');

        console.log('Шаг 2: Инициализация БД продуктов...');
        await productsRoutes.initializeProductsDatabase(client);
        console.log('Шаг 2: Инициализация БД продуктов завершена.');

        console.log('Шаг 3: Инициализация оптовой БД...');
        await wholesaleProductsRoutes.init(client);
        console.log('Шаг 3: Инициализация оптовой БД завершена.');

        console.log('✅ Вся инициализация завершена. Запуск сервера...');
        
        app.listen(port, () => {
            console.log(`🚀 Сервер запущен на порту ${port}`);
        });

    } catch (error) {
        console.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.end();
            console.log('🔌 Соединение с PostgreSQL для инициализации закрыто.');
        }
    }
}

startServer();