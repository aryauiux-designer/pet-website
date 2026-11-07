
// BARKFY SIGN UP / SIGN IN + LOCAL STORAGE

const authOverlay = document.getElementById("authOverlay");
const authCard = document.getElementById("authCard");
const authForm = document.getElementById("authForm");

const ACCOUNT_KEY = "barkfyAccounts";
const SESSION_KEY = "barkfySession";

let authMode = "signup";
let currentUser = loadCurrentUser();
let pendingCheckout = null;


// READ LOCAL STORAGE

function loadCurrentUser() {
  try {
    const session = JSON.parse(
      localStorage.getItem(SESSION_KEY) || "null"
    );
    const temporary = JSON.parse(
      sessionStorage.getItem(SESSION_KEY) || "null"
    );

    return session?.user || temporary?.user || null;
  } catch {
    return null;
  }
}

function getAccounts() {
  try {
    return JSON.parse(
      localStorage.getItem(ACCOUNT_KEY) || "[]"
    );
  } catch {
    return [];
  }
}


// PASSWORD HASHING (Universal - works in any browser, secure context or local file)

function encodeBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function decodeBase64(value) {
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}

async function hashPassword(password, existingSalt) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const salt = existingSalt
        ? decodeBase64(existingSalt)
        : crypto.getRandomValues(new Uint8Array(16));

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
      );

      const result = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt,
          iterations: 10000,
          hash: "SHA-256"
        },
        key,
        256
      );

      return {
        salt: encodeBase64(salt),
        passwordHash: encodeBase64(new Uint8Array(result))
      };
    }
  } catch (e) {
    // Subtle crypto unavailable or failed; fall through to robust fallback
  }

  // Universal deterministic fallback for file:/// and non-secure contexts
  const salt = existingSalt || ("salt_" + Math.random().toString(36).substring(2, 10));
  let hash = 0;
  const str = salt + ":" + password;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return {
    salt: salt,
    passwordHash: "bkf_" + Math.abs(hash).toString(36)
  };
}


// SET LOGIN / SIGNUP SCREEN

function setAuthMode(mode) {
  if (!authCard) return;
  authMode = mode;
  const signup = mode === "signup";

  authCard.classList.toggle("signup-mode", signup);
  authCard.classList.toggle("login-mode", !signup);

  const setHidden = (id, hidden) => {
    const el = document.getElementById(id);
    if (el) el.hidden = hidden;
  };

  setHidden("signupHeading", !signup);
  setHidden("loginHeading", signup);
  setHidden("signupFields", !signup);
  setHidden("petFields", !signup);
  setHidden("termsRow", !signup);
  setHidden("passwordHint", !signup);
  setHidden("loginOptions", signup);

  const authName = document.getElementById("authName");
  if (authName) authName.required = signup;
  const acceptTerms = document.getElementById("acceptTerms");
  if (acceptTerms) acceptTerms.required = signup;

  const authSubmit = document.getElementById("authSubmit");
  if (authSubmit) authSubmit.textContent = signup ? "Create account" : "Log In";

  const authSwitchText = document.getElementById("authSwitchText");
  if (authSwitchText) authSwitchText.textContent = signup ? "Already have an account?" : "Don't have an account?";

  const authSwitchButton = document.getElementById("authSwitchButton");
  if (authSwitchButton) authSwitchButton.textContent = signup ? "Log in" : "Sign up";

  const googleText = document.querySelector("#googleAuthButton span:last-child");
  if (googleText) googleText.textContent = signup ? "Sign up with Google" : "Log in with Google";

  const feedback = document.getElementById("authFeedback");
  if (feedback) feedback.textContent = "";

  if (authForm) authForm.reset();
}


// OPEN / CLOSE

function openBarkfyAuth(mode = "signin") {
  if (!authOverlay) {
    window.location.href = `index.html#${mode}`;
    return;
  }
  setAuthMode(mode);
  authOverlay.classList.add("open");
  document.body.classList.add("auth-open");
}

function closeBarkfyAuth() {
  if (authOverlay) {
    authOverlay.classList.remove("open");
  }
  document.body.classList.remove("auth-open");
}

document.getElementById("authClose")
  ?.addEventListener("click", closeBarkfyAuth);

