const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
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
  { id: 1, categoryId: 1, name: "Áo Thun Nam Cotton Co Giãn 4 Chiều", price: 89000, originalPrice: 150000, discount: "-41%", rating: 4.9, sold: "12,4k", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80", desc: "Chất liệu cotton cao cấp, thấm hút mồ hôi tối đa." },
  { id: 2, categoryId: 2, name: "Tai Nghe Bluetooth Không Dây ENC Chống Ồn", price: 249000, originalPrice: 450000, discount: "-45%", rating: 4.8, sold: "8,1k", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", desc: "Pin 40 giờ, lọc ồn chủ động, kháng nước IPX5." },
  { id: 3, categoryId: 3, name: "Bàn Phím Cơ RGB Hotswap 3 Mode Kết Nối", price: 699000, originalPrice: 1100000, discount: "-36%", rating: 5.0, sold: "3,2k", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80", desc: "Keycap PBT cao cấp, switch pre-lubed gõ siêu êm." },
  { id: 4, categoryId: 3, name: "Chuột Gaming Không Dây Siêu Nhẹ 59g Sensor 3395", price: 450000, originalPrice: 790000, discount: "-43%", rating: 4.7, sold: "5,9k", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80", desc: "Trọng lượng siêu nhẹ chỉ 59 gram, cảm biến quang học cực chuẩn." },
  { id: 5, categoryId: 4, name: "Đồng Hồ Thông Minh AMOLED Nghe Gọi Tiếng Việt", price: 890000, originalPrice: 1590000, discount: "-44%", rating: 4.9, sold: "2,1k", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", desc: "Màn hình Always-on Display, theo dõi sức khỏe và nhịp tim 24/7." }
];

const categories = [
  { id: 0, name: "Tất Cả", icon: "🔥" },
  { id: 1, name: "Thời Trang", icon: "👕" },
  { id: 2, name: "Điện Thoại", icon: "📱" },
  { id: 3, name: "Điện Tử", icon: "💻" },
  { id: 4, name: "Đồng Hồ", icon: "⌚" }
];

app.get("/api/categories", (req, res) => res.json({ success: true, data: categories }));
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

// APIS ADMIN
app.get("/api/admin/orders", (req, res) => res.json({ success: true, data: orders }));

app.put("/api/admin/orders/:orderId/status", (req, res) => {
  const order = orders.find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
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
    desc: desc || "Sản phẩm phân phối chính hãng bởi ShopLux."
  };
  products.unshift(p);
  res.json({ success: true, product: p });
});

app.delete("/api/admin/products/:id", (req, res) => {
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.json({ success: true });
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("ShopLux Server running on port " + PORT));
