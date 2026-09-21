const API_URL = '/api';
let allProducts = [];
let allCategories = [];
let cart = JSON.parse(localStorage.getItem('shoplux_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('shoplux_user')) || null;
let isRegisterMode = false;

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// AUTHENTICATION
function renderAuth() {
  const container = document.getElementById('auth-section');
  if (currentUser) {
    container.innerHTML = `
      <span class="font-bold text-white">👤 ${currentUser.fullname}</span>
      <span>|</span>
      <button onclick="logout()" class="hover:underline">Đăng Xuất</button>
    `;
  } else {
    container.innerHTML = `
      <button onclick="openAuth(true)" class="hover:underline">Đăng Ký</button>
      <span>|</span>
      <button onclick="openAuth(false)" class="hover:underline">Đăng Nhập</button>
    `;
  }
}

function openAuth(isReg) {
  isRegisterMode = isReg;
  document.getElementById('auth-title').innerText = isReg ? "Đăng Ký ShopLux" : "Đăng Nhập ShopLux";
  document.getElementById('auth-fullname').classList.toggle('hidden', !isReg);
  openModal('auth-modal');
}

async function submitAuth() {
  const fullname = document.getElementById('auth-fullname').value;
  const username = document.getElementById('auth-username').value;
  const password = document.getElementById('auth-password').value;

  const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
  const body = isRegisterMode ? { fullname, username, password } : { username, password };

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.success) {
    if (isRegisterMode) {
      alert("Đăng ký tài khoản thành công! Hãy đăng nhập.");
      openAuth(false);
    } else {
      currentUser = data.user;
      localStorage.setItem('shoplux_user', JSON.stringify(currentUser));
      closeModal('auth-modal');
      renderAuth();
      alert(`Xin chào ${currentUser.fullname}!`);
    }
  } else {
    alert(data.message);
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('shoplux_user');
  renderAuth();
}

// SEARCH NAVIGATION
function navigateToSearch(event) {
  event.preventDefault();
  const keyword = document.getElementById('search-input').value.trim();
  if (keyword) {
    window.location.href = `?search=${encodeURIComponent(keyword)}`;
  } else {
    window.location.href = '/';
  }
}

// ROUTER: XỬ LÝ ĐIỀU HƯỚNG CÁC TRANG RIÊNG BIỆT
async function router() {
  renderAuth();
  updateCartBadge();

  // Tải dữ liệu trước
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

  // 1. TRANG TÌM KIẾM SẢN PHẨM RIÊNG
  if (search !== null) {
    renderSearchView(viewport, search);
    return;
  }

  // 2. TRANG CHI TIẾT SẢN PHẨM RIÊNG
  if (productId) {
    renderProductDetailView(viewport, parseInt(productId));
    return;
  }

  // 3. CÁC TRANG TIỆN ÍCH RIÊNG
  switch (view) {
    case 'seller-channel':
      renderSellerChannelView(viewport);
      break;
    case 'be-seller':
      renderBeSellerView(viewport);
      break;
    case 'connect':
      renderConnectView(viewport);
      break;
    case 'notifications':
      renderNotificationsView(viewport);
      break;
    case 'support':
      renderSupportView(viewport);
      break;
    case 'cart':
      renderCartView(viewport);
      break;
    default:
      renderHomeView(viewport);
      break;
  }
}

// --- VIEW 1: TRANG CHỦ (HOMEPAGE) ---
function renderHomeView(container) {
  container.innerHTML = `
    <!-- Banners -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 h-52 mb-6">
      <div class="md:col-span-2 relative rounded overflow-hidden shadow-sm bg-gray-200">
        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=60" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
          <span class="bg-[#ee4d2d] w-max px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sm">ShopLux Mall</span>
          <h2 class="text-xl font-bold mt-1">SIÊU HỘI MUA SẮM SHOPLUX</h2>
          <p class="text-[11px] opacity-90">Miễn phí ship toàn quốc - Cam kết chính hãng 100%</p>
        </div>
      </div>
      <div class="grid grid-rows-2 gap-2 h-full">
        <div class="rounded overflow-hidden shadow-sm bg-gray-200">
          <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=60" class="w-full h-full object-cover">
        </div>
        <div class="rounded overflow-hidden shadow-sm bg-gray-200">
          <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=60" class="w-full h-full object-cover">
        </div>
      </div>
    </div>

    <!-- Quick Utilities -->
    <div class="grid grid-cols-3 md:grid-cols-6 gap-3 bg-white p-4 rounded shadow-sm text-center mb-6">
      <a href="?search=" class="flex flex-col items-center hover:-translate-y-0.5 transition">
        <div class="w-10 h-10 rounded-full bg-orange-50 text-[#ee4d2d] flex items-center justify-center text-lg mb-1">🏷️</div>
        <span class="font-medium text-gray-700">Deal Từ 1.000Đ</span>
      </a>
      <a href="?view=cart" class="flex flex-col items-center hover:-translate-y-0.5 transition">
        <div class="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-lg mb-1">🏬</div>
        <span class="font-medium text-gray-700">ShopLux Xử Lý</span>
      </a>
      <a href="?view=seller-channel" class="flex flex-col items-center hover:-translate-y-0.5 transition">
        <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-lg mb-1">🏠</div>
        <span class="font-medium text-gray-700">ShopLux Home</span>
      </a>
      <a href="?view=be-seller" class="flex flex-col items-center hover:-translate-y-0.5 transition">
        <div class="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-lg mb-1">👑</div>
        <span class="font-medium text-gray-700">Khách Thân Thiết</span>
      </a>
      <a href="?view=notifications" class="flex flex-col items-center hover:-translate-y-0.5 transition">
        <div class="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center text-lg mb-1">🎟️</div>
        <span class="font-medium text-gray-700">Mã Giảm Giá</span>
      </a>
      <a href="?view=support" class="flex flex-col items-center hover:-translate-y-0.5 transition">
        <div class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-lg mb-1">📲</div>
        <span class="font-medium text-gray-700">Nạp Thẻ Tiện Ích</span>
      </a>
    </div>

    <!-- Danh mục -->
    <div class="bg-white rounded shadow-sm mb-6">
      <div class="p-3 border-b text-gray-500 font-bold uppercase text-[11px]">DANH MỤC SẢN PHẨM</div>
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
  `;
}

// --- VIEW 2: TRANG KẾT QUẢ TÌM KIẾM RIÊNG BIỆT ---
function renderSearchView(container, keyword) {
  const results = allProducts.filter(p => 
    p.name.toLowerCase().includes(keyword.toLowerCase()) || 
    p.desc.toLowerCase().includes(keyword.toLowerCase())
  );

  container.innerHTML = `
    <div class="bg-white p-4 rounded shadow-sm mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-base font-bold text-gray-800">
          Kết quả tìm kiếm cho từ khoá '<span class="text-[#ee4d2d]">${keyword}</span>'
        </h2>
        <p class="text-xs text-gray-500 mt-0.5">Tìm thấy ${results.length} sản phẩm phù hợp trên ShopLux</p>
      </div>
      <a href="/" class="text-xs text-indigo-600 hover:underline">← Về trang chủ</a>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      ${results.length > 0 ? renderProductCards(results) : '<div class="col-span-full py-16 text-center text-gray-400 bg-white rounded">Không tìm thấy sản phẩm nào phù hợp với từ khóa này.</div>'}
    </div>
  `;
}

// --- VIEW 3: TRANG CHI TIẾT SẢN PHẨM RIÊNG BIỆT ---
function renderProductDetailView(container, id) {
  const p = allProducts.find(item => item.id === id);
  if (!p) {
    container.innerHTML = `<div class="bg-white p-8 text-center">Sản phẩm không tồn tại. <a href="/" class="text-indigo-600">Quay lại</a></div>`;
    return;
  }

  container.innerHTML = `
    <div class="bg-white p-6 rounded shadow-sm">
      <div class="text-xs text-gray-400 mb-4">
        <a href="/" class="hover:text-gray-600">Trang chủ</a> > 
        <a href="?search=" class="hover:text-gray-600">Sản phẩm</a> > 
        <span class="text-gray-800">${p.name}</span>
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
              <p><strong>Chính sách vận chuyển:</strong> Miễn phí vận chuyển toàn quốc cho đơn từ 0Đ.</p>
              <p><strong>Mô tả chi tiết:</strong> ${p.desc}</p>
            </div>
          </div>
          <div class="pt-6 border-t flex space-x-3">
            <button onclick="addToCartAndNotify(${p.id})" class="flex-1 bg-orange-100 border border-[#ee4d2d] text-[#ee4d2d] py-3 rounded font-bold uppercase text-xs hover:bg-orange-200 transition">
              <i class="fas fa-cart-plus mr-1"></i> Thêm Vào Giỏ Hàng
            </button>
            <button onclick="buyNow(${p.id})" class="flex-1 bg-[#ee4d2d] text-white py-3 rounded font-bold uppercase text-xs hover:bg-[#d73211] transition">
              Mua Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- VIEW 4: TRANG KÊNH NGƯỜI BÁN ---
function renderSellerChannelView(container) {
  container.innerHTML = `
    <div class="bg-white p-8 rounded shadow-sm">
      <div class="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-800">Kênh Quản Trị Người Bán (ShopLux Seller Centre)</h1>
          <p class="text-xs text-gray-500 mt-1">Quản lý kho hàng, xử lý đơn đặt hàng và tăng trưởng doanh thu cùng ShopLux</p>
        </div>
        <button onclick="alert('Tính năng đồng bộ sản phẩm đang hoạt động!')" class="bg-[#ee4d2d] text-white px-4 py-2 rounded text-xs font-bold">+ Thêm Sản Phẩm Mới</button>
      </div>
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
  `;
}

// --- VIEW 5: TRANG TRỞ THÀNH NGƯỜI BÁN ---
function renderBeSellerView(container) {
  container.innerHTML = `
    <div class="bg-white p-8 rounded shadow-sm max-w-xl mx-auto">
      <h1 class="text-xl font-bold text-gray-800 text-center mb-2">Đăng Ký Trở Thành Người Bán ShopLux</h1>
      <p class="text-xs text-gray-500 text-center mb-6">Tiếp cận hơn 10 triệu khách hàng tiềm năng toàn quốc hoàn toàn miễn phí mở shop.</p>
      <div class="space-y-3">
        <div>
          <label class="font-semibold block mb-1">Tên Cửa Hàng / Doanh Nghiệp:</label>
          <input id="seller-shop-name" class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]" placeholder="Ví dụ: ShopLux Official Store">
        </div>
        <div>
          <label class="font-semibold block mb-1">Số Điện Thoại Liên Hệ:</label>
          <input class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]" placeholder="09xxxxxxxx">
        </div>
        <div>
          <label class="font-semibold block mb-1">Địa chỉ kho hàng:</label>
          <input class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]" placeholder="Số nhà, Phường, Quận, Thành phố">
        </div>
        <button onclick="alert('Hồ sơ mở gian hàng đã được gửi tới Ban Quản Trị ShopLux xét duyệt!'); window.location.href='?view=seller-channel';" class="w-full bg-[#ee4d2d] text-white py-2.5 rounded font-bold uppercase text-xs hover:bg-[#d73211] transition mt-4">
          Gửi Hồ Sơ Đăng Ký Ngay
        </button>
      </div>
    </div>
  `;
}

// --- VIEW 6: TRANG KẾT NỐI ---
function renderConnectView(container) {
  container.innerHTML = `
    <div class="bg-white p-8 rounded shadow-sm text-center max-w-lg mx-auto">
      <div class="text-4xl mb-3 text-[#ee4d2d]">🌐</div>
      <h1 class="text-lg font-bold text-gray-800 mb-2">Cộng Đồng & Mạng Xã Hội ShopLux</h1>
      <p class="text-xs text-gray-500 mb-6">Theo dõi ShopLux trên các nền tảng mạng xã hội để săn voucher 100k mỗi ngày.</p>
      <div class="flex justify-center space-x-4 text-xs font-semibold">
        <a href="https://facebook.com" target="_blank" class="px-4 py-2 bg-blue-600 text-white rounded hover:opacity-90 flex items-center space-x-1"><i class="fab fa-facebook"></i> <span>Facebook</span></a>
        <a href="https://instagram.com" target="_blank" class="px-4 py-2 bg-pink-600 text-white rounded hover:opacity-90 flex items-center space-x-1"><i class="fab fa-instagram"></i> <span>Instagram</span></a>
        <a href="https://tiktok.com" target="_blank" class="px-4 py-2 bg-black text-white rounded hover:opacity-90 flex items-center space-x-1"><i class="fab fa-tiktok"></i> <span>TikTok</span></a>
      </div>
    </div>
  `;
}

// --- VIEW 7: TRANG THÔNG BÁO ---
function renderNotificationsView(container) {
  container.innerHTML = `
    <div class="bg-white p-6 rounded shadow-sm max-w-2xl mx-auto">
      <h1 class="text-base font-bold text-gray-800 border-b pb-3 mb-4 flex items-center space-x-2">
        <i class="far fa-bell text-[#ee4d2d]"></i> <span>Hộp Thư Thông Báo ShopLux</span>
      </h1>
      <div class="divide-y text-xs">
        <div class="py-3 flex items-start space-x-3">
          <span class="text-xl">🎁</span>
          <div>
            <h4 class="font-bold text-gray-800">Tặng bạn Voucher 50.000 ₫ nhân dịp đổi tên ShopLux</h4>
            <p class="text-gray-500 mt-1">Sử dụng ngay mã <strong>SHOPEE50</strong> tại giỏ hàng để được giảm trực tiếp trên tổng hóa đơn.</p>
            <span class="text-[10px] text-gray-400 mt-1 block">Hôm nay</span>
          </div>
        </div>
        <div class="py-3 flex items-start space-x-3">
          <span class="text-xl">⚡</span>
          <div>
            <h4 class="font-bold text-gray-800">Đơn hàng CI/CD Pipeline triển khai thành công</h4>
            <p class="text-gray-500 mt-1">Hệ thống website ShopLux đã tự động deploy qua Docker & Render trơn tru.</p>
            <span class="text-[10px] text-gray-400 mt-1 block">Vừa xong</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- VIEW 8: TRANG HỖ TRỢ ---
