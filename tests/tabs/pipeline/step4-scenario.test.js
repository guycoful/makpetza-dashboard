import { describe, it, expect } from 'vitest';
import { calculateRiskReward } from '../../../js/tabs/pipeline/step4-scenario.js';

describe('Step 4 — Scenario Risk/Reward Calculator', () => {

  it('calculates basic risk and reward', () => {
    // Entry $100, Stop $90, Target $150
    const result = calculateRiskReward(100, 90, 150, 100, 100000);
    expect(result.risk).toBe(10);
    expect(result.reward).toBe(50);
  });

  it('calculates ratio correctly', () => {
    // Risk $10, Reward $50 → 1:5
    const result = calculateRiskReward(100, 90, 150, 100, 100000);
    expect(result.ratio).toBe(5);
  });

  it('calculates dollar amounts', () => {
    const result = calculateRiskReward(100, 90, 150, 100, 100000);
    expect(result.riskDollars).toBe(1000);     // $10 × 100 shares
    expect(result.rewardDollars).toBe(5000);    // $50 × 100 shares
  });

  it('calculates portfolio risk percentage', () => {
    const result = calculateRiskReward(100, 90, 150, 100, 100000);
    expect(result.portfolioRisk).toBe(1);       // $1000 / $100000 = 1%
  });

  it('ratio >= 5 passes minimum', () => {
    const result = calculateRiskReward(100, 90, 150, 100, 100000);
    expect(result.passesMinRatio).toBe(true);
  });

  it('ratio < 5 fails minimum', () => {
    // Entry $100, Stop $90, Target $120 → Risk $10, Reward $20 → 1:2
    const result = calculateRiskReward(100, 90, 120, 100, 100000);
    expect(result.ratio).toBe(2);
    expect(result.passesMinRatio).toBe(false);
  });

  it('portfolio risk <= 1% passes 1% rule', () => {
    const result = calculateRiskReward(100, 95, 150, 10, 100000);
    // Risk = $5 × 10 = $50 / $100000 = 0.05%
    expect(result.passesOnePercent).toBe(true);
  });

  it('portfolio risk > 1% fails 1% rule', () => {
    const result = calculateRiskReward(100, 80, 200, 100, 100000);
    // Risk = $20 × 100 = $2000 / $100000 = 2%
    expect(result.portfolioRisk).toBe(2);
    expect(result.passesOnePercent).toBe(false);
  });

  it('zero risk → ratio 0', () => {
    const result = calculateRiskReward(100, 100, 150, 100, 100000);
    expect(result.ratio).toBe(0);
  });

  it('zero portfolio → portfolioRisk 0', () => {
    const result = calculateRiskReward(100, 90, 150, 100, 0);
    expect(result.portfolioRisk).toBe(0);
  });

  it('1:5.3 ratio rounds to 5.3 and passes', () => {
    // Entry $100, Stop $94, Target $132 → Risk $6, Reward $32 → 5.33
    const result = calculateRiskReward(100, 94, 132, 100, 100000);
    expect(result.ratio).toBe(5.3);
    expect(result.passesMinRatio).toBe(true);
  });

  it('exactly 1:5 passes minimum', () => {
    // Entry $100, Stop $90, Target $150 → Risk $10, Reward $50 → exactly 5.0
    const result = calculateRiskReward(100, 90, 150, 100, 100000);
    expect(result.ratio).toBe(5);
    expect(result.passesMinRatio).toBe(true);
  });
});
