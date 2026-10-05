const API = "/api";

let allProducts = [];
let currentProducts = [];

// ======================================================
// CART THEO TỪNG TÀI KHOẢN
// ======================================================

function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem("shoplux_user") || "null"
    );
  } catch (error) {
    return null;
  }
}

function getCartStorageKey() {
  const token =
    localStorage.getItem("shoplux_token");

  const user =
    getCurrentUser();

  // Chưa đăng nhập -> không hiển thị giỏ hàng
  if (!token || !user?.id) {
    return null;
  }

  return `shoplux_cart_user_${user.id}`;
}

function loadUserCart() {
  const key =
    getCartStorageKey();

  if (!key) {
    return [];
  }

  try {
    return JSON.parse(
      localStorage.getItem(key) || "[]"
    );
  } catch (error) {
    return [];
  }
}

let cart = loadUserCart();
// ======================================================
// FAVORITES
// ======================================================

let favorites = JSON.parse(
  localStorage.getItem("shoplux_favorites") || "[]"
);


function saveFavorites() {
  localStorage.setItem(
    "shoplux_favorites",
    JSON.stringify(favorites)
  );
}


function isFavorite(id) {
  return favorites.some(
    item =>
      Number(item.id) === Number(id)
  );
}


function toggleFavorite(id, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const token =
    localStorage.getItem("shoplux_token");

  if (!token) {
    alert(
      "Vui lòng đăng nhập để thêm sản phẩm yêu thích"
    );

    location.href = "/login.html";
    return;
  }

  const product =
    allProducts.find(
      item =>
        Number(item.id) === Number(id)
    );

  if (!product) {
    return;
  }

  const index =
    favorites.findIndex(
      item =>
        Number(item.id) === Number(id)
    );

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice:
        product.originalPrice,
      image:
        productImages(product)[0],
      type: product.type,
      gender: product.gender,
      subcategory:
        product.subcategory
    });
  }

  saveFavorites();

  refreshFavoriteButtons();
}


function refreshFavoriteButtons() {
  document
    .querySelectorAll(
      "[data-favorite-id]"
    )
    .forEach(button => {

      const id =
        Number(
          button.dataset.favoriteId
        );

      const active =
        isFavorite(id);

      if (
        button.dataset.favoriteType ===
        "detail"
      ) {
        button.textContent =
          active
            ? "♥ ĐÃ YÊU THÍCH"
            : "♡ THÊM VÀO YÊU THÍCH";
      } else {
        button.textContent =
          active ? "♥" : "♡";
      }

      button.style.color =
        active
          ? "#8b1e1e"
          : "#3b2416";

      button.setAttribute(
        "aria-label",
        active
          ? "Bỏ khỏi yêu thích"
          : "Thêm vào yêu thích"
      );
    });
}
const FILTER_OPTIONS = {
  ao: {
    nam: [
      ["ao-thun", "Áo Thun"],
      ["ao-polo", "Áo Polo"],
      ["ao-so-mi", "Áo Sơ Mi"],
      ["ao-khoac", "Áo Khoác"],
      ["ao-len", "Áo Len"],
      ["hoodie-sweater", "Hoodie / Sweater"],
      ["khac", "Khác"]
    ],
    nu: [
      ["ao-thun", "Áo Thun"],
      ["ao-croptop", "Áo Croptop"],
      ["ao-so-mi", "Áo Sơ Mi"],
      ["ao-khoac", "Áo Khoác"],
      ["ao-len", "Áo Len"],
      ["hoodie-sweater", "Hoodie / Sweater"],
      ["khac", "Khác"]
    ]
  },

  quan: {
    nam: [
      ["quan-jeans", "Quần Jeans"],
      ["quan-kaki", "Quần Kaki"],
      ["quan-tay", "Quần Tây"],
      ["quan-jogger", "Quần Jogger"],
      ["quan-short", "Quần Short"],
      ["khac", "Khác"]
    ],
    nu: [
      ["quan-jeans", "Quần Jeans"],
      ["quan-tay", "Quần Tây"],
      ["quan-ong-rong", "Quần Ống Rộng"],
      ["legging", "Legging"],
      ["quan-short", "Quần Short"],
      ["khac", "Khác"]
    ]
  },

  "giay-dep": {
    nam: [
      ["sneaker", "Sneaker"],
      ["giay-the-thao", "Giày Thể Thao"],
      ["giay-tay", "Giày Tây"],
      ["sandal", "Sandal"],
      ["dep", "Dép"]
    ],
    nu: [
      ["sneaker", "Sneaker"],
      ["giay-the-thao", "Giày Thể Thao"],
      ["cao-got", "Giày Cao Gót"],
      ["sandal", "Sandal"],
      ["dep", "Dép"]
    ]
  },

  "phu-kien": {
    nam: [
      ["tui-balo", "Túi / Balo"],
      ["mu", "Mũ"],
      ["vi", "Ví"],
      ["that-lung", "Thắt Lưng"],
      ["kinh", "Kính"],
      ["khac", "Khác"]
    ],
    nu: [
      ["tui-balo", "Túi / Balo"],
      ["mu", "Mũ"],
      ["vi", "Ví"],
      ["kinh", "Kính"],
      ["trang-suc", "Trang Sức"],
      ["khac", "Khác"]
    ]
  },

  "bong-da": {
    all: [
      ["ao-bong-da", "Áo Bóng Đá"],
      ["giay-bong-da", "Giày Bóng Đá"],
      ["phu-kien-bong-da", "Phụ Kiện Bóng Đá"]
    ]
  }
};

const SUBCATEGORY_NAMES = {
  "ao-thun": "Áo Thun",
  "ao-polo": "Áo Polo",
  "ao-so-mi": "Áo Sơ Mi",
  "ao-khoac": "Áo Khoác",
  "ao-len": "Áo Len",
  "ao-croptop": "Áo Croptop",
  "hoodie-sweater": "Hoodie / Sweater",

  "quan-jeans": "Quần Jeans",
  "quan-kaki": "Quần Kaki",
  "quan-tay": "Quần Tây",
  "quan-jogger": "Quần Jogger",
  "quan-short": "Quần Short",
  "quan-ong-rong": "Quần Ống Rộng",
  "legging": "Legging",

  "sneaker": "Sneaker",
  "giay-the-thao": "Giày Thể Thao",
  "giay-tay": "Giày Tây",
  "cao-got": "Giày Cao Gót",
  "sandal": "Sandal",
  "dep": "Dép",

  "tui-balo": "Túi / Balo",
  "mu": "Mũ",
  "vi": "Ví",
  "that-lung": "Thắt Lưng",
  "kinh": "Kính",
  "trang-suc": "Trang Sức",

  "ao-bong-da": "Áo Bóng Đá",
  "giay-bong-da": "Giày Bóng Đá",
  "phu-kien-bong-da": "Phụ Kiện Bóng Đá",

  "khac": "Khác"
};

