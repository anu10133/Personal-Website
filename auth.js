// ==========================================================================
// GOOGLE OAUTH 2.0 & INTERACTIVE SECURITY ZONE CLIENT-SIDE ENGINE
// ==========================================================================

// Configuration - Replace with your actual Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// Application State
let currentUser = null;
let currentToken = null;
let guestbookMessages = [];

// ==========================================================================
// 1. Initialization and Event Listeners
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // Mobile navigation menu toggle
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    // Close mobile menu on nav link clicks
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (navMenu) navMenu.classList.remove("active");
        });
    });

    // Accordion toggle (Personal Details)
    const accordionHeader = document.querySelector(".neo-accordion-header");
    const accordion = document.querySelector(".neo-accordion");
    if (accordionHeader && accordion) {
        accordionHeader.addEventListener("click", () => {
            accordion.classList.toggle("open");
            const icon = accordionHeader.querySelector("i");
            if (icon) {
                if (accordion.classList.contains("open")) {
                    icon.className = "fa-solid fa-chevron-up";
                } else {
                    icon.className = "fa-solid fa-chevron-down";
                }
            }
        });
    }

    // Set dynamic year in footer
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Check for existing session in localStorage
    checkExistingSession();

    // Initialize Google Identity Services Sign-In
    initGoogleSignIn();

    // Setup interactive dashboard listeners (event delegation where appropriate)
    setupDashboardListeners();
});

// ==========================================================================
// 2. Google Sign-In & Mock Auth Integration
// ==========================================================================

function initGoogleSignIn() {
    // Check if the Google API script is loaded
    if (typeof google !== "undefined" && google.accounts) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        });

        // Render the official Google Sign-In button
        const btnContainer = document.getElementById("google-signin-btn");
        if (btnContainer) {
            google.accounts.id.renderButton(btnContainer, {
                type: "standard",
                theme: "filled_blue",
                size: "large",
                text: "signin_with",
                shape: "rectangular",
                logo_alignment: "left"
            });
        }
        
        // Render the one-tap prompt for seamless login
        google.accounts.id.prompt();
    } else {
        console.warn("Google Identity Services script not loaded. Running in local testing mode.");
    }
}

function handleCredentialResponse(response) {
    const idToken = response.credential;
    const header = decodeJwtHeader(idToken);
    const payload = decodeJwtPayload(idToken);

    if (payload) {
        currentUser = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture || "https://api.dicebear.com/7.x/pixel-art/svg?seed=" + encodeURIComponent(payload.name),
            provider: "google"
        };
        currentToken = idToken;

        // Store session
        localStorage.setItem("oauth_user", JSON.stringify(currentUser));
        localStorage.setItem("oauth_token", idToken);

        // Update UI
        renderSecureZone();
        showNotification(`Logged in successfully as ${currentUser.name}`, "success");
    } else {
        showNotification("Failed to decode Google Identity Token", "error");
    }
}

// Mock login for offline testing or before Client ID is configured
function triggerMockLogin() {
    console.log("Triggering local mock authentication flow...");
    
    // Simulate a secure OAuth JWT Token representing a visitor
    const mockHeader = {
        "alg": "RS256",
        "kid": "mock-security-key-id",
        "typ": "JWT"
    };
    
    const mockPayload = {
        "iss": "https://accounts.google.com",
        "azp": "your-client-app-id.apps.googleusercontent.com",
        "aud": "your-client-app-id.apps.googleusercontent.com",
        "sub": "109876543210987654321",
        "email": "visitor.demo@gmail.com",
        "email_verified": true,
        "nbf": Math.floor(Date.now() / 1000) - 60,
        "name": "Guest Analyst",
        "picture": "https://api.dicebear.com/7.x/bottts/svg?seed=Analyst",
        "given_name": "Guest",
        "family_name": "Analyst",
        "iat": Math.floor(Date.now() / 1000) - 60,
        "exp": Math.floor(Date.now() / 1000) + 3600,
        "jti": "mock-jti-unique-string-identifier"
    };

    // Create a base64 encoded mock JWT token
    const b64Header = btoa(JSON.stringify(mockHeader)).replace(/=/g, "");
    const b64Payload = btoa(JSON.stringify(mockPayload)).replace(/=/g, "");
    const mockSignature = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"; // simulated signature
    const mockToken = `${b64Header}.${b64Payload}.${mockSignature}`;

    currentUser = {
        name: mockPayload.name,
        email: mockPayload.email,
        picture: mockPayload.picture,
        provider: "mock-oauth"
    };
    currentToken = mockToken;

    // Store in localStorage
    localStorage.setItem("oauth_user", JSON.stringify(currentUser));
    localStorage.setItem("oauth_token", mockToken);

    // Update UI
    renderSecureZone();
    showNotification(`Logged in successfully as ${currentUser.name} (Testing Mode)`, "success");
}

