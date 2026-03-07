// Step 6: Trading Journal — documentation with emotional state tracking
import { getState, setState } from '../../core/state.js';
import { completeStep, goToStep } from './pipeline-manager.js';

const EMOTIONS = [
  { val: 'confident', label: '\u{1F60E} בטוח', color: 'var(--green)' },
  { val: 'calm', label: '\u{1F60C} רגוע', color: 'var(--green)' },
  { val: 'excited', label: '\u{1F929} נלהב', color: 'var(--orange)' },
  { val: 'anxious', label: '\u{1F630} חרד', color: 'var(--orange)' },
  { val: 'fearful', label: '\u{1F628} מפחד', color: 'var(--red)' },
  { val: 'greedy', label: '\u{1F911} חמדני (FOMO)', color: 'var(--red)' },
  { val: 'frustrated', label: '\u{1F624} מתוסכל', color: 'var(--red)' },
  { val: 'neutral', label: '\u{1F610} ניטרלי', color: 'var(--text2)' }
];

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-journal';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F4D3} שלב 6 — יומן מסחר';
  wrap.appendChild(h2);

  const ticker = getState('currentTicker') || '???';
  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'תעד כל פעולה — סיבת הכניסה, רווח/הפסד, והמצב הרגשי. היומן הוא הכלי הכי חזק לשיפור.';
  wrap.appendChild(desc);

  // New entry form
  const entryCard = document.createElement('div');
  entryCard.className = 'card';
  entryCard.style.padding = '20px';

  const entryTitle = document.createElement('h3');
  entryTitle.textContent = '\u{2795} רשומה חדשה — ' + ticker;
  entryTitle.style.marginBottom = '16px';
  entryCard.appendChild(entryTitle);

  // Action type
  const actionGroup = document.createElement('div');
  actionGroup.style.marginBottom = '12px';
  const actionLabel = document.createElement('label');
  actionLabel.textContent = 'סוג פעולה';
  actionLabel.style.cssText = 'display:block;margin-bottom:4px;font-weight:500;font-size:13px';
  actionGroup.appendChild(actionLabel);
  const actionSelect = document.createElement('select');
  actionSelect.id = 'journal-action';
  actionSelect.className = 'input';
  actionSelect.style.width = '100%';
  ['-- בחר --', 'קנייה', 'מכירה חלקית', 'מכירה מלאה', 'הזזת Stop Loss', 'עדכון Target', 'מעקב שוטף', 'אחר'].forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    actionSelect.appendChild(o);
  });
  actionGroup.appendChild(actionSelect);
  entryCard.appendChild(actionGroup);

  // Description
  const descGroup = document.createElement('div');
  descGroup.style.marginBottom = '12px';
  const descLabel = document.createElement('label');
  descLabel.textContent = 'תיאור הפעולה';
  descLabel.style.cssText = 'display:block;margin-bottom:4px;font-weight:500;font-size:13px';
  descGroup.appendChild(descLabel);
  const descTa = document.createElement('textarea');
  descTa.id = 'journal-desc';
  descTa.rows = 3;
  descTa.placeholder = 'מה עשית ולמה?';
  descTa.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
  descGroup.appendChild(descTa);
  entryCard.appendChild(descGroup);

  // P&L
  const plRow = document.createElement('div');
  plRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px';

  const priceGroup = document.createElement('div');
  const priceLabel = document.createElement('label');
  priceLabel.textContent = 'מחיר ($)';
  priceLabel.style.cssText = 'display:block;margin-bottom:4px;font-weight:500;font-size:13px';
  priceGroup.appendChild(priceLabel);
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.id = 'journal-price';
  priceInput.className = 'input';
  priceInput.style.width = '100%';
  priceGroup.appendChild(priceInput);
  plRow.appendChild(priceGroup);

  const plGroup = document.createElement('div');
  const plLabel = document.createElement('label');
  plLabel.textContent = 'רווח/הפסד ($)';
  plLabel.style.cssText = 'display:block;margin-bottom:4px;font-weight:500;font-size:13px';
  plGroup.appendChild(plLabel);
  const plInput = document.createElement('input');
  plInput.type = 'number';
  plInput.id = 'journal-pl';
  plInput.className = 'input';
  plInput.style.width = '100%';
  plInput.placeholder = 'חיובי = רווח, שלילי = הפסד';
  plGroup.appendChild(plInput);
  plRow.appendChild(plGroup);

  entryCard.appendChild(plRow);

  // Emotional state
  const emotionGroup = document.createElement('div');
  emotionGroup.style.marginBottom = '12px';
  const emotionLabel = document.createElement('label');
  emotionLabel.textContent = 'מצב רגשי';
  emotionLabel.style.cssText = 'display:block;margin-bottom:8px;font-weight:500;font-size:13px';
  emotionGroup.appendChild(emotionLabel);

  const emotionGrid = document.createElement('div');
  emotionGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';

  EMOTIONS.forEach(e => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm';
    btn.dataset.emotion = e.val;
    btn.textContent = e.label;
    btn.style.cssText = 'padding:6px 12px;border:1px solid var(--border);border-radius:20px;font-size:12px;cursor:pointer;background:var(--bg2);color:var(--text1);transition:.2s';
    btn.addEventListener('click', () => {
      emotionGrid.querySelectorAll('button').forEach(b => {
        b.style.background = 'var(--bg2)';
        b.style.borderColor = 'var(--border)';
        b.style.color = 'var(--text1)';
        delete b.dataset.selected;
      });
      btn.style.background = e.color;
      btn.style.borderColor = e.color;
      btn.style.color = '#fff';
      btn.dataset.selected = 'true';
    });
    emotionGrid.appendChild(btn);
  });

  emotionGroup.appendChild(emotionGrid);
  entryCard.appendChild(emotionGroup);

  // Add entry button
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary';
  addBtn.textContent = '\u{2795} הוסף רשומה';
  addBtn.addEventListener('click', () => addJournalEntry());
  entryCard.appendChild(addBtn);

  wrap.appendChild(entryCard);

  // Journal history
  const historyCard = document.createElement('div');
  historyCard.className = 'card';
  historyCard.style.cssText = 'margin-top:12px;padding:20px';

  const historyTitle = document.createElement('h3');
  historyTitle.textContent = '\u{1F4DC} היסטוריית יומן';
  historyTitle.style.marginBottom = '12px';
  historyCard.appendChild(historyTitle);

  const historyList = document.createElement('div');
  historyList.id = 'journal-list';
  historyCard.appendChild(historyList);

  wrap.appendChild(historyCard);

  // Load and render existing entries
  const saved = getState('pipeline.steps.journal') || {};
  renderJournalEntries(saved.entries || []);

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 6 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    completeStep(7);
    goToStep(8);
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

