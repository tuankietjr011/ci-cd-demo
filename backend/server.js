const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "../frontend")));

const users = [
  { fullname: "Quản Trị Viên ShopLux", username: "admin", password: "admin123", role: "admin" }
];

let orders = [
  {
    orderId: "SL982103",
    createdAt: "27/09/2026, 14:30:00",
    username: "guest",
    fullname: "Nguyễn Văn A",
    phone: "0912345678",
    address: "123 Đường Hùng Vương, Huế",
    items: [{ id: 1, name: "Áo Thun Nam Cotton", price: 89000, qty: 2 }],
    total: 153000,
    statusStep: 1
  }
];

let products = [
  {
    id: 1,
    name: "Áo Thun Nam Cotton Co Giãn",
    price: 89000,
    categoryId: 1,
    images: [
      "https://via.placeholder.com/400x400?text=Anh+1",
      "https://via.placeholder.com/400x400?text=Anh+2",
      "https://via.placeholder.com/400x400?text=Anh+3",
      "https://via.placeholder.com/400x400?text=Anh+4"
    ],
    desc: "Chất vải cotton thoáng mát"
  }
];



// ============================================================
// PHÂN LOẠI DANH MỤC SẢN PHẨM
// ============================================================

const fashionSubcategories = [
  { id: "ao-thun", name: "Áo thun" },
  { id: "do-bong-da", name: "Đồ bóng đá" },
  { id: "ao-so-mi", name: "Áo sơ mi" },
  { id: "quan-jeans", name: "Quần jeans" },
  { id: "ao-khoac", name: "Áo khoác" },
  { id: "khac", name: "Khác" }
];

function normalizeVietnamese(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function classifyProduct(name = "") {
  const text = normalizeVietnamese(name);

  // ---------------------------
  // ĐỒ BÓNG ĐÁ
  // ---------------------------
  if (
    text.includes("bong da") ||
    text.includes("da bong") ||
    text.includes("da banh") ||
    text.includes("football") ||
    text.includes("soccer") ||
    text.includes("jersey") ||
    text.includes("quan bong") ||
    text.includes("ao doi tuyen") ||
    text.includes("ao clb")
  ) {
    return {
      categoryId: 1,
      subcategoryId: "do-bong-da"
    };
  }

  // ---------------------------
  // ÁO THUN
  // ---------------------------
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

  // ---------------------------
  // ÁO SƠ MI
  // ---------------------------
  if (
    text.includes("ao so mi") ||
    text.includes("so mi") ||
    text.includes("shirt")
  ) {
    return {
      categoryId: 1,
      subcategoryId: "ao-so-mi"
    };
  }

  // ---------------------------
  // QUẦN JEANS
  // ---------------------------
  if (
    text.includes("quan jeans") ||
    text.includes("quan jean") ||
    text.includes("jeans") ||
    text.includes("denim")
  ) {
    return {
      categoryId: 1,
      subcategoryId: "quan-jeans"
    };
  }

  // ---------------------------
  // ÁO KHOÁC
  // ---------------------------
  if (
    text.includes("ao khoac") ||
    text.includes("jacket") ||
    text.includes("hoodie")
  ) {
    return {
      categoryId: 1,
      subcategoryId: "ao-khoac"
    };
  }

  return null;
}


// AUTO CLASSIFY OLD PRODUCTS
products.forEach(product => {
  const detected = classifyProduct(product.name);

  if (detected) {
    product.categoryId = detected.categoryId;
    product.subcategoryId = detected.subcategoryId;
  } else if (Number(product.categoryId) === 1 && !product.subcategoryId) {
    product.subcategoryId = "khac";
  }

  // Đồng bộ image/images
  if (
    Array.isArray(product.images) &&
    product.images.length > 0 &&
    !product.image
  ) {
    product.image = product.images[0];
  }

  if (
    product.image &&
    (!Array.isArray(product.images) || product.images.length === 0)
  ) {
    product.images = [product.image];
  }
});

const categories = [
  { id: 1, name: "Thời Trang" },
  { id: 2, name: "Điện Thoại" },
  { id: 3, name: "Điện Tử" }
];

app.get("/api/categories", (req, res) => res.json({ success: true, data: categories }));

app.get("/api/categories/fashion", (req, res) => {
  res.json({
    success: true,
    data: fashionSubcategories
  });
});
app.get("/api/products", (req, res) => res.json({ success: true, data: products }));

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
  res.json({ success: true, user });
});

