// Step 7: Buy/Hold/Sell Decision
import { getState, setState } from '../../core/state.js';
import { completeStep } from './pipeline-manager.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'step-decision';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{2696}\u{FE0F} שלב 7 — החלטה';
  wrap.appendChild(h2);

  // Summary card — scores from previous steps
  const summaryCard = document.createElement('div');
  summaryCard.className = 'card';
  summaryCard.style.marginBottom = '20px';

  const summaryTitle = document.createElement('h3');
  summaryTitle.textContent = 'סיכום ציונים';
  summaryTitle.style.marginBottom = '12px';
  summaryCard.appendChild(summaryTitle);

  const bus = getState('pipeline.steps.bus');
  const fin = getState('pipeline.steps.financial');
  const tech = getState('pipeline.steps.technical');

  const busScore = bus?.average || 0;
  const finScore = fin?.score || 0;
  const techScore = tech?.score || 0;
  const total = busScore * 0.33 + finScore * 0.33 + techScore * 0.34;

  const scores = [
    { label: 'BUS Score (33%)', val: busScore },
    { label: 'Financial Score (33%)', val: finScore },
    { label: 'Technical Score (34%)', val: techScore },
    { label: 'ציון כולל', val: total, bold: true }
  ];

  scores.forEach(s => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)';
    const label = document.createElement('span');
    label.textContent = s.label;
    if (s.bold) label.style.fontWeight = '700';
    row.appendChild(label);
    const val = document.createElement('span');
    val.textContent = s.val.toFixed(1);
    val.style.cssText = 'font-weight:700;font-family:var(--font-mono)';
    val.style.color = s.val >= 4 ? 'var(--green)' : s.val >= 2.5 ? 'var(--orange)' : 'var(--red)';
    row.appendChild(val);
    summaryCard.appendChild(row);
  });

  wrap.appendChild(summaryCard);

  // Verdict
  const verdictCard = document.createElement('div');
  verdictCard.className = 'card';
  const verdictLabel = document.createElement('div');
  verdictLabel.style.cssText = 'text-align:center;font-size:14px;color:var(--text2);margin-bottom:8px';
  verdictLabel.textContent = 'המלצה אוטומטית';
  verdictCard.appendChild(verdictLabel);
  const verdictText = document.createElement('div');
  verdictText.style.cssText = 'text-align:center;font-size:24px;font-weight:700';
  if (total >= 4.5) { verdictText.textContent = 'Buy — מניה מצוינת'; verdictText.style.color = 'var(--green)'; }
  else if (total >= 3.5) { verdictText.textContent = 'Hold — מניה סבירה, יש פוטנציאל'; verdictText.style.color = 'var(--orange)'; }
  else if (total >= 2.5) { verdictText.textContent = 'Hold — מניה בינונית, זהירות'; verdictText.style.color = 'var(--orange)'; }
  else { verdictText.textContent = 'Sell — מניה חלשה, לא מומלצת'; verdictText.style.color = 'var(--red)'; }
  verdictCard.appendChild(verdictText);
  wrap.appendChild(verdictCard);

  // Personal decision
  const decCard = document.createElement('div');
  decCard.className = 'card';
  decCard.style.marginTop = '20px';

  const decLabel = document.createElement('label');
  decLabel.textContent = 'ההחלטה שלך';
  decLabel.style.cssText = 'display:block;margin-bottom:8px;font-weight:500';
  decCard.appendChild(decLabel);
  const decSelect = document.createElement('select');
  decSelect.id = 'decision-choice';
  decSelect.className = 'input';
  ['Buy', 'Hold', 'Sell'].forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    decSelect.appendChild(o);
  });
  decCard.appendChild(decSelect);

  const notesLabel = document.createElement('label');
  notesLabel.textContent = 'הסבר ההחלטה';
  notesLabel.style.cssText = 'display:block;margin:16px 0 8px;font-weight:500';
  decCard.appendChild(notesLabel);
  const notesTa = document.createElement('textarea');
  notesTa.id = 'decision-notes';
  notesTa.rows = 4;
  notesTa.placeholder = 'למה בחרת את ההחלטה הזו?';
  notesTa.style.cssText = 'width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text1);resize:vertical';
  decCard.appendChild(notesTa);

  wrap.appendChild(decCard);

  // Load saved data
  const stepData = getState('pipeline.steps.decision') || {};
  if (stepData.choice) decSelect.value = stepData.choice;
  if (stepData.notes) notesTa.value = stepData.notes;

  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'סיים שלב 7 ועבור הלאה';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', () => {
    saveData();
    completeStep(7);
  });
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

function saveData() { setState('pipeline.steps.decision', getData()); }
export function validate() { return true; }
export function getData() {
  return {
    choice: document.getElementById('decision-choice')?.value || '',
    notes: document.getElementById('decision-notes')?.value || ''
  };
}
