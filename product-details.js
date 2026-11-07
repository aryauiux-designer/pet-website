/* ============================================================
   PRODUCT DETAILS PAGE  —  product-details.js
   Dynamic product catalog engine supporting ALL products:
     - collar (Lavender collar)
     - food   (EverPaw complete dog food)
     - loopy  (Loopy foaming pet shampoo)
     - ball   (Plush toy ball)
     - bed    (Cozy striped dog bed)
     - combo  (Barkfy Welcome Pup Combo)
   ============================================================ */

const PRODUCTS_DATABASE = {
  collar: {
    id: "collar",
    name: "Lavender collar",
    tag: "Pet accessories",
    category: "Accessories",
    categoryFilter: "accessories",
    price: 599,
    optionLabel: "Size",
    options: ["S", "M", "L"],
    defaultOption: "M",
    hasSizeGuide: true,
    sizeGuideType: "collar",
    subtitle: "A lavender collar with a gold buckle and a matching tag, made for everyday walks.",
    images: [
      "images/new-launch/accessories.png",
      "images/category/collar.png"
    ],
    desc: "A lavender collar with a gold buckle and a matching tag, made for everyday walks. Handcrafted using ultra-durable vegan composite leather that remains soft against your pup’s fur while resisting weather, dirt, and daily pulls.",
    specs: [
      { label: "Material", val: "Reinforced vegan faux-leather with matte lavender finish" },
      { label: "Hardware", val: "Solid zinc-alloy buckle and D-ring in brushed champagne gold" },
      { label: "Tag", val: "Engravable Barkfy identity token included" },
      { label: "Cleaning", val: "Wipe clean with a damp warm cloth; air dry" },
      { label: "Sizes", val: 'S (10"–14"), M (14"–18"), L (18"–22")' }
    ]
  },

  food: {
    id: "food",
    name: "EverPaw complete dog food",
    tag: "Pet foods",
    category: "Food",
    categoryFilter: "food",
    price: 1549,
    optionLabel: "Bag Weight",
    options: ["1 kg", "3 kg", "5 kg"],
    defaultOption: "3 kg",
    hasSizeGuide: true,
    sizeGuideType: "food",
    subtitle: "Chicken recipe for everyday meals. Formulated by vet nutritionists for gut health and silky coats.",
    images: [
      "images/category/food.png",
      "images/new-launch/foods.jpg"
    ],
    desc: "EverPaw complete dog food offers 100% wholesome nutrition prepared with farm-fresh chicken, ancient grains, cold-pressed sunflower oils, and gut-soothing probiotics. Slow-baked to lock in natural vitamins and irresistible flavor.",
    specs: [
      { label: "Primary Ingredient", val: "Fresh Free-Range Chicken (32%)" },
      { label: "Nutritional Profile", val: "28% Protein, 16% Crude Fat, 4% Fiber" },
      { label: "Dietary Standard", val: "Corn-free, wheat-free, zero artificial colors or fillers" },
      { label: "Life Stage", val: "Suitable for all dog breeds and life stages" },
      { label: "Packaging", val: "Resealable stay-fresh zipper pouch" }
    ]
  },

  loopy: {
    id: "loopy",
    name: "Loopy foaming pet shampoo",
    tag: "Pet care",
    category: "Pet care",
    categoryFilter: "petcare",
    price: 649,
    optionLabel: "Bottle Size",
    options: ["250 ml", "500 ml"],
    defaultOption: "250 ml",
    hasSizeGuide: false,
    subtitle: "Gentle foam for paws and coat. No-rinse formula with lavender extract and colloidal oatmeal.",
    images: [
      "images/category/loopy.png",
      "images/new-launch/care.jpg"
    ],
    desc: "Loopy Foaming Pet Shampoo is an instant, rinse-free cleanser formulated with natural lavender extract, chamomile, and soothing colloidal oatmeal. Gently lifts mud, pollen, and odor from paws and fur without drying your dog's skin.",
    specs: [
      { label: "Key Botanicals", val: "Colloidal Oatmeal, French Lavender, Chamomile" },
      { label: "Formula", val: "pH-balanced for dogs, 100% soap-free and tearless" },
      { label: "Usage", val: "Pump onto paws or coat, massage gently, wipe with dry towel" },
      { label: "Safety", val: "Paraben, sulfate, and alcohol-free. Lick-safe once dry." }
    ]
  },

  ball: {
    id: "ball",
    name: "Plush toy ball",
    tag: "Pet toys",
    category: "Toys",
    categoryFilter: "toys",
    price: 399,
    optionLabel: "Pack Size",
    options: ["1 Ball", "Pack of 2"],
    defaultOption: "1 Ball",
    hasSizeGuide: false,
    subtitle: "Soft tennis-style plush wool ball for fetch with gentle low-noise squeaker.",
    images: [
      "images/category/ball.png",
      "images/new-launch/toys.jpg"
    ],
    desc: "Engineered for hours of interactive fetch without irritating loud shrieks. Built with reinforced double seams, natural wool felt, and a cushioned chew-friendly core that’s gentle on puppy teeth and tender gums.",
    specs: [
      { label: "Material", val: "Non-abrasive wool felt & recycled cotton core" },
      { label: "Squeaker", val: "Low-decibel gentle pup squeaker" },
      { label: "Diameter", val: "6.5 cm (Standard tennis ball size)" },
      { label: "Care", val: "Machine wash on gentle cycle, air dry" }
    ]
  },

  bed: {
    id: "bed",
    name: "Cozy striped dog bed",
    tag: "Pet accessories",
    category: "Accessories",
    categoryFilter: "accessories",
    price: 1899,
    optionLabel: "Bed Size",
    options: ["S", "M", "L", "XL"],
    defaultOption: "M",
    hasSizeGuide: true,
    sizeGuideType: "bed",
    subtitle: "Soft orthopedic cushion with raised bolsters for neck support and secure nesting.",
    images: [
      "images/category/bed.png",
      "images/new-launch/comfort.png"
    ],
    desc: "The Barkfy Cloud Bed combines dual-density orthopedic foam with supportive bolstered walls that cradle your pet’s head and neck. Crafted with breathable ticking stripe canvas that looks stylish in your home while resisting digging and hair.",
    specs: [
      { label: "Core", val: "CertiPUR-US® orthopedic memory foam base" },
      { label: "Cover", val: "100% cotton ticking stripe canvas with water-resistant liner" },
      { label: "Bottom", val: "Non-skid silicone dot grip base" },
      { label: "Cleaning", val: "Removable zipper cover is 100% machine washable" }
    ]
  },

  combo: {
    id: "combo",
    name: "Barkfy Welcome Pup Combo",
    tag: "Pet combos",
    category: "Accessories",
    categoryFilter: "accessories",
    price: 2499,
    optionLabel: "Bundle",
    options: ["Starter (4 items)", "Deluxe (6 items)"],
    defaultOption: "Starter (4 items)",
    hasSizeGuide: false,
    subtitle: "The all-in-one starter bundle: collar, complete food pack, plush squeak ball, and foaming shampoo.",
    images: [
      "images/category/combo.png",
      "images/new-launch/combo.jpg"
    ],
    desc: "Make homecoming unforgettable with the curated Barkfy Welcome Bundle. Featuring our top-rated lavender walk collar, an EverPaw healthy kibble sampler, the gentle Loopy paw foam, and a cozy plush ball—saving over 25% compared to individual items.",
    specs: [
      { label: "Bundle Includes", val: "Collar, Food pouch (1kg), Foaming wash (250ml), Plush ball" },
      { label: "Savings", val: "Save 25% compared to purchasing items separately" },
      { label: "Packaging", val: "Delivered in eco-friendly Barkfy gift box with custom welcome card" }
    ]
  }
};

