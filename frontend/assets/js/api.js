/**
 * Central fetch wrappers for Feasto frontend (no backend logic).
 * Paths are relative for static hosting + reverse proxy setups.
 */

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function getCrowd() {
  try {
    const res = await fetch("/api/crowd");
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return null;
  }
}

export async function createOrder(payload) {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateOrder(orderId, body) {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify(body ?? {}),
    });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return null;
  }
}

export async function loginUser(body) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: JSON_HEADERS,
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
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Placeholder for future backend subscription sync.
 * Persists client-side state only for now (no network).
 */
export async function updateSubscription(payload) {
  try {
    const res = await fetch("/api/admin/subscription", {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload ?? {}),
    });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return { ok: false, clientOnly: true };
  }
}
