// Step 7: Insights — Lessons learned + missed opportunities journal
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-insights';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F4A1} שלב 7 — הפקת תובנות';
  wrap.appendChild(h2);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'תעד מה עבד ומה לא, ונהל יומן פספוסים כדי לשבור קיפאון פסיכולוגי.';
  wrap.appendChild(desc);

  // Sub-tabs: Lessons / Missed
  const tabNav = document.createElement('div');
  tabNav.style.cssText = 'display:flex;gap:4px;margin-bottom:16px;border-bottom:2px solid var(--border)';

  let activeTab = 'lessons';

  const lessonsBtn = document.createElement('button');
  lessonsBtn.className = 'sub-tab-btn active';
  lessonsBtn.textContent = '\u{2705} מה עבד / לא עבד';
  tabNav.appendChild(lessonsBtn);

  const missedBtn = document.createElement('button');
  missedBtn.className = 'sub-tab-btn';
  missedBtn.textContent = '\u{1F614} יומן פספוסים';
  tabNav.appendChild(missedBtn);

  const contentDiv = document.createElement('div');
  contentDiv.id = 'insights-content';

  lessonsBtn.addEventListener('click', () => {
    activeTab = 'lessons';
    lessonsBtn.classList.add('active');
    missedBtn.classList.remove('active');
    renderLessons(contentDiv);
  });

  missedBtn.addEventListener('click', () => {
    activeTab = 'missed';
    missedBtn.classList.add('active');
    lessonsBtn.classList.remove('active');
    renderMissed(contentDiv);
  });

  wrap.appendChild(tabNav);
  wrap.appendChild(contentDiv);

  // Summary report section
  const summaryDiv = document.createElement('div');
  summaryDiv.id = 'pipeline-summary';
  summaryDiv.style.marginTop = '20px';
  wrap.appendChild(summaryDiv);

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים ניתוח — שמור הכל';
  btn.style.marginTop = '20px';
  btn.addEventListener('click', () => {
    const lessons = getState('pipeline.steps.insights.lessons') || {};
    const hasContent = (lessons.worked || '').trim() || (lessons.failed || '').trim() || (lessons.takeaway || '').trim();
    if (!hasContent) {
      alert('כתוב לפחות תובנה אחת (מה עבד / מה לא עבד / תובנה מרכזית) לפני סיום');
      return;
    }
    completeStep(8);
    renderSummary(summaryDiv);
    alert('\u{1F389} הניתוח הושלם ונשמר!');
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
  renderLessons(contentDiv);

  // Show summary if already completed
  const completed = getState('pipeline.completed') || [];
  if (completed[7]) renderSummary(summaryDiv);
}

// ===== LESSONS TAB =====
function renderLessons(container) {
  container.textContent = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '20px';

  const title = document.createElement('h3');
  title.textContent = '\u{1F4DD} לקחים מהעסקה';
  title.style.marginBottom = '16px';
  card.appendChild(title);

  // What worked
  const workedGroup = document.createElement('div');
  workedGroup.style.marginBottom = '16px';
  const workedLabel = document.createElement('label');
  workedLabel.textContent = '\u{2705} מה עבד טוב?';
  workedLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:500;color:var(--green)';
  workedGroup.appendChild(workedLabel);
  const workedTa = document.createElement('textarea');
  workedTa.id = 'insight-worked';
  workedTa.rows = 4;
  workedTa.placeholder = 'אילו החלטות היו נכונות? מה היית עושה שוב?';
  workedTa.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
  workedTa.addEventListener('input', autoSaveLessons);
  workedGroup.appendChild(workedTa);
  card.appendChild(workedGroup);

  // What didn't work
  const failedGroup = document.createElement('div');
  failedGroup.style.marginBottom = '16px';
  const failedLabel = document.createElement('label');
  failedLabel.textContent = '\u{274C} מה לא עבד?';
  failedLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:500;color:var(--red)';
  failedGroup.appendChild(failedLabel);
  const failedTa = document.createElement('textarea');
  failedTa.id = 'insight-failed';
  failedTa.rows = 4;
  failedTa.placeholder = 'אילו טעויות עשית? מה היית משנה?';
  failedTa.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
  failedTa.addEventListener('input', autoSaveLessons);
  failedGroup.appendChild(failedTa);
  card.appendChild(failedGroup);

  // Key takeaway
  const takeawayGroup = document.createElement('div');
  const takeawayLabel = document.createElement('label');
  takeawayLabel.textContent = '\u{1F3AF} תובנה מרכזית';
  takeawayLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:500;color:var(--accent)';
  takeawayGroup.appendChild(takeawayLabel);
  const takeawayTa = document.createElement('textarea');
  takeawayTa.id = 'insight-takeaway';
  takeawayTa.rows = 2;
  takeawayTa.placeholder = 'מה הדבר הכי חשוב שלמדת מהעסקה הזו?';
  takeawayTa.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
  takeawayTa.addEventListener('input', autoSaveLessons);
  takeawayGroup.appendChild(takeawayTa);
  card.appendChild(takeawayGroup);

  container.appendChild(card);

  // Load saved
  const saved = getState('pipeline.steps.insights.lessons') || {};
  if (saved.worked) workedTa.value = saved.worked;
  if (saved.failed) failedTa.value = saved.failed;
  if (saved.takeaway) takeawayTa.value = saved.takeaway;
}

function autoSaveLessons() {
  setState('pipeline.steps.insights.lessons', {
    worked: document.getElementById('insight-worked')?.value || '',
    failed: document.getElementById('insight-failed')?.value || '',
    takeaway: document.getElementById('insight-takeaway')?.value || ''
  });
}

// ===== MISSED OPPORTUNITIES TAB =====
function renderMissed(container) {
  container.textContent = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '20px';

  const title = document.createElement('h3');
  title.textContent = '\u{1F614} יומן פספוסים';
  title.style.marginBottom = '4px';
  card.appendChild(title);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:16px;font-size:13px';
  desc.textContent = 'תעד מניות שזיהית אבל לא נכנסת — ולמה. זה עוזר לשבור את הקיפאון הפסיכולוגי.';
  card.appendChild(desc);

  // New entry form
  const form = document.createElement('div');
  form.style.cssText = 'padding:12px;background:var(--bg2);border-radius:8px;margin-bottom:16px';

  const tickerInput = document.createElement('input');
  tickerInput.type = 'text';
  tickerInput.id = 'missed-ticker';
  tickerInput.placeholder = 'Ticker';
  tickerInput.className = 'input';
  tickerInput.style.cssText = 'width:100%;margin-bottom:8px';
  form.appendChild(tickerInput);

  const reasonTa = document.createElement('textarea');
  reasonTa.id = 'missed-reason';
  reasonTa.rows = 2;
  reasonTa.placeholder = 'למה לא נכנסת? (פחד, חוסר ביטחון, לא הגיע לטריגר...)';
  reasonTa.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg1);color:var(--text1);resize:vertical;margin-bottom:8px';
  form.appendChild(reasonTa);

  const outcomeTa = document.createElement('textarea');
  outcomeTa.id = 'missed-outcome';
  outcomeTa.rows = 2;
  outcomeTa.placeholder = 'מה קרה בסוף? כמה הרווחת/הפסדת (תיאורטית)?';
  outcomeTa.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg1);color:var(--text1);resize:vertical;margin-bottom:8px';
  form.appendChild(outcomeTa);

  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary';
  addBtn.textContent = '\u{2795} הוסף פספוס';
  addBtn.addEventListener('click', () => addMissedEntry());
  form.appendChild(addBtn);

  card.appendChild(form);

  // List
  const list = document.createElement('div');
  list.id = 'missed-list';
  card.appendChild(list);

  container.appendChild(card);

  // Load saved
  const saved = getState('pipeline.steps.insights.missed') || [];
  renderMissedEntries(saved);
}

