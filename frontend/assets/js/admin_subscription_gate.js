import { getSubscriptionState } from "./feasto_subscription_state.js";

/**
 * Admin UI only: banner + visual disable when subscription expiry has passed.
 * Does not enforce server-side security.
 */
export function initAdminSubscriptionGate() {
  const main = document.querySelector("main.page__main");
  if (!main || !document.querySelector(".admin-header")) return;

  const state = getSubscriptionState();
  const onSubscriptionPage = /subscription\.html/i.test(window.location.pathname || "");

  if (onSubscriptionPage) return;

  if (!state.isExpired) return;

  const banner = document.createElement("div");
  banner.className = "subscription-expired-banner";
  banner.setAttribute("role", "alert");
  banner.innerHTML = `
    <p class="subscription-expired-banner__text">
      Subscription expired. Please renew to continue.
    </p>
    <a class="btn btn--primary subscription-expired-banner__cta" href="subscription.html">Renew subscription</a>
  `;
  main.insertBefore(banner, main.firstChild);
  main.classList.add("admin-main--subscription-expired");
}
