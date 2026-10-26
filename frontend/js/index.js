function openCart() {
  const modal =
    document.getElementById("cartModal");

  const container =
    document.getElementById("cartItems");

  cart =
  typeof loadUserCart === "function"
    ? loadUserCart()
    : [];


  // GIỎ HÀNG TRỐNG
  if (!cart.length) {

    container.innerHTML = `
      <div class="text-center py-14 text-gray-400">

        <i
          class="
            fa-solid
            fa-bag-shopping
            text-4xl
            mb-4
          "
        ></i>

        <p>
          Giỏ hàng đang trống.
        </p>

      </div>
    `;

  } else {

    // TÍNH TỔNG TIỀN
    const selectedCartItems =
  cart.filter(
    item =>
      item.selected === true
  );


const total =
  selectedCartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.qty || 1),
    0
  );

    // DANH SÁCH SẢN PHẨM
    container.innerHTML = `

      <div>

        ${cart.map((item, index) => `

  <div
    class="
      flex
      items-center
      gap-4
      py-4
      border-b
    "
    style="border-color:#e8d5a3"
  >
<div
  class="
    flex
    items-start
    pt-2
  "
>
  <input
    type="checkbox"
    class="
      cart-check
      w-5
      h-5
      cursor-pointer
      accent-[#3b2416]
    "
    data-index="${index}"
    ${item.selected ? "checked" : ""}
    onchange="toggleCartItem(${index}, this.checked)"
  >
</div>

    <!-- ẢNH - BẤM VÀO XEM CHI TIẾT -->
    <a
      href="/?id=${item.id}"
      class="shrink-0"
    >
      <img
        src="${item.image}"
        class="
          w-20
          h-20
          object-cover
          cursor-pointer
          hover:opacity-80
          transition
        "
      >
    </a>


    <!-- THÔNG TIN -->
    <div class="flex-1">

      <a
        href="/?id=${item.id}"
        class="
          font-bold
          hover:underline
          cursor-pointer
        "
      >
        ${item.name}
      </a>

      ${
  item.size
    ? `
      <div class="mt-2 flex items-center gap-2">

        <span class="text-xs text-gray-500">
          Size:
        </span>

        <select
          onchange="changeCartSize(${index}, this.value)"
          class="
            border
            px-2
            py-1
            text-xs
            bg-[#fffdf8]
            outline-none
          "
          style="border-color:#c9a227"
        >
          ${(
  item.sizes?.length
    ? item.sizes
    : /^\d+$/.test(String(item.size))
      ? ["36", "37", "38", "39", "40", "41", "42", "43", "44"]
      : ["S", "M", "L", "XL", "XXL"]
)
  .map(size => `
              <option
                value="${size}"
                ${String(item.size) === String(size) ? "selected" : ""}
              >
                ${size}
              </option>
            `)
            .join("")}
        </select>

      </div>
    `
    : ""
}

      <div
        class="mt-1"
        style="color:#70452d"
      >
        ${Number(item.price).toLocaleString("vi-VN")} ₫
      </div>


      <!-- SỐ LƯỢNG + XÓA -->
      <div
        class="
          flex
          items-center
          gap-4
          mt-3
        "
      >

        <div
          class="
            flex
            items-center
            border
          "
          style="border-color:#c9a227"
        >

          <button
            type="button"
            onclick="changeCartQuantity(${index}, -1)"
            class="
              w-9
              h-9
              font-bold
              hover:bg-[#f7f1e7]
            "
          >
            −
          </button>

          <span
            class="
              w-10
              text-center
              font-bold
            "
          >
            ${item.qty || 1}
          </span>

          <button
            type="button"
            onclick="changeCartQuantity(${index}, 1)"
            class="
              w-9
              h-9
              font-bold
              hover:bg-[#f7f1e7]
            "
          >
            +
          </button>

        </div>


        <button
          type="button"
          onclick="removeCartItem(${index})"
          class="
            text-xs
            font-bold
            tracking-[1px]
            hover:underline
          "
          style="color:#70452d"
        >
          <i class="fa-regular fa-trash-can mr-1"></i>
          XÓA
        </button>

      </div>

    </div>


    <!-- THÀNH TIỀN -->
    <div
      class="
        font-bold
        text-right
      "
    >
      ${(
        Number(item.price || 0) *
        Number(item.qty || 1)
      ).toLocaleString("vi-VN")} ₫
    </div>

  </div>

`).join("")}


        <!-- TOTAL -->

        <div
          class="
            flex
            justify-between
            items-center
            mt-6
            pt-5
            border-t
          "
          style="border-color:#e8d5a3"
        >

          <span
            class="
              font-bold
              tracking-[1px]
            "
          >
            TỔNG CỘNG
          </span>


          <span
            class="
              text-xl
              font-bold
            "
            style="color:#70452d"
          >
            ${total.toLocaleString("vi-VN")} ₫
          </span>

        </div>


        <!-- CHECKOUT -->

        <button
          onclick="checkoutCart()"
          class="
            w-full
            mt-6
            py-4
            font-bold
            tracking-[2px]
            transition
            hover:opacity-90
          "
          style="
            background:#3b2416;
            color:#e8d5a3;
          "
        >
          THANH TOÁN
        </button>

      </div>
    `;
  }


  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function toggleCartItem(
  index,
  checked
) {

  const key =
    typeof getCartStorageKey === "function"
      ? getCartStorageKey()
      : null;

  if (!key) return;


  const currentCart =
    JSON.parse(
      localStorage.getItem(key) || "[]"
    );


  if (!currentCart[index]) {
    return;
  }


  currentCart[index].selected =
    checked;


  localStorage.setItem(
    key,
    JSON.stringify(currentCart)
  );


  // Đồng bộ biến cart trong app.js
  cart = currentCart;


  openCart();
}


function changeCartQuantity(index, amount) {

  const key =
    typeof getCartStorageKey === "function"
      ? getCartStorageKey()
      : null;

  if (!key) return;


  const currentCart =
    JSON.parse(
      localStorage.getItem(key) || "[]"
    );


  if (!currentCart[index]) {
    return;
  }


  const currentQty =
    Number(
      currentCart[index].qty || 1
    );


  const newQty =
    currentQty + amount;


  if (newQty < 1) {
    return;
  }


  currentCart[index].qty =
    newQty;


  localStorage.setItem(
    key,
    JSON.stringify(currentCart)
  );


  cart = currentCart;


  if (
    typeof updateCartCount ===
    "function"
  ) {
    updateCartCount();
  }


  openCart();
}


function removeCartItem(index) {

  const key =
    typeof getCartStorageKey === "function"
      ? getCartStorageKey()
      : null;

  if (!key) return;


  const currentCart =
    JSON.parse(
      localStorage.getItem(key) || "[]"
    );


  if (!currentCart[index]) {
    return;
  }


  currentCart.splice(
    index,
    1
  );


  localStorage.setItem(
    key,
    JSON.stringify(currentCart)
  );


  cart = currentCart;


  if (
    typeof updateCartCount ===
    "function"
  ) {
    updateCartCount();
  }


  openCart();
}
function changeCartSize(index, newSize) {

  const key =
    typeof getCartStorageKey === "function"
      ? getCartStorageKey()
      : null;

  if (!key) return;


  const currentCart =
    JSON.parse(
      localStorage.getItem(key) || "[]"
    );


  if (!currentCart[index]) {
    return;
  }


  const item =
    currentCart[index];


  item.size =
    newSize;


  // Cập nhật key theo size mới
  // để không bị lỗi khi thanh toán/xóa sản phẩm
  const color =
    item.color || "";

  item.key =
    `${item.id}-${newSize}-${color}`;


  localStorage.setItem(
    key,
    JSON.stringify(currentCart)
  );


  cart =
    currentCart;


  openCart();
}

function closeCart() {
  const modal =
    document.getElementById("cartModal");

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

const query =
  new URLSearchParams(location.search);

if (query.toString()) {
  const home =
    document.getElementById("homeContent");

  if (home) {
    home.style.display = "none";
  }
}
