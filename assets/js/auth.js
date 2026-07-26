/* =========================================================================
   BlueTEXT.in — Auth Controller (Minimal Zero-Dependency Session Management)
   ========================================================================= */

(function () {
  const AUTH_KEY = "bt_auth_user_v1";

  function getCurrentUser() {
    try {
      return localStorage.getItem(AUTH_KEY);
    } catch (e) {
      return null;
    }
  }

  function updateAuthUI() {
    const btn = document.getElementById("auth-toggle-btn");
    if (!btn) return;

    const user = getCurrentUser();
    if (user) {
      btn.textContent = `Account (${user.split("@")[0]})`;
      btn.title = `Signed in as ${user}. Click to sign out.`;
    } else {
      btn.textContent = "Sign In";
      btn.title = "Sign in to account";
    }
  }

  function toggleAuth() {
    const user = getCurrentUser();
    if (user) {
      const confirmSignout = window.confirm(`Sign out of ${user}?`);
      if (confirmSignout) {
        try {
          localStorage.removeItem(AUTH_KEY);
        } catch (e) {}
        updateAuthUI();
      }
    } else {
      const email = window.prompt("Enter your email to sign in (Demo mode):", "guest@bluetext.in");
      if (email && email.trim()) {
        try {
          localStorage.setItem(AUTH_KEY, email.trim());
        } catch (e) {}
        updateAuthUI();
      }
    }
  }

  function initAuth() {
    updateAuthUI();
    const btn = document.getElementById("auth-toggle-btn");
    if (btn) {
      btn.addEventListener("click", toggleAuth);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuth, { once: true });
  } else {
    initAuth();
  }
})();
