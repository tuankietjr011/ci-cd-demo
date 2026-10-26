const API = "/api";

const token =
  localStorage.getItem("shoplux_token");

let checkoutItems =
  JSON.parse(
    localStorage.getItem(
      "shoplux_checkout"
    ) || "[]"
  );

const checkoutSource =
  localStorage.getItem(
    "shoplux_checkout_source"
  ) || "";


function money(value) {
  return Number(value || 0)
    .toLocaleString("vi-VN") + " ₫";
}


function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =====================================================
// DELIVERY ADDRESS
// =====================================================

let deliveryAddresses = [];
let selectedAddressId = null;
let usingOtherAddress = false;


async function loadDeliveryAddresses() {

  try {

    const response =
      await fetch(
        API + "/delivery-addresses",
        {
          headers: {
            Authorization:
              "Bearer " + token
          }
        }
      );


    const json =
      await response.json();


    if (
      !response.ok ||
      !json.success
    ) {

      throw new Error(
        json.message ||
        "Không thể tải địa chỉ giao hàng."
      );

    }


    deliveryAddresses =
      Array.isArray(json.addresses)
        ? json.addresses
        : [];


    const defaultAddress =
      deliveryAddresses.find(
        item =>
          item.is_default === true
      ) ||
      deliveryAddresses[0];


    selectedAddressId =
      defaultAddress
        ? Number(defaultAddress.id)
        : null;


    renderDeliveryAddresses();


    // Chưa có địa chỉ lưu
    // -> tự mở địa chỉ khác
    if (!deliveryAddresses.length) {
      useOtherAddress();
    }


  } catch (error) {

    console.error(
      "LOAD DELIVERY ADDRESS ERROR:",
      error
    );


    document.getElementById(
      "savedAddressList"
    ).innerHTML = `
      <div
        class="
          border
          p-5
          text-sm
          text-red-700
        "
        style="border-color:#e8d5a3"
      >
        ${escapeHTML(error.message)}
      </div>
    `;

  }

}


function renderDeliveryAddresses() {

  const container =
    document.getElementById(
      "savedAddressList"
    );


  if (!deliveryAddresses.length) {

    container.innerHTML = `
      <div
        class="
          border
          p-5
          text-sm
          text-gray-500
        "
        style="border-color:#e8d5a3"
      >
        Bạn chưa lưu địa chỉ giao hàng.
        Hãy nhập ĐỊA CHỈ KHÁC để tiếp tục đặt hàng.
      </div>
    `;

    return;
  }


  container.innerHTML =
    deliveryAddresses
      .map(item => {

        const checked =
          Number(item.id) ===
          Number(selectedAddressId);


        return `
          <label
            class="
              block
              border
              p-5
              cursor-pointer
              ${checked
                ? "bg-[#f7f1e7]"
                : "bg-white"}
            "
            style="
              border-color:
                ${checked
                  ? "#c9a227"
                  : "#e8d5a3"};
            "
          >

            <div
              class="
                flex
                items-start
                gap-4
              "
            >

              <input
                type="radio"
                name="savedDeliveryAddress"
                value="${Number(item.id)}"
                ${checked ? "checked" : ""}
                onchange="selectDeliveryAddress(${Number(
                  item.id
                )})"
                class="
                  mt-1
                  w-4
                  h-4
                  accent-[#3b2416]
                "
              >


              <div class="flex-1">

                <div
                  class="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >

                  <span class="font-bold">
                    ${escapeHTML(
                      item.label ||
                      "Địa chỉ giao hàng"
                    )}
                  </span>


                  ${
                    item.is_default
                      ? `
                        <span
                          class="
                            text-[10px]
                            font-bold
                            border
                            px-2
                            py-1
                          "
                          style="
                            color:#8b6b00;
                            border-color:#c9a227;
                          "
                        >
                          MẶC ĐỊNH
                        </span>
                      `
                      : ""
                  }

                </div>


                <div class="mt-2 font-bold">
                  ${escapeHTML(
                    item.recipient_name || ""
                  )}
                </div>


                <div
                  class="
                    text-sm
                    text-gray-600
                    mt-1
                  "
                >
                  ${escapeHTML(
                    item.phone || ""
                  )}
                </div>


                <div
                  class="
                    text-sm
                    text-gray-600
                    mt-1
                  "
                >
                  ${escapeHTML(
                    item.address || ""
                  )},
                  ${escapeHTML(
                    item.city || ""
                  )}
                </div>

              </div>

            </div>

          </label>
        `;

      })
      .join("");

}


