(function () {
  // Helper to load external HTML partials
  async function loadInto(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
      const response = await fetch(url);
      if (response.ok) {
        el.innerHTML = await response.text();
        // Return element to chain actions
        return el;
      }
    } catch (e) {
      console.error(`Failed to load partial: ${url}`, e);
    }
  }

  // Manage Theme State
  function initTheme() {
    const stored = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', stored);
    updateThemeToggleUI();
  }

  function updateThemeToggleUI() {
    const sunIcons = document.querySelectorAll('.theme-icon-sun');
    const moonIcons = document.querySelectorAll('.theme-icon-moon');
    const theme = document.documentElement.getAttribute('data-theme');
    
    if (theme === 'light') {
      sunIcons.forEach(i => i.style.display = 'block');
      moonIcons.forEach(i => i.style.display = 'none');
    } else {
      sunIcons.forEach(i => i.style.display = 'none');
      moonIcons.forEach(i => i.style.display = 'block');
    }
  }

  function setupThemeToggle(headerRoot) {
    if (!headerRoot) return;
    const btn = headerRoot.querySelector('.dark-mode-toggle');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeToggleUI();
    });
  }

  // Privacy Banner Flow
  const CONSENT_KEY = 'btConsent.v1';
  function initConsent() {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      showConsentBanner();
    }
  }

  function showConsentBanner() {
    if (document.querySelector('.consent-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'consent-banner glass-card';
    banner.innerHTML = `
      <h3 style="font-size:1.15rem; margin-bottom:0.25rem;">Privacy Preference</h3>
      <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.4;">
        We use local storage strictly for saving theme mode and tools preferences locally. No tracking or cookies.
      </p>
      <div style="display:flex; gap:0.5rem; justify-content:flex-end; margin-top:0.5rem;">
        <button class="btn btn--primary" id="btn-accept-consent" style="padding:0.4rem 1rem; font-size:0.825rem;">Accept</button>
      </div>
    `;
    document.body.appendChild(banner);
    
    document.getElementById('btn-accept-consent').addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      banner.remove();
    });
  }

  // Initialize Page Setup
  async function init() {
    initTheme();
    const header = await loadInto('#site-header', '/components/header.html');
    await loadInto('#site-footer', '/components/footer.html');
    
    setupThemeToggle(header);
    initConsent();

    // Hook reset privacy preference link
    const resetLink = document.getElementById('reset-consent-link');
    if (resetLink) {
      resetLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(CONSENT_KEY);
        showConsentBanner();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
