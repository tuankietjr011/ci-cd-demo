const API_URL = '/api';
let allProducts = [];
let displayedProducts = [];
let cart = [];
let discountAmount = 0;
let appliedVoucher = "";
let currentDetailProduct = null;
let currentDetailQty = 1;
let selectedCategoryId = 0;
let currentUser = JSON.parse(localStorage.getItem('shopee_user')) || null;
let isRegisterMode = false;

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// AUTH
function renderAuth() {
  const container = document.getElementById('auth-section');
  if (currentUser) {
    container.innerHTML = `
      <span class="font-semibold text-white">👤 ${currentUser.fullname}</span>
      <span>|</span>
      <button onclick="logout()" class="hover:opacity-80">Đăng Xuất</button>
    `;
  } else {
    container.innerHTML = `
      <button onclick="openAuth(true)" class="hover:opacity-80">Đăng Ký</button>
      <span>|</span>
      <button onclick="openAuth(false)" class="hover:opacity-80">Đăng Nhập</button>
    `;
  }
}

function openAuth(isRegister) {
  isRegisterMode = isRegister;
  document.getElementById('auth-title').innerText = isRegister ? "Đăng Ký Tài Khoản Shopee" : "Đăng Nhập Shopee";
  document.getElementById('auth-fullname').classList.toggle('hidden', !isRegister);
  openModal('auth-modal');
}

async function submitAuth() {
  const fullname = document.getElementById('auth-fullname').value;
  const username = document.getElementById('auth-username').value;
  const password = document.getElementById('auth-password').value;

  if (isRegisterMode) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, username, password })
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) openAuth(false);
  } else {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('shopee_user', JSON.stringify(currentUser));
      closeModal('auth-modal');
      renderAuth();
      alert(`Chào mừng ${currentUser.fullname} quay trở lại!`);
    } else {
      alert(data.message);
    }
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('shopee_user');
  renderAuth();
}

// DANH MỤC
async function loadCategories() {
  const res = await fetch(`${API_URL}/categories`);
  const { data } = await res.json();
  const container = document.getElementById('category-grid');
  container.innerHTML = data.map(c => `
    <div onclick="selectCategory(${c.id})" class="p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/50 transition ${selectedCategoryId === c.id ? 'border-b-2 border-[#ee4d2d] bg-orange-50 font-bold' : ''}">
      <span class="text-2xl mb-1.5">${c.icon}</span>
      <span class="text-xs text-gray-700 text-center leading-tight line-clamp-2">${c.name}</span>
    </div>
  `).join('');
}

function selectCategory(catId) {
  selectedCategoryId = catId;
  loadCategories();
  if (catId === 0) {
    displayedProducts = allProducts;
  } else {
    displayedProducts = allProducts.filter(p => p.categoryId === catId);
  }
  renderProducts();
}

// SẢN PHẨM & TÌM KIẾM
async function loadProducts() {
  const res = await fetch(`${API_URL}/products`);
  const { data } = await res.json();
  allProducts = data;
  displayedProducts = data;
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  document.getElementById('product-count-label').innerText = `Tìm thấy ${displayedProducts.length} sản phẩm`;

  if (displayedProducts.length === 0) {
    grid.innerHTML = `<div class="col-span-full py-12 text-center text-gray-400">Không tìm thấy sản phẩm phù hợp.</div>`;
    return;
  }

  grid.innerHTML = displayedProducts.map(p => `
    <div class="bg-white rounded-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-150 border border-gray-100 flex flex-col justify-between overflow-hidden relative cursor-pointer" onclick="openProductDetail(${p.id})">
      <div class="absolute top-0 right-0 bg-[#ffd839]/90 text-[#ee4d2d] text-[10px] font-bold px-1 py-0.5 uppercase">${p.discount}</div>
      <div>
        <img src="${p.image}" class="w-full h-36 object-cover">
        <div class="p-2">
          <h4 class="text-xs text-gray-800 line-clamp-2 leading-relaxed mb-2">${p.name}</h4>
          <div class="flex items-baseline space-x-1.5">
            <span class="text-[#ee4d2d] font-semibold text-sm">${p.price.toLocaleString()} ₫</span>
            <span class="text-[10px] text-gray-400 line-through">${p.originalPrice.toLocaleString()} ₫</span>
          </div>
          <div class="mt-2 text-[10px] text-gray-400 flex items-center justify-between">
            <span class="text-yellow-500 font-semibold"><i class="fas fa-star text-[9px]"></i> ${p.rating}</span>
            <span>Đã bán ${p.sold}</span>
          </div>
        </div>
      </div>
      <div class="p-2 pt-0" onclick="event.stopPropagation()">
        <button onclick="addToCart(${p.id}, 1)" class="w-full bg-[#ee4d2d] text-white text-xs py-1 rounded-sm hover:opacity-90 transition font-medium">
          + Thêm vào giỏ
        </button>
      </div>
    </div>
  `).join('');
}

