/**
 * Orders, menu, rewards, feedback — backend-ready fetch wrappers.
 */

export async function getMenu() {
  try {
    const res = await fetch("/api/menu");
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}

export async function placeOrder(payload) {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}

export async function getOrders() {
  try {
    const res = await fetch("/api/orders");
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}

export async function getRewards() {
  try {
    const res = await fetch("/api/rewards");
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}

export async function redeemReward(rewardId) {
  try {
    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardId }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}

export async function submitFeedback(payload) {
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}

export async function getFeedbackList() {
  try {
    const res = await fetch("/api/feedback");
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}
