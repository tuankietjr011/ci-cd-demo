const token =
  localStorage.getItem(
    "shoplux_token"
  );


let currentUser = null;

let avatarData = "";

let editing = false;


// =====================================================
// AUTH
// =====================================================

if (!token) {

  window.location.href =
    "/login.html";

}


// =====================================================
// ESCAPE
// =====================================================

function escapeHTML(value = "") {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// =====================================================
// LOAD PROFILE
// =====================================================

async function loadProfile() {

  try {

    const response =
      await fetch(
        "/api/profile",
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
      response.status === 401 ||
      response.status === 403
    ) {

      localStorage.removeItem(
        "shoplux_token"
      );

      localStorage.removeItem(
        "shoplux_user"
      );

      window.location.href =
        "/login.html";

      return;
    }


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Không thể tải hồ sơ."
      );

    }


    currentUser =
      data.user;


    avatarData =
      currentUser.avatar || "";


    localStorage.setItem(
      "shoplux_user",
      JSON.stringify(currentUser)
    );


    renderProfile();

    await loadDeliveryAddresses();


  } catch (error) {

    document.getElementById(
      "message"
    ).textContent =
      error.message;

  }

}


// =====================================================
// RENDER
// =====================================================

function renderProfile() {

  if (!currentUser) {
    return;
  }


  document.getElementById(
    "fullname"
  ).value =
    currentUser.fullname || "";


  document.getElementById(
    "gender"
  ).value =
    currentUser.gender || "";


  let birthday = "";

  if (currentUser.birthday) {

    birthday =
      String(
        currentUser.birthday
      ).slice(0, 10);

  }


  document.getElementById(
    "birthday"
  ).value =
    birthday;


  document.getElementById(
    "phone"
  ).value =
    currentUser.phone || "";


  document.getElementById(
    "email"
  ).value =
    currentUser.email || "";


  document.getElementById(
    "profileName"
  ).textContent =
    currentUser.fullname ||
    "ShopLux Member";


  document.getElementById(
    "profileEmail"
  ).textContent =
    currentUser.email || "";


  renderAvatar();

  renderLinkedAccounts();

}


// =====================================================
// AVATAR
// =====================================================

function renderAvatar() {

  const image =
    document.getElementById(
      "avatarImage"
    );

  const fallback =
    document.getElementById(
      "avatarFallback"
    );


  if (avatarData) {

    image.src =
      avatarData;

    image.classList.remove(
      "hidden"
    );

    fallback.classList.add(
      "hidden"
    );

  } else {

    image.removeAttribute(
      "src"
    );

    image.classList.add(
      "hidden"
    );

    fallback.classList.remove(
      "hidden"
    );

  }

}


function readAvatar(event) {

  const file =
    event.target.files?.[0];


  if (!file) {
    return;
  }


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    alert(
      "Vui lòng chọn file ảnh."
    );

    return;
  }


  // Giới hạn 2MB
  if (
    file.size >
    2 * 1024 * 1024
  ) {

    alert(
      "Ảnh đại diện tối đa 2MB."
    );

    event.target.value = "";

    return;
  }


  const reader =
    new FileReader();


  reader.onload = () => {

    avatarData =
      reader.result;

    renderAvatar();

  };


  reader.readAsDataURL(file);

}


// =====================================================
// LINKED ACCOUNTS
// =====================================================

