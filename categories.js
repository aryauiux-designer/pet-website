/* ============================================================
   CATEGORIES PAGE  —  categories.js
   Handles:
     - Category card clicking & instant product filtering
     - Tab switching
     - Dynamic product count
     - Price sorting (Low-High, High-Low, Featured)
     - Full Add to Cart persistence in localStorage
     - URL filter param (?filter=accessories)
     - Header cart badge synchronization
   ============================================================ */

const CART_STORAGE_KEY = "barkfy_cart_items";

// Toast helper
function showToast(msg) {
  var toast = document.getElementById("siteToast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("toast-visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () {
    toast.classList.remove("toast-visible");
  }, 3200);
}

// Sync cart badge count with localStorage
function updateHeaderCartCount() {
  var count = 0;
  try {
    var raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      var cart = JSON.parse(raw);
      if (Array.isArray(cart)) {
        count = cart.reduce(function (sum, item) {
          return sum + (item.qty || 1);
        }, 0);
      }
    }
  } catch (e) {}

  document.querySelectorAll(".cart-badge-count, #cartCount, #headerCartCount").forEach(function (el) {
    el.textContent = count;
  });
}

// Add item to localStorage cart
function addToCart(product) {
  var cart = [];
  try {
    var raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) cart = parsed;
    }
  } catch (e) {}

  var existing = cart.find(function (item) {
    return item.id === product.id && (item.variant || "") === (product.variant || "");
  });

  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      variant: product.variant || "Standard",
      price: Number(product.price),
      qty: 1,
      image: product.image,
      link: product.link || `product-details.html?id=${product.id}`
    });
  }

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {}

  updateHeaderCartCount();
}

/* ── Filter + count logic ── */
var allCards = [];
var currentFilter = "all";

