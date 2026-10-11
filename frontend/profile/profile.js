// =====================================================
// DELIVERY ADDRESSES
// =====================================================

let deliveryAddresses = [];


// =====================================================
// LOAD ADDRESSES
// =====================================================

async function loadDeliveryAddresses() {

  const container =
    document.getElementById(
      "deliveryAddresses"
    );

  try {

    const response =
      await fetch(
        "/api/delivery-addresses",
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
        "Không thể tải địa chỉ."
      );

    }


    deliveryAddresses =
      Array.isArray(data.addresses)
        ? data.addresses
        : [];


    renderDeliveryAddresses();


  } catch (error) {

    console.error(
      "LOAD DELIVERY ADDRESSES ERROR:",
      error
    );


    container.innerHTML = `
      <div
        class="
          border
          p-4
          text-sm
          text-red-700
        "
        style="border-color:#e8d5a3"
      >
        ${escapeHTML(
          error.message
        )}
      </div>
    `;

  }

}


// =====================================================
// RENDER ADDRESSES
// =====================================================

function renderDeliveryAddresses() {

  const container =
    document.getElementById(
      "deliveryAddresses"
    );


  if (!deliveryAddresses.length) {

    container.innerHTML = `
      <div
        class="
          border
          p-5
          text-sm
          text-gray-400
        "
        style="border-color:#e8d5a3"
      >
        Bạn chưa lưu địa chỉ giao hàng nào.
      </div>
    `;

    return;
  }


  container.innerHTML =
    deliveryAddresses
      .map(item => `

        <div
          class="
            border
            p-5
            bg-white
          "
          style="border-color:#e8d5a3"
        >

          <div
            class="
              flex
              flex-wrap
              justify-between
              items-start
              gap-4
            "
          >

            <div class="flex-1">

              <div
                class="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  mb-2
                "
              >

                <span
                  class="
                    font-bold
                    text-sm
                  "
                >
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
                          px-2
                          py-1
                          border
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


              <div class="font-bold">
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
                <i
                  class="
                    fa-solid
                    fa-phone
                    mr-2
                  "
                ></i>

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
                <i
                  class="
                    fa-solid
                    fa-location-dot
                    mr-2
                  "
                ></i>

                ${escapeHTML(
                  item.address || ""
                )},

                ${escapeHTML(
                  item.city || ""
                )}
              </div>

            </div>


            <div
              class="
                flex
                flex-wrap
                gap-2
              "
            >

              <button
                type="button"
                onclick="editDeliveryAddress(${Number(
                  item.id
                )})"
                class="
                  border
                  px-3
                  py-2
                  text-xs
                  font-bold
                "
                style="
                  border-color:#3b2416;
                  color:#3b2416;
                "
              >
                SỬA
              </button>


              ${
                !item.is_default
                  ? `
                    <button
                      type="button"
                      onclick="setDefaultDeliveryAddress(${Number(
                        item.id
                      )})"
                      class="
                        border
                        px-3
                        py-2
                        text-xs
                        font-bold
                      "
                      style="
                        border-color:#c9a227;
                        color:#8b6b00;
                      "
                    >
                      ĐẶT MẶC ĐỊNH
                    </button>
                  `
                  : ""
              }


              <button
                type="button"
                onclick="deleteDeliveryAddress(${Number(
                  item.id
                )})"
                class="
                  border
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-red-700
                "
                style="
                  border-color:#b91c1c;
                "
              >
                XÓA
              </button>

            </div>

          </div>

        </div>

      `)
      .join("");

}


// =====================================================
// OPEN ADD FORM
// =====================================================

