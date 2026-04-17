/**
 * Renders sticky navbar HTML for user or admin area.
 * @param {{ basePath: string; active: string; variant: 'user'|'admin' }} options
 */
function linkBase(basePath) {
  const b = String(basePath || "").trim();
  if (!b || b === ".") return "";
  return b.replace(/\/+$/, "") + "/";
}

export function renderNavbar({ basePath = "", active = "", variant = "user" }) {
  const root = linkBase(basePath);
  const isUser = variant === "user";

  const links = isUser
    ? [
        { href: `${root}home.html`, id: "home", label: "Home" },
        { href: `${root}orders.html`, id: "orders", label: "Orders" },
        { href: `${root}coins.html`, id: "coins", label: "Coins" },
        { href: `${root}feedback.html`, id: "feedback", label: "Feedback" },
      ]
    : [
        { href: `${root}dashboard.html`, id: "dashboard", label: "Dashboard" },
        { href: `${root}orders.html`, id: "orders", label: "Orders" },
        { href: `${root}crowd.html`, id: "crowd", label: "Crowd" },
        { href: `${root}feedback.html`, id: "feedback", label: "Feedback" },
      ];

  const linkHtml = links
    .map(
      (l) =>
        `<li><a href="${l.href}" class="${l.id === active ? "is-active" : ""}" data-nav="${l.id}">${l.label}</a></li>`
    )
    .join("");

  const assetsPrefix = isUser ? "../assets/" : "../assets/";
  const logoSrc = `${assetsPrefix}images/logo.png`;

  return `
    <nav class="navbar" aria-label="Main">
      <a href="${isUser ? `${root}home.html` : `${root}dashboard.html`}" class="navbar__brand">
        <img src="${logoSrc}" alt="" class="navbar__logo" />
        <span class="navbar__name">Feasto</span>
      </a>
      <ul class="navbar__links">
        ${linkHtml}
        <li><a href="#" id="nav-logout" data-action="logout">Logout</a></li>
      </ul>
    </nav>
  `;
}

export function mountNavbar(container, options) {
  if (!container) return;
  container.innerHTML = renderNavbar(options);
}
