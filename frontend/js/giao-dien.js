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


