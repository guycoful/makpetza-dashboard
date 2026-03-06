// Step 5: Valuation Models
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-valuation';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F4B0} שלב 5 — תמחור';
  wrap.appendChild(h2);

  const card = document.createElement('div');
  card.className = 'card';

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:16px';
  desc.textContent = 'הערך את שווי המניה ביחס למחיר הנוכחי. האם היא יקרה, הוגנת או זולה?';
  card.appendChild(desc);

  const fields = [
    { id: 'val-current-price', label: 'מחיר נוכחי ($)', type: 'number' },
    { id: 'val-fair-value', label: 'שווי הוגן מוערך ($)', type: 'number' },
    { id: 'val-method', label: 'שיטת הערכה', type: 'select', options: ['DCF', 'P/E Comparison', 'P/B Comparison', 'Dividend Discount', 'אחר'] },
    { id: 'val-margin', label: 'מרווח ביטחון (%)', type: 'number' },
    { id: 'val-notes', label: 'הערות', type: 'textarea' }
  ];

  fields.forEach(f => {
    const group = document.createElement('div');
    group.style.marginBottom = '16px';
    const lbl = document.createElement('label');
    lbl.textContent = f.label;
    lbl.htmlFor = f.id;
    lbl.style.cssText = 'display:block;margin-bottom:6px;font-weight:500';
    group.appendChild(lbl);

    let input;
    if (f.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 3;
      input.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
    } else if (f.type === 'select') {
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
    group.appendChild(input);
    card.appendChild(group);
  });

  wrap.appendChild(card);

  // Load saved data
  const stepData = getState('pipeline.steps.valuation') || {};
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el && stepData[f.id]) el.value = stepData[f.id];
  });

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 5 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    saveData();
    completeStep(5);
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

function saveData() { setState('pipeline.steps.valuation', getData()); }
export function validate() { return true; }
export function getData() {
  const ids = ['val-current-price', 'val-fair-value', 'val-method', 'val-margin', 'val-notes'];
  const data = {};
  ids.forEach(id => { data[id] = document.getElementById(id)?.value || ''; });
  return data;
}