function addJournalEntry() {
  const action = document.getElementById('journal-action')?.value;
  const desc = document.getElementById('journal-desc')?.value;
  if (!action || action === '-- בחר --' || !desc?.trim()) {
    alert('בחר סוג פעולה וכתוב תיאור');
    return;
  }

  const selectedEmotion = document.querySelector('#step-journal [data-emotion][data-selected="true"]')?.dataset?.emotion || 'neutral';

  const entry = {
    action,
    desc: desc.trim(),
    price: document.getElementById('journal-price')?.value || '',
    pl: document.getElementById('journal-pl')?.value || '',
    emotion: selectedEmotion,
    ticker: getState('currentTicker') || '',
    date: new Date().toISOString()
  };

  const saved = getState('pipeline.steps.journal') || {};
  const entries = saved.entries || [];
  entries.push(entry);
  setState('pipeline.steps.journal', { ...saved, entries });

  // Clear form
  document.getElementById('journal-action').value = '-- בחר --';
  document.getElementById('journal-desc').value = '';
  document.getElementById('journal-price').value = '';
  document.getElementById('journal-pl').value = '';
  document.querySelectorAll('#step-journal [data-emotion]').forEach(b => {
    b.style.background = 'var(--bg2)';
    b.style.borderColor = 'var(--border)';
    b.style.color = 'var(--text1)';
    delete b.dataset.selected;
  });

  renderJournalEntries(entries);
}

function renderJournalEntries(entries) {
  const list = document.getElementById('journal-list');
  if (!list) return;
  list.textContent = '';

  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:var(--text3);text-align:center;padding:16px;font-size:13px';
    empty.textContent = 'אין רשומות עדיין. הוסף את הרשומה הראשונה.';
    list.appendChild(empty);
    return;
  }

  const emotionMap = {};
  EMOTIONS.forEach(e => { emotionMap[e.val] = e; });

  [...entries].reverse().forEach(entry => {
    const item = document.createElement('div');
    item.style.cssText = 'padding:12px;border-bottom:1px solid var(--border)';

    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px';

    const actionBadge = document.createElement('span');
    actionBadge.style.cssText = 'font-weight:600;font-size:13px';
    actionBadge.textContent = entry.action;
    topRow.appendChild(actionBadge);

    const dateEl = document.createElement('span');
    dateEl.style.cssText = 'font-size:11px;color:var(--text3)';
    dateEl.textContent = new Date(entry.date).toLocaleDateString('he-IL') + ' ' + new Date(entry.date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    topRow.appendChild(dateEl);

    item.appendChild(topRow);

    const descEl = document.createElement('div');
    descEl.style.cssText = 'font-size:13px;margin-bottom:6px';
    descEl.textContent = entry.desc;
    item.appendChild(descEl);

    const metaRow = document.createElement('div');
    metaRow.style.cssText = 'display:flex;gap:12px;font-size:11px;color:var(--text3)';

    if (entry.price) {
      const priceEl = document.createElement('span');
      priceEl.textContent = 'מחיר: $' + entry.price;
      metaRow.appendChild(priceEl);
    }

    if (entry.pl) {
      const plEl = document.createElement('span');
      const plVal = parseFloat(entry.pl);
      plEl.textContent = 'P&L: ' + (plVal >= 0 ? '+' : '') + '$' + entry.pl;
      plEl.style.color = plVal >= 0 ? 'var(--green)' : 'var(--red)';
      plEl.style.fontWeight = '500';
      metaRow.appendChild(plEl);
    }

    if (entry.emotion) {
      const em = emotionMap[entry.emotion];
      const emEl = document.createElement('span');
      emEl.textContent = em ? em.label : entry.emotion;
      metaRow.appendChild(emEl);
    }

    item.appendChild(metaRow);
    list.appendChild(item);
  });
}

export function validate() { return true; }
export function getData() { return getState('pipeline.steps.journal') || {}; }
