// Step 1: Sourcing — Investment idea discovery
import { getState, setState } from '../../core/state.js';
import { completeStep, goToStep } from './pipeline-manager.js';

const SOURCING_METHODS = [
  { id: 'screener', label: '\u{1F50D} סורקים (Screeners)', desc: 'Finviz, TradingView, Yahoo Finance screener — סינון לפי קריטריונים פיננסיים' },
  { id: 'news', label: '\u{1F4F0} חדשות ומדיה', desc: 'Seeking Alpha, Bloomberg, CNBC, Twitter/X — מעקב אחר טרנדים' },
  { id: 'community', label: '\u{1F465} קהילות', desc: 'Reddit (r/stocks), Discord, קבוצות טלגרם — רעיונות מהקהילה' },
  { id: 'insider', label: '\u{1F4CA} מסחר פנימיים', desc: 'OpenInsider, SEC Filings — מעקב אחר קניות/מכירות של בכירים' },
  { id: 'etf', label: '\u{1F4BC} ETF Holdings', desc: 'בדיקת אחזקות של קרנות מובילות (ARK, Berkshire)' },
  { id: 'sector', label: '\u{1F3ED} ניתוח סקטוריאלי', desc: 'זיהוי סקטורים חמים ובחירת המניות המובילות בהם' },
  { id: 'ai', label: '\u{1F916} מודלי AI', desc: 'Claude, GPT, Gemini, DeepSeek — ניתוח וסינון באמצעות בינה מלאכותית' },
  { id: 'heatmap', label: '\u{1F5FA}\u{FE0F} Heat Maps', desc: 'Finviz Heat Map — סריקה ויזואלית של סקטורים ומניות בולטות' },
  { id: 'earnings', label: '\u{1F4C5} Earnings Whispers', desc: 'לוח דוחות רבעוניים — מציאת חברות לפני/אחרי פרסום תוצאות' },
  { id: 'berkshire', label: '\u{1F3DB}\u{FE0F} Berkshire / 13-F', desc: 'מעקב אחרי קניות של באפט, Bridgewater ומוסדיים גדולים' },
  { id: 'rotation', label: '\u{1F504} רוטציית סקטורים', desc: 'זיהוי תנועת כספים בין סקטורים לפי מחזור כלכלי' },
  { id: 'social', label: '\u{1F4F1} סנטימנט חברתי', desc: 'Twitter/X, Reddit, StockTwits — מדידת הלך רוח ומגמות חברתיות' }
];

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-sourcing';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F50E} שלב 1 — איתור רעיון השקעה';
  wrap.appendChild(h2);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'בחר מאיפה הגיע הרעיון, הזן את פרטי המניה, וכתוב את התזה שלך.';
  wrap.appendChild(desc);

  // Sourcing method guide
  const guideCard = document.createElement('div');
  guideCard.className = 'card';
  guideCard.style.cssText = 'margin-bottom:20px;padding:16px';

  const guideTitle = document.createElement('h3');
  guideTitle.textContent = 'שיטות איתור';
  guideTitle.style.marginBottom = '12px';
  guideCard.appendChild(guideTitle);

  const guideDesc = document.createElement('p');
  guideDesc.style.cssText = 'font-size:13px;color:var(--text2);margin-bottom:12px';
  guideDesc.textContent = 'בחר את השיטה שהכי עובדת לך. מספיק שיטה אחת טובה:';
  guideCard.appendChild(guideDesc);

  const methodGrid = document.createElement('div');
  methodGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px';

  const stepData = getState('pipeline.steps.sourcing') || {};

  SOURCING_METHODS.forEach(m => {
    const methodCard = document.createElement('label');
    methodCard.style.cssText = 'display:flex;gap:10px;padding:10px;border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:.2s;align-items:flex-start';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = 'source-method';
    cb.value = m.id;
    cb.style.marginTop = '3px';
    if (stepData.methods && stepData.methods.includes(m.id)) cb.checked = true;
    methodCard.appendChild(cb);

    const info = document.createElement('div');
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-weight:500;font-size:13px';
    lbl.textContent = m.label;
    info.appendChild(lbl);
    const d = document.createElement('div');
    d.style.cssText = 'font-size:11px;color:var(--text3)';
    d.textContent = m.desc;
    info.appendChild(d);
    methodCard.appendChild(info);

    methodGrid.appendChild(methodCard);
  });

  guideCard.appendChild(methodGrid);
  wrap.appendChild(guideCard);

  // Stock details card
  const stockCard = document.createElement('div');
  stockCard.className = 'card';
  stockCard.style.padding = '20px';

  const stockTitle = document.createElement('h3');
  stockTitle.textContent = 'פרטי המניה';
  stockTitle.style.marginBottom = '16px';
  stockCard.appendChild(stockTitle);

  // Ticker
  const tickerGroup = createField('ticker-input', 'Ticker (סימול)', 'text', 'AAPL, MSFT, GOOGL...');
  stockCard.appendChild(tickerGroup);

  // Company name
  const nameGroup = createField('company-name', 'שם החברה', 'text', 'Apple Inc.');
  stockCard.appendChild(nameGroup);

  // Thesis
  const thesisGroup = createTextarea('idea-thesis', 'תזת השקעה', 'למה המניה הזו מעניינת? מה הפוטנציאל? מה הקטליסט?');
  stockCard.appendChild(thesisGroup);

  // Source details
  const sourceGroup = createField('idea-source', 'מקור ספציפי', 'text', 'למשל: סורק Finviz — P/E נמוך + צמיחה');
  stockCard.appendChild(sourceGroup);

  // Time horizon
  const horizonGroup = createSelect('idea-horizon', 'אופק השקעה', [
    '-- בחר --',
    'קצר (ימים-שבועות)',
    'בינוני (1-6 חודשים)',
    'ארוך (6+ חודשים)'
  ]);
  stockCard.appendChild(horizonGroup);

  // Catalyst
  const catalystGroup = createTextarea('idea-catalyst', 'קטליסט / טריגר', 'מה האירוע שיגרום למניה לזוז? דוח רבעוני, מוצר חדש, רגולציה...');
  catalystGroup.querySelector('textarea').rows = 2;
  stockCard.appendChild(catalystGroup);

  wrap.appendChild(stockCard);

  // Load saved data
  if (stepData.ticker) tickerGroup.querySelector('input').value = stepData.ticker;
  if (stepData.companyName) nameGroup.querySelector('input').value = stepData.companyName;
  if (stepData.thesis) thesisGroup.querySelector('textarea').value = stepData.thesis;
  if (stepData.source) sourceGroup.querySelector('input').value = stepData.source;
  if (stepData.horizon) horizonGroup.querySelector('select').value = stepData.horizon;
  if (stepData.catalyst) catalystGroup.querySelector('textarea').value = stepData.catalyst;

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 1 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    if (validate()) {
      saveData();
      completeStep(2);
      goToStep(3);
    }
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

function saveData() {
  const data = getData();
  setState('pipeline.steps.sourcing', data);
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
  const methods = [];
  document.querySelectorAll('input[name="source-method"]:checked').forEach(cb => methods.push(cb.value));

  return {
    ticker: (document.getElementById('ticker-input')?.value || '').toUpperCase().trim(),
    companyName: document.getElementById('company-name')?.value || '',
    thesis: document.getElementById('idea-thesis')?.value || '',
    source: document.getElementById('idea-source')?.value || '',
    horizon: document.getElementById('idea-horizon')?.value || '',
    catalyst: document.getElementById('idea-catalyst')?.value || '',
    methods
  };
}

// Helpers
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
