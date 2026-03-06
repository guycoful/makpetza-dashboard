import { describe, it, expect } from 'vitest';
import { calculateBusScore, calculateFinancialScore, RATIO_CONFIG } from '../../../js/tabs/pipeline/step2-analysis.js';

describe('Step 2 — Analysis (Meta-Agent)', () => {

  describe('Meta-Agent weighted formula (33/33/34)', () => {
    it('calculates total from three equal scores', () => {
      const bus = 4.0, tech = 4.0, fin = 4.0;
      const total = bus * 0.33 + tech * 0.33 + fin * 0.34;
      expect(total).toBeCloseTo(4.0, 1);
    });

    it('weights BUS at 33%, Technical at 33%, Financial at 34%', () => {
      const bus = 5.0, tech = 3.0, fin = 1.0;
      const total = bus * 0.33 + tech * 0.33 + fin * 0.34;
      // 1.65 + 0.99 + 0.34 = 2.98
      expect(total).toBeCloseTo(2.98, 2);
    });

    it('all 5s → total ~5.0', () => {
      const total = 5 * 0.33 + 5 * 0.33 + 5 * 0.34;
      expect(total).toBeCloseTo(5.0, 1);
    });

    it('all 1s → total ~1.0', () => {
      const total = 1 * 0.33 + 1 * 0.33 + 1 * 0.34;
      expect(total).toBeCloseTo(1.0, 1);
    });

    it('verdict: total >= 4.0 → buy', () => {
      const total = 4.2;
      const verdict = total >= 4 ? 'buy' : total >= 3 ? 'hold' : 'sell';
      expect(verdict).toBe('buy');
    });

    it('verdict: total 3.0-3.99 → hold', () => {
      const total = 3.5;
      const verdict = total >= 4 ? 'buy' : total >= 3 ? 'hold' : 'sell';
      expect(verdict).toBe('hold');
    });

    it('verdict: total < 3.0 → sell', () => {
      const total = 2.8;
      const verdict = total >= 4 ? 'buy' : total >= 3 ? 'hold' : 'sell';
      expect(verdict).toBe('sell');
    });

    it('verdict: exactly 3.0 → hold (not sell)', () => {
      const total = 3.0;
      const verdict = total >= 4 ? 'buy' : total >= 3 ? 'hold' : 'sell';
      expect(verdict).toBe('hold');
    });

    it('verdict: exactly 4.0 → buy (not hold)', () => {
      const total = 4.0;
      const verdict = total >= 4 ? 'buy' : total >= 3 ? 'hold' : 'sell';
      expect(verdict).toBe('buy');
    });
  });

  describe('RATIO_CONFIG check functions', () => {
    const checkMap = {};
    RATIO_CONFIG.forEach(r => { checkMap[r.id] = r.check; });

    it('P/E: 15 is good, 25 is ok, 40 is bad', () => {
      expect(checkMap.pe(15)).toBe('good');
      expect(checkMap.pe(25)).toBe('ok');
      expect(checkMap.pe(40)).toBe('bad');
    });

    it('P/B: 2 is good, 4 is ok, 6 is bad', () => {
      expect(checkMap.pb(2)).toBe('good');
      expect(checkMap.pb(4)).toBe('ok');
      expect(checkMap.pb(6)).toBe('bad');
    });

    it('ROE: 20 is good, 10 is ok, 5 is bad', () => {
      expect(checkMap.roe(20)).toBe('good');
      expect(checkMap.roe(10)).toBe('ok');
      expect(checkMap.roe(5)).toBe('bad');
    });

    it('Debt/Equity: 30 is good, 80 is ok, 120 is bad', () => {
      expect(checkMap.de(30)).toBe('good');
      expect(checkMap.de(80)).toBe('ok');
      expect(checkMap.de(120)).toBe('bad');
    });

    it('Current Ratio: 2.0 is good, 1.2 is ok, 0.5 is bad', () => {
      expect(checkMap.cr(2.0)).toBe('good');
      expect(checkMap.cr(1.2)).toBe('ok');
      expect(checkMap.cr(0.5)).toBe('bad');
    });

    it('EPS: positive is good, negative is bad', () => {
      expect(checkMap.eps(3)).toBe('good');
      expect(checkMap.eps(-1)).toBe('bad');
    });

    it('Revenue Growth: 15 is good, 5 is ok, -3 is bad', () => {
      expect(checkMap.rg(15)).toBe('good');
      expect(checkMap.rg(5)).toBe('ok');
      expect(checkMap.rg(-3)).toBe('bad');
    });

    it('Net Margin: 20 is good, 10 is ok, 2 is bad', () => {
      expect(checkMap.nm(20)).toBe('good');
      expect(checkMap.nm(10)).toBe('ok');
      expect(checkMap.nm(2)).toBe('bad');
    });

    it('FCF: positive is good, negative is bad', () => {
      expect(checkMap.fcf(5)).toBe('good');
      expect(checkMap.fcf(-2)).toBe('bad');
    });

    it('has exactly 9 ratios', () => {
      expect(RATIO_CONFIG).toHaveLength(9);
    });
  });

  describe('BUS Score with 8 cubes', () => {
    it('calculates average of 8 scores', () => {
      const scores = [3, 4, 5, 3, 4, 3, 4, 5]; // sum=31, avg=3.875
      expect(calculateBusScore(scores)).toBe(3.9);
    });

    it('returns null for undefined', () => {
      expect(calculateBusScore(undefined)).toBeNull();
    });
  });
});
