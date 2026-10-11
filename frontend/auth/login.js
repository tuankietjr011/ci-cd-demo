function togglePassword() {
  const input = document.getElementById("password");
  const icon = document.getElementById("eyeIcon");

  if (input.type === "password") {
    input.type = "text";
    icon.className = "fa-regular fa-eye-slash";
  } else {
    input.type = "password";
    icon.className = "fa-regular fa-eye";
  }
}

document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();

  const message = document.getElementById("message");

  message.textContent = "Đang đăng nhập...";
  message.style.color = "#70452d";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      message.textContent = data.message || "Đăng nhập thất bại.";
      message.style.color = "#b91c1c";
      return;
    }

    if (data.token) {
      localStorage.setItem("shoplux_token", data.token);
    }

    localStorage.setItem(
      "shoplux_user",
      JSON.stringify(data.user)
    );

    message.textContent = "Đăng nhập thành công.";
    message.style.color = "#166534";

    setTimeout(() => {
      location.href = "/";
    }, 500);

  } catch {
    message.textContent = "Không thể kết nối máy chủ.";
    message.style.color = "#b91c1c";
  }
});

function loginGoogle() {
  location.href = "/api/auth/google";
}

function loginFacebook() {
  location.href = "/api/auth/facebook";
}