function selectDeliveryAddress(id) {

  selectedAddressId =
    Number(id);

  usingOtherAddress = false;


  document.getElementById(
    "otherAddressSection"
  ).classList.add(
    "hidden"
  );


  renderDeliveryAddresses();

}


function getSelectedDeliveryAddress() {

  return deliveryAddresses.find(
    item =>
      Number(item.id) ===
      Number(selectedAddressId)
  ) || null;

}


// =====================================================
// OTHER ADDRESS
// =====================================================

function useOtherAddress() {

  usingOtherAddress = true;


  document.getElementById(
    "otherAddressSection"
  ).classList.remove(
    "hidden"
  );


  const user =
    JSON.parse(
      localStorage.getItem(
        "shoplux_user"
      ) || "null"
    );


  document.getElementById(
    "fullname"
  ).value =
    user?.fullname || "";


  document.getElementById(
    "phone"
  ).value =
    user?.phone || "";


  document.getElementById(
    "address"
  ).value = "";


  document.getElementById(
    "city"
  ).value = "";


  document.getElementById(
    "otherAddressSection"
  ).scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


function cancelOtherAddress() {

  // Không có địa chỉ đã lưu
  // thì không thể đóng form
  if (!deliveryAddresses.length) {

    alert(
      "Bạn chưa có địa chỉ đã lưu. Vui lòng nhập địa chỉ giao hàng."
    );

    return;
  }


  usingOtherAddress = false;


  document.getElementById(
    "otherAddressSection"
  ).classList.add(
    "hidden"
  );

}


// =====================================================
// EDIT SAVED ADDRESS
// =====================================================

function editSelectedAddress() {

  const item =
    getSelectedDeliveryAddress();


  if (!item) {

    alert(
      "Vui lòng chọn một địa chỉ đã lưu."
    );

    return;
  }


  const url =
    "/profile.html?editAddress=" +
    encodeURIComponent(item.id);


  window.location.href =
    url;

}

let appliedCoupon = null;

let shopSettings = {
  shipping_fee: 30000,
  free_shipping_threshold: 1000000
};


async function loadShopSettings() {
  try {
    const response =
      await fetch(API + "/settings");

    const json =
      await response.json();

    if (!response.ok || !json.success) {
      throw new Error(
        json.message ||
        "Không thể tải cài đặt cửa hàng."
      );
    }

    shopSettings = {
      shipping_fee:
        Math.max(
          0,
          Number(
            json.settings?.shipping_fee ?? 30000
          )
        ),

      free_shipping_threshold:
        Math.max(
          0,
          Number(
            json.settings
              ?.free_shipping_threshold ??
            1000000
          )
        )
    };

    renderOrder();

  } catch (error) {
    console.error(
      "LOAD SHOP SETTINGS ERROR:",
      error
    );

    renderOrder();
  }
}


function calculateSummary() {

  const subtotal =
    checkoutItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.qty || 1),
      0
    );


  const configuredShippingFee =
    Math.max(
      0,
      Number(
        shopSettings.shipping_fee || 0
      )
    );

  const freeShippingThreshold =
    Math.max(
      0,
      Number(
        shopSettings
          .free_shipping_threshold || 0
      )
    );

  let shippingFee =
    subtotal >= freeShippingThreshold
      ? 0
      : configuredShippingFee;


  let discount = 0;


  if (appliedCoupon) {

    discount =
      Number(
        appliedCoupon.discount || 0
      );


    if (
      appliedCoupon.shippingDiscount
    ) {
      shippingFee = 0;
    }

  }


  const total =
    Math.max(
      0,
      subtotal -
      discount +
      shippingFee
    );


  return {
    subtotal,
    discount,
    shippingFee,
    total
  };
}

