// Step 0: Market Survey — SPY, QQQ, VIX macro data
import { getState, setState } from '../../core/state.js';
import { fetchQuote } from '../../core/api.js';
import { completeStep } from './pipeline-manager.js';

const INDICES = [
  { ticker: 'SPY', label: 'S&P 500 (SPY)', desc: 'מדד 500 החברות הגדולות בארה״ב' },
  { ticker: 'QQQ', label: 'Nasdaq 100 (QQQ)', desc: 'מדד 100 חברות הטכנולוגיה' },
  { ticker: '^VIX', label: 'VIX (מדד הפחד)', desc: 'מדד התנודתיות — מעל 20 = פחד, מתחת ל-15 = רוגע' }
];

const RED_FLAG_MARKETS = [
  { ticker: 'BTC-USD', label: 'Bitcoin', desc: 'קריפטו — תיאבון סיכון' },
  { ticker: 'ETH-USD', label: 'Ethereum', desc: 'קריפטו משני' },
  { ticker: 'TLT', label: 'אג"ח ארה"ב (20Y)', desc: 'מקלט בטוח — עלייה = בריחה מסיכון' },
  { ticker: 'GLD', label: 'זהב (GLD)', desc: 'סחורות / מקלט — עלייה = פחד' },
  { ticker: 'USO', label: 'נפט (USO)', desc: 'אנרגיה / אינפלציה' },
  { ticker: 'UUP', label: 'דולר (UUP)', desc: 'דולר חזק = לחץ על מניות' }
];

const TIMEFRAMES = [
  { id: 'weekly', label: 'שבועי', range: '5d' },
  { id: 'monthly', label: 'חודשי', range: '1mo' },
  { id: 'yearly', label: 'שנתי', range: '1y' }
];

