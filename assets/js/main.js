const dataPaths = {
	navigation: "assets/data/navigation.json",
	tools: "assets/data/tools.json"
};

const appState = {
	navigation: [],
	tools: [],
	loaded: false
};

function t(key, fallback) {
	if (window.btI18n && typeof window.btI18n.t === "function") {
		return window.btI18n.t(key, fallback);
	}
	return fallback;
}

function getCurrentLocale() {
	return window.btI18n?.locale || document.documentElement.lang || "en";
}

function withLocale(pathname) {
	const locale = getCurrentLocale();
	return pathname === "/" ? `/${locale}/` : `/${locale}${pathname}`;
}

async function loadJson(path) {
	const response = await fetch(path);
	if (!response.ok) {
		throw new Error(`Failed to load ${path}: ${response.status}`);
	}
	return response.json();
}

function renderCategories(categories) {
	const container = document.querySelector("#category-grid, #categoryGrid");
	if (!container) return;

	if (!Array.isArray(categories) || categories.length === 0) {
		container.innerHTML = `<p class="empty-state">${t("home.categories.empty", "Categories are being prepared.")}</p>`;
		return;
	}

	const toolsByCategory = appState.tools.reduce((map, tool) => {
		if (!map[tool.category]) {
			map[tool.category] = { total: 0, ready: 0 };
		}

		map[tool.category].total += 1;
		if (tool.status !== "coming-soon") {
			map[tool.category].ready += 1;
		}

		return map;
	}, {});

	container.innerHTML = categories
		.map((category) => {
			const counts = toolsByCategory[category.id] || { total: 0, ready: 0 };
			const categoryHref = withLocale(category.path || "/tools-platform/all-tools.html");
			return `<article class="card">
					<h3><a href="${categoryHref}">${category.label}</a></h3>
					<p>${category.description}</p>
					<div class="card__meta">
						<span><strong>${counts.total}</strong> ${t("home.categories.total", "total")}</span>
						<span><strong>${counts.ready}</strong> ${t("home.categories.ready", "ready")}</span>
					</div>
				</article>`;
		})
		.join("");
}

function renderFeaturedTools(tools) {
	const container = document.querySelector("#featured-tools");
	if (!container) return;

	if (!Array.isArray(tools) || tools.length === 0) {
		container.innerHTML = `<p class="empty-state">${t("home.featured.empty", "Featured tools will appear here soon.")}</p>`;
		return;
	}

	container.innerHTML = tools
		.map((tool) => {
			const tags = Array.isArray(tool.tags) ? tool.tags.slice(0, 3) : [];
			const toolName = getToolName(tool);
			const toolHref = getToolHref(tool);
			const statusText = tool.status === "coming-soon" ? t("status.comingSoon", "Coming soon") : t("status.ready", "Ready");
			return `<article class="card">
					<h3><a href="${toolHref}">${toolName}</a></h3>
					<p>${tool.description}</p>
					<div class="card__meta">
						<span>${statusText}</span>
						<span>${tool.category}</span>
					</div>
					${
						tags.length
							? `<div class="tag-row">${tags
									.map((tag) => `<span class="tag">${tag}</span>`)
									.join("")}</div>`
							: ""
					}
				</article>`;
		})
		.join("");
}

function renderSnapshotStats(tools, categories) {
	const statsGrid = document.querySelector("#stats-grid");
	if (!statsGrid) {
		return;
	}

	const total = tools.length;
	const ready = tools.filter((tool) => tool.status !== "coming-soon").length;
	const comingSoon = total - ready;
	const featured = tools.filter((tool) => tool.featured).length;

	statsGrid.innerHTML = [
		{
			label: t("stats.totalTools", "Total Tools"),
			value: total,
			hint: t("stats.currentCatalog", "Current catalog entries")
		},
		{
			label: t("stats.readyNow", "Ready Now"),
			value: ready,
			hint: t("stats.usableImmediately", "Usable immediately")
		},
		{
			label: t("stats.comingSoon", "Coming Soon"),
			value: comingSoon,
			hint: t("stats.plannedNext", "Planned next")
		},
		{
			label: t("stats.categories", "Categories"),
			value: categories.length,
			hint: t("stats.topLevelAreas", "Top-level areas")
		},
		{
			label: t("stats.featured", "Featured"),
			value: featured,
			hint: t("stats.highlightedHome", "Highlighted on home")
		}
	]
		.map(
			(item) => `<article class="stat-card">
				<p class="stat-card__label">${item.label}</p>
				<p class="stat-card__value">${item.value}</p>
				<p class="stat-card__hint">${item.hint}</p>
			</article>`
		)
		.join("");

	const heroTotalTools = document.querySelector("#hero-total-tools");
	const heroReadyTools = document.querySelector("#hero-ready-tools");
	const heroTotalCategories = document.querySelector("#hero-total-categories");

	if (heroTotalTools) heroTotalTools.textContent = String(total);
	if (heroReadyTools) heroReadyTools.textContent = String(ready);
	if (heroTotalCategories) heroTotalCategories.textContent = String(categories.length);
}

