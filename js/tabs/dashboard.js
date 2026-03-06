// Dashboard Tab — Portfolio overview reflecting pipeline data
import { getState } from '../core/state.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'tab-dashboard';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F3E0} דשבורד';
  wrap.appendChild(h2);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = 'סיכום הנתונים מפס הייצור — פוזיציות, ביצועים ורשימות.';
  wrap.appendChild(desc);

  // Gather data
  const pipeline = getState('pipeline') || {};
  const completed = pipeline.completed || [];
  const lists = getState('lists') || { hot: [], warm: [], cold: [] };
  const journal = getState('pipeline.steps.journal') || {};
  const entries = journal.entries || [];
  const exercises = getState('exercises') || {};
  const position = getState('pipeline.steps.position') || {};

  // Calculate win rate from journal
  const closedTrades = entries.filter(e => e.pl && parseFloat(e.pl) !== 0);
  const wins = closedTrades.filter(e => parseFloat(e.pl) > 0);
  const winRate = closedTrades.length > 0 ? Math.round((wins.length / closedTrades.length) * 100) : 0;
  const totalPL = closedTrades.reduce((sum, e) => sum + (parseFloat(e.pl) || 0), 0);
  const avgWin = wins.length > 0 ? wins.reduce((s, e) => s + parseFloat(e.pl), 0) / wins.length : 0;
  const losses = closedTrades.filter(e => parseFloat(e.pl) < 0);
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, e) => s + parseFloat(e.pl), 0) / losses.length) : 0;
  const expectancy = closedTrades.length > 0 ? (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss : 0;

  // Stats row
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:20px';

  const stats = [
    { label: '\u{1F525} רשימה חמה', value: lists.hot.length, icon: '\u{1F525}', color: 'var(--green)' },
    { label: '\u{1F7E1} רשימה פושרת', value: lists.warm.length, icon: '\u{1F7E1}', color: 'var(--orange)' },
    { label: 'Win Rate', value: winRate + '%', icon: '\u{1F3AF}', color: winRate >= 50 ? 'var(--green)' : 'var(--red)' },
    { label: '\u{1F4B0} תוחלת', value: '$' + expectancy.toFixed(0), icon: '\u{1F4B0}', color: expectancy >= 0 ? 'var(--green)' : 'var(--red)' },
    { label: 'שלבי Pipeline', value: completed.filter(Boolean).length + '/8', icon: '\u{1F527}', color: 'var(--accent)' },
    { label: 'תרגילים', value: Object.keys(exercises).length + '/10', icon: '\u{1F393}', color: 'var(--accent)' }
  ];

  stats.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'text-align:center;padding:20px';

    const val = document.createElement('div');
    val.style.cssText = 'font-size:28px;font-weight:700;font-family:var(--font-mono);margin-bottom:4px';
    val.style.color = s.color || '';
    val.textContent = s.value;
    card.appendChild(val);

    const label = document.createElement('div');
    label.style.cssText = 'font-size:13px;color:var(--text2)';
    label.textContent = s.label;
    card.appendChild(label);

    statsRow.appendChild(card);
  });

  wrap.appendChild(statsRow);

  // Open position card
  const posCard = document.createElement('div');
  posCard.className = 'card';
  posCard.style.cssText = 'margin-bottom:16px;padding:20px';

  const posTitle = document.createElement('h3');
  posTitle.textContent = '\u{1F6E1}\u{FE0F} פוזיציה פתוחה';
  posTitle.style.marginBottom = '12px';
  posCard.appendChild(posTitle);

  const currentTicker = getState('currentTicker');
  if (position['pos-executed'] && currentTicker) {
    const posGrid = document.createElement('div');
    posGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px';

    const posFields = [
      { label: 'Ticker', val: currentTicker },
      { label: 'מחיר כניסה', val: position['pos-entry-price'] ? '$' + position['pos-entry-price'] : '--' },
      { label: 'כמות', val: position['pos-shares'] || '--' },
      { label: 'Stop Loss', val: position['pos-stop-loss'] ? '$' + position['pos-stop-loss'] : '--' },
      { label: 'Trailing Stop', val: position['pos-trailing-stop'] ? position['pos-trailing-stop'] + '%' : '--' },
      { label: 'תאריך כניסה', val: position['pos-entry-date'] || '--' }
    ];

    posFields.forEach(f => {
      const cell = document.createElement('div');
      cell.style.cssText = 'padding:10px;background:var(--bg2);border-radius:8px;text-align:center';
      const lbl = document.createElement('div');
      lbl.style.cssText = 'font-size:11px;color:var(--text3);margin-bottom:4px';
      lbl.textContent = f.label;
      cell.appendChild(lbl);
      const v = document.createElement('div');
      v.style.cssText = 'font-weight:700;font-family:var(--font-mono)';
      v.textContent = f.val;
      cell.appendChild(v);
      posGrid.appendChild(cell);
    });

    posCard.appendChild(posGrid);
  } else {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:var(--text3);text-align:center;padding:16px;font-size:13px';
    empty.textContent = 'אין פוזיציה פתוחה כרגע. השלם את שלבי פס הייצור.';
    posCard.appendChild(empty);
  }

  wrap.appendChild(posCard);

  // Hot list card
  const hotCard = document.createElement('div');
  hotCard.className = 'card';
  hotCard.style.cssText = 'margin-bottom:16px;padding:20px';

  const hotTitle = document.createElement('h3');
  hotTitle.textContent = '\u{1F525} רשימה חמה — ממתינות לטריגר';
  hotTitle.style.marginBottom = '12px';
  hotCard.appendChild(hotTitle);

  if (lists.hot.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:var(--text3);text-align:center;padding:12px;font-size:13px';
    empty.textContent = 'אין מניות ברשימה החמה. נתח מניות בפס הייצור כדי להוסיף.';
    hotCard.appendChild(empty);
  } else {
    lists.hot.forEach(item => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)';
      const ticker = document.createElement('span');
      ticker.style.cssText = 'font-family:var(--font-mono);font-weight:700;color:var(--accent)';
      ticker.textContent = item.ticker;
      row.appendChild(ticker);
      const score = document.createElement('span');
      score.style.cssText = 'font-family:var(--font-mono);color:var(--green);font-weight:500';
      score.textContent = (item.score || 0).toFixed(1) + ' \u{2B50}';
      row.appendChild(score);
      hotCard.appendChild(row);
    });
  }

  wrap.appendChild(hotCard);

  // Recent journal entries
  const journalCard = document.createElement('div');
  journalCard.className = 'card';
  journalCard.style.padding = '20px';

  const journalTitle = document.createElement('h3');
  journalTitle.textContent = '\u{1F4D3} רשומות יומן אחרונות';
  journalTitle.style.marginBottom = '12px';
  journalCard.appendChild(journalTitle);

  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:var(--text3);text-align:center;padding:12px;font-size:13px';
    empty.textContent = 'אין רשומות ביומן. הוסף רשומות בשלב 6 של פס הייצור.';
    journalCard.appendChild(empty);
  } else {
    [...entries].reverse().slice(0, 5).forEach(entry => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px';

      const left = document.createElement('div');
      const actionEl = document.createElement('span');
      actionEl.style.fontWeight = '600';
      actionEl.textContent = entry.action;
      left.appendChild(actionEl);
      if (entry.ticker) {
        const tickerEl = document.createElement('span');
        tickerEl.style.cssText = 'margin-right:8px;font-family:var(--font-mono);color:var(--accent)';
        tickerEl.textContent = entry.ticker;
        left.appendChild(tickerEl);
      }
      row.appendChild(left);

      const right = document.createElement('div');
      if (entry.pl) {
        const plVal = parseFloat(entry.pl);
        const plEl = document.createElement('span');
        plEl.style.cssText = 'font-family:var(--font-mono);font-weight:500;margin-left:8px';
        plEl.style.color = plVal >= 0 ? 'var(--green)' : 'var(--red)';
        plEl.textContent = (plVal >= 0 ? '+' : '') + '$' + entry.pl;
        right.appendChild(plEl);
      }
      const dateEl = document.createElement('span');
      dateEl.style.cssText = 'font-size:11px;color:var(--text3)';
      dateEl.textContent = entry.date ? new Date(entry.date).toLocaleDateString('he-IL') : '';
      right.appendChild(dateEl);
      row.appendChild(right);

      journalCard.appendChild(row);
    });
  }

  // P&L summary row
  if (closedTrades.length > 0) {
    const summaryRow = document.createElement('div');
    summaryRow.style.cssText = 'display:flex;justify-content:space-around;padding:12px;margin-top:12px;background:var(--bg2);border-radius:8px;font-size:13px';

    const items = [
      { label: 'עסקאות', val: closedTrades.length },
      { label: 'ניצחונות', val: wins.length },
      { label: 'P&L כולל', val: (totalPL >= 0 ? '+' : '') + '$' + totalPL.toFixed(0), color: totalPL >= 0 ? 'var(--green)' : 'var(--red)' }
    ];

    items.forEach(item => {
      const cell = document.createElement('div');
      cell.style.textAlign = 'center';
      const v = document.createElement('div');
      v.style.cssText = 'font-weight:700;font-family:var(--font-mono)';
      if (item.color) v.style.color = item.color;
      v.textContent = item.val;
      cell.appendChild(v);
      const l = document.createElement('div');
      l.style.cssText = 'font-size:11px;color:var(--text3)';
      l.textContent = item.label;
      cell.appendChild(l);
      summaryRow.appendChild(cell);
    });

    journalCard.appendChild(summaryRow);
  }

  wrap.appendChild(journalCard);
  container.appendChild(wrap);
}
