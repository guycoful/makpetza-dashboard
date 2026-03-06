// Step 4: Technical Analysis (manual slider + notes)
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-technical';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F4C8} שלב 4 — ניתוח טכני';
  wrap.appendChild(h2);

  const card = document.createElement('div');
  card.className = 'card';

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:16px';
  desc.textContent = 'נתח את הגרף (מגמה, תמיכה/התנגדות, אינדיקטורים) ודרג את התמונה הטכנית.';
  card.appendChild(desc);

  // Tech score slider
  const sliderGroup = document.createElement('div');
  sliderGroup.style.marginBottom = '20px';
  const sliderLabel = document.createElement('div');
  sliderLabel.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:8px';
  const labelText = document.createElement('span');
  labelText.textContent = 'ציון טכני';
  labelText.style.fontWeight = '500';
  sliderLabel.appendChild(labelText);
  const valDisplay = document.createElement('span');
  valDisplay.id = 'tech-score-display';
  valDisplay.style.cssText = 'font-weight:700;font-family:var(--font-mono)';
  valDisplay.textContent = '3.0';
  sliderLabel.appendChild(valDisplay);
  sliderGroup.appendChild(sliderLabel);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = 'tech-score';
  slider.min = '1';
  slider.max = '5';
  slider.step = '0.5';
  slider.value = '3';
  slider.style.width = '100%';
  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    valDisplay.textContent = v.toFixed(1);
    valDisplay.style.color = v >= 4 ? 'var(--green)' : v >= 2.5 ? 'var(--orange)' : 'var(--red)';
  });
  sliderGroup.appendChild(slider);
  card.appendChild(sliderGroup);

  // Notes fields
  const fields = [
    { id: 'tech-trend', label: 'מגמה כללית', placeholder: 'עולה / יורדת / צדדית' },
    { id: 'tech-support', label: 'רמות תמיכה', placeholder: 'רמות מחיר...' },
    { id: 'tech-resistance', label: 'רמות התנגדות', placeholder: 'רמות מחיר...' },
    { id: 'tech-notes', label: 'הערות', placeholder: 'אינדיקטורים, דפוסים, נפחים...' }
  ];

  fields.forEach(f => {
    const group = document.createElement('div');
    group.style.marginBottom = '16px';
    const lbl = document.createElement('label');
    lbl.textContent = f.label;
    lbl.htmlFor = f.id;
    lbl.style.cssText = 'display:block;margin-bottom:6px;font-weight:500';
    group.appendChild(lbl);
    const ta = document.createElement('textarea');
    ta.id = f.id;
    ta.placeholder = f.placeholder;
    ta.rows = 2;
    ta.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
    group.appendChild(ta);
    card.appendChild(group);
  });

  wrap.appendChild(card);

  // Load saved data
  const stepData = getState('pipeline.steps.technical') || {};
  if (stepData.score) {
    slider.value = stepData.score;
    slider.dispatchEvent(new Event('input'));
  }
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el && stepData[f.id]) el.value = stepData[f.id];
  });

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 4 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    saveData();
    completeStep(4);
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

function saveData() {
  setState('pipeline.steps.technical', getData());
}

export function validate() { return true; }

export function getData() {
  return {
    score: parseFloat(document.getElementById('tech-score')?.value || 3),
    'tech-trend': document.getElementById('tech-trend')?.value || '',
    'tech-support': document.getElementById('tech-support')?.value || '',
    'tech-resistance': document.getElementById('tech-resistance')?.value || '',
    'tech-notes': document.getElementById('tech-notes')?.value || ''
  };
}
