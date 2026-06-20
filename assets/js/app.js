/* ============================================================================
   APP MODULE - Main Application Initialization
   Initializes all modules and sets up global event listeners
   ============================================================================ */

const APP = {
  init: () => {
    LOGGER.info("=== BlueTEXT.in Application Starting ===");

    // Initialize core modules (order matters)
    STATE.init();
    THEME.init();
    AUTH.init();
    NAV.init();

    // Setup global event listeners
    APP.setupGlobalListeners();

    // Render notifications
    APP.setupNotifications();

    LOGGER.info("=== Application Ready ===");
  },

  setupGlobalListeners: () => {
    // Handle session timeout
    let sessionTimeout;
    const resetSessionTimeout = () => {
      clearTimeout(sessionTimeout);
      if (STATE.user) {
        sessionTimeout = setTimeout(() => {
          LOGGER.warn("Session timeout");
          AUTH.logout();
          STATE.addNotification("Session expired. Please login again.", "warning");
        }, CONFIG.auth.sessionTimeout);
      }
    };

    // Reset timeout on user activity
    ["mousedown", "keydown", "scroll", "touchstart"].forEach((event) => {
      document.addEventListener(event, resetSessionTimeout, true);
    });

    resetSessionTimeout();

    // Handle visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        LOGGER.debug("Page hidden");
      } else {
        LOGGER.debug("Page visible");
      }
    });

    // Handle online/offline
    window.addEventListener("online", () => {
      LOGGER.info("Application is online");
      STATE.addNotification("You are back online", "success", 2000);
    });

    window.addEventListener("offline", () => {
      LOGGER.warn("Application is offline");
      STATE.addNotification("You are offline - some features may not work", "warning", 5000);
    });
  },

  setupNotifications: () => {
    const notificationContainer = document.querySelector('[data-notifications]');
    if (!notificationContainer) return;

    // Update notifications when they change
    EVENTS.on("notificationAdded", () => {
      APP.renderNotifications(notificationContainer);
    });

    // Initial render
    APP.renderNotifications(notificationContainer);
  },

  renderNotifications: (container) => {
    container.innerHTML = STATE.notifications
      .map(
        (notification) => `
      <div class="alert alert-${notification.type}" data-notification-id="${notification.id}">
        <span>${notification.message}</span>
        <button class="close-btn" onclick="STATE.removeNotification(${notification.id}); APP.renderNotifications(document.querySelector('[data-notifications]'))">✕</button>
      </div>
    `
      )
      .join("");
  },

  // Utility function to add a new page section
  createPageSection: (title, description, items) => {
    return `
      <section class="page-section">
        <h2>${title}</h2>
        ${description ? `<p>${description}</p>` : ""}
        <div class="grid grid-3">
          ${items.map((item) => APP.createCard(item)).join("")}
        </div>
      </section>
    `;
  },

  // Utility function to create a card
  createCard: (data) => {
    return `
      <div class="card">
        <div class="card-header">
          ${data.icon ? `<div style="font-size: 2rem; margin-bottom: var(--spacing-md);">${data.icon}</div>` : ""}
          <h3 class="card-title">${data.title}</h3>
          ${data.subtitle ? `<p class="card-subtitle">${data.subtitle}</p>` : ""}
        </div>
        <div class="card-body">
          <p>${data.description || ""}</p>
        </div>
        ${
          data.link
            ? `<div class="card-footer"><a href="${data.link}" class="btn btn-primary">Open</a></div>`
            : ""
        }
      </div>
    `;
  },
};

// Start application when DOM is ready
onReady(() => {
  APP.init();
});

LOGGER.info("App module loaded");
