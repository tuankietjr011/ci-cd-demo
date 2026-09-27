const API = "/api";

let allProducts = [];

let cart =
  JSON.parse(
    localStorage.getItem("shoplux_cart") || "[]"
  );

// =====================================================
// HELPERS
// =====================================================

function money(value) {
  return Number(value || 0)
    .toLocaleString("vi-VN") + " ₫";
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
  if (
    Array.isArray(product.images) &&
    product.images.length
  ) {
    return product.images
      .filter(Boolean)
      .slice(0, 4);
  }

  if (product.image) {
    return [product.image];
  }

  return [
    "https://placehold.co/700x900?text=ShopLux"
  ];
}

// =====================================================
// LOAD
// =====================================================

async function loadProducts() {
  try {
    const response =
      await fetch(API + "/products");

    const json =
      await response.json();

    allProducts =
      json.data || [];

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

// =====================================================
// ROUTER
// =====================================================

function router() {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const id =
    params.get("id");

  if (id) {
    renderDetail(id);
    return;
  }

  const type =
    params.get("type");

  const gender =
    params.get("gender");

  const subcategory =
    params.get("subcategory");

  const brand =
    params.get("brand");

  const search =
    params.get("search");

  let products =
    [...allProducts];

  if (type) {
    products =
      products.filter(
        p => p.type === type
      );
  }

  if (gender) {
    products =
      products.filter(
        p => p.gender === gender
      );
  }

  if (subcategory) {
    products =
      products.filter(
        p => p.subcategory === subcategory
      );
  }

  if (brand) {
    products =
      products.filter(
        p =>
          normalizeText(p.brand) ===
          normalizeText(brand)
      );
  }

  if (search) {
    const keyword =
      normalizeText(search);

    products =
      products.filter(product => {
        const text =
          normalizeText(
            [
              product.name,
              product.brand,
              product.desc,
              product.type,
              product.subcategory
            ].join(" ")
          );

        return text.includes(keyword);
      });
  }

  renderProducts(
    products,
    {
      type,
      gender,
      subcategory,
      brand,
      search
    }
  );
}

// =====================================================
// TITLE
// =====================================================

function pageTitle(filters) {
  if (filters.brand) {
    return filters.brand.toUpperCase();
  }

  if (filters.search) {
    return `KẾT QUẢ: "${filters.search}"`;
  }

  const typeNames = {
    ao: "ÁO",
    quan: "QUẦN",
    "giay-dep": "GIÀY DÉP",
    "phu-kien": "PHỤ KIỆN",
    "bong-da": "ĐỒ BÓNG ĐÁ"
  };

  const subNames = {
    "ao-thun": "ÁO THUN",
    "ao-polo": "ÁO POLO",
    "ao-so-mi": "ÁO SƠ MI",
    "ao-khoac": "ÁO KHOÁC",
    "ao-len": "ÁO LEN",
    "ao-croptop": "ÁO CROPTOP",
    "hoodie-sweater": "HOODIE / SWEATER",

    "quan-jeans": "QUẦN JEANS",
    "quan-kaki": "QUẦN KAKI",
    "quan-tay": "QUẦN TÂY",
    "quan-jogger": "QUẦN JOGGER",
    "quan-short": "QUẦN SHORT",
    "quan-ong-rong": "QUẦN ỐNG RỘNG",
    legging: "LEGGING",

    sneaker: "SNEAKER",
    "giay-the-thao": "GIÀY THỂ THAO",
    "giay-tay": "GIÀY TÂY",
    "cao-got": "GIÀY CAO GÓT",
    sandal: "SANDAL",
    dep: "DÉP",

    "tui-balo": "TÚI / BALO",
    mu: "MŨ",
    vi: "VÍ",
    "that-lung": "THẮT LƯNG",
    kinh: "KÍNH",
    "trang-suc": "TRANG SỨC",

    "ao-bong-da": "ÁO BÓNG ĐÁ",
    "giay-bong-da": "GIÀY BÓNG ĐÁ",
    "phu-kien-bong-da": "PHỤ KIỆN BÓNG ĐÁ"
  };

  if (filters.subcategory) {
    let title =
      subNames[filters.subcategory] ||
      filters.subcategory;

    if (filters.gender) {
      title +=
        filters.gender === "nam"
          ? " NAM"
          : " NỮ";
    }

    return title;
  }

  if (filters.type) {
    return typeNames[filters.type] || "COLLECTION";
  }

  return "NEW ARRIVALS";
}

// =====================================================
// PRODUCTS
// =====================================================

function renderProducts(
  products,
  filters
) {
  const title =
    pageTitle(filters);

  app.innerHTML = `
    <section
      class="
        max-w-7xl
        mx-auto
        px-4
        py-12
      "
    >

      <div
        class="
          text-center
          mb-10
        "
      >

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

        <p
          class="
            text-gray-500
            text-sm
            mt-4
          "
        >
          ${products.length} sản phẩm
        </p>

      </div>


      ${
        products.length
          ? `
            <div
              class="
                grid
                grid-cols-2
                md:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-5
                gap-5
              "
            >
              ${products
                .map(productCard)
                .join("")}
            </div>
          `
          : `
            <div
              class="
                bg-[#fffdf8]
                border
                text-center
                py-20
                text-gray-400
              "
            >
              Không tìm thấy sản phẩm phù hợp.
            </div>
          `
      }

    </section>
  `;
}

// =====================================================
// CARD
// =====================================================

function productCard(product) {
  const image =
    productImages(product)[0];

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          (
            1 -
            product.price /
              product.originalPrice
          ) * 100
        )
      : 0;

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

        <div class="mt-3">

          <span
            class="font-bold"
            style="color:#3b2416"
          >
            ${money(product.price)}
          </span>

          ${
            product.originalPrice > product.price
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

// =====================================================
// DETAIL
// =====================================================

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
        href="/"
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

        <!-- GALLERY -->

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

                  ${images
                    .map(
                      (image, index) => `
                        <button
                          onclick="changeImage(${index})"
                          class="
                            aspect-square
                            border
                            overflow-hidden
                            hover:border-[#c9a227]
                          "
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
                    )
                    .join("")}

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
              items-center
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
              product.originalPrice > product.price
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
            product.sizes &&
            product.sizes.length
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

                    ${product.sizes
                      .map(
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
                      )
                      .join("")}

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
              transition
              hover:opacity-90
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

// =====================================================
// IMAGE
// =====================================================

function changeImage(index) {
  const image =
    window.detailImages?.[index];

  const main =
    document.getElementById(
      "mainProductImage"
    );

  if (main && image) {
    main.src = image;
  }
}

// =====================================================
// SIZE
// =====================================================

let selectedSize = "";

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

// =====================================================
// CART
// =====================================================

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
      item => item.key === key
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

  alert("Đã thêm sản phẩm vào giỏ hàng");
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

// =====================================================
// SEARCH
// =====================================================

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

window.performSearch =
  performSearch;

window.addToCart =
  addToCart;

window.changeImage =
  changeImage;

window.selectSize =
  selectSize;