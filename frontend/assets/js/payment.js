/**
 * Optional payment step — wire when backend exposes a payment endpoint.
 */

export async function createPaymentIntent(orderId) {
  try {
    const res = await fetch("/api/payment/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}
