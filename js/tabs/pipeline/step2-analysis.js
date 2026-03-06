// Step 2: The Analysis — 5 sub-tabs (Market Agent, Business Agent, Technical Agent, Financial Agent, Meta-Agent)
import { getState, setState } from '../../core/state.js';
import { fetchSummary } from '../../core/api.js';
import { completeStep } from './pipeline-manager.js';
import { BUS_ITEMS } from '../../data/bus-criteria.js';

// ===== RATIO CONFIG (Financial Agent) =====
const RATIO_CONFIG = [
  { id: 'pe',  label: 'P/E',             check: v => v > 0 && v < 20 ? 'good' : v < 35 ? 'ok' : 'bad' },
  { id: 'pb',  label: 'P/B',             check: v => v > 0 && v < 3 ? 'good' : v < 5 ? 'ok' : 'bad' },
  { id: 'roe', label: 'ROE',             check: v => v > 15 ? 'good' : v > 8 ? 'ok' : 'bad' },
  { id: 'de',  label: 'Debt/Equity',     check: v => v < 50 ? 'good' : v < 100 ? 'ok' : 'bad' },
  { id: 'cr',  label: 'Current Ratio',   check: v => v > 1.5 ? 'good' : v > 1 ? 'ok' : 'bad' },
  { id: 'eps', label: 'EPS',             check: v => v > 0 ? 'good' : 'bad' },
  { id: 'rg',  label: 'Revenue Growth',  check: v => v > 10 ? 'good' : v > 0 ? 'ok' : 'bad' },
  { id: 'nm',  label: 'Net Margin',      check: v => v > 15 ? 'good' : v > 5 ? 'ok' : 'bad' },
  { id: 'fcf', label: 'Free Cash Flow',  check: v => v > 0 ? 'good' : 'bad' }
];

export { RATIO_CONFIG };

// ===== TECHNICAL LAYERS (Technical Agent) =====
const TECH_LAYERS = [
  { id: 'price', label: 'Price Action', desc: 'מגמה, תמיכה/התנגדות, Higher Highs / Lower Lows' },
  { id: 'patterns', label: 'Patterns', desc: 'דפוסי נרות, פורמציות (Head & Shoulders, Cup & Handle...)' },
  { id: 'indicators', label: 'Indicators', desc: 'RSI, MACD, Moving Averages, Bollinger Bands' },
  { id: 'vrvp', label: 'VRVP / Volume', desc: 'Volume Profile, POC, High Volume Nodes' }
];

// ===== SUB-TABS =====
const SUB_TABS = [
  { id: 'market-agent', label: '\u{1F30D} סוכן שווקים', render: renderMarketAgent },
  { id: 'business-agent', label: '\u{1F3E2} סוכן עסקי', render: renderBusinessAgent },
  { id: 'technical-agent', label: '\u{1F4C8} סוכן טכני', render: renderTechnicalAgent },
  { id: 'financial-agent', label: '\u{1F4CA} סוכן כספי', render: renderFinancialAgent },
  { id: 'meta-agent', label: '\u{2696}\u{FE0F} סוכן העל', render: renderMetaAgent }
];

let activeSubTab = 'market-agent';

// ===== MAIN RENDER =====
export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-analysis';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F9E0} שלב 2 — הניתוח';
  wrap.appendChild(h2);

  const ticker = getState('currentTicker') || '';
  if (ticker) {
    const tickerBadge = document.createElement('div');
    tickerBadge.style.cssText = 'font-family:var(--font-mono);font-weight:700;color:var(--accent);font-size:18px;margin-bottom:16px';
    tickerBadge.textContent = '\u{1F4CC} ' + ticker;
    wrap.appendChild(tickerBadge);
  }

  // Sub-tab navigation
  const tabNav = document.createElement('div');
  tabNav.className = 'sub-tabs';
  tabNav.id = 'analysis-sub-tabs';

  SUB_TABS.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = 'sub-tab-btn' + (tab.id === activeSubTab ? ' active' : '');
    btn.textContent = tab.label;
    btn.addEventListener('click', () => {
      activeSubTab = tab.id;
      tabNav.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const content = document.getElementById('analysis-content');
      tab.render(content);
    });
    tabNav.appendChild(btn);
  });

  wrap.appendChild(tabNav);

  // Sub-tab content area
  const content = document.createElement('div');
  content.id = 'analysis-content';
  wrap.appendChild(content);

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 2 ועבור הלאה';
  btn.style.marginTop = '20px';
  btn.addEventListener('click', () => {
    saveAllData();
    completeStep(3);
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);

  // Render initial sub-tab
  const initialTab = SUB_TABS.find(t => t.id === activeSubTab);
  if (initialTab) initialTab.render(content);
}

