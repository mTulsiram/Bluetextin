/* =========================================================================
   BlueTEXT.in — Master Controller & Engine
   Modules:
   1. Theme Management (Dark/Light Mode)
   2. Mobile Navigation Drawer
   3. Clear Cache Utility
   4. Auth Session & Modal Management
   5. Zero-Dependency Donate Modal Manager
   6. Catalog Engine (Pagination, Search & Filtering)
   ========================================================================= */

(function () {
  const THEME_KEY = "bt_theme_v1";
  const AUTH_KEY = "bt_auth_user_v1";

  // -------------------------------------------------------------------------
  // 1. Theme Management
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

    // Clean up any lingering backdrop overlay elements
    const existingBackdrop = document.querySelector(".nav-menu-backdrop");
    if (existingBackdrop) existingBackdrop.remove();

    function closeDrawer() {
      menu.classList.remove("open");
      document.body.style.overflow = "";
      toggleBtn.setAttribute("aria-expanded", "false");
    }

    function openDrawer() {
      menu.classList.add("open");
      document.body.style.overflow = "hidden";
      toggleBtn.setAttribute("aria-expanded", "true");
    }

    // Bind mobile drawer close button
    const closeBtn = menu.querySelector(".nav-menu-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeDrawer();
      });
    }

    // Global click delegate for mobile hamburger toggle
    document.addEventListener("click", (e) => {
      const toggleHit = e.target.closest(".nav-toggle");
      if (toggleHit) {
        e.preventDefault();
        e.stopPropagation();
        if (menu.classList.contains("open")) {
          closeDrawer();
        } else {
          openDrawer();
        }
        return;
      }

      // Close menu if link inside menu is clicked (except dropdown parent toggles)
      if (menu.classList.contains("open")) {
        const linkHit = e.target.closest("a.nav-link, .hdr-btn");
        if (linkHit) {
          // If it's a dropdown toggle link with subitems, don't close immediately
          const parentDropdown = linkHit.closest(".nav-dropdown");
          if (parentDropdown && linkHit.getAttribute("href") === "#") {
            return;
          }
          closeDrawer();
        }
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        closeDrawer();
        toggleBtn.focus();
      }
    });

    // Bind Search Button in Header
    const searchBtn = document.getElementById("hdr-search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const searchInput = document.getElementById("homepage-search-input");
        if (searchInput) {
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          window.location.href = "/#homepage-search-input";
        }
      });
    }

    // Add Scroll to Top & Scroll to Bottom Floating Dock
    if (!document.getElementById("scroll-nav-dock")) {
      const scrollDock = document.createElement("div");
      scrollDock.id = "scroll-nav-dock";
      scrollDock.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 990; display: flex; flex-direction: column; gap: 6px;";

      scrollDock.innerHTML = `
        <button id="scroll-to-top-btn" aria-label="Scroll to top" title="Scroll to Top" style="width: 38px; height: 38px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); color: var(--fg); font-weight: bold; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 1rem;">↑</button>
        <button id="scroll-to-bottom-btn" aria-label="Scroll to bottom" title="Scroll to Bottom" style="width: 38px; height: 38px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); color: var(--fg); font-weight: bold; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 1rem;">↓</button>
      `;

      document.body.appendChild(scrollDock);

      document.getElementById("scroll-to-top-btn").addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      document.getElementById("scroll-to-bottom-btn").addEventListener("click", () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      });
    }
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
  // 4. Zero-Dependency Modal Framework & Donate Manager
  // -------------------------------------------------------------------------
  function createModal(id, title, bodyHtml) {
    let existing = document.getElementById(id);
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = id;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button type="button" class="modal-close" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          ${bodyHtml}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector(".modal-close");
    function closeModal() {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
      setTimeout(() => overlay.remove(), 200);
    }

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escHandler);
      }
    });

    setTimeout(() => {
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }, 10);

    return closeModal;
  }

  function openDonateModal(e) {
    if (e) e.preventDefault();

    const bodyHtml = `
      <p class="modal-subtext">Your support keeps BlueTEXT.in 100% free, fast, and ad-free.</p>
      
      <div class="donate-options">
        <a href="https://www.patreon.com/cw/BlueTEXTin?utm_source=search&vanity=BlueTEXTin" target="_blank" rel="noopener noreferrer" class="donate-card">
          <strong>🧡 Patreon (International Support)</strong>
          <span>Support via credit/debit cards, PayPal, and monthly tiers</span>
        </a>

        <div class="donate-card">
          <strong>💳 Secure Razorpay Subscription</strong>
          <span style="margin-bottom: 0.5rem;">Indian cards, Net Banking, UPI & Wallets</span>
          <div class="razorpay-widget-wrapper" style="padding: 0.5rem 0;">
            <form id="razorpay-form-container"></form>
          </div>
        </div>

        <div class="donate-card upi-card">
          <strong>🇮🇳 Direct Indian UPI (Zero Fees)</strong>
          <span class="upi-id">UPI ID: <code>bluetextin@slc</code></span>
          <div class="upi-actions">
            <a href="upi://pay?pa=bluetextin@slc&pn=BlueTEXT.in&cu=INR" class="donate-btn-primary">Pay via UPI App</a>
            <button type="button" class="donate-btn-sec" id="copy-upi-btn">Copy UPI ID</button>
          </div>
        </div>
      </div>

      <div class="modal-footer-link">
        <a href="/support.html">View Supporters Wall & Full Info &rarr;</a>
      </div>
    `;

    createModal("donate-modal-popup", "💖 Support BlueTEXT.in", bodyHtml);

    setTimeout(() => {
      const copyBtn = document.getElementById("copy-upi-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText("bluetextin@slc");
          copyBtn.textContent = "Copied! ✓";
          setTimeout(() => { copyBtn.textContent = "Copy UPI ID"; }, 2000);
        });
      }

      // Inject Razorpay script dynamically into modal
      const formContainer = document.getElementById("razorpay-form-container");
      if (formContainer && !formContainer.querySelector("script")) {
        const rzpScript = document.createElement("script");
        rzpScript.src = "https://cdn.razorpay.com/static/widget/subscription-button.js";
        rzpScript.setAttribute("data-subscription_button_id", "pl_T4XGfSg6ladpyP");
        rzpScript.setAttribute("data-button_theme", "brand-color");
        rzpScript.async = true;
        formContainer.appendChild(rzpScript);
      }
    }, 50);
  }

  function initDonate() {
    const donateBtns = document.querySelectorAll(".hdr-btn-donate, .ftr-link-highlight, [href='/support.html']");
    donateBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        openDonateModal(e);
      });
    });
  }

  // -------------------------------------------------------------------------
  // 5. Auth Session & Sign In / Sign Up Modal Framework
  // -------------------------------------------------------------------------
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
      btn.title = `Signed in as ${user}. Click to view account.`;
    } else {
      btn.textContent = "Sign In";
      btn.title = "Sign in to account";
    }
  }

  function openAuthModal() {
    const currentUser = getCurrentUser();

    if (currentUser) {
      const bodyHtml = `
        <p class="modal-subtext">You are currently signed in as <strong>${currentUser}</strong></p>
        <div style="display: flex; gap: 0.8rem; margin-top: 1rem;">
          <button type="button" class="auth-submit-btn" id="auth-signout-btn" style="background: #d9381e;">Sign Out</button>
        </div>
      `;
      const closeModal = createModal("auth-modal-popup", "Account Status", bodyHtml);
      setTimeout(() => {
        const signoutBtn = document.getElementById("auth-signout-btn");
        if (signoutBtn) {
          signoutBtn.addEventListener("click", () => {
            try { localStorage.removeItem(AUTH_KEY); } catch (e) {}
            updateAuthUI();
            closeModal();
          });
        }
      }, 50);
      return;
    }

    const bodyHtml = `
      <div class="auth-tabs">
        <button class="auth-tab-btn active" id="tab-signin-btn">Sign In</button>
        <button class="auth-tab-btn" id="tab-signup-btn">Sign Up</button>
      </div>

      <!-- Sign In Form -->
      <form class="auth-form" id="signin-form">
        <div class="auth-form-group">
          <label for="auth-email">Email Address</label>
          <input type="email" id="auth-email" required placeholder="user@example.com">
        </div>
        <div class="auth-form-group">
          <label for="auth-password">Password</label>
          <input type="password" id="auth-password" required placeholder="••••••••">
        </div>
        <button type="submit" class="auth-submit-btn">Sign In</button>
      </form>

      <!-- Sign Up Form (Hidden by default) -->
      <form class="auth-form" id="signup-form" style="display: none;">
        <div class="auth-form-group">
          <label for="signup-name">Full Name</label>
          <input type="text" id="signup-name" required placeholder="John Doe">
        </div>
        <div class="auth-form-group">
          <label for="signup-email">Email Address</label>
          <input type="email" id="signup-email" required placeholder="user@example.com">
        </div>
        <div class="auth-form-group">
          <label for="signup-password">Create Password</label>
          <input type="password" id="signup-password" required placeholder="••••••••">
        </div>
        <button type="submit" class="auth-submit-btn">Create Free Account</button>
      </form>
    `;

    const closeModal = createModal("auth-modal-popup", "Welcome to BlueTEXT.in", bodyHtml);

    setTimeout(() => {
      const tabSignIn = document.getElementById("tab-signin-btn");
      const tabSignUp = document.getElementById("tab-signup-btn");
      const formSignIn = document.getElementById("signin-form");
      const formSignUp = document.getElementById("signup-form");

      tabSignIn.addEventListener("click", () => {
        tabSignIn.classList.add("active");
        tabSignUp.classList.remove("active");
        formSignIn.style.display = "flex";
        formSignUp.style.display = "none";
      });

      tabSignUp.addEventListener("click", () => {
        tabSignUp.classList.add("active");
        tabSignIn.classList.remove("active");
        formSignUp.style.display = "flex";
        formSignIn.style.display = "none";
      });

      formSignIn.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("auth-email").value.trim();
        if (email) {
          try { localStorage.setItem(AUTH_KEY, email); } catch (err) {}
          updateAuthUI();
          closeModal();
        }
      });

      formSignUp.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value.trim();
        if (email) {
          try { localStorage.setItem(AUTH_KEY, email); } catch (err) {}
          updateAuthUI();
          closeModal();
        }
      });
    }, 50);
  }

  function initAuth() {
    updateAuthUI();
    const btn = document.getElementById("auth-toggle-btn");
    if (btn) {
      btn.addEventListener("click", openAuthModal);
    }
  }

  // -------------------------------------------------------------------------
  // 6. Catalog Engine (Pagination, Search & Category Filtering)
  // -------------------------------------------------------------------------
  function initCatalogEngine() {
    const searchInput = document.getElementById("homepage-search-input");
    const viewport = document.getElementById("homepage-tools-viewport");
    const chips = document.querySelectorAll("#category-chips .chip-btn");
    const prevBtn = document.getElementById("pg-prev-btn");
    const nextBtn = document.getElementById("pg-next-btn");
    const statusText = document.getElementById("pg-status-text");
    const countIndicator = document.getElementById("active-count-indicator");

    if (!viewport) return;

    let allItems = [];
    let currentCategory = "all";
    let currentPage = 1;
    const pageSize = 12;

    function getCategory(url) {
      if (!url) return "other";
      if (url.startsWith("/pages/tools/videos/")) return "videos";
      if (url.startsWith("/pages/tools/")) return "tools";
      if (url.startsWith("/pages/games/")) return "games";
      if (url.startsWith("/pages/software/")) return "software";
      if (url.startsWith("/pages/tutorials/")) return "tutorials";
      if (url.startsWith("/pages/education/")) return "education";
      if (url.startsWith("/pages/blog/")) return "blog";
      return "other";
    }

    function render() {
      const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
      
      const filtered = allItems.filter(item => {
        const cat = getCategory(item.url);
        if (currentCategory !== "all" && cat !== currentCategory) return false;
        if (!query) return true;
        // Optimization: Use pre-computed lowercase properties to avoid redundant CPU-intensive operations on every key press
        return item._titleLower.includes(query) ||
               item._descLower.includes(query) ||
               item._keywordsLower.includes(query);
      });

      if (countIndicator) {
        countIndicator.textContent = `${filtered.length} resources`;
      }

      const totalPages = Math.ceil(filtered.length / pageSize) || 1;
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const startIdx = (currentPage - 1) * pageSize;
      const pageItems = filtered.slice(startIdx, startIdx + pageSize);

      if (prevBtn && nextBtn && statusText) {
        const pagContainer = document.getElementById("pagination-controls");
        if (filtered.length > pageSize) {
          if (pagContainer) pagContainer.style.display = "flex";
          prevBtn.disabled = currentPage === 1;
          nextBtn.disabled = currentPage >= totalPages;
          statusText.textContent = `Page ${currentPage} of ${totalPages}`;
        } else {
          if (pagContainer) pagContainer.style.display = "none";
        }
      }

      if (pageItems.length === 0) {
        viewport.innerHTML = `<div class="empty-state"><p>No matching resources found.</p></div>`;
        return;
      }

      viewport.innerHTML = pageItems.map(item => {
        const cat = getCategory(item.url);
        let icon = "📄";
        if (cat === "tools") icon = "🛠️";
        else if (cat === "games") icon = "🎮";
        else if (cat === "videos") icon = "🎥";
        else if (cat === "software") icon = "💻";
        else if (cat === "tutorials") icon = "📚";
        else if (cat === "education") icon = "🎓";

        return `
          <article class="tool-card">
            <a href="${item.url}" class="tool-card-link">
              <div class="tool-card-header">
                <span class="tool-icon" aria-hidden="true">${icon}</span>
                <h3 class="tool-title">${item.title}</h3>
              </div>
              <p class="tool-desc">${item.description || "Client-side utility tool."}</p>
              <div class="tool-card-footer">
                <span class="tool-tag">${cat}</span>
                <span class="tool-action">Launch &rarr;</span>
              </div>
            </a>
          </article>
        `;
      }).join("");
    }

    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        currentCategory = chip.dataset.category;
        currentPage = 1;
        render();
      });
    });

    if (searchInput) {
      let debounceTimeout;
      searchInput.addEventListener("input", () => {
        currentPage = 1;
        // Optimization: Debounce inputs by 150ms to prevent heavy UI rendering and reflows on every key press
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          render();
        }, 150);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          render();
          viewport.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentPage++;
        render();
        viewport.scrollIntoView({ behavior: "smooth" });
      });
    }

    fetch("/assets/data/search-index.json")
      .then(res => {
        if (!res.ok) throw new Error("Catalog fetch failed");
        return res.json();
      })
      .then(data => {
        // Optimization: Pre-compute lowercased search properties once during catalog load to optimize filtering runtime performance
        allItems = data
          .filter(item => item && item.url && item.url !== "/" && !item.url.endsWith("/index.html"))
          .map(item => ({
            ...item,
            _titleLower: (item.title || "").toLowerCase(),
            _descLower: (item.description || "").toLowerCase(),
            _keywordsLower: (item.keywords || "").toLowerCase()
          }));
        render();
      })
      .catch(err => {
        viewport.innerHTML = `<div class="empty-state"><p>Failed to load catalog.</p></div>`;
      });
  }

  // -------------------------------------------------------------------------
  // 7. Boot App
  // -------------------------------------------------------------------------
  initTheme();

  function boot() {
    initMobileNav();
    initClearCache();
    initAuth();
    initDonate();
    initCatalogEngine();

    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    // Dynamically load tools-handler.js on coding pages
    if (window.location.pathname.includes("/pages/tools/coding/")) {
      const script = document.createElement("script");
      script.src = "/assets/js/tools-handler.js";
      script.defer = true;
      document.body.appendChild(script);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
