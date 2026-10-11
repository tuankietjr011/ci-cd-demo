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


