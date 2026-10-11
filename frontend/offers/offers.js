const API = "/api";


function formatMoney(value) {
  return Number(value || 0)
    .toLocaleString("vi-VN") + "đ";
}


function getCouponIcon(type) {

  if (type === "percent") {
    return "fa-percent";
  }

  if (type === "fixed") {
    return "fa-gift";
  }

  if (type === "shipping") {
    return "fa-truck-fast";
  }

  return "fa-ticket";
}


function getCouponTitle(coupon) {

  if (coupon.type === "percent") {

    return `GIẢM ${Number(coupon.value)}%`;

  }

  if (coupon.type === "fixed") {

    return `GIẢM ${formatMoney(coupon.value)}`;

  }

  if (coupon.type === "shipping") {

    return "FREESHIP";

  }

  return "ƯU ĐÃI";

}


function getCouponDescription(coupon) {

  let text = "";


  if (coupon.type === "percent") {

    text =
      `Giảm ${Number(coupon.value)}%`;

  }


  if (coupon.type === "fixed") {

    text =
      `Giảm trực tiếp ${formatMoney(coupon.value)}`;

  }


  if (coupon.type === "shipping") {

    text =
      "Miễn phí vận chuyển";

  }


  if (Number(coupon.min_order || 0) > 0) {

    text +=
      ` cho đơn hàng từ ${formatMoney(coupon.min_order)}`;

  }


  text += ".";


  if (
    coupon.type === "percent" &&
    coupon.max_discount !== null &&
    Number(coupon.max_discount) > 0
  ) {

    text +=
      ` Giảm tối đa ${formatMoney(coupon.max_discount)}.`;

  }


  return text;

}


function getCouponRemaining(coupon) {

  if (coupon.usage_limit === null) {
    return "";
  }


  const limit =
    Number(coupon.usage_limit);

  const used =
    Number(coupon.used_count || 0);

  const remaining =
    Math.max(
      limit - used,
      0
    );


  return `
    <div
      class="
        text-xs
        text-gray-400
        mt-4
      "
    >
      Còn ${remaining} lượt sử dụng
    </div>
  `;

}


function getCouponExpire(coupon) {

  if (!coupon.end_at) {
    return "";
  }


  const date =
    new Date(coupon.end_at);


  return `
    <div
      class="
        text-xs
        text-gray-400
        mt-1
      "
    >
      Hết hạn:
      ${date.toLocaleString("vi-VN")}
    </div>
  `;

}


function renderCoupons(coupons) {

  const container =
    document.getElementById("couponList");


  if (!coupons.length) {

    container.innerHTML = `
      <div
        class="
          col-span-full
          text-center
          py-16
          text-gray-500
        "
      >
        Hiện chưa có ưu đãi nào.
      </div>
    `;

    return;

  }


  container.innerHTML =
    coupons.map(coupon => `

      <div
        class="
          coupon-card
          bg-[#fffdf8]
          border
          p-7
          flex
          flex-col
        "
        style="border-color:#e8d5a3"
      >

        <div
          class="
            w-12
            h-12
            flex
            items-center
            justify-center
            text-xl
          "
          style="
            background:#3b2416;
            color:#e8d5a3;
          "
        >
          <i
            class="
              fa-solid
              ${getCouponIcon(coupon.type)}
            "
          ></i>
        </div>


        <div
          class="
            text-xs
            tracking-[3px]
            mt-6
          "
          style="color:#70452d"
        >
          MEMBER OFFER
        </div>


        <h2
          class="
            luxury-font
            text-3xl
            mt-2
          "
        >
          ${getCouponTitle(coupon)}
        </h2>


        <p
          class="
            text-sm
            text-gray-500
            mt-3
            leading-6
            min-h-[48px]
          "
        >
          ${getCouponDescription(coupon)}
        </p>


        ${getCouponRemaining(coupon)}

        ${getCouponExpire(coupon)}


        <div class="flex-1"></div>


        <div
          class="
            mt-7
            border
            border-dashed
            p-4
            flex
            justify-between
            items-center
            gap-3
          "
          style="border-color:#c9a227"
        >

          <b
            class="
              tracking-[2px]
              text-lg
              break-all
            "
          >
            ${coupon.code}
          </b>


          <button
            onclick="
              copyCoupon(
                '${coupon.code}',
                this
              )
            "
            class="
              text-xs
              font-bold
              hover:underline
              whitespace-nowrap
            "
            style="color:#70452d"
          >
            SAO CHÉP
          </button>

        </div>

      </div>

    `).join("");

}


async function loadCoupons() {

  const container =
    document.getElementById("couponList");


  try {

    const response =
      await fetch(
        API + "/coupons"
      );


    const json =
      await response.json();


    if (
      !response.ok ||
      !json.success
    ) {

      throw new Error(
        json.message ||
        "Không thể tải ưu đãi."
      );

    }


    const coupons =
      json.coupons ||
      json.data ||
      [];


    renderCoupons(coupons);


  } catch (error) {

    console.error(
      "LOAD COUPONS ERROR:",
      error
    );


    container.innerHTML = `
      <div
        class="
          col-span-full
          text-center
          py-16
          text-red-600
        "
      >
        Không thể tải ưu đãi.
      </div>
    `;

  }

}


function copyCoupon(code, button) {

  navigator.clipboard
    .writeText(code)
    .then(() => {

      const oldText =
        button.textContent;

      button.textContent =
        "ĐÃ SAO CHÉP";


      setTimeout(() => {

        button.textContent =
          oldText;

      }, 1500);

    })
    .catch(() => {

      alert(
        "Mã ưu đãi: " + code
      );

    });

}


loadCoupons();
