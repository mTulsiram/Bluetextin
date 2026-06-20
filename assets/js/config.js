/* ============================================================================
   BLUETEXT.IN - MASTER JS CONFIGURATION
   Central configuration for theme, authentication, and application state
   All pages inherit from this. Do not override globally.
   ============================================================================ */

const CONFIG = {
  // Theme Configuration
  theme: {
    default: localStorage.getItem("theme") || "light",
    modes: ["light", "dark"],
    storageKey: "theme",
  },

  // Authentication Configuration
  auth: {
    storageKey: "user",
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    rememberMe: localStorage.getItem("rememberMe") === "true",
  },

  // Navigation Configuration
  nav: {
    items: [
      { label: "Games", href: "/pages/games/", icon: "🎮" },
      { label: "Tools", href: "/pages/tools/", icon: "🛠️" },
      { label: "Software", href: "/pages/software/", icon: "💻" },
      { label: "Education", href: "/pages/education/", icon: "📚" },
      { label: "Tutorials", href: "/pages/tutorials/", icon: "🎓" },
    ],
  },

  // API Configuration
  api: {
    baseUrl: "/api",
    timeout: 5000,
  },

  // Logging Configuration
  logging: {
    enabled: true,
    level: "info", // debug, info, warn, error
  },

  // Feature Flags
  features: {
    darkMode: true,
    authentication: true,
    offline: true,
  },
};

/* ============================================================================
   LOGGER - Simple logging utility
   ============================================================================ */

const LOGGER = {
  debug: (msg, data) => {
    if (CONFIG.logging.enabled && ["debug", "info"].includes(CONFIG.logging.level)) {
      console.log(`[DEBUG] ${msg}`, data || "");
    }
  },

  info: (msg, data) => {
    if (CONFIG.logging.enabled && ["info"].includes(CONFIG.logging.level)) {
      console.log(`[INFO] ${msg}`, data || "");
    }
  },

  warn: (msg, data) => {
    console.warn(`[WARN] ${msg}`, data || "");
  },

  error: (msg, data) => {
    console.error(`[ERROR] ${msg}`, data || "");
  },
};

/* ============================================================================
   STORAGE UTILITY - Consistent data persistence
   ============================================================================ */

const STORAGE = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      LOGGER.debug(`Stored ${key}`, value);
    } catch (err) {
      LOGGER.error(`Failed to store ${key}`, err);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      LOGGER.error(`Failed to retrieve ${key}`, err);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      LOGGER.debug(`Removed ${key}`);
    } catch (err) {
      LOGGER.error(`Failed to remove ${key}`, err);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      LOGGER.debug("Cleared all storage");
    } catch (err) {
      LOGGER.error("Failed to clear storage", err);
    }
  },
};

/* ============================================================================
   STATE MANAGEMENT - Global application state
   ============================================================================ */

const STATE = {
  user: STORAGE.get(CONFIG.auth.storageKey, null),
  theme: CONFIG.theme.default,
  notifications: [],

  init: () => {
    STATE.user = STORAGE.get(CONFIG.auth.storageKey, null);
    STATE.theme = STORAGE.get(CONFIG.theme.storageKey, CONFIG.theme.default);
    LOGGER.info("State initialized", { user: STATE.user, theme: STATE.theme });
  },

  setUser: (user) => {
    STATE.user = user;
    if (user) {
      STORAGE.set(CONFIG.auth.storageKey, user);
      LOGGER.info("User logged in", { username: user.username });
    } else {
      STORAGE.remove(CONFIG.auth.storageKey);
      LOGGER.info("User logged out");
    }
  },

  setTheme: (theme) => {
    if (CONFIG.theme.modes.includes(theme)) {
      STATE.theme = theme;
      STORAGE.set(CONFIG.theme.storageKey, theme);
      document.documentElement.setAttribute("data-theme", theme);
      LOGGER.info("Theme changed", { theme });
    }
  },

  addNotification: (message, type = "info", duration = 3000) => {
    const notification = {
      id: Date.now(),
      message,
      type,
    };
    STATE.notifications.push(notification);
    if (duration > 0) {
      setTimeout(() => STATE.removeNotification(notification.id), duration);
    }
    return notification.id;
  },

  removeNotification: (id) => {
    STATE.notifications = STATE.notifications.filter((n) => n.id !== id);
  },
};

/* ============================================================================
   EVENTS - Simple event emitter for app-wide communication
   ============================================================================ */

const EVENTS = {
  listeners: {},

  on: (event, callback) => {
    if (!EVENTS.listeners[event]) {
      EVENTS.listeners[event] = [];
    }
    EVENTS.listeners[event].push(callback);
    LOGGER.debug(`Listener registered for event: ${event}`);
  },

  off: (event, callback) => {
    if (EVENTS.listeners[event]) {
      EVENTS.listeners[event] = EVENTS.listeners[event].filter((cb) => cb !== callback);
    }
  },

  emit: (event, data) => {
    if (EVENTS.listeners[event]) {
      EVENTS.listeners[event].forEach((callback) => callback(data));
      LOGGER.debug(`Event emitted: ${event}`, data);
    }
  },
};

// Document ready helper
const onReady = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

LOGGER.info("Config module loaded");
