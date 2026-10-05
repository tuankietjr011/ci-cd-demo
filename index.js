const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

const JWT_SECRET =
  process.env.JWT_SECRET || "shoplux-local-dev-secret";

// =====================================================
// POSTGRESQL
// =====================================================

const isRenderDatabase =
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("@db:");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRenderDatabase
    ? { rejectUnauthorized: false }
    : false
});

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

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb"
  })
);

app.use(express.static(path.join(__dirname, "frontend")));

// =====================================================
// DATA
// =====================================================

const categories = [
  { id: "ao", name: "Áo" },
  { id: "quan", name: "Quần" },
  { id: "giay-dep", name: "Giày Dép" },
  { id: "phu-kien", name: "Phụ Kiện" },
  { id: "bong-da", name: "Đồ Bóng Đá" }
];

const subcategories = {
  ao: {
    nam: [
      { id: "ao-thun", name: "Áo Thun" },
      { id: "ao-polo", name: "Áo Polo" },
      { id: "ao-so-mi", name: "Áo Sơ Mi" },
      { id: "ao-khoac", name: "Áo Khoác" },
      { id: "ao-len", name: "Áo Len" },
      { id: "hoodie-sweater", name: "Hoodie / Sweater" },
      { id: "khac", name: "Khác" }
    ],

    nu: [
      { id: "ao-thun", name: "Áo Thun" },
      { id: "ao-croptop", name: "Áo Croptop" },
      { id: "ao-so-mi", name: "Áo Sơ Mi" },
      { id: "ao-khoac", name: "Áo Khoác" },
      { id: "ao-len", name: "Áo Len" },
      { id: "hoodie-sweater", name: "Hoodie / Sweater" },
      { id: "khac", name: "Khác" }
    ]
  },

  quan: {
    nam: [
      { id: "quan-jeans", name: "Quần Jeans" },
      { id: "quan-kaki", name: "Quần Kaki" },
      { id: "quan-tay", name: "Quần Tây" },
      { id: "quan-jogger", name: "Quần Jogger" },
      { id: "quan-short", name: "Quần Short" },
      { id: "khac", name: "Khác" }
    ],

    nu: [
      { id: "quan-jeans", name: "Quần Jeans" },
      { id: "quan-tay", name: "Quần Tây" },
      { id: "quan-ong-rong", name: "Quần Ống Rộng" },
      { id: "legging", name: "Legging" },
      { id: "quan-short", name: "Quần Short" },
      { id: "khac", name: "Khác" }
    ]
  },

  "giay-dep": {
    nam: [
      { id: "sneaker", name: "Sneaker" },
      { id: "giay-the-thao", name: "Giày Thể Thao" },
      { id: "giay-tay", name: "Giày Tây" },
      { id: "sandal", name: "Sandal" },
      { id: "dep", name: "Dép" }
    ],

    nu: [
      { id: "sneaker", name: "Sneaker" },
      { id: "giay-the-thao", name: "Giày Thể Thao" },
      { id: "cao-got", name: "Giày Cao Gót" },
      { id: "sandal", name: "Sandal" },
      { id: "dep", name: "Dép" }
    ]
  },

  "phu-kien": {
    nam: [
      { id: "tui-balo", name: "Túi / Balo" },
      { id: "mu", name: "Mũ" },
      { id: "vi", name: "Ví" },
      { id: "that-lung", name: "Thắt Lưng" },
      { id: "kinh", name: "Kính" },
      { id: "khac", name: "Khác" }
    ],

    nu: [
      { id: "tui-balo", name: "Túi / Balo" },
      { id: "mu", name: "Mũ" },
      { id: "vi", name: "Ví" },
      { id: "kinh", name: "Kính" },
      { id: "trang-suc", name: "Trang Sức" },
      { id: "khac", name: "Khác" }
    ]
  },

  "bong-da": {
    all: [
      { id: "ao-bong-da", name: "Áo Bóng Đá" },
      { id: "giay-bong-da", name: "Giày Bóng Đá" },
      { id: "phu-kien-bong-da", name: "Phụ Kiện Bóng Đá" }
    ]
  }
};

const brands = [
  "Nike",
  "adidas",
  "Louis Vuitton",
  "Gucci",
  "Dior"
];

// =====================================================
// PRODUCTS
// =====================================================

const defaultProducts = [
  {
    id: 1,
    name: "Nike Premium Cotton T-Shirt",
    brand: "Nike",
    type: "ao",
    gender: "nam",
    subcategory: "ao-thun",
    price: 1290000,
    originalPrice: 1590000,
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900"
    ],
    desc: "Áo thun nam phong cách hiện đại, chất liệu cotton cao cấp.",
    rating: 4.9,
    sold: 128
  },

  {
    id: 2,
    name: "Gucci Luxury Hoodie",
    brand: "Gucci",
    type: "ao",
    gender: "nam",
    subcategory: "hoodie-sweater",
    price: 5990000,
    originalPrice: 6990000,
    sizes: ["M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900"
    ],
    desc: "Hoodie phong cách luxury với thiết kế sang trọng.",
    rating: 4.9,
    sold: 42
  },

  {
    id: 3,
    name: "Dior Women's Fashion",
    brand: "Dior",
    type: "ao",
    gender: "nu",
    subcategory: "ao-thun",
    price: 4590000,
    originalPrice: 5290000,
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900"
    ],
    desc: "Thiết kế thời trang nữ thanh lịch và sang trọng.",
    rating: 5,
    sold: 31
  },

  {
    id: 4,
    name: "Louis Vuitton Luxury Bag",
    brand: "Louis Vuitton",
    type: "phu-kien",
    gender: "nu",
    subcategory: "tui-balo",
    price: 12900000,
    originalPrice: 14900000,
    sizes: [],
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900"
    ],
    desc: "Túi thời trang cao cấp dành cho phong cách sang trọng.",
    rating: 4.9,
    sold: 18
  },

  {
    id: 5,
    name: "adidas Football Jersey",
    brand: "adidas",
    type: "bong-da",
    gender: "all",
    subcategory: "ao-bong-da",
    price: 890000,
    originalPrice: 1190000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=900"
    ],
    desc: "Áo bóng đá thoáng khí, phù hợp thi đấu và luyện tập.",
    rating: 4.9,
    sold: 216
  }
];

let orders = [];

