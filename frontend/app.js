const API_URL = '/api';
let allProducts = [];
let allCategories = [];
let cart = JSON.parse(localStorage.getItem('shoplux_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('shoplux_user')) || null;

// Shipping & Voucher
let selectedShippingCost = 25000;
let selectedShippingUnit = "ShopLux Express";
let currentDiscount = 0;
let appliedVoucherCode = "";

const AVAILABLE_VOUCHERS = [
  { code: "NEWBIE100", name: "Mã Người Mới", desc: "Giảm trực tiếp 100.000 ₫ cho tài khoản mới", discount: 100000 },
  { code: "SHOPLUX50", name: "Ưu Đãi Đơn Đầu", desc: "Giảm 50.000 ₫ cho mọi đơn hàng", discount: 50000 },
  { code: "FREESHIP", name: "Miễn Phí Vận Chuyển", desc: "Giảm 30.000 ₫ phí ship", discount: 30000 }
];

// AUTH HEADER - HIỂN THỊ AVATAR VÀ TÊN DẪN VÀO TRANG CÁ NHÂN
function renderAuth() {
  const container = document.getElementById('auth-section');
  if (!container) return;
  if (currentUser) {
    const avatarImg = currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";
    container.innerHTML = `
      <a href="?view=profile" class="flex items-center space-x-1.5 hover:opacity-85 transition bg-white/10 px-2 py-0.5 rounded-full">
        <img src="${avatarImg}" class="w-5 h-5 rounded-full object-cover border border-white">
        <span class="font-bold text-white max-w-[120px] truncate">${currentUser.fullname}</span>
      </a>
      <span>|</span>
      <a href="?view=profile" class="hover:underline">Tài Khoản</a>
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

  if (view === 'login' || view === 'register') {
    if (header) header.classList.add('hidden');
  } else {
    if (header) header.classList.remove('hidden');
  }

  if (search !== null) return renderSearchView(viewport, search);
  if (productId) return renderProductDetailView(viewport, parseInt(productId));

  switch (view) {
    case 'profile': renderProfileView(viewport); break;
    case 'login': renderLoginPage(viewport); break;
    case 'register': renderRegisterPage(viewport); break;
    case 'seller-channel': renderSellerChannelView(viewport); break;
    case 'be-seller': renderBeSellerView(viewport); break;
    case 'connect': renderConnectView(viewport); break;
    case 'notifications': renderNotificationsView(viewport); break;
    case 'support': renderSupportView(viewport); break;
    case 'cart': renderCheckoutView(viewport); break;
    default: renderHomeView(viewport); break;
  }
}

// --- TRANG CÁ NHÂN (HỒ SƠ CỦA TÔI) ---
function renderProfileView(container) {
  if (!currentUser) {
    alert("Vui lòng đăng nhập để truy cập trang cá nhân!");
    window.location.href = '?view=login';
    return;
  }

  const avatarSrc = currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- CỘT TRÁI: SIDEBAR THÔNG TIN TÀI KHOẢN -->
        <div class="md:col-span-3 space-y-4">
          <div class="flex items-center space-x-3 p-3 bg-white rounded shadow-sm">
            <img id="sidebar-avatar" src="${avatarSrc}" class="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm">
            <div class="overflow-hidden">
              <h4 id="sidebar-username" class="font-bold text-xs text-gray-800 truncate">${currentUser.username}</h4>
              <a href="?view=profile" class="text-[11px] text-gray-400 hover:text-[#ee4d2d] flex items-center space-x-1">
                <i class="fas fa-pen text-[10px]"></i>
                <span>Sửa hồ sơ</span>
              </a>
            </div>
          </div>

          <div class="bg-white rounded shadow-sm p-3 space-y-2 text-xs">
            <a href="?view=profile" class="flex items-center space-x-2 text-[#ee4d2d] font-bold p-2 bg-orange-50 rounded">
              <i class="far fa-user text-sm"></i>
              <span>Hồ Sơ Của Tôi</span>
            </a>
            <a href="?view=cart" class="flex items-center space-x-2 text-gray-700 hover:text-[#ee4d2d] p-2 transition">
              <i class="fas fa-bag-shopping text-sm"></i>
              <span>Đơn Mua</span>
            </a>
            <a href="?view=notifications" class="flex items-center space-x-2 text-gray-700 hover:text-[#ee4d2d] p-2 transition">
              <i class="far fa-bell text-sm"></i>
              <span>Kho Voucher & Thông Báo</span>
            </a>
            <a href="?view=support" class="flex items-center space-x-2 text-gray-700 hover:text-[#ee4d2d] p-2 transition">
              <i class="far fa-circle-question text-sm"></i>
              <span>Trung Tâm Trợ Giúp</span>
            </a>
          </div>
        </div>

        <!-- CỘT PHẢI: KHU VỰC CHỈNH SỬA THÔNG TIN CHI TIẾT -->
        <div class="md:col-span-9 bg-white p-6 rounded shadow-sm">
          <div class="border-b pb-4 mb-6">
            <h1 class="text-base font-bold text-gray-800">Hồ Sơ Của Tôi</h1>
            <p class="text-xs text-gray-500 mt-0.5">Quản lý thông tin hồ sơ, tên đăng nhập và hình ảnh đại diện để bảo vệ tài khoản</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Form thông tin chữ -->
            <div class="lg:col-span-8 space-y-4 text-xs">
              
              <div class="grid grid-cols-3 items-center">
                <label class="text-gray-500 font-medium">Tên đăng nhập (Username):</label>
                <div class="col-span-2">
                  <input id="profile-username" value="${currentUser.username || ''}" class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]">
                  <p class="text-[10px] text-gray-400 mt-1">Tên đăng nhập duy nhất dùng để đăng nhập vào ShopLux.</p>
                </div>
              </div>

              <div class="grid grid-cols-3 items-center">
                <label class="text-gray-500 font-medium">Họ và tên:</label>
                <div class="col-span-2">
                  <input id="profile-fullname" value="${currentUser.fullname || ''}" class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]">
                </div>
              </div>

              <div class="grid grid-cols-3 items-center">
                <label class="text-gray-500 font-medium">Số điện thoại:</label>
                <div class="col-span-2">
                  <input id="profile-phone" value="${currentUser.phone || ''}" placeholder="Nhập số điện thoại của bạn" class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]">
                </div>
              </div>

              <div class="grid grid-cols-3 items-center">
                <label class="text-gray-500 font-medium">Năm sinh:</label>
                <div class="col-span-2">
                  <input id="profile-year" type="number" min="1930" max="2020" value="${currentUser.birthYear || '2000'}" class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]">
                </div>
              </div>

              <div class="grid grid-cols-3 items-center">
                <label class="text-gray-500 font-medium">Giới tính:</label>
                <div class="col-span-2 flex space-x-6">
                  <label class="flex items-center space-x-1.5 cursor-pointer">
                    <input type="radio" name="profile-gender" value="Nam" ${(currentUser.gender || 'Nam') === 'Nam' ? 'checked' : ''} class="text-[#ee4d2d]">
                    <span>Nam</span>
                  </label>
                  <label class="flex items-center space-x-1.5 cursor-pointer">
                    <input type="radio" name="profile-gender" value="Nữ" ${currentUser.gender === 'Nữ' ? 'checked' : ''} class="text-[#ee4d2d]">
                    <span>Nữ</span>
                  </label>
                  <label class="flex items-center space-x-1.5 cursor-pointer">
                    <input type="radio" name="profile-gender" value="Khác" ${currentUser.gender === 'Khác' ? 'checked' : ''} class="text-[#ee4d2d]">
                    <span>Khác</span>
                  </label>
                </div>
              </div>

              <div class="grid grid-cols-3 items-center">
                <label class="text-gray-500 font-medium">Địa chỉ giao hàng mặc định:</label>
                <div class="col-span-2">
                  <textarea id="profile-address" rows="2" placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP" class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]">${currentUser.address || ''}</textarea>
                </div>
              </div>

              <div class="grid grid-cols-3 items-center pt-2">
                <div></div>
                <div class="col-span-2">
                  <button onclick="saveProfileChanges()" class="bg-[#ee4d2d] hover:bg-[#d73211] text-white px-8 py-2.5 rounded font-bold uppercase text-xs transition shadow">
                    Lưu Thay Đổi
                  </button>
                </div>
              </div>

            </div>

            <!-- Cột chỉnh sửa Avatar -->
            <div class="lg:col-span-4 border-l lg:pl-8 flex flex-col items-center justify-center text-center space-y-4">
              <div class="relative group cursor-pointer">
                <img id="avatar-preview" src="${avatarSrc}" class="w-28 h-28 rounded-full object-cover border-2 border-gray-200 shadow-md">
                <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[11px] font-medium">
                  Đổi Ảnh
                </div>
              </div>

              <!-- Chọn tải ảnh từ máy tính hoặc nhập link -->
              <div class="w-full space-y-2">
                <input type="file" id="avatar-file-input" accept="image/*" onchange="handleAvatarFileUpload(event)" class="hidden">
                <button onclick="document.getElementById('avatar-file-input').click()" class="w-full border border-gray-300 hover:border-[#ee4d2d] px-3 py-1.5 rounded text-xs text-gray-700 hover:text-[#ee4d2d] transition">
                  📁 Chọn Ảnh Từ Máy Tính
                </button>

                <div class="pt-2 text-[11px] text-gray-400">Hoặc dán trực tiếp Link ảnh:</div>
                <input id="avatar-url-input" value="${currentUser.avatar || ''}" onchange="previewAvatarUrl(this.value)" placeholder="https://..." class="w-full border p-1.5 rounded text-[11px] focus:outline-[#ee4d2d]">
              </div>

              <div class="text-[10px] text-gray-400 leading-relaxed text-left">
                <p>• Định dạng: .JPEG, .PNG, .WEBP</p>
                <p>• Dung lượng tối đa: 5 MB</p>
                <p>• Ảnh vuông tỉ lệ 1:1 sẽ hiển thị đẹp nhất</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `;
}

// XỬ LÝ PREVIEW ẢNH KHI NHẬP LINK HOẶC UPLOAD
function previewAvatarUrl(url) {
  if (url && url.trim()) {
    document.getElementById('avatar-preview').src = url.trim();
  }
}

function handleAvatarFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert("Kích thước file ảnh vượt quá 5MB! Vui lòng chọn ảnh nhẹ hơn.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    document.getElementById('avatar-preview').src = base64Data;
    document.getElementById('avatar-url-input').value = base64Data;
  };
  reader.readAsDataURL(file);
}

// LƯU CẬP NHẬT THÔNG TIN HỒ SƠ
async function saveProfileChanges() {
  const username = document.getElementById('profile-username').value.trim();
  const fullname = document.getElementById('profile-fullname').value.trim();
  const phone = document.getElementById('profile-phone').value.trim();
  const birthYear = document.getElementById('profile-year').value.trim();
  const gender = document.querySelector('input[name="profile-gender"]:checked').value;
  const address = document.getElementById('profile-address').value.trim();
  const avatar = document.getElementById('avatar-url-input').value.trim() || document.getElementById('avatar-preview').src;

  if (!username) return alert("Vui lòng không để trống tên đăng nhập!");
  if (!fullname) return alert("Vui lòng không để trống họ và tên!");

  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      oldUsername: currentUser.username,
      username,
      fullname,
      avatar,
      phone,
      birthYear,
      gender,
      address
    })
  });

  const data = await res.json();
  if (data.success) {
    currentUser = data.user;
    localStorage.setItem('shoplux_user', JSON.stringify(currentUser));
    renderAuth();
    alert("🎉 Cập nhật hồ sơ cá nhân ShopLux thành công!");
    router();
  } else {
    alert(data.message);
  }
}

