// Step 5: Position Management — Stop Loss + staged realization for Risk Free
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-position';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F6E1}\u{FE0F} שלב 5 — ניהול פוזיציה';
  wrap.appendChild(h2);

  const ticker = getState('currentTicker') || '???';
  const scenario = getState('pipeline.steps.scenario') || {};

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'תכנן את הגנת הפוזיציה ושלבי המימוש ליצירת מצב Risk Free.';
  wrap.appendChild(desc);

  // Position confirmation
  const confirmCard = document.createElement('div');
  confirmCard.className = 'card';
  confirmCard.style.padding = '20px';

  const confirmTitle = document.createElement('h3');
  confirmTitle.textContent = '\u{2705} אישור ביצוע — ' + ticker;
  confirmTitle.style.marginBottom = '16px';
  confirmCard.appendChild(confirmTitle);

  const posFields = [
    { id: 'pos-entry-price', label: 'מחיר כניסה בפועל ($)', type: 'number', default: scenario['sc-entry'] || '' },
    { id: 'pos-shares', label: 'כמות מניות שנקנו', type: 'number', default: scenario['sc-shares'] || '' },
    { id: 'pos-entry-date', label: 'תאריך כניסה', type: 'date' },
    { id: 'pos-stop-loss', label: 'Stop Loss ($)', type: 'number', default: scenario['sc-stop'] || '' }
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
    if (f.default) input.value = f.default;
    group.appendChild(input);
    confirmCard.appendChild(group);
  });

  const execConfirm = document.createElement('label');
  execConfirm.style.cssText = 'display:flex;gap:8px;align-items:center;margin-top:12px;cursor:pointer';
  const execCb = document.createElement('input');
  execCb.type = 'checkbox';
  execCb.id = 'pos-executed';
  execConfirm.appendChild(execCb);
  const execText = document.createElement('span');
  execText.textContent = 'מאשר — הפוזיציה בוצעה';
  execText.style.fontWeight = '500';
  execConfirm.appendChild(execText);
  confirmCard.appendChild(execConfirm);

  wrap.appendChild(confirmCard);

  // Realization stages
  const stagesCard = document.createElement('div');
  stagesCard.className = 'card';
  stagesCard.style.cssText = 'margin-top:12px;padding:20px';

  const stagesTitle = document.createElement('h3');
  stagesTitle.textContent = '\u{1F4C9} שלבי מימוש (Risk Free Plan)';
  stagesTitle.style.marginBottom = '12px';
  stagesCard.appendChild(stagesTitle);

  const stagesDesc = document.createElement('p');
  stagesDesc.style.cssText = 'color:var(--text2);font-size:13px;margin-bottom:16px';
  stagesDesc.textContent = 'תכנן מתי למכור חלק מהפוזיציה כדי להגיע למצב Risk Free.';
  stagesCard.appendChild(stagesDesc);

  const stages = [
    { id: 'stage1', label: 'שלב 1 — מימוש חלקי', pctLabel: '% מהפוזיציה', priceLabel: 'במחיר ($)' },
    { id: 'stage2', label: 'שלב 2 — מימוש נוסף', pctLabel: '% מהפוזיציה', priceLabel: 'במחיר ($)' },
    { id: 'stage3', label: 'שלב 3 — Target סופי', pctLabel: '% מהפוזיציה', priceLabel: 'במחיר ($)' }
  ];

  stages.forEach(s => {
    const stageRow = document.createElement('div');
    stageRow.className = 'mobile-grid-3';
    stageRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;align-items:end';

    const labelDiv = document.createElement('div');
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-weight:500;font-size:13px';
    lbl.textContent = s.label;
    labelDiv.appendChild(lbl);
    stageRow.appendChild(labelDiv);

    const pctDiv = document.createElement('div');
    const pctLbl = document.createElement('label');
    pctLbl.style.cssText = 'display:block;font-size:11px;color:var(--text3);margin-bottom:2px';
    pctLbl.textContent = s.pctLabel;
    pctDiv.appendChild(pctLbl);
    const pctInput = document.createElement('input');
    pctInput.type = 'number';
    pctInput.id = 'pos-' + s.id + '-pct';
    pctInput.className = 'input';
    pctInput.style.width = '100%';
    pctInput.placeholder = '%';
    pctDiv.appendChild(pctInput);
    stageRow.appendChild(pctDiv);

    const priceDiv = document.createElement('div');
    const priceLbl = document.createElement('label');
    priceLbl.style.cssText = 'display:block;font-size:11px;color:var(--text3);margin-bottom:2px';
    priceLbl.textContent = s.priceLabel;
    priceDiv.appendChild(priceLbl);
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.id = 'pos-' + s.id + '-price';
    priceInput.className = 'input';
    priceInput.style.width = '100%';
    priceInput.placeholder = '$';
    priceDiv.appendChild(priceInput);
    stageRow.appendChild(priceDiv);

    stagesCard.appendChild(stageRow);
  });

  // Trailing stop
  const trailGroup = document.createElement('div');
  trailGroup.style.marginTop = '12px';
  const trailLabel = document.createElement('label');
  trailLabel.textContent = 'Trailing Stop (%)';
  trailLabel.style.cssText = 'display:block;margin-bottom:4px;font-weight:500;font-size:13px';
  trailGroup.appendChild(trailLabel);
  const trailInput = document.createElement('input');
  trailInput.type = 'number';
  trailInput.id = 'pos-trailing-stop';
  trailInput.className = 'input';
  trailInput.style.width = '100%';
  trailInput.placeholder = 'למשל: 10 (יירד ב-10% מהשיא)';
  trailGroup.appendChild(trailInput);
  stagesCard.appendChild(trailGroup);

  wrap.appendChild(stagesCard);

  // Risk Free Calculator card
  const rfCard = document.createElement('div');
  rfCard.className = 'rf-card';
  rfCard.style.marginTop = '12px';

  const rfTitle = document.createElement('h3');
  rfTitle.textContent = '\u{1F4B0} מחשבון Risk Free';
  rfCard.appendChild(rfTitle);

  const rfDesc = document.createElement('p');
  rfDesc.style.cssText = 'color:var(--text2);font-size:13px;margin-bottom:12px';
  rfDesc.textContent = 'חשב כמה מניות למכור ביעד כדי להחזיר את ההשקעה. 2/3 מהפוזיציה = החזר הון, 1/3 = רווח חינמי.';
  rfCard.appendChild(rfDesc);

  const rfFieldsRow = document.createElement('div');
  rfFieldsRow.className = 'mobile-grid-2';
  rfFieldsRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px';

  const rfTarget = document.createElement('div');
  const rfTargetLbl = document.createElement('label');
  rfTargetLbl.textContent = 'מחיר יעד ($)';
  rfTargetLbl.style.cssText = 'display:block;font-size:11px;color:var(--text3);margin-bottom:2px';
  rfTarget.appendChild(rfTargetLbl);
  const rfTargetInput = document.createElement('input');
  rfTargetInput.type = 'number';
  rfTargetInput.id = 'rf-target-price';
  rfTargetInput.className = 'input';
  rfTargetInput.style.width = '100%';
  rfTargetInput.placeholder = 'מחיר יעד';
  rfTarget.appendChild(rfTargetInput);
  rfFieldsRow.appendChild(rfTarget);

  const rfCurrent = document.createElement('div');
  const rfCurrentLbl = document.createElement('label');
  rfCurrentLbl.textContent = 'מחיר נוכחי ($)';
  rfCurrentLbl.style.cssText = 'display:block;font-size:11px;color:var(--text3);margin-bottom:2px';
  rfCurrent.appendChild(rfCurrentLbl);
  const rfCurrentInput = document.createElement('input');
  rfCurrentInput.type = 'number';
  rfCurrentInput.id = 'rf-current-price';
  rfCurrentInput.className = 'input';
  rfCurrentInput.style.width = '100%';
  rfCurrentInput.placeholder = 'אופציונלי';
  rfCurrent.appendChild(rfCurrentInput);
  rfFieldsRow.appendChild(rfCurrent);

  rfCard.appendChild(rfFieldsRow);

  const rfCalcBtn = document.createElement('button');
  rfCalcBtn.className = 'btn btn-primary btn-sm';
  rfCalcBtn.textContent = '\u{1F9EE} חשב Risk Free';
  rfCalcBtn.addEventListener('click', () => {
    const entry = parseFloat(document.getElementById('pos-entry-price')?.value) || 0;
    const shares = parseFloat(document.getElementById('pos-shares')?.value) || 0;
    const target = parseFloat(rfTargetInput.value) || parseFloat(scenario['sc-target']) || 0;

    if (!entry || !shares || !target) {
      alert('מלא מחיר כניסה, כמות מניות ומחיר יעד');
      return;
    }

    const rf = calculateRiskFree(entry, shares, target);
    const resultsDiv = document.getElementById('rf-results');
    if (!resultsDiv) return;
    resultsDiv.textContent = '';
    resultsDiv.style.display = 'block';

    const rows = [
      { label: 'השקעה כוללת', val: '$' + rf.totalInvestment.toLocaleString() },
      { label: 'מניות למכירה (2/3)', val: rf.sharesToSell.toLocaleString() },
      { label: 'תמורה מהמכירה', val: '$' + rf.proceeds.toLocaleString() },
      { label: 'מניות חופשיות (1/3)', val: rf.remainingShares.toLocaleString() },
      { label: 'שווי מניות חופשיות', val: '$' + rf.freeValue.toLocaleString() },
      { label: 'מחיר Breakeven למכירה', val: '$' + rf.breakEvenPrice },
      { label: 'רווח/הפסד מהמכירה', val: (rf.profit >= 0 ? '+' : '') + '$' + rf.profit.toLocaleString() }
    ];

    rows.forEach(r => {
      const row = document.createElement('div');
      row.className = 'rf-row';
      const lbl = document.createElement('span');
      lbl.className = 'rf-label';
      lbl.textContent = r.label;
      row.appendChild(lbl);
      const val = document.createElement('span');
      val.className = 'rf-val';
      val.textContent = r.val;
      row.appendChild(val);
      resultsDiv.appendChild(row);
    });

    // Badge
    const badge = document.createElement('div');
    badge.className = 'rf-badge ' + (rf.isRiskFree ? 'achieved' : 'pending');
    badge.textContent = rf.isRiskFree
      ? '\u{2705} Risk Free! ' + rf.remainingShares + ' \u05DE\u05E0\u05D9\u05D5\u05EA \u05D7\u05D9\u05E0\u05DE\u05D9\u05D5\u05EA'
      : '\u{26A0}\u{FE0F} \u05E2\u05D5\u05D3 $' + Math.abs(rf.profit) + ' \u05DC\u05DE\u05E6\u05D1 Risk Free';
    badge.style.display = 'block';
    badge.style.textAlign = 'center';
    resultsDiv.appendChild(badge);

    // Progress bar
    const progressWrap = document.createElement('div');
    progressWrap.className = 'rf-progress';
    const progressFill = document.createElement('div');
    progressFill.className = 'rf-fill';
    progressFill.style.width = rf.progressPct + '%';
    progressFill.style.background = rf.isRiskFree ? 'var(--green)' : 'var(--orange)';
    progressWrap.appendChild(progressFill);
    resultsDiv.appendChild(progressWrap);

    const progressLabel = document.createElement('div');
    progressLabel.style.cssText = 'text-align:center;font-size:11px;color:var(--text3);margin-top:4px';
    progressLabel.textContent = rf.progressPct + '% \u05DE\u05D4\u05D3\u05E8\u05DA \u05DC-Risk Free';
    resultsDiv.appendChild(progressLabel);
  });
  rfCard.appendChild(rfCalcBtn);

  const rfResults = document.createElement('div');
  rfResults.id = 'rf-results';
  rfResults.className = 'rf-result';
  rfResults.style.display = 'none';
  rfCard.appendChild(rfResults);

  wrap.appendChild(rfCard);

  // Load saved data
  const saved = getState('pipeline.steps.position') || {};
  posFields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el && saved[f.id]) el.value = saved[f.id];
  });
  if (saved['pos-executed']) execCb.checked = true;
  stages.forEach(s => {
    const pct = document.getElementById('pos-' + s.id + '-pct');
    const price = document.getElementById('pos-' + s.id + '-price');
    if (pct && saved['pos-' + s.id + '-pct']) pct.value = saved['pos-' + s.id + '-pct'];
    if (price && saved['pos-' + s.id + '-price']) price.value = saved['pos-' + s.id + '-price'];
  });
  if (saved['pos-trailing-stop']) trailInput.value = saved['pos-trailing-stop'];

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 5 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    if (validate()) {
      saveData();
      completeStep(6);
    }
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

