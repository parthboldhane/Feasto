function redirectToEntry() {
  window.location.href = "/index.html";
}

/**
 * Route protection for Feasto frontend.
 * @param {{ expectedRole?: 'user'|'admin' }} options
 */
export function protectRoute(options = {}) {
  const expectedRole = options.expectedRole;

  if (localStorage.getItem("isLoggedIn") !== "true") {
    redirectToEntry();
    return false;
  }

  if (expectedRole) {
    const role = localStorage.getItem("ROLE");
    if (role !== expectedRole) {
      redirectToEntry();
      return false;
    }
  }

  return true;
}

