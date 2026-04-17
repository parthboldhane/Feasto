import { submitFeedback, getFeedbackList } from "../../api/order_api.js";
import { showLoading, showError, escapeHtml } from "./main.js";

export function initFeedbackPage() {
  const form = document.getElementById("feedback-form");
  const msg = document.getElementById("feedback-message");
  const starsRoot = document.getElementById("star-rating");
  const ratingInput = document.getElementById("rating-value");

  let rating = 0;

  if (starsRoot && ratingInput) {
    for (let i = 1; i <= 5; i += 1) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Rate ${i} out of 5`);
      b.textContent = "★";
      b.dataset.value = String(i);
      b.addEventListener("click", () => {
        rating = i;
        ratingInput.value = String(rating);
        starsRoot.querySelectorAll("button").forEach((btn, idx) => {
          btn.classList.toggle("is-on", idx < rating);
        });
      });
      starsRoot.appendChild(b);
    }
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) {
      msg.textContent = "";
      msg.className = "";
    }

    const fd = new FormData(form);
    const comment = String(fd.get("comment") || "").trim();
    if (rating < 1 || rating > 5) {
      if (msg) {
        msg.textContent = "Please choose a star rating.";
        msg.className = "msg-error";
      }
      return;
    }

    const result = await submitFeedback({ rating, comment });
    if (result == null) {
      if (msg) {
        msg.textContent = "Could not submit feedback. Try again.";
        msg.className = "msg-error";
      }
      return;
    }

    form.reset();
    rating = 0;
    ratingInput.value = "";
    starsRoot?.querySelectorAll("button").forEach((btn) => btn.classList.remove("is-on"));

    if (msg) {
      msg.textContent = "Thanks for your feedback.";
      msg.className = "msg-success";
    }
  });
}

function normalizeFeedbackList(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw.feedback)) return raw.feedback;
  return [];
}

export function initAdminFeedbackPage() {
  const root = document.getElementById("admin-feedback-root");
  if (!root) return;

  async function load() {
    showLoading(root);
    const raw = await getFeedbackList();
    const items = normalizeFeedbackList(raw);

    if (raw == null) {
      showError(root, "Could not load feedback.");
      return;
    }

    if (items.length === 0) {
      root.innerHTML = `<p style="color:var(--text-secondary);">No feedback yet.</p>`;
      return;
    }

    root.innerHTML = `<div class="data-list"></div>`;
    const list = root.querySelector(".data-list");

    items.forEach((fb) => {
      const rating = fb.rating ?? "—";
      const comment = fb.comment ?? fb.text ?? "";
      const created = fb.createdAt ?? fb.date ?? "";
      const card = document.createElement("div");
      card.className = "card";
      card.style.marginBottom = "0.75rem";
      card.innerHTML = `
        <p style="margin:0 0 0.5rem;"><strong>${escapeHtml(String(rating))}</strong> / 5</p>
        <p style="margin:0;color:var(--text-secondary);font-size:0.9rem;">${escapeHtml(String(comment))}</p>
        <p style="margin:0.5rem 0 0;font-size:0.8rem;color:var(--text-secondary);">${escapeHtml(String(created))}</p>
      `;
      list?.appendChild(card);
    });
  }

  load();
  document.getElementById("admin-feedback-refresh")?.addEventListener("click", load);
}