if (authOverlay) {
  authOverlay.addEventListener("click", e => {
    if (e.target === authOverlay) closeBarkfyAuth();
  });
}

window.addEventListener("keydown", e => {
  if (e.key === "Escape" && authOverlay?.classList.contains("open")) {
    closeBarkfyAuth();
  }
});

document.getElementById("authSwitchButton")
  ?.addEventListener("click", () => {
    setAuthMode(authMode === "signup" ? "signin" : "signup");
  });


// PASSWORD VISIBILITY TOGGLE

const EYE_OPEN = `<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/>`;
const EYE_CLOSED = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

document.getElementById("togglePassword")
  ?.addEventListener("click", () => {
    const input = document.getElementById("authPassword");
    const btn   = document.getElementById("togglePassword");
    const svg   = btn?.querySelector("svg");
    if (!input || !svg) return;
    const isHidden = input.type === "password";

    // Toggle input type
    input.type = isHidden ? "text" : "password";

    // Swap icon: open eye when visible, closed/slashed when hidden
    svg.innerHTML = isHidden ? EYE_OPEN : EYE_CLOSED;

    // Update accessibility label
    btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });


// SIGN UP AND SIGN IN

if (authForm) {
  authForm.addEventListener("submit", async event => {
    event.preventDefault();

    const feedback = document.getElementById("authFeedback");
    const email = document.getElementById("authEmail")?.value.trim().toLowerCase();
    const password = document.getElementById("authPassword")?.value || "";

    const accounts = getAccounts();

    if (!email || password.length < 4) {
      feedback.textContent = "Please enter a valid email and password.";
      return;
    }

    try {
      if (authMode === "signup") {
        const name = document.getElementById("authName")?.value.trim() || "";
        const petName = document.getElementById("petName")?.value.trim() || "Barnaby";
        const petType = document.getElementById("petType")?.value || "Dog";
        const accepted = document.getElementById("acceptTerms")?.checked;

        if (name.length < 2) {
          feedback.textContent = "Please enter your full name.";
          return;
        }

        if (!accepted) {
          feedback.textContent = "Please accept the Terms and Privacy Policy.";
          return;
        }

        if (accounts.some(account => account.email === email)) {
          feedback.textContent = "This email is already registered. Please log in.";
          return;
        }

        const hashed = await hashPassword(password);
        const uuid = (window.crypto && crypto.randomUUID)
          ? crypto.randomUUID()
          : "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

        const user = {
          id: uuid,
          name: name,
          email: email,
          phone: "+91 98765 43210",
          petName: petName,
          petType: petType,
          salt: hashed.salt,
          passwordHash: hashed.passwordHash,
          createdAt: new Date().toISOString()
        };

        accounts.push(user);
        try {
          localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
        } catch (e) {}

        // Store session in localStorage
        saveUserSession(user, true);
        finishAuthentication(`Welcome to BARKFY, ${name}! 🐾`);
      } else {
        // Sign In
        let user = accounts.find(account => account.email === email);

        if (!user) {
          feedback.textContent = "No account found with this email. Please sign up first.";
          return;
        }

        // Verify password
        const hashed = await hashPassword(password, user.salt);
        if (hashed.passwordHash !== user.passwordHash && user.passwordHash !== password) {
          feedback.textContent = "Incorrect password. Please try again.";
          return;
        }

        const keepMe = document.getElementById("keepLoggedIn")?.checked ?? true;
        saveUserSession(user, keepMe);
        finishAuthentication(`Welcome back, ${user.name}! 🐾`);
      }
    } catch (error) {
      feedback.textContent = error.message || "Something went wrong.";
    }
  });
}


// SAVE SESSION (ALWAYS SAVES TO LOCALSTORAGE)

function saveUserSession(user, remember = true) {
  currentUser = {
    id: user.id || ("usr_" + Date.now()),
    name: user.name || "Pet Parent",
    email: user.email || "",
    phone: user.phone || "+91 98765 43210",
    petName: user.petName || "Barnaby",
    petType: user.petType || "Dog"
  };

  const value = JSON.stringify({ user: currentUser });

  try {
    localStorage.setItem(SESSION_KEY, value);
    sessionStorage.setItem(SESSION_KEY, value);
  } catch (e) {}
}


// AFTER SUCCESSFUL LOGIN