// =====================================================
// AUTH - REGISTER
// =====================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const fullname = String(
      req.body.fullname || req.body.name || ""
    ).trim();

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const phone = String(req.body.phone || "").trim();

    const password = String(req.body.password || "");

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự."
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email này đã được đăng ký."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO users
        (fullname, email, phone, password_hash)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id,
        fullname,
        email,
        phone,
        role,
        created_at
      `,
      [fullname, email, phone || null, passwordHash]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công.",
      token,
      user
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể đăng ký tài khoản."
    });
  }
});

// =====================================================
// AUTH - LOGIN
// =====================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu."
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        phone,
        password_hash,
        role,
        created_at
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác."
      });
    }

    const user = result.rows[0];

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác."
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    delete user.password_hash;

    return res.json({
      success: true,
      message: "Đăng nhập thành công.",
      token,
      user
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể đăng nhập."
    });
  }
});

// =====================================================
// AUTH - CURRENT USER
// =====================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Bạn chưa đăng nhập."
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền quản trị."
    });
  }

  next();
}

app.use(
  "/api/admin",
  authenticateToken,
  requireAdmin
);

app.get
("/api/auth/me", 
  authenticateToken, 
  async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
  id,
  fullname,
  email,
  phone,
  role,
  gender,
  birthday,
  avatar,
  linked_accounts AS "linkedAccounts",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
FROM users
WHERE id = $1
LIMIT 1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản."
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin tài khoản."
    });
  }
});

// =====================================================
// USER PROFILE
// =====================================================

// LẤY THÔNG TIN CÁ NHÂN
app.get(
  "/api/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          fullname,
          email,
          phone,
          role,
          gender,
          birthday,
          avatar,
          linked_accounts AS "linkedAccounts",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy tài khoản."
        });
      }

      return res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error(
        "GET PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể tải thông tin cá nhân."
      });
    }
  }
);


// CẬP NHẬT THÔNG TIN CÁ NHÂN
app.put(
  "/api/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        fullname,
        phone,
        gender,
        birthday,
        avatar,
        linkedAccounts
      } = req.body;

      const cleanFullname =
        String(fullname || "").trim();

      const cleanPhone =
        String(phone || "").trim();

      const cleanGender =
        String(gender || "").trim();

      const cleanBirthday =
        birthday
          ? String(birthday).trim()
          : null;

      const cleanAvatar =
        String(avatar || "").trim();

      const allowedGenders = [
        "",
        "nam",
        "nu",
        "khac"
      ];

      if (!cleanFullname) {
        return res.status(400).json({
          success: false,
          message:
            "Họ và tên không được để trống."
        });
      }

      if (
        !allowedGenders.includes(
          cleanGender
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Giới tính không hợp lệ."
        });
      }

      let cleanLinkedAccounts = [];

      if (Array.isArray(linkedAccounts)) {
        cleanLinkedAccounts =
          linkedAccounts
            .map(item => ({
              provider:
                String(
                  item?.provider || ""
                ).trim(),

              account:
                String(
                  item?.account || ""
                ).trim()
            }))
            .filter(
              item =>
                item.provider ||
                item.account
            );
      }

      const result = await pool.query(
        `
        UPDATE users

        SET
          fullname = $1,
          phone = $2,
          gender = $3,
          birthday = $4,
          avatar = $5,
          linked_accounts = $6::jsonb,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $7

        RETURNING
          id,
          fullname,
          email,
          phone,
          role,
          gender,
          birthday,
          avatar,
          linked_accounts AS "linkedAccounts",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [
          cleanFullname,
          cleanPhone || null,
          cleanGender || null,
          cleanBirthday,
          cleanAvatar || null,
          JSON.stringify(
            cleanLinkedAccounts
          ),
          req.user.id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy tài khoản."
        });
      }

      return res.json({
        success: true,
        message:
          "Cập nhật thông tin thành công.",
        user: result.rows[0]
      });
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể cập nhật thông tin cá nhân."
      });
    }
  }
);

// =====================================================
// DELIVERY ADDRESSES API
// =====================================================


// =====================================================
// GET - LẤY DANH SÁCH ĐỊA CHỈ
// =====================================================

app.get(
  "/api/delivery-addresses",
  authenticateToken,
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            id,
            label,
            recipient_name,
            phone,
            address,
            city,
            is_default,
            created_at,
            updated_at
          FROM delivery_addresses
          WHERE user_id = $1
          ORDER BY
            is_default DESC,
            created_at DESC
          `,
          [req.user.id]
        );


      return res.json({
        success: true,
        addresses: result.rows
      });


    } catch (error) {

      console.error(
        "GET DELIVERY ADDRESSES ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể tải địa chỉ giao hàng."
      });

    }

  }
);


// =====================================================
// POST - THÊM ĐỊA CHỈ
// =====================================================

app.post(
  "/api/delivery-addresses",
  authenticateToken,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const label =
        String(
          req.body.label ||
          "Địa chỉ giao hàng"
        ).trim();


      const recipientName =
        String(
          req.body.recipientName || ""
        ).trim();


      const phone =
        String(
          req.body.phone || ""
        ).trim();


      const address =
        String(
          req.body.address || ""
        ).trim();


      const city =
        String(
          req.body.city || ""
        ).trim();


      const isDefault =
        req.body.isDefault === true;


      if (
        !recipientName ||
        !phone ||
        !address ||
        !city
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng."
        });

      }


      await client.query("BEGIN");


      const countResult =
        await client.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM delivery_addresses
          WHERE user_id = $1
          `,
          [req.user.id]
        );


      const firstAddress =
        countResult.rows[0].count === 0;


      const shouldBeDefault =
        firstAddress || isDefault;


      if (shouldBeDefault) {

        await client.query(
          `
          UPDATE delivery_addresses
          SET
            is_default = FALSE,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
          `,
          [req.user.id]
        );

      }


      const result =
        await client.query(
          `
          INSERT INTO delivery_addresses (
            user_id,
            label,
            recipient_name,
            phone,
            address,
            city,
            is_default
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )

          RETURNING *
          `,
          [
            req.user.id,
            label,
            recipientName,
            phone,
            address,
            city,
            shouldBeDefault
          ]
        );


      await client.query("COMMIT");


      return res.status(201).json({
        success: true,
        message:
          "Đã thêm địa chỉ giao hàng.",
        address: result.rows[0]
      });


    } catch (error) {

      await client.query("ROLLBACK");

      console.error(
        "CREATE DELIVERY ADDRESS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể thêm địa chỉ giao hàng."
      });


    } finally {

      client.release();

    }

  }
);


// =====================================================
// PUT - SỬA ĐỊA CHỈ
// =====================================================

