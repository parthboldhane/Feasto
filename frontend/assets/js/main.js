/**
 * Shared helpers: loading UI, crowd level styling.
 */

export function showLoading(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="loading-block" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <span>Loading…</span>
    </div>
  `;
}

export function showError(container, message) {
  if (!container) return;
  container.innerHTML = `<p class="msg-error" role="alert">${escapeHtml(message)}</p>`;
}

export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : String(text);
  return div.innerHTML;
}

/** Normalize API level to LOW | MODERATE | HIGH */
export function normalizeLevel(level) {
  const s = String(level || "").toUpperCase();
  if (s.includes("HIGH")) return "HIGH";
  if (s.includes("MOD")) return "MODERATE";
  if (s.includes("LOW")) return "LOW";
  return "MODERATE";
}

export function crowdLevelClass(level) {
  const n = normalizeLevel(level);
  if (n === "LOW") return "low";
  if (n === "HIGH") return "high";
  return "moderate";
}

export function crowdPercentFromData(data) {
  if (data == null) return 0;
  if (typeof data.percent === "number" && !Number.isNaN(data.percent)) {
    return Math.min(100, Math.max(0, data.percent));
  }
  const n = normalizeLevel(data.level);
  if (n === "LOW") return 33;
  if (n === "MODERATE") return 66;
  return 100;
}