function finishAuthentication(message) {
  closeBarkfyAuth();

  if (typeof updateAccountDrawer === "function") {
    updateAccountDrawer();
  }

  if (typeof populateMyAccount === "function") {
    populateMyAccount();
  }

  showBarkfyMessage(message);

  const checkout = pendingCheckout;
  pendingCheckout = null;

  if (checkout?.callback) checkout.callback();

  // If redirected from cart or another page, redirect back after brief feedback
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTarget = urlParams.get("redirect");
  if (redirectTarget) {
    setTimeout(() => {
      window.location.href = redirectTarget;
    }, 600);
  }
}


// CHECKOUT GATE

function requireBarkfyLogin(productName, callback) {
  if (currentUser) {
    if (callback) callback();
    return;
  }

  pendingCheckout = {
    productName,
    callback: callback || null
  };

  openBarkfyAuth("signin");
}

window.BARKFY = window.BARKFY || {};
window.BARKFY.requireCheckoutAuth = requireBarkfyLogin;


// FUTURE PRODUCT BUY BUTTONS:
// <button data-checkout="Dog food">Buy Now</button>

document.addEventListener("click", event => {
  const button = event.target.closest("[data-checkout]");
  if (!button) return;

  event.preventDefault();
  requireBarkfyLogin(button.dataset.checkout);
});


// FORGOT PASSWORD PLACEHOLDER

document.getElementById("forgotPassword")
  ?.addEventListener("click", () => {
    document.getElementById("authFeedback").textContent =
      "Password reset needs email verification.";
  });


// GOOGLE SIGN IN PLACEHOLDER

document.getElementById("googleAuthButton")
  ?.addEventListener("click", () => {
    document.getElementById("authFeedback").textContent =
      "Connect Google OAuth to enable Google sign-in.";
  });


// MESSAGE

