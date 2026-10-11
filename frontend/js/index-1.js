async function loadShopLuxAccount() {

  const token =
    localStorage.getItem("shoplux_token");

  const accountName =
    document.getElementById("accountName");

  const dropdownName =
    document.getElementById("accountDropdownName");

  const emailElement =
    document.getElementById("accountEmail");

  const guestActions =
    document.getElementById("guestAccountActions");

  const loggedActions =
    document.getElementById("loggedAccountActions");


  // CHƯA ĐĂNG NHẬP
  if (!token) {

    if (accountName) {
      accountName.textContent = "TÀI KHOẢN";
    }

    if (dropdownName) {
      dropdownName.textContent = "ShopLux Member";
    }

    if (guestActions) {
      guestActions.classList.remove("hidden");
    }

    if (loggedActions) {
      loggedActions.classList.add("hidden");
    }

    return;
  }


  try {

    const response = await fetch(
      "/api/auth/me",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();


    // TOKEN HẾT HẠN / KHÔNG HỢP LỆ
    if (!response.ok || !data.success) {

      localStorage.removeItem(
        "shoplux_token"
      );

      localStorage.removeItem(
        "shoplux_user"
      );

      showGuestAccount();

      return;
    }


    const user = data.user;

const avatarImage =
  document.getElementById(
    "accountAvatarImage"
  );

const avatarIcon =
  document.getElementById(
    "accountAvatarIcon"
  );


if (
  user.avatar &&
  avatarImage
) {

  avatarImage.src =
    user.avatar;

  avatarImage.classList.remove(
    "hidden"
  );

  if (avatarIcon) {
    avatarIcon.classList.add(
      "hidden"
    );
  }

} else {

  if (avatarImage) {

    avatarImage.classList.add(
      "hidden"
    );

    avatarImage.removeAttribute(
      "src"
    );

  }

  if (avatarIcon) {
    avatarIcon.classList.remove(
      "hidden"
    );
  }

}

    // KÊNH NGƯỜI BÁN - CHỈ ADMIN
const sellerChannel =
  document.getElementById("sellerChannel");

if (sellerChannel) {
  if (user.role === "admin") {
    sellerChannel.classList.remove("hidden");
  } else {
    sellerChannel.classList.add("hidden");
  }
}


localStorage.setItem(
  "shoplux_user",
  JSON.stringify(user)
);


    localStorage.setItem(
      "shoplux_user",
      JSON.stringify(user)
    );


    // HEADER
    if (accountName) {

      const firstName =
        user.fullname
          ?.trim()
          .split(/\s+/)
          .pop();

      accountName.textContent =
        firstName
          ? firstName.toUpperCase()
          : "TÀI KHOẢN";
    }


    // DROPDOWN NAME
    if (dropdownName) {

      dropdownName.textContent =
        user.fullname;
    }


    // EMAIL
    if (emailElement) {

      emailElement.textContent =
        user.email;
    }


    // ẨN LOGIN / REGISTER
    if (guestActions) {

      guestActions.classList.add(
        "hidden"
      );
    }


    // HIỆN LOGOUT
    if (loggedActions) {

      loggedActions.classList.remove(
        "hidden"
      );
    }

  } catch (error) {

    console.error(
      "Account error:",
      error
    );

  }

}


function showGuestAccount() {

  const accountName =
    document.getElementById("accountName");

  const dropdownName =
    document.getElementById(
      "accountDropdownName"
    );

  const guestActions =
    document.getElementById(
      "guestAccountActions"
    );

  const loggedActions =
    document.getElementById(
      "loggedAccountActions"
    );


  if (accountName) {
    accountName.textContent =
      "TÀI KHOẢN";
  }


  if (dropdownName) {
    dropdownName.textContent =
      "ShopLux Member";
  }


  if (guestActions) {
    guestActions.classList.remove(
      "hidden"
    );
  }


  if (loggedActions) {
    loggedActions.classList.add(
      "hidden"
    );
  }

}


function logoutShopLux() {

  // Chỉ đăng xuất tài khoản.
  // KHÔNG xóa giỏ hàng riêng của user.
  localStorage.removeItem(
    "shoplux_token"
  );

  localStorage.removeItem(
    "shoplux_user"
  );


  // Xóa dữ liệu checkout tạm
  localStorage.removeItem(
    "shoplux_checkout"
  );

  localStorage.removeItem(
    "shoplux_checkout_source"
  );

  localStorage.removeItem(
    "shoplux_checkout_keys"
  );


  // Giỏ shoplux_cart_user_ID
  // vẫn được giữ nguyên để đăng nhập lại còn sản phẩm.

  window.location.href = "/";
}

document.addEventListener(
  "DOMContentLoaded",
  loadShopLuxAccount
);
