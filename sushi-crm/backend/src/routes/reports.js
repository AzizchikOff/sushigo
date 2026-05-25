const express = require('express');
const router = express.Router();
const db = require('../db/init');
const auth = require('../middleware/auth');

// GET /api/reports/daily - kunlik hisobot
router.get('/daily', auth(['admin']), (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];

  const sales = db.prepare(`
    SELECT 
      COUNT(*) as orders_count,
      COALESCE(SUM(total), 0) as total_sales,
      COALESCE(SUM(CASE WHEN payment_type = 'cash' THEN total ELSE 0 END), 0) as cash,
      COALESCE(SUM(CASE WHEN payment_type = 'card' THEN total ELSE 0 END), 0) as card,
      COALESCE(SUM(CASE WHEN payment_type = 'click' THEN total ELSE 0 END), 0) as click,
      COALESCE(SUM(CASE WHEN payment_type = 'payme' THEN total ELSE 0 END), 0) as payme
    FROM orders
    WHERE DATE(created_at) = ?
  `).get(date);

  const expenses = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total_expenses
    FROM expenses
    WHERE DATE(created_at) = ?
  `).get(date);

  res.json({
    date,
    orders_count: sales.orders_count,
    total_sales: sales.total_sales,
    cash: sales.cash,
    card: sales.card,
    click: sales.click,
    payme: sales.payme,
    total_expenses: expenses.total_expenses,
    profit: sales.total_sales - expenses.total_expenses
  });
});

// GET /api/reports/monthly - oylik hisobot
router.get('/monthly', auth(['admin']), (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  const sales = db.prepare(`
    SELECT 
      COUNT(*) as orders_count,
      COALESCE(SUM(total), 0) as total_sales
    FROM orders
    WHERE strftime('%Y-%m', created_at) = ?
  `).get(month);

  const expenses = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total_expenses
    FROM expenses
    WHERE strftime('%Y-%m', created_at) = ?
  `).get(month);

  const top_products = db.prepare(`
    SELECT p.name, SUM(oi.quantity) as total_qty, SUM(oi.quantity * oi.price) as total_sum
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE strftime('%Y-%m', o.created_at) = ?
    GROUP BY p.id
    ORDER BY total_qty DESC
    LIMIT 5
  `).all(month);

  res.json({
    month,
    orders_count: sales.orders_count,
    total_sales: sales.total_sales,
    total_expenses: expenses.total_expenses,
    profit: sales.total_sales - expenses.total_expenses,
    top_products
  });
});

module.exports = router;