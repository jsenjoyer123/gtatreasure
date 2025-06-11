
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
async function initializeDatabase() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('✅ PostgreSQL подключен');

        // Проверяем существование таблицы users
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'users'
            )
        `);

        if (tableCheck.rows[0].exists) {
            // Проверяем структуру таблицы
            const columnCheck = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'username'
            `);

            if (columnCheck.rows.length === 0) {
                console.log('🔄 Обнаружена старая структура таблицы users. Пересоздаем...');
                // Удаляем старую таблицу
                await client.query('DROP TABLE IF EXISTS users');
                console.log('🗑️ Старая таблица users удалена');
            }
        }

        // Проверяем снова, нужно ли создать таблицу
        const tableCheckAgain = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'users'
            )
        `);

        if (!tableCheckAgain.rows[0].exists) {
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

            // Добавляем тестового пользователя
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash('password', saltRounds);
            await client.query(
                'INSERT INTO users(username, password_hash) VALUES($1, $2)',
                ['testuser', passwordHash]
            );
            console.log('✅ Тестовый пользователь создан');
        }

    } catch (err) {
        console.error('❌ Ошибка инициализации БД:', err);
        process.exit(1);
    } finally {
        await client.end();
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

        // Поиск пользователя по username
        const result = await client.query(
            'SELECT id, username, password_hash FROM users WHERE username = $1',
            [username.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        const user = result.rows[0];

        // Проверка пароля
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        // Успешный ответ
        res.json({
            message: 'Авторизация успешна',
            user: {
                id: user.id,
                username: user.username
            }
        });

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

    // Валидация
    if (!username || !password) {
        return res.status(400).json({ message: 'Все поля обязательны' });
    }

    // Валидация username
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.status(400).json({ message: 'Username должен содержать от 3 до 20 символов (буквы, цифры, подчеркивания)' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
    }

    const client = new Client(dbConfig);

    try {
        await client.connect();

        // Проверка существующего пользователя
        const existingUser = await client.query(
            'SELECT id FROM users WHERE username = $1',
            [username.toLowerCase().trim()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Пользователь уже существует' });
        }

        // Хеширование пароля
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Создание пользователя
        const result = await client.query(
            'INSERT INTO users(username, password_hash) VALUES($1, $2) RETURNING id, username',
            [username.toLowerCase().trim(), hashedPassword]
        );

        res.status(201).json({
            message: 'Регистрация успешна',
            user: result.rows[0]
        });

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
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`🚀 Сервер запущен на порту ${port}`);
    });
});