const TYPE_NAMES = {
  ao: "ÁO",
  quan: "QUẦN",
  "giay-dep": "GIÀY DÉP",
  "phu-kien": "PHỤ KIỆN",
  "bong-da": "ĐỒ BÓNG ĐÁ"
};


// ======================================================
// HELPERS
// ======================================================

function money(value) {
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

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function productImages(product) {
  if (Array.isArray(product.images) && product.images.length) {
    return product.images.filter(Boolean).slice(0, 10);
  }

  if (product.image) {
    return [product.image];
  }

  return [
    "https://placehold.co/700x900?text=ShopLux"
  ];
}


// ======================================================
// LOAD
// ======================================================

async function loadProducts() {
  try {
    const response = await fetch(API + "/products");
    const json = await response.json();

    allProducts = json.data || [];

    updateCartCount();
    router();

  } catch (error) {
    console.error(error);

    app.innerHTML = `
      <div class="text-center py-20">
        Không thể tải sản phẩm.
      </div>
    `;
  }
}


// ======================================================
// SEARCH MATCHING
// ======================================================

function productSearchText(product) {
  const subName =
    SUBCATEGORY_NAMES[product.subcategory] || "";

  const genderName =
    product.gender === "nam"
      ? "nam male men"
      : product.gender === "nu"
        ? "nu nữ female women"
        : "";

  return normalizeText([
    product.name,
    product.brand,
    product.desc,
    product.type,
    TYPE_NAMES[product.type],
    product.subcategory,
    subName,
    genderName
  ].join(" "));
}


function searchProducts(products, keyword) {
  if (!keyword) return products;

  const search = normalizeText(keyword);

  const words = search
    .split(/\s+/)
    .filter(Boolean);

  return products.filter(product => {
    const text = productSearchText(product);

    return words.every(word =>
      text.includes(word)
    );
  });
}


// ======================================================
// ROUTER
// ======================================================

function router() {
  const params =
    new URLSearchParams(window.location.search);

  const id = params.get("id");

  if (id) {
    renderDetail(id);
    return;
  }

  const filters = {
    type: params.get("type") || "",
    gender: params.get("gender") || "",
    subcategory: params.get("subcategory") || "",
    brand: params.get("brand") || "",
    search: params.get("search") || ""
  };

  let products = [...allProducts];

  if (filters.type) {
    products = products.filter(
      p => p.type === filters.type
    );
  }

  if (filters.gender) {
    products = products.filter(
      p => p.gender === filters.gender
    );
  }

  if (filters.subcategory) {
    products = products.filter(
      p => p.subcategory === filters.subcategory
    );
  }

  if (filters.brand) {
    products = products.filter(
      p =>
        normalizeText(p.brand) ===
        normalizeText(filters.brand)
    );
  }

  /*
    QUAN TRỌNG:
    Search "áo thun" KHÔNG lọc gender.
    Vì vậy cả Áo Thun Nam + Áo Thun Nữ đều xuất hiện.
  */
  products = searchProducts(
    products,
    filters.search
  );

  currentProducts = products;

  renderProducts(products, filters);
}


// ======================================================
// PAGE TITLE
// ======================================================

function pageTitle(filters) {
  if (filters.search) {
    return `KẾT QUẢ CHO "${filters.search}"`;
  }

  if (filters.brand) {
    return filters.brand.toUpperCase();
  }

  if (filters.subcategory) {
    let title =
      SUBCATEGORY_NAMES[filters.subcategory] ||
      filters.subcategory;

    if (filters.gender === "nam") {
      title += " NAM";
    }

    if (filters.gender === "nu") {
      title += " NỮ";
    }

    return title.toUpperCase();
  }

  if (filters.type) {
    return TYPE_NAMES[filters.type] || "COLLECTION";
  }

  return "NEW ARRIVALS";
}


// ======================================================
// FILTER SIDEBAR
// ======================================================

function filterSidebar() {
  return `
    <aside
      class="
        lg:w-[260px]
        shrink-0
      "
    >

      <div
        class="
          bg-[#fffdf8]
          border
          p-5
          lg:sticky
          lg:top-5
        "
        style="border-color:#e8d5a3"
      >

        <div
          class="
            flex
            justify-between
            items-center
            border-b
            pb-4
          "
          style="border-color:#e8d5a3"
        >

          <h3
            class="
              luxury-font
              text-xl
            "
          >
            BỘ LỌC
          </h3>

          <button
            onclick="resetFilters()"
            class="
              text-xs
              underline
            "
            style="color:#70452d"
          >
            Xóa lọc
          </button>

        </div>


        <!-- GIỚI TÍNH -->

        <div
          class="
            py-5
            border-b
          "
          style="border-color:#e8d5a3"
        >

          <div
            class="
              text-xs
              tracking-[2px]
              font-bold
              mb-4
            "
          >
            GIỚI TÍNH
          </div>

          <label
            class="
              flex
              items-center
              gap-3
              mb-3
              cursor-pointer
            "
          >
            <input
              type="radio"
              name="filterGender"
              value=""
              checked
              onchange="applyClientFilters()"
            >

            Tất cả
          </label>

          <label
            class="
              flex
              items-center
              gap-3
              mb-3
              cursor-pointer
            "
          >
            <input
              type="radio"
              name="filterGender"
              value="nam"
              onchange="applyClientFilters()"
            >

            Nam
          </label>

          <label
            class="
              flex
              items-center
              gap-3
              cursor-pointer
            "
          >
            <input
              type="radio"
              name="filterGender"
              value="nu"
              onchange="applyClientFilters()"
            >

            Nữ
          </label>

        </div>


        <!-- THƯƠNG HIỆU -->

        <div
          class="
            py-5
            border-b
          "
          style="border-color:#e8d5a3"
        >

          <div
            class="
              text-xs
              tracking-[2px]
              font-bold
              mb-4
            "
          >
            THƯƠNG HIỆU
          </div>

          ${[
            "Nike",
            "adidas",
            "Louis Vuitton",
            "Gucci",
            "Dior"
          ].map(brand => `
            <label
              class="
                flex
                items-center
                gap-3
                mb-3
                cursor-pointer
              "
            >
              <input
                type="checkbox"
                class="brand-filter"
                value="${brand}"
                onchange="applyClientFilters()"
              >

              ${brand}
            </label>
          `).join("")}

        </div>


        <!-- GIÁ -->

        <div
          class="
            py-5
            border-b
          "
          style="border-color:#e8d5a3"
        >

          <div
            class="
              text-xs
              tracking-[2px]
              font-bold
              mb-4
            "
          >
            KHOẢNG GIÁ
          </div>


          <label
            class="
              flex
              items-center
              gap-3
              mb-3
              cursor-pointer
            "
          >
            <input
              type="radio"
              name="priceRange"
              value=""
              checked
              onchange="applyClientFilters()"
            >

            Tất cả mức giá
          </label>


          <label class="flex gap-3 mb-3 cursor-pointer">
            <input
              type="radio"
              name="priceRange"
              value="0-500000"
              onchange="applyClientFilters()"
            >

            Dưới 500.000 ₫
          </label>


          <label class="flex gap-3 mb-3 cursor-pointer">
            <input
              type="radio"
              name="priceRange"
              value="500000-1000000"
              onchange="applyClientFilters()"
            >

            500.000 - 1 triệu
          </label>


          <label class="flex gap-3 mb-3 cursor-pointer">
            <input
              type="radio"
              name="priceRange"
              value="1000000-3000000"
              onchange="applyClientFilters()"
            >

            1 - 3 triệu
          </label>


          <label class="flex gap-3 mb-3 cursor-pointer">
            <input
              type="radio"
              name="priceRange"
              value="3000000-5000000"
              onchange="applyClientFilters()"
            >

            3 - 5 triệu
          </label>


          <label class="flex gap-3 cursor-pointer">
            <input
              type="radio"
              name="priceRange"
              value="5000000-999999999999"
              onchange="applyClientFilters()"
            >

            Trên 5 triệu
          </label>

        </div>


        <!-- CUSTOM PRICE -->

        <div class="pt-5">

          <div
            class="
              text-xs
              tracking-[2px]
              font-bold
              mb-4
            "
          >
            GIÁ TÙY CHỌN
          </div>

          <input
            id="minPrice"
            type="number"
            placeholder="Giá từ"
            class="
              w-full
              border
              p-3
              mb-2
              outline-none
            "
          >

          <input
            id="maxPrice"
            type="number"
            placeholder="Giá đến"
            class="
              w-full
              border
              p-3
              mb-3
              outline-none
            "
          >

          <button
            onclick="applyClientFilters()"
            class="
              w-full
              py-3
              font-bold
              text-sm
            "
            style="
              background:#3b2416;
              color:#e8d5a3;
            "
          >
            ÁP DỤNG
          </button>

        </div>

      </div>

    </aside>
  `;
}


// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts(products, filters) {
  const title = pageTitle(filters);

  app.innerHTML = `
    <section
      class="
        max-w-7xl
        mx-auto
        px-4
        py-12
      "
    >

      <div class="text-center mb-10">

        <div
          class="
            text-[10px]
            tracking-[5px]
            mb-3
          "
          style="color:#70452d"
        >
          SHOPLUX MAISON
        </div>

        <h1
          class="
            luxury-font
            text-3xl
            md:text-4xl
          "
        >
          ${escapeHTML(title)}
        </h1>

        <div
          class="
            mx-auto
            mt-4
            w-14
            h-px
          "
          style="background:#c9a227"
        ></div>

      </div>


      <div
        class="
          flex
          flex-col
          lg:flex-row
          gap-7
        "
      >

        ${filterSidebar()}


        <div class="flex-1 min-w-0">

          <!-- TOOLBAR -->

          <div
            class="
              bg-[#fffdf8]
              border
              px-4
              py-3
              mb-5
              flex
              flex-col
              sm:flex-row
              gap-3
              justify-between
              items-center
            "
            style="border-color:#e8d5a3"
          >

            <div
              id="resultCount"
              class="
                text-sm
                text-gray-500
              "
            >
              ${products.length} sản phẩm
            </div>


            <div
              class="
                flex
                items-center
                gap-3
              "
            >

              <span
                class="
                  text-xs
                  hidden
                  sm:inline
                "
              >
                SẮP XẾP
              </span>


              <select
                id="sortSelect"
                onchange="applyClientFilters()"
                class="
                  border
                  bg-white
                  px-4
                  py-2
                  outline-none
                "
                style="border-color:#e8d5a3"
              >

                <option value="default">
                  Mặc định
                </option>

                <option value="price-asc">
                  Giá: Thấp → Cao
                </option>

                <option value="price-desc">
                  Giá: Cao → Thấp
                </option>

                <option value="sold-desc">
                  Bán chạy nhất
                </option>

                <option value="rating-desc">
                  Đánh giá cao nhất
                </option>

                <option value="newest">
                  Mới nhất
                </option>

              </select>

            </div>

          </div>


          <div
            id="productsGrid"
            class="
              grid
              grid-cols-2
              md:grid-cols-3
              xl:grid-cols-4
              gap-5
            "
          >
            ${renderCards(products)}
          </div>

        </div>

      </div>

    </section>
  `;
}


