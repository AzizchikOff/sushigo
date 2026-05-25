const express = require('express');
const router = express.Router();
const db = require('../db/init');
const auth = require('../middleware/auth');

// GET /api/expenses - faqat admin
router.get('/', auth(['admin']), (req, res) => {
  const expenses = db.prepare(`
    SELECT e.*, u.name as admin_name FROM expenses e
    JOIN users u ON e.admin_id = u.id
    ORDER BY e.created_at DESC
  `).all();
  res.json(expenses);
});

// POST /api/expenses - faqat admin
router.post('/', auth(['admin']), (req, res) => {
  const { amount, category, description } = req.body;

  if (!amount || !category) {
    return res.status(400).json({ error: 'amount va category majburiy' });
  }

  const result = db.prepare(
    'INSERT INTO expenses (amount, category, description, admin_id) VALUES (?, ?, ?, ?)'
  ).run(amount, category, description || null, req.user.id);

  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(expense);
});

// DELETE /api/expenses/:id - faqat admin
router.delete('/:id', auth(['admin']), (req, res) => {
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!expense) return res.status(404).json({ error: 'Xarajat topilmadi' });

  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ message: 'Xarajat o\'chirildi' });
});

module.exports = router;