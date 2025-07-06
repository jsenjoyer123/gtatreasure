const express = require('express');
const { Client } = require('pg');
const router = express.Router();
require('dotenv').config();

// Конфигурация PostgreSQL
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

// Инициализация базы данных для товаров
async function initializeProductsDatabase(client) {
    try {
        await client.query('DROP TABLE IF EXISTS products CASCADE');
        console.log('🗑️ Old products table dropped');

        // Проверяем существование таблицы products
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'products'
            )
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('🔄 Создаем таблицу products...');
            await client.query(`
                CREATE TABLE products (
                                          x FLOAT,
                                          y FLOAT,
                                          z FLOAT,
                                          id SERIAL PRIMARY KEY,
                                          name VARCHAR(255) NOT NULL,
                                          price INTEGER NOT NULL,
                                          weight INTEGER NOT NULL,
                                          district VARCHAR(100) NOT NULL,
                                          category VARCHAR(100) NOT NULL,
                                          description TEXT,
                                          image VARCHAR(255),
                                          temp_id VARCHAR(100) UNIQUE,
                                          created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('✅ Таблица products создана');
        }

        // Очищаем существующие данные
        await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
        console.log('🔄 Таблица products очищена');

        // Добавляем тестовые данные товаров
        const products = [
            {
                name: 'Смартфон Vivo',
                price: 149990,
                weight: 2500,
                district: 'Центральный',
                category: 'Электроника',
                description: 'RTX 4080, 32GB DDR5, 1TB SSD, 17.3" 240Hz',
                temp_id: `temp-${Date.now()}-1`,
                image: 'https://loremflickr.com/400/300/electronics?lock=1',
                 x: 0,
                 y: 0,
                 z: 0
            },
            {
                name: 'Смартфон Oppo',
                price: 99990,
                weight: 187,
                district: 'Северный',
                category: 'Электроника',
                description: '6.1" OLED, A17 Bionic, 256GB',
                temp_id: `temp-${Date.now()}-2`,
                image: 'https://loremflickr.com/400/300/electronics?lock=2',
                 x: 0,
                 y: 0,
                 z: 0
            },
            {
                name: 'Смартфон Vivo',
                price: 89990,
                weight: 85000,
                district: 'Центральный',
                category: 'Мебель',
                description: 'Кожаная обивка, модульная система',
                temp_id: `temp-${Date.now()}-3`,
                image: 'https://loremflickr.com/400/300/furniture?lock=1',
                 x: 0,
                 y: 0,
                 z: 0
            }
        ];

        for (const product of products) {
            await client.query(`
                INSERT INTO products (name, price, weight, district, category, description, temp_id, image, x, y, z)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
                product.name,
                product.price,
                product.weight,
                product.district,
                product.category,
                product.description,
                product.temp_id,
                product.image,
                product.x,
                product.y,
                product.z
            ]);
        }
        console.log('✅ Тестовые товары перезаписаны');

    } catch (err) {
        console.error('Ошибка инициализации БД (продукты):', err);
        throw err;
    }
}

// Получение всех товаров
router.get('/products', async (req, res) => {
    const client = new Client(dbConfig);

    try {
        await client.connect();

        const result = await client.query(`
      SELECT 
        id, name, price, weight, district, category, 
        description, image, x, y, z, temp_id as "tempId", 
        id as "serverId"
      FROM products
      ORDER BY category, name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении товаров' });
    } finally {
        await client.end();
    }
});

// Получение товаров по категории
router.get('/products/category/:category', async (req, res) => {
    const { category } = req.params;
    const client = new Client(dbConfig);

    try {
        await client.connect();

        const result = await client.query(`
      SELECT 
        id, name, price, weight, district, category, 
        description, image, x, y, z, temp_id as "tempId", 
        id as "serverId"
      FROM products
      WHERE category = $1
      ORDER BY name
    `, [category]);

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения товаров по категории:', error);
        res.status(500).json({ message: 'Ошибка сервера при фильтрации товаров' });
    } finally {
        await client.end();
    }
});

// Обработка покупки
router.post('/purchase', async (req, res) => {
    const { productId, quantity = 1, userId } = req.body;
    const client = new Client(dbConfig);

    if (!productId) {
        return res.status(400).json({ message: 'Не указан ID товара' });
    }

    try {
        await client.connect();

        // Находим товар
        let product;
        if (productId.startsWith('temp-')) {
            // Поиск по временному ID
            const result = await client.query(`
        SELECT * FROM products WHERE temp_id = $1
      `, [productId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Товар не найден' });
            }

            product = result.rows[0];
        } else {
            // Поиск по ID в базе
            const result = await client.query(`
        SELECT * FROM products WHERE id = $1
      `, [productId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Товар не найден' });
            }

            product = result.rows[0];
        }

        // Создаем запись о покупке
        const totalPrice = product.price * quantity;

        const purchaseResult = await client.query(`
      INSERT INTO purchases (product_id, user_id, quantity, total_price)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [product.id, userId || null, quantity, totalPrice]);

        const purchaseId = purchaseResult.rows[0].id;

        res.status(201).json({
            message: 'Покупка успешно выполнена',
            purchaseId,
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                totalPrice
            }
        });

    } catch (error) {
        console.error('Ошибка при обработке покупки:', error);
        res.status(500).json({ message: 'Ошибка сервера при обработке покупки' });
    } finally {
        await client.end();
    }
});

// Получение истории покупок пользователя
router.get('/purchases/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const client = new Client(dbConfig);

    try {
        await client.connect();

        const result = await client.query(`
      SELECT 
        p.id as purchase_id,
        p.created_at as purchase_date,
        p.quantity,
        p.total_price,
        p.status,
        pr.id as product_id,
        pr.name as product_name,
        pr.image as product_image,
        pr.category as product_category
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения истории покупок:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении истории покупок' });
    } finally {
        await client.end();
    }
});

module.exports = {
    router,
    initializeProductsDatabase
};