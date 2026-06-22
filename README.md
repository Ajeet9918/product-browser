# Product Browser API

A backend API to browse 200,000 products with fast, stable pagination.

## Live URL
https://product-browser-pnk3.onrender.com/

## Tech Stack
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (Neon)
- **Hosting**: Render

## Why these choices?
- **PostgreSQL** — structured product data fits relational DB perfectly. Strong indexing support makes pagination fast on large datasets.
- **Cursor-based pagination** — OFFSET pagination breaks when data changes (new inserts shift all offsets). Cursor uses last seen `(created_at, id)` as a bookmark — stable no matter what gets added.
- **UNNEST for seeding** — inserting 200k rows one by one would take minutes. UNNEST lets us pass entire arrays to PostgreSQL and insert 5000 rows per query — done in ~8 seconds.

## API Endpoints

### Get products (newest first)
GET /products

### Query params
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | number | 20 | Products per page (max 100) |
| cursor | string | null | Cursor from previous response |
| category | string | null | Filter by category |

### Examples
GET /products
GET /products?limit=10
GET /products?category=Electronics
GET /products?limit=10&cursor=eyJjcmVhdGVk...

### Get all categories
GET /products/categories

### Health check
GET /health

## How pagination works
Each response includes a `nextCursor` in the pagination object:

```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "hasNextPage": true,
    "nextCursor": "eyJjcmVhdGVkX2F0Ijo..."
  }
}
```
Pass `nextCursor` as the `cursor` param in the next request to get the next page.
The cursor encodes `{ created_at, id }` of the last product in base64url. This acts as a stable bookmark — if new products are added while browsing, you will never see duplicates or miss any products.

## Project Structure
```
product-browser/
├── src/
│   ├── db.js           # DB connection pool
│   ├── migrate.js      # Creates table and indexes
│   ├── seed.js         # Generates 200k products
│   └── routes/
│       └── products.js # Pagination API
├── index.js            # Express server
├── .env                # Environment variables (not committed)
└── README.md
```

## Setup locally

1. Clone the repo
2. Install dependencies
```bash
npm install
```
3. Add `.env` file
DATABASE_URL=your_neon_connection_string
PORT=3000

4. Run migration
```bash
npm run migrate
```
5. Seed the database
```bash
npm run seed
```
6. Start the server
```bash
npm run dev
```

## What I'd improve with more time
- Add full-text search on product name
- Add sorting options (by price, name)
- Add previous page cursor support
- Rate limiting to prevent API abuse
- Request logging with Morgan
- Unit and integration tests

## How I used AI
- Used Claude to understand cursor-based pagination concept and why it's better than OFFSET
- AI helped with UNNEST syntax for bulk inserts
- Reviewed and understood every decision before writing it