const pool = require('./db');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id        BIGSERIAL PRIMARY KEY,
      name      TEXT NOT NULL,
      category  TEXT NOT NULL,
      price     NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_products_created_at_id
      ON products (created_at DESC, id DESC);

    CREATE INDEX IF NOT EXISTS idx_products_category
      ON products (category, created_at DESC, id DESC);
  `);

  console.log('Migration done!');
  process.exit(0);
}

migrate().catch(console.error);