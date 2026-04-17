/**
 * Admin subscription — localStorage only (UI / client state).
 * Keys: isSubscribed (boolean string), planType ("monthly" | "yearly"), expiryDate (ISO).
 */

const LS = {
  isSubscribed: "isSubscribed",
  planType: "planType",
  expiryDate: "expiryDate",
};

export function getSubscriptionState() {
  const rawSub = localStorage.getItem(LS.isSubscribed);
  const planType = localStorage.getItem(LS.planType) || "";
  const expiryDate = localStorage.getItem(LS.expiryDate) || "";
  const isSubscribed = rawSub === "true";
  const expMs = expiryDate ? new Date(expiryDate).getTime() : NaN;
  const dateValid = !Number.isNaN(expMs);
  const expiredByDate = dateValid && expMs <= Date.now();
  const active = isSubscribed && dateValid && expMs > Date.now();
  return {
    isSubscribed,
    planType: planType === "yearly" || planType === "monthly" ? planType : "",
    expiryDate,
    /** Subscribed flag true and expiry strictly in the future */
    isActive: active,
    /** Expiry timestamp has passed (date-driven, no client-side crowd logic) */
    isExpired: expiredByDate,
  };
}

export function setSubscriptionAfterPayment(planType) {
  const now = Date.now();
  const ms = planType === "yearly" ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
  const expiry = new Date(now + ms).toISOString();
  localStorage.setItem(LS.isSubscribed, "true");
  localStorage.setItem(LS.planType, planType === "yearly" ? "yearly" : "monthly");
  localStorage.setItem(LS.expiryDate, expiry);
}

export function clearSubscriptionForDemo() {
  localStorage.removeItem(LS.isSubscribed);
  localStorage.removeItem(LS.planType);
  localStorage.removeItem(LS.expiryDate);
}