// ===== SUB-TAB 1: MARKET AGENT =====
function renderMarketAgent(container) {
  container.textContent = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '20px';

  const title = document.createElement('h3');
  title.textContent = '\u{1F30D} סוכן סקירת שווקים — קורלציה למניה';
  title.style.marginBottom = '12px';
  card.appendChild(title);

  const marketData = getState('pipeline.steps.market') || {};
  const ticker = getState('currentTicker') || '???';

  // Market condition display
  const condMap = { bullish: '\u{1F7E2} שוק עולה', bearish: '\u{1F534} שוק יורד', sideways: '\u{1F7E1} מדשדש' };
  const condText = condMap[marketData.condition] || 'לא הוגדר';

  const condRow = document.createElement('div');
  condRow.style.cssText = 'padding:12px;background:var(--bg3);border-radius:8px;margin-bottom:16px';
  condRow.textContent = 'מצב שוק: ' + condText;
  card.appendChild(condRow);

  // Index data display
  if (marketData.indices) {
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px';

    Object.entries(marketData.indices).forEach(([key, data]) => {
      const cell = document.createElement('div');
      cell.style.cssText = 'text-align:center;padding:8px;background:var(--bg2);border-radius:6px';
      const lbl = document.createElement('div');
      lbl.style.cssText = 'font-size:11px;color:var(--text3)';
      lbl.textContent = key;
      cell.appendChild(lbl);
      const val = document.createElement('div');
      val.style.cssText = 'font-weight:700;font-family:var(--font-mono)';
      val.textContent = data.price?.toFixed(2) || '--';
      cell.appendChild(val);
      const chg = document.createElement('div');
      chg.style.cssText = 'font-size:11px;font-weight:500';
      chg.style.color = data.change >= 0 ? 'var(--green)' : 'var(--red)';
      chg.textContent = (data.changePct >= 0 ? '+' : '') + (data.changePct?.toFixed(2) || '0') + '%';
      cell.appendChild(chg);
      grid.appendChild(cell);
    });

    card.appendChild(grid);
  }

  // Correlation assessment
  const corrLabel = document.createElement('label');
  corrLabel.textContent = 'מידת הקורלציה של ' + ticker + ' לשוק';
  corrLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:500';
  card.appendChild(corrLabel);

  const corrSelect = document.createElement('select');
  corrSelect.id = 'market-correlation';
  corrSelect.className = 'input';
  corrSelect.style.cssText = 'width:100%;margin-bottom:12px';
  [
    { val: '', label: '-- בחר --' },
    { val: 'high', label: 'קורלציה גבוהה — זזה עם השוק' },
    { val: 'medium', label: 'קורלציה בינונית' },
    { val: 'low', label: 'קורלציה נמוכה — עצמאית' },
    { val: 'inverse', label: 'קורלציה הפוכה' }
  ].forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.val;
    opt.textContent = o.label;
    corrSelect.appendChild(opt);
  });
  card.appendChild(corrSelect);

  const notesLabel = document.createElement('label');
  notesLabel.textContent = 'הערות על ההשפעה';
  notesLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:500';
  card.appendChild(notesLabel);

  const notesTa = document.createElement('textarea');
  notesTa.id = 'market-agent-notes';
  notesTa.rows = 3;
  notesTa.placeholder = 'איך מצב השוק משפיע על המניה הספציפית?';
  notesTa.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
  card.appendChild(notesTa);

  // Load saved
  const saved = getState('pipeline.steps.analysis.marketAgent') || {};
  if (saved.correlation) corrSelect.value = saved.correlation;
  if (saved.notes) notesTa.value = saved.notes;

  // Auto-save on change
  const autoSave = () => {
    setState('pipeline.steps.analysis.marketAgent', {
      correlation: corrSelect.value,
      notes: notesTa.value
    });
  };
  corrSelect.addEventListener('change', autoSave);
  notesTa.addEventListener('input', autoSave);

  container.appendChild(card);
}

