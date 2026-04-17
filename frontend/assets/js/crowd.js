import { getCrowd, setCrowd } from "../../api/crowd_api.js";
import { showLoading, showError, normalizeLevel } from "./main.js";

const REFRESH_MS = 30000;

function getPercent(level) {
  const normalized = normalizeLevel(level);
  if (normalized === "LOW") return 30;
  if (normalized === "HIGH") return 90;
  return 50;
}

function getSuggestion(data) {
  if (data?.suggestion != null && String(data.suggestion).trim() !== "") {
    return String(data.suggestion);
  }

  const level = normalizeLevel(data?.level);
  if (level === "LOW") return "Good time to go now";
  if (level === "HIGH") return "Avoid now, come later";
  return "Wait 10-15 minutes";
}

function defaultCrowdMarkup() {
  return `
    <div class="card crowd-card">
      <h2 class="card__title">Crowd Meter</h2>
      <div class="crowd-meter">
        <div class="crowd-meter__track">
          <div id="crowd-meter-fill" class="crowd-meter__fill crowd-meter__fill--moderate" style="width:50%"></div>
        </div>
      </div>
      <p id="crowd-suggestion" class="text-secondary">Loading crowd data...</p>
      <div class="card">
        <h3>Best Time to Visit</h3>
        <p id="best-time">-</p>
      </div>
      <div class="progress-bar">
        <div id="crowd-progress-fill" class="crowd-meter__fill crowd-meter__fill--moderate" style="width:50%"></div>
      </div>
      <p id="crowd-progress-text">-</p>
    </div>
  `;
}

function ensureCrowdMarkup(container) {
  if (!container) return;

  if (
    !container.querySelector("#crowd-meter-fill") ||
    !container.querySelector("#crowd-suggestion") ||
    !container.querySelector("#best-time") ||
    !container.querySelector("#crowd-progress-fill") ||
    !container.querySelector("#crowd-progress-text")
  ) {
    if (!container.classList.contains("grid-dashboard")) {
      container.classList.add("grid-dashboard");
    }
    container.innerHTML = defaultCrowdMarkup();
  }
}

function setDefaultUI(container) {
  ensureCrowdMarkup(container);

  const meter = container?.querySelector("#crowd-meter-fill");
  const suggestion = container?.querySelector("#crowd-suggestion");
  const bestTime = container?.querySelector("#best-time");
  const progressFill = container?.querySelector("#crowd-progress-fill");
  const progressText = container?.querySelector("#crowd-progress-text");

  if (meter) {
    meter.style.width = "50%";
    meter.className = "crowd-meter__fill crowd-meter__fill--moderate";
  }
  if (suggestion) suggestion.textContent = "Loading crowd data...";
  if (bestTime) bestTime.textContent = "-";
  if (progressFill) {
    progressFill.style.width = "50%";
    progressFill.className = "crowd-meter__fill crowd-meter__fill--moderate";
  }
  if (progressText) progressText.textContent = "-";
}

function updateCrowdUI(container, data) {
  ensureCrowdMarkup(container);

  const level = normalizeLevel(data?.level || "MODERATE");
  const percent = getPercent(level);
  const colorClass =
    level === "LOW"
      ? "crowd-meter__fill--low"
      : level === "HIGH"
        ? "crowd-meter__fill--high"
        : "crowd-meter__fill--moderate";

  const meter = container?.querySelector("#crowd-meter-fill");
  if (meter) {
    meter.style.width = `${percent}%`;
    meter.className = `crowd-meter__fill ${colorClass}`;
  }

  const suggestion = container?.querySelector("#crowd-suggestion");
  if (suggestion) {
    suggestion.textContent = data?.suggestion || getSuggestion(data) || "-";
  }

  const bestTime = container?.querySelector("#best-time");
  if (bestTime) {
    bestTime.textContent = data?.bestTime || "-";
  }

  const progressFill = container?.querySelector("#crowd-progress-fill");
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
    progressFill.className = `crowd-meter__fill ${colorClass}`;
  }

  const progressText = container?.querySelector("#crowd-progress-text");
  if (progressText) {
    progressText.textContent = `${percent}%`;
  }
}

function renderCrowdDashboard(container, data) {
  updateCrowdUI(container, data);
}

async function loadCrowdData(container) {
  try {
    const data = await getCrowd();
    if (!data) throw new Error("No data");
    updateCrowdUI(container, data);
  } catch (err) {
    console.warn("Using fallback UI", err);
    updateCrowdUI(container, {
      currentCrowd: "-",
      level: "MODERATE",
      suggestion: "Unable to fetch data",
      bestTime: "-",
    });
  }
}

let userTimer = null;
let adminTimer = null;

export function initUserDashboard() {
  const mount = document.getElementById("crowd-root");
  if (!mount) return;

  async function load() {
    await loadCrowdData(mount);
  }

  if (userTimer) clearInterval(userTimer);
  setDefaultUI(mount);
  load();
  userTimer = setInterval(load, REFRESH_MS);
}

export function initAdminCrowdSummary() {
  const mount = document.getElementById("admin-crowd-summary");
  if (!mount) return;

  async function load() {
    await loadCrowdData(mount);
  }

  if (adminTimer) clearInterval(adminTimer);
  setDefaultUI(mount);
  load();
  adminTimer = setInterval(load, REFRESH_MS);
}

export function initAdminCrowdControl() {
  const form = document.getElementById("crowd-form");
  const msg = document.getElementById("crowd-form-message");
  const preview = document.getElementById("crowd-preview");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msg) {
        msg.textContent = "";
        msg.className = "";
      }

      const fd = new FormData(form);
      const raw = fd.get("value");
      const value = Number(raw);
      if (Number.isNaN(value)) {
        if (msg) {
          msg.textContent = "Enter a valid number.";
          msg.className = "msg-error";
        }
        return;
      }

      const result = await setCrowd({ value });
      if (result == null) {
        if (msg) {
          msg.textContent = "Update failed. Try again.";
          msg.className = "msg-error";
        }
        return;
      }

      if (msg) {
        msg.textContent = "Crowd value updated.";
        msg.className = "msg-success";
      }
      if (preview) {
        const latest = await getCrowd();
        if (latest == null) {
          showError(preview, "Could not refresh crowd data.");
        } else {
          renderCrowdDashboard(preview, latest);
        }
      }
    });
  }

  if (preview) {
    showLoading(preview);
    getCrowd().then((data) => {
      if (data == null) {
        showError(preview, "Could not load current crowd.");
        return;
      }
      renderCrowdDashboard(preview, data);
    });
  }
}
