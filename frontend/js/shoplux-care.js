
(() => {
  if (document.getElementById("shoplux-care-widget")) return;

  const icons = {
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.7L7.5 9.6a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 1.7-.6l2.8.4a2 2 0 0 1 1.6 1.9Z"/>',
    box: '<path d="m21 8-9-5-9 5v8l9 5 9-5V8Z"/><path d="m3.3 7.5 8.7 5 8.7-5M12 22V12.5"/>',
    return: '<path d="M3 7v6h6"/><path d="M5 13a8 8 0 1 0 2-6L3 10"/>',
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

  const items = [
    {id:"chat",title:"Chat hỗ trợ",desc:"Trò chuyện với nhân viên",icon:"chat"},
    {id:"contact",title:"Liên hệ cửa hàng",desc:"Hotline và email",icon:"phone"},
    {id:"orders",title:"Theo dõi đơn hàng",desc:"Kiểm tra tình trạng giao hàng",icon:"box"},
    {id:"returns",title:"Đổi trả hàng",desc:"Hướng dẫn đổi trả sản phẩm",icon:"return"},
    {id:"warranty",title:"Bảo hành",desc:"Chính sách và yêu cầu bảo hành",icon:"shield"},
    {id:"faq",title:"Câu hỏi thường gặp",desc:"Giải đáp các thắc mắc",icon:"help"}
  ];

  const details = {
    chat: `<p>ShopLux luôn sẵn sàng tiếp nhận yêu cầu hỗ trợ của bạn.</p>
      <p>Hệ thống trò chuyện trực tiếp với nhân viên cần được kết nối với máy chủ hỗ trợ. Hiện tại bạn có thể gửi yêu cầu qua trang liên hệ khi cửa hàng cập nhật thông tin chính thức.</p>`,
    contact: `<p><strong>Thông tin liên hệ ShopLux</strong></p>
      <p>Hotline: Chưa được cấu hình.</p><p>Email: Chưa được cấu hình.</p>
      <p>Vui lòng cập nhật hotline và email chính thức của cửa hàng để khách hàng có thể liên hệ trực tiếp.</p>`,
    orders: `<p>Bạn có thể xem các đơn hàng đã đặt và kiểm tra trạng thái xử lý, giao hàng tại trang đơn hàng.</p>
      <a class="sl-care-action" href="/orders/">Xem đơn hàng</a>`,
    returns: `<p>Khi cần đổi hoặc trả sản phẩm, bạn nên chuẩn bị mã đơn hàng và thông tin sản phẩm.</p>
      <ul><li>Kiểm tra điều kiện đổi trả được công bố bởi ShopLux.</li><li>Giữ sản phẩm và phụ kiện đi kèm.</li><li>Liên hệ cửa hàng để xác nhận yêu cầu trước khi gửi hàng.</li></ul>
      <p>Chính sách và thời hạn cụ thể cần được cửa hàng cập nhật.</p>`,
    warranty: `<p>Để yêu cầu bảo hành, hãy chuẩn bị mã đơn hàng, tên sản phẩm và mô tả lỗi.</p>
      <ul><li>Kiểm tra điều kiện bảo hành của sản phẩm.</li><li>Giữ hóa đơn hoặc thông tin mua hàng.</li><li>Liên hệ ShopLux để được hướng dẫn.</li></ul>
      <p>Thời hạn và điều kiện bảo hành cần được cửa hàng xác nhận.</p>`,
    faq: `<p><strong>1. Làm sao để theo dõi đơn hàng?</strong><br>Chọn mục Theo dõi đơn hàng trong ShopLux Care.</p>
      <p><strong>2. Tôi có thể đổi trả sản phẩm không?</strong><br>Vui lòng kiểm tra chính sách đổi trả chính thức của cửa hàng.</p>
      <p><strong>3. Làm sao để được hỗ trợ?</strong><br>Chọn Chat hỗ trợ hoặc Liên hệ cửa hàng.</p>
      <p><strong>4. Làm sao để xem sản phẩm yêu thích?</strong><br>Mở mục Yêu thích trên website.</p>`
  };

  const widget = document.createElement("div");
  widget.id = "shoplux-care-widget";
  widget.innerHTML = `
    <section id="shoplux-care-panel" role="dialog" aria-label="ShopLux Care" aria-modal="false">
      <header class="sl-care-header">
        <div class="sl-care-brand"><div class="sl-care-logo">S</div><div><strong>ShopLux Care</strong><small>CUSTOMER SERVICE</small></div></div>
        <button class="sl-care-close" type="button" aria-label="Đóng">&times;</button>
      </header>
      <div class="sl-care-body">
        <div id="sl-care-home">
          <h3>Xin chào! 👋</h3>
          <p class="sl-care-intro">Chúng tôi luôn sẵn sàng hỗ trợ bạn!<br>Bạn cần giúp đỡ? Hãy chọn nội dung cần hỗ trợ bên dưới.</p>
          <input id="sl-care-search" type="search" placeholder="Tìm kiếm câu hỏi hoặc vấn đề..." aria-label="Tìm kiếm hỗ trợ">
          <div class="sl-care-options" id="sl-care-options"></div>
        </div>
        <div id="sl-care-detail-view" hidden>
          <button class="sl-care-back" type="button">← Quay lại</button>
          <h3 id="sl-care-detail-title"></h3>
          <div class="sl-care-detail" id="sl-care-detail-content"></div>
        </div>
      </div>
      <footer class="sl-care-footer">SHOPLUX · WE ARE HERE TO HELP</footer>
    </section>
    <button id="shoplux-care-launcher" type="button" aria-expanded="false" aria-controls="shoplux-care-panel">
      ${svg("chat")} <span>Hỗ trợ</span>
    </button>`;
  document.body.appendChild(widget);

  const panel = widget.querySelector("#shoplux-care-panel");
  const launcher = widget.querySelector("#shoplux-care-launcher");
  const home = widget.querySelector("#sl-care-home");
  const detailView = widget.querySelector("#sl-care-detail-view");
  const options = widget.querySelector("#sl-care-options");
  const search = widget.querySelector("#sl-care-search");

  function renderOptions(query = "") {
    const q = query.trim().toLocaleLowerCase("vi");
    const filtered = items.filter(x => (x.title + " " + x.desc).toLocaleLowerCase("vi").includes(q));
    options.innerHTML = filtered.length ? filtered.map(x => `
      <button class="sl-care-option" type="button" data-id="${x.id}">
        <span class="sl-care-icon">${svg(x.icon)}</span>
        <strong>${x.title}</strong><span>${x.desc}</span>
      </button>`).join("") : `<p class="sl-care-intro">Không tìm thấy nội dung phù hợp.</p>`;
  }

  function showHome() {
    home.hidden = false;
    detailView.hidden = true;
    search.value = "";
    renderOptions();
  }

  function showDetail(id) {
    const item = items.find(x => x.id === id);
    if (!item) return;
    home.hidden = true;
    detailView.hidden = false;
    widget.querySelector("#sl-care-detail-title").textContent = item.title;
    widget.querySelector("#sl-care-detail-content").innerHTML = details[id];
  }

  renderOptions();
  launcher.addEventListener("click", () => {
    const open = panel.classList.toggle("is-open");
    launcher.setAttribute("aria-expanded", String(open));
    if (open) showHome();
  });
  widget.querySelector(".sl-care-close").addEventListener("click", () => {
    panel.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
  });
  widget.querySelector(".sl-care-back").addEventListener("click", showHome);
  options.addEventListener("click", e => {
    const button = e.target.closest("[data-id]");
    if (button) showDetail(button.dataset.id);
  });
  search.addEventListener("input", () => renderOptions(search.value));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) {
      panel.classList.remove("is-open");
      launcher.setAttribute("aria-expanded", "false");
    }
  });
})();
