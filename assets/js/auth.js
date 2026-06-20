"use strict";


(function authModule() {
	let initialized = false;

	function initAuth() {
		if (initialized) return;
	const STORAGE_USERS = "bt_users_v1";
	const STORAGE_CURRENT = "bt_current_user_v1";

	const authButton = document.getElementById("auth-button");
	const mobileAuthButton = document.getElementById("mobile-auth-button");
	const authForms = document.getElementById("auth-forms");
	const authLoggedIn = document.getElementById("auth-logged-in");
	const currentUserLabel = document.getElementById("auth-current-user");
	const message = document.getElementById("auth-message");
	const signOutButton = document.getElementById("auth-signout-button");
	const signInForm = document.getElementById("signin-form");
	const signUpForm = document.getElementById("signup-form");

	if ((!authButton && !mobileAuthButton) || !signInForm || !signUpForm) return;
	initialized = true;

	function getUsers() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
		} catch {
			return [];
		}
	}

	function saveUsers(users) {
		localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
	}

	function getCurrentUser() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_CURRENT) || "null");
		} catch {
			return null;
		}
	}

	function setCurrentUser(user) {
		if (!user) {
			localStorage.removeItem(STORAGE_CURRENT);
			return;
		}

		localStorage.setItem(STORAGE_CURRENT, JSON.stringify({
			name: user.name,
			email: user.email
		}));
	}

	function setMessage(text, isError) {
		if (!message) return;
		message.textContent = text || "";
		message.classList.toggle("text-danger", !!isError);
		message.classList.toggle("text-success", !isError && !!text);
	}

	function refreshAuthUi() {
		const currentUser = getCurrentUser();
		const isLoggedIn = !!currentUser;

		authForms?.classList.toggle("d-none", isLoggedIn);
		authLoggedIn?.classList.toggle("d-none", !isLoggedIn);

		const buttons = [authButton, mobileAuthButton].filter(Boolean);
		for (const btn of buttons) {
			if (isLoggedIn) {
				if (btn.id === "mobile-auth-button") {
					btn.setAttribute("aria-label", currentUser.name);
					btn.title = currentUser.name;
					btn.classList.add("text-warning");
				} else {
					btn.textContent = currentUser.name;
				}
			} else {
				if (btn.id === "mobile-auth-button") {
					btn.setAttribute("aria-label", "Sign In");
					btn.title = "Sign In";
					btn.classList.remove("text-warning");
				} else {
					btn.textContent = "Sign In";
				}
			}
		}

		if (isLoggedIn && currentUserLabel) {
			currentUserLabel.textContent = `${currentUser.name} (${currentUser.email})`;
		} else if (currentUserLabel) {
			currentUserLabel.textContent = "";
		}
	}

	signUpForm.addEventListener("submit", (event) => {
		event.preventDefault();

		const name = document.getElementById("signup-name")?.value.trim();
		const email = document.getElementById("signup-email")?.value.trim().toLowerCase();
		const password = document.getElementById("signup-password")?.value || "";

		if (!name || !email || password.length < 6) {
			setMessage("Please fill all fields. Password must be at least 6 characters.", true);
			return;
		}

		const users = getUsers();
		const exists = users.some((user) => user.email === email);
		if (exists) {
			setMessage("Account already exists. Please sign in.", true);
			return;
		}

		const newUser = { name, email, password };
		users.push(newUser);
		saveUsers(users);
		setCurrentUser(newUser);
		setMessage("Account created successfully.", false);
		signUpForm.reset();
		refreshAuthUi();
	});

	signInForm.addEventListener("submit", (event) => {
		event.preventDefault();

		const email = document.getElementById("signin-email")?.value.trim().toLowerCase();
		const password = document.getElementById("signin-password")?.value || "";

		const users = getUsers();
		const user = users.find((u) => u.email === email && u.password === password);

		if (!user) {
			setMessage("Invalid email or password.", true);
			return;
		}

		setCurrentUser(user);
		setMessage("Signed in successfully.", false);
		signInForm.reset();
		refreshAuthUi();
	});

	signOutButton?.addEventListener("click", () => {
		setCurrentUser(null);
		setMessage("Signed out.", false);
		refreshAuthUi();
	});

	refreshAuthUi();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initAuth, { once: true });
	} else {
		initAuth();
	}

	document.addEventListener("bt:components-ready", initAuth);
})();