function showBarkfyMessage(message) {
  const toast = document.getElementById("siteToast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2500);
}


// INITIALIZE

window.openBarkfyAuth = openBarkfyAuth;

/* ── Cart Badge: sync count from localStorage on every page load ── */
function syncCartBadge() {
  try {
    const raw = localStorage.getItem("barkfy_cart_items");
    if (!raw) return;
    const cart = JSON.parse(raw);
    if (!Array.isArray(cart)) return;
    const count = cart.reduce(function (sum, item) { return sum + (item.qty || 1); }, 0);
    document.querySelectorAll("#headerCartCount, .cart-badge-count").forEach(function (el) {
      el.textContent = count > 0 ? count : "";
    });
  } catch (e) {}
}
syncCartBadge();


document.addEventListener("DOMContentLoaded", function () {

  const burger   = document.getElementById("burger");
  const drawer   = document.getElementById("accountDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const closeBtn = document.getElementById("drawerClose");

  const loggedOutView = document.getElementById("loggedOutView");
  const loggedInView  = document.getElementById("loggedInView");

  const signInBtn  = document.getElementById("drawerSignIn");
  const signUpBtn  = document.getElementById("drawerSignUp");
  const logoutBtn  = document.getElementById("logoutButton");


  // ── DRAWER STATE ──────────────────────────────────────────

  function updateAccountDrawer() {
    currentUser = loadCurrentUser();
    const loggedIn = Boolean(currentUser);

    document.querySelectorAll(".logged-out-view, #loggedOutView").forEach(el => el.hidden = loggedIn);
    document.querySelectorAll(".logged-in-view, #loggedInView").forEach(el => el.hidden = !loggedIn);

    if (loggedIn && currentUser) {
      document.querySelectorAll("#profileName").forEach(el => {
        el.textContent = currentUser.name || "[Your name]";
      });
      document.querySelectorAll("#profileEmail").forEach(el => {
        el.textContent = currentUser.email || "[you@example.com]";
      });
      document.querySelectorAll("#profileAvatar").forEach(el => {
        const initial = (currentUser.name || "U").trim().charAt(0).toUpperCase();
        el.innerHTML = `<span style="font-size: 18px; font-weight: 700; color: #5C67BA;">${initial}</span>`;
      });
    }

    // Highlight active drawer link based on current page
    const page = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".drawer-link").forEach(link => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("selected", href !== "" && href !== "#" && page.includes(href.replace(".html", "")));
    });

    if (typeof populateMyAccount === "function") {
      populateMyAccount();
    }
  }

  // Expose globally so finishAuthentication() and page scripts can call it
  window.updateAccountDrawer = updateAccountDrawer;
  window.loadCurrentUser = loadCurrentUser;


  // ── OPEN / CLOSE ──────────────────────────────────────────

  function openDrawer() {
    updateAccountDrawer();
    if (drawer) drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    if (burger) {
      burger.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
    }
    if (drawer) drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    if (burger) {
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
    if (drawer) drawer.setAttribute("aria-hidden", "true");
  }


  // ── BURGER → always opens account drawer (not menu-panel) ─
  if (burger) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (drawer && drawer.classList.contains("open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  document.querySelectorAll("#drawerClose, #drawerCloseLoggedOut").forEach(btn => {
    btn.addEventListener("click", closeDrawer);
  });
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  // Close on Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeDrawer();
  });


  // ── SIGN IN / SIGN UP BUTTONS ──────────────────────────────

  if (signInBtn) {
    signInBtn.addEventListener("click", () => {
      closeDrawer();
      openBarkfyAuth("signin");
    });
  }

  if (signUpBtn) {
    signUpBtn.addEventListener("click", () => {
      closeDrawer();
      openBarkfyAuth("signup");
    });
  }


  // ── LOGOUT ───────────────────────────────────────────────

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      currentUser = null;
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      updateAccountDrawer();
      closeDrawer();
      showBarkfyMessage("You have been logged out.");
    });
  }


  // ── SHOP & CART BUTTONS ──────────────────────────────────

  document.getElementById("headerShop")?.addEventListener("click", () => {
    window.location.href = "categories.html";
  });
  document.getElementById("heroShop")?.addEventListener("click", () => {
    window.location.href = "categories.html";
  });

  // Helper: scroll to booking form and pre-select "Free grooming trial"
  function scrollToBookingForm() {
    // If on service page, scroll to form; otherwise navigate there
    if (window.location.pathname.includes("service.html")) {
      const contactSection = document.getElementById("svc-booking-form");
      if (contactSection) contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = "service.html#svc-booking-form";
    }
    // Pre-select "Free grooming trial" in legacy contact form (index.html)
    const topicSelect = document.getElementById("contactTopic");
    if (topicSelect) topicSelect.value = "trial";
  }

  document.getElementById("bookTrial")?.addEventListener("click", (e) => {
    window.location.href = "service.html#svc-booking-form";
  });


  // ── INIT ─────────────────────────────────────────────────

  updateAccountDrawer();

  // Auto-open auth modal if navigated via #signin or #signup
  function checkAuthHash() {
    if (window.location.hash === "#signin") {
      openBarkfyAuth("signin");
    } else if (window.location.hash === "#signup") {
      openBarkfyAuth("signup");
    }
  }

  checkAuthHash();
  window.addEventListener("hashchange", checkAuthHash);

});


/* BARKFY MASCOT EYE TRACKING & HEAD TILT */

window.addEventListener("pointermove", (event) => {
  const art = document.getElementById("dogArt");
  if (!art) return;

  const currentPupils = document.querySelectorAll(".eye-pupil");
  const rect = art.getBoundingClientRect();

  // Centre between the dog's eyes
  const centerX = rect.left + rect.width * 0.50;
  const centerY = rect.top + rect.height * 0.24;

  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const dist = Math.hypot(dx, dy);

  // 1. Pupil Eye Tracking
  const maxRadius = 4.5;
  const factor = Math.min(dist / 280, 1);
  const angle = Math.atan2(dy, dx);

  const moveX = Math.cos(angle) * maxRadius * factor;
  const moveY = Math.sin(angle) * maxRadius * factor;

  currentPupils.forEach(pupil => {
    pupil.style.setProperty("--gaze-x", `${moveX.toFixed(2)}px`);
    pupil.style.setProperty("--gaze-y", `${moveY.toFixed(2)}px`);
  });

  // 2. Head Tilt & Gentle Nudge Follow
  const normX = Math.max(-1, Math.min(1, (event.clientX - (window.innerWidth / 2)) / (window.innerWidth / 2)));
  const normY = Math.max(-1, Math.min(1, (event.clientY - (window.innerHeight / 2)) / (window.innerHeight / 2)));

  const headAngle = (normX * 5.5).toFixed(2);
  const headX = (normX * 5).toFixed(2);
  const headY = (normY * 3.5).toFixed(2);

  art.style.setProperty("--tilt-angle", `${headAngle}deg`);
  art.style.setProperty("--tilt-x", `${headX}px`);
  art.style.setProperty("--tilt-y", `${headY}px`);
});