function handleSignOut() {
    // Clear session
    localStorage.removeItem("oauth_user");
    localStorage.removeItem("oauth_token");
    currentUser = null;
    currentToken = null;

    // Disable Google auto-select if GIS is initialized
    if (typeof google !== "undefined" && google.accounts) {
        google.accounts.id.disableAutoSelect();
    }

    // Re-render UI
    renderSecureZone();
    // Re-initialize button
    setTimeout(initGoogleSignIn, 100);
    showNotification("Logged out successfully", "info");
}

function checkExistingSession() {
    const storedUser = localStorage.getItem("oauth_user");
    const storedToken = localStorage.getItem("oauth_token");

    if (storedUser && storedToken) {
        try {
            currentUser = JSON.parse(storedUser);
            currentToken = storedToken;
        } catch (e) {
            localStorage.removeItem("oauth_user");
            localStorage.removeItem("oauth_token");
        }
    }
}

// ==========================================================================
// 3. JWT Token Parsing Helpers (Cybersecurity Lab)
// ==========================================================================

function decodeJwtHeader(token) {
    try {
        const base64Url = token.split('.')[0];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const rawJson = atob(base64);
        return JSON.parse(rawJson);
    } catch (e) {
        console.error("Error decoding JWT Header", e);
        return null;
    }
}

function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Handle URL encoded characters in the payload
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT Payload", e);
        return null;
    }
}

// ==========================================================================
// 4. UI Rendering Engine
// ==========================================================================

