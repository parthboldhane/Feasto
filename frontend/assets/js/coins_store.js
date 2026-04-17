const KEY_BALANCE = "feasto_coins_balance";
const KEY_COINS_PER_RUPEE = "feasto_coins_per_rupee";

export function getRupeesPerCoin() {
  const raw = localStorage.getItem(KEY_COINS_PER_RUPEE);
  const value = raw == null || raw === "" ? NaN : Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 5;
  return Math.floor(value);
}

export function setRupeesPerCoin(value) {
  const next = Number(value);
  if (!Number.isFinite(next) || next <= 0) return getRupeesPerCoin();
  const normalized = Math.floor(next);
  localStorage.setItem(KEY_COINS_PER_RUPEE, String(normalized));
  return normalized;
}

export function getStoredCoinBalance() {
  const raw = localStorage.getItem(KEY_BALANCE);
  const value = raw == null ? 0 : Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

export function addCoinsFromRupees(rupees) {
  const total = Number(rupees);
  if (!Number.isFinite(total) || total <= 0) return getStoredCoinBalance();
  const earned = Math.floor(total * getRupeesPerCoin());
  const next = getStoredCoinBalance() + earned;
  localStorage.setItem(KEY_BALANCE, String(next));
  return next;
}

export function addCoins(amount) {
  const coins = Number(amount);
  if (!Number.isFinite(coins) || coins <= 0) return getStoredCoinBalance();
  const next = getStoredCoinBalance() + Math.floor(coins);
  localStorage.setItem(KEY_BALANCE, String(next));
  return next;
}

export function spendCoins(amount) {
  const coins = Number(amount);
  if (!Number.isFinite(coins) || coins <= 0) return getStoredCoinBalance();
  const next = Math.max(0, getStoredCoinBalance() - Math.floor(coins));
  localStorage.setItem(KEY_BALANCE, String(next));
  return next;
}

export function formatCoinRule() {
  return `Earn ${getRupeesPerCoin()} coins for every Rs1 spent`;
}
