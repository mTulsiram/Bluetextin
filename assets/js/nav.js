"use strict";


(function navModule() {
	let initialized = false;
	let clearCacheBound = false;
	const CACHE_BUST_KEY = "bt_cache_bust_v1";

	async function clearClientData() {
		try {
			localStorage.clear();
		} catch (error) {
			console.warn("localStorage clear failed", error);
		}

		try {
			sessionStorage.clear();
		} catch (error) {
			console.warn("sessionStorage clear failed", error);
		}

		if ("caches" in window) {
			try {
				const cacheKeys = await caches.keys();
				await Promise.all(cacheKeys.map((key) => caches.delete(key)));
			} catch (error) {
				console.warn("Cache storage clear failed", error);
			}
		}

		if ("serviceWorker" in navigator) {
			try {
				const registrations = await navigator.serviceWorker.getRegistrations();
				await Promise.all(registrations.map((registration) => registration.unregister()));
			} catch (error) {
				console.warn("Service worker unregister failed", error);
			}
		}

		if ("indexedDB" in window && typeof indexedDB.databases === "function") {
			try {
				const databases = await indexedDB.databases();
				await Promise.all(
					databases
						.filter((db) => db && db.name)
						.map((db) => new Promise((resolve) => {
							const request = indexedDB.deleteDatabase(db.name);
							request.onsuccess = () => resolve();
							request.onerror = () => resolve();
							request.onblocked = () => resolve();
						}))
				);
			} catch (error) {
				console.warn("IndexedDB clear failed", error);
			}
		}

		try {
			for (const entry of document.cookie.split(";")) {
				const name = entry.split("=")[0]?.trim();
				if (!name) continue;
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
			}
		} catch (error) {
			console.warn("Cookie clear failed", error);
		}
	}

	function initClearCacheAction() {
		if (clearCacheBound) return;

		const clearCacheButton = document.getElementById("clear-cache-button");
		if (!clearCacheButton) return;

		clearCacheButton.addEventListener("click", async () => {
			const confirmed = window.confirm("Clear local cache and reload this page?");
			if (!confirmed) return;

			const cacheBustToken = String(Date.now());
			try {
				localStorage.setItem(CACHE_BUST_KEY, cacheBustToken);
			} catch (error) {
				console.warn("Unable to persist cache bust token", error);
			}

			await clearClientData();

			const nextUrl = new URL(window.location.href);
			nextUrl.searchParams.set("bt_cache_cleared", cacheBustToken);
			nextUrl.searchParams.set("bt_cache_bust", cacheBustToken);
			window.location.replace(nextUrl.toString());
		});

		clearCacheBound = true;
	}

	function generateBreadcrumbs() {
		const mainContent = document.getElementById("main-content");
		if (!mainContent || document.querySelector(".breadcrumb")) return;

		const path = window.location.pathname;
		if (path === "/" || path === "/index.html" || path === "") return;

		const segments = path.split("/").filter(Boolean);
		const breadcrumbList = [];

		breadcrumbList.push({ label: "Home", href: "/" });

		let currentHref = "";
		segments.forEach((segment, index) => {
			if (index === segments.length - 1 && (segment === "index.html" || segment === "")) {
				return;
			}

			currentHref += "/" + segment;
			
			let label = segment.replace(/\.html$/i, "");
			label = label.replace(/[-_]/g, " ");
			label = label.replace(/\b\w/g, c => c.toUpperCase());

			if (label.toLowerCase() === "pages") return;

			const isActive = index === segments.length - 1;
			breadcrumbList.push({
				label: label,
				href: isActive ? null : currentHref + "/",
				active: isActive
			});
		});

		if (breadcrumbList.length <= 1) return;

		const itemsHtml = breadcrumbList.map((item, idx) => {
			const isActive = idx === breadcrumbList.length - 1;
			if (isActive) {
				return `<li class="breadcrumb-item active" aria-current="page">${item.label}</li>`;
			} else {
				return `<li class="breadcrumb-item"><a href="${item.href}">${item.label}</a></li>`;
			}
		}).join("\n");

		const breadcrumbNav = document.createElement("nav");
		breadcrumbNav.setAttribute("aria-label", "Breadcrumb");
		breadcrumbNav.className = "mb-3";
		breadcrumbNav.innerHTML = `<ol class="breadcrumb">${itemsHtml}</ol>`;

		mainContent.insertBefore(breadcrumbNav, mainContent.firstChild);
	}

	function initNavFeatures() {
		initClearCacheAction();
		generateBreadcrumbs();
		if (initialized) return;

		const searchInput = document.getElementById("search-input");
		const searchResults = document.getElementById("search-results");
		const searchButton = document.getElementById("global-search-button");
		const languageSelect = document.getElementById("language-select");

		if (!searchInput || !searchResults || !languageSelect) return;
		initialized = true;

	const languageKey = "bt_language_v1";
	const searchableItems = [];

	async function buildSearchIndex() {
		searchableItems.length = 0;

		try {
			const response = await fetch("/assets/data/search-index.json", { cache: "no-cache" });
			if (!response.ok) throw new Error("Unable to load search index");
			const items = await response.json();
			if (Array.isArray(items)) {
				for (const item of items) {
					if (!item || !item.title || !item.url) continue;
					searchableItems.push({
						title: String(item.title),
						url: String(item.url),
						description: String(item.description || ""),
						keywords: String(item.keywords || ""),
						source: "page"
					});
				}
			}
		} catch (error) {
			console.warn("Search index unavailable, falling back to visible links", error);
			const links = Array.from(document.querySelectorAll("a[href]"));
			for (const link of links) {
				const text = (link.textContent || "").trim();
				const href = link.getAttribute("href") || "";
				if (!text || !href || href.startsWith("#")) continue;
				searchableItems.push({ title: text, url: href, description: "", keywords: text, source: "link" });
			}
		}

		if (Array.isArray(window.blueTextData)) {
			for (const item of window.blueTextData) {
				if (!item) continue;
				const title = String(item.title || item.name || "").trim();
				const url = String(item.url || item.link || "").trim();
				if (!title) continue;
				searchableItems.push({ title, url, description: "", keywords: title, source: "tool" });
			}
		}
	}

	function renderResults(items) {
		if (!items.length) {
			searchResults.innerHTML = '<p class="text-body-secondary mb-0">No results found.</p>';
			return;
		}

		const listItems = items.slice(0, 20).map((item) => {
			const safeUrl = item.url || "#";
			const badge = item.source === "tool" ? "<span class=\"badge text-bg-info ms-2\">Tool</span>" : "";
			return `<li class=\"list-group-item\"><a class=\"text-decoration-none\" href=\"${safeUrl}\">${item.title}</a>${badge}</li>`;
		});

		searchResults.innerHTML = `<ul class=\"list-group\">${listItems.join("")}</ul>`;
	}

	function runSearch(query) {
		const q = query.trim().toLowerCase();
		if (!q) {
			searchResults.innerHTML = '<p class="text-body-secondary mb-0">Start typing to search.</p>';
			return;
		}

		const matches = searchableItems.filter((item) => {
			const haystack = `${item.title} ${item.url} ${item.description || ""} ${item.keywords || ""}`.toLowerCase();
			return haystack.includes(q);
		});

		renderResults(matches);
	}

	function collectTranslatableElements() {
		return Array.from(document.querySelectorAll(
			"main h1, main h2, main h3, main h4, main h5, main h6, main p, main a, main span, main li, main button, main label, #header-component .nav-link, #header-component .dropdown-item, #header-component button, #header-component label, #footer-component h2, #footer-component h3, #footer-component p, #footer-component a, #footer-component span"
		)).filter((element) => {
			if (element.children.length > 0 && !element.classList.contains("nav-link") && !element.classList.contains("dropdown-item")) {
				return false;
			}

			return !!(element.textContent || "").replace(/\s+/g, " ").trim();
		});
	}

	async function applyLanguage(targetLang) {
		const elements = collectTranslatableElements();

		// Cache original texts first
		for (const element of elements) {
			if (!element.dataset.btOriginalText) {
				element.dataset.btOriginalText = (element.textContent || "").replace(/\s+/g, " ").trim();
			}
		}

		if (targetLang === "en") {
			for (const element of elements) {
				element.textContent = element.dataset.btOriginalText || "";
			}
			localStorage.setItem(languageKey, "en");
			return;
		}

		try {
			const response = await fetch(`/assets/data/i18n/${targetLang}-dictionary.json`);
			if (!response.ok) throw new Error(`Could not load translations for ${targetLang}`);
			const dict = await response.json();

			for (const element of elements) {
				const original = element.dataset.btOriginalText || "";
				if (!original) continue;
				element.textContent = dict[original] || original;
			}
		} catch (error) {
			console.warn("Translation failed, falling back to original", error);
			for (const element of elements) {
				element.textContent = element.dataset.btOriginalText || "";
			}
		}

		localStorage.setItem(languageKey, targetLang);
	}

	searchInput.addEventListener("input", (event) => {
		runSearch(event.target.value || "");
	});

	document.getElementById("searchModal")?.addEventListener("shown.bs.modal", () => {
		searchInput.focus();
		runSearch(searchInput.value || "");
	});

	searchButton?.addEventListener("click", () => {
		runSearch(searchInput.value || "");
	});

	languageSelect.addEventListener("change", async (event) => {
		const targetLang = event.target.value || "en";
		await applyLanguage(targetLang);
		document.dispatchEvent(new CustomEvent("bt:language-changed", { detail: targetLang }));
	});

	buildSearchIndex().then(() => {
		runSearch("");
	});

	const savedLanguage = localStorage.getItem(languageKey) || "en";
	languageSelect.value = savedLanguage;
	if (savedLanguage !== "en") {
		applyLanguage(savedLanguage).then(() => {
			document.dispatchEvent(new CustomEvent("bt:language-changed", { detail: savedLanguage }));
		});
	}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initNavFeatures, { once: true });
	} else {
		initNavFeatures();
	}

	document.addEventListener("bt:components-ready", initNavFeatures);
	document.addEventListener("bt:data-ready", initNavFeatures);
})();