// ======================================================
// CLIENT FILTER
// ======================================================

function applyClientFilters() {
  let products = [...currentProducts];


  // -------------------------
  // GENDER
  // -------------------------

  const gender =
    document.querySelector(
      'input[name="filterGender"]:checked'
    )?.value || "";

  if (gender) {
    products = products.filter(
      product =>
        product.gender === gender
    );
  }


  // -------------------------
  // BRAND
  // -------------------------

  const selectedBrands = [
    ...document.querySelectorAll(
      ".brand-filter:checked"
    )
  ].map(input =>
    normalizeText(input.value)
  );

  if (selectedBrands.length) {
    products = products.filter(
      product =>
        selectedBrands.includes(
          normalizeText(product.brand)
        )
    );
  }


  // -------------------------
  // PRICE RANGE
  // -------------------------

  const priceRange =
    document.querySelector(
      'input[name="priceRange"]:checked'
    )?.value || "";

  if (priceRange) {
    const [min, max] =
      priceRange
        .split("-")
        .map(Number);

    products = products.filter(
      product => {
        const price =
          Number(product.price || 0);

        return (
          price >= min &&
          price <= max
        );
      }
    );
  }


  // -------------------------
  // CUSTOM PRICE
  // -------------------------

  const minPrice =
    Number(
      document.getElementById("minPrice")?.value
    ) || 0;

  const maxPrice =
    Number(
      document.getElementById("maxPrice")?.value
    ) || Infinity;

  if (minPrice > 0) {
    products = products.filter(
      product =>
        Number(product.price) >= minPrice
    );
  }

  if (maxPrice !== Infinity) {
    products = products.filter(
      product =>
        Number(product.price) <= maxPrice
    );
  }


  // -------------------------
  // SORT
  // -------------------------

  const sort =
    document.getElementById(
      "sortSelect"
    )?.value || "default";


  if (sort === "price-asc") {
    products.sort(
      (a, b) =>
        Number(a.price) -
        Number(b.price)
    );
  }


  if (sort === "price-desc") {
    products.sort(
      (a, b) =>
        Number(b.price) -
        Number(a.price)
    );
  }


  if (sort === "sold-desc") {
    products.sort(
      (a, b) =>
        Number(b.sold || 0) -
        Number(a.sold || 0)
    );
  }


  if (sort === "rating-desc") {
    products.sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    );
  }


  if (sort === "newest") {
    products.sort(
      (a, b) =>
        Number(b.id || 0) -
        Number(a.id || 0)
    );
  }


  // -------------------------
  // RENDER
  // -------------------------

  const grid =
    document.getElementById(
      "productsGrid"
    );

  if (grid) {
    grid.innerHTML =
      renderCards(products);
  }


  const count =
    document.getElementById(
      "resultCount"
    );

  if (count) {
    count.textContent =
      `${products.length} sản phẩm`;
  }
}