// Reset when pointer leaves the window
document.addEventListener("pointerout", (event) => {
  if (event.relatedTarget !== null) return;

  const art = document.getElementById("dogArt");
  if (art) {
    art.style.setProperty("--tilt-angle", "0deg");
    art.style.setProperty("--tilt-x", "0px");
    art.style.setProperty("--tilt-y", "0px");
  }

  const currentPupils = document.querySelectorAll(".eye-pupil");
  currentPupils.forEach(pupil => {
    pupil.style.setProperty("--gaze-x", "0px");
    pupil.style.setProperty("--gaze-y", "0px");
  });
});

/* SWEET LOOK INTERACTION ON CLICK */

const circleCenter = document.getElementById("circleCenter");
const heartsLayer = document.getElementById("sweetHeartsLayer");
let sweetTimer = null;

if (circleCenter) {
  circleCenter.addEventListener("click", (event) => {
    // 1. Activate sweet look (head tilt animation, blush cheeks, puppy eyes)
    circleCenter.classList.remove("sweet-active");
    void circleCenter.offsetWidth; // Trigger reflow to restart animation
    circleCenter.classList.add("sweet-active");

    clearTimeout(sweetTimer);
    sweetTimer = setTimeout(() => {
      circleCenter.classList.remove("sweet-active");
    }, 1500);

    // 2. Spawn floating hearts from click position or dog's face
    const bounds = circleCenter.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    const clickY = event.clientY - bounds.top;

    spawnSweetHearts(clickX, clickY);

    // 3. Gentle sweet feedback toast
    if (typeof showBarkfyMessage === "function") {
      const sweetMessages = [
        "♡ *happy tail wag* ♡",
        "♡ Loved by pups! ♡",
        "♡ Woof! You made my day! ♡",
        "♡ *sweet puppy cuddle* ♡"
      ];
      const randomMsg = sweetMessages[Math.floor(Math.random() * sweetMessages.length)];
      showBarkfyMessage(randomMsg);
    }
  });
}

function spawnSweetHearts(originX, originY) {
  if (!heartsLayer) return;

  const heartIcons = ["♡", "💖", "🐾", "✨", "♥"];
  const colors = ["#DAEF48", "#ff7b9b", "#DCE1FC", "#ffffff", "#ffb4c8"];

  for (let i = 0; i < 5; i++) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    heart.style.color = randomColor;

    const size = 16 + Math.random() * 14;
    heart.style.fontSize = `${size}px`;

    // Spread offset
    const offsetX = (Math.random() - 0.5) * 60;
    const driftX = (Math.random() - 0.5) * 120;
    const rot = (Math.random() - 0.5) * 40;

    heart.style.left = `${originX + offsetX}px`;
    heart.style.top = `${originY}px`;
    heart.style.setProperty("--hx", `${driftX}px`);
    heart.style.setProperty("--hrot", `${rot}deg`);
    heart.style.animationDelay = `${i * 70}ms`;

    heartsLayer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1600);
  }
}

/* ==========================================================================
   CATEGORY SHOWCASE INTERACTIVITY & PRODUCT DETAIL MODAL
   ========================================================================== */

