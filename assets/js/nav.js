/* =========================================================================
   BlueTEXT.in — Navigation & Utility Controller
   Modules: 1. Theme Toggle | 2. Mobile Drawer | 3. Clear Cache Utility
   ========================================================================= */

(function () {
  const THEME_KEY = "bt_theme_v1";

  // -------------------------------------------------------------------------
  // 1. Theme Management (Dark/Light mode)
  // -------------------------------------------------------------------------
  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = document.getElementById("theme-toggle-icon");
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  function initTheme() {
    let savedTheme;
    try {
      savedTheme = localStorage.getItem(THEME_KEY);
    } catch (e) {}
    const theme = savedTheme || getSystemTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
  }

  // -------------------------------------------------------------------------
  // 2. Mobile Responsive Navigation Drawer
  // -------------------------------------------------------------------------
  function initMobileNav() {
    const toggleBtn = document.querySelector(".nav-toggle");
    const menu = document.getElementById("nav-menu");

    if (!toggleBtn || !menu) return;

    toggleBtn.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close drawer on Escape key (WCAG compliance)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.focus();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 3. Clear Cache Utility
  // -------------------------------------------------------------------------
  async function clearCacheAndReload() {
    const confirmed = window.confirm("Clear all local storage, site caches, and reload page?");
    if (!confirmed) return;

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}

    if ("caches" in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {}
    }

    if ("serviceWorker" in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      } catch (e) {}
    }

    window.location.reload(true);
  }

  function initClearCache() {
    const btn = document.getElementById("clear-cache-btn");
    if (btn) {
      btn.addEventListener("click", clearCacheAndReload);
    }
  }

  // -------------------------------------------------------------------------
  // 4. Initialize Controllers
  // -------------------------------------------------------------------------
  initTheme();

  function boot() {
    initMobileNav();
    initClearCache();
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