function handleSearch() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  displayedProducts = allProducts.filter(p => p.name.toLowerCase().includes(query));
  renderProducts();
}

function quickSearch(keyword) {
  document.getElementById('search-input').value = keyword;
  handleSearch();
}

// CHI TIẾT SẢN PHẨM
function openProductDetail(id) {
  currentDetailProduct = allProducts.find(p => p.id === id);
  if (!currentDetailProduct) return;
  currentDetailQty = 1;

  document.getElementById('detail-img').src = currentDetailProduct.image;
  document.getElementById('detail-title').innerText = currentDetailProduct.name;
  document.getElementById('detail-rating').innerText = currentDetailProduct.rating;
  document.getElementById('detail-sold').innerText = `Đã bán ${currentDetailProduct.sold}`;
  document.getElementById('detail-price').innerText = `${currentDetailProduct.price.toLocaleString()} ₫`;
  document.getElementById('detail-original').innerText = `${currentDetailProduct.originalPrice.toLocaleString()} ₫`;
  document.getElementById('detail-discount').innerText = currentDetailProduct.discount;
  document.getElementById('detail-desc').innerText = currentDetailProduct.desc;
  document.getElementById('detail-qty').innerText = currentDetailQty;

  document.getElementById('detail-add-btn').onclick = () => {
    addToCart(currentDetailProduct.id, currentDetailQty);
    closeModal('detail-modal');
  };

  openModal('detail-modal');
}

function changeDetailQty(delta) {
  currentDetailQty = Math.max(1, currentDetailQty + delta);
  document.getElementById('detail-qty').innerText = currentDetailQty;
}

// GIỎ HÀNG & VOUCHER
function addToCart(id, qty = 1) {
  const product = allProducts.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  updateCartUI();
  alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
}

function updateCartQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  }
  updateCartUI();
}

function applyVoucher() {
  const code = document.getElementById('voucher-input').value.trim().toUpperCase();
  if (code === "SHOPEE50") {
    discountAmount = 50000;
    appliedVoucher = code;
    alert("Áp dụng mã giảm 50.000 ₫ thành công!");
  } else if (code === "FREESHIP") {
    discountAmount = 30000;
    appliedVoucher = code;
    alert("Áp dụng mã miễn phí vận chuyển 30.000 ₫ thành công!");
  } else {
    alert("Mã voucher không hợp lệ!");
    return;
  }
  updateCartUI();
}

function applyQuickVoucher(code) {
  document.getElementById('voucher-input').value = code;
  applyVoucher();
  openModal('cart-modal');
}

function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  document.getElementById('cart-count').innerText = count;
  document.getElementById('cart-subtotal').innerText = `${subtotal.toLocaleString()} ₫`;
  document.getElementById('cart-discount').innerText = `-${discountAmount.toLocaleString()} ₫`;
  document.getElementById('cart-total').innerText = `${finalTotal.toLocaleString()} ₫`;

  const container = document.getElementById('cart-items');
  if (cart.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 py-6">Chưa có sản phẩm nào trong giỏ</p>';
    return;
  }

  container.innerHTML = cart.map(i => `
    <div class="py-2.5 flex justify-between items-center">
      <div class="flex items-center space-x-2 max-w-[240px]">
        <img src="${i.image}" class="w-10 h-10 object-cover rounded-sm border">
        <div>
          <p class="font-medium text-xs truncate">${i.name}</p>
          <span class="text-[#ee4d2d] font-semibold">${i.price.toLocaleString()} ₫</span>
        </div>
      </div>
      <div class="flex items-center border text-xs">
        <button onclick="updateCartQty(${i.id}, -1)" class="px-2 py-0.5 bg-gray-100">-</button>
        <span class="px-2.5 font-semibold">${i.qty}</span>
        <button onclick="updateCartQty(${i.id}, 1)" class="px-2 py-0.5 bg-gray-100">+</button>
      </div>
    </div>
  `).join('');
}

function checkout() {
  if (!currentUser) {
    alert("Vui lòng đăng nhập tài khoản trước khi thanh toán!");
    openAuth(false);
    return;
  }
  if (cart.length === 0) return alert("Giỏ hàng của bạn đang trống!");

  const method = document.getElementById('payment-method').value;
  const methodText = method === 'COD' ? "Thanh toán khi nhận hàng (COD)" : "Ví ShopeePay";
  
  alert(`🎉 ĐẶT HÀNG THÀNH CÔNG!\n\nKhách hàng: ${currentUser.fullname}\nPhương thức: ${methodText}\nVoucher: ${appliedVoucher || 'Không có'}\nTổng tiền: ${document.getElementById('cart-total').innerText}\n\nĐơn hàng đang được người bán chuẩn bị!`);
  
  cart = [];
  discountAmount = 0;
  appliedVoucher = "";
  updateCartUI();
  closeModal('cart-modal');
}

renderAuth();
loadCategories();
loadProducts();
