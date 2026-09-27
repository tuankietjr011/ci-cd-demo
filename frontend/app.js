// ==========================================
// SHOPLUX - FRONTEND APP.JS
// ==========================================

const API = "/api";

let allProducts = [];
let allCategories = [];
let cart = JSON.parse(localStorage.getItem("shoplux_cart") || "[]");

// ==========================================
// HELPERS
// ==========================================

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " ₫";
}

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getProductImages(product) {
  if (
    Array.isArray(product.images) &&
    product.images.length
  ) {
    return product.images.filter(Boolean).slice(0, 4);
  }

  if (product.image) {
    return [product.image];
  }

  return [
    "https://placehold.co/600x600?text=ShopLux"
  ];
}

function getCategoryName(categoryId) {
  const category = allCategories.find(
    c => Number(c.id) === Number(categoryId)
  );

  return category ? category.name : "";
}

const SUBCATEGORY_NAMES = {
  "ao-thun": "Áo thun",
  "do-bong-da": "Đồ bóng đá",
  "ao-so-mi": "Áo sơ mi",
  "quan-jeans": "Quần jeans",
  "ao-khoac": "Áo khoác",

  iphone: "iPhone",
  samsung: "Samsung",
  xiaomi: "Xiaomi",
  oppo: "OPPO",
  vivo: "Vivo",
  "phu-kien-dien-thoai": "Phụ kiện điện thoại",

  "tai-nghe": "Tai nghe",
  "ban-phim": "Bàn phím",
  chuot: "Chuột",
  laptop: "Laptop",
  loa: "Loa",
  "man-hinh": "Màn hình",

  "dong-ho-thong-minh": "Đồng hồ thông minh",
  "dong-ho-nam": "Đồng hồ nam",
  "dong-ho-nu": "Đồng hồ nữ",
  "dong-ho-the-thao": "Đồng hồ thể thao",

  khac: "Khác"
};

function getSubcategoryName(id) {
  return SUBCATEGORY_NAMES[id] || "";
}

// ==========================================
// OLD SEARCH CATEGORY COMPATIBILITY
// ==========================================

function categoryFromOldSearch(search) {
  const text = normalizeText(search);

  const map = {
    "thoi trang": 1,
    "dien thoai": 2,
    "thiet bi dien tu": 3,
    "dong ho": 4
  };

  return map[text] || null;
}

// ==========================================
// LOAD DATA
// ==========================================

async function loadShopData() {
  try {
    const [productResponse, categoryResponse] =
      await Promise.all([
        fetch(API + "/products"),
        fetch(API + "/categories")
      ]);

    const productData = await productResponse.json();
    const categoryData = await categoryResponse.json();

    allProducts = Array.isArray(productData)
      ? productData
      : productData.data || [];

    allCategories = Array.isArray(categoryData)
      ? categoryData
      : categoryData.data || [];

    updateCartCount();
    renderPage();

  } catch (error) {
    console.error("LOAD SHOP ERROR:", error);

    const container = getMainContainer();

    if (container) {
      container.innerHTML = `
        <div class="bg-white rounded-xl p-10 text-center">
          <h2 class="text-xl font-bold text-red-500">
            Không thể tải sản phẩm
          </h2>

          <p class="text-gray-500 mt-2">
            Vui lòng tải lại trang.
          </p>
        </div>
      `;
    }
  }
}

// ==========================================
// MAIN CONTAINER
// ==========================================

function getMainContainer() {
  return (
    document.getElementById("app") ||
    document.getElementById("mainContent") ||
    document.getElementById("product-container") ||
    document.querySelector("main")
  );
}

// ==========================================
// ROUTER
// ==========================================

function renderPage() {
  const params = new URLSearchParams(window.location.search);

  const id = params.get("id");
  const category = params.get("category");
  const subcategory = params.get("subcategory");
  const search = params.get("search");

  const container = getMainContainer();

  if (!container) {
    console.error("Không tìm thấy main container");
    return;
  }

  if (id) {
    renderProductDetailView(container, id);
    return;
  }

  renderProductListing(
    container,
    category,
    subcategory,
    search
  );
}

// ==========================================
// FILTER PRODUCTS
// ==========================================

function filterProducts(category, subcategory, search) {
  let result = [...allProducts];

  let categoryId = Number(category) || null;
  let realSearch = search || "";

  // Hỗ trợ URL cũ:
  // ?search=Thời Trang
  if (!categoryId && search) {
    const oldCategory = categoryFromOldSearch(search);

    if (oldCategory) {
      categoryId = oldCategory;
      realSearch = "";
    }
  }

  if (categoryId) {
    result = result.filter(
      p => Number(p.categoryId) === categoryId
    );
  }

  if (subcategory) {
    result = result.filter(
      p => String(p.subcategoryId || "") === String(subcategory)
    );
  }

  if (realSearch.trim()) {
    const keyword = normalizeText(realSearch);

    result = result.filter(product => {
      const haystack = normalizeText(
        [
          product.name,
          product.desc,
          getCategoryName(product.categoryId),
          getSubcategoryName(product.subcategoryId)
        ].join(" ")
      );

      return haystack.includes(keyword);
    });
  }

  return result;
}