// HOMEPAGE VIEW
function renderHomeView(container) {
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2 h-56">
        <div class="md:col-span-2 relative rounded overflow-hidden shadow-sm bg-gray-200 h-56">
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=60" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
            <span class="bg-[#ee4d2d] w-max px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sm">ShopLux Mall</span>
            <h2 class="text-xl font-bold mt-1">SIÊU HỘI MUA SẮM SHOPLUX</h2>
            <p class="text-[11px] opacity-90">Freeship đơn từ 0Đ - Voucher người mới lên tới 100k</p>
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

      <div class="grid grid-cols-3 md:grid-cols-6 gap-3 bg-white p-4 rounded shadow-sm text-center">
        <a href="?view=cart" class="flex flex-col items-center hover:-translate-y-0.5 transition">
          <div class="w-10 h-10 rounded-full bg-orange-50 text-[#ee4d2d] flex items-center justify-center text-lg mb-1">🎟️</div>
          <span class="font-medium text-gray-700">Mã Người Mới 100k</span>
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
          <span class="font-medium text-gray-700">Deal 1.000Đ</span>
        </a>
      </div>

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

// CHECKOUT VIEW
function renderCheckoutView(container) {
  const itemsSubtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalPayment = Math.max(0, itemsSubtotal + selectedShippingCost - currentDiscount);

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="bg-white p-6 rounded shadow-sm">
        <div class="flex items-center justify-between border-b pb-3 mb-6">
          <h1 class="text-base font-bold text-gray-800 flex items-center space-x-2">
            <span class="text-[#ee4d2d]">🛒</span>
            <span>Thanh Toán & Đặt Hàng ShopLux</span>
          </h1>
          <a href="/" class="text-xs text-[#ee4d2d] hover:underline">← Tiếp tục mua sắm</a>
        </div>

        ${cart.length === 0 ? `
          <div class="text-center py-16 text-gray-400">
            <p class="text-sm mb-4">Giỏ hàng của bạn đang trống.</p>
            <a href="/" class="bg-[#ee4d2d] text-white px-6 py-2.5 rounded font-bold uppercase text-xs hover:bg-[#d73211] transition">Khám Phá Sản Phẩm Ngay</a>
          </div>
        ` : `
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-7 space-y-6">
              
              <div class="p-4 bg-gray-50 border rounded-sm">
                <h3 class="font-bold text-xs text-gray-800 mb-3 flex items-center space-x-1.5 text-[#ee4d2d]">
                  <i class="fas fa-location-dot"></i>
                  <span>1. THÔNG TIN NGƯỜI NHẬN (BẮT BUỘC)</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-semibold text-gray-600 mb-1">Họ và tên người nhận <span class="text-red-500">*</span></label>
                    <input id="order-fullname" value="${currentUser ? currentUser.fullname : ''}" placeholder="Ví dụ: Nguyễn Văn A" class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-gray-600 mb-1">Số điện thoại liên hệ <span class="text-red-500">*</span></label>
                    <input id="order-phone" value="${currentUser && currentUser.phone ? currentUser.phone : ''}" placeholder="Ví dụ: 0912345678" class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-gray-600 mb-1">Năm sinh người nhận <span class="text-red-500">*</span></label>
                    <input id="order-year" type="number" min="1950" max="2020" value="${currentUser && currentUser.birthYear ? currentUser.birthYear : '2000'}" class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-gray-600 mb-1">Địa chỉ giao hàng chi tiết <span class="text-red-500">*</span></label>
                    <input id="order-address" value="${currentUser && currentUser.address ? currentUser.address : ''}" placeholder="Số nhà, Tên đường, Phường/Xã..." class="w-full border p-2 rounded text-xs focus:outline-[#ee4d2d]">
                  </div>
                </div>
              </div>

              <div class="p-4 bg-gray-50 border rounded-sm">
                <h3 class="font-bold text-xs text-gray-800 mb-3 flex items-center space-x-1.5 text-blue-600">
                  <i class="fas fa-truck-fast"></i>
                  <span>2. CHỌN ĐƠN VỊ VẬN CHUYỂN</span>
                </h3>
                <div class="space-y-2 text-xs">
                  <label class="flex items-center justify-between p-2.5 bg-white border rounded cursor-pointer">
                    <div class="flex items-center space-x-2">
                      <input type="radio" name="shipping-unit" value="ShopLux Express:25000" onchange="updateShipping(this.value)" checked class="text-[#ee4d2d]">
                      <div>
                        <p class="font-bold text-gray-800">ShopLux Express (Hỏa Tốc)</p>
                        <span class="text-[10px] text-gray-400">1 - 2 ngày làm việc</span>
                      </div>
                    </div>
                    <span class="font-bold text-gray-700">25.000 ₫</span>
                  </label>

                  <label class="flex items-center justify-between p-2.5 bg-white border rounded cursor-pointer">
                    <div class="flex items-center space-x-2">
                      <input type="radio" name="shipping-unit" value="Giao Hàng Nhanh (GHN):22000" onchange="updateShipping(this.value)" class="text-[#ee4d2d]">
                      <div>
                        <p class="font-bold text-gray-800">Giao Hàng Nhanh (GHN)</p>
                        <span class="text-[10px] text-gray-400">2 - 3 ngày làm việc</span>
                      </div>
                    </div>
                    <span class="font-bold text-gray-700">22.000 ₫</span>
                  </label>

                  <label class="flex items-center justify-between p-2.5 bg-white border rounded cursor-pointer">
                    <div class="flex items-center space-x-2">
                      <input type="radio" name="shipping-unit" value="Giao Hàng Tiết Kiệm (GHTK):18000" onchange="updateShipping(this.value)" class="text-[#ee4d2d]">
                      <div>
                        <p class="font-bold text-gray-800">Giao Hàng Tiết Kiệm (GHTK)</p>
                        <span class="text-[10px] text-gray-400">3 - 4 ngày làm việc</span>
                      </div>
                    </div>
                    <span class="font-bold text-gray-700">18.000 ₫</span>
                  </label>
                </div>
              </div>

              <div class="p-4 bg-gray-50 border rounded-sm">
                <h3 class="font-bold text-xs text-gray-800 mb-3 flex items-center space-x-1.5 text-green-600">
                  <i class="fas fa-credit-card"></i>
                  <span>3. PHƯƠNG THỨC THANH TOÁN</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label class="p-2.5 bg-white border rounded cursor-pointer flex items-center space-x-2">
                    <input type="radio" name="payment-method" value="Tiền mặt khi nhận hàng (COD)" checked>
                    <span class="font-semibold text-gray-800">💵 Tiền mặt (COD)</span>
                  </label>
                  <label class="p-2.5 bg-white border rounded cursor-pointer flex items-center space-x-2">
                    <input type="radio" name="payment-method" value="Chuyển khoản Ngân hàng (QR Code)">
                    <span class="font-semibold text-gray-800">🏦 Chuyển khoản QR Ngân hàng</span>
                  </label>
                  <label class="p-2.5 bg-white border rounded cursor-pointer flex items-center space-x-2">
                    <input type="radio" name="payment-method" value="Ví điện tử MoMo">
                    <span class="font-semibold text-gray-800">🟣 Ví MoMo</span>
                  </label>
                  <label class="p-2.5 bg-white border rounded cursor-pointer flex items-center space-x-2">
                    <input type="radio" name="payment-method" value="Ví ZaloPay / ShopeePay">
                    <span class="font-semibold text-gray-800">🔵 Ví ZaloPay / ShopeePay</span>
                  </label>
                </div>
              </div>

            </div>

            <div class="lg:col-span-5 space-y-4">
              <div class="border rounded p-4 bg-white">
                <h3 class="font-bold text-xs text-gray-800 border-b pb-2 mb-3">Kiểm tra sản phẩm (${cart.length})</h3>
                <div class="divide-y max-h-52 overflow-y-auto text-xs">
                  ${cart.map(i => `
                    <div class="py-2.5 flex justify-between items-center">
                      <div class="flex items-center space-x-2">
                        <img src="${i.image}" class="w-10 h-10 object-cover rounded border">
                        <div class="max-w-[150px]">
                          <p class="font-medium truncate">${i.name}</p>
                          <span class="text-[#ee4d2d]">${i.price.toLocaleString()} ₫ x ${i.qty}</span>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="font-bold text-gray-700">${(i.price * i.qty).toLocaleString()} ₫</span>
                        <button onclick="removeCartItem(${i.id})" class="text-red-500 font-bold ml-1 hover:underline">×</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="p-4 bg-orange-50/70 border border-dashed border-[#ee4d2d] rounded-sm">
                <h4 class="font-bold text-xs text-[#ee4d2d] mb-2">🎟️ SHOPLUX VOUCHER</h4>
                <div class="space-y-1.5 mb-3">
                  ${AVAILABLE_VOUCHERS.map(v => `
                    <div onclick="selectVoucher('${v.code}')" class="p-2 bg-white rounded border cursor-pointer hover:border-[#ee4d2d] flex items-center justify-between text-[11px] ${appliedVoucherCode === v.code ? 'border-[#ee4d2d] bg-orange-50 font-bold' : ''}">
                      <div>
                        <span class="font-bold text-[#ee4d2d]">[${v.code}]</span>
                        <span class="text-gray-700 ml-1">${v.name}</span>
                        <p class="text-[10px] text-gray-400">${v.desc}</p>
                      </div>
                      <button class="px-2 py-0.5 text-[10px] rounded ${appliedVoucherCode === v.code ? 'bg-[#ee4d2d] text-white' : 'bg-gray-100 text-gray-700'}">
                        ${appliedVoucherCode === v.code ? 'Đã Chọn' : 'Dùng Ngay'}
                      </button>
                    </div>
                  `).join('')}
                </div>
                <div class="flex space-x-1 text-xs">
                  <input id="custom-voucher-code" placeholder="Mã giảm giá khác..." class="border p-2 rounded text-xs flex-1 uppercase focus:outline-[#ee4d2d]">
                  <button onclick="applyCustomVoucher()" class="bg-[#ee4d2d] text-white px-4 py-2 rounded font-bold text-xs">Áp Dụng</button>
                </div>
              </div>

              <div class="bg-gray-50 border p-4 rounded text-xs space-y-2">
                <div class="flex justify-between text-gray-600">
                  <span>Tiền sản phẩm:</span>
                  <span>${itemsSubtotal.toLocaleString()} ₫</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Phí ship (<span id="shipping-unit-label">${selectedShippingUnit}</span>):</span>
                  <span id="shipping-cost-label">${selectedShippingCost.toLocaleString()} ₫</span>
                </div>
                <div class="flex justify-between text-green-600 font-bold">
                  <span>Voucher giảm:</span>
                  <span id="discount-label">-${currentDiscount.toLocaleString()} ₫</span>
                </div>
                <div class="border-t pt-3 flex justify-between items-baseline">
                  <span class="font-bold text-sm text-gray-800">Tổng thanh toán:</span>
                  <span id="total-payment-label" class="text-2xl font-black text-[#ee4d2d]">${totalPayment.toLocaleString()} ₫</span>
                </div>
                <button onclick="submitOrder()" class="w-full mt-4 bg-[#ee4d2d] hover:bg-[#d73211] text-white py-3 rounded font-bold uppercase text-xs tracking-wider shadow transition">
                  ĐẶT HÀNG NGAY
                </button>
              </div>

            </div>
          </div>
        `}
      </div>
    </div>
  `;
}

function updateShipping(val) {
  const [unit, cost] = val.split(':');
  selectedShippingUnit = unit;
  selectedShippingCost = parseInt(cost);
  recalculateOrder();
}

function selectVoucher(code) {
  const v = AVAILABLE_VOUCHERS.find(item => item.code === code);
  if (!v) return;
  if (appliedVoucherCode === code) {
    appliedVoucherCode = "";
    currentDiscount = 0;
  } else {
    appliedVoucherCode = code;
    currentDiscount = v.discount;
  }
  recalculateOrder();
}

function applyCustomVoucher() {
  const code = document.getElementById('custom-voucher-code').value.trim().toUpperCase();
  const found = AVAILABLE_VOUCHERS.find(v => v.code === code);
  if (found) {
    selectVoucher(found.code);
    alert(`Áp dụng thành công "${found.name}"!`);
  } else {
    alert("Mã giảm giá không hợp lệ!");
  }
}

function recalculateOrder() {
  const itemsSubtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalPayment = Math.max(0, itemsSubtotal + selectedShippingCost - currentDiscount);

  const shippingUnitLabel = document.getElementById('shipping-unit-label');
  const shippingCostLabel = document.getElementById('shipping-cost-label');
  const discountLabel = document.getElementById('discount-label');
  const totalPaymentLabel = document.getElementById('total-payment-label');

  if (shippingUnitLabel) shippingUnitLabel.innerText = selectedShippingUnit;
  if (shippingCostLabel) shippingCostLabel.innerText = `${selectedShippingCost.toLocaleString()} ₫`;
  if (discountLabel) discountLabel.innerText = `-${currentDiscount.toLocaleString()} ₫`;
  if (totalPaymentLabel) totalPaymentLabel.innerText = `${totalPayment.toLocaleString()} ₫`;
}

function submitOrder() {
  const fullname = document.getElementById('order-fullname').value.trim();
  const phone = document.getElementById('order-phone').value.trim();
  const year = document.getElementById('order-year').value.trim();
  const address = document.getElementById('order-address').value.trim();

  if (!fullname) return alert("Vui lòng nhập Họ và tên người nhận!"), document.getElementById('order-fullname').focus();
  if (!phone || !/^[0-9]{9,11}$/.test(phone)) return alert("Số điện thoại không hợp lệ! Vui lòng nhập 10 số."), document.getElementById('order-phone').focus();
  const yearNum = parseInt(year);
  if (!year || isNaN(yearNum) || yearNum < 1920 || yearNum > 2016) return alert("Năm sinh không hợp lệ!"), document.getElementById('order-year').focus();
  if (!address || address.length < 8) return alert("Vui lòng nhập địa chỉ giao hàng chi tiết!"), document.getElementById('order-address').focus();

  const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
  const itemsSubtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalPayment = Math.max(0, itemsSubtotal + selectedShippingCost - currentDiscount);

  alert(
    `🎉 ĐẶT HÀNG THÀNH CÔNG!\n\n` +
    `👤 Người nhận: ${fullname} (${yearNum})\n` +
    `📞 SĐT: ${phone}\n` +
    `📍 Địa chỉ: ${address}\n` +
    `🚚 Vận chuyển: ${selectedShippingUnit}\n` +
    `🎟️ Voucher: ${appliedVoucherCode || 'Không'}\n` +
    `💳 Thanh toán: ${paymentMethod}\n` +
    `💰 TỔNG TIỀN: ${totalPayment.toLocaleString()} ₫`
  );

  cart = [];
  appliedVoucherCode = "";
  currentDiscount = 0;
  saveCart();
  window.location.href = '/';
}

// LOGIN & REGISTER PAGES
function renderLoginPage(container) {
  container.innerHTML = `
    <div class="w-full">
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

      <div class="shop-gradient py-12">
        <div class="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div class="text-white hidden md:block max-w-md">
            <h1 class="text-4xl font-extrabold tracking-tight">Mua Sắm Đẳng Cấp</h1>
            <p class="mt-3 text-sm opacity-90 leading-relaxed">Nền tảng thương mại điện tử hàng đầu với hàng triệu voucher và ưu đãi freeship mỗi ngày.</p>
          </div>
          <div class="bg-white p-8 rounded shadow-2xl w-full max-w-sm">
            <h3 class="text-lg font-bold text-gray-800 mb-6">Đăng Nhập</h3>
            <div class="space-y-4">
              <input id="login-user" type="text" placeholder="Tên đăng nhập" class="w-full border p-3 rounded text-xs focus:outline-[#ee4d2d]">
              <input id="login-pass" type="password" placeholder="Mật khẩu" class="w-full border p-3 rounded text-xs focus:outline-[#ee4d2d]">
              <button onclick="handleLoginSubmit()" class="w-full bg-[#ee4d2d] hover:bg-[#d73211] text-white py-3 rounded font-bold uppercase text-xs transition">
                ĐĂNG NHẬP
              </button>
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
            <p class="mt-3 text-sm opacity-90 leading-relaxed">Tạo tài khoản ShopLux ngay hôm nay để nhận mã người mới NEWBIE100 giảm ngay 100.000 ₫.</p>
          </div>
          <div class="bg-white p-8 rounded shadow-2xl w-full max-w-sm">
            <h3 class="text-lg font-bold text-gray-800 mb-6">Đăng Ký Tài Khoản</h3>
            <div class="space-y-4">
              <input id="reg-name" type="text" placeholder="Họ và tên của bạn" class="w-full border p-3 rounded text-xs focus:outline-[#ee4d2d]">
              <input id="reg-user" type="text" placeholder="Tên đăng nhập" class="w-full border p-3 rounded text-xs focus:outline-[#ee4d2d]">
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
            Kết quả tìm kiếm cho '<span class="text-[#ee4d2d]">${keyword}</span>'
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
        <h1 class="text-base font-bold text-gray-800 border-b pb-3 mb-4">🔔 Hộp Thư ShopLux</h1>
        <div class="divide-y text-xs">
          <div class="py-3">
            <h4 class="font-bold text-gray-800">Tặng bạn Voucher NEWBIE100</h4>
            <p class="text-gray-500 mt-1">Giảm trực tiếp 100.000 ₫ khi thanh toán đơn hàng.</p>
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

// CART ACTIONS
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

window.addEventListener('DOMContentLoaded', router);
