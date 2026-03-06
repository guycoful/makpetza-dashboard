// Step 0: Market Survey — SPY, QQQ, VIX macro data
import { getState, setState } from '../../core/state.js';
import { fetchQuote } from '../../core/api.js';
import { completeStep } from './pipeline-manager.js';

const INDICES = [
  { ticker: 'SPY', label: 'S&P 500 (SPY)', desc: 'מדד 500 החברות הגדולות בארה״ב' },
  { ticker: 'QQQ', label: 'Nasdaq 100 (QQQ)', desc: 'מדד 100 חברות הטכנולוגיה' },
  { ticker: '^VIX', label: 'VIX (מדד הפחד)', desc: 'מדד התנודתיות — מעל 20 = פחד, מתחת ל-15 = רוגע' }
];

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-market';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F30D} שלב 0 — סקירת שווקים';
  wrap.appendChild(h2);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'בדוק את מצב השוק הכללי לפני בחירת מניות. נתוני המאקרו נטענים אוטומטית.';
  wrap.appendChild(desc);

  // Load button
  const loadBtn = document.createElement('button');
  loadBtn.className = 'btn btn-primary';
  loadBtn.textContent = '\u{1F504} טען נתוני שוק';
  loadBtn.style.marginBottom = '20px';
  loadBtn.addEventListener('click', () => loadMarketData());
  wrap.appendChild(loadBtn);

  // Index cards grid
  const grid = document.createElement('div');
  grid.id = 'market-grid';
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:20px';

  INDICES.forEach(idx => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.padding = '20px';

    const title = document.createElement('h3');
    title.textContent = idx.label;
    title.style.marginBottom = '4px';
    card.appendChild(title);

    const descEl = document.createElement('div');
    descEl.style.cssText = 'font-size:12px;color:var(--text3);margin-bottom:12px';
    descEl.textContent = idx.desc;
    card.appendChild(descEl);

    const price = document.createElement('div');
    price.id = 'mkt-price-' + idx.ticker.replace('^', '');
    price.style.cssText = 'font-size:28px;font-weight:700;font-family:var(--font-mono)';
    price.textContent = '--';
    card.appendChild(price);

    const change = document.createElement('div');
    change.id = 'mkt-change-' + idx.ticker.replace('^', '');
    change.style.cssText = 'font-size:14px;font-weight:500;margin-top:4px';
    change.textContent = '';
    card.appendChild(change);

    grid.appendChild(card);
  });

  wrap.appendChild(grid);

  // Market condition selector
  const condCard = document.createElement('div');
  condCard.className = 'card';
  condCard.style.padding = '20px';

  const condTitle = document.createElement('h3');
  condTitle.textContent = 'החלטת מצב שוק';
  condTitle.style.marginBottom = '12px';
  condCard.appendChild(condTitle);

  const condDesc = document.createElement('p');
  condDesc.style.cssText = 'color:var(--text2);margin-bottom:12px;font-size:13px';
  condDesc.textContent = 'על סמך הנתונים, מה מצב השוק הנוכחי?';
  condCard.appendChild(condDesc);

  const condSelect = document.createElement('select');
  condSelect.id = 'market-condition';
  condSelect.className = 'input';
  condSelect.style.width = '100%';
  [
    { val: '', label: '-- בחר --' },
    { val: 'bullish', label: '\u{1F7E2} שוק עולה (Bullish)' },
    { val: 'bearish', label: '\u{1F534} שוק יורד (Bearish)' },
    { val: 'sideways', label: '\u{1F7E1} שוק מדשדש (Sideways)' }
  ].forEach(opt => {
    const o = document.createElement('option');
    o.value = opt.val;
    o.textContent = opt.label;
    condSelect.appendChild(o);
  });
  condCard.appendChild(condSelect);

  const notesLabel = document.createElement('label');
  notesLabel.textContent = 'הערות מאקרו';
  notesLabel.style.cssText = 'display:block;margin:12px 0 6px;font-weight:500';
  condCard.appendChild(notesLabel);

  const notesTa = document.createElement('textarea');
  notesTa.id = 'market-notes';
  notesTa.rows = 3;
  notesTa.placeholder = 'החלטות ריבית, אירועים כלכליים, מגמות...';
  notesTa.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
  condCard.appendChild(notesTa);

  wrap.appendChild(condCard);

  // Load saved data
  const saved = getState('pipeline.steps.market') || {};
  if (saved.condition) condSelect.value = saved.condition;
  if (saved.notes) notesTa.value = saved.notes;
  if (saved.indices) displayMarketData(saved.indices);

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 0 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    if (validate()) {
      saveData();
      completeStep(1);
    }
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

async function loadMarketData() {
  const results = {};

  for (const idx of INDICES) {
    try {
      const data = await fetchQuote(idx.ticker);
      if (data?.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose;
        const changeVal = price - prevClose;
        const changePct = (changeVal / prevClose) * 100;

        results[idx.ticker.replace('^', '')] = { price, change: changeVal, changePct };
      }
    } catch (e) {
      console.error('Market data error for', idx.ticker, e);
    }
  }

  displayMarketData(results);

  // Save to state
  const existing = getState('pipeline.steps.market') || {};
  setState('pipeline.steps.market', { ...existing, indices: results, loadedAt: new Date().toISOString() });
}

function displayMarketData(results) {
  Object.entries(results).forEach(([key, data]) => {
    const priceEl = document.getElementById('mkt-price-' + key);
    const changeEl = document.getElementById('mkt-change-' + key);
    if (!priceEl || !changeEl) return;

    priceEl.textContent = data.price.toFixed(2);

    const isUp = data.change >= 0;
    changeEl.textContent = (isUp ? '+' : '') + data.change.toFixed(2) + ' (' + (isUp ? '+' : '') + data.changePct.toFixed(2) + '%)';
    changeEl.style.color = isUp ? 'var(--green)' : 'var(--red)';
  });
}

function saveData() {
  const existing = getState('pipeline.steps.market') || {};
  setState('pipeline.steps.market', {
    ...existing,
    condition: document.getElementById('market-condition')?.value || '',
    notes: document.getElementById('market-notes')?.value || ''
  });
}

export function validate() {
  const cond = document.getElementById('market-condition');
  if (!cond || !cond.value) { alert('בחר מצב שוק'); return false; }
  return true;
}

export function getData() {
  return getState('pipeline.steps.market') || {};
}
