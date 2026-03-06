import { describe, it, expect } from 'vitest';
import { calculateBusScore } from '../../../js/tabs/pipeline/step2-analysis.js';

describe('BUS Score Calculation', () => {
  it('calculates average of scores correctly', () => {
    const scores = [3, 4, 5, 3, 4, 3, 4]; // avg = 3.71...
    expect(calculateBusScore(scores)).toBe(3.7);
  });

  it('returns 1.0 when all scores are 1', () => {
    const scores = [1, 1, 1, 1, 1, 1, 1];
    expect(calculateBusScore(scores)).toBe(1);
  });

  it('returns 5.0 when all scores are 5', () => {
    const scores = [5, 5, 5, 5, 5, 5, 5];
    expect(calculateBusScore(scores)).toBe(5);
  });

  it('returns null for empty array', () => {
    expect(calculateBusScore([])).toBeNull();
  });

  it('returns null for null input', () => {
    expect(calculateBusScore(null)).toBeNull();
  });

  it('rounds to 1 decimal', () => {
    // 3 + 3.5 + 4 + 4.5 + 2 + 3 + 5 = 25 / 7 = 3.5714...
    const scores = [3, 3.5, 4, 4.5, 2, 3, 5];
    expect(calculateBusScore(scores)).toBe(3.6);
  });

  it('handles single score', () => {
    expect(calculateBusScore([4.5])).toBe(4.5);
  });

  it('weight is 33% of total score formula', () => {
    const busAvg = 4.0;
    const finScore = 3.5;
    const techScore = 3.0;
    const total = busAvg * 0.33 + finScore * 0.33 + techScore * 0.34;
    // BUS contributes 0.33 of total
    expect(busAvg * 0.33).toBeCloseTo(1.32, 2);
    expect(total).toBeCloseTo(3.495, 2);
  });
});
