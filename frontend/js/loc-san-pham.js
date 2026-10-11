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