// ======================================================
// RESET FILTER
// ======================================================

function resetFilters() {
  const genderAll =
    document.querySelector(
      'input[name="filterGender"][value=""]'
    );

  if (genderAll) {
    genderAll.checked = true;
  }


  const priceAll =
    document.querySelector(
      'input[name="priceRange"][value=""]'
    );

  if (priceAll) {
    priceAll.checked = true;
  }


  document
    .querySelectorAll(
      ".brand-filter"
    )
    .forEach(input => {
      input.checked = false;
    });


  const minPrice =
    document.getElementById(
      "minPrice"
    );

  const maxPrice =
    document.getElementById(
      "maxPrice"
    );

  const sort =
    document.getElementById(
      "sortSelect"
    );


  if (minPrice) {
    minPrice.value = "";
  }

  if (maxPrice) {
    maxPrice.value = "";
  }

  if (sort) {
    sort.value = "default";
  }


  applyClientFilters();
}


// ======================================================
// RENDER CARDS
// ======================================================

function renderCards(products) {
  if (!products.length) {
    return `
      <div
        class="
          col-span-full
          bg-[#fffdf8]
          border
          text-center
          py-20
        "
        style="border-color:#e8d5a3"
      >

        <div
          class="
            luxury-font
            text-2xl
          "
        >
          Không tìm thấy sản phẩm
        </div>

        <p
          class="
            text-gray-400
            mt-3
          "
        >
          Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
        </p>

        <button
          onclick="resetFilters()"
          class="
            mt-6
            px-7
            py-3
            font-bold
          "
          style="
            background:#3b2416;
            color:#e8d5a3;
          "
        >
          XÓA BỘ LỌC
        </button>

      </div>
    `;
  }

  return products
    .map(productCard)
    .join("");
}


// ======================================================
// PRODUCT CARD
// ======================================================

