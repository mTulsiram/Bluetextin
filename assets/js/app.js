"use strict";

const CACHE_BUST_KEY = "bt_cache_bust_v1";

function getCacheBustToken() {
	const url = new URL(window.location.href);
	const fromQuery = url.searchParams.get("bt_cache_bust") || url.searchParams.get("bt_cache_cleared");
	if (fromQuery) return fromQuery;

	try {
		return localStorage.getItem(CACHE_BUST_KEY) || "";
	} catch {
		return "";
	}
}

function withCacheBust(url) {
	const token = getCacheBustToken();
	if (!token) return url;

	const absolute = new URL(url, window.location.origin);
	absolute.searchParams.set("v", token);
	return absolute.toString();
}

async function loadHtmlInto(targetId, filePath) {
	const target = document.getElementById(targetId);
	if (!target) return;

	try {
		const response = await fetch(withCacheBust(filePath), { cache: "no-store" });
		if (!response.ok) throw new Error(`Failed to load ${filePath}`);
		target.innerHTML = await response.text();
	} catch (error) {
		console.error(error);
		target.innerHTML = "";
	}
}

function loadScript(filePath) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = withCacheBust(filePath);
		script.defer = true;
		script.onload = resolve;
		script.onerror = () => reject(new Error(`Failed to load ${filePath}`));
		document.head.appendChild(script);
	});
}

async function loadChildScripts() {
	const childScripts = [
		"/assets/js/config.js",
		"/assets/js/auth.js",
		"/assets/js/theme.js",
		"/assets/js/settings.js",
		"/assets/js/nav.js",
		"/assets/js/router.js",
		"/assets/js/service-worker.js"
	];

	for (const filePath of childScripts) {
		try {
			await loadScript(filePath);
		} catch (error) {
			console.error(error);
		}
	}
}

async function loadData() {
	try {
		const response = await fetch(withCacheBust("/assets/data/tools.json"), { cache: "no-store" });
		if (!response.ok) throw new Error("Failed to load tools data");
		const raw = await response.text();
		if (!raw.trim()) {
			window.blueTextData = [];
			return;
		}

		window.blueTextData = JSON.parse(raw);
	} catch (error) {
		console.error(error);
		window.blueTextData = [];
	}
}

async function bootstrap() {
	const headerTarget = document.getElementById("header-component") ? "header-component" : "site-header";
	const footerTarget = document.getElementById("footer-component") ? "footer-component" : "site-footer";

	const headerEl = document.getElementById(headerTarget);
	const footerEl = document.getElementById(footerTarget);

	const promises = [];
	if (headerEl && headerEl.innerHTML.trim() === "") {
		promises.push(loadHtmlInto(headerTarget, "/assets/components/header.html"));
	}
	if (footerEl && footerEl.innerHTML.trim() === "") {
		promises.push(loadHtmlInto(footerTarget, "/assets/components/footer.html"));
	}

	if (promises.length > 0) {
		await Promise.all(promises);
	}

	document.dispatchEvent(new CustomEvent("bt:components-ready"));

	await loadData();
	document.dispatchEvent(new CustomEvent("bt:data-ready"));

	await loadChildScripts();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", bootstrap);
} else {
	bootstrap();
}
