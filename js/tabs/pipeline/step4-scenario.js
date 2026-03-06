// Step 4: Scenario Execution — Risk/Reward calculator (1:5 minimum)
// Opens only for stocks in the "hot list"
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';
import { createTooltipLabel } from '../../components/glossary-tooltip.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-scenario';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F3AF} שלב 4 — ביצוע תרחיש';
  wrap.appendChild(h2);

  const ticker = getState('currentTicker') || '???';
  const listData = getState('pipeline.steps.lists') || {};

  // Check hot list gate
  if (listData.assignedList !== 'hot') {
    const warning = document.createElement('div');
    warning.className = 'card';
    warning.style.cssText = 'padding:24px;text-align:center;background:rgba(239,68,68,.05)';
    const icon = document.createElement('div');
    icon.style.fontSize = '48px';
    icon.textContent = '\u{1F6AB}';
    warning.appendChild(icon);
    const msg = document.createElement('p');
    msg.style.cssText = 'font-size:16px;font-weight:500;margin-top:12px;color:var(--red)';
    msg.textContent = 'שלב זה נפתח רק למניות ברשימה החמה (\u{1F525})';
    warning.appendChild(msg);
    const subMsg = document.createElement('p');
    subMsg.style.cssText = 'color:var(--text2);font-size:13px';
    subMsg.textContent = ticker + ' נמצאת ברשימה: ' + (listData.assignedList === 'warm' ? '\u{1F7E1} פושרת' : '\u{2744}\u{FE0F} קרה');
    warning.appendChild(subMsg);
    wrap.appendChild(warning);
    container.appendChild(wrap);
    return;
  }

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'תכנון התרחיש — וודא יחס סיכוי/סיכון של 1:5 מינימום לפני כניסה.';
  wrap.appendChild(desc);

  // Scenario calculator
  const calcCard = document.createElement('div');
  calcCard.className = 'card';
  calcCard.style.padding = '20px';

  const calcTitle = document.createElement('h3');
  calcTitle.textContent = '\u{1F4B1} מחשבון סיכוי/סיכון — ' + ticker;
  calcTitle.style.marginBottom = '16px';
  calcCard.appendChild(calcTitle);

  const fields = [
    { id: 'sc-entry', label: 'מחיר כניסה ($)', type: 'number' },
    { id: 'sc-stop', label: 'Stop Loss ($)', type: 'number', glossaryKey: 'stop' },
    { id: 'sc-target', label: 'Target ($)', type: 'number' },
    { id: 'sc-shares', label: 'כמות מניות', type: 'number' },
    { id: 'sc-portfolio', label: 'גודל תיק ($)', type: 'number', glossaryKey: 'position' }
  ];

  fields.forEach(f => {
    const group = document.createElement('div');
    group.style.marginBottom = '12px';
    const lbl = document.createElement('label');
    lbl.htmlFor = f.id;
    lbl.style.cssText = 'display:block;margin-bottom:4px;font-weight:500;font-size:13px';
    if (f.glossaryKey) {
      lbl.appendChild(createTooltipLabel(f.label, f.glossaryKey));
    } else {
      lbl.textContent = f.label;
    }
    group.appendChild(lbl);
    const input = document.createElement('input');
    input.type = f.type;
    input.id = f.id;
    input.className = 'input';
    input.style.width = '100%';
    input.addEventListener('input', calculateScenario);
    group.appendChild(input);
    calcCard.appendChild(group);
  });

  // Results display
  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'scenario-results';
  resultsDiv.style.cssText = 'margin-top:16px;padding:16px;background:var(--bg3);border-radius:8px';
  calcCard.appendChild(resultsDiv);

  wrap.appendChild(calcCard);

  // Notes
  const notesCard = document.createElement('div');
  notesCard.className = 'card';
  notesCard.style.cssText = 'margin-top:12px;padding:20px';
  const notesLabel = document.createElement('label');
  notesLabel.textContent = 'הערות לתרחיש';
  notesLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:500';
  notesCard.appendChild(notesLabel);
  const notesTa = document.createElement('textarea');
  notesTa.id = 'scenario-notes';
  notesTa.rows = 3;
  notesTa.placeholder = 'תנאים לכניסה, טריגרים, הערות...';
  notesTa.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
  notesCard.appendChild(notesTa);
  wrap.appendChild(notesCard);

  // Load saved data
  const saved = getState('pipeline.steps.scenario') || {};
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el && saved[f.id]) el.value = saved[f.id];
  });
  if (saved.notes) notesTa.value = saved.notes;
  calculateScenario();

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'אשר תרחיש ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    if (validate()) {
      saveData();
      completeStep(5);
    }
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

