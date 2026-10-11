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


