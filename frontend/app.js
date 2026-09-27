const API = "/api";

let allProducts = [];
let currentProducts = [];

let cart = JSON.parse(
  localStorage.getItem("shoplux_cart") || "[]"
);

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
    return product.images.filter(Boolean).slice(0, 4);
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

function renderDetail(id) {
  const product =
    allProducts.find(
      p =>
        Number(p.id) ===
        Number(id)
    );

  if (!product) {
    app.innerHTML = `
      <div class="text-center py-20">
        Không tìm thấy sản phẩm.
      </div>
    `;
    return;
  }

  selectedSize = "";

  const images =
    productImages(product);

  window.detailImages =
    images;


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

        <div>

          <div
            class="
              aspect-square
              bg-[#efe4d2]
              overflow-hidden
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

          </div>


          ${
            images.length > 1
              ? `
                <div
                  class="
                    grid
                    grid-cols-4
                    gap-3
                    mt-4
                  "
                >

                  ${images.map(
                    (image, index) => `
                      <button
                        onclick="changeImage(${index})"
                        class="
                          aspect-square
                          border
                          overflow-hidden
                        "
                        style="border-color:#e8d5a3"
                      >

                        <img
                          src="${image}"
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
              `
              : ""
          }

        </div>


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


          <div class="mt-8">

            <div
              class="
                text-xs
                tracking-[3px]
                font-bold
              "
            >
              MÔ TẢ SẢN PHẨM
            </div>

            <p
              class="
                mt-4
                text-gray-600
                leading-8
                whitespace-pre-line
              "
            >
              ${escapeHTML(product.desc || "")}
            </p>

          </div>


          <button
            onclick="addToCart(${product.id})"
            class="
              w-full
              py-4
              mt-9
              font-bold
              tracking-[2px]
            "
            style="
              background:#3b2416;
              color:#e8d5a3;
            "
          >
            THÊM VÀO GIỎ HÀNG
          </button>

        </div>

      </div>

    </section>
  `;
}


// ======================================================
// DETAIL IMAGE
// ======================================================

function changeImage(index) {
  const image =
    window.detailImages?.[index];

  const main =
    document.getElementById(
      "mainProductImage"
    );

  if (image && main) {
    main.src = image;
  }
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
// CART
// ======================================================

function addToCart(id) {
  const product =
    allProducts.find(
      p =>
        Number(p.id) ===
        Number(id)
    );

  if (!product) return;


  if (
    product.sizes?.length &&
    !selectedSize
  ) {
    alert("Vui lòng chọn size");
    return;
  }


  const key =
    `${product.id}-${selectedSize}`;


  const existing =
    cart.find(
      item =>
        item.key === key
    );


  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImages(product)[0],
      size: selectedSize,
      qty: 1
    });
  }


  localStorage.setItem(
    "shoplux_cart",
    JSON.stringify(cart)
  );


  updateCartCount();

  alert(
    "Đã thêm sản phẩm vào giỏ hàng"
  );
}


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