// Step 2: BUS Score (Business Understanding Score — 7 criteria)
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';
import { BUS_ITEMS } from '../../data/bus-criteria.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-bus';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F3E2} שלב 2 — BUS Score';
  wrap.appendChild(h2);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'דרג כל קריטריון מ-1 (חלש) עד 5 (מצוין). הממוצע הוא ציון ה-BUS שמהווה 33% מהציון הכולל.';
  wrap.appendChild(desc);

  // BUS items
  const itemsContainer = document.createElement('div');
  itemsContainer.id = 'bus-items';

  const stepData = getState('pipeline.steps.bus') || {};

  BUS_ITEMS.forEach(b => {
    const item = document.createElement('div');
    item.className = 'bus-item';

    const header = document.createElement('div');
    header.className = 'bus-header';

    const titleDiv = document.createElement('div');
    const titleEl = document.createElement('div');
    titleEl.className = 'bus-title';
    titleEl.textContent = b.title;
    titleDiv.appendChild(titleEl);
    const descEl = document.createElement('div');
    descEl.style.cssText = 'font-size:11px;color:var(--text3)';
    descEl.textContent = b.desc;
    titleDiv.appendChild(descEl);
    header.appendChild(titleDiv);

    const valEl = document.createElement('div');
    valEl.className = 'bus-score-val';
    valEl.id = 'bus-val-' + b.id;
    valEl.style.color = 'var(--orange)';
    valEl.textContent = '3.0';
    header.appendChild(valEl);

    item.appendChild(header);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'bus-' + b.id;
    slider.min = '1';
    slider.max = '5';
    slider.step = '0.5';
    slider.value = stepData['score_' + b.id] || '3';
    slider.addEventListener('input', () => updateDisplay(b.id));
    item.appendChild(slider);

    const notes = document.createElement('textarea');
    notes.id = 'bus-notes-' + b.id;
    notes.placeholder = 'תיעוד ממצאים...';
    notes.value = stepData['notes_' + b.id] || '';
    notes.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical;min-height:60px';
    item.appendChild(notes);

    itemsContainer.appendChild(item);
  });

  wrap.appendChild(itemsContainer);

  // Total BUS score display
  const totalCard = document.createElement('div');
  totalCard.className = 'card';
  totalCard.style.cssText = 'text-align:center;margin-top:20px;padding:20px';
  const totalLabel = document.createElement('div');
  totalLabel.style.cssText = 'font-size:14px;color:var(--text2);margin-bottom:8px';
  totalLabel.textContent = 'BUS Score (ממוצע)';
  totalCard.appendChild(totalLabel);
  const totalNum = document.createElement('div');
  totalNum.id = 'bus-total';
  totalNum.style.cssText = 'font-size:36px;font-weight:700';
  totalNum.textContent = '3.0';
  totalCard.appendChild(totalNum);
  wrap.appendChild(totalCard);

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 2 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    saveData();
    completeStep(2);
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);

  // Initialize display values
  BUS_ITEMS.forEach(b => updateDisplay(b.id));
}

function updateDisplay(id) {
  const slider = document.getElementById('bus-' + id);
  const valEl = document.getElementById('bus-val-' + id);
  if (!slider || !valEl) return;
  const val = parseFloat(slider.value);
  valEl.textContent = val.toFixed(1);
  valEl.style.color = val >= 4 ? 'var(--green)' : val >= 2.5 ? 'var(--orange)' : 'var(--red)';
  updateTotal();
}

function updateTotal() {
  const totalEl = document.getElementById('bus-total');
  if (!totalEl) return;
  const avg = getBusAverage();
  totalEl.textContent = avg.toFixed(1);
  totalEl.style.color = avg >= 4 ? 'var(--green)' : avg >= 2.5 ? 'var(--orange)' : 'var(--red)';
}

// Calculate BUS average (exported for use in scoring)
export function getBusAverage() {
  let sum = 0;
  let count = 0;
  BUS_ITEMS.forEach(b => {
    const el = document.getElementById('bus-' + b.id);
    if (el) {
      sum += parseFloat(el.value);
      count++;
    }
  });
  return count > 0 ? sum / count : 0;
}

// Pure calculation — no DOM dependency (for testing)
export function calculateBusScore(scores) {
  if (!scores || scores.length === 0) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

function saveData() {
  const data = {};
  BUS_ITEMS.forEach(b => {
    const slider = document.getElementById('bus-' + b.id);
    const notes = document.getElementById('bus-notes-' + b.id);
    data['score_' + b.id] = parseFloat(slider?.value || 3);
    data['notes_' + b.id] = notes?.value || '';
  });
  data.average = getBusAverage();
  setState('pipeline.steps.bus', data);
}

export function validate() {
  return true; // BUS always has values (slider defaults)
}

export function getData() {
  const data = {};
  BUS_ITEMS.forEach(b => {
    data['score_' + b.id] = parseFloat(document.getElementById('bus-' + b.id)?.value || 3);
    data['notes_' + b.id] = document.getElementById('bus-notes-' + b.id)?.value || '';
  });
  data.average = getBusAverage();
  return data;
}
