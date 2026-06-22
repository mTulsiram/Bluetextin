"use strict";

(function settingsModule() {
	function exportSettings() {
		const settings = {};
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			settings[key] = localStorage.getItem(key);
		}
		
		const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "bluetext-settings.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function importSettings(event) {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = function(e) {
			try {
				const settings = JSON.parse(e.target.result);
				if (typeof settings !== "object" || settings === null) {
					alert("Invalid settings file format.");
					return;
				}
				
				localStorage.clear();
				for (const key in settings) {
					localStorage.setItem(key, settings[key]);
				}
				alert("Settings imported successfully. The page will reload.");
				window.location.reload();
			} catch (err) {
				alert("Failed to parse settings file: " + err.message);
			}
		};
		reader.readAsText(file);
	}

	// PWA Install handler
	let deferredPrompt = null;
	function initPwaInstall() {
		const installBtn = document.getElementById("install-app-btn");
		
		window.addEventListener("beforeinstallprompt", (e) => {
			// Prevent Chrome 67 and earlier from automatically showing the prompt
			e.preventDefault();
			// Stash the event so it can be triggered later.
			deferredPrompt = e;
			// Update UI notify the user they can install the PWA
			if (installBtn) {
				installBtn.classList.remove("d-none");
			}
		});

		if (installBtn) {
			installBtn.addEventListener("click", async () => {
				if (!deferredPrompt) return;
				// Show the prompt
				deferredPrompt.prompt();
				// Wait for the user to respond to the prompt
				const { outcome } = await deferredPrompt.userChoice;
				console.log(`User response to the install prompt: ${outcome}`);
				// We've used the prompt, and can't use it again
				deferredPrompt = null;
				// Hide the install button
				installBtn.classList.add("d-none");
			});
		}

		window.addEventListener("appinstalled", () => {
			// Clear the deferredPrompt so it isn't triggered
			deferredPrompt = null;
			if (installBtn) installBtn.classList.add("d-none");
			console.log("PWA was installed");
		});
	}

	function initSettingsUi() {
		const exportBtn = document.getElementById("export-settings-btn");
		const importFileInput = document.getElementById("import-settings-file");

		if (exportBtn) {
			exportBtn.addEventListener("click", exportSettings);
		}
		if (importFileInput) {
			importFileInput.addEventListener("change", importSettings);
		}
		
		initPwaInstall();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initSettingsUi, { once: true });
	} else {
		initSettingsUi();
	}

	document.addEventListener("bt:components-ready", initSettingsUi);
})();