function openAddressForm() {

  document.getElementById(
    "deliveryAddressId"
  ).value = "";


  document.getElementById(
    "deliveryLabel"
  ).value = "Nhà riêng";


  document.getElementById(
    "deliveryRecipient"
  ).value =
    currentUser?.fullname || "";


  document.getElementById(
    "deliveryPhone"
  ).value =
    currentUser?.phone || "";


  document.getElementById(
    "deliveryAddress"
  ).value = "";


  document.getElementById(
    "deliveryCity"
  ).value = "";


  document.getElementById(
    "deliveryDefault"
  ).checked =
    deliveryAddresses.length === 0;


  document.getElementById(
    "deliveryAddressForm"
  ).classList.remove(
    "hidden"
  );


  document.getElementById(
    "deliveryAddressForm"
  ).scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


// =====================================================
// CLOSE FORM
// =====================================================

function closeAddressForm() {

  document.getElementById(
    "deliveryAddressForm"
  ).classList.add(
    "hidden"
  );

}


// =====================================================
// EDIT ADDRESS
// =====================================================

function editDeliveryAddress(id) {

  const item =
    deliveryAddresses.find(
      address =>
        Number(address.id) ===
        Number(id)
    );


  if (!item) {
    return;
  }


  document.getElementById(
    "deliveryAddressId"
  ).value =
    item.id;


  document.getElementById(
    "deliveryLabel"
  ).value =
    item.label || "";


  document.getElementById(
    "deliveryRecipient"
  ).value =
    item.recipient_name || "";


  document.getElementById(
    "deliveryPhone"
  ).value =
    item.phone || "";


  document.getElementById(
    "deliveryAddress"
  ).value =
    item.address || "";


  document.getElementById(
    "deliveryCity"
  ).value =
    item.city || "";


  document.getElementById(
    "deliveryDefault"
  ).checked =
    item.is_default === true;


  const form =
    document.getElementById(
      "deliveryAddressForm"
    );


  form.classList.remove(
    "hidden"
  );


  form.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


// =====================================================
// SAVE ADDRESS
// =====================================================

async function saveDeliveryAddress() {

  const id =
    document.getElementById(
      "deliveryAddressId"
    ).value;


  const label =
    document.getElementById(
      "deliveryLabel"
    ).value.trim();


  const recipientName =
    document.getElementById(
      "deliveryRecipient"
    ).value.trim();


  const phone =
    document.getElementById(
      "deliveryPhone"
    ).value.trim();


  const address =
    document.getElementById(
      "deliveryAddress"
    ).value.trim();


  const city =
    document.getElementById(
      "deliveryCity"
    ).value.trim();


  const isDefault =
    document.getElementById(
      "deliveryDefault"
    ).checked;


  if (
    !recipientName ||
    !phone ||
    !address ||
    !city
  ) {

    alert(
      "Vui lòng nhập đầy đủ tên người nhận, số điện thoại và địa chỉ."
    );

    return;
  }


  try {

    const response =
      await fetch(
        id
          ? `/api/delivery-addresses/${id}`
          : "/api/delivery-addresses",
        {
          method:
            id
              ? "PUT"
              : "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              "Bearer " + token
          },

          body: JSON.stringify({
            label,
            recipientName,
            phone,
            address,
            city,
            isDefault
          })
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
        "Không thể lưu địa chỉ."
      );

    }


    closeAddressForm();

    await loadDeliveryAddresses();

    openAddressFromCheckout();


  } catch (error) {

    console.error(
      "SAVE DELIVERY ADDRESS ERROR:",
      error
    );

    alert(
      error.message
    );

  }

}

function backToCheckout() {

  window.location.href =
    "/checkout.html";

}

// =====================================================
// SET DEFAULT
// =====================================================

async function setDefaultDeliveryAddress(
  id
) {

  try {

    const response =
      await fetch(
        `/api/delivery-addresses/${id}/default`,
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
        "Không thể đặt địa chỉ mặc định."
      );

    }


    await loadDeliveryAddresses();


  } catch (error) {

    alert(
      error.message
    );

  }

}


// =====================================================
// DELETE ADDRESS
// =====================================================

async function deleteDeliveryAddress(
  id
) {

  const confirmed =
    confirm(
      "Bạn có chắc muốn xóa địa chỉ giao hàng này?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        `/api/delivery-addresses/${id}`,
        {
          method: "DELETE",

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
        "Không thể xóa địa chỉ."
      );

    }


    closeAddressForm();

    await loadDeliveryAddresses();


  } catch (error) {

    alert(
      error.message
    );

  }

}
