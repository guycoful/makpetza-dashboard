// Step 6: Risk Assessment
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-risk';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{26A0}\u{FE0F} שלב 6 — הערכת סיכונים';
  wrap.appendChild(h2);

  const card = document.createElement('div');
  card.className = 'card';

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:16px';
  desc.textContent = 'זהה את הסיכונים המרכזיים ותכנן כיצד להתמודד איתם.';
  card.appendChild(desc);

  const fields = [
    { id: 'risk-operational', label: 'סיכונים תפעוליים', type: 'textarea' },
    { id: 'risk-regulatory', label: 'סיכונים רגולטוריים', type: 'textarea' },
    { id: 'risk-competitive', label: 'סיכונים תחרותיים', type: 'textarea' },
    { id: 'risk-macro', label: 'סיכוני מאקרו', type: 'textarea' },
    { id: 'risk-stop-loss', label: 'Stop Loss ($)', type: 'number' },
    { id: 'risk-position-size', label: 'גודל פוזיציה (% מהתיק)', type: 'number' },
    { id: 'risk-max-loss', label: 'הפסד מקסימלי ($)', type: 'number' }
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
  const stepData = getState('pipeline.steps.risk') || {};
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el && stepData[f.id]) el.value = stepData[f.id];
  });

  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 6 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    saveData();
    completeStep(6);
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

function saveData() { setState('pipeline.steps.risk', getData()); }
export function validate() { return true; }
export function getData() {
  const ids = ['risk-operational', 'risk-regulatory', 'risk-competitive', 'risk-macro', 'risk-stop-loss', 'risk-position-size', 'risk-max-loss'];
  const data = {};
  ids.forEach(id => { data[id] = document.getElementById(id)?.value || ''; });
  return data;
}