app.put(
  "/api/delivery-addresses/:id",
  authenticateToken,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const id =
        Number(req.params.id);


      const label =
        String(
          req.body.label ||
          "Địa chỉ giao hàng"
        ).trim();


      const recipientName =
        String(
          req.body.recipientName || ""
        ).trim();


      const phone =
        String(
          req.body.phone || ""
        ).trim();


      const address =
        String(
          req.body.address || ""
        ).trim();


      const city =
        String(
          req.body.city || ""
        ).trim();


      const isDefault =
        req.body.isDefault === true;


      if (
        !id ||
        !recipientName ||
        !phone ||
        !address ||
        !city
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Thông tin địa chỉ không hợp lệ."
        });

      }


      await client.query("BEGIN");


      const exists =
        await client.query(
          `
          SELECT id
          FROM delivery_addresses
          WHERE
            id = $1
            AND user_id = $2
          `,
          [
            id,
            req.user.id
          ]
        );


      if (!exists.rows.length) {

        await client.query(
          "ROLLBACK"
        );


        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy địa chỉ."
        });

      }


      if (isDefault) {

        await client.query(
          `
          UPDATE delivery_addresses
          SET
            is_default = FALSE,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
          `,
          [req.user.id]
        );

      }


      const result =
        await client.query(
          `
          UPDATE delivery_addresses
          SET
            label = $1,
            recipient_name = $2,
            phone = $3,
            address = $4,
            city = $5,
            is_default = $6,
            updated_at = CURRENT_TIMESTAMP
          WHERE
            id = $7
            AND user_id = $8
          RETURNING *
          `,
          [
            label,
            recipientName,
            phone,
            address,
            city,
            isDefault,
            id,
            req.user.id
          ]
        );


      await client.query("COMMIT");


      return res.json({
        success: true,
        message:
          "Đã cập nhật địa chỉ.",
        address: result.rows[0]
      });


    } catch (error) {

      await client.query("ROLLBACK");

      console.error(
        "UPDATE DELIVERY ADDRESS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể cập nhật địa chỉ."
      });


    } finally {

      client.release();

    }

  }
);


// =====================================================
// PATCH - ĐẶT LÀM ĐỊA CHỈ MẶC ĐỊNH
// =====================================================

app.patch(
  "/api/delivery-addresses/:id/default",
  authenticateToken,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const id =
        Number(req.params.id);


      await client.query("BEGIN");


      const exists =
        await client.query(
          `
          SELECT id
          FROM delivery_addresses
          WHERE
            id = $1
            AND user_id = $2
          `,
          [
            id,
            req.user.id
          ]
        );


      if (!exists.rows.length) {

        await client.query(
          "ROLLBACK"
        );


        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy địa chỉ."
        });

      }


      await client.query(
        `
        UPDATE delivery_addresses
        SET
          is_default = FALSE,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        `,
        [req.user.id]
      );


      const result =
        await client.query(
          `
          UPDATE delivery_addresses
          SET
            is_default = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE
            id = $1
            AND user_id = $2
          RETURNING *
          `,
          [
            id,
            req.user.id
          ]
        );


      await client.query("COMMIT");


      return res.json({
        success: true,
        message:
          "Đã đặt làm địa chỉ mặc định.",
        address: result.rows[0]
      });


    } catch (error) {

      await client.query("ROLLBACK");

      console.error(
        "DEFAULT DELIVERY ADDRESS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể đổi địa chỉ mặc định."
      });


    } finally {

      client.release();

    }

  }
);


// =====================================================
// DELETE - XÓA ĐỊA CHỈ
// =====================================================

app.delete(
  "/api/delivery-addresses/:id",
  authenticateToken,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const id =
        Number(req.params.id);


      await client.query("BEGIN");


      const result =
        await client.query(
          `
          DELETE FROM delivery_addresses
          WHERE
            id = $1
            AND user_id = $2
          RETURNING
            id,
            is_default
          `,
          [
            id,
            req.user.id
          ]
        );


      if (!result.rows.length) {

        await client.query(
          "ROLLBACK"
        );


        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy địa chỉ."
        });

      }


      // Nếu vừa xóa địa chỉ mặc định,
      // tự chọn địa chỉ còn lại mới nhất
      if (
        result.rows[0].is_default
      ) {

        const nextAddress =
          await client.query(
            `
            SELECT id
            FROM delivery_addresses
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [req.user.id]
          );


        if (nextAddress.rows.length) {

          await client.query(
            `
            UPDATE delivery_addresses
            SET
              is_default = TRUE,
              updated_at = CURRENT_TIMESTAMP
            WHERE
              id = $1
              AND user_id = $2
            `,
            [
              nextAddress.rows[0].id,
              req.user.id
            ]
          );

        }

      }


      await client.query("COMMIT");


      return res.json({
        success: true,
        message:
          "Đã xóa địa chỉ giao hàng."
      });


    } catch (error) {

      await client.query("ROLLBACK");

      console.error(
        "DELETE DELIVERY ADDRESS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể xóa địa chỉ."
      });


    } finally {

      client.release();

    }

  }
);

// =====================================================
// API
// =====================================================

app.get("/api/categories", (req, res) => {
  res.json({
    success: true,
    data: categories
  });
});

app.get("/api/subcategories", (req, res) => {
  res.json({
    success: true,
    data: subcategories
  });
});

app.get("/api/brands", (req, res) => {
  res.json({
    success: true,
    data: brands
  });
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        brand,
        type,
        gender,
        subcategory,
        price,
        original_price AS "originalPrice",
        sizes,
        colors,
        color_name AS "colorName",
        variant_group AS "variantGroup",
        images,
        description AS "desc",
        rating,
        sold
      FROM products
      ORDER BY id DESC
    `);

    const productList = result.rows.map(product => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price),
      originalPrice: Number(product.originalPrice),
      rating: Number(product.rating),
      sold: Number(product.sold),

      sizes: Array.isArray(product.sizes)
        ? product.sizes
        : [],

      colors: Array.isArray(product.colors)
        ? product.colors
        : [],

      colorName:
        product.colorName || "",

      variantGroup:
        product.variantGroup || "",
      
      images: Array.isArray(product.images)
        ? product.images
        : [],

      image:
        Array.isArray(product.images) &&
        product.images.length
        ? product.images[0]
        : ""

    }));

    return res.json({
      success: true,
      data: productList
    });

  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Không thể tải sản phẩm."
    });
  }
});

app.use(
  "/api/admin",
  authenticateToken,
  requireAdmin
);

// =====================================================
// ADMIN PRODUCT
// =====================================================

