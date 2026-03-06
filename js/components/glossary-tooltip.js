// Glossary tooltip — hover on financial terms to see definitions
import { GLOSSARY } from '../data/glossary-data.js';

// Build a lookup map: lowercase tag keywords → glossary entry
const TERM_MAP = new Map();
GLOSSARY.forEach(g => {
  // Map by the main term name (first word or known ID)
  const key = g.term.split(' ')[0].replace(/[^a-zA-Z/]/g, '').toLowerCase();
  if (key) TERM_MAP.set(key, g);
  // Also map common aliases from tags
  g.tags.split(' ').forEach(tag => {
    if (tag.length >= 2) TERM_MAP.set(tag.toLowerCase(), g);
  });
});

// Known ratio ID → glossary lookup key
const RATIO_GLOSSARY_MAP = {
  pe: 'pe', pb: 'pb', roe: 'roe', de: 'debt', cr: 'current',
  eps: 'eps', rg: 'revenue', nm: 'net', fcf: 'fcf'
};

const TECH_GLOSSARY_MAP = {
  price: 'תמיכה', patterns: 'נרות', indicators: 'rsi', vrvp: 'volume'
};

let activePopup = null;

/**
 * Wrap a label string in a tooltip-enabled element if a glossary match exists.
 * @param {string} label - The visible label text (e.g. "P/E")
 * @param {string} [lookupKey] - Optional glossary lookup key
 * @returns {HTMLElement} - A span (plain or with tooltip)
 */
export function createTooltipLabel(label, lookupKey) {
  const key = (lookupKey || label).toLowerCase().replace(/[^a-z/]/g, '');
  const entry = TERM_MAP.get(key);

  if (!entry) {
    const span = document.createElement('span');
    span.textContent = label;
    return span;
  }

  const span = document.createElement('span');
  span.className = 'term-link';
  span.textContent = label;
  span.title = entry.term;

  span.addEventListener('mouseenter', (e) => showPopup(entry, e));
  span.addEventListener('mouseleave', () => hidePopup());
  span.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activePopup) hidePopup();
    else showPopup(entry, e, true);
  });

  return span;
}

/**
 * Get glossary lookup key for a ratio ID
 */
export function getRatioGlossaryKey(ratioId) {
  return RATIO_GLOSSARY_MAP[ratioId] || ratioId;
}

export function getTechGlossaryKey(layerId) {
  return TECH_GLOSSARY_MAP[layerId] || layerId;
}

function showPopup(entry, event, sticky) {
  hidePopup();

  const popup = document.createElement('div');
  popup.className = 'term-popup show';

  const termDiv = document.createElement('div');
  termDiv.className = 'tp-term';
  termDiv.textContent = entry.term;
  popup.appendChild(termDiv);

  const defDiv = document.createElement('div');
  defDiv.className = 'tp-def';
  defDiv.textContent = entry.def;
  popup.appendChild(defDiv);

  if (sticky) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tp-close';
    closeBtn.textContent = '\u{2715}';
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); hidePopup(); });
    popup.appendChild(closeBtn);
  }

  document.body.appendChild(popup);

  // Position near the element
  const rect = event.target.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();

  let top = rect.bottom + 8;
  let left = rect.left;

  // Keep within viewport
  if (top + popupRect.height > window.innerHeight) top = rect.top - popupRect.height - 8;
  if (left + popupRect.width > window.innerWidth) left = window.innerWidth - popupRect.width - 16;
  if (left < 8) left = 8;

  popup.style.top = top + 'px';
  popup.style.left = left + 'px';

  activePopup = popup;

  if (!sticky) {
    popup.addEventListener('mouseenter', () => { popup._keep = true; });
    popup.addEventListener('mouseleave', () => { popup._keep = false; hidePopup(); });
  }
}

function hidePopup() {
  if (activePopup && !activePopup._keep) {
    activePopup.remove();
    activePopup = null;
  }
}