// ===== SUB-TAB 2: BUSINESS AGENT (8 Cubes) =====
function renderBusinessAgent(container) {
  container.textContent = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '20px';

  const title = document.createElement('h3');
  title.textContent = '\u{1F3E2} סוכן יתרון יחסי — 8 קוביות';
  title.style.marginBottom = '4px';
  card.appendChild(title);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:16px;font-size:13px';
  desc.textContent = 'דרג כל קוביה מ-1 (חלש) עד 5 (מצוין). הממוצע הוא ציון ה-BUS (33% מהציון הכולל).';
  card.appendChild(desc);

  const stepData = getState('pipeline.steps.analysis.business') || {};

  BUS_ITEMS.forEach(b => {
    const item = document.createElement('div');
    item.style.cssText = 'margin-bottom:16px;padding:12px;background:var(--bg2);border-radius:8px';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';

    const titleDiv = document.createElement('div');
    const titleEl = document.createElement('div');
    titleEl.style.fontWeight = '600';
    titleEl.textContent = b.title;
    titleDiv.appendChild(titleEl);
    const descEl = document.createElement('div');
    descEl.style.cssText = 'font-size:11px;color:var(--text3)';
    descEl.textContent = b.desc;
    titleDiv.appendChild(descEl);
    header.appendChild(titleDiv);

    const valEl = document.createElement('span');
    valEl.id = 'bus-val-' + b.id;
    valEl.style.cssText = 'font-weight:700;font-size:18px;font-family:var(--font-mono);min-width:40px;text-align:center';
    header.appendChild(valEl);

    item.appendChild(header);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'bus-' + b.id;
    slider.min = '1';
    slider.max = '5';
    slider.step = '0.5';
    slider.value = stepData['score_' + b.id] || '3';
    slider.style.width = '100%';
    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      valEl.textContent = v.toFixed(1);
      valEl.style.color = v >= 4 ? 'var(--green)' : v >= 2.5 ? 'var(--orange)' : 'var(--red)';
      updateBusTotal();
      autoSaveBusiness();
    });
    item.appendChild(slider);

    const notes = document.createElement('textarea');
    notes.id = 'bus-notes-' + b.id;
    notes.placeholder = 'ממצאים...';
    notes.value = stepData['notes_' + b.id] || '';
    notes.rows = 2;
    notes.style.cssText = 'width:100%;padding:6px;border:1px solid var(--border);border-radius:6px;background:var(--bg1);color:var(--text1);resize:vertical;margin-top:8px;font-size:12px';
    notes.addEventListener('input', autoSaveBusiness);
    item.appendChild(notes);

    card.appendChild(item);

    // Init display
    const v = parseFloat(slider.value);
    valEl.textContent = v.toFixed(1);
    valEl.style.color = v >= 4 ? 'var(--green)' : v >= 2.5 ? 'var(--orange)' : 'var(--red)';
  });

  // Total
  const totalRow = document.createElement('div');
  totalRow.style.cssText = 'text-align:center;padding:16px;background:var(--bg3);border-radius:8px;margin-top:12px';
  const totalLabel = document.createElement('div');
  totalLabel.style.cssText = 'font-size:13px;color:var(--text2);margin-bottom:4px';
  totalLabel.textContent = 'BUS Score (ממוצע 8 קוביות)';
  totalRow.appendChild(totalLabel);
  const totalNum = document.createElement('div');
  totalNum.id = 'bus-total';
  totalNum.style.cssText = 'font-size:32px;font-weight:700;font-family:var(--font-mono)';
  totalRow.appendChild(totalNum);
  card.appendChild(totalRow);

  container.appendChild(card);
  updateBusTotal();
}

function updateBusTotal() {
  const totalEl = document.getElementById('bus-total');
  if (!totalEl) return;
  const avg = getBusAverage();
  totalEl.textContent = avg.toFixed(1);
  totalEl.style.color = avg >= 4 ? 'var(--green)' : avg >= 2.5 ? 'var(--orange)' : 'var(--red)';
}

function getBusAverage() {
  let sum = 0, count = 0;
  BUS_ITEMS.forEach(b => {
    const el = document.getElementById('bus-' + b.id);
    if (el) { sum += parseFloat(el.value); count++; }
  });
  return count > 0 ? sum / count : 0;
}

