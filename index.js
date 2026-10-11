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

const initDatabase = require("./src/database/init")(pool, defaultProducts);

let orders = [];


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


const routeContext = { app, pool, path, rootDir: __dirname, bcrypt, jwt, JWT_SECRET, categories, subcategories, brands, defaultProducts, authenticateToken, requireAdmin, orders };
require("./src/routes/auth")(routeContext);
require("./src/routes/profile")(routeContext);
require("./src/routes/addresses")(routeContext);
require("./src/routes/catalog")(routeContext);
require("./src/routes/admin-products")(routeContext);
require("./src/routes/coupons")(routeContext);
require("./src/routes/orders")(routeContext);
require("./src/routes/my-orders")(routeContext);
require("./src/routes/admin-orders")(routeContext);
require("./src/routes/admin-customers")(routeContext);
require("./src/routes/settings")(routeContext);
require("./src/routes/pages")(routeContext);

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
