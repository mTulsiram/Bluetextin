"use strict";

(function initTheme() {
	const STORAGE_KEY = "bt_theme_v1";

	function getTheme() {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved === "dark" || saved === "light") return saved;
		} catch (e) {}
		return "dark"; // Default to dark mode per platform design
	}

	function applyTheme(theme) {
		document.documentElement.setAttribute("data-bs-theme", theme);
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch (e) {}

		const themeLabel = document.getElementById("theme-label");
		const themeIcon = document.getElementById("theme-icon");
		if (themeLabel) themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
		if (themeIcon) themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
	}

	function bindThemeButton() {
		const themeButtons = document.querySelectorAll("#theme-button, [data-action='toggle-theme']");
		themeButtons.forEach(btn => {
			if (btn.dataset.bound === "true") return;
			btn.dataset.bound = "true";
			btn.addEventListener("click", (e) => {
				e.preventDefault();
				const current = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "dark" : "light";
				applyTheme(current === "dark" ? "light" : "dark");
			});
		});
	}

	applyTheme(getTheme());

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", bindThemeButton);
	} else {
		bindThemeButton();
	}

	document.addEventListener("bt:components-ready", bindThemeButton);
})();