function autoSaveBusiness() {
  const data = {};
  BUS_ITEMS.forEach(b => {
    data['score_' + b.id] = parseFloat(document.getElementById('bus-' + b.id)?.value || 3);
    data['notes_' + b.id] = document.getElementById('bus-notes-' + b.id)?.value || '';
  });
  data.average = getBusAverage();
  setState('pipeline.steps.analysis.business', data);
}

// ===== SUB-TAB 3: TECHNICAL AGENT (4 Layers) =====
function renderTechnicalAgent(container) {
  container.textContent = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '20px';

  const title = document.createElement('h3');
  title.textContent = '\u{1F4C8} סוכן טכני — 4 שכבות';
  title.style.marginBottom = '4px';
  card.appendChild(title);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:16px;font-size:13px';
  desc.textContent = 'דרג כל שכבה טכנית מ-1 עד 5. כיסוי (Coverage) — דלג על שכבה רק אם אין לך מידע.';
  card.appendChild(desc);

  const stepData = getState('pipeline.steps.analysis.technical') || {};

  TECH_LAYERS.forEach(layer => {
    const item = document.createElement('div');
    item.style.cssText = 'margin-bottom:16px;padding:12px;background:var(--bg2);border-radius:8px';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';

    const titleDiv = document.createElement('div');
    const lbl = document.createElement('div');
    lbl.style.fontWeight = '600';
    lbl.textContent = layer.label;
    titleDiv.appendChild(lbl);
    const d = document.createElement('div');
    d.style.cssText = 'font-size:11px;color:var(--text3)';
    d.textContent = layer.desc;
    titleDiv.appendChild(d);
    header.appendChild(titleDiv);

    const valEl = document.createElement('span');
    valEl.id = 'tech-val-' + layer.id;
    valEl.style.cssText = 'font-weight:700;font-size:18px;font-family:var(--font-mono);min-width:40px;text-align:center';
    header.appendChild(valEl);

    item.appendChild(header);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'tech-' + layer.id;
    slider.min = '1';
    slider.max = '5';
    slider.step = '0.5';
    slider.value = stepData['score_' + layer.id] || '3';
    slider.style.width = '100%';
    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      valEl.textContent = v.toFixed(1);
      valEl.style.color = v >= 4 ? 'var(--green)' : v >= 2.5 ? 'var(--orange)' : 'var(--red)';
      updateTechTotal();
      autoSaveTechnical();
    });
    item.appendChild(slider);

    const notes = document.createElement('textarea');
    notes.id = 'tech-notes-' + layer.id;
    notes.placeholder = 'ממצאים...';
    notes.value = stepData['notes_' + layer.id] || '';
    notes.rows = 2;
    notes.style.cssText = 'width:100%;padding:6px;border:1px solid var(--border);border-radius:6px;background:var(--bg1);color:var(--text1);resize:vertical;margin-top:8px;font-size:12px';
    notes.addEventListener('input', autoSaveTechnical);
    item.appendChild(notes);

    card.appendChild(item);

    // Init display
    const v = parseFloat(slider.value);
    valEl.textContent = v.toFixed(1);
    valEl.style.color = v >= 4 ? 'var(--green)' : v >= 2.5 ? 'var(--orange)' : 'var(--red)';
  });

  // Total
  const totalRow = document.createElement('div');
  totalRow.style.cssText = 'text-align:center;padding:16px;background:var(--bg3);border-radius:8px;margin-top:12px';
  const totalLabel = document.createElement('div');
  totalLabel.style.cssText = 'font-size:13px;color:var(--text2);margin-bottom:4px';
  totalLabel.textContent = 'Technical Score (ממוצע 4 שכבות)';
  totalRow.appendChild(totalLabel);
  const totalNum = document.createElement('div');
  totalNum.id = 'tech-total';
  totalNum.style.cssText = 'font-size:32px;font-weight:700;font-family:var(--font-mono)';
  totalRow.appendChild(totalNum);
  card.appendChild(totalRow);

  container.appendChild(card);
  updateTechTotal();
}

function getTechAverage() {
  let sum = 0, count = 0;
  TECH_LAYERS.forEach(l => {
    const el = document.getElementById('tech-' + l.id);
    if (el) { sum += parseFloat(el.value); count++; }
  });
  return count > 0 ? sum / count : 0;
}

function updateTechTotal() {
  const el = document.getElementById('tech-total');
  if (!el) return;
  const avg = getTechAverage();
  el.textContent = avg.toFixed(1);
  el.style.color = avg >= 4 ? 'var(--green)' : avg >= 2.5 ? 'var(--orange)' : 'var(--red)';
}