function applyFilter(filter) {
  currentFilter = filter;
  var visible = 0;

  allCards.forEach(function (card) {
    var cat = card.dataset.category || "";
    var matches = (filter === "all") || (cat === filter);
    if (matches) {
      card.classList.remove("hidden");
      visible++;
    } else {
      card.classList.add("hidden");
    }
  });

  // Update product count label
  var countEl = document.getElementById("productCount");
  if (countEl) {
    countEl.textContent = visible + " product" + (visible !== 1 ? "s" : "");
  }
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", function () {
  updateHeaderCartCount();

  // Collect product cards including CTA
  allCards = Array.from(document.querySelectorAll(".cat-product-card"));

  var tabs = document.querySelectorAll(".cat-tab");
  var catCards = document.querySelectorAll(".cat-card");

  function setActiveTabAndCard(filterKey) {
    // Update tabs
    tabs.forEach(function (t) {
      var match = (t.dataset.tab === filterKey);
      t.classList.toggle("active", match);
      t.setAttribute("aria-selected", String(match));
    });

    // Update category cards active styling
    catCards.forEach(function (card) {
      var match = (card.dataset.filter === filterKey);
      card.classList.toggle("active", match);
    });

    applyFilter(filterKey);
  }

  /* ── Filter tabs click ── */
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var filterKey = tab.dataset.tab;
      setActiveTabAndCard(filterKey);
    });
  });

  /* ── Category Cards Click (clicking anywhere on card) ── */
  catCards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      var filterKey = card.dataset.filter;
      if (!filterKey) return;

      setActiveTabAndCard(filterKey);

      // Smooth scroll to product grid
      var productsSection = document.querySelector(".cat-products-section");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ── URL param (?filter=accessories) ── */
  var urlParams = new URLSearchParams(window.location.search);
  var paramFilter = urlParams.get("filter");
  if (paramFilter) {
    setActiveTabAndCard(paramFilter);
  } else {
    setActiveTabAndCard("all");
  }

  /* ── Sort Dropdown ── */
  var sortSelect = document.getElementById("sortSelect");
  var productsGrid = document.getElementById("productsGrid");

  if (sortSelect && productsGrid) {
    sortSelect.addEventListener("change", function () {
      var val = sortSelect.value;
      var cardsToSort = Array.from(productsGrid.querySelectorAll(".cat-product-card"));

      if (val === "price-asc") {
        cardsToSort.sort(function (a, b) {
          var priceA = parseInt(a.querySelector(".cat-add-btn")?.dataset.price || "0", 10);
          var priceB = parseInt(b.querySelector(".cat-add-btn")?.dataset.price || "0", 10);
          return priceA - priceB;
        });
      } else if (val === "price-desc") {
        cardsToSort.sort(function (a, b) {
          var priceA = parseInt(a.querySelector(".cat-add-btn")?.dataset.price || "0", 10);
          var priceB = parseInt(b.querySelector(".cat-add-btn")?.dataset.price || "0", 10);
          return priceB - priceA;
        });
      }

      // Re-append in order
      cardsToSort.forEach(function (c) {
        productsGrid.appendChild(c);
      });
    });
  }

  /* ── Add to Cart Buttons ── */
  var addBtns = document.querySelectorAll(".cat-add-btn");
  addBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var id = btn.dataset.id || "product";
      var name = btn.dataset.name || "Pet Product";
      var price = parseInt(btn.dataset.price || "0", 10);
      var img = btn.dataset.img || "images/category/food.png";
      var variant = btn.dataset.variant || "Standard";

      addToCart({
        id: id,
        name: name,
        price: price,
        image: img,
        variant: variant,
        link: `product-details.html?id=${id}`
      });

      showToast(`Added ${name} to cart! 🐾`);
    });
  });

  /* ── Topbar Burger & Account Drawer ── */
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("accountDrawer");
  var backdrop = document.getElementById("drawerBackdrop");
  var loggedOutView = document.getElementById("loggedOutView");
  var loggedInView = document.getElementById("loggedInView");

  function loadCurrentUser() {
    try {
      var session = JSON.parse(localStorage.getItem("barkfySession") || sessionStorage.getItem("barkfySession") || "null");
      return session?.user || null;
    } catch (e) {
      return null;
    }
  }

  function updateAccountDrawer() {
    var user = loadCurrentUser();
    var loggedIn = Boolean(user);
    if (loggedOutView) loggedOutView.hidden = loggedIn;
    if (loggedInView) loggedInView.hidden = !loggedIn;

    if (loggedIn && user) {
      var nameEl = document.getElementById("profileName");
      var emailEl = document.getElementById("profileEmail");
      var avatarEl = document.getElementById("profileAvatar");
      if (nameEl) nameEl.textContent = user.name || "[Your name]";
      if (emailEl) emailEl.textContent = user.email || "[you@example.com]";
      if (avatarEl && user.name) {
        avatarEl.innerHTML = `<span style="font-size: 18px; font-weight: 700; color: #5C67BA;">${user.name.trim().charAt(0).toUpperCase()}</span>`;
      }
    }

    var page = location.pathname.split("/").pop() || "";
    document.querySelectorAll(".drawer-link").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      link.classList.toggle("selected", href !== "" && href !== "#" && page.includes(href.replace(".html", "")));
    });
  }

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

  if (burger) {
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (drawer && drawer.classList.contains("open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  document.querySelectorAll("#drawerClose, #drawerCloseLoggedOut").forEach(function (btn) {
    btn.addEventListener("click", closeDrawer);
  });
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  var signInBtn = document.getElementById("drawerSignIn");
  if (signInBtn) {
    signInBtn.addEventListener("click", function () {
      closeDrawer();
      window.location.href = "index.html#signin";
    });
  }

  var signUpBtn = document.getElementById("drawerSignUp");
  if (signUpBtn) {
    signUpBtn.addEventListener("click", function () {
      closeDrawer();
      window.location.href = "index.html#signup";
    });
  }

  var logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("barkfySession");
      sessionStorage.removeItem("barkfySession");
      updateAccountDrawer();
      closeDrawer();
      showToast("You have been logged out.");
    });
  }

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  updateAccountDrawer();

  /* ── Newsletter Form ── */
  var newsletterForm = document.getElementById("catNewsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast("You're subscribed! Monthly care tips incoming. 🐕");
      newsletterForm.reset();
    });
  }
});
