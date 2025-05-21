const express = require('express');
const router = express.Router();
const Wholesale = require('../models/Wholesale');

// Получить все оптовые товары
router.get('/', async (req, res) => {
    try {
        const wholesaleItems = await Wholesale.findAll();
        res.json(wholesaleItems);
    } catch (error) {
        res.status(500).json({ error: 'Не удалось получить оптовые товары' });
    }
});

// Создать новый оптовый товар
router.post('/', async (req, res) => {
    try {
        const { productName, sku, wholesalePrice, quantity } = req.body;
        const newWholesaleItem = await Wholesale.create({
            productName,
            sku,
            wholesalePrice,
            quantity
        });
        res.status(201).json(newWholesaleItem);
    } catch (error) {
        res.status(500).json({ error: 'Не удалось создать оптовый товар' });
    }
});

// Получить оптовый товар по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const wholesaleItem = await Wholesale.findByPk(id);
        if (!wholesaleItem) {
            return res.status(404).json({ error: 'Оптовый товар не найден' });
        }
        res.json(wholesaleItem);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении оптового товара' });
    }
});

// Обновить оптовый товар по ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, sku, wholesalePrice, quantity } = req.body;
        const wholesaleItem = await Wholesale.findByPk(id);

        if (!wholesaleItem) {
            return res.status(404).json({ error: 'Оптовый товар не найден' });
        }

        wholesaleItem.productName = productName;
        wholesaleItem.sku = sku;
        wholesaleItem.wholesalePrice = wholesalePrice;
        wholesaleItem.quantity = quantity;
        await wholesaleItem.save();

        res.json(wholesaleItem);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при обновлении оптового товара' });
    }
});

// Удалить оптовый товар по ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const wholesaleItem = await Wholesale.findByPk(id);

        if (!wholesaleItem) {
            return res.status(404).json({ error: 'Оптовый товар не найден' });
        }

        await wholesaleItem.destroy();
        res.json({ message: 'Оптовый товар успешно удалён' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении оптового товара' });
    }
});

module.exports = router;