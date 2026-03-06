// ========== SIDEBAR COMPONENT ==========
import { navigate, getCurrentRoute } from '../core/router.js';
import { on } from '../core/events.js';

const TABS = [
  { id: 'pipeline', icon: '\u{1F527}', label: 'קו ייצור' },
  { id: 'academy',  icon: '\u{1F393}', label: 'אקדמיה' },
  { id: 'glossary', icon: '\u{1F4DA}', label: 'מילון מושגים' },
  { id: 'dashboard', icon: '\u{1F3E0}', label: 'דשבורד' }
];

function createButton(tab) {
  const btn = document.createElement('button');
  btn.dataset.tab = tab.id;
  const iconSpan = document.createElement('span');
  iconSpan.className = 'icon';
  iconSpan.textContent = tab.icon;
  const labelSpan = document.createElement('span');
  labelSpan.textContent = tab.label;
  btn.appendChild(iconSpan);
  btn.appendChild(labelSpan);
  return btn;
}

export function initSidebar(container) {
  // Logo
  const logo = document.createElement('div');
  logo.className = 'logo';
  const h2 = document.createElement('h2');
  h2.textContent = 'מקפצה פיננסית';
  const small = document.createElement('small');
  small.textContent = 'דשבורד השקעות';
  logo.appendChild(h2);
  logo.appendChild(small);
  container.appendChild(logo);

  // Navigation
  const nav = document.createElement('nav');
  TABS.forEach(tab => {
    const btn = createButton(tab);
    btn.addEventListener('click', () => navigate(tab.id));
    nav.appendChild(btn);
  });
  container.appendChild(nav);

  // Bottom section: Guide + Settings
  const bottomDiv = document.createElement('div');
  bottomDiv.className = 'bottom-section';
  bottomDiv.style.cssText = 'padding:12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:6px';

  const guideLink = document.createElement('a');
  guideLink.href = 'guide.html';
  guideLink.className = 'btn btn-outline btn-sm';
  guideLink.style.cssText = 'width:100%;text-align:center;text-decoration:none;display:block';
  guideLink.textContent = '\u{1F4D6} מדריך למשתמש';
  bottomDiv.appendChild(guideLink);

  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'btn btn-outline btn-sm';
  settingsBtn.style.width = '100%';
  settingsBtn.id = 'settings-btn';
  settingsBtn.textContent = '\u2699 הגדרות';
  bottomDiv.appendChild(settingsBtn);
  container.appendChild(bottomDiv);

  // Update active state on route change
  on('route:changed', (route) => {
    nav.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === route.tab);
    });
  });

  // Set initial active
  const route = getCurrentRoute();
  nav.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === route.tab);
  });
}
