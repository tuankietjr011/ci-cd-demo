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
  class="text-sm font-bold mt-2"
  style="color:#70452d"
>
  Thanh toán:
  ${
    order.payment_status === "paid"
      ? "Đã thanh toán"
      : order.payment_status === "pending_verification"
        ? "Chờ xác minh thanh toán"
        : "Chưa thanh toán"
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


function renderOrderTracking(order) {
  const steps = [
    { label: "Đã đặt hàng", icon: "✓" },
    { label: "Đã xác nhận", icon: "✓" },
    { label: "Đang giao hàng", icon: "🚚" },
    { label: "Đã giao hàng", icon: "✓" }
  ];

  const statusLevels = {
    pending: 0,
    confirmed: 1,
    shipping: 2,
    delivered: 3
  };

  const cancelled = order.status === "cancelled";
  const current = statusLevels[order.status] ?? -1;

  const createdAt = order.created_at || order.createdAt;

  return `
    <section style="
      background:#fffdf8;
      border:1px solid #e8d5a3;
      padding:24px;
      margin-bottom:24px;
    ">
      <h3 style="
        font-size:20px;
        font-weight:bold;
        color:#3b2416;
        margin-bottom:8px;
      ">
        THEO DÕI ĐƠN HÀNG
      </h3>

      <p style="color:#70452d;font-size:13px;margin-bottom:24px;">
        ${cancelled
          ? "Đơn hàng đã bị hủy"
          : "Trạng thái vận chuyển đơn hàng ShopLux"}
      </p>

      ${cancelled ? `
        <div style="
          padding:16px;
          background:#fee2e2;
          color:#991b1b;
          font-weight:bold;
        ">
          Đơn hàng đã hủy
        </div>
      ` : `
        <div style="
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          gap:8px;
        ">
          ${steps.map((step, index) => {
            const active = index <= current;

            return `
              <div style="text-align:center;min-width:0;">
                <div style="
                  width:42px;
                  height:42px;
                  margin:0 auto 12px;
                  border-radius:50%;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:20px;
                  background:${active ? "#c9a227" : "#eee8df"};
                  color:${active ? "#3b2416" : "#9ca3af"};
                  border:2px solid ${active ? "#c9a227" : "#ddd6cc"};
                ">
                  ${step.icon}
                </div>

                <div style="
                  font-size:12px;
                  font-weight:bold;
                  color:${active ? "#3b2416" : "#9ca3af"};
                ">
                  ${step.label}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}

      <div style="
        margin-top:28px;
        padding:18px;
        background:#f7f1e7;
        border-left:4px solid #c9a227;
      ">
        <div style="
          font-weight:bold;
          color:#3b2416;
          margin-bottom:8px;
        ">
          LỊCH SỬ ĐƠN HÀNG
        </div>

        <div style="
          display:flex;
          gap:12px;
          align-items:flex-start;
        ">
          <span style="color:#c9a227;">●</span>

          <div>
            <div style="font-weight:bold;color:#3b2416;">
              ${escapeHTML(statusInfo(order.status).text)}
            </div>

            <div style="
              font-size:12px;
              color:#6b7280;
              margin-top:4px;
            ">
              Trạng thái hiện tại
            </div>
          </div>
        </div>

        ${createdAt ? `
          <div style="
            display:flex;
            gap:12px;
            margin-top:16px;
          ">
            <span style="color:#c9a227;">●</span>

            <div>
              <div style="font-weight:bold;color:#3b2416;">
                Đã đặt hàng
              </div>

              <div style="
                font-size:12px;
                color:#6b7280;
                margin-top:4px;
              ">
                ${escapeHTML(formatDate(createdAt))}
              </div>
            </div>
          </div>
        ` : ""}
      </div>

      <p style="
        margin-top:14px;
        font-size:12px;
        color:#6b7280;
      ">
        Thông tin được cập nhật theo trạng thái đơn hàng
        trên ShopLux. Chưa có dữ liệu vận chuyển từ
        đơn vị giao hàng.
      </p>
    </section>
  `;
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

    ${renderOrderTracking(order)}

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
