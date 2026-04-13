document.addEventListener("DOMContentLoaded", () => {
    // --- Global State ---
    let allTools = [];
    let categories = [];

    // --- Boot Sequence ---
    addAdSenseScript();
    initTheme();
    injectComponents();
    loadAndProcessData(); // This now triggers breadcrumb logic after data is loaded
    initScrollToTop();

    // --- 1. AdSense Injection ---
    function addAdSenseScript() {
        const src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2549187779179978";
        if (document.querySelector(`script[src="${src}"]`)) return;
        const adSenseScript = document.createElement("script");
        adSenseScript.async = true;
        adSenseScript.src = src;
        adSenseScript.crossOrigin = "anonymous";
        document.head.appendChild(adSenseScript);
    }

    // --- 2. Component Injection ---
    function injectComponents() {
        const components = [
            { id: "header-placeholder", url: "/components/header.html", after: initHeaderScripts },
            { id: "footer-placeholder", url: "/components/footer.html" }
        ];
        components.forEach(comp => {
            const placeholder = document.getElementById(comp.id);
            if (!placeholder) return;
            fetch(comp.url)
                .then(res => res.ok ? res.text() : Promise.reject(`Failed to load ${comp.url}`))
                .then(html => {
                    placeholder.innerHTML = html;
                    if (comp.after) comp.after();
                })
                .catch(err => console.error("Component Injection Error:", err));
        });
    }

    // --- 3. Load and Process Data ---
    async function loadAndProcessData() {
        try {
            const response = await fetch("/assets/data/navigation.json");
            if (!response.ok) throw new Error("navigation.json could not be loaded.");
            const navData = await response.json();
            
            categories = navData.categories || [];
            allTools = categories.flatMap(cat => 
                (cat.tools || []).map(tool => ({ ...tool, categoryName: cat.name, categoryId: cat.id || cat.slug }))
            );
            
            console.log(`${allTools.length} tools loaded.`);
            
            // Populate all dynamic content now that data is ready
            populateHomepageGrid();
            populateAllToolsDirectory();
            populateBreadcrumbs(); // **NEW** - Run breadcrumb logic

        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    // --- 4. Initialize Event Listeners ---
    function initHeaderScripts() {
        setupLiveSearch("headerSearch", "headerSearchResults");
        setupLiveSearch("mainSearch", "mainSearchResults");

        document.querySelector(".hamburger-menu")?.addEventListener("click", () => document.querySelector(".main-nav")?.classList.toggle("mobile-active"));
        
        const mobileSearchIcon = document.querySelector(".mobile-search-icon");
        const headerContent = document.querySelector(".header-content");
        mobileSearchIcon?.addEventListener("click", (e) => {
            e.stopPropagation();
            headerContent?.classList.toggle("search-active");
            if (headerContent?.classList.contains("search-active")) document.getElementById("headerSearch")?.focus();
        });

        document.body.addEventListener('click', (e) => {
            if (headerContent?.classList.contains('search-active') && !headerContent.contains(e.target)) {
                 headerContent.classList.remove('search-active');
            }
        });

        document.querySelectorAll(".dark-mode-toggle").forEach(btn => btn.addEventListener("click", toggleTheme));
        updateThemeIcons(document.body.getAttribute("data-theme"));
    }
    
    // --- 5. Reusable Live Search ---
    function setupLiveSearch(inputId, resultsId) {
        const input = document.getElementById(inputId);
        const resultsContainer = document.getElementById(resultsId);
        if (!input || !resultsContainer) return;

        input.addEventListener("input", e => displaySearchResults(e.target.value, resultsContainer));
        input.addEventListener("focus", e => displaySearchResults(e.target.value, resultsContainer));
        document.addEventListener("click", e => {
            if (!input.parentElement.contains(e.target)) resultsContainer.style.display = "none";
        });
    }

    // --- 6. Search Results Display ---
    function displaySearchResults(term, container) {
        if (term.trim().length < 1) {
            container.style.display = "none";
            return;
        }
        const results = allTools.filter(tool => tool.name.toLowerCase().includes(term.toLowerCase())).slice(0, 7);
        container.style.display = results.length ? "block" : "none";
        container.innerHTML = results.map(tool => `
            <a href="${tool.url}" class="search-result-item">
                ${tool.name}
                <small style="display:block;color:var(--text-secondary);">${tool.categoryName}</small>
            </a>
        `).join("");
    }

    // --- 7. Page-Specific Population ---
    function populateHomepageGrid() {
        const grid = document.getElementById("categoryGrid");
        if (!grid || !categories.length) return;
        grid.innerHTML = categories.map(cat => `
            <a href="/tools/${cat.id || cat.slug}/index.html" class="category-card">
                <span>${cat.icon || '⚙️'}</span>
                <div>${cat.name}</div>
            </a>
        `).join("");
    }

    function populateAllToolsDirectory() {
        const container = document.getElementById("masterDirectory");
        const filterInput = document.getElementById("directoryFilter");
        if (!container || !filterInput || !categories.length) return;

        container.innerHTML = categories.map(cat => {
            const tools = cat.tools || [];
            const previewTools = tools.slice(0, 8);
            return `
            <div class="directory-category-section" data-category-name="${cat.name.toLowerCase()}">
                <h3>
                    <div class="category-title"><span>${cat.icon || '⚙️'}</span>${cat.name}</div>
                    <a href="/tools/${cat.id || cat.slug}/index.html" class="view-all-link">View All ${tools.length} Tools &rarr;</a>
                </h3>
                <ul class="directory-tool-list">
                    ${previewTools.map(tool => `<li data-tool-name="${tool.name.toLowerCase()}"><a href="${tool.url}">${tool.name}</a></li>`).join('')}
                </ul>
            </div>`;
        }).join('');

        const filterDirectory = () => {
            const term = filterInput.value.toLowerCase().trim();
            document.querySelectorAll(".directory-category-section").forEach(section => {
                const categoryName = section.dataset.categoryName;
                const match = !term || categoryName.includes(term);
                section.style.display = match ? "block" : "none";
            });
        };
        filterInput.addEventListener("input", filterDirectory);
        
        const q = new URLSearchParams(window.location.search).get("q");
        if (q) {
            filterInput.value = q;
            filterDirectory();
        }
    }

    // --- 8. BREADCRUMB GENERATION (NEW & FIXED) ---
    function populateBreadcrumbs() {
        const breadcrumbNav = document.querySelector(".breadcrumbs");
        if (!breadcrumbNav || !allTools.length) return;

        const currentPath = window.location.pathname;
        const currentTool = allTools.find(tool => tool.url === currentPath);

        if (currentTool) {
            const categoryId = currentTool.categoryId;
            const categoryUrl = `/tools/${categoryId}/index.html`;

            breadcrumbNav.innerHTML = `
                <a href="/">Home</a>
                <span>&gt;</span>
                <a href="${categoryUrl}">${currentTool.categoryName}</a>
                <span>&gt;</span>
                ${currentTool.name}
            `;
        }
    }

    // --- 9. Theme & Utility Logic ---
    function initTheme() {
        const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.body.setAttribute("data-theme", savedTheme);
    }

    function toggleTheme() {
        const newTheme = document.body.getAttribute("data-theme") === 'dark' ? 'light' : 'dark';
        document.body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcons(newTheme);
    }
    
    function updateThemeIcons(theme) {
        document.querySelectorAll(".dark-mode-toggle").forEach(btn => {
            btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        });
    }

    function initScrollToTop() {
        const btn = document.createElement('button');
        btn.innerHTML = '↑';
        btn.className = 'scroll-to-top';
        btn.title = 'Scroll to top';
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        document.body.appendChild(btn);
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 300);
        });
    }
});
