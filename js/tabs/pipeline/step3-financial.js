// Step 3: Financial Ratios (9 auto-calculated from Yahoo Finance)
import { getState, setState } from '../../core/state.js';
import { fetchSummary } from '../../core/api.js';
import { completeStep } from './pipeline-manager.js';

// Ratio assessment thresholds
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

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-financial';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F4CA} שלב 3 — יחסים פיננסיים';
  wrap.appendChild(h2);

  // Ticker + Load button
  const ticker = getState('currentTicker') || '';
  const loadRow = document.createElement('div');
  loadRow.style.cssText = 'display:flex;gap:10px;margin-bottom:20px;align-items:center';
  const tickerLabel = document.createElement('span');
  tickerLabel.textContent = 'מניה: ';
  tickerLabel.style.fontWeight = '500';
  loadRow.appendChild(tickerLabel);
  const tickerSpan = document.createElement('span');
  tickerSpan.id = 'fin-ticker';
  tickerSpan.textContent = ticker || '(לא נבחרה)';
  tickerSpan.style.cssText = 'font-family:var(--font-mono);font-weight:700;color:var(--accent)';
  loadRow.appendChild(tickerSpan);
  const loadBtn = document.createElement('button');
  loadBtn.className = 'btn btn-primary';
  loadBtn.textContent = 'טען נתונים';
  loadBtn.addEventListener('click', () => loadFinancialData());
  loadRow.appendChild(loadBtn);
  wrap.appendChild(loadRow);

  // Ratios grid
  const grid = document.createElement('div');
  grid.id = 'ratios-grid';
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px';

  RATIO_CONFIG.forEach(r => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.padding = '16px';

    const label = document.createElement('div');
    label.style.cssText = 'font-size:12px;color:var(--text2);margin-bottom:4px';
    label.textContent = r.label;
    card.appendChild(label);

    const val = document.createElement('div');
    val.id = 'r-' + r.id;
    val.style.cssText = 'font-size:20px;font-weight:700;font-family:var(--font-mono)';
    val.textContent = '--';
    card.appendChild(val);

    const status = document.createElement('div');
    status.id = 'rs-' + r.id;
    status.className = 'ratio-status';
    card.appendChild(status);

    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  // Fund score
  const scoreCard = document.createElement('div');
  scoreCard.className = 'card';
  scoreCard.style.cssText = 'text-align:center;margin-top:20px;padding:20px';
  const scoreLabel = document.createElement('div');
  scoreLabel.style.cssText = 'font-size:14px;color:var(--text2);margin-bottom:8px';
  scoreLabel.textContent = 'Financial Score (1-5)';
  scoreCard.appendChild(scoreLabel);
  const scoreNum = document.createElement('div');
  scoreNum.id = 'fund-score';
  scoreNum.style.cssText = 'font-size:36px;font-weight:700';
  scoreNum.textContent = '--';
  scoreCard.appendChild(scoreNum);
  wrap.appendChild(scoreCard);

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 3 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    saveData();
    completeStep(3);
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);

  // Auto-load if data already saved
  const saved = getState('pipeline.steps.financial');
  if (saved && saved.ratios) {
    displayRatios(saved.ratios);
  }
}

async function loadFinancialData() {
  const ticker = getState('currentTicker');
  if (!ticker) { alert('בחר מניה קודם (שלב 1)'); return; }

  document.getElementById('fin-ticker').textContent = ticker + ' (טוען...)';

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
    setState('pipeline.steps.financial', { ticker, ratios, score: calculateFinancialScore(ratios) });
    document.getElementById('fin-ticker').textContent = ticker;
  } catch (e) {
    console.error('Financial data error:', e);
    alert('שגיאה בטעינת נתונים');
    document.getElementById('fin-ticker').textContent = getState('currentTicker') || '';
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
      statusEl.className = 'ratio-status ' + status;
    } else {
      valEl.textContent = '--';
      statusEl.className = 'ratio-status';
    }
  });

  const score = calculateFinancialScore(ratios);
  const scoreEl = document.getElementById('fund-score');
  scoreEl.textContent = score.toFixed(1);
  scoreEl.style.color = score >= 4 ? 'var(--green)' : score >= 2.5 ? 'var(--orange)' : 'var(--red)';
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

function saveData() {
  const ratios = {};
  RATIO_CONFIG.forEach(r => {
    const el = document.getElementById('r-' + r.id);
    ratios[r.id] = el ? parseFloat(el.textContent) || null : null;
  });
  setState('pipeline.steps.financial', {
    ticker: getState('currentTicker'),
    ratios,
    score: calculateFinancialScore(ratios)
  });
}

export function validate() {
  const score = document.getElementById('fund-score');
  return score && score.textContent !== '--';
}

export function getData() {
  return getState('pipeline.steps.financial') || {};
}
