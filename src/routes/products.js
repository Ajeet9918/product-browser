const express = require('express');
const router = express.Router();
const pool = require('../db');

function decodeCursor(cursor) {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function encodeCursor(product) {
  return Buffer.from(JSON.stringify({
    created_at: product.created_at,
    id: product.id
  })).toString('base64url');
}

router.get('/', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const category = req.query.category?.trim() || null;
  const cursor = req.query.cursor || null;

  const params = [];
  const conditions = [];
  let i = 1;

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (!decoded) {
      return res.status(400).json({ error: 'Invalid cursor' });
    }
    conditions.push(`(created_at, id) < ($${i++}::timestamptz, $${i++}::bigint)`);
    params.push(decoded.created_at, decoded.id);
  }

  if (category) {
    conditions.push(`category = $${i++}`);
    params.push(category);
  }

  const whereClause = conditions.length
    ? 'WHERE ' + conditions.join(' AND ')
    : '';

  params.push(limit + 1);

  try {
    const { rows } = await pool.query(
      `SELECT id, name, category, price, created_at, updated_at
       FROM products
       ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT $${i}`,
      params
    );

    const hasNextPage = rows.length > limit;
    const products = hasNextPage ? rows.slice(0, limit) : rows;

    res.json({
      data: products,
      pagination: {
        limit,
        hasNextPage,
        nextCursor: hasNextPage ? encodeCursor(products[products.length - 1]) : null
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT DISTINCT category FROM products ORDER BY category'
    );
    res.json(rows.map(r => r.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;