function productCard(product) {
  const image =
    productImages(product)[0];

  const discount =
    Number(product.originalPrice) >
    Number(product.price)
      ? Math.round(
          (
            1 -
            Number(product.price) /
              Number(product.originalPrice)
          ) * 100
        )
      : 0;

  const gender =
    product.gender === "nam"
      ? "NAM"
      : product.gender === "nu"
        ? "NỮ"
        : "";

  return `
    <article
      class="
        bg-[#fffdf8]
        border
        group
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
      style="border-color:#e8d5a3"
    >

      <a
        href="/?id=${product.id}"
        class="
          block
          relative
          aspect-[4/5]
          overflow-hidden
          bg-[#efe4d2]
        "
      >
          <button
            type="button"
  data-favorite-id="${product.id}"
  data-favorite-type="card"
  onclick="toggleFavorite(${product.id}, event)"
  class="
    absolute
    top-3
    left-3
    z-20
    w-10
    h-10
    rounded-full
    bg-white
    shadow
    text-2xl
    flex
    items-center
    justify-center
  "
  style="color:#3b2416"
>
  ${isFavorite(product.id) ? "♥" : "♡"}

</button>
        <img
          src="${image}"
          alt="${escapeHTML(product.name)}"
          class="
            w-full
            h-full
            object-cover
            transition
            duration-500
            group-hover:scale-105
          "
        >


        ${
          discount
            ? `
              <span
                class="
                  absolute
                  top-3
                  right-3
                  px-2
                  py-1
                  text-[10px]
                  font-bold
                "
                style="
                  background:#3b2416;
                  color:#e8d5a3;
                "
              >
                -${discount}%
              </span>
            `
            : ""
        }


        ${
          gender
            ? `
              <span
                class="
                  absolute
                  bottom-3
                  left-3
                  bg-[#fffdf8]/90
                  px-2
                  py-1
                  text-[9px]
                  tracking-[2px]
                  font-bold
                "
              >
                ${gender}
              </span>
            `
            : ""
        }

      </a>


      <div class="p-4">

        <a
          href="/?brand=${encodeURIComponent(product.brand || "")}"
          class="
            text-[10px]
            tracking-[2px]
            font-bold
          "
          style="color:#70452d"
        >
          ${escapeHTML(product.brand || "SHOPLUX")}
        </a>


        <a
          href="/?id=${product.id}"
          class="
            luxury-font
            block
            mt-2
            text-base
            min-h-[48px]
            hover:text-[#70452d]
          "
        >
          ${escapeHTML(product.name)}
        </a>


        <div
          class="
            text-[10px]
            text-gray-400
            mt-1
          "
        >
          ${
            escapeHTML(
              SUBCATEGORY_NAMES[
                product.subcategory
              ] || ""
            )
          }
        </div>


        <div class="mt-3">

          <span
            class="font-bold"
            style="color:#3b2416"
          >
            ${money(product.price)}
          </span>


          ${
            Number(product.originalPrice) >
            Number(product.price)
              ? `
                <div
                  class="
                    text-xs
                    text-gray-400
                    line-through
                    mt-1
                  "
                >
                  ${money(product.originalPrice)}
                </div>
              `
              : ""
          }

        </div>


        <div
          class="
            flex
            justify-between
            text-[11px]
            text-gray-400
            mt-3
          "
        >

          <span>
            ★ ${product.rating || 5}
          </span>

          <span>
            Đã bán ${product.sold || 0}
          </span>

        </div>

      </div>

    </article>
  `;
}


// ======================================================
// DETAIL
// ======================================================

let selectedSize = "";
let selectedQuantity = 1;

function renderDetail(id) {
  const product = allProducts.find(
    p => Number(p.id) === Number(id)
  );
if (!product) {
    app.innerHTML = `
      <div class="text-center py-20">
        Không tìm thấy sản phẩm.
      </div>
    `;
    return;
  }
  currentDetailProduct = product;

  selectedSize = "";
  selectedQuantity = 1;

  const images = productImages(product);

  window.detailImages = images;

  const colorVariants =
  product.variantGroup
    ? allProducts.filter(
        item =>
          item.variantGroup &&
          item.variantGroup ===
            product.variantGroup
      )
    : [];

  app.innerHTML = `
    <section
      class="
        max-w-7xl
        mx-auto
        px-4
        py-12
      "
    >

      <a
        href="javascript:history.back()"
        class="
          text-sm
          hover:text-[#c9a227]
        "
      >
        ← TRỞ VỀ
      </a>


      <div
        class="
          grid
          md:grid-cols-2
          gap-12
          mt-6
          bg-[#fffdf8]
          p-6
          md:p-10
          border
        "
        style="border-color:#e8d5a3"
      >

        <!-- IMAGE -->

        <div>

          <div
  class="
    relative
    aspect-square
    bg-[#efe4d2]
    overflow-hidden
    group
  "
>

  <img
    id="mainProductImage"
    src="${images[0]}"
    class="
      w-full
      h-full
      object-contain
    "
  >

  ${
    images.length > 1
      ? `
        <button
  type="button"
  onclick="previousProductImage()"
  class="
    absolute
    left-4
    top-1/2
    -translate-y-1/2
    w-11
    h-11
    flex
    items-center
    justify-center
    bg-white/90
    border
    text-2xl
    shadow

    opacity-100
    md:opacity-0
    md:group-hover:opacity-100
    transition-opacity
    duration-300

    hover:bg-[#3b2416]
    hover:text-white
    z-10
  "
  style="border-color:#e8d5a3"
>
  ‹
</button>

        <button
  type="button"
  onclick="nextProductImage()"
  class="
    absolute
    right-4
    top-1/2
    -translate-y-1/2
    w-11
    h-11
    flex
    items-center
    justify-center
    bg-white/90
    border
    text-2xl
    shadow

    opacity-100
    md:opacity-0
    md:group-hover:opacity-100
    transition-opacity
    duration-300

    hover:bg-[#3b2416]
    hover:text-white
    z-10
  "
  style="border-color:#e8d5a3"
>
  ›
</button>
      `
      : ""
  }

</div>

${
  images.length > 1
    ? `
      <div
        id="productThumbArea"
        class="relative mt-4 group"
      >

        <button
          id="productThumbPrev"
          type="button"
          onclick="scrollProductThumbs(-1)"
          class="
            product-thumb-nav
            product-thumb-prev
            absolute
            left-1
            top-1/2
            -translate-y-1/2
            z-20
            w-10
            h-10
            bg-white/95
            border
            shadow-md
            text-xl
            items-center
            justify-center
            transition
          "
          style="display:none;"
          aria-label="Ảnh trước"
        >
          ‹
        </button>

        <div
          id="productThumbStrip"
          class="
            flex
            flex-nowrap
            gap-3
            overflow-x-auto
            scroll-smooth
          "
          style="
            scrollbar-width:none;
            -ms-overflow-style:none;
          "
        >

          ${images.map(
            (image, index) => `
              <button
                type="button"
                onclick="changeImage(${index})"
                class="
                  shrink-0
                  w-24
                  h-24
                  border
                  overflow-hidden
                "
                style="border-color:#e8d5a3"
              >
                <img
                  src="${escapeHTML(image)}"
                  class="
                    w-full
                    h-full
                    object-cover
                  "
                  alt=""
                >
              </button>
            `
          ).join("")}

        </div>

        <button
          id="productThumbNext"
          type="button"
          onclick="scrollProductThumbs(1)"
          class="
            product-thumb-nav
            product-thumb-next
            absolute
            right-1
            top-1/2
            -translate-y-1/2
            z-20
            w-10
            h-10
            bg-white/95
            border
            shadow-md
            text-xl
            items-center
            justify-center
            transition
          "
          style="display:none;"
          aria-label="Ảnh tiếp theo"
        >
          ›
        </button>

      </div>
    `
    : ""
}

        </div>

        <!-- INFO -->

        <div>

          <a
            href="/?brand=${encodeURIComponent(product.brand || "")}"
            class="
              text-xs
              tracking-[4px]
              font-bold
            "
            style="color:#70452d"
          >
            ${escapeHTML(product.brand || "SHOPLUX")}
          </a>


          <h1
            class="
              luxury-font
              text-3xl
              md:text-4xl
              mt-4
              leading-tight
            "
          >
            ${escapeHTML(product.name)}
          </h1>


          <div
            class="
              flex
              gap-4
              mt-5
              text-sm
              text-gray-500
            "
          >
            <span>
              ★ ${product.rating || 5}
            </span>

            <span>
              Đã bán ${product.sold || 0}
            </span>
          </div>


          <!-- PRICE -->

          <div
            class="
              mt-7
              py-6
              border-y
            "
            style="border-color:#e8d5a3"
          >

            <span
              class="
                text-3xl
                font-bold
              "
              style="color:#3b2416"
            >
              ${money(product.price)}
            </span>


            ${
              Number(product.originalPrice) >
              Number(product.price)
                ? `
                  <span
                    class="
                      text-gray-400
                      line-through
                      ml-3
                    "
                  >
                    ${money(product.originalPrice)}
                  </span>
                `
                : ""
            }

          </div>

          <!-- COLOR VARIANTS -->

${
  colorVariants.length > 0 &&
  product.colorName
    ? `
      <div class="mt-7">

        <div
          class="
            flex
            items-center
            justify-between
            mb-4
          "
        >
          <div
            class="
              text-xs
              tracking-[3px]
              font-bold
            "
          >
            MÀU
          </div>

          <div class="text-sm font-medium">
            ${escapeHTML(product.colorName)}
          </div>
        </div>


        <div
          class="
            flex
            gap-3
            overflow-x-auto
            pb-2
          "
          style="scrollbar-width:none;"
        >

          ${colorVariants.map(
            variant => `
              <button
                type="button"
                onclick="openColorVariant(${variant.id})"
                class="
                  shrink-0
                  w-20
                  h-24
                  p-1
                  border-2
                  bg-white
                  transition
                "
                style="
                  border-color:${
                    Number(variant.id) ===
                    Number(product.id)
                      ? "#111111"
                      : "#e5e5e5"
                  };
                "
                title="${escapeHTML(
                  variant.colorName || ""
                )}"
              >

                <img
                  src="${escapeHTML(
                    productImages(variant)[0]
                  )}"
                  alt="${escapeHTML(
                    variant.colorName || variant.name
                  )}"
                  class="
                    w-full
                    h-full
                    object-cover
                  "
                >

              </button>
            `
          ).join("")}

        </div>

      </div>
    `
    : ""
}

          <!-- SIZE -->

          ${
            product.sizes?.length
              ? `
                <div class="mt-7">

                  <div
                    class="
                      text-xs
                      tracking-[3px]
                      font-bold
                    "
                  >
                    CHỌN KÍCH THƯỚC
                  </div>


                  <div
                    class="
                      flex
                      flex-wrap
                      gap-2
                      mt-4
                    "
                  >

                    ${product.sizes.map(
                      size => `
                        <button
                          onclick="selectSize(this, '${size}')"
                          class="
                            size-btn
                            min-w-12
                            border
                            px-4
                            py-3
                          "
                          style="border-color:#c9a227"
                        >
                          ${escapeHTML(size)}
                        </button>
                      `
                    ).join("")}

                  </div>

                </div>
              `
              : ""
          }


          <!-- QUANTITY -->

          <div class="mt-7">

            <div
              class="
                text-xs
                tracking-[3px]
                font-bold
              "
            >
              SỐ LƯỢNG
            </div>


            <div
              class="
                flex
                items-center
                mt-4
                w-fit
                border
              "
              style="border-color:#c9a227"
            >

              <button
                onclick="changeQuantity(-1)"
                class="
                  w-12
                  h-12
                  text-xl
                  font-bold
                  hover:bg-[#efe4d2]
                "
              >
                −
              </button>


              <div
                id="productQuantity"
                class="
                  w-14
                  text-center
                  font-bold
                "
              >
                1
              </div>


              <button
                onclick="changeQuantity(1)"
                class="
                  w-12
                  h-12
                  text-xl
                  font-bold
                  hover:bg-[#efe4d2]
                "
              >
                +
              </button>

            </div>

          </div>


          <!-- DESCRIPTION -->

          <button
  type="button"
  data-favorite-id="${product.id}"
  data-favorite-type="detail"
  onclick="toggleFavorite(${product.id}, event)"
  class="
    w-full
    mt-8
    py-4
    border
    font-bold
    tracking-[2px]
    transition
    hover:bg-[#efe4d2]
  "
  style="
    border-color:#c9a227;
    color:#3b2416;
  "
>
  ${isFavorite(product.id)
    ? "♥ ĐÃ YÊU THÍCH"
    : "♡ THÊM VÀO YÊU THÍCH"}
</button>

          <!-- ACTION -->

          <div
            class="
              grid
              sm:grid-cols-2
              gap-3
              mt-9
            "
          >

            <button
              onclick="addToCart(${product.id})"
              class="
                w-full
                py-4
                border
                font-bold
                tracking-[2px]
              "
              style="
                border-color:#3b2416;
                color:#3b2416;
              "
            >
              THÊM VÀO GIỎ
            </button>


            <button
              onclick="buyNow(${product.id})"
              class="
                w-full
                py-4
                font-bold
                tracking-[2px]
              "
              style="
                background:#3b2416;
                color:#e8d5a3;
              "
            >
              MUA NGAY
            </button>

          </div>

        </div>

      </div>

<div class="mt-8 border-t border-[#d8c5a5]">

  <button
    type="button"
    onclick="openProductInfo('description')"
    class="w-full flex items-center justify-between py-5 border-b border-[#d8c5a5] text-left"
  >
    <span class="font-bold tracking-[2px]">
      MÔ TẢ SẢN PHẨM
    </span>
    <span class="text-2xl">›</span>
  </button>

  <button
    type="button"
    onclick="openProductInfo('care')"
    class="w-full flex items-center justify-between py-5 border-b border-[#d8c5a5] text-left"
  >
    <span class="font-bold tracking-[2px]">
      CÁCH GIẶT & BẢO QUẢN
    </span>
    <span class="text-2xl">›</span>
  </button>

  <button
    type="button"
    onclick="openProductInfo('shipping')"
    class="w-full flex items-center justify-between py-5 border-b border-[#d8c5a5] text-left"
  >
    <span class="font-bold tracking-[2px]">
      CHÍNH SÁCH GIAO HÀNG & ĐỔI TRẢ
    </span>
    <span class="text-2xl">›</span>
  </button>

  <button
    type="button"
    onclick="openProductInfo('gift')"
    class="w-full flex items-center justify-between py-5 border-b border-[#d8c5a5] text-left"
  >
    <span class="font-bold tracking-[2px]">
      NGHỆ THUẬT TẶNG QUÀ
    </span>
    <span class="text-2xl">›</span>
  </button>


<!-- PRODUCT INFO SLIDE PANEL -->

<div
  id="productInfoOverlay"
  onclick="closeProductInfo(event)"
  class="
    fixed inset-0
    bg-black/60
    z-[9999]
    hidden
  "
>
  <div
    id="productInfoPanel"
    onclick="event.stopPropagation()"
    class="
      absolute
      right-0 top-0
      h-full
      w-full
      md:w-[55%]
      lg:w-[48%]
      bg-[#fffdf8]
      shadow-2xl
      overflow-y-auto
      translate-x-full
      transition-transform
      duration-500
      ease-in-out
    "
  >

    <div class="p-8 md:p-12 lg:p-16">

      <div
        class="
          flex
          items-center
          justify-between
          gap-6
          mb-10
        "
      >

        <h2
          id="productInfoTitle"
          class="
            luxury-font
            text-2xl
            md:text-3xl
          "
        ></h2>

        <button
          type="button"
          onclick="closeProductInfo()"
          class="
            text-4xl
            font-light
            hover:opacity-50
          "
        >
          ×
        </button>

      </div>

      <div
        id="productInfoContent"
        class="
          text-gray-600
          leading-8
        "
      ></div>

    </div>

  </div>

</div>  

</div>
    </section>
  `;

  requestAnimationFrame(() => {
    updateProductThumbNav();
  });
}

function openColorVariant(id) {
  window.location.href =
    `/?id=${id}`;
}

let currentDetailProduct = null;

function openProductInfo(type) {
  const product = currentDetailProduct;

  if (!product) return;

  const overlay =
    document.getElementById("productInfoOverlay");

  const panel =
    document.getElementById("productInfoPanel");

  const title =
    document.getElementById("productInfoTitle");

  const content =
    document.getElementById("productInfoContent");

  const data = {

    description: {
      title: "Mô tả sản phẩm",
      content: `
        <div class="space-y-5">
          <p>
            ${product.desc || "Chưa có mô tả sản phẩm."}
          </p>

          ${
            product.sizes?.length
              ? `
                <div class="pt-5">
                  <div class="font-bold text-[#3b2416] mb-2">
                    Kích thước
                  </div>

                  <p>
                    ${product.sizes.join(" · ")}
                  </p>
                </div>
              `
              : ""
          }
        </div>
      `
    },

    care: {
      title: "Cách giặt & bảo quản",
      content: `
        <div class="space-y-5">

          <p>
            Để sản phẩm luôn giữ được phom dáng, màu sắc
            và chất lượng tốt nhất, hãy chăm sóc sản phẩm
            đúng cách.
          </p>

          <div class="space-y-3">
            <p>• Giặt ở nhiệt độ tối đa 30°C.</p>
            <p>• Nên giặt cùng các sản phẩm có màu tương tự.</p>
            <p>• Không sử dụng chất tẩy mạnh.</p>
            <p>• Không ngâm sản phẩm trong thời gian dài.</p>
            <p>• Hạn chế sử dụng máy sấy ở nhiệt độ cao.</p>
            <p>• Phơi sản phẩm ở nơi thoáng mát, tránh ánh nắng trực tiếp.</p>
            <p>• Ủi ở nhiệt độ thấp và tránh ủi trực tiếp lên hình in.</p>
          </div>

        </div>
      `
    },

    shipping: {
      title: "Chính sách giao hàng & đổi trả",
      content: `
        <div class="space-y-8">

          <div>
            <h3 class="font-bold text-[#3b2416] mb-2">
              Thông tin giao hàng
            </h3>

            <p>
              ShopLux hỗ trợ giao hàng trên toàn quốc.
              Thời gian giao hàng có thể thay đổi tùy theo
              địa chỉ nhận hàng và đơn vị vận chuyển.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-[#3b2416] mb-2">
              Chính sách đổi hàng
            </h3>

            <p>
              Sản phẩm có thể được yêu cầu đổi khi còn
              nguyên trạng, chưa qua sử dụng và còn đầy đủ
              phụ kiện hoặc bao bì đi kèm.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-[#3b2416] mb-2">
              Kiểm tra sản phẩm
            </h3>

            <p>
              Khách hàng nên kiểm tra sản phẩm ngay sau khi
              nhận hàng và liên hệ ShopLux nếu phát hiện
              vấn đề với đơn hàng.
            </p>
          </div>

        </div>
      `
    },

    gift: {
      title: "Nghệ thuật tặng quà",
      content: `
        <div class="space-y-6">

          <p>
            Mỗi món quà đều mang một câu chuyện riêng.
            ShopLux chú trọng trải nghiệm từ sản phẩm đến
            cách món quà được trao đến người nhận.
          </p>

          <p>
            Sản phẩm có thể được đóng gói cẩn thận,
            phù hợp để dành tặng cho bạn bè, người thân
            hoặc những dịp đặc biệt.
          </p>

          <div class="pt-5 border-t border-[#e8d5a3]">

            <h3 class="font-bold text-[#3b2416] mb-4">
              Hỗ trợ khách hàng
            </h3>

            <p>
              Nếu bạn cần hỗ trợ về đóng gói hoặc đơn hàng,
              vui lòng liên hệ ShopLux để được tư vấn.
            </p>

          </div>

        </div>
      `
    }

  };

  const selected = data[type];

  if (!selected) return;

  title.textContent = selected.title;
  content.innerHTML = selected.content;

  overlay.classList.remove("hidden");

  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    panel.classList.remove("translate-x-full");
  });
}


function closeProductInfo(event) {
  if (
    event &&
    event.target.id !== "productInfoOverlay"
  ) {
    return;
  }

  const overlay =
    document.getElementById("productInfoOverlay");

  const panel =
    document.getElementById("productInfoPanel");

  if (!overlay || !panel) return;

  panel.classList.add("translate-x-full");

  document.body.style.overflow = "";

  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 500);
}


