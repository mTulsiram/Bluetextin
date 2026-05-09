(function () {
  const SUPPORTED_LOCALES = [
    "en",
    "zh-CN",
    "hi",
    "es",
    "fr",
    "ar",
    "bn",
    "pt",
    "ru",
    "ur",
    "id",
    "de",
    "ja",
    "sw",
    "mr",
    "te",
    "tr",
    "ta",
    "vi",
    "ko"
  ];

  let toolsCatalogCache = null;
  const CONSENT_KEY = "btConsent.v1";

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function stripLocaleFromPath(pathname) {
    const cleaned = pathname.startsWith("/") ? pathname : `/${pathname}`;
    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length && SUPPORTED_LOCALES.includes(parts[0])) {
      const rest = parts.slice(1).join("/");
      return rest ? `/${rest}` : "/";
    }
    return cleaned;
  }

  function detectLocaleFromPath(pathname) {
    const cleaned = pathname.startsWith("/") ? pathname : `/${pathname}`;
    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length && SUPPORTED_LOCALES.includes(parts[0])) {
      return parts[0];
    }
    return null;
  }

  function withLocale(pathname, locale) {
    const base = stripLocaleFromPath(pathname);
    return base === "/" ? `/${locale}/` : `/${locale}${base}`;
  }

  function getInitialLocale() {
    const fromPath = detectLocaleFromPath(window.location.pathname);
    if (fromPath) {
      return fromPath;
    }

    const stored = localStorage.getItem("lang") || "en";
    return SUPPORTED_LOCALES.includes(stored) ? stored : "en";
  }

  function getToolName(tool) {
    return tool?.name || tool?.title || "Untitled Tool";
  }

  function getToolHref(tool) {
    const raw = tool?.slug || tool?.path || "";
    if (!raw) {
      return "#";
    }
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  function getDefaultConsent() {
    return {
      necessary: true,
      analytics: false,
      ads: false,
      preferences: false,
      updatedAt: null
    };
  }

  function readConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      return { ...getDefaultConsent(), ...parsed, necessary: true };
    } catch (error) {
      console.error("Failed to parse consent state", error);
      return null;
    }
  }

  function writeConsent(consent) {
    const next = { ...getDefaultConsent(), ...consent, necessary: true, updatedAt: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    document.documentElement.setAttribute("data-consent-analytics", next.analytics ? "granted" : "denied");
    document.documentElement.setAttribute("data-consent-ads", next.ads ? "granted" : "denied");
    document.documentElement.setAttribute("data-consent-preferences", next.preferences ? "granted" : "denied");
    window.btConsent = next;
    window.dispatchEvent(new CustomEvent("bt:consent-updated", { detail: next }));
    return next;
  }

  function buildConsentBanner(locale) {
    const banner = document.createElement("section");
    banner.className = "consent-banner";
    banner.id = "consentBanner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML = `
      <h2 style="margin:0;font-size:1rem;">Privacy Choices</h2>
      <p class="text-muted" style="margin:0;">
        We use essential storage for language/theme and optional analytics/ads cookies only with your consent.
        Review details in <a href="${withLocale("/nav/privacy.html", locale)}">Privacy Policy</a> and <a href="${withLocale("/nav/compliance.html", locale)}">Compliance Center</a>.
      </p>
      <div class="consent-banner__actions">
        <button type="button" class="consent-btn consent-btn--primary" id="consentAcceptAll">Accept all</button>
        <button type="button" class="consent-btn" id="consentRejectNonEssential">Reject non-essential</button>
        <button type="button" class="consent-btn" id="consentCustomize">Customize</button>
      </div>
    `;
    return banner;
  }

  function buildConsentModal() {
    const modal = document.createElement("div");
    modal.className = "consent-modal";
    modal.id = "consentModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "consentModalTitle");
    modal.innerHTML = `
      <div class="consent-modal__panel">
        <h2 id="consentModalTitle" style="margin:0;font-size:1.1rem;">Privacy Settings</h2>
        <p class="text-muted" style="margin:0;">Choose which optional data processing categories you allow.</p>

        <label class="consent-option">
          <span><strong>Strictly necessary</strong><br><small>Required for core site functionality.</small></span>
          <input type="checkbox" checked disabled aria-label="Strictly necessary" />
        </label>

        <label class="consent-option">
          <span><strong>Analytics</strong><br><small>Helps us improve tools and usability.</small></span>
          <input type="checkbox" id="consentAnalytics" aria-label="Analytics consent" />
        </label>

        <label class="consent-option">
          <span><strong>Advertising</strong><br><small>Controls personalized ad-related storage.</small></span>
          <input type="checkbox" id="consentAds" aria-label="Advertising consent" />
        </label>

        <label class="consent-option">
          <span><strong>Preferences</strong><br><small>Stores non-essential preferences and UX enhancements.</small></span>
          <input type="checkbox" id="consentPreferences" aria-label="Preferences consent" />
        </label>

        <div class="consent-banner__actions">
          <button type="button" class="consent-btn consent-btn--primary" id="consentSave">Save settings</button>
          <button type="button" class="consent-btn" id="consentCancel">Cancel</button>
        </div>
      </div>
    `;
    return modal;
  }

  function setupConsentManager(locale) {
    const existingConsent = readConsent();
    if (existingConsent) {
      writeConsent(existingConsent);
    }

    const modal = buildConsentModal();
    document.body.appendChild(modal);

    const openModal = () => {
      const current = readConsent() || getDefaultConsent();
      modal.querySelector("#consentAnalytics").checked = !!current.analytics;
      modal.querySelector("#consentAds").checked = !!current.ads;
      modal.querySelector("#consentPreferences").checked = !!current.preferences;
      modal.classList.add("is-open");
    };

    const closeModal = () => modal.classList.remove("is-open");

    modal.querySelector("#consentCancel").addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    modal.querySelector("#consentSave").addEventListener("click", () => {
      writeConsent({
        analytics: modal.querySelector("#consentAnalytics").checked,
        ads: modal.querySelector("#consentAds").checked,
        preferences: modal.querySelector("#consentPreferences").checked
      });
      const banner = document.getElementById("consentBanner");
      if (banner) {
        banner.remove();
      }
      closeModal();
    });

    const footerOpenButton = document.getElementById("openConsentPrefs");
    if (footerOpenButton) {
      footerOpenButton.addEventListener("click", openModal);
    }

    if (existingConsent) {
      return;
    }

    const banner = buildConsentBanner(locale);
    document.body.appendChild(banner);

    banner.querySelector("#consentAcceptAll").addEventListener("click", () => {
      writeConsent({ analytics: true, ads: true, preferences: true });
      banner.remove();
    });

    banner.querySelector("#consentRejectNonEssential").addEventListener("click", () => {
      writeConsent({ analytics: false, ads: false, preferences: false });
      banner.remove();
    });

    banner.querySelector("#consentCustomize").addEventListener("click", openModal);
  }

  async function loadToolsCatalog() {
    if (Array.isArray(toolsCatalogCache)) {
      return toolsCatalogCache;
    }

    try {
      const response = await fetch("/assets/data/tools.json", { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load tools catalog: ${response.status}`);
      }

      const data = await response.json();
      toolsCatalogCache = Array.isArray(data?.tools) ? data.tools : [];
    } catch (error) {
      console.error(error);
      toolsCatalogCache = [];
    }

    return toolsCatalogCache;
  }

  async function loadInto(selector, url) {
    const mount = document.querySelector(selector);
    if (!mount) {
      return;
    }

    try {
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
      }

      mount.innerHTML = await response.text();
    } catch (error) {
      console.error(error);
    }
  }

  function normalizePath(pathname) {
    const localized = stripLocaleFromPath(pathname);
    if (!localized || localized === "/") {
      return "/index.html";
    }
    return localized.replace(/\/$/, "/index.html");
  }

  function localizeLinks(root, locale) {
    if (!root) {
      return;
    }

    const links = root.querySelectorAll("a[href]");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) {
        return;
      }

      const localizedPath = withLocale(url.pathname, locale);
      const localizedHref = `${localizedPath}${url.search}${url.hash}`;
      link.setAttribute("href", localizedHref);
    });
  }

  function markActiveNavLink(root) {
    if (!root) {
      return;
    }

    const current = normalizePath(window.location.pathname);
    const links = root.querySelectorAll("a[href]");
    links.forEach((link) => {
      const rawHref = link.getAttribute("href");
      if (!rawHref || rawHref.startsWith("mailto:")) {
        return;
      }

      const url = new URL(rawHref, window.location.origin);
      if (normalizePath(url.pathname) === current) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  async function loadDictionary(locale) {
    try {
      const response = await fetch("/assets/lang/ui.json", { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load ui.json: ${response.status}`);
      }

      const data = await response.json();
      const en = data.en || {};
      const scoped = data[locale] || {};
      return { ...en, ...scoped };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  function applyTranslations(dict) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        el.setAttribute("placeholder", dict[key]);
      }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        el.setAttribute("aria-label", dict[key]);
      }
    });
  }

  function setRuntimeI18n(locale, dict) {
    window.btI18n = {
      locale,
      dict,
      t(key, fallback) {
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
          return dict[key];
        }
        return fallback || key;
      }
    };

    window.dispatchEvent(new CustomEvent("bt:locale-changed", { detail: { locale } }));
  }

  async function setupHeaderBehavior() {
    const root = document.querySelector("#site-header, #header-placeholder");
    if (!root) {
      return;
    }

    const nav = root.querySelector(".main-nav");
    const menuButton = root.querySelector(".hamburger-menu");
    if (menuButton && nav) {
      menuButton.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    const themeButtons = root.querySelectorAll(".dark-mode-toggle");
    const storedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", storedTheme);
    document.body.setAttribute("data-theme", storedTheme);

    themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nextTheme);
        document.body.setAttribute("data-theme", nextTheme);
        localStorage.setItem("theme", nextTheme);
      });
    });

    const searchInput = root.querySelector("#headerSearch");
    const searchResults = root.querySelector("#headerSearchResults");
    const searchButton = root.querySelector(".mobile-search-icon");
    const toolsCatalog = await loadToolsCatalog();
    let currentMatches = [];
    let activeIndex = -1;

    function findMatches(searchText) {
      if (!searchText) {
        return [];
      }

      return toolsCatalog
        .filter((tool) => {
          const haystack = [getToolName(tool), tool.description, ...(tool.tags || [])]
            .map(normalize)
            .join(" ");
          return haystack.includes(searchText);
        })
        .slice(0, 6);
    }

    function toLocalizedToolHref(tool) {
      const locale = getInitialLocale();
      return withLocale(getToolHref(tool), locale);
    }

    function renderResults(matches) {
      if (!searchResults) {
        return;
      }

      currentMatches = matches;
      activeIndex = -1;

      if (!matches.length) {
        searchResults.style.display = "none";
        searchResults.innerHTML = "";
        searchInput?.removeAttribute("aria-activedescendant");
        return;
      }

      searchResults.style.display = "block";
      searchResults.innerHTML = matches
        .map(
          (tool, index) => `<a class="search-result-item" id="header-search-result-${index}" href="${toLocalizedToolHref(tool)}" role="option" aria-selected="false">
            <strong>${getToolName(tool)}</strong>
            <small>${tool.category || "tool"}</small>
          </a>`
        )
        .join("");
    }

    function setActiveResult(nextIndex) {
      if (!searchResults) {
        return;
      }

      const options = searchResults.querySelectorAll(".search-result-item");
      options.forEach((item) => {
        item.classList.remove("is-active");
        item.setAttribute("aria-selected", "false");
      });

      if (!options.length || nextIndex < 0 || nextIndex >= options.length) {
        activeIndex = -1;
        searchInput?.removeAttribute("aria-activedescendant");
        return;
      }

      activeIndex = nextIndex;
      const activeItem = options[activeIndex];
      activeItem.classList.add("is-active");
      activeItem.setAttribute("aria-selected", "true");
      searchInput?.setAttribute("aria-activedescendant", activeItem.id);
      activeItem.scrollIntoView({ block: "nearest" });
    }

    const runSearch = () => {
      if (!searchInput) {
        return;
      }

      const query = normalize(searchInput.value);
      if (!query) {
        searchInput.focus();
        return;
      }

      if (activeIndex >= 0 && currentMatches[activeIndex]) {
        const activeHref = toLocalizedToolHref(currentMatches[activeIndex]);
        if (activeHref !== "#") {
          window.location.href = activeHref;
          return;
        }
      }

      const firstMatch = findMatches(query)[0];
      const firstMatchHref = firstMatch ? toLocalizedToolHref(firstMatch) : "#";
      if (firstMatchHref !== "#") {
        window.location.href = firstMatchHref;
        return;
      }

      const locale = getInitialLocale();
      window.location.href = `${withLocale("/tools-platform/all-tools.html", locale)}?q=${encodeURIComponent(query)}`;
    };

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        renderResults(findMatches(normalize(searchInput.value)));
      });

      searchInput.addEventListener("focus", () => {
        renderResults(findMatches(normalize(searchInput.value)));
      });

      searchInput.addEventListener("blur", () => {
        if (!searchResults) {
          return;
        }
        setTimeout(() => {
          searchResults.style.display = "none";
        }, 120);
      });

      searchInput.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!currentMatches.length) {
            return;
          }

          const nextIndex = activeIndex < currentMatches.length - 1 ? activeIndex + 1 : 0;
          setActiveResult(nextIndex);
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          if (!currentMatches.length) {
            return;
          }

          const nextIndex = activeIndex > 0 ? activeIndex - 1 : currentMatches.length - 1;
          setActiveResult(nextIndex);
          return;
        }

        if (event.key === "Escape") {
          if (searchResults) {
            searchResults.style.display = "none";
            searchResults.innerHTML = "";
          }
          currentMatches = [];
          activeIndex = -1;
          searchInput.removeAttribute("aria-activedescendant");
          return;
        }

        if (event.key === "Enter") {
          event.preventDefault();
          runSearch();
        }
      });
    }

    if (searchButton) {
      searchButton.addEventListener("click", () => {
        if (!searchInput) {
          return;
        }

        if (!normalize(searchInput.value)) {
          searchInput.focus();
          return;
        }

        runSearch();
      });
    }
  }

  function setupLanguageSwitcher(locale) {
    const selector = document.querySelector("#languageSelector");
    if (!selector) {
      return;
    }

    if (SUPPORTED_LOCALES.includes(locale)) {
      selector.value = locale;
    }

    selector.addEventListener("change", () => {
      const nextLocale = selector.value;
      if (!SUPPORTED_LOCALES.includes(nextLocale)) {
        return;
      }

      localStorage.setItem("lang", nextLocale);
      const nextPath = withLocale(window.location.pathname, nextLocale);
      const target = `${nextPath}${window.location.search}${window.location.hash}`;
      window.location.href = target;
    });
  }

  async function initPartials() {
    const locale = getInitialLocale();
    localStorage.setItem("lang", locale);
    document.documentElement.lang = locale;

    if (!detectLocaleFromPath(window.location.pathname)) {
      const normalized = `${withLocale(window.location.pathname, locale)}${window.location.search}${window.location.hash}`;
      window.history.replaceState({}, "", normalized);
    }

    await loadInto("#site-header, #header-placeholder", "/components/header.html");
    await loadInto("#site-footer, #footer-placeholder", "/components/footer.html");

    const headerRoot = document.querySelector("#site-header, #header-placeholder");
    const footerRoot = document.querySelector("#site-footer, #footer-placeholder");

    localizeLinks(document.body, locale);
    localizeLinks(headerRoot, locale);
    localizeLinks(footerRoot, locale);

    markActiveNavLink(headerRoot);
    markActiveNavLink(footerRoot);

    const dict = await loadDictionary(locale);
    applyTranslations(dict);
    setRuntimeI18n(locale, dict);

    await setupHeaderBehavior();
    setupLanguageSwitcher(locale);
    setupConsentManager(locale);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPartials);
  } else {
    initPartials();
  }
})();