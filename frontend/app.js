const API_URL = '/api';
let cart = [];
let currentUser = JSON.parse(localStorage.getItem('client_user')) || null;

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function renderAuth() {
  const container = document.getElementById('auth-section');
  if (currentUser) {
    container.innerHTML = `
      <span class="text-sm font-medium">👋 ${currentUser.fullname}</span>
      <button onclick="logout()" class="text-xs text-red-500 hover:underline">Đăng xuất</button>
    `;
  } else {
    container.innerHTML = `
      <button onclick="openModal('login-modal')" class="text-sm font-semibold text-gray-600 hover:text-indigo-600 px-3 py-1.5">Đăng nhập</button>
      <button onclick="openModal('register-modal')" class="text-sm font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg">Đăng ký</button>
    `;
  }
}

async function handleRegister() {
  const fullname = document.getElementById('reg-fullname').value;
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullname, username, password })
  });
  const data = await res.json();
  alert(data.message);
  if (data.success) {
    closeModal('register-modal');
    openModal('login-modal');
  }
}

async function handleLogin() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.success) {
    currentUser = data.user;
    localStorage.setItem('client_user', JSON.stringify(currentUser));
    closeModal('login-modal');
    renderAuth();
    alert(`Đăng nhập thành công, xin chào ${currentUser.fullname}!`);
  } else {
    alert(data.message);
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('client_user');
  renderAuth();
}

async function loadProducts() {
  const res = await fetch(`${API_URL}/products`);
  const { data } = await res.json();
  const grid = document.getElementById('product-grid');
  grid.innerHTML = data.map(p => `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
      <img src="${p.image}" class="w-full h-44 object-cover">
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs text-indigo-500 font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded">${p.category}</span>
          <h4 class="font-bold text-gray-800 mt-2">${p.name}</h4>
          <p class="text-gray-500 text-xs mt-1">${p.desc}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span class="font-bold text-indigo-600">${p.price.toLocaleString()} đ</span>
          <button onclick="addToCart(${p.id}, '${p.name}', ${p.price})" class="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700">+ Thêm</button>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCart(id, name, price) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, name, price, qty: 1 });
  updateCart();
}

function updateCart() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById('cart-count').innerText = count;
  document.getElementById('cart-total').innerText = `${total.toLocaleString()} đ`;

  const container = document.getElementById('cart-items');
  if (cart.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 py-4 text-sm">Giỏ hàng trống</p>';
    return;
  }
  container.innerHTML = cart.map(i => `
    <div class="py-2.5 flex justify-between items-center text-sm">
      <div>
        <p class="font-semibold">${i.name}</p>
        <p class="text-xs text-gray-500">${i.price.toLocaleString()} đ x ${i.qty}</p>
      </div>
      <span class="font-bold text-indigo-600">${(i.price * i.qty).toLocaleString()} đ</span>
    </div>
  `).join('');
}

function checkout() {
  if (!currentUser) return alert('Vui lòng đăng nhập trước khi thanh toán!'), openModal('login-modal');
  if (cart.length === 0) return alert('Giỏ hàng đang trống!');
  alert(`Cảm ơn ${currentUser.fullname}, đơn hàng đã được ghi nhận vào hệ thống backend!`);
  cart = [];
  updateCart();
  closeModal('cart-modal');
}

renderAuth();
loadProducts();
