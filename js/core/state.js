// ========== REACTIVE STATE MANAGER ==========
import { emit, on, off } from './events.js';

const STORAGE_KEY = 'makpetza-state';

const defaultState = {
  watchlist: [],
  journal: [],
  weeklyChecks: [false,false,false,false,false,false,false,false,false,false],
  analyses: {},
  chatHistory: [],
  settings: { grokKey: '', grokModel: 'grok-3-mini', currency: 'USD' },
  currentTicker: '',
  exercises: {},
  pipeline: {
    currentStep: 1,
    steps: {},
    completed: [false,false,false,false,false,false,false,false]
  }
};

let state = structuredClone(defaultState);

// Deep get: getState('pipeline.currentStep') → 1
export function getState(path) {
  if (!path) return state;
  return path.split('.').reduce((obj, key) => obj?.[key], state);
}

// Deep set: setState('pipeline.currentStep', 2)
export function setState(path, value) {
  if (!path) return;
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((obj, key) => {
    if (obj[key] === undefined) obj[key] = {};
    return obj[key];
  }, state);
  target[last] = value;
  persist();
  emit('state:' + keys.concat(last).join('.'), value);
  // Also emit parent path for broader listeners
  if (keys.length > 0) {
    emit('state:' + keys.join('.'), getState(keys.join('.')));
  }
}

// Get full state (for backward compatibility)
export function getRawState() {
  return state;
}

// Replace full state (for backward compatibility)
export function setRawState(newState) {
  state = { ...defaultState, ...newState };
  persist();
}

// Subscribe to state changes — returns unsubscribe function
export function subscribe(path, callback) {
  const eventName = 'state:' + path;
  on(eventName, callback);
  return () => off(eventName, callback);
}

// Persistence
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch(e) { /* quota exceeded */ }
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = { ...defaultState, ...JSON.parse(saved) };
  } catch(e) {
    console.warn('Failed to load state', e);
  }
}

export function saveState() {
  persist();
}
