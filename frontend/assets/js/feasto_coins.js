/**
 * Feasto coins — localStorage until backend provides balance.
 * ₹1 spent (order total) × multiplier = coins earned (integer floor).
 */

const KEY_BALANCE = "feasto_coins_balance";
const KEY_MULTIPLIER = "feasto_coin_multiplier";

export function getCoinMultiplier() {
  const raw = localStorage.getItem(KEY_MULTIPLIER);
  const n = raw == null || raw === "" ? NaN : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 10;
  return n;
}

export function setCoinMultiplier(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return;
  localStorage.setItem(KEY_MULTIPLIER, String(v));
}

export function getStoredCoinBalance() {
  const raw = localStorage.getItem(KEY_BALANCE);
  const n = raw == null ? 0 : Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function addCoinsFromRupees(rupees) {
  const r = Number(rupees);
  if (!Number.isFinite(r) || r <= 0) return getStoredCoinBalance();
  const add = Math.floor(r * getCoinMultiplier());
  const next = getStoredCoinBalance() + add;
  localStorage.setItem(KEY_BALANCE, String(next));
  return next;
}