function autoSaveTechnical() {
  const data = {};
  TECH_LAYERS.forEach(l => {
    data['score_' + l.id] = parseFloat(document.getElementById('tech-' + l.id)?.value || 3);
    data['notes_' + l.id] = document.getElementById('tech-notes-' + l.id)?.value || '';
  });
  data.average = getTechAverage();
  setState('pipeline.steps.analysis.technical', data);
}

// ===== SUB-TAB 4: FINANCIAL AGENT =====
function renderFinancialAgent(container) {
  container.textContent = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '20px';

  const title = document.createElement('h3');
  title.textContent = '\u{1F4CA} סוכן דוחות כספיים';
  title.style.marginBottom = '4px';
  card.appendChild(title);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:16px;font-size:13px';
  desc.textContent = '9 יחסים פיננסיים נטענים אוטומטית מ-Yahoo Finance. לחץ "טען נתונים".';
  card.appendChild(desc);

  // Load button
  const loadRow = document.createElement('div');
  loadRow.style.cssText = 'display:flex;gap:10px;align-items:center;margin-bottom:16px';
  const tickerSpan = document.createElement('span');
  tickerSpan.id = 'fin-ticker';
  tickerSpan.style.cssText = 'font-family:var(--font-mono);font-weight:700;color:var(--accent)';
  tickerSpan.textContent = getState('currentTicker') || '(לא נבחרה)';
  loadRow.appendChild(tickerSpan);
  const loadBtn = document.createElement('button');
  loadBtn.className = 'btn btn-primary';
  loadBtn.textContent = 'טען נתונים';
  loadBtn.addEventListener('click', () => loadFinancialData());
  loadRow.appendChild(loadBtn);
  card.appendChild(loadRow);

  // Ratios grid
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:16px';

  RATIO_CONFIG.forEach(r => {
    const rCard = document.createElement('div');
    rCard.style.cssText = 'padding:12px;background:var(--bg2);border-radius:8px;text-align:center';

    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:11px;color:var(--text3);margin-bottom:4px';
    lbl.textContent = r.label;
    rCard.appendChild(lbl);

    const val = document.createElement('div');
    val.id = 'r-' + r.id;
    val.style.cssText = 'font-size:18px;font-weight:700;font-family:var(--font-mono)';
    val.textContent = '--';
    rCard.appendChild(val);

    const status = document.createElement('div');
    status.id = 'rs-' + r.id;
    status.style.cssText = 'font-size:11px;margin-top:4px;font-weight:500';
    rCard.appendChild(status);

    grid.appendChild(rCard);
  });

  card.appendChild(grid);

  // Financial score
  const scoreRow = document.createElement('div');
  scoreRow.style.cssText = 'text-align:center;padding:16px;background:var(--bg3);border-radius:8px';
  const scoreLabel = document.createElement('div');
  scoreLabel.style.cssText = 'font-size:13px;color:var(--text2);margin-bottom:4px';
  scoreLabel.textContent = 'Financial Score (1-5)';
  scoreRow.appendChild(scoreLabel);
  const scoreNum = document.createElement('div');
  scoreNum.id = 'fund-score';
  scoreNum.style.cssText = 'font-size:32px;font-weight:700;font-family:var(--font-mono)';
  scoreNum.textContent = '--';
  scoreRow.appendChild(scoreNum);
  card.appendChild(scoreRow);

  container.appendChild(card);

  // Load saved data
  const saved = getState('pipeline.steps.analysis.financial') || {};
  if (saved && saved.ratios) displayRatios(saved.ratios);
}

