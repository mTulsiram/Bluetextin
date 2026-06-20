/* ============================================================================
   NAVIGATION MODULE - Menu and routing
   Handles navigation menu, active states, and mobile menu toggle
   ============================================================================ */

const NAV = {
  init: () => {
    LOGGER.info("Initializing navigation module");

    NAV.setupMenuToggle();
    NAV.setupNavLinks();
    NAV.setActiveLink();
  },

  setupMenuToggle: () => {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const menu = document.querySelector(".nav-menu");

    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        menu.classList.toggle("active");
        toggle.setAttribute("aria-expanded", menu.classList.contains("active"));
      });

      // Close menu when a link is clicked
      menu.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          menu.classList.remove("active");
          toggle.setAttribute("aria-expanded", "false");
        });
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!e.target.closest("header")) {
          menu.classList.remove("active");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  },

  setupNavLinks: () => {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        // Allow default navigation, just update active state
        setTimeout(() => NAV.setActiveLink(), 100);
      });
    });
  },

  setActiveLink: () => {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && currentPath.includes(href)) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  },

  navigateTo: (path) => {
    window.location.href = path;
  },
};

// Initialize navigation when ready
onReady(() => {
  NAV.init();
});

LOGGER.info("Navigation module loaded");