app.post("/api/admin/products", async (req, res) => {
  try {
    const {
      name,
      brand,
      type,
      gender,
      subcategory,
      price,
      originalPrice,
      sizes,
      colors,
      colorName,
      variantGroup,
      images,
      desc
    } = req.body;

    if (!name || !price || !type) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin sản phẩm"
      });
    }

    const imageList = Array.isArray(images)
      ? images.filter(Boolean).slice(0, 10)
      : [];

    const sizeList = Array.isArray(sizes)
      ? sizes
      : [];

    const colorList = Array.isArray(colors)
      ? colors
      : [];

    const result = await pool.query(
      `
        INSERT INTO products (
          name,
          brand,
          type,
          gender,
          subcategory,
          price,
          original_price,
          sizes,
          colors,
          color_name,
          variant_group,
          images,
          description,
          rating,
          sold
        )

        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15
        )

        RETURNING
          id,
          name,
          brand,
          type,
          gender,
          subcategory,
          price,
          original_price AS "originalPrice",
          sizes,
          colors,
          color_name AS "colorName",
          variant_group AS "variantGroup",
          images,
          description AS "desc",
          rating,
          sold
      `,
      [
        String(name).trim(),
        brand || "Nike",
        type,
        gender || "all",
        subcategory || "",
        Number(price),
        Number(originalPrice) || Number(price),
        JSON.stringify(sizeList),
        JSON.stringify(colorList),
        colorName || null,
        variantGroup || null,
        JSON.stringify(imageList),
        desc || "",
        5,
        0
      ]
    );

    const product = result.rows[0];

    product.id = Number(product.id);
    product.price = Number(product.price);
    product.originalPrice =
      Number(product.originalPrice);
    product.rating = Number(product.rating);
    product.sold = Number(product.sold);

    product.image =
      Array.isArray(product.images) &&
      product.images.length
        ? product.images[0]
        : "";

    return res.status(201).json({
      success: true,
      product
    });

  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Không thể thêm sản phẩm."
    });
  }
});

