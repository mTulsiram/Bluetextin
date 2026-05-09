export function createI18n(options = {}) {
	const defaultLocale = options.defaultLocale || "en";
	const supportedLocales = Array.isArray(options.supportedLocales)
		? options.supportedLocales
		: [defaultLocale];

	let activeLocale = supportedLocales.includes(defaultLocale)
		? defaultLocale
		: supportedLocales[0] || "en";

	return {
		getLocale() {
			return activeLocale;
		},
		setLocale(nextLocale) {
			if (supportedLocales.includes(nextLocale)) {
				activeLocale = nextLocale;
			}
			return activeLocale;
		},
		applyDocumentLanguage() {
			document.documentElement.lang = activeLocale;
		}
	};
}
