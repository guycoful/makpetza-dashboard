import { describe, it, expect } from 'vitest';
import { calculateFinancialScore } from '../../../js/tabs/pipeline/step2-analysis.js';

describe('Financial Score Calculation', () => {
  it('all good ratios → score 5.0', () => {
    const ratios = {
      pe: 15, pb: 2, roe: 20, de: 30, cr: 2.0,
      eps: 5, rg: 15, nm: 20, fcf: 5
    };
    expect(calculateFinancialScore(ratios)).toBe(5);
  });

  it('all bad ratios → score 1.0', () => {
    const ratios = {
      pe: 50, pb: 10, roe: 5, de: 150, cr: 0.5,
      eps: -1, rg: -5, nm: 2, fcf: -3
    };
    expect(calculateFinancialScore(ratios)).toBe(1);
  });

  it('mixed ratios → intermediate score', () => {
    const ratios = {
      pe: 15,   // good → 5
      pb: 4,    // ok → 3
      roe: 20,  // good → 5
      de: 80,   // ok → 3
      cr: 0.8,  // bad → 1
      eps: 3,   // good → 5
      rg: 5,    // ok → 3
      nm: 10,   // ok → 3
      fcf: 2    // good → 5
    };
    // (5+3+5+3+1+5+3+3+5) / 9 = 33/9 = 3.666... → 3.7
    expect(calculateFinancialScore(ratios)).toBe(3.7);
  });

  it('null ratios are skipped', () => {
    const ratios = {
      pe: 15, pb: null, roe: null, de: 30, cr: 2.0,
      eps: null, rg: null, nm: null, fcf: null
    };
    // Only pe(good=5), de(good=5), cr(good=5) → 15/3 = 5
    expect(calculateFinancialScore(ratios)).toBe(5);
  });

  it('all null ratios → score 0', () => {
    const ratios = {
      pe: null, pb: null, roe: null, de: null, cr: null,
      eps: null, rg: null, nm: null, fcf: null
    };
    expect(calculateFinancialScore(ratios)).toBe(0);
  });

  it('empty object → score 0', () => {
    expect(calculateFinancialScore({})).toBe(0);
  });

  it('P/E edge cases: 0 is ok (< 35), 20 is ok, 40 is bad', () => {
    expect(calculateFinancialScore({ pe: 0 })).toBe(3);    // 0: not (>0 && <20), but <35 → ok
    expect(calculateFinancialScore({ pe: 20 })).toBe(3);   // 20: not <20, but <35 → ok
    expect(calculateFinancialScore({ pe: 40 })).toBe(1);   // 40: not <35 → bad
  });

  it('Debt/Equity edge: 50 is ok, not good', () => {
    expect(calculateFinancialScore({ de: 50 })).toBe(3);   // 50 is ok (not <50)
    expect(calculateFinancialScore({ de: 49 })).toBe(5);   // 49 is good (<50)
  });
});
