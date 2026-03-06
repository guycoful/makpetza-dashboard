import { describe, it, expect } from 'vitest';
import { determineList } from '../../../js/tabs/pipeline/step3-lists.js';

describe('Step 3 — List Routing', () => {

  it('score >= 4.0 routes to hot list', () => {
    expect(determineList(4.0)).toBe('hot');
    expect(determineList(4.5)).toBe('hot');
    expect(determineList(5.0)).toBe('hot');
  });

  it('score 3.0-3.99 routes to warm list', () => {
    expect(determineList(3.0)).toBe('warm');
    expect(determineList(3.5)).toBe('warm');
    expect(determineList(3.9)).toBe('warm');
  });

  it('score < 3.0 routes to cold list', () => {
    expect(determineList(2.9)).toBe('cold');
    expect(determineList(2.0)).toBe('cold');
    expect(determineList(1.0)).toBe('cold');
    expect(determineList(0)).toBe('cold');
  });

  it('boundary: exactly 4.0 is hot, not warm', () => {
    expect(determineList(4.0)).toBe('hot');
  });

  it('boundary: exactly 3.0 is warm, not cold', () => {
    expect(determineList(3.0)).toBe('warm');
  });

  it('boundary: 3.99 is still warm', () => {
    expect(determineList(3.99)).toBe('warm');
  });
});