async function loadFinancialData() {
  const ticker = getState('currentTicker');
  if (!ticker) { alert('בחר מניה קודם (שלב 1)'); return; }

  const tickerEl = document.getElementById('fin-ticker');
  if (tickerEl) tickerEl.textContent = ticker + ' (טוען...)';

  try {
    const summary = await fetchSummary(ticker);
    if (!summary?.quoteSummary?.result) { alert('לא נמצאו נתונים עבור ' + ticker); return; }
    const r = summary.quoteSummary.result[0];
    const detail = r.summaryDetail || {};
    const stats = r.defaultKeyStatistics || {};
    const fin = r.financialData || {};

    const ratios = {
      pe:  detail.trailingPE?.raw ?? stats.trailingPE?.raw ?? null,
      pb:  detail.priceToBook?.raw ?? stats.priceToBook?.raw ?? null,
      roe: fin.returnOnEquity?.raw != null ? fin.returnOnEquity.raw * 100 : null,
      de:  fin.debtToEquity?.raw ?? null,
      cr:  fin.currentRatio?.raw ?? null,
      eps: stats.trailingEps?.raw ?? null,
      rg:  fin.revenueGrowth?.raw != null ? fin.revenueGrowth.raw * 100 : null,
      nm:  fin.profitMargins?.raw != null ? fin.profitMargins.raw * 100 : null,
      fcf: fin.freeCashflow?.raw != null ? fin.freeCashflow.raw / 1e9 : null
    };

    displayRatios(ratios);
    setState('pipeline.steps.analysis.financial', { ticker, ratios, score: calculateFinancialScore(ratios) });
    if (tickerEl) tickerEl.textContent = ticker;
  } catch (e) {
    console.error('Financial data error:', e);
    alert('שגיאה בטעינת נתונים');
    if (document.getElementById('fin-ticker')) document.getElementById('fin-ticker').textContent = getState('currentTicker') || '';
  }
}

function displayRatios(ratios) {
  RATIO_CONFIG.forEach(r => {
    const valEl = document.getElementById('r-' + r.id);
    const statusEl = document.getElementById('rs-' + r.id);
    const val = ratios[r.id];

    if (val != null && !isNaN(val)) {
      valEl.textContent = r.id === 'fcf' ? val.toFixed(2) + 'B' :
                          ['roe', 'rg', 'nm'].includes(r.id) ? val.toFixed(1) + '%' :
                          typeof val === 'number' ? val.toFixed(2) : val;
      const status = r.check(val);
      const statusMap = { good: '\u{2705} טוב', ok: '\u{1F7E1} סביר', bad: '\u{1F534} בעייתי' };
      statusEl.textContent = statusMap[status] || '';
      statusEl.style.color = status === 'good' ? 'var(--green)' : status === 'ok' ? 'var(--orange)' : 'var(--red)';
    } else {
      valEl.textContent = '--';
      statusEl.textContent = '';
    }
  });

  const score = calculateFinancialScore(ratios);
  const scoreEl = document.getElementById('fund-score');
  if (scoreEl) {
    scoreEl.textContent = score.toFixed(1);
    scoreEl.style.color = score >= 4 ? 'var(--green)' : score >= 2.5 ? 'var(--orange)' : 'var(--red)';
  }
}

// Pure calculation (exported for testing)
export function calculateFinancialScore(ratios) {
  let score = 0, count = 0;
  RATIO_CONFIG.forEach(r => {
    const val = ratios[r.id];
    if (val == null || isNaN(val)) return;
    count++;
    const status = r.check(val);
    score += status === 'good' ? 5 : status === 'ok' ? 3 : 1;
  });
  return count > 0 ? Math.round((score / count) * 10) / 10 : 0;
}

