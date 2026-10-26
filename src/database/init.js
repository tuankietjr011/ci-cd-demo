module.exports = function createDatabaseInitializer(pool, defaultProducts) {
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(150) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(30),
        password_hash TEXT NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

// =====================================================
// USER PROFILE COLUMNS
// =====================================================

await pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20)
`);

await pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS birthday DATE
`);

await pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar TEXT
`);

await pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS linked_accounts JSONB
  NOT NULL DEFAULT '[]'::jsonb
`);

await pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP
`);

// =====================================================
// DELIVERY ADDRESSES
// =====================================================

await pool.query(`
  CREATE TABLE IF NOT EXISTS delivery_addresses (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
      REFERENCES users(id)
      ON DELETE CASCADE,

    label VARCHAR(100)
      DEFAULT 'Địa chỉ giao hàng',

    recipient_name VARCHAR(150)
      NOT NULL,

    phone VARCHAR(30)
      NOT NULL,

    address TEXT
      NOT NULL,

    city VARCHAR(150)
      NOT NULL,

    is_default BOOLEAN
      NOT NULL
      DEFAULT FALSE,

    created_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP
  )
`);


await pool.query(`
  CREATE INDEX IF NOT EXISTS
    idx_delivery_addresses_user_id
  ON delivery_addresses(user_id)
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    fullname VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(150) NOT NULL,

    payment_method VARCHAR(30) NOT NULL DEFAULT 'cod',

    subtotal BIGINT NOT NULL DEFAULT 0,
    discount BIGINT NOT NULL DEFAULT 0,
    shipping_fee BIGINT NOT NULL DEFAULT 0,
    total BIGINT NOT NULL DEFAULT 0,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Ghi chú riêng của từng đơn hàng
await pool.query(`
  ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS note TEXT
`);

await pool.query(`
  ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30)
  NOT NULL DEFAULT 'unpaid'
`);

await pool.query(`
  ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP DEFAULT NULL
`);

// Thời gian hoàn thành từng trạng thái đơn hàng
await pool.query(`
  ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP DEFAULT NULL
`);

await pool.query(`
  ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_at TIMESTAMP DEFAULT NULL
`);

await pool.query(`
  ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP DEFAULT NULL
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,

    price BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,

    size VARCHAR(50),
    image TEXT
  )
`);

await pool.query(`
  ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS color VARCHAR(100)
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,

    code VARCHAR(50) UNIQUE NOT NULL,

    type VARCHAR(20) NOT NULL,
    value BIGINT NOT NULL,

    min_order BIGINT NOT NULL DEFAULT 0,
    max_discount BIGINT DEFAULT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    start_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_at TIMESTAMP DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
await pool.query(`
  ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT NULL
`);

await pool.query(`
  ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS used_count INTEGER NOT NULL DEFAULT 0
`);

await pool.query(`
  INSERT INTO coupons
    (code, type, value, min_order, max_discount)
  VALUES
    ('SHOPLUX10', 'percent', 10, 500000, 500000),
    ('WELCOME50', 'fixed', 50000, 300000, NULL),
    ('FREESHIP', 'shipping', 0, 0, NULL)
  ON CONFLICT (code) DO NOTHING
`);

// =====================================================
// PRODUCTS TABLE
// =====================================================

await pool.query(`
  CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),

    type VARCHAR(50) NOT NULL,
    gender VARCHAR(20) DEFAULT 'all',
    subcategory VARCHAR(100),

    price BIGINT NOT NULL DEFAULT 0,
    original_price BIGINT NOT NULL DEFAULT 0,

    sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,

    description TEXT DEFAULT '',

    rating NUMERIC(3,2) NOT NULL DEFAULT 5,
    sold INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await pool.query(`
  ALTER TABLE products
  ADD COLUMN IF NOT EXISTS colors JSONB
  NOT NULL DEFAULT '[]'::jsonb
`);

await pool.query(`
  ALTER TABLE products
  ADD COLUMN IF NOT EXISTS color_name VARCHAR(100)
`);

await pool.query(`
  ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variant_group VARCHAR(150)
`);

const productCountResult = await pool.query(`
  SELECT COUNT(*)::INTEGER AS count
  FROM products
`);

if (productCountResult.rows[0].count === 0) {
  for (const product of defaultProducts) {
    await pool.query(
      `
        INSERT INTO products (
          id,
          name,
          brand,
          type,
          gender,
          subcategory,
          price,
          original_price,
          sizes,
          images,
          description,
          rating,
          sold
        )

        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13
        )

        ON CONFLICT (id)
        DO NOTHING
      `,
      [
        product.id,
        product.name,
        product.brand,
        product.type,
        product.gender,
        product.subcategory,
        product.price,
        product.originalPrice,
        JSON.stringify(product.sizes || []),
        JSON.stringify(product.images || []),
        product.desc || "",
        product.rating || 5,
        product.sold || 0
      ]
    );
  }

  await pool.query(`
    SELECT setval(
      pg_get_serial_sequence('products', 'id'),
      COALESCE((SELECT MAX(id) FROM products), 1)
    )
  `);
}

// =====================================================
// SHOP SETTINGS TABLE
// =====================================================

await pool.query(`
  CREATE TABLE IF NOT EXISTS shop_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,

    store_name VARCHAR(150)
      NOT NULL
      DEFAULT 'ShopLux',

    shipping_fee BIGINT
      NOT NULL
      DEFAULT 30000,

    free_shipping_threshold BIGINT
      NOT NULL
      DEFAULT 1000000,

    updated_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT single_shop_settings
      CHECK (id = 1)
  )
`);


await pool.query(`
  INSERT INTO shop_settings (
    id,
    store_name,
    shipping_fee,
    free_shipping_threshold
  )

  VALUES (
    1,
    'ShopLux',
    30000,
    1000000
  )

  ON CONFLICT (id)
  DO NOTHING
`);


console.log(
  "Shop settings table ready."
);

console.log(
  "Coupons table ready."
);

console.log(
  "Orders tables ready."
);

console.log(
  "PostgreSQL connected."
);

console.log(
  "Users table ready."
);
  } catch (error) {
    console.error("Database initialization error:", error.message);
  }
}


return initDatabase;
};