const SHOWCASE_PRODUCTS = {
  ball: {
    id: "ball",
    name: "Plush Squeak Tennis Ball",
    category: "Interactive Toys",
    price: "$14.00",
    oldPrice: "$18.00",
    discount: "Save 22%",
    rating: "4.9 (142 reviews)",
    image: "images/products/ball.jpg",
    desc: "Handcrafted with textured plush wool and a gentle non-toxic core. Built-in squeaker entertains for hours without harsh squeaks, keeping your pup happily engaged and mentally sharp.",
    highlights: ["BPA & Phthalate Free", "Reinforced Seams", "Gentle on Teeth", "Machine Washable"]
  },
  collar: {
    id: "collar",
    name: "Lavender Classic Leather Collar",
    category: "Walk Essentials",
    price: "$24.00",
    oldPrice: "$30.00",
    discount: "Save 20%",
    rating: "5.0 (96 reviews)",
    image: "images/products/collar.jpg",
    desc: "Buttery-soft vegetable-tanned leather paired with solid brass hardware and an engraved Barkfy charm. Designed with smooth rounded edges to protect sensitive fur and necks.",
    highlights: ["Full-Grain Leather", "Solid Brass Buckle", "All-Weather Coated", "Custom Charm Ring"]
  },
  food: {
    id: "food",
    name: "EverPaw Wholesome Complete Dog Food",
    category: "Daily Nutrition",
    price: "$34.00",
    oldPrice: "$42.00",
    discount: "Save 19%",
    rating: "4.9 (210 reviews)",
    image: "images/products/food.jpg",
    desc: "Slow-baked kibble and freeze-dried raw treats formulated with free-range chicken, probiotics, and wild-harvested herbs. Formulated by veterinary nutritionists for gut health and shiny coats.",
    highlights: ["Real Free-Range Chicken", "Zero Fillers or By-Products", "Probiotics & Prebiotics", "Vet Board Certified"]
  },
  loopy: {
    id: "loopy",
    name: "Loopy Conditioning Gentle Pup Foam",
    category: "Coat & Bath Care",
    price: "$18.00",
    oldPrice: "$22.00",
    discount: "Save 18%",
    rating: "4.8 (88 reviews)",
    image: "images/products/loopy.jpg",
    desc: "No-rinse, hypoallergenic foaming cleanser infused with lavender, chamomile, and colloidal oatmeal. Cleans muddy paws and coats instantly while moisturizing delicate puppy skin.",
    highlights: ["Tear-Free Formula", "No Rinsing Needed", "Natural Lavender Oil", "Sensitive Skin Safe"]
  },
  combo: {
    id: "combo",
    name: "Dogelthy Holistic Care Bundle (6-in-1)",
    category: "Wellness Bundles",
    price: "$52.00",
    oldPrice: "$68.00",
    discount: "Save 24%",
    rating: "5.0 (175 reviews)",
    image: "images/products/combo.jpg",
    desc: "The complete daily wellness kit: Skin & Coat Omega drops, Calming chews, Joint Mobility powder, and Gut Immunity bites. Everything you need to keep your dog thriving from puppy to senior years.",
    highlights: ["6 Targeted Supplements", "Omega-3 & Glucosamine", "Cold-Pressed Ingredients", "Tasty Bacon Flavor"]
  },
  bed: {
    id: "bed",
    name: "Cloud Orthopedic Striped Pup Bed",
    category: "Sleep & Comfort",
    price: "$58.00",
    oldPrice: "$75.00",
    discount: "Save 23%",
    rating: "4.9 (164 reviews)",
    image: "images/products/bed.jpg",
    desc: "High-density orthopedic memory foam with bolstered side pillows and a breathable ticking-stripe canvas cover. Relieves joint pressure and gives anxious dogs a secure nesting haven.",
    highlights: ["Memory Foam Core", "Bolstered Support Walls", "Removable Washable Cover", "Non-Skid Rubber Base"]
  }
};

