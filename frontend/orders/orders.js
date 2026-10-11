const token =
  localStorage.getItem("shoplux_token");


if (!token) {
  location.href = "/login.html";
}


function money(value) {
  return Number(value || 0)
    .toLocaleString("vi-VN") + " ₫";
}


function formatDate(value) {

  if (!value) {
    return "";
  }

  return new Date(value)
    .toLocaleString("vi-VN");

}


function escapeHTML(value = "") {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function statusInfo(status) {

  const statuses = {

    pending: {
      text: "Chờ xác nhận",
      className:
        "bg-yellow-100 text-yellow-800"
    },

    confirmed: {
      text: "Đã xác nhận",
      className:
        "bg-blue-100 text-blue-800"
    },

    shipping: {
      text: "Đang giao hàng",
      className:
        "bg-purple-100 text-purple-800"
    },

    delivered: {
      text: "Đã giao hàng",
      className:
        "bg-green-100 text-green-800"
    },

    cancelled: {
      text: "Đã hủy",
      className:
        "bg-red-100 text-red-800"
    }

  };


  return statuses[status] || {
    text: status || "Không xác định",
    className:
      "bg-gray-100 text-gray-700"
  };

}


async function loadOrders() {

  const loading =
    document.getElementById("loading");

  const empty =
    document.getElementById(
      "emptyOrders"
    );

  const container =
    document.getElementById("orders");

    container.innerHTML = "";

  try {

    const response =
      await fetch(
        "/api/orders/my",
        {
          headers: {
            Authorization:
              "Bearer " + token
          }
        }
      );


    const data =
      await response.json();


    if (response.status === 401) {

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


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Không thể tải đơn hàng"
      );

    }


    const orders =
      data.orders ||
      data.data ||
      [];


    loading.classList.add("hidden");


    if (!orders.length) {

      empty.classList.remove("hidden");

      return;
    }


    container.innerHTML =
      orders.map(order => {

        const status =
          statusInfo(order.status);

        return `

          <div
            class="
              bg-[#fffdf8]
              border
              shadow-sm
            "
            style="border-color:#e8d5a3"
          >

            <!-- HEADER -->

            <div
              class="
                p-5
                md:p-6
                border-b
                flex
                flex-col
                md:flex-row
                md:items-center
                justify-between
                gap-4
              "
              style="border-color:#e8d5a3"
            >

              <div>

                <div
                  class="
                    text-xs
                    text-gray-500
                    tracking-[1px]
                  "
                >
                  MÃ ĐƠN HÀNG
                </div>

                <div
                  class="
                    luxury-font
                    text-xl
                    font-bold
                    mt-1
                  "
                  style="color:#3b2416"
                >
                  ${escapeHTML(order.code)}
                </div>

                <div
                  class="
                    text-xs
                    text-gray-400
                    mt-2
                  "
                >
                  ${formatDate(
                    order.created_at ||
                    order.createdAt
                  )}
                </div>

              </div>


              <span
                class="
                  ${status.className}
                  px-4
                  py-2
                  text-xs
                  font-bold
                  w-fit
                "
              >
                ${status.text}
              </span>

            </div>


            <!-- INFO -->

            <div
              class="
                p-5
                md:p-6
                grid
                md:grid-cols-2
                gap-6
              "
            >

              <div>

                <div
                  class="
                    text-xs
                    font-bold
                    tracking-[1px]
                    mb-2
                  "
                >
                  THÔNG TIN NHẬN HÀNG
                </div>

                <div class="text-sm leading-7">

                  <div>
                    ${escapeHTML(
                      order.fullname || ""
                    )}
                  </div>

                  <div>
                    ${escapeHTML(
                      order.phone || ""
                    )}
                  </div>

                  <div class="text-gray-500">
                    ${escapeHTML(
                      order.address || ""
                    )},
                    ${escapeHTML(
                      order.city || ""
                    )}
                  </div>

                </div>

              </div>


              <div
                class="
                  md:text-right
                "
              >

                <div
                  class="
                    text-xs
                    font-bold
                    tracking-[1px]
                  "
                >
                  THANH TOÁN
                </div>

                <div
                  class="
                    text-sm
                    text-gray-500
                    mt-2
                  "
                >
                  ${
                    order.payment_method ===
                    "bank"
                      ? "Chuyển khoản ngân hàng"
                      : "Thanh toán khi nhận hàng"
                  }
                </div>


                <div
                  class="
                    text-xs
                    text-gray-500
                    mt-5
                  "
                >
                  TỔNG TIỀN
                </div>

                <div
                  class="
                    luxury-font
                    text-2xl
                    font-bold
                    mt-1
                  "
                  style="color:#70452d"
                >
                  ${money(order.total)}
                </div>

              </div>

            </div>
${
  order.note
    ? `
      <div
        class="
          mx-5
          md:mx-6
          mb-6
          border
          p-4
          bg-[#f7f1e7]
        "
        style="border-color:#e8d5a3"
      >
        <div
          class="
            text-xs
            font-bold
            tracking-[1px]
            mb-2
          "
        >
          GHI CHÚ ĐƠN HÀNG
        </div>

        <div
          class="
            text-sm
            text-gray-600
            whitespace-pre-wrap
          "
        >${escapeHTML(order.note)}</div>
      </div>
    `
    : ""
}

            <!-- ACTION -->

<div
  class="
    px-5
    md:px-6
    pb-6
    flex
    flex-wrap
    justify-end
    gap-3
  "
>

  ${
    order.status === "pending"
      ? `
        <button
          onclick="cancelOrder(
            '${escapeHTML(order.code)}'
          )"
          class="
            px-6
            py-3
            border
            font-bold
            text-sm
            tracking-[1px]
          "
          style="
            border-color:#b91c1c;
            color:#b91c1c;
          "
        >
          HỦY ĐƠN
        </button>
      `
      : ""
  }

  <button
    onclick="viewOrder(
      '${escapeHTML(order.code)}'
    )"
    class="
      px-6
      py-3
      border
      font-bold
      text-sm
      tracking-[1px]
    "
    style="
      border-color:#3b2416;
      color:#3b2416;
    "
  >
    XEM CHI TIẾT
  </button>

</div>

          </div>

        `;

      }).join("");


  } catch (error) {

    console.error(error);

    loading.innerHTML = `
      <div class="text-red-600">
        ${escapeHTML(error.message)}
      </div>
    `;

  }

}