app.put("/api/admin/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      brand,
      type,
      gender,
      subcategory,
      price,
      originalPrice,
      sizes,
      colors,
      colorName,
      variantGroup,
      images,
      desc
    } = req.body;

    const imageList = Array.isArray(images)
      ? images.filter(Boolean).slice(0, 10)
      : [];

    const sizeList = Array.isArray(sizes)
      ? sizes
      : [];

      const colorList = Array.isArray(colors)
      ? colors
      : [];

    const result = await pool.query(
      `
        UPDATE products

        SET
          name = $1,
          brand = $2,
          type = $3,
          gender = $4,
          subcategory = $5,
          price = $6,
          original_price = $7,
          sizes = $8,
          colors = $9,
          color_name = $10,
          variant_group = $11,
          images = $12,
          description = $13,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $14

        RETURNING
          id,
          name,
          brand,
          type,
          gender,
          subcategory,
          price,
          original_price AS "originalPrice",
          sizes,
          colors,
          color_name AS "colorName",
          variant_group AS "variantGroup",
          images,
          description AS "desc",
          rating,
          sold
      `,
      [
        String(name || "").trim(),
        brand || "Nike",
        type || "",
        gender || "all",
        subcategory || "",
        Number(price) || 0,
        Number(originalPrice) || Number(price) || 0,
        JSON.stringify(sizeList),
        JSON.stringify(colorList),
        colorName || null,
        variantGroup || null,
        JSON.stringify(imageList),
        desc || "",
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm"
      });
    }

    const product = result.rows[0];

    product.id = Number(product.id);
    product.price = Number(product.price);
    product.originalPrice =
      Number(product.originalPrice);
    product.rating = Number(product.rating);
    product.sold = Number(product.sold);

    product.image =
      Array.isArray(product.images) &&
      product.images.length
        ? product.images[0]
        : "";

    return res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật sản phẩm."
    });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      `
        DELETE FROM products
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm."
      });
    }

    return res.json({
      success: true,
      message: "Đã xóa sản phẩm."
    });

  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Không thể xóa sản phẩm."
    });
  }
});

// =====================================================
// COUPONS
// =====================================================

app.post(
  "/api/coupons/validate",
  authenticateToken,
  async (req, res) => {
    try {
      const code = String(
        req.body.code || ""
      )
        .trim()
        .toUpperCase();

      const subtotal = Math.max(
        0,
        Number(req.body.subtotal) || 0
      );

      if (!code) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mã giảm giá."
        });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM coupons
        WHERE UPPER(code) = $1
          AND active = TRUE
          AND (start_at IS NULL OR start_at <= CURRENT_TIMESTAMP)
          AND (end_at IS NULL OR end_at >= CURRENT_TIMESTAMP)
        LIMIT 1
        `,
        [code]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Mã giảm giá không hợp lệ hoặc đã hết hạn."
        });
      }

      const coupon = result.rows[0];
      if (
  coupon.usage_limit !== null &&
  Number(coupon.used_count) >=
    Number(coupon.usage_limit)
) {
  return res.status(400).json({
    success: false,
    message: "Mã giảm giá đã hết lượt sử dụng."
  });
}

      if (
        subtotal <
        Number(coupon.min_order || 0)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Đơn hàng tối thiểu ${Number(
              coupon.min_order
            ).toLocaleString("vi-VN")} ₫ để sử dụng mã này.`
        });
      }

      let discount = 0;

      if (coupon.type === "percent") {
        discount = Math.floor(
          subtotal *
          Number(coupon.value) /
          100
        );

        if (coupon.max_discount) {
          discount = Math.min(
            discount,
            Number(coupon.max_discount)
          );
        }
      }

      if (coupon.type === "fixed") {
        discount = Math.min(
          Number(coupon.value),
          subtotal
        );
      }

      const shippingDiscount =
        coupon.type === "shipping";

      return res.json({
        success: true,

        message:
          "Áp dụng mã giảm giá thành công.",

        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
          discount,
          shippingDiscount
        }
      });

    } catch (error) {
      console.error(
        "VALIDATE COUPON ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể kiểm tra mã giảm giá."
      });
    }
  }
);

// =====================================================
// ADMIN COUPONS
// =====================================================


// GET ALL COUPONS

app.get(
  "/api/admin/coupons",
  async (req, res) => {
    try {

      const result = await pool.query(`
        SELECT *
        FROM coupons
        ORDER BY created_at DESC
      `);

      return res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {

      console.error(
        "GET ADMIN COUPONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Không thể tải mã giảm giá."
      });

    }
  }
);


// CREATE COUPON

app.post(
  "/api/admin/coupons",
  async (req, res) => {
    try {

      const code =
        String(req.body.code || "")
          .trim()
          .toUpperCase();

      const type =
        String(req.body.type || "");

      const value =
        Math.max(
          0,
          Number(req.body.value) || 0
        );

      const minOrder = Math.max(
  0,
  Number(
    req.body.min_order ??
    req.body.minOrder ??
    0
  ) || 0
);

const maxDiscountRaw =
  req.body.max_discount ??
  req.body.maxDiscount;

const maxDiscount =
  maxDiscountRaw !== undefined &&
  maxDiscountRaw !== null &&
  maxDiscountRaw !== ""
    ? Math.max(0, Number(maxDiscountRaw) || 0)
    : null;

const usageLimitRaw =
  req.body.usage_limit ??
  req.body.usageLimit;

const usageLimit =
  usageLimitRaw !== undefined &&
  usageLimitRaw !== null &&
  usageLimitRaw !== ""
    ? Math.max(1, parseInt(usageLimitRaw, 10))
    : null;

const startAt =
  req.body.start_at ??
  req.body.startAt ??
  null;

const endAt =
  req.body.end_at ??
  req.body.endAt ??
  null;

const active =
  req.body.active !== false;


      const allowedTypes = [
        "percent",
        "fixed",
        "shipping"
      ];


      if (
        !code ||
        !allowedTypes.includes(type)
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Thông tin mã giảm giá không hợp lệ."
        });

      }


      if (
        type === "percent" &&
        (value <= 0 || value > 100)
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Phần trăm giảm phải từ 1 đến 100."
        });

      }


      if (
        endAt &&
        startAt &&
        new Date(endAt) <=
          new Date(startAt)
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Thời gian hết hạn phải sau thời gian bắt đầu."
        });

      }


      const result =
        await pool.query(
          `
          INSERT INTO coupons (
            code,
            type,
            value,
            min_order,
            max_discount,
            usage_limit,
            used_count,
            active,
            start_at,
            end_at
          )

          VALUES (
            $1,$2,$3,$4,$5,
            $6,0,$7,$8,$9
          )

          RETURNING *
          `,
          [
            code,
            type,
            value,
            minOrder,
            maxDiscount,
            usageLimit,
            active,
            startAt,
            endAt
          ]
        );


      return res.status(201).json({
        success: true,
        coupon: result.rows[0]
      });

    } catch (error) {

      console.error(
        "CREATE COUPON ERROR:",
        error
      );


      if (
        error.code === "23505"
      ) {

        return res.status(409).json({
          success: false,
          message:
            "Mã giảm giá đã tồn tại."
        });

      }


      return res.status(500).json({
        success: false,
        message:
          "Không thể tạo mã giảm giá."
      });

    }
  }
);


// UPDATE COUPON

app.put(
  "/api/admin/coupons/:id",
  async (req, res) => {
    try {

      const id =
        Number(req.params.id);


      const code =
        String(req.body.code || "")
          .trim()
          .toUpperCase();

      const type =
        String(req.body.type || "");

      const value =
        Math.max(
          0,
          Number(req.body.value) || 0
        );

      const minOrder = Math.max(
  0,
  Number(
    req.body.min_order ??
    req.body.minOrder ??
    0
  ) || 0
);

const maxDiscountRaw =
  req.body.max_discount ??
  req.body.maxDiscount;

const maxDiscount =
  maxDiscountRaw !== undefined &&
  maxDiscountRaw !== null &&
  maxDiscountRaw !== ""
    ? Math.max(0, Number(maxDiscountRaw) || 0)
    : null;

const usageLimitRaw =
  req.body.usage_limit ??
  req.body.usageLimit;

const usageLimit =
  usageLimitRaw !== undefined &&
  usageLimitRaw !== null &&
  usageLimitRaw !== ""
    ? Math.max(1, parseInt(usageLimitRaw, 10))
    : null;

const startAt =
  req.body.start_at ??
  req.body.startAt ??
  null;

const endAt =
  req.body.end_at ??
  req.body.endAt ??
  null;

const active =
  req.body.active !== false;

      if (
        endAt &&
        startAt &&
        new Date(endAt) <=
          new Date(startAt)
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Thời gian hết hạn phải sau thời gian bắt đầu."
        });

      }


      const result =
        await pool.query(
          `
          UPDATE coupons

          SET
            code = $1,
            type = $2,
            value = $3,
            min_order = $4,
            max_discount = $5,
            usage_limit = $6,
            active = $7,
            start_at = $8,
            end_at = $9

          WHERE id = $10

          RETURNING *
          `,
          [
            code,
            type,
            value,
            minOrder,
            maxDiscount,
            usageLimit,
            active,
            startAt,
            endAt,
            id
          ]
        );


      if (!result.rows.length) {

        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy mã giảm giá."
        });

      }


      return res.json({
        success: true,
        coupon: result.rows[0]
      });

    } catch (error) {

      console.error(
        "UPDATE COUPON ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể cập nhật mã giảm giá."
      });

    }
  }
);


// TOGGLE COUPON

app.patch(
  "/api/admin/coupons/:id/toggle",
  async (req, res) => {
    try {

      const result =
        await pool.query(
          `
          UPDATE coupons
          SET active = NOT active
          WHERE id = $1
          RETURNING *
          `,
          [
            Number(req.params.id)
          ]
        );


      if (!result.rows.length) {

        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy mã giảm giá."
        });

      }


      return res.json({
        success: true,
        coupon: result.rows[0]
      });

    } catch (error) {

      console.error(
        "TOGGLE COUPON ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể thay đổi trạng thái mã."
      });

    }
  }
);


// DELETE COUPON

app.delete(
  "/api/admin/coupons/:id",
  async (req, res) => {
    try {

      const result =
        await pool.query(
          `
          DELETE FROM coupons
          WHERE id = $1
          RETURNING id
          `,
          [
            Number(req.params.id)
          ]
        );


      if (!result.rows.length) {

        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy mã giảm giá."
        });

      }


      return res.json({
        success: true
      });

    } catch (error) {

      console.error(
        "DELETE COUPON ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể xóa mã giảm giá."
      });

    }
  }
);

// =====================================================
// ORDERS - POSTGRESQL
// =====================================================


// =====================================================
// CREATE ORDER
// =====================================================

app.post(
  "/api/orders",
  authenticateToken,
  async (req, res) => {

    const client = await pool.connect();

    let transactionStarted = false;

    try {

      const {
        fullname,
        phone,
        address,
        city,
        note,
        paymentMethod,
        couponCode,
        items
      } = req.body;


      if (
        !fullname ||
        !phone ||
        !address ||
        !city
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Vui lòng nhập đầy đủ thông tin nhận hàng."
        });

      }


      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Giỏ hàng đang trống."
        });

      }


      // ===============================================
      // KHÔNG TIN GIÁ TỪ FRONTEND
      // TÍNH LẠI GIÁ TỪ PRODUCTS TRÊN SERVER
      // ===============================================

      const normalizedItems = [];


      for (const item of items) {

        const productResult =
          await client.query(
            `
            SELECT
              id,
              name,
              price,
              sizes,
              colors,
              color_name AS "colorName",
              variant_group AS "variantGroup",
              images
            FROM products
            WHERE id = $1
            LIMIT 1
            `,
            [Number(item.id)]
          );


        const product =
          productResult.rows[0];


        if (!product) {

          return res.status(400).json({
            success: false,
            message:
              `Sản phẩm ID ${item.id} không tồn tại.`
          });

        }


        const quantity =
          Math.max(
            1,
            parseInt(item.qty, 10) || 1
          );


        const size =
          String(
            item.size || ""
          ).trim();


        const color =
          String(
            product.colorName || ""
          ).trim();


        if (
          product.sizes?.length &&
          !size
        ) {

          return res.status(400).json({
            success: false,
            message:
              `Vui lòng chọn size cho ${product.name}.`
          });

        }


        if (
          product.sizes?.length &&
          !product.sizes.includes(size)
        ) {

          return res.status(400).json({
            success: false,
            message:
              `Size không hợp lệ cho ${product.name}.`
          });

        }


        normalizedItems.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity,
          size,
          color,
          image:
            product.images?.[0] ||
            product.image ||
            ""
        });

      }


      const subtotal =
        normalizedItems.reduce(
          (sum, item) =>
            sum +
            item.price *
            item.quantity,
          0
        );


      let discount = 0;


      // ===============================================
      // LOAD SHOP SETTINGS
      // ===============================================

      const settingsResult =
        await client.query(
          `
          SELECT
            shipping_fee,
            free_shipping_threshold
          FROM shop_settings
          WHERE id = 1
          LIMIT 1
          `
        );


      const currentSettings =
        settingsResult.rows[0] || {
          shipping_fee: 30000,
          free_shipping_threshold: 1000000
        };


      const configuredShippingFee =
        Math.max(
          0,
          Number(
            currentSettings.shipping_fee || 0
          )
        );


      const freeShippingThreshold =
        Math.max(
          0,
          Number(
            currentSettings
              .free_shipping_threshold || 0
          )
        );


      let shippingFee =
        subtotal >= freeShippingThreshold
          ? 0
          : configuredShippingFee;


      // ===============================================
      // APPLY COUPON
      // ===============================================

      const normalizedCouponCode =
        String(couponCode || "")
          .trim()
          .toUpperCase();


      if (normalizedCouponCode) {

        const couponResult =
          await client.query(
            `
            SELECT *
            FROM coupons
            WHERE UPPER(code) = $1
              AND active = TRUE
              AND (
                start_at IS NULL
                OR start_at <= CURRENT_TIMESTAMP
              )
              AND (
                end_at IS NULL
                OR end_at >= CURRENT_TIMESTAMP
              )
            LIMIT 1
            `,
            [normalizedCouponCode]
          );


        if (
          couponResult.rows.length === 0
        ) {

          return res.status(400).json({
            success: false,
            message:
              "Mã giảm giá không hợp lệ hoặc đã hết hạn."
          });

        }


        const coupon =
          couponResult.rows[0];


        if (
          coupon.usage_limit !== null &&
          Number(coupon.used_count) >=
            Number(coupon.usage_limit)
        ) {

          return res.status(400).json({
            success: false,
            message:
              "Mã giảm giá đã hết lượt sử dụng."
          });

        }


        if (
          subtotal <
          Number(coupon.min_order || 0)
        ) {

          return res.status(400).json({
            success: false,
            message:
              `Đơn hàng tối thiểu ${Number(
                coupon.min_order
              ).toLocaleString("vi-VN")} ₫ để sử dụng mã này.`
          });

        }


        if (
          coupon.type === "percent"
        ) {

          discount =
            Math.floor(
              subtotal *
              Number(coupon.value) /
              100
            );


          if (coupon.max_discount) {

            discount =
              Math.min(
                discount,
                Number(
                  coupon.max_discount
                )
              );

          }

        }


        if (
          coupon.type === "fixed"
        ) {

          discount =
            Math.min(
              Number(coupon.value),
              subtotal
            );

        }


        if (
          coupon.type === "shipping"
        ) {

          shippingFee = 0;

        }

      }


      const total =
        Math.max(
          0,
          subtotal -
          discount +
          shippingFee
        );


      // ===============================================
      // PAYMENT
      // ===============================================

      const payment =
        paymentMethod === "bank"
          ? "bank"
          : "cod";


      const paymentStatus =
        payment === "bank"
          ? "paid"
          : "unpaid";


      const paidAt =
        paymentStatus === "paid"
          ? new Date()
          : null;


      const code =
        "SL" +
        Date.now() +
        Math.floor(
          Math.random() * 1000
        );


      // ===============================================
      // START TRANSACTION
      // ===============================================

      await client.query("BEGIN");

      transactionStarted = true;


      // ===============================================
      // CREATE ORDER
      // ===============================================

const orderResult =
  await client.query(
    `
      INSERT INTO orders (
        code,
        user_id,
        fullname,
        phone,
        address,
        city,
        note,
        payment_method,
        payment_status,
        paid_at,
        subtotal,
        discount,
        shipping_fee,
        total,
        status
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14,
        'pending'
      )
      RETURNING *
    `,
    [
      code,
      req.user.id,
      String(fullname).trim(),
      String(phone).trim(),
      String(address).trim(),
      String(city).trim(),

      String(note || "")
        .trim()
        .slice(0, 1000),

      payment,
      paymentStatus,
      paidAt,
      subtotal,
      discount,
      shippingFee,
      total
    ]
  );


      const order =
        orderResult.rows[0];


      // ===============================================
      // CREATE ORDER ITEMS
      // ===============================================

      for (
        const item of normalizedItems
      ) {

        await client.query(
          `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            size,
            color,
            image
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
          )
          `,
          [
            order.id,
            item.id,
            item.name,
            item.price,
            item.quantity,
            item.size || null,
            item.color || null,
            item.image
          ]
        );

      }


      // ===============================================
      // UPDATE COUPON USAGE
      // ===============================================

      if (normalizedCouponCode) {

        const useCouponResult =
          await client.query(
            `
            UPDATE coupons

            SET
              used_count =
                used_count + 1

            WHERE UPPER(code) = $1

              AND active = TRUE

              AND (
                usage_limit IS NULL
                OR used_count < usage_limit
              )

            RETURNING *
            `,
            [normalizedCouponCode]
          );


        if (
          useCouponResult.rows.length === 0
        ) {

          throw new Error(
            "Mã giảm giá đã hết lượt sử dụng."
          );

        }

      }


      // ===============================================
      // COMMIT
      // ===============================================

      await client.query("COMMIT");

      transactionStarted = false;


      return res.status(201).json({
        success: true,

        message:
          "Đặt hàng thành công.",

        order: {
          ...order,
          items: normalizedItems
        }
      });


    } catch (error) {

      if (transactionStarted) {

        await client.query("ROLLBACK");

      }


      console.error(
        "CREATE ORDER ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          error.message ===
          "Mã giảm giá đã hết lượt sử dụng."
            ? error.message
            : "Không thể tạo đơn hàng."
      });


    } finally {

      client.release();

    }

  }
);

// =====================================================
// MY ORDERS
// =====================================================

app.get(
  "/api/orders/my",
  authenticateToken,
  async (req, res) => {

    try {

      const orderResult =
        await pool.query(
          `
          SELECT *
          FROM orders
          WHERE user_id = $1
          ORDER BY created_at DESC
          `,
          [req.user.id]
        );


      const result = [];


      for (
        const order of orderResult.rows
      ) {

        const itemsResult =
          await pool.query(
            `
            SELECT *
            FROM order_items
            WHERE order_id = $1
            ORDER BY id ASC
            `,
            [order.id]
          );


        result.push({
          ...order,
          items: itemsResult.rows
        });

      }


      return res.json({
        success: true,
        data: result
      });


    } catch (error) {

      console.error(
        "MY ORDERS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể tải đơn hàng."
      });

    }

  }
);

// =====================================================
// CUSTOMER - CANCEL ORDER
// =====================================================

app.patch(
  "/api/orders/:code/cancel",
  authenticateToken,
  async (req, res) => {

    try {

      const code =
        String(
          req.params.code || ""
        ).trim();


      if (!code) {

        return res.status(400).json({
          success: false,
          message:
            "Thiếu mã đơn hàng."
        });

      }


      const result =
        await pool.query(
          `
          UPDATE orders

          SET
            status = 'cancelled',
            updated_at = CURRENT_TIMESTAMP

          WHERE code = $1
            AND user_id = $2
            AND status = 'pending'

          RETURNING *
          `,
          [
            code,
            req.user.id
          ]
        );


      if (
        result.rows.length === 0
      ) {

        const orderResult =
          await pool.query(
            `
            SELECT
              status
            FROM orders
            WHERE code = $1
              AND user_id = $2
            LIMIT 1
            `,
            [
              code,
              req.user.id
            ]
          );


        if (
          orderResult.rows.length === 0
        ) {

          return res.status(404).json({
            success: false,
            message:
              "Không tìm thấy đơn hàng."
          });

        }


        return res.status(400).json({
          success: false,
          message:
            "Chỉ có thể hủy đơn hàng đang chờ xác nhận."
        });

      }


      return res.json({
        success: true,
        message:
          "Hủy đơn hàng thành công.",
        order: result.rows[0]
      });


    } catch (error) {

      console.error(
        "CANCEL ORDER ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể hủy đơn hàng."
      });

    }

  }
);

// =====================================================
// ORDER DETAIL
// =====================================================

app.get(
  "/api/orders/:code",
  authenticateToken,
  async (req, res) => {

    try {

      const orderResult =
        await pool.query(
          `
          SELECT *
          FROM orders
          WHERE code = $1
            AND user_id = $2
          `,
          [
            req.params.code,
            req.user.id
          ]
        );


      if (
        orderResult.rows.length === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy đơn hàng."
        });

      }


      const order =
        orderResult.rows[0];


      const itemsResult =
        await pool.query(
          `
          SELECT *
          FROM order_items
          WHERE order_id = $1
          ORDER BY id ASC
          `,
          [order.id]
        );


      return res.json({
        success: true,

        order: {
          ...order,
          items: itemsResult.rows
        }
      });


    } catch (error) {

      console.error(
        "ORDER DETAIL ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể tải đơn hàng."
      });

    }

  }
);


// =====================================================
// ADMIN ORDERS
// =====================================================

app.get(
  "/api/admin/orders",
  async (req, res) => {

    try {

      const orderResult =
        await pool.query(
          `
          SELECT
            orders.*,
            users.email
          FROM orders
          LEFT JOIN users
            ON users.id = orders.user_id
          ORDER BY orders.created_at DESC
          `
        );

      const orders = [];

      for (const order of orderResult.rows) {

        const itemsResult =
          await pool.query(
            `
            SELECT
              id,
              order_id,
              product_id,
              product_name,
              price,
              quantity,
              size,
              color,
              image
            FROM order_items
            WHERE order_id = $1
            ORDER BY id ASC
            `,
            [order.id]
          );

        orders.push({
          ...order,
          items: itemsResult.rows
        });

      }

      return res.json({
        success: true,
        data: orders
      });


    } catch (error) {

      console.error(
        "ADMIN ORDERS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể tải đơn hàng."
      });

    }

  }
);

// =====================================================
// ADMIN - UPDATE ORDER STATUS
// =====================================================

app.patch(
  "/api/admin/orders/:code/status",
  async (req, res) => {

    try {

      const code =
        String(req.params.code || "").trim();

      const status =
        String(req.body.status || "").trim();


      const allowedStatuses = [
        "pending",
        "confirmed",
        "shipping",
        "delivered",
        "cancelled"
      ];


      if (!code) {

        return res.status(400).json({
          success: false,
          message: "Thiếu mã đơn hàng."
        });

      }


      if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
          success: false,
          message: "Trạng thái đơn hàng không hợp lệ."
        });

      }


    const result =
  await pool.query(
    `
    UPDATE orders

    SET
      status = $1::varchar,

      payment_status =
        CASE
          WHEN
            payment_method = 'cod'
            AND $1::varchar = 'delivered'
          THEN 'paid'

          ELSE payment_status
        END,

      paid_at =
        CASE
          WHEN
            payment_method = 'cod'
            AND $1::varchar = 'delivered'
          THEN COALESCE(
            paid_at,
            CURRENT_TIMESTAMP
          )

          ELSE paid_at
        END,

      updated_at = CURRENT_TIMESTAMP

    WHERE code = $2::varchar

    RETURNING *
    `,
    [
      status,
      code
    ]
  );

      if (result.rows.length === 0) {

        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng."
        });

      }


      return res.json({
        success: true,
        message:
          "Cập nhật trạng thái đơn hàng thành công.",
        order: result.rows[0]
      });


    } catch (error) {

      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể cập nhật trạng thái đơn hàng."
      });

    }

  }
);

// =====================================================
// ADMIN - UPDATE PAYMENT STATUS
// =====================================================

app.patch(
  "/api/admin/orders/:code/payment-status",
  async (req, res) => {

    try {

      const code =
        String(req.params.code || "").trim();

      const paymentStatus =
        String(
          req.body.paymentStatus || ""
        ).trim();


      const allowedPaymentStatuses = [
        "unpaid",
        "paid"
      ];


      if (!code) {

        return res.status(400).json({
          success: false,
          message: "Thiếu mã đơn hàng."
        });

      }


      if (
        !allowedPaymentStatuses.includes(
          paymentStatus
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Trạng thái thanh toán không hợp lệ."
        });

      }


      const result =
        await pool.query(
          `
          UPDATE orders

          SET
            payment_status = $1,

            paid_at =
              CASE
                WHEN $1 = 'paid'
                  THEN COALESCE(
                    paid_at,
                    CURRENT_TIMESTAMP
                  )
                ELSE NULL
              END,

            updated_at = CURRENT_TIMESTAMP

          WHERE code = $2

          RETURNING *
          `,
          [
            paymentStatus,
            code
          ]
        );


      if (result.rows.length === 0) {

        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy đơn hàng."
        });

      }


      return res.json({
        success: true,
        message:
          "Cập nhật trạng thái thanh toán thành công.",
        order: result.rows[0]
      });


    } catch (error) {

      console.error(
        "UPDATE PAYMENT STATUS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể cập nhật trạng thái thanh toán."
      });

    }

  }
);

// =====================================================
// ADMIN - CUSTOMERS
// =====================================================

app.get("/api/admin/customers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
  u.id,
  u.fullname,
  u.email,
  u.phone,
  u.role,

  u.gender,
  u.birthday,
  u.avatar,

  u.linked_accounts
    AS "linkedAccounts",

  u.created_at,
  u.updated_at,

        COUNT(o.id)::INTEGER AS order_count,

        COALESCE(
          SUM(
            CASE
              WHEN o.status = 'delivered'
              THEN o.total
              ELSE 0
            END
          ),
          0
        )::BIGINT AS total_spent,

        MAX(o.created_at) AS last_order_at

      FROM users u

      LEFT JOIN orders o
        ON o.user_id = u.id

      WHERE u.role = 'customer'

      GROUP BY
  u.id,
  u.fullname,
  u.email,
  u.phone,
  u.role,
  u.gender,
  u.birthday,
  u.avatar,
  u.linked_accounts,
  u.created_at,
  u.updated_at

      ORDER BY u.created_at DESC
    `);

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error(
      "GET ADMIN CUSTOMERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Không thể tải danh sách khách hàng."
    });
  }
});


