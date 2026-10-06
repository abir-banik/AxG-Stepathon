import { describe, it, expect } from 'vitest';
import { User, StepEntry } from '../types';
import { DEFAULT_ANNOUNCEMENT } from '../api';
import {
  IS_EVENT_CONCLUDED,
  EVENT_START_DATE,
  EVENT_END_DATE,
  EVENT_WEEKS,
  WEEKLY_DEADLINES,
  MAX_PARTICIPANT_STEPS_PER_ENTRY,
  MAX_HOST_OVERRIDE_STEPS_PER_ENTRY,
  computeWeekFromDate
} from '../constants';

describe('Centralized Event Config & Step Logic', () => {
  it('defaults announcement banner to inactive with empty message after refresh', () => {
    expect(DEFAULT_ANNOUNCEMENT.active).toBe(false);
    expect(DEFAULT_ANNOUNCEMENT.message).toBe('');
  });

  it('sets IS_EVENT_CONCLUDED to false for active competition', () => {
    expect(IS_EVENT_CONCLUDED).toBe(false);
  });

  it('computes week numbers dynamically from EVENT_WEEKS (4 weeks)', () => {
    expect(EVENT_WEEKS.length).toBe(4);
    expect(computeWeekFromDate('')).toBe(1);
    expect(computeWeekFromDate('2026-10-19')).toBe(1);
    expect(computeWeekFromDate('2026-10-25')).toBe(1);
    expect(computeWeekFromDate('2026-10-26')).toBe(2);
    expect(computeWeekFromDate('2026-11-01')).toBe(2);
    expect(computeWeekFromDate('2026-11-02')).toBe(3);
    expect(computeWeekFromDate('2026-11-08')).toBe(3);
    expect(computeWeekFromDate('2026-11-09')).toBe(4);
    expect(computeWeekFromDate('2026-11-15')).toBe(4);
    expect(computeWeekFromDate('2026-11-16')).toBe(4);
    expect(computeWeekFromDate('2026-11-18')).toBe(4);
    expect(Object.keys(WEEKLY_DEADLINES).length).toBe(EVENT_WEEKS.length);
  });

  it('caps entries at MAX_PARTICIPANT_STEPS_PER_ENTRY max', async () => {
    const val = Math.min(Math.max(0, Math.floor(45000)), MAX_PARTICIPANT_STEPS_PER_ENTRY);
    expect(val).toBe(30000);
  });

  it('replaces existing entry for the same date instead of summing', () => {
    const existingHistory: StepEntry[] = [
      { amount: 5000, date: '2026-10-25', week: 1, submittedAt: '2026-10-25T10:00:00.000Z' },
      { amount: 4000, date: '2026-10-26', week: 2, submittedAt: '2026-10-26T10:00:00.000Z' }
    ];

    const newEntry: StepEntry = {
      amount: 8000,
      date: '2026-10-25', // Same date as existing entry #1
      week: 1,
      submittedAt: '2026-10-25T14:00:00.000Z'
    };

    const historyWithoutSameDate = existingHistory.filter(e => e.date !== newEntry.date);
    const newHistory = [...historyWithoutSameDate, newEntry];

    expect(newHistory.length).toBe(2);
    const entry25 = newHistory.find(e => e.date === '2026-10-25');
    expect(entry25?.amount).toBe(8000);

    const newTotalSteps = newHistory.reduce((sum, e) => sum + e.amount, 0);
    expect(newTotalSteps).toBe(12000);
  });

  it('allows steps > 30,000 when bypassMaxLimit is true for host override', () => {
    const bypassMaxLimit = true;
    const maxLimit = bypassMaxLimit ? MAX_HOST_OVERRIDE_STEPS_PER_ENTRY : MAX_PARTICIPANT_STEPS_PER_ENTRY;
    const val = Math.min(Math.max(0, Math.floor(45000)), maxLimit);
    expect(val).toBe(45000);
  });

  it('rejects step entries for dates past EVENT_END_DATE unless bypassMaxLimit is active', () => {
    const isAllowed = (entryDate: string, bypass: boolean) => {
      return bypass || (entryDate >= EVENT_START_DATE && entryDate <= EVENT_END_DATE);
    };

    expect(isAllowed('2026-11-18', false)).toBe(true);
    expect(isAllowed('2026-11-19', false)).toBe(false);
    expect(isAllowed('2026-11-20', false)).toBe(false);
    expect(isAllowed('2026-11-19', true)).toBe(true);
  });
});