function addMissedEntry() {
  const ticker = document.getElementById('missed-ticker')?.value?.toUpperCase().trim();
  const reason = document.getElementById('missed-reason')?.value?.trim();
  if (!ticker || !reason) { alert('הזן Ticker וסיבה'); return; }

  const entry = {
    ticker,
    reason,
    outcome: document.getElementById('missed-outcome')?.value?.trim() || '',
    date: new Date().toISOString()
  };

  const saved = getState('pipeline.steps.insights.missed') || [];
  saved.push(entry);
  setState('pipeline.steps.insights.missed', saved);

  // Clear
  document.getElementById('missed-ticker').value = '';
  document.getElementById('missed-reason').value = '';
  document.getElementById('missed-outcome').value = '';

  renderMissedEntries(saved);
}

function renderMissedEntries(entries) {
  const list = document.getElementById('missed-list');
  if (!list) return;
  list.textContent = '';

  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:var(--text3);text-align:center;padding:12px;font-size:13px';
    empty.textContent = 'אין פספוסים רשומים עדיין.';
    list.appendChild(empty);
    return;
  }

  [...entries].reverse().forEach(entry => {
    const item = document.createElement('div');
    item.style.cssText = 'padding:10px;border-bottom:1px solid var(--border)';

    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:4px';
    const tickerEl = document.createElement('span');
    tickerEl.style.cssText = 'font-family:var(--font-mono);font-weight:700;color:var(--accent)';
    tickerEl.textContent = entry.ticker;
    topRow.appendChild(tickerEl);
    const dateEl = document.createElement('span');
    dateEl.style.cssText = 'font-size:11px;color:var(--text3)';
    dateEl.textContent = new Date(entry.date).toLocaleDateString('he-IL');
    topRow.appendChild(dateEl);
    item.appendChild(topRow);

    const reasonEl = document.createElement('div');
    reasonEl.style.cssText = 'font-size:13px;color:var(--red)';
    reasonEl.textContent = '\u{274C} ' + entry.reason;
    item.appendChild(reasonEl);

    if (entry.outcome) {
      const outcomeEl = document.createElement('div');
      outcomeEl.style.cssText = 'font-size:12px;color:var(--text2);margin-top:2px';
      outcomeEl.textContent = '\u{1F4CA} ' + entry.outcome;
      item.appendChild(outcomeEl);
    }

    list.appendChild(item);
  });
}