window.openProductInfo = openProductInfo;
window.closeProductInfo = closeProductInfo;


// ======================================================
// DETAIL IMAGE
// ======================================================

function changeImage(index) {
  showDetailImage(index);
}

let currentDetailImageIndex = 0;

function showDetailImage(index) {
  const images = window.detailImages || [];

  if (!images.length) return;

  if (index < 0) {
    index = images.length - 1;
  }

  if (index >= images.length) {
    index = 0;
  }

  currentDetailImageIndex = index;

  const mainImage =
    document.getElementById("mainProductImage");

  if (mainImage) {
    mainImage.src = images[index];
  }
}

function previousProductImage() {
  showDetailImage(
    currentDetailImageIndex - 1
  );
}

function nextProductImage() {
  showDetailImage(
    currentDetailImageIndex + 1
  );
}

function scrollProductThumbs(direction) {
  const strip =
    document.getElementById("productThumbStrip");

  if (!strip) return;

  strip.scrollBy({
    left:
      direction *
      Math.max(
        strip.clientWidth * 0.8,
        300
      ),
    behavior: "smooth"
  });
}

function updateProductThumbNav() {
  const area =
    document.getElementById("productThumbArea");

  const strip =
    document.getElementById("productThumbStrip");

  const prev =
    document.getElementById("productThumbPrev");

  const next =
    document.getElementById("productThumbNext");

  if (!area || !strip || !prev || !next) {
    return;
  }

  const hasOverflow =
    strip.scrollWidth > strip.clientWidth + 2;

  if (!hasOverflow) {
    prev.style.display = "none";
    next.style.display = "none";
    area.classList.remove("has-thumb-overflow");
    return;
  }

  area.classList.add("has-thumb-overflow");

  prev.style.display = "";
  next.style.display = "";
}