function renderOrder() {

  const container =
    document.getElementById(
      "orderItems"
    );


  if (!checkoutItems.length) {

    container.innerHTML = `
      <div
        class="
          text-center
          py-10
          text-gray-500
        "
      >
        Không có sản phẩm để thanh toán.
      </div>
    `;

    document.getElementById(
      "submitOrder"
    ).disabled = true;

    return;
  }


  container.innerHTML =
    checkoutItems.map(
      item => `
        <div
          class="
            flex
            gap-4
            pb-5
            border-b
          "
          style="border-color:#e8d5a3"
        >

          <div
            class="
              w-20
              h-24
              bg-[#efe4d2]
              shrink-0
            "
          >
            <img
              src="${item.image || ""}"
              class="
                w-full
                h-full
                object-cover
              "
            >
          </div>


          <div class="flex-1">

            <div
              class="
                font-bold
                text-sm
              "
            >
              ${escapeHTML(item.name)}
            </div>


            ${
              item.size
                ? `
                  <div
                    class="
                      text-xs
                      text-gray-500
                      mt-2
                    "
                  >
                    Size:
                    ${escapeHTML(item.size)}
                  </div>
                `
                : ""
            }

            ${
  item.color
    ? `
      <div
        class="
          text-xs
          text-gray-500
          mt-1
        "
      >
        Màu:
        ${escapeHTML(item.color)}
      </div>
    `
    : ""
}


            <div
              class="
                text-xs
                text-gray-500
                mt-1
              "
            >
              Số lượng:
              ${Number(item.qty || 1)}
            </div>


            <div
              class="
                font-bold
                mt-2
              "
              style="color:#70452d"
            >
              ${money(
                Number(item.price) *
                Number(item.qty || 1)
              )}
            </div>

          </div>

        </div>
      `
    ).join("");


  const summary =
    calculateSummary();


  document.getElementById(
    "subtotal"
  ).textContent =
    money(summary.subtotal);


  document.getElementById(
    "shippingFee"
  ).textContent =
    summary.shippingFee === 0
      ? "Miễn phí"
      : money(summary.shippingFee);

    const discountRow =
  document.getElementById(
    "discountRow"
  );


if (summary.discount > 0) {

  discountRow.classList.remove(
    "hidden"
  );

  document.getElementById(
    "discountAmount"
  ).textContent =
    "-" + money(summary.discount);

} else {

  discountRow.classList.add(
    "hidden"
  );

}
  document.getElementById(
    "total"
  ).textContent =
    money(summary.total);
}