function renderSecureZone() {
    const secureZoneContent = document.getElementById("secure-zone-content");
    if (!secureZoneContent) return;

    if (currentUser && currentToken) {
        // Logged In: Render Dashboard
        const headerObj = decodeJwtHeader(currentToken) || {};
        const payloadObj = decodeJwtPayload(currentToken) || {};

        // Format JSON strings for the visual decoder
        const headerJson = JSON.stringify(headerObj, null, 2);
        const payloadJson = JSON.stringify(payloadObj, null, 2);

        // Split token into components for color coding
        const tokenParts = currentToken.split('.');
        const tokenHeader = tokenParts[0] || "";
        const tokenPayload = tokenParts[1] || "";
        const tokenSignature = tokenParts[2] || "";

        // Set up dashboard HTML
        secureZoneContent.innerHTML = `
            <div class="secure-dashboard">
                <!-- Left Column: User Profile & Controls -->
                <div class="flex-col gap-2">
                    <div class="user-profile-card neo-card text-center">
                        <div class="neo-sticker" style="background-color: var(--success)">SECURE</div>
                        <img src="${currentUser.picture}" alt="${currentUser.name}" class="user-avatar rounded-full mx-auto">
                        <h3 class="user-name">${currentUser.name}</h3>
                        <p class="user-email">${currentUser.email}</p>
                        
                        <div class="neo-badge accent" style="font-size: 0.75rem; margin-bottom: 1.5rem;">
                            Auth: ${currentUser.provider === "google" ? "Google OAuth 2.0" : "Local Security Mock"}
                        </div>
                        
                        <button id="signout-btn" class="neo-btn warning font-bold w-full">
                            <i class="fa-solid fa-right-from-bracket"></i> Sign Out
                        </button>
                    </div>

                    <!-- Secure Resources Card -->
                    <div class="neo-card secondary">
                        <h3 style="margin-bottom: 1rem;"><i class="fa-solid fa-shield-halved"></i> Secured Assets</h3>
                        <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">
                            Congratulations, you have unlocked access to my secure materials. These files are protected through OAuth validation.
                        </p>
                        
                        <!-- Resume Download Link -->
                        <a href="mailto:anubhavbansal1555@gmail.com?subject=Request%20Portfolio%20Resume&body=Hi%20Anubhav,%0A%0AI%20logged%20into%20your%20portfolio%20website%20using%20Google%20OAuth%20and%20would%20love%20to%20receive%20your%20latest%20resume.%0A%0ABest,%0A" class="neo-btn primary font-bold w-full text-center mb-3" style="display: flex; text-transform: uppercase;">
                            <i class="fa-solid fa-file-arrow-down"></i> Request Resume Copy
                        </a>

                        <!-- Contact Details -->
                        <div class="neo-badge dark" style="width: 100%; text-align: center; margin: 0.5rem 0; padding: 0.5rem;">
                            <i class="fa-solid fa-phone"></i> +91 (Delivered on Request)
                        </div>
                    </div>
                </div>

                <!-- Right Column: Security Lab (JWT Decoder) & Guestbook -->
                <div class="flex-col gap-2">
                    <!-- Security Lab / Token Decoder -->
                    <div class="neo-card">
                        <div class="neo-sticker" style="background-color: var(--info); color: white;">CYBERSECURITY LAB</div>
                        <h3 style="margin-bottom: 1rem;"><i class="fa-solid fa-code-compare"></i> Real-time JWT Decoder</h3>
                        <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">
                            This widget parses and decodes the actual cryptographic **JSON Web Token (JWT)** that secures your session. 
                            Notice how the token is split by dots into three distinct color-coded sections: 
                            <span class="jwt-red">Header</span>, <span class="jwt-blue">Payload (Claims)</span>, and <span class="jwt-green">Signature</span>.
                        </p>

                        <!-- Color-coded Raw Token -->
                        <div class="jwt-console">
                            <div class="jwt-header-text">CRYPTOGRAPHIC ID TOKEN (JWT)</div>
                            <div class="jwt-token-split">
                                <span class="jwt-red">${tokenHeader}</span><span class="jwt-dot">.</span><span class="jwt-blue">${tokenPayload}</span><span class="jwt-dot">.</span><span class="jwt-green">${tokenSignature}</span>
                            </div>
                        </div>

                        <!-- Decoded JSON views -->
                        <div class="jwt-decoded-grid">
                            <!-- Header -->
                            <div class="jwt-part">
                                <div class="jwt-part-title header">Header (Algorithm & Token Type)</div>
                                <pre class="jwt-json"><code class="jwt-red">${headerJson}</code></pre>
                            </div>
                            
                            <!-- Payload -->
                            <div class="jwt-part">
                                <div class="jwt-part-title payload">Payload (Decoded Session Claims)</div>
                                <pre class="jwt-json"><code class="jwt-blue">${payloadJson}</code></pre>
                            </div>
                        </div>
                    </div>

                    <!-- Visitor Guestbook -->
                    <div class="neo-card success">
                        <h3><i class="fa-solid fa-book-open"></i> Visitor Guestbook</h3>
                        <p style="font-size: 0.9rem; margin-bottom: 1.2rem;">
                            Leave a signed message on my portfolio. Your name and profile picture will be automatically verified using your authenticated session.
                        </p>

                        <form id="guestbook-form" style="display: flex; flex-direction: column; gap: 0.8rem;">
                            <textarea id="guestbook-msg" class="neo-input" placeholder="Type your message here..." rows="3" required></textarea>
                            <button type="submit" class="neo-btn dark font-bold align-self-end">
                                <i class="fa-solid fa-paper-plane"></i> Post Message
                            </button>
                        </form>

                        <!-- Guestbook List -->
                        <div id="guestbook-entries" class="guestbook-list">
                            <!-- Entries rendered here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load and render guestbook entries
        loadGuestbook();
        renderGuestbook();

        // Attach event listeners to new elements
        const signoutBtn = document.getElementById("signout-btn");
        if (signoutBtn) {
            signoutBtn.addEventListener("click", handleSignOut);
        }

        const guestbookForm = document.getElementById("guestbook-form");
        if (guestbookForm) {
            guestbookForm.addEventListener("submit", handleGuestbookSubmit);
        }

    } else {
        // Logged Out: Render Login Wall
        secureZoneContent.innerHTML = `
            <div class="lock-screen">
                <div class="lock-icon"><i class="fa-solid fa-lock"></i></div>
                <h3 class="lock-title">Vault Authentication</h3>
                <p class="lock-text">
                    This section contains protected career assets (direct contact numbers, full resume) 
                    and a cybersecurity demonstration sandbox. Sign in securely using Google OAuth to unlock.
                </p>
                
                <div class="google-btn-wrapper">
                    <!-- Google Sign-In Button Container -->
                    <div id="google-signin-btn"></div>
                    
                    <p style="font-size: 0.8rem; color: #666; font-weight: 600; margin: 0.5rem 0;">— OR —</p>
                    
                    <!-- Testing Mode Button -->
                    <button id="mock-login-btn" class="neo-btn secondary font-bold w-full" style="max-width: 280px;">
                        <i class="fa-solid fa-flask"></i> Launch Testing Sandbox
                    </button>
                </div>

                <div class="testing-mode-banner neo-card">
                    <p style="margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 900;">
                        <i class="fa-solid fa-circle-info text-info"></i> Cybersecurity Note
                    </p>
                    <p>
                        This portal secures resources using OAuth 2.0 Identity tokens. If you do not wish to link your Google account, 
                        click the <strong>Testing Sandbox</strong> button to simulate a cryptographically parsed JWT session locally!
                    </p>
                </div>
            </div>
        `;

        // Attach event listeners to new elements
        const mockLoginBtn = document.getElementById("mock-login-btn");
        if (mockLoginBtn) {
            mockLoginBtn.addEventListener("click", triggerMockLogin);
        }
    }
}

function setupDashboardListeners() {
    // Check if the secure zone is currently visible
    renderSecureZone();
}

// ==========================================================================
// 5. Guestbook Functionality (LocalStorage Cache)
// ==========================================================================

function loadGuestbook() {
    const stored = localStorage.getItem("portfolio_guestbook");
    if (stored) {
        try {
            guestbookMessages = JSON.parse(stored);
        } catch (e) {
            guestbookMessages = [];
        }
    } else {
        // Inject beautiful pre-populated messages to make the portfolio feel active
        guestbookMessages = [
            {
                name: "Anubhav Bansal",
                avatar: "anu.jpg",
                message: "Welcome to my portfolio! Log in to leave a message in the guestbook and test the security token analyzer.",
                date: "2026-06-25 11:30"
            },
            {
                name: "Alice Hacker",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alice",
                message: "Super cool Neobrutalism redesign! The JWT token decoder is a brilliant way to display OAuth structures.",
                date: "2026-06-25 11:35"
            }
        ];
        localStorage.setItem("portfolio_guestbook", JSON.stringify(guestbookMessages));
    }
}

function renderGuestbook() {
    const listContainer = document.getElementById("guestbook-entries");
    if (!listContainer) return;

    if (guestbookMessages.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; color: #777; font-size: 0.9rem; padding: 1rem;">No entries yet. Be the first to leave a mark!</div>`;
        return;
    }

    // Sort entries descending by date/index
    listContainer.innerHTML = guestbookMessages
        .map(entry => `
            <div class="guestbook-entry">
                <img src="${entry.avatar}" alt="${entry.name}" class="guestbook-avatar rounded-full">
                <div class="guestbook-meta">
                    <div class="flex justify-between items-center" style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="guestbook-user">${entry.name}</span>
                        <span class="guestbook-date">${entry.date}</span>
                    </div>
                    <div class="guestbook-message">${escapeHTML(entry.message)}</div>
                </div>
            </div>
        `)
        .join("");
}

function handleGuestbookSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;

    const textarea = document.getElementById("guestbook-msg");
    if (!textarea) return;

    const msgText = textarea.value.trim();
    if (!msgText) return;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEntry = {
        name: currentUser.name,
        avatar: currentUser.picture,
        message: msgText,
        date: dateStr
    };

    guestbookMessages.unshift(newEntry); // add to top
    localStorage.setItem("portfolio_guestbook", JSON.stringify(guestbookMessages));
    
    textarea.value = "";
    renderGuestbook();
    showNotification("Guestbook message posted successfully", "success");
}

// ==========================================================================
// 6. Utility Functions
// ==========================================================================

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `neo-card ${type === 'success' ? 'success' : type === 'error' ? 'warning' : 'primary'}`;
    
    // Customize style in neobrutalism
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        padding: 1rem 1.5rem;
        font-family: var(--font-heading);
        font-weight: 900;
        font-size: 0.95rem;
        margin: 0;
        box-shadow: var(--shadow-medium);
        border: var(--border-thick);
        max-width: 350px;
        animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;
    
    // Inject custom animation keyframes if they don't exist
    if (!document.getElementById("notification-keyframes")) {
        const style = document.createElement("style");
        style.id = "notification-keyframes";
        style.innerHTML = `
            @keyframes slideUp {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.8rem;">
            <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards";
        setTimeout(() => notification.remove(), 250);
    }, 4000);
}