function saveData() {
  const ids = ['pos-entry-price', 'pos-shares', 'pos-entry-date', 'pos-stop-loss',
               'pos-stage1-pct', 'pos-stage1-price', 'pos-stage2-pct', 'pos-stage2-price',
               'pos-stage3-pct', 'pos-stage3-price', 'pos-trailing-stop'];
  const data = {};
  ids.forEach(id => { data[id] = document.getElementById(id)?.value || ''; });
  data['pos-executed'] = document.getElementById('pos-executed')?.checked || false;
  setState('pipeline.steps.position', data);
}

export function validate() {
  const exec = document.getElementById('pos-executed');
  if (!exec || !exec.checked) { alert('אשר שהפוזיציה בוצעה'); return false; }

  // Validate stages sum to <= 100%
  const pct1 = parseFloat(document.getElementById('pos-stage1-pct')?.value) || 0;
  const pct2 = parseFloat(document.getElementById('pos-stage2-pct')?.value) || 0;
  const pct3 = parseFloat(document.getElementById('pos-stage3-pct')?.value) || 0;
  const totalPct = pct1 + pct2 + pct3;
  if (totalPct > 100) {
    alert('שלבי המימוש סוכמים ל-' + totalPct + '% — לא ניתן למכור יותר מ-100% מהפוזיציה');
    return false;
  }

  return true;
}

export function getData() { return getState('pipeline.steps.position') || {}; }

// Pure Risk Free calculation (exported for testing)
export function calculateRiskFree(entryPrice, shares, targetPrice) {
  const totalInvestment = entryPrice * shares;
  const sharesToSell = Math.ceil(shares * (2 / 3));
  const proceeds = sharesToSell * targetPrice;
  const remainingShares = shares - sharesToSell;
  const breakEvenPrice = totalInvestment / sharesToSell;
  return {
    totalInvestment,
    sharesToSell,
    remainingShares,
    proceeds,
    isRiskFree: proceeds >= totalInvestment,
    breakEvenPrice: Math.round(breakEvenPrice * 100) / 100,
    freeValue: Math.round(remainingShares * targetPrice * 100) / 100,
    profit: Math.round((proceeds - totalInvestment) * 100) / 100,
    progressPct: Math.min(100, Math.round((proceeds / totalInvestment) * 100))
  };
}
