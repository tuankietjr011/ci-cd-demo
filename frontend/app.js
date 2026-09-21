const API_URL = '/api';
let allProducts = [];
let allCategories = [];
let cart = JSON.parse(localStorage.getItem('shoplux_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('shoplux_user')) || null;

function renderAuth() {
  const container = document.getElementById('auth-section');
  if (!container) return;
  if (currentUser) {
    container.innerHTML = `
      <span class="font-bold text-white">👤 ${currentUser.fullname}</span>
      <span>|</span>
      <button onclick="logout()" class="hover:underline">Đăng Xuất</button>
    `;
  } else {
    container.innerHTML = `
      <a href="?view=register" class="hover:underline">Đăng Ký</a>
      <span>|</span>
      <a href="?view=login" class="hover:underline">Đăng Nhập</a>
    `;
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('shoplux_user');
  renderAuth();
  window.location.href = '/';
}

function navigateToSearch(event) {
  event.preventDefault();
  const keyword = document.getElementById('search-input').value.trim();
  window.location.href = keyword ? `?search=${encodeURIComponent(keyword)}` : '/';
}

// ROUTER
async function router() {
  renderAuth();
  updateCartBadge();

  const [prodRes, catRes] = await Promise.all([
    fetch(`${API_URL}/products`),
    fetch(`${API_URL}/categories`)
  ]);
  allProducts = (await prodRes.json()).data;
  allCategories = (await catRes.json()).data;

  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  const search = params.get('search');
  const productId = params.get('id');

  const viewport = document.getElementById('app-viewport');
  const header = document.getElementById('main-header');

  // Nếu là trang login hoặc register riêng, ẩn header thường để dùng header riêng chuẩn Shopee
  if (view === 'login' || view === 'register') {
    if (header) header.classList.add('hidden');
  } else {
    if (header) header.classList.remove('hidden');
  }

  if (search !== null) return renderSearchView(viewport, search);
  if (productId) return renderProductDetailView(viewport, parseInt(productId));

  switch (view) {
    case 'login': renderLoginPage(viewport); break;
    case 'register': renderRegisterPage(viewport); break;
    case 'seller-channel': renderSellerChannelView(viewport); break;
    case 'be-seller': renderBeSellerView(viewport); break;
    case 'connect': renderConnectView(viewport); break;
    case 'notifications': renderNotificationsView(viewport); break;
    case 'support': renderSupportView(viewport); break;
    case 'cart': renderCartView(viewport); break;
    default: renderHomeView(viewport); break;
  }
}

// --- TRANG CHỦ (ĐÃ FIX KHỐI VÀNG VÀ TRÀN ẢNH) ---
function renderHomeView(container) {
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <!-- Banners: Cố định kích thước chuẩn tỷ lệ, chống tràn -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2 h-56">
        <div class="md:col-span-2 relative rounded overflow-hidden shadow-sm bg-gray-200 h-56">
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=60" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
            <span class="bg-[#ee4d2d] w-max px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sm">ShopLux Mall</span>
            <h2 class="text-xl font-bold mt-1">SIÊU HỘI MUA SẮM SHOPLUX</h2>
            <p class="text-[11px] opacity-90">Freeship đơn từ 0Đ - Voucher 50k toàn sàn</p>
          </div>
        </div>
        <div class="grid grid-rows-2 gap-2 h-56">
          <div class="rounded overflow-hidden shadow-sm bg-gray-200 h-[108px]">
            <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=60" class="w-full h-full object-cover">
          </div>
          <div class="rounded overflow-hidden shadow-sm bg-gray-200 h-[108px]">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=60" class="w-full h-full object-cover">
          </div>
        </div>
      </div>

      <!-- Tiện ích nhanh (khắc phục hoàn toàn lỗi khối màu vàng) -->
      <div class="grid grid-cols-3 md:grid-cols-6 gap-3 bg-white p-4 rounded shadow-sm text-center">
        <a href="?search=" class="flex flex-col items-center hover:-translate-y-0.5 transition">
          <div class="w-10 h-10 rounded-full bg-orange-50 text-[#ee4d2d] flex items-center justify-center text-lg mb-1">🎟️</div>
          <span class="font-medium text-gray-700">Mã Giảm Giá</span>
        </a>
        <a href="?view=cart" class="flex flex-col items-center hover:-translate-y-0.5 transition">
          <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-lg mb-1">🚚</div>
          <span class="font-medium text-gray-700">Freeship 0Đ</span>
        </a>
        <a href="?search=Điện Thoại" class="flex flex-col items-center hover:-translate-y-0.5 transition">
          <div class="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-lg mb-1">📱</div>
          <span class="font-medium text-gray-700">Nạp Tiện Ích</span>
        </a>
        <a href="?view=seller-channel" class="flex flex-col items-center hover:-translate-y-0.5 transition">
          <div class="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-lg mb-1">🏠</div>
          <span class="font-medium text-gray-700">ShopLux Mall</span>
        </a>
        <a href="?view=be-seller" class="flex flex-col items-center hover:-translate-y-0.5 transition">
          <div class="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center text-lg mb-1">👑</div>
          <span class="font-medium text-gray-700">Khách Thân Thiết</span>
        </a>
        <a href="?search=" class="flex flex-col items-center hover:-translate-y-0.5 transition">
          <div class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-lg mb-1">🔥</div>
          <span class="font-medium text-gray-700">Deal Từ 1.000Đ</span>
        </a>
      </div>

      <!-- Danh mục sản phẩm -->
      <div class="bg-white rounded shadow-sm">
        <div class="p-3 border-b text-gray-500 font-bold uppercase text-[11px]">DANH MỤC</div>
        <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 divide-x divide-y border-b text-center">
          ${allCategories.map(c => `
            <a href="?search=${encodeURIComponent(c.name)}" class="p-2 cursor-pointer hover:bg-orange-50 transition flex flex-col items-center justify-center">
              <span class="text-xl mb-1">${c.icon}</span>
              <span class="text-[11px] text-gray-700 leading-tight">${c.name}</span>
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Gợi ý hôm nay -->
      <div>
        <div class="bg-white p-3 border-b-2 border-[#ee4d2d] flex justify-between items-center mb-3">
          <span class="font-bold text-[#ee4d2d] uppercase tracking-wider text-xs">GỢI Ý HÔM NAY</span>
          <span class="text-gray-400 text-[11px]">${allProducts.length} sản phẩm hot</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          ${renderProductCards(allProducts)}
        </div>
      </div>
    </div>
  `;
}

// THẺ SẢN PHẨM: ĐỦ CẶP NÚT [MUA NGAY] VÀ [HÌNH GIỎ HÀNG]
function renderProductCards(products) {
  return products.map(p => `
    <div class="bg-white rounded shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col justify-between overflow-hidden relative group">
      <div class="absolute top-0 right-0 bg-[#ffd839] text-[#ee4d2d] text-[9px] font-bold px-1 py-0.5 uppercase z-10">${p.discount}</div>
      <a href="?id=${p.id}" class="w-full aspect-square bg-gray-100 overflow-hidden block">
        <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-200" alt="${p.name}">
      </a>
      <div class="p-2 flex-1 flex flex-col justify-between">
        <a href="?id=${p.id}" class="text-[11px] text-gray-800 line-clamp-2 leading-relaxed mb-1 hover:text-[#ee4d2d]">${p.name}</a>
        <div>
          <div class="flex items-baseline space-x-1">
            <span class="text-[#ee4d2d] font-bold text-xs">${p.price.toLocaleString()} ₫</span>
            <span class="text-[9px] text-gray-400 line-through">${p.originalPrice.toLocaleString()} ₫</span>
          </div>
          <div class="flex justify-between items-center text-[9px] text-gray-400 mt-1">
            <span>⭐ ${p.rating}</span>
            <span>Đã bán ${p.sold}</span>
          </div>
        </div>
      </div>
      <!-- Cặp nút Mua Ngay và Thêm Giỏ Hàng -->
      <div class="p-2 pt-0 flex space-x-1">
        <button onclick="addToCartAndNotify(${p.id})" title="Thêm vào giỏ hàng" class="w-8 h-7 bg-orange-100 border border-[#ee4d2d] text-[#ee4d2d] rounded flex items-center justify-center hover:bg-orange-200 transition">
          <i class="fas fa-cart-plus text-xs"></i>
        </button>
        <button onclick="buyNowDirect(${p.id})" class="flex-1 bg-[#ee4d2d] hover:bg-[#d73211] text-white py-1 rounded text-[10px] font-bold uppercase transition">
          Mua Ngay
        </button>
      </div>
    </div>
  `).join('');
}

// --- TRANG ĐĂNG NHẬP RIÊNG BIỆT (GIỐNG SHOPEE) ---
function renderLoginPage(container) {
  container.innerHTML = `
    <div class="w-full">
      <!-- Sub-header của trang Auth -->
      <div class="bg-white border-b py-4 shadow-sm">
        <div class="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-2 text-[#ee4d2d]">
              <div class="w-9 h-10 border-2 border-[#ee4d2d] rounded-md flex items-center justify-center font-black text-xl">L</div>
              <span class="text-2xl font-bold">ShopLux</span>
            </a>
            <span class="text-xl text-gray-700 font-medium">Đăng Nhập</span>
          </div>
          <a href="?view=support" class="text-xs text-[#ee4d2d]">Bạn cần giúp đỡ?</a>
        </div>
      </div>

      <!-- Khung Đăng nhập chuẩn Shopee (nền cam, form nổi bên phải) -->
      <div class="shop-gradient py-12">
        <div class="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div class="text-white hidden md:block max-w-md">
            <h1 class="text-4xl font-extrabold tracking-tight">Mua Sắm Đẳng Cấp</h1>
            <p class="mt-3 text-sm opacity-90 leading-relaxed">Nền tảng thương mại điện tử hàng đầu với hàng triệu voucher và ưu đãi freeship mỗi ngày.</p>
          </div>
          <div class="bg-white p-8 rounded shadow-2xl w-full max-w-sm">
            <h3 class="text-lg font-bold text-gray-800 mb-6">Đăng Nhập</h3>
            <div class="space-y-4">
              <input id="login-user" type="text" placeholder="Email/Số điện thoại/Tên đăng nhập" class="w-full border p-3 rounded text-xs focus:outline-[#ee4d2d]">
              <input id="login-pass" type="password" placeholder="Mật khẩu" class="w-full border p-3 rounded text-xs focus:outline-[#ee4d2d]">
              <button onclick="handleLoginSubmit()" class="w-full bg-[#ee4d2d] hover:bg-[#d73211] text-white py-3 rounded font-bold uppercase text-xs transition">
                ĐĂNG NHẬP
              </button>
            </div>
            <div class="flex justify-between items-center text-[11px] text-gray-500 mt-3">
              <a href="#" class="hover:text-[#ee4d2d]">Quên mật khẩu</a>
              <a href="#" class="hover:text-[#ee4d2d]">Đăng nhập với SMS</a>
            </div>
            <div class="mt-8 text-center text-xs text-gray-500">
              Bạn mới biết đến ShopLux? <a href="?view=register" class="text-[#ee4d2d] font-bold hover:underline">Đăng Ký</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- TRANG ĐĂNG KÝ RIÊNG BIỆT (GIỐNG SHOPEE) ---
function renderRegisterPage(container) {
  container.innerHTML = `
    <div class="w-full">
      <div class="bg-white border-b py-4 shadow-sm">
        <div class="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <a href="/" class="flex items-center space-x-2 text-[#ee4d2d]">
              <div class="w-9 h-10 border-2 border-[#ee4d2d] rounded-md flex items-center justify-center font-black text-xl">L</div>
              <span class="text-2xl font-bold">ShopLux</span>
            </a>
            <span class="text-xl text-gray-700 font-medium">Đăng Ký</span>
          </div>
          <a href="?view=support" class="text-xs text-[#ee4d2d]">Bạn cần giúp đỡ?</a>
        </div>
      </div>

      <div class="shop-gradient py-12">
        <div class="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div class="text-white hidden md:block max-w-md">
            <h1 class="text-4xl font-extrabold tracking-tight">Trải Nghiệm Mua Sắm</h1>
            <p class="mt-3 text-sm opacity-90 leading-relaxed">Tạo tài khoản ShopLux ngay hôm nay để nhận trọn gói voucher 500.000 ₫ cho người mới.</p>
          </div>
          <div class="bg-white p-8 rounded shadow-2xl w-full max-w-sm">
            <h3 class="text-lg font-bold text-gray-800 mb-6">Đăng Ký Tài Khoản</h3>
            <div class="space-y-4">
              <input id="reg-name" type="text" placeholder="Họ và tên của bạn" class="w-full border p-3 rounded text-xs focus:outline-[#ee4d2d]">
              <input id="reg-user" type="text" placeholder="Số điện thoại / Tên đăng nhập" class="w-full border p-3 rounded text-xs focus:outline-[#ee4d2d]">
              <input id="reg-pass" type="password" placeholder="Mật khẩu" class="w-full border p-3 rounded text-xs focus:outline-[#ee4d2d]">
              <button onclick="handleRegisterSubmit()" class="w-full bg-[#ee4d2d] hover:bg-[#d73211] text-white py-3 rounded font-bold uppercase text-xs transition">
                TIẾP THEO
              </button>
            </div>
            <div class="mt-8 text-center text-xs text-gray-500">
              Bạn đã có tài khoản? <a href="?view=login" class="text-[#ee4d2d] font-bold hover:underline">Đăng Nhập</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// XỬ LÝ AUTH SUBMIT
async function handleLoginSubmit() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value.trim();
  if (!username || !password) return alert("Vui lòng điền đủ thông tin!");

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.success) {
    currentUser = data.user;
    localStorage.setItem('shoplux_user', JSON.stringify(currentUser));
    alert(`Đăng nhập thành công! Chào mừng ${currentUser.fullname}`);
    window.location.href = '/';
  } else {
    alert(data.message);
  }
}

async function handleRegisterSubmit() {
  const fullname = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-user').value.trim();
  const password = document.getElementById('reg-pass').value.trim();
  if (!fullname || !username || !password) return alert("Vui lòng nhập đầy đủ họ tên, tên đăng nhập và mật khẩu!");

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullname, username, password })
  });
  const data = await res.json();
  alert(data.message);
  if (data.success) window.location.href = '?view=login';
}

// VIEW TÌM KIẾM
function renderSearchView(container, keyword) {
  const results = allProducts.filter(p => 
    p.name.toLowerCase().includes(keyword.toLowerCase()) || 
    p.desc.toLowerCase().includes(keyword.toLowerCase())
  );

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="bg-white p-4 rounded shadow-sm mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-gray-800">
            Kết quả tìm kiếm cho từ khoá '<span class="text-[#ee4d2d]">${keyword}</span>'
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">Tìm thấy ${results.length} sản phẩm phù hợp trên ShopLux</p>
        </div>
        <a href="/" class="text-xs text-[#ee4d2d] hover:underline">← Về trang chủ</a>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        ${results.length > 0 ? renderProductCards(results) : '<div class="col-span-full py-16 text-center text-gray-400 bg-white rounded">Không tìm thấy sản phẩm nào phù hợp.</div>'}
      </div>
    </div>
  `;
}

// VIEW CHI TIẾT SẢN PHẨM (NGOẠI TRỪ TRANG NÀY SẼ CÓ NÚT RIÊNG)
function renderProductDetailView(container, id) {
  const p = allProducts.find(item => item.id === id);
  if (!p) {
    container.innerHTML = `<div class="bg-white p-8 text-center">Sản phẩm không tồn tại. <a href="/" class="text-[#ee4d2d]">Quay lại</a></div>`;
    return;
  }

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="bg-white p-6 rounded shadow-sm">
        <div class="text-xs text-gray-400 mb-4">
          <a href="/" class="hover:text-gray-600">Trang chủ</a> > 
          <a href="?search=" class="hover:text-gray-600">Sản phẩm</a> > 
          <span class="text-gray-800 font-medium">${p.name}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="aspect-square bg-gray-100 rounded overflow-hidden border">
            <img src="${p.image}" class="w-full h-full object-cover">
          </div>
          <div class="flex flex-col justify-between">
            <div>
              <div class="flex items-center space-x-2 text-xs mb-2">
                <span class="bg-[#ee4d2d] text-white px-1.5 py-0.5 text-[10px] font-bold rounded">ShopLux Mall</span>
                <span class="text-yellow-500 font-bold">⭐ ${p.rating}</span>
                <span class="text-gray-400">|</span>
                <span class="text-gray-500">Đã bán ${p.sold}</span>
              </div>
              <h1 class="text-xl font-bold text-gray-800 leading-snug">${p.name}</h1>
              <div class="my-4 p-4 bg-[#fafafa] rounded flex items-baseline space-x-3">
                <span class="text-2xl font-bold text-[#ee4d2d]">${p.price.toLocaleString()} ₫</span>
                <span class="text-sm text-gray-400 line-through">${p.originalPrice.toLocaleString()} ₫</span>
                <span class="text-xs bg-[#ffd839] text-[#ee4d2d] font-bold px-1.5 py-0.5 rounded">${p.discount}</span>
              </div>
              <div class="text-xs text-gray-600 space-y-2 border-t pt-4">
                <p><strong>Vận chuyển:</strong> Miễn phí vận chuyển toàn quốc đơn từ 0Đ.</p>
                <p><strong>Chi tiết:</strong> ${p.desc}</p>
              </div>
            </div>
            <div class="pt-6 border-t flex space-x-3">
              <button onclick="addToCartAndNotify(${p.id})" class="flex-1 bg-orange-100 border border-[#ee4d2d] text-[#ee4d2d] py-3 rounded font-bold uppercase text-xs hover:bg-orange-200 transition">
                <i class="fas fa-cart-plus mr-1"></i> Thêm Vào Giỏ Hàng
              </button>
              <button onclick="buyNowDirect(${p.id})" class="flex-1 bg-[#ee4d2d] text-white py-3 rounded font-bold uppercase text-xs hover:bg-[#d73211] transition">
                Mua Ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// CÁC VIEW KHÁC
function renderSellerChannelView(container) {
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="bg-white p-8 rounded shadow-sm">
        <h1 class="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Kênh Quản Trị Người Bán (ShopLux Seller Centre)</h1>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div class="p-4 bg-orange-50 rounded border border-orange-200">
            <span class="text-2xl font-black text-[#ee4d2d]">12</span>
            <p class="text-xs text-gray-600 mt-1">Chờ Xác Nhận</p>
          </div>
          <div class="p-4 bg-blue-50 rounded border border-blue-200">
            <span class="text-2xl font-black text-blue-600">8</span>
            <p class="text-xs text-gray-600 mt-1">Chờ Lấy Hàng</p>
          </div>
          <div class="p-4 bg-green-50 rounded border border-green-200">
            <span class="text-2xl font-black text-green-600">146</span>
            <p class="text-xs text-gray-600 mt-1">Đã Giao Thành Công</p>
          </div>
          <div class="p-4 bg-purple-50 rounded border border-purple-200">
            <span class="text-2xl font-black text-purple-600">28.450.000 ₫</span>
            <p class="text-xs text-gray-600 mt-1">Doanh Thu Tháng</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBeSellerView(container) {
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="bg-white p-8 rounded shadow-sm max-w-xl mx-auto">
        <h1 class="text-xl font-bold text-gray-800 text-center mb-2">Đăng Ký Bán Hàng Cùng ShopLux</h1>
        <p class="text-xs text-gray-500 text-center mb-6">Mở gian hàng hoàn toàn miễn phí, tiếp cận hàng triệu khách hàng.</p>
        <div class="space-y-3">
          <input class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]" placeholder="Tên Gian Hàng">
          <input class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]" placeholder="Số Điện Thoại Liên Hệ">
          <button onclick="alert('Đã gửi thông tin đăng ký!'); window.location.href='?view=seller-channel';" class="w-full bg-[#ee4d2d] text-white py-2.5 rounded font-bold uppercase text-xs hover:bg-[#d73211] transition">Gửi Thông Tin</button>
        </div>
      </div>
    </div>
  `;
}

function renderConnectView(container) {
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="bg-white p-8 rounded shadow-sm text-center max-w-lg mx-auto">
        <h1 class="text-lg font-bold text-gray-800 mb-2">Kết Nối Với ShopLux</h1>
        <p class="text-xs text-gray-500 mb-6">Theo dõi mạng xã hội để cập nhật khuyến mãi mới nhất.</p>
        <div class="flex justify-center space-x-4 text-xs font-semibold">
          <a href="https://facebook.com" target="_blank" class="px-4 py-2 bg-blue-600 text-white rounded">Facebook</a>
          <a href="https://instagram.com" target="_blank" class="px-4 py-2 bg-pink-600 text-white rounded">Instagram</a>
          <a href="https://tiktok.com" target="_blank" class="px-4 py-2 bg-black text-white rounded">TikTok</a>
        </div>
      </div>
    </div>
  `;
}

function renderNotificationsView(container) {
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="bg-white p-6 rounded shadow-sm max-w-2xl mx-auto">
        <h1 class="text-base font-bold text-gray-800 border-b pb-3 mb-4">🔔 Thông Báo ShopLux</h1>
        <div class="divide-y text-xs">
          <div class="py-3">
            <h4 class="font-bold text-gray-800">Tặng bạn Voucher SHOPEE50</h4>
            <p class="text-gray-500 mt-1">Giảm trực tiếp 50.000 ₫ cho mọi đơn hàng.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSupportView(container) {
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="bg-white p-8 rounded shadow-sm max-w-2xl mx-auto">
        <h1 class="text-lg font-bold text-gray-800 mb-4 text-center">Trung Tâm Hỗ Trợ ShopLux</h1>
        <p class="text-center text-xs text-gray-500 mb-6">Hotline miễn cước: <strong class="text-[#ee4d2d]">1900 1221</strong></p>
      </div>
    </div>
  `;
}

function renderCartView(container) {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="bg-white p-6 rounded shadow-sm">
        <h1 class="text-base font-bold text-gray-800 border-b pb-3 mb-4">🛒 Giỏ Hàng Của Bạn (${cart.length} sản phẩm)</h1>
        ${cart.length === 0 ? `
          <div class="text-center py-12 text-gray-400">
            <p class="mb-4">Giỏ hàng của bạn đang trống.</p>
            <a href="/" class="bg-[#ee4d2d] text-white px-6 py-2 rounded font-bold uppercase text-xs">Mua Ngay</a>
          </div>
        ` : `
          <div class="divide-y text-xs">
            ${cart.map(i => `
              <div class="py-3 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                  <img src="${i.image}" class="w-14 h-14 object-cover rounded border">
                  <div>
                    <a href="?id=${i.id}" class="font-bold text-gray-800 hover:text-[#ee4d2d]">${i.name}</a>
                    <p class="text-[#ee4d2d] font-semibold mt-1">${i.price.toLocaleString()} ₫</p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="flex items-center border">
                    <button onclick="changeCartQty(${i.id}, -1)" class="px-2 py-0.5 bg-gray-100">-</button>
                    <span class="px-3 font-semibold">${i.qty}</span>
                    <button onclick="changeCartQty(${i.id}, 1)" class="px-2 py-0.5 bg-gray-100">+</button>
                  </div>
                  <span class="font-bold text-gray-800 w-24 text-right">${(i.price * i.qty).toLocaleString()} ₫</span>
                  <button onclick="removeCartItem(${i.id})" class="text-red-500 hover:underline">Xóa</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="border-t pt-4 mt-4 flex justify-between items-center">
            <div>
              <span class="text-gray-500">Tổng thanh toán:</span>
              <span class="text-xl font-bold text-[#ee4d2d] ml-2">${subtotal.toLocaleString()} ₫</span>
            </div>
            <button onclick="checkoutCart()" class="bg-[#ee4d2d] hover:bg-[#d73211] text-white px-8 py-3 rounded font-bold uppercase text-xs transition">
              Tiến Hành Mua Hàng
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

// CART FUNCTIONS
function addToCartAndNotify(id) {
  const p = allProducts.find(item => item.id === id);
  const exist = cart.find(item => item.id === id);
  if (exist) exist.qty += 1;
  else cart.push({ ...p, qty: 1 });
  saveCart();
  alert(`Đã thêm "${p.name}" vào giỏ hàng ShopLux!`);
}

function buyNowDirect(id) {
  const p = allProducts.find(item => item.id === id);
  const exist = cart.find(item => item.id === id);
  if (exist) exist.qty += 1;
  else cart.push({ ...p, qty: 1 });
  saveCart();
  window.location.href = '?view=cart';
}

function changeCartQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    router();
  }
}

function removeCartItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  router();
}

function saveCart() {
  localStorage.setItem('shoplux_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.innerText = count;
}

function checkoutCart() {
  if (!currentUser) {
    alert("Vui lòng đăng nhập để hoàn tất mua hàng!");
    window.location.href = '?view=login';
    return;
  }
  alert(`🎉 ĐẶT HÀNG THÀNH CÔNG!\n\nKhách hàng: ${currentUser.fullname}\nShopLux sẽ sớm liên hệ giao hàng tới bạn.`);
  cart = [];
  saveCart();
  window.location.href = '/';
}

window.addEventListener('DOMContentLoaded', router);