function calculateScenario() {
  const results = document.getElementById('scenario-results');
  if (!results) return;

  const entry = parseFloat(document.getElementById('sc-entry')?.value) || 0;
  const stop = parseFloat(document.getElementById('sc-stop')?.value) || 0;
  const target = parseFloat(document.getElementById('sc-target')?.value) || 0;
  const shares = parseFloat(document.getElementById('sc-shares')?.value) || 0;
  const portfolio = parseFloat(document.getElementById('sc-portfolio')?.value) || 0;

  results.textContent = '';

  if (!entry || !stop || !target) {
    results.textContent = 'הזן מחיר כניסה, Stop Loss ו-Target לחישוב';
    results.style.color = 'var(--text3)';
    return;
  }

  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  const ratio = risk > 0 ? reward / risk : 0;
  const riskDollars = risk * shares;
  const rewardDollars = reward * shares;
  const portfolioRisk = portfolio > 0 ? (riskDollars / portfolio * 100) : 0;

  const rows = [
    { label: 'סיכון למניה', val: '$' + risk.toFixed(2) },
    { label: 'רווח פוטנציאלי למניה', val: '$' + reward.toFixed(2) },
    { label: 'יחס סיכוי/סיכון', val: '1:' + ratio.toFixed(1), highlight: true },
    { label: 'סה"כ סיכון', val: '$' + riskDollars.toFixed(0) },
    { label: 'סה"כ רווח פוטנציאלי', val: '$' + rewardDollars.toFixed(0) },
    { label: 'סיכון מהתיק', val: portfolioRisk.toFixed(1) + '%' }
  ];

  rows.forEach(r => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;padding:6px 0;font-size:14px';
    if (r.highlight) row.style.cssText += ';font-weight:700;font-size:16px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:10px 0;margin:4px 0';
    const lbl = document.createElement('span');
    lbl.textContent = r.label;
    row.appendChild(lbl);
    const val = document.createElement('span');
    val.style.fontFamily = 'var(--font-mono)';
    val.textContent = r.val;
    row.appendChild(val);
    results.appendChild(row);
  });

  // Ratio check
  const check = document.createElement('div');
  check.style.cssText = 'margin-top:12px;padding:10px;border-radius:8px;text-align:center;font-weight:600';
  if (ratio >= 5) {
    check.style.background = 'rgba(22,163,74,.1)';
    check.style.color = 'var(--green)';
    check.textContent = '\u{2705} יחס 1:' + ratio.toFixed(1) + ' — עומד בתנאי המינימום (1:5)';
  } else if (ratio >= 3) {
    check.style.background = 'rgba(234,179,8,.1)';
    check.style.color = 'var(--orange)';
    check.textContent = '\u{26A0}\u{FE0F} יחס 1:' + ratio.toFixed(1) + ' — מתחת למינימום (1:5). שקול מחדש.';
  } else {
    check.style.background = 'rgba(239,68,68,.1)';
    check.style.color = 'var(--red)';
    check.textContent = '\u{274C} יחס 1:' + ratio.toFixed(1) + ' — לא עומד בתנאי. אל תיכנס!';
  }
  results.appendChild(check);

  // Portfolio risk check (1% rule)
  if (portfolioRisk > 1) {
    const riskWarning = document.createElement('div');
    riskWarning.style.cssText = 'margin-top:8px;padding:8px;background:rgba(239,68,68,.1);border-radius:6px;font-size:12px;color:var(--red);text-align:center';
    riskWarning.textContent = '\u{26A0}\u{FE0F} חוק ה-1%: הסיכון (' + portfolioRisk.toFixed(1) + '%) חורג מהמקסימום המומלץ (1% מהתיק)';
    results.appendChild(riskWarning);
  }

  results.style.color = '';
}

function saveData() {
  const ids = ['sc-entry', 'sc-stop', 'sc-target', 'sc-shares', 'sc-portfolio'];
  const data = {};
  ids.forEach(id => { data[id] = document.getElementById(id)?.value || ''; });
  data.notes = document.getElementById('scenario-notes')?.value || '';
  setState('pipeline.steps.scenario', data);
}

export function validate() {
  const entry = parseFloat(document.getElementById('sc-entry')?.value);
  const stop = parseFloat(document.getElementById('sc-stop')?.value);
  const target = parseFloat(document.getElementById('sc-target')?.value);
  if (!entry || !stop || !target) { alert('מלא מחיר כניסה, Stop Loss ו-Target'); return false; }
  return true;
}

export function getData() { return getState('pipeline.steps.scenario') || {}; }

// Pure calculation (exported for testing)
export function calculateRiskReward(entry, stop, target, shares, portfolio) {
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  const ratio = risk > 0 ? Math.round((reward / risk) * 10) / 10 : 0;
  const riskDollars = risk * shares;
  const rewardDollars = reward * shares;
  const portfolioRisk = portfolio > 0 ? Math.round((riskDollars / portfolio * 100) * 10) / 10 : 0;
  const passesMinRatio = ratio >= 5;
  const passesOnePercent = portfolioRisk <= 1;
  return { risk, reward, ratio, riskDollars, rewardDollars, portfolioRisk, passesMinRatio, passesOnePercent };
}
