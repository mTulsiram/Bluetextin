"use strict";

(function initTheme() {
	const STORAGE_KEY = "bt_theme_v1";
	const themeButton = document.getElementById("theme-button");
	const themeLabel = document.getElementById("theme-label");
	const themeIcon = document.getElementById("theme-icon");

	if (!themeButton) return;

	function getTheme() {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (!saved) return "light";
		return saved === "dark" ? "dark" : "light";
	}

	function applyTheme(theme) {
		document.documentElement.setAttribute("data-bs-theme", theme);
		localStorage.setItem(STORAGE_KEY, theme);

		if (themeLabel) themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
		if (themeIcon) themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
	}

	themeButton.addEventListener("click", () => {
		const current = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "dark" : "light";
		applyTheme(current === "dark" ? "light" : "dark");
	});

	applyTheme(getTheme());
})();
