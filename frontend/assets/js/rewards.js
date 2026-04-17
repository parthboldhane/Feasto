import { getRewards, redeemReward } from "../../api/order_api.js";
import { showLoading, showError, escapeHtml } from "./main.js";
import {
  getCoinMultiplier,
  setCoinMultiplier,
  getStoredCoinBalance,
} from "./feasto_coins.js";

function normalizeRewards(raw) {
  if (raw == null) return { coins: null, options: [] };
  const coins = raw.coins ?? raw.balance ?? raw.points ?? null;
  let options = raw.redeemOptions ?? raw.options ?? raw.rewards ?? raw.items;
  if (!Array.isArray(options)) options = [];
  return { coins, options };
}

export function initRewardsPage() {
  const root = document.getElementById("rewards-root");
  const msg = document.getElementById("rewards-message");
  if (!root) return;

  async function load() {
    showLoading(root);
    const raw = await getRewards();
    if (raw == null) {
      showError(root, "Could not load rewards.");
      return;
    }

    const { coins, options } = normalizeRewards(raw);
    const localCoins = getStoredCoinBalance();
    const mult = getCoinMultiplier();
    const serverParsed = coins != null ? Number(coins) : NaN;
    const serverNum = Number.isFinite(serverParsed) ? serverParsed : null;
    const totalDisplay =
      serverNum != null ? localCoins + serverNum : localCoins;
    const serverLine =
      serverNum != null
        ? `<p style="margin:0.35rem 0 0;font-size:0.85rem;color:var(--text-secondary);">Includes ${escapeHtml(String(serverNum))} from server response + ${escapeHtml(String(localCoins))} stored on this device.</p>`
        : `<p style="margin:0.35rem 0 0;font-size:0.85rem;color:var(--text-secondary);">Order rewards are stored locally until the backend syncs balances.</p>`;

    const coinsHtml = `<p class="coins-display">${escapeHtml(String(totalDisplay))} <span style="font-size:1rem;color:var(--text-secondary);font-weight:500;">Feasto coins</span></p>${serverLine}
      <div class="rewards-coins-meta">
        <label for="feasto-coin-mult">Coins earned per ₹1 spent (orders)</label>
        <input class="input" type="number" id="feasto-coin-mult" min="0.1" step="0.1" value="${escapeHtml(String(mult))}" />
      </div>`;

    if (options.length === 0) {
      root.innerHTML = `
        <div class="card">
          <h2 class="card__title">Your balance</h2>
          ${coinsHtml}
          <p style="color:var(--text-secondary);margin:0;">No redeem options listed yet.</p>
        </div>
      `;
      wireCoinMultiplierInput(root);
      return;
    }

    const listItems = options
      .map((opt, i) => {
        const id = opt.id ?? opt._id ?? `opt-${i}`;
        const title = opt.title ?? opt.name ?? "Reward";
        const cost = opt.cost ?? opt.coins ?? opt.price ?? "—";
        return `<li data-id="${escapeHtml(String(id))}">
          <span>${escapeHtml(String(title))} <span style="color:var(--text-secondary);">(${escapeHtml(String(cost))} coins)</span></span>
          <button type="button" class="btn btn--primary btn-redeem">Redeem</button>
        </li>`;
      })
      .join("");

    root.innerHTML = `
      <div class="card">
        <h2 class="card__title">Your balance</h2>
        ${coinsHtml}
        <h3 class="card__title" style="margin-top:1.25rem;">Redeem</h3>
        <ul class="redeem-list">${listItems}</ul>
      </div>
    `;

    wireCoinMultiplierInput(root);

    root.querySelectorAll(".btn-redeem").forEach((btn) => {
      const li = btn.closest("li");
      const id = li?.getAttribute("data-id");
      btn.addEventListener("click", async () => {
        if (!id || msg == null) return;
        msg.textContent = "";
        msg.className = "";
        btn.disabled = true;
        const res = await redeemReward(id);
        btn.disabled = false;
        if (res == null) {
          msg.textContent = "Redeem failed. Check balance or try again.";
          msg.className = "msg-error";
          return;
        }
        msg.textContent = "Redeemed successfully.";
        msg.className = "msg-success";
        load();
      });
    });
  }

  load();
}

function wireCoinMultiplierInput(root) {
  const input = root.querySelector("#feasto-coin-mult");
  if (!input) return;
  input.addEventListener("change", () => {
    setCoinMultiplier(input.value);
  });
}
