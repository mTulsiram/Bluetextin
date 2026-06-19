(function () {
  // Clear legacy service workers and caches to prevent layout conflicts from old versions
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister().then(() => {
          console.log('Cleared legacy service worker');
          window.location.reload();
        });
      }
    });
  }
  if (window.caches) {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }

  // Helper to load external HTML partials
  async function loadInto(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
      const response = await fetch(url);
      if (response.ok) {
        el.innerHTML = await response.text();
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

  // Privacy Banner & Preferences Manager
  const CONSENT_KEY = 'btConsent.v1';
  function initConsent() {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      showConsentBanner();
    }
    updateSecurityIndicators();
  }

  function showConsentBanner() {
    if (document.querySelector('.consent-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'consent-banner glass-card';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Consent Preferences');
    banner.innerHTML = `
      <h3>Privacy Preferences</h3>
      <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.4;">
        We use local storage only to store interface settings (theme, local tools preference). No tracking cookies are used.
      </p>
      <div style="display:flex; gap:0.5rem; justify-content:flex-end; margin-top:0.5rem;">
        <button class="btn btn--primary" id="btn-accept-consent" style="padding:0.4rem 1rem; font-size:0.825rem;">Accept Preferences</button>
      </div>
    `;
    document.body.appendChild(banner);
    
    document.getElementById('btn-accept-consent').addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      banner.remove();
      updateSecurityIndicators();
    });
  }

  // Update Footer Security Baselines
  function updateSecurityIndicators() {
    const transportChip = document.getElementById('securityTransport');
    const consentChip = document.getElementById('securityConsent');

    // HTTPS or localhost validation (FISMA/ISO 27001 baseline)
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

    if (transportChip) {
      transportChip.className = isSecure ? 'security-chip ok' : 'security-chip warn';
      transportChip.textContent = isSecure ? 'Transport: SSL Secure' : 'Transport: Insecure Link';
    }

    if (consentChip) {
      const consented = localStorage.getItem(CONSENT_KEY) === 'accepted';
      consentChip.className = consented ? 'security-chip ok' : 'security-chip warn';
      consentChip.textContent = consented ? 'Consent: Preference Saved' : 'Consent: Pending Approval';
    }
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
