// Academy Tab — Videos, Presentations & Exercises
import { EXERCISES } from '../data/exercises-data.js';
import { getState, setState } from '../core/state.js';

// 11 video modules matching the mentor syllabus
const VIDEO_MODULES = [
  { num: 1,  title: 'מבוא לשוק ההון', desc: 'מה זה שוק המניות, איך הוא עובד, מונחים בסיסיים', duration: '45 דק׳' },
  { num: 2,  title: 'ניתוח פונדמנטלי — BUS', desc: '7 קוביות הערכה עסקית: הנהלה, מוצר, חפיר, שוק, צמיחה, סנטימנט, מאקרו', duration: '60 דק׳' },
  { num: 3,  title: 'ניתוח פיננסי', desc: '9 יחסים פיננסיים: P/E, P/B, ROE, D/E, Current Ratio, EPS, Revenue Growth, Net Margin, FCF', duration: '55 דק׳' },
  { num: 4,  title: 'ניתוח טכני — בסיס', desc: 'גרפים, נרות יפניים, תמיכה והתנגדות, מגמות', duration: '50 דק׳' },
  { num: 5,  title: 'ניתוח טכני — מתקדם', desc: 'אינדיקטורים: RSI, MACD, Bollinger Bands, ממוצעים נעים', duration: '55 דק׳' },
  { num: 6,  title: 'סוכן-על ושקלול ציונים', desc: 'איך משקללים BUS + פיננסי + טכני לציון כולל, ניתוב לרשימות', duration: '40 דק׳' },
  { num: 7,  title: 'ביצוע תרחיש', desc: 'יחס סיכוי/סיכון 1:5, Stop Loss, Position Sizing, חוק ה-1%', duration: '50 דק׳' },
  { num: 8,  title: 'ניהול פוזיציה', desc: 'Trailing Stop, Scale In/Out, ניהול רגשות במהלך עסקה', duration: '45 דק׳' },
  { num: 9,  title: 'יומן מסחר', desc: 'למה חובה לנהל יומן, מה לרשום, איך ללמוד מטעויות', duration: '35 דק׳' },
  { num: 10, title: 'תובנות וסטטיסטיקות', desc: 'Win Rate, Expectancy, R-Multiple, ניתוח ביצועים', duration: '40 דק׳' },
  { num: 11, title: 'פסיכולוגיית מסחר', desc: 'FOMO, דיסציפלינה, ניהול סיכונים רגשי, טעויות נפוצות', duration: '50 דק׳' }
];

// 6 presentations / reference materials
const PRESENTATIONS = [
  { num: 1, title: 'מדריך BUS — 7 הקוביות', desc: 'סיכום ויזואלי של שיטת הניתוח העסקי', pages: 12 },
  { num: 2, title: 'יחסים פיננסיים — Cheat Sheet', desc: '9 יחסים עם נוסחאות, סף טוב/רע, ודוגמאות', pages: 8 },
  { num: 3, title: 'צ׳קליסט לפני כניסה לעסקה', desc: 'רשימת בדיקה מלאה — מ-BUS עד Stop Loss', pages: 4 },
  { num: 4, title: 'אסטרטגיות יציאה', desc: 'Trailing Stop, Target, Time Stop — מתי ואיך', pages: 6 },
  { num: 5, title: 'ניתוח טכני — אטלס דפוסים', desc: 'דפוסי נרות, תבניות מחיר, ואותות כניסה/יציאה', pages: 16 },
  { num: 6, title: 'טעויות נפוצות של מתחילים', desc: '10 הטעויות הנפוצות ביותר ואיך להימנע מהן', pages: 5 }
];

let currentSubTab = 'videos';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'tab-academy';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F393} אקדמיה';
  wrap.appendChild(h2);

  // Sub-tab navigation
  const nav = document.createElement('div');
  nav.style.cssText = 'display:flex;gap:8px;margin-bottom:20px;border-bottom:2px solid var(--border);padding-bottom:12px';

  const tabs = [
    { id: 'videos', label: '\u{1F3AC} סרטונים', count: VIDEO_MODULES.length },
    { id: 'presentations', label: '\u{1F4CA} מצגות', count: PRESENTATIONS.length },
    { id: 'exercises', label: '\u{270D}\u{FE0F} תרגילים', count: EXERCISES.length }
  ];

  tabs.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.style.cssText = currentSubTab === t.id
      ? 'background:var(--accent);color:#fff;font-weight:600'
      : 'background:var(--bg3);color:var(--text2)';
    btn.textContent = t.label + ' (' + t.count + ')';
    btn.addEventListener('click', () => {
      currentSubTab = t.id;
      render(container);
    });
    nav.appendChild(btn);
  });

  wrap.appendChild(nav);

  // Render active sub-tab
  const content = document.createElement('div');
  if (currentSubTab === 'videos') renderVideos(content);
  else if (currentSubTab === 'presentations') renderPresentations(content);
  else renderExercises(content);

  wrap.appendChild(content);
  container.appendChild(wrap);
}

