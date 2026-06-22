const pool = require('./db');

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Food', 'Beauty'];
const TOTAL = 200000;
const BATCH_SIZE = 5000;

async function seed() {
  console.log('Seeding 200,000 products...');
  const start = Date.now();

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const count = Math.min(BATCH_SIZE, TOTAL - i);

    const names      = Array.from({ length: count }, (_, j) => `Product-${(i + j).toString(36)}`);
    const categories = Array.from({ length: count }, () => CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]);
    const prices     = Array.from({ length: count }, () => (Math.random() * 999 + 1).toFixed(2));

    await pool.query(
      `INSERT INTO products (name, category, price)
       SELECT * FROM UNNEST($1::text[], $2::text[], $3::numeric[])`,
      [names, categories, prices]
    );

    console.log(`Inserted ${Math.min(i + count, TOTAL)} / ${TOTAL}`);
  }

  console.log(`Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  process.exit(0);
}

seed().catch(console.error);