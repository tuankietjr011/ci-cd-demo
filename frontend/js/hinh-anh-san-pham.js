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

 