function normalizeSearchValue(value) {
	return String(value || "").trim().toLowerCase();
}

function getToolName(tool) {
	return tool?.name || tool?.title || "Untitled Tool";
}

function getToolHref(tool) {
	const raw = tool?.slug || tool?.path || "";
	if (!raw) return "#";
	const normalized = raw.startsWith("/") ? raw : `/${raw}`;
	return withLocale(normalized);
}

function setupSearch(tools) {
	const form = document.querySelector("#tool-search-form");
	const input = document.querySelector("#tool-search-input, #mainSearch");
	const liveResults = document.querySelector("#live-search-results, #mainSearchResults");
	if (!form || !input) return;

	function findMatches(searchText) {
		if (!searchText) {
			return [];
		}

		return tools
			.filter((tool) => {
				const haystack = [getToolName(tool), tool.description, ...(tool.tags || [])]
					.map(normalizeSearchValue)
					.join(" ");
				return haystack.includes(searchText);
			})
			.slice(0, 6);
	}

	function renderLiveResults(matches) {
		if (!liveResults) {
			return;
		}

		if (matches.length === 0) {
			liveResults.style.display = "none";
			liveResults.innerHTML = "";
			return;
		}

		liveResults.style.display = "block";
		liveResults.innerHTML = matches
			.map(
				(tool) => `<a href="${getToolHref(tool)}">
					<strong>${getToolName(tool)}</strong>
					<small>${tool.category}</small>
				</a>`
			)
			.join("");
	}

	input.addEventListener("input", () => {
		const searchText = normalizeSearchValue(input.value);
		renderLiveResults(findMatches(searchText));
	});

	input.addEventListener("blur", () => {
		if (liveResults) {
			setTimeout(() => {
				liveResults.style.display = "none";
			}, 120);
		}
	});

	input.addEventListener("focus", () => {
		const searchText = normalizeSearchValue(input.value);
		renderLiveResults(findMatches(searchText));
	});

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const searchText = normalizeSearchValue(input.value);
		if (!searchText) return;

		const match = findMatches(searchText)[0];

		const matchHref = getToolHref(match);
		if (match && matchHref !== "#") {
			window.location.href = matchHref;
			return;
		}

		window.location.href = `${withLocale("/tools-platform/all-tools.html")}?q=${encodeURIComponent(searchText)}`;
	});
}

async function bootstrap() {
	const [navigationData, toolsData] = await Promise.all([
		loadJson(dataPaths.navigation),
		loadJson(dataPaths.tools)
	]);

	appState.navigation = navigationData.categories || [];
	appState.tools = toolsData.tools || [];

	renderCategories(appState.navigation);
	renderSnapshotStats(appState.tools, appState.navigation);

	const featuredTools = appState.tools
		.filter((tool) => tool.featured && tool.status !== "coming-soon")
		.slice(0, 8);

	renderFeaturedTools(featuredTools.length ? featuredTools : appState.tools.filter((tool) => tool.status !== "coming-soon").slice(0, 8));
	setupSearch(appState.tools);
	appState.loaded = true;
}

window.addEventListener("bt:locale-changed", () => {
	if (!appState.loaded) {
		return;
	}
	renderCategories(appState.navigation);
	renderSnapshotStats(appState.tools, appState.navigation);
	const featuredTools = appState.tools
		.filter((tool) => tool.featured && tool.status !== "coming-soon")
		.slice(0, 8);
	renderFeaturedTools(featuredTools.length ? featuredTools : appState.tools.filter((tool) => tool.status !== "coming-soon").slice(0, 8));
});

bootstrap().catch((error) => {
	// Keep fallback visible while still surfacing issue in dev tools.
	console.error("App bootstrap failed:", error);
});
