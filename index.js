const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "frontend")));

// ==================== DATA ====================

const categories = [
  { id: 1, name: "Nam" },
  { id: 2, name: "Nữ" },
  { id: 3, name: "Giày Dép" },
  { id: 4, name: "Phụ Kiện" },
  { id: 5, name: "Đồ Bóng Đá" }
];

const subcategories = {
  1: [
    { id: "ao-thun-nam", name: "Áo thun" },
    { id: "ao-polo-nam", name: "Áo polo" },
    { id: "ao-so-mi-nam", name: "Áo sơ mi" },
    { id: "ao-khoac-nam", name: "Áo khoác" },
    { id: "quan-jeans-nam", name: "Quần jeans" },
    { id: "quan-short-nam", name: "Quần short" }
  ],
  2: [
    { id: "ao-nu", name: "Áo nữ" },
    { id: "vay-dam", name: "Váy / Đầm" },
    { id: "quan-nu", name: "Quần nữ" },
    { id: "ao-khoac-nu", name: "Áo khoác nữ" }
  ],
  3: [
    { id: "sneaker", name: "Sneaker" },
    { id: "giay-the-thao", name: "Giày thể thao" },
    { id: "dep", name: "Dép" }
  ],
  4: [
    { id: "tui-balo", name: "Túi / Balo" },
    { id: "mu", name: "Mũ" },
    { id: "kinh", name: "Kính" },
    { id: "that-lung", name: "Thắt lưng" },
    { id: "vi", name: "Ví" }
  ],
  5: [
    { id: "ao-clb", name: "Áo CLB" },
    { id: "ao-doi-tuyen", name: "Áo đội tuyển" },
    { id: "quan-bong-da", name: "Quần bóng đá" },
    { id: "giay-bong-da", name: "Giày bóng đá" },
    { id: "phu-kien-bong-da", name: "Phụ kiện bóng đá" }
  ]
};

let products = [
  {
    id: 1,
    name: "Áo Thun Nam Cotton Premium",
    brand: "ShopLux",
    price: 299000,
    originalPrice: 399000,
    categoryId: 1,
    subcategoryId: "ao-thun-nam",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900"
    ],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900",
    desc: "Áo thun nam cotton cao cấp, form hiện đại.",
    rating: 4.9,
    sold: 128
  },
  {
    id: 2,
    name: "Sneaker Trắng Premium",
    brand: "ShopLux",
    price: 799000,
    originalPrice: 1090000,
    categoryId: 3,
    subcategoryId: "sneaker",
    sizes: ["39", "40", "41", "42", "43"],
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900"
    ],
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900",
    desc: "Sneaker phong cách tối giản, dễ phối đồ.",
    rating: 4.8,
    sold: 86
  },
  {
    id: 3,
    name: "Áo Bóng Đá Bayern Munich",
    brand: "adidas",
    price: 399000,
    originalPrice: 599000,
    categoryId: 5,
    subcategoryId: "ao-clb",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=900"
    ],
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=900",
    desc: "Áo bóng đá phong cách CLB, chất liệu thể thao thoáng khí.",
    rating: 5,
    sold: 215
  }
];

let orders = [];

// ==================== AUTH ====================

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    return res.json({
      success: true,
      user: { username: "admin", role: "admin" }
    });
  }

  res.status(401).json({
    success: false,
    message: "Sai tài khoản hoặc mật khẩu"
  });
});

// ==================== CATEGORY ====================

app.get("/api/categories", (req, res) => {
  res.json({ success: true, data: categories });
});

app.get("/api/subcategories", (req, res) => {
  res.json({ success: true, data: subcategories });
});

app.get("/api/subcategories/:categoryId", (req, res) => {
  res.json({
    success: true,
    data: subcategories[Number(req.params.categoryId)] || []
  });
});

// ==================== PRODUCTS ====================

app.get("/api/products", (req, res) => {
  res.json({ success: true, data: products });
});

app.post("/api/admin/products", (req, res) => {
  const {
    name,
    brand,
    price,
    originalPrice,
    categoryId,
    subcategoryId,
    sizes,
    images,
    desc
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập tên và giá sản phẩm"
    });
  }

  const imageList = Array.isArray(images)
    ? images.filter(Boolean).slice(0, 4)
    : [];

  const product = {
    id: Date.now(),
    name: String(name).trim(),
    brand: brand || "ShopLux",
    price: Number(price),
    originalPrice: Number(originalPrice) || Number(price),
    categoryId: Number(categoryId) || 1,
    subcategoryId: subcategoryId || "",
    sizes: Array.isArray(sizes) ? sizes : [],
    images: imageList,
    image: imageList[0] || "",
    desc: desc || "",
    rating: 5,
    sold: 0
  };

  products.unshift(product);

  res.json({
    success: true,
    product
  });
});

app.put("/api/admin/products/:id", (req, res) => {
  const product = products.find(
    p => Number(p.id) === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy sản phẩm"
    });
  }

  const {
    name,
    brand,
    price,
    originalPrice,
    categoryId,
    subcategoryId,
    sizes,
    images,
    desc
  } = req.body;

  if (name !== undefined) product.name = String(name).trim();
  if (brand !== undefined) product.brand = brand;

  if (price !== undefined) {
    product.price = Number(price);
  }

  if (originalPrice !== undefined) {
    product.originalPrice =
      Number(originalPrice) || Number(product.price);
  }

  if (categoryId !== undefined) {
    product.categoryId = Number(categoryId);
  }

  if (subcategoryId !== undefined) {
    product.subcategoryId = subcategoryId;
  }

  if (Array.isArray(sizes)) {
    product.sizes = sizes;
  }

  if (Array.isArray(images)) {
    product.images = images.filter(Boolean).slice(0, 4);
    product.image = product.images[0] || "";
  }

  if (desc !== undefined) product.desc = desc;

  res.json({
    success: true,
    product
  });
});

app.delete("/api/admin/products/:id", (req, res) => {
  const id = Number(req.params.id);

  products = products.filter(
    p => Number(p.id) !== id
  );

  res.json({ success: true });
});

// ==================== ORDERS ====================

app.get("/api/admin/orders", (req, res) => {
  res.json({
    success: true,
    data: orders
  });
});

app.post("/api/orders", (req, res) => {
  const order = {
    ...req.body,
    orderId: "SL" + Date.now(),
    createdAt: new Date().toLocaleString("vi-VN"),
    statusStep: 1
  };

  orders.unshift(order);

  res.json({
    success: true,
    order
  });
});

// ==================== FRONTEND ====================

app.get("/admin", (req, res) => {
  res.sendFile(
    path.join(__dirname, "frontend", "admin.html")
  );
});

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "frontend", "index.html")
  );
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Application running at port ${PORT}`);
});