async function viewOrder(code) {

  try {

    const response =
      await fetch(
        "/api/orders/" +
        encodeURIComponent(code),
        {
          headers: {
            Authorization:
              "Bearer " + token
          }
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Không thể tải chi tiết đơn hàng"
      );

    }


    const order =
      data.order;


    const items =
      order.items ||
      data.items ||
      [];


    const status =
      statusInfo(order.status);


    document.getElementById(
      "orderDetailContent"
    ).innerHTML = `

      <div class="mb-6">

        <div class="text-xs text-gray-500">
          MÃ ĐƠN
        </div>

        <div
          class="
            luxury-font
            text-2xl
            font-bold
            mt-1
          "
        >
          ${escapeHTML(order.code)}
        </div>

        <span
          class="
            inline-block
            ${status.className}
            px-3
            py-2
            mt-3
            text-xs
            font-bold
          "
        >
          ${status.text}
        </span>

      </div>


      <div
        class="
          border-t
          border-b
          py-5
          space-y-4
        "
        style="border-color:#e8d5a3"
      >

        ${
          items.length
            ? items.map(item => `

                <div
                  class="
                    flex
                    gap-4
                    items-center
                  "
                >

                  ${
                    item.image
                      ? `
                        <img
                          src="${item.image}"
                          class="
                            w-16
                            h-16
                            object-cover
                          "
                        >
                      `
                      : ""
                  }


                  <div class="flex-1">

                    <div class="font-bold">
                      ${escapeHTML(
                        item.product_name ||
                        item.name ||
                        ""
                      )}
                    </div>

                    ${
                      item.size
                        ? `
                          <div
                            class="
                              text-xs
                              text-gray-500
                              mt-1
                            "
                          >
                            Size:
                            ${escapeHTML(
                              item.size
                            )}
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
        ${escapeHTML(
          item.color
        )}
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
                      ${Number(
                        item.quantity ||
                        item.qty ||
                        1
                      )}
                    </div>

                  </div>


                  <div class="font-bold">
                    ${money(
                      Number(
                        item.price || 0
                      ) *
                      Number(
                        item.quantity ||
                        item.qty ||
                        1
                      )
                    )}
                  </div>

                </div>

              `).join("")
            : `
                <div
                  class="
                    text-gray-500
                    text-sm
                  "
                >
                  Không có thông tin sản phẩm.
                </div>
              `
        }

      </div>


      ${
  order.note
    ? `
      <div
        class="
          mt-6
          border
          p-4
          bg-[#f7f1e7]
        "
        style="border-color:#e8d5a3"
      >
        <div
          class="
            text-xs
            font-bold
            tracking-[1px]
            mb-2
          "
        >
          GHI CHÚ ĐƠN HÀNG
        </div>

        <div
          class="
            text-sm
            text-gray-600
            whitespace-pre-wrap
          "
        >
          ${escapeHTML(order.note)}
        </div>
      </div>
    `
    : ""
}

<div
  class="
    flex
    justify-between
    mt-6
    text-lg
    font-bold
  "
>
  <span>TỔNG CỘNG</span>

  <span style="color:#70452d">
    ${money(order.total)}
  </span>
</div>

    `;


    const modal =
      document.getElementById(
        "orderDetailModal"
      );


    modal.classList.remove("hidden");
    modal.classList.add("flex");


  } catch (error) {

    alert(error.message);

  }

}

async function cancelOrder(code) {

  const confirmed =
    confirm(
      "Bạn có chắc muốn hủy đơn hàng này không?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        "/api/orders/" +
        encodeURIComponent(code) +
        "/cancel",
        {
          method: "PATCH",

          headers: {
            Authorization:
              "Bearer " + token
          }
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Không thể hủy đơn hàng."
      );

    }


    alert(
      "Hủy đơn hàng thành công."
    );


    await loadOrders();


  } catch (error) {

    console.error(
      "CANCEL ORDER ERROR:",
      error
    );


    alert(
      error.message ||
      "Không thể hủy đơn hàng."
    );

  }

}

function closeOrderDetail() {

  const modal =
    document.getElementById(
      "orderDetailModal"
    );

  modal.classList.add("hidden");
  modal.classList.remove("flex");

}


loadOrders();
