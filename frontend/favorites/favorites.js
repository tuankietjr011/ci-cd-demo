const token =
  localStorage.getItem("shoplux_token");


if (!token) {
  location.href = "/login.html";
}


function getFavoritesStorageKey() {
  const token = localStorage.getItem("shoplux_token");

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("shoplux_user") || "null"
    );
  } catch (error) {
    return null;
  }

  if (!token || !user?.id) {
    return null;
  }

  return `shoplux_favorites_user_${user.id}`;
}

const favoritesKey = getFavoritesStorageKey();

let favorites = JSON.parse(
  localStorage.getItem(favoritesKey) || "[]"
);


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


function renderFavorites() {

  const container =
    document.getElementById(
      "favoriteList"
    );

  const empty =
    document.getElementById(
      "emptyFavorites"
    );

  const count =
    document.getElementById(
      "favoriteCount"
    );


  count.textContent =
    `${favorites.length} sản phẩm yêu thích`;


  if (!favorites.length) {

    container.innerHTML = "";

    empty.classList.remove(
      "hidden"
    );

    return;
  }


  empty.classList.add(
    "hidden"
  );


  container.innerHTML =
    favorites.map(product => `

      <div
        class="
          bg-[#fffdf8]
          border
          relative
        "
        style="border-color:#e8d5a3"
      >

        <button
          onclick="
            removeFavorite(
              ${product.id}
            )
          "
          class="
            absolute
            top-3
            right-3
            z-20
            w-10
            h-10
            bg-white
            rounded-full
            shadow
            text-xl
            font-bold
          "
          style="color:#8b1e1e"
          title="Bỏ yêu thích"
        >
          ♥
        </button>


        <a
          href="/#detail-${product.id}"
          class="block"
        >

          <div
            class="
              aspect-[4/5]
              bg-[#efe4d2]
              overflow-hidden
            "
          >

            <img
              src="${product.image || ""}"
              alt="${escapeHTML(
                product.name
              )}"
              class="
                w-full
                h-full
                object-cover
                transition
                duration-300
                hover:scale-105
              "
            >

          </div>


          <div class="p-5">

            <div
              class="
                text-[10px]
                font-bold
                tracking-[3px]
              "
              style="color:#70452d"
            >
              ${escapeHTML(
                product.brand || ""
              )}
            </div>


            <h2
              class="
                luxury-font
                text-lg
                mt-3
                min-h-[52px]
              "
            >
              ${escapeHTML(
                product.name || ""
              )}
            </h2>


            <div
              class="
                font-bold
                mt-4
              "
              style="color:#3b2416"
            >
              ${money(
                product.price
              )}
            </div>


            ${
              product.originalPrice &&
              Number(
                product.originalPrice
              ) >
              Number(product.price)

                ? `
                  <div
                    class="
                      text-sm
                      text-gray-400
                      line-through
                      mt-1
                    "
                  >
                    ${money(
                      product.originalPrice
                    )}
                  </div>
                `

                : ""
            }

          </div>

        </a>

      </div>

    `).join("");

}


function removeFavorite(id) {

  favorites =
    favorites.filter(
      product =>
        Number(product.id) !==
        Number(id)
    );


  if (favoritesKey) {
  localStorage.setItem(
    favoritesKey,
    JSON.stringify(favorites)
  );
}


  renderFavorites();

}


renderFavorites();