app.get("/api/orders/:username", (req, res) => {
  res.json({ success: true, data: orders.filter(o => o.username === req.params.username) });
});

app.get("/api/admin/orders", (req, res) => res.json({ success: true, data: orders }));

app.put("/api/admin/orders/:orderId/status", (req, res) => {
  const order = orders.find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ success: false });
  order.statusStep = parseInt(req.body.step);
  res.json({ success: true, order });
});

app.post("/api/admin/products", (req, res) => {
  // AUTO CATEGORY POST PRODUCT
  const {
    name,
    price,
    images,
    image,
    desc,
    categoryId,
    subcategoryId
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: "Thiếu tên hoặc giá sản phẩm!"
    });
  }

  const detected = classifyProduct(name);

  let finalCategoryId =
    detected?.categoryId ||
    parseInt(categoryId) ||
    1;

  let finalSubcategoryId =
    detected?.subcategoryId ||
    subcategoryId ||
    (finalCategoryId === 1 ? "khac" : null);

  let imgList = Array.isArray(images)
    ? images.filter(Boolean)
    : [];

  if (imgList.length === 0 && image) {
    imgList.push(image);
  }

  const parsedPrice = parseInt(price);

  const newProduct = {
    id: Date.now(),

    name,

    price: parsedPrice,

    originalPrice:
      req.body.originalPrice
        ? parseInt(req.body.originalPrice)
        : Math.round(parsedPrice * 1.3),

    discount:
      req.body.discount || "-20%",

    rating:
      req.body.rating || 5.0,

    sold:
      req.body.sold || "0",

    categoryId: finalCategoryId,

    subcategoryId: finalSubcategoryId,

    image:
      imgList.length > 0
        ? imgList[0]
        : "",

    images: imgList,

    desc:
      desc || "Sản phẩm chính hãng ShopLux."
  };

  products.unshift(newProduct);

  res.json({
    success: true,
    message: "Thêm sản phẩm thành công!",
    product: newProduct
  });
});

app.put("/api/admin/products/:id", (req, res) => {
  // AUTO CATEGORY PUT PRODUCT

  const id = parseInt(req.params.id);

  const product = products.find(
    item => Number(item.id) === id
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy sản phẩm!"
    });
  }

  const {
    name,
    price,
    images,
    image,
    desc,
    categoryId,
    subcategoryId
  } = req.body;

  if (name !== undefined) {
    product.name = name;
  }

  if (price !== undefined && price !== "") {
    product.price = parseInt(price);
  }

  if (desc !== undefined) {
    product.desc = desc;
  }

  if (categoryId !== undefined) {
    product.categoryId = parseInt(categoryId);
  }

  if (subcategoryId !== undefined) {
    product.subcategoryId = subcategoryId;
  }

  // Tự động phân loại lại theo tên
  const detected = classifyProduct(product.name);

  if (detected) {
    product.categoryId = detected.categoryId;
    product.subcategoryId =
      detected.subcategoryId;
  } else if (Number(product.categoryId) === 1) {
    product.subcategoryId =
      product.subcategoryId || "khac";
  } else {
    product.subcategoryId = null;
  }

  // Cập nhật nhiều ảnh
  if (Array.isArray(images)) {
    product.images = images.filter(Boolean);

    product.image =
      product.images.length > 0
        ? product.images[0]
        : "";
  } else if (image !== undefined) {
    product.image = image;

    if (image) {
      product.images = [image];
    }
  }

  res.json({
    success: true,
    message: "Cập nhật sản phẩm thành công!",
    product
  });
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
  console.log("Server running on port " + PORT);
});
