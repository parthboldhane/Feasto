import { escapeHtml } from "./main.js";
import {
  addCoins,
  formatCoinRule,
  getRupeesPerCoin,
  getStoredCoinBalance,
  setRupeesPerCoin,
  spendCoins,
} from "./coins_store.js";

const MENU_KEY = "menuItems";
const ORDERS_KEY = "orders";
const ORDER_HISTORY_KEY = "orderHistory";

function createPlaceholderImage(label, hue) {
  const safeLabel = String(label).replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="hsl(${hue} 75% 52%)"/><text x="60" y="68" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="white">${safeLabel}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeMenuItem(item, fallbackId = Date.now()) {
  const category = String(item?.category || "snacks").toLowerCase() === "drinks" ? "drinks" : "snacks";
  const price = Number(item?.price);
  return {
    id: item?.id ?? fallbackId,
    name: String(item?.name || "Untitled Item"),
    price: Number.isFinite(price) && price > 0 ? price : 0,
    category,
    image: typeof item?.image === "string" ? item.image : "",
  };
}

function getMenuItems() {
  const stored = readJson(MENU_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored.map((item, index) => normalizeMenuItem(item, Date.now() + index));
}

function saveMenuItems(items) {
  writeJson(MENU_KEY, items.map((item, index) => normalizeMenuItem(item, Date.now() + index)));
}

function getOrders() {
  const stored = readJson(ORDERS_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

function saveOrders(orders) {
  writeJson(ORDERS_KEY, orders);
}

function getOrderHistory() {
  const stored = readJson(ORDER_HISTORY_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

function saveOrderHistory(history) {
  writeJson(ORDER_HISTORY_KEY, history);
}

function toCurrency(value) {
  return `Rs${Math.max(0, Number(value) || 0).toFixed(0)}`;
}

function titleCaseCategory(category) {
  return String(category || "snacks").toLowerCase() === "drinks" ? "Drinks" : "Snacks";
}

function groupMenu(items) {
  return items.reduce((acc, item) => {
    const key = item.category === "drinks" ? "drinks" : "snacks";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function groupCart(cart) {
  return cart.reduce((acc, item) => {
    const key = String(item.id);
    if (!acc[key]) acc[key] = { ...item, qty: 0 };
    acc[key].qty += 1;
    return acc;
  }, {});
}

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
}

function getDiscountFromCoins(coins) {
  const safeCoins = Math.max(0, Math.floor(Number(coins) || 0));
  if (safeCoins < 100) return 0;
  return Math.floor(safeCoins / 100) * 2;
}

function getAllowedCoins(requestedCoins, total) {
  const balance = getStoredCoinBalance();
  const maxByTotal = Math.floor(Math.max(0, Number(total) || 0) / 2) * 100;
  const clamped = Math.min(Math.max(0, Math.floor(Number(requestedCoins) || 0)), balance, maxByTotal);
  return Math.floor(clamped / 100) * 100;
}

function getCoinsEarned(amount) {
  return Math.floor(Math.max(0, Number(amount) || 0) * getRupeesPerCoin());
}

function getPaymentMode(config) {
  if (config.paymentInputName) {
    const selected = document.querySelector(`input[name="${config.paymentInputName}"]:checked`);
    if (selected?.value === "upi") return "UPI";
    if (selected?.value === "cod") return "Cash on delivery";
  }
  return config.defaultPaymentMode || "Demo";
}

function renderCoinSummary(ruleEl, balanceEl) {
  if (ruleEl) ruleEl.textContent = formatCoinRule();
  if (balanceEl) balanceEl.textContent = `${getStoredCoinBalance()} coins available`;
}

function renderMenuSectionHtml(grouped) {
  return Object.entries(grouped)
    .map(
      ([category, items]) => `
        <section class="menu-section">
          <h3 class="card__title">${escapeHtml(titleCaseCategory(category))}</h3>
          <div class="menu-grid">
            ${items
              .map(
                (item) => `
                  <div class="card menu-item">
                    <div class="menu-item__media">
                      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="food-img" />
                      <div class="menu-item__content">
                        <h4 class="menu-item__title">${escapeHtml(item.name)}</h4>
                        <p class="menu-item__price">${escapeHtml(toCurrency(item.price))}</p>
                      </div>
                    </div>
                    <button
                      class="btn btn--primary add-to-cart"
                      data-id="${escapeHtml(String(item.id))}"
                      data-name="${escapeHtml(item.name)}"
                      data-price="${escapeHtml(String(item.price))}"
                      data-image="${escapeHtml(item.image)}"
                      data-category="${escapeHtml(item.category)}"
                      type="button"
                    >
                      Add
                    </button>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
}

function renderCart(root, cart, redemption) {
  if (!root) return;

  if (cart.length === 0) {
    root.innerHTML = `<p style="color:var(--text-secondary);margin:0;">No items in your tray yet.</p>`;
    return;
  }

  const grouped = Object.values(groupCart(cart));
  const subtotal = getCartTotal(cart);
  const discount = Math.min(subtotal, Number(redemption?.discount) || 0);
  const finalPrice = Math.max(0, subtotal - discount);
  const earnedCoins = getCoinsEarned(finalPrice);

  root.innerHTML = `
    <div class="cart-items">
      ${grouped
        .map(
          (item) => `
            <div class="cart-item">
              <div class="cart-item__info">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="food-img food-img--small" />
                <div>
                  <p class="cart-item__name">${escapeHtml(item.name)}</p>
                  <p class="cart-item__meta">${escapeHtml(toCurrency(item.price))} x ${escapeHtml(String(item.qty))}</p>
                </div>
              </div>
              <strong>${escapeHtml(toCurrency(item.price * item.qty))}</strong>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="cart-totals">
      <p><span>Subtotal</span><strong>${escapeHtml(toCurrency(subtotal))}</strong></p>
      <p><span>Discount</span><strong>${escapeHtml(toCurrency(discount))}</strong></p>
      <p><span>Final</span><strong>${escapeHtml(toCurrency(finalPrice))}</strong></p>
    </div>
    <p class="demo-cart-meta">This order is worth ${escapeHtml(String(earnedCoins))} Feasto coins after admin acceptance.</p>
  `;
}

function updateDiscountDisplay(displayEl, redemption) {
  if (!displayEl) return;
  if (!redemption || redemption.coinsUsed <= 0) {
    displayEl.textContent = "Discount: Rs0";
    return;
  }
  displayEl.textContent = `Discount: Rs${redemption.discount} using ${redemption.coinsUsed} coins`;
}

function createOrderFromCart(cart, config, redemption) {
  const total = getCartTotal(cart);
  const discount = Math.min(total, Number(redemption?.discount) || 0);
  const finalPrice = Math.max(0, total - discount);
  const coinsUsed = discount > 0 ? Math.min(Number(redemption?.coinsUsed) || 0, Math.floor(total / 2) * 100) : 0;

  return {
    id: Date.now(),
    items: cart.map((item) => ({ ...item })),
    status: "PENDING",
    total,
    discount,
    finalPrice,
    paymentMode: getPaymentMode(config),
    coinsUsed,
    coinsEarned: getCoinsEarned(finalPrice),
    createdAt: new Date().toISOString(),
  };
}

function wireMenuButtons(menuRoot, cart, cartRoot, redemptionState, discountDisplay) {
  menuRoot?.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      cart.push({
        id: button.getAttribute("data-id") || Date.now(),
        name: button.getAttribute("data-name") || "Item",
        price: Number(button.getAttribute("data-price") || 0),
        image: button.getAttribute("data-image") || createPlaceholderImage("Food", 24),
        category: button.getAttribute("data-category") || "snacks",
      });
      const adjustedCoins = getAllowedCoins(redemptionState.requestedCoins, getCartTotal(cart));
      redemptionState.coinsUsed = adjustedCoins;
      redemptionState.discount = getDiscountFromCoins(adjustedCoins);
      updateDiscountDisplay(discountDisplay, redemptionState);
      renderCart(cartRoot, cart, redemptionState);
    });
  });
}

function initMenuExperience(config) {
  const menuRoot = document.getElementById(config.menuRootId);
  const cartRoot = document.getElementById(config.cartRootId);
  const placeOrderButton = document.getElementById(config.placeOrderButtonId);
  const message = document.getElementById(config.messageId);
  const coinRule = config.coinRuleId ? document.getElementById(config.coinRuleId) : null;
  const coinBalance = config.coinBalanceId ? document.getElementById(config.coinBalanceId) : null;
  const redeemInput = config.redeemInputId ? document.getElementById(config.redeemInputId) : null;
  const applyCoinsButton = config.applyCoinsButtonId ? document.getElementById(config.applyCoinsButtonId) : null;
  const discountDisplay = config.discountDisplayId ? document.getElementById(config.discountDisplayId) : null;

  if (!menuRoot || !cartRoot || !placeOrderButton) return;

  const cart = [];
  const redemptionState = { requestedCoins: 0, coinsUsed: 0, discount: 0 };

  function loadMenu() {
    const items = getMenuItems();
    if (items.length === 0) {
      menuRoot.innerHTML = `<p style="color:var(--text-secondary);margin:0;">No food items available</p>`;
      return;
    }

    menuRoot.innerHTML = renderMenuSectionHtml(groupMenu(items));
    wireMenuButtons(menuRoot, cart, cartRoot, redemptionState, discountDisplay);
  }

  loadMenu();
  renderCoinSummary(coinRule, coinBalance);
  renderCart(cartRoot, cart, redemptionState);
  updateDiscountDisplay(discountDisplay, redemptionState);

  applyCoinsButton?.addEventListener("click", () => {
    redemptionState.requestedCoins = Math.max(0, Math.floor(Number(redeemInput?.value) || 0));
    redemptionState.coinsUsed = getAllowedCoins(redemptionState.requestedCoins, getCartTotal(cart));
    redemptionState.discount = getDiscountFromCoins(redemptionState.coinsUsed);
    updateDiscountDisplay(discountDisplay, redemptionState);
    renderCart(cartRoot, cart, redemptionState);
  });

  placeOrderButton.addEventListener("click", () => {
    if (message) {
      message.textContent = "";
      message.className = "";
    }

    if (cart.length === 0) {
      if (message) {
        message.textContent = "Add at least one item before placing your order.";
        message.className = "msg-error";
      }
      return;
    }

    const order = createOrderFromCart(cart, config, redemptionState);
    const orders = getOrders();
    orders.unshift(order);
    saveOrders(orders);

    if (order.coinsUsed > 0) {
      spendCoins(order.coinsUsed);
    }

    cart.splice(0, cart.length);
    redemptionState.requestedCoins = 0;
    redemptionState.coinsUsed = 0;
    redemptionState.discount = 0;
    if (redeemInput) redeemInput.value = "";

    renderCoinSummary(coinRule, coinBalance);
    renderCart(cartRoot, cart, redemptionState);
    updateDiscountDisplay(discountDisplay, redemptionState);

    if (message) {
      message.textContent = `Order #${order.id} placed. Final price ${toCurrency(order.finalPrice)}.`;
      message.className = "msg-success";
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== MENU_KEY) return;
    loadMenu();
  });
}

function renderAdminFoodList(root) {
  if (!root) return;
  const items = getMenuItems();

  if (items.length === 0) {
    root.innerHTML = `<p style="color:var(--text-secondary);margin:0;">No menu items added yet.</p>`;
    return;
  }

  root.innerHTML = `
    <div class="admin-food-list">
      ${items
        .map(
          (item) => `
            <div class="admin-food-list__item">
              <div class="admin-food-list__info">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="food-img food-img--small" />
                <div>
                  <p class="cart-item__name">${escapeHtml(item.name)}</p>
                  <p class="cart-item__meta">${escapeHtml(titleCaseCategory(item.category))} - ${escapeHtml(toCurrency(item.price))}</p>
                </div>
              </div>
              <button type="button" class="btn btn--danger" onclick="deleteItem(${Number(item.id)})">Delete</button>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderOrderItemList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<p style="color:var(--text-secondary);margin:0;">No items</p>`;
  }

  return `
    <div class="order-items-list">
      ${items
        .map(
          (item) => `
            <div class="order-item">
              <div class="cart-item__info">
                <img src="${escapeHtml(String(item.image || createPlaceholderImage("Food", 24)))}" alt="${escapeHtml(String(item.name || "Food"))}" class="food-img food-img--small" />
                <div>
                  <p class="cart-item__name">${escapeHtml(String(item.name || "Food"))}</p>
                  <p class="cart-item__meta">${escapeHtml(toCurrency(item.price || 0))}</p>
                </div>
              </div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderPriceSummary(order) {
  return `
    <div class="order-price-summary">
      <p>Total: ${escapeHtml(toCurrency(order.total || 0))}</p>
      <p>Discount: ${escapeHtml(toCurrency(order.discount || 0))}</p>
      <p>Final: ${escapeHtml(toCurrency(order.finalPrice || 0))}</p>
      <p>Payment mode: ${escapeHtml(String(order.paymentMode || "Demo"))}</p>
      <p>Coins used: ${escapeHtml(String(order.coinsUsed || 0))}</p>
    </div>
  `;
}

function moveOrderToHistory(id, status) {
  const orders = getOrders();
  const order = orders.find((entry) => Number(entry.id) === Number(id));
  if (!order) return false;

  const history = getOrderHistory();
  const updatedOrder = { ...order, status, decidedAt: new Date().toISOString() };

  history.unshift(updatedOrder);
  saveOrderHistory(history);
  saveOrders(orders.filter((entry) => Number(entry.id) !== Number(id)));

  if (status === "ACCEPTED" && Number(updatedOrder.coinsEarned) > 0) {
    addCoins(updatedOrder.coinsEarned);
  }

  return true;
}

function renderAdminOrders(root) {
  const orders = getOrders();

  if (orders.length === 0) {
    root.innerHTML = `<p style="color:var(--text-secondary);">No active orders right now.</p>`;
    return;
  }

  root.innerHTML = `
    <div class="data-list">
      ${orders
        .map(
          (order) => `
            <div class="order-row order-row--stacked" data-order-id="${escapeHtml(String(order.id))}">
              <div class="order-row__header">
                <div>
                  <h4>Order #${escapeHtml(String(order.id))}</h4>
                  <p class="cart-item__meta">Status: ${escapeHtml(String(order.status || "PENDING"))}</p>
                </div>
                <div class="order-row__actions">
                  <button type="button" class="btn btn--success" data-action="accept">Accept</button>
                  <button type="button" class="btn btn--danger" data-action="reject">Reject</button>
                </div>
              </div>
              ${renderOrderItemList(order.items)}
              ${renderPriceSummary(order)}
            </div>
          `
        )
        .join("")}
    </div>
  `;

  root.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const orderCard = button.closest("[data-order-id]");
      const orderId = orderCard?.getAttribute("data-order-id");
      if (!action || !orderId) return;

      const status = action === "accept" ? "ACCEPTED" : "REJECTED";
      const moved = moveOrderToHistory(orderId, status);
      if (!moved) return;
      alert(status === "ACCEPTED" ? "Order accepted successfully" : "Order rejected successfully");
      renderAdminOrders(root);
    });
  });
}

function renderOrderHistory(root) {
  const history = getOrderHistory();

  if (history.length === 0) {
    root.innerHTML = `<p style="color:var(--text-secondary);">No completed orders in history yet.</p>`;
    return;
  }

  root.innerHTML = `
    <div class="data-list">
      ${history
        .map(
          (order) => `
            <div class="order-row order-row--stacked">
              <div class="order-row__header">
                <div>
                  <h4>Order #${escapeHtml(String(order.id))}</h4>
                  <p class="cart-item__meta">Status: ${escapeHtml(String(order.status || "PENDING"))}</p>
                </div>
                <p class="cart-item__meta">${escapeHtml(String(order.paymentMode || "Demo"))}</p>
              </div>
              ${renderOrderItemList(order.items)}
              ${renderPriceSummary(order)}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

export function initUserDashboardMenu() {
  initMenuExperience({
    menuRootId: "dashboard-menu-root",
    cartRootId: "dashboard-cart-root",
    placeOrderButtonId: "place-order",
    messageId: "dashboard-order-message",
    coinRuleId: "dashboard-coin-rule",
    coinBalanceId: "dashboard-coin-balance",
    redeemInputId: "dashboard-redeem-coins",
    applyCoinsButtonId: "dashboard-apply-coins",
    discountDisplayId: "dashboard-discount-display",
    defaultPaymentMode: "Demo",
  });
}

export function initOrderDemoPage() {
  initMenuExperience({
    menuRootId: "menu-root",
    cartRootId: "cart-root",
    placeOrderButtonId: "place-order-btn",
    messageId: "order-message",
    redeemInputId: "redeem-coins",
    applyCoinsButtonId: "apply-coins",
    discountDisplayId: "discount-display",
    paymentInputName: "order-payment-method",
    defaultPaymentMode: "Demo",
  });
}

export function initAdminOrdersDemo() {
  const root = document.getElementById("admin-orders-root");
  if (!root) return;

  renderAdminOrders(root);
  document.getElementById("admin-orders-refresh")?.addEventListener("click", () => {
    renderAdminOrders(root);
  });
}

export function initAdminOrderHistoryPage() {
  const root = document.getElementById("admin-history-root");
  if (!root) return;

  renderOrderHistory(root);
  document.getElementById("admin-history-refresh")?.addEventListener("click", () => {
    renderOrderHistory(root);
  });
}

export function initAdminFoodManagement() {
  const form = document.getElementById("food-form");
  const foodList = document.getElementById("admin-food-list");
  const coinRuleText = document.getElementById("admin-coin-rule-text");
  const coinInput = document.getElementById("rupees-per-coin");
  const coinButton = document.getElementById("update-coin-rule");
  const fileInput = document.getElementById("food-image");

  window.loadItems = () => renderAdminFoodList(foodList);
  window.deleteItem = (id) => {
    let items = JSON.parse(localStorage.getItem(MENU_KEY)) || [];
    items = items.filter((item) => Number(item.id) !== Number(id));
    localStorage.setItem(MENU_KEY, JSON.stringify(items));
    window.loadItems();
  };

  window.loadItems();
  if (coinRuleText) coinRuleText.textContent = formatCoinRule();
  if (coinInput) coinInput.value = String(getRupeesPerCoin());

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.querySelector("#food-name")?.value.trim();
    const price = Number(form.querySelector("#food-price")?.value);
    const category = String(form.querySelector("#food-category")?.value || "snacks").toLowerCase();
    const file = fileInput?.files?.[0];

    if (!name || !Number.isFinite(price) || price <= 0) return;
    if (!file) {
      alert("Please select an image");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result;
      const items = JSON.parse(localStorage.getItem(MENU_KEY)) || [];

      items.push({
        id: Date.now(),
        name,
        price,
        category,
        image: typeof base64Image === "string" ? base64Image : "",
      });

      localStorage.setItem(MENU_KEY, JSON.stringify(items));
      alert("Item added successfully");
      window.loadItems();
      form.reset();
    };

    reader.readAsDataURL(file);
  });

  coinButton?.addEventListener("click", () => {
    setRupeesPerCoin(coinInput?.value || 5);
    if (coinRuleText) coinRuleText.textContent = formatCoinRule();
    alert("Coin rule updated");
  });
}

export function initRewardsDemoPage() {
  const root = document.getElementById("rewards-root");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <h2 class="card__title">Feasto Coins</h2>
      <p class="coins-display">${escapeHtml(String(getStoredCoinBalance()))} <span style="font-size:1rem;color:var(--text-secondary);font-weight:500;">coins</span></p>
      <p style="margin:0;color:var(--text-secondary);">${escapeHtml(formatCoinRule())}</p>
      <p class="demo-cart-meta">Redeem 100 coins for a Rs2 discount during checkout.</p>
    </div>
  `;
}
