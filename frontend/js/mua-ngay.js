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


