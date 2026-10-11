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

function getFavoritesStorageKey() {
  const token = localStorage.getItem("shoplux_token");
  const user = getCurrentUser();

  if (!token || !user?.id) {
    return null;
  }

  return `shoplux_favorites_user_${user.id}`;
}

function loadUserFavorites() {
  const key = getFavoritesStorageKey();

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

let favorites = loadUserFavorites();

function saveFavorites() {
  const key = getFavoritesStorageKey();

  if (!key) {
    return;
  }

  localStorage.setItem(
    key,
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