// ==========================================
// PRODUCT LISTING
// ==========================================

function renderProductListing(
  container,
  category,
  subcategory,
  search
) {
  const products = filterProducts(
    category,
    subcategory,
    search
  );

  let title = "GỢI Ý HÔM NAY";

  const categoryId =
    Number(category) ||
    categoryFromOldSearch(search);

  if (categoryId) {
    title = getCategoryName(categoryId) || "Sản phẩm";
  } else if (subcategory) {
    title = getSubcategoryName(subcategory) || "Sản phẩm";
  } else if (search) {
    title = `Kết quả tìm kiếm cho "${escapeHtml(search)}"`;
  }

  container.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 py-6">

      <div class="bg-white rounded-xl shadow-sm mb-5 p-5">

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 class="font-black text-xl text-gray-800">
              ${title}
            </h1>

            <p class="text-gray-500 mt-1">
              Tìm thấy ${products.length} sản phẩm phù hợp trên ShopLux
            </p>
          </div>

          <a
            href="/"
            class="text-[#ee4d2d] font-medium"
          >
            ← Về trang chủ
          </a>

        </div>

        ${renderSubcategoryNavigation(categoryId)}

      </div>

      ${
        products.length
          ? `
            <div
              class="
                grid
                grid-cols-2
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
                gap-4
              "
            >
              ${renderProductCards(products)}
            </div>
          `
          : `
            <div
              class="
                bg-white
                min-h-[260px]
                rounded-xl
                flex
                items-center
                justify-center
                text-gray-400
              "
            >
              Không tìm thấy sản phẩm nào phù hợp.
            </div>
          `
      }

    </section>
  `;
}

// ==========================================
// SUBCATEGORY MENU
// ==========================================

function renderSubcategoryNavigation(categoryId) {
  const data = {
    1: [
      ["ao-thun", "Áo thun"],
      ["do-bong-da", "Đồ bóng đá"],
      ["ao-so-mi", "Áo sơ mi"],
      ["quan-jeans", "Quần jeans"],
      ["ao-khoac", "Áo khoác"],
      ["khac", "Khác"]
    ],

    2: [
      ["iphone", "iPhone"],
      ["samsung", "Samsung"],
      ["xiaomi", "Xiaomi"],
      ["oppo", "OPPO"],
      ["vivo", "Vivo"],
      ["phu-kien-dien-thoai", "Phụ kiện điện thoại"],
      ["khac", "Khác"]
    ],

    3: [
      ["tai-nghe", "Tai nghe"],
      ["ban-phim", "Bàn phím"],
      ["chuot", "Chuột"],
      ["laptop", "Laptop"],
      ["loa", "Loa"],
      ["man-hinh", "Màn hình"],
      ["khac", "Khác"]
    ],

    4: [
      ["dong-ho-thong-minh", "Đồng hồ thông minh"],
      ["dong-ho-nam", "Đồng hồ nam"],
      ["dong-ho-nu", "Đồng hồ nữ"],
      ["dong-ho-the-thao", "Đồng hồ thể thao"],
      ["khac", "Khác"]
    ]
  };

  if (!categoryId || !data[categoryId]) {
    return "";
  }

  return `
    <div class="flex flex-wrap gap-2 mt-5">

      <a
        href="/?category=${categoryId}"
        class="
          border
          border-[#ee4d2d]
          text-[#ee4d2d]
          px-4
          py-2
          rounded-full
          text-sm
          hover:bg-[#ee4d2d]
          hover:text-white
        "
      >
        Tất cả
      </a>

      ${data[categoryId]
        .map(
          ([id, name]) => `
            <a
              href="/?category=${categoryId}&subcategory=${encodeURIComponent(id)}"
              class="
                border
                px-4
                py-2
                rounded-full
                text-sm
                hover:border-[#ee4d2d]
                hover:text-[#ee4d2d]
              "
            >
              ${name}
            </a>
          `
        )
        .join("")}

    </div>
  `;
}

// ==========================================
// PRODUCT CARDS
// ==========================================

function renderProductCards(products) {
  return products
    .map(product => {
      const images = getProductImages(product);
      const image = images[0];

      const price = Number(product.price || 0);

      const originalPrice = Number(
        product.originalPrice ||
        Math.round(price * 1.3)
      );

      return `
        <article
          class="
            bg-white
            border
            rounded-xl
            overflow-hidden
            hover:shadow-lg
            transition
            group
            relative
          "
        >

          <div
            class="
              absolute
              right-0
              top-0
              bg-yellow-300
              text-[#ee4d2d]
              px-2
              py-1
              text-xs
              font-bold
              z-10
            "
          >
            ${escapeHtml(product.discount || "-20%")}
          </div>

          <a
            href="/?id=${product.id}"
            class="block aspect-square bg-gray-100 overflow-hidden"
          >
            <img
              src="${image}"
              alt="${escapeHtml(product.name)}"
              class="
                w-full
                h-full
                object-cover
                group-hover:scale-105
                transition
                duration-300
              "
            >
          </a>

          <div class="p-3">

            <div class="text-xs text-gray-400 mb-1">
              ${escapeHtml(getCategoryName(product.categoryId))}
              ${
                product.subcategoryId
                  ? " • " +
                    escapeHtml(
                      getSubcategoryName(product.subcategoryId)
                    )
                  : ""
              }
            </div>

            <a
              href="/?id=${product.id}"
              class="
                block
                font-medium
                text-gray-800
                min-h-[42px]
                line-clamp-2
                hover:text-[#ee4d2d]
              "
            >
              ${escapeHtml(product.name)}
            </a>

            <div class="mt-3">

              <div class="flex flex-wrap items-center gap-2">

                <span class="text-[#ee4d2d] font-black text-lg">
                  ${formatPrice(price)}
                </span>

                <span class="text-gray-400 line-through text-xs">
                  ${formatPrice(originalPrice)}
                </span>

              </div>

              <div class="flex justify-between mt-2 text-xs text-gray-400">
                <span>
                  ⭐ ${escapeHtml(product.rating || 5)}
                </span>

                <span>
                  Đã bán ${escapeHtml(product.sold || "0")}
                </span>
              </div>

            </div>

            <div class="flex gap-2 mt-3">

              <button
                type="button"
                onclick="addToCartAndNotify(${product.id})"
                class="
                  border
                  border-[#ee4d2d]
                  text-[#ee4d2d]
                  w-10
                  rounded-lg
                  hover:bg-orange-50
                "
              >
                🛒
              </button>

              <a
                href="/?id=${product.id}"
                class="
                  flex-1
                  text-center
                  bg-[#ee4d2d]
                  text-white
                  rounded-lg
                  py-2
                  font-bold
                  text-xs
                "
              >
                XEM CHI TIẾT
              </a>

            </div>

          </div>

        </article>
      `;
    })
    .join("");
}

// ==========================================
// PRODUCT DETAIL
// ==========================================

function renderProductDetailView(container, id) {
  const product = allProducts.find(
    p => Number(p.id) === Number(id)
  );

  if (!product) {
    container.innerHTML = `
      <div class="max-w-7xl mx-auto p-10 text-center">
        <div class="bg-white rounded-xl p-10">
          Không tìm thấy sản phẩm.
          <br><br>
          <a href="/" class="text-[#ee4d2d]">
            ← Về trang chủ
          </a>
        </div>
      </div>
    `;

    return;
  }

  const images = getProductImages(product);

  const price = Number(product.price || 0);

  const originalPrice = Number(
    product.originalPrice ||
    Math.round(price * 1.3)
  );

  container.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 py-6">

      <div class="mb-4">
        <a href="/" class="text-[#ee4d2d]">
          ← Tiếp tục mua sắm
        </a>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-5">

        <div class="grid md:grid-cols-2 gap-8">

          <div>

            <div
              class="
                aspect-square
                bg-gray-100
                rounded-xl
                overflow-hidden
                border
              "
            >
              <img
                id="mainProductImage"
                src="${images[0]}"
                alt="${escapeHtml(product.name)}"
                class="w-full h-full object-contain"
              >
            </div>

            ${
              images.length > 1
                ? `
                  <div class="grid grid-cols-4 gap-3 mt-3">

                    ${images
                      .map(
                        (image, index) => `
                          <button
                            type="button"
                            onclick="changeProductImage(${index})"
                            class="
                              aspect-square
                              border
                              rounded-lg
                              overflow-hidden
                              hover:border-[#ee4d2d]
                            "
                          >
                            <img
                              src="${image}"
                              class="w-full h-full object-cover"
                            >
                          </button>
                        `
                      )
                      .join("")}

                  </div>
                `
                : ""
            }

          </div>

          <div>

            <div class="text-sm text-gray-500 mb-2">
              ${escapeHtml(getCategoryName(product.categoryId))}
              ${
                product.subcategoryId
                  ? " / " +
                    escapeHtml(
                      getSubcategoryName(product.subcategoryId)
                    )
                  : ""
              }
            </div>

            <h1 class="text-2xl md:text-3xl font-black text-gray-800">
              ${escapeHtml(product.name)}
            </h1>

            <div class="flex items-center gap-4 mt-3 text-sm">
              <span class="text-yellow-500">
                ⭐ ${escapeHtml(product.rating || 5)}
              </span>

              <span class="text-gray-400">
                Đã bán ${escapeHtml(product.sold || "0")}
              </span>
            </div>

            <div class="bg-gray-50 rounded-xl p-5 mt-6">

              <span class="text-3xl font-black text-[#ee4d2d]">
                ${formatPrice(price)}
              </span>

              <span class="ml-3 text-gray-400 line-through">
                ${formatPrice(originalPrice)}
              </span>

            </div>

            <div class="mt-6">

              <h2 class="font-bold text-lg mb-2">
                Mô tả sản phẩm
              </h2>

              <p class="text-gray-600 leading-7 whitespace-pre-line">
                ${escapeHtml(
                  product.desc ||
                  "Sản phẩm chính hãng ShopLux."
                )}
              </p>

            </div>

            <div class="flex gap-3 mt-8">

              <button
                onclick="addToCartAndNotify(${product.id})"
                class="
                  flex-1
                  border-2
                  border-[#ee4d2d]
                  text-[#ee4d2d]
                  bg-orange-50
                  py-4
                  rounded-lg
                  font-black
                "
              >
                🛒 THÊM VÀO GIỎ
              </button>

              <button
                onclick="buyNowDirect(${product.id})"
                class="
                  flex-1
                  bg-[#ee4d2d]
                  text-white
                  py-4
                  rounded-lg
                  font-black
                "
              >
                MUA NGAY
              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  `;

  window.currentDetailImages = images;
}

function changeProductImage(index) {
  const images = window.currentDetailImages || [];

  const mainImage =
    document.getElementById("mainProductImage");

  if (mainImage && images[index]) {
    mainImage.src = images[index];
  }
}

// ==========================================
// CART
// ==========================================

function saveCart() {
  localStorage.setItem(
    "shoplux_cart",
    JSON.stringify(cart)
  );

  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce(
    (sum, item) => sum + Number(item.qty || 1),
    0
  );

  document
    .querySelectorAll(
      "#cartCount, .cart-count, [data-cart-count]"
    )
    .forEach(element => {
      element.textContent = count;
    });
}

function addToCartAndNotify(id) {
  const product = allProducts.find(
    p => Number(p.id) === Number(id)
  );

  if (!product) return;

  const existing = cart.find(
    item => Number(item.id) === Number(id)
  );

  if (existing) {
    existing.qty =
      Number(existing.qty || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      image: getProductImages(product)[0],
      qty: 1
    });
  }

  saveCart();

  alert("Đã thêm sản phẩm vào giỏ hàng!");
}

function buyNowDirect(id) {
  addToCartAndNotify(id);

  if (document.getElementById("cartModal")) {
    openCart();
  }
}

// ==========================================
// SEARCH
// ==========================================

function performSearch() {
  const input =
    document.getElementById("searchInput") ||
    document.querySelector('input[type="search"]');

  if (!input) return;

  const keyword = input.value.trim();

  if (!keyword) {
    window.location.href = "/";
    return;
  }

  window.location.href =
    "/?search=" + encodeURIComponent(keyword);
}

function handleSearchKey(event) {
  if (event.key === "Enter") {
    performSearch();
  }
}

// ==========================================
// CATEGORY NAVIGATION
// ==========================================

function goCategory(categoryId) {
  window.location.href =
    "/?category=" + Number(categoryId);
}

function goSubcategory(categoryId, subcategoryId) {
  window.location.href =
    "/?category=" +
    Number(categoryId) +
    "&subcategory=" +
    encodeURIComponent(subcategoryId);
}

// ==========================================
// USER
// ==========================================

function logout() {
  localStorage.removeItem("shoplux_user");
  localStorage.removeItem("user");
  window.location.href = "/";
}

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const searchInput =
    document.getElementById("searchInput") ||
    document.querySelector('input[type="search"]');

  if (searchInput) {
    searchInput.addEventListener(
      "keydown",
      handleSearchKey
    );
  }

  loadShopData();
});

// Cho phép HTML gọi function
window.performSearch = performSearch;
window.goCategory = goCategory;
window.goSubcategory = goSubcategory;
window.addToCartAndNotify = addToCartAndNotify;
window.buyNowDirect = buyNowDirect;
window.changeProductImage = changeProductImage;
window.logout = logout;