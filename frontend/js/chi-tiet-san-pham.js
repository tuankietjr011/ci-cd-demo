// ======================================================
// DETAIL
// ======================================================

let selectedSize = "";
let selectedQuantity = 1;

function renderDetail(id) {
  const product = allProducts.find(
    p => Number(p.id) === Number(id)
  );
if (!product) {
    app.innerHTML = `
      <div class="text-center py-20">
        Không tìm thấy sản phẩm.
      </div>
    `;
    return;
  }
  currentDetailProduct = product;

  selectedSize = "";
  selectedQuantity = 1;

  const images = productImages(product);

  window.detailImages = images;

  const colorVariants =
  product.variantGroup
    ? allProducts.filter(
        item =>
          item.variantGroup &&
          item.variantGroup ===
            product.variantGroup
      )
    : [];

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
        href="javascript:history.back()"
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

        <!-- IMAGE -->

        <div>

          <div
  class="
    relative
    aspect-square
    bg-[#efe4d2]
    overflow-hidden
    group
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

  ${
    images.length > 1
      ? `
        <button
  type="button"
  onclick="previousProductImage()"
  class="
    absolute
    left-4
    top-1/2
    -translate-y-1/2
    w-11
    h-11
    flex
    items-center
    justify-center
    bg-white/90
    border
    text-2xl
    shadow

    opacity-100
    md:opacity-0
    md:group-hover:opacity-100
    transition-opacity
    duration-300

    hover:bg-[#3b2416]
    hover:text-white
    z-10
  "
  style="border-color:#e8d5a3"
>
  ‹
</button>

        <button
  type="button"
  onclick="nextProductImage()"
  class="
    absolute
    right-4
    top-1/2
    -translate-y-1/2
    w-11
    h-11
    flex
    items-center
    justify-center
    bg-white/90
    border
    text-2xl
    shadow

    opacity-100
    md:opacity-0
    md:group-hover:opacity-100
    transition-opacity
    duration-300

    hover:bg-[#3b2416]
    hover:text-white
    z-10
  "
  style="border-color:#e8d5a3"
>
  ›
</button>
      `
      : ""
  }

</div>

${
  images.length > 1
    ? `
      <div
        id="productThumbArea"
        class="relative mt-4 group"
      >

        <button
          id="productThumbPrev"
          type="button"
          onclick="scrollProductThumbs(-1)"
          class="
            product-thumb-nav
            product-thumb-prev
            absolute
            left-1
            top-1/2
            -translate-y-1/2
            z-20
            w-10
            h-10
            bg-white/95
            border
            shadow-md
            text-xl
            items-center
            justify-center
            transition
          "
          style="display:none;"
          aria-label="Ảnh trước"
        >
          ‹
        </button>

        <div
          id="productThumbStrip"
          class="
            flex
            flex-nowrap
            gap-3
            overflow-x-auto
            scroll-smooth
          "
          style="
            scrollbar-width:none;
            -ms-overflow-style:none;
          "
        >

          ${images.map(
            (image, index) => `
              <button
                type="button"
                onclick="changeImage(${index})"
                class="
                  shrink-0
                  w-24
                  h-24
                  border
                  overflow-hidden
                "
                style="border-color:#e8d5a3"
              >
                <img
                  src="${escapeHTML(image)}"
                  class="
                    w-full
                    h-full
                    object-cover
                  "
                  alt=""
                >
              </button>
            `
          ).join("")}

        </div>

        <button
          id="productThumbNext"
          type="button"
          onclick="scrollProductThumbs(1)"
          class="
            product-thumb-nav
            product-thumb-next
            absolute
            right-1
            top-1/2
            -translate-y-1/2
            z-20
            w-10
            h-10
            bg-white/95
            border
            shadow-md
            text-xl
            items-center
            justify-center
            transition
          "
          style="display:none;"
          aria-label="Ảnh tiếp theo"
        >
          ›
        </button>

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


          <!-- PRICE -->

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
              Number(product.originalPrice) >
              Number(product.price)
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

          <!-- COLOR VARIANTS -->

${
  colorVariants.length > 0 &&
  product.colorName
    ? `
      <div class="mt-7">

        <div
          class="
            flex
            items-center
            justify-between
            mb-4
          "
        >
          <div
            class="
              text-xs
              tracking-[3px]
              font-bold
            "
          >
            MÀU
          </div>

          <div class="text-sm font-medium">
            ${escapeHTML(product.colorName)}
          </div>
        </div>


        <div
          class="
            flex
            gap-3
            overflow-x-auto
            pb-2
          "
          style="scrollbar-width:none;"
        >

          ${colorVariants.map(
            variant => `
              <button
                type="button"
                onclick="openColorVariant(${variant.id})"
                class="
                  shrink-0
                  w-20
                  h-24
                  p-1
                  border-2
                  bg-white
                  transition
                "
                style="
                  border-color:${
                    Number(variant.id) ===
                    Number(product.id)
                      ? "#111111"
                      : "#e5e5e5"
                  };
                "
                title="${escapeHTML(
                  variant.colorName || ""
                )}"
              >

                <img
                  src="${escapeHTML(
                    productImages(variant)[0]
                  )}"
                  alt="${escapeHTML(
                    variant.colorName || variant.name
                  )}"
                  class="
                    w-full
                    h-full
                    object-cover
                  "
                >

              </button>
            `
          ).join("")}

        </div>

      </div>
    `
    : ""
}

          <!-- SIZE -->

          ${
            product.sizes?.length
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

                    ${product.sizes.map(
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
                    ).join("")}

                  </div>

                </div>
              `
              : ""
          }


          <!-- QUANTITY -->

          <div class="mt-7">

            <div
              class="
                text-xs
                tracking-[3px]
                font-bold
              "
            >
              SỐ LƯỢNG
            </div>


            <div
              class="
                flex
                items-center
                mt-4
                w-fit
                border
              "
              style="border-color:#c9a227"
            >

              <button
                onclick="changeQuantity(-1)"
                class="
                  w-12
                  h-12
                  text-xl
                  font-bold
                  hover:bg-[#efe4d2]
                "
              >
                −
              </button>


              <div
                id="productQuantity"
                class="
                  w-14
                  text-center
                  font-bold
                "
              >
                1
              </div>


              <button
                onclick="changeQuantity(1)"
                class="
                  w-12
                  h-12
                  text-xl
                  font-bold
                  hover:bg-[#efe4d2]
                "
              >
                +
              </button>

            </div>

          </div>


          <!-- DESCRIPTION -->

          <button
  type="button"
  data-favorite-id="${product.id}"
  data-favorite-type="detail"
  onclick="toggleFavorite(${product.id}, event)"
  class="
    w-full
    mt-8
    py-4
    border
    font-bold
    tracking-[2px]
    transition
    hover:bg-[#efe4d2]
  "
  style="
    border-color:#c9a227;
    color:#3b2416;
  "
>
  ${isFavorite(product.id)
    ? "♥ ĐÃ YÊU THÍCH"
    : "♡ THÊM VÀO YÊU THÍCH"}
</button>

          <!-- ACTION -->

          <div
            class="
              grid
              sm:grid-cols-2
              gap-3
              mt-9
            "
          >

            <button
              onclick="addToCart(${product.id})"
              class="
                w-full
                py-4
                border
                font-bold
                tracking-[2px]
              "
              style="
                border-color:#3b2416;
                color:#3b2416;
              "
            >
              THÊM VÀO GIỎ
            </button>


            <button
              onclick="buyNow(${product.id})"
              class="
                w-full
                py-4
                font-bold
                tracking-[2px]
              "
              style="
                background:#3b2416;
                color:#e8d5a3;
              "
            >
              MUA NGAY
            </button>

          </div>

        </div>

      </div>

<div class="mt-8 border-t border-[#d8c5a5]">

  <button
    type="button"
    onclick="openProductInfo('description')"
    class="w-full flex items-center justify-between py-5 border-b border-[#d8c5a5] text-left"
  >
    <span class="font-bold tracking-[2px]">
      MÔ TẢ SẢN PHẨM
    </span>
    <span class="text-2xl">›</span>
  </button>

  <button
    type="button"
    onclick="openProductInfo('care')"
    class="w-full flex items-center justify-between py-5 border-b border-[#d8c5a5] text-left"
  >
    <span class="font-bold tracking-[2px]">
      CÁCH GIẶT & BẢO QUẢN
    </span>
    <span class="text-2xl">›</span>
  </button>

  <button
    type="button"
    onclick="openProductInfo('shipping')"
    class="w-full flex items-center justify-between py-5 border-b border-[#d8c5a5] text-left"
  >
    <span class="font-bold tracking-[2px]">
      CHÍNH SÁCH GIAO HÀNG & ĐỔI TRẢ
    </span>
    <span class="text-2xl">›</span>
  </button>

  <button
    type="button"
    onclick="openProductInfo('gift')"
    class="w-full flex items-center justify-between py-5 border-b border-[#d8c5a5] text-left"
  >
    <span class="font-bold tracking-[2px]">
      NGHỆ THUẬT TẶNG QUÀ
    </span>
    <span class="text-2xl">›</span>
  </button>


<!-- PRODUCT INFO SLIDE PANEL -->

<div
  id="productInfoOverlay"
  onclick="closeProductInfo(event)"
  class="
    fixed inset-0
    bg-black/60
    z-[9999]
    hidden
  "
>
  <div
    id="productInfoPanel"
    onclick="event.stopPropagation()"
    class="
      absolute
      right-0 top-0
      h-full
      w-full
      md:w-[55%]
      lg:w-[48%]
      bg-[#fffdf8]
      shadow-2xl
      overflow-y-auto
      translate-x-full
      transition-transform
      duration-500
      ease-in-out
    "
  >

    <div class="p-8 md:p-12 lg:p-16">

      <div
        class="
          flex
          items-center
          justify-between
          gap-6
          mb-10
        "
      >

        <h2
          id="productInfoTitle"
          class="
            luxury-font
            text-2xl
            md:text-3xl
          "
        ></h2>

        <button
          type="button"
          onclick="closeProductInfo()"
          class="
            text-4xl
            font-light
            hover:opacity-50
          "
        >
          ×
        </button>

      </div>

      <div
        id="productInfoContent"
        class="
          text-gray-600
          leading-8
        "
      ></div>

    </div>

  </div>

</div>  

</div>
    </section>
  `;

  requestAnimationFrame(() => {
    updateProductThumbNav();
  });
}

function openColorVariant(id) {
  window.location.href =
    `/?id=${id}`;
}

let currentDetailProduct = null;

function openProductInfo(type) {
  const product = currentDetailProduct;

  if (!product) return;

  const overlay =
    document.getElementById("productInfoOverlay");

  const panel =
    document.getElementById("productInfoPanel");

  const title =
    document.getElementById("productInfoTitle");

  const content =
    document.getElementById("productInfoContent");

  const data = {

    description: {
      title: "Mô tả sản phẩm",
      content: `
        <div class="space-y-5">
          <p>
            ${product.desc || "Chưa có mô tả sản phẩm."}
          </p>

          ${
            product.sizes?.length
              ? `
                <div class="pt-5">
                  <div class="font-bold text-[#3b2416] mb-2">
                    Kích thước
                  </div>

                  <p>
                    ${product.sizes.join(" · ")}
                  </p>
                </div>
              `
              : ""
          }
        </div>
      `
    },

    care: {
      title: "Cách giặt & bảo quản",
      content: `
        <div class="space-y-5">

          <p>
            Để sản phẩm luôn giữ được phom dáng, màu sắc
            và chất lượng tốt nhất, hãy chăm sóc sản phẩm
            đúng cách.
          </p>

          <div class="space-y-3">
            <p>• Giặt ở nhiệt độ tối đa 30°C.</p>
            <p>• Nên giặt cùng các sản phẩm có màu tương tự.</p>
            <p>• Không sử dụng chất tẩy mạnh.</p>
            <p>• Không ngâm sản phẩm trong thời gian dài.</p>
            <p>• Hạn chế sử dụng máy sấy ở nhiệt độ cao.</p>
            <p>• Phơi sản phẩm ở nơi thoáng mát, tránh ánh nắng trực tiếp.</p>
            <p>• Ủi ở nhiệt độ thấp và tránh ủi trực tiếp lên hình in.</p>
          </div>

        </div>
      `
    },

    shipping: {
      title: "Chính sách giao hàng & đổi trả",
      content: `
        <div class="space-y-8">

          <div>
            <h3 class="font-bold text-[#3b2416] mb-2">
              Thông tin giao hàng
            </h3>

            <p>
              ShopLux hỗ trợ giao hàng trên toàn quốc.
              Thời gian giao hàng có thể thay đổi tùy theo
              địa chỉ nhận hàng và đơn vị vận chuyển.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-[#3b2416] mb-2">
              Chính sách đổi hàng
            </h3>

            <p>
              Sản phẩm có thể được yêu cầu đổi khi còn
              nguyên trạng, chưa qua sử dụng và còn đầy đủ
              phụ kiện hoặc bao bì đi kèm.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-[#3b2416] mb-2">
              Kiểm tra sản phẩm
            </h3>

            <p>
              Khách hàng nên kiểm tra sản phẩm ngay sau khi
              nhận hàng và liên hệ ShopLux nếu phát hiện
              vấn đề với đơn hàng.
            </p>
          </div>

        </div>
      `
    },

    gift: {
      title: "Nghệ thuật tặng quà",
      content: `
        <div class="space-y-6">

          <p>
            Mỗi món quà đều mang một câu chuyện riêng.
            ShopLux chú trọng trải nghiệm từ sản phẩm đến
            cách món quà được trao đến người nhận.
          </p>

          <p>
            Sản phẩm có thể được đóng gói cẩn thận,
            phù hợp để dành tặng cho bạn bè, người thân
            hoặc những dịp đặc biệt.
          </p>

          <div class="pt-5 border-t border-[#e8d5a3]">

            <h3 class="font-bold text-[#3b2416] mb-4">
              Hỗ trợ khách hàng
            </h3>

            <p>
              Nếu bạn cần hỗ trợ về đóng gói hoặc đơn hàng,
              vui lòng liên hệ ShopLux để được tư vấn.
            </p>

          </div>

        </div>
      `
    }

  };

  const selected = data[type];

  if (!selected) return;

  title.textContent = selected.title;
  content.innerHTML = selected.content;

  overlay.classList.remove("hidden");

  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    panel.classList.remove("translate-x-full");
  });
}


function closeProductInfo(event) {
  if (
    event &&
    event.target.id !== "productInfoOverlay"
  ) {
    return;
  }

  const overlay =
    document.getElementById("productInfoOverlay");

  const panel =
    document.getElementById("productInfoPanel");

  if (!overlay || !panel) return;

  panel.classList.add("translate-x-full");

  document.body.style.overflow = "";

  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 500);
}


window.openProductInfo = openProductInfo;
window.closeProductInfo = closeProductInfo;


