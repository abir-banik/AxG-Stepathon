import { describe, it, expect } from 'vitest';
import { formatParticipantName } from '../utils/nameFormatter';

describe('formatParticipantName Utility', () => {
  it('formats standard first and last name to First L.', () => {
    expect(formatParticipantName('Jordan Smith')).toBe('Jordan S.');
    expect(formatParticipantName('Alice Wonderland')).toBe('Alice W.');
  });

  it('is idempotent when given an already formatted First L. name', () => {
    expect(formatParticipantName('Jordan S.')).toBe('Jordan S.');
    expect(formatParticipantName('Jordan S')).toBe('Jordan S.');
  });

  it('handles multi-part names using first name and last name initial', () => {
    expect(formatParticipantName('Mary Jane Watson')).toBe('Mary W.');
  });

  it('handles single names gracefully', () => {
    expect(formatParticipantName(' Madonna ')).toBe('Madonna');
  });

  it('handles extra whitespace and empty strings', () => {
    expect(formatParticipantName('   Jordan    Smith   ')).toBe('Jordan S.');
    expect(formatParticipantName('')).toBe('');
    expect(formatParticipantName('   ')).toBe('');
  });
});
