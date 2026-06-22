if (typeof window !== "undefined") {
	// Page context - register service worker
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker.register("/assets/js/service-worker.js")
				.then((reg) => console.log("ServiceWorker registered:", reg.scope))
				.catch((err) => console.error("ServiceWorker registration failed:", err));
		});
	}
} else {
	// Service Worker context - implement basic caching
	const CACHE_NAME = "bluetext-cache-v6";
	const URLS_TO_CACHE = [
		"/",
		"/index.html",
		"/assets/css/main.css",
		"/assets/js/app.js",
		"/assets/js/auth.js",
		"/assets/js/theme.js",
		"/assets/js/settings.js",
		"/assets/js/nav.js",
		"/assets/data/search-index.json"
	];

	self.addEventListener("install", (event) => {
		event.waitUntil(
			caches.open(CACHE_NAME)
				.then((cache) => cache.addAll(URLS_TO_CACHE))
				.then(() => self.skipWaiting())
		);
	});

	self.addEventListener("activate", (event) => {
		event.waitUntil(
			caches.keys().then((keys) => {
				return Promise.all(
					keys.map((key) => {
						if (key !== CACHE_NAME) {
							return caches.delete(key);
						}
					})
				);
			}).then(() => self.clients.claim())
		);
	});

	self.addEventListener("fetch", (event) => {
		// Only handle GET requests and local scope
		if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
			return;
		}

		event.respondWith(
			caches.match(event.request)
				.then((cachedResponse) => {
					if (cachedResponse) {
						return cachedResponse;
					}
					return fetch(event.request).then((response) => {
						// Don't cache dynamic pages or responses that are not valid
						if (!response || response.status !== 200 || response.type !== "basic") {
							return response;
						}
						const responseToCache = response.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseToCache);
						});
						return response;
					}).catch(() => {
						// Offline fallback
						return caches.match("/");
					});
				})
		);
	});
}