// =====================================================
// SHOP SETTINGS
// =====================================================

app.get(
  "/api/settings",
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            store_name,
            shipping_fee,
            free_shipping_threshold,
            updated_at

          FROM shop_settings

          WHERE id = 1

          LIMIT 1
        `);


      return res.json({
        success: true,

        settings:
          result.rows[0] || {
            store_name: "ShopLux",
            shipping_fee: 30000,
            free_shipping_threshold: 1000000
          }
      });


    } catch (error) {

      console.error(
        "GET SETTINGS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Không thể tải cài đặt cửa hàng."
      });

    }

  }
);


// =====================================================
// ADMIN - UPDATE SHOP SETTINGS
// =====================================================

app.put(
  "/api/admin/settings",
  async (req, res) => {

    try {

      const storeName =
        String(
          req.body.store_name ??
          req.body.storeName ??
          "ShopLux"
        ).trim();


      const shippingFee =
        Math.max(
          0,
          Number(
            req.body.shipping_fee ??
            req.body.shippingFee ??
            0
          ) || 0
        );


      const freeShippingThreshold =
        Math.max(
          0,
          Number(
            req.body
              .free_shipping_threshold ??
            req.body
              .freeShippingThreshold ??
            0
          ) || 0
        );


      if (!storeName) {

        return res.status(400).json({
          success: false,
          message:
            "Tên cửa hàng không được để trống."
        });

      }


      const result =
        await pool.query(`
          INSERT INTO shop_settings (
            id,
            store_name,
            shipping_fee,
            free_shipping_threshold,
            updated_at
          )

          VALUES (
            1,
            $1,
            $2,
            $3,
            CURRENT_TIMESTAMP
          )

          ON CONFLICT (id)

          DO UPDATE SET

            store_name =
              EXCLUDED.store_name,

            shipping_fee =
              EXCLUDED.shipping_fee,

            free_shipping_threshold =
              EXCLUDED.free_shipping_threshold,

            updated_at =
              CURRENT_TIMESTAMP

          RETURNING *
        `, [
          storeName,
          shippingFee,
          freeShippingThreshold
        ]);


      return res.json({
        success: true,

        message:
          "Đã lưu cài đặt.",

        settings:
          result.rows[0]
      });


    } catch (error) {

      console.error(
        "UPDATE SETTINGS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Không thể lưu cài đặt."
      });

    }

  }
);


// =====================================================
// ROUTES
// =====================================================

app.get("/admin", (req, res) => {
  res.sendFile(
    path.join(__dirname, "frontend", "admin.html")
  );
});
app.get("/api/coupons", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        code,
        type,
        value,
        min_order,
        max_discount,
        usage_limit,
        used_count,
        active,
        start_at,
        end_at
      FROM coupons
      WHERE active = TRUE
        AND (start_at IS NULL OR start_at <= NOW())
        AND (end_at IS NULL OR end_at > NOW())
        AND (
          usage_limit IS NULL
          OR used_count < usage_limit
        )
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      coupons: result.rows
    });

  } catch (error) {
    console.error("GET PUBLIC COUPONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể tải mã giảm giá."
    });
  }
});

// Express 4 fallback
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "frontend", "index.html")
  );
});

// =====================================================
// START SERVER
// =====================================================

async function startServer() {
  try {
    await initDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`ShopLux running at port ${PORT}`);
    });

  } catch (error) {
    console.error("SERVER START ERROR:", error);
    process.exit(1);
  }
}

startServer();
