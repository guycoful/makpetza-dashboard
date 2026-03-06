import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getState, setState, loadState, getRawState, setRawState, subscribe } from '../../js/core/state.js';

// Mock localStorage
const storage = {};
vi.stubGlobal('localStorage', {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = val; },
  removeItem: (key) => { delete storage[key]; }
});

describe('State Manager', () => {
  beforeEach(() => {
    // Reset state before each test
    Object.keys(storage).forEach(k => delete storage[k]);
    loadState();
  });

  it('getState returns full state when no path', () => {
    const s = getState();
    expect(s).toBeDefined();
    expect(s.watchlist).toEqual([]);
  });

  it('setState deep-sets a value', () => {
    setState('pipeline.currentStep', 3);
    expect(getState('pipeline.currentStep')).toBe(3);
  });

  it('getState retrieves nested value', () => {
    setState('settings.currency', 'ILS');
    expect(getState('settings.currency')).toBe('ILS');
  });

  it('setState creates intermediate objects', () => {
    setState('newpath.deep.value', 'test');
    expect(getState('newpath.deep.value')).toBe('test');
  });

  it('invalid path returns undefined', () => {
    expect(getState('nonexistent.path')).toBeUndefined();
  });

  it('state persists to localStorage on change', () => {
    setState('currentTicker', 'AAPL');
    const saved = JSON.parse(storage['makpetza-state']);
    expect(saved.currentTicker).toBe('AAPL');
  });

  it('loadState restores from localStorage', () => {
    storage['makpetza-state'] = JSON.stringify({ currentTicker: 'TSLA', watchlist: ['x'] });
    loadState();
    expect(getState('currentTicker')).toBe('TSLA');
  });

  it('loadState merges with defaults', () => {
    storage['makpetza-state'] = JSON.stringify({ currentTicker: 'GOOG' });
    loadState();
    expect(getState('currentTicker')).toBe('GOOG');
    expect(getState('watchlist')).toEqual([]); // default preserved
  });

  it('subscribe fires callback on change', () => {
    let received = null;
    subscribe('currentTicker', (val) => { received = val; });
    setState('currentTicker', 'MSFT');
    expect(received).toBe('MSFT');
  });

  it('subscribe does NOT fire for unrelated path', () => {
    let called = false;
    subscribe('currentTicker', () => { called = true; });
    setState('settings.currency', 'EUR');
    expect(called).toBe(false);
  });
});