// ======================================================
// SIZE
// ======================================================

function selectSize(button, size) {
  selectedSize = size;

  document
    .querySelectorAll(".size-btn")
    .forEach(btn => {
      btn.style.background =
        "transparent";

      btn.style.color =
        "#1f120c";
    });

  button.style.background =
    "#3b2416";

  button.style.color =
    "#e8d5a3";
}




// ======================================================
// QUANTITY
// ======================================================

function changeQuantity(change) {
  selectedQuantity += change;

  if (selectedQuantity < 1) {
    selectedQuantity = 1;
  }

  if (selectedQuantity > 99) {
    selectedQuantity = 99;
  }

  const element =
    document.getElementById(
      "productQuantity"
    );

  if (element) {
    element.textContent =
      selectedQuantity;
  }
}


// ======================================================
// CART
// ======================================================

function saveCart() {
  const key =
    getCartStorageKey();

  if (!key) {
    cart = [];
    updateCartCount();
    return;
  }

  localStorage.setItem(
    key,
    JSON.stringify(cart)
  );

  updateCartCount();
}

function addToCart(id) {
   const token =
    localStorage.getItem("shoplux_token");

  const user =
    getCurrentUser();

  if (!token || !user?.id) {
    alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
    location.href = "/login.html";
    return;
  }

  // Đồng bộ lại đúng giỏ của tài khoản hiện tại
  cart = loadUserCart();
  
  const product =
    allProducts.find(
      p =>
        Number(p.id) ===
        Number(id)
    );

  if (!product) {
    return;
  }


  // Sản phẩm có size thì bắt buộc chọn size
  if (
    product.sizes?.length &&
    !selectedSize
  ) {
    alert("Vui lòng chọn size");
    return;
  }

  const productColor =
  String(product.colorName || "").trim();


  // Phân biệt sản phẩm theo size + màu
  const key =
    `${product.id}-${selectedSize}-${productColor}`;


  const existing =
    cart.find(
      item =>
        item.key === key
    );


  if (existing) {
    existing.qty +=
      selectedQuantity;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,

      image:
        productImages(product)[0],

      size: selectedSize,

      qty: selectedQuantity
    });
  }


  saveCart();


  alert(
    `Đã thêm ${selectedQuantity} sản phẩm vào giỏ hàng`
  );
}

 

