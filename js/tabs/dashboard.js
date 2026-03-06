// Dashboard Tab — Portfolio overview
import { getState } from '../core/state.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'tab-dashboard';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F3E0} דשבורד';
  wrap.appendChild(h2);

  // Stats row
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:20px';

  const watchlist = getState('watchlist') || [];
  const analyses = getState('analyses') || {};
  const exercises = getState('exercises') || {};
  const pipeline = getState('pipeline') || {};
  const completed = pipeline.completed || [];

  const stats = [
    { label: 'מניות ב-Watchlist', value: watchlist.length, icon: '\u{1F4CB}' },
    { label: 'ניתוחים שמורים', value: Object.keys(analyses).length, icon: '\u{1F4CA}' },
    { label: 'תרגילים שהושלמו', value: Object.keys(exercises).length + '/10', icon: '\u{1F393}' },
    { label: 'שלבי Pipeline', value: completed.filter(Boolean).length + '/8', icon: '\u{1F527}' }
  ];

  stats.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'text-align:center;padding:20px';

    const icon = document.createElement('div');
    icon.style.fontSize = '28px';
    icon.textContent = s.icon;
    card.appendChild(icon);

    const val = document.createElement('div');
    val.style.cssText = 'font-size:24px;font-weight:700;margin:8px 0';
    val.textContent = s.value;
    card.appendChild(val);

    const label = document.createElement('div');
    label.style.cssText = 'font-size:13px;color:var(--text2)';
    label.textContent = s.label;
    card.appendChild(label);

    statsRow.appendChild(card);
  });

  wrap.appendChild(statsRow);

  // Watchlist section
  const wlCard = document.createElement('div');
  wlCard.className = 'card';
  wlCard.style.marginBottom = '20px';

  const wlTitle = document.createElement('h3');
  wlTitle.textContent = 'Watchlist';
  wlTitle.style.marginBottom = '12px';
  wlCard.appendChild(wlTitle);

  if (watchlist.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:var(--text2);text-align:center;padding:20px';
    empty.textContent = 'אין מניות ב-Watchlist. הוסף מניות מטאב קו הייצור.';
    wlCard.appendChild(empty);
  } else {
    watchlist.forEach(ticker => {
      const row = document.createElement('div');
      row.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between';
      const name = document.createElement('span');
      name.style.cssText = 'font-family:var(--font-mono);font-weight:600';
      name.textContent = ticker;
      row.appendChild(name);
      wlCard.appendChild(row);
    });
  }

  wrap.appendChild(wlCard);

  // Recent analyses
  const anaCard = document.createElement('div');
  anaCard.className = 'card';

  const anaTitle = document.createElement('h3');
  anaTitle.textContent = 'ניתוחים אחרונים';
  anaTitle.style.marginBottom = '12px';
  anaCard.appendChild(anaTitle);

  const anaKeys = Object.keys(analyses);
  if (anaKeys.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:var(--text2);text-align:center;padding:20px';
    empty.textContent = 'אין ניתוחים שמורים עדיין.';
    anaCard.appendChild(empty);
  } else {
    anaKeys.slice(-5).reverse().forEach(key => {
      const a = analyses[key];
      const row = document.createElement('div');
      row.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between';
      const ticker = document.createElement('span');
      ticker.style.cssText = 'font-family:var(--font-mono);font-weight:600';
      ticker.textContent = a.ticker || key;
      row.appendChild(ticker);
      const date = document.createElement('span');
      date.style.cssText = 'font-size:12px;color:var(--text3)';
      date.textContent = a.date ? new Date(a.date).toLocaleDateString('he-IL') : '';
      row.appendChild(date);
      anaCard.appendChild(row);
    });
  }

  wrap.appendChild(anaCard);
  container.appendChild(wrap);
}