(function initCategoryShowcase() {
  const modalBackdrop = document.getElementById("productModalBackdrop");
  const modalCloseBtn = document.getElementById("productModalClose");
  const modalImg = document.getElementById("modalProductImg");
  const modalCat = document.getElementById("modalProductCat");
  const modalTitle = document.getElementById("modalProductTitle");
  const modalRating = document.getElementById("modalProductRating");
  const modalPrice = document.getElementById("modalProductPrice");
  const modalOldPrice = document.getElementById("modalProductOldPrice");
  const modalDiscount = document.getElementById("modalProductDiscount");
  const modalDesc = document.getElementById("modalProductDesc");
  const modalHighlights = document.getElementById("modalProductHighlights");
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const qtyVal = document.getElementById("qtyVal");
  const modalAddCart = document.getElementById("modalAddCart");
  const modalBuyNow = document.getElementById("modalBuyNow");
  const stageShopBtn = document.getElementById("stageShopBtn");

  if (!modalBackdrop) return;

  let activeProduct = null;
  let activeQuantity = 1;

  function openProductModal(productKey) {
    const prod = SHOWCASE_PRODUCTS[productKey];
    if (!prod) return;

    activeProduct = prod;
    activeQuantity = 1;

    // Populate data
    if (modalImg) {
      modalImg.src = prod.image;
      modalImg.alt = prod.name;
    }
    if (modalCat) modalCat.textContent = prod.category;
    if (modalTitle) modalTitle.textContent = prod.name;
    if (modalRating) modalRating.textContent = prod.rating;
    if (modalPrice) modalPrice.textContent = prod.price;
    if (modalOldPrice) modalOldPrice.textContent = prod.oldPrice;
    if (modalDiscount) modalDiscount.textContent = prod.discount;
    if (modalDesc) modalDesc.textContent = prod.desc;

    if (modalHighlights && Array.isArray(prod.highlights)) {
      modalHighlights.innerHTML = prod.highlights
        .map(h => `<span class="highlight-chip">${h}</span>`)
        .join("");
    }

    if (qtyVal) qtyVal.textContent = "1";

    // Show modal
    modalBackdrop.classList.add("is-open");
    modalBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  // Expose globally so other sections can open product details
  window.openProductModal = openProductModal;

  function closeProductModal() {
    modalBackdrop.classList.remove("is-open");
    modalBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Category Slots & Interactive Items Handlers
  const categorySlots = document.querySelectorAll(".category-slot");
  categorySlots.forEach(slot => {
    // Hover & touch state handling
    slot.addEventListener("pointerenter", () => {
      slot.classList.add("is-active");
    });
    slot.addEventListener("pointerleave", () => {
      slot.classList.remove("is-active");
    });

    slot.addEventListener("click", (e) => {
      e.stopPropagation();
      const productKey = slot.getAttribute("data-product");
      if (productKey) {
        openProductModal(productKey);
      } else if (slot.id === "categoryDog") {
        // Sweet mascot reaction
        slot.classList.add("dog-happy");
        setTimeout(() => slot.classList.remove("dog-happy"), 800);
        if (typeof showBarkfyMessage === "function") {
          showBarkfyMessage("♡ *happy tail wag* Meet the Barkfy poodle! 🐾");
        }
      }
    });

    // Keyboard accessibility
    slot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const productKey = slot.getAttribute("data-product");
        if (productKey) openProductModal(productKey);
      }
    });
  });

  // Modal Close Events
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeProductModal);
  }

  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) {
      closeProductModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop.classList.contains("is-open")) {
      closeProductModal();
    }
  });

  // Quantity Selector
  if (qtyMinus) {
    qtyMinus.addEventListener("click", () => {
      if (activeQuantity > 1) {
        activeQuantity--;
        if (qtyVal) qtyVal.textContent = activeQuantity;
      }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener("click", () => {
      if (activeQuantity < 99) {
        activeQuantity++;
        if (qtyVal) qtyVal.textContent = activeQuantity;
      }
    });
  }

  // Add to Cart
  if (modalAddCart) {
    modalAddCart.addEventListener("click", () => {
      if (!activeProduct) return;
      const count = activeQuantity;
      const itemText = count === 1 ? activeProduct.name : `${count} × ${activeProduct.name}`;
      
      // Map project price in INR
      const priceMap = {
        collar: 599,
        food: 1549,
        loopy: 649,
        ball: 399,
        bed: 1899,
        combo: 2499
      };
      const cleanPrice = priceMap[activeProduct.id] || 599;

      let cart = [];
      try {
        const raw = localStorage.getItem("barkfy_cart_items");
        if (raw) cart = JSON.parse(raw);
      } catch (e) {}
      if (!Array.isArray(cart)) cart = [];

      const existing = cart.find(i => i.id === activeProduct.id);
      if (existing) {
        existing.qty = (existing.qty || 1) + count;
      } else {
        cart.push({
          id: activeProduct.id,
          name: activeProduct.name,
          variant: "Standard",
          price: cleanPrice,
          qty: count,
          image: activeProduct.image,
          link: `product-details.html?id=${activeProduct.id}`
        });
      }
      try {
        localStorage.setItem("barkfy_cart_items", JSON.stringify(cart));
      } catch (e) {}

      // Update cart badge on all matching elements
      syncCartBadge();

      if (typeof showBarkfyMessage === "function") {
        showBarkfyMessage(`Added ${itemText} to your cart! 🐾`);
      }

      closeProductModal();
    });
  }

  // Buy Now
  if (modalBuyNow) {
    modalBuyNow.addEventListener("click", () => {
      if (!activeProduct) return;
      closeProductModal();

      // Add to cart and navigate to cart.html
      const priceMap = { collar: 599, food: 1549, loopy: 649, ball: 399, bed: 1899, combo: 2499 };
      const cleanPrice = priceMap[activeProduct.id] || 599;

      let cart = [];
      try {
        const raw = localStorage.getItem("barkfy_cart_items");
        if (raw) cart = JSON.parse(raw);
      } catch (e) {}
      if (!Array.isArray(cart)) cart = [];

      const existing = cart.find(i => i.id === activeProduct.id);
      if (existing) {
        existing.qty = (existing.qty || 1) + activeQuantity;
      } else {
        cart.push({
          id: activeProduct.id,
          name: activeProduct.name,
          variant: "Standard",
          price: cleanPrice,
          qty: activeQuantity,
          image: activeProduct.image,
          link: `product-details.html?id=${activeProduct.id}`
        });
      }
      try {
        localStorage.setItem("barkfy_cart_items", JSON.stringify(cart));
      } catch (e) {}

      window.location.href = "cart.html";
    });
  }

  // Stage Shop Now Button
  if (stageShopBtn) {
    stageShopBtn.addEventListener("click", () => {
      if (typeof showBarkfyMessage === "function") {
        showBarkfyMessage("Showing all Barkfy categories & wag-worthy essentials! 🐕");
      }
      const target = document.getElementById("categories");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
})();

/* ==========================================================================
   OUR NEW LAUNCH SECTION CAROUSEL & INTERACTIVITY
   ========================================================================== */

(function initNewLaunchSection() {
  const carousel = document.getElementById("launchCarousel");
  const prevBtn = document.getElementById("launchPrevBtn");
  const nextBtn = document.getElementById("launchNextBtn");
  const launchCards = document.querySelectorAll(".launch-card");

  if (carousel && prevBtn && nextBtn) {
    function getScrollStep() {
      const firstCard = carousel.querySelector(".launch-card");
      if (firstCard) {
        const gap = parseInt(window.getComputedStyle(carousel).gap, 10) || 24;
        return firstCard.offsetWidth + gap;
      }
      return 300;
    }

    prevBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    });
  }

  launchCards.forEach(card => {
    card.addEventListener("click", (e) => {
      // Don't trigger if the prev/next carousel nav buttons were clicked
      if (e.target.closest(".launch-nav-btn")) return;

      const productKey = card.getAttribute("data-product");
      if (productKey) {
        window.location.href = `product-details.html?id=${productKey}`;
      }
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const productKey = card.getAttribute("data-product");
        if (productKey) {
          window.location.href = `product-details.html?id=${productKey}`;
        }
      }
    });
  });

  // Grooming Free Trial Booking CTA & cards
  const groomingBookBtn = document.getElementById("groomingBookBtn");
  if (groomingBookBtn) {
    groomingBookBtn.addEventListener("click", () => {
      window.location.href = "service.html";
    });
  }

  document.querySelectorAll(".grooming-card").forEach(card => {
    card.addEventListener("click", () => {
      window.location.href = "service.html#svc-pricing";
    });
  });
})();





/* ============================================================
   CONTACT FORM + NEWSLETTER HANDLERS
   ============================================================ */
(function initContactAndNewsletter() {
  /* --- Contact form --- */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameEl = document.getElementById("contactName");
      var name = nameEl ? nameEl.value.trim() : "";
      if (!name) return;
      if (typeof showBarkfyMessage === "function") {
        showBarkfyMessage("Thanks " + name + "! We'll be in touch within one working day. \uD83D\uDC3E");
      }
      contactForm.reset();
    });
  }

  /* --- Footer newsletter form --- */
  var newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof showBarkfyMessage === "function") {
        showBarkfyMessage("You're subscribed! Monthly pup tips incoming. \uD83D\uDC15");
      }
      newsletterForm.reset();
    });
  }
})();
