/**
 * Auth API — adjust paths to match your backend (e.g. /api/auth/login).
 */

export async function loginUser(body) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function loginAdmin(body) {
  try {
    const res = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getSession() {
  try {
    const res = await fetch("/api/auth/session");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
