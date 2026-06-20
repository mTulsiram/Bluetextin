/**
 * BlueTEXT Main Application JS Runtime
 * Handles client-side navigation, registry search, theme management, PWA service worker, and privacy consent.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Path Resolver Helper
  // Detects the path level from root to load components/assets correctly on any page
  const getPathPrefix = () => {
    const loc = window.location.pathname;
    // Count directory depths
    // E.g., /tools/coding/base64-encoder.html -> 2 levels deep -> "../../"
    // E.g., /index.html or / -> 0 levels deep -> "./"
    const cleanPath = loc.replace(/^\/|index\.html$/g, '');
    const parts = cleanPath.split('/').filter(Boolean);
    
    // For local file protocol: file:///C:/path/to/project/tools/coding/base64-encoder.html
    if (window.location.protocol === 'file:') {
      const index = loc.indexOf('/BlueTEXTin/');
      if (index !== -1) {
        const subPath = loc.substring(index + '/BlueTEXTin/'.length);
        const fileParts = subPath.split('/').filter(Boolean);
        if (fileParts.length > 1) {
          return '../'.repeat(fileParts.length - 1);
        }
      }
    }
    
    if (parts.length > 0) {
      return '../'.repeat(parts.length);
    }
    return './';
  };

  const prefix = getPathPrefix();

  // 2. Load Components Dynamically
  const loadDynamicComponents = async () => {
    try {
      // Load Header
      const headerContainer = document.getElementById('global-header');
      if (headerContainer) {
        const res = await fetch(`${prefix}components/header.html`);
        if (res.ok) {
          let html = await res.text();
          // Resolve absolute sitemap, index, category, and asset paths relatively
          html = html.replace(/href="\/(tools|games|software|tutorials|education|components|index\.html|sitemap\.xml)/g, (match, group) => {
            return `href="${prefix}${group}`;
          });
          headerContainer.innerHTML = html;
          setupThemeToggle();
          setupHeaderInteractiveFeatures();
        }
      }

      // Load Footer
      const footerContainer = document.getElementById('global-footer');
      if (footerContainer) {
        const res = await fetch(`${prefix}components/footer.html`);
        if (res.ok) {
          let html = await res.text();
          html = html.replace(/href="\/(tools|games|software|tutorials|education|components|index\.html|sitemap\.xml)/g, (match, group) => {
            return `href="${prefix}${group}`;
          });
          footerContainer.innerHTML = html;
          setupResetConsentButton();
        }
      }
    } catch (e) {
      console.warn("Failed to load header/footer components dynamically:", e);
    }
  };

  // 3. Cookie Consent (GDPR/PIPL/CCPA/DPDP Compliance)
  const consentBanner = document.getElementById('consent-banner');
  const acceptBtn = document.getElementById('consent-accept-btn');
  const rejectBtn = document.getElementById('consent-reject-btn');

  const checkConsent = () => {
    const consent = localStorage.getItem('bluetext_privacy_consent');
    if (!consent && consentBanner) {
      consentBanner.style.display = 'flex';
    }
  };

  if (acceptBtn && consentBanner) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('bluetext_privacy_consent', 'accepted');
      consentBanner.style.display = 'none';
    });
  }

  if (rejectBtn && consentBanner) {
    rejectBtn.addEventListener('click', () => {
      localStorage.setItem('bluetext_privacy_consent', 'rejected');
      consentBanner.style.display = 'none';
    });
  }

  const setupResetConsentButton = () => {
    const resetBtn = document.getElementById('reset-consent-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        localStorage.removeItem('bluetext_privacy_consent');
        if (consentBanner) {
          consentBanner.style.display = 'flex';
          consentBanner.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  };

  checkConsent();

  // 4. Theme & Dark Mode Manager
  const applyTheme = (theme) => {
    const sunIcons = document.querySelectorAll('.theme-icon-sun');
    const moonIcons = document.querySelectorAll('.theme-icon-moon');
    
    if (theme === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      sunIcons.forEach(i => i.style.display = 'block');
      moonIcons.forEach(i => i.style.display = 'none');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      sunIcons.forEach(i => i.style.display = 'none');
      moonIcons.forEach(i => i.style.display = 'block');
    }
  };

  const setupThemeToggle = () => {
    const toggleBtns = document.querySelectorAll('.dark-mode-toggle, #theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('theme-light') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('bluetext_theme', newTheme);
        applyTheme(newTheme);
      });
    });
    // Apply current active theme status icons
    let savedTheme = localStorage.getItem('bluetext_theme');
    if (!savedTheme) {
      savedTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    applyTheme(savedTheme);
  };

  // Header Interactive Features: Navigation Toggles, Keyboard Controls, Login, Language Options
  const setupHeaderInteractiveFeatures = () => {
    // A. Dropdown Nav Toggles (Tools, Games, Software, etc.)
    const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
    dropdownItems.forEach(item => {
      const trigger = item.querySelector('.nav-trigger');
      
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = item.classList.contains('show');
        
        // Close all other dropdowns
        closeAllHeaderDropdowns();
        
        if (!isOpen) {
          item.classList.add('show');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      // Keyboard Trap inside Dropdown Panel
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          item.classList.remove('show');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
    });

    // B. Language Selector Listbox
    const langWrapper = document.querySelector('.lang-selector-wrapper');
    const langBtn = document.getElementById('lang-menu-btn');
    const langListbox = document.getElementById('lang-listbox');
    const currentLangLabel = document.getElementById('current-lang-label');
    const langOptions = document.querySelectorAll('#lang-listbox li');

    // i18n Translations Dictionary
    const TRANSLATIONS = {
      en: {
        "title": "Local static web directory",
        "subtitle": "Browse offline-ready client-side utilities, retro arcade games, and comprehensive learning materials.",
        "search_placeholder": "Search 470+ modules (e.g. base64, snake, calculus, git)...",
        "tools": "Tools",
        "games": "Games",
        "software": "Software",
        "tutorials": "Tutorials",
        "education": "Education",
        "all_categories": "All Categories"
      },
      es: {
        "title": "Directorio web estático local",
        "subtitle": "Explore utilidades del lado del cliente listas para usar sin conexión, juegos arcade retro y materiales de aprendizaje completos.",
        "search_placeholder": "Buscar más de 470 módulos (por ejemplo, base64, snake, cálculo, git)...",
        "tools": "Herramientas",
        "games": "Juegos",
        "software": "Software",
        "tutorials": "Tutoriales",
        "education": "Educación",
        "all_categories": "Todas las categorías"
      },
      fr: {
        "title": "Répertoire web statique local",
        "subtitle": "Parcourez des utilitaires côté client prêts pour le hors-ligne, des jeux d'arcade rétro et des documents d'apprentissage complets.",
        "search_placeholder": "Rechercher plus de 470 modules (ex. base64, snake, calcul, git)...",
        "tools": "Outils",
        "games": "Jeux",
        "software": "Logiciels",
        "tutorials": "Tutoriels",
        "education": "Éducation",
        "all_categories": "Toutes les catégories"
      },
      de: {
        "title": "Lokales statisches Webverzeichnis",
        "subtitle": "Durchsuchen Sie offline-bereite clientseitige Dienstprogramme, Retro-Arcade-Spiele und umfassende Lernmaterialien.",
        "search_placeholder": "Durchsuche 470+ Module (z. B. Base64, Snake, Calculus, Git)...",
        "tools": "Werkzeuge",
        "games": "Spiele",
        "software": "Software",
        "tutorials": "Tutorials",
        "education": "Bildung",
        "all_categories": "Alle Kategorien"
      },
      hi: {
        "title": "स्थानीय स्थिर वेब निर्देशिका",
        "subtitle": "ऑफ़लाइन-तैयार क्लाइंट-साइड उपयोगिताओं, रेट्रो आर्केड गेम और व्यापक शिक्षण सामग्री ब्राउज़ करें।",
        "search_placeholder": "470+ मॉड्यूल खोजें (जैसे base64, snake, calculus, git)...",
        "tools": "उपकरण",
        "games": "खेल",
        "software": "सॉफ्टवेयर",
        "tutorials": "ट्यूटोरियल",
        "education": "शिक्षा",
        "all_categories": "सभी श्रेणियां"
      }
    };

    const translatePage = (lang) => {
      const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key]) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = dict[key];
          } else {
            el.textContent = dict[key];
          }
        }
      });
      // Also update search input placeholder dynamically
      const sInput = document.getElementById('directory-search-input');
      if (sInput && dict["search_placeholder"]) {
        sInput.placeholder = dict["search_placeholder"];
      }
    };

    if (langBtn && langWrapper && langListbox) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = langWrapper.classList.contains('show');
        closeAllHeaderDropdowns();
        
        if (!isOpen) {
          langWrapper.classList.add('show');
          langBtn.setAttribute('aria-expanded', 'true');
          const selectedOption = langListbox.querySelector('[aria-selected="true"]');
          if (selectedOption) selectedOption.focus();
        }
      });

      langWrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          langWrapper.classList.remove('show');
          langBtn.setAttribute('aria-expanded', 'false');
          langBtn.focus();
        }
      });

      langOptions.forEach(opt => {
        const selectLang = (element) => {
          const langCode = element.dataset.lang;
          localStorage.setItem('bluetext_lang', langCode);
          currentLangLabel.textContent = langCode.toUpperCase();
          
          langOptions.forEach(o => {
            o.setAttribute('aria-selected', 'false');
          });
          element.setAttribute('aria-selected', 'true');
          
          langWrapper.classList.remove('show');
          langBtn.setAttribute('aria-expanded', 'false');
          translatePage(langCode);
          langBtn.focus();
        };

        opt.addEventListener('click', () => selectLang(opt));
        opt.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectLang(opt);
          }
        });
      });

      const savedLang = localStorage.getItem('bluetext_lang') || 'en';
      const activeOption = langListbox.querySelector(`[data-lang="${savedLang}"]`);
      if (activeOption) {
        langOptions.forEach(o => o.setAttribute('aria-selected', 'false'));
        activeOption.setAttribute('aria-selected', 'true');
        currentLangLabel.textContent = savedLang.toUpperCase();
      }
      translatePage(savedLang);
    }

    // C. Cookie Authentication Helpers
    const setCookie = (name, value, days) => {
      if (window.location.protocol === 'file:') return;
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax; Secure`;
    };

    const getCookie = (name) => {
      if (window.location.protocol === 'file:') return null;
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const eraseCookie = (name) => {
      if (window.location.protocol === 'file:') return;
      document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Lax; Secure`;
    };

    // D. Settings JSON Import & Export Functions
    const exportUserSettings = () => {
      const settings = {
        theme: localStorage.getItem('bluetext_theme') || 'dark',
        lang: localStorage.getItem('bluetext_lang') || 'en',
        consent: localStorage.getItem('bluetext_privacy_consent') || 'accepted',
        logged: !!(localStorage.getItem('bluetext_user_logged') || getCookie('bluetext_session'))
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "bluetext-settings.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };

    const importUserSettings = (file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target.result);
          
          // Validate import file schema
          if (config.theme && (config.theme === 'light' || config.theme === 'dark')) {
            localStorage.setItem('bluetext_theme', config.theme);
          }
          if (config.lang) {
            localStorage.setItem('bluetext_lang', config.lang);
          }
          if (config.consent) {
            localStorage.setItem('bluetext_privacy_consent', config.consent);
          }
          if (config.logged !== undefined) {
            if (config.logged) {
              localStorage.setItem('bluetext_user_logged', 'true');
              setCookie('bluetext_session', 'authorized_admin', 1);
            } else {
              localStorage.removeItem('bluetext_user_logged');
              eraseCookie('bluetext_session');
            }
          }
          
          // Hot reload workspace config
          window.location.reload();
        } catch (e) {
          alert("Error: Invalid JSON settings file format.");
        }
      };
      reader.readAsText(file);
    };

    // E. User Login Simulation
    const userSection = document.getElementById('user-profile-section');
    
    const updateLoginUI = () => {
      if (!userSection) return;
      const isLoggedIn = localStorage.getItem('bluetext_user_logged') || getCookie('bluetext_session');
      
      if (isLoggedIn) {
        userSection.innerHTML = `
          <button class="btn btn--primary nav-trigger" id="profile-menu-btn" aria-expanded="false" aria-haspopup="true" type="button" style="padding: 0.45rem 1rem; font-size: 0.85rem;">
            👤 Admin <span aria-hidden="true" style="font-size: 0.65rem; margin-left: 4px;">▼</span>
          </button>
          <div class="dropdown-pane" id="profile-dropdown-pane" style="width: 220px; right: 0; left: auto; transform: translateY(10px); display: flex; flex-direction: column; gap: var(--space-3);">
            <div style="font-weight: 600; font-size: 0.85rem; color: var(--accent-success); border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; margin-bottom: 0.25rem;">
              Session: Active Admin
            </div>
            <button class="btn btn--ghost" id="export-settings-btn" type="button" style="width: 100%; justify-content: flex-start; font-size: 0.85rem; padding: 0.45rem 0.75rem;">
              📤 Export Settings
            </button>
            <label class="btn btn--ghost" for="settings-file-input" style="width: 100%; justify-content: flex-start; font-size: 0.85rem; padding: 0.45rem 0.75rem; margin: 0; cursor: pointer;">
              📥 Import Settings
            </label>
            <input type="file" id="settings-file-input" accept=".json" style="display: none;">
            <button class="btn btn--primary" id="header-logout-btn" type="button" style="width: 100%; justify-content: center; font-size: 0.85rem; padding: 0.45rem 0.75rem; margin-top: 0.25rem;">
              Sign Out
            </button>
          </div>
        `;

        // Profile Menu toggle events
        const profileBtn = document.getElementById('profile-menu-btn');
        const profilePane = document.getElementById('profile-dropdown-pane');
        
        if (profileBtn && profilePane) {
          profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = profilePane.classList.contains('show');
            closeAllHeaderDropdowns();
            if (!isOpen) {
              profilePane.classList.add('show');
              profileBtn.setAttribute('aria-expanded', 'true');
            }
          });

          profilePane.addEventListener('click', (e) => e.stopPropagation());
        }

        // Export/Import listeners
        document.getElementById('export-settings-btn').addEventListener('click', exportUserSettings);
        document.getElementById('settings-file-input').addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
            importUserSettings(e.target.files[0]);
          }
        });

        // Logout
        document.getElementById('header-logout-btn').addEventListener('click', () => {
          localStorage.removeItem('bluetext_user_logged');
          eraseCookie('bluetext_session');
          updateLoginUI();
        });

      } else {
        userSection.innerHTML = `
          <button class="btn btn--primary" id="header-login-btn" type="button" style="padding: 0.45rem 1rem; font-size: 0.85rem;">
            Sign In
          </button>
        `;

        document.getElementById('header-login-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          // Mock login validation
          localStorage.setItem('bluetext_user_logged', 'true');
          setCookie('bluetext_session', 'authorized_admin', 1);
          updateLoginUI();
        });
      }
    };

    updateLoginUI();

    // Helper: Close all menus when clicking outside
    document.addEventListener('click', () => {
      closeAllHeaderDropdowns();
    });

    function closeAllHeaderDropdowns() {
      dropdownItems.forEach(item => {
        item.classList.remove('show');
        item.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
      });
      if (langWrapper) {
        langWrapper.classList.remove('show');
        langBtn.setAttribute('aria-expanded', 'false');
      }
      const profilePane = document.getElementById('profile-dropdown-pane');
      const profileBtn = document.getElementById('profile-menu-btn');
      if (profilePane && profilePane.classList.contains('show')) {
        profilePane.classList.remove('show');
        profileBtn.setAttribute('aria-expanded', 'false');
      }
    }
  };


  // Run dynamic loading
  await loadDynamicComponents();



  // 5. Explorer Dashboard Registry Navigation and Search
  let toolsRegistry = [];
  const filePane = document.getElementById('file-list-pane');
  const breadcrumbs = document.getElementById('explorer-breadcrumbs');
  const itemCounter = document.getElementById('explorer-item-counter');
  const searchInput = document.getElementById('directory-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const categoryNodes = document.querySelectorAll('.category-node');

  let activeCategory = 'all';
  let activeSubcategory = '';
  let searchQuery = '';

  // Load registry from tools.json
  try {
    const res = await fetch(`${prefix}assets/data/tools.json`);
    if (res.ok) {
      toolsRegistry = await res.json();
      updateCategoryCounts();
      renderExplorer();
    }
  } catch (e) {
    console.error("Failed to load tools registry:", e);
    if (filePane) {
      filePane.innerHTML = `<div style="color: var(--accent-danger); text-align: center; padding: 2rem;">Failed to load registry: ${e.message}</div>`;
    }
  }

  function updateCategoryCounts() {
    const counts = { all: toolsRegistry.length };
    categoryNodes.forEach(node => {
      const cat = node.dataset.category;
      if (cat !== 'all') {
        counts[cat] = toolsRegistry.filter(item => item.category === cat).length;
        const countBadge = document.getElementById(`count-${cat}`);
        if (countBadge) countBadge.textContent = counts[cat];
      }
    });
    const allBadge = document.getElementById('count-all');
    if (allBadge) allBadge.textContent = counts.all;
  }

  function renderExplorer() {
    if (!filePane) return;

    // Filter registry
    let filtered = toolsRegistry;

    // Search query matches
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q)
      );
    } else {
      // Category / Subcategory drill down filter (only if not searching)
      if (activeCategory !== 'all') {
        filtered = filtered.filter(item => item.category === activeCategory);
        if (activeSubcategory) {
          filtered = filtered.filter(item => item.subcategory === activeSubcategory);
        }
      }
    }

    // Build lists of items or folders to display
    // If not searching, we want to group items by subcategory folder if we are at root or category level
    if (!searchQuery && activeCategory === 'all') {
      // Root level: show category folders
      const folders = ['tools', 'games', 'software', 'tutorials', 'education'];
      const html = folders.map(f => {
        const itemCount = toolsRegistry.filter(item => item.category === f).length;
        return `
          <div class="file-row" style="cursor: pointer;" onclick="window.appNavigate('${f}', '')">
            <span class="file-icon">📁</span>
            <div class="file-info">
              <span class="file-name" style="color: var(--accent-primary-hover);">${f.toUpperCase()}</span>
              <span class="file-path">${itemCount} items registered</span>
            </div>
            <span class="compliance-pill" style="text-align: right;">Directory</span>
          </div>
        `;
      }).join('');
      filePane.innerHTML = html;
      updateBreadcrumbs();
      if (itemCounter) itemCounter.textContent = `Showing 5 directories`;
      return;
    }

    if (!searchQuery && activeCategory !== 'all' && !activeSubcategory) {
      // Category level: show subcategory folders (e.g., coding, math, arcade)
      const subcategories = [...new Set(
        toolsRegistry.filter(item => item.category === activeCategory).map(item => item.subcategory)
      )].filter(Boolean);

      if (subcategories.length > 0) {
        const folderHtml = subcategories.map(sub => {
          const itemCount = toolsRegistry.filter(item => item.category === activeCategory && item.subcategory === sub).length;
          return `
            <div class="file-row" style="cursor: pointer;" onclick="window.appNavigate('${activeCategory}', '${sub}')">
              <span class="file-icon">📁</span>
              <div class="file-info">
                <span class="file-name" style="color: var(--accent-primary-hover);">${sub.charAt(0).toUpperCase() + sub.slice(1)}</span>
                <span class="file-path">${itemCount} files</span>
              </div>
              <span class="compliance-pill" style="text-align: right;">Folder</span>
            </div>
          `;
        }).join('');
        filePane.innerHTML = folderHtml;
        updateBreadcrumbs();
        if (itemCounter) itemCounter.textContent = `Showing ${subcategories.length} folders`;
        return;
      }
    }

    // Leaf view / List view (either because subcategory is active or user is searching)
    if (filtered.length === 0) {
      filePane.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: var(--space-3);">🔍</div>
          No matching modules or files found.
        </div>
      `;
      if (itemCounter) itemCounter.textContent = `Showing 0 files`;
    } else {
      const fileIcon = (cat) => {
        if (cat === 'games') return '🎮';
        if (cat === 'tutorials') return '📚';
        if (cat === 'education') return '🎓';
        if (cat === 'software') return '💿';
        return '🛠️';
      };

      const fileHtml = filtered.map(item => {
        return `
          <a class="file-row" href="${prefix}${item.path}" style="text-decoration: none;" target="_blank">
            <span class="file-icon">${fileIcon(item.category)}</span>
            <div class="file-info">
              <span class="file-name">${item.name}</span>
              <span class="file-path" style="margin-top: 0.15rem;">${item.description}</span>
            </div>
            <span class="compliance-pill" style="text-align: right;">${item.category.toUpperCase()}/${item.subcategory.toUpperCase()}</span>
          </a>
        `;
      }).join('');
      filePane.innerHTML = fileHtml;
      if (itemCounter) itemCounter.textContent = `Showing ${filtered.length} files`;
    }

    updateBreadcrumbs();
  }

  function updateBreadcrumbs() {
    if (!breadcrumbs) return;

    let html = `<span style="cursor: pointer; text-decoration: underline;" onclick="window.appNavigate('all', '')">Root</span>`;
    
    if (activeCategory !== 'all') {
      html += ` <span>/</span> <span style="cursor: pointer; text-decoration: underline;" onclick="window.appNavigate('${activeCategory}', '')">${activeCategory}</span>`;
      if (activeSubcategory) {
        html += ` <span>/</span> <span>${activeSubcategory}</span>`;
      }
    }

    if (searchQuery) {
      html = `<span>Search Results for "${searchQuery}"</span>`;
    }

    breadcrumbs.innerHTML = html;
  }

  // Setup navigation globally so inline handlers can trigger it
  window.appNavigate = (category, subcategory) => {
    activeCategory = category;
    activeSubcategory = subcategory;
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.style.display = 'none';
    
    // Highlight category sidebar node
    categoryNodes.forEach(node => {
      if (node.dataset.category === category && !subcategory) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    renderExplorer();
  };

  // Category nodes click handlers
  categoryNodes.forEach(node => {
    node.addEventListener('click', () => {
      const cat = node.dataset.category;
      window.appNavigate(cat, '');
    });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const cat = node.dataset.category;
        window.appNavigate(cat, '');
      }
    });
  });

  // Search input handling
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery) {
        if (searchClearBtn) searchClearBtn.style.display = 'block';
      } else {
        if (searchClearBtn) searchClearBtn.style.display = 'none';
      }
      renderExplorer();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      searchClearBtn.style.display = 'none';
      renderExplorer();
    });
  }

  // 6. Service Worker Registration (Standard PWA offline capability)
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    try {
      await navigator.serviceWorker.register(`${prefix}assets/js/service-worker.js`);
    } catch (e) {
      console.log('ServiceWorker registration skipped or failed:', e);
    }
  }
});
