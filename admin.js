(() => {
  const ACTIVE_ORDER_KEY = 'sueno-demo-active-order-v2';
  const STAMPS_KEY = 'sueno-demo-stamps-v2';
  const MENU_KEY = 'sueno-demo-admin-menu-v1';
  const peso = (amount) => `₱${Number(amount).toLocaleString('en-PH')}`;

  const pageTitles = {
    dashboard: ['SUEÑO BUSINESS', 'Dashboard'],
    orders: ['LIVE OPERATIONS', 'Orders'],
    customers: ['CUSTOMER INTELLIGENCE', 'Customers'],
    'menu-admin': ['CATALOG CONTROL', 'Menu'],
    insights: ['BUSINESS INTELLIGENCE', 'Insights']
  };

  const statusFlows = {
    pickup: [
      { key: 'received', label: 'Order received', action: 'Accept order' },
      { key: 'accepted', label: 'Order accepted', action: 'Start preparing' },
      { key: 'preparing', label: 'Preparing', action: 'Mark ready' },
      { key: 'ready', label: 'Ready for pickup', action: 'Complete order' },
      { key: 'completed', label: 'Completed', final: true }
    ],
    'dine-in': [
      { key: 'received', label: 'Order received', action: 'Accept order' },
      { key: 'accepted', label: 'Order accepted', action: 'Start preparing' },
      { key: 'preparing', label: 'Preparing', action: 'Ready to serve' },
      { key: 'serving', label: 'Ready to serve', action: 'Complete order' },
      { key: 'completed', label: 'Completed', final: true }
    ],
    delivery: [
      { key: 'received', label: 'Order received', action: 'Accept order' },
      { key: 'accepted', label: 'Order accepted', action: 'Start preparing' },
      { key: 'preparing', label: 'Preparing', action: 'Assign rider' },
      { key: 'rider-assigned', label: 'Rider assigned', action: 'Out for delivery' },
      { key: 'out-for-delivery', label: 'Out for delivery', action: 'Mark delivered' },
      { key: 'delivered', label: 'Delivered', final: true }
    ]
  };

  const customerData = [
    { name: 'Max Emorej', email: 'max@example.com', visits: 12, stamps: 7, spend: 2480, last: 'Today' },
    { name: 'Anna Cruz', email: 'anna@example.com', visits: 26, stamps: 4, spend: 5920, last: '3 days ago' },
    { name: 'Miguel Santos', email: 'miguel@example.com', visits: 18, stamps: 9, spend: 4315, last: 'Yesterday' },
    { name: 'Jessa Lim', email: 'jessa@example.com', visits: 7, stamps: 2, spend: 1540, last: '5 days ago' },
    { name: 'Paolo Reyes', email: 'paolo@example.com', visits: 31, stamps: 6, spend: 7280, last: 'Today' },
    { name: 'Camille Tan', email: 'camille@example.com', visits: 5, stamps: 1, spend: 960, last: '12 days ago' }
  ];

  const defaultMenu = [
    { name: 'Spanish Latte', icon: '☕', category: 'Coffee', price: 165, available: true },
    { name: 'Sea Salt Caramel Latte', icon: '☕', category: 'Coffee', price: 175, available: true },
    { name: 'Iced Americano', icon: '☕', category: 'Coffee', price: 125, available: true },
    { name: 'Matcha Cloud', icon: '🍵', category: 'Non-coffee', price: 175, available: true },
    { name: 'Chocolate Dream', icon: '🥤', category: 'Non-coffee', price: 160, available: true },
    { name: 'Butter Croissant', icon: '🥐', category: 'Food', price: 110, available: true }
  ];

  let activeOrder = readActiveOrder();
  let menuData = readMenu();
  let toastTimer;

  function readActiveOrder() {
    try {
      return JSON.parse(localStorage.getItem(ACTIVE_ORDER_KEY) || 'null');
    } catch {
      localStorage.removeItem(ACTIVE_ORDER_KEY);
      return null;
    }
  }

  function readMenu() {
    try {
      const saved = JSON.parse(localStorage.getItem(MENU_KEY) || 'null');
      return Array.isArray(saved) ? saved : defaultMenu.map((item) => ({ ...item }));
    } catch {
      return defaultMenu.map((item) => ({ ...item }));
    }
  }

  function saveMenu() {
    localStorage.setItem(MENU_KEY, JSON.stringify(menuData));
  }

  function showToast(message) {
    const toast = document.getElementById('adminToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function navigate(pageId) {
    document.querySelectorAll('.admin-page').forEach((page) => page.classList.toggle('active', page.id === pageId));
    document.querySelectorAll('[data-admin-nav]').forEach((button) => button.classList.toggle('active', button.dataset.adminNav === pageId));
    const [kicker, title] = pageTitles[pageId] || pageTitles.dashboard;
    document.getElementById('topbarKicker').textContent = kicker;
    document.getElementById('topbarTitle').textContent = title;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pageId === 'orders') renderActiveOrders();
    if (pageId === 'customers') renderCustomers();
    if (pageId === 'menu-admin') renderMenu();
  }

  function orderFlow(order) {
    return statusFlows[order?.fulfillment] || statusFlows.pickup;
  }

  function currentStep(order) {
    const flow = orderFlow(order);
    return flow.find((step) => step.key === order?.statusKey) || flow[0];
  }

  function nextStep(order) {
    const flow = orderFlow(order);
    const index = Math.max(0, flow.findIndex((step) => step.key === order?.statusKey));
    return flow[index + 1] || null;
  }

  function orderAge(order) {
    const minutes = Math.max(0, Math.floor((Date.now() - Number(order.createdAt || Date.now())) / 60000));
    return minutes < 1 ? 'Just now' : `${minutes} min ago`;
  }

  function itemDescription(item) {
    return [item.temperature, item.size, ...(item.addons || [])].filter(Boolean).join(' • ') || 'Standard preparation';
  }

  function fulfillmentLabel(order) {
    if (order.fulfillment === 'delivery') return 'Delivery';
    if (order.fulfillment === 'dine-in') return 'Dine-in';
    return 'Pickup';
  }

  function activeOrderMarkup(order, compact = false) {
    if (!order) {
      return `
        <div class="empty-admin-order">
          <span>☕</span>
          <h4>No active customer order right now.</h4>
          <p>Place an order in the customer app, then come back here. It will appear in this panel automatically.</p>
        </div>`;
    }

    const step = currentStep(order);
    const next = nextStep(order);
    const customerName = 'Max';

    return `
      <article class="admin-order-card">
        <div class="admin-order-top">
          <div><strong class="order-number-badge">${order.number}</strong><span class="order-status-badge">${step.label}</span></div>
          <time>${orderAge(order)}</time>
        </div>
        <div class="admin-order-body">
          <div class="order-customer-line">
            <div><h4>${customerName}</h4><p>${fulfillmentLabel(order)} • ${order.paymentStatus || order.payment}</p></div>
            <strong>${peso(order.total)}</strong>
          </div>
          <div class="admin-order-items">
            ${(order.items || []).map((item) => `
              <div class="admin-order-item">
                <span>${item.icon || '☕'}</span>
                <div><b>${item.name} × ${item.quantity}</b><small>${itemDescription(item)}</small></div>
                <strong>${peso(item.total)}</strong>
              </div>`).join('')}
          </div>
          <div class="order-meta">
            <span>${fulfillmentLabel(order)}</span>
            ${order.pickupTime ? `<span>${order.pickupTime}</span>` : ''}
            ${order.deliveryAddress ? `<span>${order.deliveryAddress}</span>` : ''}
            <span>${order.payment}</span>
            <span>+${order.pendingStamps || 0} stamp${Number(order.pendingStamps || 0) === 1 ? '' : 's'} pending</span>
          </div>
          <div class="order-actions">
            ${next ? `<button class="order-primary" data-order-action="advance">${step.action || `Move to ${next.label}`} →</button>` : ''}
            ${compact ? `<button class="order-secondary" data-admin-nav="orders">Open order</button>` : `<button class="order-secondary" id="openCustomerPreview">Customer view</button>`}
          </div>
        </div>
      </article>`;
  }

  function renderDashboardOrder() {
    const root = document.getElementById('dashboardActiveOrder');
    if (root) root.innerHTML = activeOrderMarkup(activeOrder, true);
    bindDynamicActions(root);
    updateOrderBadges();
  }

  function renderActiveOrders() {
    const root = document.getElementById('ordersActiveOrder');
    if (root) root.innerHTML = activeOrderMarkup(activeOrder, false);
    const count = document.getElementById('activeOrderCount');
    if (count) count.textContent = activeOrder ? '1' : '0';
    bindDynamicActions(root);
    updateOrderBadges();
  }

  function bindDynamicActions(root) {
    if (!root) return;
    root.querySelector('[data-order-action="advance"]')?.addEventListener('click', advanceOrder);
    root.querySelectorAll('[data-admin-nav]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.adminNav)));
    root.querySelector('#openCustomerPreview')?.addEventListener('click', () => { window.location.href = 'index.html'; });
  }

  function advanceOrder() {
    activeOrder = readActiveOrder();
    if (!activeOrder) {
      showToast('No active order to update.');
      renderAllOrderViews();
      return;
    }

    const flow = orderFlow(activeOrder);
    const index = Math.max(0, flow.findIndex((step) => step.key === activeOrder.statusKey));
    const next = flow[index + 1];
    if (!next) return;

    if (next.final) {
      completeOrder(next);
      return;
    }

    activeOrder.statusKey = next.key;
    localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(activeOrder));
    showToast(`Order updated: ${next.label}`);
    renderAllOrderViews();
  }

  function completeOrder(finalStep) {
    if (!activeOrder) return;
    const pending = Number(activeOrder.pendingStamps || 0);
    const oldStamps = Number.parseInt(localStorage.getItem(STAMPS_KEY) || '7', 10) || 7;
    const newStamps = Math.min(10, oldStamps + pending);
    localStorage.setItem(STAMPS_KEY, String(newStamps));
    localStorage.setItem('sueno-demo-last-completed-order-v1', JSON.stringify({ ...activeOrder, statusKey: finalStep.key, completedAt: Date.now() }));
    localStorage.removeItem(ACTIVE_ORDER_KEY);
    activeOrder = null;
    showToast(`Order completed • +${pending} stamp${pending === 1 ? '' : 's'} awarded`);
    renderAllOrderViews();
  }

  function renderAllOrderViews() {
    activeOrder = readActiveOrder();
    renderDashboardOrder();
    renderActiveOrders();
  }

  function updateOrderBadges() {
    ['sideOrderBadge', 'mobileOrderBadge'].forEach((id) => {
      const badge = document.getElementById(id);
      if (!badge) return;
      badge.textContent = activeOrder ? '1' : '0';
      badge.classList.toggle('show', Boolean(activeOrder));
    });
  }

  function renderCustomers(filter = '') {
    const root = document.getElementById('customerTable');
    if (!root) return;
    const query = filter.trim().toLowerCase();
    const rows = customerData.filter((customer) => !query || customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query));
    root.innerHTML = `
      <div class="customer-row header"><span>CUSTOMER</span><span>VISITS</span><span>STAMPS</span><span>LIFETIME SPEND</span><span>LAST VISIT</span></div>
      ${rows.map((customer) => `
        <div class="customer-row">
          <div class="customer-name"><span class="customer-initial">${customer.name.charAt(0)}</span><span><strong>${customer.name}</strong><small>${customer.email}</small></span></div>
          <span>${customer.visits}</span><span>${customer.stamps}/10</span><strong>${peso(customer.spend)}</strong><span>${customer.last}</span>
        </div>`).join('')}`;
  }

  function renderMenu() {
    const root = document.getElementById('adminMenuList');
    if (!root) return;
    root.innerHTML = menuData.map((item, index) => `
      <div class="menu-admin-row">
        <div class="admin-product"><span class="admin-product-icon">${item.icon}</span><span><strong>${item.name}</strong><small>${item.category}</small></span></div>
        <span class="menu-price">${peso(item.price)}</span>
        <button class="availability-toggle ${item.available ? 'on' : ''}" data-menu-toggle="${index}"><i></i><span>${item.available ? 'Available' : 'Sold out'}</span></button>
        <button class="menu-edit" data-menu-edit="${index}">Edit</button>
      </div>`).join('');

    root.querySelectorAll('[data-menu-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.menuToggle);
        menuData[index].available = !menuData[index].available;
        saveMenu();
        renderMenu();
        showToast(`${menuData[index].name} is now ${menuData[index].available ? 'available' : 'sold out'}.`);
      });
    });

    root.querySelectorAll('[data-menu-edit]').forEach((button) => {
      button.addEventListener('click', () => showToast(`Edit ${menuData[Number(button.dataset.menuEdit)].name} • demo control`));
    });
  }

  document.querySelectorAll('[data-admin-nav]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.adminNav));
  });

  document.getElementById('returnCustomerButton')?.addEventListener('click', () => { window.location.href = 'index.html'; });
  document.getElementById('refreshAdminButton')?.addEventListener('click', () => {
    activeOrder = readActiveOrder();
    menuData = readMenu();
    renderAllOrderViews();
    renderMenu();
    showToast('Admin demo refreshed.');
  });

  document.getElementById('customerSearch')?.addEventListener('input', (event) => renderCustomers(event.target.value));

  document.querySelectorAll('[data-demo-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.demoAction;
      if (action === 'promotion') showToast('Promotion builder will be the next admin module.');
      if (action === 'add-product') showToast('Add-product flow is ready for the next build.');
    });
  });

  window.addEventListener('storage', (event) => {
    if ([ACTIVE_ORDER_KEY, STAMPS_KEY, MENU_KEY].includes(event.key)) {
      activeOrder = readActiveOrder();
      menuData = readMenu();
      renderAllOrderViews();
      renderMenu();
    }
  });

  renderDashboardOrder();
  renderActiveOrders();
  renderCustomers();
  renderMenu();
})();