document.addEventListener("DOMContentLoaded", function () {
  /* ── 1. Determine active product from URL ── */
  const urlParams = new URLSearchParams(window.location.search);
  const requestedId = urlParams.get("id");
  const productKey = (requestedId && PRODUCTS_DATABASE[requestedId]) ? requestedId : "collar";
  const product = PRODUCTS_DATABASE[productKey];

  let currentQty = 1;
  let selectedOption = product.defaultOption || product.options[0];

  /* ── 2. Toast Helper ── */
  function showToast(msg) {
    const toast = document.getElementById("siteToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("toast-visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove("toast-visible");
    }, 3200);
  }

  /* ── 3. Populate Page with Active Product Data ── */
  document.title = `${product.name} — BARKFY`;

  // Breadcrumbs
  const catLink = document.getElementById("pdpCatLink");
  if (catLink) {
    catLink.textContent = product.category;
    catLink.href = `categories.html?filter=${product.categoryFilter}`;
  }
  const crumbCurrent = document.getElementById("pdpCrumbCurrent");
  if (crumbCurrent) crumbCurrent.textContent = product.name;

  // Media tag & Main Image
  const mediaTag = document.getElementById("pdpMediaTag");
  if (mediaTag) mediaTag.textContent = product.tag;

  const mainImg = document.getElementById("mainProductImage");
  if (mainImg) {
    mainImg.src = product.images[0];
    mainImg.alt = product.name;
  }

  // Thumbnails
  const thumbWrap = document.getElementById("pdpThumbnails");
  if (thumbWrap && product.images.length > 0) {
    thumbWrap.innerHTML = product.images.map((src, i) => `
      <button type="button" class="thumb-btn ${i === 0 ? 'active' : ''}" data-img="${src}" aria-label="View product image ${i + 1}" aria-selected="${i === 0}">
        <img src="${src}" alt="${product.name} thumbnail ${i + 1}" />
      </button>
    `).join("");

    // Wire thumbnail switching
    const thumbBtns = thumbWrap.querySelectorAll(".thumb-btn");
    thumbBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        thumbBtns.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        const targetSrc = btn.dataset.img;
        if (mainImg && targetSrc) {
          mainImg.style.opacity = "0.7";
          mainImg.src = targetSrc;
          setTimeout(() => { mainImg.style.opacity = "1"; }, 150);
        }
      });
    });
  }

  // Title, subtitle, price
  const titleEl = document.getElementById("pdpTitle");
  if (titleEl) titleEl.textContent = product.name;

  const subEl = document.getElementById("pdpSubtitle");
  if (subEl) subEl.textContent = product.subtitle;

  const unitPriceEl = document.getElementById("unitPriceDisplay");
  if (unitPriceEl) unitPriceEl.textContent = `₹${product.price.toLocaleString("en-IN")}`;

  // Option Label (Size / Weight / Pack)
  const optionLabelEl = document.getElementById("pdpOptionLabel");
  if (optionLabelEl) optionLabelEl.textContent = product.optionLabel;

  // Size Guide Button visibility
  const sizeGuideBtn = document.getElementById("sizeGuideBtn");
  if (sizeGuideBtn) {
    sizeGuideBtn.style.display = product.hasSizeGuide ? "inline-block" : "none";
  }

  // Option Chips
  const chipsWrap = document.getElementById("pdpOptionChips");
  if (chipsWrap && product.options.length > 0) {
    chipsWrap.innerHTML = product.options.map(opt => `
      <button type="button" class="size-chip ${opt === selectedOption ? 'active' : ''}" data-val="${opt}" role="radio" aria-checked="${opt === selectedOption}">
        ${opt}
      </button>
    `).join("");

    const chips = chipsWrap.querySelectorAll(".size-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => {
          c.classList.remove("active");
          c.setAttribute("aria-checked", "false");
        });
        chip.classList.add("active");
        chip.setAttribute("aria-checked", "true");
        selectedOption = chip.dataset.val;
      });
    });
  }

  // Tabs content
  const tabDesc = document.getElementById("tabDesc");
  if (tabDesc) {
    tabDesc.innerHTML = `<p>${product.desc}</p>`;
  }

  const tabDetails = document.getElementById("tabDetails");
  if (tabDetails && product.specs) {
    tabDetails.innerHTML = `
      <ul class="pdp-specs-list">
        ${product.specs.map(s => `<li><strong>${s.label}:</strong> ${s.val}</li>`).join("")}
      </ul>
    `;
  }

  /* ── 4. Quantity & Total Price Calculation ── */
  const qtyVal = document.getElementById("pdpQtyVal");
  const qtyDec = document.getElementById("pdpQtyDec");
  const qtyInc = document.getElementById("pdpQtyInc");
  const cartTotal = document.getElementById("pdpCartTotal");

  function updatePrice() {
    if (qtyVal) qtyVal.textContent = currentQty;
    if (cartTotal) {
      const total = product.price * currentQty;
      cartTotal.textContent = "₹" + total.toLocaleString("en-IN");
    }
  }
  updatePrice();

  if (qtyDec) {
    qtyDec.addEventListener("click", () => {
      if (currentQty > 1) {
        currentQty--;
        updatePrice();
      }
    });
  }

  if (qtyInc) {
    qtyInc.addEventListener("click", () => {
      if (currentQty < 20) {
        currentQty++;
        updatePrice();
      }
    });
  }

  /* ── 5. Add to Cart Button ── */
  const CART_STORAGE_KEY = "barkfy_cart_items";

  function updateHeaderCartCount() {
    let count = 0;
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const cart = JSON.parse(raw);
        if (Array.isArray(cart)) {
          count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        }
      }
    } catch (e) {}

    document.querySelectorAll(".cart-badge-count, #cartCount, #headerCartCount").forEach(el => {
      el.textContent = count;
    });
  }
  updateHeaderCartCount();

  const addToCartBtn = document.getElementById("pdpAddToCartBtn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      let cart = [];
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) cart = parsed;
        }
      } catch (e) {}

      const existing = cart.find(item => item.id === product.id && (item.variant || "") === (selectedOption || ""));
      if (existing) {
        existing.qty = (existing.qty || 1) + currentQty;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          variant: selectedOption || "Standard",
          price: product.price,
          qty: currentQty,
          image: product.images[0],
          link: `product-details.html?id=${product.id}`
        });
      }

      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {}

      updateHeaderCartCount();
      showToast(`Added ${currentQty} × ${product.name} (${selectedOption}) to cart! 🐾`);
    });
  }

  /* ── 6. Wishlist Button ── */
  const wishlistBtn = document.getElementById("pdpWishlistBtn");
  if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
      const isSaved = wishlistBtn.classList.toggle("active");
      if (isSaved) {
        showToast(`Saved ${product.name} to your wishlist! ♥`);
      } else {
        showToast("Removed from your wishlist.");
      }
    });
  }

  /* ── 7. Tabs Switching ── */
  const tabBtns = document.querySelectorAll(".pdp-tab-btn");
  const tabPanels = document.querySelectorAll(".pdp-tab-panel");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      tabPanels.forEach(p => {
        p.classList.remove("active");
        p.hidden = true;
      });

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const targetId = btn.dataset.tab;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add("active");
        targetPanel.hidden = false;
      }
    });
  });

  /* ── 8. Size Guide Modal ── */
  const sizeModal = document.getElementById("sizeGuideModal");
  const sizeClose = document.getElementById("sizeGuideClose");

  function openSizeModal() {
    if (sizeModal) {
      sizeModal.classList.add("open");
      sizeModal.setAttribute("aria-hidden", "false");
    }
  }

  function closeSizeModal() {
    if (sizeModal) {
      sizeModal.classList.remove("open");
      sizeModal.setAttribute("aria-hidden", "true");
    }
  }

  if (sizeGuideBtn) sizeGuideBtn.addEventListener("click", openSizeModal);
  if (sizeClose) sizeClose.addEventListener("click", closeSizeModal);
  if (sizeModal) {
    sizeModal.addEventListener("click", e => {
      if (e.target === sizeModal) closeSizeModal();
    });
  }

  /* ── 9. Dynamic Related Products ("You may also like") ── */
  const relatedGrid = document.getElementById("pdpRelatedGrid");
  if (relatedGrid) {
    // Pick 3 other products excluding the current one
    const otherKeys = Object.keys(PRODUCTS_DATABASE).filter(k => k !== productKey).slice(0, 3);
    relatedGrid.innerHTML = otherKeys.map(k => {
      const p = PRODUCTS_DATABASE[k];
      return `
        <article class="pdp-rel-card">
          <a href="product-details.html?id=${p.id}" class="pdp-rel-img-link" aria-label="View ${p.name}">
            <div class="pdp-rel-img-wrap">
              <img src="${p.images[0]}" alt="${p.name}" />
            </div>
          </a>
          <div class="pdp-rel-info">
            <h3 class="pdp-rel-name"><a href="product-details.html?id=${p.id}">${p.name}</a></h3>
            <span class="pdp-rel-price">₹${p.price.toLocaleString("en-IN")}</span>
          </div>
        </article>
      `;
    }).join("");
  }

  /* ── 10. Topbar Burger & Account Drawer ── */
  const burger = document.getElementById("burger");
  const drawer = document.getElementById("accountDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const loggedOutView = document.getElementById("loggedOutView");
  const loggedInView = document.getElementById("loggedInView");

  function loadCurrentUser() {
    try {
      const session = JSON.parse(localStorage.getItem("barkfySession") || sessionStorage.getItem("barkfySession") || "null");
      return session?.user || null;
    } catch (e) {
      return null;
    }
  }

  function updateAccountDrawer() {
    const user = loadCurrentUser();
    const loggedIn = Boolean(user);
    if (loggedOutView) loggedOutView.hidden = loggedIn;
    if (loggedInView) loggedInView.hidden = !loggedIn;

    if (loggedIn && user) {
      const nameEl = document.getElementById("profileName");
      const emailEl = document.getElementById("profileEmail");
      const avatarEl = document.getElementById("profileAvatar");
      if (nameEl) nameEl.textContent = user.name || "[Your name]";
      if (emailEl) emailEl.textContent = user.email || "[you@example.com]";
      if (avatarEl && user.name) {
        avatarEl.innerHTML = `<span style="font-size: 18px; font-weight: 700; color: #5C67BA;">${user.name.trim().charAt(0).toUpperCase()}</span>`;
      }
    }

    const page = location.pathname.split("/").pop() || "";
    document.querySelectorAll(".drawer-link").forEach(link => {
      const href = link.getAttribute("href") || "";
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
    burger.addEventListener("click", e => {
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

  const signInBtn = document.getElementById("drawerSignIn");
  if (signInBtn) {
    signInBtn.addEventListener("click", () => {
      closeDrawer();
      window.location.href = "index.html#signin";
    });
  }

  const signUpBtn = document.getElementById("drawerSignUp");
  if (signUpBtn) {
    signUpBtn.addEventListener("click", () => {
      closeDrawer();
      window.location.href = "index.html#signup";
    });
  }

  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("barkfySession");
      sessionStorage.removeItem("barkfySession");
      updateAccountDrawer();
      closeDrawer();
      showToast("You have been logged out.");
    });
  }

  updateAccountDrawer();

  /* ── 11. Escape Key Handler ── */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeSizeModal();
      closeDrawer();
    }
  });

  /* ── 12. Footer Newsletter Form ── */
  const newsletterForm = document.getElementById("pdpNewsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", e => {
      e.preventDefault();
      showToast("You're subscribed! Monthly care tips incoming. 🐕");
      newsletterForm.reset();
    });
  }

  /* ── 13. Header Cart Button ── */
  const cartButton = document.getElementById("cartButton");
  if (cartButton) {
    cartButton.addEventListener("click", () => {
      showToast("Cart opened — browse items or checkout! 🐾");
    });
  }
});
