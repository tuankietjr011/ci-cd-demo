const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const users = [];

const categories = [
  { id: 0, name: "Tất Cả", icon: "🔥" },
  { id: 1, name: "Thời Trang Nam", icon: "👕" },
  { id: 2, name: "Điện Thoại & Phụ Kiện", icon: "📱" },
  { id: 3, name: "Thiết Bị Điện Tử", icon: "💻" },
  { id: 4, name: "Máy Ảnh", icon: "📷" },
  { id: 5, name: "Đồng Hồ", icon: "⌚" },
  { id: 6, name: "Giày Dép Nam", icon: "👟" },
  { id: 7, name: "Gia Dụng", icon: "🔌" },
  { id: 8, name: "Thể Thao", icon: "⚽" }
];

const products = [
  {
    id: 1,
    categoryId: 1,
    name: "Áo Thun Nam Cổ Tròn Cotton Co Giãn 4 Chiều Thoáng Mát",
    price: 89000,
    originalPrice: 150000,
    discount: "-41%",
    rating: 4.9,
    sold: "12,4k",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80",
    desc: "Chất liệu cotton cao cấp, thấm hút mồ hôi tối đa, không xù lông khi giặt máy."
  },
  {
    id: 2,
    categoryId: 2,
    name: "Tai Nghe Bluetooth Không Dây Pin Trâu 40H Chống Ồn ENC",
    price: 249000,
    originalPrice: 450000,
    discount: "-45%",
    rating: 4.8,
    sold: "8,1k",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    desc: "Công nghệ lọc ồn chủ động ENC, chuẩn kháng nước IPX5, độ trễ cực thấp chơi game cực mượt."
  },
  {
    id: 3,
    categoryId: 3,
    name: "Bàn Phím Cơ Không Dây RGB Hotswap 3 Mode Kết Nối",
    price: 699000,
    originalPrice: 1100000,
    discount: "-36%",
    rating: 5.0,
    sold: "3,2k",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
    desc: "Keycap PBT cao cấp, switch pre-lubed mượt mà, hỗ trợ kết nối Bluetooth/Type-C/Wireless 2.4G."
  },
  {
    id: 4,
    categoryId: 3,
    name: "Chuột Gaming Không Dây Siêu Nhẹ 59g Sensor Pixart 3395",
    price: 450000,
    originalPrice: 790000,
    discount: "-43%",
    rating: 4.7,
    sold: "5,9k",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80",
    desc: "Trọng lượng siêu nhẹ chỉ 59 gram, cảm biến quang học Pixart 26.000 DPI siêu chuẩn xác."
  },
  {
    id: 5,
    categoryId: 5,
    name: "Đồng Hồ Thông Minh Màn Hình AMOLED Nghe Gọi Tiếng Việt",
    price: 890000,
    originalPrice: 1590000,
    discount: "-44%",
    rating: 4.9,
    sold: "2,1k",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    desc: "Màn hình tràn viền AMOLED Always-on Display, theo dõi sức khỏe và nhịp tim 24/7."
  },
  {
    id: 6,
    categoryId: 2,
    name: "Sạc Dự Phòng 20000mAh Sạc Nhanh 22.5W Màn Hình LED",
    price: 199000,
    originalPrice: 350000,
    discount: "-43%",
    rating: 4.8,
    sold: "19,8k",
    image: "https://images.unsplash.com/photo-1609592426508-cc0376d8b3c6?w=500&q=80",
    desc: "Dung lượng chuẩn 20000mAh, hỗ trợ chuẩn PD và QC 3.0 sạc cùng lúc 3 thiết bị an toàn."
  }
];

app.get('/api/categories', (req, res) => res.json({ success: true, data: categories }));
app.get('/api/products', (req, res) => res.json({ success: true, data: products }));

app.post('/api/auth/register', (req, res) => {
  const { fullname, username, password } = req.body;
  if (!fullname || !username || !password) return res.status(400).json({ success: false, message: "Vui lòng nhập đủ thông tin!" });
  if (users.find(u => u.username === username)) return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });
  users.push({ fullname, username, password });
  res.json({ success: true, message: "Đăng ký thành công!" });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng!" });
  res.json({ success: true, user: { fullname: user.fullname, username: user.username } });
});

module.exports = app;
