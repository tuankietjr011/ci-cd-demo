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