function renderSupportView(container) {
  container.innerHTML = `
    <div class="bg-white p-8 rounded shadow-sm max-w-2xl mx-auto">
      <h1 class="text-lg font-bold text-gray-800 mb-2 text-center">Trung Tâm Trợ Giúp Khách Hàng ShopLux</h1>
      <p class="text-xs text-gray-500 text-center mb-6">Bạn cần giải đáp vấn đề gì hôm nay?</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div class="p-4 border rounded hover:border-[#ee4d2d] cursor-pointer">
          <h4 class="font-bold text-gray-800 mb-1">📦 Vấn đề giao nhận & Vận chuyển</h4>
          <p class="text-gray-500">Tra cứu mã vận đơn, thời gian giao dự kiến của ShopLux Express.</p>
        </div>
        <div class="p-4 border rounded hover:border-[#ee4d2d] cursor-pointer">
          <h4 class="font-bold text-gray-800 mb-1">💳 Trả hàng & Hoàn tiền</h4>
          <p class="text-gray-500">Chính sách trả hàng miễn phí trong vòng 7 ngày nếu lỗi sản phẩm.</p>
        </div>
        <div class="p-4 border rounded hover:border-[#ee4d2d] cursor-pointer">
          <h4 class="font-bold text-gray-800 mb-1">🔒 Bảo mật tài khoản & Đăng nhập</h4>
          <p class="text-gray-500">Đổi mật khẩu hoặc khôi phục quyền truy cập tài khoản.</p>
        </div>
        <div class="p-4 border rounded hover:border-[#ee4d2d] cursor-pointer">
          <h4 class="font-bold text-gray-800 mb-1">📞 Tổng đài Hotline 24/7</h4>
          <p class="text-[#ee4d2d] font-bold">1900 1221 (Miễn phí cước)</p>
        </div>
      </div>
    </div>
  `;
}

