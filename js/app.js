// ========== APP ENTRY POINT ==========
import { loadState, getState, setState } from './core/state.js';
import { initRouter } from './core/router.js';
import { on } from './core/events.js';
import { initSidebar } from './components/sidebar.js';
import { renderPipelineNav, initPipeline, STEPS, goToStep, getCurrentStep } from './tabs/pipeline/pipeline-manager.js';
import { showModal } from './components/modal.js';
import { render as renderChat } from './components/chat.js';

// Step renderers — lazy loaded (match STEPS in pipeline-manager.js)
const stepRenderers = {
  market:    () => import('./tabs/pipeline/step0-market.js'),
  sourcing:  () => import('./tabs/pipeline/step1-sourcing.js'),
  analysis:  () => import('./tabs/pipeline/step2-analysis.js'),
  lists:     () => import('./tabs/pipeline/step3-lists.js'),
  scenario:  () => import('./tabs/pipeline/step4-scenario.js'),
  position:  () => import('./tabs/pipeline/step5-position.js'),
  journal:   () => import('./tabs/pipeline/step6-journal.js'),
  insights:  () => import('./tabs/pipeline/step7-insights.js')
};

// Tab renderers
const tabRenderers = {
  pipeline: renderPipelineTab,
  academy:  () => import('./tabs/academy.js').then(m => { const main = document.getElementById('main-content'); main.textContent = ''; m.render(main); }),
  glossary: () => import('./tabs/glossary.js').then(m => { const main = document.getElementById('main-content'); main.textContent = ''; m.render(main); }),
  dashboard:() => import('./tabs/dashboard.js').then(m => { const main = document.getElementById('main-content'); main.textContent = ''; m.render(main); })
};

// Render pipeline tab with step navigation + active step content
async function renderPipelineTab(subtab) {
  const main = document.getElementById('main-content');
  main.textContent = '';

  const layout = document.createElement('div');
  layout.className = 'pipeline-layout';
  layout.style.cssText = 'display:flex;gap:20px';

  // Step navigation sidebar
  const navCol = document.createElement('div');
  navCol.className = 'pipeline-nav-col';
  navCol.style.cssText = 'min-width:200px';
  renderPipelineNav(navCol);
  layout.appendChild(navCol);

  // Step content area
  const contentCol = document.createElement('div');
  contentCol.className = 'pipeline-content-col';
  contentCol.style.cssText = 'flex:1;min-width:0';
  contentCol.id = 'pipeline-content';
  layout.appendChild(contentCol);

  main.appendChild(layout);

  // Render active step
  const stepId = subtab || STEPS.find(s => s.num === getCurrentStep())?.id || 'market';
  const loader = stepRenderers[stepId];
  if (loader) {
    const mod = await loader();
    mod.render(contentCol);
  }
}

// Route change handler
function onRouteChange(route) {
  const renderer = tabRenderers[route.tab];
  if (renderer) {
    if (route.tab === 'pipeline') {
      renderer(route.subtab);
    } else {
      renderer();
    }
  }
}

// Settings modal
function openSettings() {
  const content = document.createElement('div');

  const fields = [
    { id: 'set-grok-key', label: 'Grok API Key', type: 'password', path: 'settings.grokKey' },
    { id: 'set-grok-model', label: 'Grok Model', type: 'select', options: ['grok-3-mini', 'grok-3'], path: 'settings.grokModel' },
    { id: 'set-currency', label: 'מטבע', type: 'select', options: ['USD', 'ILS', 'EUR'], path: 'settings.currency' }
  ];

  fields.forEach(f => {
    const group = document.createElement('div');
    group.style.marginBottom = '16px';
    const lbl = document.createElement('label');
    lbl.textContent = f.label;
    lbl.style.cssText = 'display:block;margin-bottom:6px;font-weight:500';
    group.appendChild(lbl);

    let input;
    if (f.type === 'select') {
      input = document.createElement('select');
      input.className = 'input';
      f.options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        input.appendChild(o);
      });
    } else {
      input = document.createElement('input');
      input.type = f.type;
      input.className = 'input';
      input.style.width = '100%';
    }
    input.id = f.id;
    input.value = getState(f.path) || '';
    input.addEventListener('change', () => setState(f.path, input.value));
    group.appendChild(input);
    content.appendChild(group);
  });

  showModal('\u2699 הגדרות', content);
}

// Floating chat widget
function initChatWidget() {
  const fab = document.createElement('button');
  fab.id = 'chat-fab';
  fab.className = 'chat-fab';
  fab.textContent = '\uD83D\uDCAC';
  fab.title = 'עוזר מקפצה';

  const panel = document.createElement('div');
  panel.id = 'chat-panel';
  panel.className = 'chat-panel';
  renderChat(panel);

  let open = false;
  fab.addEventListener('click', () => {
    open = !open;
    panel.classList.toggle('open', open);
    fab.textContent = open ? '\u2715' : '\uD83D\uDCAC';
  });

  document.body.appendChild(panel);
  document.body.appendChild(fab);
}

// Initialize app
function init() {
  loadState();
  initSidebar(document.getElementById('sidebar'));
  initPipeline();
  on('route:changed', onRouteChange);
  initRouter();
  initChatWidget();

  // Wire settings button
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
}

document.addEventListener('DOMContentLoaded', init);