// ===== PIPELINE SUMMARY REPORT =====
function renderSummary(container) {
  container.textContent = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'padding:24px;background:linear-gradient(135deg, var(--bg2), var(--bg3));border:2px solid var(--accent)';

  const title = document.createElement('h3');
  title.textContent = '\u{1F4CA} דו"ח סיכום — ניתוח מלא';
  title.style.cssText = 'margin-bottom:20px;color:var(--accent);font-size:18px';
  card.appendChild(title);

  const ticker = getState('currentTicker') || '???';
  const sourcing = getState('pipeline.steps.sourcing') || {};
  const meta = getState('pipeline.steps.analysis.meta') || {};
  const listData = getState('pipeline.steps.lists') || {};
  const scenario = getState('pipeline.steps.scenario') || {};
  const position = getState('pipeline.steps.position') || {};
  const journal = getState('pipeline.steps.journal') || {};
  const lessons = getState('pipeline.steps.insights.lessons') || {};

  const entry = parseFloat(scenario['sc-entry']) || 0;
  const stop = parseFloat(scenario['sc-stop']) || 0;
  const target = parseFloat(scenario['sc-target']) || 0;
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  const ratio = risk > 0 ? (reward / risk).toFixed(1) : '0';

  const sections = [
    { icon: '\u{1F4CE}', title: 'מניה: ' + ticker, items: [
      sourcing.companyName ? 'חברה: ' + sourcing.companyName : null,
      sourcing.thesis ? 'תזה: ' + sourcing.thesis : null,
      sourcing.horizon ? 'אופק: ' + sourcing.horizon : null,
    ]},
    { icon: '\u{1F9E0}', title: 'ניתוח (ציון כולל: ' + (meta.total || 0).toFixed(1) + '/5)', items: [
      meta.verdict ? 'החלטה: ' + meta.verdict : null,
    ]},
    { icon: '\u{1F4CB}', title: 'רשימה: ' + (listData.assignedList === 'hot' ? '\u{1F525} חמה' : listData.assignedList === 'warm' ? '\u{1F7E1} פושרת' : '\u{2744}\u{FE0F} קרה'), items: []},
    { icon: '\u{1F3AF}', title: 'תרחיש', items: [
      entry ? 'כניסה: $' + entry + ' | Stop: $' + stop + ' | Target: $' + target : null,
      'יחס R/R: 1:' + ratio,
    ]},
    { icon: '\u{1F6E1}\u{FE0F}', title: 'פוזיציה', items: [
      position['pos-entry-price'] ? 'כניסה בפועל: $' + position['pos-entry-price'] : null,
      position['pos-shares'] ? 'מניות: ' + position['pos-shares'] : null,
    ]},
    { icon: '\u{1F4D3}', title: 'יומן', items: [
      (journal.entries || []).length + ' רשומות',
    ]},
    { icon: '\u{1F4A1}', title: 'תובנות', items: [
      lessons.takeaway ? '\u{1F3AF} ' + lessons.takeaway : null,
    ]},
  ];

  sections.forEach(section => {
    const row = document.createElement('div');
    row.style.cssText = 'padding:10px 0;border-bottom:1px solid var(--border)';

    const header = document.createElement('div');
    header.style.cssText = 'font-weight:600;font-size:14px;margin-bottom:4px';
    header.textContent = section.icon + ' ' + section.title;
    row.appendChild(header);

    section.items.filter(Boolean).forEach(item => {
      const line = document.createElement('div');
      line.style.cssText = 'font-size:13px;color:var(--text2);padding-right:20px';
      line.textContent = item;
      row.appendChild(line);
    });

    card.appendChild(row);
  });

  container.appendChild(card);
}

export function validate() { return true; }
export function getData() { return getState('pipeline.steps.insights') || {}; }
