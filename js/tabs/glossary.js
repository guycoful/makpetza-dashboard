// Glossary Tab — 35+ financial terms with search and category filter
import { GLOSSARY } from '../data/glossary-data.js';

let currentCat = 'all';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.id = 'tab-glossary';

  const h2 = document.createElement('h2');
  h2.textContent = '\u{1F4DA} מילון מושגים';
  wrap.appendChild(h2);

  // Search bar
  const searchRow = document.createElement('div');
  searchRow.style.cssText = 'display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'glossary-search';
  searchInput.className = 'input';
  searchInput.placeholder = 'חפש מושג...';
  searchInput.style.flex = '1';
  searchInput.addEventListener('input', () => filterAndRender());
  searchRow.appendChild(searchInput);

  wrap.appendChild(searchRow);

  // Category tabs
  const cats = [
    { id: 'all', label: 'הכל' },
    { id: 'financial', label: 'פיננסי' },
    { id: 'technical', label: 'טכני' },
    { id: 'trading', label: 'מסחר' },
    { id: 'economy', label: 'כלכלה' },
    { id: 'psychology', label: 'פסיכולוגיה' }
  ];

  const catRow = document.createElement('div');
  catRow.id = 'glossary-cats';
  catRow.style.cssText = 'display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap';

  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'btn' + (c.id === currentCat ? ' btn-primary' : '');
    btn.textContent = c.label;
    btn.dataset.cat = c.id;
    btn.addEventListener('click', () => {
      currentCat = c.id;
      // Update active button
      catRow.querySelectorAll('button').forEach(b => b.className = 'btn');
      btn.className = 'btn btn-primary';
      filterAndRender();
    });
    catRow.appendChild(btn);
  });

  wrap.appendChild(catRow);

  // Glossary list
  const list = document.createElement('div');
  list.id = 'glossary-list';
  wrap.appendChild(list);

  container.appendChild(wrap);

  // Initial render
  renderGlossary(GLOSSARY);
}

function filterAndRender() {
  const q = (document.getElementById('glossary-search')?.value || '').toLowerCase();
  let items = GLOSSARY;

  if (currentCat !== 'all') {
    items = items.filter(g => g.cat === currentCat);
  }
  if (q) {
    items = items.filter(g =>
      g.term.toLowerCase().includes(q) ||
      g.def.toLowerCase().includes(q) ||
      g.tags.includes(q)
    );
  }

  renderGlossary(items);
}

function renderGlossary(items) {
  const list = document.getElementById('glossary-list');
  if (!list) return;
  list.textContent = '';

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'text-align:center;padding:40px;color:var(--text2)';
    empty.textContent = 'לא נמצאו תוצאות';
    list.appendChild(empty);
    return;
  }

  items.forEach(g => {
    const item = document.createElement('div');
    item.className = 'glossary-item';

    const term = document.createElement('div');
    term.className = 'term';
    term.textContent = g.term;
    item.appendChild(term);

    const def = document.createElement('div');
    def.className = 'def';
    def.textContent = g.def;
    item.appendChild(def);

    list.appendChild(item);
  });
}
