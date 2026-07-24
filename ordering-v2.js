(() => {
  const orderingStylesheet = document.createElement('link');
  orderingStylesheet.rel = 'stylesheet';
  orderingStylesheet.href = 'ordering.css';
  document.head.appendChild(orderingStylesheet);

  const lifecycleStylesheet = document.createElement('link');
  lifecycleStylesheet.rel = 'stylesheet';
  lifecycleStylesheet.href = 'order-lifecycle.css';
  document.head.appendChild(lifecycleStylesheet);

  const peso = (amount) => `₱${Number(amount).toLocaleString('en-PH')}`;
  const ACTIVE_ORDER_KEY = 'sueno-demo-active-order-v2';
  const STAMPS_KEY = 'sueno-demo-stamps-v2';

  const catalog = {
    'Spanish Latte': {
      name: 'Spanish Latte', price: 165, category: 'coffee', icon: '☕', badge: 'BESTSELLER',
      description: 'Espresso, fresh milk, signature sweet cream.', temperatures: ['Iced', 'Hot'],
      sizes: [{ name: 'Regular', add: 0 }, { name: 'Large', add: 20 }],
      addons: [{ name: 'Extra espresso shot', price: 30 }, { name: 'Oat milk', price: 35 }, { name: 'Extra sweet cream', price: 20 }]
    },
    'Sea Salt Caramel Latte': {
      name: 'Sea Salt Caramel Latte', price: 175, category: 'coffee', icon: '☕', badge: 'SIGNATURE',
      description: 'Caramel espresso latte finished with a light sea-salt cream.', temperatures: ['Iced', 'Hot'],
      sizes: [{ name: 'Regular', add: 0 }, { name: 'Large', add: 20 }],
      addons: [{ name: 'Extra espresso shot', price: 30 }, { name: 'Oat milk', price: 35 }, { name: 'Extra sea-salt cream', price: 20 }]
    },
    'Iced Americano': {
      name: 'Iced Americano', price: 125, category: 'coffee', icon: '☕', badge: 'CLASSIC',
      description: 'Double espresso over chilled filtered water and ice.', temperatures: ['Iced', 'Hot'],
      sizes: [{ name: 'Regular', add: 0 }, { name: 'Large', add: 20 }],
      addons: [{ name: 'Extra espresso shot', price: 30 }, { name: 'Vanilla syrup', price: 20 }]
    },
    'Matcha Cloud': {
      name: 'Matcha Cloud', price: 175, category: 'non-coffee', icon: '🍵', badge: 'CUSTOMER FAVORITE',
      description: 'Premium matcha, milk, and a smooth cloud cream finish.', temperatures: ['Iced', 'Hot'],
      sizes: [{ name: 'Regular', add: 0 }, { name: 'Large', add: 20 }],
      addons: [{ name: 'Oat milk', price: 35 }, { name: 'Extra cloud cream', price: 20 }]
    },
    'Chocolate Dream': {
      name: 'Chocolate Dream', price: 160, category: 'non-coffee', icon: '🥤', badge: 'SWEET FAVORITE',
      description: 'Deep cocoa, milk, and a creamy chocolate finish.', temperatures: ['Iced', 'Hot'],
      sizes: [{ name: 'Regular', add: 0 }, { name: 'Large', add: 20 }],
      addons: [{ name: 'Oat milk', price: 35 }, { name: 'Extra chocolate', price: 20 }, { name: 'Whipped cream', price: 20 }]
    },
    'Butter Croissant': {
      name: 'Butter Croissant', price: 110, category: 'food', icon: '🥐', badge: 'BAKED FAVORITE',
      description: 'Flaky, buttery pastry baked for your coffee pairing.', temperatures: [],
      sizes: [{ name: 'Regular', add: 0 }],
      addons: [{ name: 'Warm it up', price: 0 }, { name: 'Add butter', price: 15 }]
    }
  };

  const statusFlows = {
    pickup: [
      { key: 'received', label: 'Order received', headline: 'Sueño received your order.', detail: 'Waiting for the shop to accept your order.', icon: '✓', action: 'Accept order' },
      { key: 'accepted', label: 'Order accepted', headline: 'Your order is confirmed.', detail: 'The Sueño team is getting ready to make it.', icon: '✓', action: 'Start preparing' },
      { key: 'preparing', label: 'Preparing', headline: 'Your coffee is being prepared.', detail: 'Freshly made by the Sueño team.', icon: '☕', action: 'Mark ready' },
      { key: 'ready', label: 'Ready for pickup', headline: 'Your order is ready.', detail: 'Show your order number at the counter.', icon: '✓', action: 'Complete order' },
      { key: 'completed', label: 'Completed', headline: 'Order completed.', detail: 'Enjoy your Sueño.', icon: '★', final: true }
    ],
    'dine-in': [
      { key: 'received', label: 'Order received', headline: 'Sueño received your order.', detail: 'Waiting for the shop to accept your order.', icon: '✓', action: 'Accept order' },
      { key: 'accepted', label: 'Order accepted', headline: 'Your order is confirmed.', detail: 'The kitchen and bar are getting ready.', icon: '✓', action: 'Start preparing' },
      { key: 'preparing', label: 'Preparing', headline: 'Your order is being prepared.', detail: 'We will bring it out when it is ready.', icon: '☕', action: 'Ready to serve' },
      { key: 'serving', label: 'Ready to serve', headline: 'Your order is ready to serve.', detail: 'Sueño will bring your order to your table.', icon: '✓', action: 'Complete order' },
      { key: 'completed', label: 'Completed', headline: 'Order completed.', detail: 'Enjoy your Sueño.', icon: '★', final: true }
    ],
    delivery: [
      { key: 'received', label: 'Order received', headline: 'Sueño received your delivery order.', detail: 'Waiting for the shop to accept your order.', icon: '✓', action: 'Accept order' },
      { key: 'accepted', label: 'Order accepted', headline: 'Your delivery is confirmed.', detail: 'The Sueño team is getting ready to make it.', icon: '✓', action: 'Start preparing' },
      { key: 'preparing', label: 'Preparing', headline: 'Your coffee is being prepared.', detail: 'We will hand it to the rider when ready.', icon: '☕', action: 'Assign rider' },
      { key: 'rider-assigned', label: 'Rider assigned', headline: 'A rider is assigned.', detail: 'Your order will leave Sueño shortly.', icon: '🛵', action: 'Out for delivery' },
      { key: 'out-for-delivery', label: 'Out for delivery', headline: 'Your Sueño is on the way.', detail: 'The rider is bringing your order to you.', icon: '🛵', action: 'Mark delivered' },
      { key: 'delivered', label: 'Delivered', headline: 'Order delivered.', detail: 'Enjoy your Sueño wherever you are.', icon: '★', final: true }
    ]
  };

  let cart = [];
  let currentProduct = null;
  let selection = null;
  let fulfillment = 'pickup';
  let pickupTime = 'ASAP • ~15 min';
  let payment = 'Pay at counter';
  let deliveryAddress = 'Quezon City, Metro Manila';
  let currentStamps = Number.parseInt(localStorage.getItem(STAMPS_KEY) || '7', 10);
  if (!Number.isFinite(currentStamps)) currentStamps = 7;

  let activeOrder = null;
  try {
    activeOrder = JSON.parse(localStorage.getItem(ACTIVE_ORDER_KEY) || 'null');
  } catch {
    localStorage.removeItem(ACTIVE_ORDER_KEY);
  }

  const commerceRoot = document.createElement('div');
  commerceRoot.innerHTML = `
    <div class="cart-float" id="cartFloat" aria-live="polite">
      <div class="cart-float-copy">
        <small id="cartFloatLabel">YOUR ORDER</small>
        <strong id="cartFloatSummary">1 item • ₱0</strong>
      </div>
      <button type="button" id="viewCartButton">View cart →</button>
    </div>

    <div class="order-backdrop" id="productBackdrop" aria-hidden="true">
      <section class="product-sheet" id="productSheet" role="dialog" aria-modal="true" aria-label="Customize item"></section>
    </div>

    <section class="commerce-overlay" id="cartOverlay" aria-hidden="true"></section>
    <section class="commerce-overlay" id="checkoutOverlay" aria-hidden="true"></section>
    <section class="commerce-overlay order-status-overlay" id="orderStatusOverlay" aria-hidden="true"></section>

    <div class="order-backdrop" id="confirmationBackdrop" aria-hidden="true">
      <section class="confirmation-card" id="confirmationCard" role="dialog" aria-modal="true" aria-label="Order update"></section>
    </div>
  `;
  document.body.appendChild(commerceRoot);

  const cartFloat = document.getElementById('cartFloat');
  const cartFloatLabel = document.getElementById('cartFloatLabel');
  const cartFloatSummary = document.getElementById('cartFloatSummary');
  const viewCartButton = document.getElementById('viewCartButton');
  const productBackdrop = document.getElementById('productBackdrop');
  const productSheet = document.getElementById('productSheet');
  const cartOverlay = document.getElementById('cartOverlay');
  const checkoutOverlay = document.getElementById('checkoutOverlay');
  const orderStatusOverlay = document.getElementById('orderStatusOverlay');
  const confirmationBackdrop = document.getElementById('confirmationBackdrop');
  const confirmationCard = document.getElementById('confirmationCard');

  const totalCartItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = () => cart.reduce((sum, item) => sum + item.total, 0);
  const qualifyingDrinkCount = () => cart.reduce((sum, item) => sum + (item.category === 'food' ? 0 : item.quantity), 0);

  function persistActiveOrder() {
    if (activeOrder) localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(activeOrder));
    else localStorage.removeItem(ACTIVE_ORDER_KEY);
  }

  function setOpen(element, open) {
    element?.classList.toggle('open', open);
    element?.setAttribute('aria-hidden', open ? 'false' : 'true');
    const anythingOpen = [productBackdrop, cartOverlay, checkoutOverlay, orderStatusOverlay, confirmationBackdrop]
      .some((node) => node?.classList.contains('open'));
    document.body.style.overflow = anythingOpen ? 'hidden' : '';
  }

  function showToast(message) {
    const toastNode = document.getElementById('toast');
    if (!toastNode) return;
    toastNode.textContent = message;
    toastNode.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toastNode.classList.remove('show'), 2400);
  }

  function statusStep(order = activeOrder) {
    if (!order) return null;
    return statusFlows[order.fulfillment]?.find((step) => step.key === order.statusKey) || null;
  }

  function selectionUnitPrice() {
    if (!currentProduct || !selection) return 0;
    const size = currentProduct.sizes.find((item) => item.name === selection.size);
    const addonTotal = currentProduct.addons
      .filter((addon) => selection.addons.has(addon.name))
      .reduce((sum, addon) => sum + addon.price, 0);
    return currentProduct.price + (size?.add || 0) + addonTotal;
  }

  function renderProduct() {
    if (!currentProduct || !selection) return;
    const unitPrice = selectionUnitPrice();
    const total = unitPrice * selection.quantity;
    const hasTemperature = currentProduct.temperatures.length > 0;
    const hasMultipleSizes = currentProduct.sizes.length > 1;

    productSheet.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="sheet-topbar">
        <span class="pill">${currentProduct.badge}</span>
        <button class="sheet-close" type="button" id="closeProductButton" aria-label="Close">×</button>
      </div>
      <div class="product-hero">
        <div class="product-visual">${currentProduct.icon}</div>
        <div class="product-meta">
          <p class="eyebrow">SUEÑO FAVORITE</p>
          <h2>${currentProduct.name}</h2>
          <strong class="product-price">from ${peso(currentProduct.price)}</strong>
          <p>${currentProduct.description}</p>
        </div>
      </div>
      ${hasTemperature ? `
        <div class="option-group">
          <div class="option-heading"><h3>Temperature</h3><span>Choose one</span></div>
          <div class="choice-grid">
            ${currentProduct.temperatures.map((temperature) => `
              <button type="button" class="choice-chip ${selection.temperature === temperature ? 'selected' : ''}" data-temperature="${temperature}">
                <strong>${temperature}</strong><small>${temperature === 'Iced' ? 'Cold & refreshing' : 'Warm & comforting'}</small>
              </button>`).join('')}
          </div>
        </div>` : ''}
      ${hasMultipleSizes ? `
        <div class="option-group">
          <div class="option-heading"><h3>Size</h3><span>Choose one</span></div>
          <div class="choice-grid">
            ${currentProduct.sizes.map((size) => `
              <button type="button" class="choice-chip ${selection.size === size.name ? 'selected' : ''}" data-size="${size.name}">
                <strong>${size.name}</strong><small>${size.add ? `+${peso(size.add)}` : peso(currentProduct.price)}</small>
              </button>`).join('')}
          </div>
        </div>` : ''}
      <div class="option-group">
        <div class="option-heading"><h3>${currentProduct.category === 'food' ? 'Options' : 'Add-ons'}</h3><span>Optional</span></div>
        <div class="addon-list">
          ${currentProduct.addons.map((addon) => `
            <button type="button" class="addon-row ${selection.addons.has(addon.name) ? 'selected' : ''}" data-addon="${addon.name}">
              <span><i class="addon-check">✓</i>${addon.name}</span>
              <span class="addon-price">${addon.price ? `+${peso(addon.price)}` : 'Free'}</span>
            </button>`).join('')}
        </div>
      </div>
      <div class="option-group quantity-row">
        <div class="option-heading" style="margin:0"><h3>Quantity</h3></div>
        <div class="quantity-control">
          <button type="button" id="decreaseQuantity" aria-label="Decrease quantity">−</button>
          <strong>${selection.quantity}</strong>
          <button type="button" id="increaseQuantity" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button type="button" class="add-cart-button" id="addToCartButton"><span>Add to cart</span><strong>${peso(total)}</strong></button>
    `;

    productSheet.querySelector('#closeProductButton')?.addEventListener('click', closeProduct);
    productSheet.querySelectorAll('[data-temperature]').forEach((button) => button.addEventListener('click', () => {
      selection.temperature = button.dataset.temperature;
      renderProduct();
    }));
    productSheet.querySelectorAll('[data-size]').forEach((button) => button.addEventListener('click', () => {
      selection.size = button.dataset.size;
      renderProduct();
    }));
    productSheet.querySelectorAll('[data-addon]').forEach((button) => button.addEventListener('click', () => {
      const addon = button.dataset.addon;
      if (selection.addons.has(addon)) selection.addons.delete(addon);
      else selection.addons.add(addon);
      renderProduct();
    }));
    productSheet.querySelector('#decreaseQuantity')?.addEventListener('click', () => {
      selection.quantity = Math.max(1, selection.quantity - 1);
      renderProduct();
    });
    productSheet.querySelector('#increaseQuantity')?.addEventListener('click', () => {
      selection.quantity += 1;
      renderProduct();
    });
    productSheet.querySelector('#addToCartButton')?.addEventListener('click', addCurrentProductToCart);
  }

  function openProduct(name) {
    if (activeOrder) {
      showToast('You already have an active demo order. Track it first.');
      openOrderStatus();
      return;
    }
    const product = catalog[name];
    if (!product) return;
    currentProduct = product;
    selection = {
      temperature: product.temperatures[0] || '',
      size: product.sizes[0]?.name || 'Regular',
      addons: new Set(),
      quantity: 1
    };
    renderProduct();
    setOpen(productBackdrop, true);
  }

  function closeProduct() {
    setOpen(productBackdrop, false);
    currentProduct = null;
    selection = null;
  }

  function addCurrentProductToCart() {
    if (!currentProduct || !selection) return;
    const unitPrice = selectionUnitPrice();
    const item = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: currentProduct.name,
      icon: currentProduct.icon,
      category: currentProduct.category,
      temperature: selection.temperature,
      size: selection.size,
      addons: [...selection.addons],
      quantity: selection.quantity,
      unitPrice,
      total: unitPrice * selection.quantity
    };
    cart.push(item);
    closeProduct();
    renderFloatingBar();
    showToast(`${item.name} added to your order.`);
  }

  function renderFloatingBar() {
    if (activeOrder) {
      const step = statusStep();
      cartFloatLabel.textContent = step?.label.toUpperCase() || 'ACTIVE ORDER';
      cartFloatSummary.textContent = `${activeOrder.number} • ${step?.headline || 'Track your order'}`;
      viewCartButton.textContent = 'Track order →';
      viewCartButton.dataset.mode = 'status';
      cartFloat.classList.add('show', 'active-order-float');
      return;
    }

    cartFloat.classList.remove('active-order-float');
    const count = totalCartItems();
    if (!count) {
      cartFloat.classList.remove('show');
      return;
    }
    cartFloatLabel.textContent = 'YOUR ORDER';
    cartFloatSummary.textContent = `${count} ${count === 1 ? 'item' : 'items'} • ${peso(cartTotal())}`;
    viewCartButton.textContent = 'View cart →';
    viewCartButton.dataset.mode = 'cart';
    cartFloat.classList.add('show');
  }

  function cartItemDescription(item) {
    const parts = [item.temperature, item.size, ...item.addons].filter(Boolean);
    return parts.length ? parts.join(' • ') : 'Sueño standard preparation';
  }

  function renderCart() {
    const count = totalCartItems();
    cartOverlay.innerHTML = `
      <div class="overlay-topbar">
        <button class="overlay-back" type="button" id="closeCartButton" aria-label="Back">‹</button>
        <div class="overlay-title"><small>SUEÑO ORDER</small><strong>Your cart</strong></div>
        <span class="pill">${count} ${count === 1 ? 'ITEM' : 'ITEMS'}</span>
      </div>
      ${cart.length ? `
        <div class="cart-list">
          ${cart.map((item) => `
            <article class="cart-line">
              <div class="cart-line-icon">${item.icon}</div>
              <div class="cart-line-copy"><h3>${item.name} × ${item.quantity}</h3><p>${cartItemDescription(item)}</p><button type="button" data-remove-cart="${item.id}">Remove</button></div>
              <strong class="cart-line-price">${peso(item.total)}</strong>
            </article>`).join('')}
        </div>
        <div class="summary-card">
          <div class="summary-row"><span>Subtotal</span><strong>${peso(cartTotal())}</strong></div>
          <div class="summary-row"><span>Service fee</span><strong>₱0</strong></div>
          <div class="summary-row total"><span>Total</span><strong>${peso(cartTotal())}</strong></div>
        </div>
        <button type="button" class="checkout-button" id="continueCheckoutButton">Continue to checkout • ${peso(cartTotal())}</button>` : `
        <div class="cart-empty"><div class="cart-empty-icon">☕</div><h2>Your next favorite is waiting.</h2><p>Add a drink from the Sueño menu to start an order.</p><button type="button" class="checkout-button" id="emptyBrowseButton">Browse the menu</button></div>`}
    `;

    cartOverlay.querySelector('#closeCartButton')?.addEventListener('click', closeCart);
    cartOverlay.querySelector('#continueCheckoutButton')?.addEventListener('click', openCheckout);
    cartOverlay.querySelector('#emptyBrowseButton')?.addEventListener('click', () => {
      closeCart();
      document.querySelector('[data-nav="menu"]')?.click();
    });
    cartOverlay.querySelectorAll('[data-remove-cart]').forEach((button) => button.addEventListener('click', () => {
      cart = cart.filter((item) => item.id !== button.dataset.removeCart);
      renderFloatingBar();
      renderCart();
    }));
  }

  function openCart() {
    renderCart();
    setOpen(cartOverlay, true);
  }

  function closeCart() {
    setOpen(cartOverlay, false);
  }

  function getPickupTimes() {
    const now = new Date();
    const results = [{ label: 'ASAP • ~15 min', value: 'ASAP • ~15 min' }];
    const rounded = new Date(now);
    rounded.setSeconds(0, 0);
    rounded.setMinutes(Math.ceil((rounded.getMinutes() + 15) / 15) * 15);
    for (let i = 0; i < 3; i += 1) {
      const time = new Date(rounded.getTime() + i * 15 * 60 * 1000);
      const label = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      results.push({ label, value: label });
    }
    return results;
  }

  function paymentOptions() {
    if (fulfillment === 'delivery') {
      return [
        ['Cash on delivery', 'Pay when your order arrives'],
        ['GCash', 'Digital payment • demo'],
        ['Maya', 'Digital payment • demo'],
        ['Card', 'Debit or credit • demo']
      ];
    }
    return [
      ['Pay at counter', 'Pay when you arrive'],
      ['GCash', 'Digital payment • demo'],
      ['Maya', 'Digital payment • demo'],
      ['Card', 'Debit or credit • demo']
    ];
  }

  function renderCheckout() {
    const drinkCount = qualifyingDrinkCount();
    const projectedStamps = Math.min(10, currentStamps + drinkCount);
    const pickupTimes = getPickupTimes();
    const options = paymentOptions();
    if (!options.some(([name]) => name === payment)) payment = options[0][0];
    if (!pickupTimes.some((time) => time.value === pickupTime)) pickupTime = pickupTimes[0].value;

    checkoutOverlay.innerHTML = `
      <div class="overlay-topbar">
        <button class="overlay-back" type="button" id="backToCartButton" aria-label="Back to cart">‹</button>
        <div class="overlay-title"><small>FINAL STEP</small><strong>Checkout</strong></div>
        <strong>${peso(cartTotal())}</strong>
      </div>
      <div class="checkout-intro"><p class="eyebrow">SUEÑO ORDER</p><h1>How would you like your coffee?</h1><p>Choose how you want to receive your order. This prototype does not process a real payment.</p></div>
      <div class="checkout-card">
        <h3>Order type</h3>
        <div class="fulfillment-grid">
          <button class="checkout-choice ${fulfillment === 'pickup' ? 'selected' : ''}" type="button" data-fulfillment="pickup"><strong>☕ Pickup</strong><small>Collect at Sueño.</small></button>
          <button class="checkout-choice ${fulfillment === 'dine-in' ? 'selected' : ''}" type="button" data-fulfillment="dine-in"><strong>⌂ Dine-in</strong><small>Prepared for your table.</small></button>
          <button class="checkout-choice delivery-choice ${fulfillment === 'delivery' ? 'selected' : ''}" type="button" data-fulfillment="delivery"><strong>🛵 Delivery</strong><small>Track it until it reaches you.</small></button>
        </div>
      </div>
      ${fulfillment === 'pickup' ? `
        <div class="checkout-card"><h3>Pickup time</h3><div class="time-grid">
          ${pickupTimes.map((time) => `<button class="checkout-choice ${pickupTime === time.value ? 'selected' : ''}" type="button" data-pickup-time="${time.value}"><strong>${time.label}</strong><small>${time.value.startsWith('ASAP') ? 'Fastest available' : 'Schedule pickup'}</small></button>`).join('')}
        </div></div>` : ''}
      ${fulfillment === 'delivery' ? `
        <div class="checkout-card"><h3>Delivery address</h3><label class="delivery-field"><span>Deliver to</span><input id="deliveryAddressInput" type="text" value="${deliveryAddress.replace(/"/g, '&quot;')}" placeholder="Enter delivery address" /></label><p class="field-note">Demo field only. A real version would validate service area and delivery fees.</p></div>` : ''}
      <div class="checkout-card"><h3>Payment</h3><div class="payment-list">
        ${options.map(([name, note]) => `<button class="payment-choice ${payment === name ? 'selected' : ''}" type="button" data-payment="${name}"><strong>${name}</strong><small>${note}</small></button>`).join('')}
      </div></div>
      <div class="loyalty-checkout-card"><h3>Your Sueño Rewards</h3><p>You currently have ${currentStamps} / 10 stamps. This order includes ${drinkCount} qualifying ${drinkCount === 1 ? 'drink' : 'drinks'}.</p><div class="loyalty-progress-mini"><span>Pending after completion</span><strong>+${drinkCount} ${drinkCount === 1 ? 'stamp' : 'stamps'} → ${projectedStamps} / 10</strong></div></div>
      <div class="summary-card"><div class="summary-row"><span>${totalCartItems()} ${totalCartItems() === 1 ? 'item' : 'items'}</span><strong>${peso(cartTotal())}</strong></div><div class="summary-row total"><span>Total</span><strong>${peso(cartTotal())}</strong></div></div>
      <button type="button" class="place-order-button" id="placeOrderButton">Place demo order • ${peso(cartTotal())}</button>
      <p class="demo-payment-note">Presentation prototype only • No real order or payment will be submitted.</p>
    `;

    checkoutOverlay.querySelector('#backToCartButton')?.addEventListener('click', () => {
      setOpen(checkoutOverlay, false);
      openCart();
    });
    checkoutOverlay.querySelectorAll('[data-fulfillment]').forEach((button) => button.addEventListener('click', () => {
      fulfillment = button.dataset.fulfillment;
      renderCheckout();
    }));
    checkoutOverlay.querySelectorAll('[data-pickup-time]').forEach((button) => button.addEventListener('click', () => {
      pickupTime = button.dataset.pickupTime;
      renderCheckout();
    }));
    checkoutOverlay.querySelectorAll('[data-payment]').forEach((button) => button.addEventListener('click', () => {
      payment = button.dataset.payment;
      renderCheckout();
    }));
    checkoutOverlay.querySelector('#deliveryAddressInput')?.addEventListener('input', (event) => {
      deliveryAddress = event.target.value;
    });
    checkoutOverlay.querySelector('#placeOrderButton')?.addEventListener('click', placeOrder);
  }

  function openCheckout() {
    if (!cart.length || activeOrder) return;
    setOpen(cartOverlay, false);
    renderCheckout();
    setOpen(checkoutOverlay, true);
  }

  function updateLoyaltyUI(newStampCount) {
    currentStamps = Math.min(10, newStampCount);
    localStorage.setItem(STAMPS_KEY, String(currentStamps));
    const remaining = Math.max(0, 10 - currentStamps);
    const homeCount = document.querySelector('.loyalty-card h2');
    if (homeCount) homeCount.innerHTML = `${currentStamps} <small>/ 10 stamps</small>`;
    const homeMessage = document.querySelector('.loyalty-footer p');
    if (homeMessage) homeMessage.innerHTML = remaining
      ? `<strong>${remaining} more ${remaining === 1 ? 'drink' : 'drinks'}</strong> until your free coffee.`
      : '<strong>Reward unlocked!</strong> Your free coffee is ready.';

    document.querySelectorAll('.stamp-grid .stamp').forEach((stamp, index) => {
      stamp.classList.toggle('earned', index < currentStamps);
      if (index < currentStamps) stamp.textContent = index === 9 ? '★' : '☕';
      else stamp.textContent = index === 9 ? '★' : String(index + 1);
    });

    const ringStrong = document.querySelector('.reward-ring-inner strong');
    if (ringStrong) ringStrong.textContent = String(currentStamps);
    document.querySelector('.reward-ring')?.setAttribute('aria-label', `${currentStamps * 10} percent progress`);
    const rewardCopy = document.querySelector('.reward-progress-card p');
    if (rewardCopy) rewardCopy.textContent = remaining
      ? `Just ${remaining} more qualifying ${remaining === 1 ? 'drink' : 'drinks'} to unlock your next reward.`
      : 'You unlocked a free handcrafted drink.';
    const profileStamp = document.querySelector('.stats-grid .stat-card:first-child strong');
    if (profileStamp) profileStamp.textContent = String(currentStamps);
    const qrProgress = document.querySelector('.qr-points strong');
    if (qrProgress) qrProgress.textContent = `${currentStamps} / 10 stamps`;
  }

  function placeOrder() {
    if (!cart.length || activeOrder) return;
    if (fulfillment === 'delivery' && !deliveryAddress.trim()) {
      showToast('Add a delivery address first.');
      return;
    }

    const drinkCount = qualifyingDrinkCount();
    const orderNumber = `SUE-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const total = cartTotal();
    const itemCount = totalCartItems();
    const digitalPayment = !['Pay at counter', 'Cash on delivery'].includes(payment);

    activeOrder = {
      number: orderNumber,
      createdAt: Date.now(),
      fulfillment,
      pickupTime: fulfillment === 'pickup' ? pickupTime : null,
      deliveryAddress: fulfillment === 'delivery' ? deliveryAddress.trim() : null,
      payment,
      paymentStatus: digitalPayment ? 'Paid • demo' : 'Payment due',
      statusKey: 'received',
      items: cart.map((item) => ({ ...item })),
      itemCount,
      total,
      pendingStamps: drinkCount
    };

    persistActiveOrder();
    cart = [];
    setOpen(checkoutOverlay, false);
    renderFloatingBar();

    confirmationCard.innerHTML = `
      <div class="confirmation-icon">✓</div>
      <span class="pill">ORDER RECEIVED</span>
      <h2>Your order stays with you now.</h2>
      <p>${fulfillment === 'delivery'
        ? 'Track your delivery from confirmation until it reaches you.'
        : fulfillment === 'pickup'
          ? `Track this order until Sueño marks it completed at the counter${pickupTime ? ` • ${pickupTime}` : ''}.`
          : 'Track this order until Sueño marks your dine-in order completed.'}</p>
      <div class="order-number"><strong>${orderNumber}</strong> • ${peso(total)} • ${payment}</div>
      <div class="confirmation-reward"><strong>+${drinkCount} ${drinkCount === 1 ? 'stamp' : 'stamps'} pending</strong><span>Rewards are added when the order is actually completed.</span></div>
      <button type="button" id="trackNewOrderButton">Track order</button>
      <button type="button" class="confirmation-secondary" id="closeNewOrderButton">Back to Sueño</button>
    `;
    setOpen(confirmationBackdrop, true);

    confirmationCard.querySelector('#trackNewOrderButton')?.addEventListener('click', () => {
      setOpen(confirmationBackdrop, false);
      openOrderStatus();
    });
    confirmationCard.querySelector('#closeNewOrderButton')?.addEventListener('click', () => {
      setOpen(confirmationBackdrop, false);
      document.querySelector('.brand[data-nav="home"]')?.click();
    });
  }

  function orderTypeLabel(order) {
    if (order.fulfillment === 'delivery') return 'Delivery';
    if (order.fulfillment === 'dine-in') return 'Dine-in';
    return 'Pickup';
  }

  function renderOrderStatus() {
    if (!activeOrder) {
      orderStatusOverlay.innerHTML = '';
      setOpen(orderStatusOverlay, false);
      return;
    }

    const flow = statusFlows[activeOrder.fulfillment];
    const currentIndex = Math.max(0, flow.findIndex((step) => step.key === activeOrder.statusKey));
    const step = flow[currentIndex];
    const nextStep = flow[currentIndex + 1];
    const paymentDue = ['Pay at counter', 'Cash on delivery'].includes(activeOrder.payment);

    orderStatusOverlay.innerHTML = `
      <div class="overlay-topbar">
        <button class="overlay-back" type="button" id="closeStatusButton" aria-label="Back">‹</button>
        <div class="overlay-title"><small>ACTIVE ORDER</small><strong>${activeOrder.number}</strong></div>
        <span class="live-order-pill">LIVE</span>
      </div>

      <section class="status-hero">
        <div class="status-icon">${step.icon}</div>
        <p class="eyebrow">${step.label.toUpperCase()}</p>
        <h1>${step.headline}</h1>
        <p>${step.detail}</p>
        <div class="status-meta-row"><span>${orderTypeLabel(activeOrder)}</span><span>${peso(activeOrder.total)}</span></div>
      </section>

      <section class="order-progress-card">
        <div class="section-mini-heading"><strong>Order progress</strong><span>${currentIndex + 1} of ${flow.length - 1}</span></div>
        <div class="order-timeline">
          ${flow.filter((item) => !item.final).map((item, index) => `
            <div class="timeline-step ${index < currentIndex ? 'done' : ''} ${index === currentIndex ? 'current' : ''}">
              <span class="timeline-dot">${index < currentIndex ? '✓' : ''}</span>
              <div><strong>${item.label}</strong><small>${index < currentIndex ? 'Completed' : index === currentIndex ? 'Current status' : 'Waiting'}</small></div>
            </div>`).join('')}
        </div>
      </section>

      <section class="status-info-grid">
        <div class="status-info-card"><small>PAYMENT</small><strong>${activeOrder.paymentStatus}</strong><span>${activeOrder.payment}</span></div>
        <div class="status-info-card"><small>ORDER TYPE</small><strong>${orderTypeLabel(activeOrder)}</strong><span>${activeOrder.fulfillment === 'pickup' ? activeOrder.pickupTime : activeOrder.fulfillment === 'delivery' ? 'To your address' : 'At Sueño'}</span></div>
      </section>

      ${activeOrder.deliveryAddress ? `<section class="status-address"><small>DELIVER TO</small><strong>${activeOrder.deliveryAddress}</strong></section>` : ''}

      <section class="status-items-card">
        <div class="section-mini-heading"><strong>Your order</strong><span>${activeOrder.itemCount} ${activeOrder.itemCount === 1 ? 'item' : 'items'}</span></div>
        ${activeOrder.items.map((item) => `<div class="status-item"><span>${item.icon}</span><div><strong>${item.name} × ${item.quantity}</strong><small>${cartItemDescription(item)}</small></div><b>${peso(item.total)}</b></div>`).join('')}
      </section>

      <section class="pending-reward-card"><span>★</span><div><strong>+${activeOrder.pendingStamps} ${activeOrder.pendingStamps === 1 ? 'stamp' : 'stamps'} pending</strong><small>Added to your Sueño Rewards after this order is completed.</small></div></section>

      <section class="demo-staff-card">
        <span class="demo-badge">PRESENTATION CONTROL</span>
        <h3>Simulate the Sueño staff side</h3>
        <p>In the real system, these status changes come from the Sueño admin dashboard. For this demo, use the button below to show the complete customer journey.</p>
        ${nextStep ? `<button type="button" class="demo-advance-button" id="advanceOrderButton">${nextStep.final ? step.action || 'Complete order' : step.action || `Move to ${nextStep.label}`} →</button>` : ''}
        <button type="button" class="demo-reset-button" id="resetOrderButton">Reset active demo order</button>
      </section>
    `;

    orderStatusOverlay.querySelector('#closeStatusButton')?.addEventListener('click', () => setOpen(orderStatusOverlay, false));
    orderStatusOverlay.querySelector('#advanceOrderButton')?.addEventListener('click', advanceOrderStatus);
    orderStatusOverlay.querySelector('#resetOrderButton')?.addEventListener('click', resetActiveOrder);

    if (paymentDue && currentIndex > 0) {
      // Payment remains visibly separate from fulfillment until final completion.
    }
  }

  function openOrderStatus() {
    if (!activeOrder) return;
    renderOrderStatus();
    setOpen(orderStatusOverlay, true);
  }

  function advanceOrderStatus() {
    if (!activeOrder) return;
    const flow = statusFlows[activeOrder.fulfillment];
    const currentIndex = Math.max(0, flow.findIndex((step) => step.key === activeOrder.statusKey));
    const nextStep = flow[currentIndex + 1];
    if (!nextStep) return;

    if (nextStep.final) {
      completeActiveOrder(nextStep);
      return;
    }

    activeOrder.statusKey = nextStep.key;
    persistActiveOrder();
    renderFloatingBar();
    renderOrderStatus();
    showToast(`Order updated: ${nextStep.label}.`);
  }

  function completeActiveOrder(finalStep) {
    if (!activeOrder) return;
    const finishedOrder = { ...activeOrder, statusKey: finalStep.key };
    const previousStamps = currentStamps;
    const newStamps = Math.min(10, previousStamps + (activeOrder.pendingStamps || 0));
    const rewardUnlocked = previousStamps < 10 && newStamps >= 10;

    if (['Pay at counter', 'Cash on delivery'].includes(activeOrder.payment)) {
      finishedOrder.paymentStatus = activeOrder.payment === 'Pay at counter' ? 'Paid at counter' : 'Paid on delivery';
    }

    updateLoyaltyUI(newStamps);
    activeOrder = null;
    persistActiveOrder();
    setOpen(orderStatusOverlay, false);
    renderFloatingBar();

    confirmationCard.innerHTML = `
      <div class="confirmation-icon">★</div>
      <span class="pill">${finalStep.label.toUpperCase()}</span>
      <h2>${finalStep.headline}</h2>
      <p>${finalStep.detail} The active-order bar is now cleared because fulfillment is complete.</p>
      <div class="order-number"><strong>${finishedOrder.number}</strong> • ${peso(finishedOrder.total)} • ${finishedOrder.paymentStatus}</div>
      <div class="confirmation-reward"><strong>${rewardUnlocked ? '★ Free drink unlocked!' : `+${finishedOrder.pendingStamps} ${finishedOrder.pendingStamps === 1 ? 'stamp' : 'stamps'} added`}</strong><span>${newStamps} / 10 stamps ${rewardUnlocked ? '• Your reward is ready.' : `• ${Math.max(0, 10 - newStamps)} to go.`}</span></div>
      <button type="button" id="finishCompletedOrderButton">Back to Sueño</button>
    `;
    setOpen(confirmationBackdrop, true);
    confirmationCard.querySelector('#finishCompletedOrderButton')?.addEventListener('click', () => {
      setOpen(confirmationBackdrop, false);
      document.querySelector('.brand[data-nav="home"]')?.click();
    });
  }

  function resetActiveOrder() {
    if (!activeOrder) return;
    activeOrder = null;
    persistActiveOrder();
    setOpen(orderStatusOverlay, false);
    renderFloatingBar();
    showToast('Active demo order reset.');
  }

  document.querySelectorAll('.menu-item').forEach((item) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Customize ${item.dataset.name}`);
    item.addEventListener('click', () => openProduct(item.dataset.name));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProduct(item.dataset.name);
      }
    });
  });

  document.querySelectorAll('.drink-card').forEach((card) => {
    const name = card.querySelector('h3')?.textContent?.trim();
    if (!name || !catalog[name]) return;
    card.style.cursor = 'pointer';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Customize ${name}`);
    card.addEventListener('click', () => openProduct(name));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProduct(name);
      }
    });
  });

  viewCartButton?.addEventListener('click', () => {
    if (activeOrder || viewCartButton.dataset.mode === 'status') openOrderStatus();
    else openCart();
  });

  productBackdrop?.addEventListener('click', (event) => {
    if (event.target === productBackdrop) closeProduct();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (productBackdrop.classList.contains('open')) closeProduct();
    else if (confirmationBackdrop.classList.contains('open')) setOpen(confirmationBackdrop, false);
    else if (orderStatusOverlay.classList.contains('open')) setOpen(orderStatusOverlay, false);
    else if (checkoutOverlay.classList.contains('open')) setOpen(checkoutOverlay, false);
    else if (cartOverlay.classList.contains('open')) closeCart();
  });

  updateLoyaltyUI(currentStamps);
  renderFloatingBar();
})();