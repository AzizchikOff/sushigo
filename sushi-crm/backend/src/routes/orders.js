const express = require('express');
const router = express.Router();
const db = require('../db/init');
const auth = require('../middleware/auth');

// POST /api/orders - kassir va admin
router.post('/', auth(['admin', 'cashier']), (req, res) => {
  const { items, payment_type } = req.body;

  if (!items || !items.length || !payment_type) {
    return res.status(400).json({ error: 'items va payment_type majburiy' });
  }

  // Jami summani hisoblash
  let total = 0;
  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.product_id);
    if (!product) return res.status(404).json({ error: `Mahsulot topilmadi: ${item.product_id}` });
    total += product.price * item.quantity;
  }

  // Tranzaksiya - order va order_items birga saqlanadi
  const createOrder = db.transaction(() => {
    const order = db.prepare(
      'INSERT INTO orders (total, payment_type, cashier_id) VALUES (?, ?, ?)'
    ).run(total, payment_type, req.user.id);

    for (const item of items) {
      const product = db.prepare('SELECT price FROM products WHERE id = ?').get(item.product_id);
      db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      ).run(order.lastInsertRowid, item.product_id, item.quantity, product.price);
    }

    return db.prepare(`
      SELECT o.*, u.name as cashier_name FROM orders o
      JOIN users u ON o.cashier_id = u.id
      WHERE o.id = ?
    `).get(order.lastInsertRowid);
  });

  const result = createOrder();
  res.status(201).json(result);
});

// GET /api/orders - faqat admin
router.get('/', auth(['admin']), (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, u.name as cashier_name FROM orders o
    JOIN users u ON o.cashier_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 50
  `).all();
  res.json(orders);
});

module.exports = router;