async function loadUser() {

  if (!token) {
    location.href =
      "/login.html";

    return;
  }


  try {

    const response =
      await fetch(
        API + "/auth/me",
        {
          headers: {
            Authorization:
              "Bearer " + token
          }
        }
      );


    const json =
      await response.json();


    if (
      !response.ok ||
      !json.success
    ) {

      localStorage.removeItem(
        "shoplux_token"
      );

      localStorage.removeItem(
        "shoplux_user"
      );

      location.href =
        "/login.html";

      return;
    }


    const user =
      json.user || json.data;


    if (user) {

  localStorage.setItem(
    "shoplux_user",
    JSON.stringify(user)
  );

}

  } catch (error) {

    console.error(error);

    alert(
      "Không thể tải thông tin tài khoản."
    );

  }
}
document
  .getElementById("applyCoupon")
  .addEventListener(
    "click",
    async () => {

      const input =
        document.getElementById(
          "couponCode"
        );

      const message =
        document.getElementById(
          "couponMessage"
        );

      const code =
        input.value
          .trim()
          .toUpperCase();


      if (!code) {

        message.style.color =
          "#8b1e1e";

        message.textContent =
          "Vui lòng nhập mã giảm giá.";

        return;
      }


      try {

        const summary =
          calculateSummary();


        const response =
          await fetch(
            API + "/coupons/validate",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  "Bearer " + token
              },

              body: JSON.stringify({
                code,
                subtotal:
                  summary.subtotal
              })
            }
          );


        const json =
          await response.json();


        if (
          !response.ok ||
          !json.success
        ) {

          appliedCoupon = null;

          renderOrder();

          throw new Error(
            json.message ||
            "Mã giảm giá không hợp lệ."
          );
        }


        appliedCoupon =
          json.coupon;


        input.value =
          appliedCoupon.code;


        message.style.color =
          "#2f6b3b";

        message.textContent =
          "Áp dụng mã " +
          appliedCoupon.code +
          " thành công.";


        renderOrder();


      } catch (error) {

        message.style.color =
          "#8b1e1e";

        message.textContent =
          error.message;

      }

    }
  );
  function showBankPaymentQR(order, bank, items) {
  const accounts = {
    TCB: {
      bankId: "TCB",
      account: "7583888666",
      name: "Techcombank"
    },
    MB: {
      bankId: "MB",
      account: "6838345678",
      name: "MB Bank"
    }
  };

  const selected = accounts[bank];

  if (!selected || !order?.code) {
    alert("Không thể hiển thị thông tin chuyển khoản.");
    return;
  }

  const amount = Number(order.total);

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Không xác định được số tiền chuyển khoản.");
    return;
  }

  const productName = String(
    items[0]?.name || items[0]?.product_name || "Don hang"
  )
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim();

  const transferContent =
    `SL ${order.code} ${productName}`.slice(0, 90);

  const qrUrl =
    `https://img.vietqr.io/image/` +
    `${selected.bankId}-${selected.account}-compact2.png` +
    `?amount=${encodeURIComponent(amount)}` +
    `&addInfo=${encodeURIComponent(transferContent)}` +
    `&accountName=${encodeURIComponent("TRINH HOANG TUAN KIET")}`;

  const container = document.createElement("div");

  container.style.cssText = `
    max-width:520px;
    margin:40px auto;
    padding:28px;
    background:#fffdf8;
    border:1px solid #c9a227;
    text-align:center;
    color:#3b2416;
  `;

  const title = document.createElement("h2");
  title.textContent = "THANH TOÁN CHUYỂN KHOẢN";
  title.style.cssText = "font-size:22px;font-weight:bold;margin-bottom:16px";

  const info = document.createElement("div");
  info.style.cssText = "line-height:2;margin-bottom:20px";

  const details = [
    selected.name,
    `Số tài khoản: ${selected.account}`,
    "Chủ tài khoản: TRINH HOANG TUAN KIET",
    `Số tiền: ${amount.toLocaleString("vi-VN")} ₫`,
    `Nội dung: ${transferContent}`
  ];

  details.forEach(value => {
    const line = document.createElement("p");
    line.textContent = value;
    info.appendChild(line);
  });

  const qr = document.createElement("img");
  qr.src = qrUrl;
  qr.alt = "Mã VietQR chuyển khoản ShopLux";
  qr.style.cssText = "width:280px;max-width:100%;margin:0 auto 20px";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "TÔI ĐÃ CHUYỂN KHOẢN";
  button.style.cssText = `
    background:#3b2416;
    color:#e8d5a3;
    padding:14px 24px;
    font-weight:bold;
    width:100%;
    cursor:pointer;
  `;

  button.addEventListener("click", async () => {
  button.disabled = true;
  button.textContent = "ĐANG GỬI XÁC NHẬN...";

  try {
    const token = localStorage.getItem("shoplux_token");

    const response = await fetch(
      `/api/orders/${encodeURIComponent(order.code)}/report-payment`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(
        json.message || "Không thể gửi xác nhận chuyển khoản."
      );
    }

    button.textContent = "ĐANG CHỜ XÁC MINH THANH TOÁN";
    button.style.background = "#777";

    alert(
      "ShopLux đã ghi nhận thông báo chuyển khoản của bạn.\n" +
      "Đơn hàng đang chờ Admin kiểm tra giao dịch ngân hàng.\n" +
      "Vui lòng giữ lại biên lai chuyển khoản."
    );

  } catch (error) {
    alert(error.message);

    button.disabled = false;
    button.textContent = "TÔI ĐÃ CHUYỂN KHOẢN";
  }
});

const homeButton = document.createElement("button");

homeButton.type = "button";
homeButton.textContent = "← TRỞ VỀ TRANG CHỦ";

homeButton.style.cssText = `
  position:fixed;
  top:20px;
  left:20px;
  z-index:9999;
  background:#3b2416;
  color:#e8d5a3;
  border:1px solid #c9a227;
  padding:12px 18px;
  font-size:14px;
  font-weight:bold;
  cursor:pointer;
  border-radius:6px;
`;

homeButton.addEventListener("click", () => {
  window.location.href = "/";
});

container.append(title, info, qr, button, homeButton);

  document.body.replaceChildren(container);
  window.scrollTo(0, 0);
}

document
  .getElementById(
    "checkoutForm"
  )
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!checkoutItems.length) {
        alert(
          "Không có sản phẩm để đặt hàng."
        );

        return;
      }


      let fullname = "";
let phone = "";
let address = "";
let city = "";


