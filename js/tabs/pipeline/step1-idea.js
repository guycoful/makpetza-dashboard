// Step 1: Stock Idea & Thesis
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-idea';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F4A1} שלב 1 — רעיון השקעה';
  wrap.appendChild(h2);

  const card = document.createElement('div');
  card.className = 'card';

  // Ticker input
  const tickerGroup = createField('ticker-input', 'Ticker (סימול מניה)', 'text', 'למשל: AAPL, MSFT, GOOGL');
  card.appendChild(tickerGroup);

  // Thesis
  const thesisGroup = createTextarea('idea-thesis', 'תזת השקעה', 'למה המניה הזו מעניינת? מה הפוטנציאל?');
  card.appendChild(thesisGroup);

  // Source
  const sourceGroup = createField('idea-source', 'מקור הרעיון', 'text', 'Finviz, חדשות, המלצה, מחקר עצמי...');
  card.appendChild(sourceGroup);

  // Time horizon
  const horizonGroup = createSelect('idea-horizon', 'אופק השקעה', ['קצר (ימים-שבועות)', 'בינוני (חודשים)', 'ארוך (שנים)']);
  card.appendChild(horizonGroup);

  // Load saved data
  const stepData = getState('pipeline.steps.idea') || {};
  if (stepData.ticker) tickerGroup.querySelector('input').value = stepData.ticker;
  if (stepData.thesis) thesisGroup.querySelector('textarea').value = stepData.thesis;
  if (stepData.source) sourceGroup.querySelector('input').value = stepData.source;
  if (stepData.horizon) horizonGroup.querySelector('select').value = stepData.horizon;

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 1 ועבור הלאה';
  btn.style.marginTop = '20px';
  btn.addEventListener('click', () => {
    if (validate()) {
      saveData();
      completeStep(1);
    }
  });
  card.appendChild(btn);

  wrap.appendChild(card);
  container.appendChild(wrap);
}

function saveData() {
  const data = getData();
  setState('pipeline.steps.idea', data);
  setState('currentTicker', data.ticker);
}

export function validate() {
  const ticker = document.getElementById('ticker-input');
  const thesis = document.getElementById('idea-thesis');
  if (!ticker || !ticker.value.trim()) { alert('הזן Ticker'); return false; }
  if (!thesis || !thesis.value.trim()) { alert('כתוב תזת השקעה'); return false; }
  return true;
}

export function getData() {
  return {
    ticker: (document.getElementById('ticker-input')?.value || '').toUpperCase().trim(),
    thesis: document.getElementById('idea-thesis')?.value || '',
    source: document.getElementById('idea-source')?.value || '',
    horizon: document.getElementById('idea-horizon')?.value || ''
  };
}

// Helper: create input field
function createField(id, label, type, placeholder) {
  const group = document.createElement('div');
  group.style.marginBottom = '16px';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  lbl.htmlFor = id;
  lbl.style.cssText = 'display:block;margin-bottom:6px;font-weight:500';
  group.appendChild(lbl);
  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.placeholder = placeholder || '';
  input.className = 'input';
  input.style.width = '100%';
  group.appendChild(input);
  return group;
}

// Helper: create textarea
function createTextarea(id, label, placeholder) {
  const group = document.createElement('div');
  group.style.marginBottom = '16px';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  lbl.htmlFor = id;
  lbl.style.cssText = 'display:block;margin-bottom:6px;font-weight:500';
  group.appendChild(lbl);
  const ta = document.createElement('textarea');
  ta.id = id;
  ta.placeholder = placeholder || '';
  ta.rows = 4;
  ta.style.cssText = 'width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text1);resize:vertical';
  group.appendChild(ta);
  return group;
}

// Helper: create select
function createSelect(id, label, options) {
  const group = document.createElement('div');
  group.style.marginBottom = '16px';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  lbl.htmlFor = id;
  lbl.style.cssText = 'display:block;margin-bottom:6px;font-weight:500';
  group.appendChild(lbl);
  const sel = document.createElement('select');
  sel.id = id;
  sel.className = 'input';
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    sel.appendChild(o);
  });
  group.appendChild(sel);
  return group;
}
