// Academy Tab — exercises and learning
import { EXERCISES } from '../data/exercises-data.js';
import { getState, setState } from '../core/state.js';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'tab-academy';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F393} אקדמיה — תרגילים';
  wrap.appendChild(h2);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:var(--text2);margin-bottom:20px';
  desc.textContent = '10 תרגילים מעשיים. פתח כל תרגיל, בצע אותו ושמור.';
  wrap.appendChild(desc);

  // Progress bar
  const exercises = getState('exercises') || {};
  const doneCount = Object.keys(exercises).length;
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

  wrap.appendChild(progressWrap);

  // Exercise cards
  EXERCISES.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'ex-' + ex.num;
    card.style.cssText = 'margin-bottom:12px;cursor:pointer';

    // Header (always visible)
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center';
    header.addEventListener('click', () => toggleExercise(ex.num));

    const title = document.createElement('div');
    title.style.fontWeight = '600';
    title.textContent = 'תרגיל ' + ex.num + ': ' + ex.title;
    header.appendChild(title);

    const arrow = document.createElement('span');
    arrow.className = 'ex-arrow';
    arrow.textContent = '\u{25BC}';
    arrow.style.cssText = 'transition:transform 0.2s';
    header.appendChild(arrow);

    card.appendChild(header);

    // Body (hidden by default)
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

    // Save/Load buttons
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'שמור';
    saveBtn.addEventListener('click', (e) => { e.stopPropagation(); saveExercise(ex); });
    btnRow.appendChild(saveBtn);

    const loadBtn = document.createElement('button');
    loadBtn.className = 'btn';
    loadBtn.textContent = 'טען שמור';
    loadBtn.addEventListener('click', (e) => { e.stopPropagation(); loadExercise(ex); });
    btnRow.appendChild(loadBtn);

    body.appendChild(btnRow);
    card.appendChild(body);
    wrap.appendChild(card);
  });

  container.appendChild(wrap);
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

  // Mark as active
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

  // Mark dot as done
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
  if (!data) { alert('אין תרגיל שמור'); return; }

  // Open the card first
  const body = document.querySelector('#ex-' + ex.num + ' .ex-body');
  if (body) body.style.display = 'block';

  if (ex.fields) {
    ex.fields.forEach(f => {
      const el = document.getElementById('ex' + ex.num + '-' + f.id);
      if (el && data[f.id] !== undefined) el.value = data[f.id];
    });
  }
}