function renderLinkedAccounts() {

  const container =
    document.getElementById(
      "linkedAccounts"
    );


  const accounts =
    Array.isArray(
      currentUser?.linkedAccounts
    )
      ? currentUser.linkedAccounts
      : [];


  if (
    !editing &&
    accounts.length === 0
  ) {

    container.innerHTML = `
      <div
        class="
          border
          p-4
          text-sm
          text-gray-400
        "
        style="border-color:#e8d5a3"
      >
        Chưa liên kết tài khoản nào.
      </div>
    `;

    return;
  }


  container.innerHTML =
    accounts
      .map(
        (item, index) => {

          if (!editing) {

            return `
              <div
                class="
                  border
                  p-4
                  flex
                  justify-between
                  gap-4
                "
                style="
                  border-color:#e8d5a3
                "
              >

                <div>

                  <div
                    class="
                      text-xs
                      font-bold
                      uppercase
                    "
                  >
                    ${escapeHTML(
                      item.provider ||
                      "Tài khoản"
                    )}
                  </div>

                  <div
                    class="
                      text-sm
                      text-gray-500
                      mt-1
                    "
                  >
                    ${escapeHTML(
                      item.account || ""
                    )}
                  </div>

                </div>

                <i
                  class="
                    fa-solid
                    fa-link
                  "
                  style="
                    color:#c9a227
                  "
                ></i>

              </div>
            `;

          }


          return `
            <div
              class="
                linked-row
                grid
                md:grid-cols-[180px_1fr_auto]
                gap-3
              "
            >

              <select
                class="
                  linked-provider
                  border
                  p-3
                  bg-white
                "
                style="
                  border-color:#e8d5a3
                "
              >

                <option
                  value="Google"
                  ${
                    item.provider ===
                    "Google"
                      ? "selected"
                      : ""
                  }
                >
                  Google
                </option>

                <option
                  value="Facebook"
                  ${
                    item.provider ===
                    "Facebook"
                      ? "selected"
                      : ""
                  }
                >
                  Facebook
                </option>

                <option
                  value="Apple"
                  ${
                    item.provider ===
                    "Apple"
                      ? "selected"
                      : ""
                  }
                >
                  Apple
                </option>

                <option
                  value="Khác"
                  ${
                    ![
                      "Google",
                      "Facebook",
                      "Apple"
                    ].includes(
                      item.provider
                    )
                      ? "selected"
                      : ""
                  }
                >
                  Khác
                </option>

              </select>


              <input
                class="
                  linked-account
                  border
                  p-3
                "
                style="
                  border-color:#e8d5a3
                "
                value="${escapeHTML(
                  item.account || ""
                )}"
                placeholder="Email hoặc tên tài khoản"
              >


              <button
                onclick="
                  removeLinkedAccount(
                    ${index}
                  )
                "
                class="
                  border
                  px-4
                  font-bold
                "
                style="
                  border-color:#b91c1c;
                  color:#b91c1c;
                "
              >
                <i
                  class="
                    fa-solid
                    fa-trash
                  "
                ></i>
              </button>

            </div>
          `;

        }
      )
      .join("");


  if (
    editing &&
    accounts.length === 0
  ) {

    container.innerHTML = `
      <div
        class="
          text-sm
          text-gray-400
          py-2
        "
      >
        Chưa có tài khoản liên kết.
      </div>
    `;

  }

}


function collectLinkedAccounts() {

  return Array.from(
    document.querySelectorAll(
      ".linked-row"
    )
  )
    .map(row => ({

      provider:
        row.querySelector(
          ".linked-provider"
        )?.value || "",

      account:
        row.querySelector(
          ".linked-account"
        )?.value.trim() || ""

    }))
    .filter(
      item =>
        item.provider ||
        item.account
    );

}


function syncLinkedAccounts() {

  if (!editing) {
    return;
  }

  currentUser.linkedAccounts =
    collectLinkedAccounts();

}


function addLinkedAccount() {

  syncLinkedAccounts();


  if (
    !Array.isArray(
      currentUser.linkedAccounts
    )
  ) {

    currentUser.linkedAccounts = [];

  }


  currentUser.linkedAccounts.push({
    provider: "Google",
    account: ""
  });


  renderLinkedAccounts();

}


function removeLinkedAccount(index) {

  syncLinkedAccounts();


  currentUser.linkedAccounts.splice(
    index,
    1
  );


  renderLinkedAccounts();

}


// =====================================================
// EDIT MODE
// =====================================================

function enableEdit() {

  editing = true;


  [
    "fullname",
    "gender",
    "birthday",
    "phone"
  ].forEach(id => {

    document.getElementById(
      id
    ).disabled = false;

  });


  document.getElementById(
    "editButton"
  ).classList.add(
    "hidden"
  );


  document.getElementById(
    "editActions"
  ).classList.remove(
    "hidden"
  );


  document.getElementById(
    "avatarEditButton"
  ).classList.remove(
    "hidden"
  );

  document.getElementById(
    "avatarEditButton"
  ).classList.add(
    "flex"
  );


  document.getElementById(
    "addLinkedButton"
  ).classList.remove(
    "hidden"
  );


  renderLinkedAccounts();

}


