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


