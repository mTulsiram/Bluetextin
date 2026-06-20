/* ============================================================================
   AUTHENTICATION MODULE - Login & Register
   Handles user authentication with localStorage (local-only)
   ============================================================================ */

const AUTH = {
  // In-memory user database (for demo - replace with real backend)
  users: STORAGE.get("users_db", []),

  init: () => {
    LOGGER.info("Initializing authentication module");

    // Setup auth buttons
    const loginBtn = document.querySelector('[data-action="login"]');
    const registerBtn = document.querySelector('[data-action="register"]');
    const logoutBtn = document.querySelector('[data-action="logout"]');

    if (loginBtn) loginBtn.addEventListener("click", AUTH.showLoginModal);
    if (registerBtn) registerBtn.addEventListener("click", AUTH.showRegisterModal);
    if (logoutBtn) logoutBtn.addEventListener("click", AUTH.logout);

    // Update UI based on auth state
    AUTH.updateAuthUI();

    // Listen for auth changes
    EVENTS.on("userChanged", AUTH.updateAuthUI);
  },

  register: (username, email, password) => {
    // Validation
    if (!username || username.length < 3) {
      return { success: false, error: "Username must be at least 3 characters" };
    }
    if (!email || !email.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }
    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    // Check if user exists
    if (AUTH.users.find((u) => u.username === username)) {
      return { success: false, error: "Username already exists" };
    }

    // Create user
    const user = {
      id: Date.now(),
      username,
      email,
      password: btoa(password), // Simple encoding (NOT secure for production)
      createdAt: new Date().toISOString(),
    };

    AUTH.users.push(user);
    STORAGE.set("users_db", AUTH.users);

    LOGGER.info("User registered", { username });
    STATE.addNotification(`Welcome ${username}! Account created.`, "success");

    return { success: true, user };
  },

  login: (username, password) => {
    // Validation
    if (!username || !password) {
      return { success: false, error: "Username and password required" };
    }

    // Find user
    const user = AUTH.users.find((u) => u.username === username);
    if (!user) {
      return { success: false, error: "Username not found" };
    }

    // Check password
    if (btoa(password) !== user.password) {
      return { success: false, error: "Invalid password" };
    }

    // Login successful
    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      loginTime: new Date().toISOString(),
    };

    STATE.setUser(sessionUser);
    EVENTS.emit("userChanged", sessionUser);

    LOGGER.info("User logged in", { username });
    STATE.addNotification(`Welcome back, ${username}!`, "success");

    return { success: true, user: sessionUser };
  },

  logout: () => {
    const username = STATE.user?.username;
    STATE.setUser(null);
    EVENTS.emit("userChanged", null);
    AUTH.updateAuthUI();

    LOGGER.info("User logged out", { username });
    STATE.addNotification("Logged out successfully", "info");
  },

  showLoginModal: () => {
    const html = `
      <div class="modal-overlay active" id="loginModal">
        <div class="modal">
          <div class="modal-header">
            <h2>Login</h2>
            <button class="modal-close" onclick="document.getElementById('loginModal').classList.remove('active')">✕</button>
          </div>
          <form id="loginForm" onsubmit="AUTH.handleLogin(event)">
            <div class="form-group">
              <label for="loginUsername">Username</label>
              <input type="text" id="loginUsername" name="username" required placeholder="Enter your username">
            </div>
            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" name="password" required placeholder="Enter your password">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="rememberMe" name="rememberMe">
                Remember me
              </label>
            </div>
            <div id="loginError" class="form-error" style="display:none;"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('loginModal').classList.remove('active')">Cancel</button>
              <button type="submit" class="btn btn-primary">Login</button>
            </div>
          </form>
          <p style="text-align: center; margin-top: var(--spacing-lg); font-size: var(--font-size-sm);">
            Don't have an account? <a href="#" onclick="AUTH.switchToRegister(event)">Register here</a>
          </p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);

    // Close on overlay click
    document.getElementById("loginModal").addEventListener("click", (e) => {
      if (e.target.id === "loginModal") {
        e.target.classList.remove("active");
      }
    });
  },

  handleLogin: (event) => {
    event.preventDefault();
    const form = event.target;
    const username = form.querySelector('[name="username"]').value;
    const password = form.querySelector('[name="password"]').value;
    const rememberMe = form.querySelector('[name="rememberMe"]').checked;

    const result = AUTH.login(username, password);

    if (result.success) {
      if (rememberMe) {
        STORAGE.set("rememberMe", true);
      }
      document.getElementById("loginModal").remove();
    } else {
      const errorDiv = form.querySelector("#loginError");
      errorDiv.textContent = result.error;
      errorDiv.style.display = "block";
    }
  },

  showRegisterModal: () => {
    const html = `
      <div class="modal-overlay active" id="registerModal">
        <div class="modal">
          <div class="modal-header">
            <h2>Create Account</h2>
            <button class="modal-close" onclick="document.getElementById('registerModal').classList.remove('active')">✕</button>
          </div>
          <form id="registerForm" onsubmit="AUTH.handleRegister(event)">
            <div class="form-group">
              <label for="regUsername">Username</label>
              <input type="text" id="regUsername" name="username" required placeholder="Choose a username">
            </div>
            <div class="form-group">
              <label for="regEmail">Email</label>
              <input type="email" id="regEmail" name="email" required placeholder="Enter your email">
            </div>
            <div class="form-group">
              <label for="regPassword">Password</label>
              <input type="password" id="regPassword" name="password" required placeholder="Enter a password">
            </div>
            <div class="form-group">
              <label for="regPassword2">Confirm Password</label>
              <input type="password" id="regPassword2" name="password2" required placeholder="Confirm your password">
            </div>
            <div id="registerError" class="form-error" style="display:none;"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('registerModal').classList.remove('active')">Cancel</button>
              <button type="submit" class="btn btn-primary">Register</button>
            </div>
          </form>
          <p style="text-align: center; margin-top: var(--spacing-lg); font-size: var(--font-size-sm);">
            Already have an account? <a href="#" onclick="AUTH.switchToLogin(event)">Login here</a>
          </p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);

    // Close on overlay click
    document.getElementById("registerModal").addEventListener("click", (e) => {
      if (e.target.id === "registerModal") {
        e.target.classList.remove("active");
      }
    });
  },

  handleRegister: (event) => {
    event.preventDefault();
    const form = event.target;
    const username = form.querySelector('[name="username"]').value;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    const password2 = form.querySelector('[name="password2"]').value;

    if (password !== password2) {
      const errorDiv = form.querySelector("#registerError");
      errorDiv.textContent = "Passwords do not match";
      errorDiv.style.display = "block";
      return;
    }

    const result = AUTH.register(username, email, password);

    if (result.success) {
      AUTH.login(username, password);
      document.getElementById("registerModal").remove();
    } else {
      const errorDiv = form.querySelector("#registerError");
      errorDiv.textContent = result.error;
      errorDiv.style.display = "block";
    }
  },

  switchToLogin: (event) => {
    event.preventDefault();
    document.getElementById("registerModal").remove();
    AUTH.showLoginModal();
  },

  switchToRegister: (event) => {
    event.preventDefault();
    document.getElementById("loginModal").remove();
    AUTH.showRegisterModal();
  },

  updateAuthUI: () => {
    const authContainer = document.querySelector('[data-auth-container]');
    if (!authContainer) return;

    if (STATE.user) {
      authContainer.innerHTML = `
        <span class="user-info">👤 ${STATE.user.username}</span>
        <button class="btn btn-outline btn-sm" data-action="logout">Logout</button>
      `;
      const logoutBtn = authContainer.querySelector('[data-action="logout"]');
      if (logoutBtn) {
        logoutBtn.addEventListener("click", AUTH.logout);
      }
    } else {
      authContainer.innerHTML = `
        <button class="btn btn-secondary btn-sm" data-action="login">Login</button>
        <button class="btn btn-primary btn-sm" data-action="register">Register</button>
      `;
      const loginBtn = authContainer.querySelector('[data-action="login"]');
      const registerBtn = authContainer.querySelector('[data-action="register"]');
      if (loginBtn) loginBtn.addEventListener("click", AUTH.showLoginModal);
      if (registerBtn) registerBtn.addEventListener("click", AUTH.showRegisterModal);
    }
  },
};

// Initialize auth when ready
onReady(() => {
  if (CONFIG.features.authentication) {
    AUTH.init();
  }
});

LOGGER.info("Authentication module loaded");