// ── Videos sub-tab ──
function renderVideos(container) {
  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = '11 שיעורי וידאו מובנים לפי הסילבוס. צפה בסדר, כל שיעור בונה על הקודם.';
  container.appendChild(desc);

  const watched = getState('academy.watched') || {};

  VIDEO_MODULES.forEach(mod => {
    const card = document.createElement('div');
    card.className = 'card';
    card.className = 'card academy-card';
    card.style.cssText = 'margin-bottom:12px;padding:16px;display:flex;gap:16px;align-items:center;position:relative';

    // Thumbnail placeholder
    const thumb = document.createElement('div');
    thumb.style.cssText = 'min-width:80px;height:56px;background:var(--bg3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px';
    thumb.textContent = '\u{1F3AC}';
    card.appendChild(thumb);

    // Info
    const info = document.createElement('div');
    info.style.flex = '1';

    const title = document.createElement('div');
    title.style.cssText = 'font-weight:600;margin-bottom:4px';
    title.textContent = '\u{1F4F9} שיעור ' + mod.num + ': ' + mod.title;
    info.appendChild(title);

    const descLine = document.createElement('div');
    descLine.style.cssText = 'font-size:13px;color:var(--text2);margin-bottom:4px';
    descLine.textContent = mod.desc;
    info.appendChild(descLine);

    const meta = document.createElement('div');
    meta.style.cssText = 'font-size:12px;color:var(--text3);display:flex;gap:12px';

    const durationSpan = document.createElement('span');
    durationSpan.textContent = '\u{23F1} ' + mod.duration;
    meta.appendChild(durationSpan);

    if (watched['v' + mod.num]) {
      const watchedSpan = document.createElement('span');
      watchedSpan.style.color = 'var(--green)';
      watchedSpan.textContent = '\u{2705} נצפה';
      meta.appendChild(watchedSpan);
    }
    info.appendChild(meta);

    card.appendChild(info);

    // Watch toggle
    const watchBtn = document.createElement('button');
    watchBtn.className = 'btn';
    const isWatched = watched['v' + mod.num];
    watchBtn.style.cssText = isWatched
      ? 'background:var(--green);color:#fff;font-size:12px'
      : 'background:var(--bg3);color:var(--text2);font-size:12px';
    watchBtn.textContent = isWatched ? '\u{2705} נצפה' : '\u{25B6}\u{FE0F} סמן כנצפה';
    watchBtn.addEventListener('click', () => {
      const w = getState('academy.watched') || {};
      w['v' + mod.num] = !w['v' + mod.num];
      setState('academy.watched', w);
      render(container.closest('#tab-academy')?.parentElement || container.parentElement);
    });
    card.appendChild(watchBtn);

    // "Coming soon" badge
    const badge = document.createElement('div');
    badge.style.cssText = 'position:absolute;top:8px;left:8px;background:var(--accent);color:#fff;font-size:10px;padding:2px 8px;border-radius:12px';
    badge.textContent = '\u{1F51C} בקרוב';
    card.appendChild(badge);

    container.appendChild(card);
  });
}

// ── Presentations sub-tab ──
function renderPresentations(container) {
  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'מצגות וחומרי עזר להורדה. כל מצגת מסכמת נושא מרכזי בצורה ויזואלית.';
  container.appendChild(desc);

  PRESENTATIONS.forEach(pres => {
    const card = document.createElement('div');
    card.className = 'card';
    card.className = 'card academy-card';
    card.style.cssText = 'margin-bottom:12px;padding:16px;display:flex;gap:16px;align-items:center;position:relative';

    // Icon
    const icon = document.createElement('div');
    icon.style.cssText = 'min-width:56px;height:56px;background:var(--bg3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px';
    icon.textContent = '\u{1F4CA}';
    card.appendChild(icon);

    // Info
    const info = document.createElement('div');
    info.style.flex = '1';

    const title = document.createElement('div');
    title.style.cssText = 'font-weight:600;margin-bottom:4px';
    title.textContent = pres.title;
    info.appendChild(title);

    const descLine = document.createElement('div');
    descLine.style.cssText = 'font-size:13px;color:var(--text2);margin-bottom:4px';
    descLine.textContent = pres.desc;
    info.appendChild(descLine);

    const metaLine = document.createElement('div');
    metaLine.style.cssText = 'font-size:12px;color:var(--text3)';
    metaLine.textContent = '\u{1F4C4} ' + pres.pages + ' עמודים';
    info.appendChild(metaLine);

    card.appendChild(info);

    // "Coming soon" badge
    const badge = document.createElement('div');
    badge.style.cssText = 'position:absolute;top:8px;left:8px;background:var(--orange);color:#fff;font-size:10px;padding:2px 8px;border-radius:12px';
    badge.textContent = '\u{1F51C} בקרוב';
    card.appendChild(badge);

    container.appendChild(card);
  });
}

