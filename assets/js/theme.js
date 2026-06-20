/* ============================================================================
   THEME MODULE - Dark/Light Mode Management
   Handles theme switching and persistence
   ============================================================================ */

const THEME = {
  init: () => {
    LOGGER.info("Initializing theme module");

    // Set initial theme
    const savedTheme = STORAGE.get(CONFIG.theme.storageKey, "light");
    STATE.setTheme(savedTheme);

    // Setup theme toggle button
    const themeToggleBtn = document.querySelector(".theme-toggle");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", THEME.toggle);
      THEME.updateToggleIcon();
    }

    // Listen for theme changes
    EVENTS.on("themeChanged", THEME.updateToggleIcon);

    // Check system preference on first visit
    if (!localStorage.getItem(CONFIG.theme.storageKey)) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      STATE.setTheme(prefersDark ? "dark" : "light");
    }
  },

  toggle: () => {
    const newTheme = STATE.theme === "light" ? "dark" : "light";
    STATE.setTheme(newTheme);
    EVENTS.emit("themeChanged", newTheme);
    STATE.addNotification(`Switched to ${newTheme} mode`, "info", 2000);
    LOGGER.info(`Theme toggled to: ${newTheme}`);
  },

  updateToggleIcon: () => {
    const themeToggleBtn = document.querySelector(".theme-toggle");
    if (!themeToggleBtn) return;

    const icon = STATE.theme === "light" ? "🌙" : "☀️";
    const text = STATE.theme === "light" ? "Dark" : "Light";
    themeToggleBtn.innerHTML = `<span>${icon}</span> ${text}`;
  },

  setSystemTheme: (isDark) => {
    STATE.setTheme(isDark ? "dark" : "light");
    EVENTS.emit("themeChanged", STATE.theme);
  },
};

// Initialize theme when config is ready
onReady(() => {
  STATE.init();
  if (CONFIG.features.darkMode) {
    THEME.init();
  }
});

LOGGER.info("Theme module loaded");
