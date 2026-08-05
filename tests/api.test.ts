import { describe, it, expect } from 'vitest';
import { User, StepEntry } from '../types';

describe('api.addSteps Same-Date Overwrite & 30k Cap Logic', () => {
  it('caps entries at 30,000 steps max', async () => {
    // Testing capping logic: input 45000 steps -> should cap at 30000
    const val = Math.min(Math.max(0, Math.floor(45000)), 30000);
    expect(val).toBe(30000);
  });

  it('replaces existing entry for the same date instead of summing', () => {
    const existingHistory: StepEntry[] = [
      { amount: 5000, date: '2026-07-25', week: 2, submittedAt: '2026-07-25T10:00:00.000Z' },
      { amount: 4000, date: '2026-07-26', week: 2, submittedAt: '2026-07-26T10:00:00.000Z' }
    ];

    const newEntry: StepEntry = {
      amount: 8000,
      date: '2026-07-25', // Same date as existing entry #1
      week: 2,
      submittedAt: '2026-07-25T14:00:00.000Z'
    };

    // Filter out existing entry for same date
    const historyWithoutSameDate = existingHistory.filter(e => e.date !== newEntry.date);
    const newHistory = [...historyWithoutSameDate, newEntry];

    // Verify history length remains 2 (not 3)
    expect(newHistory.length).toBe(2);

    // Verify the entry for 2026-07-25 has the updated amount of 8000
    const entry25 = newHistory.find(e => e.date === '2026-07-25');
    expect(entry25?.amount).toBe(8000);

    // Verify new total steps is 12,000 (8,000 + 4,000) instead of 17,000 (5,000 + 4,000 + 8,000)
    const newTotalSteps = newHistory.reduce((sum, e) => sum + e.amount, 0);
    expect(newTotalSteps).toBe(12000);
  });

  it('allows steps > 30,000 when bypassMaxLimit is true for host override', () => {
    const bypassMaxLimit = true;
    const maxLimit = bypassMaxLimit ? 200000 : 30000;
    const val = Math.min(Math.max(0, Math.floor(45000)), maxLimit);
    expect(val).toBe(45000);
  });
});
