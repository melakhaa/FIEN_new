const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all transactions for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const transactions = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
      [req.user.userId]
    );
    res.json(transactions.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;
    
    const newTransaction = await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description, category, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.userId, type, amount, description, category, date || new Date()]
    );
    
    res.status(201).json(newTransaction.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update transaction
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, category, date } = req.body;
    
    const updatedTransaction = await pool.query(
      'UPDATE transactions SET type = $1, amount = $2, description = $3, category = $4, date = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [type, amount, description, category, date, id, req.user.userId]
    );
    
    if (updatedTransaction.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(updatedTransaction.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedTransaction = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    
    if (deletedTransaction.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get summary (total income, expenses, balance)
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const summary = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
      FROM transactions 
      WHERE user_id = $1
    `, [req.user.userId]);
    
    res.json(summary.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;