import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getState, setState, loadState } from '../../../js/core/state.js';
import {
  isStepUnlocked,
  isStepComplete,
  completeStep,
  resetStep,
  getCurrentStep,
  STEPS
} from '../../../js/tabs/pipeline/pipeline-manager.js';

// Mock localStorage
const storage = {};
vi.stubGlobal('localStorage', {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = val; },
  removeItem: (key) => { delete storage[key]; }
});

// Mock location for router
vi.stubGlobal('location', { hash: '', hostname: 'localhost' });
vi.stubGlobal('window', { addEventListener: vi.fn() });

describe('Pipeline Manager', () => {
  beforeEach(() => {
    Object.keys(storage).forEach(k => delete storage[k]);
    loadState();
  });

  it('STEPS has 8 steps', () => {
    expect(STEPS).toHaveLength(8);
    expect(STEPS[0].id).toBe('market');
    expect(STEPS[7].id).toBe('insights');
  });

  it('step 1 is unlocked by default', () => {
    expect(isStepUnlocked(1)).toBe(true);
  });

  it('steps 2-8 are locked by default', () => {
    for (let i = 2; i <= 8; i++) {
      expect(isStepUnlocked(i)).toBe(false);
    }
  });

  it('no steps are complete by default', () => {
    for (let i = 1; i <= 8; i++) {
      expect(isStepComplete(i)).toBe(false);
    }
  });

  it('completing step 1 unlocks step 2', () => {
    completeStep(1);
    expect(isStepComplete(1)).toBe(true);
    expect(isStepUnlocked(2)).toBe(true);
  });

  it('completing step 1 does NOT unlock step 3', () => {
    completeStep(1);
    expect(isStepUnlocked(3)).toBe(false);
  });

  it('cannot complete a locked step', () => {
    const result = completeStep(3);
    expect(result).toBe(false);
    expect(isStepComplete(3)).toBe(false);
  });

  it('sequential completion: 1→2→3 all unlock', () => {
    completeStep(1);
    completeStep(2);
    completeStep(3);
    expect(isStepComplete(1)).toBe(true);
    expect(isStepComplete(2)).toBe(true);
    expect(isStepComplete(3)).toBe(true);
    expect(isStepUnlocked(4)).toBe(true);
  });

  it('all 8 steps can unlock sequentially', () => {
    for (let i = 1; i <= 8; i++) {
      expect(isStepUnlocked(i)).toBe(true);
      completeStep(i);
      expect(isStepComplete(i)).toBe(true);
    }
  });

  it('resetStep resets target and all subsequent steps', () => {
    // Complete first 4 steps
    for (let i = 1; i <= 4; i++) completeStep(i);
    expect(isStepComplete(4)).toBe(true);

    // Reset step 2
    resetStep(2);
    expect(isStepComplete(1)).toBe(true); // step 1 preserved
    expect(isStepComplete(2)).toBe(false);
    expect(isStepComplete(3)).toBe(false);
    expect(isStepComplete(4)).toBe(false);
  });

  it('getCurrentStep returns default step', () => {
    expect(getCurrentStep()).toBe(1);
  });

  it('getCurrentStep reflects setState', () => {
    setState('pipeline.currentStep', 5);
    expect(getCurrentStep()).toBe(5);
  });

  it('completeStep rejects invalid step numbers', () => {
    expect(completeStep(0)).toBe(false);
    expect(completeStep(9)).toBe(false);
  });

  it('completion persists to localStorage', () => {
    completeStep(1);
    const saved = JSON.parse(storage['makpetza-state']);
    expect(saved.pipeline.completed[0]).toBe(true);
  });
});
