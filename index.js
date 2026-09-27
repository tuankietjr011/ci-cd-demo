const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Middleware thuần không cần thư viện ngoài
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "../frontend")));

const users = [
  { fullname: "Quản Trị Viên ShopLux", username: "admin", password: "admin123", role: "admin", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80", phone: "0905123456", address: "Kho Tổng ShopLux" }
];

let orders = [
  {
    orderId: "SL982103",
    createdAt: "27/09/2026, 14:30:00",
    username: "guest",
    fullname: "Nguyễn Văn A",
    phone: "0912345678",
    address: "123 Đường Hùng Vương, Huế",
    items: [
      { id: 1, name: "Áo Thun Nam Cotton Co Giãn 4 Chiều", price: 89000, qty: 2, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80" }
    ],
    shippingUnit: "ShopLux Express (Hỏa Tốc)",
    shippingCost: 25000,
    voucher: "NEWBIE100",
    discount: 50000,
    paymentMethod: "COD",
    total: 153000,
    statusStep: 2
  }
];

let products = [
  { id: 1, categoryId: 1, name: "Áo Thun Nam Cotton Co Giãn 4 Chiều", price: 89000, originalPrice: 150000, discount: "-41%", rating: 4.9, sold: "12,4k", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80", desc: "Chất liệu cotton cao cấp." },
  { id: 2, categoryId: 2, name: "Tai Nghe Bluetooth Không Dây ENC Chống Ồn", price: 249000, originalPrice: 450000, discount: "-45%", rating: 4.8, sold: "8,1k", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", desc: "Pin 40 giờ, lọc ồn chủ động." },
  { id: 3, categoryId: 3, name: "Bàn Phím Cơ RGB Hotswap 3 Mode Kết Nối", price: 699000, originalPrice: 1100000, discount: "-36%", rating: 5.0, sold: "3,2k", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80", desc: "Keycap PBT cao cấp." },
  { id: 4, categoryId: 3, name: "Chuột Gaming Không Dây Siêu Nhẹ 59g Sensor 3395", price: 450000, originalPrice: 790000, discount: "-43%", rating: 4.7, sold: "5,9k", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80", desc: "Trọng lượng siêu nhẹ." },
  { id: 5, categoryId: 4, name: "Đồng Hồ Thông Minh AMOLED Nghe Gọi Tiếng Việt", price: 890000, originalPrice: 1590000, discount: "-44%", rating: 4.9, sold: "2,1k", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", desc: "Màn hình Always-on Display." }
];



// ============================================================
// SHOPLUX CATEGORY SYSTEM V2
// ============================================================

const subcategories = {
  1: [
    { id: "ao-thun", name: "Áo thun" },
    { id: "do-bong-da", name: "Đồ bóng đá" },
    { id: "ao-so-mi", name: "Áo sơ mi" },
    { id: "quan-jeans", name: "Quần jeans" },
    { id: "ao-khoac", name: "Áo khoác" },
    { id: "khac", name: "Khác" }
  ],

  2: [
    { id: "iphone", name: "iPhone" },
    { id: "samsung", name: "Samsung" },
    { id: "xiaomi", name: "Xiaomi" },
    { id: "oppo", name: "OPPO" },
    { id: "vivo", name: "Vivo" },
    { id: "phu-kien-dien-thoai", name: "Phụ kiện điện thoại" },
    { id: "khac", name: "Khác" }
  ],

  3: [
    { id: "tai-nghe", name: "Tai nghe" },
    { id: "ban-phim", name: "Bàn phím" },
    { id: "chuot", name: "Chuột" },
    { id: "laptop", name: "Laptop" },
    { id: "loa", name: "Loa" },
    { id: "man-hinh", name: "Màn hình" },
    { id: "khac", name: "Khác" }
  ],

  4: [
    { id: "dong-ho-thong-minh", name: "Đồng hồ thông minh" },
    { id: "dong-ho-nam", name: "Đồng hồ nam" },
    { id: "dong-ho-nu", name: "Đồng hồ nữ" },
    { id: "dong-ho-the-thao", name: "Đồng hồ thể thao" },
    { id: "khac", name: "Khác" }
  ]
};

function normalizeProductText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function autoClassifyProduct(name = "") {
  const text = normalizeProductText(name);

  // ============================
  // THỜI TRANG
  // ============================

  if (
    text.includes("bong da") ||
    text.includes("da banh") ||
    text.includes("jersey") ||
    text.includes("football") ||
    text.includes("soccer") ||
    text.includes("ao clb") ||
    text.includes("ao doi tuyen")
  ) {
    return {
      categoryId: 1,
      subcategoryId: "do-bong-da"
    };
  }

  if (
    text.includes("ao thun") ||
    text.includes("t-shirt") ||
    text.includes("tshirt") ||
    text.includes("polo")
  ) {
    return {
      categoryId: 1,
      subcategoryId: "ao-thun"
    };
  }

  if (
    text.includes("so mi")
  ) {
    return {
      categoryId: 1,
      subcategoryId: "ao-so-mi"
    };
  }

  if (
    text.includes("jean") ||
    text.includes("denim")
  ) {
    return {
      categoryId: 1,
      subcategoryId: "quan-jeans"
    };
  }

  if (
    text.includes("ao khoac") ||
    text.includes("hoodie") ||
    text.includes("jacket")
  ) {
    return {
      categoryId: 1,
      subcategoryId: "ao-khoac"
    };
  }

  // ============================
  // ĐIỆN THOẠI
  // ============================

  if (
    text.includes("iphone") ||
    text.includes("apple phone")
  ) {
    return {
      categoryId: 2,
      subcategoryId: "iphone"
    };
  }

  if (
    text.includes("samsung galaxy") ||
    text.includes("galaxy s") ||
    text.includes("galaxy a") ||
    text.includes("galaxy z")
  ) {
    return {
      categoryId: 2,
      subcategoryId: "samsung"
    };
  }

  if (
    text.includes("xiaomi") ||
    text.includes("redmi") ||
    text.includes("poco")
  ) {
    return {
      categoryId: 2,
      subcategoryId: "xiaomi"
    };
  }

  if (text.includes("oppo")) {
    return {
      categoryId: 2,
      subcategoryId: "oppo"
    };
  }

  if (text.includes("vivo")) {
    return {
      categoryId: 2,
      subcategoryId: "vivo"
    };
  }

  if (
    text.includes("op lung") ||
    text.includes("cu sac") ||
    text.includes("sac dien thoai") ||
    text.includes("kinh cuong luc")
  ) {
    return {
      categoryId: 2,
      subcategoryId: "phu-kien-dien-thoai"
    };
  }

  // ============================
  // THIẾT BỊ ĐIỆN TỬ
  // ============================

  if (
    text.includes("tai nghe") ||
    text.includes("airpods") ||
    text.includes("headphone") ||
    text.includes("earphone")
  ) {
    return {
      categoryId: 3,
      subcategoryId: "tai-nghe"
    };
  }

  if (
    text.includes("ban phim") ||
    text.includes("keyboard")
  ) {
    return {
      categoryId: 3,
      subcategoryId: "ban-phim"
    };
  }

  if (
    text.includes("chuot") ||
    text.includes("mouse")
  ) {
    return {
      categoryId: 3,
      subcategoryId: "chuot"
    };
  }

  if (
    text.includes("laptop") ||
    text.includes("macbook")
  ) {
    return {
      categoryId: 3,
      subcategoryId: "laptop"
    };
  }

  if (
    text.includes("loa bluetooth") ||
    text.includes("speaker")
  ) {
    return {
      categoryId: 3,
      subcategoryId: "loa"
    };
  }

  if (
    text.includes("man hinh") ||
    text.includes("monitor")
  ) {
    return {
      categoryId: 3,
      subcategoryId: "man-hinh"
    };
  }

  // ============================
  // ĐỒNG HỒ
  // ============================

  if (
    text.includes("apple watch") ||
    text.includes("smartwatch") ||
    text.includes("smart watch") ||
    text.includes("galaxy watch") ||
    text.includes("dong ho thong minh")
  ) {
    return {
      categoryId: 4,
      subcategoryId: "dong-ho-thong-minh"
    };
  }

  if (
    text.includes("dong ho nam")
  ) {
    return {
      categoryId: 4,
      subcategoryId: "dong-ho-nam"
    };
  }

  if (
    text.includes("dong ho nu")
  ) {
    return {
      categoryId: 4,
      subcategoryId: "dong-ho-nu"
    };
  }

  if (
    text.includes("dong ho the thao") ||
    text.includes("sport watch")
  ) {
    return {
      categoryId: 4,
      subcategoryId: "dong-ho-the-thao"
    };
  }

  return null;
}

// ============================================================
// END SHOPLUX CATEGORY SYSTEM V2
// ============================================================

const categories = [
  { id: 0, name: "Tất Cả", icon: "🔥" },
  { id: 1, name: "Thời Trang", icon: "👕" },
  { id: 2, name: "Điện Thoại", icon: "📱" },
  { id: 3, name: "Điện Tử", icon: "💻" },
  { id: 4, name: "Đồng Hồ", icon: "⌚" }
];

app.get("/api/categories", (req, res) => res.json({ success: true, data: categories }));


// ============================================================
// API DANH MỤC CON
// ============================================================

app.get("/api/subcategories", (req, res) => {
  res.json({
    success: true,
    data: subcategories
  });
});

app.get("/api/subcategories/:categoryId", (req, res) => {
  const categoryId = Number(req.params.categoryId);

  res.json({
    success: true,
    data: subcategories[categoryId] || []
  });
});

app.get("/api/products", (req, res) => res.json({ success: true, data: products }));

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
  res.json({ success: true, user: { fullname: user.fullname, username: user.username, role: user.role || "customer", avatar: user.avatar } });
});

app.post("/api/orders", (req, res) => {
  const order = { ...req.body, orderId: "SL" + Date.now().toString().slice(-6), createdAt: new Date().toLocaleString("vi-VN"), statusStep: 1 };
  orders.unshift(order);
  res.json({ success: true, order });
});

app.get("/api/orders/:username", (req, res) => {
  res.json({ success: true, data: orders.filter(o => o.username === req.params.username) });
});

app.get("/api/admin/orders", (req, res) => res.json({ success: true, data: orders }));

app.put("/api/admin/orders/:orderId/status", (req, res) => {
  const order = orders.find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn!" });
  order.statusStep = parseInt(req.body.step);
  res.json({ success: true, order });
});

app.post("/api/admin/products", (req, res) => {
  const { name, price, image, desc } = req.body;
  if (!name || !price) return res.status(400).json({ success: false, message: "Thiếu tên hoặc giá!" });
  const p = {
    id: Date.now(),
    name,
    price: parseInt(price),
    originalPrice: Math.round(parseInt(price) * 1.3),
    discount: "-20%",
    rating: 5.0,
    sold: "0",
    categoryId: 1,
    image: image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    desc: desc || "Sản phẩm mới chính hãng ShopLux."
  };
  products.unshift(p);
  res.json({ success: true, product: p });
});

app.delete("/api/admin/products/:id", (req, res) => {
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.json({ success: true });
});

function serveFile(res, fileName) {
  const candidates = [
    path.join(__dirname, "frontend", fileName),
    path.join(__dirname, "../frontend", fileName)
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return res.sendFile(p);
  }
  res.status(404).send(fileName + " not found");
}

app.get("/admin", (req, res) => serveFile(res, "admin.html"));
app.get("/admin.html", (req, res) => serveFile(res, "admin.html"));
app.get("*", (req, res) => serveFile(res, "index.html"));

app.listen(PORT, "0.0.0.0", () => {
  console.log("Application running at port " + PORT);
});
