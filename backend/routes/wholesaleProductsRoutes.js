// wholesaleProductsRoutes.js
const express = require('express');
const { Client } = require('pg');
const router = express.Router();
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

// Инициализация таблиц для оптовых операций
async function initializeWholesaleDatabase() {
    const client = new Client(dbConfig);
    try {
        await client.connect();

        // Проверка и создание таблицы товаров (если не существует)
        const productsTable = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'wholesale_products'
            )
        `);

        if (!productsTable.rows[0].exists) {
            await client.query(`
                CREATE TABLE wholesale_products (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    price INTEGER NOT NULL,
                    weight INTEGER NOT NULL,
                    stock INTEGER NOT NULL DEFAULT 0,
                    district VARCHAR(100) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    description TEXT,
                    image VARCHAR(255),
                    temp_id VARCHAR(100) UNIQUE,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);

            // Таблицы для оптовых заказов
            await client.query(`
                CREATE TABLE wholesale_orders (
                    id SERIAL PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT NOW(),
                    total_price INTEGER NOT NULL,
                    status VARCHAR(50) DEFAULT 'processing'
                )
            `);

            await client.query(`
                CREATE TABLE wholesale_order_items (
                    order_id INTEGER REFERENCES wholesale_orders(id),
                    product_id INTEGER REFERENCES wholesale_products(id),
                    quantity INTEGER NOT NULL,
                    price INTEGER NOT NULL,
                    PRIMARY KEY (order_id, product_id)
                )
            `);

            // Тестовые данные
            const products = [
                {
                    name: 'Смартфон Vivo',
                    price: 129990,
                    weight: 2500,
                    stock: 100,
                    district: 'Центральный',
                    category: 'Электроника',
                    description: 'RTX 4080, 32GB DDR5, 1TB SSD, 17.3" 240Hz',
                    temp_id: `wholesale-temp-${Date.now()}-1`,
                    image: 'https://loremflickr.com/400/300/electronics?lock=1'
                }
            ];

            for (const product of products) {
                await client.query(`
                    INSERT INTO wholesale_products 
                    (name, price, weight, stock, district, category, description, temp_id, image)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    product.name,
                    product.price,
                    product.weight,
                    product.stock,
                    product.district,
                    product.category,
                    product.description,
                    product.temp_id,
                    product.image
                ]);
            }
        }
    } catch (err) {
        console.error('Ошибка инициализации оптовой БД:', err);
    } finally {
        await client.end();
    }
}

// Получение оптовых товаров
router.get('/products', async (req, res) => {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const result = await client.query(`
            SELECT 
                id, name, price, weight, stock,
                district, category, description, 
                image, temp_id as "tempId",
                id as "serverId"
            FROM wholesale_products
            ORDER BY category, name
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения товаров' });
    } finally {
        await client.end();
    }
});

// Создание оптового заказа
router.post('/orders', async (req, res) => {
    const { items } = req.body;
    const client = new Client(dbConfig);

    try {
        await client.connect();
        await client.query('BEGIN');

        // Проверка наличия товаров
        for (const item of items) {
            const product = await client.query(
                'SELECT stock, price FROM wholesale_products WHERE id = $1 FOR UPDATE',
                [item.productId]
            );

            if (product.rows[0].stock < item.quantity) {
                throw new Error(`Недостаточно товара ID: ${item.productId}`);
            }
        }

        // Расчет общей стоимости
        let totalPrice = 0;
        for (const item of items) {
            const product = await client.query(
                'SELECT price FROM wholesale_products WHERE id = $1',
                [item.productId]
            );
            totalPrice += product.rows[0].price * item.quantity;
        }

        // Создание заказа
        const orderResult = await client.query(
            'INSERT INTO wholesale_orders (total_price) VALUES ($1) RETURNING id',
            [totalPrice]
        );
        const orderId = orderResult.rows[0].id;

        // Добавление позиций заказа
        for (const item of items) {
            const product = await client.query(
                'SELECT price FROM wholesale_products WHERE id = $1',
                [item.productId]
            );

            await client.query(
                'INSERT INTO wholesale_order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.productId, item.quantity, product.rows[0].price]
            );

            // Обновление остатков
            await client.query(
                'UPDATE wholesale_products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.productId]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({
            message: 'Оптовый заказ оформлен',
            orderId,
            totalPrice
        });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: error.message });
    } finally {
        await client.end();
    }
});

initializeWholesaleDatabase();

module.exports = { router };