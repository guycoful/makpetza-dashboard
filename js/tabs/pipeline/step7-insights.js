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

  // Complete button
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים ניתוח — שמור הכל';
  btn.style.marginTop = '20px';
  btn.addEventListener('click', () => {
    completeStep(8);
    alert('\u{1F389} הניתוח הושלם ונשמר!');
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
  renderLessons(contentDiv);
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

export function validate() { return true; }
export function getData() { return getState('pipeline.steps.insights') || {}; }
