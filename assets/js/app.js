/**
 * BlueTEXT Main Application JS Runtime
 * Handles client-side navigation, registry search, theme management, PWA service worker, and privacy consent.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Path Resolver Helper
  // Detects the path level from root to load components/assets correctly on any page
  const getPathPrefix = () => {
    const loc = window.location.pathname;
    const cleanPath = loc.replace(/^\/|index\.html$/g, '');
    const parts = cleanPath.split('/').filter(Boolean);
    
    // For local file protocol
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

  // 2. Global i18n Translations Dictionary
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
      "all_categories": "All Categories",
      
      // Subcategories
      "coding": "Coding",
      "converters": "Converters",
      "data": "Data",
      "images": "Images",
      "lifestyle": "Lifestyle",
      "math": "Math",
      "network": "Network",
      "office": "Office",
      "utilities": "Utilities",
      "videos": "Videos",
      "miscellaneous": "Miscellaneous",
      "arcade": "Arcade",
      "puzzles": "Puzzles",
      "board": "Board",
      "cards": "Cards",
      "word": "Word",
      "web-dev": "Web Development",
      "programming": "Programming",
      "backend": "Backend & DevOps",
      "design": "UI/UX Design",
      "security": "Cyber Security",
      "science": "Science",
      "humanities": "Humanities",
      "languages": "Languages",
      "finance": "Finance",
      "windows": "Windows",
      "linux": "Linux",
      "android": "Android",
      "apple": "Apple OS",
      
      // Sub-subcategories
      "utility": "Utility Software",
      "productivity": "Productivity Utilities",
      "multimedia": "Multimedia Tools",
      "development": "Development Software",
      
      // Explorer States
      "showing_dirs": "Showing {n} directories",
      "showing_folders": "Showing {n} folders",
      "showing_files": "Showing {n} files",
      "registered_items": "{n} items registered",
      "sitemap_explorer_no_results": "No matching modules or files found."
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
      "all_categories": "Todas las categorías",
      
      // Subcategories
      "coding": "Codificación",
      "converters": "Conversores",
      "data": "Datos",
      "images": "Imágenes",
      "lifestyle": "Estilo de vida",
      "math": "Matemáticas",
      "network": "Redes & SEO",
      "office": "Oficina",
      "utilities": "Utilidades",
      "videos": "Videos & Audio",
      "miscellaneous": "Miscelánea",
      "arcade": "Arcade",
      "puzzles": "Puzles",
      "board": "Tablero",
      "cards": "Cartas",
      "word": "Palabras",
      "web-dev": "Desarrollo Web",
      "programming": "Programación",
      "backend": "Backend & DevOps",
      "design": "Diseño UI/UX",
      "security": "Ciberseguridad",
      "science": "Ciencia",
      "humanities": "Humanidades",
      "languages": "Idiomas",
      "finance": "Finanzas",
      "windows": "Windows",
      "linux": "Linux",
      "android": "Android",
      "apple": "Sistemas Apple",
      
      // Sub-subcategories
      "utility": "Software de Utilidad",
      "productivity": "Herramientas de Productividad",
      "multimedia": "Herramientas Multimedia",
      "development": "Software de Desarrollo",
      
      // Explorer States
      "showing_dirs": "Mostrando {n} directorios",
      "showing_folders": "Mostrando {n} carpetas",
      "showing_files": "Mostrando {n} archivos",
      "registered_items": "{n} elementos registrados",
      "sitemap_explorer_no_results": "No se encontraron módulos o archivos coincidentes."
    },
    fr: {
      "title": "Répertoire web statique local",
      "subtitle": "Parcourez des utilitaires côté client prêts pour le hors-ligne, des jeux d'arcade rétro et des documents d'apprentissage complets.",
      "search_placeholder": "Rechercher plus de 470 modules (ex. base64, srt, calcul, git)...",
      "tools": "Outils",
      "games": "Jeux",
      "software": "Logiciels",
      "tutorials": "Tutoriels",
      "education": "Éducation",
      "all_categories": "Toutes les catégories",
      
      // Subcategories
      "coding": "Codage",
      "converters": "Convertisseurs",
      "data": "Données",
      "images": "Images",
      "lifestyle": "Mode de vie",
      "math": "Mathématiques",
      "network": "Réseaux & SEO",
      "office": "Bureau & Écriture",
      "utilities": "Utilitaires",
      "videos": "Vidéo & Son",
      "miscellaneous": "Divers",
      "arcade": "Arcade",
      "puzzles": "Puzzles",
      "board": "Plateau",
      "cards": "Cartes",
      "word": "Lettres",
      "web-dev": "Développement Web",
      "programming": "Programmation",
      "backend": "Backend & DevOps",
      "design": "Design UI/UX",
      "security": "Cyber-sécurité",
      "science": "Sciences",
      "humanities": "Lettres & Histoire",
      "languages": "Langues",
      "finance": "Finance",
      "windows": "Windows",
      "linux": "Linux",
      "android": "Android",
      "apple": "Systèmes Apple",
      
      // Sub-subcategories
      "utility": "Utilitaires Système",
      "productivity": "Outils de Productivité",
      "multimedia": "Création Multimédia",
      "development": "Logiciels de Développement",
      
      // Explorer States
      "showing_dirs": "Affichage de {n} répertoires",
      "showing_folders": "Affichage de {n} dossiers",
      "showing_files": "Affichage de {n} fichiers",
      "registered_items": "{n} éléments enregistrés",
      "sitemap_explorer_no_results": "Aucun module ou fichier correspondant trouvé."
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
      "all_categories": "Alle Kategorien",
      
      // Subcategories
      "coding": "Codierung",
      "converters": "Konverter",
      "data": "Datenformate",
      "images": "Bilder & Grafiken",
      "lifestyle": "Lebensstil",
      "math": "Mathematik",
      "network": "Netzwerk & SEO",
      "office": "Büro & Schreiben",
      "utilities": "Dienstprogramme",
      "videos": "Video & Audio",
      "miscellaneous": "Verschiedenes",
      "arcade": "Arcade",
      "puzzles": "Puzzles",
      "board": "Brettspiele",
      "cards": "Kartenspiele",
      "word": "Wortspiele",
      "web-dev": "Webentwicklung",
      "programming": "Programmierung",
      "backend": "Backend & DevOps",
      "design": "UI/UX Design",
      "security": "Cybersicherheit",
      "science": "Wissenschaft",
      "humanities": "Geisteswissenschaften",
      "languages": "Sprachen",
      "finance": "Finanzen",
      "windows": "Windows",
      "linux": "Linux",
      "android": "Android",
      "apple": "Apple OS",
      
      // Sub-subcategories
      "utility": "Systemwerkzeuge",
      "productivity": "Produktivitätstools",
      "multimedia": "Multimedia-Software",
      "development": "Entwicklerwerkzeuge",
      
      // Explorer States
      "showing_dirs": "Zeige {n} Verzeichnisse",
      "showing_folders": "Zeige {n} Ordner",
      "showing_files": "Zeige {n} Dateien",
      "registered_items": "{n} Module registriert",
      "sitemap_explorer_no_results": "Keine passenden Module oder Dateien gefunden."
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
      "all_categories": "सभी श्रेणियां",
      
      // Subcategories
      "coding": "कोडिंग",
      "converters": "कनवर्टर्स",
      "data": "डेटा प्रारूप",
      "images": "चित्र और ग्राफिक्स",
      "lifestyle": "जीवन शैली",
      "math": "गणित",
      "network": "नेटवर्क और एसईओ",
      "office": "कार्यालय उपकरण",
      "utilities": "उपयोगिताएँ",
      "videos": "वीडियो और ऑडियो",
      "miscellaneous": "विविध",
      "arcade": "आर्केड",
      "puzzles": "पहेलियाँ",
      "board": "बोर्ड गेम",
      "cards": "ताश के खेल",
      "word": "शब्द खेल",
      "web-dev": "वेब विकास",
      "programming": "प्रोग्रामिंग",
      "backend": "बैकएंड और देवओप्स",
      "design": "यूआई/यूएक्स डिजाइन",
      "security": "साइबर सुरक्षा",
      "science": "विज्ञान",
      "humanities": "मानविकी",
      "languages": "भाषाएँ",
      "finance": "वित्त और धन",
      "windows": "विंडोज",
      "linux": "लिनक्स",
      "android": "एंड्रॉयड",
      "apple": "एप्पल ओएस",
      
      // Sub-subcategories
      "utility": "उपयोगिता सॉफ्टवेयर",
      "productivity": "उत्पादकता उपकरण",
      "multimedia": "मल्टीमीडिया सॉफ्टवेयर",
      "development": "विकास सॉफ्टवेयर",
      
      // Explorer States
      "showing_dirs": "{n} निर्देशिकाएँ प्रदर्शित",
      "showing_folders": "{n} फ़ोल्डर प्रदर्शित",
      "showing_files": "{n} फ़ाइलें प्रदर्शित",
      "registered_items": "{n} आइटम पंजीकृत",
      "sitemap_explorer_no_results": "कोई मिलान मॉड्यूल या फ़ाइलें नहीं मिलीं।"
    }
  };

  const getTranslation = (key, fallback = '') => {
    const lang = localStorage.getItem('bluetext_lang') || 'en';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || fallback || key;
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
    
    // Update search input placeholder dynamically
    const sInput = document.getElementById('directory-search-input');
    if (sInput && dict["search_placeholder"]) {
      sInput.placeholder = dict["search_placeholder"];
    }
  };

  // 3. Load Components Dynamically
  const loadDynamicComponents = async () => {
    try {
      // Load Header
      const headerContainer = document.getElementById('global-header');
      if (headerContainer) {
        const res = await fetch(`${prefix}components/header.html`);
        if (res.ok) {
          let html = await res.text();
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

  // 4. Cookie Consent
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

  // 5. Theme & Dark Mode Manager
  const applyTheme = (theme) => {
    const sunIcons = document.querySelectorAll('.theme-icon-sun');
    const moonIcons = document.querySelectorAll('.theme-icon-moon');
    
    // Standardize setting data-theme attribute on root element
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
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
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('bluetext_theme', newTheme);
        applyTheme(newTheme);
      });
    });
    
    let savedTheme = localStorage.getItem('bluetext_theme');
    if (!savedTheme) {
      savedTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    applyTheme(savedTheme);
  };

  // Cookie Authentication Helpers
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

  // Header Interactive Features: Navigation, Keyboard, Sign-In Dialog, Settings Sync
  const setupHeaderInteractiveFeatures = () => {
    const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
    dropdownItems.forEach(item => {
      const trigger = item.querySelector('.nav-trigger');
      
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = item.classList.contains('show');
        closeAllHeaderDropdowns();
        
        if (!isOpen) {
          item.classList.add('show');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          item.classList.remove('show');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
    });

    // Language Selector Toggles
    const langWrapper = document.querySelector('.lang-selector-wrapper');
    const langBtn = document.getElementById('lang-menu-btn');
    const langListbox = document.getElementById('lang-listbox');
    const currentLangLabel = document.getElementById('current-lang-label');
    const langOptions = document.querySelectorAll('#lang-listbox li');

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
          
          langOptions.forEach(o => o.setAttribute('aria-selected', 'false'));
          element.setAttribute('aria-selected', 'true');
          
          langWrapper.classList.remove('show');
          langBtn.setAttribute('aria-expanded', 'false');
          translatePage(langCode);
          renderExplorer(); // Refresh folder translations inexplorer
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

    // JSON Settings Export/Import
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
          if (config.theme) localStorage.setItem('bluetext_theme', config.theme);
          if (config.lang) localStorage.setItem('bluetext_lang', config.lang);
          if (config.consent) localStorage.setItem('bluetext_privacy_consent', config.consent);
          if (config.logged !== undefined) {
            if (config.logged) {
              localStorage.setItem('bluetext_user_logged', 'true');
              setCookie('bluetext_session', 'authorized_admin', 1);
            } else {
              localStorage.removeItem('bluetext_user_logged');
              eraseCookie('bluetext_session');
            }
          }
          window.location.reload();
        } catch (e) {
          alert("Error: Invalid JSON settings file.");
        }
      };
      reader.readAsText(file);
    };

    // User Profile Actions & Login Modal
    const userSection = document.getElementById('user-profile-section');
    
    const showLoginModal = () => {
      let modal = document.getElementById('login-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'login-modal';
        modal.className = 'login-modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-login-title');
        modal.innerHTML = `
          <div class="login-modal-card">
            <h3 id="modal-login-title" style="margin: 0; font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--accent-primary);">Sign In to BlueTEXT.in</h3>
            <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Access your developer dashboard. Default: admin / password.</p>
            
            <form id="login-modal-form" style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-2);">
              <div class="login-form-group">
                <label for="login-username">Username</label>
                <input type="text" id="login-username" class="input" required style="padding: 0.55rem 1rem; border-radius: var(--radius-sm);" placeholder="Username">
              </div>
              <div class="login-form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" class="input" required style="padding: 0.55rem 1rem; border-radius: var(--radius-sm);" placeholder="Password">
              </div>
              <div id="login-error-msg" class="login-form-error" style="color: var(--accent-danger); font-size: 0.8rem; display: none;">Invalid username or password.</div>
              
              <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-2);">
                <button type="button" class="btn btn--ghost" id="login-cancel-btn" style="padding: 0.45rem 1rem; font-size: 0.85rem;">Cancel</button>
                <button type="submit" class="btn btn--primary" style="padding: 0.45rem 1.25rem; font-size: 0.85rem;">Login</button>
              </div>
            </form>
          </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = document.getElementById('login-cancel-btn');
        const closeForm = () => {
          modal.classList.remove('show');
          const loginBtn = document.getElementById('header-login-btn');
          if (loginBtn) loginBtn.focus();
        };
        closeBtn.addEventListener('click', closeForm);
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeForm();
        });

        const form = document.getElementById('login-modal-form');
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const u = document.getElementById('login-username').value;
          const p = document.getElementById('login-password').value;
          const err = document.getElementById('login-error-msg');
          
          if (u === 'admin' && p === 'password') {
            localStorage.setItem('bluetext_user_logged', 'true');
            setCookie('bluetext_session', 'authorized_admin', 1);
            modal.classList.remove('show');
            updateLoginUI();
          } else {
            err.style.display = 'block';
          }
        });
      }

      document.getElementById('login-username').value = '';
      document.getElementById('login-password').value = '';
      document.getElementById('login-error-msg').style.display = 'none';

      modal.classList.add('show');
      setTimeout(() => {
        document.getElementById('login-username').focus();
      }, 100);
    };

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

        document.getElementById('export-settings-btn').addEventListener('click', exportUserSettings);
        document.getElementById('settings-file-input').addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
            importUserSettings(e.target.files[0]);
          }
        });

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
          showLoginModal();
        });
      }
    };

    updateLoginUI();

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

  // 6. Explorer Dashboard Registry Navigation and Search
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
      if (activeCategory !== 'all') {
        filtered = filtered.filter(item => item.category === activeCategory);
        if (activeSubcategory) {
          filtered = filtered.filter(item => item.subcategory === activeSubcategory);
        }
      }
    }

    // Render tree nodes based on state
    if (!searchQuery && activeCategory === 'all') {
      const folders = ['tools', 'games', 'software', 'tutorials', 'education'];
      const html = folders.map(f => {
        const itemCount = toolsRegistry.filter(item => item.category === f).length;
        const displayName = getTranslation(f).toUpperCase();
        const itemsLabel = getTranslation('registered_items').replace('{n}', itemCount);
        return `
          <div class="file-row" style="cursor: pointer;" onclick="window.appNavigate('${f}', '')">
            <span class="file-icon">📁</span>
            <div class="file-info">
              <span class="file-name" style="color: var(--accent-primary-hover);">${displayName}</span>
              <span class="file-path">${itemsLabel}</span>
            </div>
            <span class="compliance-pill" style="text-align: right;">Directory</span>
          </div>
        `;
      }).join('');
      filePane.innerHTML = html;
      updateBreadcrumbs();
      if (itemCounter) itemCounter.textContent = getTranslation('showing_dirs').replace('{n}', 5);
      return;
    }

    if (!searchQuery && activeCategory !== 'all' && !activeSubcategory) {
      const subcategories = [...new Set(
        toolsRegistry.filter(item => item.category === activeCategory).map(item => item.subcategory)
      )].filter(Boolean);

      if (subcategories.length > 0) {
        const folderHtml = subcategories.map(sub => {
          const itemCount = toolsRegistry.filter(item => item.category === activeCategory && item.subcategory === sub).length;
          const displayName = getTranslation(sub);
          const filesLabel = getTranslation('showing_files').replace('{n}', itemCount);
          return `
            <div class="file-row" style="cursor: pointer;" onclick="window.appNavigate('${activeCategory}', '${sub}')">
              <span class="file-icon">📁</span>
              <div class="file-info">
                <span class="file-name" style="color: var(--accent-primary-hover);">${displayName}</span>
                <span class="file-path">${filesLabel}</span>
              </div>
              <span class="compliance-pill" style="text-align: right;">Folder</span>
            </div>
          `;
        }).join('');
        filePane.innerHTML = folderHtml;
        updateBreadcrumbs();
        if (itemCounter) itemCounter.textContent = getTranslation('showing_folders').replace('{n}', subcategories.length);
        return;
      }
    }

    // Leaf view / List view
    if (filtered.length === 0) {
      filePane.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: var(--space-3);">🔍</div>
          ${getTranslation('sitemap_explorer_no_results')}
        </div>
      `;
      if (itemCounter) itemCounter.textContent = getTranslation('showing_files').replace('{n}', 0);
    } else {
      const fileIcon = (cat) => {
        if (cat === 'games') return '🎮';
        if (cat === 'tutorials') return '📚';
        if (cat === 'education') return '🎓';
        if (cat === 'software') return '💿';
        return '🛠️';
      };

      const fileHtml = filtered.map(item => {
        // Look up translated name and description if available in translations
        const displayName = getTranslation(item.name);
        const displayDesc = getTranslation(item.description);
        return `
          <a class="file-row" href="${prefix}${item.path}" style="text-decoration: none;" target="_blank">
            <span class="file-icon">${fileIcon(item.category)}</span>
            <div class="file-info">
              <span class="file-name">${displayName}</span>
              <span class="file-path" style="margin-top: 0.15rem;">${displayDesc}</span>
            </div>
            <span class="compliance-pill" style="text-align: right;">${getTranslation(item.category).toUpperCase()}/${getTranslation(item.subcategory).toUpperCase()}</span>
          </a>
        `;
      }).join('');
      filePane.innerHTML = fileHtml;
      if (itemCounter) itemCounter.textContent = getTranslation('showing_files').replace('{n}', filtered.length);
    }

    updateBreadcrumbs();
  }

  function updateBreadcrumbs() {
    if (!breadcrumbs) return;

    let html = `<span style="cursor: pointer; text-decoration: underline;" onclick="window.appNavigate('all', '')">Root</span>`;
    
    if (activeCategory !== 'all') {
      html += ` <span>/</span> <span style="cursor: pointer; text-decoration: underline;" onclick="window.appNavigate('${activeCategory}', '')">${getTranslation(activeCategory)}</span>`;
      if (activeSubcategory) {
        html += ` <span>/</span> <span>${getTranslation(activeSubcategory)}</span>`;
      }
    }

    if (searchQuery) {
      html = `<span>Search Results for "${searchQuery}"</span>`;
    }

    breadcrumbs.innerHTML = html;
  }

  // Setup navigation globally
  window.appNavigate = (category, subcategory) => {
    activeCategory = category;
    activeSubcategory = subcategory;
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.style.display = 'none';
    
    categoryNodes.forEach(node => {
      if (node.dataset.category === category && !subcategory) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    renderExplorer();
  };

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

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      searchClearBtn.style.display = searchQuery ? 'block' : 'none';
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

  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    try {
      await navigator.serviceWorker.register(`${prefix}assets/js/service-worker.js`);
    } catch (e) {
      console.log('ServiceWorker registration skipped or failed:', e);
    }
  }
});