// ======================================================
// BUY NOW
// ======================================================

function buyNow(id) {
  const product =
    allProducts.find(
      p =>
        Number(p.id) ===
        Number(id)
    );

  if (!product) {
    return;
  }


  if (
    product.sizes?.length &&
    !selectedSize
  ) {
    alert("Vui lòng chọn size");
    return;
  }

  const productColor =
  String(product.colorName || "").trim();


  const token =
    localStorage.getItem(
      "shoplux_token"
    );


  if (!token) {
    alert(
      "Vui lòng đăng nhập để mua hàng"
    );

    location.href =
      "/login.html";

    return;
  }


  const checkoutItem = {
    key:
      `${product.id}-${selectedSize}-${productColor}`,
    id:
      product.id,

    name:
      product.name,

    price:
      product.price,

    image:
      productImages(product)[0],

    size:
      selectedSize,
    color:
      productColor,
    qty:
      selectedQuantity
  };


  localStorage.setItem(
    "shoplux_checkout",
    JSON.stringify([
      checkoutItem
    ])
  );


  localStorage.setItem(
    "shoplux_checkout_source",
    "buyNow"
  );


  location.href =
    "/checkout.html";
}


// ======================================================
// CHECKOUT CART
// ======================================================

function checkoutCart() {

  const token =
    localStorage.getItem(
      "shoplux_token"
    );

  const user =
    getCurrentUser();


  if (!token || !user?.id) {

    alert(
      "Vui lòng đăng nhập để thanh toán"
    );

    location.href =
      "/login.html";

    return;
  }


  // Lấy đúng giỏ của tài khoản hiện tại
  cart = loadUserCart();


  if (!cart.length) {

    alert(
      "Giỏ hàng đang trống"
    );

    return;
  }


  // Chỉ lấy sản phẩm được tick
  const selectedItems =
    cart.filter(
      item =>
        item.selected === true
    );


  if (!selectedItems.length) {

    alert(
      "Vui lòng chọn ít nhất một sản phẩm để thanh toán"
    );

    return;
  }


  localStorage.setItem(
    "shoplux_checkout",
    JSON.stringify(
      selectedItems
    )
  );


  localStorage.setItem(
    "shoplux_checkout_source",
    "cart"
  );


  // Ghi nhớ chính xác các món đang checkout.
  // Sau khi đặt hàng thành công,
  // chỉ các món này mới bị xóa khỏi giỏ.
  localStorage.setItem(
    "shoplux_checkout_keys",
    JSON.stringify(
      selectedItems.map(
        item => item.key
      )
    )
  );


  location.href =
    "/checkout.html";
}


// ======================================================
// CART COUNT
// ======================================================

function updateCartCount() {
  const count =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.qty || 1),
      0
    );


  const element =
    document.getElementById(
      "cartCount"
    );


  if (element) {
    element.textContent =
      count;
  }
}


// ======================================================
// SEARCH
// ======================================================

function performSearch() {
  const input =
    document.getElementById(
      "searchInput"
    );

  const keyword =
    input?.value.trim();


  if (!keyword) {
    location.href = "/";
    return;
  }


  location.href =
    "/?search=" +
    encodeURIComponent(keyword);
}


// ======================================================
// START
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const input =
      document.getElementById(
        "searchInput"
      );


    input?.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {
          performSearch();
        }

      }
    );


    updateCartCount();
    loadProducts();

  }
);


// ======================================================
// GLOBAL
// ======================================================

window.performSearch =
  performSearch;

window.applyClientFilters =
  applyClientFilters;

window.resetFilters =
  resetFilters;

window.addToCart =
  addToCart;

window.changeImage =
  changeImage;

window.selectSize =
  selectSize;

window.changeQuantity =
  changeQuantity;

window.buyNow =
  buyNow;

window.checkoutCart =
  checkoutCart;

window.toggleFavorite =
  toggleFavorite;