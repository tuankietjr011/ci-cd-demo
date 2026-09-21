const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Bộ nhớ tạm lưu dữ liệu
const users = [];
const products = [
  {
    id: 1,
    name: "Tai nghe Không Dây Chống Ồn",
    price: 1250000,
    category: "Công nghệ",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    desc: "Âm thanh vòm sống động, pin trâu 40 giờ."
  },
  {
    id: 2,
    name: "Bàn Phím Cơ RGB",
    price: 1850000,
    category: "Phụ kiện",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
    desc: "Switch gõ êm, kết nối đa thiết bị Bluetooth & 2.4Ghz."
  },
  {
    id: 3,
    name: "Chuột Gaming Ergonomic",
    price: 890000,
    category: "Phụ kiện",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80",
    desc: "Cảm biến quang học 16000 DPI siêu nhạy."
  },
  {
    id: 4,
    name: "Đồng Hồ Thông Minh Sport",
    price: 2490000,
    category: "Công nghệ",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    desc: "Đo nhịp tim, chống nước 5ATM, màn hình AMOLED."
  }
];

// 1. API Lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: products });
});

// 2. API Đăng ký
app.post('/api/auth/register', (req, res) => {
  const { fullname, username, password } = req.body;
  if (!fullname || !username || !password) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
  }
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });
  }
  users.push({ fullname, username, password });
  res.json({ success: true, message: "Đăng ký thành công! Hãy đăng nhập." });
});

// 3. API Đăng nhập
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" });
  }
  res.json({ success: true, user: { fullname: user.fullname, username: user.username } });
});

module.exports = app;