// --- VIEW 9: TRANG GIỎ HÀNG TOÀN DIỆN ---
function renderCartView(container) {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  container.innerHTML = `
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
  `;
}

// HELPER: RENDER THẺ SẢN PHẨM CÓ LINK DẪN ĐẾN TRANG CHI TIẾT
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
      <div class="p-2 pt-0">
        <button onclick="addToCartAndNotify(${p.id})" class="w-full bg-[#ee4d2d] text-white py-1 rounded text-[10px] font-bold hover:bg-[#d73211] transition">
          + Thêm Giỏ Hàng
        </button>
      </div>
    </div>
  `).join('');
}

// CART OPERATIONS
function addToCartAndNotify(id) {
  const p = allProducts.find(item => item.id === id);
  const exist = cart.find(item => item.id === id);
  if (exist) exist.qty += 1;
  else cart.push({ ...p, qty: 1 });
  saveCart();
  alert(`Đã thêm "${p.name}" vào giỏ hàng ShopLux!`);
}

function buyNow(id) {
  addToCartAndNotify(id);
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
    alert("Vui lòng đăng nhập để hoàn tất đơn hàng ShopLux!");
    openAuth(false);
    return;
  }
  alert(`🎉 ĐẶT HÀNG THÀNH CÔNG!\n\nKhách hàng: ${currentUser.fullname}\nShopLux sẽ liên hệ xác nhận đơn hàng qua số điện thoại của bạn.`);
  cart = [];
  saveCart();
  window.location.href = '/';
}

// Khởi chạy router
window.addEventListener('DOMContentLoaded', router);
