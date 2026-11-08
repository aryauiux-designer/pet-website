/* ============================================================
   CART PAGE  —  cart.js
   Dynamic shopping cart supporting:
     - Real-time quantity increment / decrement
     - Item removal
     - Discount code application (e.g. BARK10, PUPPY)
     - Empty cart state handling
     - Quick-add from "Add something for your pup"
     - Subtotal, discount & total recalculations
     - LocalStorage persistence
   ============================================================ */

const CART_STORAGE_KEY = "barkfy_cart_items";

// Default items matching user's design reference exactly
const DEFAULT_CART_ITEMS = [
  {
    id: "collar",
    name: "Lavender collar",
    variant: "Size M",
    price: 599,
    qty: 1,
    image: "images/category/collar.png",
    link: "product-details.html?id=collar"
  },
  {
    id: "food",
    name: "EverPaw complete dog food",
    variant: "Chicken recipe",
    price: 1549,
    qty: 1,
    image: "images/category/food.png",
    link: "product-details.html?id=food"
  }
];

document.addEventListener("DOMContentLoaded", function () {
  let appliedDiscountRate = 0; // e.g. 0.10 for 10%

  /* ── 1. Toast helper ── */
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

  /* ── 2. Load Cart from LocalStorage ── */
  function getCartItems() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      // KEY FIX: check stored !== null (not truthy length) so empty [] is preserved
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed; // allows empty []
      }
    } catch (e) {}
    // Only on a completely fresh visit with no localStorage key at all:
    saveCartItems(DEFAULT_CART_ITEMS);
    return [...DEFAULT_CART_ITEMS];
  }

  function saveCartItems(items) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  let cart = getCartItems();

  /* ── 3. DOM Elements ── */
  const itemsListEl = document.getElementById("cartItemsList");
  const layoutGridEl = document.getElementById("cartLayoutGrid");
  const emptyViewEl = document.getElementById("emptyCartView");
  const countLabelEl = document.getElementById("cartItemsCountLabel");
  const headerCountEl = document.getElementById("headerCartCount");
  const subtotalEl = document.getElementById("summarySubtotal");
  const totalEl = document.getElementById("summaryTotal");
  const discountRowEl = document.getElementById("discountRow");
  const discountPercentEl = document.getElementById("discountPercent");
  const summaryDiscountEl = document.getElementById("summaryDiscount");

  /* ── 4. Render Cart Items & Update Totals ── */
  function renderCart() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

    // Update count labels
    if (countLabelEl) {
      countLabelEl.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;
    }
    if (headerCountEl) {
      headerCountEl.textContent = totalCount;
    }

    // KEY FIX: Always clear the list FIRST before checking empty state
    if (itemsListEl) itemsListEl.innerHTML = "";

    // Handle empty state — toggle visibility via class (not [hidden]) to avoid CSS specificity issues
    if (cart.length === 0) {
      if (layoutGridEl) {
        layoutGridEl.style.display = "none";
      }
      if (emptyViewEl) {
        emptyViewEl.style.display = "";
        emptyViewEl.removeAttribute("hidden");
      }
      // Update totals to zero
      if (subtotalEl) subtotalEl.textContent = "₹0";
      if (totalEl) totalEl.textContent = "₹0";
      if (discountRowEl) discountRowEl.hidden = true;
      return;
    } else {
      if (layoutGridEl) {
        layoutGridEl.style.display = "";
        layoutGridEl.removeAttribute("hidden");
      }
      if (emptyViewEl) {
        emptyViewEl.style.display = "none";
        emptyViewEl.setAttribute("hidden", "");
      }
    }

    // Render items via innerHTML
    if (itemsListEl) {
      itemsListEl.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.qty;
        return `
          <article class="cart-item-card" data-index="${index}">
            <div class="item-thumb-wrap">
              <img src="${item.image}" alt="${item.name}" class="item-thumb-img" />
            </div>

            <div class="item-details">
              <h3 class="item-title">
                <a href="${item.link || 'categories.html'}">${item.name}</a>
              </h3>
              <p class="item-variant">${item.variant || 'Standard'}</p>
              <p class="item-unit-price">₹${item.price.toLocaleString("en-IN")} each</p>
            </div>

            <div class="item-qty-pill">
              <button type="button" class="cart-qty-btn dec" data-index="${index}" aria-label="Decrease quantity">−</button>
              <span class="cart-qty-count" aria-live="polite">${item.qty}</span>
              <button type="button" class="cart-qty-btn inc" data-index="${index}" aria-label="Increase quantity">+</button>
            </div>

            <div class="item-actions-col">
              <span class="item-total-price">₹${itemTotal.toLocaleString("en-IN")}</span>
              <button type="button" class="item-remove-btn" data-index="${index}" aria-label="Remove ${item.name}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Remove</span>
              </button>
            </div>
          </article>
        `;
      }).join("");
    }

    // KEY FIX: Use EVENT DELEGATION on itemsListEl so clicks on SVG/span children still work
    // (listeners survive re-renders because they're on the stable parent)
    // We attach ONE listener after each render; previous ones are wiped because innerHTML rebuilt the DOM.
    if (itemsListEl) {
      itemsListEl.addEventListener("click", function handleListClick(e) {
        // --- Remove button ---
        const removeBtn = e.target.closest(".item-remove-btn");
        if (removeBtn) {
          const idx = parseInt(removeBtn.dataset.index, 10);
          if (!isNaN(idx) && cart[idx]) {
            const itemTitle = cart[idx].name;
            cart.splice(idx, 1);
            saveCartItems(cart);
            renderCart();
            showToast(`Removed ${itemTitle} from cart.`);
          }
          return;
        }

        // --- Increment ---
        const incBtn = e.target.closest(".cart-qty-btn.inc");
        if (incBtn) {
          const idx = parseInt(incBtn.dataset.index, 10);
          if (!isNaN(idx) && cart[idx] && cart[idx].qty < 20) {
            cart[idx].qty++;
            saveCartItems(cart);
            renderCart();
          }
          return;
        }

        // --- Decrement ---
        const decBtn = e.target.closest(".cart-qty-btn.dec");
        if (decBtn) {
          const idx = parseInt(decBtn.dataset.index, 10);
          if (!isNaN(idx) && cart[idx]) {
            if (cart[idx].qty > 1) {
              cart[idx].qty--;
              saveCartItems(cart);
              renderCart();
            } else {
              const itemTitle = cart[idx].name;
              cart.splice(idx, 1);
              saveCartItems(cart);
              renderCart();
              showToast(`Removed ${itemTitle} from cart.`);
            }
          }
          return;
        }
      });
    }

    // Recalculate Totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (subtotalEl) {
      subtotalEl.textContent = "₹" + subtotal.toLocaleString("en-IN");
    }

    let discountAmount = 0;
    if (appliedDiscountRate > 0) {
      discountAmount = Math.round(subtotal * appliedDiscountRate);
      if (discountRowEl) discountRowEl.hidden = false;
      if (discountPercentEl) discountPercentEl.textContent = `${Math.round(appliedDiscountRate * 100)}%`;
      if (summaryDiscountEl) summaryDiscountEl.textContent = "-₹" + discountAmount.toLocaleString("en-IN");
    } else {
      if (discountRowEl) discountRowEl.hidden = true;
    }

    const grandTotal = Math.max(0, subtotal - discountAmount);
    if (totalEl) {
      totalEl.textContent = "₹" + grandTotal.toLocaleString("en-IN");
    }
  }

  // Initial render
  renderCart();

  /* ── 5. Discount Code Application ── */
  const discountInput = document.getElementById("discountCodeInput");
  const applyDiscountBtn = document.getElementById("applyDiscountBtn");
  const discountFeedback = document.getElementById("discountFeedback");

  if (applyDiscountBtn && discountInput) {
    applyDiscountBtn.addEventListener("click", () => {
      const code = discountInput.value.trim().toUpperCase();
      if (!code) return;

      if (code === "BARK10" || code === "PUPPY" || code === "BARKFY10") {
        appliedDiscountRate = 0.10; // 10% off
        renderCart();
        if (discountFeedback) {
          discountFeedback.hidden = false;
          discountFeedback.className = "discount-feedback success";
          discountFeedback.textContent = "✓ 10% Wag discount applied!";
        }
        showToast("Discount code applied: 10% off! 🐾");
      } else {
        if (discountFeedback) {
          discountFeedback.hidden = false;
          discountFeedback.className = "discount-feedback error";
          discountFeedback.textContent = "Invalid code. Try using BARK10";
        }
      }
    });
  }

  /* ── 6. Checkout Flow & Modal Handling ── */
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutModal = document.getElementById("checkoutModal");
  const checkoutCloseBtn = document.getElementById("checkoutCloseBtn");
  const checkoutOrderForm = document.getElementById("checkoutOrderForm");
  const checkoutFormStep = document.getElementById("checkoutFormStep");
  const checkoutSuccessStep = document.getElementById("checkoutSuccessStep");
  const modalCheckoutTotal = document.getElementById("modalCheckoutTotal");
  const successOrderId = document.getElementById("successOrderId");
  const successCustomerName = document.getElementById("successCustomerName");

  function openCheckoutModal() {
    if (cart.length === 0) {
      showToast("Your cart is empty! Explore products first. 🐾");
      return;
    }

    // Auth Gate: user must sign in or sign up before purchasing
    const user = loadCurrentUser();
    if (!user) {
      showToast("Please sign in or create an account to checkout. 🐾");
      setTimeout(() => {
        window.location.href = "index.html?redirect=cart.html#signin";
      }, 900);
      return;
    }

    if (checkoutModal) {
      if (modalCheckoutTotal && totalEl) {
        modalCheckoutTotal.textContent = totalEl.textContent;
      }

      // Pre-fill user data from session
      const nameInput = document.getElementById("shipName");
      const phoneInput = document.getElementById("shipPhone");
      const addressInput = document.getElementById("shipAddress");
      const cityInput = document.getElementById("shipCity");
      const pinInput = document.getElementById("shipPin");

      if (nameInput && !nameInput.value.trim() && user.name) {
        nameInput.value = user.name;
      }
      if (phoneInput && !phoneInput.value.trim() && user.phone) {
        phoneInput.value = user.phone;
      }

      // Pre-fill saved delivery address from user account session
      const savedAddr = user.address || {
        street: "124 Wagging Tail Lane, Apt 4B",
        city: "Bengaluru, Karnataka",
        pin: "560038"
      };

      if (addressInput && !addressInput.value.trim() && savedAddr.street) {
        addressInput.value = savedAddr.street;
      }
      if (cityInput && !cityInput.value.trim() && savedAddr.city) {
        cityInput.value = savedAddr.city;
      }
      if (pinInput && !pinInput.value.trim() && savedAddr.pin) {
        pinInput.value = savedAddr.pin;
      }

      if (checkoutFormStep) checkoutFormStep.hidden = false;
      if (checkoutSuccessStep) checkoutSuccessStep.hidden = true;
      checkoutModal.classList.add("open");
      checkoutModal.setAttribute("aria-hidden", "false");
    }
  }

  function closeCheckoutModal() {
    if (checkoutModal) {
      checkoutModal.classList.remove("open");
      checkoutModal.setAttribute("aria-hidden", "true");
    }
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", openCheckoutModal);
  }

  if (checkoutCloseBtn) {
    checkoutCloseBtn.addEventListener("click", closeCheckoutModal);
  }

  if (checkoutModal) {
    checkoutModal.addEventListener("click", (e) => {
      if (e.target === checkoutModal) closeCheckoutModal();
    });
  }

  // Payment radio options styling
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  paymentRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      document.querySelectorAll(".payment-option").forEach(opt => opt.classList.remove("selected"));
      radio.closest(".payment-option")?.classList.add("selected");
    });
  });

  // Submit checkout order
  if (checkoutOrderForm) {
    checkoutOrderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = loadCurrentUser();
      const customerName = document.getElementById("shipName")?.value.trim() || user?.name || "Pet Parent";
      const customerPhone = document.getElementById("shipPhone")?.value.trim() || user?.phone || "";
      const address = document.getElementById("shipAddress")?.value.trim() || "";
      const city = document.getElementById("shipCity")?.value.trim() || "";
      const pin = document.getElementById("shipPin")?.value.trim() || "";
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "cod";
      const randomId = "BKF-" + Math.floor(10000 + Math.random() * 90000);

      if (successOrderId) successOrderId.textContent = "#" + randomId;
      if (successCustomerName) successCustomerName.textContent = customerName;

      // Persist order to localStorage
      try {
        const orders = JSON.parse(localStorage.getItem("barkfy_orders") || "[]");
        orders.unshift({
          id: randomId,
          userId: user?.id || user?.email || "guest",
          userEmail: user?.email || "",
          customerName: customerName,
          phone: customerPhone,
          address: `${address}, ${city} - ${pin}`,
          items: [...cart],
          total: modalCheckoutTotal ? modalCheckoutTotal.textContent : "",
          paymentMethod: paymentMethod,
          status: "Processing",
          createdAt: new Date().toISOString()
        });
        localStorage.setItem("barkfy_orders", JSON.stringify(orders));
      } catch (err) {}

      // Keep address synchronized with user account session & registered accounts
      if (user && address) {
        try {
          user.address = {
            tag: user.address?.tag || "HOME",
            street: address,
            city: city,
            pin: pin
          };
          localStorage.setItem("barkfySession", JSON.stringify({ user }));
          sessionStorage.setItem("barkfySession", JSON.stringify({ user }));

          const accounts = JSON.parse(localStorage.getItem("barkfyAccounts") || "[]");
          const idx = accounts.findIndex(a => a.email === user.email || a.id === user.id);
          if (idx !== -1) {
            accounts[idx].address = user.address;
            localStorage.setItem("barkfyAccounts", JSON.stringify(accounts));
          }
        } catch (e) {}
      }

      // Clear Cart
      cart = [];
      saveCartItems(cart);
      renderCart();

      // Show Success View
      if (checkoutFormStep) checkoutFormStep.hidden = true;
      if (checkoutSuccessStep) checkoutSuccessStep.hidden = false;
      showToast("Order placed successfully! 🐾");
    });
  }

  /* ── 7. "Add something for your pup" Quick Add ── */
  const quickAddBtns = document.querySelectorAll(".upsell-quick-add");
  quickAddBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price, 10);
      const img = btn.dataset.img;
      const variant = btn.dataset.variant || "Standard";

      // Check if already in cart
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({
          id: id,
          name: name,
          variant: variant,
          price: price,
          qty: 1,
          image: img,
          link: `product-details.html?id=${id}`
        });
      }

      saveCartItems(cart);
      renderCart();
      showToast(`Added ${name} to your cart! 🐾`);
    });
  });

  /* ── 8. Topbar Burger & Account Drawer ── */
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
      window.location.href = "index.html?redirect=cart.html#signin";
    });
  }

  const signUpBtn = document.getElementById("drawerSignUp");
  if (signUpBtn) {
    signUpBtn.addEventListener("click", () => {
      closeDrawer();
      window.location.href = "index.html?redirect=cart.html#signup";
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

  /* ── 9. Close Menu & Modal on Escape ── */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeCheckoutModal();
      closeDrawer();
    }
  });

  /* ── 10. Footer Newsletter Form ── */
  const newsletterForm = document.getElementById("cartNewsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", e => {
      e.preventDefault();
      showToast("You're subscribed! Monthly care tips incoming. 🐕");
      newsletterForm.reset();
    });
  }
});
