const API = "/api";

let allProducts = [];
let categories = [];
let cart = JSON.parse(
  localStorage.getItem("shoplux_cart") || "[]"
);

function money(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " ₫";
}

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function imagesOf(p) {
  if (Array.isArray(p.images) && p.images.length) {
    return p.images;
  }

  if (p.image) return [p.image];

  return ["https://placehold.co/600x600?text=ShopLux"];
}

async function load() {
  const [p,c] = await Promise.all([
    fetch(API + "/products").then(r => r.json()),
    fetch(API + "/categories").then(r => r.json())
  ]);

  allProducts = p.data || [];
  categories = c.data || [];

  updateCart();
  route();
}

function route() {
  const params = new URLSearchParams(location.search);

  const id = params.get("id");
  const category = params.get("category");
  const subcategory = params.get("subcategory");
  const search = params.get("search");

  if (id) {
    renderDetail(id);
    return;
  }

  let data = [...allProducts];

  if (category) {
    data = data.filter(
      p => Number(p.categoryId) === Number(category)
    );
  }

  if (subcategory) {
    data = data.filter(
      p => p.subcategoryId === subcategory
    );
  }

  if (search) {
    const keyword = normalize(search);

    data = data.filter(p =>
      normalize(
        `${p.name} ${p.brand} ${p.desc}`
      ).includes(keyword)
    );
  }

  renderProducts(data, category, search);
}

function renderProducts(data, category, search) {
  let title = "HÀNG MỚI VỀ";

  if (category) {
    const c = categories.find(
      x => Number(x.id) === Number(category)
    );

    if (c) title = c.name.toUpperCase();
  }

  if (search) {
    title = `KẾT QUẢ: ${search}`;
  }

  app.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 py-10">

      <div class="flex justify-between items-end mb-6">

        <div>
          <p class="red-text text-xs font-black tracking-[3px]">
            SHOPLUX FASHION
          </p>

          <h2 class="text-2xl font-black mt-1">
            ${title}
          </h2>
        </div>

        <span class="text-gray-400 text-sm">
          ${data.length} sản phẩm
        </span>

      </div>

      ${
        data.length
          ? `
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              ${data.map(card).join("")}
            </div>
          `
          : `
            <div class="bg-white p-16 text-center text-gray-400">
              Không có sản phẩm phù hợp.
            </div>
          `
      }

    </section>
  `;
}

function card(p) {
  const image = imagesOf(p)[0];

  return `
    <article class="product-card bg-white">

      <a href="/?id=${p.id}" class="block aspect-[4/5] bg-gray-100">
        <img
          src="${image}"
          class="w-full h-full object-cover"
        >
      </a>

      <div class="p-3">

        <div class="text-[11px] text-gray-400 uppercase">
          ${p.brand || "ShopLux"}
        </div>

        <a
          href="/?id=${p.id}"
          class="font-bold text-sm block mt-1 min-h-[40px]"
        >
          ${p.name}
        </a>

        <div class="mt-3">

          <span class="red-text font-black">
            ${money(p.price)}
          </span>

          ${
            p.originalPrice > p.price
              ? `
                <span class="text-gray-400 line-through text-xs ml-1">
                  ${money(p.originalPrice)}
                </span>
              `
              : ""
          }

        </div>

        <div class="text-xs text-gray-400 mt-2">
          ⭐ ${p.rating || 5} · Đã bán ${p.sold || 0}
        </div>

      </div>

    </article>
  `;
}

function renderDetail(id) {
  const p = allProducts.find(
    x => Number(x.id) === Number(id)
  );

  if (!p) return;

  const imgs = imagesOf(p);

  window.detailImages = imgs;

  app.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 py-10">

      <a href="/" class="text-gray-500">
        ← Quay lại
      </a>

      <div class="bg-white grid md:grid-cols-2 gap-10 p-6 mt-5">

        <div>

          <div class="aspect-square bg-gray-100">
            <img
              id="mainImage"
              src="${imgs[0]}"
              class="w-full h-full object-contain"
            >
          </div>

          <div class="grid grid-cols-4 gap-2 mt-3">
            ${imgs.map((img,i) => `
              <button onclick="changeImage(${i})">
                <img
                  src="${img}"
                  class="aspect-square object-cover border"
                >
              </button>
            `).join("")}
          </div>

        </div>

        <div>

          <div class="text-sm font-black red-text uppercase tracking-[2px]">
            ${p.brand || "ShopLux"}
          </div>

          <h1 class="text-3xl font-black mt-3">
            ${p.name}
          </h1>

          <div class="mt-5">

            <span class="text-3xl red-text font-black">
              ${money(p.price)}
            </span>

            ${
              p.originalPrice > p.price
                ? `
                  <span class="text-gray-400 line-through ml-3">
                    ${money(p.originalPrice)}
                  </span>
                `
                : ""
            }

          </div>

          ${
            p.sizes?.length
              ? `
                <div class="mt-7">
                  <b>CHỌN SIZE</b>

                  <div class="flex flex-wrap gap-2 mt-3">
                    ${p.sizes.map(size => `
                      <button
                        class="border px-5 py-2 hover:border-[#c9001e]"
                      >
                        ${size}
                      </button>
                    `).join("")}
                  </div>
                </div>
              `
              : ""
          }

          <div class="mt-7">
            <b>MÔ TẢ</b>
            <p class="text-gray-600 mt-2 leading-7">
              ${p.desc || ""}
            </p>
          </div>

          <button
            onclick="addToCart(${p.id})"
            class="red text-white w-full py-4 font-black mt-8"
          >
            THÊM VÀO GIỎ HÀNG
          </button>

        </div>

      </div>

    </section>
  `;
}

function changeImage(index) {
  mainImage.src = window.detailImages[index];
}

function addToCart(id) {
  const p = allProducts.find(
    x => Number(x.id) === Number(id)
  );

  if (!p) return;

  const item = cart.find(
    x => Number(x.id) === Number(id)
  );

  if (item) {
    item.qty++;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: p.price,
      image: imagesOf(p)[0],
      qty: 1
    });
  }

  localStorage.setItem(
    "shoplux_cart",
    JSON.stringify(cart)
  );

  updateCart();

  alert("Đã thêm vào giỏ hàng");
}

function updateCart() {
  const count = cart.reduce(
    (sum,item) => sum + Number(item.qty || 1),
    0
  );

  const el = document.getElementById("cartCount");

  if (el) el.textContent = count;
}

function performSearch() {
  const value = searchInput.value.trim();

  if (!value) return;

  location.href =
    "/?search=" + encodeURIComponent(value);
}

document.addEventListener("DOMContentLoaded", () => {
  searchInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") performSearch();
  });

  load();
});

window.performSearch = performSearch;
window.addToCart = addToCart;
window.changeImage = changeImage;