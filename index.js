const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Dữ liệu sản phẩm mẫu
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
    name: "Bàn Phím Cơ Không Dây RGB",
    price: 1850000,
    category: "Phụ kiện",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
    desc: "Switch gõ êm, kết nối đa thiết bị Bluetooth & 2.4Ghz."
  },
  {
    id: 3,
    name: "Chuột Gaming Công Thái Học",
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

// API lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Trang chủ hiển thị giao diện bán hàng
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevOps TechStore</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-800 font-sans">
  <!-- Navbar -->
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <span class="text-2xl">⚡</span>
        <h1 class="text-xl font-bold text-indigo-600 tracking-wide">DevOps TechStore</h1>
      </div>
      <button onclick="toggleCartModal()" class="relative bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2">
        <span>🛒 Giỏ hàng</span>
        <span id="cart-count" class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">0</span>
      </button>
    </div>
  </header>

  <!-- Banner -->
  <section class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-4 text-center">
    <h2 class="text-3xl font-extrabold sm:text-4xl">Công Nghệ Đỉnh Cao - Giá Cực Tốt</h2>
    <p class="mt-2 text-indigo-100">Hệ thống triển khai tự động qua Docker & GitHub Actions Pipeline.</p>
  </section>

  <!-- Product List -->
  <main class="max-w-6xl mx-auto px-4 py-10">
    <h3 class="text-2xl font-bold mb-6 text-gray-900 border-l-4 border-indigo-600 pl-3">Sản phẩm nổi bật</h3>
    <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <!-- Sản phẩm render bằng JS -->
    </div>
  </main>

  <!-- Modal Giỏ hàng -->
  <div id="cart-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
      <div class="flex justify-between items-center border-b pb-3">
        <h4 class="text-xl font-bold">Giỏ hàng của bạn</h4>
        <button onclick="toggleCartModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>
      <div id="cart-items" class="divide-y max-h-64 overflow-y-auto my-4">
        <!-- Item giỏ hàng render bằng JS -->
      </div>
      <div class="border-t pt-3 flex justify-between font-bold text-lg">
        <span>Tổng cộng:</span>
        <span id="cart-total" class="text-indigo-600">0 đ</span>
      </div>
      <div class="mt-6 flex space-x-3">
        <button onclick="checkout()" class="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-semibold transition">Thanh toán ngay</button>
        <button onclick="clearCart()" class="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition">Xóa hết</button>
      </div>
    </div>
  </div>

  <script>
    let cart = [];

    // Tải danh sách sản phẩm từ backend API
    async function loadProducts() {
      const res = await fetch('/api/products');
      const products = await res.json();
      const grid = document.getElementById('product-grid');
      
      grid.innerHTML = products.map(p => \`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col justify-between">
          <img src="\${p.image}" alt="\${p.name}" class="w-full h-48 object-cover">
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">\${p.category}</span>
              <h4 class="font-bold text-gray-800 mt-2 text-base line-clamp-1">\${p.name}</h4>
              <p class="text-gray-500 text-xs mt-1 line-clamp-2">\${p.desc}</p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span class="font-bold text-indigo-600">\${p.price.toLocaleString()} đ</span>
              <button onclick="addToCart(\${p.id}, '\${p.name}', \${p.price})" class="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                + Thêm
              </button>
            </div>
          </div>
        </div>
      \`).join('');
    }

    function addToCart(id, name, price) {
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, name, price, qty: 1 });
      }
      updateCartUI();
    }

    function updateCartUI() {
      const count = cart.reduce((sum, item) => sum + item.qty, 0);
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      document.getElementById('cart-count').innerText = count;
      document.getElementById('cart-total').innerText = total.toLocaleString() + ' đ';

      const itemsContainer = document.getElementById('cart-items');
      if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="text-center text-gray-400 py-6">Giỏ hàng đang trống</p>';
        return;
      }

      itemsContainer.innerHTML = cart.map(item => \`
        <div class="py-3 flex justify-between items-center">
          <div>
            <h5 class="font-semibold text-sm">\${item.name}</h5>
            <span class="text-xs text-gray-500">\${item.price.toLocaleString()} đ x \${item.qty}</span>
          </div>
          <span class="font-bold text-sm text-indigo-600">\${(item.price * item.qty).toLocaleString()} đ</span>
        </div>
      \`).join('');
    }

    function toggleCartModal() {
      const modal = document.getElementById('cart-modal');
      modal.classList.toggle('hidden');
    }

    function clearCart() {
      cart = [];
      updateCartUI();
    }

    function checkout() {
      if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
      }
      alert('Đơn hàng đã được đặt thành công! Cảm ơn bạn.');
      clearCart();
      toggleCartModal();
    }

    loadProducts();
  </script>
</body>
</html>
  `);
});

app.listen(port, () => {
  console.log(`E-commerce app running on port ${port}`);
});
