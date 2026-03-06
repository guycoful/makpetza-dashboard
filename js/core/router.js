// ========== HASH-BASED ROUTER ==========
import { emit } from './events.js';
import { getState } from './state.js';

// Route format: #tab/subtab  e.g. #pipeline/bus, #glossary, #dashboard
let currentRoute = { tab: 'pipeline', subtab: null };

export function parseRoute(hash) {
  const clean = (hash || '').replace(/^#\/?/, '');
  if (!clean) return { tab: 'pipeline', subtab: null };
  const parts = clean.split('/');
  return { tab: parts[0] || 'pipeline', subtab: parts[1] || null };
}

export function getCurrentRoute() {
  return { ...currentRoute };
}

export function navigate(tab, subtab) {
  // Check pipeline locking
  if (tab === 'pipeline' && subtab) {
    const stepNum = getStepNumber(subtab);
    if (stepNum > 1) {
      const completed = getState('pipeline.completed') || [];
      if (!completed[stepNum - 2]) {
        console.warn(`Step ${stepNum} is locked — complete step ${stepNum - 1} first`);
        return false;
      }
    }
  }

  currentRoute = { tab, subtab };
  const hash = subtab ? `#${tab}/${subtab}` : `#${tab}`;
  if (location.hash !== hash) {
    location.hash = hash;
  }
  emit('route:changed', currentRoute);
  return true;
}

// Map subtab names to step numbers
const STEP_MAP = {
  'idea': 1, 'bus': 2, 'financial': 3, 'technical': 4,
  'valuation': 5, 'risk': 6, 'decision': 7, 'monitoring': 8
};

function getStepNumber(subtab) {
  return STEP_MAP[subtab] || 0;
}

export function getStepName(num) {
  return Object.keys(STEP_MAP).find(key => STEP_MAP[key] === num) || null;
}

// Initialize router — listen for hash changes
export function initRouter() {
  const onHashChange = () => {
    const route = parseRoute(location.hash);
    currentRoute = route;
    emit('route:changed', route);
  };
  window.addEventListener('hashchange', onHashChange);

  // Set initial route
  if (!location.hash) {
    location.hash = '#pipeline';
  }
  onHashChange();
}
