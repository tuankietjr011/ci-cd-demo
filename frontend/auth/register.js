document
  .getElementById("registerForm")
  .addEventListener("submit", async e => {

    e.preventDefault();

    const name =
      document.getElementById("name").value.trim();

    const email =
      document.getElementById("email").value.trim();

    const phone =
      document.getElementById("phone").value.trim();

    const password =
      document.getElementById("password").value;

    const confirmPassword =
      document.getElementById("confirmPassword").value;

    const message =
      document.getElementById("message");


    if (password !== confirmPassword) {
      message.textContent = "Mật khẩu nhập lại không khớp.";
      message.style.color = "#b91c1c";
      return;
    }


    message.textContent = "Đang tạo tài khoản...";
    message.style.color = "#70452d";


    try {

      const response = await fetch("/api/auth/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name,
          email,
          phone,
          password
        })
      });


      const data = await response.json();


      if (!response.ok || !data.success) {
        message.textContent =
          data.message || "Đăng ký thất bại.";

        message.style.color = "#b91c1c";
        return;
      }


      message.textContent =
        "Tạo tài khoản thành công! Đang chuyển sang đăng nhập...";

      message.style.color = "#166534";


      setTimeout(() => {
        location.href = "/login.html";
      }, 900);


    } catch {
      message.textContent =
        "Không thể kết nối máy chủ.";

      message.style.color = "#b91c1c";
    }

  });
