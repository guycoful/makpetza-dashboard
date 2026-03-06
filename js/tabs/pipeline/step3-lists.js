// Step 3: List Management — Route stocks to cold/warm/hot lists by score
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';

const LIST_TYPES = [
  { id: 'hot',  label: '\u{1F525} רשימה חמה', desc: 'ציון 4+ — מוכנה לביצוע תרחיש', color: 'var(--green)', min: 4.0 },
  { id: 'warm', label: '\u{1F7E1} רשימה פושרת', desc: 'ציון 3-4 — מעקב, ממתינה לטריגר', color: 'var(--orange)', min: 3.0 },
  { id: 'cold', label: '\u{2744}\u{FE0F} רשימה קרה', desc: 'ציון מתחת ל-3 — לא רלוונטית כרגע', color: 'var(--red)', min: 0 }
];

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-lists';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F4CB} שלב 3 — ניהול רשימות';
  wrap.appendChild(h2);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'המניה מנותבת אוטומטית לרשימה הנכונה לפי הציון המשוקלל מסוכן העל.';
  wrap.appendChild(desc);

  // Get meta score
  const meta = getState('pipeline.steps.analysis.meta') || {};
  const ticker = getState('currentTicker') || '???';
  const total = meta.total || 0;

  // Determine list
  const assignedList = total >= 4.0 ? 'hot' : total >= 3.0 ? 'warm' : 'cold';

  // Current stock assignment card
  const assignCard = document.createElement('div');
  assignCard.className = 'card';
  assignCard.style.cssText = 'padding:24px;text-align:center;margin-bottom:20px';

  const tickerDisplay = document.createElement('div');
  tickerDisplay.style.cssText = 'font-size:24px;font-weight:700;font-family:var(--font-mono);color:var(--accent)';
  tickerDisplay.textContent = ticker;
  assignCard.appendChild(tickerDisplay);

  const scoreDisplay = document.createElement('div');
  scoreDisplay.style.cssText = 'font-size:18px;margin:8px 0';
  scoreDisplay.textContent = 'ציון כולל: ' + total.toFixed(1);
  scoreDisplay.style.color = total >= 4 ? 'var(--green)' : total >= 3 ? 'var(--orange)' : 'var(--red)';
  assignCard.appendChild(scoreDisplay);

  const listInfo = LIST_TYPES.find(l => l.id === assignedList);
  const assignDisplay = document.createElement('div');
  assignDisplay.style.cssText = 'font-size:20px;font-weight:700;margin-top:8px';
  assignDisplay.style.color = listInfo.color;
  assignDisplay.textContent = '\u{27A1}\u{FE0F} ' + listInfo.label;
  assignCard.appendChild(assignDisplay);

  const assignDesc = document.createElement('div');
  assignDesc.style.cssText = 'font-size:13px;color:var(--text2);margin-top:4px';
  assignDesc.textContent = listInfo.desc;
  assignCard.appendChild(assignDesc);

  wrap.appendChild(assignCard);

  // All lists display
  const listsTitle = document.createElement('h3');
  listsTitle.textContent = 'כל הרשימות';
  listsTitle.style.marginBottom = '12px';
  wrap.appendChild(listsTitle);

  const rawLists = getState('lists') || { hot: [], warm: [], cold: [] };
  const allLists = JSON.parse(JSON.stringify(rawLists));

  // Add current stock to the appropriate list if not already there
  if (ticker && ticker !== '???') {
    // Remove from other lists first
    ['hot', 'warm', 'cold'].forEach(l => {
      if (!allLists[l]) allLists[l] = [];
      allLists[l] = allLists[l].filter(item => item.ticker !== ticker);
    });
    // Add to correct list
    allLists[assignedList].push({ ticker, score: total, date: new Date().toISOString() });
    setState('lists', allLists);
  }

  LIST_TYPES.forEach(listType => {
    const listCard = document.createElement('div');
    listCard.className = 'card';
    listCard.style.cssText = 'margin-bottom:12px;padding:16px';

    const listHeader = document.createElement('div');
    listHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';
    const listLabel = document.createElement('h4');
    listLabel.textContent = listType.label;
    listLabel.style.color = listType.color;
    listHeader.appendChild(listLabel);
    const listCount = document.createElement('span');
    listCount.style.cssText = 'font-size:13px;color:var(--text3)';
    const items = allLists[listType.id] || [];
    listCount.textContent = items.length + ' מניות';
    listHeader.appendChild(listCount);
    listCard.appendChild(listHeader);

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:var(--text3);font-size:13px;text-align:center;padding:8px';
      empty.textContent = 'ריקה';
      listCard.appendChild(empty);
    } else {
      items.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px';
        const name = document.createElement('span');
        name.style.cssText = 'font-family:var(--font-mono);font-weight:600';
        name.textContent = item.ticker;
        row.appendChild(name);
        const score = document.createElement('span');
        score.style.cssText = 'font-family:var(--font-mono);color:var(--text2)';
        score.textContent = (item.score || 0).toFixed(1);
        row.appendChild(score);
        listCard.appendChild(row);
      });
    }

    wrap.appendChild(listCard);
  });

  // Save assignment
  setState('pipeline.steps.lists', { ticker, score: total, assignedList, date: new Date().toISOString() });

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 3 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    completeStep(4);
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

export function validate() { return true; }
export function getData() { return getState('pipeline.steps.lists') || {}; }

// Pure routing (exported for testing)
export function determineList(score) {
  if (score >= 4.0) return 'hot';
  if (score >= 3.0) return 'warm';
  return 'cold';
}
