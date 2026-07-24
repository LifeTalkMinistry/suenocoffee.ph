const pages = [...document.querySelectorAll('.page')];
const navButtons = [...document.querySelectorAll('[data-nav]')];
const bottomNavItems = [...document.querySelectorAll('.bottom-nav [data-nav]')];

function navigateTo(pageId) {
  const target = document.getElementById(pageId);
  if (!target) return;

  pages.forEach((page) => page.classList.toggle('active', page.id === pageId));
  bottomNavItems.forEach((item) => item.classList.toggle('active', item.dataset.nav === pageId));

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => navigateTo(button.dataset.nav));
});

const qrModal = document.getElementById('qrModal');
const qrGrid = document.getElementById('qrGrid');
const qrOpeners = [
  document.getElementById('showQrButton'),
  document.getElementById('navQrButton'),
  document.getElementById('profileQrButton')
].filter(Boolean);
const closeQrButton = document.getElementById('closeQrButton');

function makeDemoQr() {
  if (!qrGrid || qrGrid.children.length) return;

  const size = 15;
  const finderCells = new Set();
  const finderOrigins = [
    [0, 0],
    [0, 8],
    [8, 0]
  ];

  finderOrigins.forEach(([rowStart, colStart]) => {
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const border = row === 0 || row === 6 || col === 0 || col === 6;
        const center = row >= 2 && row <= 4 && col >= 2 && col <= 4;
        if (border || center) finderCells.add(`${rowStart + row}-${colStart + col}`);
      }
    }
  });

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const cell = document.createElement('span');
      const key = `${row}-${col}`;
      const deterministicNoise = ((row * 17 + col * 31 + row * col * 7) % 11) < 5;
      cell.className = `qr-cell${finderCells.has(key) || deterministicNoise ? ' dark' : ''}`;
      qrGrid.appendChild(cell);
    }
  }
}

function openQr() {
  makeDemoQr();
  qrModal.classList.add('open');
  qrModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeQr() {
  qrModal.classList.remove('open');
  qrModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

qrOpeners.forEach((button) => button.addEventListener('click', openQr));
closeQrButton?.addEventListener('click', closeQr);
qrModal?.addEventListener('click', (event) => {
  if (event.target === qrModal) closeQr();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && qrModal?.classList.contains('open')) closeQr();
});

const categoryTabs = document.getElementById('categoryTabs');
const menuSearch = document.getElementById('menuSearch');
const menuItems = [...document.querySelectorAll('.menu-item')];
const menuEmpty = document.getElementById('menuEmpty');
let activeCategory = 'all';

function filterMenu() {
  const query = (menuSearch?.value || '').trim().toLowerCase();
  let visibleCount = 0;

  menuItems.forEach((item) => {
    const matchesCategory = activeCategory === 'all' || item.dataset.category === activeCategory;
    const matchesSearch = !query || item.dataset.name.toLowerCase().includes(query) || item.textContent.toLowerCase().includes(query);
    const visible = matchesCategory && matchesSearch;
    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (menuEmpty) menuEmpty.style.display = visibleCount ? 'none' : 'block';
}

categoryTabs?.addEventListener('click', (event) => {
  const button = event.target.closest('.category');
  if (!button) return;

  activeCategory = button.dataset.category;
  document.querySelectorAll('.category').forEach((tab) => tab.classList.toggle('active', tab === button));
  filterMenu();
});

menuSearch?.addEventListener('input', filterMenu);

const notificationButton = document.getElementById('notificationButton');
const toast = document.getElementById('toast');
let toastTimer;

notificationButton?.addEventListener('click', () => {
  if (!toast) return;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
});

const orderingScript = document.createElement('script');
orderingScript.src = 'ordering.js';
document.body.appendChild(orderingScript);