// ── Exercises sub-tab ──
function renderExercises(container) {
  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = '10 תרגילים מעשיים. פתח כל תרגיל, בצע אותו ושמור.';
  container.appendChild(desc);

  // Progress dots
  const exercises = getState('exercises') || {};
  const progressWrap = document.createElement('div');
  progressWrap.style.cssText = 'display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap';

  EXERCISES.forEach(ex => {
    const dot = document.createElement('div');
    dot.id = 'ex-num-' + ex.num;
    dot.style.cssText = 'width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;cursor:pointer';
    const isDone = exercises['ex' + ex.num];
    dot.className = isDone ? 'done' : 'pending';
    dot.style.background = isDone ? 'var(--green)' : 'var(--bg3)';
    dot.style.color = isDone ? '#fff' : 'var(--text2)';
    dot.textContent = ex.num;
    dot.addEventListener('click', () => toggleExercise(ex.num));
    progressWrap.appendChild(dot);
  });

  container.appendChild(progressWrap);

  // Exercise cards
  EXERCISES.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'ex-' + ex.num;
    card.style.cssText = 'margin-bottom:12px;cursor:pointer';

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center';
    header.addEventListener('click', () => toggleExercise(ex.num));

    const title = document.createElement('div');
    title.style.fontWeight = '600';
    title.textContent = '\u{1F4DD} תרגיל ' + ex.num + ': ' + ex.title;
    header.appendChild(title);

    const arrow = document.createElement('span');
    arrow.className = 'ex-arrow';
    arrow.textContent = '\u{25BC}';
    arrow.style.cssText = 'transition:transform 0.2s';
    header.appendChild(arrow);

    card.appendChild(header);

    // Body (hidden)
    const body = document.createElement('div');
    body.className = 'ex-body';
    body.style.cssText = 'display:none;margin-top:12px';

    const descP = document.createElement('p');
    descP.style.cssText = 'color:var(--text2);margin-bottom:12px;font-size:14px';
    descP.textContent = ex.desc;
    body.appendChild(descP);

    // Fields
    if (ex.fields) {
      ex.fields.forEach(f => {
        const group = document.createElement('div');
        group.style.marginBottom = '12px';
        const lbl = document.createElement('label');
        lbl.textContent = f.label;
        lbl.htmlFor = 'ex' + ex.num + '-' + f.id;
        lbl.style.cssText = 'display:block;margin-bottom:4px;font-weight:500;font-size:13px';
        group.appendChild(lbl);

        let input;
        if (f.type === 'textarea') {
          input = document.createElement('textarea');
          input.rows = 3;
          input.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
        } else if (f.type === 'select') {
          input = document.createElement('select');
          input.className = 'input';
          f.options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt;
            input.appendChild(o);
          });
        } else {
          input = document.createElement('input');
          input.type = f.type || 'text';
          input.className = 'input';
          input.style.width = '100%';
        }
        input.id = 'ex' + ex.num + '-' + f.id;
        if (f.readonly) input.readOnly = true;
        group.appendChild(input);
        body.appendChild(group);
      });
    }

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = '\u{1F4BE} שמור';
    saveBtn.addEventListener('click', (e) => { e.stopPropagation(); saveExercise(ex); });
    btnRow.appendChild(saveBtn);

    const loadBtn = document.createElement('button');
    loadBtn.className = 'btn';
    loadBtn.textContent = '\u{1F4C2} טען שמור';
    loadBtn.addEventListener('click', (e) => { e.stopPropagation(); loadExercise(ex); });
    btnRow.appendChild(loadBtn);

    body.appendChild(btnRow);
    card.appendChild(body);
    container.appendChild(card);
  });
}

function toggleExercise(num) {
  const card = document.getElementById('ex-' + num);
  if (!card) return;
  const body = card.querySelector('.ex-body');
  const arrow = card.querySelector('.ex-arrow');
  if (!body) return;

  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';

  const dot = document.getElementById('ex-num-' + num);
  if (dot && !isOpen && dot.className === 'pending') {
    dot.style.background = 'var(--accent)';
    dot.style.color = '#fff';
  }
}

function saveExercise(ex) {
  const data = {};
  if (ex.fields) {
    ex.fields.forEach(f => {
      const el = document.getElementById('ex' + ex.num + '-' + f.id);
      if (el) data[f.id] = el.value;
    });
  }

  const exercises = getState('exercises') || {};
  exercises['ex' + ex.num] = data;
  setState('exercises', exercises);

  const dot = document.getElementById('ex-num-' + ex.num);
  if (dot) {
    dot.style.background = 'var(--green)';
    dot.style.color = '#fff';
    dot.className = 'done';
  }
}

function loadExercise(ex) {
  const exercises = getState('exercises') || {};
  const data = exercises['ex' + ex.num];
  if (!data) { alert('\u{274C} אין תרגיל שמור'); return; }

  const body = document.querySelector('#ex-' + ex.num + ' .ex-body');
  if (body) body.style.display = 'block';

  if (ex.fields) {
    ex.fields.forEach(f => {
      const el = document.getElementById('ex' + ex.num + '-' + f.id);
      if (el && data[f.id] !== undefined) el.value = data[f.id];
    });
  }
}
