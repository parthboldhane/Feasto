import { logout as apiLogout } from "../../api/auth_api.js";

export async function initUserLogin(formId = "login-form") {
  const form = document.getElementById(formId);
  if (!form) return;
  form.noValidate = true;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("login-message");
    if (msg) {
      msg.textContent = "";
      msg.className = "";
    }

    const fd = new FormData(form);
    const credentials = {
      username: String(fd.get("username") || "").trim(),
      password: String(fd.get("password") || ""),
    };

    if (credentials.username === "USER" && credentials.password === "K@143") {
      localStorage.setItem("ROLE", "user");
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "/user/dashboard.html";
      return;
    }
    if (msg) {
      msg.textContent = "Invalid username or password";
      msg.className = "msg-error";
    }
  });
}

export async function initAdminLogin(formId = "admin-login-form") {
  const form = document.getElementById(formId);
  if (!form) return;
  form.noValidate = true;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("admin-login-message");
    if (msg) {
      msg.textContent = "";
      msg.className = "";
    }

    const fd = new FormData(form);
    const credentials = {
      username: String(fd.get("username") || "").trim(),
      password: String(fd.get("password") || ""),
    };

    if (credentials.username === "ADMIN" && credentials.password === "K@143") {
      localStorage.setItem("ROLE", "admin");
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "/admin/dashboard.html";
      return;
    }
    if (msg) {
      msg.textContent = "Invalid username or password";
      msg.className = "msg-error";
    }
  });
}

/**
 * Wire logout link after navbar mount.
 * @param {'user'|'admin'} role
 */
export function attachLogoutHandler(role = "user") {
  const el = document.getElementById("nav-logout");
  if (!el) return;

  el.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await apiLogout();
    } catch {
      // ignore logout failures; local session still clears
    }
    localStorage.clear();
    window.location.href = "/index.html";
  });
}