let currentTimeframe = 'weekly';

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

  // Timeframe selector
  const tfRow = document.createElement('div');
  tfRow.className = 'timeframe-selector';
  TIMEFRAMES.forEach(tf => {
    const btn = document.createElement('button');
    btn.className = 'timeframe-btn' + (tf.id === currentTimeframe ? ' active' : '');
    btn.textContent = tf.label;
    btn.addEventListener('click', () => {
      currentTimeframe = tf.id;
      tfRow.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    tfRow.appendChild(btn);
  });
  wrap.appendChild(tfRow);

  // Load button
  const loadBtn = document.createElement('button');
  loadBtn.className = 'btn btn-primary';
  loadBtn.textContent = '\u{1F504} \u05D8\u05E2\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9 \u05E9\u05D5\u05E7';
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

  // Red flag markets section
  const rfSection = document.createElement('div');
  rfSection.style.marginBottom = '20px';

  const rfSectionTitle = document.createElement('h3');
  rfSectionTitle.textContent = '\u{1F6A9} \u05E9\u05D5\u05D5\u05E7\u05D9 \u05D3\u05D2\u05DC\u05D9\u05DD \u05D0\u05D3\u05D5\u05DE\u05D9\u05DD';
  rfSectionTitle.style.marginBottom = '8px';
  rfSection.appendChild(rfSectionTitle);

  const rfDesc2 = document.createElement('p');
  rfDesc2.style.cssText = 'font-size:12px;color:var(--text3);margin-bottom:12px';
  rfDesc2.textContent = '\u05D9\u05E8\u05D9\u05D3\u05EA \u05E7\u05E8\u05D9\u05E4\u05D8\u05D5 + \u05E2\u05DC\u05D9\u05D9\u05EA \u05D6\u05D4\u05D1 = \u05D1\u05E8\u05D9\u05D7\u05D4 \u05DE\u05E1\u05D9\u05DB\u05D5\u05DF. \u05D3\u05D5\u05DC\u05E8 \u05D7\u05D6\u05E7 = \u05DC\u05D7\u05E5 \u05E2\u05DC \u05DE\u05E0\u05D9\u05D5\u05EA.';
  rfSection.appendChild(rfDesc2);

  const rfGrid = document.createElement('div');
  rfGrid.id = 'red-flag-grid';
  rfGrid.className = 'red-flag-grid';

  RED_FLAG_MARKETS.forEach(m => {
    const card = document.createElement('div');
    card.className = 'red-flag-market';

    const title = document.createElement('div');
    title.style.cssText = 'font-weight:600;font-size:13px;margin-bottom:2px';
    title.textContent = m.label;
    card.appendChild(title);

    const descEl = document.createElement('div');
    descEl.style.cssText = 'font-size:11px;color:var(--text3);margin-bottom:8px';
    descEl.textContent = m.desc;
    card.appendChild(descEl);

    const price = document.createElement('div');
    price.id = 'rf-price-' + m.ticker.replace(/[^a-zA-Z0-9]/g, '');
    price.style.cssText = 'font-size:18px;font-weight:700;font-family:var(--font-mono)';
    price.textContent = '--';
    card.appendChild(price);

    const change = document.createElement('div');
    change.id = 'rf-change-' + m.ticker.replace(/[^a-zA-Z0-9]/g, '');
    change.style.cssText = 'font-size:12px;font-weight:500;margin-top:2px';
    card.appendChild(change);

    rfGrid.appendChild(card);
  });

  rfSection.appendChild(rfGrid);

  // Red flags assessment
  const assessDiv = document.createElement('div');
  assessDiv.id = 'red-flags-assessment';
  assessDiv.style.cssText = 'margin-top:12px;padding:12px;border-radius:8px;display:none';
  rfSection.appendChild(assessDiv);

  wrap.appendChild(rfSection);

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
  const tf = TIMEFRAMES.find(t => t.id === currentTimeframe) || TIMEFRAMES[0];

  // Load main indices
  for (const idx of INDICES) {
    try {
      const data = await fetchQuote(idx.ticker, tf.range);
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

  // Load red flag markets with delay to avoid rate limiting
  const rfResults = {};
  for (const m of RED_FLAG_MARKETS) {
    try {
      await new Promise(r => setTimeout(r, 300));
      const data = await fetchQuote(m.ticker, tf.range);
      if (data?.chart?.result?.[0]) {
        const meta = data.chart.result[0].meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose;
        const changeVal = price - prevClose;
        const changePct = (changeVal / prevClose) * 100;
        const key = m.ticker.replace(/[^a-zA-Z0-9]/g, '');

        rfResults[m.ticker] = { price, change: changeVal, changePct };

        const priceEl = document.getElementById('rf-price-' + key);
        const changeEl = document.getElementById('rf-change-' + key);
        if (priceEl) priceEl.textContent = price.toFixed(2);
        if (changeEl) {
          const isUp = changeVal >= 0;
          changeEl.textContent = (isUp ? '+' : '') + changePct.toFixed(2) + '%';
          changeEl.style.color = isUp ? 'var(--green)' : 'var(--red)';
        }
      }
    } catch (e) {
      console.error('Red flag data error for', m.ticker, e);
    }
  }

  // Assess red flags
  const assessment = assessRedFlags(results, rfResults);
  const assessDiv = document.getElementById('red-flags-assessment');
  if (assessDiv && assessment.warnings.length > 0) {
    assessDiv.style.display = 'block';
    assessDiv.style.background = assessment.level === 'danger' ? 'rgba(239,68,68,.1)' : 'rgba(234,179,8,.1)';
    assessDiv.textContent = '';
    const icon = assessment.level === 'danger' ? '\u{1F534}' : '\u{1F7E1}';
    assessment.warnings.forEach(w => {
      const p = document.createElement('div');
      p.style.cssText = 'font-size:13px;padding:4px 0';
      p.textContent = icon + ' ' + w;
      assessDiv.appendChild(p);
    });
  }

  // Save to state
  const existing = getState('pipeline.steps.market') || {};
  setState('pipeline.steps.market', { ...existing, indices: results, redFlags: rfResults, timeframe: currentTimeframe, loadedAt: new Date().toISOString() });
}

// Pure red flags assessment (exported for testing)
export function assessRedFlags(indices, redFlags) {
  const warnings = [];
  const vix = indices?.VIX;
  if (vix && vix.price > 25) warnings.push('VIX \u05DE\u05E2\u05DC 25 (' + vix.price.toFixed(1) + ') — \u05E4\u05D7\u05D3 \u05D2\u05D1\u05D5\u05D4 \u05D1\u05E9\u05D5\u05E7');

  const btc = redFlags?.['BTC-USD'];
  if (btc && btc.changePct < -5) warnings.push('Bitcoin \u05D9\u05E8\u05D3 ' + btc.changePct.toFixed(1) + '% — \u05D9\u05E8\u05D9\u05D3\u05EA \u05EA\u05D9\u05D0\u05D1\u05D5\u05DF \u05E1\u05D9\u05DB\u05D5\u05DF');

  const gld = redFlags?.['GLD'];
  if (gld && gld.changePct > 2) warnings.push('\u05D6\u05D4\u05D1 \u05E2\u05D5\u05DC\u05D4 +' + gld.changePct.toFixed(1) + '% — \u05D1\u05E8\u05D9\u05D7\u05D4 \u05DC\u05DE\u05E7\u05DC\u05D8');

  const tlt = redFlags?.['TLT'];
  if (tlt && tlt.changePct > 2) warnings.push('\u05D0\u05D2"\u05D7 \u05E2\u05D5\u05DC\u05D4 +' + tlt.changePct.toFixed(1) + '% — \u05D1\u05E8\u05D9\u05D7\u05D4 \u05DE\u05DE\u05E0\u05D9\u05D5\u05EA');

  const uup = redFlags?.['UUP'];
  if (uup && uup.changePct > 1) warnings.push('\u05D3\u05D5\u05DC\u05E8 \u05DE\u05EA\u05D7\u05D6\u05E7 +' + uup.changePct.toFixed(1) + '% — \u05DC\u05D7\u05E5 \u05E2\u05DC \u05DE\u05E0\u05D9\u05D5\u05EA');

  const level = warnings.length >= 3 ? 'danger' : warnings.length > 0 ? 'caution' : 'safe';
  return { warnings, level };
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
