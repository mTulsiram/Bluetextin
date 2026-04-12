document.addEventListener("DOMContentLoaded", () => {
    // --- Global State ---
    let allTools = [];
    let categories = [];

    // --- Boot Sequence ---
    addAdSenseScript();          // Inject AdSense on every page load (safe-guarded)
    initTheme();                 // Apply saved/system theme + update icons
    injectComponents();          // Inject header/footer (then bind header events)
    loadAndProcessData();        // Load navigation.json then populate pages + enable search data
    initScrollToTop();           // Add scroll-to-top button

    /* =========================================================
       0) ADSENSE INJECTION
    ========================================================= */
    function addAdSenseScript() {
        const src =
            "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2549187779179978";

        // Prevent duplicates if script already exists (e.g., hard refresh, other pages, etc.)
        if (document.querySelector(`script[src="${src}"]`)) return;

        const adSenseScript = document.createElement("script");
        adSenseScript.async = true;
        adSenseScript.src = src;
        adSenseScript.crossOrigin = "anonymous";
        document.head.appendChild(adSenseScript);
    }

    /* =========================================================
       1) COMPONENT INJECTION
    ========================================================= */
    function injectComponents() {
        const components = [
            { id: "header-placeholder", url: "/components/header.html", after: initHeaderScripts },
            { id: "footer-placeholder", url: "/components/footer.html" }
        ];

        components.forEach((comp) => {
            const placeholder = document.getElementById(comp.id);
            if (!placeholder) return;

            fetch(comp.url)
                .then((res) => (res.ok ? res.text() : Promise.reject(`Failed to load ${comp.url}`)))
                .then((html) => {
                    placeholder.innerHTML = html;
                    comp.after?.();
                })
                .catch((err) => console.error("Component Injection Error:", err));
        });
    }

    /* =========================================================
       2) LOAD + PROCESS navigation.json
    ========================================================= */
    async function loadAndProcessData() {
        try {
            const response = await fetch("/assets/data/navigation.json");
            if (!response.ok) throw new Error("navigation.json could not be loaded.");
            const navData = await response.json();

            categories = navData.categories || [];
            allTools = categories.flatMap((cat) =>
                (cat.tools || []).map((tool) => ({
                    ...tool,
                    categoryName: cat.name,
                    categoryId: cat.id || cat.slug
                }))
            );

            console.log(`${allTools.length} tools loaded and processed.`);

            // Populate content now that data is ready
            populateHomepageGrid();
            populateAllToolsDirectory();
        } catch (error) {
            console.error("Error loading and processing data:", error);
        }
    }

    /* =========================================================
       3) HEADER SCRIPTS (after header injection)
    ========================================================= */
    function initHeaderScripts() {
        // Live search (supports either header markup variant)
        setupLiveSearch("headerSearch", "headerSearchResults"); // header variant A
        setupLiveSearch("toolSearch", "searchResults");         // header variant B

        // Homepage hero dropdown (requires <div id="mainSearchResults"></div>)
        setupLiveSearch("mainSearch", "mainSearchResults");

        // Mobile nav toggle
        document
            .querySelector(".hamburger-menu")
            ?.addEventListener("click", () => document.querySelector(".main-nav")?.classList.toggle("mobile-active"));

        // Mobile search toggle (works with either headerSearch or toolSearch)
        const mobileSearchIcon = document.querySelector(".mobile-search-icon");
        const headerContent = document.querySelector(".header-content");
        const headerSearchInput =
            document.getElementById("headerSearch") ||
            document.getElementById("toolSearch") ||
            document.querySelector("#header-placeholder #headerSearch") ||
            document.querySelector("#header-placeholder #toolSearch");

        mobileSearchIcon?.addEventListener("click", () => {
            headerContent?.classList.toggle("search-active");
            if (headerContent?.classList.contains("search-active")) headerSearchInput?.focus();
        });

        // Close mobile search when clicking outside header
        document.body.addEventListener("click", (e) => {
            if (headerContent?.classList.contains("search-active") && !headerContent.contains(e.target)) {
                headerContent.classList.remove("search-active");
            }
        });

        // Dark mode toggle (support multiple buttons)
        document.querySelectorAll(".dark-mode-toggle").forEach((btn) => btn.addEventListener("click", toggleTheme));

        // Ensure icons match current theme after header injection
        updateThemeIcons(document.body.getAttribute("data-theme"));
    }

    /* =========================================================
       4) REUSABLE LIVE SEARCH
    ========================================================= */
    function setupLiveSearch(inputId, resultsId) {
        const input = document.getElementById(inputId);
        const resultsContainer = document.getElementById(resultsId);
        if (!input || !resultsContainer) return;

        const render = () => displaySearchResults(input.value, resultsContainer);

        input.addEventListener("input", render);
        input.addEventListener("focus", render);

        document.addEventListener("click", (e) => {
            if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = "none";
            }
        });
    }

    /* =========================================================
       5) SEARCH RESULT RENDERING
    ========================================================= */
    function displaySearchResults(term, container) {
        if (term.trim().length < 1) {
            container.style.display = "none";
            return;
        }

        const q = term.toLowerCase();
        const results = allTools
            .filter((tool) => (tool.name || "").toLowerCase().includes(q))
            .slice(0, 7); // unified: show 7 like your newer version

        container.style.display = results.length ? "block" : "none";
        container.innerHTML = results
            .map(
                (tool) => `
                <a href="${tool.url}" class="search-result-item">
                    ${tool.name}
                    <small style="display:block;color:var(--text-secondary);">${tool.categoryName}</small>
                </a>
            `
            )
            .join("");
    }

    /* =========================================================
       6) PAGE POPULATION
    ========================================================= */
    function populateHomepageGrid() {
        const grid = document.getElementById("categoryGrid");
        if (!grid || !categories.length) return;

        grid.innerHTML = categories
            .map(
                (cat) => `
                <a href="/tools/${cat.id || cat.slug}/index.html" class="category-card">
                    <span>${cat.icon || "⚙️"}</span>
                    <div>${cat.name}</div>
                </a>
            `
            )
            .join("");
    }

    function populateAllToolsDirectory() {
        const container = document.getElementById("masterDirectory");
        const filterInput = document.getElementById("directoryFilter");
        if (!container || !filterInput || !categories.length) return;

        // Preview (max 8) + "View All" link
        container.innerHTML = categories
            .map((cat) => {
                const tools = cat.tools || [];
                const previewTools = tools.slice(0, 8);

                return `
                <div class="directory-category-section" data-category-name="${(cat.name || "").toLowerCase()}">
                    <h3>
                        <div class="category-title">
                            <span>${cat.icon || "⚙️"}</span>${cat.name}
                        </div>
                        <a href="/tools/${cat.id || cat.slug}/index.html" class="view-all-link">
                            View All ${tools.length} Tools &rarr;
                        </a>
                    </h3>
                    <ul class="directory-tool-list">
                        ${previewTools
                            .map(
                                (tool) => `
                            <li data-tool-name="${(tool.name || "").toLowerCase()}">
                                <a href="${tool.url}">${tool.name}</a>
                            </li>
                        `
                            )
                            .join("")}
                    </ul>
                </div>
            `;
            })
            .join("");

        // Filter matches tool names (in preview list) and also category name.
        // Hides categories with no visible tools when a term is present.
        const filterDirectory = () => {
            const term = filterInput.value.toLowerCase().trim();

            document.querySelectorAll(".directory-category-section").forEach((section) => {
                const categoryName = section.dataset.categoryName || "";

                let hasVisibleTools = false;
                section.querySelectorAll("li").forEach((li) => {
                    const toolName = li.dataset.toolName || "";
                    const matchTool = !term || toolName.includes(term);
                    li.style.display = matchTool ? "block" : "none";
                    if (matchTool) hasVisibleTools = true;
                });

                const matchCategory = !term || categoryName.includes(term);
                const visible = !term || matchCategory || hasVisibleTools;

                section.style.display = visible ? "block" : "none";
                section.classList.toggle("hidden", !visible);
            });
        };

        filterInput.addEventListener("input", filterDirectory);

        // Support ?q= term
        const q = new URLSearchParams(window.location.search).get("q");
        if (q) {
            filterInput.value = q;
            filterDirectory();
        }
    }

    /* =========================================================
       7) THEME LOGIC
    ========================================================= */
    function initTheme() {
        const savedTheme =
            localStorage.getItem("theme") ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

        document.body.setAttribute("data-theme", savedTheme);
        updateThemeIcons(savedTheme);
    }

    function toggleTheme() {
        const newTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcons(newTheme);
    }

    function updateThemeIcons(theme) {
        document.querySelectorAll(".dark-mode-toggle").forEach((btn) => {
            btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
        });
    }

    /* =========================================================
       8) SCROLL TO TOP
    ========================================================= */
    function initScrollToTop() {
        const btn = document.createElement("button");
        btn.innerHTML = "↑";
        btn.className = "scroll-to-top";
        btn.title = "Scroll to top";
        btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
        document.body.appendChild(btn);

        window.addEventListener("scroll", () => {
            btn.classList.toggle("visible", window.scrollY > 300);
        });
    }
});