function cancelEdit() {

  editing = false;

  avatarData =
    currentUser.avatar || "";


  [
    "fullname",
    "gender",
    "birthday",
    "phone"
  ].forEach(id => {

    document.getElementById(
      id
    ).disabled = true;

  });


  document.getElementById(
    "editButton"
  ).classList.remove(
    "hidden"
  );


  document.getElementById(
    "editActions"
  ).classList.add(
    "hidden"
  );


  document.getElementById(
    "avatarEditButton"
  ).classList.add(
    "hidden"
  );

  document.getElementById(
    "avatarEditButton"
  ).classList.remove(
    "flex"
  );


  document.getElementById(
    "addLinkedButton"
  ).classList.add(
    "hidden"
  );


  renderProfile();

}


// =====================================================
// SAVE
// =====================================================

async function saveProfile() {

  const button =
    document.getElementById(
      "saveButton"
    );

  const message =
    document.getElementById(
      "message"
    );


  syncLinkedAccounts();


  const payload = {

    fullname:
      document.getElementById(
        "fullname"
      ).value.trim(),

    gender:
      document.getElementById(
        "gender"
      ).value,

    birthday:
      document.getElementById(
        "birthday"
      ).value || null,

    phone:
      document.getElementById(
        "phone"
      ).value.trim(),

    avatar:
      avatarData,

    linkedAccounts:
      currentUser.linkedAccounts || []

  };


  if (!payload.fullname) {

    alert(
      "Vui lòng nhập họ và tên."
    );

    return;

  }


  try {

    button.disabled = true;

    button.textContent =
      "ĐANG LƯU...";


    message.textContent = "";


    const response =
      await fetch(
        "/api/profile",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              "Bearer " + token
          },

          body:
            JSON.stringify(payload)
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
        "Không thể lưu thông tin."
      );

    }


    currentUser =
      data.user;

    avatarData =
      currentUser.avatar || "";


    localStorage.setItem(
      "shoplux_user",
      JSON.stringify(currentUser)
    );


    editing = false;


    [
      "fullname",
      "gender",
      "birthday",
      "phone"
    ].forEach(id => {

      document.getElementById(
        id
      ).disabled = true;

    });


    document.getElementById(
      "editButton"
    ).classList.remove(
      "hidden"
    );


    document.getElementById(
      "editActions"
    ).classList.add(
      "hidden"
    );


    document.getElementById(
      "avatarEditButton"
    ).classList.add(
      "hidden"
    );

    document.getElementById(
      "avatarEditButton"
    ).classList.remove(
      "flex"
    );


    document.getElementById(
      "addLinkedButton"
    ).classList.add(
      "hidden"
    );


    renderProfile();


    message.textContent =
      "Đã cập nhật thông tin cá nhân.";

    message.className =
      "text-sm mt-5 text-right text-green-700";


  } catch (error) {

    console.error(
      "SAVE PROFILE ERROR:",
      error
    );


    message.textContent =
      error.message;

    message.className =
      "text-sm mt-5 text-right text-red-600";


  } finally {

    button.disabled = false;

    button.innerHTML = `
      <i
        class="
          fa-solid
          fa-floppy-disk
          mr-2
        "
      ></i>
      LƯU THÔNG TIN
    `;

  }

}


// =====================================================
// START
// =====================================================

// =====================================================
// OPEN ADDRESS FROM CHECKOUT
// =====================================================

function openAddressFromCheckout() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const editAddressId =
    params.get("editAddress");


  if (!editAddressId) {
    return;
  }


  const id =
    Number(editAddressId);


  if (!id) {
    return;
  }


  const item =
    deliveryAddresses.find(
      address =>
        Number(address.id) === id
    );


  if (!item) {
    return;
  }

const backButton =
  document.getElementById(
    "backToCheckoutBtn"
  );

if (backButton) {
  backButton.classList.remove(
    "hidden"
  );
}

  editDeliveryAddress(id);

}

loadProfile();