// ĐỊA CHỈ KHÁC
if (usingOtherAddress) {

  fullname =
    document.getElementById(
      "fullname"
    ).value.trim();


  phone =
    document.getElementById(
      "phone"
    ).value.trim();


  address =
    document.getElementById(
      "address"
    ).value.trim();


  city =
    document.getElementById(
      "city"
    ).value.trim();


// ĐỊA CHỈ ĐÃ LƯU
} else {

  const selectedAddress =
    getSelectedDeliveryAddress();


  if (!selectedAddress) {

    alert(
      "Vui lòng chọn địa chỉ giao hàng."
    );

    return;
  }


  fullname =
    String(
      selectedAddress.recipient_name || ""
    ).trim();


  phone =
    String(
      selectedAddress.phone || ""
    ).trim();


  address =
    String(
      selectedAddress.address || ""
    ).trim();


  city =
    String(
      selectedAddress.city || ""
    ).trim();

}


// GHI CHÚ ĐƠN HÀNG
const note =
  document.getElementById(
    "orderNote"
  ).value.trim();


      const paymentMethod =
        document.querySelector(
          'input[name="payment"]:checked'
        )?.value || "cod";

        const selectedBank =
  paymentMethod === "bank"
    ? document.getElementById("selectedBank")?.value
    : null;

if (
  paymentMethod === "bank" &&
  !["TCB", "MB"].includes(selectedBank)
) {
  alert("Vui lòng chọn ngân hàng chuyển khoản.");
  return;
}

      if (
        !fullname ||
        !phone ||
        !address ||
        !city
      ) {

        alert(
          "Vui lòng nhập đầy đủ thông tin giao hàng."
        );

        return;
      }


      const button =
        document.getElementById(
          "submitOrder"
        );


      button.disabled = true;

      button.textContent =
        "ĐANG XỬ LÝ...";


      try {

        const response =
          await fetch(
            API + "/orders",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  "Bearer " + token
              },

              body: JSON.stringify({
                fullname,
                phone,
                address,
                city,
                note,
                paymentMethod,
                couponCode:
                
                appliedCoupon
                ? appliedCoupon.code
                : "",

                items:
  checkoutItems.map(
    item => ({
      id: item.id,

      size:
        item.size || "",

      color:
        item.color || "",

      qty:
        Number(
          item.qty || 1
        )
    })
  )
              })
            }
          );


        const json =
          await response.json();


        if (
          !response.ok ||
          !json.success
        ) {

          throw new Error(
            json.message ||
            "Không thể đặt hàng"
          );

        }


        /*
  Nếu checkout từ giỏ hàng:
  chỉ xóa những sản phẩm
  vừa được chọn để thanh toán.

  Những sản phẩm không chọn
  vẫn được giữ lại trong giỏ.
*/

if (
  checkoutSource === "cart"
) {

  let currentUser = null;

  try {
    currentUser =
      JSON.parse(
        localStorage.getItem(
          "shoplux_user"
        ) || "null"
      );
  } catch (error) {
    currentUser = null;
  }


  const cartKey =
    currentUser?.id
      ? `shoplux_cart_user_${currentUser.id}`
      : null;


  const checkoutKeys =
    JSON.parse(
      localStorage.getItem(
        "shoplux_checkout_keys"
      ) || "[]"
    );


  if (cartKey) {

    const currentCart =
      JSON.parse(
        localStorage.getItem(
          cartKey
        ) || "[]"
      );


    const remainingCart =
      currentCart.filter(
        item =>
          !checkoutKeys.includes(
            item.key
          )
      );


    localStorage.setItem(
      cartKey,
      JSON.stringify(
        remainingCart
      )
    );
  }
}


        localStorage.removeItem(
          "shoplux_checkout"
        );

        localStorage.removeItem(
  "shoplux_checkout_keys"
);

        localStorage.removeItem(
          "shoplux_checkout_source"
        );


        const order = json.order;

// Chuyển khoản: hiển thị mã VietQR
if (paymentMethod === "bank") {
  showBankPaymentQR(
    order,
    selectedBank,
    checkoutItems
  );
  return;
}

// COD: giữ nguyên chức năng cũ
alert(
  "Đặt hàng thành công!\nMã đơn: " +
  order.code
);

location.href =
  "/?order=" +
  encodeURIComponent(order.code);


      } catch (error) {

        console.error(error);

        alert(
          error.message ||
          "Có lỗi xảy ra khi đặt hàng."
        );


        button.disabled = false;

        button.textContent =
          "ĐẶT HÀNG";

      }

    }
  );


async function startCheckout() {

  await loadShopSettings();

  await loadUser();

  await loadDeliveryAddresses();

}
startCheckout();
