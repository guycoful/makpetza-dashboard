import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseRoute, navigate, getCurrentRoute } from '../../js/core/router.js';
import * as state from '../../js/core/state.js';

// Mock location.hash
let mockHash = '';
vi.stubGlobal('location', {
  get hash() { return mockHash; },
  set hash(v) { mockHash = v; }
});

// Mock localStorage
vi.stubGlobal('localStorage', {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
});

describe('Router', () => {
  beforeEach(() => {
    mockHash = '';
  });

  describe('parseRoute', () => {
    it('parses #pipeline/bus correctly', () => {
      expect(parseRoute('#pipeline/bus')).toEqual({ tab: 'pipeline', subtab: 'bus' });
    });

    it('parses #glossary (no subtab)', () => {
      expect(parseRoute('#glossary')).toEqual({ tab: 'glossary', subtab: null });
    });

    it('empty hash defaults to pipeline', () => {
      expect(parseRoute('')).toEqual({ tab: 'pipeline', subtab: null });
    });

    it('parses hash with leading slash', () => {
      expect(parseRoute('#/dashboard')).toEqual({ tab: 'dashboard', subtab: null });
    });

    it('parses #pipeline/financial', () => {
      expect(parseRoute('#pipeline/financial')).toEqual({ tab: 'pipeline', subtab: 'financial' });
    });
  });

  describe('navigate', () => {
    it('navigate to unlocked tab updates hash', () => {
      navigate('glossary');
      expect(mockHash).toBe('#glossary');
    });

    it('navigate with subtab updates hash', () => {
      navigate('pipeline', 'idea');
      expect(mockHash).toBe('#pipeline/idea');
    });

    it('navigate to locked step is blocked', () => {
      // Step 3 (analysis) requires step 2 (sourcing) to be complete
      vi.spyOn(state, 'getState').mockImplementation((path) => {
        if (path === 'pipeline.completed') return [false, false, false, false, false, false, false, false];
        return undefined;
      });
      const result = navigate('pipeline', 'analysis');
      expect(result).toBe(false);
      state.getState.mockRestore();
    });

    it('navigate to step 1 (market) is always allowed', () => {
      const result = navigate('pipeline', 'market');
      expect(result).not.toBe(false);
    });
  });
});
