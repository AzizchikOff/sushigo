const express = require('express');
const router = express.Router();
const db = require('../db/init');
const auth = require('../middleware/auth');

// GET /api/products - hammaga ochiq
router.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE is_active = 1').all();
  res.json(products);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });
  res.json(product);
});

// POST /api/products - faqat admin
router.post('/', auth(['admin']), (req, res) => {
  const { name, price, category, image_url } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'name, price, category majburiy' });
  }

  const result = db.prepare(
    'INSERT INTO products (name, price, category, image_url) VALUES (?, ?, ?, ?)'
  ).run(name, price, category, image_url || null);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(product);
});

// PUT /api/products/:id - faqat admin
router.put('/:id', auth(['admin']), (req, res) => {
  const { name, price, category, image_url, is_active } = req.body;

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });

  db.prepare(
    `UPDATE products SET 
      name = ?, price = ?, category = ?, image_url = ?, is_active = ?
     WHERE id = ?`
  ).run(
    name ?? product.name,
    price ?? product.price,
    category ?? product.category,
    image_url ?? product.image_url,
    is_active ?? product.is_active,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/products/:id - faqat admin (soft delete)
router.delete('/:id', auth(['admin']), (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });

  db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Mahsulot o\'chirildi' });
});

module.exports = router;