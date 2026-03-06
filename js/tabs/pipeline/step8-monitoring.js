// Step 8: Position Monitoring + Journal
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-monitoring';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F4CB} שלב 8 — מעקב';
  wrap.appendChild(h2);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'תעד את הפוזיציה ועקוב אחרי הביצועים. הוסף רשומות יומן לתיעוד שוטף.';
  wrap.appendChild(desc);

  // Position card
  const posCard = document.createElement('div');
  posCard.className = 'card';
  posCard.style.marginBottom = '20px';

  const posTitle = document.createElement('h3');
  posTitle.textContent = 'פרטי פוזיציה';
  posTitle.style.marginBottom = '12px';
  posCard.appendChild(posTitle);

  const posFields = [
    { id: 'mon-entry-price', label: 'מחיר כניסה ($)', type: 'number' },
    { id: 'mon-shares', label: 'כמות מניות', type: 'number' },
    { id: 'mon-entry-date', label: 'תאריך כניסה', type: 'date' },
    { id: 'mon-stop-loss', label: 'Stop Loss ($)', type: 'number' },
    { id: 'mon-target', label: 'Target ($)', type: 'number' }
  ];

  posFields.forEach(f => {
    const group = document.createElement('div');
    group.style.marginBottom = '12px';
    const lbl = document.createElement('label');
    lbl.textContent = f.label;
    lbl.htmlFor = f.id;
    lbl.style.cssText = 'display:block;margin-bottom:4px;font-weight:500;font-size:13px';
    group.appendChild(lbl);
    const input = document.createElement('input');
    input.type = f.type;
    input.id = f.id;
    input.className = 'input';
    input.style.width = '100%';
    group.appendChild(input);
    posCard.appendChild(group);
  });

  wrap.appendChild(posCard);

  // Journal section
  const journalCard = document.createElement('div');
  journalCard.className = 'card';

  const journalTitle = document.createElement('h3');
  journalTitle.textContent = 'יומן מעקב';
  journalTitle.style.marginBottom = '12px';
  journalCard.appendChild(journalTitle);

  const newEntry = document.createElement('div');
  newEntry.style.cssText = 'display:flex;gap:8px;margin-bottom:16px';
  const entryInput = document.createElement('input');
  entryInput.type = 'text';
  entryInput.id = 'journal-entry';
  entryInput.className = 'input';
  entryInput.style.flex = '1';
  entryInput.placeholder = 'רשום עדכון...';
  newEntry.appendChild(entryInput);
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary';
  addBtn.textContent = 'הוסף';
  addBtn.addEventListener('click', () => addJournalEntry());
  newEntry.appendChild(addBtn);
  journalCard.appendChild(newEntry);

  const journalList = document.createElement('div');
  journalList.id = 'journal-list';
  journalCard.appendChild(journalList);

  wrap.appendChild(journalCard);

  // Load saved data
  const stepData = getState('pipeline.steps.monitoring') || {};
  posFields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el && stepData[f.id]) el.value = stepData[f.id];
  });

  // Render existing journal entries
  const entries = stepData.journal || [];
  renderJournal(entries);

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים ניתוח — שמור הכל';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    saveData();
    completeStep(8);
    alert('הניתוח הושלם ונשמר!');
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

function addJournalEntry() {
  const input = document.getElementById('journal-entry');
  if (!input || !input.value.trim()) return;

  const stepData = getState('pipeline.steps.monitoring') || {};
  const entries = stepData.journal || [];
  entries.push({ text: input.value.trim(), date: new Date().toISOString() });
  setState('pipeline.steps.monitoring', { ...stepData, journal: entries });

  input.value = '';
  renderJournal(entries);
}

function renderJournal(entries) {
  const list = document.getElementById('journal-list');
  if (!list) return;
  list.textContent = '';

  entries.forEach(entry => {
    const item = document.createElement('div');
    item.style.cssText = 'padding:10px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between';
    const text = document.createElement('span');
    text.textContent = entry.text;
    item.appendChild(text);
    const date = document.createElement('span');
    date.style.cssText = 'font-size:11px;color:var(--text3);white-space:nowrap;margin-right:12px';
    date.textContent = new Date(entry.date).toLocaleDateString('he-IL');
    item.appendChild(date);
    list.appendChild(item);
  });
}

function saveData() {
  const ids = ['mon-entry-price', 'mon-shares', 'mon-entry-date', 'mon-stop-loss', 'mon-target'];
  const data = getState('pipeline.steps.monitoring') || {};
  ids.forEach(id => { data[id] = document.getElementById(id)?.value || ''; });
  setState('pipeline.steps.monitoring', data);
}

export function validate() { return true; }
export function getData() { return getState('pipeline.steps.monitoring') || {}; }