// Pure BUS calculation (exported for testing)
export function calculateBusScore(scores) {
  if (!scores || scores.length === 0) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

// ===== SUB-TAB 5: META-AGENT =====
function renderMetaAgent(container) {
  container.textContent = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '20px';

  const title = document.createElement('h3');
  title.textContent = '\u{2696}\u{FE0F} סוכן העל — סיכום משוקלל';
  title.style.marginBottom = '16px';
  card.appendChild(title);

  // Get scores
  const bus = getState('pipeline.steps.analysis.business') || {};
  const tech = getState('pipeline.steps.analysis.technical') || {};
  const fin = getState('pipeline.steps.analysis.financial') || {};

  const busScore = bus.average || 0;
  const techScore = tech.average || 0;
  const finScore = fin.score || 0;
  const total = busScore * 0.33 + techScore * 0.33 + finScore * 0.34;

  // Score rows
  const scores = [
    { label: '\u{1F3E2} סוכן עסקי (33%)', val: busScore },
    { label: '\u{1F4C8} סוכן טכני (33%)', val: techScore },
    { label: '\u{1F4CA} סוכן כספי (34%)', val: finScore },
    { label: '\u{1F3AF} ציון כולל', val: total, bold: true }
  ];

  scores.forEach(s => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)';
    if (s.bold) row.style.cssText += ';font-size:18px;border-bottom:none;margin-top:8px';
    const lbl = document.createElement('span');
    lbl.textContent = s.label;
    if (s.bold) lbl.style.fontWeight = '700';
    row.appendChild(lbl);
    const val = document.createElement('span');
    val.textContent = s.val.toFixed(1);
    val.style.cssText = 'font-weight:700;font-family:var(--font-mono)';
    val.style.color = s.val >= 4 ? 'var(--green)' : s.val >= 2.5 ? 'var(--orange)' : 'var(--red)';
    row.appendChild(val);
    card.appendChild(row);
  });

  // Verdict
  const verdictBox = document.createElement('div');
  verdictBox.style.cssText = 'text-align:center;padding:20px;margin-top:16px;background:var(--bg3);border-radius:12px';

  const verdictLabel = document.createElement('div');
  verdictLabel.style.cssText = 'font-size:13px;color:var(--text2);margin-bottom:8px';
  verdictLabel.textContent = 'המלצה אוטומטית';
  verdictBox.appendChild(verdictLabel);

  const verdictText = document.createElement('div');
  verdictText.style.cssText = 'font-size:22px;font-weight:700';
  if (total >= 4.0) { verdictText.textContent = '\u{1F7E2} Strong Buy — מניה מצוינת'; verdictText.style.color = 'var(--green)'; }
  else if (total >= 3.0) { verdictText.textContent = '\u{1F7E1} Hold — יש פוטנציאל, מעקב'; verdictText.style.color = 'var(--orange)'; }
  else { verdictText.textContent = '\u{1F534} Sell — לא מומלצת'; verdictText.style.color = 'var(--red)'; }
  verdictBox.appendChild(verdictText);

  card.appendChild(verdictBox);

  // Red flags
  const flagsTitle = document.createElement('h4');
  flagsTitle.textContent = '\u{1F6A9} דגלים אדומים';
  flagsTitle.style.cssText = 'margin-top:20px;margin-bottom:8px';
  card.appendChild(flagsTitle);

  const flags = [];
  if (busScore < 2.5) flags.push('ציון עסקי נמוך — בעיות במודל העסקי');
  if (techScore < 2.5) flags.push('ציון טכני נמוך — תמונה טכנית שלילית');
  if (finScore < 2.5) flags.push('ציון כספי נמוך — בעיות פיננסיות');
  if (fin.ratios?.de > 100) flags.push('חוב/הון גבוה (Debt/Equity > 100)');
  if (fin.ratios?.pe > 50) flags.push('P/E גבוה מאוד (>50) — תמחור מנופח');
  if (fin.ratios?.fcf < 0) flags.push('תזרים מזומנים חופשי שלילי');

  if (flags.length === 0) {
    const noFlags = document.createElement('p');
    noFlags.style.cssText = 'color:var(--green);font-size:13px';
    noFlags.textContent = '\u{2705} לא זוהו דגלים אדומים';
    card.appendChild(noFlags);
  } else {
    flags.forEach(f => {
      const flag = document.createElement('div');
      flag.style.cssText = 'padding:6px 10px;margin-bottom:4px;background:rgba(239,68,68,.1);border-radius:6px;font-size:13px;color:var(--red)';
      flag.textContent = '\u{26A0}\u{FE0F} ' + f;
      card.appendChild(flag);
    });
  }

  // Save meta score to state
  setState('pipeline.steps.analysis.meta', { busScore, techScore, finScore, total, verdict: total >= 4 ? 'buy' : total >= 3 ? 'hold' : 'sell', flags });

  container.appendChild(card);
}

// ===== SAVE ALL =====
function saveAllData() {
  // Each sub-tab auto-saves, but ensure meta is updated
  const bus = getState('pipeline.steps.analysis.business') || {};
  const tech = getState('pipeline.steps.analysis.technical') || {};
  const fin = getState('pipeline.steps.analysis.financial') || {};
  const total = (bus.average || 0) * 0.33 + (tech.average || 0) * 0.33 + (fin.score || 0) * 0.34;
  setState('pipeline.steps.analysis.meta', {
    busScore: bus.average || 0,
    techScore: tech.average || 0,
    finScore: fin.score || 0,
    total,
    verdict: total >= 4 ? 'buy' : total >= 3 ? 'hold' : 'sell'
  });
}

export function validate() { return true; }
export function getData() { return getState('pipeline.steps.analysis') || {}; }
